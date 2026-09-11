import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ApiRequestError,
  createAccessRedemptionIdempotencyKey,
  isMissingSessionError,
  isSevenDigitClassCode,
  listStudentEntitlements,
  normalizeAccessCode,
  redeemStudentAccess,
} from "./auth-api";
import type { EntitlementView } from "./auth-api";
import { StudentAssessmentSection } from "./student-assessment";
import { StudentCurriculumSection } from "./student-curriculum";
import { StudentOfflineDownloadsSection } from "./student-offline-downloads";

type AccessState =
  | { status: "loading" }
  | { status: "ready"; entitlements: EntitlementView[] }
  | { status: "offline" }
  | { status: "error"; message: string };

function requestMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال الطلب. حاول مرة أخرى.";
}

function expiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return "بدون تاريخ انتهاء محدد";
  return `صالح حتى ${new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium" }).format(new Date(expiresAt))}`;
}

export function StudentAccessSection({
  online,
  onSessionExpired,
}: {
  online: boolean;
  onSessionExpired: () => void;
}) {
  const [access, setAccess] = useState<AccessState>({ status: "loading" });
  const [classCode, setClassCode] = useState("");
  const [redemptionKey, setRedemptionKey] = useState(createAccessRedemptionIdempotencyKey);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [curriculumRefreshKey, setCurriculumRefreshKey] = useState(0);

  const normalizedClassCode = normalizeAccessCode(classCode).slice(0, 7);
  const entitlements = access.status === "ready" ? access.entitlements : [];
  const hasFullAccess = entitlements.some((entitlement) => entitlement.scope === "all_content");

  async function loadAccess() {
    if (!online) {
      setAccess({ status: "offline" });
      return;
    }

    setAccess({ status: "loading" });
    try {
      setAccess({ status: "ready", entitlements: await listStudentEntitlements() });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setAccess({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => {
    void loadAccess();
  }, [online]);

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSevenDigitClassCode(normalizedClassCode) || redeemBusy || !online || hasFullAccess) return;

    setRedeemBusy(true);
    setRedeemError(null);
    setRedeemSuccess(null);
    try {
      await redeemStudentAccess(normalizedClassCode, redemptionKey);
      setClassCode("");
      setRedemptionKey(createAccessRedemptionIdempotencyKey());
      setRedeemSuccess("تم تفعيل وصول الصف بنجاح.");
      await loadAccess();
      setCurriculumRefreshKey((current) => current + 1);
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setRedeemError(requestMessage(error));
    } finally {
      setRedeemBusy(false);
    }
  }

  return (
    <>
      <StudentCurriculumSection
        online={online}
        refreshKey={curriculumRefreshKey}
        onSessionExpired={onSessionExpired}
      />

      <StudentAssessmentSection
        online={online}
        refreshKey={curriculumRefreshKey}
        onSessionExpired={onSessionExpired}
      />

      <StudentOfflineDownloadsSection
        online={online}
        refreshKey={curriculumRefreshKey}
        onSessionExpired={onSessionExpired}
      />

      <section className="access-section" aria-labelledby="access-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">إدارة الوصول</p>
            <h2 id="access-title">صلاحياتك ورموز الصفوف</h2>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => void loadAccess()}
            disabled={!online || access.status === "loading"}
          >
            تحديث
          </button>
        </div>

        {access.status === "loading" ? (
          <div className="access-skeleton" role="status" aria-live="polite" aria-busy="true">
            <span className="sr-only">جاري تحميل صلاحيات الوصول</span>
            <span />
            <span />
            <span />
          </div>
        ) : access.status === "offline" ? (
          <div className="form-alert is-warning" role="status">
            لا يمكن التحقق من صلاحيات جديدة وأنت غير متصل. أعد الاتصال قبل تفعيل رمز صف أو تحديث صلاحياتك.
          </div>
        ) : access.status === "error" ? (
          <div className="access-error" role="alert">
            <div className="form-alert is-danger">{access.message}</div>
            <button className="secondary-button" type="button" onClick={() => void loadAccess()} disabled={!online}>
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {entitlements.length === 0 ? (
              <div className="empty-state">
                <strong>لا توجد صلاحيات فعالة الآن</strong>
                <p>أضف رمز صف صالحًا من 7 أرقام. لن يعرض التطبيق محتوى جديدًا قبل قبول الخادم للرمز.</p>
              </div>
            ) : (
              <ul className="entitlement-list" aria-label="صلاحيات الوصول الفعالة">
                {entitlements.map((entitlement) => (
                  <li key={entitlement.id}>
                    <span className="entitlement-icon" aria-hidden="true">
                      ✓
                    </span>
                    <div>
                      <strong>{entitlement.scope === "all_content" ? "وصول كامل" : "وصول إلى صف"}</strong>
                      <small>{expiryLabel(entitlement.expiresAt)}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="access-tools" aria-labelledby="class-code-title">
              <div className="access-tools-heading">
                <div>
                  <h3 id="class-code-title">إضافة رمز صف</h3>
                  <p>رمز الصف مكوّن من 7 أرقام، ويُستخدم فقط بعد أن يقبله الخادم.</p>
                </div>
              </div>

              {hasFullAccess ? (
                <div className="form-alert is-info" role="status">
                  لديك وصول كامل فعّال، لذلك لا تحتاج إلى استخدام رمز صف الآن. سيبقى الرمز صالحًا بدل استهلاكه بلا حاجة.
                </div>
              ) : (
                <form className="access-redeem-form" onSubmit={handleRedeem} noValidate>
                  {redeemSuccess ? (
                    <div className="form-alert is-success" role="status">
                      {redeemSuccess}
                    </div>
                  ) : null}
                  {redeemError ? (
                    <div className="form-alert is-danger" role="alert">
                      {redeemError}
                    </div>
                  ) : null}
                  <div className="field-group">
                    <label htmlFor="class-access-code">رمز الصف</label>
                    <div className="access-code-row">
                      <input
                        id="class-access-code"
                        className="text-input class-code-input"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9٠-٩۰-۹]*"
                        maxLength={14}
                        value={normalizedClassCode}
                        onChange={(event) => {
                          setClassCode(event.target.value);
                          setRedemptionKey(createAccessRedemptionIdempotencyKey());
                          setRedeemError(null);
                          setRedeemSuccess(null);
                        }}
                        aria-describedby="class-access-code-hint"
                        placeholder="0000000"
                        dir="ltr"
                      />
                      <button
                        className="primary-button"
                        type="submit"
                        disabled={!isSevenDigitClassCode(normalizedClassCode) || redeemBusy || !online}
                      >
                        {redeemBusy ? "جاري التفعيل" : "تفعيل الصف"}
                      </button>
                    </div>
                    <p className="field-hint" id="class-access-code-hint">
                      ندعم الأرقام العربية والإنجليزية، ويظل قرار الصلاحية والتجديد لدى الخادم.
                    </p>
                  </div>
                  {!online ? (
                    <div className="form-alert is-warning" role="status">
                      يلزم اتصال بالشبكة لتفعيل رمز الصف.
                    </div>
                  ) : null}
                </form>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
