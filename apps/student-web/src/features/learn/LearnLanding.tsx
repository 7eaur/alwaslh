import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { StudentCurriculumCatalog } from "../../auth-api";
import { StudentIcon } from "../../shared/icons/StudentIcon";
import { studentSubjectHref } from "../../student-learning-model";

function subjectLessonCount(subject: StudentCurriculumCatalog["classes"][number]["subjects"][number]): number {
  return subject.unsectionedLessons.length + subject.sections.reduce((total, section) => total + section.lessons.length, 0);
}

export function LearnLanding({ catalog }: { catalog: StudentCurriculumCatalog }) {
  const [query, setQuery] = useState("");
  const classes = catalog.classes;
  const subjectCount = classes.reduce((total, classRecord) => total + classRecord.subjects.length, 0);
  const searchable = subjectCount > 5;
  const normalizedQuery = query.trim().toLocaleLowerCase("ar");

  const visibleClasses = useMemo(() => {
    if (!normalizedQuery) return classes;
    return classes
      .map((classRecord) => ({
        ...classRecord,
        subjects: classRecord.subjects.filter((subject) => subject.name.toLocaleLowerCase("ar").includes(normalizedQuery)),
      }))
      .filter((classRecord) => classRecord.subjects.length > 0);
  }, [classes, normalizedQuery]);

  if (classes.length === 0) {
    return (
      <section className="learn-v2-empty">
        <StudentIcon name="learn" />
        <h2>لا توجد مواد متاحة الآن</h2>
        <p>إذا كان لديك رمز صف، أضفه من حسابك ثم ارجع إلى التعلّم.</p>
        <Link className="secondary-button" to="/app/account">فتح الحساب</Link>
      </section>
    );
  }

  return (
    <section className="learn-v2" aria-label="المواد">
      {searchable ? (
        <div className="learn-v2-search">
          <StudentIcon name="search" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن مادة"
            aria-label="ابحث عن مادة"
          />
        </div>
      ) : null}

      <div className="learn-v2-classes">
        {visibleClasses.map((classRecord) => (
          <section className="learn-v2-class" key={classRecord.id} aria-labelledby={`class-${classRecord.id}`}>
            <div className="learn-v2-class__heading">
              <h2 id={`class-${classRecord.id}`}>{classRecord.name}</h2>
              <span>{new Intl.NumberFormat("ar-YE").format(classRecord.subjects.length)} مادة</span>
            </div>

            {classRecord.subjects.length === 0 ? (
              <p className="learn-v2-inline-empty">لا توجد مواد متاحة في هذا الصف.</p>
            ) : (
              <div className="learn-v2-subject-list">
                {classRecord.subjects.map((subject) => {
                  const lessons = subjectLessonCount(subject);
                  return (
                    <Link className="learn-v2-subject-row" key={subject.id} to={studentSubjectHref(subject.id)}>
                      <span className="learn-v2-subject-row__icon"><StudentIcon name="learn" /></span>
                      <span className="learn-v2-subject-row__copy">
                        <strong>{subject.name}</strong>
                        <small>{new Intl.NumberFormat("ar-YE").format(lessons)} درس{subject.sections.length > 0 ? ` · ${new Intl.NumberFormat("ar-YE").format(subject.sections.length)} وحدات` : ""}</small>
                      </span>
                      <StudentIcon name="chevron" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      {searchable && normalizedQuery && visibleClasses.length === 0 ? (
        <div className="learn-v2-search-empty" role="status">لا توجد مادة مطابقة للبحث.</div>
      ) : null}
    </section>
  );
}
