import {
  createHash,
  createPrivateKey,
  createPublicKey,
  type KeyObject,
  sign as nodeSign,
  verify as nodeVerify,
} from "node:crypto";
import type { AppConfig } from "../config.js";
import type { StudentOfflineLessonManifest } from "./download.js";

const TEST_OFFLINE_AUTH_PRIVATE_KEY_PEM_B64 =
  "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JR0hBZ0VBTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEJHMHdhd0lCQVFRZ2NGUDhhZ0VrTjdtT2ZNQlQKeGdxSCtjTTN0bVJudDBoTGlDUVFTZFFXOHRDaFJBTkNBQVRZV3RRbFhTbGRJNjdQU1AzeWpqeTg4Q2RZaHIwZwpFMVhNRnRZSGxYRVZheTZlYkN0SWh6UVAxeVZxK3BmaEFXRFYwOUdyZThTUVBiVlUxMm5Da1YrVQotLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tCg==";

export const TEST_OFFLINE_AUTH_PUBLIC_KEY_SPKI =
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE2FrUJV0pXSOuz0j98o48vPAnWIa9IBNVzBbWB5VxFWsunmwrSIc0D9clavqX4QFg1dPRq3vEkD21VNdpwpFflA";

export const TEST_OFFLINE_AUTH_KEY_ID = "74c59568f7f704fa20017ef844ad3d31a76701afa83dcd73e33e85fa482bd266";

export interface StudentOfflineAuthorizationEnvelope {
  version: 1;
  algorithm: "ES256";
  keyId: string;
  payload: string;
  signature: string;
}

function assertP256Key(key: KeyObject): void {
  if (key.asymmetricKeyType !== "ec" || key.asymmetricKeyDetails?.namedCurve !== "prime256v1") {
    throw new Error("OFFLINE_AUTH_SIGNING_PRIVATE_KEY_PEM_B64 must contain an EC P-256 private key");
  }
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

export class OfflineAuthorizationSigner {
  readonly keyId: string;
  readonly publicKeySpki: string;
  private readonly privateKey: KeyObject;
  private readonly publicKey: KeyObject;

  constructor(privateKeyPem: string) {
    this.privateKey = createPrivateKey(privateKeyPem);
    assertP256Key(this.privateKey);
    this.publicKey = createPublicKey(this.privateKey);
    assertP256Key(this.publicKey);
    const spki = this.publicKey.export({ format: "der", type: "spki" });
    this.publicKeySpki = spki.toString("base64url");
    this.keyId = createHash("sha256").update(spki).digest("hex");
  }

  signManifest(manifest: StudentOfflineLessonManifest): StudentOfflineAuthorizationEnvelope {
    const payload = Buffer.from(canonicalOfflineLessonManifest(manifest), "utf8");
    const signature = nodeSign("sha256", payload, {
      key: this.privateKey,
      dsaEncoding: "ieee-p1363",
    });
    if (signature.byteLength !== 64) throw new Error("offline_authorization_signature_invalid");
    return {
      version: 1,
      algorithm: "ES256",
      keyId: this.keyId,
      payload: payload.toString("base64url"),
      signature: signature.toString("base64url"),
    };
  }
}

export function createOfflineAuthorizationSigner(config: AppConfig): OfflineAuthorizationSigner | null {
  const encodedPrivateKey =
    config.OFFLINE_AUTH_SIGNING_PRIVATE_KEY_PEM_B64 ??
    (config.NODE_ENV === "test" ? TEST_OFFLINE_AUTH_PRIVATE_KEY_PEM_B64 : undefined);
  if (!encodedPrivateKey) return null;

  let privateKeyPem: string;
  try {
    privateKeyPem = Buffer.from(encodedPrivateKey, "base64").toString("utf8");
  } catch {
    throw new Error("OFFLINE_AUTH_SIGNING_PRIVATE_KEY_PEM_B64 is not valid base64");
  }
  return new OfflineAuthorizationSigner(privateKeyPem);
}

export function verifyOfflineAuthorizationEnvelope(
  publicKeySpki: string,
  envelope: StudentOfflineAuthorizationEnvelope,
): boolean {
  try {
    const spki = Buffer.from(publicKeySpki, "base64url");
    const keyId = createHash("sha256").update(spki).digest("hex");
    if (keyId !== envelope.keyId || envelope.version !== 1 || envelope.algorithm !== "ES256") {
      return false;
    }
    const publicKey = createPublicKey({ key: spki, format: "der", type: "spki" });
    assertP256Key(publicKey);
    const signature = Buffer.from(envelope.signature, "base64url");
    if (signature.byteLength !== 64) return false;
    return nodeVerify(
      "sha256",
      Buffer.from(envelope.payload, "base64url"),
      {
        key: publicKey,
        dsaEncoding: "ieee-p1363",
      },
      signature,
    );
  } catch {
    return false;
  }
}
