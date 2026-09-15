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
import { StudentIcon, type StudentIconName } from "../../shared/icons/StudentIcon";
import {
  getCachedStudentAttempts,
  getCachedStudentCurriculum,
  getCachedStudentQuizzes,
  peekCachedStudentAttempts,
  peekCachedStudentCurriculum,
  peekCachedStudentQuizzes,
} from "../../shared/data/student-runtime-cache";

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

function HomeStat({ icon, value, label, pending = false }: {
  icon: StudentIconName;
  value: string;
  label: string;
  pending?: boolean;
}) {
  return (
    <div className={`student-home-reference-stat${pending ? " is-pending" : ""}`}>
      <span className="student-home-reference-stat__icon"><StudentIcon name={icon} /></span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function QuickAccessCard({ to, icon, label, tone }: {
  to: string;
  icon: StudentIconName;
  label: string;
  tone: "mint" | "green" | "blue" | "sand";
}) {
  return (
    <Link className={`student-home-reference-quick is-${tone}`} to={to}>
      <span className="student-home-reference-quick__icon"><StudentIcon name={icon} /></span>
      <strong>{label}</strong>
      <span className="student-home-reference-quick__arrow" aria-hidden="true"><StudentIcon name="chevron" /></span>
    </Link>
  );
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
  const modelTotal = snapshot.quizzes?.reduce((total, quiz) => total + quiz.versions.length, 0) ?? null;
  const firstSubject = subjects[0] ?? null;
  const lastAttempt = snapshot.attempts?.[0] ?? null;
  const number = new Intl.NumberFormat("ar-YE");

  return (
    <section className="student-home student-home-reference" aria-labelledby="student-home-title">
      <header className="student-home-reference__welcome">
        <div>
          <h1 id="student-home-title">مرحبًا بك</h1>
          <p>رحلتك التعليمية مستمرة.. كل خطوة تصنع الفرق.</p>
        </div>
      </header>

      {firstSubject ? (
        <Link className="student-home-reference__learning-card" to={`/app/learn/subjects/${encodeURIComponent(firstSubject.subject.id)}`}>
          <span className="student-home-reference__learning-icon"><StudentIcon name="learn" /></span>
          <span className="student-home-reference__learning-copy">
            <small>ابدأ التعلّم</small>
            <strong>{firstSubject.subject.name}</strong>
            <span>{firstSubject.className} · {number.format(subjectLessonCount(firstSubject.subject))} درس</span>
          </span>
          <span className="student-home-reference__learning-arrow" aria-hidden="true"><StudentIcon name="chevron" /></span>
        </Link>
      ) : null}

      <section className="student-home-reference__section" aria-labelledby="home-stats-title">
        <header className="student-home-reference__section-heading">
          <h2 id="home-stats-title">إحصائياتك</h2>
          <StudentIcon name="progress" aria-hidden="true" />
        </header>
        <div className="student-home-reference__stats" aria-label="إحصائيات الطالب">
          <HomeStat icon="lessons" value={snapshot.curriculum ? number.format(lessonTotal) : "—"} label="الدروس" />
          <HomeStat icon="notes" value={modelTotal === null ? "—" : number.format(modelTotal)} label="النماذج" />
          <HomeStat icon="saved" value="—" label="المحفوظات" pending />
          <HomeStat icon="download" value={snapshot.downloadCount === null ? "—" : number.format(snapshot.downloadCount)} label="التنزيلات" />
        </div>
      </section>

      <section className="student-home-reference__section" aria-labelledby="home-quick-title">
        <header className="student-home-reference__section-heading">
          <h2 id="home-quick-title">الوصول السريع</h2>
          <StudentIcon name="subjects" aria-hidden="true" />
        </header>
        <div className="student-home-reference__quick-grid">
          <QuickAccessCard to="/app/learn" icon="learn" label="التعلّم" tone="mint" />
          <QuickAccessCard to="/app/practice" icon="practice" label="التدريب" tone="green" />
          <QuickAccessCard to="/app/practice" icon="notes" label="النماذج" tone="blue" />
          <QuickAccessCard to="/app/library/saved" icon="saved" label="المحفوظات" tone="sand" />
        </div>
      </section>

      {lastAttempt ? (
        <section className="student-home-reference__section" aria-labelledby="home-activity-title">
          <header className="student-home-reference__section-heading">
            <h2 id="home-activity-title">آخر نشاط لك</h2>
            <StudentIcon name="review" aria-hidden="true" />
          </header>
          <Link className="student-home-reference__activity" to={`/app/practice/attempts/${encodeURIComponent(lastAttempt.sessionId)}`}>
            <span className="student-home-reference__activity-icon"><StudentIcon name="result" /></span>
            <span className="student-home-reference__activity-copy">
              <strong>{lastAttempt.quizTitle}</strong>
              <small>{number.format(lastAttempt.correctCount)} من {number.format(lastAttempt.questionCount)} إجابة صحيحة</small>
            </span>
            <b>{number.format(lastAttempt.scorePercent)}٪</b>
            <StudentIcon name="chevron" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {snapshot.loading ? <div className="student-home-inline-loading" role="status">جاري تجهيز ملخصك…</div> : null}
    </section>
  );
}
