import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiRequestError,
  createAccessRedemptionIdempotencyKey,
  isMissingSessionError,
  isSevenDigitClassCode,
  listStudentEntitlements,
  normalizeAccessCode,
  redeemStudentAccess,
  type EntitlementView,
} from "./auth-api";

type AccountAccessState =
  | { status: "loading" }
  | { status: "ready"; entitlements: EntitlementView[] }
  | { status: "offline" }
  | { status: "error"; message: string };

function requestMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية الآن. حاول مرة أخرى.";
}

function expiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return "مستمر حاليًا";
  return `حتى ${new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium" }).format(new Date(expiresAt))}`;
}

export function StudentAccountExperience({ online, onSessionExpired, onAccessChanged }: {
  online: boolean;
  onSessionExpired: () => void;
  onAccessChanged: () => void;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<AccountAccessState>({ status: online ? "loading" : "offline" });
  const [classCode, setClassCode] = useState("");
  const [redemptionKey, setRedemptionKey] = useState(createAccessRedemptionIdempotencyKey);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const normalizedClassCode = normalizeAccessCode(classCode).slice(0, 7);
  const entitlements = state.status === "ready" ? state.entitlements : [];
  const hasFullAccess = entitlements.some((entitlement) => entitlement.scope === "all_content");

  async function loadAccess() {
    if (!online) {
      setState({ status: "offline" });
      return;
    }
    setState({ status: "loading" });
    try {
      setState({ status: "ready", entitlements: await listStudentEntitlements() });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({ status: "error", message: requestMessage(error) });
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
    try {
      await redeemStudentAccess(normalizedClassCode, redemptionKey);
      setClassCode("");
      setRedemptionKey(createAccessRedemptionIdempotencyKey());
      await loadAccess();
      onAccessChanged();
      navigate("/app/learn", { state: { accessActivated: true } });
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
    <div className="student-account-experience">
      <section className="student-account-section" aria-labelledby="active-access-title">
        <div className="student-account-section__heading">
          <div><p className="eyebrow">المحتوى المتاح</p><h2 id="active-access-title">وصولك الحالي</h2><p>هنا ترى ما هو متاح لحسابك الآن.</p></div>
          <button className="text-button" type="button" onClick={() => void loadAccess()} disabled={!online || state.status === "loading"}>تحديث</button>
        </div>
        {state.status === "loading" ? (
          <div className="student-b05-skeleton" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">جاري تحميل وصولك الحالي</span><span /><span /></div>
        ) : state.status === "offline" ? (
          <div className="student-b05-state is-warning" role="status"><strong>أنت غير متصل الآن</strong><p>يمكنك متابعة ما سبق تنزيله. اتصل بالإنترنت لتحديث الوصول أو إضافة رمز صف.</p></div>
        ) : state.status === "error" ? (
          <div className="student-b05-state is-error" role="alert"><strong>تعذر تحميل الوصول</strong><p>{state.message}</p><button className="secondary-button" type="button" onClick={() => void loadAccess()} disabled={!online}>إعادة المحاولة</button></div>
        ) : entitlements.length === 0 ? (
          <div className="student-b05-state is-empty"><strong>لا توجد صفوف مفعّلة لحسابك الآن</strong><p>إذا حصلت على رمز صف، أضفه من القسم التالي ليظهر محتواه في التعلم.</p></div>
        ) : (
          <ul className="student-access-list" aria-label="الوصول الحالي">
            {entitlements.map((entitlement) => (
              <li key={entitlement.id}><span className="student-access-list__mark" aria-hidden="true">✓</span><span><strong>{entitlement.scope === "all_content" ? "كل المحتوى المتاح" : "صف مفعّل"}</strong><small>{expiryLabel(entitlement.expiresAt)}</small></span></li>
            ))}
          </ul>
        )}
      </section>

      <section className="student-account-section student-account-activation" aria-labelledby="class-code-title">
        <div className="student-account-section__heading"><div><p className="eyebrow">إضافة صف</p><h2 id="class-code-title">لديك رمز صف جديد؟</h2><p>اكتب الرمز المكوّن من 7 أرقام كما استلمته.</p></div></div>
        {hasFullAccess ? (
          <div className="student-b05-state is-info" role="status"><strong>لديك وصول كامل</strong><p>لا تحتاج إلى إضافة رمز صف آخر الآن.</p></div>
        ) : (
          <form className="student-account-code-form" onSubmit={handleRedeem} noValidate>
            {redeemError ? <div className="form-alert is-danger" role="alert">{redeemError}</div> : null}
            <div className="field-group">
              <label htmlFor="class-access-code">رمز الصف</label>
              <div className="student-account-code-row">
                <input id="class-access-code" className="text-input class-code-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9٠-٩۰-۹]*" maxLength={14} value={normalizedClassCode} onChange={(event) => { setClassCode(event.target.value); setRedemptionKey(createAccessRedemptionIdempotencyKey()); setRedeemError(null); }} aria-describedby="class-access-code-hint" placeholder="0000000" dir="ltr" />
                <button className="primary-button" type="submit" disabled={!isSevenDigitClassCode(normalizedClassCode) || redeemBusy || !online}>{redeemBusy ? "جاري التفعيل" : "تفعيل الصف"}</button>
              </div>
              <p className="field-hint" id="class-access-code-hint">يمكنك استخدام الأرقام العربية أو الإنجليزية.</p>
            </div>
            {!online ? <div className="form-alert is-warning" role="status">اتصل بالإنترنت لتفعيل رمز الصف.</div> : null}
          </form>
        )}
      </section>
    </div>
  );
}
