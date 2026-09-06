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

export function createActivationIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

export function isMissingSessionError(error: unknown): boolean {
  return error instanceof ApiRequestError && (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN");
}
