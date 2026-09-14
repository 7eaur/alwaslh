import { adminApiRequest as request } from "./shared/api/client";

export {
  adminApiBlobRequest,
  adminApiRequest,
  ApiRequestError,
  isMissingSessionError,
} from "./shared/api/client";
export type { ApiErrorCode } from "./shared/api/client";
export {
  loginAdmin,
  logoutAdmin,
  restoreAdminSession,
} from "./features/auth/public";
export type { AdminProfile } from "./features/auth/public";

export type CurriculumRecordStatus = "active" | "inactive" | "archived";

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

interface CurriculumResponse {
  curriculum: AdminCurriculumSnapshot;
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
