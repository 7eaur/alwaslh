import type { ReactNode } from "react";
import { AdminBrandBlock, AdminShell } from "./app/layouts/AdminShell";
import { AdminRoutes } from "./app/router/AdminRoutes";
import {
  AdminSessionProvider,
  LoginScreen,
  useAdminSession,
} from "./features/auth/public";
import "./ai-operations-review.css";

export function App() {
  return (
    <AdminSessionProvider>
      <AdminSessionBoundary />
    </AdminSessionProvider>
  );
}

function AdminSessionBoundary() {
  const session = useAdminSession();

  if (session.state === "restoring") {
    return <FullPageState title="جارٍ التحقق من جلسة الإدارة" body="نراجع الجلسة الآمنة قبل عرض أي بيانات إدارية." />;
  }

  if (session.state === "error") {
    return (
      <FullPageState title="تعذر الوصول إلى خدمة الإدارة" body={session.error}>
        <button className="primary-button" type="button" onClick={() => void session.restore()}>
          إعادة المحاولة
        </button>
      </FullPageState>
    );
  }

  if (session.state === "signed_out" || !session.profile) {
    return (
      <LoginScreen
        onAuthenticated={(profile) => {
          session.acceptAuthenticated(profile);
          window.requestAnimationFrame(() => {
            document.getElementById("route-content")?.focus({ preventScroll: true });
          });
        }}
      />
    );
  }

  return (
    <AdminShell profile={session.profile} onLogout={session.logout}>
      <AdminRoutes onSessionExpired={session.expire} />
    </AdminShell>
  );
}

function FullPageState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-live="polite">
        <AdminBrandBlock auth />
        <h1>{title}</h1>
        <p>{body}</p>
        {children}
      </section>
    </main>
  );
}
