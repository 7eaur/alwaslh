import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  isMissingSessionError,
  startStudentAssessment,
  type StudentAssessmentCatalogItem,
  type StudentAssessmentMode,
} from "../../auth-api";
import {
  getCachedStudentAttempts,
  getCachedStudentQuizzes,
  invalidateStudentRuntimeCache,
  peekCachedStudentAttempts,
  peekCachedStudentQuizzes,
} from "../../shared/data/student-runtime-cache";
import { AttemptPage } from "./AssessmentAttempt";
import { CatalogState, PracticeLibrary, QuizDetail } from "./PracticeCatalog";
import {
  attemptHref,
  hasBlockingCatalogState,
  practiceRoute,
  requestAssessmentMessage,
  type AssessmentCatalogState,
} from "./practice-model";

function initialCatalogState(profileId: string, online: boolean): AssessmentCatalogState {
  const quizzes = peekCachedStudentQuizzes(profileId) ?? [];
  const attempts = peekCachedStudentAttempts(profileId, 8) ?? [];
  if (!online) return { status: "offline", quizzes, attempts };
  if (quizzes.length > 0 || attempts.length > 0) return { status: "ready", quizzes, attempts };
  return { status: "loading", quizzes, attempts };
}

export function StudentPracticeExperience({ profileId, online, refreshKey, onSessionExpired }: {
  profileId: string;
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const route = practiceRoute(location.pathname);
  const [state, setState] = useState<AssessmentCatalogState>(() => initialCatalogState(profileId, online));
  const [busyQuizId, setBusyQuizId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadCatalog(force = false) {
    if (!online) {
      setState((current) => ({ ...current, status: "offline" }));
      return;
    }

    setState((current) => ({ ...current, status: "loading" }));
    try {
      const [quizzes, attempts] = await Promise.all([
        getCachedStudentQuizzes(profileId, force ? { force: true } : undefined),
        getCachedStudentAttempts(profileId, 8, force ? { force: true } : undefined),
      ]);
      setState({ status: "ready", quizzes, attempts });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState((current) => ({ ...current, status: "error", message: requestAssessmentMessage(error) }));
    }
  }

  useEffect(() => {
    if (route.kind !== "attempt") void loadCatalog(refreshKey > 0);
  }, [online, profileId, refreshKey, route.kind]);

  async function start(quiz: StudentAssessmentCatalogItem, mode: StudentAssessmentMode, versionId?: string) {
    if (!online || busyQuizId) return;
    setBusyQuizId(quiz.id);
    setActionError(null);
    try {
      const input = versionId ? { mode, versionId } : { mode };
      const assessment = await startStudentAssessment(quiz.id, input);
      navigate(attemptHref(assessment.session.id));
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setActionError(requestAssessmentMessage(error));
    } finally {
      setBusyQuizId(null);
    }
  }

  function handleAttemptChanged() {
    invalidateStudentRuntimeCache(profileId, ["attempts"]);
  }

  if (route.kind === "invalid") return <Navigate replace to="/app/practice" />;

  if (route.kind === "attempt") {
    return <AttemptPage
      sessionId={route.sessionId}
      online={online}
      onSessionExpired={onSessionExpired}
      onAttemptChanged={handleAttemptChanged}
    />;
  }

  if (route.kind === "library") {
    return <PracticeLibrary state={state} online={online} onRetry={() => void loadCatalog(true)} />;
  }

  if (hasBlockingCatalogState(state)) {
    return <CatalogState state={state} online={online} onRetry={() => void loadCatalog(true)} />;
  }

  const quiz = state.quizzes.find((candidate) => candidate.id === route.quizId) ?? null;
  if (!quiz) {
    return (
      <div className="practice-state practice-state--permission" role="status">
        <strong>هذا التدريب غير متاح لك</strong>
        <p>قد يكون وصولك تغيّر أو أن الرابط لم يعد صالحًا.</p>
        <Link className="secondary-button" to="/app/practice">العودة إلى التدريب</Link>
      </div>
    );
  }

  return <QuizDetail
    quiz={quiz}
    online={online}
    busy={busyQuizId === quiz.id}
    error={actionError}
    onStart={(mode, versionId) => void start(quiz, mode, versionId)}
  />;
}
