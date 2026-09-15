import { ApiRequestError } from "./api-errors";
import { verifyOfflineLessonAuthorization } from "./offline-authorization";
import {
  getStudentOfflineLessonManifest,
  type StudentOfflineLessonManifest,
} from "./offline-download-api";
import {
  listOfflineLessonPackages,
  removeOfflineLessonPackage,
  saveOfflineLessonPackage,
  validateOfflineLessonManifest,
  type StoredOfflineLessonPackage,
} from "./offline-content-store";
import {
  clearActiveOfflineLease,
  refreshOfflineLeaseForCurrentSession,
} from "./offline-session";
import { applyOfflineContentDelta } from "./offline-sync";

export type OfflineRevalidationStatus = "verified" | "deferred" | "session_invalid";

export interface OfflineRevalidationResult {
  status: OfflineRevalidationStatus;
  checked: number;
  refreshed: number;
  removed: number;
  deferred: number;
}

function sameNullable<T>(left: T | null, right: T | null): boolean {
  return left === right;
}

function packageMatchesManifest(
  record: StoredOfflineLessonPackage,
  manifest: StudentOfflineLessonManifest,
): boolean {
  if (
    manifest.profileId !== record.profileId ||
    manifest.deviceId !== record.deviceId ||
    manifest.lesson.id !== record.lessonId ||
    manifest.lesson.classId !== record.classId ||
    manifest.lesson.contentRevision !== record.contentRevision ||
    manifest.lesson.publishedAt !== record.publishedAt ||
    manifest.lesson.title !== record.title ||
    !sameNullable(manifest.lesson.summary, record.summary) ||
    manifest.totalByteSize !== record.totalByteSize ||
    manifest.assets.length !== record.assets.length
  ) {
    return false;
  }

  const storedById = new Map(record.assets.map((asset) => [asset.id, asset]));
  for (const asset of manifest.assets) {
    const stored = storedById.get(asset.id);
    if (
      !stored ||
      stored.kind !== asset.kind ||
      stored.position !== asset.position ||
      stored.mimeType !== asset.mimeType ||
      stored.byteSize !== asset.byteSize ||
      stored.checksumSha256.toLowerCase() !== asset.checksumSha256.toLowerCase() ||
      !sameNullable(stored.width, asset.width) ||
      !sameNullable(stored.height, asset.height) ||
      !sameNullable(stored.sourcePageNumber, asset.sourcePageNumber) ||
      !sameNullable(stored.text, asset.text)
    ) {
      return false;
    }
  }

  return true;
}

function shouldRemoveForAuthorityError(error: unknown): boolean {
  return error instanceof ApiRequestError && (
    error.code === "FORBIDDEN" ||
    error.code === "NOT_FOUND"
  );
}

function isSessionAuthorityError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.code === "UNAUTHORIZED";
}

/**
 * Revalidates locally stored protected lessons after connectivity returns.
 *
 * Server Auth/Device/Entitlement/Publication authority wins on reconnect.
 * The revision delta is applied first and is idempotent; the manifest pass then
 * rechecks every remaining package so a missed/old cursor can never weaken the
 * existing Stage16 authorization boundary.
 */
export async function revalidateOfflinePackagesForCurrentSession(
  profileId: string,
): Promise<OfflineRevalidationResult> {
  let lease;
  try {
    lease = await refreshOfflineLeaseForCurrentSession(profileId);
  } catch (error) {
    if (isSessionAuthorityError(error) || shouldRemoveForAuthorityError(error)) {
      await clearActiveOfflineLease().catch(() => undefined);
      return { status: "session_invalid", checked: 0, refreshed: 0, removed: 0, deferred: 0 };
    }
    return { status: "deferred", checked: 0, refreshed: 0, removed: 0, deferred: 0 };
  }

  let removed = 0;
  let deferred = 0;
  try {
    const delta = await applyOfflineContentDelta(lease.profileId, lease.deviceId);
    removed += delta.removed;
    if (delta.hasMore) deferred += 1;
  } catch (error) {
    if (isSessionAuthorityError(error)) {
      await clearActiveOfflineLease().catch(() => undefined);
      return { status: "session_invalid", checked: 0, refreshed: 0, removed, deferred };
    }
    // The full manifest pass below remains authoritative. A transient delta
    // failure therefore delays the cursor only; it never authorizes content.
    deferred += 1;
  }

  const packages = await listOfflineLessonPackages(lease.profileId, lease.deviceId);
  let refreshed = 0;

  for (const record of packages) {
    try {
      const envelope = await getStudentOfflineLessonManifest(record.lessonId);
      const trustedManifest = await verifyOfflineLessonAuthorization(
        envelope.authorization,
        envelope.manifest,
      );
      validateOfflineLessonManifest(trustedManifest);

      if (!packageMatchesManifest(record, trustedManifest)) {
        await removeOfflineLessonPackage(record.profileId, record.deviceId, record.lessonId);
        removed += 1;
        continue;
      }

      await saveOfflineLessonPackage(
        trustedManifest,
        record.assets.map((asset) => ({ assetId: asset.id, blob: asset.blob })),
        envelope.authorization,
      );
      refreshed += 1;
    } catch (error) {
      if (isSessionAuthorityError(error)) {
        await clearActiveOfflineLease().catch(() => undefined);
        return {
          status: "session_invalid",
          checked: packages.length,
          refreshed,
          removed,
          deferred,
        };
      }
      if (shouldRemoveForAuthorityError(error)) {
        await removeOfflineLessonPackage(record.profileId, record.deviceId, record.lessonId);
        removed += 1;
      } else {
        deferred += 1;
      }
    }
  }

  return {
    status: deferred > 0 ? "deferred" : "verified",
    checked: packages.length,
    refreshed,
    removed,
    deferred,
  };
}
