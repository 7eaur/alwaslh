export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export type StudentChallengePurpose =
  | "login"
  | "password_change"
  | "device_rebind"
  | "password_change_rebind";

export interface SessionProfile {
  id: string;
  role: "student" | "admin";
  displayName: string | null;
}

export interface EntitlementView {
  id: string;
  scope: "all_content" | "class";
  classId: string | null;
  status: "active" | "expired" | "revoked";
  startsAt: string;
  expiresAt: string | null;
}

export interface StudentCurriculumLesson {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  position: number;
  contentRevision: number;
  publishedAt: string;
}

export interface StudentCurriculumSection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
  lessons: StudentCurriculumLesson[];
}

export interface StudentCurriculumSubject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  unsectionedLessons: StudentCurriculumLesson[];
  sections: StudentCurriculumSection[];
}

export interface StudentCurriculumClass {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  subjects: StudentCurriculumSubject[];
}

export interface StudentCurriculumCatalog {
  classes: StudentCurriculumClass[];
}

export interface StudentReaderAsset {
  id: string;
  kind: "image" | "pdf_page" | "document" | "audio" | "video";
  position: number;
  mimeType: string;
  byteSize: number | null;
  width: number | null;
  height: number | null;
  checksumSha256: string | null;
  sourcePageNumber: number | null;
  text: string | null;
}

export interface StudentLessonReader {
  lesson: {
    id: string;
    title: string;
    summary: string | null;
    contentRevision: number;
    publishedAt: string;
  };
  assets: StudentReaderAsset[];
}

export type StudentAssessmentMode = "practice" | "test";

export interface StudentAssessmentCatalogItem {
  id: string;
  title: string;
  description: string | null;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  shuffleVersions: boolean;
  versions: Array<{ id: string; versionNumber: number; label: string }>;
}

export interface StudentAssessmentQuestion {
  id: string;
  position: number;
  lessonId: string | null;
  type: "multiple_choice" | "true_false" | "direct";
  prompt: string;
  options: Array<{ id: string; label: string; position: number }>;
  sourcePage: number | null;
  questionBankItemId: string | null;
  questionBankRevisionId: string | null;
  answer: null | { selectedOptionId: string | null; directAnswerText: string | null };
  feedback: null | {
    correct: boolean;
    correctOptionId: string | null;
    correctAnswerText: string | null;
    explanation: string | null;
    method: string | null;
  };
}

export interface StudentAssessmentAttempt {
  id: string;
  sessionId: string;
  quizId: string;
  quizTitle: string;
  versionId: string;
  versionLabel: string;
  mode: StudentAssessmentMode;
  correctCount: number;
  questionCount: number;
  scorePercent: number;
  completedAt: string;
}

export interface StudentAssessmentSession {
  session: {
    id: string;
    mode: StudentAssessmentMode;
    status: "in_progress" | "completed" | "abandoned";
    currentQuestionId: string | null;
    startedAt: string;
    completedAt: string | null;
  };
  quiz: {
    id: string;
    title: string;
    description: string | null;
    classId: string;
    subjectId: string;
  };
  version: {
    id: string;
    versionNumber: number;
    label: string;
  };
  progress: {
    questionCount: number;
    answeredCount: number;
  };
  questions: StudentAssessmentQuestion[];
  attempt: StudentAssessmentAttempt | null;
}

export interface ActivationVerificationResponse {
  activationTicket: string;
  accountIdentifier: string;
  expiresInSeconds: number;
}

export interface ActivationResponse {
  profile: SessionProfile;
  entitlement: EntitlementView;
  accountIdentifier: string;
  deviceId: string;
  replayed: boolean;
}

export interface StudentLoginChallenge {
  challengeToken: string;
  purpose: StudentChallengePurpose;
  requiresDeviceRegistration: boolean;
  mustChangePassword: boolean;
  expiresInSeconds: number;
}

export interface StudentLoginResponse {
  profile: SessionProfile;
  deviceId: string;
}

interface PublicErrorBody {
  error?: {
    code?: ApiErrorCode;
    message?: string;
  };
}

interface ProfileResponse {
  profile: SessionProfile;
}

interface EntitlementsResponse {
  entitlements: EntitlementView[];
}

interface AccessRedemptionResponse {
  entitlement: EntitlementView;
}

interface CurriculumResponse {
  curriculum: StudentCurriculumCatalog;
}

interface ReaderResponse {
  reader: StudentLessonReader;
}

interface AssessmentCatalogResponse {
  quizzes: StudentAssessmentCatalogItem[];
}

interface AssessmentResponse {
  assessment: StudentAssessmentSession;
}

interface AttemptsResponse {
  attempts: StudentAssessmentAttempt[];
}

export class ApiRequestError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch {
    throw new ApiRequestError(
      "SERVICE_UNAVAILABLE",
      "تعذر الاتصال بالخدمة. تحقق من اتصالك ثم حاول مرة أخرى.",
      0,
    );
  }

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    const publicError = payload as PublicErrorBody | undefined;
    const code = publicError?.error?.code ?? "INTERNAL_ERROR";
    const message = publicError?.error?.message ?? "تعذر إكمال الطلب";
    throw new ApiRequestError(code, message, response.status);
  }

  return payload as T;
}

export async function verifyActivation(code: string): Promise<ActivationVerificationResponse> {
  return request<ActivationVerificationResponse>("/v1/student/activation/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function completeActivation(input: {
  activationTicket: string;
  password: string;
  idempotencyKey: string;
  devicePublicKeySpki: string;
  deviceProof: string;
}): Promise<ActivationResponse> {
  return request<ActivationResponse>("/v1/student/activation/complete", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function restoreStudentSession(): Promise<SessionProfile> {
  const result = await request<ProfileResponse>("/v1/student/me");
  return result.profile;
}

export async function startStudentLogin(
  identifier: string,
  password: string,
): Promise<StudentLoginChallenge> {
  return request<StudentLoginChallenge>("/v1/student/login/start", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function completeStudentLogin(input: {
  challengeToken: string;
  signature: string;
  publicKeySpki?: string;
  newPassword?: string;
}): Promise<StudentLoginResponse> {
  return request<StudentLoginResponse>("/v1/student/login/complete", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutStudent(): Promise<void> {
  await request<void>("/v1/auth/logout", { method: "POST" });
}

export async function listStudentEntitlements(): Promise<EntitlementView[]> {
  const result = await request<EntitlementsResponse>("/v1/student/access/entitlements");
  return result.entitlements;
}

export async function redeemStudentAccess(code: string, idempotencyKey: string): Promise<EntitlementView> {
  const result = await request<AccessRedemptionResponse>("/v1/student/access/redeem", {
    method: "POST",
    body: JSON.stringify({ code, idempotencyKey }),
  });
  return result.entitlement;
}

export async function listStudentCurriculum(): Promise<StudentCurriculumCatalog> {
  const result = await request<CurriculumResponse>("/v1/student/curriculum");
  return result.curriculum;
}

export async function getStudentLessonReader(lessonId: string): Promise<StudentLessonReader> {
  const result = await request<ReaderResponse>(`/v1/student/lessons/${encodeURIComponent(lessonId)}/reader`);
  return result.reader;
}

export function studentAssetContentUrl(assetId: string): string {
  return `${apiBaseUrl}/v1/student/lesson-assets/${encodeURIComponent(assetId)}/content`;
}

export async function listStudentQuizzes(): Promise<StudentAssessmentCatalogItem[]> {
  const result = await request<AssessmentCatalogResponse>("/v1/student/quizzes");
  return result.quizzes;
}

export async function startStudentAssessment(
  quizId: string,
  input: { mode: StudentAssessmentMode; versionId?: string; restart?: boolean },
): Promise<StudentAssessmentSession> {
  const result = await request<AssessmentResponse>(`/v1/student/quizzes/${encodeURIComponent(quizId)}/sessions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return result.assessment;
}

export async function getStudentAssessmentSession(sessionId: string): Promise<StudentAssessmentSession> {
  const result = await request<AssessmentResponse>(
    `/v1/student/assessment-sessions/${encodeURIComponent(sessionId)}`,
  );
  return result.assessment;
}

export async function answerStudentAssessmentQuestion(
  sessionId: string,
  questionId: string,
  input: { selectedOptionId?: string | null; directAnswerText?: string | null },
): Promise<StudentAssessmentSession> {
  const result = await request<AssessmentResponse>(
    `/v1/student/assessment-sessions/${encodeURIComponent(sessionId)}/questions/${encodeURIComponent(questionId)}/answer`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
  return result.assessment;
}

export async function finalizeStudentAssessment(sessionId: string): Promise<StudentAssessmentSession> {
  const result = await request<AssessmentResponse>(
    `/v1/student/assessment-sessions/${encodeURIComponent(sessionId)}/finalize`,
    { method: "POST" },
  );
  return result.assessment;
}

export async function abandonStudentAssessment(sessionId: string): Promise<void> {
  await request<void>(`/v1/student/assessment-sessions/${encodeURIComponent(sessionId)}/abandon`, {
    method: "POST",
  });
}

export async function listStudentAttempts(limit = 10): Promise<StudentAssessmentAttempt[]> {
  const result = await request<AttemptsResponse>(`/v1/student/attempts?limit=${encodeURIComponent(String(limit))}`);
  return result.attempts;
}

export function normalizeAccessCode(value: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabic = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(arabicIndic.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(easternArabic.indexOf(digit)))
    .replace(/[\s-]+/g, "")
    .replace(/[^0-9]/g, "");
}

export function isSixDigitAccessCode(value: string): boolean {
  return /^\d{6}$/.test(normalizeAccessCode(value));
}

export function isSevenDigitClassCode(value: string): boolean {
  return /^\d{7}$/.test(normalizeAccessCode(value));
}

export function createActivationIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

export function createAccessRedemptionIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

export function isMissingSessionError(error: unknown): boolean {
  return error instanceof ApiRequestError && (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN");
}
