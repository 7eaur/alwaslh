// طبقة Memory Cache فوق IndexedDB لتسريع الوصول للبيانات
// تخزين البيانات المستخدمة بكثرة في الذاكرة لتجنب الوصول المتكرر لـ IndexedDB

import { Lesson, Subject, Class, Quiz, QuizQuestion } from '@/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 دقائق

  constructor() {
    this.cache = new Map();
  }

  // حفظ البيانات في الذاكرة
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // جلب البيانات من الذاكرة
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // التحقق من انتهاء الصلاحية
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // حذف من الذاكرة
  delete(key: string): void {
    this.cache.delete(key);
  }

  // مسح جميع المفاتيح التي تبدأ بـ prefix معين
  clearByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // مسح الذاكرة بالكامل
  clear(): void {
    this.cache.clear();
  }

  // مسح البيانات المنتهية الصلاحية
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // الحصول على حجم الذاكرة المستخدمة
  size(): number {
    return this.cache.size;
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const memoryCache = new MemoryCache();

// تنظيف الذاكرة كل 10 دقائق
setInterval(() => {
  memoryCache.cleanup();
}, 10 * 60 * 1000);

// دوال مساعدة للوصول السريع للبيانات الشائعة
export const cacheKeys = {
  classes: 'classes_all',
  subjects: (classId: string) => `subjects_${classId}`,
  lessons: (subjectId: string) => `lessons_${subjectId}`,
  lessonsAll: 'lessons_all',
  lesson: (lessonId: string) => `lesson_${lessonId}`,
  quiz: (quizId: string) => `quiz_${quizId}`,
  questions: (lessonId: string) => `questions_${lessonId}`,
};
