import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type OperationsAuditEntry,
  type OperationsAuditSource,
  fetchAdminOperationsAudit,
} from "../../admin-operations-api";
import {
  auditSubject,
  eventLabel,
  formatAdminDate,
  resourceLabel,
  sourceLabel,
} from "./operations-model";
import "./operations-pages.css";

const PAGE_SIZE = 25;
type LoadState = "loading" | "ready" | "error";

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل سجل التدقيق. أعد المحاولة.";
}

export function AdminOperationsAuditPage({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [state, setState] = useState<LoadState>("loading");
  const [entries, setEntries] = useState<OperationsAuditEntry[]>([]);
  const [source, setSource] = useState<OperationsAuditSource | "">("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    try {
      const result = await fetchAdminOperationsAudit({
        ...(source ? { source } : {}),
        limit: PAGE_SIZE,
        offset,
      });
      setEntries(result.entries);
      setTotal(result.page.total);
      setState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setMessage(errorMessage(error));
      setState("error");
    }
  }, [offset, onSessionExpired, source]);

  useEffect(() => {
    void load();
  }, [load]);

  const pageLabel = useMemo(() => {
    if (total === 0) return "0 من 0";
    return `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)} من ${total}`;
  }, [offset, total]);

  return (
    <section className="operations-page">
      <header className="page-header operations-page-header">
        <div>
          <p className="eyebrow">التشغيل</p>
          <h1>سجل التدقيق</h1>
          <p className="page-description">سجل موحّد للأحداث الحساسة والمهمة عبر الحسابات والوصول والمحتوى والمراجعة والأسئلة والاختبارات.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void load()} disabled={state === "loading"}>تحديث</button>
      </header>

      <section className="operations-activity-section" aria-labelledby="audit-list-title">
        <div className="operations-section-header">
          <div><h2 id="audit-list-title">الأحداث</h2><p>التفاصيل الداخلية والمعرّفات الخام مخفية من العرض اليومي.</p></div>
        </div>

        <div className="operations-filter-bar" aria-label="تصفية سجل التدقيق">
          <label>
            <span>المصدر</span>
            <select value={source} onChange={(event) => { setSource(event.target.value as OperationsAuditSource | ""); setOffset(0); }}>
              <option value="">كل المصادر</option>
              <option value="auth">الحسابات</option>
              <option value="access">الوصول</option>
              <option value="curriculum">المنهج والمحتوى</option>
              <option value="ai_review">مراجعة الذكاء الاصطناعي</option>
              <option value="question_bank">بنك الأسئلة</option>
              <option value="quiz_builder">الاختبارات</option>
            </select>
          </label>
          <button className="secondary-button" type="button" onClick={() => void load()}>تحديث القائمة</button>
        </div>

        {state === "loading" ? (
          <OperationsState title="جارٍ تحميل سجل التدقيق" body="نقرأ الأحداث من مصادرها الأصلية." />
        ) : state === "error" ? (
          <OperationsState title="تعذر تحميل سجل التدقيق" body={message} onRetry={() => void load()} />
        ) : entries.length === 0 ? (
          <p className="operations-empty">لا توجد أحداث تطابق التصفية الحالية.</p>
        ) : (
          <div className="operations-activity-list">
            {entries.map((entry) => {
              const resource = resourceLabel(entry.resourceType);
              return (
                <article className="operations-activity-row" key={entry.id}>
                  <div className="operations-activity-main">
                    <div className="operations-activity-title"><strong>{eventLabel(entry.eventType)}</strong><span className="operations-source-badge">{sourceLabel(entry.source)}</span></div>
                    <p>{auditSubject(entry)}{resource ? ` · ${resource}` : ""}</p>
                  </div>
                  <time dateTime={entry.createdAt}>{formatAdminDate(entry.createdAt)}</time>
                </article>
              );
            })}
          </div>
        )}

        <nav className="operations-pagination" aria-label="صفحات سجل التدقيق">
          <button className="secondary-button small-button" type="button" disabled={offset === 0 || state === "loading"} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>السابق</button>
          <span>{pageLabel}</span>
          <button className="secondary-button small-button" type="button" disabled={offset + PAGE_SIZE >= total || state === "loading"} onClick={() => setOffset(offset + PAGE_SIZE)}>التالي</button>
        </nav>
      </section>
    </section>
  );
}

function OperationsState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return <div className="operations-page-state" role="status"><strong>{title}</strong><p>{body}</p>{onRetry ? <button className="secondary-button" type="button" onClick={onRetry}>إعادة المحاولة</button> : null}</div>;
}
