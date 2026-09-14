import { ApiRequestError } from "./api-errors";
import { verifyOfflineLessonAuthorization } from "./offline-authorization";
import {
  listOfflineLessonPackages,
  removeOfflineLessonPackage,
  saveOfflineLessonPackage,
  validateOfflineLessonManifest,
  type StoredOfflineLessonPackage,
} from "./offline-content-store";
import {
  getStudentOfflineLessonManifest,
  type StudentOfflineLessonManifestEnvelope,
} from "./offline-download-api";
import { refreshOfflineLeaseForCurrentSession } from "./offline-session";

export interface OfflineReconnectRevalidationResult {
  checked: number;
  refreshed: number;
  purged: number;
}

interface RevalidationDependencies {
  fetchManifest: (lessonId: string) => Promise<StudentOfflineLessonManifestEnvelope>;
  verifyEnvelope: typeof verifyOfflineLessonAuthorization;
  savePackage: typeof saveOfflineLessonPackage;
  removePackage: typeof removeOfflineLessonPackage;
}

const productionDependencies: RevalidationDependencies = {
  fetchManifest: getStudentOfflineLessonManifest,
  verifyEnvelope: verifyOfflineLessonAuthorization,
  savePackage: saveOfflineLessonPackage,
  removePackage: removeOfflineLessonPackage,
};

function packagePayloads(record: StoredOfflineLessonPackage) {
  return record.assets.map((asset) => ({ assetId: asset.id, blob: asset.blob }));
}

function scopeMatches(
  record: StoredOfflineLessonPackage,
  profileId: string,
  deviceId: string,
): boolean {
  return record.profileId === profileId && record.deviceId === deviceId;
}

/**
 * Revalidates every locally stored lesson against current online authority.
 *
 * Security policy for STUDENT-016R:
 * - a current signed manifest is the reconnect authority;
 * - packages that cannot be re-authorized are removed fail-closed;
 * - an UNAUTHORIZED response is propagated so normal session-expiry handling owns cleanup;
 * - valid packages are rewritten only after signature + manifest + blob integrity verification,
 *   refreshing their bounded authorization without downloading duplicate asset bytes.
 */
export async function revalidateStoredOfflinePackages(
  profileId: string,
  deviceId: string,
  packages: StoredOfflineLessonPackage[],
  dependencies: RevalidationDependencies = productionDependencies,
): Promise<OfflineReconnectRevalidationResult> {
  let refreshed = 0;
  let purged = 0;

  for (const record of packages) {
    if (!scopeMatches(record, profileId, deviceId)) {
      await dependencies.removePackage(record.profileId, record.deviceId, record.lessonId);
      purged += 1;
      continue;
    }

    try {
      const envelope = await dependencies.fetchManifest(record.lessonId);
      const manifest = await dependencies.verifyEnvelope(envelope.authorization, envelope.manifest);
      validateOfflineLessonManifest(manifest);

      if (
        manifest.profileId !== profileId ||
        manifest.deviceId !== deviceId ||
        manifest.lesson.id !== record.lessonId ||
        manifest.lesson.classId !== record.classId ||
        manifest.lesson.contentRevision !== record.contentRevision ||
        manifest.lesson.publishedAt !== record.publishedAt
      ) {
        await dependencies.removePackage(profileId, deviceId, record.lessonId);
        purged += 1;
        continue;
      }

      // Reusing the stored blobs is intentional: saveOfflineLessonPackage rechecks exact
      // byte sizes + SHA-256 against the newly signed manifest before replacing the record.
      await dependencies.savePackage(
        manifest,
        packagePayloads(record),
        envelope.authorization,
      );
      refreshed += 1;
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === "UNAUTHORIZED") throw error;

      // Reconnect is a security boundary. If current authority cannot affirm this
      // package, do not keep protected bytes available merely because they exist locally.
      await dependencies.removePackage(profileId, deviceId, record.lessonId);
      purged += 1;
    }
  }

  return { checked: packages.length, refreshed, purged };
}

export async function revalidateOfflinePackagesForCurrentSession(
  profileId: string,
): Promise<OfflineReconnectRevalidationResult> {
  const lease = await refreshOfflineLeaseForCurrentSession(profileId);
  const packages = await listOfflineLessonPackages(lease.profileId, lease.deviceId);
  return revalidateStoredOfflinePackages(lease.profileId, lease.deviceId, packages);
}
