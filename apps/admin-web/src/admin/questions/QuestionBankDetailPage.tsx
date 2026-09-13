import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "../../admin-api";
import {
  type QuestionBankAnswerStatus,
  type QuestionBankDetailResponse,
  type QuestionBankDifficulty,
  type QuestionBankOrigin,
  type QuestionBankQuestionInput,
  type QuestionBankQuestionType,
  type QuestionBankStatus,
  editQuestionBankItem,
  fetchQuestionBankItem,
  publishQuestion,
  rejectQuestionReview,
  submitQuestionForReview,
} from "../../question-bank-api";
import "../../question-bank.css";

interface Props {
  onSessionExpired: () => void;
}

type Feedback = { kind: "success" | "error"; text: string } | null;

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

function statusLabel(status: QuestionBankStatus): string {
  if (status === "draft") return "مسودة";
  if (status === "review") return "قيد المراجعة";
  if (status === "published") return "منشور";
  return "مؤرشف";
}

function typeLabel(type: QuestionBankQuestionType): string {
  if (type === "multiple_choice") return "اختيار متعدد";
  if (type === "true_false") return "صح / خطأ";
  return "سؤال مباشر";
}

function difficultyLabel(value: QuestionBankDifficulty): string {
  if (value === "easy") return "سهل";
  if (value === "hard") return "صعب";
  return "متوسط";
}

function originLabel(origin: QuestionBankOrigin): string {
  return origin === "ai" ? "مساعد بالذكاء الاصطناعي" : "يدوي";
}

function eventLabel(action: string): string {
  if (action === "create") return "إنشاء";
  if (action === "import") return "استيراد";
  if (action === "edit") return "تعديل";
  if (action === "submit_review") return "إرسال للمراجعة";
  if (action === "reject") return "إرجاع للمسودة";
  if (action === "publish") return "نشر";
  if (action === "archive") return "أرشفة";
  return "تحديث";
}

function localDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function validateQuestion(question: QuestionBankQuestionInput): string | null {
  if (!question.prompt.trim()) return "نص السؤال مطلوب.";
  if (question.type === "multiple_choice" && (question.options.length !== 4 || question.options.some((option) => !option.trim()))) {
    return "سؤال الاختيار المتعدد يحتاج أربعة خيارات مكتملة.";
  }
  if (question.type === "true_false" && (question.options[0] !== "صح" || question.options[1] !== "خطأ")) {
    return "سؤال الصح والخطأ يجب أن يستخدم صح وخطأ فقط.";
  }
  if (question.type === "direct" && question.options.length !== 0) return "السؤال المباشر لا يقبل خيارات.";
  if (question.answerStatus === "known") {
    if (question.type === "direct" && !question.answerText?.trim()) return "اكتب الإجابة النصية للسؤال المباشر.";
    if (question.type !== "direct" && question.correctOptionIndex === null) return "اختر الإجابة الصحيحة.";
  }
  return null;
}

function normalizedQuestion(question: QuestionBankQuestionInput): QuestionBankQuestionInput {
  const prompt = question.prompt.trim();
  const options = question.options.map((option) => option.trim());
  const correctOptionIndex = question.answerStatus === "known" ? question.correctOptionIndex : null;
  const answerText =
    question.answerStatus !== "known"
      ? null
      : question.type === "direct"
        ? question.answerText?.trim() || null
        : correctOptionIndex === null
          ? null
          : options[correctOptionIndex] ?? null;
  return {
    ...question,
    prompt,
    options,
    correctOptionIndex,
    answerText,
    explanation: question.explanation?.trim() || null,
    method: question.method?.trim() || null,
  };
}

export function QuestionBankDetailPage({ onSessionExpired }: Props) {
  const { questionId } = useParams<{ questionId: string }>();
  const [detail, setDetail] = useState<QuestionBankDetailResponse | null>(null);
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [questionDraft, setQuestionDraft] = useState<QuestionBankQuestionInput | null>(null);

  const load = useCallback(async () => {
    if (!questionId) {
      setError("معرّف السؤال غير موجود في الرابط.");
      setState("error");
      return;
    }
    setState("loading");
    setError("");
    try {
      const [question, curriculumSnapshot] = await Promise.all([
        fetchQuestionBankItem(questionId),
        fetchAdminCurriculum(),
      ]);
      setDetail(question);
      setCurriculum(curriculumSnapshot);
      setState("ready");
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setError(messageFor(cause));
      setState("error");
    }
  }, [onSessionExpired, questionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const lessonNames = useMemo(
    () => new Map(curriculum?.lessons.map((lesson) => [lesson.id, lesson.title]) ?? []),
    [curriculum],
  );
  const revision = detail?.revisions[0] ?? null;

  function beginEdit() {
    if (!revision || revision.status === "review") return;
    setQuestionDraft({ ...revision.question, options: [...revision.question.options] });
    setFeedback(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setQuestionDraft(null);
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!questionId || !revision || !questionDraft || revision.status === "review") return;
    const validation = validateQuestion(questionDraft);
    if (validation) {
      setFeedback({ kind: "error", text: validation });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await editQuestionBankItem(questionId, normalizedQuestion(questionDraft));
      setFeedback({ kind: "success", text: "حُفظ التعديل في نسخة مسودة جديدة مع إبقاء النسخ السابقة محفوظة." });
      cancelEdit();
      await load();
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", text: messageFor(cause) });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function lifecycle(action: "submit" | "publish" | "reject") {
    if (!questionId || !revision) return;
    if (action === "reject" && !rejectNote.trim()) {
      setFeedback({ kind: "error", text: "اكتب سبب إعادة السؤال إلى المسودة." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      if (action === "submit") await submitQuestionForReview(questionId);
      else if (action === "publish") await publishQuestion(questionId);
      else await rejectQuestionReview(questionId, rejectNote);
      setRejectNote("");
      setFeedback({
        kind: "success",
        text:
          action === "submit"
            ? "أُرسل السؤال للمراجعة."
            : action === "publish"
              ? "نُشرت النسخة التي كانت قيد المراجعة."
              : "أُعيد السؤال إلى المسودة مع حفظ سبب القرار.",
      });
      await load();
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", text: messageFor(cause) });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="question-bank" aria-labelledby="question-detail-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">بنك الأسئلة</p>
          <h1 id="question-detail-title">تفاصيل السؤال</h1>
          <p className="page-description">راجع المحتوى والسياق وحالة المراجعة وعدّل السؤال من مساره نفسه دون إظهار المعرفات التقنية في سير العمل الطبيعي.</p>
        </div>
        <div className="qb-header-actions">
          <Link className="secondary-button workspace-related-link" to="/app/questions">العودة إلى بنك الأسئلة</Link>
          <button className="secondary-button" type="button" onClick={() => void load()} disabled={state === "loading" || busy}>تحديث</button>
        </div>
      </header>

      {feedback ? <div className={`mutation-feedback is-${feedback.kind}`} role="status">{feedback.text}</div> : null}
      {state === "loading" ? <div className="state-panel"><h2>جارٍ تحميل السؤال</h2><p>نقرأ أحدث نسخة وسجل القرارات من الخادم.</p></div> : null}
      {state === "error" ? (
        <div className="state-panel" role="alert">
          <h2>تعذر فتح السؤال</h2>
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => void load()}>إعادة المحاولة</button>
        </div>
      ) : null}

      {state === "ready" && detail && revision ? (
        <div className="qb-detail" data-testid="question-detail-page">
          <div className="qb-detail-heading">
            <div>
              <p className="section-kicker">النسخة الحالية #{revision.revisionNumber}</p>
              <h2>{revision.question.prompt}</h2>
            </div>
            <span className={`status-badge qb-status-${revision.status}`}>{statusLabel(revision.status)}</span>
          </div>

          {isEditing && questionDraft ? (
            <section className="qb-editor-panel" aria-labelledby="question-edit-title" data-testid="question-detail-editor">
              <div className="qb-editor-heading">
                <div>
                  <h2 id="question-edit-title">إنشاء نسخة معدلة</h2>
                  <p className="qb-editor-note">التعديل لا يغيّر النسخة السابقة؛ الخادم ينشئ revision جديدة قابلة للمراجعة.</p>
                </div>
                <button className="secondary-button small-button" type="button" onClick={cancelEdit} disabled={busy}>إغلاق</button>
              </div>
              <form className="qb-editor-form" onSubmit={submitEdit}>
                <QuestionFields question={questionDraft} setQuestion={setQuestionDraft} />
                <div className="qb-form-actions">
                  <button className="secondary-button" type="button" onClick={cancelEdit} disabled={busy}>إلغاء</button>
                  <button className="primary-button" type="submit" disabled={busy}>حفظ النسخة الجديدة</button>
                </div>
              </form>
            </section>
          ) : (
            <section className="qb-question-content" aria-label="محتوى السؤال">
              <dl className="qb-facts">
                <div><dt>النوع</dt><dd>{typeLabel(revision.question.type)}</dd></div>
                <div><dt>الصعوبة</dt><dd>{difficultyLabel(revision.question.difficulty)}</dd></div>
                <div><dt>المصدر</dt><dd>{originLabel(detail.item.origin)}</dd></div>
                <div><dt>حالة الإجابة</dt><dd>{revision.question.answerStatus === "known" ? "إجابة محسومة" : "تحتاج مراجعة"}</dd></div>
              </dl>
              {revision.question.options.length > 0 ? (
                <ol className="qb-options">
                  {revision.question.options.map((option, index) => (
                    <li className={revision.question.correctOptionIndex === index ? "is-correct" : ""} key={`${index}-${option}`}>{option}</li>
                  ))}
                </ol>
              ) : null}
              {revision.question.answerText ? <p className="qb-answer"><strong>الإجابة:</strong> {revision.question.answerText}</p> : null}
              {revision.question.explanation ? <p><strong>التوضيح:</strong> {revision.question.explanation}</p> : null}
              {revision.question.method ? <p><strong>طريقة الحل:</strong> {revision.question.method}</p> : null}
            </section>
          )}

          {!isEditing ? (
            <section className="qb-lifecycle-actions" aria-label="إجراءات حالة السؤال">
              {revision.status === "draft" ? <button className="primary-button" type="button" disabled={busy} onClick={() => void lifecycle("submit")}>إرسال للمراجعة</button> : null}
              {revision.status !== "review" ? <button className="secondary-button" type="button" disabled={busy} onClick={beginEdit}>إنشاء نسخة معدلة</button> : null}
              {revision.status === "review" ? (
                <>
                  <button className="primary-button" type="button" disabled={busy} onClick={() => void lifecycle("publish")}>نشر النسخة</button>
                  <label className="qb-reject-field">
                    <span>سبب الإرجاع</span>
                    <textarea rows={2} value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} placeholder="سبب واضح للمراجعة اللاحقة" />
                  </label>
                  <button className="secondary-button" type="button" disabled={busy || !rejectNote.trim()} onClick={() => void lifecycle("reject")}>إرجاع للمسودة</button>
                </>
              ) : null}
            </section>
          ) : null}

          <details className="qb-evidence" open>
            <summary>السياق والمصدر</summary>
            <div className="qb-evidence-body">
              <div>
                <h3>الدروس المرتبطة</h3>
                {revision.lessonIds.length > 0 ? <ul>{revision.lessonIds.map((id) => <li key={id}>{lessonNames.get(id) ?? "درس مرتبط"}</li>)}</ul> : <p>لا يوجد درس مرتبط.</p>}
              </div>
              <div>
                <h3>إثبات المصدر</h3>
                {revision.sources.length > 0 ? (
                  <div className="qb-source-list">
                    {revision.sources.map((source) => (
                      <article key={`${source.position}-${source.pageNumber}`}>
                        <strong>صفحة {source.pageNumber}</strong>
                        {source.quote ? <p>«{source.quote}»</p> : <p>مرجع مصدر محفوظ لهذا السؤال.</p>}
                      </article>
                    ))}
                  </div>
                ) : <p>سؤال يدوي بلا مصدر آلي محفوظ.</p>}
              </div>
            </div>
          </details>

          <details className="qb-evidence">
            <summary>سجل النسخ ({detail.revisionPagination.total})</summary>
            <div className="qb-timeline">
              {detail.revisions.map((entry) => (
                <article key={entry.id}>
                  <div><strong>نسخة #{entry.revisionNumber}</strong><span className={`status-badge qb-status-${entry.status}`}>{statusLabel(entry.status)}</span></div>
                  <p>{entry.question.prompt}</p>
                  <small>أُنشئت {localDate(entry.createdAt)} · النشر {localDate(entry.publishedAt)}</small>
                </article>
              ))}
            </div>
          </details>

          <details className="qb-evidence">
            <summary>سجل القرارات ({detail.eventPagination.total})</summary>
            <div className="qb-timeline">
              {detail.events.map((event) => (
                <article key={event.id}>
                  <strong>{eventLabel(event.action)}</strong>
                  <p>{event.note ?? "بدون ملاحظة"}</p>
                  <small>{localDate(event.createdAt)}</small>
                </article>
              ))}
            </div>
          </details>
        </div>
      ) : null}
    </section>
  );
}

function QuestionFields({
  question,
  setQuestion,
}: {
  question: QuestionBankQuestionInput;
  setQuestion: React.Dispatch<React.SetStateAction<QuestionBankQuestionInput | null>>;
}) {
  function changeType(type: QuestionBankQuestionType) {
    setQuestion((current) => {
      if (!current) return current;
      if (type === "multiple_choice") {
        return { ...current, type, options: ["", "", "", ""], correctOptionIndex: 0, answerText: "" };
      }
      if (type === "true_false") {
        return { ...current, type, options: ["صح", "خطأ"], correctOptionIndex: 0, answerText: "صح" };
      }
      return { ...current, type, options: [], correctOptionIndex: null, answerText: current.answerStatus === "known" ? "" : null };
    });
  }

  function changeAnswerStatus(answerStatus: QuestionBankAnswerStatus) {
    setQuestion((current) => {
      if (!current) return current;
      if (answerStatus !== "known") return { ...current, answerStatus, correctOptionIndex: null, answerText: null };
      if (current.type === "direct") return { ...current, answerStatus, correctOptionIndex: null, answerText: "" };
      const correctOptionIndex = 0;
      return { ...current, answerStatus, correctOptionIndex, answerText: current.options[correctOptionIndex] ?? "" };
    });
  }

  function updateOption(index: number, value: string) {
    setQuestion((current) => {
      if (!current) return current;
      const options = [...current.options];
      options[index] = value;
      return {
        ...current,
        options,
        answerText: current.answerStatus === "known" && current.correctOptionIndex === index ? value : current.answerText,
      };
    });
  }

  return (
    <fieldset className="qb-question-fields">
      <legend>محتوى السؤال</legend>
      <label className="qb-wide-field">
        <span>نص السؤال</span>
        <textarea value={question.prompt} onChange={(event) => setQuestion((current) => current ? { ...current, prompt: event.target.value } : current)} rows={3} />
      </label>
      <label>
        <span>النوع</span>
        <select value={question.type} onChange={(event) => changeType(event.target.value as QuestionBankQuestionType)}>
          <option value="multiple_choice">اختيار متعدد</option>
          <option value="true_false">صح / خطأ</option>
          <option value="direct">سؤال مباشر</option>
        </select>
      </label>
      <label>
        <span>الصعوبة</span>
        <select value={question.difficulty} onChange={(event) => setQuestion((current) => current ? { ...current, difficulty: event.target.value as QuestionBankDifficulty } : current)}>
          <option value="easy">سهل</option>
          <option value="medium">متوسط</option>
          <option value="hard">صعب</option>
        </select>
      </label>
      <label>
        <span>حالة الإجابة</span>
        <select value={question.answerStatus} onChange={(event) => changeAnswerStatus(event.target.value as QuestionBankAnswerStatus)}>
          <option value="known">محسومة</option>
          <option value="review_required">تحتاج مراجعة</option>
          <option value="unknown">غير معروفة</option>
        </select>
      </label>

      {question.type !== "direct" ? (
        <div className="qb-options-editor">
          <span>الخيارات</span>
          {question.options.map((option, index) => (
            <div className="qb-option-row" key={index}>
              <input
                aria-label={`الخيار ${index + 1}`}
                value={option}
                disabled={question.type === "true_false"}
                onChange={(event) => updateOption(index, event.target.value)}
              />
              {question.answerStatus === "known" ? (
                <label className="qb-correct-choice">
                  <input
                    type="radio"
                    name="detail-correct-option"
                    checked={question.correctOptionIndex === index}
                    onChange={() => setQuestion((current) => current ? { ...current, correctOptionIndex: index, answerText: current.options[index] ?? "" } : current)}
                  />
                  <span>الصحيح</span>
                </label>
              ) : null}
            </div>
          ))}
        </div>
      ) : question.answerStatus === "known" ? (
        <label className="qb-wide-field">
          <span>الإجابة النصية</span>
          <textarea value={question.answerText ?? ""} onChange={(event) => setQuestion((current) => current ? { ...current, answerText: event.target.value } : current)} rows={2} />
        </label>
      ) : null}

      <label className="qb-wide-field">
        <span>التوضيح (اختياري)</span>
        <textarea value={question.explanation ?? ""} onChange={(event) => setQuestion((current) => current ? { ...current, explanation: event.target.value || null } : current)} rows={2} />
      </label>
      <label className="qb-wide-field">
        <span>طريقة الحل (اختياري)</span>
        <textarea value={question.method ?? ""} onChange={(event) => setQuestion((current) => current ? { ...current, method: event.target.value || null } : current)} rows={2} />
      </label>
    </fieldset>
  );
}
