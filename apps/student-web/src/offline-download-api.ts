import { ApiRequestError, type ApiErrorCode } from "./api-errors";

export interface StudentOfflineLessonAssetManifest {
  id: string;
  kind: "image" | "pdf_page" | "document" | "audio" | "video";
  position: number;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  checksumSha256: string;
  sourcePageNumber: number | null;
  text: string | null;
  downloadPath: string;
}

export interface StudentOfflineLessonManifest {
  version: 1;
  profileId: string;
  deviceId: string;
  issuedAt: string;
  leaseExpiresAt: string;
  authorizationExpiresAt: string;
  lesson: {
    id: string;
    classId: string;
    title: string;
    summary: string | null;
    contentRevision: number;
    publishedAt: string;
  };
  totalByteSize: number;
  assets: StudentOfflineLessonAssetManifest[];
}

interface OfflineLessonManifestResponse {
  manifest: StudentOfflineLessonManifest;
}

interface PublicErrorBody {
  error?: {
    code?: ApiErrorCode;
    message?: string;
  };
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

async function publicError(response: Response, fallback: string): Promise<ApiRequestError> {
  let payload: PublicErrorBody | undefined;
  try {
    const text = await response.text();
    payload = text ? (JSON.parse(text) as PublicErrorBody) : undefined;
  } catch {
    payload = undefined;
  }
  return new ApiRequestError(
    payload?.error?.code ?? "INTERNAL_ERROR",
    payload?.error?.message ?? fallback,
    response.status,
  );
}

export async function getStudentOfflineLessonManifest(
  lessonId: string,
): Promise<StudentOfflineLessonManifest> {
  let response: Response;
  try {
    response = await fetch(
      `${apiBaseUrl}/v1/student/offline/lessons/${encodeURIComponent(lessonId)}/manifest`,
      { credentials: "include" },
    );
  } catch {
    throw new ApiRequestError(
      "SERVICE_UNAVAILABLE",
      "تعذر تجهيز الدرس للاستخدام دون اتصال. تحقق من الشبكة وحاول مرة أخرى.",
      0,
    );
  }

  if (!response.ok) {
    throw await publicError(response, "تعذر تجهيز الدرس للاستخدام دون اتصال");
  }

  return (await response.json() as OfflineLessonManifestResponse).manifest;
}

export async function getStudentOfflineLessonAsset(downloadPath: string): Promise<Blob> {
  if (
    !downloadPath.startsWith("/v1/student/offline/lessons/") ||
    downloadPath.includes("://")
  ) {
    throw new Error("invalid_offline_download_path");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${downloadPath}`, { credentials: "include" });
  } catch {
    throw new ApiRequestError(
      "SERVICE_UNAVAILABLE",
      "انقطع الاتصال أثناء تنزيل الدرس. لم يتم حفظ نسخة غير مكتملة.",
      0,
    );
  }

  if (!response.ok) {
    throw await publicError(response, "تعذر تنزيل ملف الدرس");
  }

  return response.blob();
}
