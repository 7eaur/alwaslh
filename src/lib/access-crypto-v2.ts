/**
 * access-crypto-v2.ts - تشفير بيانات تفعيل الطالب مرتبط ببصمة الجهاز
 * الهدف: منع نقل ملف التفعيل المحلي إلى جهاز آخر أو التلاعب به.
 *
 * المبدأ:
 * - يُشفَّر النص بمفتاح مشتق من بصمة الجهاز + سر ثابت.
 * - يُرفق توقيع HMAC-like للنص الأصلي + البصمة + السر.
 * - عند فك التشفير على جهاز آخر، يفشل التوقيع حتى لو استطاع مهاجم
 *   استنتاج خوارزمية XOR، لأن المفتاح يعتمد على بصمة الجهاز.
 */

const APP_SECRET = 'waseela-thkia-2026-access-token-secret';

/** اختصار نص بسيط (djb2) */
function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/** توقيع النص + البصمة + السر */
function sign(plainText: string, fingerprint: string): string {
  return hashString(`${APP_SECRET}:${fingerprint}:${plainText}`);
}

/** تمديد المفتاح لتغطية الرسائل الطويلة */
function deriveKey(fingerprint: string): number[] {
  const raw = `${APP_SECRET}:${fingerprint}`;
  // جولات متعددة لتعقيد المفتاح
  let seed = hashString(raw);
  for (let i = 0; i < 100; i++) {
    seed = hashString(seed + APP_SECRET + fingerprint);
  }
  const key: number[] = [];
  for (let i = 0; i < seed.length; i++) {
    key.push(seed.charCodeAt(i) % 256);
  }
  const extended: number[] = [];
  let idx = 0;
  while (extended.length < 4096) {
    extended.push(key[idx % key.length]);
    idx++;
  }
  return extended;
}

/** تشفير نص + توقيع */
export function encryptAccessData(plainText: string, fingerprint: string): string {
  try {
    const key = deriveKey(fingerprint);
    const signature = sign(plainText, fingerprint);
    const payload = `${signature}:${plainText}`;
    let result = '';
    for (let i = 0; i < payload.length; i++) {
      result += String.fromCharCode(payload.charCodeAt(i) ^ key[i % key.length]);
    }
    return btoa(result);
  } catch {
    return '';
  }
}

/** فك تشفير نص والتحقق من التوقيع */
export function decryptAccessData(cipherText: string, fingerprint: string): string | null {
  try {
    const key = deriveKey(fingerprint);
    const decoded = atob(cipherText);
    let payload = '';
    for (let i = 0; i < decoded.length; i++) {
      payload += String.fromCharCode(decoded.charCodeAt(i) ^ key[i % key.length]);
    }
    const sepIndex = payload.indexOf(':');
    if (sepIndex < 0) return null;
    const signature = payload.slice(0, sepIndex);
    const plainText = payload.slice(sepIndex + 1);
    if (sign(plainText, fingerprint) !== signature) return null;
    return plainText;
  } catch {
    return null;
  }
}
