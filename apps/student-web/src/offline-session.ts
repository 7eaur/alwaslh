import { getStudentOfflineLease } from "./offline-api";
import {
  deleteOfflineScope,
  listOfflineLeases,
  saveOfflineLease,
  type StoredOfflineLease,
} from "./offline-store";

export type OfflineSessionSyncReason = "activation" | "login" | "device_rebind" | "restore";

export interface OfflineScope {
  profileId: string;
  deviceId: string;
}

const ACTIVE_SCOPE_SESSION_KEY = "alwaslh-student-offline:active-scope";
let activeOfflineScope: OfflineScope | null = null;

function sessionStorageOrNull(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function persistActiveOfflineScope(scope: OfflineScope | null): void {
  activeOfflineScope = scope;
  const storage = sessionStorageOrNull();
  if (!storage) return;

  if (scope) storage.setItem(ACTIVE_SCOPE_SESSION_KEY, JSON.stringify(scope));
  else storage.removeItem(ACTIVE_SCOPE_SESSION_KEY);
}

function readActiveOfflineScope(): OfflineScope | null {
  if (activeOfflineScope) return activeOfflineScope;
  const storage = sessionStorageOrNull();
  if (!storage) return null;

  const serialized = storage.getItem(ACTIVE_SCOPE_SESSION_KEY);
  if (!serialized) return null;
  try {
    const candidate = JSON.parse(serialized) as Partial<OfflineScope>;
    if (
      typeof candidate.profileId !== "string" ||
      candidate.profileId.length === 0 ||
      typeof candidate.deviceId !== "string" ||
      candidate.deviceId.length === 0
    ) {
      storage.removeItem(ACTIVE_SCOPE_SESSION_KEY);
      return null;
    }
    activeOfflineScope = { profileId: candidate.profileId, deviceId: candidate.deviceId };
    return activeOfflineScope;
  } catch {
    storage.removeItem(ACTIVE_SCOPE_SESSION_KEY);
    return null;
  }
}

export function getActiveOfflineScope(profileId: string): OfflineScope | null {
  const scope = readActiveOfflineScope();
  return scope?.profileId === profileId ? scope : null;
}

export async function refreshOfflineLeaseForCurrentSession(): Promise<StoredOfflineLease> {
  const lease = await getStudentOfflineLease();
  const record = await saveOfflineLease(lease);
  persistActiveOfflineScope({ profileId: lease.profileId, deviceId: lease.deviceId });
  return record;
}

export async function syncOfflineLeaseForSession(
  profileId: string,
  reason: OfflineSessionSyncReason,
): Promise<StoredOfflineLease> {
  const record = await refreshOfflineLeaseForCurrentSession();
  if (record.profileId !== profileId) throw new Error("offline_lease_profile_mismatch");

  if (reason === "device_rebind") {
    const records = await listOfflineLeases();
    for (const stored of records) {
      if (stored.profileId === record.profileId && stored.deviceId !== record.deviceId) {
        await deleteOfflineScope(stored.profileId, stored.deviceId);
      }
    }
  }

  return record;
}

export async function clearActiveOfflineLease(): Promise<void> {
  const scope = readActiveOfflineScope();
  if (!scope) return;
  await deleteOfflineScope(scope.profileId, scope.deviceId);
  persistActiveOfflineScope(null);
}
