import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { StudentAssessmentCatalogItem, StudentAssessmentMode } from "../../auth-api";
import {
  attemptDate,
  attemptHref,
  hasBlockingCatalogState,
  modeLabel,
  quizHref,
  scoreLabel,
  type AssessmentCatalogState,
} from "./practice-model";

export function CatalogState({ state, online, onRetry }: {
  state: AssessmentCatalogState;
  online: boolean;
  onRetry: () => void;
}) {
  if (state.status === "loading") {
    return <div className="practice-skeleton" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">جاري تحميل التدريبات والاختبارات</span><span /><span /><span /></div>;
  }
  if (state.status === "offline") {
    return <div className="practice-state" role="status"><strong>تحتاج اتصالًا لعرض التدريبات</strong><p>عندما يعود الاتصال ستتمكن من فتح محاولاتك وبدء تدريب أو اختبار جديد.</p></div>;
  }
  if (state.status === "error") {
    return <div className="practice-state practice-state--error" role="alert"><strong>تعذر تحميل التدريبات</strong><p>{state.message}</p><button className="secondary-button" type="button" onClick={onRetry} disabled={!online}>إعادة المحاولة</button></div>;
  }
  return null;
}

export function PracticeLibrary({ state, online, onRetry }: {
  state: AssessmentCatalogState;
  online: boolean;
  onRetry: () => void;
}) {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const classes = useMemo(() => {
    const values = new Map<string, string>();
    for (const quiz of state.quizzes) values.set(quiz.classId, quiz.className);
    return [...values.entries()].map(([id, name]) => ({ id, name }));
  }, [state.quizzes]);

  const subjects = useMemo(() => {
    const values = new Map<string, string>();
    for (const quiz of state.quizzes) {
      if (!classId || quiz.classId === classId) values.set(quiz.subjectId, quiz.subjectName);
    }
    return [...values.entries()].map(([id, name]) => ({ id, name }));
  }, [classId, state.quizzes]);

  const visibleQuizzes = state.quizzes.filter((quiz) =>
    (!classId || quiz.classId === classId) && (!subjectId || quiz.subjectId === subjectId));

  if (hasBlockingCatalogState(state)) return <CatalogState state={state} online={online} onRetry={onRetry} />;

  return (
    <div className="practice-library">
      <header className="practice-page-heading">
        <div>
          <p className="eyebrow">طبّق ما تعلمته</p>
          <h1>التدريب والاختبارات</h1>
          <p>اختر ما تريد مراجعته. التدريب يعطيك التصحيح أثناء الحل، والاختبار يعرض النتيجة بعد الإنهاء.</p>
        </div>
        <button className="text-button" type="button" onClick={onRetry} disabled={!online || state.status === "loading"}>تحديث</button>
      </header>

      {!online ? <div className="form-alert is-warning practice-route-notice" role="status">أنت غير متصل الآن. يلزم اتصال لبدء محاولة أو استئنافها.</div> : null}
      {state.status === "error" ? <div className="form-alert is-danger practice-route-notice" role="alert">{state.message}</div> : null}

      {state.quizzes.length === 0 ? (
        <div className="empty-state practice-empty"><strong>لا توجد تدريبات متاحة لك الآن</strong><p>ستظهر هنا التدريبات والاختبارات المرتبطة بموادك عندما تصبح متاحة لحسابك.</p></div>
      ) : (
        <>
          {(classes.length > 1 || subjects.length > 1) ? (
            <div className="practice-filter-bar" aria-label="تصفية التدريبات والاختبارات">
              {classes.length > 1 ? (
                <div className="field-group">
                  <label htmlFor="assessment-class-filter">الصف</label>
                  <select id="assessment-class-filter" className="text-input" value={classId} onChange={(event) => { setClassId(event.target.value); setSubjectId(""); }}>
                    <option value="">كل الصفوف</option>
                    {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              ) : null}
              {subjects.length > 1 ? (
                <div className="field-group">
                  <label htmlFor="assessment-subject-filter">المادة</label>
                  <select id="assessment-subject-filter" className="text-input" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
                    <option value="">كل المواد</option>
                    {subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              ) : null}
            </div>
          ) : null}

          {visibleQuizzes.length === 0 ? (
            <div className="empty-state practice-empty"><strong>لا توجد نتائج بهذا الاختيار</strong><p>جرّب صفًا أو مادة أخرى.</p></div>
          ) : (
            <ul className="practice-list" aria-label="التدريبات والاختبارات المتاحة">
              {visibleQuizzes.map((quiz) => (
                <li key={quiz.id} data-quiz-id={quiz.id}>
                  <Link className="practice-list__link" to={quizHref(quiz.id)}>
                    <span className="practice-list__content">
                      <span className="practice-list__context">{quiz.className} · {quiz.subjectName}</span>
                      <strong>{quiz.title}</strong>
                      {quiz.description ? <small>{quiz.description}</small> : null}
                    </span>
                    <span className="practice-list__meta">
                      <span>{quiz.versions.length > 1 ? `${quiz.versions.length} نماذج` : "نموذج واحد"}</span>
                      <span className="practice-list__arrow" aria-hidden="true">←</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {state.attempts.length > 0 ? (
        <section className="practice-history" aria-labelledby="practice-history-title">
          <header><div><p className="eyebrow">سجل التعلم</p><h2 id="practice-history-title">آخر المحاولات</h2></div><span>{state.attempts.length} محاولة</span></header>
          <ul>
            {state.attempts.map((attempt) => (
              <li key={attempt.id}>
                <Link to={attemptHref(attempt.sessionId)}>
                  <span><strong>{attempt.quizTitle}</strong><small>{attempt.versionLabel} · {modeLabel(attempt.mode)} · {attemptDate(attempt.completedAt)}</small></span>
                  <b>{scoreLabel(attempt.scorePercent)}</b>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function QuizDetail({ quiz, online, busy, error, onStart }: {
  quiz: StudentAssessmentCatalogItem;
  online: boolean;
  busy: boolean;
  error: string | null;
  onStart: (mode: StudentAssessmentMode, versionId?: string) => void;
}) {
  const [versionId, setVersionId] = useState(() => (quiz.shuffleVersions ? "" : (quiz.versions[0]?.id ?? "")));
  const selectedVersion = quiz.versions.find((version) => version.id === versionId) ?? null;

  return (
    <article className="quiz-detail" data-quiz-id={quiz.id} aria-labelledby="quiz-detail-title">
      <nav className="practice-breadcrumb" aria-label="مسار التدريب"><Link to="/app/practice">التدريب</Link><span aria-hidden="true">/</span><span>{quiz.subjectName}</span></nav>
      <header className="quiz-detail__hero"><p className="eyebrow">{quiz.className} · {quiz.subjectName}</p><h1 id="quiz-detail-title">{quiz.title}</h1>{quiz.description ? <p>{quiz.description}</p> : null}</header>

      {error ? <div className="form-alert is-danger quiz-detail__notice" role="alert">{error}</div> : null}
      {!online ? <div className="form-alert is-warning quiz-detail__notice" role="status">يلزم اتصال لبدء التدريب أو الاختبار.</div> : null}

      {quiz.versions.length > 1 ? (
        <section className="quiz-choice-section" aria-labelledby="question-set-title">
          <div><p className="eyebrow">النماذج</p><h2 id="question-set-title">اختر النموذج</h2><p>يمكنك اختيار نموذج محدد أو ترك الاختيار تلقائيًا عندما يكون ذلك متاحًا.</p></div>
          <div className="field-group quiz-question-set-field">
            <label htmlFor={`assessment-version-${quiz.id}`}>النموذج</label>
            <select id={`assessment-version-${quiz.id}`} className="text-input" value={versionId} onChange={(event) => setVersionId(event.target.value)}>
              {quiz.shuffleVersions ? <option value="">اختيار تلقائي</option> : null}
              {quiz.versions.map((version) => <option key={version.id} value={version.id}>{version.label}</option>)}
            </select>
            <p className="field-hint">{selectedVersion ? `النموذج المختار: ${selectedVersion.label}` : "سيتم اختيار نموذج متاح عند البدء."}</p>
          </div>
        </section>
      ) : <p className="quiz-single-set">نموذج واحد جاهز للبدء.</p>}

      <section className="quiz-mode-choice" aria-labelledby="quiz-mode-title">
        <header><p className="eyebrow">طريقة الحل</p><h2 id="quiz-mode-title">كيف تريد الحل؟</h2></header>
        <div className="quiz-mode-options">
          <button type="button" className="quiz-mode-option" disabled={!online || busy || quiz.versions.length === 0} onClick={() => onStart("practice", versionId || undefined)}>
            <span className="quiz-mode-option__icon" aria-hidden="true">✓</span>
            <span><strong>تدريب</strong><small>يظهر التصحيح أثناء الحل.</small></span>
            <span className="quiz-mode-option__action">{busy ? "جاري الفتح" : "ابدأ التدريب"}</span>
          </button>
          <button type="button" className="quiz-mode-option" disabled={!online || busy || quiz.versions.length === 0} onClick={() => onStart("test", versionId || undefined)}>
            <span className="quiz-mode-option__icon" aria-hidden="true">◎</span>
            <span><strong>اختبار</strong><small>تظهر النتيجة والتصحيح بعد الإنهاء.</small></span>
            <span className="quiz-mode-option__action">{busy ? "جاري الفتح" : "ابدأ الاختبار"}</span>
          </button>
        </div>
      </section>
    </article>
  );
}
