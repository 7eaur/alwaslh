import { adminApiRequest } from "./admin-api";

export type AdminAccessCodeType = "full_access" | "class_access";
export type AdminAccessCodeStatus = "active" | "redeemed" | "expired" | "revoked";
export type AdminAccessCodeSort =
  | "created_at"
  | "code"
  | "status"
  | "valid_from"
  | "expires_at"
  | "redeemed_at";
export type AdminStudentStatus = "active" | "inactive" | "archived";
export type AdminStudentSort = "created_at" | "identifier" | "status" | "last_login";
export type SortDirection = "asc" | "desc";

export interface AdminAccessCode {
  id: string;
  type: AdminAccessCodeType;
  code: string;
  status: AdminAccessCodeStatus;
  classId: string | null;
  className: string | null;
  validFrom: string;
  expiresAt: string | null;
  entitlementDurationDays: number;
  redeemedAt: string | null;
  redeemedByProfileId: string | null;
  redeemedByIdentifier: string | null;
  redeemedByDisplayName: string | null;
  entitlementExpiresAt: string | null;
  createdAt: string;
}

export interface AdminStudentAccount {
  id: string;
  identifier: string;
  displayName: string | null;
  status: AdminStudentStatus;
  createdAt: string;
  lastLoginAt: string | null;
  activeEntitlementCount: number;
  activeClassCount: number;
  hasAllContent: boolean;
  hasActiveDevice: boolean;
  recoveryRequired: boolean;
  deviceRebindAllowed: boolean;
}

export interface AdminStudentEntitlement {
  id: string;
  scope: "all_content" | "class";
  classId: string | null;
  className: string | null;
  source: "full_code" | "class_code" | "admin";
  sourceId: string | null;
  status: "active" | "expired" | "revoked";
  startsAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface AdminStudentDevice {
  id: string;
  label: string | null;
  registeredAt: string;
  revokedAt: string | null;
  active: boolean;
}

export interface AdminStudentRedemption {
  id: string;
  codeType: AdminAccessCodeType;
  code: string | null;
  entitlementId: string;
  redeemedAt: string;
}

export interface AdminStudentActivity {
  id: string;
  source: "auth" | "access";
  eventType: string;
  actorProfileId: string | null;
  actorDisplayName: string | null;
  createdAt: string;
}

export interface AdminStudentDetail extends AdminStudentAccount {
  activeSessionCount: number;
  entitlements: AdminStudentEntitlement[];
  devices: AdminStudentDevice[];
  redemptions: AdminStudentRedemption[];
  redemptionTotal: number;
  activity: AdminStudentActivity[];
  activityTotal: number;
}

export interface PageMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface AccessCodeListResponse {
  codes: AdminAccessCode[];
  page: PageMeta;
}

export interface StudentListResponse {
  students: AdminStudentAccount[];
  page: PageMeta;
}

export interface StudentDetailResponse {
  student: AdminStudentDetail;
}

export interface RevokeCodesResult {
  revokedIds: string[];
  blockedIds: string[];
  alreadyRevokedIds: string[];
  missingIds: string[];
}

export interface GeneratedCodesResult {
  codes: string[];
  durationDays: number;
  classId?: string;
}

export interface TemporaryPasswordResult {
  temporaryPassword: string;
  expiresInHours: number;
}

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export function fetchAdminAccessCodes(input: {
  type: AdminAccessCodeType;
  status?: AdminAccessCodeStatus;
  search?: string;
  classId?: string;
  sort?: AdminAccessCodeSort;
  direction?: SortDirection;
  limit?: number;
  offset?: number;
}): Promise<AccessCodeListResponse> {
  return adminApiRequest<AccessCodeListResponse>(
    `/v1/admin/access/codes${queryString({
      type: input.type,
      status: input.status,
      search: input.search?.trim(),
      classId: input.classId,
      sort: input.sort,
      direction: input.direction,
      limit: input.limit,
      offset: input.offset,
    })}`,
  );
}

export function revokeUnusedAccessCodes(
  type: AdminAccessCodeType,
  codeIds: string[],
): Promise<RevokeCodesResult> {
  return adminApiRequest<RevokeCodesResult>("/v1/admin/access/codes/revoke", {
    method: "POST",
    body: JSON.stringify({ type, codeIds }),
  });
}

export function generateFullAccessCodes(count: number, durationDays: number): Promise<GeneratedCodesResult> {
  return adminApiRequest<GeneratedCodesResult>("/v1/admin/access/full-codes", {
    method: "POST",
    body: JSON.stringify({ count, durationDays }),
  });
}

export function generateClassAccessCodes(
  classId: string,
  count: number,
  durationDays: number,
): Promise<GeneratedCodesResult> {
  return adminApiRequest<GeneratedCodesResult>("/v1/admin/access/class-codes", {
    method: "POST",
    body: JSON.stringify({ classId, count, durationDays }),
  });
}

export function fetchAdminStudents(input: {
  search?: string;
  status?: AdminStudentStatus;
  sort?: AdminStudentSort;
  direction?: SortDirection;
  limit?: number;
  offset?: number;
} = {}): Promise<StudentListResponse> {
  return adminApiRequest<StudentListResponse>(
    `/v1/admin/students${queryString({
      search: input.search?.trim(),
      status: input.status,
      sort: input.sort,
      direction: input.direction,
      limit: input.limit,
      offset: input.offset,
    })}`,
  );
}

export function fetchAdminStudentDetail(
  profileId: string,
  historyLimit = 25,
  historyOffset = 0,
): Promise<AdminStudentDetail> {
  return adminApiRequest<StudentDetailResponse>(
    `/v1/admin/students/${profileId}${queryString({ historyLimit, historyOffset })}`,
  ).then((result) => result.student);
}

export function issueStudentTemporaryPassword(profileId: string): Promise<TemporaryPasswordResult> {
  return adminApiRequest<TemporaryPasswordResult>("/v1/admin/auth/temporary-password", {
    method: "POST",
    body: JSON.stringify({ profileId }),
  });
}

export async function allowStudentDeviceRebind(profileId: string): Promise<void> {
  await adminApiRequest("/v1/admin/auth/device-rebind", {
    method: "POST",
    body: JSON.stringify({ profileId }),
  });
}

export async function revokeStudentEntitlement(entitlementId: string): Promise<void> {
  await adminApiRequest(`/v1/admin/access/entitlements/${entitlementId}/revoke`, {
    method: "POST",
  });
}
