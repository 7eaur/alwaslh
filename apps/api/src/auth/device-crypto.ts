import { createHash, createPublicKey, verify } from "node:crypto";
import { AppError } from "../errors.js";

export type DeviceProofPurpose =
  | "activation"
  | "login"
  | "password_change"
  | "device_rebind"
  | "password_change_rebind";

export interface ValidatedDevicePublicKey {
  publicKeySpki: string;
  fingerprintSha256: string;
}

export function deviceProofMessage(purpose: DeviceProofPurpose, token: string): string {
  return `alwaslh-device-v1:${purpose}:${token}`;
}

function decodeBase64Url(value: string, code: string): Buffer {
  if (!value || value.length > 8192 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new AppError("BAD_REQUEST", code, 400);
  }
  try {
    return Buffer.from(value, "base64url");
  } catch {
    throw new AppError("BAD_REQUEST", code, 400);
  }
}

export function validateDevicePublicKey(publicKeySpki: string): ValidatedDevicePublicKey {
  const der = decodeBase64Url(publicKeySpki, "مفتاح الجهاز العام غير صالح");
  if (der.length < 64 || der.length > 1024) {
    throw new AppError("BAD_REQUEST", "مفتاح الجهاز العام غير صالح", 400);
  }

  try {
    const key = createPublicKey({ key: der, format: "der", type: "spki" });
    const namedCurve = key.asymmetricKeyDetails?.namedCurve;
    if (key.asymmetricKeyType !== "ec" || namedCurve !== "prime256v1") {
      throw new AppError("BAD_REQUEST", "يلزم مفتاح جهاز ECDSA P-256", 400);
    }
    const canonical = key.export({ format: "der", type: "spki" });
    const canonicalBuffer = Buffer.isBuffer(canonical) ? canonical : Buffer.from(canonical);
    return {
      publicKeySpki: canonicalBuffer.toString("base64url"),
      fingerprintSha256: createHash("sha256").update(canonicalBuffer).digest("hex"),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("BAD_REQUEST", "مفتاح الجهاز العام غير صالح", 400);
  }
}

export function assertDeviceProof(
  publicKeySpki: string,
  purpose: DeviceProofPurpose,
  token: string,
  signature: string,
): ValidatedDevicePublicKey {
  const validated = validateDevicePublicKey(publicKeySpki);
  const signatureBytes = decodeBase64Url(signature, "توقيع الجهاز غير صالح");
  if (signatureBytes.length !== 64) {
    throw new AppError("UNAUTHORIZED", "تعذر التحقق من الجهاز المسجل", 401);
  }

  try {
    const key = createPublicKey({
      key: Buffer.from(validated.publicKeySpki, "base64url"),
      format: "der",
      type: "spki",
    });
    const valid = verify(
      "sha256",
      Buffer.from(deviceProofMessage(purpose, token), "utf8"),
      { key, dsaEncoding: "ieee-p1363" },
      signatureBytes,
    );
    if (!valid) throw new AppError("UNAUTHORIZED", "تعذر التحقق من الجهاز المسجل", 401);
    return validated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("UNAUTHORIZED", "تعذر التحقق من الجهاز المسجل", 401);
  }
}
