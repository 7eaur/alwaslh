import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  isMissingSessionError,
  listStudentCurriculum,
  type StudentCurriculumCatalog,
  type StudentCurriculumSubject,
} from "./auth-api";
import { studentErrorMessage } from "./student-error-copy";
import {
  findStudentLesson,
  findStudentSubject,
  lessonCount,
  studentLessonHref,
  studentSubjectHref,
} from "./student-learning-model";
import { StudentLessonReaderPage } from "./student-reader";

type CurriculumState =
  | { status: "loading" }
  | { status: "ready"; catalog: StudentCurriculumCatalog }
  | { status: "offline" }
  | { status: "error"; message: string };

type LearningRoute =
  | { kind: "learn" }
  | { kind: "subject"; subjectId: string }
  | { kind: "lesson"; lessonId: string }
  | { kind: "invalid" };

function requestMessage(error: unknown): string {
  return studentErrorMessage(error, "curriculum");
}

function decodeRouteId(value: string | undefined): string | null {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return null; }
}

function learningRoute(pathname: string): LearningRoute {
  if (pathname === "/app/learn" || pathname === "/app/learn/") return { kind: "learn" };
  const subjectMatch = pathname.match(/^\/app\/learn\/subjects\/([^/]+)\/?$/);
  if (subjectMatch) {
    const subjectId = decodeRouteId(subjectMatch[1]);
    return subjectId ? { kind: "subject", subjectId } : { kind: "invalid" };
  }
  const lessonMatch = pathname.match(/^\/app\/learn\/lessons\/([^/]+)\/?$/);
  if (lessonMatch) {
    const lessonId = decodeRouteId(lessonMatch[1]);
    return lessonId ? { kind: "lesson", lessonId } : { kind: "invalid" };
  }
  return { kind: "invalid" };
}

function LearningState({ state, online, onRetry }: {
  state: Exclude<CurriculumState, { status: "ready" }>;
  online: boolean;
  onRetry: () => void;
}) {
  if (state.status === "loading") return (
    <div className="learning-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">جاري تحميل موادك ودروسك</span><span /><span /><span />
    </div>
  );
  if (state.status === "offline") return (
    <div className="learning-state" role="status">
      <strong>أنت غير متصل</strong>
      <p>أعد الاتصال لتصفح موادك ودروسك. المحتوى الذي سبق حفظه ستجده في التنزيلات.</p>
      <Link className="secondary-button learning-state__action" to="/app/downloads">فتح التنزيلات</Link>
    </div>
  );
  return (
    <div className="learning-state learning-state--error" role="alert">
      <strong>تعذر تحميل المحتوى الدراسي</strong>
      <p>{state.message}</p>
      <button className="secondary-button" type="button" onClick={onRetry} disabled={!online}>إعادة المحاولة</button>
    </div>
  );
}

function LearnLanding({ catalog }: { catalog: StudentCurriculumCatalog }) {
  if (catalog.classes.length === 0) return (
    <div className="empty-state">
      <strong>لا توجد مواد متاحة لك الآن</strong>
      <p>إذا كان لديك رمز صف جديد، أضفه من حسابك ثم عد إلى التعلّم.</p>
      <Link className="secondary-button learning-empty-action" to="/app/account">فتح الحساب</Link>
    </div>
  );
  return (
    <div className="learn-overview">
      {catalog.classes.map((classRecord) => (
        <section className="learn-class-group" key={classRecord.id} aria-labelledby={`learn-class-${classRecord.id}`}>
          <header className="learn-class-heading">
            <div><p className="eyebrow">الصف</p><h2 id={`learn-class-${classRecord.id}`}>{classRecord.name}</h2>{classRecord.description ? <p>{classRecord.description}</p> : null}</div>
            <span>{classRecord.subjects.length} مادة</span>
          </header>
          {classRecord.subjects.length === 0 ? <p className="learn-inline-empty">لا توجد مواد متاحة في هذا الصف الآن.</p> : (
            <ul className="subject-list">
              {classRecord.subjects.map((subject) => (
                <li key={subject.id}><Link className="subject-list__link" to={studentSubjectHref(subject.id)}>
                  <span className="subject-list__copy"><strong>{subject.name}</strong><small>{subject.description ?? "افتح المادة لعرض وحداتها ودروسها."}</small></span>
                  <span className="subject-list__meta">{lessonCount(subject)} درس</span><span className="subject-list__arrow" aria-hidden="true">←</span>
                </Link></li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function LessonLink({ lesson, index }: { lesson: StudentCurriculumSubject["unsectionedLessons"][number]; index: number }) {
  return (
    <Link className="lesson-link" data-lesson-id={lesson.id} to={studentLessonHref(lesson.id)}>
      <span className="lesson-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <span className="lesson-copy"><strong>{lesson.title}</strong><span className={`lesson-summary ${lesson.summary ? "" : "lesson-muted"}`}>{lesson.summary ?? "افتح الدرس لبدء القراءة."}</span></span>
      <span className="lesson-status">فتح الدرس</span>
    </Link>
  );
}

function SubjectLessons({ subject }: { subject: StudentCurriculumSubject }) {
  let index = 0;
  return (
    <div className="subject-lessons" aria-label={`دروس ${subject.name}`}>
      {subject.unsectionedLessons.length > 0 ? <div className="lesson-group">{subject.unsectionedLessons.map((lesson) => { const lessonIndex = index; index += 1; return <LessonLink key={lesson.id} lesson={lesson} index={lessonIndex} />; })}</div> : null}
      {subject.sections.map((section) => (
        <section className="curriculum-section-group" key={section.id} aria-labelledby={`section-${section.id}`}>
          <div className="curriculum-section-heading"><div><p className="eyebrow">وحدة دراسية</p><h2 id={`section-${section.id}`}>{section.title}</h2>{section.description ? <p>{section.description}</p> : null}</div><span>{section.lessons.length} درس</span></div>
          {section.lessons.length === 0 ? <p className="learn-inline-empty">لا توجد دروس في هذه الوحدة الآن.</p> : <div className="lesson-group">{section.lessons.map((lesson) => { const lessonIndex = index; index += 1; return <LessonLink key={lesson.id} lesson={lesson} index={lessonIndex} />; })}</div>}
        </section>
      ))}
    </div>
  );
}

function SubjectPage({ catalog, subjectId }: { catalog: StudentCurriculumCatalog; subjectId: string }) {
  const context = findStudentSubject(catalog, subjectId);
  if (!context) return (
    <div className="learning-state learning-state--permission" role="status">
      <strong>هذه المادة غير متاحة لك</strong>
      <p>قد يكون وصولك تغيّر أو أن الرابط لم يعد صالحًا. ارجع إلى التعلّم واختر مادة متاحة.</p>
      <Link className="secondary-button learning-state__action" to="/app/learn">العودة إلى التعلّم</Link>
    </div>
  );
  const { classRecord, subject } = context;
  return (
    <article className="subject-page" aria-labelledby={`subject-${subject.id}`}>
      <nav className="learning-breadcrumb" aria-label="مسار التعلّم"><Link to="/app/learn">التعلّم</Link><span aria-hidden="true">/</span><span>{classRecord.name}</span></nav>
      <header className="subject-page__header"><p className="eyebrow">{classRecord.name}</p><h1 id={`subject-${subject.id}`}>{subject.name}</h1>{subject.description ? <p>{subject.description}</p> : null}<span className="subject-page__count">{lessonCount(subject)} درس</span></header>
      {lessonCount(subject) === 0 ? <div className="empty-state"><strong>لا توجد دروس متاحة في هذه المادة الآن</strong><p>ارجع إلى موادك واختر مادة أخرى.</p></div> : <SubjectLessons subject={subject} />}
    </article>
  );
}

export function StudentLearningExperience({ online, refreshKey, onSessionExpired }: { online: boolean; refreshKey: number; onSessionExpired: () => void }) {
  const location = useLocation();
  const route = learningRoute(location.pathname);
  const [state, setState] = useState<CurriculumState>({ status: "loading" });

  async function loadCurriculum() {
    if (!online) { setState({ status: "offline" }); return; }
    setState({ status: "loading" });
    try { setState({ status: "ready", catalog: await listStudentCurriculum() }); }
    catch (error) {
      if (isMissingSessionError(error)) { onSessionExpired(); return; }
      setState({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => { void loadCurriculum(); }, [online, refreshKey]);

  if (route.kind === "invalid") return <Navigate replace to="/app/learn" />;
  if (state.status !== "ready") return <LearningState state={state} online={online} onRetry={() => void loadCurriculum()} />;
  if (route.kind === "learn") return <LearnLanding catalog={state.catalog} />;
  if (route.kind === "subject") return <SubjectPage catalog={state.catalog} subjectId={route.subjectId} />;

  const context = findStudentLesson(state.catalog, route.lessonId);
  if (!context) return (
    <div className="learning-state learning-state--permission" role="status">
      <strong>هذا الدرس غير متاح لك</strong>
      <p>قد يكون وصولك تغيّر أو أن الرابط لم يعد صالحًا. ارجع إلى التعلّم واختر درسًا متاحًا.</p>
      <Link className="secondary-button learning-state__action" to="/app/learn">العودة إلى التعلّم</Link>
    </div>
  );

  return <StudentLessonReaderPage context={context} online={online} onSessionExpired={onSessionExpired} />;
}
