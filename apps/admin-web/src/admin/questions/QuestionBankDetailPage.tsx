import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "../../admin-api";
import {
  type QuestionBankDetailResponse,
  type QuestionBankDifficulty,
  type QuestionBankOrigin,
  type QuestionBankQuestionType,
  type QuestionBankStatus,
  fetchQuestionBankItem,
  publishQuestion,
  rejectQuestionReview,
  submitQuestionForReview,
} from "../../question-bank-api";
import "../../question-bank.css";

interface Props {
  onSessionExpired: () => void;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل السؤال. أعد المحاولة.";
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

export function QuestionBankDetailPage({ onSessionExpired }: Props) {
  const { questionId } = useParams<{ questionId: string }>();
  const [detail, setDetail] = useState<QuestionBankDetailResponse | null>(null);
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rejectNote, setRejectNote] = useState("");

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

  async function lifecycle(action: "submit" | "publish" | "reject") {
    if (!questionId || !revision) return;
    if (action === "reject" && !rejectNote.trim()) {
      setFeedback("اكتب سبب إعادة السؤال إلى المسودة.");
      return;
    }
    setBusy(true);
    setFeedback("");
    try {
      if (action === "submit") await submitQuestionForReview(questionId);
      else if (action === "publish") await publishQuestion(questionId);
      else await rejectQuestionReview(questionId, rejectNote);
      setRejectNote("");
      setFeedback(
        action === "submit"
          ? "أُرسل السؤال للمراجعة."
          : action === "publish"
            ? "نُشرت النسخة التي كانت قيد المراجعة."
            : "أُعيد السؤال إلى المسودة مع حفظ سبب القرار.",
      );
      await load();
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setFeedback(messageFor(cause));
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
          <p className="page-description">راجع المحتوى والسياق وحالة المراجعة دون إظهار المعرفات التقنية في مسار العمل الطبيعي.</p>
        </div>
        <div className="qb-header-actions">
          <Link className="secondary-button workspace-related-link" to="/app/questions">العودة إلى بنك الأسئلة</Link>
          <button className="secondary-button" type="button" onClick={() => void load()} disabled={state === "loading"}>تحديث</button>
        </div>
      </header>

      {feedback ? <div className="mutation-feedback is-success" role="status">{feedback}</div> : null}
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

          <section className="qb-lifecycle-actions" aria-label="إجراءات حالة السؤال">
            {revision.status === "draft" ? <button className="primary-button" type="button" disabled={busy} onClick={() => void lifecycle("submit")}>إرسال للمراجعة</button> : null}
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
