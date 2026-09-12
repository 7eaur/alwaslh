import type {
  StudentOfflineAuthorizationEnvelope,
  StudentOfflineLessonManifest,
} from "./offline-download-api";

export type OfflineAuthorizationErrorCode =
  | "verification_key_unavailable"
  | "verification_key_mismatch"
  | "authorization_invalid"
  | "signature_invalid"
  | "signed_payload_invalid"
  | "manifest_mismatch";

export class OfflineAuthorizationError extends Error {
  constructor(readonly code: OfflineAuthorizationErrorCode) {
    super(code);
    this.name = "OfflineAuthorizationError";
  }
}

const configuredVerificationKey =
  (import.meta.env.VITE_OFFLINE_AUTH_PUBLIC_KEY_SPKI as string | undefined)?.trim() ?? "";

function base64UrlToBytes(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new OfflineAuthorizationError("authorization_invalid");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  let binary: string;
  try {
    binary = atob(padded);
  } catch {
    throw new OfflineAuthorizationError("authorization_invalid");
  }
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function ownedArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function canonicalOfflineLessonManifest(manifest: StudentOfflineLessonManifest): string {
  return JSON.stringify({
    version: manifest.version,
    profileId: manifest.profileId,
    deviceId: manifest.deviceId,
    issuedAt: manifest.issuedAt,
    leaseExpiresAt: manifest.leaseExpiresAt,
    authorizationExpiresAt: manifest.authorizationExpiresAt,
    lesson: {
      id: manifest.lesson.id,
      classId: manifest.lesson.classId,
      title: manifest.lesson.title,
      summary: manifest.lesson.summary,
      contentRevision: manifest.lesson.contentRevision,
      publishedAt: manifest.lesson.publishedAt,
    },
    totalByteSize: manifest.totalByteSize,
    assets: manifest.assets.map((asset) => ({
      id: asset.id,
      kind: asset.kind,
      position: asset.position,
      mimeType: asset.mimeType,
      byteSize: asset.byteSize,
      width: asset.width,
      height: asset.height,
      checksumSha256: asset.checksumSha256,
      sourcePageNumber: asset.sourcePageNumber,
      text: asset.text,
      downloadPath: asset.downloadPath,
    })),
  });
}

function parsedManifest(value: unknown): StudentOfflineLessonManifest {
  if (!value || typeof value !== "object") {
    throw new OfflineAuthorizationError("signed_payload_invalid");
  }
  return value as StudentOfflineLessonManifest;
}

export async function verifyOfflineLessonAuthorization(
  envelope: StudentOfflineAuthorizationEnvelope,
  outerManifest: StudentOfflineLessonManifest,
  verificationKeySpki = configuredVerificationKey,
): Promise<StudentOfflineLessonManifest> {
  if (!globalThis.crypto?.subtle) throw new OfflineAuthorizationError("authorization_invalid");
  if (!verificationKeySpki) throw new OfflineAuthorizationError("verification_key_unavailable");
  if (
    !envelope ||
    envelope.version !== 1 ||
    envelope.algorithm !== "ES256" ||
    !/^[0-9a-f]{64}$/.test(envelope.keyId) ||
    typeof envelope.payload !== "string" ||
    typeof envelope.signature !== "string"
  ) {
    throw new OfflineAuthorizationError("authorization_invalid");
  }

  const publicKeyBytes = base64UrlToBytes(verificationKeySpki);
  const actualKeyId = bytesToHex(
    new Uint8Array(
      await globalThis.crypto.subtle.digest("SHA-256", ownedArrayBuffer(publicKeyBytes)),
    ),
  );
  if (actualKeyId !== envelope.keyId) {
    throw new OfflineAuthorizationError("verification_key_mismatch");
  }

  let publicKey: CryptoKey;
  try {
    publicKey = await globalThis.crypto.subtle.importKey(
      "spki",
      ownedArrayBuffer(publicKeyBytes),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
  } catch {
    throw new OfflineAuthorizationError("authorization_invalid");
  }

  const payloadBytes = base64UrlToBytes(envelope.payload);
  const signatureBytes = base64UrlToBytes(envelope.signature);
  if (signatureBytes.byteLength !== 64) throw new OfflineAuthorizationError("authorization_invalid");

  const verified = await globalThis.crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicKey,
    ownedArrayBuffer(signatureBytes),
    ownedArrayBuffer(payloadBytes),
  );
  if (!verified) throw new OfflineAuthorizationError("signature_invalid");

  let signedManifest: StudentOfflineLessonManifest;
  let payloadText: string;
  try {
    payloadText = new TextDecoder("utf-8", { fatal: true }).decode(payloadBytes);
    signedManifest = parsedManifest(JSON.parse(payloadText) as unknown);
  } catch (error) {
    if (error instanceof OfflineAuthorizationError) throw error;
    throw new OfflineAuthorizationError("signed_payload_invalid");
  }

  let canonicalSigned: string;
  let canonicalOuter: string;
  try {
    canonicalSigned = canonicalOfflineLessonManifest(signedManifest);
    canonicalOuter = canonicalOfflineLessonManifest(outerManifest);
  } catch {
    throw new OfflineAuthorizationError("signed_payload_invalid");
  }
  if (payloadText !== canonicalSigned) throw new OfflineAuthorizationError("signed_payload_invalid");
  if (canonicalOuter !== canonicalSigned) throw new OfflineAuthorizationError("manifest_mismatch");

  return signedManifest;
}
