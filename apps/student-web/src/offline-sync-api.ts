import { ApiRequestError, type ApiErrorCode } from "./api-errors";

export type StudentOfflineDeltaEntityType = "lesson" | "lesson_asset";
export type StudentOfflineDeltaChangeType = "upsert" | "delete";

export interface StudentOfflineDeltaEntry {
  revision: string;
  entityType: StudentOfflineDeltaEntityType;
  entityId: string;
  changeType: StudentOfflineDeltaChangeType;
  classId: string | null;
  lessonId: string;
  contentRevision: number | null;
}

export interface StudentOfflineDeltaPage {
  version: 1;
  after: string;
  nextCursor: string;
  latestCursor: string;
  hasMore: boolean;
  entries: StudentOfflineDeltaEntry[];
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

export async function getStudentOfflineDelta(
  after: string,
  limit = 50,
): Promise<StudentOfflineDeltaPage> {
  const query = new URLSearchParams({ after, limit: String(limit) });
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/v1/student/offline/sync?${query.toString()}`, {
      credentials: "include",
    });
  } catch {
    throw new ApiRequestError(
      "SERVICE_UNAVAILABLE",
      "تعذر تحديث المحتوى المحفوظ الآن.",
      0,
    );
  }

  if (!response.ok) {
    throw await publicError(response, "تعذر تحديث المحتوى المحفوظ الآن");
  }

  const payload = (await response.json()) as { delta: StudentOfflineDeltaPage };
  return payload.delta;
}
