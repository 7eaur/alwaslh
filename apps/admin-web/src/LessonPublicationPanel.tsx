import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import {
  type AdminLessonContentState,
  type LessonContentPublicationAction,
  fetchLessonContentState,
  transitionLessonContentPublication,
} from "./lesson-content-api";

interface Props {
  lessonId: string;
  refreshToken: number;
  disabled: boolean;
  onSessionExpired: () => void;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحديث حالة نشر محتوى الدرس. أعد المحاولة.";
}

function successMessage(action: LessonContentPublicationAction): string {
  if (action === "submit_review") return "تم إرسال مسودات الدرس إلى المراجعة.";
  if (action === "return_to_draft") return "أعيد محتوى المراجعة إلى المسودة.";
  return "تم نشر محتوى المراجعة للطلاب.";
}

export function LessonPublicationPanel({ lessonId, refreshToken, disabled, onSessionExpired }: Props) {
  const [content, setContent] = useState<AdminLessonContentState | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "saving" | "error">("idle");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!lessonId) {
      setContent(null);
      setState("idle");
      setFeedback(null);
      return;
    }
    setState("loading");
    setFeedback(null);
    try {
      const next = await fetchLessonContentState(lessonId);
      setContent(next);
      setState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setContent(null);
      setState("error");
      setFeedback({ kind: "error", message: messageFor(error) });
    }
  }, [lessonId, onSessionExpired]);

  useEffect(() => {
    void refreshToken;
    void load();
  }, [load, refreshToken]);

  const transition = useCallback(
    async (action: LessonContentPublicationAction) => {
      if (!lessonId) return;
      if (action === "publish" && !window.confirm("سيصبح محتوى المراجعة متاحًا للطلاب. هل تريد المتابعة؟")) {
        return;
      }
      setState("saving");
      setFeedback(null);
      try {
        const next = await transitionLessonContentPublication(lessonId, action);
        setContent(next);
        setState("ready");
        setFeedback({ kind: "success", message: successMessage(action) });
      } catch (error) {
        if (isMissingSessionError(error)) {
          onSessionExpired();
          return;
        }
        setState(content ? "ready" : "error");
        setFeedback({ kind: "error", message: messageFor(error) });
      }
    },
    [content, lessonId, onSessionExpired],
  );

  const isSaving = state === "saving";
  const isDisabled = disabled || isSaving;

  return (
    <section className="ingestion-panel lesson-publication-panel" aria-label="حالة نشر محتوى الدرس">
      <div className="ingestion-panel-heading">
        <div>
          <p className="section-kicker">قرار النشر</p>
          <h2>نشر محتوى الدرس</h2>
          {content ? <p className="lesson-publication-lesson">{content.lessonTitle}</p> : null}
        </div>
      </div>

      {!lessonId ? <p className="empty-copy">اختر درسًا لعرض حالة محتواه.</p> : null}
      {lessonId && state === "loading" ? <p className="empty-copy">جارٍ قراءة حالة محتوى الدرس…</p> : null}
      {state === "error" && feedback ? (
        <div className="lesson-publication-feedback is-error" role="alert">
          <span>{feedback.message}</span>
          <button className="secondary-button small-button" type="button" onClick={() => void load()}>
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      {content ? (
        <>
          <div className="lesson-publication-counts" aria-label="ملخص حالة المحتوى">
            <PublicationCount label="مسودة" value={content.counts.draft} />
            <PublicationCount label="قيد المراجعة" value={content.counts.review} />
            <PublicationCount label="منشور" value={content.counts.published} />
          </div>

          {content.counts.total === 0 ? (
            <p className="empty-copy">لا يوجد محتوى مرتبط بهذا الدرس بعد. ارفع المحتوى واربطه بالدرس أولًا.</p>
          ) : null}

          {content.counts.reviewBlocked > 0 ? (
            <div className="lesson-publication-warning" role="alert">
              يوجد {content.counts.reviewBlocked} عنصر في المراجعة غير جاهز للعرض. أصلح معالجة الوسائط قبل النشر.
            </div>
          ) : null}

          {feedback ? (
            <div
              className={`lesson-publication-feedback is-${feedback.kind}`}
              role={feedback.kind === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </div>
          ) : null}

          <div className="lesson-publication-actions" aria-label="إجراءات نشر محتوى الدرس">
            <button
              className="secondary-button"
              type="button"
              disabled={isDisabled || content.counts.draft === 0}
              onClick={() => void transition("submit_review")}
            >
              إرسال المسودات للمراجعة
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={isDisabled || content.counts.review === 0}
              onClick={() => void transition("return_to_draft")}
            >
              إعادة محتوى المراجعة إلى المسودة
            </button>
            <button
              className="primary-button publish-button"
              type="button"
              disabled={isDisabled || content.counts.review === 0 || content.counts.reviewBlocked > 0}
              onClick={() => void transition("publish")}
            >
              نشر محتوى المراجعة
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function PublicationCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="task-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
