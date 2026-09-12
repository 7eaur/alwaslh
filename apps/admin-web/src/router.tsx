import { PageState, ProductShell, RouteFocus } from "@alwaslh/ui";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { App } from "./App";

function AdminAppRoute() {
  return (
    <ProductShell surface="admin">
      <App />
    </ProductShell>
  );
}

function AdminNotFoundRoute() {
  return (
    <ProductShell surface="admin">
      <PageState
        kind="empty"
        eyebrow="مساحة الإدارة"
        title="هذه الصفحة غير متاحة"
        description="ارجع إلى مساحة الإدارة للمتابعة من الوجهة الصحيحة."
        action={
          <Link className="aw-route-action" to="/app">
            العودة إلى مساحة الإدارة
          </Link>
        }
      />
    </ProductShell>
  );
}

export function AdminRouter() {
  const location = useLocation();

  return (
    <>
      <RouteFocus routeKey={location.pathname} />
      <Routes>
        <Route path="/" element={<Navigate replace to="/app" />} />
        <Route path="/app/*" element={<AdminAppRoute />} />
        <Route path="*" element={<AdminNotFoundRoute />} />
      </Routes>
    </>
  );
}
