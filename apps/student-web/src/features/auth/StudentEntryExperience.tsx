import { useState } from "react";
import type { FormEvent } from "react";
import {
  completeActivation,
  completeStudentLogin,
  createActivationIdempotencyKey,
  isSixDigitAccessCode,
  normalizeAccessCode,
  startStudentLogin,
  verifyActivation,
  type ActivationVerificationResponse,
  type SessionProfile,
  type StudentLoginChallenge,
} from "../../auth-api";
import {
  ensureDeviceKey,
  requireDeviceKey,
  rotateDeviceKey,
  signDeviceProof,
  type StoredDeviceKey,
} from "../../device-key";
import { StudentBrandLockup } from "../../shared/brand/StudentBrandLockup";
import { FormAlert } from "../../shared/ui/FormAlert";
import { LoadingSpinner } from "../../shared/ui/LoadingSpinner";
import { studentErrorMessage } from "../../student-error-copy";

export type StudentEntryMode = "welcome" | "activation" | "login" | "recovery" | "help" | "support";
export type StudentEntryNotice = { message: string; tone: "success" | "info" };

type PendingPasswordChange = { identifier: string; challenge: StudentLoginChallenge; key: StoredDeviceKey };
const WELCOME_SEEN_KEY = "alwaslh-student:welcome-seen-v1";

export function markStudentWelcomeSeen(): void {
  try { window.localStorage.setItem(WELCOME_SEEN_KEY, "1"); } catch { /* preference only */ }
}

function PasswordFields({ password, confirmation, onPassword, onConfirmation, prefix }: {
  password: string;
  confirmation: string;
  onPassword: (value: string) => void;
  onConfirmation: (value: string) => void;
  prefix: string;
}) {
  const matches = password === confirmation;
  return (
    <>
      <div className="field-group">
        <label htmlFor={`${prefix}-password`}>كلمة المرور</label>
        <input
          id={`${prefix}-password`}
          className="text-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(event) => onPassword(event.target.value)}
          aria-describedby={`${prefix}-password-hint`}
          dir="ltr"
        />
        <p className="field-hint" id={`${prefix}-password-hint`}>8 أحرف على الأقل.</p>
      </div>
      <div className="field-group">
        <label htmlFor={`${prefix}-confirmation`}>تأكيد كلمة المرور</label>
        <input
          id={`${prefix}-confirmation`}
          className="text-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          value={confirmation}
          onChange={(event) => onConfirmation(event.target.value)}
          aria-invalid={confirmation.length > 0 && !matches}
          aria-describedby={confirmation.length > 0 && !matches ? `${prefix}-match-error` : undefined}
          dir="ltr"
        />
        {confirmation.length > 0 && !matches ? <p className="field-error" id={`${prefix}-match-error`}>كلمتا المرور غير متطابقتين.</p> : null}
      </div>
    </>
  );
}

function ActivationForm({ online, onAuthenticated, onLogin }: {
  online: boolean;
  onAuthenticated: (profile: SessionProfile, accountIdentifier: string) => void;
  onLogin: () => void;
}) {
  const [code, setCode] = useState("");
  const [verification, setVerification] = useState<ActivationVerificationResponse | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(createActivationIdempotencyKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedCode = normalizeAccessCode(code).slice(0, 6);

  function reset(nextCode: string) {
    setCode(nextCode);
    setVerification(null);
    setPassword("");
    setConfirmation("");
    setIdempotencyKey(createActivationIdempotencyKey());
    setError(null);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSixDigitAccessCode(normalizedCode) || busy) return;
    if (!online) { setError("اتصل بالإنترنت للتحقق من رمز التفعيل."); return; }
    setBusy(true);
    setError(null);
    try {
      setVerification(await verifyActivation(normalizedCode));
      setIdempotencyKey(createActivationIdempotencyKey());
    } catch (requestError) {
      setError(studentErrorMessage(requestError, "activation"));
    } finally {
      setBusy(false);
    }
  }

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verification || password.length < 8 || password !== confirmation || busy) return;
    if (!online) { setError("اتصل بالإنترنت لإكمال إنشاء الحساب."); return; }
    setBusy(true);
    setError(null);
    try {
      const key = await ensureDeviceKey(verification.accountIdentifier);
      const deviceProof = await signDeviceProof(key, "activation", verification.activationTicket);
      const result = await completeActivation({
        activationTicket: verification.activationTicket,
        password,
        idempotencyKey,
        devicePublicKeySpki: key.publicKeySpki,
        deviceProof,
      });
      if (result.profile.role !== "student") throw new Error("invalid_student_session");
      onAuthenticated(result.profile, result.accountIdentifier);
    } catch (requestError) {
      setError(studentErrorMessage(requestError, "activation"));
    } finally {
      setBusy(false);
    }
  }

  if (verification) {
    return (
      <form className="student-entry-form" onSubmit={complete} noValidate>
        {error ? <FormAlert tone="danger">{error}</FormAlert> : null}
        <FormAlert tone="success">تم التحقق من الرمز. أنشئ كلمة المرور لإكمال التفعيل.</FormAlert>
        <PasswordFields
          password={password}
          confirmation={confirmation}
          onPassword={(value) => { setPassword(value); setError(null); }}
          onConfirmation={setConfirmation}
          prefix="activation"
        />
        {!online ? <FormAlert tone="warning">اتصل بالإنترنت لإكمال التفعيل.</FormAlert> : null}
        <button className="primary-button full-width" type="submit" disabled={password.length < 8 || password !== confirmation || busy || !online}>
          {busy ? <><LoadingSpinner /> جاري إنشاء الحساب</> : "إنشاء الحساب"}
        </button>
        <button className="text-button full-width" type="button" disabled={busy} onClick={() => reset("")}>استخدام رمز مختلف</button>
      </form>
    );
  }

  return (
    <form className="student-entry-form" onSubmit={verify} noValidate>
      {error ? <FormAlert tone="danger">{error}</FormAlert> : null}
      <div className="field-group">
        <label htmlFor="activation-code">رمز التفعيل</label>
        <input
          id="activation-code"
          className="text-input code-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9٠-٩۰-۹]*"
          maxLength={12}
          value={normalizedCode}
          onChange={(event) => reset(event.target.value)}
          aria-describedby="activation-code-hint"
          placeholder="000000"
          dir="ltr"
        />
        <p className="field-hint" id="activation-code-hint">أدخل الرمز المكوّن من 6 أرقام.</p>
      </div>
      {!online ? <FormAlert tone="warning">اتصل بالإنترنت لتفعيل الحساب لأول مرة.</FormAlert> : null}
      <button className="primary-button full-width" type="submit" disabled={!isSixDigitAccessCode(normalizedCode) || busy || !online}>
        {busy ? <><LoadingSpinner /> جاري التحقق</> : "متابعة"}
      </button>
      <button className="text-button full-width" type="button" onClick={onLogin} disabled={busy}>لدي حساب بالفعل</button>
    </form>
  );
}

async function challengeKey(identifier: string, challenge: StudentLoginChallenge): Promise<StoredDeviceKey> {
  return challenge.purpose === "device_rebind" || challenge.purpose === "password_change_rebind"
    ? rotateDeviceKey(identifier)
    : requireDeviceKey(identifier);
}

function LoginForm({ online, notice, onAuthenticated, onRecovery }: {
  online: boolean;
  notice: StudentEntryNotice | null;
  onAuthenticated: (profile: SessionProfile) => void;
  onRecovery: () => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState<PendingPasswordChange | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedIdentifier = normalizeAccessCode(identifier).slice(0, 6);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSixDigitAccessCode(normalizedIdentifier) || !password || busy) return;
    if (!online) { setError("اتصل بالإنترنت لتسجيل الدخول."); return; }
    setBusy(true);
    setError(null);
    try {
      const challenge = await startStudentLogin(normalizedIdentifier, password);
      const key = await challengeKey(normalizedIdentifier, challenge);
      if (challenge.mustChangePassword) {
        setPending({ identifier: normalizedIdentifier, challenge, key });
        setNewPassword("");
        setConfirmation("");
        return;
      }
      const signature = await signDeviceProof(key, challenge.purpose, challenge.challengeToken);
      const result = await completeStudentLogin({
        challengeToken: challenge.challengeToken,
        signature,
        ...(challenge.requiresDeviceRegistration ? { publicKeySpki: key.publicKeySpki } : {}),
      });
      if (result.profile.role !== "student") throw new Error("invalid_student_session");
      onAuthenticated(result.profile);
    } catch (requestError) {
      setError(studentErrorMessage(requestError, "login"));
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending || newPassword.length < 8 || newPassword !== confirmation || busy) return;
    if (!online) { setError("اتصل بالإنترنت لحفظ كلمة المرور الجديدة."); return; }
    setBusy(true);
    setError(null);
    try {
      const signature = await signDeviceProof(pending.key, pending.challenge.purpose, pending.challenge.challengeToken);
      const result = await completeStudentLogin({
        challengeToken: pending.challenge.challengeToken,
        signature,
        newPassword,
        ...(pending.challenge.requiresDeviceRegistration ? { publicKeySpki: pending.key.publicKeySpki } : {}),
      });
      if (result.profile.role !== "student") throw new Error("invalid_student_session");
      onAuthenticated(result.profile);
    } catch (requestError) {
      setError(studentErrorMessage(requestError, "login"));
    } finally {
      setBusy(false);
    }
  }

  if (pending) {
    return (
      <form className="student-entry-form" onSubmit={changePassword} noValidate>
        {error ? <FormAlert tone="danger">{error}</FormAlert> : null}
        <FormAlert tone="info">اختر كلمة مرور جديدة لحسابك.</FormAlert>
        <PasswordFields
          password={newPassword}
          confirmation={confirmation}
          onPassword={(value) => { setNewPassword(value); setError(null); }}
          onConfirmation={setConfirmation}
          prefix="forced-change"
        />
        <button className="primary-button full-width" type="submit" disabled={newPassword.length < 8 || newPassword !== confirmation || busy || !online}>
          {busy ? <><LoadingSpinner /> جاري الحفظ</> : "حفظ كلمة المرور والدخول"}
        </button>
        <button className="text-button full-width" type="button" disabled={busy} onClick={() => setPending(null)}>إلغاء والعودة</button>
      </form>
    );
  }

  return (
    <form className="student-entry-form" onSubmit={submit} noValidate>
      {notice ? <FormAlert tone={notice.tone}>{notice.message}</FormAlert> : null}
      {error ? <FormAlert tone="danger">{error}</FormAlert> : null}
      <div className="field-group">
        <label htmlFor="student-identifier">معرّف الحساب</label>
        <input
          id="student-identifier"
          className="text-input code-input"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          pattern="[0-9٠-٩۰-۹]*"
          maxLength={12}
          value={normalizedIdentifier}
          onChange={(event) => { setIdentifier(event.target.value); setError(null); }}
          aria-describedby="student-identifier-hint"
          placeholder="000000"
          dir="ltr"
        />
        <p className="field-hint" id="student-identifier-hint">رمز الحساب المكوّن من 6 أرقام.</p>
      </div>
      <div className="field-group">
        <div className="label-row">
          <label htmlFor="student-password">كلمة المرور</label>
          <button className="inline-link" type="button" onClick={onRecovery}>نسيت كلمة المرور؟</button>
        </div>
        <input
          id="student-password"
          className="text-input"
          type="password"
          autoComplete="current-password"
          maxLength={128}
          value={password}
          onChange={(event) => { setPassword(event.target.value); setError(null); }}
          placeholder="كلمة المرور"
          dir="ltr"
        />
      </div>
      <button className="primary-button full-width" type="submit" disabled={!isSixDigitAccessCode(normalizedIdentifier) || !password || busy || !online}>
        {busy ? <><LoadingSpinner /> جاري التحقق</> : "تسجيل الدخول"}
      </button>
    </form>
  );
}

function WelcomePanel({ onStart, onLogin, onHelp }: { onStart: () => void; onLogin: () => void; onHelp: () => void }) {
  return (
    <div className="student-welcome-panel">
      <h1>مرحبًا بك في الوسيلة الذكية</h1>
      <p>تعلّم، تدرب، واحتفظ بما تحتاجه في مكان واحد.</p>
      <div className="student-entry-actions">
        <button className="primary-button" type="button" onClick={onStart}>ابدأ التفعيل</button>
        <button className="secondary-button" type="button" onClick={onLogin}>لدي حساب بالفعل</button>
      </div>
      <button className="text-button student-entry-help-link" type="button" onClick={onHelp}>التعليمات</button>
    </div>
  );
}

function Recovery({ onLogin, onSupport }: { onLogin: () => void; onSupport: () => void }) {
  return (
    <div className="student-entry-form">
      <FormAlert tone="info">اطلب كلمة مرور مؤقتة من الجهة التي زودتك برمز التفعيل، ثم ارجع لتسجيل الدخول.</FormAlert>
      <button className="primary-button full-width" type="button" onClick={onLogin}>العودة إلى تسجيل الدخول</button>
      <button className="text-button full-width" type="button" onClick={onSupport}>الدعم</button>
    </div>
  );
}

export function StudentHelpContent() {
  return (
    <div className="student-guidance">
      <header><h1>التعليمات</h1><p>أهم ما تحتاجه لاستخدام مساحة الطالب.</p></header>
      <ul className="student-guidance-steps">
        <li><span>1</span><div><strong>فعّل حسابك أو سجّل الدخول</strong><p>استخدم رمز التفعيل أول مرة، وبعدها معرّف الحساب وكلمة المرور.</p></div></li>
        <li><span>2</span><div><strong>افتح التعلّم</strong><p>اختر المادة ثم افتح الوحدة والدرس.</p></div></li>
        <li><span>3</span><div><strong>استخدم التدريب</strong><p>راجع ما تعلمته من التدريبات والاختبارات المتاحة.</p></div></li>
        <li><span>4</span><div><strong>استخدم مكتبتي</strong><p>ارجع إلى تنزيلاتك والعناصر الشخصية عندما تتوفر.</p></div></li>
      </ul>
    </div>
  );
}

export function StudentSupportContent() {
  return (
    <div className="student-guidance">
      <header><h1>الدعم</h1><p>إذا تعذر عليك الدخول أو الوصول إلى المحتوى، استخدم الجهة التي سلمتك رمز التفعيل.</p></header>
      <div className="student-support-contact" role="note">
        <strong>عند طلب المساعدة</strong>
        <p>اذكر معرّف الحساب ووصف المشكلة فقط، ولا تشارك كلمة المرور.</p>
      </div>
    </div>
  );
}

export function StudentEntryExperience({ online, mode, notice, onMode, onAuthenticated }: {
  online: boolean;
  mode: StudentEntryMode;
  notice: StudentEntryNotice | null;
  onMode: (mode: StudentEntryMode) => void;
  onAuthenticated: (profile: SessionProfile, accountIdentifier?: string) => void;
}) {
  const authMode = mode === "activation" || mode === "login" || mode === "recovery";
  const title = mode === "activation" ? "تفعيل الحساب" : mode === "login" ? "تسجيل الدخول" : "استعادة الحساب";
  const description = mode === "activation"
    ? "أدخل رمز التفعيل للمتابعة."
    : mode === "login"
      ? "أدخل معرّف حسابك وكلمة المرور."
      : "استعد الوصول إلى حسابك بخطوات واضحة.";

  return (
    <main className="student-entry-page">
      <div className="student-entry-shell">
        <header className="student-entry-topbar">
          <StudentBrandLockup />
          {!online ? <span className="student-entry-offline" role="status">غير متصل</span> : null}
        </header>

        <section className={`student-entry-main ${authMode ? "is-auth" : "is-info"}`}>
          {mode === "welcome" ? (
            <WelcomePanel
              onStart={() => { markStudentWelcomeSeen(); onMode("activation"); }}
              onLogin={() => { markStudentWelcomeSeen(); onMode("login"); }}
              onHelp={() => onMode("help")}
            />
          ) : null}

          {authMode ? (
            <div className="student-auth-surface">
              <div className="student-auth-switch" aria-label="طريقة الدخول">
                <button type="button" className={mode === "activation" ? "is-active" : ""} onClick={() => onMode("activation")}>تفعيل جديد</button>
                <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => onMode("login")}>تسجيل الدخول</button>
              </div>
              <header className="student-auth-heading"><h1>{title}</h1><p>{description}</p></header>
              {mode === "activation" ? <ActivationForm online={online} onAuthenticated={(profile, accountIdentifier) => onAuthenticated(profile, accountIdentifier)} onLogin={() => onMode("login")} /> : null}
              {mode === "login" ? <LoginForm online={online} notice={notice} onAuthenticated={(profile) => onAuthenticated(profile)} onRecovery={() => onMode("recovery")} /> : null}
              {mode === "recovery" ? <Recovery onLogin={() => onMode("login")} onSupport={() => onMode("support")} /> : null}
            </div>
          ) : null}

          {mode === "help" ? <StudentHelpContent /> : null}
          {mode === "support" ? <StudentSupportContent /> : null}
        </section>

        <footer className="student-entry-footer">
          {mode !== "welcome" ? <button className="text-button" type="button" onClick={() => onMode("welcome")}>الرئيسية</button> : null}
          <button className="text-button" type="button" onClick={() => onMode("help")}>التعليمات</button>
          <button className="text-button" type="button" onClick={() => onMode("support")}>الدعم</button>
        </footer>
      </div>
    </main>
  );
}

export function StudentPublicInfoPage({ kind }: { kind: "help" | "support" }) {
  return (
    <main className="student-entry-page student-public-info-page">
      <div className="student-entry-shell">
        <header className="student-entry-topbar">
          <StudentBrandLockup />
          <a className="secondary-button student-public-back" href="/app/home">العودة للتطبيق</a>
        </header>
        <section className="student-entry-main is-info">{kind === "help" ? <StudentHelpContent /> : <StudentSupportContent />}</section>
      </div>
    </main>
  );
}
