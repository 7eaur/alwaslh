import { useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  isMissingSessionError,
  listStudentCurriculum,
  type StudentCurriculumCatalog,
  type StudentCurriculumClass,
  type StudentCurriculumLesson,
  type StudentCurriculumSubject,
} from "./auth-api";

type CurriculumState =
  | { status: "loading" }
  | { status: "ready"; catalog: StudentCurriculumCatalog }
  | { status: "offline" }
  | { status: "error"; message: string };

function requestMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل المحتوى الدراسي. حاول مرة أخرى.";
}

function lessonCount(subject: StudentCurriculumSubject): number {
  return (
    subject.unsectionedLessons.length +
    subject.sections.reduce((total, section) => total + section.lessons.length, 0)
  );
}

function LessonRow({ lesson, index }: { lesson: StudentCurriculumLesson; index: number }) {
  return (
    <article className="lesson-row" data-lesson-id={lesson.id}>
      <span className="lesson-number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="lesson-copy">
        <strong>{lesson.title}</strong>
        {lesson.summary ? <p>{lesson.summary}</p> : <p className="lesson-muted">لا يوجد ملخص منشور لهذا الدرس بعد.</p>}
      </div>
      <span className="lesson-status">منشور</span>
    </article>
  );
}

function SubjectLessons({ subject }: { subject: StudentCurriculumSubject }) {
  let lessonIndex = 0;
  return (
    <div className="subject-lessons" aria-label={`دروس ${subject.name}`}>
      {subject.unsectionedLessons.length > 0 ? (
        <div className="lesson-group">
          {subject.unsectionedLessons.map((lesson) => {
            const currentIndex = lessonIndex;
            lessonIndex += 1;
            return <LessonRow key={lesson.id} lesson={lesson} index={currentIndex} />;
          })}
        </div>
      ) : null}

      {subject.sections.map((section) => (
        <section className="curriculum-section-group" key={section.id} aria-labelledby={`section-${section.id}`}>
          <div className="curriculum-section-heading">
            <div>
              <p className="eyebrow">وحدة دراسية</p>
              <h4 id={`section-${section.id}`}>{section.title}</h4>
              {section.description ? <p>{section.description}</p> : null}
            </div>
            <span>{section.lessons.length} درس</span>
          </div>
          <div className="lesson-group">
            {section.lessons.map((lesson) => {
              const currentIndex = lessonIndex;
              lessonIndex += 1;
              return <LessonRow key={lesson.id} lesson={lesson} index={currentIndex} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function StudentCurriculumSection({
  online,
  refreshKey,
  onSessionExpired,
}: {
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const [state, setState] = useState<CurriculumState>({ status: "loading" });
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  async function loadCurriculum() {
    if (!online) {
      setState({ status: "offline" });
      return;
    }
    setState({ status: "loading" });
    try {
      const catalog = await listStudentCurriculum();
      setState({ status: "ready", catalog });
      const firstClass = catalog.classes[0];
      setSelectedClassId((current) =>
        current && catalog.classes.some((record) => record.id === current) ? current : (firstClass?.id ?? null),
      );
      const preferredClass =
        catalog.classes.find((record) => record.id === selectedClassId) ?? firstClass ?? null;
      setSelectedSubjectId((current) =>
        current && preferredClass?.subjects.some((subject) => subject.id === current)
          ? current
          : (preferredClass?.subjects[0]?.id ?? null),
      );
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => {
    void loadCurriculum();
  }, [online, refreshKey]);

  const selectedClass = useMemo<StudentCurriculumClass | null>(() => {
    if (state.status !== "ready") return null;
    return state.catalog.classes.find((record) => record.id === selectedClassId) ?? state.catalog.classes[0] ?? null;
  }, [selectedClassId, state]);

  const selectedSubject = useMemo<StudentCurriculumSubject | null>(() => {
    if (!selectedClass) return null;
    return (
      selectedClass.subjects.find((subject) => subject.id === selectedSubjectId) ?? selectedClass.subjects[0] ?? null
    );
  }, [selectedClass, selectedSubjectId]);

  function chooseClass(classId: string) {
    if (state.status !== "ready") return;
    const nextClass = state.catalog.classes.find((record) => record.id === classId);
    if (!nextClass) return;
    setSelectedClassId(classId);
    setSelectedSubjectId(nextClass.subjects[0]?.id ?? null);
  }

  return (
    <section className="curriculum-surface" aria-labelledby="curriculum-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">مسارك الدراسي</p>
          <h2 id="curriculum-title">الصفوف والمواد والدروس</h2>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() => void loadCurriculum()}
          disabled={!online || state.status === "loading"}
        >
          تحديث المحتوى
        </button>
      </div>

      {state.status === "loading" ? (
        <div className="curriculum-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري تحميل المحتوى الدراسي</span>
          <span />
          <span />
          <span />
        </div>
      ) : state.status === "offline" ? (
        <div className="form-alert is-warning" role="status">
          لا يمكن التحقق من أحدث محتوى دراسي أثناء عدم الاتصال. لن نعرض نسخة مخزنة كأنها حديثة قبل تنفيذ Stage16 Offline/PWA.
        </div>
      ) : state.status === "error" ? (
        <div className="access-error" role="alert">
          <div className="form-alert is-danger">{state.message}</div>
          <button className="secondary-button" type="button" onClick={() => void loadCurriculum()} disabled={!online}>
            إعادة المحاولة
          </button>
        </div>
      ) : state.catalog.classes.length === 0 ? (
        <div className="empty-state">
          <strong>لا يوجد محتوى دراسي منشور ضمن صلاحياتك الآن</strong>
          <p>إذا فعّلت رمز صف للتو فحدّث المحتوى. لا يعرض التطبيق دروسًا غير منشورة أو صفوفًا خارج صلاحيات الخادم.</p>
        </div>
      ) : (
        <div className="curriculum-browser">
          <nav className="class-switcher" aria-label="الصفوف المتاحة">
            {state.catalog.classes.map((classRecord) => (
              <button
                key={classRecord.id}
                type="button"
                className={classRecord.id === selectedClass?.id ? "is-active" : ""}
                aria-pressed={classRecord.id === selectedClass?.id}
                onClick={() => chooseClass(classRecord.id)}
              >
                <strong>{classRecord.name}</strong>
                <small>{classRecord.subjects.length} مادة</small>
              </button>
            ))}
          </nav>

          {selectedClass ? (
            <div className="curriculum-workspace">
              <header className="curriculum-context">
                <p className="eyebrow">الصف الحالي</p>
                <h3>{selectedClass.name}</h3>
                {selectedClass.description ? <p>{selectedClass.description}</p> : null}
              </header>

              {selectedClass.subjects.length === 0 ? (
                <div className="empty-state">
                  <strong>لا توجد مواد نشطة منشورة لهذا الصف</strong>
                  <p>يبقى الصف ظاهرًا لأنه ضمن صلاحياتك، لكن لن نختلق مواد أو دروسًا غير منشورة.</p>
                </div>
              ) : (
                <>
                  <nav className="subject-switcher" aria-label="مواد الصف">
                    {selectedClass.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        className={subject.id === selectedSubject?.id ? "is-active" : ""}
                        aria-pressed={subject.id === selectedSubject?.id}
                        onClick={() => setSelectedSubjectId(subject.id)}
                      >
                        <span>{subject.name}</span>
                        <small>{lessonCount(subject)} درس</small>
                      </button>
                    ))}
                  </nav>

                  {selectedSubject ? (
                    <section className="subject-panel" aria-labelledby={`subject-${selectedSubject.id}`}>
                      <div className="subject-heading">
                        <div>
                          <p className="eyebrow">المادة</p>
                          <h3 id={`subject-${selectedSubject.id}`}>{selectedSubject.name}</h3>
                          {selectedSubject.description ? <p>{selectedSubject.description}</p> : null}
                        </div>
                        <span className="subject-count">{lessonCount(selectedSubject)} درس منشور</span>
                      </div>

                      {lessonCount(selectedSubject) === 0 ? (
                        <div className="empty-state">
                          <strong>لا توجد دروس منشورة في هذه المادة بعد</strong>
                          <p>سيظهر الدرس هنا فقط عندما تسمح به authority الحالية ويصبح منشورًا فعليًا.</p>
                        </div>
                      ) : (
                        <SubjectLessons subject={selectedSubject} />
                      )}
                    </section>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
