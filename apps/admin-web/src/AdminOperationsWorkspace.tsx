import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import {
  type AdminNotification,
  type NotificationSeverity,
  type OperationsOverview,
  createAdminNotification,
  deleteAdminNotification,
  fetchAdminNotifications,
  fetchAdminOperationsOverview,
} from "./admin-operations-api";
import "./admin-operations.css";

const PAGE_SIZE = 25;
type OperationsTab = "overview" | "notifications";
type LoadState = "loading" | "ready" | "error";

type Feedback = { kind: "success" | "error"; message: string } | null;

const dateFormatter = new Intl.DateTimeFormat("ar-YE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة.";
}

function severityLabel(severity: NotificationSeverity): string {
  return {
    info: "معلومة",
    success: "نجاح",
    warning: "تنبيه",
    critical: "حرج",
  }[severity];
}

function activityLabel(eventType: string): string {
  const labels: Record<string, string> = {
    login_success: "تسجيل دخول ناجح",
    login_failure: "محاولة دخول غير ناجحة",
    login_locked: "قفل تسجيل الدخول",
    logout: "تسجيل خروج",
    password_changed: "تغيير كلمة المرور",
    temporary_password_issued: "إصدار كلمة مرور مؤقتة",
    device_rebind_reset: "السماح بإعادة ربط الجهاز",
    full_code_redeemed: "استخدام كود شامل",
    class_code_redeemed: "استخدام كود صف",
    code_generated: "توليد أكواد وصول",
    code_redeemed: "استخدام كود وصول",
    entitlement_created: "إنشاء صلاحية",
    entitlement_renewed: "تجديد صلاحية",
    entitlement_revoked: "إلغاء صلاحية",
    code_revoked: "إيقاف كود غير مستخدم",
  };
  return labels[eventType] ?? eventType;
}

export function AdminOperationsWorkspace({
  onSessionExpired,
}: {
  onSessionExpired: () => void;
}) {
  const [tab, setTab] = useState<OperationsTab>("overview");

  return (
    <section className="admin-operations-workspace">
      <header className="page-header operations-page-header">
        <div>
          <p className="eyebrow">Stage 13G · التشغيل الإداري</p>
          <h1>لوحة التشغيل</h1>
          <p className="page-description">
            مؤشرات تشغيلية مباشرة من السلطات الأساسية، وآخر نشاط الحسابات والوصول، وإدارة الإشعارات من
            نفس المستودع الذي يقرأه الطالب.
          </p>
        </div>
      </header>

      <div className="operations-tabs" role="tablist" aria-label="أقسام لوحة التشغيل">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          className={tab === "overview" ? "is-active" : ""}
          onClick={() => setTab("overview")}
        >
          نظرة تشغيلية
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "notifications"}
          className={tab === "notifications" ? "is-active" : ""}
          onClick={() => setTab("notifications")}
        >
          الإشعارات
        </button>
      </div>

      {tab === "overview" ? (
        <OperationsOverviewPanel onSessionExpired={onSessionExpired} />
      ) : (
        <NotificationsPanel onSessionExpired={onSessionExpired} />
      )}
    </section>
  );
}

function OperationsOverviewPanel({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [state, setState] = useState<LoadState>("loading");
  const [overview, setOverview] = useState<OperationsOverview | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    try {
      setOverview(await fetchAdminOperationsOverview(8));
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

  if (state === "loading") {
    return <WorkspaceState title="جارٍ تحميل مؤشرات التشغيل" body="نقرأ البيانات المباشرة من الخادم." />;
  }
  if (state === "error" || !overview) {
    return <WorkspaceState title="تعذر تحميل لوحة التشغيل" body={message} onRetry={() => void load()} />;
  }

  const metricGroups = [
    {
      title: "المحتوى",
      metrics: [
        ["الصفوف النشطة", overview.metrics.activeClasses],
        ["المواد النشطة", overview.metrics.activeSubjects],
        ["الدروس النشطة", overview.metrics.activeLessons],
      ],
    },
    {
      title: "الطلاب والوصول",
      metrics: [
        ["الطلاب النشطون", overview.metrics.activeStudents],
        ["طلاب بصلاحية سارية", overview.metrics.studentsWithAccess],
        ["أكواد شاملة نشطة", overview.metrics.activeFullCodes],
        ["أكواد صف نشطة", overview.metrics.activeClassCodes],
      ],
    },
    {
      title: "التواصل",
      metrics: [["إشعارات سارية", overview.metrics.activeNotifications]],
    },
  ] as const;

  return (
    <div className="operations-overview">
      <div className="operations-heading-row">
        <div>
          <h2>الحالة الحالية</h2>
          <p>الأرقام أدناه محسوبة لحظيًا من البيانات الموثوقة، وليست cache منفصلة.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void load()}>
          تحديث
        </button>
      </div>

      <div className="metric-groups">
        {metricGroups.map((group) => (
          <section className="metric-group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="metric-list">
              {group.metrics.map(([label, value]) => (
                <div className="metric-row" key={label}>
                  <span>{label}</span>
                  <strong>{value.toLocaleString("ar-YE")}</strong>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="operations-feed-grid">
        <section className="operations-feed-panel" aria-labelledby="latest-notifications-title">
          <div className="operations-section-heading">
            <h2 id="latest-notifications-title">أحدث الإشعارات</h2>
          </div>
          {overview.recentNotifications.length === 0 ? (
            <p className="operations-empty">لا توجد إشعارات مرسلة حتى الآن.</p>
          ) : (
            <div className="operations-feed-list">
              {overview.recentNotifications.map((notification) => (
                <article className="operations-feed-item" key={notification.id}>
                  <div>
                    <strong>{notification.title}</strong>
                    <span>{severityLabel(notification.severity)}</span>
                  </div>
                  <time dateTime={notification.publishedAt}>{formatDate(notification.publishedAt)}</time>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="operations-feed-panel" aria-labelledby="latest-activity-title">
          <div className="operations-section-heading">
            <h2 id="latest-activity-title">آخر نشاط تشغيلي</h2>
          </div>
          {overview.recentActivity.length === 0 ? (
            <p className="operations-empty">لا يوجد نشاط مسجل بعد.</p>
          ) : (
            <div className="operations-feed-list">
              {overview.recentActivity.map((activity) => (
                <article className="operations-feed-item" key={activity.id}>
                  <div>
                    <strong>{activityLabel(activity.eventType)}</strong>
                    <span>
                      {activity.subjectDisplayName ?? activity.actorDisplayName ?? "النظام"} · {activity.source === "auth" ? "الحساب" : "الوصول"}
                    </span>
                  </div>
                  <time dateTime={activity.createdAt}>{formatDate(activity.createdAt)}</time>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NotificationsPanel({ onSessionExpired }: { onSessionExpired: () => void }) {
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

  useEffect(() => {
    void load();
  }, [load]);

  const pageLabel = useMemo(() => {
    if (total === 0) return "0 من 0";
    return `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)} من ${total}`;
  }, [offset, total]);

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
      setTitle("");
      setBody("");
      setCreateSeverity("info");
      setActionPath("");
      setExpiresLocal("");
      setOffset(0);
      setFeedback({ kind: "success", message: "تم نشر الإشعار في المستودع المشترك مع تجربة الطالب." });
      await load();
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", message: errorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(notificationId: string) {
    if (pendingDeleteId !== notificationId) {
      setPendingDeleteId(notificationId);
      return;
    }
    setFeedback(null);
    try {
      await deleteAdminNotification(notificationId);
      setPendingDeleteId(null);
      setFeedback({ kind: "success", message: "تم حذف الإشعار وتوقف ظهوره للطلاب." });
      await load();
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  return (
    <div className="notifications-workspace">
      <section className="notification-compose-panel">
        <div className="operations-section-heading">
          <div>
            <h2>إشعار عام جديد</h2>
            <p>يظهر لجميع الطلاب ما دام ساريًا. لا يتم استخدام HTML في الرسالة.</p>
          </div>
        </div>
        <form className="notification-compose-form" aria-label="إنشاء إشعار عام" onSubmit={submitCreate}>
          <label>
            <span>العنوان</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
          </label>
          <label className="notification-body-field">
            <span>الرسالة</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} rows={5} required />
          </label>
          <div className="notification-compose-grid">
            <label>
              <span>الأهمية</span>
              <select value={createSeverity} onChange={(event) => setCreateSeverity(event.target.value as NotificationSeverity)}>
                <option value="info">معلومة</option>
                <option value="success">نجاح</option>
                <option value="warning">تنبيه</option>
                <option value="critical">حرج</option>
              </select>
            </label>
            <label>
              <span>ينتهي في (اختياري)</span>
              <input type="datetime-local" value={expiresLocal} onChange={(event) => setExpiresLocal(event.target.value)} />
            </label>
            <label className="notification-action-field">
              <span>مسار داخلي (اختياري)</span>
              <input value={actionPath} onChange={(event) => setActionPath(event.target.value)} maxLength={512} placeholder="/student/..." dir="ltr" />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={submitting || !title.trim() || !body.trim()}>
            {submitting ? "جارٍ النشر…" : "نشر الإشعار"}
          </button>
        </form>
      </section>

      <section className="notifications-list-panel">
        <div className="operations-section-heading">
          <div>
            <h2>الإشعارات المرسلة</h2>
            <p>بحث وترقيم من الخادم، مرتبة من الأحدث.</p>
          </div>
          <button className="secondary-button" type="button" onClick={() => void load()}>
            تحديث
          </button>
        </div>

        {feedback ? <p className={`operations-feedback is-${feedback.kind}`} role="status">{feedback.message}</p> : null}

        <form
          className="notification-filter-form"
          aria-label="فلترة الإشعارات"
          onSubmit={(event) => {
            event.preventDefault();
            setOffset(0);
            setSearch(searchInput.trim());
          }}
        >
          <label>
            <span>بحث</span>
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="العنوان أو الرسالة" />
          </label>
          <label>
            <span>الأهمية</span>
            <select
              value={severity}
              onChange={(event) => {
                setOffset(0);
                setSeverity(event.target.value as NotificationSeverity | "");
              }}
            >
              <option value="">الكل</option>
              <option value="info">معلومة</option>
              <option value="success">نجاح</option>
              <option value="warning">تنبيه</option>
              <option value="critical">حرج</option>
            </select>
          </label>
          <button className="secondary-button" type="submit">تطبيق البحث</button>
        </form>

        {state === "loading" ? (
          <WorkspaceState title="جارٍ تحميل الإشعارات" body="نقرأ القائمة من الخادم." />
        ) : state === "error" ? (
          <WorkspaceState title="تعذر تحميل الإشعارات" body="أعد المحاولة من زر التحديث." />
        ) : notifications.length === 0 ? (
          <WorkspaceState title="لا توجد نتائج" body="غيّر البحث أو أنشئ أول إشعار." />
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <article className="notification-item" key={notification.id}>
                <div className="notification-item-main">
                  <div className="notification-item-title">
                    <strong>{notification.title}</strong>
                    <span className={`notification-severity is-${notification.severity}`}>
                      {severityLabel(notification.severity)}
                    </span>
                  </div>
                  <p>{notification.body}</p>
                  <div className="notification-meta">
                    <span>نُشر {formatDate(notification.publishedAt)}</span>
                    <span>{notification.expiresAt ? `ينتهي ${formatDate(notification.expiresAt)}` : "بدون انتهاء"}</span>
                    {notification.actionPath ? <code dir="ltr">{notification.actionPath}</code> : null}
                  </div>
                </div>
                <div className="notification-actions">
                  {pendingDeleteId === notification.id ? (
                    <button className="secondary-button" type="button" onClick={() => setPendingDeleteId(null)}>
                      إلغاء
                    </button>
                  ) : null}
                  <button className="secondary-button danger-button" type="button" onClick={() => void remove(notification.id)}>
                    {pendingDeleteId === notification.id ? "تأكيد الحذف" : "حذف"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <nav className="operations-pagination" aria-label="صفحات الإشعارات">
          <button className="secondary-button" type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
            السابق
          </button>
          <span>{pageLabel}</span>
          <button className="secondary-button" type="button" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>
            التالي
          </button>
        </nav>
      </section>
    </div>
  );
}

function WorkspaceState({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="operations-workspace-state" role="status">
      <strong>{title}</strong>
      <p>{body}</p>
      {onRetry ? (
        <button className="secondary-button" type="button" onClick={onRetry}>
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}
