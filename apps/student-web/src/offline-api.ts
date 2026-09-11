import { ApiRequestError, type ApiErrorCode } from "./api-errors";

export interface StudentOfflineLeaseGrant {
  entitlementId: string;
  scope: "all_content" | "class";
  classId: string | null;
  expiresAt: string;
}

export interface StudentOfflineLease {
  version: 1;
  profileId: string;
  deviceId: string;
  issuedAt: string;
  expiresAt: string;
  grants: StudentOfflineLeaseGrant[];
}

interface OfflineLeaseResponse {
  lease: StudentOfflineLease;
}

interface PublicErrorBody {
  error?: {
    code?: ApiErrorCode;
    message?: string;
  };
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export async function getStudentOfflineLease(): Promise<StudentOfflineLease> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/v1/student/offline/lease`, { credentials: "include" });
  } catch {
    throw new ApiRequestError(
      "SERVICE_UNAVAILABLE",
      "تعذر تحديث صلاحية الاستخدام دون اتصال. تحقق من الشبكة وحاول مرة أخرى.",
      0,
    );
  }

  const text = await response.text();
  let payload: OfflineLeaseResponse | PublicErrorBody | undefined;
  if (text) {
    try {
      payload = JSON.parse(text) as OfflineLeaseResponse | PublicErrorBody;
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    const publicError = payload as PublicErrorBody | undefined;
    throw new ApiRequestError(
      publicError?.error?.code ?? "INTERNAL_ERROR",
      publicError?.error?.message ?? "تعذر تحديث صلاحية الاستخدام دون اتصال",
      response.status,
    );
  }

  return (payload as OfflineLeaseResponse).lease;
}
