import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ApiRequestError,
  type AdminProfile,
  isMissingSessionError,
  logoutAdmin,
  restoreAdminSession,
} from "./admin-api";
import { AdminOperationsWorkspace } from "./AdminOperationsWorkspace";
import { AdminStudentAccessWorkspace } from "./AdminStudentAccessWorkspace";
import { AiOperationsPage } from "./AiOperationsPage";
import "./ai-operations-review.css";
import { ContentIngestionWorkspace } from "./ContentIngestionWorkspace";
import { ContentOperationsWorkspace } from "./ContentOperationsWorkspace";
import { CurriculumWorkspace } from "./CurriculumWorkspace";
import { LoginScreen } from "./LoginScreen";
import { QuestionBankWorkspace } from "./QuestionBankWorkspace";
import { QuizBuilderWorkspace } from "./QuizBuilderWorkspace";

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة، وإذا استمر الخطأ راجع سجل التشغيل.";
}

export function App() {
  const [session, setSession] = useState<AdminProfile | null>(null);
  const [sessionState, setSessionState] = useState<"restoring" | "signed_out" | "signed_in" | "error">(
    "restoring",
  );
  const [sessionError, setSessionError] = useState("");

  const restore = useCallback(async () => {
    setSessionState("restoring");
    setSessionError("");
    try {
      const profile = await restoreAdminSession();
      setSession(profile);
      setSessionState("signed_in");
    } catch (error) {
      setSession(null);
      if (isMissingSessionError(error)) {
        setSessionState("signed_out");
        return;
      }
      setSessionError(errorMessage(error));
      setSessionState("error");
    }
  }, []);

  useEffect(() => {
    void restore();
  }, [restore]);

  if (sessionState === "restoring") {
    return (
      <FullPageState
        title="جارٍ التحقق من جلسة الإدارة"
        body="نراجع الجلسة الآمنة قبل عرض أي بيانات إدارية."
      />
    );
  }
  if (sessionState === "error") {
    return (
      <FullPageState title="تعذر الوصول إلى خدمة الإدارة" body={sessionError}>
        <button className="primary-button" type="button" onClick={() => void restore()}>
          إعادة المحاولة
        </button>
      </FullPageState>
    );
  }
  if (sessionState === "signed_out" || !session) {
    return (
      <LoginScreen
        onAuthenticated={(profile) => {
          setSession(profile);
          setSessionState("signed_in");
        }}
      />
    );
  }

  return (
    <AdminShell
      profile={session}
      onSessionExpired={() => {
        setSession(null);
        setSessionState("signed_out");
      }}
      onLogout={async () => {
        try {
          await logoutAdmin();
          setSession(null);
          setSessionState("signed_out");
        } catch (error) {
          setSessionError(errorMessage(error));
          setSessionState("error");
        }
      }}
    />
  );
}

function FullPageState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-live="polite">
        <BrandBlock auth />
        <h1>{title}</h1>
        <p>{body}</p>
        {children}
      </section>
    </main>
  );
}

function BrandBlock({ auth = false }: { auth?: boolean }) {
  return (
    <div className={auth ? "brand-block auth-brand" : "brand-block"}>
      <span className="brand-mark" aria-hidden="true">
        و
      </span>
      <div>
        <strong>الوسيلة الذكية</strong>
        <small>{auth ? "لوحة الإدارة" : "إدارة المحتوى والتشغيل"}</small>
      </div>
    </div>
  );
}

type AdminWorkspace =
  | "operations"
  | "curriculum"
  | "content-ingestion"
  | "content-operations"
  | "ai-operations"
  | "question-bank"
  | "quiz-builder"
  | "student-access";

function AdminShell({
  profile,
  onLogout,
  onSessionExpired,
}: {
  profile: AdminProfile;
  onLogout: () => Promise<void>;
  onSessionExpired: () => void;
}) {
  const [workspace, setWorkspace] = useState<AdminWorkspace>("operations");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="التنقل الرئيسي">
        <BrandBlock />
        <nav className="admin-nav" aria-label="أقسام الإدارة">
          <button
            className={`nav-item nav-button${workspace === "operations" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "operations" ? "page" : undefined}
            onClick={() => setWorkspace("operations")}
          >
            لوحة التشغيل
          </button>
          <button
            className={`nav-item nav-button${workspace === "curriculum" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "curriculum" ? "page" : undefined}
            onClick={() => setWorkspace("curriculum")}
          >
            المنهج والمحتوى
          </button>
          <button
            className={`nav-item nav-button${workspace === "content-ingestion" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "content-ingestion" ? "page" : undefined}
            onClick={() => setWorkspace("content-ingestion")}
          >
            رفع المحتوى ونشره
          </button>
          <button
            className={`nav-item nav-button${workspace === "content-operations" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "content-operations" ? "page" : undefined}
            onClick={() => setWorkspace("content-operations")}
          >
            الوسائط وOCR
          </button>
          <button
            className={`nav-item nav-button${workspace === "ai-operations" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "ai-operations" ? "page" : undefined}
            onClick={() => setWorkspace("ai-operations")}
          >
            عمليات AI والمراجعة
          </button>
          <button
            className={`nav-item nav-button${workspace === "question-bank" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "question-bank" ? "page" : undefined}
            onClick={() => setWorkspace("question-bank")}
          >
            بنك الأسئلة
          </button>
          <button
            className={`nav-item nav-button${workspace === "quiz-builder" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "quiz-builder" ? "page" : undefined}
            onClick={() => setWorkspace("quiz-builder")}
          >
            الاختبارات والنماذج
          </button>
          <button
            className={`nav-item nav-button${workspace === "student-access" ? " is-active" : ""}`}
            type="button"
            aria-current={workspace === "student-access" ? "page" : undefined}
            onClick={() => setWorkspace("student-access")}
          >
            الطلاب والوصول
          </button>
          <span className="nav-item is-disabled">
            التقارير والإعدادات <small>مرحلة لاحقة</small>
          </span>
        </nav>
        <div className="sidebar-account">
          <span>الحساب الحالي</span>
          <strong>{profile.displayName ?? "مدير النظام"}</strong>
          <button className="sidebar-button" type="button" onClick={() => void onLogout()}>
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {workspace === "operations" ? (
          <AdminOperationsWorkspace onSessionExpired={onSessionExpired} />
        ) : workspace === "curriculum" ? (
          <CurriculumWorkspace onSessionExpired={onSessionExpired} />
        ) : workspace === "content-ingestion" ? (
          <ContentIngestionWorkspace onSessionExpired={onSessionExpired} />
        ) : workspace === "content-operations" ? (
          <ContentOperationsWorkspace onSessionExpired={onSessionExpired} />
        ) : workspace === "ai-operations" ? (
          <AiOperationsPage onSessionExpired={onSessionExpired} />
        ) : workspace === "question-bank" ? (
          <QuestionBankWorkspace onSessionExpired={onSessionExpired} />
        ) : workspace === "quiz-builder" ? (
          <QuizBuilderWorkspace onSessionExpired={onSessionExpired} />
        ) : (
          <AdminStudentAccessWorkspace onSessionExpired={onSessionExpired} />
        )}
      </main>
    </div>
  );
}
