import { describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "./api-errors";
import type {
  StudentOfflineAuthorizationEnvelope,
  StudentOfflineLessonManifest,
  StudentOfflineLessonManifestEnvelope,
} from "./offline-download-api";
import {
  offlineLessonPackageKey,
  type StoredOfflineLessonPackage,
} from "./offline-content-store";
import { revalidateStoredOfflinePackages } from "./offline-revalidation";

function authorization(): StudentOfflineAuthorizationEnvelope {
  return {
    version: 1,
    algorithm: "ES256",
    keyId: "a".repeat(64),
    payload: "payload",
    signature: "signature",
  };
}

function manifest(overrides: Partial<StudentOfflineLessonManifest> = {}): StudentOfflineLessonManifest {
  return {
    version: 1,
    profileId: "profile-1",
    deviceId: "device-1",
    issuedAt: "2026-09-14T00:00:00.000Z",
    leaseExpiresAt: "2026-09-15T00:00:00.000Z",
    authorizationExpiresAt: "2026-09-15T00:00:00.000Z",
    lesson: {
      id: "lesson-1",
      classId: "class-1",
      title: "Lesson 1",
      summary: null,
      contentRevision: 3,
      publishedAt: "2026-09-13T00:00:00.000Z",
    },
    totalByteSize: 0,
    assets: [],
    ...overrides,
  };
}

function storedPackage(overrides: Partial<StoredOfflineLessonPackage> = {}): StoredOfflineLessonPackage {
  return {
    packageKey: offlineLessonPackageKey("profile-1", "device-1", "lesson-1"),
    scopeKey: "profile-1:device-1",
    profileId: "profile-1",
    deviceId: "device-1",
    classId: "class-1",
    lessonId: "lesson-1",
    title: "Lesson 1",
    summary: null,
    contentRevision: 3,
    publishedAt: "2026-09-13T00:00:00.000Z",
    issuedAt: "2026-09-13T00:00:00.000Z",
    leaseExpiresAt: "2026-09-14T00:00:00.000Z",
    authorizationExpiresAt: "2026-09-14T00:00:00.000Z",
    authorization: authorization(),
    totalByteSize: 0,
    downloadedAtClientMs: Date.parse("2026-09-13T00:00:00.000Z"),
    assets: [],
    ...overrides,
  };
}

function envelope(value = manifest()): StudentOfflineLessonManifestEnvelope {
  return { manifest: value, authorization: authorization() };
}

function dependencies(fetchManifest: (lessonId: string) => Promise<StudentOfflineLessonManifestEnvelope>) {
  const removePackage = vi.fn(async () => undefined);
  const savePackage = vi.fn(async (value: StudentOfflineLessonManifest) => storedPackage({
    title: value.lesson.title,
    summary: value.lesson.summary,
    issuedAt: value.issuedAt,
    leaseExpiresAt: value.leaseExpiresAt,
    authorizationExpiresAt: value.authorizationExpiresAt,
  }));
  const verifyEnvelope = vi.fn(async (_authorization: StudentOfflineAuthorizationEnvelope, value: StudentOfflineLessonManifest) => value);
  return { fetchManifest, verifyEnvelope, savePackage, removePackage };
}

describe("offline reconnect revalidation", () => {
  it("refreshes a package only after current signed authority matches the stored revision", async () => {
    const deps = dependencies(async () => envelope());

    await expect(revalidateStoredOfflinePackages("profile-1", "device-1", [storedPackage()], deps)).resolves.toEqual({
      checked: 1,
      refreshed: 1,
      purged: 0,
    });

    expect(deps.verifyEnvelope).toHaveBeenCalledOnce();
    expect(deps.savePackage).toHaveBeenCalledOnce();
    expect(deps.removePackage).not.toHaveBeenCalled();
  });

  it("purges a package when the current content revision has changed", async () => {
    const changed = manifest({ lesson: { ...manifest().lesson, contentRevision: 4 } });
    const deps = dependencies(async () => envelope(changed));

    await expect(revalidateStoredOfflinePackages("profile-1", "device-1", [storedPackage()], deps)).resolves.toEqual({
      checked: 1,
      refreshed: 0,
      purged: 1,
    });

    expect(deps.savePackage).not.toHaveBeenCalled();
    expect(deps.removePackage).toHaveBeenCalledWith("profile-1", "device-1", "lesson-1");
  });

  it("purges protected bytes when current authority denies or cannot re-authorize the lesson", async () => {
    const deps = dependencies(async () => {
      throw new ApiRequestError("FORBIDDEN", "revoked", 403);
    });

    await expect(revalidateStoredOfflinePackages("profile-1", "device-1", [storedPackage()], deps)).resolves.toEqual({
      checked: 1,
      refreshed: 0,
      purged: 1,
    });
    expect(deps.removePackage).toHaveBeenCalledOnce();
  });

  it("propagates session expiry so the owning session layer performs exact-scope cleanup", async () => {
    const deps = dependencies(async () => {
      throw new ApiRequestError("UNAUTHORIZED", "session expired", 401);
    });

    await expect(revalidateStoredOfflinePackages("profile-1", "device-1", [storedPackage()], deps)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(deps.removePackage).not.toHaveBeenCalled();
  });

  it("purges a package that is not owned by the active profile/device scope", async () => {
    const deps = dependencies(async () => envelope());
    const foreign = storedPackage({
      packageKey: offlineLessonPackageKey("profile-1", "device-2", "lesson-1"),
      scopeKey: "profile-1:device-2",
      deviceId: "device-2",
    });

    await expect(revalidateStoredOfflinePackages("profile-1", "device-1", [foreign], deps)).resolves.toEqual({
      checked: 1,
      refreshed: 0,
      purged: 1,
    });
    expect(deps.fetchManifest).not.toHaveBeenCalled();
    expect(deps.removePackage).toHaveBeenCalledWith("profile-1", "device-2", "lesson-1");
  });
});
