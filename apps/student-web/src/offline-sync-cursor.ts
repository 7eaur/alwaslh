const CURSOR_PREFIX = "alwaslh-student-offline:sync-cursor:";

function storageOrNull(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function cursorKey(profileId: string, deviceId: string): string {
  return `${CURSOR_PREFIX}${profileId}:${deviceId}`;
}

function validCursor(value: string | null): value is string {
  return value !== null && /^\d+$/.test(value);
}

export function readOfflineSyncCursor(profileId: string, deviceId: string): string {
  const storage = storageOrNull();
  if (!storage) return "0";
  const key = cursorKey(profileId, deviceId);
  try {
    const value = storage.getItem(key);
    if (!validCursor(value)) {
      if (value !== null) storage.removeItem(key);
      return "0";
    }
    return value;
  } catch {
    return "0";
  }
}

export function writeOfflineSyncCursor(profileId: string, deviceId: string, cursor: string): void {
  if (!/^\d+$/.test(cursor)) throw new Error("invalid_offline_sync_cursor");
  const storage = storageOrNull();
  if (!storage) throw new Error("offline_sync_cursor_storage_unavailable");
  storage.setItem(cursorKey(profileId, deviceId), cursor);
}

export function clearOfflineSyncCursor(profileId: string, deviceId: string): void {
  const storage = storageOrNull();
  if (!storage) return;
  try {
    storage.removeItem(cursorKey(profileId, deviceId));
  } catch {
    // Non-secret cursor cleanup is best effort if browser storage is denied.
  }
}
