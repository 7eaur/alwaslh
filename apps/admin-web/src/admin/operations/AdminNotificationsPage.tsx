import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type AdminNotification,
  type NotificationSeverity,
  createAdminNotification,
  deleteAdminNotification,
  fetchAdminNotifications,
} from "../../admin-operations-api";
import { formatAdminDate } from "./operations-model";
import "../../admin-operations.css";
import "./operations-pages.css";

const PAGE_SIZE = 25;
type LoadState = "loading" | "ready" | "error";
type Feedback = { kind: "success" | "error"; message: string } | null;

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة.";
}

function severityLabel(severity: NotificationSeverity): string {
  return { info: "معلومة", success: "نجاح", warning: "تنبيه", critical: "حرج" }[severity];
}

export function AdminNotificationsPage({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<NotificationSeverity | "">("");
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [createSeverity, setCreateSeverity] = useState<NotificationSeverity>("info");
  const [actionPath, setActionPath] = useState("");
  const [expiresLocal, setExpiresLocal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const result = await fetchAdminNotifications({
        ...(search ? { search } : {}),
        ...(severity ? { severity } : {}),
        limit: PAGE_SIZE,
        offset,
      });
      setNotifications(result.notifications);
      setTotal(result.page.total);
      setState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", message: errorMessage(error) });
      setState("error");
    }
  }, [offset, onSessionExpired, search, severity]);

  useEffect(() => { void load(); }, [load]);

  const pageLabel = useMemo(() => total === 0 ? "0 من 0" : `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)} من ${total}`, [offset, total]);

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await createAdminNotification({
        title: title.trim(),
        body: body.trim(),
        severity: createSeverity,
        actionPath: actionPath.trim() || null,
        expiresAt: expiresLocal ? new Date(expiresLocal).toISOString() : null,
      });
      setTitle(""); setBody(""); setCreateSeverity("info"); setActionPath(""); setExpiresLocal(""); setOffset(0);
      setFeedback({ kind: "success", message: "تم نشر الإشعار للطلاب." });
      await load();
    } catch (error) {
      if (isMissingSessionError(error)) { onSessionExpired(); return; }
      setFeedback({ kind: "error", message: errorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(notificationId: string) {
    if (pendingDeleteId !== notificationId) { setPendingDeleteId(notificationId); return; }
    setFeedback(null);
    try {
      await deleteAdminNotification(notificationId);
      setPendingDeleteId(null);
      setFeedback({ kind: "success", message: "تم حذف الإشعار وتوقف ظهوره للطلاب." });
      await load();
    } catch (error) {
      if (isMissingSessionError(error)) { onSessionExpired(); return; }
      setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  return (
    <section className="operations-page notifications-workspace">
      <header className="page-header operations-page-header">
        <div><p className="eyebrow">التشغيل · تواصل</p><h1>إشعارات الطلاب</h1><p className="page-description">إنشاء الإشعارات العامة وإدارة الرسائل السارية من مكان واحد.</p></div>
        <Link className="secondary-button" to="/app/operations">العودة إلى الحالة والمشكلات</Link>
      </header>

      <section className="notification-compose-panel">
        <div className="operations-section-heading"><div><h2>إشعار عام جديد</h2><p>يظهر لجميع الطلاب ما دام ساريًا.</p></div></div>
        <form className="notification-compose-form" aria-label="إنشاء إشعار عام" onSubmit={submitCreate}>
          <label><span>العنوان</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required /></label>
          <label className="notification-body-field"><span>الرسالة</span><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} rows={5} required /></label>
          <div className="notification-compose-grid">
            <label><span>الأهمية</span><select value={createSeverity} onChange={(event) => setCreateSeverity(event.target.value as NotificationSeverity)}><option value="info">معلومة</option><option value="success">نجاح</option><option value="warning">تنبيه</option><option value="critical">حرج</option></select></label>
            <label><span>ينتهي في (اختياري)</span><input type="datetime-local" value={expiresLocal} onChange={(event) => setExpiresLocal(event.target.value)} /></label>
            <label className="notification-action-field"><span>وجهة داخل التطبيق (اختياري)</span><input value={actionPath} onChange={(event) => setActionPath(event.target.value)} maxLength={512} placeholder="/app/..." dir="ltr" /></label>
          </div>
          <button className="primary-button" type="submit" disabled={submitting || !title.trim() || !body.trim()}>{submitting ? "جارٍ النشر…" : "نشر الإشعار"}</button>
        </form>
      </section>

      <section className="notifications-list-panel">
        <div className="operations-section-heading"><div><h2>الإشعارات المرسلة</h2><p>ابحث في الرسائل أو صفّها حسب الأهمية.</p></div><button className="secondary-button" type="button" onClick={() => void load()}>تحديث</button></div>
        {feedback ? <p className={`operations-feedback is-${feedback.kind}`} role="status">{feedback.message}</p> : null}
        <form className="notification-filter-form" aria-label="فلترة الإشعارات" onSubmit={(event) => { event.preventDefault(); setOffset(0); setSearch(searchInput.trim()); }}>
          <label><span>بحث</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="العنوان أو الرسالة" /></label>
          <label><span>الأهمية</span><select value={severity} onChange={(event) => { setOffset(0); setSeverity(event.target.value as NotificationSeverity | ""); }}><option value="">الكل</option><option value="info">معلومة</option><option value="success">نجاح</option><option value="warning">تنبيه</option><option value="critical">حرج</option></select></label>
          <button className="secondary-button" type="submit">تطبيق البحث</button>
        </form>

        {state === "loading" ? <NotificationState title="جارٍ تحميل الإشعارات" body="نقرأ القائمة من الخادم." /> : state === "error" ? <NotificationState title="تعذر تحميل الإشعارات" body="أعد المحاولة من زر التحديث." /> : notifications.length === 0 ? <NotificationState title="لا توجد نتائج" body="غيّر البحث أو أنشئ أول إشعار." /> : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <article className="notification-item" key={notification.id}>
                <div className="notification-item-main">
                  <div className="notification-item-title"><strong>{notification.title}</strong><span className={`notification-severity is-${notification.severity}`}>{severityLabel(notification.severity)}</span></div>
                  <p>{notification.body}</p>
                  <div className="notification-meta"><span>نُشر {formatAdminDate(notification.publishedAt)}</span><span>{notification.expiresAt ? `ينتهي ${formatAdminDate(notification.expiresAt)}` : "بدون انتهاء"}</span>{notification.actionPath ? <code dir="ltr">{notification.actionPath}</code> : null}</div>
                </div>
                <div className="notification-actions">{pendingDeleteId === notification.id ? <button className="secondary-button" type="button" onClick={() => setPendingDeleteId(null)}>إلغاء</button> : null}<button className="secondary-button danger-button" type="button" onClick={() => void remove(notification.id)}>{pendingDeleteId === notification.id ? "تأكيد الحذف" : "حذف"}</button></div>
              </article>
            ))}
          </div>
        )}
        <nav className="operations-pagination" aria-label="صفحات الإشعارات"><button className="secondary-button" type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>السابق</button><span>{pageLabel}</span><button className="secondary-button" type="button" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>التالي</button></nav>
      </section>
    </section>
  );
}

function NotificationState({ title, body }: { title: string; body: string }) {
  return <div className="operations-workspace-state" role="status"><strong>{title}</strong><p>{body}</p></div>;
}
