import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  answerStudentAssessmentQuestion,
  ApiRequestError,
  finalizeStudentAssessment,
  getStudentAssessmentSession,
  isMissingSessionError,
  listStudentAttempts,
  listStudentQuizzes,
  startStudentAssessment,
  type StudentAssessmentAttempt,
  type StudentAssessmentCatalogItem,
  type StudentAssessmentMode,
  type StudentAssessmentQuestion,
  type StudentAssessmentSession,
} from "./auth-api";
import { studentErrorMessage } from "./student-error-copy";
import "./assessment.css";

type AssessmentCatalogState =
  | { status: "loading"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "ready"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "offline"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "error"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[]; message: string };

type AttemptState =
  | { status: "loading" }
  | { status: "ready"; assessment: StudentAssessmentSession }
  | { status: "offline" }
  | { status: "error"; message: string; unavailable?: boolean };

type PracticeRoute =
  | { kind: "library" }
  | { kind: "quiz"; quizId: string }
  | { kind: "attempt"; sessionId: string }
  | { kind: "invalid" };

const ARABIC_OPTION_MARKERS = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي"] as const;

function requestMessage(error: unknown): string {
  return studentErrorMessage(error, "assessment");
}

function decodeRouteId(value: string | undefined): string | null {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return null; }
}

function practiceRoute(pathname: string): PracticeRoute {
  if (pathname === "/app/practice" || pathname === "/app/practice/") return { kind: "library" };
  const quizMatch = pathname.match(/^\/app\/practice\/quizzes\/([^/]+)\/?$/);
  if (quizMatch) {
    const quizId = decodeRouteId(quizMatch[1]);
    return quizId ? { kind: "quiz", quizId } : { kind: "invalid" };
  }
  const attemptMatch = pathname.match(/^\/app\/practice\/attempts\/([^/]+)\/?$/);
  if (attemptMatch) {
    const sessionId = decodeRouteId(attemptMatch[1]);
    return sessionId ? { kind: "attempt", sessionId } : { kind: "invalid" };
  }
  return { kind: "invalid" };
}

function quizHref(quizId: string): string { return `/app/practice/quizzes/${encodeURIComponent(quizId)}`; }
function attemptHref(sessionId: string): string { return `/app/practice/attempts/${encodeURIComponent(sessionId)}`; }
function modeLabel(mode: StudentAssessmentMode): string { return mode === "practice" ? "تدريب" : "اختبار"; }
function optionMarker(index: number): string { return ARABIC_OPTION_MARKERS[index] ?? String(index + 1); }
function scoreLabel(value: number): string { return `${new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 2 }).format(value)}٪`; }
function attemptDate(value: string): string { return new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function hasBlockingCatalogState(state: AssessmentCatalogState): boolean { return state.quizzes.length === 0 && state.status !== "ready"; }

function CatalogState({ state, online, onRetry }: { state: AssessmentCatalogState; online: boolean; onRetry: () => void }) {
  if (state.status === "loading") return <div className="practice-skeleton" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">جاري تحميل التدريبات والاختبارات</span><span /><span /><span /></div>;
  if (state.status === "offline") return <div className="practice-state" role="status"><strong>تحتاج اتصالًا لعرض التدريبات</strong><p>عندما يعود الاتصال ستتمكن من فتح محاولاتك وبدء تدريب أو اختبار جديد.</p></div>;
  if (state.status === "error") return <div className="practice-state practice-state--error" role="alert"><strong>تعذر تحميل التدريبات</strong><p>{state.message}</p><button className="secondary-button" type="button" onClick={onRetry} disabled={!online}>إعادة المحاولة</button></div>;
  return null;
}

function PracticeLibrary({ state, online, onRetry }: { state: AssessmentCatalogState; online: boolean; onRetry: () => void }) {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const classes = useMemo(() => { const values = new Map<string, string>(); for (const quiz of state.quizzes) values.set(quiz.classId, quiz.className); return [...values.entries()].map(([id, name]) => ({ id, name })); }, [state.quizzes]);
  const subjects = useMemo(() => { const values = new Map<string, string>(); for (const quiz of state.quizzes) if (!classId || quiz.classId === classId) values.set(quiz.subjectId, quiz.subjectName); return [...values.entries()].map(([id, name]) => ({ id, name })); }, [classId, state.quizzes]);
  const visibleQuizzes = state.quizzes.filter((quiz) => (!classId || quiz.classId === classId) && (!subjectId || quiz.subjectId === subjectId));
  if (hasBlockingCatalogState(state)) return <CatalogState state={state} online={online} onRetry={onRetry} />;
  return <div className="practice-library">
    <header className="practice-page-heading"><div><p className="eyebrow">طبّق ما تعلمته</p><h1>التدريب والاختبارات</h1><p>اختر ما تريد مراجعته. التدريب يعطيك التصحيح أثناء الحل، والاختبار يعرض النتيجة بعد الإنهاء.</p></div><button className="text-button" type="button" onClick={onRetry} disabled={!online || state.status === "loading"}>تحديث</button></header>
    {!online ? <div className="form-alert is-warning practice-route-notice" role="status">أنت غير متصل الآن. يلزم اتصال لبدء محاولة أو استئنافها.</div> : null}
    {state.status === "error" ? <div className="form-alert is-danger practice-route-notice" role="alert">{state.message}</div> : null}
    {state.quizzes.length === 0 ? <div className="empty-state practice-empty"><strong>لا توجد تدريبات متاحة لك الآن</strong><p>ستظهر هنا التدريبات والاختبارات المرتبطة بموادك عندما تصبح متاحة لحسابك.</p></div> : <>
      <div className="practice-filter-bar" aria-label="تصفية التدريبات والاختبارات">
        <div className="field-group"><label htmlFor="assessment-class-filter">الصف</label><select id="assessment-class-filter" className="text-input" value={classId} onChange={(event) => { setClassId(event.target.value); setSubjectId(""); }}><option value="">كل الصفوف</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div className="field-group"><label htmlFor="assessment-subject-filter">المادة</label><select id="assessment-subject-filter" className="text-input" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">كل المواد</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      </div>
      {visibleQuizzes.length === 0 ? <div className="empty-state practice-empty"><strong>لا توجد نتائج بهذا الاختيار</strong><p>جرّب صفًا أو مادة أخرى.</p></div> : <ul className="practice-list" aria-label="التدريبات والاختبارات المتاحة">{visibleQuizzes.map((quiz) => <li key={quiz.id} data-quiz-id={quiz.id}><Link className="practice-list__link" to={quizHref(quiz.id)}><span className="practice-list__content"><span className="practice-list__context">{quiz.className} · {quiz.subjectName}</span><strong>{quiz.title}</strong><small>{quiz.description ?? "افتح التفاصيل واختر تدريبًا أو اختبارًا."}</small></span><span className="practice-list__meta"><span>{quiz.versions.length > 1 ? `${quiz.versions.length} مجموعات أسئلة` : "مجموعة أسئلة واحدة"}</span><span className="practice-list__arrow" aria-hidden="true">←</span></span></Link></li>)}</ul>}
    </>}
    {state.attempts.length > 0 ? <section className="practice-history" aria-labelledby="practice-history-title"><header><div><p className="eyebrow">سجل التعلم</p><h2 id="practice-history-title">آخر المحاولات</h2></div><span>{state.attempts.length} محاولة</span></header><ul>{state.attempts.map((attempt) => <li key={attempt.id}><Link to={attemptHref(attempt.sessionId)}><span><strong>{attempt.quizTitle}</strong><small>{modeLabel(attempt.mode)} · {attemptDate(attempt.completedAt)}</small></span><b>{scoreLabel(attempt.scorePercent)}</b></Link></li>)}</ul></section> : null}
  </div>;
}

function QuizDetail({ quiz, online, busy, error, onStart }: { quiz: StudentAssessmentCatalogItem; online: boolean; busy: boolean; error: string | null; onStart: (mode: StudentAssessmentMode, versionId?: string) => void }) {
  const [versionId, setVersionId] = useState(() => (quiz.shuffleVersions ? "" : (quiz.versions[0]?.id ?? "")));
  const selectedVersion = quiz.versions.find((version) => version.id === versionId) ?? null;
  return <article className="quiz-detail" data-quiz-id={quiz.id} aria-labelledby="quiz-detail-title">
    <nav className="practice-breadcrumb" aria-label="مسار التدريب"><Link to="/app/practice">التدريب</Link><span aria-hidden="true">/</span><span>{quiz.subjectName}</span></nav>
    <header className="quiz-detail__hero"><p className="eyebrow">{quiz.className} · {quiz.subjectName}</p><h1 id="quiz-detail-title">{quiz.title}</h1><p>{quiz.description ?? "اختر الطريقة المناسبة لك وابدأ عندما تكون جاهزًا."}</p></header>
    {error ? <div className="form-alert is-danger quiz-detail__notice" role="alert">{error}</div> : null}
    {!online ? <div className="form-alert is-warning quiz-detail__notice" role="status">يلزم اتصال لبدء التدريب أو الاختبار.</div> : null}
    {quiz.versions.length > 1 ? <section className="quiz-choice-section" aria-labelledby="question-set-title"><div><p className="eyebrow">قبل البدء</p><h2 id="question-set-title">اختر مجموعة الأسئلة</h2><p>اختر مجموعة محددة، أو اترك الاختيار تلقائيًا إذا أردت تنويع الأسئلة.</p></div><div className="field-group quiz-question-set-field"><label htmlFor={`assessment-version-${quiz.id}`}>مجموعة الأسئلة</label><select id={`assessment-version-${quiz.id}`} className="text-input" value={versionId} onChange={(event) => setVersionId(event.target.value)}>{quiz.shuffleVersions ? <option value="">اختيار تلقائي</option> : null}{quiz.versions.map((version) => <option key={version.id} value={version.id}>{version.label}</option>)}</select><p className="field-hint">{selectedVersion ? `المجموعة المختارة: ${selectedVersion.label}` : "سيتم اختيار مجموعة متاحة عند البدء."}</p></div></section> : <p className="quiz-single-set">مجموعة أسئلة واحدة جاهزة للبدء.</p>}
    <section className="quiz-mode-choice" aria-labelledby="quiz-mode-title"><header><p className="eyebrow">اختر طريقتك</p><h2 id="quiz-mode-title">كيف تريد الحل؟</h2></header><div className="quiz-mode-options">
      <button type="button" className="quiz-mode-option" disabled={!online || busy || quiz.versions.length === 0} onClick={() => onStart("practice", versionId || undefined)}><span className="quiz-mode-option__icon" aria-hidden="true">✓</span><span><strong>تدريب</strong><small>اعرف نتيجة كل إجابة مباشرة وتعلّم من التصحيح أثناء الحل.</small></span><span className="quiz-mode-option__action">{busy ? "جاري الفتح" : "ابدأ التدريب"}</span></button>
      <button type="button" className="quiz-mode-option" disabled={!online || busy || quiz.versions.length === 0} onClick={() => onStart("test", versionId || undefined)}><span className="quiz-mode-option__icon" aria-hidden="true">◎</span><span><strong>اختبار</strong><small>أجب عن جميع الأسئلة أولًا، ثم شاهد نتيجتك والتصحيح في النهاية.</small></span><span className="quiz-mode-option__action">{busy ? "جاري الفتح" : "ابدأ الاختبار"}</span></button>
    </div></section>
  </article>;
}

function QuestionFeedback({ question }: { question: StudentAssessmentQuestion }) {
  if (!question.feedback) return null;
  const correctOption = question.feedback.correctOptionId ? question.options.find((option) => option.id === question.feedback?.correctOptionId) : null;
  return <div className={`attempt-feedback ${question.feedback.correct ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite"><strong>{question.feedback.correct ? "إجابة صحيحة" : "تحتاج مراجعة"}</strong>{!question.feedback.correct && correctOption ? <p>الإجابة الصحيحة: {correctOption.label}</p> : null}{!question.feedback.correct && question.feedback.correctAnswerText ? <p>الإجابة الصحيحة: {question.feedback.correctAnswerText}</p> : null}{question.feedback.explanation ? <p>{question.feedback.explanation}</p> : null}{question.feedback.method ? <p className="attempt-feedback__method">الطريقة: {question.feedback.method}</p> : null}</div>;
}

function AttemptResult({ assessment }: { assessment: StudentAssessmentSession }) {
  if (!assessment.attempt) return null;
  return <section className="attempt-result" aria-labelledby="attempt-result-title" role="status" aria-live="polite"><p className="eyebrow">اكتملت المحاولة</p><div className="attempt-result__score">{scoreLabel(assessment.attempt.scorePercent)}</div><h1 id="attempt-result-title" tabIndex={-1}>{assessment.quiz.title}</h1><p>{assessment.attempt.correctCount} صحيحة من {assessment.attempt.questionCount} سؤال. يمكنك مراجعة الأسئلة والتصحيح قبل العودة إلى قائمة التدريب.</p><div className="attempt-result__actions"><Link className="primary-button" to="/app/practice">العودة إلى التدريب</Link><Link className="secondary-button" to={quizHref(assessment.quiz.id)}>محاولة جديدة</Link></div></section>;
}

function AssessmentWorkspace({ assessment, online, onChange, onSessionExpired, onUnavailable }: { assessment: StudentAssessmentSession; online: boolean; onChange: (next: StudentAssessmentSession) => void; onSessionExpired: () => void; onUnavailable: (message: string) => void }) {
  const [questionId, setQuestionId] = useState(assessment.session.currentQuestionId ?? assessment.questions[0]?.id ?? "");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [directAnswer, setDirectAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentIndex = Math.max(0, assessment.questions.findIndex((question) => question.id === questionId));
  const question = assessment.questions[currentIndex] ?? assessment.questions[0] ?? null;
  const completed = assessment.session.status === "completed";
  const allAnswered = assessment.progress.answeredCount === assessment.progress.questionCount;
  const progressPercent = assessment.progress.questionCount > 0 ? Math.round((assessment.progress.answeredCount / assessment.progress.questionCount) * 100) : 0;

  useEffect(() => { const active = assessment.questions.find((candidate) => candidate.id === questionId) ?? assessment.questions[0] ?? null; setSelectedOptionId(active?.answer?.selectedOptionId ?? ""); setDirectAnswer(active?.answer?.directAnswerText ?? ""); }, [assessment.questions, questionId]);
  useEffect(() => { if (assessment.session.currentQuestionId && !questionId) setQuestionId(assessment.session.currentQuestionId); }, [assessment.session.currentQuestionId, questionId]);
  useEffect(() => { if (!completed) return; window.scrollTo({ top: 0, left: 0, behavior: "auto" }); const frame = window.requestAnimationFrame(() => { document.getElementById("attempt-result-title")?.focus({ preventScroll: true }); }); return () => window.cancelAnimationFrame(frame); }, [completed]);

  async function run(action: () => Promise<StudentAssessmentSession>) {
    if (busy || !online) return;
    setBusy(true); setError(null);
    try { onChange(await action()); }
    catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.code === "NOT_FOUND") { onUnavailable(studentErrorMessage(requestError, "assessment")); return; }
      if (isMissingSessionError(requestError)) { onSessionExpired(); return; }
      setError(requestMessage(requestError));
    } finally { setBusy(false); }
  }

  async function saveAnswer() {
    if (!question || completed || question.feedback || busy || !online) return;
    if (question.type === "direct") {
      const value = directAnswer.trim();
      if (!value) { setError("اكتب إجابتك قبل الحفظ."); return; }
      await run(() => answerStudentAssessmentQuestion(assessment.session.id, question.id, { directAnswerText: value })); return;
    }
    if (!selectedOptionId) { setError("اختر إجابة قبل الحفظ."); return; }
    await run(() => answerStudentAssessmentQuestion(assessment.session.id, question.id, { selectedOptionId }));
  }

  function moveQuestion(direction: -1 | 1) { const next = assessment.questions[currentIndex + direction]; if (!next) return; setError(null); setQuestionId(next.id); }

  if (!question) return <div className="practice-state"><strong>لا توجد أسئلة في هذه المحاولة</strong><p>ارجع إلى التدريب واختر نشاطًا آخر.</p><Link className="secondary-button" to="/app/practice">العودة إلى التدريب</Link></div>;
  if (completed) return <div className="attempt-review-shell"><AttemptResult assessment={assessment} /><section className="attempt-review" aria-labelledby="attempt-review-title"><header><p className="eyebrow">مراجعة الإجابات</p><h2 id="attempt-review-title">راجع ما أجبت عنه</h2></header><nav className="attempt-question-nav" aria-label="أسئلة المحاولة">{assessment.questions.map((candidate, index) => <button key={candidate.id} type="button" className={candidate.id === question.id ? "is-active" : ""} aria-current={candidate.id === question.id ? "step" : undefined} aria-label={`السؤال ${index + 1}`} onClick={() => setQuestionId(candidate.id)}>{index + 1}</button>)}</nav><article className="attempt-question attempt-question--review" data-question-id={question.id}><p className="attempt-question__meta">السؤال {currentIndex + 1} من {assessment.questions.length}</p><h3>{question.prompt}</h3><QuestionFeedback question={question} /></article><div className="attempt-step-actions"><button className="secondary-button" type="button" onClick={() => moveQuestion(-1)} disabled={currentIndex === 0}>السؤال السابق</button><button className="secondary-button" type="button" onClick={() => moveQuestion(1)} disabled={currentIndex >= assessment.questions.length - 1}>السؤال التالي</button></div></section></div>;

  return <section className="attempt-shell" aria-labelledby="attempt-title">
    <header className="attempt-topbar"><Link className="attempt-exit" to="/app/practice" aria-label="الخروج من المحاولة والعودة إلى التدريب"><span aria-hidden="true">→</span><span>التدريب</span></Link><div className="attempt-topbar__title"><span>{modeLabel(assessment.session.mode)}</span><h1 id="attempt-title">{assessment.quiz.title}</h1></div><span className="attempt-count">{currentIndex + 1}/{assessment.questions.length}</span></header>
    <div className="attempt-progress" aria-label={`أجبت عن ${assessment.progress.answeredCount} من ${assessment.progress.questionCount} سؤال`}><span style={{ width: `${progressPercent}%` }} /></div>
    {!online ? <div className="attempt-connection-state" role="status">انقطع الاتصال. يمكنك قراءة السؤال، لكن الحفظ والإنهاء متوقفان حتى يعود الاتصال.</div> : null}
    {assessment.session.mode === "test" ? <p className="attempt-mode-note">في الاختبار يظهر التصحيح بعد إنهاء جميع الأسئلة.</p> : null}
    {error ? <div className="form-alert is-danger attempt-alert" role="alert">{error}</div> : null}
    <nav className="attempt-question-nav" aria-label="أسئلة المحاولة">{assessment.questions.map((candidate, index) => <button key={candidate.id} type="button" className={candidate.id === question.id ? "is-active" : ""} aria-current={candidate.id === question.id ? "step" : undefined} aria-label={`السؤال ${index + 1}${candidate.answer ? "، تمت الإجابة" : ""}`} onClick={() => { setError(null); setQuestionId(candidate.id); }}>{index + 1}{candidate.answer ? <span aria-hidden="true">✓</span> : null}</button>)}</nav>
    <article className="attempt-question" data-question-id={question.id}><header><p className="attempt-question__meta">السؤال {currentIndex + 1} من {assessment.questions.length}{question.sourcePage ? ` · صفحة ${question.sourcePage}` : ""}</p><h2>{question.prompt}</h2></header>
      {question.type === "direct" ? <div className="field-group attempt-direct-field"><label htmlFor={`direct-answer-${question.id}`}>إجابتك</label><textarea id={`direct-answer-${question.id}`} className="text-input attempt-direct-answer" value={directAnswer} onChange={(event) => setDirectAnswer(event.target.value)} disabled={Boolean(question.feedback) || busy || !online} maxLength={10_000} rows={5} /></div> : <fieldset className="attempt-options" disabled={Boolean(question.feedback) || busy || !online}><legend className="sr-only">اختر إجابة السؤال</legend>{question.options.map((option, optionIndex) => <label key={option.id} className={selectedOptionId === option.id ? "is-selected" : ""}><input type="radio" name={`question-${question.id}`} value={option.id} checked={selectedOptionId === option.id} onChange={() => setSelectedOptionId(option.id)} /><span className="attempt-option-marker" aria-hidden="true">{optionMarker(optionIndex)}</span><span>{option.label}</span></label>)}</fieldset>}
      {!question.feedback ? <button className="primary-button attempt-primary-action" type="button" onClick={() => void saveAnswer()} disabled={busy || !online}>{busy ? "جاري الحفظ" : assessment.session.mode === "practice" ? "تحقق من إجابتي" : "حفظ الإجابة"}</button> : null}
      <QuestionFeedback question={question} />
    </article>
    <div className="attempt-step-actions"><button className="secondary-button" type="button" onClick={() => moveQuestion(-1)} disabled={currentIndex === 0}>السؤال السابق</button><button className="secondary-button" type="button" onClick={() => moveQuestion(1)} disabled={currentIndex >= assessment.questions.length - 1}>السؤال التالي</button></div>
    <footer className="attempt-finish-bar"><div><strong>{allAnswered ? "أكملت جميع الأسئلة" : `بقي ${assessment.progress.questionCount - assessment.progress.answeredCount} سؤال`}</strong><small>{allAnswered ? "يمكنك إنهاء المحاولة ومشاهدة النتيجة." : "أجب عن كل الأسئلة قبل الإنهاء."}</small></div><button className="primary-button" type="button" disabled={!allAnswered || busy || !online} onClick={() => void run(() => finalizeStudentAssessment(assessment.session.id))}>{busy ? "جاري الإنهاء" : `إنهاء ${modeLabel(assessment.session.mode)}`}</button></footer>
  </section>;
}

function AttemptPage({ sessionId, online, onSessionExpired }: { sessionId: string; online: boolean; onSessionExpired: () => void }) {
  const [state, setState] = useState<AttemptState>({ status: "loading" });
  async function loadAttempt() {
    if (!online) { setState((current) => (current.status === "ready" ? current : { status: "offline" })); return; }
    try { setState({ status: "ready", assessment: await getStudentAssessmentSession(sessionId) }); }
    catch (error) {
      if (isMissingSessionError(error)) { onSessionExpired(); return; }
      if (error instanceof ApiRequestError && error.code === "NOT_FOUND") { setState({ status: "error", message: studentErrorMessage(error, "assessment"), unavailable: true }); return; }
      setState({ status: "error", message: requestMessage(error) });
    }
  }
  useEffect(() => { void loadAttempt(); }, [sessionId, online]);
  if (state.status === "loading") return <div className="attempt-loading" role="status" aria-live="polite" aria-busy="true"><span className="spinner" aria-hidden="true" /><strong>نفتح محاولتك</strong></div>;
  if (state.status === "offline") return <div className="practice-state"><strong>نحتاج اتصالًا لفتح المحاولة</strong><p>أعد الاتصال ثم حاول مرة أخرى.</p><button className="secondary-button" type="button" onClick={() => void loadAttempt()} disabled={!online}>إعادة المحاولة</button></div>;
  if (state.status === "error") return <div className="practice-state practice-state--error" role="alert"><strong>{state.unavailable ? "هذه المحاولة لم تعد متاحة" : "تعذر فتح المحاولة"}</strong><p>{state.message}</p><Link className="secondary-button" to="/app/practice">العودة إلى التدريب</Link></div>;
  return <AssessmentWorkspace assessment={state.assessment} online={online} onSessionExpired={onSessionExpired} onChange={(assessment) => setState({ status: "ready", assessment })} onUnavailable={(message) => setState({ status: "error", message, unavailable: true })} />;
}

export function StudentAssessmentExperience({ online, refreshKey, onSessionExpired }: { online: boolean; refreshKey: number; onSessionExpired: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const route = practiceRoute(location.pathname);
  const [state, setState] = useState<AssessmentCatalogState>({ status: "loading", quizzes: [], attempts: [] });
  const [busyQuizId, setBusyQuizId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadCatalog() {
    if (!online) { setState((current) => ({ ...current, status: "offline" })); return; }
    setState((current) => ({ ...current, status: "loading" }));
    try { const [quizzes, attempts] = await Promise.all([listStudentQuizzes(), listStudentAttempts(8)]); setState({ status: "ready", quizzes, attempts }); }
    catch (error) { if (isMissingSessionError(error)) { onSessionExpired(); return; } setState((current) => ({ ...current, status: "error", message: requestMessage(error) })); }
  }

  useEffect(() => { if (route.kind !== "attempt") void loadCatalog(); }, [online, refreshKey, route.kind]);

  async function start(quiz: StudentAssessmentCatalogItem, mode: StudentAssessmentMode, versionId?: string) {
    if (!online || busyQuizId) return;
    setBusyQuizId(quiz.id); setActionError(null);
    try { const input = versionId ? { mode, versionId } : { mode }; const assessment = await startStudentAssessment(quiz.id, input); navigate(attemptHref(assessment.session.id)); }
    catch (error) { if (isMissingSessionError(error)) { onSessionExpired(); return; } setActionError(requestMessage(error)); }
    finally { setBusyQuizId(null); }
  }

  if (route.kind === "invalid") return <Navigate replace to="/app/practice" />;
  if (route.kind === "attempt") return <AttemptPage sessionId={route.sessionId} online={online} onSessionExpired={onSessionExpired} />;
  if (route.kind === "library") return <PracticeLibrary state={state} online={online} onRetry={() => void loadCatalog()} />;
  if (hasBlockingCatalogState(state)) return <CatalogState state={state} online={online} onRetry={() => void loadCatalog()} />;
  const quiz = state.quizzes.find((candidate) => candidate.id === route.quizId) ?? null;
  if (!quiz) return <div className="practice-state practice-state--permission" role="status"><strong>هذا التدريب غير متاح لك</strong><p>قد يكون وصولك تغيّر أو أن الرابط لم يعد صالحًا. ارجع إلى قائمة التدريب واختر نشاطًا متاحًا.</p><Link className="secondary-button" to="/app/practice">العودة إلى التدريب</Link></div>;
  return <QuizDetail quiz={quiz} online={online} busy={busyQuizId === quiz.id} error={actionError} onStart={(mode, versionId) => void start(quiz, mode, versionId)} />;
}

export const StudentAssessmentSection = StudentAssessmentExperience;
