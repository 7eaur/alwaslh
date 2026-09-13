import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import {
  ApiRequestError,
  type AdminProfile,
  isMissingSessionError,
  logoutAdmin,
  restoreAdminSession,
} from "./admin-api";
import { ADMIN_NAVIGATION } from "./admin-navigation";
import { AdminAiAuthoringWorkspace } from "./AdminAiAuthoringWorkspace";
import { AdminReportsWorkspace } from "./AdminReportsWorkspace";
import { AdminStudentAccessWorkspace } from "./AdminStudentAccessWorkspace";
import { AiOperationsPage } from "./AiOperationsPage";
import { AdminOverviewPage } from "./admin/overview/AdminOverviewPage";
import { AdminNotificationsPage } from "./admin/operations/AdminNotificationsPage";
import { AdminOperationsAuditPage } from "./admin/operations/AdminOperationsAuditPage";
import { AdminOperationsDiagnosticsPage } from "./admin/operations/AdminOperationsDiagnosticsPage";
import { AdminOperationsHealthPage } from "./admin/operations/AdminOperationsHealthPage";
import { QuestionBankDetailPage } from "./admin/questions/QuestionBankDetailPage";
import "./ai-operations-review.css";
import { ContentIngestionWorkspace } from "./ContentIngestionWorkspace";
import { ContentOperationsWorkspace } from "./ContentOperationsWorkspace";
import { CurriculumWorkspace } from "./CurriculumWorkspace";
import { LessonAuthoringParityPanel } from "./LessonAuthoringParityPanel";
import { LoginScreen } from "./LoginScreen";
import { QuestionBankWorkspace } from "./QuestionBankWorkspace";
import { QuizBuilderWorkspace } from "./QuizBuilderWorkspace";
import { QuizMetadataPanel } from "./QuizMetadataPanel";

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة، وإذا استمر الخطأ راجع سجل التشغيل.";
}

export function App() {
  const [session, setSession] = useState<AdminProfile | null>(null);
  const [sessionState, setSessionState] = useState<"restoring" | "signed_out" | "signed_in" | "error">("restoring");
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
    return <FullPageState title="جارٍ التحقق من جلسة الإدارة" body="نراجع الجلسة الآمنة قبل عرض أي بيانات إدارية." />;
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

function AdminShell({
  profile,
  onLogout,
  onSessionExpired,
}: {
  profile: AdminProfile;
  onLogout: () => Promise<void>;
  onSessionExpired: () => void;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="التنقل الرئيسي">
        <BrandBlock />
        <nav className="admin-nav" aria-label="أقسام الإدارة">
          {ADMIN_NAVIGATION.map((group) => (
            <section className="admin-nav-group" key={group.label} aria-label={group.label}>
              <p className="admin-nav-label">{group.label}</p>
              <div className="admin-nav-links">
                {group.items.map((item) => (
                  <NavLink
                    className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}
                    key={item.to}
                    to={item.to}
                    end={item.end}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
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
        <AdminRoutes onSessionExpired={onSessionExpired} />
      </main>
    </div>
  );
}

function AdminRoutes({ onSessionExpired }: { onSessionExpired: () => void }) {
  return (
    <Routes>
      <Route index element={<AdminOverviewPage onSessionExpired={onSessionExpired} />} />
      <Route path="curriculum" element={<CurriculumWorkspace onSessionExpired={onSessionExpired} />} />
      <Route
        path="content"
        element={
          <WorkspaceWithRelatedActions
            actions={[
              { label: "ملخص الدرس والتصدير", to: "/app/content/lesson-tools" },
              { label: "أدوات التأليف بالذكاء الاصطناعي", to: "/app/tools/ai-authoring" },
            ]}
          >
            <ContentIngestionWorkspace onSessionExpired={onSessionExpired} />
          </WorkspaceWithRelatedActions>
        }
      />
      <Route
        path="content/lesson-tools"
        element={
          <WorkspaceWithRelatedActions actions={[{ label: "العودة إلى المحتوى", to: "/app/content" }]}>
            <LessonAuthoringParityPanel onSessionExpired={onSessionExpired} />
          </WorkspaceWithRelatedActions>
        }
      />
      <Route path="reviews" element={<Navigate replace to="/app/reviews/content" />} />
      <Route
        path="reviews/content"
        element={
          <ReviewArea current="content">
            <ContentOperationsWorkspace onSessionExpired={onSessionExpired} />
          </ReviewArea>
        }
      />
      <Route
        path="reviews/ai"
        element={
          <ReviewArea current="ai">
            <AiOperationsPage onSessionExpired={onSessionExpired} />
          </ReviewArea>
        }
      />
      <Route
        path="questions"
        element={
          <WorkspaceWithRelatedActions actions={[{ label: "أدوات التأليف بالذكاء الاصطناعي", to: "/app/tools/ai-authoring" }]}>
            <QuestionBankWorkspace onSessionExpired={onSessionExpired} />
          </WorkspaceWithRelatedActions>
        }
      />
      <Route path="questions/:questionId" element={<QuestionBankDetailPage onSessionExpired={onSessionExpired} />} />
      <Route
        path="quizzes"
        element={
          <WorkspaceWithRelatedActions
            actions={[
              { label: "بيانات الاختبار", to: "/app/quizzes/metadata" },
              { label: "أدوات التأليف بالذكاء الاصطناعي", to: "/app/tools/ai-authoring" },
            ]}
          >
            <QuizBuilderWorkspace onSessionExpired={onSessionExpired} />
          </WorkspaceWithRelatedActions>
        }
      />
      <Route
        path="quizzes/metadata"
        element={
          <WorkspaceWithRelatedActions actions={[{ label: "العودة إلى الاختبارات", to: "/app/quizzes" }]}>
            <QuizMetadataPanel onSessionExpired={onSessionExpired} />
          </WorkspaceWithRelatedActions>
        }
      />
      <Route path="students" element={<AdminStudentAccessWorkspace onSessionExpired={onSessionExpired} />} />
      <Route
        path="access-codes"
        element={
          <WorkspaceWithRelatedActions actions={[{ label: "الملفات والتقارير", to: "/app/access-codes/reports" }]}>
            <AdminStudentAccessWorkspace onSessionExpired={onSessionExpired} />
          </WorkspaceWithRelatedActions>
        }
      />
      <Route path="operations" element={<AdminOperationsHealthPage onSessionExpired={onSessionExpired} />} />
      <Route path="operations/audit" element={<AdminOperationsAuditPage onSessionExpired={onSessionExpired} />} />
      <Route path="operations/diagnostics" element={<AdminOperationsDiagnosticsPage onSessionExpired={onSessionExpired} />} />
      <Route path="operations/notifications" element={<AdminNotificationsPage onSessionExpired={onSessionExpired} />} />
      <Route path="tools/ai-authoring" element={<AdminAiAuthoringWorkspace onSessionExpired={onSessionExpired} />} />
      <Route path="access-codes/reports" element={<AdminReportsWorkspace onSessionExpired={onSessionExpired} />} />
      <Route path="*" element={<AdminRouteNotFound />} />
    </Routes>
  );
}

function ReviewArea({ current, children }: { current: "content" | "ai"; children: ReactNode }) {
  return (
    <>
      <nav className="workspace-subnav" aria-label="أنواع المراجعة">
        <NavLink
          className={`workspace-subnav-link${current === "content" ? " is-active" : ""}`}
          to="/app/reviews/content"
          aria-current={current === "content" ? "page" : undefined}
        >
          المحتوى وOCR
        </NavLink>
        <NavLink
          className={`workspace-subnav-link${current === "ai" ? " is-active" : ""}`}
          to="/app/reviews/ai"
          aria-current={current === "ai" ? "page" : undefined}
        >
          مخرجات الذكاء الاصطناعي
        </NavLink>
      </nav>
      {children}
    </>
  );
}

function WorkspaceWithRelatedActions({
  actions,
  children,
}: {
  actions: readonly { label: string; to: string }[];
  children: ReactNode;
}) {
  return (
    <>
      <nav className="workspace-related-actions" aria-label="إجراءات مرتبطة">
        {actions.map((action) => (
          <Link className="secondary-button workspace-related-link" key={action.to} to={action.to}>
            {action.label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}

function AdminRouteNotFound() {
  return (
    <section className="auth-card admin-route-state">
      <p className="eyebrow">مساحة الإدارة</p>
      <h1>هذه الوجهة غير موجودة</h1>
      <p>استخدم التنقل الرئيسي للوصول إلى المهمة المطلوبة.</p>
      <Link className="primary-button admin-route-state-link" to="/app">
        العودة إلى النظرة العامة
      </Link>
    </section>
  );
}
