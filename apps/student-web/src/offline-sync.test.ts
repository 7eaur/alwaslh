import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDelta: vi.fn(),
  removePackage: vi.fn(),
  readCursor: vi.fn(),
  writeCursor: vi.fn(),
}));

vi.mock("./offline-sync-api", () => ({
  getStudentOfflineDelta: mocks.getDelta,
}));

vi.mock("./offline-content-store", () => ({
  removeOfflineLessonPackage: mocks.removePackage,
}));

vi.mock("./offline-sync-cursor", () => ({
  readOfflineSyncCursor: mocks.readCursor,
  writeOfflineSyncCursor: mocks.writeCursor,
}));

import { applyOfflineContentDelta } from "./offline-sync";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.readCursor.mockReturnValue("0");
  mocks.removePackage.mockResolvedValue(undefined);
});

describe("applyOfflineContentDelta", () => {
  it("bootstraps a missing cursor without replaying historical changes", async () => {
    mocks.readCursor.mockReturnValue(null);
    mocks.getDelta.mockResolvedValue({
      version: 1,
      after: "0",
      nextCursor: "1",
      latestCursor: "23",
      hasMore: true,
      entries: [{
        revision: "1",
        entityType: "lesson",
        entityId: "lesson-old",
        changeType: "delete",
        classId: "class-1",
        lessonId: "lesson-old",
        contentRevision: 1,
      }],
    });

    const result = await applyOfflineContentDelta("profile-1", "device-1");

    expect(mocks.getDelta).toHaveBeenCalledWith("0", 1);
    expect(mocks.removePackage).not.toHaveBeenCalled();
    expect(mocks.writeCursor).toHaveBeenCalledWith("profile-1", "device-1", "23");
    expect(result).toEqual({ pages: 1, entries: 0, removed: 0, nextCursor: "23", hasMore: false });
  });

  it("applies a page before advancing the scoped cursor", async () => {
    mocks.getDelta.mockResolvedValue({
      version: 1,
      after: "0",
      nextCursor: "7",
      latestCursor: "7",
      hasMore: false,
      entries: [{
        revision: "7",
        entityType: "lesson",
        entityId: "lesson-1",
        changeType: "upsert",
        classId: "class-1",
        lessonId: "lesson-1",
        contentRevision: 2,
      }],
    });

    const result = await applyOfflineContentDelta("profile-1", "device-1");

    expect(mocks.removePackage).toHaveBeenCalledWith("profile-1", "device-1", "lesson-1");
    expect(mocks.writeCursor).toHaveBeenCalledWith("profile-1", "device-1", "7");
    const removeOrder = mocks.removePackage.mock.invocationCallOrder[0];
    const cursorOrder = mocks.writeCursor.mock.invocationCallOrder[0];
    if (removeOrder === undefined || cursorOrder === undefined) {
      throw new Error("expected offline delta application and cursor persistence calls");
    }
    expect(removeOrder).toBeLessThan(cursorOrder);
    expect(result).toEqual({ pages: 1, entries: 1, removed: 1, nextCursor: "7", hasMore: false });
  });

  it("continues bounded pagination from one stable snapshot", async () => {
    mocks.readCursor.mockReturnValue("10");
    mocks.getDelta
      .mockResolvedValueOnce({
        version: 1,
        after: "10",
        nextCursor: "11",
        latestCursor: "14",
        hasMore: true,
        entries: [{
          revision: "11", entityType: "lesson", entityId: "lesson-1", changeType: "upsert",
          classId: "class-1", lessonId: "lesson-1", contentRevision: 2,
        }],
      })
      .mockResolvedValueOnce({
        version: 1,
        after: "11",
        nextCursor: "14",
        latestCursor: "14",
        hasMore: false,
        entries: [{
          revision: "14", entityType: "lesson_asset", entityId: "asset-1", changeType: "delete",
          classId: "class-1", lessonId: "lesson-2", contentRevision: 4,
        }],
      });

    const result = await applyOfflineContentDelta("profile-1", "device-1");

    expect(mocks.getDelta).toHaveBeenNthCalledWith(1, "10", 50, undefined);
    expect(mocks.getDelta).toHaveBeenNthCalledWith(2, "11", 50, "14");
    expect(mocks.writeCursor).toHaveBeenNthCalledWith(1, "profile-1", "device-1", "11");
    expect(mocks.writeCursor).toHaveBeenNthCalledWith(2, "profile-1", "device-1", "14");
    expect(result).toEqual({ pages: 2, entries: 2, removed: 2, nextCursor: "14", hasMore: false });
  });

  it("does not advance the cursor if local application fails", async () => {
    mocks.getDelta.mockResolvedValue({
      version: 1,
      after: "0",
      nextCursor: "8",
      latestCursor: "8",
      hasMore: false,
      entries: [{
        revision: "8", entityType: "lesson", entityId: "lesson-1", changeType: "delete",
        classId: "class-1", lessonId: "lesson-1", contentRevision: 2,
      }],
    });
    mocks.removePackage.mockRejectedValue(new Error("idb_failure"));

    await expect(applyOfflineContentDelta("profile-1", "device-1")).rejects.toThrow("idb_failure");
    expect(mocks.writeCursor).not.toHaveBeenCalled();
  });

  it("stops after the reconnect page budget and reports remaining work", async () => {
    mocks.getDelta.mockImplementation(async (after: string) => ({
      version: 1,
      after,
      nextCursor: String(Number(after) + 1),
      latestCursor: "99",
      hasMore: true,
      entries: [],
    }));

    const result = await applyOfflineContentDelta("profile-1", "device-1");

    expect(mocks.getDelta).toHaveBeenCalledTimes(10);
    expect(result.pages).toBe(10);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe("10");
  });
});
