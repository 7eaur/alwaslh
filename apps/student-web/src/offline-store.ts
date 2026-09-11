import type { StudentOfflineLease } from "./offline-api";

const OFFLINE_DB_NAME = "alwaslh-student-offline";
const OFFLINE_DB_VERSION = 1;
const LEASE_STORE = "leases";
export const OFFLINE_CLOCK_ROLLBACK_TOLERANCE_MS = 5 * 60 * 1000;

export interface StoredOfflineLease {
  scopeKey: string;
  profileId: string;
  deviceId: string;
  lease: StudentOfflineLease;
  observedAtClientMs: number;
  lastSeenClientMs: number;
}

export type OfflineLeaseStatus = "fresh" | "expired" | "clock_rollback" | "invalid";

export interface OfflineLeaseEvaluation {
  status: OfflineLeaseStatus;
  estimatedServerTimeMs: number | null;
}

export function offlineScopeKey(profileId: string, deviceId: string): string {
  return `${profileId}:${deviceId}`;
}

function validTimestamp(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function createStoredOfflineLease(
  lease: StudentOfflineLease,
  observedAtClientMs = Date.now(),
): StoredOfflineLease {
  return {
    scopeKey: offlineScopeKey(lease.profileId, lease.deviceId),
    profileId: lease.profileId,
    deviceId: lease.deviceId,
    lease,
    observedAtClientMs,
    lastSeenClientMs: observedAtClientMs,
  };
}

export function evaluateStoredOfflineLease(
  record: StoredOfflineLease,
  clientNowMs = Date.now(),
): OfflineLeaseEvaluation {
  const issuedAtMs = validTimestamp(record.lease.issuedAt);
  const expiresAtMs = validTimestamp(record.lease.expiresAt);
  if (
    issuedAtMs === null ||
    expiresAtMs === null ||
    expiresAtMs <= issuedAtMs ||
    !Number.isFinite(record.observedAtClientMs) ||
    !Number.isFinite(record.lastSeenClientMs)
  ) {
    return { status: "invalid", estimatedServerTimeMs: null };
  }

  if (clientNowMs + OFFLINE_CLOCK_ROLLBACK_TOLERANCE_MS < record.lastSeenClientMs) {
    return { status: "clock_rollback", estimatedServerTimeMs: null };
  }

  const elapsedClientMs = Math.max(0, clientNowMs - record.observedAtClientMs);
  const estimatedServerTimeMs = issuedAtMs + elapsedClientMs;
  return {
    status: estimatedServerTimeMs < expiresAtMs ? "fresh" : "expired",
    estimatedServerTimeMs,
  };
}

export function storedLeaseAllowsClass(
  record: StoredOfflineLease,
  classId: string,
  clientNowMs = Date.now(),
): boolean {
  const evaluation = evaluateStoredOfflineLease(record, clientNowMs);
  if (evaluation.status !== "fresh" || evaluation.estimatedServerTimeMs === null) return false;
  const estimatedServerTimeMs = evaluation.estimatedServerTimeMs;

  return record.lease.grants.some((grant) => {
    const grantExpiresAtMs = validTimestamp(grant.expiresAt);
    if (grantExpiresAtMs === null || estimatedServerTimeMs >= grantExpiresAtMs) return false;
    return grant.scope === "all_content" || grant.classId === classId;
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("offline_storage_request_failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("offline_storage_transaction_failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("offline_storage_transaction_aborted"));
  });
}

function openOfflineDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("offline_storage_unavailable"));

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(LEASE_STORE)) {
        database.createObjectStore(LEASE_STORE, { keyPath: "scopeKey" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("offline_storage_open_failed"));
  });
}

export async function saveOfflineLease(
  lease: StudentOfflineLease,
  observedAtClientMs = Date.now(),
): Promise<StoredOfflineLease> {
  const record = createStoredOfflineLease(lease, observedAtClientMs);
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(LEASE_STORE, "readwrite");
    transaction.objectStore(LEASE_STORE).put(record);
    await transactionDone(transaction);
    return record;
  } finally {
    database.close();
  }
}

export async function loadOfflineLease(
  profileId: string,
  deviceId: string,
  clientNowMs = Date.now(),
): Promise<StoredOfflineLease | null> {
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(LEASE_STORE, "readwrite");
    const store = transaction.objectStore(LEASE_STORE);
    const record = await requestResult(store.get(offlineScopeKey(profileId, deviceId))) as StoredOfflineLease | undefined;
    if (record) {
      record.lastSeenClientMs = Math.max(record.lastSeenClientMs, clientNowMs);
      store.put(record);
    }
    await transactionDone(transaction);
    return record ?? null;
  } finally {
    database.close();
  }
}

export async function listOfflineLeases(): Promise<StoredOfflineLease[]> {
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(LEASE_STORE, "readonly");
    const records = await requestResult(transaction.objectStore(LEASE_STORE).getAll()) as StoredOfflineLease[];
    await transactionDone(transaction);
    return records;
  } finally {
    database.close();
  }
}

export async function deleteOfflineScope(profileId: string, deviceId: string): Promise<void> {
  const database = await openOfflineDatabase();
  try {
    const transaction = database.transaction(LEASE_STORE, "readwrite");
    transaction.objectStore(LEASE_STORE).delete(offlineScopeKey(profileId, deviceId));
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}
