import { lazy, Suspense, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { SessionProfile } from "./auth-api";
import { StudentAppShell } from "./app/layout/StudentAppShell";
import { isFocusedStudentReaderPath, studentDestinationFromPath } from "./app/routing/student-route-meta";
import { StudentHomeOverview } from "./features/home/StudentHomeOverview";
import { invalidateStudentRuntimeCache } from "./shared/data/student-runtime-cache";
import { FeatureLoading } from "./shared/ui/FeatureLoading";

const StudentAccountExperience = lazy(() =>
  import("./features/account/StudentAccountExperience").then((module) => ({ default: module.StudentAccountExperience })),
);
const StudentAssessmentSection = lazy(() =>
  import("./student-assessment").then((module) => ({ default: module.StudentAssessmentSection })),
);
const StudentLearningExperience = lazy(() =>
  import("./student-learning").then((module) => ({ default: module.StudentLearningExperience })),
);
const StudentLibraryExperience = lazy(() =>
  import("./features/library/StudentLibraryExperience").then((module) => ({ default: module.StudentLibraryExperience })),
);
const StudentNotificationsExperience = lazy(() =>
  import("./student-future-surfaces").then((module) => ({ default: module.StudentNotificationsExperience })),
);
const StudentProgressExperience = lazy(() =>
  import("./student-future-surfaces").then((module) => ({ default: module.StudentProgressExperience })),
);

export function StudentAccessSection({ profile, online, onSessionExpired, onLoggedOut }: {
  profile: SessionProfile;
  online: boolean;
  onSessionExpired: () => void;
  onLoggedOut: () => void;
}) {
  const location = useLocation();
  const destination = studentDestinationFromPath(location.pathname);
  const focusedReader = isFocusedStudentReaderPath(location.pathname);
  const atLearnRoot = location.pathname === "/app/learn" || location.pathname === "/app/learn/";
  const [curriculumRefreshKey, setCurriculumRefreshKey] = useState(0);
  const activatedAccess = Boolean((location.state as { accessActivated?: boolean } | null)?.accessActivated);

  if (!destination) return <Navigate replace to="/app/home" />;

  const handleAccessChanged = () => {
    invalidateStudentRuntimeCache(profile.id, ["curriculum", "quizzes"]);
    setCurriculumRefreshKey((current) => current + 1);
  };

  return (
    <StudentAppShell destination={destination} online={online} focused={focusedReader}>
      {destination === "home" ? (
        <StudentHomeOverview profileId={profile.id} online={online} onSessionExpired={onSessionExpired} />
      ) : null}

      <Suspense fallback={<FeatureLoading />}>
        {destination === "learn" ? (
          <>
            {atLearnRoot && activatedAccess ? (
              <div className="form-alert is-success student-route-notice" role="status">
                <strong>تم تفعيل الصف. أصبح محتواه متاحًا في التعلّم.</strong>
              </div>
            ) : null}
            <StudentLearningExperience
              online={online}
              refreshKey={curriculumRefreshKey}
              onSessionExpired={onSessionExpired}
            />
          </>
        ) : null}

        {destination === "practice" ? (
          <StudentAssessmentSection
            online={online}
            refreshKey={curriculumRefreshKey}
            onSessionExpired={onSessionExpired}
          />
        ) : null}

        {destination === "library" ? (
          <StudentLibraryExperience
            online={online}
            refreshKey={curriculumRefreshKey}
            onSessionExpired={onSessionExpired}
          />
        ) : null}

        {destination === "notifications" ? <StudentNotificationsExperience /> : null}
        {destination === "progress" ? <StudentProgressExperience /> : null}
        {destination === "account" ? (
          <StudentAccountExperience
            profile={profile}
            online={online}
            onSessionExpired={onSessionExpired}
            onAccessChanged={handleAccessChanged}
            onLoggedOut={onLoggedOut}
          />
        ) : null}
      </Suspense>
    </StudentAppShell>
  );
}
