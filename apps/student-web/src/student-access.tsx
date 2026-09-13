import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import type { SessionProfile } from "./auth-api";
import { StudentAccountExperience } from "./student-account";
import { StudentAssessmentSection } from "./student-assessment";
import { StudentLearningExperience } from "./student-learning";
import { StudentOfflineDownloadsSection } from "./student-offline-downloads";

type StudentDestination = "home" | "learn" | "practice" | "downloads" | "account";
type StudentDestinationIcon = "home" | "learn" | "practice" | "downloads" | "account";

interface StudentDestinationDefinition {
  key: Exclude<StudentDestination, "account">;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: StudentDestinationIcon;
}

const learningDestinations: StudentDestinationDefinition[] = [
  { key: "home", href: "/app/home", label: "الرئيسية", shortLabel: "الرئيسية", description: "ابدأ من هنا وانتقل إلى أهم ما تحتاجه في التطبيق.", icon: "home" },
  { key: "learn", href: "/app/learn", label: "التعلّم", shortLabel: "التعلّم", description: "اختر المادة ثم افتح الدرس الذي تريد تعلمه.", icon: "learn" },
  { key: "practice", href: "/app/practice", label: "التدريب", shortLabel: "التدريب", description: "راجع ما تعلمته من خلال التدريب والاختبارات المتاحة.", icon: "practice" },
  { key: "downloads", href: "/app/downloads", label: "التنزيلات", shortLabel: "التنزيلات", description: "أدر الدروس المحفوظة على هذا الجهاز.", icon: "downloads" },
];

function destinationFromPath(pathname: string): StudentDestination | null {
  if (pathname === "/app" || pathname === "/app/") return "home";
  if (pathname === "/app/account" || pathname.startsWith("/app/account/")) return "account";
  for (const destination of learningDestinations) {
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
  if (kind === "downloads") return <svg {...common}><path d="M12 3v11" /><path d="m7.5 10 4.5 4.5 4.5-4.5" /><path d="M5 20h14" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>;
}

function StudentShellNavigation({ destination, online, focused = false }: { destination: StudentDestination; online: boolean; focused?: boolean }) {
  if (focused) return !online ? <div className="student-focused-offline" role="status">غير متصل</div> : null;
  return (
    <>
      <header className="student-appbar">
        <Link className="student-appbar__brand" to="/app/home" aria-label="الوسيلة الذكية — الرئيسية"><span aria-hidden="true">و</span><strong>الوسيلة الذكية</strong></Link>
        <div className="student-appbar__actions">
          {!online ? <span className="student-network-warning" role="status">غير متصل</span> : null}
          <Link className={`student-account-entry ${destination === "account" ? "is-active" : ""}`} to="/app/account" aria-current={destination === "account" ? "page" : undefined} aria-label="حسابي"><DestinationIcon kind="account" /><span>حسابي</span></Link>
        </div>
      </header>
      <nav className="student-adaptive-nav" aria-label="التنقل الرئيسي للطالب">
        <Link className="student-adaptive-nav__brand" to="/app/home"><span>الوسيلة الذكية</span><small>مساحة الطالب</small></Link>
        <div className="student-adaptive-nav__links">
          {learningDestinations.map((item) => <Link key={item.key} className={`student-nav-link ${destination === item.key ? "is-active" : ""}`} to={item.href} aria-current={destination === item.key ? "page" : undefined}><DestinationIcon kind={item.icon} /><span>{item.label}</span></Link>)}
        </div>
        <Link className={`student-nav-link student-nav-link--account ${destination === "account" ? "is-active" : ""}`} to="/app/account" aria-current={destination === "account" ? "page" : undefined}><DestinationIcon kind="account" /><span>الحساب</span></Link>
      </nav>
      <nav className="student-bottom-nav" aria-label="التنقل الرئيسي للطالب على الهاتف">
        {learningDestinations.map((item) => <Link key={item.key} className={`student-bottom-nav__item ${destination === item.key ? "is-active" : ""}`} to={item.href} aria-current={destination === item.key ? "page" : undefined}><DestinationIcon kind={item.icon} /><span>{item.shortLabel}</span></Link>)}
      </nav>
    </>
  );
}

function StudentHomeOverview() {
  return (
    <section className="student-home" aria-labelledby="student-home-title">
      <header className="student-page-heading student-page-heading--home"><p className="eyebrow">الرئيسية</p><h1 id="student-home-title">ماذا تريد أن تفعل الآن؟</h1><p>اختر التعلّم لفتح موادك، أو التدريب للمراجعة، أو التنزيلات لإدارة ما حفظته على جهازك.</p></header>
      <div className="student-home-grid" aria-label="وجهات الطالب">
        {learningDestinations.filter((item) => item.key !== "home").map((item) => (
          <Link className="student-home-card" key={item.key} to={item.href}><span className="student-home-card__icon" aria-hidden="true"><DestinationIcon kind={item.icon} /></span><span className="student-home-card__copy"><strong>{item.label}</strong><small>{item.description}</small></span><span className="student-home-card__arrow" aria-hidden="true">←</span></Link>
        ))}
      </div>
    </section>
  );
}

function LearnHeading() {
  const item = learningDestinations.find((candidate) => candidate.key === "learn")!;
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
        {destination === "learn" ? (
          <>
            {atLearnRoot ? <LearnHeading /> : null}
            {atLearnRoot && activatedAccess ? <div className="form-alert is-success student-route-notice" role="status"><strong>تم تفعيل الصف. أصبح محتواه متاحًا في التعلّم.</strong></div> : null}
            <StudentLearningExperience online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} />
          </>
        ) : null}
        {destination === "practice" ? <StudentAssessmentSection online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} /> : null}
        {destination === "downloads" ? <StudentOfflineDownloadsSection online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} /> : null}
        {destination === "account" ? <StudentAccountExperience profile={profile} online={online} onSessionExpired={onSessionExpired} onAccessChanged={() => setCurriculumRefreshKey((current) => current + 1)} onLoggedOut={onLoggedOut} /> : null}
      </div>
    </div>
  );
}
