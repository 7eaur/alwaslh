export const FULL_ACCESS_CODE_LENGTH = 6 as const;
export const CLASS_ACCESS_CODE_LENGTH = 7 as const;

export type EntitlementScope =
  | { type: "all_content" }
  | { type: "class"; classId: string };

export type EntitlementSource = "full_access_code" | "class_code" | "admin_grant" | "migration";
export type EntitlementStatus = "active" | "expired" | "revoked" | "pending";

export interface StudentEntitlement {
  id: string;
  profileId: string;
  scope: EntitlementScope;
  source: EntitlementSource;
  status: EntitlementStatus;
  startsAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccessCodeClaimResult {
  entitlement: StudentEntitlement;
  redemptionId: string;
  claimedAt: string;
  idempotentReplay: boolean;
}

export function isEntitlementActive(
  entitlement: StudentEntitlement,
  now = new Date(),
): boolean {
  if (entitlement.status !== "active" || entitlement.revokedAt) return false;

  const startsAt = Date.parse(entitlement.startsAt);
  const expiresAt = entitlement.expiresAt ? Date.parse(entitlement.expiresAt) : null;
  const timestamp = now.getTime();

  return startsAt <= timestamp && (expiresAt === null || timestamp < expiresAt);
}

export function grantsClassAccess(entitlement: StudentEntitlement, classId: string): boolean {
  if (!isEntitlementActive(entitlement)) return false;
  return entitlement.scope.type === "all_content"
    || (entitlement.scope.type === "class" && entitlement.scope.classId === classId);
}
