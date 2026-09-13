import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type AdminStudentAccount,
  type AdminStudentDetail,
  type AdminStudentSort,
  type AdminStudentStatus,
  allowStudentDeviceRebind,
  fetchAdminStudentDetail,
  fetchAdminStudents,
  issueStudentTemporaryPassword,
  revokeStudentEntitlement,
} from "../../admin-student-access-api";
import "../../admin-student-access.css";

const PAGE_SIZE = 25;

type LoadState = "loading" | "ready" | "error";
type Feedback = { kind: "busy" | "success" | "error"; message: string } | null;

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

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "نشط",
    inactive: "غير نشط",
    archived: "مؤرشف",
    redeemed: "مستخدم",
    expired: "منتهي",
    revoked: "موقوف",
  };
  return labels[status] ?? status;
}

function eventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    login_success: "تسجيل دخول ناجح",
    login_failure: "محاولة دخول غير ناجحة",
    login_locked: "قفل مؤقت لتسجيل الدخول",
    logout: "تسجيل خروج",
    password_changed: "تغيير كلمة المرور",
    recovery_issued: "إصدار استعادة",
    recovery_used: "استخدام الاستعادة",
    session_revoked: "إلغاء جلسة",
    device_registered: "تسجيل جهاز",
    device_challenge_issued: "إصدار تحقق الجهاز",
    device_challenge_verified: "نجاح تحقق الجهاز",
    temporary_password_issued: "إصدار كلمة مرور مؤقتة",
    device_rebind_reset: "السماح بإعادة ربط الجهاز",
    full_code_redeemed: "استخدام كود شامل",
    class_code_redeemed: "استخدام كود صف",
    entitlement_revoked: "إلغاء صلاحية",
    code_revoked: "إيقاف كود غير مستخدم",
  };
  return labels[eventType] ?? eventType;
}

export function AdminStudentsPage({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminStudentStatus | "">("");
  const [sort, setSort] = useState<AdminStudentSort>("created_at");
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [students, setStudents] = useState<AdminStudentAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminStudentDetail | null>(null);
  const [detailState, setDetailState] = useState<LoadState>("loading");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const handleError = useCallback(
    (error: unknown) => {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return true;
      }
      return false;
    },
    [onSessionExpired],
  );

  const loadStudents = useCallback(async () => {
    setState("loading");
    try {
      const result = await fetchAdminStudents({
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        sort,
        direction: "desc",
        limit: PAGE_SIZE,
        offset,
      });
      setStudents(result.students);
      setTotal(result.page.total);
      setState("ready");
      setSelectedId((current) => {
        if (current && result.students.some((item) => item.id === current)) return current;
        return result.students[0]?.id ?? null;
      });
    } catch (error) {
      if (!handleError(error)) {
        setState("error");
        setFeedback({ kind: "error", message: errorMessage(error) });
      }
    }
  }, [handleError, offset, search, sort, status]);

  const loadDetail = useCallback(
    async (profileId: string) => {
      setDetailState("loading");
      try {
        const result = await fetchAdminStudentDetail(profileId, 25, 0);
        setDetail(result);
        setDetailState("ready");
      } catch (error) {
        if (!handleError(error)) {
          setDetail(null);
          setDetailState("error");
          setFeedback({ kind: "error", message: errorMessage(error) });
        }
      }
    },
    [handleError],
  );

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [loadDetail, selectedId]);

  function selectStudent(profileId: string): void {
    if (profileId !== selectedId) {
      setTemporaryPassword(null);
      setFeedback(null);
    }
    setSelectedId(profileId);
  }

  async function refreshSelected(): Promise<void> {
    if (selectedId) await loadDetail(selectedId);
    await loadStudents();
  }

  async function mutateStudent(action: () => Promise<void>, successMessage: string): Promise<void> {
    setFeedback({ kind: "busy", message: "جارٍ تنفيذ العملية…" });
    try {
      await action();
      setFeedback({ kind: "success", message: successMessage });
      await refreshSelected();
    } catch (error) {
      if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  async function issueTemporaryPassword(): Promise<void> {
    if (!selectedId) return;
    setFeedback({ kind: "busy", message: "جارٍ إصدار كلمة المرور المؤقتة…" });
    setTemporaryPassword(null);
    try {
      const result = await issueStudentTemporaryPassword(selectedId);
      setTemporaryPassword(result.temporaryPassword);
      setFeedback({
        kind: "success",
        message: `تم إصدار كلمة مرور مؤقتة صالحة لمدة ${result.expiresInHours} ساعة. اعرضها للطالب الآن فقط.`,
      });
      await refreshSelected();
    } catch (error) {
      if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="admin-access-workspace">
      <header className="page-header access-page-header">
        <div>
          <p className="eyebrow">الطلاب والدعم</p>
          <h1>الطلاب</h1>
          <p className="page-description">
            ابحث عن حساب طالب واحد وافحص صلاحياته وجهازه وسجل الوصول، ثم نفّذ إجراءات الدعم المسموحة من خلال السلطات الخلفية الحالية.
          </p>
        </div>
      </header>

      <div className="access-panel-grid">
        <section className="access-list-panel" aria-labelledby="students-heading">
          <div className="access-section-heading">
            <div>
              <p className="section-kicker">الحسابات</p>
              <h2 id="students-heading">حسابات الطلاب</h2>
            </div>
            <span className="count-pill" aria-label={`${total} طالب`}>
              {total}
            </span>
          </div>

          <form
            className="access-filter-grid"
            aria-label="فلترة حسابات الطلاب"
            onSubmit={(event) => {
              event.preventDefault();
              setOffset(0);
              setSearch(searchInput.trim());
            }}
          >
            <label className="access-search-field">
              <span>بحث بالمعرّف أو الاسم</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="مثال: student-001"
                autoComplete="off"
              />
            </label>
            <label>
              <span>الحالة</span>
              <select
                value={status}
                onChange={(event) => {
                  setOffset(0);
                  setStatus(event.target.value as AdminStudentStatus | "");
                }}
              >
                <option value="">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="archived">مؤرشف</option>
              </select>
            </label>
            <label>
              <span>الترتيب</span>
              <select
                value={sort}
                onChange={(event) => {
                  setOffset(0);
                  setSort(event.target.value as AdminStudentSort);
                }}
              >
                <option value="created_at">الأحدث إنشاءً</option>
                <option value="last_login">آخر تسجيل دخول</option>
                <option value="identifier">المعرّف</option>
                <option value="status">الحالة</option>
              </select>
            </label>
            <button className="secondary-button access-filter-button" type="submit">
              تطبيق البحث
            </button>
          </form>

          {state === "loading" ? (
            <WorkspaceState title="جارٍ تحميل الطلاب" body="نقرأ الحسابات والصلاحيات الحالية." />
          ) : state === "error" ? (
            <WorkspaceState title="تعذر تحميل الطلاب" body="أعد المحاولة بعد التحقق من الاتصال.">
              <button className="secondary-button" type="button" onClick={() => void loadStudents()}>
                إعادة المحاولة
              </button>
            </WorkspaceState>
          ) : students.length === 0 ? (
            <WorkspaceState title="لا توجد نتائج" body="غيّر البحث أو الفلاتر لعرض حسابات أخرى." />
          ) : (
            <div className="student-card-list">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className={`student-card${selectedId === student.id ? " is-selected" : ""}`}
                  onClick={() => selectStudent(student.id)}
                  aria-pressed={selectedId === student.id}
                >
                  <span className="student-card-title">
                    <strong>{student.displayName || student.identifier}</strong>
                    <span className={`status-badge status-${student.status}`}>{statusLabel(student.status)}</span>
                  </span>
                  <code>{student.identifier}</code>
                  <span className="student-card-metrics">
                    <span>{student.activeEntitlementCount} صلاحية نشطة</span>
                    <span>{student.hasActiveDevice ? "جهاز مرتبط" : "لا يوجد جهاز نشط"}</span>
                  </span>
                  {(student.recoveryRequired || student.deviceRebindAllowed) && (
                    <span className="student-attention">يحتاج متابعة وصول</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <Pagination
            pageNumber={pageNumber}
            pageCount={pageCount}
            canPrevious={offset > 0}
            canNext={offset + PAGE_SIZE < total}
            onPrevious={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            onNext={() => setOffset(offset + PAGE_SIZE)}
          />
        </section>

        <section className="access-detail-panel" aria-labelledby="student-detail-heading">
          {!selectedId ? (
            <WorkspaceState title="اختر طالبًا" body="ستظهر هنا الصلاحيات والجهاز وسجل الوصول." />
          ) : detailState === "loading" ? (
            <WorkspaceState title="جارٍ تحميل تفاصيل الطالب" body="نقرأ الحالة الحالية وسجل العمليات." />
          ) : detailState === "error" || !detail ? (
            <WorkspaceState title="تعذر تحميل التفاصيل" body="حاول فتح الحساب مرة أخرى." />
          ) : (
            <>
              <div className="access-detail-heading">
                <div>
                  <p className="section-kicker">تفاصيل الحساب</p>
                  <h2 id="student-detail-heading">{detail.displayName || detail.identifier}</h2>
                  <code>{detail.identifier}</code>
                </div>
                <span className={`status-badge status-${detail.status}`}>{statusLabel(detail.status)}</span>
              </div>

              {feedback && (
                <div className={`mutation-feedback is-${feedback.kind}`} aria-live="polite">
                  {feedback.message}
                </div>
              )}

              {temporaryPassword && (
                <div className="temporary-password-box" role="status">
                  <span>كلمة المرور المؤقتة — تظهر في هذه الجلسة فقط</span>
                  <code>{temporaryPassword}</code>
                </div>
              )}

              <div className="student-summary-grid">
                <SummaryMetric label="الصلاحيات النشطة" value={String(detail.activeEntitlementCount)} />
                <SummaryMetric label="الصفوف النشطة" value={String(detail.activeClassCount)} />
                <SummaryMetric label="الجلسات النشطة" value={String(detail.activeSessionCount)} />
                <SummaryMetric label="آخر دخول" value={formatDate(detail.lastLoginAt)} compact />
              </div>

              <section className="student-action-section" aria-labelledby="recovery-heading">
                <div>
                  <h3 id="recovery-heading">الاستعادة والجهاز</h3>
                  <p>هذه العمليات تستخدم AuthService الحالي وتلغي الجلسات القديمة عند الحاجة.</p>
                </div>
                <div className="student-action-row">
                  <button className="secondary-button" type="button" onClick={() => void issueTemporaryPassword()}>
                    إصدار كلمة مرور مؤقتة
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      void mutateStudent(
                        () => allowStudentDeviceRebind(detail.id),
                        "تم السماح بإعادة ربط جهاز جديد للطالب.",
                      )
                    }
                  >
                    السماح بإعادة ربط الجهاز
                  </button>
                </div>
              </section>

              <DetailSection title="الصلاحيات الحالية">
                {detail.entitlements.length === 0 ? (
                  <p className="empty-inline">لا توجد صلاحيات مسجلة.</p>
                ) : (
                  <div className="detail-record-list">
                    {detail.entitlements.map((entitlement) => (
                      <article className="detail-record" key={entitlement.id}>
                        <div>
                          <strong>
                            {entitlement.scope === "all_content"
                              ? "كل المحتوى"
                              : entitlement.className || "صلاحية صف"}
                          </strong>
                          <span>
                            {statusLabel(entitlement.status)} · تنتهي {formatDate(entitlement.expiresAt)}
                          </span>
                        </div>
                        {entitlement.status === "active" && (
                          <button
                            className="secondary-button small-button danger-button"
                            type="button"
                            onClick={() =>
                              void mutateStudent(
                                () => revokeStudentEntitlement(entitlement.id),
                                "تم إلغاء الصلاحية وتسجيل العملية في سجل الوصول.",
                              )
                            }
                          >
                            إلغاء الصلاحية
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </DetailSection>

              <DetailSection title="الأجهزة">
                {detail.devices.length === 0 ? (
                  <p className="empty-inline">لا يوجد سجل أجهزة.</p>
                ) : (
                  <div className="detail-record-list">
                    {detail.devices.map((device) => (
                      <article className="detail-record" key={device.id}>
                        <div>
                          <strong>{device.label || "جهاز الطالب"}</strong>
                          <span>سُجل {formatDate(device.registeredAt)}</span>
                        </div>
                        <span className={`status-badge ${device.active ? "status-active" : "status-inactive"}`}>
                          {device.active ? "نشط" : "ملغى"}
                        </span>
                      </article>
                    ))}
                  </div>
                )}
              </DetailSection>

              <DetailSection title={`عمليات الاسترداد (${detail.redemptionTotal})`}>
                {detail.redemptions.length === 0 ? (
                  <p className="empty-inline">لم يستخدم الطالب أكواد وصول بعد.</p>
                ) : (
                  <div className="detail-record-list">
                    {detail.redemptions.map((redemption) => (
                      <article className="detail-record" key={redemption.id}>
                        <div>
                          <strong>{redemption.codeType === "full_access" ? "كود شامل" : "كود صف"}</strong>
                          <span>{formatDate(redemption.redeemedAt)}</span>
                        </div>
                        <code>{redemption.code ?? "—"}</code>
                      </article>
                    ))}
                  </div>
                )}
              </DetailSection>

              <DetailSection title={`سجل النشاط (${detail.activityTotal})`}>
                {detail.activity.length === 0 ? (
                  <p className="empty-inline">لا توجد أحداث مسجلة.</p>
                ) : (
                  <div className="activity-list">
                    {detail.activity.map((activity) => (
                      <div className="activity-row" key={`${activity.source}-${activity.id}`}>
                        <span>{eventLabel(activity.eventType)}</span>
                        <time dateTime={activity.createdAt}>{formatDate(activity.createdAt)}</time>
                      </div>
                    ))}
                  </div>
                )}
              </DetailSection>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`student-summary-card${compact ? " is-compact" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="student-detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function WorkspaceState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="access-workspace-state" aria-live="polite">
      <strong>{title}</strong>
      <p>{body}</p>
      {children}
    </div>
  );
}

function Pagination({
  pageNumber,
  pageCount,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  pageNumber: number;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <nav className="access-pagination" aria-label="التنقل بين الصفحات">
      <button className="secondary-button small-button" type="button" disabled={!canPrevious} onClick={onPrevious}>
        السابق
      </button>
      <span>
        صفحة {pageNumber} من {pageCount}
      </span>
      <button className="secondary-button small-button" type="button" disabled={!canNext} onClick={onNext}>
        التالي
      </button>
    </nav>
  );
}
