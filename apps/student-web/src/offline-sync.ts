import { removeOfflineLessonPackage } from "./offline-content-store";
import { getStudentOfflineDelta } from "./offline-sync-api";
import {
  readOfflineSyncCursor,
  writeOfflineSyncCursor,
} from "./offline-sync-cursor";

const DELTA_PAGE_SIZE = 50;
const MAX_DELTA_PAGES_PER_RECONNECT = 10;

export interface OfflineDeltaApplyResult {
  pages: number;
  entries: number;
  removed: number;
  nextCursor: string;
  hasMore: boolean;
}

export async function applyOfflineContentDelta(
  profileId: string,
  deviceId: string,
): Promise<OfflineDeltaApplyResult> {
  let cursor = readOfflineSyncCursor(profileId, deviceId);

  // A scope created before this feature has no durable cursor. Do not replay its
  // entire historical revision stream against packages that may have been saved
  // after those events. Bootstrap to the server's current upper bound, then let
  // the full manifest revalidation in the same reconnect cycle establish current
  // authority for every stored package.
  if (cursor === null) {
    const bootstrap = await getStudentOfflineDelta("0", 1);
    writeOfflineSyncCursor(profileId, deviceId, bootstrap.latestCursor);
    return {
      pages: 1,
      entries: 0,
      removed: 0,
      nextCursor: bootstrap.latestCursor,
      hasMore: false,
    };
  }

  let pages = 0;
  let entries = 0;
  let removed = 0;
  let hasMore = false;

  while (pages < MAX_DELTA_PAGES_PER_RECONNECT) {
    const page = await getStudentOfflineDelta(cursor, DELTA_PAGE_SIZE);

    // Apply first, persist the cursor second. If any mutation fails, retrying the
    // page is safe because package removal is idempotent.
    for (const entry of page.entries) {
      await removeOfflineLessonPackage(profileId, deviceId, entry.lessonId);
      removed += 1;
    }

    writeOfflineSyncCursor(profileId, deviceId, page.nextCursor);
    cursor = page.nextCursor;
    pages += 1;
    entries += page.entries.length;
    hasMore = page.hasMore;

    if (!page.hasMore) break;
  }

  return {
    pages,
    entries,
    removed,
    nextCursor: cursor,
    hasMore,
  };
}
