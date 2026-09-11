import { getStudentOfflineLease } from "./offline-api";
import {
  deleteOfflineScope,
  listOfflineLeases,
  saveOfflineLease,
  type StoredOfflineLease,
} from "./offline-store";

export type OfflineSessionSyncReason = "activation" | "login" | "device_rebind" | "restore";

interface OfflineScope {
  profileId: string;
  deviceId: string;
}

let activeOfflineScope: OfflineScope | null = null;

export async function syncOfflineLeaseForSession(
  profileId: string,
  reason: OfflineSessionSyncReason,
): Promise<StoredOfflineLease> {
  const lease = await getStudentOfflineLease();
  if (lease.profileId !== profileId) throw new Error("offline_lease_profile_mismatch");

  const record = await saveOfflineLease(lease);
  activeOfflineScope = { profileId: lease.profileId, deviceId: lease.deviceId };

  if (reason === "device_rebind") {
    const records = await listOfflineLeases();
    for (const stored of records) {
      if (stored.profileId === lease.profileId && stored.deviceId !== lease.deviceId) {
        await deleteOfflineScope(stored.profileId, stored.deviceId);
      }
    }
  }

  return record;
}

export async function clearActiveOfflineLease(): Promise<void> {
  const scope = activeOfflineScope;
  activeOfflineScope = null;
  if (!scope) return;
  await deleteOfflineScope(scope.profileId, scope.deviceId);
}
