export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

interface PublicErrorBody {
  error?: {
    code?: ApiErrorCode;
    message?: string;
  };
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

async function requestResponse(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    return await fetch(`${apiBaseUrl}${path}`, {
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
}

function toRequestError(payload: unknown, status: number): ApiRequestError {
  const publicError = payload as PublicErrorBody | undefined;
  return new ApiRequestError(
    publicError?.error?.code ?? "INTERNAL_ERROR",
    publicError?.error?.message ?? "تعذر إكمال الطلب",
    status,
  );
}

export async function adminApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await requestResponse(path, init);
  const payload = await parseResponseBody(response);
  if (!response.ok) throw toRequestError(payload, response.status);
  return payload as T;
}

export async function adminApiBlobRequest(path: string, init: RequestInit = {}): Promise<Blob> {
  const response = await requestResponse(path, init);
  if (!response.ok) {
    const payload = await parseResponseBody(response);
    throw toRequestError(payload, response.status);
  }
  return response.blob();
}

export function isMissingSessionError(error: unknown): boolean {
  return error instanceof ApiRequestError && (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN");
}
