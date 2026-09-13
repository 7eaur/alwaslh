import { lazy, Suspense, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import type { SessionProfile } from "./auth-api";

const StudentAccountExperience = lazy(() =>
  import("./student-account").then((module) => ({ default: module.StudentAccountExperience })),
);
const StudentAssessmentSection = lazy(() =>
  import("./student-assessment").then((module) => ({ default: module.StudentAssessmentSection })),
);
const StudentLearningExperience = lazy(() =>
  import("./student-learning").then((module) => ({ default: module.StudentLearningExperience })),
);
const StudentLibraryExperience = lazy(() =>
  import("./student-future-surfaces").then((module) => ({ default: module.StudentLibraryExperience })),
);
const StudentNotificationsExperience = lazy(() =>
  import("./student-future-surfaces").then((module) => ({ default: module.StudentNotificationsExperience })),
);
const StudentProgressExperience = lazy(() =>
  import("./student-future-surfaces").then((module) => ({ default: module.StudentProgressExperience })),
);

type StudentDestination = "home" | "learn" | "practice" | "library" | "notifications" | "progress" | "account";
type StudentDestinationIcon = "home" | "learn" | "practice" | "library" | "notifications" | "progress" | "account";

interface StudentDestinationDefinition {
  key: "home" | "learn" | "practice" | "library";
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: StudentDestinationIcon;
}

const primaryDestinations: StudentDestinationDefinition[] = [
  { key: "home", href: "/app/home", label: "الرئيسية", shortLabel: "الرئيسية", description: "ابدأ من هنا وانتقل إلى أهم ما تحتاجه في التطبيق.", icon: "home" },
  { key: "learn", href: "/app/learn", label: "التعلّم", shortLabel: "التعلّم", description: "اختر المادة ثم افتح الدرس الذي تريد تعلمه.", icon: "learn" },
  { key: "practice", href: "/app/practice", label: "التدريب", shortLabel: "التدريب", description: "راجع ما تعلمته من خلال التدريب والاختبارات المتاحة.", icon: "practice" },
  { key: "library", href: "/app/library", label: "مكتبتي", shortLabel: "مكتبتي", description: "تنزيلاتك وملاحظاتك ومحفوظاتك وما تريد مراجعته لاحقًا.", icon: "library" },
];

function destinationFromPath(pathname: string): StudentDestination | null {
  if (pathname === "/app" || pathname === "/app/") return "home";
  if (pathname === "/app/account" || pathname.startsWith("/app/account/")) return "account";
  if (pathname === "/app/notifications" || pathname.startsWith("/app/notifications/")) return "notifications";
  if (pathname === "/app/progress" || pathname.startsWith("/app/progress/")) return "progress";
  if (pathname === "/app/downloads" || pathname === "/app/library" || pathname.startsWith("/app/library/")) return "library";
  for (const destination of primaryDestinations) {
    if (pathname === destination.href || pathname.startsWith(`${destination.href}/`)) return destination.key;
  }
  return null;
}

function isReaderPath(pathname: string): boolean {
  return /^\/app\/learn\/lessons\/[^/]+\/?$/.test(pathname);
}

function DestinationIcon({ kind }: { kind: StudentDestinationIcon }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, focusable: false, "aria-hidden": true };
  if (kind === "home") return <svg {...common}><path d="M3.5 10.5 12 3.8l8.5 6.7" /><path d="M5.5 9.3V20h13V9.3" /><path d="M9.3 20v-6h5.4v6" /></svg>;
  if (kind === "learn") return <svg {...common}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z" /></svg>;
  if (kind === "practice") return <svg {...common}><path d="M8 3h8" /><path d="M9 2v3M15 2v3" /><rect x="4" y="5" width="16" height="16" rx="3" /><path d="m8 13 2.3 2.3L16 9.7" /></svg>;
  if (kind === "library") return <svg {...common}><path d="M5 4h12a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2Z" /><path d="M7 19a2 2 0 0 1 0-4h12" /><path d="M9 8h6" /></svg>;
  if (kind === "notifications") return <svg {...common}><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Z" /><path d="M10 21h4" /></svg>;
  if (kind === "progress") return <svg {...common}><path d="M5 19V9M12 19V5M19 19v-7" /><path d="M3 19h18" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>;
}

function StudentFeatureLoading() {
  return (
    <div className="student-feature-loading" role="status" aria-live="polite" aria-busy="true">
      <span className="spinner" aria-hidden="true" />
      <span>جاري فتح الصفحة</span>
    </div>
  );
}

function StudentShellNavigation({ destination, online, focused = false }: { destination: StudentDestination; online: boolean; focused?: boolean }) {
  if (focused) return !online ? <div className="student-focused-offline" role="status">غير متصل</div> : null;
  return (
    <>
      <header className="student-appbar">
        <Link className="student-appbar__brand" to="/app/home" aria-label="الوسيلة الذكية — الرئيسية"><span aria-hidden="true">و</span><strong>الوسيلة الذكية</strong></Link>
        <div className="student-appbar__actions">
          {!online ? <span className="student-network-warning" role="status">غير متصل</span> : null}
          <Link className={`student-icon-action ${destination === "notifications" ? "is-active" : ""}`} to="/app/notifications" aria-current={destination === "notifications" ? "page" : undefined} aria-label="الإشعارات"><DestinationIcon kind="notifications" /></Link>
          <Link className={`student-account-entry ${destination === "account" ? "is-active" : ""}`} to="/app/account" aria-current={destination === "account" ? "page" : undefined} aria-label="حسابي"><DestinationIcon kind="account" /><span>حسابي</span></Link>
        </div>
      </header>
      <nav className="student-adaptive-nav" aria-label="التنقل الرئيسي للطالب">
        <Link className="student-adaptive-nav__brand" to="/app/home"><span>الوسيلة الذكية</span><small>مساحة الطالب</small></Link>
        <div className="student-adaptive-nav__links">
          {primaryDestinations.map((item) => <Link key={item.key} className={`student-nav-link ${destination === item.key ? "is-active" : ""}`} to={item.href} aria-current={destination === item.key ? "page" : undefined}><DestinationIcon kind={item.icon} /><span>{item.label}</span></Link>)}
        </div>
        <div className="student-adaptive-nav__secondary">
          <Link className={`student-nav-link ${destination === "progress" ? "is-active" : ""}`} to="/app/progress" aria-current={destination === "progress" ? "page" : undefined}><DestinationIcon kind="progress" /><span>تقدمي</span></Link>
          <Link className={`student-nav-link student-nav-link--account ${destination === "account" ? "is-active" : ""}`} to="/app/account" aria-current={destination === "account" ? "page" : undefined}><DestinationIcon kind="account" /><span>الحساب</span></Link>
        </div>
      </nav>
      <nav className="student-bottom-nav" aria-label="التنقل الرئيسي للطالب على الهاتف">
        {primaryDestinations.map((item) => <Link key={item.key} className={`student-bottom-nav__item ${destination === item.key ? "is-active" : ""}`} to={item.href} aria-current={destination === item.key ? "page" : undefined}><DestinationIcon kind={item.icon} /><span>{item.shortLabel}</span></Link>)}
      </nav>
    </>
  );
}

function StudentHomeOverview() {
  return (
    <section className="student-home" aria-labelledby="student-home-title">
      <header className="student-page-heading student-page-heading--home"><p className="eyebrow">الرئيسية</p><h1 id="student-home-title">ماذا تريد أن تفعل الآن؟</h1><p>اختر التعلّم لفتح موادك، أو التدريب للمراجعة، أو مكتبتي للرجوع إلى ما حفظته لك.</p></header>
      <div className="student-home-grid" aria-label="وجهات الطالب">
        {primaryDestinations.filter((item) => item.key !== "home").map((item) => (
          <Link className="student-home-card" key={item.key} to={item.href}><span className="student-home-card__icon" aria-hidden="true"><DestinationIcon kind={item.icon} /></span><span className="student-home-card__copy"><strong>{item.label}</strong><small>{item.description}</small></span><span className="student-home-card__arrow" aria-hidden="true">←</span></Link>
        ))}
      </div>
      <aside className="student-home-secondary" aria-label="ملخصات الطالب">
        <Link className="student-home-secondary__item" to="/app/progress"><span className="student-home-secondary__icon"><DestinationIcon kind="progress" /></span><span><strong>تقدمي</strong><small>الدروس والتدريب والإنجازات في مساحة واحدة.</small></span><span aria-hidden="true">←</span></Link>
        <Link className="student-home-secondary__item" to="/app/notifications"><span className="student-home-secondary__icon"><DestinationIcon kind="notifications" /></span><span><strong>الإشعارات</strong><small>راجع ما يحتاج انتباهك عندما يصل تحديث جديد.</small></span><span aria-hidden="true">←</span></Link>
      </aside>
    </section>
  );
}

function LearnHeading() {
  const item = primaryDestinations.find((candidate) => candidate.key === "learn")!;
  return <header className="student-page-heading"><p className="eyebrow">{item.label}</p><h1>موادك ودروسك</h1><p>{item.description}</p></header>;
}

export function StudentAccessSection({ profile, online, onSessionExpired, onLoggedOut }: {
  profile: SessionProfile;
  online: boolean;
  onSessionExpired: () => void;
  onLoggedOut: () => void;
}) {
  const location = useLocation();
  const destination = destinationFromPath(location.pathname);
  const focusedReader = isReaderPath(location.pathname);
  const atLearnRoot = location.pathname === "/app/learn" || location.pathname === "/app/learn/";
  const [curriculumRefreshKey, setCurriculumRefreshKey] = useState(0);
  const activatedAccess = Boolean((location.state as { accessActivated?: boolean } | null)?.accessActivated);

  if (!destination) return <Navigate replace to="/app/home" />;

  return (
    <div className={`student-shell student-destination--${destination}${focusedReader ? " is-focused-reader" : ""}`} data-student-destination={destination} data-reader-focused={focusedReader || undefined}>
      <StudentShellNavigation destination={destination} online={online} focused={focusedReader} />
      <div className="student-destination">
        {destination === "home" ? <StudentHomeOverview /> : null}
        <Suspense fallback={<StudentFeatureLoading />}>
          {destination === "learn" ? (
            <>
              {atLearnRoot ? <LearnHeading /> : null}
              {atLearnRoot && activatedAccess ? <div className="form-alert is-success student-route-notice" role="status"><strong>تم تفعيل الصف. أصبح محتواه متاحًا في التعلّم.</strong></div> : null}
              <StudentLearningExperience online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} />
            </>
          ) : null}
          {destination === "practice" ? <StudentAssessmentSection online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} /> : null}
          {destination === "library" ? <StudentLibraryExperience online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} /> : null}
          {destination === "notifications" ? <StudentNotificationsExperience /> : null}
          {destination === "progress" ? <StudentProgressExperience /> : null}
          {destination === "account" ? <StudentAccountExperience profile={profile} online={online} onSessionExpired={onSessionExpired} onAccessChanged={() => setCurriculumRefreshKey((current) => current + 1)} onLoggedOut={onLoggedOut} /> : null}
        </Suspense>
      </div>
    </div>
  );
}
