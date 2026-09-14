import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { StudentCurriculumCatalog, StudentCurriculumSubject } from "../../auth-api";
import { useStudentAppBarTitle } from "../../app/layout/StudentAppBarContext";
import { StudentIcon } from "../../shared/icons/StudentIcon";
import { findStudentSubject, lessonCount, studentLessonHref } from "../../student-learning-model";

type Lesson = StudentCurriculumSubject["unsectionedLessons"][number];

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  return (
    <Link className="subject-v2-lesson" to={studentLessonHref(lesson.id)} data-lesson-id={lesson.id}>
      <span className="subject-v2-lesson__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <span className="subject-v2-lesson__copy">
        <strong>{lesson.title}</strong>
        {lesson.summary ? <small className="subject-v2-lesson__badge">ملخص</small> : null}
      </span>
      <StudentIcon name="chevron" />
    </Link>
  );
}

function lessonMatches(lesson: Lesson, query: string): boolean {
  if (!query) return true;
  return `${lesson.title} ${lesson.summary ?? ""}`.toLocaleLowerCase("ar").includes(query);
}

export function SubjectPage({ catalog, subjectId }: { catalog: StudentCurriculumCatalog; subjectId: string }) {
  const [query, setQuery] = useState("");
  const { setTitle } = useStudentAppBarTitle();
  const context = findStudentSubject(catalog, subjectId);

  useEffect(() => {
    setTitle(context?.subject.name ?? null);
    return () => setTitle(null);
  }, [context?.subject.name, setTitle]);

  if (!context) {
    return (
      <section className="learn-v2-empty">
        <h2>هذه المادة غير متاحة لك</h2>
        <p>قد يكون وصولك تغيّر أو أن الرابط لم يعد صالحًا.</p>
        <Link className="secondary-button" to="/app/learn">العودة إلى التعلّم</Link>
      </section>
    );
  }

  const { classRecord, subject } = context;
  const total = lessonCount(subject);
  const searchable = total > 8;
  const normalizedQuery = query.trim().toLocaleLowerCase("ar");
  const filteredUnsectioned = subject.unsectionedLessons.filter((lesson) => lessonMatches(lesson, normalizedQuery));
  const filteredSections = subject.sections
    .map((section) => ({ ...section, lessons: section.lessons.filter((lesson) => lessonMatches(lesson, normalizedQuery)) }))
    .filter((section) => section.lessons.length > 0 || !normalizedQuery);
  const resultCount = filteredUnsectioned.length + filteredSections.reduce((count, section) => count + section.lessons.length, 0);
  const firstPopulatedSectionIndex = filteredSections.findIndex((section) => section.lessons.length > 0);

  let lessonIndex = 0;

  return (
    <article className="subject-v2" aria-label={subject.name}>
      <header className="subject-v2__summary">
        <Link className="subject-v2__back" to="/app/learn"><span aria-hidden="true">→</span> التعلّم</Link>
        <p>{classRecord.name} · {new Intl.NumberFormat("ar-YE").format(total)} درس{subject.sections.length > 0 ? ` · ${new Intl.NumberFormat("ar-YE").format(subject.sections.length)} وحدات` : ""}</p>
      </header>

      {searchable ? (
        <div className="learn-v2-search subject-v2__search">
          <StudentIcon name="search" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن درس" aria-label="ابحث عن درس" />
        </div>
      ) : null}

      {total === 0 ? (
        <section className="learn-v2-empty"><h2>لا توجد دروس متاحة الآن</h2><p>ستظهر الدروس هنا عندما تصبح متاحة لحسابك.</p></section>
      ) : normalizedQuery && resultCount === 0 ? (
        <div className="learn-v2-search-empty" role="status">لا يوجد درس مطابق للبحث.</div>
      ) : (
        <div className="subject-v2__content">
          {filteredUnsectioned.length > 0 ? (
            <section className="subject-v2-unit subject-v2-unit--direct" aria-labelledby="direct-lessons-title">
              <div className="subject-v2-unit__heading"><h2 id="direct-lessons-title">الدروس</h2><span>{new Intl.NumberFormat("ar-YE").format(filteredUnsectioned.length)}</span></div>
              <div className="subject-v2-lessons">
                {filteredUnsectioned.map((lesson) => {
                  const current = lessonIndex++;
                  return <LessonRow key={lesson.id} lesson={lesson} index={current} />;
                })}
              </div>
            </section>
          ) : null}

          {filteredSections.map((section, sectionIndex) => {
            const startIndex = lessonIndex;
            lessonIndex += section.lessons.length;
            return (
              <details
                className="subject-v2-unit"
                key={section.id}
                open={normalizedQuery ? section.lessons.length > 0 : sectionIndex === firstPopulatedSectionIndex}
              >
                <summary>
                  <span><strong>{section.title}</strong>{section.description ? <small>{section.description}</small> : null}</span>
                  <span className="subject-v2-unit__meta">{new Intl.NumberFormat("ar-YE").format(section.lessons.length)} درس</span>
                </summary>
                <div className="subject-v2-lessons">
                  {section.lessons.length === 0 ? <p className="learn-v2-inline-empty">لا توجد دروس في هذه الوحدة.</p> : section.lessons.map((lesson, offset) => <LessonRow key={lesson.id} lesson={lesson} index={startIndex + offset} />)}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </article>
  );
}
