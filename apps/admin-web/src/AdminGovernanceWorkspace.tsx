import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import {
  type OperationsAuditEntry,
  type OperationsAuditSource,
  type OperationsGovernanceOverview,
  fetchAdminOperationsAudit,
  fetchAdminOperationsGovernance,
} from "./admin-operations-api";
import "./admin-governance.css";

const AUDIT_PAGE_SIZE = 25;
type LoadState = "loading" | "ready" | "error";

const dateFormatter = new Intl.DateTimeFormat("ar-YE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة.";
}

function sourceLabel(source: OperationsAuditSource): string {
  return {
    auth: "الحسابات",
    access: "الوصول",
    ai_review: "مراجعة AI",
    question_bank: "بنك الأسئلة",
    quiz_builder: "الاختبارات",
  }[source];
}

function eventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    login_success: "تسجيل دخول ناجح",
    login_failure: "محاولة دخول غير ناجحة",
    login_locked: "قفل تسجيل الدخول",
    logout: "تسجيل خروج",
    password_changed: "تغيير كلمة المرور",
    recovery_issued: "إصدار استرداد",
    recovery_used: "استخدام الاسترداد",
    session_revoked: "إلغاء جلسة",
    device_registered: "تسجيل جهاز",
    temporary_password_issued: "إصدار كلمة مرور مؤقتة",
    device_rebind_reset: "السماح بإعادة ربط الجهاز",
    code_generated: "توليد أكواد وصول",
    code_redeemed: "استخدام كود وصول",
    code_revoked: "إيقاف كود وصول",
    entitlement_created: "إنشاء صلاحية",
    entitlement_renewed: "تجديد صلاحية",
    entitlement_revoked: "إلغاء صلاحية",
    create: "إنشاء",
    import: "استيراد",
    edit: "تعديل",
    submit_review: "إرسال للمراجعة",
    approve: "اعتماد",
    reject: "رفض",
    publish: "نشر",
    archive: "أرشفة",
    regenerate: "إعادة توليد",
    version_add: "إضافة نموذج",
    version_update: "تحديث نموذج",
    version_remove: "حذف نموذج",
  };
  return labels[eventType] ?? eventType;
}

function numberLabel(value: number): string {
  return value.toLocaleString("ar-YE");
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="governance-setting-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CountRow({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: number;
  attention?: boolean;
}) {
  return (
    <div className={`governance-count-row${attention && value > 0 ? " is-attention" : ""}`}>
      <span>{label}</span>
      <strong>{numberLabel(value)}</strong>
    </div>
  );
}

function ReportCard({
  title,
  rows,
}: {
  title: string;
  rows: readonly (readonly [string, number])[];
}) {
  return (
    <article className="governance-report-card">
      <h3>{title}</h3>
      <div className="governance-report-rows">
        {rows.map(([label, value]) => (
          <CountRow key={label} label={label} value={value} />
        ))}
      </div>
    </article>
  );
}

function GovernanceSummary({ governance }: { governance: OperationsGovernanceOverview }) {
  const reportGroups = [
    {
      title: "رفع المحتوى والنشر",
      rows: [
        ["مهام جارية", governance.reports.content.activeIngestionTasks],
        ["مهام فاشلة", governance.reports.content.failedIngestionTasks],
        ["أصول مسودة", governance.reports.content.draftAssets],
        ["أصول قيد المراجعة", governance.reports.content.reviewAssets],
        ["أصول منشورة", governance.reports.content.publishedAssets],
      ],
    },
    {
      title: "OCR",
      rows: [
        ["استخراجات جارية", governance.reports.ocr.activeExtractions],
        ["استخراجات فاشلة", governance.reports.ocr.failedExtractions],
        ["بانتظار المراجعة", governance.reports.ocr.pendingReview],
      ],
    },
    {
      title: "عمليات AI",
      rows: [
        ["مهام نشطة", governance.reports.ai.activeJobs],
        ["مهام فاشلة", governance.reports.ai.failedJobs],
        ["وحدات تحتاج مراجعة", governance.reports.ai.reviewRequiredUnits],
      ],
    },
    {
      title: "بنك الأسئلة",
      rows: [
        ["مسودة", governance.reports.questionBank.draft],
        ["مراجعة", governance.reports.questionBank.review],
        ["منشور", governance.reports.questionBank.published],
        ["مؤرشف", governance.reports.questionBank.archived],
      ],
    },
    {
      title: "الاختبارات",
      rows: [
        ["مسودة", governance.reports.quizzes.draft],
        ["مراجعة", governance.reports.quizzes.review],
        ["منشور", governance.reports.quizzes.published],
        ["مؤرشف", governance.reports.quizzes.archived],
      ],
    },
  ] as const;

  return (
    <>
      <section className="governance-section" aria-labelledby="governance-reports-title">
        <div className="governance-section-heading">
          <div>
            <p className="section-kicker">Reports</p>
            <h2 id="governance-reports-title">تقارير الحالة</h2>
          </div>
          <p>قراءة لحظية من جداول المنتج الأساسية دون مستودع تقارير مكرر.</p>
        </div>
        <div className="governance-report-grid">
          {reportGroups.map((group) => (
            <ReportCard key={group.title} title={group.title} rows={group.rows} />
          ))}
        </div>
      </section>

      <div className="governance-two-column">
        <section className="governance-section" aria-labelledby="governance-settings-title">
          <div className="governance-section-heading">
            <div>
              <p className="section-kicker">Settings</p>
              <h2 id="governance-settings-title">وضع الإعدادات</h2>
            </div>
          </div>
          <p className="governance-safe-note">
            يعرض هذا القسم وضع التشغيل فقط. القيم السرية وعناوين الاتصال والمسارات غير متاحة للمتصفح.
          </p>
          <div className="governance-setting-list">
            <SettingRow label="البيئة" value={governance.settings.environment} />
            <SettingRow
              label="اتصال قاعدة البيانات"
              value={governance.settings.databaseSsl === "require" ? "SSL مطلوب" : "SSL غير مطلوب"}
            />
            <SettingRow label="حد اتصالات قاعدة البيانات" value={numberLabel(governance.settings.databasePoolMax)} />
            <SettingRow label="مدة الجلسة" value={`${numberLabel(governance.settings.sessionTtlHours)} ساعة`} />
            <SettingRow label="سياسة SameSite" value={governance.settings.sessionSameSite} />
            <SettingRow label="عدد المصادر المسموحة" value={numberLabel(governance.settings.allowedOriginCount)} />
            <SettingRow
              label="مفتاح إيقاف AI العام"
              value={governance.settings.aiGlobalKillSwitch ? "مفعّل" : "غير مفعّل"}
            />
            <SettingRow
              label="ميزانية AI"
              value={governance.settings.aiBudgetConfigured ? "مضبوطة" : "غير مضبوطة"}
            />
          </div>
        </section>

        <section className="governance-section" aria-labelledby="governance-security-title">
          <div className="governance-section-heading">
            <div>
              <p className="section-kicker">Security</p>
              <h2 id="governance-security-title">حالة الأمان</h2>
            </div>
          </div>
          <div className="governance-setting-list">
            <CountRow label="جلسات الإدارة النشطة" value={governance.security.activeAdminSessions} />
            <CountRow label="جلسات الطلاب النشطة" value={governance.security.activeStudentSessions} />
            <CountRow label="محاولات دخول مقفلة" value={governance.security.lockedLoginGuards} attention />
            <CountRow label="طلبات استرداد معلقة" value={governance.security.pendingRecoveryTokens} attention />
            <CountRow label="أجهزة طلاب نشطة" value={governance.security.activeStudentDevices} />
            <CountRow label="تحديات جهاز معلقة" value={governance.security.pendingDeviceChallenges} attention />
            <CountRow label="تذاكر تفعيل معلقة" value={governance.security.pendingActivationTickets} attention />
            <CountRow label="تغيير كلمة مرور إجباري" value={governance.security.forcedPasswordChanges} attention />
            <CountRow label="مسارات AI متوقفة" value={governance.security.aiRoutesPaused} attention />
            <CountRow label="مسارات AI في تبريد" value={governance.security.aiRoutesCoolingDown} attention />
          </div>
        </section>
      </div>
    </>
  );
}

function AuditRow({ entry }: { entry: OperationsAuditEntry }) {
  const subject = entry.subjectDisplayName ?? entry.actorDisplayName ?? "النظام";
  return (
    <article className="governance-audit-row">
      <div className="governance-audit-main">
        <div className="governance-audit-title">
          <strong>{eventLabel(entry.eventType)}</strong>
          <span className="governance-source-badge">{sourceLabel(entry.source)}</span>
        </div>
        <p>
          {subject}
          {entry.resourceType ? ` · ${entry.resourceType}` : ""}
        </p>
      </div>
      <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
    </article>
  );
}

export function AdminGovernanceWorkspace({
  onSessionExpired,
}: {
  onSessionExpired: () => void;
}) {
  const [governanceState, setGovernanceState] = useState<LoadState>("loading");
  const [auditState, setAuditState] = useState<LoadState>("loading");
  const [governance, setGovernance] = useState<OperationsGovernanceOverview | null>(null);
  const [auditEntries, setAuditEntries] = useState<OperationsAuditEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [source, setSource] = useState<OperationsAuditSource | "">("");
  const [eventTypeInput, setEventTypeInput] = useState("");
  const [eventType, setEventType] = useState("");
  const [offset, setOffset] = useState(0);

  const loadGovernance = useCallback(async () => {
    setGovernanceState("loading");
    setMessage("");
    try {
      setGovernance(await fetchAdminOperationsGovernance());
      setGovernanceState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setMessage(errorMessage(error));
      setGovernanceState("error");
    }
  }, [onSessionExpired]);

  const loadAudit = useCallback(async () => {
    setAuditState("loading");
    try {
      const result = await fetchAdminOperationsAudit({
        ...(source ? { source } : {}),
        ...(eventType ? { eventType } : {}),
        limit: AUDIT_PAGE_SIZE,
        offset,
      });
      setAuditEntries(result.entries);
      setAuditTotal(result.page.total);
      setAuditState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setMessage(errorMessage(error));
      setAuditState("error");
    }
  }, [eventType, offset, onSessionExpired, source]);

  useEffect(() => {
    void loadGovernance();
  }, [loadGovernance]);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  const pageLabel = useMemo(() => {
    if (auditTotal === 0) return "0 من 0";
    return `${offset + 1}–${Math.min(offset + AUDIT_PAGE_SIZE, auditTotal)} من ${auditTotal}`;
  }, [auditTotal, offset]);

  function applyAuditFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setEventType(eventTypeInput.trim());
  }

  return (
    <section className="admin-governance-workspace">
      <header className="page-header governance-page-header">
        <div>
          <p className="eyebrow">Stage 13G · G-C2</p>
          <h1>الحوكمة والأمان</h1>
          <p className="page-description">
            تقارير تشغيلية وحالة إعدادات آمنة ومؤشرات أمنية وسجل تدقيق موحّد، كلها إسقاطات قراءة من
            السلطات الأصلية دون تخزين مكرر أو كشف بيانات حساسة.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void loadGovernance()}>
          تحديث الحالة
        </button>
      </header>

      {governanceState === "loading" ? (
        <div className="workspace-state" aria-live="polite">
          <h2>جارٍ تحميل الحوكمة</h2>
          <p>نقرأ مؤشرات التشغيل والأمان من الخادم.</p>
        </div>
      ) : governanceState === "error" || !governance ? (
        <div className="workspace-state" aria-live="polite">
          <h2>تعذر تحميل الحوكمة</h2>
          <p>{message}</p>
          <button className="secondary-button" type="button" onClick={() => void loadGovernance()}>
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <GovernanceSummary governance={governance} />
      )}

      <section className="governance-section governance-audit-section" aria-labelledby="governance-audit-title">
        <div className="governance-section-heading">
          <div>
            <p className="section-kicker">Audit</p>
            <h2 id="governance-audit-title">سجل التدقيق</h2>
          </div>
          <p>أحداث الحسابات والوصول ومراجعة AI وبنك الأسئلة والاختبارات من سجلاتها الأصلية.</p>
        </div>

        <form className="governance-audit-filters" aria-label="تصفية سجل التدقيق" onSubmit={applyAuditFilters}>
          <label>
            <span>المصدر</span>
            <select
              value={source}
              onChange={(event) => {
                setSource(event.target.value as OperationsAuditSource | "");
                setOffset(0);
              }}
            >
              <option value="">كل المصادر</option>
              <option value="auth">الحسابات</option>
              <option value="access">الوصول</option>
              <option value="ai_review">مراجعة AI</option>
              <option value="question_bank">بنك الأسئلة</option>
              <option value="quiz_builder">الاختبارات</option>
            </select>
          </label>
          <label>
            <span>نوع الحدث (اختياري)</span>
            <input
              value={eventTypeInput}
              onChange={(event) => setEventTypeInput(event.target.value)}
              placeholder="مثال: password_changed"
              maxLength={80}
            />
          </label>
          <button className="secondary-button" type="submit">
            تطبيق
          </button>
        </form>

        {auditState === "loading" ? (
          <p className="governance-audit-state" aria-live="polite">جارٍ تحميل سجل التدقيق…</p>
        ) : auditState === "error" ? (
          <div className="governance-audit-state" aria-live="polite">
            <p>{message}</p>
            <button className="secondary-button" type="button" onClick={() => void loadAudit()}>
              إعادة المحاولة
            </button>
          </div>
        ) : auditEntries.length === 0 ? (
          <p className="governance-audit-state">لا توجد أحداث تطابق التصفية الحالية.</p>
        ) : (
          <div className="governance-audit-list">
            {auditEntries.map((entry) => (
              <AuditRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        <div className="operations-pagination" aria-label="صفحات سجل التدقيق">
          <button
            className="secondary-button small-button"
            type="button"
            disabled={offset === 0 || auditState === "loading"}
            onClick={() => setOffset(Math.max(0, offset - AUDIT_PAGE_SIZE))}
          >
            السابق
          </button>
          <span>{pageLabel}</span>
          <button
            className="secondary-button small-button"
            type="button"
            disabled={offset + AUDIT_PAGE_SIZE >= auditTotal || auditState === "loading"}
            onClick={() => setOffset(offset + AUDIT_PAGE_SIZE)}
          >
            التالي
          </button>
        </div>
      </section>
    </section>
  );
}
