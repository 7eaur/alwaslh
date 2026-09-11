import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.js";
import type { StudentOfflineLessonManifest } from "../src/offline/download.js";
import {
  canonicalOfflineLessonManifest,
  createOfflineAuthorizationSigner,
  TEST_OFFLINE_AUTH_KEY_ID,
  TEST_OFFLINE_AUTH_PUBLIC_KEY_SPKI,
  verifyOfflineAuthorizationEnvelope,
} from "../src/offline/signing.js";

function manifest(): StudentOfflineLessonManifest {
  return {
    version: 1,
    profileId: "profile-1",
    deviceId: "device-1",
    issuedAt: "2026-09-11T00:00:00.000Z",
    leaseExpiresAt: "2026-09-12T00:00:00.000Z",
    authorizationExpiresAt: "2026-09-11T12:00:00.000Z",
    lesson: {
      id: "lesson-1",
      classId: "class-1",
      title: "Signed lesson",
      summary: null,
      contentRevision: 2,
      publishedAt: "2026-09-10T00:00:00.000Z",
    },
    totalByteSize: 0,
    assets: [],
  };
}

test("offline authorization signer is test-only by default and emits verifiable canonical ES256", () => {
  const testConfig = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://localhost/alwaslh-test",
  });
  const signer = createOfflineAuthorizationSigner(testConfig);
  assert.ok(signer);
  assert.equal(signer.keyId, TEST_OFFLINE_AUTH_KEY_ID);
  assert.equal(signer.publicKeySpki, TEST_OFFLINE_AUTH_PUBLIC_KEY_SPKI);

  const value = manifest();
  const envelope = signer.signManifest(value);
  assert.equal(verifyOfflineAuthorizationEnvelope(TEST_OFFLINE_AUTH_PUBLIC_KEY_SPKI, envelope), true);
  assert.equal(
    Buffer.from(envelope.payload, "base64url").toString("utf8"),
    canonicalOfflineLessonManifest(value),
  );

  const tamperedPayload = Buffer.from(
    canonicalOfflineLessonManifest({ ...value, lesson: { ...value.lesson, title: "tampered" } }),
    "utf8",
  ).toString("base64url");
  assert.equal(
    verifyOfflineAuthorizationEnvelope(TEST_OFFLINE_AUTH_PUBLIC_KEY_SPKI, {
      ...envelope,
      payload: tamperedPayload,
    }),
    false,
  );
});

test("production and development never fall back to the public test signing key", () => {
  for (const nodeEnv of ["development", "production"] as const) {
    const config = loadConfig({
      NODE_ENV: nodeEnv,
      DATABASE_URL: "postgresql://localhost/alwaslh-test",
    });
    assert.equal(createOfflineAuthorizationSigner(config), null);
  }
});
