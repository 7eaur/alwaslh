/**
 * نظام التخزين المؤقت للعمل بدون إنترنت
 * يحفظ جميع البيانات المحملة في localStorage للوصول إليها لاحقاً بدون إنترنت
 */

const CACHE_PREFIX = 'alwaseela_cache_';
const CACHE_VERSION = 'v1';
// لا نضع انتهاء صلاحية — الكاش دائم حتى تحدّث الشبكة
const CACHE_EXPIRY = 365 * 24 * 60 * 60 * 1000; // سنة كاملة

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * حفظ البيانات في التخزين المؤقت
 */
export function setCache<T>(key: string, data: T): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('فشل حفظ البيانات في التخزين المؤقت:', error);
  }
}

/**
 * استرجاع البيانات من التخزين المؤقت
 */
export function getCache<T>(key: string): T | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // التحقق من صلاحية النسخة
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    // التحقق من انتهاء الصلاحية
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_EXPIRY) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.warn('فشل استرجاع البيانات من التخزين المؤقت:', error);
    return null;
  }
}

/**
 * حذف بيانات من التخزين المؤقت
 */
export function removeCache(key: string): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('فشل حذف البيانات من التخزين المؤقت:', error);
  }
}

/**
 * مسح جميع البيانات المخزنة مؤقتاً
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('فشل مسح التخزين المؤقت:', error);
  }
}

/**
 * التحقق من حالة الاتصال بالإنترنت
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * دالة مساعدة لتنفيذ طلب API مع دعم التخزين المؤقت
 * السلوك:
 *   - متصل بالإنترنت → يجلب من السيرفر ويحدّث الكاش
 *   - غير متصل      → يستخدم الكاش دائماً (بدون انتهاء صلاحية)
 *   - غير متصل + لا يوجد كاش → يرجع مصفوفة فارغة (لا throw)
 */
export async function cachedApiCall<T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  _forceRefresh: boolean = false
): Promise<T> {
  const cached = getCache<T>(cacheKey);

  // إذا كان غير متصل بالإنترنت → استخدم الكاش دائماً
  if (!isOnline()) {
    if (cached !== null) return cached;
    // لا يوجد كاش → أرجع مصفوفة فارغة بصمت (لا throw)
    console.warn(`[OfflineCache] لا يوجد كاش للمفتاح: ${cacheKey} — بدون إنترنت`);
    return (Array.isArray(cached) ? [] : null) as unknown as T;
  }

  // متصل بالإنترنت → اجلب من السيرفر
  try {
    const data = await apiCall();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    // إذا فشل الطلب، استخدم الكاش كبديل طارئ
    if (cached !== null) {
      console.warn('[OfflineCache] فشل الاتصال، عرض آخر بيانات محفوظة:', cacheKey);
      return cached;
    }
    // لا يوجد كاش ولا اتصال → أرجع فارغاً بدلاً من throw
    console.warn('[OfflineCache] لا كاش ولا اتصال للمفتاح:', cacheKey);
    return [] as unknown as T;
  }
}

/**
 * حفظ بيانات الطالب (الملف الشخصي والأكواد)
 */
export function cacheStudentData(profile: any, accessCode: any): void {
  setCache('student_profile', profile);
  setCache('student_access_code', accessCode);
}

/**
 * استرجاع بيانات الطالب المخزنة
 */
export function getCachedStudentData(): { profile: any; accessCode: any } | null {
  const profile = getCache('student_profile');
  const accessCode = getCache('student_access_code');
  
  if (!profile || !accessCode) return null;
  
  return { profile, accessCode };
}

/**
 * مسح بيانات الطالب عند تسجيل الخروج
 */
export function clearStudentCache(): void {
  removeCache('student_profile');
  removeCache('student_access_code');
}

/**
 * تحميل مسبق لجميع البيانات الأساسية للطالب
 * يتم استدعاؤها عند أول دخول بالإنترنت
 */
export async function preloadStudentData(studentApi: any): Promise<void> {
  try {
    console.log('🚀 بدء التحميل المسبق للبيانات...');
    
    // تحميل الصفوف
    const classes = await studentApi.getClasses();
    console.log('✅ تم تحميل الصفوف:', classes.length);
    
    // تحميل جميع المواد لكل صف
    for (const cls of classes) {
      const subjects = await studentApi.getSubjects(cls.id);
      console.log(`✅ تم تحميل مواد الصف ${cls.name}:`, subjects.length);
      
      // تحميل جميع الدروس لكل مادة
      for (const subject of subjects) {
        const lessons = await studentApi.getLessons(subject.id);
        console.log(`✅ تم تحميل دروس ${subject.name}:`, lessons.length);
        
        // تحميل تفاصيل كل درس (اختياري - يمكن تعطيله إذا كان بطيئاً)
        // for (const lesson of lessons.slice(0, 5)) { // أول 5 دروس فقط
        //   await studentApi.getLesson(lesson.id);
        // }
      }
      
      // تحميل الاختبارات لكل مادة
      for (const subject of subjects) {
        await studentApi.getQuizzes(subject.id);
      }
    }
    
    console.log('✅ اكتمل التحميل المسبق لجميع البيانات!');
    localStorage.setItem('data_preloaded', 'true');
    localStorage.setItem('data_preloaded_at', new Date().toISOString());
  } catch (error) {
    console.error('❌ فشل التحميل المسبق:', error);
  }
}

/**
 * التحقق من اكتمال التحميل المسبق
 */
export function isDataPreloaded(): boolean {
  return localStorage.getItem('data_preloaded') === 'true';
}
