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
import { StudentIcon } from "../../shared/icons/StudentIcon";
import {
  getCachedStudentAttempts,
  getCachedStudentCurriculum,
  getCachedStudentQuizzes,
  peekCachedStudentAttempts,
  peekCachedStudentCurriculum,
  peekCachedStudentQuizzes,
} from "../../shared/data/student-runtime-cache";
import { ListRow } from "../../shared/ui/ListRow";
import { SectionHeader } from "../../shared/ui/SectionHeader";
import { StatStrip } from "../../shared/ui/StatStrip";

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

  const quickStats = [
    { key: "subjects", label: "المواد", value: snapshot.curriculum ? number.format(subjects.length) : "—", icon: <StudentIcon name="subjects" /> },
    { key: "lessons", label: "الدروس", value: snapshot.curriculum ? number.format(lessonTotal) : "—", icon: <StudentIcon name="lessons" /> },
    { key: "practice", label: "التدريبات", value: snapshot.quizzes ? number.format(snapshot.quizzes.length) : "—", icon: <StudentIcon name="practice" /> },
  ];

  return (
    <section className="student-home" aria-labelledby="student-home-title">
      <header className="student-home__welcome">
        <h1 id="student-home-title">مرحبًا بك</h1>
        <p>كل ما تحتاجه للتعلّم والمراجعة، مرتب لتصل إليه بسرعة.</p>
      </header>

      <section className="student-home-section" aria-labelledby="home-quick-title">
        <SectionHeader id="home-quick-title" title="نظرة سريعة" />
        <StatStrip items={quickStats} ariaLabel="ملخص المحتوى المتاح" />
      </section>

      {snapshot.downloadCount !== null ? (
        <section className="student-home-section" aria-labelledby="home-library-title">
          <SectionHeader id="home-library-title" title="مكتبتي" action={<Link to="/app/library">فتح مكتبتي</Link>} />
          <ListRow
            className="student-home-library-stat student-v2-surface"
            to="/app/library/downloads"
            leading={<span className="student-home-library-stat__icon"><StudentIcon name="download" /></span>}
            title={number.format(snapshot.downloadCount)}
            subtitle="تنزيلات محفوظة على هذا الجهاز"
            trailing={<StudentIcon name="chevron" aria-hidden="true" />}
          />
        </section>
      ) : null}

      {snapshot.loading ? <div className="student-home-inline-loading" role="status">جاري تجهيز ملخصك…</div> : null}

      {subjectPreview.length > 0 ? (
        <section className="student-home-section" aria-labelledby="home-subjects-title">
          <SectionHeader
            id="home-subjects-title"
            title="موادك"
            action={subjects.length > subjectPreview.length ? <Link to="/app/learn">عرض جميع المواد</Link> : undefined}
          />
          <div className="student-home-subjects student-v2-surface">
            {subjectPreview.map(({ subject, className }) => (
              <ListRow
                key={subject.id}
                className="student-home-subject"
                to={`/app/learn/subjects/${encodeURIComponent(subject.id)}`}
                leading={<span className="student-home-subject__icon"><StudentIcon name="learn" /></span>}
                title={subject.name}
                subtitle={`${className} · ${number.format(subjectLessonCount(subject))} درس`}
                trailing={<StudentIcon name="chevron" />}
              />
            ))}
          </div>
        </section>
      ) : null}

      {lastAttempt ? (
        <section className="student-home-section" aria-labelledby="home-attempt-title">
          <SectionHeader id="home-attempt-title" title="آخر تدريب" />
          <ListRow
            className="student-home-attempt student-v2-surface"
            to={`/app/practice/attempts/${encodeURIComponent(lastAttempt.sessionId)}`}
            leading={<span className="student-home-attempt__icon"><StudentIcon name="result" /></span>}
            title={lastAttempt.quizTitle}
            subtitle={`${number.format(lastAttempt.correctCount)} من ${number.format(lastAttempt.questionCount)} إجابة صحيحة`}
            trailing={<b>{number.format(lastAttempt.scorePercent)}٪</b>}
          />
        </section>
      ) : null}
    </section>
  );
}
