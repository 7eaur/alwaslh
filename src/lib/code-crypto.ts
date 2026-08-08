/**
 * أداة بسيطة للتحقق من أكواد التفعيل بدون نقل الكود نصياً إلى الخادم
 * أو تخزينه نصياً في التطبيق.
 *
 * ملاحظة أمان: التطبيقات الويب لا يمكنها إخفاء أسرارها بشكل كامل عن
 * مستخدم مصمم. لكن التجزئة (hashing) تمنع قراءة الأكواد مباشرة وتجعل
 * استخراجها يتطلب عكس دالة التجزئة أو هجوم brute-force.
 */

const ENCRYPTION_KEY_B64 = 'b3Vzc2VtYS1hbC13YXNlZWxhaC1zZWNyZXQta2V5LTIwMjY=';

async function getKey(): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(ENCRYPTION_KEY_B64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.trim());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function encryptCodeHashes(hashes: string[]): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(hashes))
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptCodeHashes(payload: string): Promise<string[]> {
  try {
    const key = await getKey();
    const combined = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch {
    return [];
  }
}
