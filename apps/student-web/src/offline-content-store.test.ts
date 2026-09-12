import { describe, expect, it } from "vitest";
import { canonicalOfflineLessonManifest } from "./offline-authorization";
import type {
  StudentOfflineLessonAssetManifest,
  StudentOfflineLessonManifest,
} from "./offline-download-api";
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

function asset(overrides: Partial<StudentOfflineLessonAssetManifest> = {}): StudentOfflineLessonAssetManifest {
  return {
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
    ...overrides,
  };
}

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
    assets: [asset()],
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
    authorization: {
      version: 1,
      algorithm: "ES256",
      keyId: "a".repeat(64),
      payload: "eyJ0ZXN0Ijp0cnVlfQ",
      signature: "AA",
    },
    totalByteSize: 10,
    downloadedAtClientMs: Date.parse("2026-09-11T00:00:00.000Z"),
    assets: [],
    ...overrides,
  };
}

describe("protected offline lesson policy", () => {
  it("accepts a canonical revision-bound manifest and rejects tampering", () => {
    expect(() => validateOfflineLessonManifest(manifest())).not.toThrow();

    const invalidPath = manifest({
      assets: [asset({ downloadPath: "/v1/student/lesson-assets/asset-1/content" })],
    });
    expect(() => validateOfflineLessonManifest(invalidPath)).toThrowError(
      expect.objectContaining<Partial<OfflineContentError>>({ code: "manifest_invalid" }),
    );

    const duplicate = manifest({ assets: [asset(), asset()] });
    expect(() => validateOfflineLessonManifest(duplicate)).toThrowError(
      expect.objectContaining<Partial<OfflineContentError>>({ code: "manifest_invalid" }),
    );
  });

  it("enforces the explicit per-lesson payload budget", () => {
    const oversized = manifest({
      totalByteSize: OFFLINE_LESSON_PAYLOAD_BUDGET_BYTES + 1,
      assets: [asset({ byteSize: OFFLINE_LESSON_PAYLOAD_BUDGET_BYTES + 1 })],
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

  it("allows protected content only while the same device lease and class authorization are fresh", async () => {
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
    const value = manifest({ authorizationExpiresAt: "2026-09-11T10:00:00.000Z" });
    const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const publicBytes = await crypto.subtle.exportKey("spki", pair.publicKey);
    const encode = (buffer: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    const payload = new TextEncoder().encode(canonicalOfflineLessonManifest(value));
    const keyId = [...new Uint8Array(await crypto.subtle.digest("SHA-256", publicBytes))]
      .map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, pair.privateKey, payload);
    const publicKey = encode(publicBytes);
    const record = storedPackage({
      authorizationExpiresAt: value.authorizationExpiresAt,
      totalByteSize: 0,
      assets: [{ ...asset(), blob: new Blob([]) }],
      authorization: { version: 1, algorithm: "ES256", keyId, payload: encode(payload.buffer), signature: encode(signature) },
    });
    const allows = (candidate = record, now = observedAtClientMs + 60 * 60 * 1000) =>
      offlineLessonPackageAllowsUse(candidate, lease, now, publicKey);

    await expect(allows()).resolves.toBe(true);
    await expect(allows({ ...record, deviceId: "device-2" })).resolves.toBe(false);
    await expect(allows(record, observedAtClientMs + 11 * 60 * 60 * 1000)).resolves.toBe(false);
    for (const changed of [
      { title: "tampered" }, { classId: "class-2" }, { summary: "tampered" },
      { contentRevision: 5 }, { publishedAt: "2026-09-09T00:00:00.000Z" },
      { authorizationExpiresAt: "2027-01-01T00:00:00.000Z" },
      { packageKey: "wrong-key" }, { scopeKey: "wrong-scope" },
      { assets: [{ ...record.assets[0]!, text: "tampered" }] },
      { assets: [{ ...record.assets[0]!, blob: new Blob(["tampered"]) }] },
      { authorization: { ...record.authorization, signature: "AA" } },
    ]) await expect(allows({ ...record, ...changed })).resolves.toBe(false);
    await expect(offlineLessonPackageAllowsUse(record, lease, observedAtClientMs, "")).resolves.toBe(false);
    await expect(allows(record, Number.NaN)).resolves.toBe(false);
    await expect(allows(record, observedAtClientMs - 6 * 60 * 1000)).resolves.toBe(false);
    // A modified unsigned lease cannot extend the signed expiry.
    lease.lease.expiresAt = "2027-01-01T00:00:00.000Z";
    lease.lease.issuedAt = "2026-09-10T00:00:00.000Z";
    await expect(allows(record, observedAtClientMs + 11 * 60 * 60 * 1000)).resolves.toBe(false);
  });
});
