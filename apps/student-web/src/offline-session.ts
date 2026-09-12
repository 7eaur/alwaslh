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
let scopeGeneration = 0;
let persistence: Promise<unknown> = Promise.resolve();

function persistInOrder<T>(operation: () => Promise<T>): Promise<T> {
  const result = persistence.then(operation, operation);
  persistence = result.catch(() => undefined);
  return result;
}

function sessionStorageOrNull(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function persistActiveOfflineScope(scope: OfflineScope | null): void {
  const storage = sessionStorageOrNull();
  if (!storage) throw new Error("offline_scope_storage_unavailable");
  if (scope) storage.setItem(ACTIVE_SCOPE_SESSION_KEY, JSON.stringify(scope));
  else storage.removeItem(ACTIVE_SCOPE_SESSION_KEY);
  // Remove the old tab-only selector; it must never resurrect a logged-out scope.
  try { window.sessionStorage.removeItem(ACTIVE_SCOPE_SESSION_KEY); } catch { /* optional legacy cleanup */ }
}

function readActiveOfflineScope(): OfflineScope | null {
  const storage = sessionStorageOrNull();
  if (!storage) return null;
  try {
    const serialized = storage.getItem(ACTIVE_SCOPE_SESSION_KEY);
    if (!serialized) return null;
    const candidate = JSON.parse(serialized) as Partial<OfflineScope> | null;
    if (
      !candidate ||
      Object.keys(candidate).length !== 2 ||
      typeof candidate.profileId !== "string" ||
      candidate.profileId.length === 0 ||
      candidate.profileId.length > 128 ||
      candidate.profileId.includes(":") ||
      typeof candidate.deviceId !== "string" ||
      candidate.deviceId.length === 0 ||
      candidate.deviceId.length > 128 ||
      candidate.deviceId.includes(":")
    ) {
      storage.removeItem(ACTIVE_SCOPE_SESSION_KEY);
      return null;
    }
    return { profileId: candidate.profileId, deviceId: candidate.deviceId };
  } catch {
    try { storage.removeItem(ACTIVE_SCOPE_SESSION_KEY); } catch { /* storage denied: fail closed */ }
    return null;
  }
}

export function getActiveOfflineScope(profileId?: string): OfflineScope | null {
  const scope = readActiveOfflineScope();
  return profileId === undefined || scope?.profileId === profileId ? scope : null;
}

export async function refreshOfflineLeaseForCurrentSession(expectedProfileId?: string): Promise<StoredOfflineLease> {
  const generation = ++scopeGeneration;
  const lease = await getStudentOfflineLease();
  if (expectedProfileId !== undefined && lease.profileId !== expectedProfileId) {
    throw new Error("offline_lease_profile_mismatch");
  }
  return persistInOrder(async () => {
    if (generation !== scopeGeneration) throw new Error("offline_session_changed");
    const record = await saveOfflineLease(lease);
    if (generation !== scopeGeneration) {
      await deleteOfflineScope(lease.profileId, lease.deviceId);
      throw new Error("offline_session_changed");
    }
    persistActiveOfflineScope({ profileId: lease.profileId, deviceId: lease.deviceId });
    return record;
  });
}

export async function syncOfflineLeaseForSession(
  profileId: string,
  reason: OfflineSessionSyncReason,
): Promise<StoredOfflineLease> {
  const record = await refreshOfflineLeaseForCurrentSession(profileId);

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
  ++scopeGeneration;
  const scope = readActiveOfflineScope();
  persistActiveOfflineScope(null);
  if (!scope) return;
  await persistInOrder(() => deleteOfflineScope(scope.profileId, scope.deviceId));
}
