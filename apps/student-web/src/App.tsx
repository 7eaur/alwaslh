import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  activateStudent,
  ApiRequestError,
  createActivationIdempotencyKey,
  isMissingSessionError,
  isSixDigitAccessCode,
  listStudentEntitlements,
  loginStudent,
  logoutStudent,
  normalizeAccessCode,
  resetStudentPassword,
  restoreStudentSession,
} from "./auth-api";
import type { EntitlementView, SessionProfile } from "./auth-api";

type EntryMode = "activation" | "login" | "recovery";
type SessionPhase = "checking" | "anonymous" | "authenticated" | "offline" | "unavailable";

type AccessState =
  | { status: "loading" }
  | { status: "ready"; entitlements: EntitlementView[] }
  | { status: "offline" }
  | { status: "error"; message: string };

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
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
          <p>لحظة قصيرة للتأكد من أن الحساب ما زال صالحًا قبل عرض أي بيانات خاصة.</p>
        </div>
      </div>
    </main>
  );
}

interface ConnectionGateProps {
  kind: "offline" | "unavailable";
  onRetry: () => void;
}

function ConnectionGate({ kind, onRetry }: ConnectionGateProps) {
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
              ? "الدخول دون تحقق قد يعرض بيانات حساب غير صالحة، لذلك لن نتجاوز فحص الجلسة."
              : "لم نعتبر هذا تسجيل خروج. أعد المحاولة عندما يكون الاتصال بالخدمة متاحًا."}
          </p>
          <button className="primary-button" type="button" onClick={onRetry} disabled={offline && !navigator.onLine}>
            إعادة المحاولة
          </button>
        </div>
      </section>
    </main>
  );
}

interface FormAlertProps {
  tone: "danger" | "warning" | "success" | "info";
  children: React.ReactNode;
}

function FormAlert({ tone, children }: FormAlertProps) {
  const role = tone === "danger" ? "alert" : "status";
  return (
    <div className={`form-alert is-${tone}`} role={role} aria-live={tone === "danger" ? "assertive" : "polite"}>
      {children}
    </div>
  );
}

interface ActivationFormProps {
  online: boolean;
  onAuthenticated: (profile: SessionProfile, accountIdentifier: string) => void;
  onLogin: () => void;
}

function ActivationForm({ online, onAuthenticated, onLogin }: ActivationFormProps) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(createActivationIdempotencyKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedCode = normalizeAccessCode(code).slice(0, 6);
  const passwordMatches = password === confirmation;
  const valid = isSixDigitAccessCode(normalizedCode) && password.length >= 8 && passwordMatches;

  function changeCode(value: string) {
    setCode(value);
    setError(null);
    setIdempotencyKey(createActivationIdempotencyKey());
  }

  function changePassword(value: string) {
    setPassword(value);
    setError(null);
    setIdempotencyKey(createActivationIdempotencyKey());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    if (!online) {
      setError("يلزم اتصال بالشبكة لإتمام التفعيل.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await activateStudent(normalizedCode, password, idempotencyKey);
      if (result.profile.role !== "student") {
        setError("تعذر إنشاء جلسة طالب صالحة.");
        return;
      }
      onAuthenticated(result.profile, result.accountIdentifier);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          onChange={(event) => changeCode(event.target.value)}
          aria-describedby="activation-code-hint"
          placeholder="000000"
          dir="ltr"
        />
        <p className="field-hint" id="activation-code-hint">
          أدخل رمز الوصول الكامل المكوّن من 6 أرقام. سيصبح هذا الرمز معرّف حسابك بعد نجاح التفعيل.
        </p>
      </div>

      <div className="field-group">
        <label htmlFor="activation-password">أنشئ كلمة مرور</label>
        <input
          id="activation-password"
          className="text-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(event) => changePassword(event.target.value)}
          aria-describedby="activation-password-hint"
          dir="ltr"
        />
        <p className="field-hint" id="activation-password-hint">8 أحرف على الأقل. لا نخزن كلمة المرور في المتصفح.</p>
      </div>

      <div className="field-group">
        <label htmlFor="activation-password-confirmation">تأكيد كلمة المرور</label>
        <input
          id="activation-password-confirmation"
          className="text-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          aria-invalid={confirmation.length > 0 && !passwordMatches}
          aria-describedby={confirmation.length > 0 && !passwordMatches ? "activation-password-match-error" : undefined}
          dir="ltr"
        />
        {confirmation.length > 0 && !passwordMatches ? (
          <p className="field-error" id="activation-password-match-error">كلمتا المرور غير متطابقتين.</p>
        ) : null}
      </div>

      {!online ? <FormAlert tone="warning">يلزم اتصال بالشبكة قبل إرسال بيانات التفعيل.</FormAlert> : null}

      <button className="primary-button full-width" type="submit" disabled={!valid || busy || !online}>
        {busy ? <><Spinner /> جاري التفعيل</> : "تفعيل الحساب"}
      </button>
      <button className="text-button full-width" type="button" onClick={onLogin} disabled={busy}>
        لدي حساب بالفعل
      </button>
    </form>
  );
}

interface LoginFormProps {
  online: boolean;
  notice: string | null;
  onAuthenticated: (profile: SessionProfile) => void;
  onRecovery: () => void;
}

function LoginForm({ online, notice, onAuthenticated, onRecovery }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedIdentifier = normalizeAccessCode(identifier).slice(0, 6);
  const valid = isSixDigitAccessCode(normalizedIdentifier) && password.length >= 1;

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
      const profile = await loginStudent(normalizedIdentifier, password);
      if (profile.role !== "student") {
        void logoutStudent().catch(() => undefined);
        setError("هذا الحساب ليس حساب طالب. استخدم بوابة الإدارة للحسابات الإدارية.");
        return;
      }
      onAuthenticated(profile);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
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
          onChange={(event) => setIdentifier(event.target.value)}
          aria-describedby="student-identifier-hint"
          placeholder="000000"
          dir="ltr"
        />
        <p className="field-hint" id="student-identifier-hint">هو رمز الوصول الكامل ذو 6 أرقام الذي فعّلت به حسابك.</p>
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
          onChange={(event) => setPassword(event.target.value)}
          placeholder="كلمة المرور"
          dir="ltr"
        />
      </div>

      <button className="primary-button full-width" type="submit" disabled={!valid || busy || !online}>
        {busy ? <><Spinner /> جاري تسجيل الدخول</> : "تسجيل الدخول"}
      </button>
    </form>
  );
}

interface RecoveryFormProps {
  online: boolean;
  onReset: () => void;
  onLogin: () => void;
}

function RecoveryForm({ online, onReset, onLogin }: RecoveryFormProps) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordMatches = password === confirmation;
  const valid = token.trim().length >= 32 && password.length >= 8 && passwordMatches;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    if (!online) {
      setError("يلزم اتصال بالشبكة لتغيير كلمة المرور.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await resetStudentPassword(token.trim(), password);
      onReset();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormAlert tone="info">
        إذا كان لديك رمز استرداد صالح يمكنك تعيين كلمة مرور جديدة هنا. إصدار الرمز يتم عبر مسار الدعم الإداري الموثق حاليًا.
      </FormAlert>
      {error ? <FormAlert tone="danger">{error}</FormAlert> : null}

      <div className="field-group">
        <label htmlFor="recovery-token">رمز الاسترداد</label>
        <input
          id="recovery-token"
          className="text-input"
          type="text"
          autoComplete="one-time-code"
          minLength={32}
          maxLength={128}
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="ألصق رمز الاسترداد"
          dir="ltr"
        />
      </div>

      <div className="field-group">
        <label htmlFor="new-password">كلمة المرور الجديدة</label>
        <input
          id="new-password"
          className="text-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-describedby="new-password-hint"
          dir="ltr"
        />
        <p className="field-hint" id="new-password-hint">8 أحرف على الأقل.</p>
      </div>

      <div className="field-group">
        <label htmlFor="confirm-password">تأكيد كلمة المرور</label>
        <input
          id="confirm-password"
          className="text-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          aria-invalid={confirmation.length > 0 && !passwordMatches}
          aria-describedby={confirmation.length > 0 && !passwordMatches ? "password-match-error" : undefined}
          dir="ltr"
        />
        {confirmation.length > 0 && !passwordMatches ? (
          <p className="field-error" id="password-match-error">كلمتا المرور غير متطابقتين.</p>
        ) : null}
      </div>

      <button className="primary-button full-width" type="submit" disabled={!valid || busy || !online}>
        {busy ? <><Spinner /> جاري التحديث</> : "تعيين كلمة مرور جديدة"}
      </button>
      <button className="text-button full-width" type="button" onClick={onLogin} disabled={busy}>
        العودة لتسجيل الدخول
      </button>
    </form>
  );
}

interface EntryScreenProps {
  mode: EntryMode;
  online: boolean;
  notice: string | null;
  onModeChange: (mode: EntryMode) => void;
  onAuthenticated: (profile: SessionProfile, accountIdentifier?: string) => void;
  onRecoveryReset: () => void;
}

function EntryScreen({ mode, online, notice, onModeChange, onAuthenticated, onRecoveryReset }: EntryScreenProps) {
  const headings: Record<EntryMode, { eyebrow: string; title: string; description: string }> = {
    activation: {
      eyebrow: "طالب جديد",
      title: "فعّل وصولك",
      description: "رمز الوصول الكامل يثبت حق التفعيل مرة واحدة، ثم يصبح معرّف حسابك للدخول لاحقًا مع كلمة المرور.",
    },
    login: {
      eyebrow: "مرحبًا بعودتك",
      title: "سجّل دخولك",
      description: "استخدم معرّف الحساب المكوّن من 6 أرقام وكلمة المرور. الجلسة تعتمد على تحقق الخادم فقط.",
    },
    recovery: {
      eyebrow: "استرداد آمن",
      title: "غيّر كلمة المرور",
      description: "الاسترداد يعيّن كلمة مرور جديدة ولا يعرض كلمة المرور القديمة مطلقًا.",
    },
  };
  const heading = headings[mode];

  return (
    <main className="entry-page">
      <div className="entry-layout">
        <aside className="entry-intro" aria-label="معلومات الدخول">
          <Brand />
          <div className="intro-copy">
            <p className="eyebrow">تعلم بهدوء، وادخل بأمان</p>
            <h1>ابدأ من المكان الصحيح.</h1>
            <p>فصلنا التفعيل عن الدخول والاسترداد حتى تكون كل خطوة واضحة ولا تعتمد على حالة مخفية في الجهاز.</p>
          </div>
          <ul className="trust-list">
            <li><span aria-hidden="true">01</span><div><strong>تفعيل جديد</strong><small>رمز وصول كامل من 6 أرقام + كلمة مرور.</small></div></li>
            <li><span aria-hidden="true">02</span><div><strong>عودة للحساب</strong><small>المعرّف ذو 6 أرقام + كلمة المرور.</small></div></li>
            <li><span aria-hidden="true">03</span><div><strong>استرداد آمن</strong><small>إعادة تعيين السر بدل استعراض كلمة المرور.</small></div></li>
          </ul>
          <p className="privacy-note">لا نحفظ كلمة المرور أو رمز التفعيل في تخزين المتصفح من هذه الواجهة.</p>
        </aside>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="mode-switch" role="navigation" aria-label="خيارات حساب الطالب">
            <button type="button" className={mode === "activation" ? "is-active" : ""} aria-current={mode === "activation" ? "page" : undefined} onClick={() => onModeChange("activation")}>تفعيل</button>
            <button type="button" className={mode === "login" ? "is-active" : ""} aria-current={mode === "login" ? "page" : undefined} onClick={() => onModeChange("login")}>دخول</button>
            <button type="button" className={mode === "recovery" ? "is-active" : ""} aria-current={mode === "recovery" ? "page" : undefined} onClick={() => onModeChange("recovery")}>استرداد</button>
          </div>

          <header className="auth-heading">
            <p className="eyebrow">{heading.eyebrow}</p>
            <h2 id="auth-title">{heading.title}</h2>
            <p>{heading.description}</p>
          </header>

          {mode === "activation" ? (
            <ActivationForm
              online={online}
              onAuthenticated={(studentProfile, accountIdentifier) => onAuthenticated(studentProfile, accountIdentifier)}
              onLogin={() => onModeChange("login")}
            />
          ) : null}
          {mode === "login" ? (
            <LoginForm
              online={online}
              notice={notice}
              onAuthenticated={(studentProfile) => onAuthenticated(studentProfile)}
              onRecovery={() => onModeChange("recovery")}
            />
          ) : null}
          {mode === "recovery" ? (
            <RecoveryForm online={online} onReset={onRecoveryReset} onLogin={() => onModeChange("login")} />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "بدون تاريخ انتهاء";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "تاريخ الانتهاء غير متاح";
  return new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium" }).format(date);
}

interface AuthenticatedScreenProps {
  profile: SessionProfile;
  online: boolean;
  activationIdentifier: string | null;
  onLoggedOut: () => void;
}

function AuthenticatedScreen({ profile, online, activationIdentifier, onLoggedOut }: AuthenticatedScreenProps) {
  const [access, setAccess] = useState<AccessState>(online ? { status: "loading" } : { status: "offline" });
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function loadEntitlements() {
    if (!navigator.onLine) {
      setAccess({ status: "offline" });
      return;
    }
    setAccess({ status: "loading" });
    try {
      const entitlements = await listStudentEntitlements();
      setAccess({ status: "ready", entitlements });
    } catch (requestError) {
      setAccess({ status: "error", message: errorMessage(requestError) });
    }
  }

  useEffect(() => {
    void loadEntitlements();
  }, []);

  async function handleLogout() {
    if (!online || logoutBusy) return;
    setLogoutBusy(true);
    setLogoutError(null);
    try {
      await logoutStudent();
      onLoggedOut();
    } catch (requestError) {
      setLogoutError(errorMessage(requestError));
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <main className="account-page">
      <header className="account-header">
        <Brand />
        <div className="account-status" role="status">
          <span className={online ? "status-dot is-online" : "status-dot"} aria-hidden="true" />
          {online ? "جلسة طالب موثقة" : "غير متصل"}
        </div>
      </header>

      {activationIdentifier ? (
        <FormAlert tone="success">
          تم تفعيل الحساب. معرّف دخولك هو <bdi className="account-identifier">{activationIdentifier}</bdi>. استخدمه مع كلمة المرور عند العودة.
        </FormAlert>
      ) : null}

      <section className="account-summary" aria-labelledby="account-title">
        <div>
          <p className="eyebrow">تم التحقق من الحساب</p>
          <h1 id="account-title">أهلًا {profile.displayName?.trim() || "بك"}</h1>
          <p>هذه شاشة نجاح لمسار الحساب فقط. بقية تجربة الطالب تأتي في مرحلة منتج الطالب بعد إغلاق التفعيل.</p>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout} disabled={!online || logoutBusy}>
          {logoutBusy ? "جاري الخروج…" : "تسجيل الخروج"}
        </button>
      </section>

      {logoutError ? <FormAlert tone="danger">{logoutError}</FormAlert> : null}

      <section className="access-section" aria-labelledby="access-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">صلاحية الوصول</p>
            <h2 id="access-title">الوصول المرتبط بالحساب</h2>
          </div>
          <button className="text-button" type="button" onClick={() => void loadEntitlements()} disabled={!online || access.status === "loading"}>
            تحديث
          </button>
        </div>

        {access.status === "loading" ? <div className="inline-state" role="status"><Spinner /> جاري التحقق من الصلاحيات…</div> : null}
        {access.status === "offline" ? <FormAlert tone="warning">لا نعرض صلاحيات مخزنة على أنها محدثة. أعد الاتصال للتحقق من الوصول.</FormAlert> : null}
        {access.status === "error" ? <FormAlert tone="danger">{access.message}</FormAlert> : null}
        {access.status === "ready" && access.entitlements.length === 0 ? (
          <div className="empty-state">
            <strong>لا توجد صلاحية نشطة</strong>
            <p>الحساب صالح، لكن الخادم لم يُرجع أي صلاحية وصول نشطة.</p>
          </div>
        ) : null}
        {access.status === "ready" && access.entitlements.length > 0 ? (
          <ul className="entitlement-list">
            {access.entitlements.map((entitlement) => (
              <li key={entitlement.id}>
                <span className="entitlement-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>{entitlement.scope === "all_content" ? "وصول كامل" : "وصول صف"}</strong>
                  <small>{formatDate(entitlement.expiresAt)}</small>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}

export function App() {
  const online = useOnlineStatus();
  const [phase, setPhase] = useState<SessionPhase>("checking");
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [activationIdentifier, setActivationIdentifier] = useState<string | null>(null);
  const [mode, setMode] = useState<EntryMode>(() =>
    window.location.pathname.includes("student-login") ? "login" : "activation",
  );
  const [notice, setNotice] = useState<string | null>(null);

  async function restoreSession() {
    if (!navigator.onLine) {
      setPhase("offline");
      return;
    }

    setPhase("checking");
    try {
      const restoredProfile = await restoreStudentSession();
      if (restoredProfile.role !== "student") {
        setProfile(null);
        setPhase("anonymous");
        return;
      }
      setProfile(restoredProfile);
      setActivationIdentifier(null);
      setPhase("authenticated");
    } catch (requestError) {
      if (isMissingSessionError(requestError)) {
        setProfile(null);
        setPhase("anonymous");
      } else {
        setPhase("unavailable");
      }
    }
  }

  useEffect(() => {
    void restoreSession();
  }, []);

  useEffect(() => {
    if (online && phase === "offline") void restoreSession();
  }, [online, phase]);

  if (phase === "checking") return <LoadingScreen />;
  if (phase === "offline" && !profile) {
    return <ConnectionGate kind="offline" onRetry={() => void restoreSession()} />;
  }
  if (phase === "unavailable" && !profile) {
    return <ConnectionGate kind="unavailable" onRetry={() => void restoreSession()} />;
  }

  if (phase === "authenticated" && profile) {
    return (
      <div className="app-frame">
        {!online ? <ConnectionBanner /> : null}
        <AuthenticatedScreen
          profile={profile}
          online={online}
          activationIdentifier={activationIdentifier}
          onLoggedOut={() => {
            setProfile(null);
            setActivationIdentifier(null);
            setPhase("anonymous");
            setMode("login");
            setNotice("تم تسجيل الخروج بأمان.");
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-frame">
      {!online ? <ConnectionBanner /> : null}
      <EntryScreen
        mode={mode}
        online={online}
        notice={notice}
        onModeChange={(nextMode) => {
          setMode(nextMode);
          setNotice(null);
        }}
        onAuthenticated={(studentProfile, accountIdentifier) => {
          setProfile(studentProfile);
          setActivationIdentifier(accountIdentifier ?? null);
          setPhase("authenticated");
          setNotice(null);
        }}
        onRecoveryReset={() => {
          setMode("login");
          setNotice("تم تعيين كلمة مرور جديدة. سجّل الدخول ببياناتك الجديدة.");
        }}
      />
    </div>
  );
}
