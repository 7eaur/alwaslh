export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export type CurriculumRecordStatus = "active" | "inactive" | "archived";

export interface AdminProfile {
  id: string;
  role: "admin";
  displayName: string | null;
}

export interface CurriculumClass {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  status: CurriculumRecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumSubject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: CurriculumRecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectOffering {
  classId: string;
  subjectId: string;
  position: number;
  status: CurriculumRecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumSection {
  id: string;
  classId: string;
  subjectId: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
  status: CurriculumRecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumLesson {
  id: string;
  classId: string;
  subjectId: string;
  sectionId: string | null;
  slug: string;
  title: string;
  summary: string | null;
  position: number;
  status: CurriculumRecordStatus;
  contentRevision: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCurriculumSnapshot {
  classes: CurriculumClass[];
  subjects: CurriculumSubject[];
  offerings: SubjectOffering[];
  sections: CurriculumSection[];
  lessons: CurriculumLesson[];
}

interface PublicErrorBody {
  error?: {
    code?: ApiErrorCode;
    message?: string;
  };
}

interface ProfileResponse {
  profile: AdminProfile;
}

interface CurriculumResponse {
  curriculum: AdminCurriculumSnapshot;
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
      "تعذر الاتصال بخدمة الإدارة. تحقق من الاتصال ثم حاول مرة أخرى.",
      0,
    );
  }

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    const publicError = payload as PublicErrorBody | undefined;
    throw new ApiRequestError(
      publicError?.error?.code ?? "INTERNAL_ERROR",
      publicError?.error?.message ?? "تعذر إكمال الطلب",
      response.status,
    );
  }

  return payload as T;
}

export function adminApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init);
}

export function isMissingSessionError(error: unknown): boolean {
  return error instanceof ApiRequestError && (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN");
}

export function loginAdmin(identifier: string, password: string): Promise<AdminProfile> {
  return request<ProfileResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  }).then((result) => result.profile);
}

export function restoreAdminSession(): Promise<AdminProfile> {
  return request<ProfileResponse>("/v1/admin/me").then((result) => result.profile);
}

export async function logoutAdmin(): Promise<void> {
  await request<void>("/v1/auth/logout", { method: "POST" });
}

export function fetchAdminCurriculum(): Promise<AdminCurriculumSnapshot> {
  return request<CurriculumResponse>("/v1/admin/curriculum").then((result) => result.curriculum);
}

export async function createCurriculumClass(input: {
  slug: string;
  name: string;
  position?: number;
}): Promise<void> {
  await request("/v1/admin/curriculum/classes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCurriculumClass(
  classId: string,
  input: { status?: CurriculumRecordStatus; name?: string; position?: number },
): Promise<void> {
  await request(`/v1/admin/curriculum/classes/${classId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createCurriculumSubject(input: { slug: string; name: string }): Promise<void> {
  await request("/v1/admin/curriculum/subjects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCurriculumSubject(
  subjectId: string,
  input: { status?: CurriculumRecordStatus; name?: string },
): Promise<void> {
  await request(`/v1/admin/curriculum/subjects/${subjectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createSubjectOffering(input: {
  classId: string;
  subjectId: string;
  position?: number;
}): Promise<void> {
  await request("/v1/admin/curriculum/offerings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSubjectOffering(
  classId: string,
  subjectId: string,
  input: { status?: CurriculumRecordStatus; position?: number },
): Promise<void> {
  await request(`/v1/admin/curriculum/offerings/${classId}/${subjectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createCurriculumSection(input: {
  classId: string;
  subjectId: string;
  slug: string;
  title: string;
  position?: number;
}): Promise<void> {
  await request("/v1/admin/curriculum/sections", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCurriculumSection(
  sectionId: string,
  input: { status?: CurriculumRecordStatus; title?: string; position?: number },
): Promise<void> {
  await request(`/v1/admin/curriculum/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createCurriculumLesson(input: {
  classId: string;
  subjectId: string;
  sectionId?: string | null;
  slug: string;
  title: string;
  position?: number;
}): Promise<void> {
  await request("/v1/admin/curriculum/lessons", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCurriculumLesson(
  lessonId: string,
  input: {
    sectionId?: string | null;
    status?: CurriculumRecordStatus;
    title?: string;
    position?: number;
  },
): Promise<void> {
  await request(`/v1/admin/curriculum/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
