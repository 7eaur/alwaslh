// Simple in-memory cache for admin data
// يحفظ البيانات في الذاكرة لتسريع التحميل

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * حفظ بيانات في الكاش
   */
  set<T>(key: string, data: T, ttlMinutes: number = 10): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
    console.log(`💾 تم حفظ ${key} في الكاش لمدة ${ttlMinutes} دقيقة`);
  }

  /**
   * جلب بيانات من الكاش
   * يرجع null إذا كانت البيانات منتهية الصلاحية أو غير موجودة
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`❌ ${key} غير موجود في الكاش`);
      return null;
    }

    const age = Date.now() - entry.timestamp;
    
    if (age > entry.ttl) {
      console.log(`⏰ ${key} منتهي الصلاحية (${Math.round(age / 1000)}s)`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ تم جلب ${key} من الكاش (عمر: ${Math.round(age / 1000)}s)`);
    return entry.data as T;
  }

  /**
   * حذف بيانات من الكاش
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ تم حذف ${key} من الكاش`);
  }

  /**
   * مسح الكاش بالكامل
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 تم مسح الكاش بالكامل');
  }

  /**
   * الحصول على حجم الكاش
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * جلب أو تحميل البيانات
   * إذا كانت البيانات موجودة في الكاش، يرجعها
   * وإلا يستدعي fetchFn ويحفظ النتيجة
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMinutes: number = 10
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    console.log(`🔄 جاري تحميل ${key} من API...`);
    const data = await fetchFn();
    this.set(key, data, ttlMinutes);
    return data;
  }
}

// Singleton instance
export const simpleCache = new SimpleCache();
