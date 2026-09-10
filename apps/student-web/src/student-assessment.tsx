import { useEffect, useMemo, useState } from "react";
import {
  abandonStudentAssessment,
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
import "./assessment.css";

type AssessmentCatalogState =
  | { status: "loading"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "ready"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "offline"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "error"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[]; message: string };

function requestMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل التدريبات والاختبارات. حاول مرة أخرى.";
}

function modeLabel(mode: StudentAssessmentMode): string {
  return mode === "practice" ? "تدريب" : "اختبار";
}

function scoreLabel(value: number): string {
  return `${new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 2 }).format(value)}٪`;
}

function attemptDate(value: string): string {
  return new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function QuizCard({
  quiz,
  online,
  busy,
  onStart,
}: {
  quiz: StudentAssessmentCatalogItem;
  online: boolean;
  busy: boolean;
  onStart: (mode: StudentAssessmentMode, versionId?: string) => void;
}) {
  const [versionId, setVersionId] = useState(() => (quiz.shuffleVersions ? "" : (quiz.versions[0]?.id ?? "")));
  const selectedVersion = quiz.versions.find((version) => version.id === versionId) ?? null;

  return (
    <article className="assessment-card" data-quiz-id={quiz.id}>
      <div className="assessment-card-heading">
        <div>
          <p className="eyebrow">
            {quiz.className} · {quiz.subjectName}
          </p>
          <h3>{quiz.title}</h3>
          {quiz.description ? <p>{quiz.description}</p> : null}
        </div>
        <span className="assessment-version-count">{quiz.versions.length} نموذج</span>
      </div>

      {quiz.versions.length > 1 ? (
        <div className="field-group assessment-version-field">
          <label htmlFor={`assessment-version-${quiz.id}`}>النموذج</label>
          <select
            id={`assessment-version-${quiz.id}`}
            className="text-input"
            value={versionId}
            onChange={(event) => setVersionId(event.target.value)}
          >
            {quiz.shuffleVersions ? <option value="">اختيار تلقائي عند البدء</option> : null}
            {quiz.versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label}
              </option>
            ))}
          </select>
          <p className="field-hint">
            {versionId
              ? `سيُستخدم ${selectedVersion?.label ?? "النموذج المحدد"}.`
              : "يختار الخادم نموذجًا متاحًا ويثبته داخل الجلسة حتى عند الاستئناف."}
          </p>
        </div>
      ) : (
        <p className="assessment-single-version">{quiz.versions[0]?.label ?? "نموذج واحد متاح"}</p>
      )}

      <div className="assessment-card-actions">
        <button
          className="primary-button"
          type="button"
          disabled={!online || busy || quiz.versions.length === 0}
          onClick={() => onStart("practice", versionId || undefined)}
        >
          {busy ? "جاري الفتح" : "بدء تدريب"}
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={!online || busy || quiz.versions.length === 0}
          onClick={() => onStart("test", versionId || undefined)}
        >
          {busy ? "جاري الفتح" : "بدء اختبار"}
        </button>
      </div>
    </article>
  );
}

function QuestionFeedback({ question }: { question: StudentAssessmentQuestion }) {
  if (!question.feedback) return null;
  const correctOption = question.feedback.correctOptionId
    ? question.options.find((option) => option.id === question.feedback?.correctOptionId)
    : null;

  return (
    <div
      className={`assessment-feedback ${question.feedback.correct ? "is-correct" : "is-incorrect"}`}
      role="status"
      aria-live="polite"
    >
      <strong>{question.feedback.correct ? "إجابة صحيحة" : "تحتاج مراجعة"}</strong>
      {!question.feedback.correct && correctOption ? <p>الإجابة الصحيحة: {correctOption.label}</p> : null}
      {!question.feedback.correct && question.feedback.correctAnswerText ? (
        <p>الإجابة المعتمدة: {question.feedback.correctAnswerText}</p>
      ) : null}
      {question.feedback.explanation ? <p>{question.feedback.explanation}</p> : null}
      {question.feedback.method ? <p className="assessment-method">الطريقة: {question.feedback.method}</p> : null}
    </div>
  );
}

function AssessmentWorkspace({
  assessment,
  online,
  onChange,
  onBack,
  onSessionExpired,
}: {
  assessment: StudentAssessmentSession;
  online: boolean;
  onChange: (next: StudentAssessmentSession) => void;
  onBack: () => void;
  onSessionExpired: () => void;
}) {
  const [questionId, setQuestionId] = useState(
    assessment.session.currentQuestionId ?? assessment.questions[0]?.id ?? "",
  );
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [directAnswer, setDirectAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = Math.max(
    0,
    assessment.questions.findIndex((question) => question.id === questionId),
  );
  const question = assessment.questions[currentIndex] ?? assessment.questions[0] ?? null;
  const completed = assessment.session.status === "completed";
  const allAnswered = assessment.progress.answeredCount === assessment.progress.questionCount;

  useEffect(() => {
    const active = assessment.questions.find((candidate) => candidate.id === questionId) ?? assessment.questions[0] ?? null;
    setSelectedOptionId(active?.answer?.selectedOptionId ?? "");
    setDirectAnswer(active?.answer?.directAnswerText ?? "");
  }, [assessment.questions, questionId]);

  useEffect(() => {
    if (assessment.session.currentQuestionId && !questionId) setQuestionId(assessment.session.currentQuestionId);
  }, [assessment.session.currentQuestionId, questionId]);

  async function run(action: () => Promise<StudentAssessmentSession>) {
    if (busy || !online) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
    } catch (requestError) {
      if (isMissingSessionError(requestError)) {
        onSessionExpired();
        return;
      }
      setError(requestMessage(requestError));
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
      await run(() =>
        answerStudentAssessmentQuestion(assessment.session.id, question.id, { directAnswerText: value }),
      );
      return;
    }
    if (!selectedOptionId) {
      setError("اختر إجابة قبل الحفظ.");
      return;
    }
    await run(() =>
      answerStudentAssessmentQuestion(assessment.session.id, question.id, { selectedOptionId }),
    );
  }

  function moveQuestion(direction: -1 | 1) {
    const next = assessment.questions[currentIndex + direction];
    if (!next) return;
    setError(null);
    setQuestionId(next.id);
  }

  async function restart() {
    if (!online || busy) return;
    const confirmed = window.confirm("سيتم ترك الجلسة الحالية وبدء محاولة جديدة من النموذج نفسه. هل تريد المتابعة؟");
    if (!confirmed) return;
    await run(() =>
      startStudentAssessment(assessment.quiz.id, {
        mode: assessment.session.mode,
        versionId: assessment.version.id,
        restart: true,
      }),
    );
  }

  if (!question) {
    return (
      <div className="empty-state">
        <strong>لا توجد أسئلة في هذه الجلسة</strong>
        <p>عد إلى قائمة الاختبارات واختر اختبارًا آخر.</p>
        <button className="secondary-button" type="button" onClick={onBack}>
          العودة إلى الاختبارات
        </button>
      </div>
    );
  }

  return (
    <section className="assessment-workspace" aria-labelledby="assessment-workspace-title">
      <div className="assessment-workspace-toolbar">
        <button className="text-button" type="button" onClick={onBack}>
          العودة إلى التدريبات والاختبارات
        </button>
        <button className="text-button" type="button" onClick={() => void restart()} disabled={!online || busy}>
          إعادة المحاولة
        </button>
      </div>

      <header className="assessment-workspace-heading">
        <p className="eyebrow">
          {modeLabel(assessment.session.mode)} · {assessment.version.label}
        </p>
        <h3 id="assessment-workspace-title">{assessment.quiz.title}</h3>
        <p>
          أُجيب عن {assessment.progress.answeredCount} من {assessment.progress.questionCount} سؤال.
          {assessment.session.mode === "test" && !completed ? " لن تظهر صحة الإجابات قبل إنهاء الاختبار." : ""}
        </p>
      </header>

      {!online ? (
        <div className="form-alert is-warning" role="status">
          انقطع الاتصال. ستبقى هذه الجلسة ظاهرة في الذاكرة الحالية، لكن لن نحفظ إجابة أو ننهي محاولة حتى يعود الاتصال.
        </div>
      ) : null}
      {error ? (
        <div className="form-alert is-danger" role="alert">
          {error}
        </div>
      ) : null}

      {assessment.attempt ? (
        <div className="assessment-result" role="status" aria-live="polite">
          <span>{scoreLabel(assessment.attempt.scorePercent)}</span>
          <div>
            <strong>نتيجة {modeLabel(assessment.attempt.mode)}</strong>
            <p>
              {assessment.attempt.correctCount} صحيحة من {assessment.attempt.questionCount} سؤال · {assessment.version.label}
            </p>
          </div>
        </div>
      ) : null}

      <nav className="assessment-question-nav" aria-label="أسئلة المحاولة">
        {assessment.questions.map((candidate, index) => (
          <button
            key={candidate.id}
            type="button"
            className={candidate.id === question.id ? "is-active" : ""}
            aria-current={candidate.id === question.id ? "step" : undefined}
            aria-label={`السؤال ${index + 1}${candidate.answer ? "، تمت الإجابة" : ""}`}
            onClick={() => {
              setError(null);
              setQuestionId(candidate.id);
            }}
          >
            {index + 1}
            {candidate.answer ? <span aria-hidden="true">✓</span> : null}
          </button>
        ))}
      </nav>

      <article className="assessment-question" data-question-id={question.id}>
        <header>
          <p className="assessment-question-meta">
            السؤال {currentIndex + 1} من {assessment.questions.length}
            {question.sourcePage ? ` · صفحة ${question.sourcePage}` : ""}
          </p>
          <h4>{question.prompt}</h4>
        </header>

        {question.type === "direct" ? (
          <div className="field-group">
            <label htmlFor={`direct-answer-${question.id}`}>إجابتك</label>
            <textarea
              id={`direct-answer-${question.id}`}
              className="text-input assessment-direct-answer"
              value={directAnswer}
              onChange={(event) => setDirectAnswer(event.target.value)}
              disabled={completed || Boolean(question.feedback) || busy || !online}
              maxLength={10_000}
              rows={4}
            />
          </div>
        ) : (
          <fieldset className="assessment-options" disabled={completed || Boolean(question.feedback) || busy || !online}>
            <legend className="sr-only">اختر إجابة السؤال</legend>
            {question.options.map((option) => (
              <label key={option.id} className={selectedOptionId === option.id ? "is-selected" : ""}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
        )}

        {!completed && !question.feedback ? (
          <button className="primary-button assessment-save-answer" type="button" onClick={() => void saveAnswer()} disabled={busy || !online}>
            {busy ? "جاري الحفظ" : assessment.session.mode === "practice" ? "حفظ وعرض النتيجة" : "حفظ الإجابة"}
          </button>
        ) : null}

        <QuestionFeedback question={question} />
      </article>

      <div className="assessment-navigation-actions">
        <button className="secondary-button" type="button" onClick={() => moveQuestion(-1)} disabled={currentIndex === 0}>
          السؤال السابق
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => moveQuestion(1)}
          disabled={currentIndex >= assessment.questions.length - 1}
        >
          السؤال التالي
        </button>
      </div>

      {!completed ? (
        <div className="assessment-finish">
          <div>
            <strong>{allAnswered ? "كل الإجابات محفوظة" : "أكمل جميع الأسئلة قبل الإنهاء"}</strong>
            <p>
              {assessment.session.mode === "test"
                ? "بعد الإنهاء يحسب الخادم النتيجة ويعرض التصحيح والتفسير."
                : "إنهاء التدريب يحفظ النتيجة في سجل محاولاتك."}
            </p>
          </div>
          <button
            className="primary-button"
            type="button"
            disabled={!allAnswered || busy || !online}
            onClick={() => void run(() => finalizeStudentAssessment(assessment.session.id))}
          >
            {busy ? "جاري الإنهاء" : `إنهاء ${modeLabel(assessment.session.mode)}`}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function StudentAssessmentSection({
  online,
  refreshKey,
  onSessionExpired,
}: {
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const [state, setState] = useState<AssessmentCatalogState>({ status: "loading", quizzes: [], attempts: [] });
  const [activeAssessment, setActiveAssessment] = useState<StudentAssessmentSession | null>(null);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [busyQuizId, setBusyQuizId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    if (!online) {
      setState((current) => ({ ...current, status: "offline" }));
      return;
    }
    setState((current) => ({ ...current, status: "loading" }));
    try {
      const [quizzes, attempts] = await Promise.all([listStudentQuizzes(), listStudentAttempts(8)]);
      setState({ status: "ready", quizzes, attempts });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState((current) => ({ ...current, status: "error", message: requestMessage(error) }));
    }
  }

  useEffect(() => {
    void load();
  }, [online, refreshKey]);

  useEffect(() => {
    if (!online || !activeAssessment || activeAssessment.session.status !== "in_progress") return;
    void getStudentAssessmentSession(activeAssessment.session.id)
      .then((next) => setActiveAssessment(next))
      .catch((error: unknown) => {
        if (isMissingSessionError(error)) onSessionExpired();
        else setActionError(requestMessage(error));
      });
  }, [online]);

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
  const visibleQuizzes = state.quizzes.filter(
    (quiz) => (!classId || quiz.classId === classId) && (!subjectId || quiz.subjectId === subjectId),
  );

  async function start(quiz: StudentAssessmentCatalogItem, mode: StudentAssessmentMode, versionId?: string) {
    if (!online || busyQuizId) return;
    setBusyQuizId(quiz.id);
    setActionError(null);
    try {
      const input = versionId ? { mode, versionId } : { mode };
      setActiveAssessment(await startStudentAssessment(quiz.id, input));
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setActionError(requestMessage(error));
    } finally {
      setBusyQuizId(null);
    }
  }

  function applyAssessment(next: StudentAssessmentSession) {
    setActiveAssessment(next);
    if (!next.attempt) return;
    setState((current) => {
      const attempts = [next.attempt as StudentAssessmentAttempt, ...current.attempts.filter((item) => item.id !== next.attempt?.id)].slice(0, 8);
      return { ...current, attempts };
    });
  }

  if (activeAssessment) {
    return (
      <section className="assessment-surface" aria-labelledby="assessment-title">
        <h2 className="sr-only" id="assessment-title">
          التدريبات والاختبارات
        </h2>
        <AssessmentWorkspace
          assessment={activeAssessment}
          online={online}
          onSessionExpired={onSessionExpired}
          onChange={applyAssessment}
          onBack={() => {
            setActiveAssessment(null);
            setActionError(null);
          }}
        />
      </section>
    );
  }

  return (
    <section className="assessment-surface" aria-labelledby="assessment-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">طبّق ما تعلمته</p>
          <h2 id="assessment-title">التدريبات والاختبارات</h2>
        </div>
        <button className="text-button" type="button" onClick={() => void load()} disabled={!online || state.status === "loading"}>
          تحديث
        </button>
      </div>
      <p className="assessment-intro">
        التدريب يعطيك التصحيح بعد كل إجابة. الاختبار يحفظ إجاباتك ويعرض النتيجة والتصحيح بعد الإنهاء.
      </p>

      {!online ? (
        <div className="form-alert is-warning" role="status">
          يلزم اتصال لبدء أو استئناف محاولة والتحقق من صلاحية الاختبار. دعم الاختبارات دون اتصال يأتي ضمن مرحلة المزامنة المخصصة.
        </div>
      ) : null}
      {actionError ? (
        <div className="form-alert is-danger" role="alert">
          {actionError}
        </div>
      ) : null}

      {state.status === "loading" && state.quizzes.length === 0 ? (
        <div className="assessment-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري تحميل التدريبات والاختبارات</span>
          <span />
          <span />
        </div>
      ) : state.status === "error" && state.quizzes.length === 0 ? (
        <div className="access-error" role="alert">
          <div className="form-alert is-danger">{state.message}</div>
          <button className="secondary-button" type="button" onClick={() => void load()} disabled={!online}>
            إعادة المحاولة
          </button>
        </div>
      ) : state.quizzes.length === 0 ? (
        <div className="empty-state">
          <strong>لا توجد تدريبات أو اختبارات منشورة ضمن صلاحياتك الآن</strong>
          <p>ستظهر هنا فقط النماذج المنشورة المرتبطة بصفوفك وموادك المتاحة.</p>
        </div>
      ) : (
        <>
          <div className="assessment-filters" aria-label="تصفية التدريبات والاختبارات">
            <div className="field-group">
              <label htmlFor="assessment-class-filter">الصف</label>
              <select
                id="assessment-class-filter"
                className="text-input"
                value={classId}
                onChange={(event) => {
                  setClassId(event.target.value);
                  setSubjectId("");
                }}
              >
                <option value="">كل الصفوف المتاحة</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="assessment-subject-filter">المادة</label>
              <select
                id="assessment-subject-filter"
                className="text-input"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
              >
                <option value="">كل المواد المتاحة</option>
                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visibleQuizzes.length === 0 ? (
            <div className="empty-state">
              <strong>لا توجد نتائج ضمن هذا الاختيار</strong>
              <p>غيّر الصف أو المادة لعرض اختبارات أخرى ضمن صلاحياتك.</p>
            </div>
          ) : (
            <div className="assessment-grid">
              {visibleQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  online={online}
                  busy={busyQuizId === quiz.id}
                  onStart={(mode, versionId) => void start(quiz, mode, versionId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {state.attempts.length > 0 ? (
        <section className="assessment-history" aria-labelledby="assessment-history-title">
          <div className="assessment-history-heading">
            <h3 id="assessment-history-title">آخر المحاولات</h3>
            <span>{state.attempts.length} محاولة</span>
          </div>
          <ul>
            {state.attempts.map((attempt) => (
              <li key={attempt.id}>
                <div>
                  <strong>{attempt.quizTitle}</strong>
                  <span>
                    {modeLabel(attempt.mode)} · {attempt.versionLabel} · {attemptDate(attempt.completedAt)}
                  </span>
                </div>
                <b>{scoreLabel(attempt.scorePercent)}</b>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
