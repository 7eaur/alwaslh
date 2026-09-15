import { lazy, Suspense, type ReactNode } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { AdminProductState } from "../../shared/ui/AdminProductState";

const AdminAiAuthoringWorkspace = lazy(() =>
  import("../../admin/ai-authoring/AdminAiAuthoringWorkspace").then((module) => ({
    default: module.AdminAiAuthoringWorkspace,
  })),
);
const AdminAccessCodeReportsPage = lazy(() =>
  import("../../admin/access-codes/AdminAccessCodeReportsPage").then((module) => ({
    default: module.AdminAccessCodeReportsPage,
  })),
);
const AdminAccessCodesPage = lazy(() =>
  import("../../admin/access-codes/AdminAccessCodesPage").then((module) => ({
    default: module.AdminAccessCodesPage,
  })),
);
const ContentIngestionPage = lazy(() =>
  import("../../admin/content/ContentIngestionPage").then((module) => ({
    default: module.ContentIngestionPage,
  })),
);
const LessonAuthoringParityPanel = lazy(() =>
  import("../../admin/content/LessonAuthoringParityPanel").then((module) => ({
    default: module.LessonAuthoringParityPanel,
  })),
);
const CurriculumWorkspace = lazy(() =>
  import("../../admin/curriculum/CurriculumWorkspace").then((module) => ({
    default: module.CurriculumWorkspace,
  })),
);
const AdminOverviewPage = lazy(() =>
  import("../../admin/overview/AdminOverviewPage").then((module) => ({
    default: module.AdminOverviewPage,
  })),
);
const AdminNotificationsPage = lazy(() =>
  import("../../admin/operations/AdminNotificationsPage").then((module) => ({
    default: module.AdminNotificationsPage,
  })),
);
const AdminOperationsAuditPage = lazy(() =>
  import("../../admin/operations/AdminOperationsAuditPage").then((module) => ({
    default: module.AdminOperationsAuditPage,
  })),
);
const AdminOperationsDiagnosticsPage = lazy(() =>
  import("../../admin/operations/AdminOperationsDiagnosticsPage").then((module) => ({
    default: module.AdminOperationsDiagnosticsPage,
  })),
);
const AdminOperationsHealthPage = lazy(() =>
  import("../../admin/operations/AdminOperationsHealthPage").then((module) => ({
    default: module.AdminOperationsHealthPage,
  })),
);
const QuestionBankCreatePage = lazy(() =>
  import("../../features/questions/public/QuestionBankCreatePage").then((module) => ({
    default: module.QuestionBankCreatePage,
  })),
);
const QuestionBankDetailPage = lazy(() =>
  import("../../features/questions/public/QuestionBankDetailPage").then((module) => ({
    default: module.QuestionBankDetailPage,
  })),
);
const QuestionBankListPage = lazy(() =>
  import("../../features/questions/public/QuestionBankListPage").then((module) => ({
    default: module.QuestionBankListPage,
  })),
);
const QuizBuilderCreatePage = lazy(() =>
  import("../../admin/quizzes/QuizBuilderCreatePage").then((module) => ({
    default: module.QuizBuilderCreatePage,
  })),
);
const QuizBuilderDetailPage = lazy(() =>
  import("../../admin/quizzes/QuizBuilderDetailPage").then((module) => ({
    default: module.QuizBuilderDetailPage,
  })),
);
const QuizBuilderListPage = lazy(() =>
  import("../../admin/quizzes/QuizBuilderListPage").then((module) => ({
    default: module.QuizBuilderListPage,
  })),
);
const QuizMetadataPanel = lazy(() =>
  import("../../admin/quizzes/QuizMetadataPanel").then((module) => ({
    default: module.QuizMetadataPanel,
  })),
);
const AiOperationsPage = lazy(() =>
  import("../../admin/reviews/AiOperationsPage").then((module) => ({
    default: module.AiOperationsPage,
  })),
);
const ContentOperationsPage = lazy(() =>
  import("../../admin/reviews/ContentOperationsPage").then((module) => ({
    default: module.ContentOperationsPage,
  })),
);
const AdminStudentsPage = lazy(() =>
  import("../../admin/students/AdminStudentsPage").then((module) => ({
    default: module.AdminStudentsPage,
  })),
);

export function AdminRoutes({ onSessionExpired }: { onSessionExpired: () => void }) {
  return (
    <Suspense
      fallback={
        <AdminProductState
          title="جاري تحميل مساحة العمل"
          body="سيتم عرض الوجهة المطلوبة فور اكتمال تحميلها."
        />
      }
    >
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
              <ContentIngestionPage onSessionExpired={onSessionExpired} />
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
              <ContentOperationsPage onSessionExpired={onSessionExpired} />
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
            <WorkspaceWithRelatedActions
              actions={[
                { label: "إنشاء واستيراد", to: "/app/questions/manage" },
                { label: "أدوات التأليف بالذكاء الاصطناعي", to: "/app/tools/ai-authoring" },
              ]}
            >
              <QuestionBankListPage onSessionExpired={onSessionExpired} />
            </WorkspaceWithRelatedActions>
          }
        />
        <Route
          path="questions/manage"
          element={
            <WorkspaceWithRelatedActions actions={[{ label: "العودة إلى بنك الأسئلة", to: "/app/questions" }]}>
              <QuestionBankCreatePage onSessionExpired={onSessionExpired} />
            </WorkspaceWithRelatedActions>
          }
        />
        <Route path="questions/:questionId" element={<QuestionBankDetailPage onSessionExpired={onSessionExpired} />} />
        <Route
          path="quizzes"
          element={
            <WorkspaceWithRelatedActions
              actions={[
                { label: "إنشاء وإدارة", to: "/app/quizzes/manage" },
                { label: "بيانات الاختبار", to: "/app/quizzes/metadata" },
                { label: "أدوات التأليف بالذكاء الاصطناعي", to: "/app/tools/ai-authoring" },
              ]}
            >
              <QuizBuilderListPage onSessionExpired={onSessionExpired} />
            </WorkspaceWithRelatedActions>
          }
        />
        <Route
          path="quizzes/manage"
          element={
            <WorkspaceWithRelatedActions actions={[{ label: "العودة إلى الاختبارات", to: "/app/quizzes" }]}>
              <QuizBuilderCreatePage onSessionExpired={onSessionExpired} />
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
        <Route path="quizzes/:quizId" element={<QuizBuilderDetailPage onSessionExpired={onSessionExpired} />} />
        <Route path="students" element={<AdminStudentsPage onSessionExpired={onSessionExpired} />} />
        <Route
          path="access-codes"
          element={
            <WorkspaceWithRelatedActions actions={[{ label: "الملفات والتقارير", to: "/app/access-codes/reports" }]}>
              <AdminAccessCodesPage onSessionExpired={onSessionExpired} />
            </WorkspaceWithRelatedActions>
          }
        />
        <Route path="operations" element={<AdminOperationsHealthPage onSessionExpired={onSessionExpired} />} />
        <Route path="operations/audit" element={<AdminOperationsAuditPage onSessionExpired={onSessionExpired} />} />
        <Route path="operations/diagnostics" element={<AdminOperationsDiagnosticsPage onSessionExpired={onSessionExpired} />} />
        <Route path="operations/notifications" element={<AdminNotificationsPage onSessionExpired={onSessionExpired} />} />
        <Route path="tools/ai-authoring" element={<AdminAiAuthoringWorkspace onSessionExpired={onSessionExpired} />} />
        <Route path="access-codes/reports" element={<AdminAccessCodeReportsPage onSessionExpired={onSessionExpired} />} />
        <Route path="*" element={<AdminRouteNotFound />} />
      </Routes>
    </Suspense>
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
