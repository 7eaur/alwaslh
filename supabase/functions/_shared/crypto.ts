/**
 * مساعدو التشفير للمصادقة باستخدام AES-GCM.
 * يستخدم Web Crypto API المتاح في Deno.
 */

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function getAesKey(): Promise<CryptoKey> {
  const rawKey = Deno.env.get("PASSWORD_ENCRYPTION_KEY");
  if (!rawKey) throw new Error("PASSWORD_ENCRYPTION_KEY not configured");

  const encoder = new TextEncoder();
  const keyData = encoder.encode(rawKey);
  const hash = await crypto.subtle.digest("SHA-256", keyData);
  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPassword(password: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getAesKey();
  const encoder = new TextEncoder();
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(password),
  );
  const payload = {
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(cipher),
  };
  return JSON.stringify(payload);
}

export async function decryptPassword(encryptedPayload: string): Promise<string> {
  const payload = JSON.parse(encryptedPayload);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);
  const key = await getAesKey();
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plain);
}
