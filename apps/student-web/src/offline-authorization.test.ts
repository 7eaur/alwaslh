import { describe, expect, it } from "vitest";
import {
  canonicalOfflineLessonManifest,
  verifyOfflineLessonAuthorization,
} from "./offline-authorization";
import type {
  StudentOfflineAuthorizationEnvelope,
  StudentOfflineLessonManifest,
} from "./offline-download-api";

const testPrivateKeyPkcs8 =
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgcFP8agEkN7mOfMBTxgqH-cM3tmRnt0hLiCQQSdQW8tChRANCAATYWtQlXSldI67PSP3yjjy88CdYhr0gE1XMFtYHlXEVay6ebCtIhzQP1yVq-pfhAWDV09Gre8SQPbVU12nCkV-U";
const testPublicKeySpki =
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE2FrUJV0pXSOuz0j98o48vPAnWIa9IBNVzBbWB5VxFWsunmwrSIc0D9clavqX4QFg1dPRq3vEkD21VNdpwpFflA";

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

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
      title: "درس موقع",
      summary: "ملخص موقع",
      contentRevision: 4,
      publishedAt: "2026-09-10T00:00:00.000Z",
    },
    totalByteSize: 0,
    assets: [],
  };
}

async function signedEnvelope(value: StudentOfflineLessonManifest): Promise<StudentOfflineAuthorizationEnvelope> {
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    base64UrlToBytes(testPrivateKeyPkcs8),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const publicKeyBytes = base64UrlToBytes(testPublicKeySpki);
  const keyIdBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", publicKeyBytes));
  const keyId = [...keyIdBytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const payloadBytes = new TextEncoder().encode(canonicalOfflineLessonManifest(value));
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, payloadBytes),
  );
  return {
    version: 1,
    algorithm: "ES256",
    keyId,
    payload: bytesToBase64Url(payloadBytes),
    signature: bytesToBase64Url(signature),
  };
}

describe("offline authorization signature", () => {
  it("accepts a server-authentic canonical manifest", async () => {
    const value = manifest();
    const envelope = await signedEnvelope(value);
    await expect(verifyOfflineLessonAuthorization(envelope, value, testPublicKeySpki)).resolves.toEqual(value);
  });

  it("rejects signature tampering before any package can be trusted", async () => {
    const value = manifest();
    const envelope = await signedEnvelope(value);
    const tamperedSignature = base64UrlToBytes(envelope.signature);
    tamperedSignature[0] = (tamperedSignature[0] ?? 0) ^ 1;

    await expect(
      verifyOfflineLessonAuthorization(
        { ...envelope, signature: bytesToBase64Url(tamperedSignature) },
        value,
        testPublicKeySpki,
      ),
    ).rejects.toMatchObject({ code: "signature_invalid" });
  });

  it("rejects a mutable outer manifest that does not match the signed payload", async () => {
    const value = manifest();
    const envelope = await signedEnvelope(value);
    const changed = {
      ...value,
      lesson: { ...value.lesson, title: "عنوان محلي معدل" },
    };

    await expect(
      verifyOfflineLessonAuthorization(envelope, changed, testPublicKeySpki),
    ).rejects.toMatchObject({ code: "manifest_mismatch" });
  });
});
