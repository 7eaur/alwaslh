import type { ReactNode } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { AdminAiAuthoringWorkspace } from "../../admin/ai-authoring/AdminAiAuthoringWorkspace";
import { AdminAccessCodeReportsPage } from "../../admin/access-codes/AdminAccessCodeReportsPage";
import { AdminAccessCodesPage } from "../../admin/access-codes/AdminAccessCodesPage";
import { ContentIngestionPage } from "../../admin/content/ContentIngestionPage";
import { LessonAuthoringParityPanel } from "../../admin/content/LessonAuthoringParityPanel";
import { CurriculumWorkspace } from "../../admin/curriculum/CurriculumWorkspace";
import { AdminOverviewPage } from "../../admin/overview/AdminOverviewPage";
import { AdminNotificationsPage } from "../../admin/operations/AdminNotificationsPage";
import { AdminOperationsAuditPage } from "../../admin/operations/AdminOperationsAuditPage";
import { AdminOperationsDiagnosticsPage } from "../../admin/operations/AdminOperationsDiagnosticsPage";
import { AdminOperationsHealthPage } from "../../admin/operations/AdminOperationsHealthPage";
import { QuestionBankCreatePage } from "../../admin/questions/QuestionBankCreatePage";
import { QuestionBankDetailPage } from "../../admin/questions/QuestionBankDetailPage";
import { QuestionBankListPage } from "../../admin/questions/QuestionBankListPage";
import { QuizBuilderCreatePage } from "../../admin/quizzes/QuizBuilderCreatePage";
import { QuizBuilderDetailPage } from "../../admin/quizzes/QuizBuilderDetailPage";
import { QuizBuilderListPage } from "../../admin/quizzes/QuizBuilderListPage";
import { QuizMetadataPanel } from "../../admin/quizzes/QuizMetadataPanel";
import { AiOperationsPage } from "../../admin/reviews/AiOperationsPage";
import { ContentOperationsPage } from "../../admin/reviews/ContentOperationsPage";
import { AdminStudentsPage } from "../../admin/students/AdminStudentsPage";

export function AdminRoutes({ onSessionExpired }: { onSessionExpired: () => void }) {
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
