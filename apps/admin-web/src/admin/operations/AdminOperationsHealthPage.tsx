import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type OperationsAttentionSummary,
  fetchAdminOperationsAttention,
} from "../../admin-operations-api";
import { buildAttentionItems } from "./operations-model";
import "./operations-pages.css";

type LoadState = "loading" | "ready" | "error";

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل حالة التشغيل. أعد المحاولة.";
}

export function AdminOperationsHealthPage({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [state, setState] = useState<LoadState>("loading");
  const [summary, setSummary] = useState<OperationsAttentionSummary | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    try {
      setSummary(await fetchAdminOperationsAttention(6));
      setState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setMessage(errorMessage(error));
      setState("error");
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => (summary ? buildAttentionItems(summary) : []), [summary]);
  const issues = items.filter((item) => item.category === "failure" || item.category === "support");
  const reviewQueues = items.filter((item) => item.category === "review");

  return (
    <section className="operations-page">
      <header className="page-header operations-page-header">
        <div>
          <p className="eyebrow">التشغيل</p>
          <h1>الحالة والمشكلات</h1>
          <p className="page-description">المشكلات التشغيلية والاستثناءات التي قد تحتاج تدخّلًا، بعيدًا عن إعدادات النظام والتفاصيل التشخيصية.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void load()} disabled={state === "loading"}>تحديث</button>
      </header>

      <nav className="operations-page-actions" aria-label="أدوات التشغيل المرتبطة">
        <Link className="secondary-button" to="/app/operations/notifications">إدارة الإشعارات</Link>
        <Link className="secondary-button" to="/app/operations/audit">سجل التدقيق</Link>
        <Link className="secondary-button" to="/app/operations/diagnostics">التشخيص المتقدم</Link>
      </nav>

      {state === "loading" ? (
        <OperationsState title="جارٍ فحص الحالة" body="نقرأ المشكلات الحالية من الخادم." />
      ) : state === "error" || !summary ? (
        <OperationsState title="تعذر تحميل حالة التشغيل" body={message} onRetry={() => void load()} />
      ) : (
        <>
          <section className="operations-attention-section" aria-labelledby="operations-issues-title">
            <div className="operations-section-header">
              <div>
                <h2 id="operations-issues-title">مشكلات واستثناءات</h2>
                <p>ابدأ بما توقف أو بما يحتاج متابعة دعم واضحة.</p>
              </div>
            </div>
            {issues.length === 0 ? (
              <p className="operations-empty">لا توجد مشكلات أو استثناءات ظاهرة ضمن المؤشرات الحالية.</p>
            ) : (
              <div className="operations-attention-list">
                {issues.map((item) => (
                  <Link className={`operations-attention-row is-${item.category}`} to={item.to} key={item.key}>
                    <span className="operations-attention-count">{item.count.toLocaleString("ar-YE")}</span>
                    <span className="operations-attention-copy"><strong>{item.title}</strong><span>{item.description}</span></span>
                    <span className="operations-attention-action">متابعة</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="operations-attention-section" aria-labelledby="operations-queues-title">
            <div className="operations-section-header">
              <div>
                <h2 id="operations-queues-title">طوابير المراجعة</h2>
                <p>ليست أعطالًا، لكنها أعمال بشرية معلّقة قد تؤثر في تقدم المحتوى.</p>
              </div>
              <Link className="secondary-button" to="/app/reviews">فتح المراجعات</Link>
            </div>
            {reviewQueues.length === 0 ? (
              <p className="operations-empty">لا توجد مراجعات معلّقة ضمن المؤشرات الحالية.</p>
            ) : (
              <div className="operations-attention-list">
                {reviewQueues.map((item) => (
                  <Link className="operations-attention-row is-review" to={item.to} key={item.key}>
                    <span className="operations-attention-count">{item.count.toLocaleString("ar-YE")}</span>
                    <span className="operations-attention-copy"><strong>{item.title}</strong><span>{item.description}</span></span>
                    <span className="operations-attention-action">مراجعة</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

function OperationsState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return <div className="operations-page-state" role="status"><strong>{title}</strong><p>{body}</p>{onRetry ? <button className="secondary-button" type="button" onClick={onRetry}>إعادة المحاولة</button> : null}</div>;
}
