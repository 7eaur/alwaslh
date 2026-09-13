import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import { type QuizBuilderDetail, type QuizBuilderStatus, fetchQuiz } from "../../quiz-builder-api";
import "../../quiz-builder.css";

interface Props {
  onSessionExpired: () => void;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل الاختبار. أعد المحاولة.";
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

  return (
    <section className="quiz-builder" aria-labelledby="quiz-builder-detail-title">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">الاختبارات</p>
          <h1 id="quiz-builder-detail-title">{quiz.title}</h1>
          <p>{quiz.description || "لا يوجد وصف مضاف لهذا الاختبار."}</p>
        </div>
        <div className="qz-header-actions">
          <span className={`status-badge qb-status-${quiz.status}`}>{statusLabel(quiz.status)}</span>
          <button className="secondary-button" type="button" onClick={() => void loadDetail()}>
            تحديث
          </button>
          <Link className="secondary-button" to="/app/quizzes">
            العودة إلى القائمة
          </Link>
          <Link className="primary-button" to="/app/quizzes/manage">
            إدارة التكوين ودورة النشر
          </Link>
        </div>
      </header>

      <section className="qz-list-panel" aria-label="ملخص الاختبار">
        <div className="qz-card-topline">
          <span>آخر تحديث: {localDate(quiz.updatedAt)}</span>
          <span>النشر: {localDate(quiz.publishedAt)}</span>
        </div>
        <p>
          يتكوّن الاختبار من {versions.length} نموذج، ويرتبط بـ {lessons.length} درس. سلطة النشر وتجميد النماذج
          تبقى في الخادم.
        </p>
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
        </div>
        {versions.length === 0 ? (
          <p>لم يُضف نموذج للاختبار بعد.</p>
        ) : (
          <div className="qz-list">
            {versions.map((version) => (
              <article className="qz-quiz-card" key={version.id}>
                <div className="qz-card-topline">
                  <strong>{version.label}</strong>
                  <span>النموذج {version.versionNumber}</span>
                </div>
                <span>{version.questions.length} سؤال</span>
                <span>{version.shuffleOptions ? "ترتيب الخيارات عشوائي" : "ترتيب الخيارات ثابت"}</span>
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
