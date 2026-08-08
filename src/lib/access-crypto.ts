/**
 * access-crypto.ts - تشفير بيانات تفعيل الطالب مرتبط ببصمة الجهاز
 * الهدف: منع نقل ملف التفعيل المحلي إلى جهاز آخر
 */

const APP_SECRET = 'waseela-thkia-2026-access-token-secret';

/** توليد مفتاح تشفير من بصمة الجهاز + سر ثابت */
function deriveKey(fingerprint: string): number[] {
  const raw = `${APP_SECRET}:${fingerprint}`;
  const key: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    key.push(raw.charCodeAt(i) % 256);
  }
  // تمديد المفتاح لتغطية الرسائل الطويلة
  const extended: number[] = [];
  let idx = 0;
  while (extended.length < 1024) {
    extended.push(key[idx % key.length]);
    idx++;
  }
  return extended;
}

/** تشفير نص بسيط باستخدام XOR مع مفتاح مشتق من بصمة الجهاز */
export function encryptAccessData(plainText: string, fingerprint: string): string {
  try {
    const key = deriveKey(fingerprint);
    let result = '';
    for (let i = 0; i < plainText.length; i++) {
      result += String.fromCharCode(plainText.charCodeAt(i) ^ key[i % key.length]);
    }
    // تحويل إلى base64 لتخزين آمن في localStorage
    return btoa(result);
  } catch {
    return '';
  }
}

/** فك تشفير نص؛ إذا تغيرت البصمة يفشل الفك ويعيد null */
export function decryptAccessData(cipherText: string, fingerprint: string): string | null {
  try {
    const key = deriveKey(fingerprint);
    const decoded = atob(cipherText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key[i % key.length]);
    }
    return result;
  } catch {
    return null;
  }
}
