import type {
  StudentOfflineAuthorizationEnvelope,
  StudentOfflineLessonAssetManifest,
  StudentOfflineLessonManifest,
} from "./offline-download-api";
import {
  evaluateStoredOfflineLease,
  loadOfflineLease,
  OFFLINE_LESSON_PACKAGE_STORE,
  OFFLINE_LESSON_SCOPE_INDEX,
  offlineScopeKey,
  offlineTransactionDone,
  openOfflineDatabase,
  requestOfflineResult,
  storedLeaseAllowsClass,
  type StoredOfflineLease,
} from "./offline-store";

export const OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES = 256 * 1024 * 1024;
export const OFFLINE_LESSON_PAYLOAD_BUDGET_BYTES = 64 * 1024 * 1024;

export type OfflineContentErrorCode =
  | "manifest_invalid"
  | "lesson_budget_exceeded"
  | "scope_budget_exceeded"
  | "asset_missing"
  | "byte_size_mismatch"
  | "checksum_mismatch"
  | "crypto_unavailable"
  | "storage_quota_exceeded";

export class OfflineContentError extends Error {
  constructor(readonly code: OfflineContentErrorCode) {
    super(code);
    this.name = "OfflineContentError";
  }
}

export interface StoredOfflineLessonAsset {
  id: string;
  kind: StudentOfflineLessonAssetManifest["kind"];
  position: number;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  checksumSha256: string;
  sourcePageNumber: number | null;
  text: string | null;
  blob: Blob;
}

export interface StoredOfflineLessonPackage {
  packageKey: string;
  scopeKey: string;
  profileId: string;
  deviceId: string;
  classId: string;
  lessonId: string;
  title: string;
  summary: string | null;
  contentRevision: number;
  publishedAt: string;
  issuedAt: string;
  leaseExpiresAt: string;
  authorizationExpiresAt: string;
  authorization: StudentOfflineAuthorizationEnvelope;
  totalByteSize: number;
  downloadedAtClientMs: number;
  assets: StoredOfflineLessonAsset[];
}

export interface OfflineAssetPayload {
  assetId: string;
  blob: Blob;
}

export function offlineLessonPackageKey(
  profileId: string,
  deviceId: string,
  lessonId: string,
): string {
  return `${offlineScopeKey(profileId, deviceId)}:${lessonId}`;
}

function isSha256(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value.toLowerCase());
}

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function validateOfflineLessonManifest(manifest: StudentOfflineLessonManifest): void {
  if (
    manifest.version !== 1 ||
    !manifest.profileId ||
    !manifest.deviceId ||
    !manifest.lesson.id ||
    !manifest.lesson.classId ||
    !Number.isSafeInteger(manifest.lesson.contentRevision) ||
    manifest.lesson.contentRevision < 1 ||
    !validDate(manifest.issuedAt) ||
    !validDate(manifest.leaseExpiresAt) ||
    !validDate(manifest.authorizationExpiresAt) ||
    !validDate(manifest.lesson.publishedAt) ||
    !Number.isSafeInteger(manifest.totalByteSize) ||
    manifest.totalByteSize < 0
  ) {
    throw new OfflineContentError("manifest_invalid");
  }

  if (manifest.totalByteSize > OFFLINE_LESSON_PAYLOAD_BUDGET_BYTES) {
    throw new OfflineContentError("lesson_budget_exceeded");
  }

  let totalByteSize = 0;
  const assetIds = new Set<string>();
  for (const asset of manifest.assets) {
    const expectedPath = `/v1/student/offline/lessons/${manifest.lesson.id}/assets/${asset.id}?revision=${manifest.lesson.contentRevision}`;
    if (
      !asset.id ||
      assetIds.has(asset.id) ||
      !Number.isSafeInteger(asset.byteSize) ||
      asset.byteSize < 0 ||
      !isSha256(asset.checksumSha256) ||
      asset.downloadPath !== expectedPath
    ) {
      throw new OfflineContentError("manifest_invalid");
    }
    assetIds.add(asset.id);
    totalByteSize += asset.byteSize;
    if (!Number.isSafeInteger(totalByteSize)) {
      throw new OfflineContentError("manifest_invalid");
    }
  }

  if (totalByteSize !== manifest.totalByteSize) {
    throw new OfflineContentError("manifest_invalid");
  }
}

export function offlineScopeUsageBytes(packages: StoredOfflineLessonPackage[]): number {
  let total = 0;
  for (const record of packages) {
    if (!Number.isSafeInteger(record.totalByteSize) || record.totalByteSize < 0) {
      throw new OfflineContentError("manifest_invalid");
    }
    total += record.totalByteSize;
    if (!Number.isSafeInteger(total)) throw new OfflineContentError("manifest_invalid");
  }
  return total;
}

export function projectedOfflineScopeUsageBytes(
  packages: StoredOfflineLessonPackage[],
  packageKey: string,
  replacementByteSize: number,
): number {
  const currentUsage = offlineScopeUsageBytes(packages);
  const currentPackage = packages.find((record) => record.packageKey === packageKey);
  return currentUsage - (currentPackage?.totalByteSize ?? 0) + replacementByteSize;
}

async function sha256(blob: Blob): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new OfflineContentError("crypto_unavailable");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifiedAssets(
  manifest: StudentOfflineLessonManifest,
  payloads: OfflineAssetPayload[],
): Promise<StoredOfflineLessonAsset[]> {
  if (payloads.length !== manifest.assets.length) throw new OfflineContentError("asset_missing");
  const payloadById = new Map(payloads.map((payload) => [payload.assetId, payload.blob]));
  if (payloadById.size !== payloads.length) throw new OfflineContentError("asset_missing");

  const records: StoredOfflineLessonAsset[] = [];
  for (const asset of manifest.assets) {
    const blob = payloadById.get(asset.id);
    if (!blob) throw new OfflineContentError("asset_missing");
    if (blob.size !== asset.byteSize) throw new OfflineContentError("byte_size_mismatch");
    if ((await sha256(blob)) !== asset.checksumSha256.toLowerCase()) {
      throw new OfflineContentError("checksum_mismatch");
    }
    records.push({
      id: asset.id,
      kind: asset.kind,
      position: asset.position,
      mimeType: asset.mimeType,
      byteSize: asset.byteSize,
      width: asset.width,
      height: asset.height,
      checksumSha256: asset.checksumSha256.toLowerCase(),
      sourcePageNumber: asset.sourcePageNumber,
      text: asset.text,
      blob,
    });
  }
  return records;
}

function isQuotaExceeded(error: unknown): boolean {
  return error instanceof DOMException && error.name === "QuotaExceededError";
}

export async function saveOfflineLessonPackage(
  manifest: StudentOfflineLessonManifest,
  payloads: OfflineAssetPayload[],
  authorization: StudentOfflineAuthorizationEnvelope,
  downloadedAtClientMs = Date.now(),
): Promise<StoredOfflineLessonPackage> {
  validateOfflineLessonManifest(manifest);
  const assets = await verifiedAssets(manifest, payloads);
  const packageKey = offlineLessonPackageKey(
    manifest.profileId,
    manifest.deviceId,
    manifest.lesson.id,
  );
  const scopeKey = offlineScopeKey(manifest.profileId, manifest.deviceId);
  const record: StoredOfflineLessonPackage = {
    packageKey,
    scopeKey,
    profileId: manifest.profileId,
    deviceId: manifest.deviceId,
    classId: manifest.lesson.classId,
    lessonId: manifest.lesson.id,
    title: manifest.lesson.title,
    summary: manifest.lesson.summary,
    contentRevision: manifest.lesson.contentRevision,
    publishedAt: manifest.lesson.publishedAt,
    issuedAt: manifest.issuedAt,
    leaseExpiresAt: manifest.leaseExpiresAt,
    authorizationExpiresAt: manifest.authorizationExpiresAt,
    authorization,
    totalByteSize: manifest.totalByteSize,
    downloadedAtClientMs,
    assets,
  };

  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(OFFLINE_LESSON_PACKAGE_STORE, "readwrite");
    const store = transaction.objectStore(OFFLINE_LESSON_PACKAGE_STORE);
    const packages = (await requestOfflineResult(
      store.index(OFFLINE_LESSON_SCOPE_INDEX).getAll(IDBKeyRange.only(scopeKey)),
    )) as StoredOfflineLessonPackage[];
    const projectedUsage = projectedOfflineScopeUsageBytes(
      packages,
      packageKey,
      manifest.totalByteSize,
    );
    if (projectedUsage > OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES) {
      transaction.abort();
      throw new OfflineContentError("scope_budget_exceeded");
    }

    store.put(record);
    await offlineTransactionDone(transaction);
    return record;
  } catch (error) {
    if (isQuotaExceeded(error)) throw new OfflineContentError("storage_quota_exceeded");
    throw error;
  } finally {
    database.close();
  }
}

export async function loadOfflineLessonPackage(
  profileId: string,
  deviceId: string,
  lessonId: string,
): Promise<StoredOfflineLessonPackage | null> {
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(OFFLINE_LESSON_PACKAGE_STORE, "readonly");
    const record = (await requestOfflineResult(
      transaction
        .objectStore(OFFLINE_LESSON_PACKAGE_STORE)
        .get(offlineLessonPackageKey(profileId, deviceId, lessonId)),
    )) as StoredOfflineLessonPackage | undefined;
    await offlineTransactionDone(transaction);
    return record ?? null;
  } finally {
    database.close();
  }
}

export async function listOfflineLessonPackages(
  profileId: string,
  deviceId: string,
): Promise<StoredOfflineLessonPackage[]> {
  const scopeKey = offlineScopeKey(profileId, deviceId);
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(OFFLINE_LESSON_PACKAGE_STORE, "readonly");
    const records = (await requestOfflineResult(
      transaction
        .objectStore(OFFLINE_LESSON_PACKAGE_STORE)
        .index(OFFLINE_LESSON_SCOPE_INDEX)
        .getAll(IDBKeyRange.only(scopeKey)),
    )) as StoredOfflineLessonPackage[];
    await offlineTransactionDone(transaction);
    return records.sort((left, right) => right.downloadedAtClientMs - left.downloadedAtClientMs);
  } finally {
    database.close();
  }
}

export async function removeOfflineLessonPackage(
  profileId: string,
  deviceId: string,
  lessonId: string,
): Promise<void> {
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(OFFLINE_LESSON_PACKAGE_STORE, "readwrite");
    transaction
      .objectStore(OFFLINE_LESSON_PACKAGE_STORE)
      .delete(offlineLessonPackageKey(profileId, deviceId, lessonId));
    await offlineTransactionDone(transaction);
  } finally {
    database.close();
  }
}

export function offlineLessonPackageAllowsUse(
  record: StoredOfflineLessonPackage,
  lease: StoredOfflineLease,
  clientNowMs = Date.now(),
): boolean {
  if (
    record.profileId !== lease.profileId ||
    record.deviceId !== lease.deviceId ||
    !storedLeaseAllowsClass(lease, record.classId, clientNowMs)
  ) {
    return false;
  }

  const evaluation = evaluateStoredOfflineLease(lease, clientNowMs);
  const authorizationExpiresAt = Date.parse(record.authorizationExpiresAt);
  return (
    evaluation.status === "fresh" &&
    evaluation.estimatedServerTimeMs !== null &&
    Number.isFinite(authorizationExpiresAt) &&
    evaluation.estimatedServerTimeMs < authorizationExpiresAt
  );
}

export async function loadUsableOfflineLessonPackage(
  profileId: string,
  deviceId: string,
  lessonId: string,
  clientNowMs = Date.now(),
): Promise<StoredOfflineLessonPackage | null> {
  const [lease, lesson] = await Promise.all([
    loadOfflineLease(profileId, deviceId, clientNowMs),
    loadOfflineLessonPackage(profileId, deviceId, lessonId),
  ]);
  if (!lease || !lesson || !offlineLessonPackageAllowsUse(lesson, lease, clientNowMs)) return null;
  return lesson;
}
