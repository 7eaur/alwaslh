import Dexie, { type EntityTable } from 'dexie';
import type { Lesson, QuizQuestion, Quiz, Subject, Class } from '@/types';
import { memoryCache, cacheKeys } from './memory-cache';
import { encryptCodeHashes, decryptCodeHashes, hashCode } from './code-crypto';

// تعريف قاعدة البيانات المحلية
interface OfflineDB extends Dexie {
  lessons: EntityTable<Lesson, 'id'>;
  questions: EntityTable<QuizQuestion, 'id'>;
  quizzes: EntityTable<Quiz, 'id'>;
  subjects: EntityTable<Subject, 'id'>;
  classes: EntityTable<Class, 'id'>;
  progress: EntityTable<{
    id: string;
    lesson_id: string;
    student_code: string;
    last_question_index: number;
    answers: Record<string, any>;
    updated_at: string;
  }, 'id'>;
  savedQuestions: EntityTable<{
    id: string;
    question_id: string;
    student_code: string;
    lesson_id: string;
    saved_at: string;
    synced: boolean;
  }, 'id'>;
  notes: EntityTable<{
    id: string;
    student_code: string;
    lesson_id?: string;
    type: 'text' | 'image' | 'audio' | 'capture' | 'voice_record';
    content: string;
    media_url?: string;
    description?: string;
    created_at: string;
    updated_at?: string;
    synced: boolean;
  }, 'id'>;
  pendingNotes: EntityTable<{
    id: string;
    action: 'create' | 'update' | 'delete';
    payload: string;
    created_at: string;
    retries: number;
  }, 'id'>;
  pendingSavedQuestions: EntityTable<{
    id: string;
    action: 'create' | 'delete';
    payload: string;
    created_at: string;
    retries: number;
  }, 'id'>;
  syncStatus: EntityTable<{
    id: string;
    last_sync: string;
    is_initial_sync_complete: boolean;
  }, 'id'>;
  codeHashes: EntityTable<{
    id: string;
    payload: string;
    updated_at: string;
  }, 'id'>;
  accessBackup: EntityTable<{
    id: string;
    accessType: 'full' | 'subjects' | null;
    fullAccessCode?: string;
    activatedClasses: any[];
    deviceId?: string;
    fingerprint?: string;
    updated_at: string;
  }, 'id'>;
  quizAttempts: EntityTable<{
    id: string;
    student_code: string;
    lesson_id?: string;
    quiz_id?: string;
    score: number;
    total_questions: number;
    questions?: any[];
    user_answers?: number[];
    version_name?: string;
    created_at: string;
  }, 'id'>;
}

// إنشاء قاعدة البيانات
export const db = new Dexie('AlWaseelahDB') as OfflineDB & {
  images: EntityTable<{ url: string; blob: Blob; saved_at: string }, 'url'>;
};

// تعريف الجداول — الترقية التدريجية
db.version(1).stores({
  lessons: 'id, subject_id, title, page_number',
  questions: 'id, lesson_id, quiz_id',
  quizzes: 'id, subject_id, class_id',
  subjects: 'id, name, class_id',
  classes: 'id, name',
  progress: 'id, lesson_id, student_code',
  savedQuestions: 'id, question_id, student_code, lesson_id',
  notes: 'id, student_code, created_at',
  syncStatus: 'id'
});

// الإصدار 2: إضافة جدول الصور
db.version(2).stores({
  images: 'url, saved_at'
});

// الإصدار 3: إضافة جدول تجزئة أكواد التفعيل للعمل أوفلاين
db.version(3).stores({
  codeHashes: 'id, updated_at'
});

// الإصدار 4: إضافة جدول نسخ احتياطي لبيانات الوصول (لاستعادة الوصول بعد مسح الكاش)
db.version(4).stores({
  accessBackup: 'id, updated_at'
});

// الإصدار 5: إضافة جداول المزامنة المؤجلة للملاحظات والأسئلة المحفوظة
db.version(5).stores({
  pendingNotes: 'id, created_at',
  pendingSavedQuestions: 'id, created_at'
}).upgrade((tx) => {
  // تحديث الأعمدة الجديدة في الجداول الموجودة
  const notes = tx.table('notes') as any;
  notes.toCollection().modify((note: any) => {
    if (note.synced === undefined) note.synced = true;
  });
  const saved = tx.table('savedQuestions') as any;
  saved.toCollection().modify((q: any) => {
    if (q.synced === undefined) q.synced = true;
  });
});

// الإصدار 6: إضافة جدول محاولات الاختبارات للعمل أوفلاين
db.version(6).stores({
  quizAttempts: 'id, student_code, created_at'
});

// دالة للتحقق من اكتمال التحميل الأولي
export async function isInitialSyncComplete(): Promise<boolean> {
  const status = await db.syncStatus.get('initial');
  return status?.is_initial_sync_complete || false;
}

// دالة لتحديد اكتمال التحميل الأولي
export async function markInitialSyncComplete(): Promise<void> {
  await db.syncStatus.put({
    id: 'initial',
    last_sync: new Date().toISOString(),
    is_initial_sync_complete: true
  });
}

// الحصول على وقت آخر مزامنة
export async function getLastSyncTime(): Promise<string | null> {
  const status = await db.syncStatus.get('initial');
  return status?.last_sync || null;
}

// دالة لحفظ الدروس محلياً
// نحذف فقط دروس المواد الموجودة في هذه الدفعة — لا نمسح دروس المواد الأخرى
// هذا يضمن أن كل مادة تُحدَّث مستقلة ودروس المواد الأخرى تبقى سليمة للاستخدام أوفلاين
export async function saveLessonsOffline(lessons: Lesson[]): Promise<void> {
  if (lessons.length === 0) return;
  // استخرج معرّفات المواد الفريدة في هذه الدفعة
  const subjectIds = [...new Set(lessons.map(l => l.subject_id).filter(Boolean))];
  // احذف فقط الدروس القديمة لهذه المواد (لضمان حذف الدروس المحذوفة من السيرفر)
  if (subjectIds.length > 0) {
    await db.lessons.where('subject_id').anyOf(subjectIds).delete();
  }
  await db.lessons.bulkPut(lessons);
  // مسح الذاكرة لكل المفاتيح المتعلقة بالدروس
  memoryCache.clearByPrefix('lessons_');
  memoryCache.delete(cacheKeys.lessonsAll);
}

// دالة لجلب الدروس من التخزين المحلي مع Memory Cache
export async function getLessonsOffline(subjectId?: string): Promise<Lesson[]> {
  const cacheKey = subjectId ? cacheKeys.lessons(subjectId) : cacheKeys.lessonsAll;
  const cached = memoryCache.get<Lesson[]>(cacheKey);
  if (cached) return cached;

  // الجلب من IndexedDB
  let lessons: Lesson[];
  if (subjectId) {
    lessons = await db.lessons.where('subject_id').equals(subjectId).toArray();
  } else {
    lessons = await db.lessons.toArray();
  }

  // لا نخزن مصفوفة فارغة في الذاكرة (لتجنب تسميم الكاش)
  if (lessons.length > 0) {
    memoryCache.set(cacheKey, lessons, 10 * 60 * 1000); // 10 دقائق
  }
  return lessons;
}

// دالة لحفظ الأسئلة محلياً
export async function saveQuestionsOffline(questions: QuizQuestion[]): Promise<void> {
  await db.questions.bulkPut(questions);
}

// دالة لجلب الأسئلة من التخزين المحلي
export async function getQuestionsOffline(lessonId: string): Promise<QuizQuestion[]> {
  return await db.questions.where('lesson_id').equals(lessonId).toArray();
}

// دالة لحفظ الاختبارات محلياً
export async function saveQuizzesOffline(quizzes: Quiz[]): Promise<void> {
  // نستبدل القائمة كاملة لضمان حذف الاختبارات المحذوفة من السيرفر
  await db.quizzes.clear();
  if (quizzes.length > 0) await db.quizzes.bulkPut(quizzes);
}

// دالة لجلب الاختبارات من التخزين المحلي
export async function getQuizzesOffline(): Promise<Quiz[]> {
  return await db.quizzes.toArray();
}

// دالة لحفظ المواد محلياً
// نستخدم bulkPut (upsert) فقط — لا نمسح الكل لأننا نحفظ مادة صف واحد في كل مرة
// المسح الكامل يتسبب في ضياع مواد الصفوف الأخرى المحفوظة سابقاً
export async function saveSubjectsOffline(subjects: Subject[]): Promise<void> {
  if (subjects.length === 0) return;
  await db.subjects.bulkPut(subjects); // upsert: يضيف ويحدث بدون حذف
  // مسح كل مفاتيح المواد من الذاكرة (بما فيها per-class keys مثل subjects_classId)
  memoryCache.clearByPrefix('subjects_');
}

// دالة لجلب المواد من التخزين المحلي مع Memory Cache
export async function getSubjectsOffline(classId?: string): Promise<Subject[]> {
  const cacheKey = classId ? cacheKeys.subjects(classId) : 'subjects_all';
  const cached = memoryCache.get<Subject[]>(cacheKey);
  if (cached) return cached;

  // الجلب من IndexedDB
  let subjects: Subject[];
  if (classId) {
    subjects = await db.subjects.where('class_id').equals(classId).toArray();
  } else {
    subjects = await db.subjects.toArray();
  }

  // لا نخزن مصفوفة فارغة في الذاكرة (لتجنب تسميم الكاش)
  if (subjects.length > 0) {
    memoryCache.set(cacheKey, subjects, 10 * 60 * 1000); // 10 دقائق
  }
  return subjects;
}

// دالة لحفظ الصفوف محلياً
// نستخدم bulkPut (upsert) فقط — الصفوف نادراً ما تُحذف، والمسح الكامل غير ضروري
export async function saveClassesOffline(classes: Class[]): Promise<void> {
  if (classes.length === 0) return;
  await db.classes.bulkPut(classes); // upsert: يضيف ويحدث بدون حذف
  // مسح الذاكرة
  memoryCache.delete(cacheKeys.classes);
}

// دالة لجلب الصفوف من التخزين المحلي مع Memory Cache
export async function getClassesOffline(): Promise<Class[]> {
  const cached = memoryCache.get<Class[]>(cacheKeys.classes);
  if (cached) return cached;

  const classes = await db.classes.toArray();

  // لا نخزن مصفوفة فارغة في الذاكرة
  if (classes.length > 0) {
    memoryCache.set(cacheKeys.classes, classes, 10 * 60 * 1000); // 10 دقائق
  }
  return classes;
}

// دالة لحفظ تقدم الطالب محلياً
export async function saveProgressOffline(progress: {
  id: string;
  lesson_id: string;
  student_code: string;
  last_question_index: number;
  answers: Record<string, any>;
}): Promise<void> {
  await db.progress.put({
    ...progress,
    updated_at: new Date().toISOString()
  });
}

// دالة لجلب تقدم الطالب من التخزين المحلي
export async function getProgressOffline(lessonId: string, studentCode: string): Promise<any> {
  return await db.progress
    .where('[lesson_id+student_code]')
    .equals([lessonId, studentCode])
    .first();
}

// دالة لحفظ سؤال في المحفوظات
export async function saveQuestionToFavorites(questionId: string, lessonId: string, studentCode: string): Promise<void> {
  await db.savedQuestions.put({
    id: `${questionId}_${studentCode}`,
    question_id: questionId,
    student_code: studentCode,
    lesson_id: lessonId,
    saved_at: new Date().toISOString(),
    synced: false
  });
}

// دالة لجلب الأسئلة المحفوظة
export async function getSavedQuestions(studentCode: string): Promise<any[]> {
  return await db.savedQuestions.where('student_code').equals(studentCode).toArray();
}

// دالة لحفظ ملاحظة
export async function saveNote(note: {
  id: string;
  student_code: string;
  lesson_id?: string;
  type: 'text' | 'image' | 'audio' | 'capture' | 'voice_record';
  content: string;
  media_url?: string;
  description?: string;
  synced?: boolean;
  created_at?: string;
}): Promise<void> {
  const existing = await db.notes.get(note.id);
  await db.notes.put({
    ...existing,
    ...note,
    created_at: note.created_at ?? existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    synced: note.synced ?? false
  });
}

// دالة لجلب الملاحظات
export async function getNotes(studentCode: string): Promise<any[]> {
  return await db.notes.where('student_code').equals(studentCode).toArray();
}

// دالة لحذف ملاحظة محلياً
export async function deleteLocalNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

// دالة لحذف سؤال محفوظ محلياً
export async function deleteLocalSavedQuestion(id: string): Promise<void> {
  await db.savedQuestions.delete(id);
}

// دالة لحفظ محاولة اختبار محلياً
export async function saveQuizAttemptOffline(attempt: {
  id: string;
  student_code: string;
  lesson_id?: string;
  quiz_id?: string;
  score: number;
  total_questions: number;
  questions?: any[];
  user_answers?: number[];
  version_name?: string;
  created_at?: string;
}): Promise<void> {
  await db.quizAttempts.put({
    ...attempt,
    created_at: attempt.created_at ?? new Date().toISOString(),
  });
}

// دالة لجلب محاولات الاختبارات المحلية
export async function getQuizAttemptsOffline(studentCode: string): Promise<any[]> {
  return await db.quizAttempts.where('student_code').equals(studentCode).reverse().sortBy('created_at');
}

// دالة لإضافة عملية مزامنة مؤجلة للملاحظات
export async function addPendingNoteAction(
  action: 'create' | 'update' | 'delete',
  payload: any
): Promise<void> {
  await db.pendingNotes.put({
    id: `${action}_${payload.id}_${Date.now()}`,
    action,
    payload: JSON.stringify(payload),
    created_at: new Date().toISOString(),
    retries: 0
  });
}

// دالة لإضافة عملية مزامنة مؤجلة للأسئلة المحفوظة
export async function addPendingSavedQuestionAction(
  action: 'create' | 'delete',
  payload: any
): Promise<void> {
  await db.pendingSavedQuestions.put({
    id: `${action}_${payload.id}_${Date.now()}`,
    action,
    payload: JSON.stringify(payload),
    created_at: new Date().toISOString(),
    retries: 0
  });
}

// دالة لجلب العمليات المعلقة
export async function getPendingNoteActions(): Promise<any[]> {
  return await db.pendingNotes.orderBy('created_at').toArray();
}

export async function getPendingSavedQuestionActions(): Promise<any[]> {
  return await db.pendingSavedQuestions.orderBy('created_at').toArray();
}

// دالة لإزالة عملية مزامنة مكتملة
export async function removePendingNoteAction(id: string): Promise<void> {
  await db.pendingNotes.delete(id);
}

export async function removePendingSavedQuestionAction(id: string): Promise<void> {
  await db.pendingSavedQuestions.delete(id);
}

// دالة لمسح جميع البيانات (للاختبار)
export async function clearAllData(): Promise<void> {
  await db.lessons.clear();
  await db.questions.clear();
  await db.quizzes.clear();
  await db.subjects.clear();
  await db.classes.clear();
  await db.progress.clear();
  await db.savedQuestions.clear();
  await db.notes.clear();
  await db.pendingNotes.clear();
  await db.pendingSavedQuestions.clear();
  await db.syncStatus.clear();
  await db.images.clear();
  await db.codeHashes.clear();
}

/* ─── تخزين الصور في IndexedDB للعمل بدون إنترنت ─── */

/** حفظ صورة في IndexedDB */
export async function saveImageToDB(url: string): Promise<void> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return;
    const blob = await response.blob();
    await db.images.put({ url, blob, saved_at: new Date().toISOString() });
  } catch (err) {
    console.warn('[ImageCache] فشل حفظ الصورة:', url, err);
  }
}

/** جلب صورة من IndexedDB */
export async function getImageFromDB(url: string): Promise<string | null> {
  try {
    const record = await db.images.get(url);
    if (record && record.blob) {
      return URL.createObjectURL(record.blob);
    }
  } catch (err) {
    console.warn('[ImageCache] فشل جلب الصورة:', url, err);
  }
  return null;
}

/* ─── تخزين وتجزئة أكواد التفعيل للعمل بدون إنترنت ─── */

/** حفظ قائمة تجزئة الأكواد بعد تشفيرها */
export async function saveCodeHashes(hashes: string[]): Promise<void> {
  const payload = await encryptCodeHashes(hashes);
  await db.codeHashes.put({
    id: 'access_codes',
    payload,
    updated_at: new Date().toISOString()
  });
}

/** جلب قائمة التجزئة المحفوظة وفك تشفيرها */
export async function getCodeHashes(): Promise<string[]> {
  const record = await db.codeHashes.get('access_codes');
  if (!record) return [];
  return decryptCodeHashes(record.payload);
}

/** التحقق مما إذا كان الكود موجوداً في قائمة التجزئة المحلية */
export async function isCodeHashValid(code: string): Promise<boolean> {
  try {
    const hashes = await getCodeHashes();
    if (hashes.length === 0) return false;
    const target = await hashCode(code);
    return hashes.includes(target);
  } catch {
    return false;
  }
}

/* ─── نسخ احتياطي لبيانات الوصول واستعادتها ─── */

export interface AccessBackupData {
  accessType: 'full' | 'subjects' | null;
  fullAccessCode?: string;
  activatedClasses: any[];
  deviceId?: string;
  fingerprint?: string;
}

/** حفظ نسخة احتياطية من بيانات الوصول في IndexedDB */
export async function saveAccessBackup(data: AccessBackupData): Promise<void> {
  try {
    await db.accessBackup.put({
      id: 'current',
      ...data,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[AccessBackup] فشل الحفظ:', err);
  }
}

/** استعادة نسخة الوصول الاحتياطية من IndexedDB */
export async function getAccessBackup(): Promise<AccessBackupData | null> {
  try {
    const record = await db.accessBackup.get('current');
    if (!record) return null;
    const { id, updated_at, ...data } = record;
    return data as AccessBackupData;
  } catch (err) {
    console.warn('[AccessBackup] فشل الاستعادة:', err);
    return null;
  }
}

/** حذف النسخة الاحتياطية للوصول */
export async function clearAccessBackup(): Promise<void> {
  try {
    await db.accessBackup.delete('current');
  } catch {
    // تجاهل
  }
}

/** تحميل شامل في الخلفية: كل الصفوف + المواد + الدروس → IndexedDB */
export async function preloadAllContent(
  fetchClasses: () => Promise<import('@/types').Class[]>,
  fetchSubjects: (classId: string) => Promise<import('@/types').Subject[]>,
  fetchLessons: (subjectId: string) => Promise<import('@/types').Lesson[]>,
  onProgress?: (msg: string) => void
): Promise<void> {
  try {
    const classes = await fetchClasses();
    if (!classes.length) return;
    await saveClassesOffline(classes);
    onProgress?.(`تم حفظ ${classes.length} صف`);

    for (const cls of classes) {
      const subjects = await fetchSubjects(cls.id);
      if (!subjects.length) continue;
      await saveSubjectsOffline(subjects);
      onProgress?.(`تم حفظ ${subjects.length} مادة للصف ${cls.name}`);

      // تحميل الدروس بالتوازي (4 مواد في آن واحد)
      const batchSize = 4;
      for (let i = 0; i < subjects.length; i += batchSize) {
        const batch = subjects.slice(i, i + batchSize);
        await Promise.all(batch.map(async (sub) => {
          try {
            const lessons = await fetchLessons(sub.id);
            if (lessons.length) await saveLessonsOffline(lessons);
          } catch { /* تجاهل أخطاء فردية */ }
        }));
      }
    }

    await markInitialSyncComplete();
    onProgress?.('اكتمل تحميل جميع المحتوى للعمل بدون إنترنت ✓');
  } catch (err) {
    console.warn('[preloadAllContent] فشل التحميل الشامل:', err);
  }
}

/** تحميل مسبق لمجموعة صور وتخزينها */
export async function preloadImages(urls: string[]): Promise<void> {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  await Promise.all(
    uniqueUrls.map(async (url) => {
      const exists = await db.images.get(url);
      if (!exists) await saveImageToDB(url);
    })
  );
}
