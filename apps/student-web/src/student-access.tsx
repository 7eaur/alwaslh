import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  isMissingSessionError,
  type SessionProfile,
  type StudentAssessmentAttempt,
  type StudentAssessmentCatalogItem,
  type StudentCurriculumCatalog,
  type StudentCurriculumSubject,
} from "./auth-api";
import { listOfflineLessonPackages } from "./offline-content-store";
import { getActiveOfflineScope } from "./offline-session";
import { StudentIcon, type StudentIconName } from "./student-icons";
import {
  getCachedStudentAttempts,
  getCachedStudentCurriculum,
  getCachedStudentQuizzes,
  invalidateStudentRuntimeCache,
  peekCachedStudentAttempts,
  peekCachedStudentCurriculum,
  peekCachedStudentQuizzes,
} from "./student-runtime-cache";

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

interface StudentDestinationDefinition {
  key: "home" | "learn" | "practice" | "library";
  href: string;
  label: string;
  shortLabel: string;
  icon: StudentIconName;
}

const primaryDestinations: StudentDestinationDefinition[] = [
  { key: "home", href: "/app/home", label: "الرئيسية", shortLabel: "الرئيسية", icon: "home" },
  { key: "learn", href: "/app/learn", label: "التعلّم", shortLabel: "التعلّم", icon: "learn" },
  { key: "practice", href: "/app/practice", label: "التدريب", shortLabel: "التدريب", icon: "practice" },
  { key: "library", href: "/app/library", label: "مكتبتي", shortLabel: "مكتبتي", icon: "library" },
];

const destinationLabels: Record<StudentDestination, string> = {
  home: "الرئيسية",
  learn: "التعلّم",
  practice: "التدريب",
  library: "مكتبتي",
  notifications: "الإشعارات",
  progress: "تقدمي",
  account: "حسابي",
};

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
  const home = destination === "home";
  return (
    <>
      <header className={`student-appbar${home ? " student-appbar--home" : ""}`}>
        {home ? (
          <Link className="student-appbar__brand" to="/app/home" aria-label="الوسيلة الذكية — الرئيسية">
            <img src="/app-icon.svg" alt="" aria-hidden="true" />
            <strong>الوسيلة الذكية</strong>
          </Link>
        ) : (
          <div className="student-appbar__title" aria-current="page">{destinationLabels[destination]}</div>
        )}
        <div className="student-appbar__actions">
          {!online ? <span className="student-network-warning" role="status">غير متصل</span> : null}
          <Link className={`student-v2-icon-button ${destination === "notifications" ? "is-active" : ""}`} to="/app/notifications" aria-current={destination === "notifications" ? "page" : undefined} aria-label="الإشعارات"><StudentIcon name="notifications" /></Link>
          <Link className={`student-v2-icon-button ${destination === "account" ? "is-active" : ""}`} to="/app/account" aria-current={destination === "account" ? "page" : undefined} aria-label="حسابي"><StudentIcon name="account" /></Link>
        </div>
      </header>
      <nav className="student-adaptive-nav" aria-label="التنقل الرئيسي للطالب">
        <Link className="student-adaptive-nav__brand" to="/app/home"><img src="/app-icon.svg" alt="" aria-hidden="true" /><span>الوسيلة الذكية</span><small>مساحة الطالب</small></Link>
        <div className="student-adaptive-nav__links">
          {primaryDestinations.map((item) => <Link key={item.key} className={`student-nav-link ${destination === item.key ? "is-active" : ""}`} to={item.href} aria-current={destination === item.key ? "page" : undefined}><StudentIcon name={item.icon} /><span>{item.label}</span></Link>)}
        </div>
        <div className="student-adaptive-nav__secondary">
          <Link className={`student-nav-link ${destination === "progress" ? "is-active" : ""}`} to="/app/progress" aria-current={destination === "progress" ? "page" : undefined}><StudentIcon name="progress" /><span>تقدمي</span></Link>
          <Link className={`student-nav-link student-nav-link--account ${destination === "account" ? "is-active" : ""}`} to="/app/account" aria-current={destination === "account" ? "page" : undefined}><StudentIcon name="account" /><span>الحساب</span></Link>
        </div>
      </nav>
      <nav className="student-bottom-nav" aria-label="التنقل الرئيسي للطالب على الهاتف">
        {primaryDestinations.map((item) => <Link key={item.key} className={`student-bottom-nav__item ${destination === item.key ? "is-active" : ""}`} to={item.href} aria-current={destination === item.key ? "page" : undefined}><StudentIcon name={item.icon} /><span>{item.shortLabel}</span></Link>)}
      </nav>
    </>
  );
}

function subjectLessonCount(subject: StudentCurriculumSubject): number {
  return subject.unsectionedLessons.length + subject.sections.reduce((total, section) => total + section.lessons.length, 0);
}

function allSubjects(catalog: StudentCurriculumCatalog | null): Array<{ subject: StudentCurriculumSubject; className: string }> {
  if (!catalog) return [];
  return catalog.classes.flatMap((classRecord) => classRecord.subjects.map((subject) => ({ subject, className: classRecord.name })));
}

type HomeSnapshot = {
  curriculum: StudentCurriculumCatalog | null;
  quizzes: StudentAssessmentCatalogItem[] | null;
  attempts: StudentAssessmentAttempt[] | null;
  downloadCount: number | null;
  loading: boolean;
};

function initialHomeSnapshot(profileId: string): HomeSnapshot {
  const curriculum = peekCachedStudentCurriculum(profileId);
  const quizzes = peekCachedStudentQuizzes(profileId);
  const attempts = peekCachedStudentAttempts(profileId, 8);
  return { curriculum, quizzes, attempts, downloadCount: null, loading: !curriculum && !quizzes && !attempts };
}

function StudentHomeOverview({ profileId, online, onSessionExpired }: { profileId: string; online: boolean; onSessionExpired: () => void }) {
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(() => initialHomeSnapshot(profileId));

  useEffect(() => {
    let active = true;

    const loadDownloads = async () => {
      const scope = getActiveOfflineScope();
      if (!scope || scope.profileId !== profileId) return 0;
      try { return (await listOfflineLessonPackages(scope.profileId, scope.deviceId)).length; }
      catch { return null; }
    };

    const load = async () => {
      const downloads = await loadDownloads();
      if (active) setSnapshot((current) => ({ ...current, downloadCount: downloads }));
      if (!online) {
        if (active) setSnapshot((current) => ({ ...current, loading: false }));
        return;
      }

      const results = await Promise.allSettled([
        getCachedStudentCurriculum(profileId),
        getCachedStudentQuizzes(profileId),
        getCachedStudentAttempts(profileId, 8),
      ]);

      const rejected = results.find((result) => result.status === "rejected");
      if (rejected?.status === "rejected" && isMissingSessionError(rejected.reason)) {
        onSessionExpired();
        return;
      }
      if (!active) return;
      setSnapshot((current) => ({
        curriculum: results[0].status === "fulfilled" ? results[0].value : current.curriculum,
        quizzes: results[1].status === "fulfilled" ? results[1].value : current.quizzes,
        attempts: results[2].status === "fulfilled" ? results[2].value : current.attempts,
        downloadCount: current.downloadCount,
        loading: false,
      }));
    };

    void load();
    return () => { active = false; };
  }, [online, onSessionExpired, profileId]);

  const subjects = allSubjects(snapshot.curriculum);
  const lessonTotal = subjects.reduce((total, item) => total + subjectLessonCount(item.subject), 0);
  const subjectPreview = subjects.slice(0, 3);
  const lastAttempt = snapshot.attempts?.[0] ?? null;
  const number = new Intl.NumberFormat("ar-YE");

  return (
    <section className="student-home" aria-labelledby="student-home-title">
      <header className="student-home__welcome">
        <h1 id="student-home-title">مرحبًا بك</h1>
        <p>كل ما تحتاجه للتعلّم والمراجعة، مرتب لتصل إليه بسرعة.</p>
      </header>

      <section className="student-home-section" aria-labelledby="home-quick-title">
        <div className="student-home-section__heading"><h2 id="home-quick-title">نظرة سريعة</h2></div>
        <div className="student-home-stats student-v2-surface" aria-label="ملخص المحتوى المتاح">
          <div><StudentIcon name="subjects" /><strong>{snapshot.curriculum ? number.format(subjects.length) : "—"}</strong><span>المواد</span></div>
          <div><StudentIcon name="lessons" /><strong>{snapshot.curriculum ? number.format(lessonTotal) : "—"}</strong><span>الدروس</span></div>
          <div><StudentIcon name="practice" /><strong>{snapshot.quizzes ? number.format(snapshot.quizzes.length) : "—"}</strong><span>التدريبات</span></div>
        </div>
      </section>

      {snapshot.downloadCount !== null ? (
        <section className="student-home-section" aria-labelledby="home-library-title">
          <div className="student-home-section__heading"><h2 id="home-library-title">مكتبتي</h2><Link to="/app/library">فتح مكتبتي</Link></div>
          <Link className="student-home-library-stat student-v2-surface" to="/app/library/downloads">
            <span className="student-home-library-stat__icon"><StudentIcon name="download" /></span>
            <span><strong>{number.format(snapshot.downloadCount)}</strong><small>تنزيلات محفوظة على هذا الجهاز</small></span>
            <StudentIcon name="chevron" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {snapshot.loading ? <div className="student-home-inline-loading" role="status">جاري تجهيز ملخصك…</div> : null}

      {subjectPreview.length > 0 ? (
        <section className="student-home-section" aria-labelledby="home-subjects-title">
          <div className="student-home-section__heading"><h2 id="home-subjects-title">موادك</h2>{subjects.length > subjectPreview.length ? <Link to="/app/learn">عرض جميع المواد</Link> : null}</div>
          <div className="student-home-subjects student-v2-surface">
            {subjectPreview.map(({ subject, className }) => (
              <Link className="student-home-subject" key={subject.id} to={`/app/learn/subjects/${encodeURIComponent(subject.id)}`}>
                <span className="student-home-subject__icon"><StudentIcon name="learn" /></span>
                <span><strong>{subject.name}</strong><small>{className} · {number.format(subjectLessonCount(subject))} درس</small></span>
                <StudentIcon name="chevron" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {lastAttempt ? (
        <section className="student-home-section" aria-labelledby="home-attempt-title">
          <div className="student-home-section__heading"><h2 id="home-attempt-title">آخر تدريب</h2></div>
          <Link className="student-home-attempt student-v2-surface" to={`/app/practice/attempts/${encodeURIComponent(lastAttempt.sessionId)}`}>
            <span className="student-home-attempt__icon"><StudentIcon name="result" /></span>
            <span className="student-home-attempt__copy"><strong>{lastAttempt.quizTitle}</strong><small>{number.format(lastAttempt.correctCount)} من {number.format(lastAttempt.questionCount)} إجابة صحيحة</small></span>
            <b>{number.format(lastAttempt.scorePercent)}٪</b>
          </Link>
        </section>
      ) : null}
    </section>
  );
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

  const handleAccessChanged = () => {
    invalidateStudentRuntimeCache(profile.id, ["curriculum", "quizzes"]);
    setCurriculumRefreshKey((current) => current + 1);
  };

  return (
    <div className={`student-shell student-destination--${destination}${focusedReader ? " is-focused-reader" : ""}`} data-student-destination={destination} data-reader-focused={focusedReader || undefined}>
      <StudentShellNavigation destination={destination} online={online} focused={focusedReader} />
      <div className="student-destination">
        {destination === "home" ? <StudentHomeOverview profileId={profile.id} online={online} onSessionExpired={onSessionExpired} /> : null}
        <Suspense fallback={<StudentFeatureLoading />}>
          {destination === "learn" ? (
            <>
              {atLearnRoot && activatedAccess ? <div className="form-alert is-success student-route-notice" role="status"><strong>تم تفعيل الصف. أصبح محتواه متاحًا في التعلّم.</strong></div> : null}
              <StudentLearningExperience online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} />
            </>
          ) : null}
          {destination === "practice" ? <StudentAssessmentSection online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} /> : null}
          {destination === "library" ? <StudentLibraryExperience online={online} refreshKey={curriculumRefreshKey} onSessionExpired={onSessionExpired} /> : null}
          {destination === "notifications" ? <StudentNotificationsExperience /> : null}
          {destination === "progress" ? <StudentProgressExperience /> : null}
          {destination === "account" ? <StudentAccountExperience profile={profile} online={online} onSessionExpired={onSessionExpired} onAccessChanged={handleAccessChanged} onLoggedOut={onLoggedOut} /> : null}
        </Suspense>
      </div>
    </div>
  );
}
