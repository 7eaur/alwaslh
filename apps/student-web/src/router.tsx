import { PageState, ProductShell, RouteFocus } from "@alwaslh/ui";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import App from "./App";

function StudentAppRoute() {
  return (
    <ProductShell surface="student">
      <App />
    </ProductShell>
  );
}

function StudentNotFoundRoute() {
  return (
    <ProductShell surface="student">
      <PageState
        kind="empty"
        eyebrow="مساحة الطالب"
        title="هذه الصفحة غير متاحة"
        description="ارجع إلى مساحة الطالب للمتابعة من الوجهة الصحيحة."
        action={
          <Link className="aw-route-action" to="/app">
            العودة إلى مساحة الطالب
          </Link>
        }
      />
    </ProductShell>
  );
}

export function StudentRouter() {
  const location = useLocation();

  return (
    <>
      <RouteFocus routeKey={location.pathname} />
      <Routes>
        <Route path="/" element={<Navigate replace to="/app" />} />
        <Route path="/app/*" element={<StudentAppRoute />} />
        <Route path="*" element={<StudentNotFoundRoute />} />
      </Routes>
    </>
  );
}
