import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type QuizBuilderDetail,
  type QuizBuilderStatus,
  archiveQuiz,
  fetchQuiz,
  fetchQuizVersionExport,
  publishQuiz,
  rejectQuizReview,
  submitQuizForReview,
} from "../../quiz-builder-api";
import "../../quiz-builder.css";

interface Props {
  onSessionExpired: () => void;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

function statusLabel(status: QuizBuilderStatus): string {
  if (status === "draft") return "مسودة";
  if (status === "review") return "قيد المراجعة";
  if (status === "published") return "منشور";
  return "مؤرشف";
}

function localDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function QuizBuilderDetailPage({ onSessionExpired }: Props) {
  const { quizId } = useParams<{ quizId: string }>();
  const [detail, setDetail] = useState<QuizBuilderDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [mutationState, setMutationState] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const loadDetail = useCallback(async () => {
    if (!quizId) {
      setError("معرّف الاختبار غير موجود في الرابط.");
      setState("error");
      return;
    }

    setState("loading");
    setError("");
    try {
      setDetail(await fetchQuiz(quizId));
      setState("ready");
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setError(messageFor(cause));
      setState("error");
    }
  }, [onSessionExpired, quizId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function lifecycle(action: "submit" | "publish" | "reject" | "archive") {
    if (!quizId || !detail) return;
    if (action === "reject" && !rejectNote.trim()) {
      setFeedback({ kind: "error", text: "اكتب سبب إعادة الاختبار من المراجعة إلى المسودة." });
      return;
    }

    setMutationState("saving");
    setFeedback(null);
    try {
      if (action === "submit") await submitQuizForReview(quizId);
      else if (action === "publish") await publishQuiz(quizId);
      else if (action === "reject") await rejectQuizReview(quizId, rejectNote);
      else await archiveQuiz(quizId);

      setRejectNote("");
      setFeedback({
        kind: "success",
        text:
          action === "submit"
            ? "أُرسل الاختبار للمراجعة."
            : action === "publish"
              ? "تم نشر الاختبار. أصبحت النماذج snapshots ثابتة وغير قابلة للتعديل."
              : action === "reject"
                ? "أُعيد الاختبار إلى المسودة مع حفظ سبب القرار."
                : "تمت أرشفة الاختبار.",
      });
      await loadDetail();
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function exportVersion(versionId: string, format: "csv" | "print") {
    if (!quizId) return;
    const printWindow = format === "print" ? window.open("", "_blank") : null;
    setMutationState("saving");
    setFeedback(null);
    try {
      const bundle = await fetchQuizVersionExport(quizId, versionId);
      if (format === "csv") {
        const blob = new Blob([bundle.csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${bundle.filenameBase}.csv`;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setFeedback({ kind: "success", text: "تم تجهيز ملف Excel CSV من النموذج المحدد." });
      } else {
        if (!printWindow) throw new Error("print window unavailable");
        printWindow.document.open();
        printWindow.document.write(bundle.printHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setFeedback({ kind: "success", text: "فُتحت نسخة الطباعة؛ يمكن طباعتها أو حفظها PDF." });
      }
    } catch (cause) {
      printWindow?.close();
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  if (state === "loading") {
    return <StatePanel title="جارٍ تحميل الاختبار" body="نقرأ تفاصيل الاختبار ونماذجه من الخادم." />;
  }

  if (state === "error" || !detail) {
    return (
      <StatePanel
        title="تعذر فتح الاختبار"
        body={error || "لا توجد بيانات متاحة لهذا الاختبار."}
        action={
          <div className="qz-header-actions">
            <button className="secondary-button" type="button" onClick={() => void loadDetail()}>
              إعادة المحاولة
            </button>
            <Link className="secondary-button" to="/app/quizzes">
              العودة إلى الاختبارات
            </Link>
          </div>
        }
      />
    );
  }

  const { quiz, lessons, versions, events } = detail;
  const busy = mutationState === "saving";

  return (
    <section className="quiz-builder" aria-labelledby="quiz-builder-detail-title">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">الاختبارات</p>
          <h1 id="quiz-builder-detail-title">{quiz.title}</h1>
          <p>{quiz.description || "لا يوجد وصف مضاف لهذا الاختبار."}</p>
        </div>
        <div className="qz-header-actions">
          <span className={`status-badge qb-status-${quiz.status}`} data-testid="quiz-status">
            {statusLabel(quiz.status)}
          </span>
          <button className="secondary-button" type="button" onClick={() => void loadDetail()} disabled={busy}>
            تحديث
          </button>
          <Link className="secondary-button" to="/app/quizzes">
            العودة إلى القائمة
          </Link>
          {quiz.status === "draft" ? (
            <Link className="primary-button" to="/app/quizzes/manage">
              إدارة النماذج
            </Link>
          ) : null}
        </div>
      </header>

      {feedback ? (
        <div className={`mutation-feedback is-${feedback.kind}`} role="status">
          {feedback.text}
        </div>
      ) : null}

      <section className="qz-list-panel" aria-label="ملخص الاختبار">
        <div className="qz-card-topline">
          <span>آخر تحديث: {localDate(quiz.updatedAt)}</span>
          <span>النشر: {localDate(quiz.publishedAt)}</span>
        </div>
        <p>
          يتكوّن الاختبار من {versions.length} نموذج، ويرتبط بـ {lessons.length} درس. سلطة دورة النشر وتجميد النماذج
          تبقى في الخادم.
        </p>

        <div className="qz-lifecycle-actions" aria-label="دورة حياة الاختبار">
          {quiz.status === "draft" ? (
            <button className="primary-button" type="button" onClick={() => void lifecycle("submit")} disabled={busy}>
              إرسال للمراجعة
            </button>
          ) : null}
          {quiz.status === "review" ? (
            <>
              <label className="qz-reject-field">
                <span>سبب الإرجاع للمسودة</span>
                <textarea value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} rows={2} disabled={busy} />
              </label>
              <button className="secondary-button" type="button" onClick={() => void lifecycle("reject")} disabled={busy}>
                إعادة للمسودة
              </button>
              <button className="primary-button" type="button" onClick={() => void lifecycle("publish")} disabled={busy}>
                نشر الاختبار
              </button>
            </>
          ) : null}
          {quiz.status === "published" ? (
            <button className="secondary-button" type="button" onClick={() => void lifecycle("archive")} disabled={busy}>
              أرشفة
            </button>
          ) : null}
        </div>
      </section>

      <section className="qz-list-panel" aria-labelledby="quiz-lessons-title">
        <div className="workspace-header">
          <div>
            <p className="eyebrow">النطاق التعليمي</p>
            <h2 id="quiz-lessons-title">الدروس المرتبطة</h2>
          </div>
        </div>
        {lessons.length === 0 ? (
          <p>لا توجد دروس مرتبطة.</p>
        ) : (
          <div className="qz-list">
            {lessons.map((lesson) => (
              <article className="qz-quiz-card" key={lesson.id}>
                <strong>{lesson.title}</strong>
                <span>الترتيب: {lesson.position}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="qz-list-panel" aria-labelledby="quiz-versions-title">
        <div className="workspace-header">
          <div>
            <p className="eyebrow">النماذج</p>
            <h2 id="quiz-versions-title">نسخ الاختبار</h2>
          </div>
          {quiz.status === "published" ? <small>snapshots ثابتة بعد النشر</small> : null}
        </div>
        {versions.length === 0 ? (
          <p>لم يُضف نموذج للاختبار بعد.</p>
        ) : (
          <div className="qz-list">
            {versions.map((version) => (
              <article className="qz-version-card" key={version.id}>
                <div className="qz-version-heading">
                  <div>
                    <strong>{version.label}</strong>
                    <small>
                      النموذج {version.versionNumber} · {version.questions.length} سؤال
                    </small>
                  </div>
                  {quiz.status !== "draft" ? (
                    <div className="qz-version-actions" aria-label={`تصدير ${version.label}`}>
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => void exportVersion(version.id, "csv")}
                        disabled={busy}
                      >
                        Excel CSV
                      </button>
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => void exportVersion(version.id, "print")}
                        disabled={busy}
                      >
                        طباعة / PDF
                      </button>
                    </div>
                  ) : null}
                </div>
                <span>{version.shuffleOptions ? "ترتيب الخيارات عشوائي" : "ترتيب الخيارات ثابت"}</span>
                <ol className="qz-version-questions">
                  {version.questions.map((question) => (
                    <li key={question.id}>
                      <strong>{question.prompt}</strong>
                      <small>
                        {question.type === "multiple_choice"
                          ? "اختيار متعدد"
                          : question.type === "true_false"
                            ? "صح / خطأ"
                            : "مباشر"}
                        {question.sourcePage ? ` · ص ${question.sourcePage}` : ""}
                      </small>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="qz-list-panel" aria-labelledby="quiz-events-title">
        <div className="workspace-header">
          <div>
            <p className="eyebrow">السجل</p>
            <h2 id="quiz-events-title">آخر أحداث دورة الاختبار</h2>
          </div>
        </div>
        {events.length === 0 ? (
          <p>لا توجد أحداث مسجلة بعد.</p>
        ) : (
          <div className="qz-list">
            {events.map((event) => (
              <article className="qz-quiz-card" key={event.id}>
                <div className="qz-card-topline">
                  <strong>{event.action}</strong>
                  <small>{localDate(event.createdAt)}</small>
                </div>
                <span>{event.note || "بدون ملاحظة"}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function StatePanel({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className="quiz-builder">
      <div className="qz-list-panel" role="status">
        <strong>{title}</strong>
        <p>{body}</p>
        {action}
      </div>
    </section>
  );
}
