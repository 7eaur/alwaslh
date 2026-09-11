import { verifyOfflineLessonAuthorization } from "./offline-authorization";
import {
  getStudentOfflineLessonAsset,
  getStudentOfflineLessonManifest,
} from "./offline-download-api";
import {
  listOfflineLessonPackages,
  loadOfflineLessonPackage,
  OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES,
  OfflineContentError,
  offlineLessonPackageKey,
  projectedOfflineScopeUsageBytes,
  removeOfflineLessonPackage,
  saveOfflineLessonPackage,
  validateOfflineLessonManifest,
  type StoredOfflineLessonPackage,
} from "./offline-content-store";
import { getActiveOfflineScope } from "./offline-session";

export type OfflineMaterializationErrorCode =
  | "scope_unavailable"
  | "profile_mismatch"
  | "device_mismatch";

export class OfflineMaterializationError extends Error {
  constructor(readonly code: OfflineMaterializationErrorCode) {
    super(code);
    this.name = "OfflineMaterializationError";
  }
}

function activeScope(profileId: string): { profileId: string; deviceId: string } {
  const scope = getActiveOfflineScope(profileId);
  if (!scope) throw new OfflineMaterializationError("scope_unavailable");
  return scope;
}

export async function storedOfflineLessonForSession(
  profileId: string,
  lessonId: string,
): Promise<StoredOfflineLessonPackage | null> {
  const scope = getActiveOfflineScope(profileId);
  if (!scope) return null;
  return loadOfflineLessonPackage(profileId, scope.deviceId, lessonId);
}

export async function removeStoredOfflineLessonForSession(
  profileId: string,
  lessonId: string,
): Promise<void> {
  const scope = activeScope(profileId);
  await removeOfflineLessonPackage(profileId, scope.deviceId, lessonId);
}

export async function materializeStudentLessonForOffline(
  profileId: string,
  lessonId: string,
): Promise<StoredOfflineLessonPackage> {
  const scope = activeScope(profileId);
  const envelope = await getStudentOfflineLessonManifest(lessonId);
  const manifest = await verifyOfflineLessonAuthorization(envelope.authorization, envelope.manifest);
  validateOfflineLessonManifest(manifest);

  if (manifest.profileId !== profileId) {
    throw new OfflineMaterializationError("profile_mismatch");
  }
  if (manifest.deviceId !== scope.deviceId) {
    throw new OfflineMaterializationError("device_mismatch");
  }

  const packages = await listOfflineLessonPackages(profileId, scope.deviceId);
  const packageKey = offlineLessonPackageKey(profileId, scope.deviceId, manifest.lesson.id);
  const projectedUsage = projectedOfflineScopeUsageBytes(
    packages,
    packageKey,
    manifest.totalByteSize,
  );
  if (projectedUsage > OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES) {
    throw new OfflineContentError("scope_budget_exceeded");
  }

  const payloads = [];
  for (const asset of manifest.assets) {
    payloads.push({
      assetId: asset.id,
      blob: await getStudentOfflineLessonAsset(asset.downloadPath),
    });
  }

  return saveOfflineLessonPackage(manifest, payloads, envelope.authorization);
}
