import { Link, Navigate, useLocation } from "react-router-dom";
import { findStudentLesson } from "../../student-learning-model";
import { FeatureLoading } from "../../shared/ui/FeatureLoading";
import { StudentLessonReaderPage, StudentOfflineLessonReaderPage } from "../reader";
import { LearnLanding } from "./LearnLanding";
import { SubjectPage } from "./SubjectPage";
import { useStudentCurriculum } from "./useStudentCurriculum";

type LearningRoute =
  | { kind: "learn" }
  | { kind: "subject"; subjectId: string }
  | { kind: "lesson"; lessonId: string }
  | { kind: "invalid" };

function decodeRouteId(value: string | undefined): string | null {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return null; }
}

function learningRoute(pathname: string): LearningRoute {
  if (pathname === "/app/learn" || pathname === "/app/learn/") return { kind: "learn" };
  const subjectMatch = pathname.match(/^\/app\/learn\/subjects\/([^/]+)\/?$/);
  if (subjectMatch) {
    const subjectId = decodeRouteId(subjectMatch[1]);
    return subjectId ? { kind: "subject", subjectId } : { kind: "invalid" };
  }
  const lessonMatch = pathname.match(/^\/app\/learn\/lessons\/([^/]+)\/?$/);
  if (lessonMatch) {
    const lessonId = decodeRouteId(lessonMatch[1]);
    return lessonId ? { kind: "lesson", lessonId } : { kind: "invalid" };
  }
  return { kind: "invalid" };
}

function CurriculumUnavailable({ online, onRetry, error }: { online: boolean; onRetry: () => void; error: string | undefined }) {
  if (!online) {
    return (
      <section className="learn-v2-empty">
        <h2>أنت غير متصل</h2>
        <p>يمكنك فتح الدروس التي سبق حفظها من التنزيلات.</p>
        <Link className="secondary-button" to="/app/library/downloads">فتح التنزيلات</Link>
      </section>
    );
  }
  return (
    <section className="learn-v2-empty" role="alert">
      <h2>تعذر تحميل المحتوى الدراسي</h2>
      <p>{error ?? "حاول مرة أخرى."}</p>
      <button className="secondary-button" type="button" onClick={onRetry}>إعادة المحاولة</button>
    </section>
  );
}

export function StudentLearningExperience({ profileId, online, refreshKey, onSessionExpired }: {
  profileId: string;
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const location = useLocation();
  const route = learningRoute(location.pathname);
  const { state, reload } = useStudentCurriculum({ profileId, online, refreshKey, onSessionExpired });

  if (route.kind === "invalid") return <Navigate replace to="/app/learn" />;

  if (!online && route.kind === "lesson" && state.status !== "ready") {
    return <StudentOfflineLessonReaderPage lessonId={route.lessonId} />;
  }

  if (state.status === "loading" && !state.catalog) return <FeatureLoading />;

  const catalog = state.catalog;
  if (!catalog) {
    return <CurriculumUnavailable online={online} onRetry={() => void reload(true)} error={state.status === "error" ? state.message : undefined} />;
  }

  if (route.kind === "learn") return <LearnLanding catalog={catalog} />;
  if (route.kind === "subject") return <SubjectPage catalog={catalog} subjectId={route.subjectId} />;

  const context = findStudentLesson(catalog, route.lessonId);
  if (!context) {
    return (
      <section className="learn-v2-empty">
        <h2>هذا الدرس غير متاح لك</h2>
        <p>قد يكون وصولك تغيّر أو أن الرابط لم يعد صالحًا.</p>
        <Link className="secondary-button" to="/app/learn">العودة إلى التعلّم</Link>
      </section>
    );
  }

  return <StudentLessonReaderPage context={context} online={online} onSessionExpired={onSessionExpired} />;
}
