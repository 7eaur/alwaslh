export type DeviceProofPurpose =
  | "activation"
  | "login"
  | "password_change"
  | "device_rebind"
  | "password_change_rebind";

export interface StoredDeviceKey {
  accountIdentifier: string;
  privateKey: CryptoKey;
  publicKeySpki: string;
  createdAt: string;
}

const DB_NAME = "alwaslh-student-device";
const DB_VERSION = 1;
const STORE_NAME = "device-keys";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function openDeviceDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "accountIdentifier" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("device_database_open_failed"));
  });
}

async function readDeviceKey(accountIdentifier: string): Promise<StoredDeviceKey | undefined> {
  const db = await openDeviceDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(accountIdentifier);
      request.onsuccess = () => resolve(request.result as StoredDeviceKey | undefined);
      request.onerror = () => reject(request.error ?? new Error("device_key_read_failed"));
    });
  } finally {
    db.close();
  }
}

async function writeDeviceKey(record: StoredDeviceKey): Promise<void> {
  const db = await openDeviceDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("device_key_write_failed"));
      transaction.onabort = () => reject(transaction.error ?? new Error("device_key_write_aborted"));
    });
  } finally {
    db.close();
  }
}

async function generateKeyRecord(accountIdentifier: string): Promise<StoredDeviceKey> {
  if (!globalThis.crypto?.subtle) throw new Error("device_crypto_unavailable");

  const pair = (await globalThis.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign", "verify"],
  )) as CryptoKeyPair;
  const publicSpki = await globalThis.crypto.subtle.exportKey("spki", pair.publicKey);
  const record: StoredDeviceKey = {
    accountIdentifier,
    privateKey: pair.privateKey,
    publicKeySpki: bytesToBase64Url(new Uint8Array(publicSpki)),
    createdAt: new Date().toISOString(),
  };
  await writeDeviceKey(record);
  return record;
}

export async function ensureDeviceKey(accountIdentifier: string): Promise<StoredDeviceKey> {
  const existing = await readDeviceKey(accountIdentifier);
  return existing ?? generateKeyRecord(accountIdentifier);
}

export async function requireDeviceKey(accountIdentifier: string): Promise<StoredDeviceKey> {
  const existing = await readDeviceKey(accountIdentifier);
  if (!existing) throw new Error("device_key_missing");
  return existing;
}

export async function rotateDeviceKey(accountIdentifier: string): Promise<StoredDeviceKey> {
  return generateKeyRecord(accountIdentifier);
}

export function deviceProofMessage(purpose: DeviceProofPurpose, token: string): string {
  return `alwaslh-device-v1:${purpose}:${token}`;
}

export async function signDeviceProof(
  key: StoredDeviceKey,
  purpose: DeviceProofPurpose,
  token: string,
): Promise<string> {
  const signature = await globalThis.crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key.privateKey,
    new TextEncoder().encode(deviceProofMessage(purpose, token)),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}
