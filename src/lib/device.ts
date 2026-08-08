declare global {
  interface Window {
    __NATIVE_DEVICE_ID__?: string;
  }
}

/**
 * getDeviceId - إنشاء معرف جهاز بسيط للتتبع والتحليلات
 *
 * المبدأ: في تطبيق الويب/PWA لا يمكن الوصول المباشر إلى Android ID أو
 * identifierForVendor. لذلك نستخدم بصمة الجهاز كمعرف ثابت نسبياً.
 * إذا كان التطبيق مغلفاً بتطبيق أصلي (Capacitor/Cordova/TWA)، يمكن حقن
 * المعرف الأصلي عبر window.__NATIVE_DEVICE_ID__ وسنستخدمه تلقائياً.
 *
 * المعرف يُستخدم للتحليلات/السجلات والاستعادة التلقائية بعد مسح الكاش.
 */

export const getDeviceId = (): string => {
  try {
    // أولوية للمعرف الأصلي المحقون من التطبيق الأصلي (Android ID / identifierForVendor)
    if (typeof window !== 'undefined' && window.__NATIVE_DEVICE_ID__) {
      return window.__NATIVE_DEVICE_ID__;
    }

    let id = localStorage.getItem('device_id_v2');
    if (id) return id;

    // إنشاء معرف عشوائي بسيط إذا لم يكن موجوداً
    id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('device_id_v2', id);
    return id;
  } catch {
    // fallback إذا localStorage غير متاح (incognito/private mode)
    return 'anonymous_device';
  }
};

/**
 * إنشاء بصمة جهاز مستقرة نسبياً من خصائص المتصفح.
 * تبقى ثابتة بعد مسح localStorage لأنها لا تعتمد عليه، لكنها تتغير
 * عند تحديث المتصفح أو تغيير إعدادات الجهاز.
 * تُستخدم كمساعد لاستعادة الوصول من السيرفر بعد مسح البيانات.
 */
/**
 * بصمة الجهاز القابلة للتوافق مع النسخ السابقة.
 * كانت تُستخدم قبل v707؛ نحتفظ بها للاستعلام المؤقت في قاعدة البيانات
 * حتى لا يُفقد الوصول للأجهزة المفعلة سابقاً بعد التحديث الأمني.
 */
export const getLegacyDeviceFingerprint = (): string => {
  try {
    const components = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      navigator.hardwareConcurrency,
      navigator.platform,
      navigator.maxTouchPoints,
      (navigator as any).deviceMemory,
      new Date().getTimezoneOffset()
    ].filter(v => v !== undefined && v !== null);
    const raw = components.join('|');
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) + hash) + raw.charCodeAt(i);
    }
    return 'fp_' + (hash >>> 0).toString(36);
  } catch {
    return 'fp_unknown';
  }
};

/** تجزئة نص باستخدام djb2 */
function djb2Hash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/** بصمة Canvas لمزيد من التفرّد */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    canvas.width = 240;
    canvas.height = 60;
    ctx.textBaseline = 'top';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00a09d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f';
    ctx.fillText('Waseela 2026', 8, 8);
    ctx.fillStyle = '#0ff';
    ctx.fillText('بصمة جهاز', 8, 28);
    // رسم خط منحنٍ
    ctx.strokeStyle = '#f80';
    ctx.beginPath();
    ctx.moveTo(120, 10);
    ctx.bezierCurveTo(180, 10, 160, 50, 220, 50);
    ctx.stroke();
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/** معلومات WebGL */
function getWebglInfo(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';
    const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}|${renderer}`;
  } catch {
    return '';
  }
}

/**
 * إنشاء بصمة جهاز قوية باستخدام أكبر قدر من المعلومات المتاحة.
 * - لا تعتمد على localStorage.
 * - تبقى ثابتة بعد حذف التطبيق وإعادة تثبيته بنفس المتصفح/نفس الجهاز.
 * - تختلف بشكل كبير بين جهازين متطابقين المواصفات لأنها تتضمن Canvas/WebGL.
 */
export const getDeviceFingerprint = (): string => {
  try {
    const uaData = (navigator as any).userAgentData;
    const components = [
      navigator.userAgent,
      (navigator as any).userAgentData?.brands?.map((b: any) => `${b.brand}:${b.version}`).join(',') || '',
      uaData?.platform || navigator.platform,
      uaData?.mobile != null ? String(uaData.mobile) : '',
      screen.width + 'x' + screen.height,
      screen.availWidth + 'x' + screen.availHeight,
      screen.colorDepth,
      (screen as any).pixelDepth,
      window.devicePixelRatio,
      navigator.hardwareConcurrency,
      (navigator as any).deviceMemory,
      navigator.maxTouchPoints,
      navigator.language,
      (navigator as any).languages?.join(','),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset(),
      getCanvasFingerprint(),
      getWebglInfo(),
      typeof window.WebGLRenderingContext !== 'undefined',
      typeof window.OfflineAudioContext !== 'undefined',
      'ontouchstart' in window
    ].filter(v => v !== undefined && v !== null && v !== false && v !== '');
    return 'fp2_' + djb2Hash(components.join('###'));
  } catch {
    return getLegacyDeviceFingerprint();
  }
};

/**
 * بصمة جهاز مستقرة للتفعيل.
 * لا تستخدم Canvas/WebGL لأنهما يتغيران بين الجلسات في بعض المتصفحات/الويب فيو،
 * مما يؤدي إلى فقدان تفعيل الطالب بعد إغلاق التطبيق.
 */
export const getStableDeviceFingerprint = (): string => {
  try {
    const uaData = (navigator as any).userAgentData;
    const components = [
      navigator.userAgent,
      uaData?.brands?.map((b: any) => `${b.brand}:${b.version}`).join(',') || '',
      uaData?.platform || navigator.platform,
      uaData?.mobile != null ? String(uaData.mobile) : '',
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      navigator.hardwareConcurrency,
      (navigator as any).deviceMemory,
      navigator.maxTouchPoints,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset()
    ].filter(v => v !== undefined && v !== null && v !== false && v !== '');
    return 'stable_' + djb2Hash(components.join('###'));
  } catch {
    return getLegacyDeviceFingerprint();
  }
};

/**
 * توقيع جهاز مستقر بناءً على خصائص الجهاز الصلبة (بدون userAgent).
 * يستخدم لربط كود التفعيل بالجهاز المادي، ويسمح بإعادة الدخول بعد حذف التطبيق
 * على نفس الجهاز، ويمنع استخدام الكود على جهاز آخر.
 */
function computeDeviceSignature(w: number, h: number): string {
  try {
    const uaData = (navigator as any).userAgentData;
    const components = [
      uaData?.platform || navigator.platform,
      uaData?.mobile != null ? String(uaData.mobile) : '',
      `${w}x${h}`,
      screen.colorDepth,
      (screen as any).pixelDepth,
      window.devicePixelRatio,
      navigator.hardwareConcurrency,
      (navigator as any).deviceMemory,
      navigator.maxTouchPoints,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset()
    ].filter(v => v !== undefined && v !== null && v !== false && v !== '');
    return 'sig_' + djb2Hash(components.join('###'));
  } catch {
    return 'unknown';
  }
}

export const getDeviceSignature = (): string => {
  try {
    if (typeof window === 'undefined') return 'unknown';
    // استخدام أبعاد ثابته غير متأثرة باتجاه الشاشة (portrait/landscape)
    const w = screen.width || 0;
    const h = screen.height || 0;
    return computeDeviceSignature(Math.min(w, h), Math.max(w, h));
  } catch {
    return 'unknown';
  }
};

/**
 * التوقيع القديم المعتمد على اتجاه الشاشة (للتوافق مع الحسابات المسجلة سابقاً).
 * نحسب التوقيعين (الحالي والمقلوب) للبحث عن التطابق في السيرفر.
 */
export const getLegacyDeviceSignatures = (): string[] => {
  try {
    if (typeof window === 'undefined') return [];
    const w = screen.width || 0;
    const h = screen.height || 0;
    const current = computeDeviceSignature(w, h);
    const swapped = computeDeviceSignature(h, w);
    return [current, swapped].filter((v, i, a) => a.indexOf(v) === i);
  } catch {
    return [];
  }
};

/**
 * معرف الجهاز المستخدم للتفعيل:
 * - يفضل المعرف الأصلي (Android ID / identifierForVendor) المحقون من التطبيق الأصلي.
 * - في الويب/PWA نستخدم بصمة الجهاز المستقرة (لا تعتمد على Canvas/WebGL)
 *   لضمان عدم فقدان التفعيل بعد إعادة فتح التطبيق.
 */
export const getActivationDeviceId = (): string => {
  if (typeof window !== 'undefined' && window.__NATIVE_DEVICE_ID__) {
    return window.__NATIVE_DEVICE_ID__;
  }
  return getStableDeviceFingerprint();
};

/**
 * معرّف الطالب المستخدم لربط الملاحظات والمحفوظات والاختبارات.
 * يفضّل كود الوصول الكامل (يستمر حتى بعد مسح الكاش عند استرجاع الوصول)
 * ثم يعود إلى بصمة الجهاز إذا لم يكن الكود متاحاً محلياً.
 */
export const getStudentIdentifier = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('active_user_id');
      if (userId) return userId;
      const accessCode = localStorage.getItem('active_access_code');
      if (accessCode) return accessCode;
    }
  } catch { /* تجاهل */ }
  return getActivationDeviceId();
};
