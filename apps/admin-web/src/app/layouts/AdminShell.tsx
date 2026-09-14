import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ADMIN_NAVIGATION } from "../../admin-navigation";
import type { AdminProfile } from "../../features/auth/public";

export function AdminBrandBlock({ auth = false }: { auth?: boolean }) {
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

export function AdminShell({
  profile,
  onLogout,
  children,
}: {
  profile: AdminProfile;
  onLogout: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="التنقل الرئيسي">
        <AdminBrandBlock />
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
      <main className="admin-main">{children}</main>
    </div>
  );
}
