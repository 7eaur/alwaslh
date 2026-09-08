import { useState } from "react";
import type { FormEvent } from "react";
import { ApiRequestError, type AdminProfile, loginAdmin } from "./admin-api";

function formValue(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع أثناء تسجيل الدخول.";
}

export function LoginScreen({ onAuthenticated }: { onAuthenticated: (profile: AdminProfile) => void }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = formValue(form, "identifier").trim();
    const password = formValue(form, "password");
    setPending(true);
    setMessage("");
    try {
      onAuthenticated(await loginAdmin(identifier, password));
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="admin-login-title">
        <div className="brand-block auth-brand">
          <span className="brand-mark" aria-hidden="true">
            و
          </span>
          <div>
            <strong>الوسيلة الذكية</strong>
            <small>إدارة المحتوى والتشغيل</small>
          </div>
        </div>
        <p className="eyebrow">Super Admin</p>
        <h1 id="admin-login-title">دخول المدير</h1>
        <p className="page-description">
          هذه المساحة للإدارة فقط، وتستخدم جلسة الخادم الموثقة ولا تخزن كلمة المرور في المتصفح.
        </p>
        <form className="stack-form" onSubmit={(event) => void submit(event)}>
          <label>
            <span>معرّف المدير</span>
            <input name="identifier" autoComplete="username" minLength={3} maxLength={120} required />
          </label>
          <label>
            <span>كلمة المرور</span>
            <input name="password" type="password" autoComplete="current-password" maxLength={128} required />
          </label>
          {message ? (
            <p className="form-error" role="alert">
              {message}
            </p>
          ) : null}
          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "جارٍ الدخول…" : "دخول آمن"}
          </button>
        </form>
      </section>
    </main>
  );
}
