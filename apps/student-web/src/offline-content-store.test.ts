import { describe, expect, it } from "vitest";
import type { StudentOfflineLessonManifest } from "./offline-download-api";
import {
  OFFLINE_LESSON_PAYLOAD_BUDGET_BYTES,
  OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES,
  offlineLessonPackageAllowsUse,
  offlineLessonPackageKey,
  projectedOfflineScopeUsageBytes,
  type OfflineContentError,
  type StoredOfflineLessonPackage,
  validateOfflineLessonManifest,
} from "./offline-content-store";
import { createStoredOfflineLease } from "./offline-store";

const emptySha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function manifest(overrides: Partial<StudentOfflineLessonManifest> = {}): StudentOfflineLessonManifest {
  return {
    version: 1,
    profileId: "profile-1",
    deviceId: "device-1",
    issuedAt: "2026-09-11T00:00:00.000Z",
    leaseExpiresAt: "2026-09-12T00:00:00.000Z",
    authorizationExpiresAt: "2026-09-12T00:00:00.000Z",
    lesson: {
      id: "lesson-1",
      classId: "class-1",
      title: "Lesson 1",
      summary: null,
      contentRevision: 3,
      publishedAt: "2026-09-10T00:00:00.000Z",
    },
    totalByteSize: 0,
    assets: [
      {
        id: "asset-1",
        kind: "image",
        position: 0,
        mimeType: "image/png",
        byteSize: 0,
        width: 100,
        height: 100,
        checksumSha256: emptySha256,
        sourcePageNumber: 1,
        text: null,
        downloadPath: "/v1/student/offline/lessons/lesson-1/assets/asset-1?revision=3",
      },
    ],
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
    publishedAt: "2026-09-10T00:00:00.000Z",
    issuedAt: "2026-09-11T00:00:00.000Z",
    leaseExpiresAt: "2026-09-12T00:00:00.000Z",
    authorizationExpiresAt: "2026-09-12T00:00:00.000Z",
    totalByteSize: 10,
    downloadedAtClientMs: Date.parse("2026-09-11T00:00:00.000Z"),
    assets: [],
    ...overrides,
  };
}

describe("protected offline lesson policy", () => {
  it("accepts a canonical revision-bound manifest and rejects tampering", () => {
    expect(() => validateOfflineLessonManifest(manifest())).not.toThrow();

    const invalidPath = manifest();
    invalidPath.assets[0] = {
      ...invalidPath.assets[0],
      downloadPath: "/v1/student/lesson-assets/asset-1/content",
    };
    expect(() => validateOfflineLessonManifest(invalidPath)).toThrowError(
      expect.objectContaining<Partial<OfflineContentError>>({ code: "manifest_invalid" }),
    );

    const duplicate = manifest();
    duplicate.assets = [duplicate.assets[0], duplicate.assets[0]];
    expect(() => validateOfflineLessonManifest(duplicate)).toThrowError(
      expect.objectContaining<Partial<OfflineContentError>>({ code: "manifest_invalid" }),
    );
  });

  it("enforces the explicit per-lesson payload budget", () => {
    const oversized = manifest({
      totalByteSize: OFFLINE_LESSON_PAYLOAD_BUDGET_BYTES + 1,
      assets: [
        {
          ...manifest().assets[0],
          byteSize: OFFLINE_LESSON_PAYLOAD_BUDGET_BYTES + 1,
        },
      ],
    });

    expect(() => validateOfflineLessonManifest(oversized)).toThrowError(
      expect.objectContaining<Partial<OfflineContentError>>({ code: "lesson_budget_exceeded" }),
    );
  });

  it("counts replacement bytes deterministically without double-counting the existing lesson", () => {
    const current = storedPackage({ totalByteSize: 40 });
    const another = storedPackage({
      packageKey: offlineLessonPackageKey("profile-1", "device-1", "lesson-2"),
      lessonId: "lesson-2",
      totalByteSize: 60,
    });

    expect(projectedOfflineScopeUsageBytes([current, another], current.packageKey, 25)).toBe(85);
    expect(projectedOfflineScopeUsageBytes([current, another], "profile-1:device-1:lesson-3", 25)).toBe(125);
    expect(OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES).toBe(256 * 1024 * 1024);
  });

  it("allows protected content only while the same device lease and class authorization are fresh", () => {
    const observedAtClientMs = Date.parse("2026-09-11T00:00:00.000Z");
    const lease = createStoredOfflineLease(
      {
        version: 1,
        profileId: "profile-1",
        deviceId: "device-1",
        issuedAt: "2026-09-11T00:00:00.000Z",
        expiresAt: "2026-09-12T00:00:00.000Z",
        grants: [
          {
            entitlementId: "entitlement-1",
            scope: "class",
            classId: "class-1",
            expiresAt: "2026-09-11T12:00:00.000Z",
          },
        ],
      },
      observedAtClientMs,
    );
    const record = storedPackage({ authorizationExpiresAt: "2026-09-11T10:00:00.000Z" });

    expect(offlineLessonPackageAllowsUse(record, lease, observedAtClientMs + 60 * 60 * 1000)).toBe(true);
    expect(
      offlineLessonPackageAllowsUse(
        { ...record, deviceId: "device-2" },
        lease,
        observedAtClientMs + 60 * 60 * 1000,
      ),
    ).toBe(false);
    expect(offlineLessonPackageAllowsUse(record, lease, observedAtClientMs + 11 * 60 * 60 * 1000)).toBe(false);
  });
});
