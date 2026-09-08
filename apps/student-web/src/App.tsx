import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ApiRequestError,
  completeActivation,
  completeStudentLogin,
  createActivationIdempotencyKey,
  isMissingSessionError,
  isSixDigitAccessCode,
  listStudentEntitlements,
  logoutStudent,
  normalizeAccessCode,
  restoreStudentSession,
  startStudentLogin,
  verifyActivation,
} from "./auth-api";
import type {
  ActivationVerificationResponse,
  EntitlementView,
  SessionProfile,
  StudentLoginChallenge,
} from "./auth-api";
import {
  ensureDeviceKey,
  requireDeviceKey,
  rotateDeviceKey,
  signDeviceProof,
  type StoredDeviceKey,
} from "./device-key";

type EntryMode = "activation" | "login" | "recovery";
type SessionPhase = "checking" | "anonymous" | "authenticated" | "offline" | "unavailable";

type AccessState =
  | { status: "loading" }
  | { status: "ready"; entitlements: EntitlementView[] }
  | { status: "offline" }
  | { status: "error"; message: string };

interface PendingPasswordChange {
  identifier: string;
  challenge: StudentLoginChallenge;
  key: StoredDeviceKey;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error && error.message === "device_key_missing") {
    return "لا يوجد مفتاح الجهاز المسجل على هذا المتصفح. تواصل مع الإدارة لإعادة ربط جهازك.";
  }
  if (error instanceof Error && error.message === "device_crypto_unavailable") {
    return "هذا المتصفح لا يدعم حماية مفتاح الجهاز المطلوبة. استخدم متصفحًا حديثًا وآمنًا.";
  }
  return "تعذر إكمال الطلب. حاول مرة أخرى.";
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

function Brand() {
  return (
    <div className="brand-lockup" aria-label="الوسيلة الذكية — مساحة الطالب">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" focusable="false">
          <path d="M13 20c0-3 2-5 5-5h10c4 0 7 1 10 4 3-3 6-4 10-4h2c3 0 5 2 5 5v25c0 3-2 5-5 5h-8c-5 0-9 2-12 6-3-4-7-6-12-6h-5c-3 0-5-2-5-5V20Z" />
          <path d="M32 19v30" />
        </svg>
      </span>
      <span className="brand-copy">
        <strong>الوسيلة الذكية</strong>
        <small>مساحة الطالب</small>
      </span>
    </div>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function ConnectionBanner() {
  return (
    <div className="connection-banner" role="status" aria-live="polite">
      <span className="status-dot" aria-hidden="true" />
      <span>أنت غير متصل الآن. لن نرسل بيانات الدخول حتى يعود الاتصال.</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="center-state" aria-busy="true">
      <Brand />
      <div className="state-panel" role="status" aria-live="polite">
        <Spinner />
        <div>
          <h1>نتحقق من جلستك</h1>
          <p>نتأكد من أن الحساب والجهاز المسجل ما زالا صالحين قبل عرض أي بيانات خاصة.</p>
        </div>
      </div>
    </main>
  );
}

function ConnectionGate({ kind, onRetry }: { kind: "offline" | "unavailable"; onRetry: () => void }) {
  const offline = kind === "offline";
  return (
    <main className="center-state">
      <Brand />
      <section className="state-panel" aria-labelledby="connection-title">
        <span className={`state-icon ${offline ? "is-warning" : "is-danger"}`} aria-hidden="true">
          {offline ? "!" : "×"}
        </span>
        <div>
          <p className="eyebrow">{offline ? "بدون اتصال" : "تعذر الوصول"}</p>
          <h1 id="connection-title">{offline ? "نحتاج اتصالًا للتحقق من الحساب" : "لم نستطع الاتصال بالخدمة"}</h1>
          <p>
            {offline
              ? "لن نتجاوز التحقق الأمني للجلسة أو الجهاز. أعد المحاولة بعد عودة الشبكة."
              : "لم نعتبر هذا تسجيل خروج. أعد المحاولة عندما تصبح الخدمة متاحة."}
          </p>
          <button className="primary-button" type="button" onClick={onRetry} disabled={offline && !navigator.onLine}>
            إعادة المحاولة
          </button>
        </div>
      </section>
    </main>
  );
}

function FormAlert({ tone, children }: { tone: "danger" | "warning" | "success" | "info"; children: ReactNode }) {
  const role = tone === "danger" ? "alert" : "status";
  return (
    <div className={`form-alert is-${tone}`} role={role} aria-live={tone === "danger" ? "assertive" : "polite"}>
      {children}
    </div>
  );
}

function PasswordFields({
  password,
  confirmation,
  onPassword,
  onConfirmation,
  prefix,
}: {
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
        <label htmlFor={`${prefix}-password`}>كلمة المرور الخاصة بك</label>
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
        <p className="field-hint" id={`${prefix}-password-hint`}>
          8 أحرف على الأقل. لا نخزن كلمة المرور في المتصفح.
        </p>
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
        {confirmation.length > 0 && !matches ? (
          <p className="field-error" id={`${prefix}-match-error`}>
            كلمتا المرور غير متطابقتين.
          </p>
        ) : null}
      </div>
    </>
  );
}

function ActivationForm({
  online,
  onAuthenticated,
  onLogin,
}: {
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
  const canVerify = isSixDigitAccessCode(normalizedCode);
  const canComplete = Boolean(verification) && password.length >= 8 && password === confirmation;

  function resetVerification(nextCode: string) {
    setCode(nextCode);
    setVerification(null);
    setPassword("");
    setConfirmation("");
    setIdempotencyKey(createActivationIdempotencyKey());
    setError(null);
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canVerify || busy) return;
    if (!online) {
      setError("يلزم اتصال بالشبكة للتحقق من رمز التفعيل.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await verifyActivation(normalizedCode);
      setVerification(result);
      setIdempotencyKey(createActivationIdempotencyKey());
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verification || !canComplete || busy) return;
    if (!online) {
      setError("يلزم اتصال بالشبكة لإتمام التفعيل.");
      return;
    }
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
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (verification) {
    return (
      <form className="auth-form" onSubmit={handleComplete} noValidate>
        {error ? <FormAlert tone="danger">{error}</FormAlert> : null}
        <FormAlert tone="success">
          تم التحقق من الرمز <span className="account-identifier">{verification.accountIdentifier}</span> دون استهلاكه.
          لن يُستهلك إلا بعد اكتمال إنشاء الحساب والجهاز بنجاح.
        </FormAlert>
        <PasswordFields
          password={password}
          confirmation={confirmation}
          onPassword={(value) => {
            setPassword(value);
            setError(null);
          }}
          onConfirmation={setConfirmation}
          prefix="activation"
        />
        {!online ? <FormAlert tone="warning">يلزم اتصال بالشبكة قبل إتمام التفعيل.</FormAlert> : null}
        <button className="primary-button full-width" type="submit" disabled={!canComplete || busy || !online}>
          {busy ? (
            <>
              <Spinner /> جاري إنشاء الحساب
            </>
          ) : (
            "إنشاء الحساب وتسجيل هذا الجهاز"
          )}
        </button>
        <button className="text-button full-width" type="button" disabled={busy} onClick={() => resetVerification("")}>
          استخدام رمز مختلف
        </button>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleVerify} noValidate>
      {error ? <FormAlert tone="danger">{error}</FormAlert> : null}
      <div className="field-group">
        <label htmlFor="activation-code">رمز الوصول الكامل</label>
        <input
          id="activation-code"
          className="text-input code-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9٠-٩۰-۹]*"
          maxLength={12}
          value={normalizedCode}
          onChange={(event) => resetVerification(event.target.value)}
          aria-describedby="activation-code-hint"
          placeholder="000000"
          dir="ltr"
        />
        <p className="field-hint" id="activation-code-hint">
          نتحقق أولًا من صلاحية الرمز المكوّن من 6 أرقام دون استهلاكه، ثم تختار كلمة مرورك.
        </p>
      </div>
      {!online ? <FormAlert tone="warning">يلزم اتصال بالشبكة قبل التحقق من الرمز.</FormAlert> : null}
      <button className="primary-button full-width" type="submit" disabled={!canVerify || busy || !online}>
        {busy ? (
          <>
            <Spinner /> جاري التحقق
          </>
        ) : (
          "متابعة التفعيل"
        )}
      </button>
      <button className="text-button full-width" type="button" onClick={onLogin} disabled={busy}>
        لدي حساب بالفعل
      </button>
    </form>
  );
}

async function deviceKeyForChallenge(
  identifier: string,
  challenge: StudentLoginChallenge,
): Promise<StoredDeviceKey> {
  if (challenge.purpose === "device_rebind" || challenge.purpose === "password_change_rebind") {
    return rotateDeviceKey(identifier);
  }
  return requireDeviceKey(identifier);
}

function LoginForm({
  online,
  notice,
  onAuthenticated,
  onRecovery,
}: {
  online: boolean;
  notice: string | null;
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
  const valid = isSixDigitAccessCode(normalizedIdentifier) && password.length >= 1;

  async function finishChallenge(challenge: StudentLoginChallenge, accountIdentifier: string, key: StoredDeviceKey) {
    const signature = await signDeviceProof(key, challenge.purpose, challenge.challengeToken);
    const result = await completeStudentLogin({
      challengeToken: challenge.challengeToken,
      signature,
      ...(challenge.requiresDeviceRegistration ? { publicKeySpki: key.publicKeySpki } : {}),
    });
    if (result.profile.role !== "student") throw new Error("invalid_student_session");
    onAuthenticated(result.profile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    if (!online) {
      setError("أنت غير متصل. أعد المحاولة بعد عودة الشبكة.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const challenge = await startStudentLogin(normalizedIdentifier, password);
      const key = await deviceKeyForChallenge(normalizedIdentifier, challenge);
      if (challenge.mustChangePassword) {
        setPending({ identifier: normalizedIdentifier, challenge, key });
        setNewPassword("");
        setConfirmation("");
        return;
      }
      await finishChallenge(challenge, normalizedIdentifier, key);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending || newPassword.length < 8 || newPassword !== confirmation || busy) return;
    if (!online) {
      setError("يلزم اتصال بالشبكة لتغيير كلمة المرور.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const signature = await signDeviceProof(
        pending.key,
        pending.challenge.purpose,
        pending.challenge.challengeToken,
      );
      const result = await completeStudentLogin({
        challengeToken: pending.challenge.challengeToken,
        signature,
        newPassword,
        ...(pending.challenge.requiresDeviceRegistration ? { publicKeySpki: pending.key.publicKeySpki } : {}),
      });
      if (result.profile.role !== "student") throw new Error("invalid_student_session");
      onAuthenticated(result.profile);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (pending) {
    return (
      <form className="auth-form" onSubmit={handlePasswordChange} noValidate>
        {error ? <FormAlert tone="danger">{error}</FormAlert> : null}
        <FormAlert tone="info">
          كلمة المرور التي أدخلتها مؤقتة. اختر الآن كلمة مرور خاصة بك قبل الدخول.
          {pending.challenge.requiresDeviceRegistration ? " سيُسجل هذا الجهاز أيضًا بعد موافقتك." : ""}
        </FormAlert>
        <PasswordFields
          password={newPassword}
          confirmation={confirmation}
          onPassword={(value) => {
            setNewPassword(value);
            setError(null);
          }}
          onConfirmation={setConfirmation}
          prefix="forced-change"
        />
        <button
          className="primary-button full-width"
          type="submit"
          disabled={newPassword.length < 8 || newPassword !== confirmation || busy || !online}
        >
          {busy ? (
            <>
              <Spinner /> جاري الحفظ
            </>
          ) : (
            "حفظ كلمة المرور والدخول"
          )}
        </button>
        <button className="text-button full-width" type="button" disabled={busy} onClick={() => setPending(null)}>
          إلغاء والعودة
        </button>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {notice ? <FormAlert tone="success">{notice}</FormAlert> : null}
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
          onChange={(event) => {
            setIdentifier(event.target.value);
            setError(null);
          }}
          aria-describedby="student-identifier-hint"
          placeholder="000000"
          dir="ltr"
        />
        <p className="field-hint" id="student-identifier-hint">
          هو رمز الوصول الكامل ذو 6 أرقام الذي فعّلت به حسابك.
        </p>
      </div>
      <div className="field-group">
        <div className="label-row">
          <label htmlFor="student-password">كلمة المرور</label>
          <button className="inline-link" type="button" onClick={onRecovery}>
            نسيت كلمة المرور؟
          </button>
        </div>
        <input
          id="student-password"
          className="text-input"
          type="password"
          autoComplete="current-password"
          maxLength={128}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
          placeholder="كلمة المرور"
          dir="ltr"
        />
      </div>
      <FormAlert tone="info">بعد كلمة المرور نتحقق من مفتاح هذا الجهاز. لا نستخدم عنوان IP أو بصمة المتصفح كهوية.</FormAlert>
      <button className="primary-button full-width" type="submit" disabled={!valid || busy || !online}>
        {busy ? (
          <>
            <Spinner /> جاري التحقق
          </>
        ) : (
          "تسجيل الدخول"
        )}
      </button>
    </form>
  );
}

function RecoveryInfo({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="auth-form">
      <FormAlert tone="info">
        استعادة الحساب تتم بمساعدة الإدارة: اطلب كلمة مرور مؤقتة، ثم ارجع إلى شاشة الدخول وأدخلها. سيطلب منك النظام
        فورًا اختيار كلمة مرور خاصة جديدة، وتُلغى الجلسات السابقة تلقائيًا.
      </FormAlert>
      <div className="empty-state">
        <strong>إذا فقدت الجهاز أيضًا</strong>
        <p>اطلب من الإدارة إعادة ربط الجهاز. بعد ذلك سيُنشئ هذا المتصفح مفتاح جهاز جديدًا عند تسجيل الدخول.</p>
      </div>
      <button className="primary-button full-width" type="button" onClick={onLogin}>
        العودة إلى تسجيل الدخول
      </button>
    </div>
  );
}

function EntryPage({
  online,
  mode,
  notice,
  onMode,
  onAuthenticated,
}: {
  online: boolean;
  mode: EntryMode;
  notice: string | null;
  onMode: (mode: EntryMode) => void;
  onAuthenticated: (profile: SessionProfile, accountIdentifier?: string) => void;
}) {
  const heading =
    mode === "activation"
      ? ["تفعيل حساب جديد", "نتحقق من الرمز أولًا دون استهلاكه، ثم تنشئ كلمة مرورك ونسجل مفتاح هذا الجهاز."]
      : mode === "login"
        ? ["لدي حساب بالفعل", "أدخل معرّفك وكلمة المرور. سيؤكد هذا الجهاز امتلاكه للمفتاح المسجل قبل إنشاء الجلسة."]
        : ["استعادة الحساب", "لا نرسل روابط أو رموز استرداد سرية إلى المتصفح؛ الاستعادة تبدأ من الإدارة."];

  return (
    <main className="entry-page">
      <div className="entry-layout">
        <section className="entry-intro" aria-labelledby="welcome-title">
          <Brand />
          <div className="intro-copy">
            <p className="eyebrow">مرحبًا بك</p>
            <h1 id="welcome-title">تعلّمك في مكان واحد، بدخول بسيط وآمن.</h1>
            <p>مساحة الطالب منفصلة عن الإدارة، وتعمل من المتصفح ويمكن تثبيتها كتطبيق ويب.</p>
          </div>
          <ul className="trust-list" aria-label="مزايا الدخول">
            <li>
              <span>01</span>
              <div>
                <strong>تفعيل بلا هدر</strong>
                <small>التحقق لا يستهلك رمزك؛ الاستهلاك يحدث فقط بعد اكتمال الحساب.</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>جهاز مسجل</strong>
                <small>مفتاح تشفيري خاص بالتطبيق، وليس بصمة متصفح أو عنوان شبكة.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>استعادة واضحة</strong>
                <small>كلمة مؤقتة من الإدارة ثم تغيير إجباري إلى كلمة خاصة بك.</small>
              </div>
            </li>
          </ul>
          <p className="privacy-note">مفتاح الجهاز الخاص يبقى داخل تخزين المتصفح ولا يُرسل إلى الخادم.</p>
        </section>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="mode-switch" aria-label="طريقة الدخول">
            <button
              type="button"
              className={mode === "activation" ? "is-active" : ""}
              aria-pressed={mode === "activation"}
              onClick={() => onMode("activation")}
            >
              تفعيل جديد
            </button>
            <button
              type="button"
              className={mode === "login" ? "is-active" : ""}
              aria-pressed={mode === "login"}
              onClick={() => onMode("login")}
            >
              لدي حساب بالفعل
            </button>
          </div>
          <div className="auth-heading">
            <p className="eyebrow">{mode === "recovery" ? "مساعدة الدخول" : "مساحة الطالب"}</p>
            <h2 id="auth-title">{heading[0]}</h2>
            <p>{heading[1]}</p>
          </div>
          {mode === "activation" ? (
            <ActivationForm
              online={online}
              onAuthenticated={(profile, accountIdentifier) => onAuthenticated(profile, accountIdentifier)}
              onLogin={() => onMode("login")}
            />
          ) : mode === "login" ? (
            <LoginForm
              online={online}
              notice={notice}
              onAuthenticated={(profile) => onAuthenticated(profile)}
              onRecovery={() => onMode("recovery")}
            />
          ) : (
            <RecoveryInfo onLogin={() => onMode("login")} />
          )}
        </section>
      </div>
    </main>
  );
}

function AccountPage({ profile, online, onLoggedOut }: { profile: SessionProfile; online: boolean; onLoggedOut: () => void }) {
  const [access, setAccess] = useState<AccessState>({ status: "loading" });
  const [busy, setBusy] = useState(false);

  async function loadAccess() {
    if (!navigator.onLine) {
      setAccess({ status: "offline" });
      return;
    }
    setAccess({ status: "loading" });
    try {
      setAccess({ status: "ready", entitlements: await listStudentEntitlements() });
    } catch (error) {
      setAccess({ status: "error", message: errorMessage(error) });
    }
  }

  useEffect(() => {
    void loadAccess();
  }, []);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      if (online) await logoutStudent();
    } finally {
      setBusy(false);
      onLoggedOut();
    }
  }

  return (
    <main className="account-page">
      <header className="account-header">
        <Brand />
        <div className="account-status">
          <span className={`status-dot ${online ? "is-online" : ""}`} aria-hidden="true" />
          {online ? "متصل" : "غير متصل"}
        </div>
      </header>
      {!online ? <ConnectionBanner /> : null}
      <section className="account-summary">
        <div>
          <p className="eyebrow">تم تسجيل الدخول</p>
          <h1>{profile.displayName ?? "مساحة الطالب"}</h1>
          <p>تم التحقق من الجلسة والجهاز المسجل. تظهر هنا صلاحيات الوصول الحالية فقط.</p>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout} disabled={busy}>
          {busy ? "جاري الخروج" : "تسجيل الخروج"}
        </button>
      </section>
      <section className="access-section" aria-labelledby="access-title">
        <div className="section-heading">
          <h2 id="access-title">صلاحيات الوصول</h2>
          <button className="text-button" type="button" onClick={() => void loadAccess()} disabled={!online}>
            تحديث
          </button>
        </div>
        {access.status === "loading" ? (
          <div className="inline-state" role="status">
            <Spinner /> جاري تحميل الصلاحيات
          </div>
        ) : access.status === "offline" ? (
          <FormAlert tone="warning">يلزم اتصال لعرض حالة الصلاحيات المحدثة. وضع التعلم دون اتصال سيُبنى في مرحلته المخصصة.</FormAlert>
        ) : access.status === "error" ? (
          <FormAlert tone="danger">{access.message}</FormAlert>
        ) : access.entitlements.length === 0 ? (
          <div className="empty-state">
            <strong>لا توجد صلاحيات فعالة</strong>
            <p>أضف رمز صف من شاشة الوصول عندما تصبح هذه الميزة متاحة في واجهة الطالب الكاملة.</p>
          </div>
        ) : (
          <ul className="entitlement-list">
            {access.entitlements.map((entitlement) => (
              <li key={entitlement.id}>
                <span className="entitlement-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>{entitlement.scope === "all_content" ? "وصول كامل" : "وصول إلى صف"}</strong>
                  <small>
                    {entitlement.expiresAt
                      ? `صالح حتى ${new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(new Date(entitlement.expiresAt))}`
                      : "بدون تاريخ انتهاء محدد"}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function App() {
  const online = useOnlineStatus();
  const [phase, setPhase] = useState<SessionPhase>("checking");
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [mode, setMode] = useState<EntryMode>("activation");
  const [notice, setNotice] = useState<string | null>(null);

  async function checkSession() {
    if (!navigator.onLine) {
      setPhase("offline");
      return;
    }
    setPhase("checking");
    try {
      const restored = await restoreStudentSession();
      if (restored.role !== "student") {
        await logoutStudent().catch(() => undefined);
        setProfile(null);
        setPhase("anonymous");
        return;
      }
      setProfile(restored);
      setPhase("authenticated");
    } catch (error) {
      if (isMissingSessionError(error)) {
        setProfile(null);
        setPhase("anonymous");
      } else if (error instanceof ApiRequestError && error.code === "SERVICE_UNAVAILABLE") {
        setPhase(navigator.onLine ? "unavailable" : "offline");
      } else {
        setPhase("unavailable");
      }
    }
  }

  useEffect(() => {
    void checkSession();
  }, []);

  if (phase === "checking") return <LoadingScreen />;
  if (phase === "offline") return <ConnectionGate kind="offline" onRetry={() => void checkSession()} />;
  if (phase === "unavailable") return <ConnectionGate kind="unavailable" onRetry={() => void checkSession()} />;

  if (phase === "authenticated" && profile) {
    return (
      <div className="app-frame">
        <AccountPage
          profile={profile}
          online={online}
          onLoggedOut={() => {
            setProfile(null);
            setNotice(null);
            setMode("login");
            setPhase("anonymous");
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-frame">
      {!online ? <ConnectionBanner /> : null}
      <EntryPage
        online={online}
        mode={mode}
        notice={notice}
        onMode={(nextMode) => {
          setMode(nextMode);
          if (nextMode !== "login") setNotice(null);
        }}
        onAuthenticated={(nextProfile, accountIdentifier) => {
          setProfile(nextProfile);
          if (accountIdentifier) {
            setNotice(`تم تفعيل الحساب ${accountIdentifier} وتسجيل هذا الجهاز بنجاح.`);
          }
          setPhase("authenticated");
        }}
      />
    </div>
  );
}
