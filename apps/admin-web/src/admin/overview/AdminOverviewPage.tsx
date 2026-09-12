import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type OperationsAttentionSummary,
  fetchAdminOperationsAttention,
} from "../../admin-operations-api";
import {
  attentionTotal,
  auditSubject,
  buildAttentionItems,
  eventLabel,
  formatAdminDate,
  resourceLabel,
  sourceLabel,
} from "../operations/operations-model";
import "../operations/operations-pages.css";

type LoadState = "loading" | "ready" | "error";

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل النظرة العامة. أعد المحاولة.";
}

export function AdminOverviewPage({ onSessionExpired }: { onSessionExpired: () => void }) {
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

  const attention = useMemo(() => (summary ? buildAttentionItems(summary) : []), [summary]);

  return (
    <section className="admin-overview-page">
      <header className="page-header operations-page-header">
        <div>
          <p className="eyebrow">مساحة الإدارة</p>
          <h1>نظرة عامة</h1>
          <p className="page-description">ما الذي يحتاج انتباهك الآن؟ ابدأ بالعمل المعلّق أو المشكلة التي تحتاج قرارًا.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void load()} disabled={state === "loading"}>
          تحديث
        </button>
      </header>

      {state === "loading" ? (
        <OperationsPageState title="جارٍ تحميل العمل المعلّق" body="نقرأ الحالة الحالية من الخادم." />
      ) : state === "error" || !summary ? (
        <OperationsPageState title="تعذر تحميل النظرة العامة" body={message} onRetry={() => void load()} />
      ) : (
        <>
          {attention.length === 0 ? (
            <section className="operations-empty-state" aria-live="polite">
              <h2>لا توجد عناصر معلّقة ضمن المؤشرات الحالية</h2>
              <p>يمكنك الانتقال مباشرة إلى أحد مسارات العمل أدناه أو تحديث الحالة.</p>
            </section>
          ) : (
            <section className="operations-attention-section" aria-labelledby="overview-attention-title">
              <div className="operations-section-header">
                <div>
                  <h2 id="overview-attention-title">يحتاج إلى متابعة</h2>
                  <p>{attentionTotal(summary).toLocaleString("ar-YE")} عنصرًا موزعًا على مسارات العمل الحالية.</p>
                </div>
              </div>
              <div className="operations-attention-list">
                {attention.map((item) => (
                  <Link className={`operations-attention-row is-${item.category}`} to={item.to} key={item.key}>
                    <span className="operations-attention-count">{item.count.toLocaleString("ar-YE")}</span>
                    <span className="operations-attention-copy">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                    <span className="operations-attention-action">فتح المسار</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <nav className="operations-shortcuts" aria-label="مسارات عمل سريعة">
            <Link className="operations-shortcut" to="/app/content">إدارة المحتوى</Link>
            <Link className="operations-shortcut" to="/app/reviews">المراجعات</Link>
            <Link className="operations-shortcut" to="/app/students">دعم الطلاب</Link>
            <Link className="operations-shortcut" to="/app/operations">الحالة والمشكلات</Link>
          </nav>

          <section className="operations-activity-section" aria-labelledby="overview-activity-title">
            <div className="operations-section-header">
              <div>
                <h2 id="overview-activity-title">نشاط مهم حديثًا</h2>
                <p>أحدث الأحداث من مسارات الإدارة الأساسية، بصياغة مناسبة للتشغيل اليومي.</p>
              </div>
              <Link className="secondary-button" to="/app/operations/audit">فتح سجل التدقيق</Link>
            </div>
            {summary.recentActivity.length === 0 ? (
              <p className="operations-empty">لا يوجد نشاط مسجل بعد.</p>
            ) : (
              <div className="operations-activity-list">
                {summary.recentActivity.map((entry) => {
                  const resource = resourceLabel(entry.resourceType);
                  return (
                    <article className="operations-activity-row" key={entry.id}>
                      <div className="operations-activity-main">
                        <div className="operations-activity-title">
                          <strong>{eventLabel(entry.eventType)}</strong>
                          <span className="operations-source-badge">{sourceLabel(entry.source)}</span>
                        </div>
                        <p>{auditSubject(entry)}{resource ? ` · ${resource}` : ""}</p>
                      </div>
                      <time dateTime={entry.createdAt}>{formatAdminDate(entry.createdAt)}</time>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

function OperationsPageState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div className="operations-page-state" role="status">
      <strong>{title}</strong>
      <p>{body}</p>
      {onRetry ? <button className="secondary-button" type="button" onClick={onRetry}>إعادة المحاولة</button> : null}
    </div>
  );
}
