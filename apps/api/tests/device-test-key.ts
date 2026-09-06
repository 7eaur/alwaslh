import { generateKeyPairSync, sign } from "node:crypto";
import { deviceProofMessage, type DeviceProofPurpose } from "../src/auth/device-crypto.js";

export interface TestDeviceKey {
  publicKeySpki: string;
  signChallenge(purpose: DeviceProofPurpose, token: string): string;
}

export function createTestDeviceKey(): TestDeviceKey {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const publicKeySpki = publicKey.export({ format: "der", type: "spki" }).toString("base64url");
  return {
    publicKeySpki,
    signChallenge(purpose, token) {
      return sign(
        "sha256",
        Buffer.from(deviceProofMessage(purpose, token), "utf8"),
        { key: privateKey, dsaEncoding: "ieee-p1363" },
      ).toString("base64url");
    },
  };
}
