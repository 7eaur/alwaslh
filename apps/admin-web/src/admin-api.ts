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

// Transitional compatibility for remaining root-facade consumers. Curriculum implementation is feature-owned.
export {
  createCurriculumClass,
  createCurriculumLesson,
  createCurriculumSection,
  createCurriculumSubject,
  createSubjectOffering,
  fetchAdminCurriculum,
  updateCurriculumClass,
  updateCurriculumLesson,
  updateCurriculumSection,
  updateCurriculumSubject,
  updateSubjectOffering,
} from "./features/curriculum/public";
export type {
  AdminCurriculumSnapshot,
  CurriculumClass,
  CurriculumLesson,
  CurriculumRecordStatus,
  CurriculumSection,
  CurriculumSubject,
  SubjectOffering,
} from "./features/curriculum/public";
