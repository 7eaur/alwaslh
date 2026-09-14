import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  isMissingSessionError,
  type StudentAssessmentAttempt,
  type StudentAssessmentCatalogItem,
  type StudentCurriculumCatalog,
  type StudentCurriculumSubject,
} from "../../auth-api";
import { listOfflineLessonPackages } from "../../offline-content-store";
import { getActiveOfflineScope } from "../../offline-session";
import { StudentIcon } from "../../student-icons";
import {
  getCachedStudentAttempts,
  getCachedStudentCurriculum,
  getCachedStudentQuizzes,
  peekCachedStudentAttempts,
  peekCachedStudentCurriculum,
  peekCachedStudentQuizzes,
} from "../../student-runtime-cache";

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

export function StudentHomeOverview({ profileId, online, onSessionExpired }: {
  profileId: string;
  online: boolean;
  onSessionExpired: () => void;
}) {
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
