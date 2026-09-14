import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import App from "./App";
import { StudentPublicInfoPage } from "./features/auth/StudentEntryExperience";
import { PageState, RouteFocus, StudentProductShell } from "./presentation-foundation";

function StudentAppRoute() {
  return (
    <StudentProductShell>
      <App />
    </StudentProductShell>
  );
}

function StudentNotFoundRoute() {
  return (
    <StudentProductShell>
      <PageState
        kind="empty"
        eyebrow="مساحة الطالب"
        title="هذه الصفحة غير متاحة"
        description="ارجع إلى مساحة الطالب للمتابعة من المكان الصحيح."
        action={<Link className="aw-route-action" to="/app/home">العودة إلى مساحة الطالب</Link>}
      />
    </StudentProductShell>
  );
}

export function StudentRouter() {
  const location = useLocation();

  return (
    <>
      <RouteFocus routeKey={location.pathname} />
      <Routes>
        <Route path="/" element={<Navigate replace to="/app/home" />} />
        <Route path="/help" element={<StudentPublicInfoPage kind="help" />} />
        <Route path="/support" element={<StudentPublicInfoPage kind="support" />} />
        <Route path="/app" element={<Navigate replace to="/app/home" />} />
        <Route path="/app/*" element={<StudentAppRoute />} />
        <Route path="*" element={<StudentNotFoundRoute />} />
      </Routes>
    </>
  );
}
