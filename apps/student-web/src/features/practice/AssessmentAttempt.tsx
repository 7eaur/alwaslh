import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  answerStudentAssessmentQuestion,
  ApiRequestError,
  finalizeStudentAssessment,
  getStudentAssessmentSession,
  isMissingSessionError,
  type StudentAssessmentQuestion,
  type StudentAssessmentSession,
} from "../../auth-api";
import { studentErrorMessage } from "../../student-error-copy";
import { modeLabel, optionMarker, quizHref, requestAssessmentMessage, scoreLabel } from "./practice-model";

type AttemptState =
  | { status: "loading" }
  | { status: "ready"; assessment: StudentAssessmentSession }
  | { status: "offline" }
  | { status: "error"; message: string; unavailable?: boolean };

function QuestionFeedback({ question }: { question: StudentAssessmentQuestion }) {
  if (!question.feedback) return null;
  const correctOption = question.feedback.correctOptionId
    ? question.options.find((option) => option.id === question.feedback?.correctOptionId)
    : null;

  return (
    <div className={`attempt-feedback ${question.feedback.correct ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite">
      <strong>{question.feedback.correct ? "إجابة صحيحة" : "تحتاج مراجعة"}</strong>
      {!question.feedback.correct && correctOption ? <p>الإجابة الصحيحة: {correctOption.label}</p> : null}
      {!question.feedback.correct && question.feedback.correctAnswerText ? <p>الإجابة الصحيحة: {question.feedback.correctAnswerText}</p> : null}
      {question.feedback.explanation ? <p>{question.feedback.explanation}</p> : null}
      {question.feedback.method ? <p className="attempt-feedback__method">الطريقة: {question.feedback.method}</p> : null}
    </div>
  );
}

function AttemptResult({ assessment }: { assessment: StudentAssessmentSession }) {
  if (!assessment.attempt) return null;
  return (
    <section className="attempt-result" aria-labelledby="attempt-result-title" role="status" aria-live="polite">
      <p className="eyebrow">اكتملت المحاولة</p>
      <div className="attempt-result__score">{scoreLabel(assessment.attempt.scorePercent)}</div>
      <h1 id="attempt-result-title" tabIndex={-1}>{assessment.quiz.title}</h1>
      <p>{assessment.attempt.correctCount} صحيحة من {assessment.attempt.questionCount} سؤال.</p>
      <div className="attempt-result__actions">
        <Link className="primary-button" to="/app/practice">العودة إلى التدريب</Link>
        <Link className="secondary-button" to={quizHref(assessment.quiz.id)}>محاولة جديدة</Link>
      </div>
    </section>
  );
}

function AssessmentWorkspace({ assessment, online, onChange, onSessionExpired, onUnavailable }: {
  assessment: StudentAssessmentSession;
  online: boolean;
  onChange: (next: StudentAssessmentSession) => void;
  onSessionExpired: () => void;
  onUnavailable: (message: string) => void;
}) {
  const [questionId, setQuestionId] = useState(assessment.session.currentQuestionId ?? assessment.questions[0]?.id ?? "");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [directAnswer, setDirectAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = Math.max(0, assessment.questions.findIndex((question) => question.id === questionId));
  const question = assessment.questions[currentIndex] ?? assessment.questions[0] ?? null;
  const completed = assessment.session.status === "completed";
  const allAnswered = assessment.progress.answeredCount === assessment.progress.questionCount;
  const progressPercent = assessment.progress.questionCount > 0
    ? Math.round((assessment.progress.answeredCount / assessment.progress.questionCount) * 100)
    : 0;

  useEffect(() => {
    const active = assessment.questions.find((candidate) => candidate.id === questionId) ?? assessment.questions[0] ?? null;
    setSelectedOptionId(active?.answer?.selectedOptionId ?? "");
    setDirectAnswer(active?.answer?.directAnswerText ?? "");
  }, [assessment.questions, questionId]);

  useEffect(() => {
    if (assessment.session.currentQuestionId && !questionId) setQuestionId(assessment.session.currentQuestionId);
  }, [assessment.session.currentQuestionId, questionId]);

  useEffect(() => {
    if (!completed) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("attempt-result-title")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [completed]);

  async function run(action: () => Promise<StudentAssessmentSession>) {
    if (busy || !online) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.code === "NOT_FOUND") {
        onUnavailable(studentErrorMessage(requestError, "assessment"));
        return;
      }
      if (isMissingSessionError(requestError)) {
        onSessionExpired();
        return;
      }
      setError(requestAssessmentMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function saveAnswer() {
    if (!question || completed || question.feedback || busy || !online) return;
    if (question.type === "direct") {
      const value = directAnswer.trim();
      if (!value) {
        setError("اكتب إجابتك قبل الحفظ.");
        return;
      }
      await run(() => answerStudentAssessmentQuestion(assessment.session.id, question.id, { directAnswerText: value }));
      return;
    }
    if (!selectedOptionId) {
      setError("اختر إجابة قبل الحفظ.");
      return;
    }
    await run(() => answerStudentAssessmentQuestion(assessment.session.id, question.id, { selectedOptionId }));
  }

  function moveQuestion(direction: -1 | 1) {
    const next = assessment.questions[currentIndex + direction];
    if (!next) return;
    setError(null);
    setQuestionId(next.id);
  }

  if (!question) {
    return <div className="practice-state"><strong>لا توجد أسئلة في هذه المحاولة</strong><p>ارجع إلى التدريب واختر نشاطًا آخر.</p><Link className="secondary-button" to="/app/practice">العودة إلى التدريب</Link></div>;
  }

  if (completed) {
    return (
      <div className="attempt-review-shell">
        <AttemptResult assessment={assessment} />
        <section className="attempt-review" aria-labelledby="attempt-review-title">
          <header><p className="eyebrow">مراجعة الإجابات</p><h2 id="attempt-review-title">راجع ما أجبت عنه</h2></header>
          <nav className="attempt-question-nav" aria-label="أسئلة المحاولة">
            {assessment.questions.map((candidate, index) => (
              <button key={candidate.id} type="button" className={candidate.id === question.id ? "is-active" : ""} aria-current={candidate.id === question.id ? "step" : undefined} aria-label={`السؤال ${index + 1}`} onClick={() => setQuestionId(candidate.id)}>{index + 1}</button>
            ))}
          </nav>
          <article className="attempt-question attempt-question--review" data-question-id={question.id}>
            <p className="attempt-question__meta">السؤال {currentIndex + 1} من {assessment.questions.length}</p>
            <h3>{question.prompt}</h3>
            <QuestionFeedback question={question} />
          </article>
          <div className="attempt-step-actions">
            <button className="secondary-button" type="button" onClick={() => moveQuestion(-1)} disabled={currentIndex === 0}>السؤال السابق</button>
            <button className="secondary-button" type="button" onClick={() => moveQuestion(1)} disabled={currentIndex >= assessment.questions.length - 1}>السؤال التالي</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="attempt-shell" aria-labelledby="attempt-title">
      <header className="attempt-topbar">
        <Link className="attempt-exit" to="/app/practice" aria-label="الخروج من المحاولة والعودة إلى التدريب"><span aria-hidden="true">→</span><span>التدريب</span></Link>
        <div className="attempt-topbar__title"><span>{modeLabel(assessment.session.mode)}</span><h1 id="attempt-title">{assessment.quiz.title}</h1></div>
        <span className="attempt-count">{currentIndex + 1}/{assessment.questions.length}</span>
      </header>

      <div className="attempt-progress" aria-label={`أجبت عن ${assessment.progress.answeredCount} من ${assessment.progress.questionCount} سؤال`}><span style={{ width: `${progressPercent}%` }} /></div>
      {!online ? <div className="attempt-connection-state" role="status">انقطع الاتصال. يمكنك قراءة السؤال، لكن الحفظ والإنهاء متوقفان حتى يعود الاتصال.</div> : null}
      {assessment.session.mode === "test" ? <p className="attempt-mode-note">في الاختبار يظهر التصحيح بعد إنهاء جميع الأسئلة.</p> : null}
      {error ? <div className="form-alert is-danger attempt-alert" role="alert">{error}</div> : null}

      <nav className="attempt-question-nav" aria-label="أسئلة المحاولة">
        {assessment.questions.map((candidate, index) => (
          <button key={candidate.id} type="button" className={candidate.id === question.id ? "is-active" : ""} aria-current={candidate.id === question.id ? "step" : undefined} aria-label={`السؤال ${index + 1}${candidate.answer ? "، تمت الإجابة" : ""}`} onClick={() => { setError(null); setQuestionId(candidate.id); }}>
            {index + 1}{candidate.answer ? <span aria-hidden="true">✓</span> : null}
          </button>
        ))}
      </nav>

      <article className="attempt-question" data-question-id={question.id}>
        <header><p className="attempt-question__meta">السؤال {currentIndex + 1} من {assessment.questions.length}{question.sourcePage ? ` · صفحة ${question.sourcePage}` : ""}</p><h2>{question.prompt}</h2></header>
        {question.type === "direct" ? (
          <div className="field-group attempt-direct-field">
            <label htmlFor={`direct-answer-${question.id}`}>إجابتك</label>
            <textarea id={`direct-answer-${question.id}`} className="text-input attempt-direct-answer" value={directAnswer} onChange={(event) => setDirectAnswer(event.target.value)} disabled={Boolean(question.feedback) || busy || !online} maxLength={10_000} rows={5} />
          </div>
        ) : (
          <fieldset className="attempt-options" disabled={Boolean(question.feedback) || busy || !online}>
            <legend className="sr-only">اختر إجابة السؤال</legend>
            {question.options.map((option, optionIndex) => (
              <label key={option.id} className={selectedOptionId === option.id ? "is-selected" : ""}>
                <input type="radio" name={`question-${question.id}`} value={option.id} checked={selectedOptionId === option.id} onChange={() => setSelectedOptionId(option.id)} />
                <span className="attempt-option-marker" aria-hidden="true">{optionMarker(optionIndex)}</span>
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
        )}
        {!question.feedback ? <button className="primary-button attempt-primary-action" type="button" onClick={() => void saveAnswer()} disabled={busy || !online}>{busy ? "جاري الحفظ" : assessment.session.mode === "practice" ? "تحقق من إجابتي" : "حفظ الإجابة"}</button> : null}
        <QuestionFeedback question={question} />
      </article>

      <div className="attempt-step-actions">
        <button className="secondary-button" type="button" onClick={() => moveQuestion(-1)} disabled={currentIndex === 0}>السؤال السابق</button>
        <button className="secondary-button" type="button" onClick={() => moveQuestion(1)} disabled={currentIndex >= assessment.questions.length - 1}>السؤال التالي</button>
      </div>

      <footer className="attempt-finish-bar">
        <div><strong>{allAnswered ? "أكملت جميع الأسئلة" : `بقي ${assessment.progress.questionCount - assessment.progress.answeredCount} سؤال`}</strong><small>{allAnswered ? "يمكنك إنهاء المحاولة ومشاهدة النتيجة." : "أجب عن كل الأسئلة قبل الإنهاء."}</small></div>
        <button className="primary-button" type="button" disabled={!allAnswered || busy || !online} onClick={() => void run(() => finalizeStudentAssessment(assessment.session.id))}>{busy ? "جاري الإنهاء" : `إنهاء ${modeLabel(assessment.session.mode)}`}</button>
      </footer>
    </section>
  );
}

export function AttemptPage({ sessionId, online, onSessionExpired, onAttemptChanged }: {
  sessionId: string;
  online: boolean;
  onSessionExpired: () => void;
  onAttemptChanged: () => void;
}) {
  const [state, setState] = useState<AttemptState>({ status: "loading" });

  async function loadAttempt() {
    if (!online) {
      setState((current) => (current.status === "ready" ? current : { status: "offline" }));
      return;
    }
    try {
      setState({ status: "ready", assessment: await getStudentAssessmentSession(sessionId) });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      if (error instanceof ApiRequestError && error.code === "NOT_FOUND") {
        setState({ status: "error", message: studentErrorMessage(error, "assessment"), unavailable: true });
        return;
      }
      setState({ status: "error", message: requestAssessmentMessage(error) });
    }
  }

  useEffect(() => { void loadAttempt(); }, [sessionId, online]);

  if (state.status === "loading") return <div className="attempt-loading" role="status" aria-live="polite" aria-busy="true"><span className="spinner" aria-hidden="true" /><strong>نفتح محاولتك</strong></div>;
  if (state.status === "offline") return <div className="practice-state"><strong>نحتاج اتصالًا لفتح المحاولة</strong><p>أعد الاتصال ثم حاول مرة أخرى.</p><button className="secondary-button" type="button" onClick={() => void loadAttempt()} disabled={!online}>إعادة المحاولة</button></div>;
  if (state.status === "error") return <div className="practice-state practice-state--error" role="alert"><strong>{state.unavailable ? "هذه المحاولة لم تعد متاحة" : "تعذر فتح المحاولة"}</strong><p>{state.message}</p><Link className="secondary-button" to="/app/practice">العودة إلى التدريب</Link></div>;

  return <AssessmentWorkspace
    assessment={state.assessment}
    online={online}
    onSessionExpired={onSessionExpired}
    onChange={(assessment) => {
      const wasCompleted = state.assessment.session.status === "completed";
      setState({ status: "ready", assessment });
      if (!wasCompleted && assessment.session.status === "completed") onAttemptChanged();
    }}
    onUnavailable={(message) => setState({ status: "error", message, unavailable: true })}
  />;
}
