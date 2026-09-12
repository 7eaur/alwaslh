import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ApiRequestError,
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
} from "./auth-api";
import {
  ensureDeviceKey,
  requireDeviceKey,
  rotateDeviceKey,
  signDeviceProof,
  type StoredDeviceKey,
} from "./device-key";

export type StudentEntryMode = "welcome" | "activation" | "login" | "recovery" | "help" | "support";
export type StudentEntryNotice = { message: string; tone: "success" | "info" };

type PendingPasswordChange = { identifier: string; challenge: StudentLoginChallenge; key: StoredDeviceKey };
const WELCOME_SEEN_KEY = "alwaslh-student:welcome-seen-v1";

export function markStudentWelcomeSeen(): void {
  try { window.localStorage.setItem(WELCOME_SEEN_KEY, "1"); } catch { /* UX preference only */ }
}

export function StudentBrand() {
  return (
    <div className="student-brand" aria-label="الوسيلة الذكية — مساحة الطالب">
      <span className="student-brand__mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" focusable="false"><path d="M13 20c0-3 2-5 5-5h10c4 0 7 1 10 4 3-3 6-4 10-4h2c3 0 5 2 5 5v25c0 3-2 5-5 5h-8c-5 0-9 2-12 6-3-4-7-6-12-6h-5c-3 0-5-2-5-5V20Z" /><path d="M32 19v30" /></svg>
      </span>
      <span className="student-brand__copy"><strong>الوسيلة الذكية</strong><small>مساحة الطالب</small></span>
    </div>
  );
}

function Spinner() { return <span className="spinner" aria-hidden="true" />; }
function Alert({ tone, children }: { tone: "danger" | "warning" | "success" | "info"; children: ReactNode }) {
  return <div className={`form-alert is-${tone}`} role={tone === "danger" ? "alert" : "status"}>{children}</div>;
}

function learnerError(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error && error.message === "device_key_missing") return "تعذر التعرف على هذا الجهاز. اطلب من الدعم إعادة ربط الجهاز ثم جرّب مرة أخرى.";
  if (error instanceof Error && error.message === "device_crypto_unavailable") return "تعذر تسجيل الدخول من هذا المتصفح. حدّث المتصفح أو استخدم متصفحًا حديثًا.";
  return "تعذر إكمال العملية الآن. حاول مرة أخرى.";
}

function PasswordFields({ password, confirmation, onPassword, onConfirmation, prefix }: {
  password: string; confirmation: string; onPassword: (value: string) => void; onConfirmation: (value: string) => void; prefix: string;
}) {
  const matches = password === confirmation;
  return <>
    <div className="field-group">
      <label htmlFor={`${prefix}-password`}>كلمة المرور الخاصة بك</label>
      <input id={`${prefix}-password`} className="text-input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={(event) => onPassword(event.target.value)} aria-describedby={`${prefix}-password-hint`} dir="ltr" />
      <p className="field-hint" id={`${prefix}-password-hint`}>8 أحرف على الأقل. اختر كلمة تتذكرها ولا تشاركها مع أحد.</p>
    </div>
    <div className="field-group">
      <label htmlFor={`${prefix}-confirmation`}>تأكيد كلمة المرور</label>
      <input id={`${prefix}-confirmation`} className="text-input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmation} onChange={(event) => onConfirmation(event.target.value)} aria-invalid={confirmation.length > 0 && !matches} aria-describedby={confirmation.length > 0 && !matches ? `${prefix}-match-error` : undefined} dir="ltr" />
      {confirmation.length > 0 && !matches ? <p className="field-error" id={`${prefix}-match-error`}>كلمتا المرور غير متطابقتين.</p> : null}
    </div>
  </>;
}

function ActivationForm({ online, onAuthenticated, onLogin }: {
  online: boolean; onAuthenticated: (profile: SessionProfile, accountIdentifier: string) => void; onLogin: () => void;
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
    setCode(nextCode); setVerification(null); setPassword(""); setConfirmation(""); setIdempotencyKey(createActivationIdempotencyKey()); setError(null);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSixDigitAccessCode(normalizedCode) || busy) return;
    if (!online) { setError("اتصل بالإنترنت للتحقق من رمز التفعيل."); return; }
    setBusy(true); setError(null);
    try { setVerification(await verifyActivation(normalizedCode)); setIdempotencyKey(createActivationIdempotencyKey()); }
    catch (requestError) { setError(learnerError(requestError)); }
    finally { setBusy(false); }
  }

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verification || password.length < 8 || password !== confirmation || busy) return;
    if (!online) { setError("اتصل بالإنترنت لإكمال إنشاء الحساب."); return; }
    setBusy(true); setError(null);
    try {
      const key = await ensureDeviceKey(verification.accountIdentifier);
      const deviceProof = await signDeviceProof(key, "activation", verification.activationTicket);
      const result = await completeActivation({ activationTicket: verification.activationTicket, password, idempotencyKey, devicePublicKeySpki: key.publicKeySpki, deviceProof });
      if (result.profile.role !== "student") throw new Error("invalid_student_session");
      onAuthenticated(result.profile, result.accountIdentifier);
    } catch (requestError) { setError(learnerError(requestError)); }
    finally { setBusy(false); }
  }

  if (verification) return (
    <form className="student-entry-form" onSubmit={complete} noValidate>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <Alert tone="success">الرمز صالح. اختر كلمة مرور لحسابك ثم أكمل.</Alert>
      <PasswordFields password={password} confirmation={confirmation} onPassword={(value) => { setPassword(value); setError(null); }} onConfirmation={setConfirmation} prefix="activation" />
      {!online ? <Alert tone="warning">اتصل بالإنترنت لإكمال التفعيل.</Alert> : null}
      <button className="primary-button full-width" type="submit" disabled={password.length < 8 || password !== confirmation || busy || !online}>{busy ? <><Spinner /> جاري إنشاء الحساب</> : "إنشاء الحساب والمتابعة"}</button>
      <button className="text-button full-width" type="button" disabled={busy} onClick={() => reset("")}>استخدام رمز مختلف</button>
    </form>
  );

  return (
    <form className="student-entry-form" onSubmit={verify} noValidate>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div className="field-group">
        <label htmlFor="activation-code">رمز الوصول الكامل</label>
        <input id="activation-code" className="text-input code-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9٠-٩۰-۹]*" maxLength={12} value={normalizedCode} onChange={(event) => reset(event.target.value)} aria-describedby="activation-code-hint" placeholder="000000" dir="ltr" />
        <p className="field-hint" id="activation-code-hint">أدخل الرمز المكوّن من 6 أرقام الذي استلمته لبدء استخدام حسابك.</p>
      </div>
      {!online ? <Alert tone="warning">اتصل بالإنترنت لتفعيل الحساب لأول مرة.</Alert> : null}
      <button className="primary-button full-width" type="submit" disabled={!isSixDigitAccessCode(normalizedCode) || busy || !online}>{busy ? <><Spinner /> جاري التحقق</> : "متابعة التفعيل"}</button>
      <button className="text-button full-width" type="button" onClick={onLogin} disabled={busy}>لدي حساب بالفعل</button>
    </form>
  );
}

async function challengeKey(identifier: string, challenge: StudentLoginChallenge): Promise<StoredDeviceKey> {
  return challenge.purpose === "device_rebind" || challenge.purpose === "password_change_rebind" ? rotateDeviceKey(identifier) : requireDeviceKey(identifier);
}

function LoginForm({ online, notice, onAuthenticated, onRecovery }: {
  online: boolean; notice: StudentEntryNotice | null; onAuthenticated: (profile: SessionProfile) => void; onRecovery: () => void;
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
    setBusy(true); setError(null);
    try {
      const challenge = await startStudentLogin(normalizedIdentifier, password);
      const key = await challengeKey(normalizedIdentifier, challenge);
      if (challenge.mustChangePassword) { setPending({ identifier: normalizedIdentifier, challenge, key }); setNewPassword(""); setConfirmation(""); return; }
      const signature = await signDeviceProof(key, challenge.purpose, challenge.challengeToken);
      const result = await completeStudentLogin({ challengeToken: challenge.challengeToken, signature, ...(challenge.requiresDeviceRegistration ? { publicKeySpki: key.publicKeySpki } : {}) });
      if (result.profile.role !== "student") throw new Error("invalid_student_session");
      onAuthenticated(result.profile);
    } catch (requestError) { setError(learnerError(requestError)); }
    finally { setBusy(false); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending || newPassword.length < 8 || newPassword !== confirmation || busy) return;
    if (!online) { setError("اتصل بالإنترنت لحفظ كلمة المرور الجديدة."); return; }
    setBusy(true); setError(null);
    try {
      const signature = await signDeviceProof(pending.key, pending.challenge.purpose, pending.challenge.challengeToken);
      const result = await completeStudentLogin({ challengeToken: pending.challenge.challengeToken, signature, newPassword, ...(pending.challenge.requiresDeviceRegistration ? { publicKeySpki: pending.key.publicKeySpki } : {}) });
      if (result.profile.role !== "student") throw new Error("invalid_student_session");
      onAuthenticated(result.profile);
    } catch (requestError) { setError(learnerError(requestError)); }
    finally { setBusy(false); }
  }

  if (pending) return (
    <form className="student-entry-form" onSubmit={changePassword} noValidate>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <Alert tone="info">كلمة المرور التي أدخلتها مؤقتة. اختر الآن كلمة مرور جديدة خاصة بك.</Alert>
      <PasswordFields password={newPassword} confirmation={confirmation} onPassword={(value) => { setNewPassword(value); setError(null); }} onConfirmation={setConfirmation} prefix="forced-change" />
      <button className="primary-button full-width" type="submit" disabled={newPassword.length < 8 || newPassword !== confirmation || busy || !online}>{busy ? <><Spinner /> جاري الحفظ</> : "حفظ كلمة المرور والدخول"}</button>
      <button className="text-button full-width" type="button" disabled={busy} onClick={() => setPending(null)}>إلغاء والعودة</button>
    </form>
  );

  return (
    <form className="student-entry-form" onSubmit={submit} noValidate>
      {notice ? <Alert tone={notice.tone}>{notice.message}</Alert> : null}
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div className="field-group">
        <label htmlFor="student-identifier">معرّف الحساب</label>
        <input id="student-identifier" className="text-input code-input" type="text" inputMode="numeric" autoComplete="username" pattern="[0-9٠-٩۰-۹]*" maxLength={12} value={normalizedIdentifier} onChange={(event) => { setIdentifier(event.target.value); setError(null); }} aria-describedby="student-identifier-hint" placeholder="000000" dir="ltr" />
        <p className="field-hint" id="student-identifier-hint">هو رمز التفعيل ذو 6 أرقام الذي أنشأت به حسابك.</p>
      </div>
      <div className="field-group">
        <div className="label-row"><label htmlFor="student-password">كلمة المرور</label><button className="inline-link" type="button" onClick={onRecovery}>نسيت كلمة المرور؟</button></div>
        <input id="student-password" className="text-input" type="password" autoComplete="current-password" maxLength={128} value={password} onChange={(event) => { setPassword(event.target.value); setError(null); }} placeholder="كلمة المرور" dir="ltr" />
      </div>
      <button className="primary-button full-width" type="submit" disabled={!isSixDigitAccessCode(normalizedIdentifier) || !password || busy || !online}>{busy ? <><Spinner /> جاري التحقق</> : "تسجيل الدخول"}</button>
    </form>
  );
}

function Welcome({ onStart, onLogin, onHelp }: { onStart: () => void; onLogin: () => void; onHelp: () => void }) {
  return <div className="student-welcome-panel">
    <p className="eyebrow">مرحبًا بك</p><h1>تعلّم، تدرّب، وارجع لما تحتاجه بسهولة.</h1>
    <p>الوسيلة الذكية تجمع موادك ودروسك وتدريباتك في تجربة بسيطة ومريحة.</p>
    <ul className="student-welcome-points">
      <li><strong>تعلّم بهدوء</strong><span>اختر مادتك وافتح الدرس مباشرة.</span></li>
      <li><strong>تدرّب بطريقتك</strong><span>استخدم التدريب للمراجعة أو الاختبار لقياس مستواك.</span></li>
      <li><strong>احتفظ بما تحتاجه</strong><span>أدر الدروس التي حفظتها على جهازك من مكان واحد.</span></li>
    </ul>
    <div className="student-entry-actions"><button className="primary-button" type="button" onClick={onStart}>ابدأ الآن</button><button className="secondary-button" type="button" onClick={onLogin}>لدي حساب بالفعل</button></div>
    <button className="text-button student-entry-help-link" type="button" onClick={onHelp}>كيف أستخدم التطبيق؟</button>
  </div>;
}

export function StudentHelpContent() {
  return <div className="student-guidance">
    <header><p className="eyebrow">التعليمات والمساعدة</p><h1>استخدام التطبيق خطوة بخطوة</h1><p>هذه أهم الخطوات التي تحتاجها كطالب، بدون تفاصيل تقنية لا تخصك.</p></header>
    <ol className="student-guidance-steps">
      <li><span>1</span><div><strong>فعّل حسابك أو سجّل الدخول</strong><p>في أول مرة استخدم رمز التفعيل المكوّن من 6 أرقام. بعد ذلك استخدم معرّف الحساب وكلمة المرور.</p></div></li>
      <li><span>2</span><div><strong>افتح التعلّم</strong><p>اختر المادة ثم الدرس الذي تريد قراءته أو مراجعته.</p></div></li>
      <li><span>3</span><div><strong>استخدم التدريب والاختبارات</strong><p>التدريب يعطيك ملاحظات أثناء الحل، والاختبار يعرض النتيجة بعد الإنهاء.</p></div></li>
      <li><span>4</span><div><strong>أدر التنزيلات</strong><p>يمكنك حفظ الدروس المتاحة على هذا الجهاز وإزالة ما لم تعد تحتاجه.</p></div></li>
      <li><span>5</span><div><strong>أدر وصولك من الحساب</strong><p>إذا استلمت رمز صف جديدًا، أضفه من صفحة الحساب ليظهر محتوى الصف في التعلّم.</p></div></li>
    </ol>
  </div>;
}

export function StudentSupportContent() {
  return <div className="student-guidance">
    <header><p className="eyebrow">الدعم والتواصل</p><h1>إذا واجهتك مشكلة، ابدأ من هنا</h1><p>لا تشارك كلمة المرور مع أي شخص عند طلب المساعدة.</p></header>
    <div className="student-support-list">
      <section><strong>نسيت كلمة المرور</strong><p>اطلب كلمة مرور مؤقتة من الجهة التي زودتك برمز التفعيل، ثم استخدمها في شاشة تسجيل الدخول.</p></section>
      <section><strong>غيّرت الجهاز أو فقدت الجهاز السابق</strong><p>اطلب من الدعم إعادة ربط الجهاز، ثم سجّل الدخول من الجهاز الجديد.</p></section>
      <section><strong>رمز الصف لا يعمل</strong><p>تأكد أن الرمز مكوّن من 7 أرقام وأن الإنترنت متصل. إذا استمرت المشكلة تواصل مع الجهة التي أصدرت الرمز.</p></section>
      <section><strong>درس أو اختبار غير ظاهر</strong><p>تحقق من وصول الصف ثم حدّث الصفحة. إذا استمرت المشكلة اذكر اسم الصف والمادة عند طلب المساعدة.</p></section>
    </div>
    <div className="student-support-contact" role="note"><strong>التواصل مع الدعم</strong><p>تواصل مع الإدارة أو الجهة التعليمية التي سلمتك رمز التفعيل، واذكر معرّف الحساب ووصف المشكلة فقط.</p></div>
  </div>;
}

function Recovery({ onLogin, onSupport }: { onLogin: () => void; onSupport: () => void }) {
  return <div className="student-entry-form">
    <div className="student-b05-state is-info"><strong>استعادة الحساب</strong><p>اطلب كلمة مرور مؤقتة من الجهة التي زودتك برمز التفعيل. بعدها ارجع إلى تسجيل الدخول وسيطلب منك التطبيق اختيار كلمة مرور جديدة.</p></div>
    <button className="primary-button full-width" type="button" onClick={onLogin}>العودة إلى تسجيل الدخول</button>
    <button className="text-button full-width" type="button" onClick={onSupport}>فتح صفحة الدعم</button>
  </div>;
}

export function StudentEntryExperience({ online, mode, notice, onMode, onAuthenticated }: {
  online: boolean; mode: StudentEntryMode; notice: StudentEntryNotice | null; onMode: (mode: StudentEntryMode) => void; onAuthenticated: (profile: SessionProfile, accountIdentifier?: string) => void;
}) {
  const authMode = mode === "activation" || mode === "login" || mode === "recovery";
  return <main className="student-entry-page"><div className="student-entry-shell">
    <header className="student-entry-topbar"><StudentBrand />{!online ? <span className="student-entry-offline" role="status">غير متصل</span> : null}</header>
    <section className={`student-entry-main ${authMode ? "is-auth" : "is-info"}`}>
      {mode === "welcome" ? <Welcome onStart={() => { markStudentWelcomeSeen(); onMode("activation"); }} onLogin={() => { markStudentWelcomeSeen(); onMode("login"); }} onHelp={() => onMode("help")} /> : null}
      {authMode ? <div className="student-auth-surface">
        <div className="student-auth-switch" aria-label="طريقة الدخول"><button type="button" className={mode === "activation" ? "is-active" : ""} onClick={() => onMode("activation")}>تفعيل جديد</button><button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => onMode("login")}>تسجيل الدخول</button></div>
        <header className="student-auth-heading"><p className="eyebrow">مساحة الطالب</p><h1>{mode === "activation" ? "تفعيل حساب جديد" : mode === "login" ? "لدي حساب بالفعل" : "استعادة الحساب"}</h1><p>{mode === "activation" ? "أدخل رمز التفعيل ثم اختر كلمة مرور لحسابك." : mode === "login" ? "أدخل معرّف حسابك وكلمة المرور للمتابعة." : "اتبع الخطوات لاستعادة الوصول إلى حسابك."}</p></header>
        {mode === "activation" ? <ActivationForm online={online} onAuthenticated={(profile, accountIdentifier) => onAuthenticated(profile, accountIdentifier)} onLogin={() => onMode("login")} /> : null}
        {mode === "login" ? <LoginForm online={online} notice={notice} onAuthenticated={(profile) => onAuthenticated(profile)} onRecovery={() => onMode("recovery")} /> : null}
        {mode === "recovery" ? <Recovery onLogin={() => onMode("login")} onSupport={() => onMode("support")} /> : null}
      </div> : null}
      {mode === "help" ? <StudentHelpContent /> : null}
      {mode === "support" ? <StudentSupportContent /> : null}
    </section>
    <footer className="student-entry-footer">{mode !== "welcome" ? <button className="text-button" type="button" onClick={() => onMode("welcome")}>الرئيسية</button> : null}<button className="text-button" type="button" onClick={() => onMode("help")}>التعليمات</button><button className="text-button" type="button" onClick={() => onMode("support")}>الدعم والتواصل</button></footer>
  </div></main>;
}

export function StudentPublicInfoPage({ kind }: { kind: "help" | "support" }) {
  return <main className="student-entry-page student-public-info-page"><div className="student-entry-shell">
    <header className="student-entry-topbar"><StudentBrand /><a className="secondary-button student-public-back" href="/app/home">العودة للتطبيق</a></header>
    <section className="student-entry-main is-info">{kind === "help" ? <StudentHelpContent /> : <StudentSupportContent />}</section>
  </div></main>;
}
