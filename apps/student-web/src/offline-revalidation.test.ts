import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "./api-errors";
import type { StudentOfflineLessonManifestEnvelope } from "./offline-download-api";
import type { StoredOfflineLessonPackage } from "./offline-content-store";

const mocks = vi.hoisted(() => ({
  verifyAuthorization: vi.fn(),
  getManifest: vi.fn(),
  listPackages: vi.fn(),
  removePackage: vi.fn(),
  savePackage: vi.fn(),
  validateManifest: vi.fn(),
  refreshLease: vi.fn(),
  clearLease: vi.fn(),
  applyDelta: vi.fn(),
}));

vi.mock("./offline-authorization", () => ({
  verifyOfflineLessonAuthorization: mocks.verifyAuthorization,
}));

vi.mock("./offline-download-api", () => ({
  getStudentOfflineLessonManifest: mocks.getManifest,
}));

vi.mock("./offline-content-store", () => ({
  listOfflineLessonPackages: mocks.listPackages,
  removeOfflineLessonPackage: mocks.removePackage,
  saveOfflineLessonPackage: mocks.savePackage,
  validateOfflineLessonManifest: mocks.validateManifest,
}));

vi.mock("./offline-session", () => ({
  refreshOfflineLeaseForCurrentSession: mocks.refreshLease,
  clearActiveOfflineLease: mocks.clearLease,
}));

vi.mock("./offline-sync", () => ({
  applyOfflineContentDelta: mocks.applyDelta,
}));

import { revalidateOfflinePackagesForCurrentSession } from "./offline-revalidation";

const checksum = "a".repeat(64);

function storedPackage(overrides: Partial<StoredOfflineLessonPackage> = {}): StoredOfflineLessonPackage {
  return {
    packageKey: "profile-1:device-1:lesson-1",
    scopeKey: "profile-1:device-1",
    profileId: "profile-1",
    deviceId: "device-1",
    classId: "class-1",
    lessonId: "lesson-1",
    title: "Lesson 1",
    summary: null,
    contentRevision: 3,
    publishedAt: "2026-09-10T00:00:00.000Z",
    issuedAt: "2026-09-11T00:00:00.000Z",
    leaseExpiresAt: "2026-09-12T00:00:00.000Z",
    authorizationExpiresAt: "2026-09-12T00:00:00.000Z",
    authorization: { version: 1, algorithm: "ES256", keyId: checksum, payload: "payload", signature: "sig" },
    totalByteSize: 3,
    downloadedAtClientMs: 1,
    assets: [{
      id: "asset-1",
      kind: "image",
      position: 0,
      mimeType: "image/png",
      byteSize: 3,
      width: 100,
      height: 200,
      checksumSha256: checksum,
      sourcePageNumber: 5,
      text: "approved",
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }),
    }],
    ...overrides,
  };
}

function envelope(revision = 3): StudentOfflineLessonManifestEnvelope {
  const manifest = {
    version: 1 as const,
    profileId: "profile-1",
    deviceId: "device-1",
    issuedAt: "2026-09-11T01:00:00.000Z",
    leaseExpiresAt: "2026-09-12T01:00:00.000Z",
    authorizationExpiresAt: "2026-09-12T01:00:00.000Z",
    lesson: {
      id: "lesson-1",
      classId: "class-1",
      title: "Lesson 1",
      summary: null,
      contentRevision: revision,
      publishedAt: "2026-09-10T00:00:00.000Z",
    },
    totalByteSize: 3,
    assets: [{
      id: "asset-1",
      kind: "image" as const,
      position: 0,
      mimeType: "image/png",
      byteSize: 3,
      width: 100,
      height: 200,
      checksumSha256: checksum,
      sourcePageNumber: 5,
      text: "approved",
      downloadPath: `/v1/student/offline/lessons/lesson-1/assets/asset-1?revision=${revision}`,
    }],
  };
  return {
    manifest,
    authorization: { version: 1, algorithm: "ES256", keyId: checksum, payload: "payload-2", signature: "sig-2" },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.refreshLease.mockResolvedValue({ profileId: "profile-1", deviceId: "device-1" });
  mocks.clearLease.mockResolvedValue(undefined);
  mocks.removePackage.mockResolvedValue(undefined);
  mocks.savePackage.mockResolvedValue(undefined);
  mocks.validateManifest.mockReturnValue(undefined);
  mocks.applyDelta.mockResolvedValue({
    pages: 1,
    entries: 0,
    removed: 0,
    nextCursor: "0",
    hasMore: false,
  });
});

describe("revalidateOfflinePackagesForCurrentSession", () => {
  it("refreshes an unchanged package with current signed authorization", async () => {
    const record = storedPackage();
    const current = envelope();
    mocks.listPackages.mockResolvedValue([record]);
    mocks.getManifest.mockResolvedValue(current);
    mocks.verifyAuthorization.mockResolvedValue(current.manifest);

    const result = await revalidateOfflinePackagesForCurrentSession("profile-1");

    expect(result).toEqual({ status: "verified", checked: 1, refreshed: 1, removed: 0, deferred: 0 });
    expect(mocks.applyDelta).toHaveBeenCalledWith("profile-1", "device-1");
    expect(mocks.savePackage).toHaveBeenCalledOnce();
    expect(mocks.removePackage).not.toHaveBeenCalled();
  });

  it("includes delta removals before revalidating remaining packages", async () => {
    mocks.applyDelta.mockResolvedValue({
      pages: 1,
      entries: 1,
      removed: 1,
      nextCursor: "8",
      hasMore: false,
    });
    mocks.listPackages.mockResolvedValue([]);

    const result = await revalidateOfflinePackagesForCurrentSession("profile-1");

    expect(result).toEqual({ status: "verified", checked: 0, refreshed: 0, removed: 1, deferred: 0 });
  });

  it("keeps the full manifest pass authoritative when delta transport is temporarily unavailable", async () => {
    const record = storedPackage();
    const current = envelope();
    mocks.applyDelta.mockRejectedValue(new ApiRequestError("SERVICE_UNAVAILABLE", "retry", 0));
    mocks.listPackages.mockResolvedValue([record]);
    mocks.getManifest.mockResolvedValue(current);
    mocks.verifyAuthorization.mockResolvedValue(current.manifest);

    const result = await revalidateOfflinePackagesForCurrentSession("profile-1");

    expect(result).toEqual({ status: "deferred", checked: 1, refreshed: 1, removed: 0, deferred: 1 });
  });

  it("removes a stale package when the authoritative lesson revision changed", async () => {
    const record = storedPackage();
    const current = envelope(4);
    mocks.listPackages.mockResolvedValue([record]);
    mocks.getManifest.mockResolvedValue(current);
    mocks.verifyAuthorization.mockResolvedValue(current.manifest);

    const result = await revalidateOfflinePackagesForCurrentSession("profile-1");

    expect(result).toEqual({ status: "verified", checked: 1, refreshed: 0, removed: 1, deferred: 0 });
    expect(mocks.removePackage).toHaveBeenCalledWith("profile-1", "device-1", "lesson-1");
    expect(mocks.savePackage).not.toHaveBeenCalled();
  });

  it("removes a package when publication or entitlement authority now denies it", async () => {
    const record = storedPackage();
    mocks.listPackages.mockResolvedValue([record]);
    mocks.getManifest.mockRejectedValue(new ApiRequestError("FORBIDDEN", "denied", 403));

    const result = await revalidateOfflinePackagesForCurrentSession("profile-1");

    expect(result.removed).toBe(1);
    expect(result.status).toBe("verified");
  });

  it("retains local data on a transient reconnect failure and reports deferred verification", async () => {
    const record = storedPackage();
    mocks.listPackages.mockResolvedValue([record]);
    mocks.getManifest.mockRejectedValue(new ApiRequestError("SERVICE_UNAVAILABLE", "retry", 0));

    const result = await revalidateOfflinePackagesForCurrentSession("profile-1");

    expect(result).toEqual({ status: "deferred", checked: 1, refreshed: 0, removed: 0, deferred: 1 });
    expect(mocks.removePackage).not.toHaveBeenCalled();
  });

  it("clears the exact active offline scope when session authority is lost", async () => {
    mocks.refreshLease.mockRejectedValue(new ApiRequestError("UNAUTHORIZED", "expired", 401));

    const result = await revalidateOfflinePackagesForCurrentSession("profile-1");

    expect(result.status).toBe("session_invalid");
    expect(mocks.clearLease).toHaveBeenCalledOnce();
    expect(mocks.listPackages).not.toHaveBeenCalled();
  });
});
