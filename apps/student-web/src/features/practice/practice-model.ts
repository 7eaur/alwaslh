import type {
  StudentAssessmentAttempt,
  StudentAssessmentMode,
  StudentAssessmentCatalogItem,
} from "../../auth-api";
import { studentErrorMessage } from "../../student-error-copy";

export type AssessmentCatalogState =
  | { status: "loading"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "ready"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "offline"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[] }
  | { status: "error"; quizzes: StudentAssessmentCatalogItem[]; attempts: StudentAssessmentAttempt[]; message: string };

export type PracticeRoute =
  | { kind: "library" }
  | { kind: "quiz"; quizId: string }
  | { kind: "attempt"; sessionId: string }
  | { kind: "invalid" };

const ARABIC_OPTION_MARKERS = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي"] as const;

function decodeRouteId(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function practiceRoute(pathname: string): PracticeRoute {
  if (pathname === "/app/practice" || pathname === "/app/practice/") return { kind: "library" };

  const quizMatch = pathname.match(/^\/app\/practice\/quizzes\/([^/]+)\/?$/);
  if (quizMatch) {
    const quizId = decodeRouteId(quizMatch[1]);
    return quizId ? { kind: "quiz", quizId } : { kind: "invalid" };
  }

  const attemptMatch = pathname.match(/^\/app\/practice\/attempts\/([^/]+)\/?$/);
  if (attemptMatch) {
    const sessionId = decodeRouteId(attemptMatch[1]);
    return sessionId ? { kind: "attempt", sessionId } : { kind: "invalid" };
  }

  return { kind: "invalid" };
}

export function quizHref(quizId: string): string {
  return `/app/practice/quizzes/${encodeURIComponent(quizId)}`;
}

export function attemptHref(sessionId: string): string {
  return `/app/practice/attempts/${encodeURIComponent(sessionId)}`;
}

export function modeLabel(mode: StudentAssessmentMode): string {
  return mode === "practice" ? "تدريب" : "اختبار";
}

export function optionMarker(index: number): string {
  return ARABIC_OPTION_MARKERS[index] ?? String(index + 1);
}

export function scoreLabel(value: number): string {
  return `${new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 2 }).format(value)}٪`;
}

export function attemptDate(value: string): string {
  return new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function requestAssessmentMessage(error: unknown): string {
  return studentErrorMessage(error, "assessment");
}

export function hasBlockingCatalogState(state: AssessmentCatalogState): boolean {
  return state.quizzes.length === 0 && state.status !== "ready";
}
