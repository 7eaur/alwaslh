import { supabase } from "@/db/supabase";
import { Class, Subject, SubjectExtraClass, Lesson, AccessCode, StudentNote, Notification, Profile, QuizAttempt, Quiz, QuizProgress } from "@/types";
import { createAiOptimizedImage } from "@/lib/file-processing";
import { cachedApiCall, setCache, getCache, removeCache } from "@/lib/offline-cache";
import { parsePageNumber } from "@/lib/utils";
import { getStudentIdentifier } from "@/lib/device";
import { compressImageFile } from "@/lib/image-compression";
import {
  saveNote as saveNoteOffline,
  getNotes as getNotesOffline,
  deleteLocalNote,
  saveQuestionToFavorites,
  getSavedQuestions as getSavedQuestionsOffline,
  deleteLocalSavedQuestion,
  addPendingNoteAction,
  addPendingSavedQuestionAction,
  getPendingNoteActions,
  getPendingSavedQuestionActions,
  removePendingNoteAction,
  removePendingSavedQuestionAction,
  getLessonsOffline,
  saveLessonsOffline,
  saveQuizAttemptOffline,
  getQuizAttemptsOffline,
} from "@/lib/offline-db";

// Admin API
export const adminApi = {
  // Classes
  async getClasses() {
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Class[];
  },
  async createClass(name: string) {
    const { data, error } = await supabase.from('classes').insert([{ name }] as any[]).select().maybeSingle();
    if (error) throw error;
    return data as Class;
  },
  async updateClass(id: string, name: string) {
    const { data, error } = await supabase.from('classes').update({ name } as any).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data as Class;
  },
  async deleteClass(id: string) {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
  },

  // Subjects
  async getSubjects(classId?: string) {
    let query = supabase.from('subjects')
      .select('*, extra_classes:subject_extra_classes(id, subject_id, class_id, created_at, classes(id, name))')
      .order('created_at', { ascending: false });
    if (classId) query = query.eq('class_id', classId);
    const { data, error } = await query;
    if (error) throw error;
    return (data as Subject[]) ?? [];
  },
  async createSubject(name: string, classId: string) {
    const { data, error } = await supabase.from('subjects').insert([{ name, class_id: classId }] as any[]).select().maybeSingle();
    if (error) throw error;
    return data as Subject;
  },
  async updateSubject(id: string, name: string, classId?: string) {
    const updateData: any = { name };
    if (classId) {
      updateData.class_id = classId;
    }
    const { data, error } = await supabase.from('subjects').update(updateData).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data as Subject;
  },
  async deleteSubject(id: string) {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
  },

  // ربط المادة بصف إضافي
  async addSubjectExtraClass(subjectId: string, classId: string) {
    const { data, error } = await supabase
      .from('subject_extra_classes')
      .insert([{ subject_id: subjectId, class_id: classId }])
      .select('id, subject_id, class_id, created_at, classes(id, name)')
      .maybeSingle();
    if (error) throw error;
    return data as unknown as SubjectExtraClass;
  },
  async removeSubjectExtraClass(id: string) {
    const { error } = await supabase
      .from('subject_extra_classes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Lessons
  async getLessons(subjectId?: string, limit?: number) {
    let query = supabase.from('lessons').select('*, subjects(name, classes(name))').order('created_at', { ascending: false });
    if (subjectId) query = query.eq('subject_id', subjectId);
    
    // CRITICAL: Always apply a limit to avoid PostgREST default limit
    // If no limit specified, use a very high number to get all lessons
    const effectiveLimit = limit || 10000; // جلب حتى 10000 درس (أكثر من كافي)
    query = query.limit(effectiveLimit);
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Lesson[];
  },
  async createLesson(lesson: Partial<Lesson>) {
    const { data, error } = await supabase.from('lessons').insert([lesson] as any[]).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('لم يتم إنشاء الدرس');
    return data as Lesson;
  },
  async updateLesson(id: string, lesson: Partial<Lesson>) {
    const { data, error } = await supabase.from('lessons').update(lesson as any).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('لم يتم تحديث الدرس');
    return data as Lesson;
  },
  async deleteLesson(id: string) {
    const { data, error } = await supabase.from('lessons').delete().eq('id', id).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('لم يتم حذف الدرس');
  },
  async deleteLessons(ids: string[]) {
    const { error } = await supabase.from('lessons').delete().in('id', ids);
    if (error) throw error;
  },

  // Access Codes
  async getAccessCodes() {
    const { data, error } = await supabase.from('access_codes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as AccessCode[];
  },
  async generateCodes(count: number) {
    const newCodes = Array.from({ length: count }, () => ({
      code: Math.floor(1000000 + Math.random() * 9000000).toString(),
    }));
    const { data, error } = await supabase.from('access_codes').insert(newCodes as any[]).select();
    if (error) throw error;
    return data as AccessCode[];
  },
  async importCodes(codes: { code: string }[]) {
    return await supabase.from('access_codes').insert(codes as any[]).select();
  },
  async resetCode(id: string) {
    const { error } = await supabase.from('access_codes').update({ is_used: false, device_id: null, device_fingerprint: null, activated_at: null, expires_at: null } as any).eq('id', id);
    if (error) throw error;
  },
  async deleteCode(id: string) {
    const { error } = await supabase.from('access_codes').delete().eq('id', id);
    if (error) throw error;
  },

  // Notifications
  async getNotifications() {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Notification[];
  },
  async createNotification(title: string, message: string) {
    const { data, error } = await supabase.from('notifications').insert([{ title, message }] as any[]).select().maybeSingle();
    if (error) throw error;
    return data as Notification;
  },
  async deleteNotification(id: string) {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
  },

  // Admin Settings
  async getAdminCode() {
    const { data, error } = await supabase.from('admin_settings').select('admin_code').eq('id', 1).maybeSingle();
    if (error) throw error;
    return (data as any)?.admin_code as string;
  },
  async updateAdminCode(newCode: string) {
    // 1. Update the code in the settings table
    const { error: settingsError } = await supabase.from('admin_settings').update({ admin_code: newCode }).eq('id', 1);
    if (settingsError) throw settingsError;

    // 2. Update the password for the admin account in auth.users
    // This is tricky because we can't easily update other users' passwords from client side unless it's current user
    const { error: authError } = await supabase.auth.updateUser({ password: newCode });
    if (authError) throw authError;
  },

  // Quizzes
  async getQuizzes(subjectId?: string, limit?: number) {
    // تحميل metadata فقط بدون الأسئلة لتسريع التحميل
    let query = supabase
      .from('quizzes')
      .select('id, title, subject_id, lesson_ids, created_at, subjects(name, class_id)')
      .order('created_at', { ascending: false });
    
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (limit) query = query.limit(limit);
    
    const { data, error } = await query;
    if (error) throw error;
    return data as any[]; // استخدام any[] لأننا لا نحمل جميع الحقول
  },
  async getQuizById(id: string) {
    // جلب بيانات الاختبار الكاملة بما في ذلك الأسئلة والنماذج
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, subjects(name, class_id)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    
    console.log('Fetched quiz by ID:', {
      id,
      hasQuestions: !!data?.questions,
      questionsCount: data?.questions?.length || 0,
      hasVersions: !!data?.versions,
      versionsCount: data?.versions?.length || 0,
      rawData: data
    });
    
    return data as Quiz;
  },
  async createQuiz(quiz: any) {
    const { data, error } = await supabase.from('quizzes').insert([quiz]).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async updateQuiz(id: string, quiz: any) {
    const { data, error } = await supabase.from('quizzes').update(quiz).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async deleteQuiz(id: string) {
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) throw error;
  },

  async generateQuizFromSummaries(summaries: string, count: number) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { 
        text: summaries, 
        task: 'generate_quiz', 
        question_count: count 
      },
    });
    
    // Ensure data is structured as expected even if AI returns raw array
    let processedData = data;
    if (data && Array.isArray(data)) {
      processedData = { questions: data };
    } else if (data && data.questions && Array.isArray(data.questions)) {
      processedData = data;
    } else if (data && !data.questions) {
      // AI might return { "0": { question: ... }, "1": { question: ... } }
      const qs = Object.values(data).filter((v: any) => v && v.question);
      if (qs.length > 0) processedData = { questions: qs };
    }
    
    return { data: processedData, error };
  },

  async generateMultiVersionQuiz(summaries: string, questionCount: number, versionCount: number, mcqCount?: number, trueFalseCount?: number) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { 
        text: summaries, 
        task: 'generate_multi_version_quiz', 
        question_count: questionCount,
        version_count: versionCount,
        mcq_count: mcqCount,
        true_false_count: trueFalseCount
      },
    });
    
    // Process response for multi-version structure
    let processedData = data;
    if (data && data.versions && Array.isArray(data.versions)) {
      processedData = data;
    } else if (data && !data.versions && Array.isArray(data)) {
      // If AI returns an array of questions directly, wrap it as version 1
      processedData = { versions: [{ name: "النموذج (1)", questions: data }] };
    } else if (data && !data.versions) {
      // Handle potential other formats
      const vs = Object.values(data).filter((v: any) => v && v.questions);
      if (vs.length > 0) processedData = { versions: vs };
    }

    return { data: processedData, error };
  },

  async generateSingleVersionQuiz(text: string, questionCount: number, avoidQuestions: string[]) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { 
        task: 'generate_version', 
        text, 
        question_count: questionCount, 
        avoid_questions: avoidQuestions 
      }
    });
    return { data, error };
  },

  async regenerateSingleQuestion(existingQuestion: string, text: string, questionType: string, difficulty: string, optionCount: number) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: {
        task: 'regenerate_question',
        question: existingQuestion,
        text,
        question_type: questionType,
        difficulty,
        option_count: optionCount,
      }
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }
    return data;
  },

  async generateQuizFromImages(lessons: any[], versionCount: number) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { 
        task: 'extract_questions_from_images', 
        lessons: lessons.map(l => ({
          id: l.id,
          title: l.title,
          image_urls: l.image_urls
        })),
        version_count: versionCount
      }
    });
    
    // Process response for multi-version structure
    let processedData = data;
    if (data && data.versions && Array.isArray(data.versions)) {
      processedData = data;
    } else if (data && !data.versions && Array.isArray(data)) {
      processedData = { versions: [{ name: "النموذج (1)", questions: data }] };
    } else if (data && !data.versions) {
      const vs = Object.values(data).filter((v: any) => v && v.questions);
      if (vs.length > 0) processedData = { versions: vs };
    }

    return { data: processedData, error };
  },

  // Upload Tasks (Wizard Persistence)
  async getUploadTasks() {
    const { data, error } = await supabase.from('lesson_upload_tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  },
  async createUploadTask(task: any) {
    const { data, error } = await supabase.from('lesson_upload_tasks').insert([task]).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async updateUploadTask(id: string, updates: any) {
    const { data, error } = await supabase.from('lesson_upload_tasks').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async deleteUploadTask(id: string) {
    const { error } = await supabase.from('lesson_upload_tasks').delete().eq('id', id);
    if (error) throw error;
  },
  
  // Export History
  async getExportHistory() {
    const { data, error } = await supabase
      .from('export_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createExportHistory(exportData: {
    lesson_ids: string[];
    lesson_titles: string[];
    subject_name?: string;
    class_name?: string;
    export_options: any;
  }) {
    const { data, error } = await supabase
      .from('export_history')
      .insert([exportData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async deleteExportHistory(id: string) {
    const { error } = await supabase
      .from('export_history')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Student API
export const studentApi = {
  async getProfile(userId: string) {
    return cachedApiCall(
      `profile_${userId}`,
      async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;
        return data as Profile;
      }
    );
  },
  async getClasses() {
    return cachedApiCall(
      'student_classes',
      async () => {
        const { data, error } = await supabase.from('classes')
          .select('id, name, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Class[];
      }
    );
  },
  async getSubjects(classId?: string) {
    const cacheKey = classId ? `student_subjects_${classId}` : 'student_subjects_all';
    return cachedApiCall(
      cacheKey,
      async () => {
        if (!classId) {
          // بدون تصفية: جلب كل المواد
          const { data, error } = await supabase.from('subjects')
            .select('id, name, class_id, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          return (data as Subject[]) ?? [];
        }

        // جلب المواد الأساسية للصف
        const { data: primaryData, error: e1 } = await supabase
          .from('subjects')
          .select('id, name, class_id, created_at')
          .eq('class_id', classId)
          .order('created_at', { ascending: false });
        if (e1) throw e1;

        // جلب المواد المرتبطة بالصف عبر جدول الصفوف الإضافية
        const { data: extraData, error: e2 } = await supabase
          .from('subject_extra_classes')
          .select('subjects(id, name, class_id, created_at)')
          .eq('class_id', classId);
        if (e2) throw e2;

        // دمج النتيجتين مع إزالة المكررات (حسب id)
        const extraSubjects = (extraData ?? [])
          .map((row: any) => row.subjects)
          .filter(Boolean) as Subject[];

        const combined = [...(primaryData ?? [])];
        for (const s of extraSubjects) {
          if (!combined.find(c => c.id === s.id)) combined.push(s);
        }
        return combined;
      }
    );
  },
  async getQuizProgress(studentId: string, lessonId?: string, quizId?: string) {
    return cachedApiCall(
      `student_quiz_progress_${studentId}_${lessonId || 'all'}_${quizId || 'all'}`,
      async () => {
        let query = supabase.from('quiz_progress').select('*').eq('student_id', studentId);
        if (lessonId) query = query.eq('lesson_id', lessonId);
        if (quizId) query = query.eq('quiz_id', quizId);
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data as QuizProgress;
      }
    );
  },
  async saveQuizProgress(progress: Partial<QuizProgress>) {
    const { data, error } = await supabase.from('quiz_progress')
      .upsert([progress] as any[])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as QuizProgress;
  },
  async deleteQuizProgress(studentId: string, lessonId?: string, quizId?: string) {
    let query = supabase.from('quiz_progress').delete().eq('student_id', studentId);
    if (lessonId) query = query.eq('lesson_id', lessonId);
    if (quizId) query = query.eq('quiz_id', quizId);
    const { error } = await query;
    if (error) throw error;
  },
  async getLessons(subjectId: string) {
    // محاولة جلب من السيرفر أولاً
    try {
      const { data, error } = await supabase.from('lessons')
        .select('id, subject_id, title, image_urls, summary, page_number, ai_questions, created_at')
        .eq('subject_id', subjectId)
        .order('page_number', { ascending: true });
      if (error) throw error;
      const lessons = (data ?? []) as Lesson[];
      // حفظ محلي للاستخدام بدون إنترنت
      if (lessons.length > 0) {
        saveLessonsOffline(lessons).catch(() => {});
      }
      return lessons;
    } catch (err) {
      // في حال عدم وجود إنترنت نرجع للتخزين المحلي
      const offline = await getLessonsOffline(subjectId);
      if (offline.length > 0) return offline;
      throw err;
    }
  },
  async getLesson(id: string) {
    return cachedApiCall(
      `student_lesson_${id}`,
      async () => {
        const { data, error } = await supabase.from('lessons')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data as Lesson;
      }
    );
  },
  async getNotes(studentId: string) {
    const CACHE_KEY = `student_notes_${studentId}`;
    try {
      const data = await cachedApiCall(
        CACHE_KEY,
        async () => {
          const { data, error } = await supabase.from('student_notes')
            .select('*, lessons(title)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data as any[];
        }
      );
      // حفظ محلي للعمل أوفلاين
      if (Array.isArray(data)) {
        for (const note of data) {
          saveNoteOffline({
            id: note.id,
            student_code: studentId,
            lesson_id: note.lesson_id,
            type: note.type,
            content: note.content,
            media_url: note.media_url,
            description: note.description,
            synced: true
          }).catch(() => {});
        }
      }
      return data || [];
    } catch (err) {
      // أوفلاين: استرجاع من IndexedDB
      const offline = await getNotesOffline(studentId);
      return offline.map(n => ({
        ...n,
        lessons: { title: '' }
      }));
    }
  },
  async saveNote(note: Partial<StudentNote>) {
    const deviceId = getStudentIdentifier();
    const noteId = (note.id as string) || crypto.randomUUID();

    // حفظ محلي فوراً للعرض حتى بدون إنترنت
    await saveNoteOffline({
      id: noteId,
      student_code: note.student_id || deviceId,
      lesson_id: note.lesson_id,
      type: note.type || 'text',
      content: (note.content as string) || '',
      media_url: note.media_url,
      description: note.description,
      synced: false
    });

    if (!navigator.onLine) {
      // تسجيل عملية مزامنة مؤجلة
      await addPendingNoteAction('create', { ...note, id: noteId });
      removeCache(`student_notes_${note.student_id || deviceId}`);
      return { ...note, id: noteId } as StudentNote;
    }

    try {
      const { data, error } = await supabase.from('student_notes')
        .upsert([{ ...note, id: noteId }] as any[])
        .select()
        .maybeSingle();
      if (error) throw error;
      // تحديث الحالة إلى متزامن
      await saveNoteOffline({
        id: noteId,
        student_code: note.student_id || deviceId,
        lesson_id: note.lesson_id,
        type: note.type || 'text',
        content: (note.content as string) || '',
        media_url: note.media_url,
        description: note.description,
        synced: true
      });
      removeCache(`student_notes_${note.student_id || deviceId}`);
      return data as StudentNote;
    } catch (err) {
      // عند فشل السيرفر نضيفها للمزامنة المؤجلة
      await addPendingNoteAction('create', { ...note, id: noteId });
      removeCache(`student_notes_${note.student_id || deviceId}`);
      return { ...note, id: noteId } as StudentNote;
    }
  },
  async updateNote(id: string, updates: Partial<StudentNote>) {
    const deviceId = getStudentIdentifier();
    // تحديث محلي
    const existing = await getNotesOffline(deviceId).then(notes => notes.find(n => n.id === id));
    if (existing) {
      await saveNoteOffline({ ...existing, ...updates, synced: false });
    }

    if (!navigator.onLine) {
      await addPendingNoteAction('update', { id, ...updates });
      removeCache(`student_notes_${deviceId}`);
      return { id, ...updates } as StudentNote;
    }

    try {
      const { data, error } = await supabase.from('student_notes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (existing) {
        await saveNoteOffline({ ...existing, ...updates, synced: true });
      }
      removeCache(`student_notes_${deviceId}`);
      return data as StudentNote;
    } catch (err) {
      await addPendingNoteAction('update', { id, ...updates });
      removeCache(`student_notes_${deviceId}`);
      return { id, ...updates } as StudentNote;
    }
  },
  async deleteNote(id: string) {
    const deviceId = getStudentIdentifier();
    await deleteLocalNote(id);

    if (!navigator.onLine) {
      await addPendingNoteAction('delete', { id });
      removeCache(`student_notes_${deviceId}`);
      return;
    }

    try {
      const { error } = await supabase.from('student_notes').delete().eq('id', id);
      if (error) throw error;
      removeCache(`student_notes_${deviceId}`);
    } catch (err) {
      await addPendingNoteAction('delete', { id });
      removeCache(`student_notes_${deviceId}`);
    }
  },
  async getNotifications() {
    // نستخدم الكاش أولاً (false) ونحدّث في الخلفية عند وجود شبكة
    return cachedApiCall(
      'student_notifications',
      async () => {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Notification[];
      },
      false  // استخدم الكاش المحلي عند وجوده للعمل بدون إنترنت
    );
  },
  async saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at'>) {
    const attemptId = crypto.randomUUID();
    // حفظ محلي فوراً للعرض أوفلاين
    await saveQuizAttemptOffline({
      id: attemptId,
      student_code: attempt.student_id,
      lesson_id: attempt.lesson_id,
      quiz_id: attempt.quiz_id,
      score: attempt.score,
      total_questions: attempt.total_questions,
      questions: attempt.questions,
      user_answers: attempt.user_answers,
      version_name: attempt.version_name,
      created_at: new Date().toISOString(),
    });

    if (!navigator.onLine) {
      return { ...attempt, id: attemptId, created_at: new Date().toISOString() } as QuizAttempt;
    }

    try {
      const { data, error } = await supabase.from('quiz_attempts').insert([{ ...attempt, id: attemptId }] as any[]).select().maybeSingle();
      if (error) throw error;
      return data as QuizAttempt;
    } catch (err) {
      console.warn('[saveQuizAttempt] فشل الحفظ على السيرفر، سيتم المزامنة لاحقاً');
      return { ...attempt, id: attemptId, created_at: new Date().toISOString() } as QuizAttempt;
    }
  },
  async getQuizAttempts(studentId: string, lessonId?: string, quizId?: string) {
    try {
      let query = supabase.from('quiz_attempts').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
      if (lessonId) query = query.eq('lesson_id', lessonId);
      if (quizId) query = query.eq('quiz_id', quizId);
      const { data, error } = await query;
      if (error) throw error;
      // حفظ محلي للعرض أوفلاين
      if (Array.isArray(data)) {
        for (const attempt of data) {
          saveQuizAttemptOffline({
            id: attempt.id,
            student_code: studentId,
            lesson_id: attempt.lesson_id,
            quiz_id: attempt.quiz_id,
            score: attempt.score,
            total_questions: attempt.total_questions,
            questions: attempt.questions,
            user_answers: attempt.user_answers,
            version_name: attempt.version_name,
            created_at: attempt.created_at,
          }).catch(() => {});
        }
      }
      return (data || []) as QuizAttempt[];
    } catch (err) {
      // أوفلاين: استرجاع من IndexedDB
      const offline = await getQuizAttemptsOffline(studentId);
      return offline.map((a: any) => ({
        ...a,
        student_id: studentId,
      })) as QuizAttempt[];
    }
  },
  async getQuizzes(subjectId?: string) {
    // جلب مباشر من السيرفر دائماً لضمان وجود الأسئلة الكاملة
    let query = supabase.from('quizzes')
      .select('*, subjects(name, class_id)')
      .order('created_at', { ascending: true });
    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Quiz[];
  },
  async getQuizById(id: string) {
    // جلب اختبار كامل مع أسئلته ونماذجه مباشرة من السيرفر
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, subjects(name, class_id)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Quiz | null;
  },
  async getAchievements(studentId: string) {
    return cachedApiCall(
      `student_achievements_${studentId}`,
      async () => {
        const { data, error } = await supabase.from('student_achievements')
          .select('*, quizzes(title)')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as any[];
      }
    );
  },
  async saveAchievement(achievement: any) {
    const { data, error } = await supabase.from('student_achievements')
      .insert([achievement])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async getStudentRank(studentId: string) {
    try {
      const { data, error } = await supabase.rpc('get_student_rank', { target_id: studentId });
      if (error) throw error;
      const row = data?.[0];
      return {
        rank: row?.rank ?? 0,
        total: row?.total ?? 0,
        avgScore: Math.round(row?.avg_score ?? 0),
      };
    } catch (err) {
      console.warn('[getStudentRank] فشل جلب الترتيب:', err);
      return { rank: 0, total: 0, avgScore: 0 };
    }
  },
};

// Storage API
export const storageApi = {
  async uploadLessonImage(file: File) {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    
    // 1. Upload high-res version for student display
    const { data: highResData, error: highResError } = await supabase.storage.from('lesson_content').upload(fileName, file);
    if (highResError) throw highResError;
    const { data: highResPublicUrl } = supabase.storage.from('lesson_content').getPublicUrl(highResData.path);
    
    // 2. Also upload a very small version for AI analysis to avoid memory issues (WORKER_LIMIT)
    let aiUrl = highResPublicUrl.publicUrl;
    try {
      const aiOptimized = await createAiOptimizedImage(file);
      const aiFileName = `ai-${fileName}`;
      const { data: aiData, error: aiError } = await supabase.storage.from('lesson_content').upload(aiFileName, aiOptimized);
      if (!aiError) {
        const { data: aiPublicUrl } = supabase.storage.from('lesson_content').getPublicUrl(aiData.path);
        aiUrl = aiPublicUrl.publicUrl;
      }
    } catch (err) {
      console.warn('Failed to create/upload AI thumbnail:', err);
    }
    
    return { 
      url: highResPublicUrl.publicUrl, 
      aiUrl 
    };
  },
  async uploadNoteMedia(file: File) {
    // ضغط الصور تلقائياً قبل الرفع لتوفير البيانات والبطارية
    const compressed = file.type.startsWith('image/') ? await compressImageFile(file) : file;
    const safeName = compressed.name.replace(/[^a-zA-Z0-9.]/g, '');
    const fileName = `${Date.now()}-${safeName}`;
    const { data, error } = await supabase.storage.from('student_notes_media').upload(fileName, compressed);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from('student_notes_media').getPublicUrl(data.path);
    return publicUrl.publicUrl;
  },
};

// AI API
export const aiApi = {
  async analyzeLesson(imageUrls: string[]) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { imageUrls },
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }
    return data as any;
  },
  async detectPages(imageUrls: string[]) {
    const results: any[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      let retries = 0;
      const maxRetries = 2; // محاولتان إضافيتان
      let success = false;
      
      while (retries <= maxRetries && !success) {
        try {
          const { data, error } = await supabase.functions.invoke('analyze-lesson', {
            body: { imageUrls: [url], task: 'detect_pages' },
          });
          
          if (error) {
            console.error(`Error detecting page for ${url} (attempt ${retries + 1}):`, error);
            
            // إذا كانت آخر محاولة، أضف نتيجة افتراضية
            if (retries === maxRetries) {
              results.push({
                title: `صفحة من الكتاب (${i + 1})`,
                page_number: null,
                content_preview: "لم يتمكن الذكاء الاصطناعي من تحليل هذه الصفحة تلقائياً. يمكنك تعديل العنوان ورقم الصفحة يدوياً.",
                imageUrl: url
              });
            } else {
              // انتظر قليلاً قبل المحاولة مرة أخرى
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries++;
              continue;
            }
          } else {
            const pageData = Array.isArray(data) ? data[0] : data;
            
            // CRITICAL: تحويل رقم الصفحة من أرقام عربية إلى إنجليزية
            const parsedPageNumber = parsePageNumber(pageData.page_number);
            
            results.push({
              ...pageData,
              page_number: parsedPageNumber,
              imageUrl: url
            });
            success = true;
          }
        } catch (err) {
          console.error(`Exception detecting page for ${url} (attempt ${retries + 1}):`, err);
          
          // إذا كانت آخر محاولة، أضف نتيجة افتراضية
          if (retries === maxRetries) {
            results.push({
              title: `صفحة من الكتاب (${i + 1})`,
              page_number: null,
              content_preview: "حدث خطأ أثناء معالجة هذه الصفحة. يمكنك تعديل العنوان ورقم الصفحة يدوياً.",
              imageUrl: url
            });
          } else {
            // انتظر قليلاً قبل المحاولة مرة أخرى
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
            continue;
          }
        }
        
        break; // اخرج من الحلقة إذا نجحت أو فشلت في آخر محاولة
      }
    }
    return results;
  },
  async generateLessonContent(imageUrls: string[], lessonTitle: string, pageRange: string) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { 
        imageUrls, 
        task: 'generate_lesson_content', 
        lesson_title: lessonTitle, 
        page_range: pageRange 
      },
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }
    
    // Normalize response for consistency
    const result = {
      summary: data?.summary || "",
      questions: [] as any[]
    };
    
    let rawQuestions: any[] = [];
    if (Array.isArray(data?.questions)) {
      rawQuestions = data.questions;
    } else if (data && typeof data === 'object' && !data.questions) {
      // Handle cases where data itself is the lesson content or has questions differently
      rawQuestions = Object.values(data).filter((v: any) => v && v.question);
    }
    
    result.questions = rawQuestions.map(q => ({
      question: q.question || q.text || "سؤال غير محدد",
      options: Array.isArray(q.options) ? q.options : ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      correct_option_index: typeof q.correct_option_index === 'number' ? q.correct_option_index : 0,
      source_reference: q.source_reference || "",
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || "",
      method: q.method || ""
    })).filter(q => q.question !== "سؤال غير محدد");
    
    return result;
  },
  async generateSummary(imageUrls: string[]) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { imageUrls, task: 'generate_summary' },
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }
    if (data && (data as any).error) throw new Error((data as any).error);
    return (data as any)?.summary || "";
  },
  async generateQuestions(imageUrls: string[], questionType: 'mcq' | 'true_false' | 'both' = 'both', questionCount?: number, subjectId?: string, lessonId?: string) {
    // If no question count specified, let AI determine based on content
    const dynamicCount = questionCount || null;
    
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { 
        imageUrls, 
        task: 'generate_questions', 
        question_count: dynamicCount, 
        question_type: questionType,
        subject_id: subjectId,
        lesson_id: lessonId
      },
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }

    if (data && (data as any).error) {
      throw new Error((data as any).error);
    }
    
    // Robustly handle different response formats and normalize questions
    let rawQuestions: any[] = [];
    if (Array.isArray(data)) {
      rawQuestions = data;
    } else if (data && (data as any).questions && Array.isArray((data as any).questions)) {
      rawQuestions = (data as any).questions;
    } else if (data && typeof data === 'object') {
      const values = Object.values(data);
      // Check if any value is an array of questions
      const arrayValue = values.find(v => Array.isArray(v));
      if (arrayValue) {
        rawQuestions = arrayValue as any[];
      } else {
        rawQuestions = values.filter((v: any) => v && typeof v === 'object' && (v.question || v.text));
      }
    }
    
    return rawQuestions.map(q => ({
      question: q.question || q.text || q.prompt || "سؤال غير محدد",
      options: Array.isArray(q.options) ? q.options : 
               (Array.isArray(q.answers) ? q.answers : 
               (Array.isArray(q.choices) ? q.choices : ["خيار 1", "خيار 2", "خيار 3", "خيار 4"])),
      correct_option_index: typeof q.correct_option_index === 'number' ? q.correct_option_index : 
                            (typeof q.correct_index === 'number' ? q.correct_index : 0),
      source_reference: q.source_reference || "",
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || "",
      method: q.method || "",
      question_references: q.question_references || []
    })).filter(q => q.question !== "سؤال غير محدد");
  },
  async extractText(imageUrls: string[]) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { imageUrls, task: 'extract_text' },
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }
    if (data && (data as any).error) throw new Error((data as any).error);
    return (data as any)?.text || "";
  },
  async extractExamPaper(imageUrls: string[]) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { imageUrls, task: 'exam_paper_exact' },
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }
    if (data && (data as any).error) throw new Error((data as any).error);

    // استخراج مصفوفة الأسئلة من الاستجابة
    let rawQuestions: any[] = [];
    if (Array.isArray(data)) {
      rawQuestions = data;
    } else if (data?.questions && Array.isArray(data.questions)) {
      rawQuestions = data.questions;
    } else if (data && typeof data === 'object') {
      const arr = Object.values(data).find(v => Array.isArray(v));
      if (arr) rawQuestions = arr as any[];
    }

    return rawQuestions.map(q => ({
      question: q.question || q.text || "سؤال غير محدد",
      options: Array.isArray(q.options) ? q.options : [],
      correct_option_index: typeof q.correct_option_index === 'number' ? q.correct_option_index : 0,
      source_reference: q.source_reference || "",
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || "",
      method: q.method || "",
    })).filter(q => q.question !== "سؤال غير محدد");
  },
  async extractQuestions(imageUrls: string[]) {
    const { data, error } = await supabase.functions.invoke('analyze-lesson', {
      body: { imageUrls, task: 'extract_questions' },
    });
    if (error) {
      const errorMsg = await error?.context?.text();
      throw new Error(errorMsg || error.message);
    }
    if (data && (data as any).error) throw new Error((data as any).error);
    
    // Handle response format
    let rawQuestions: any[] = [];
    if (Array.isArray(data)) {
      rawQuestions = data;
    } else if (data && (data as any).questions && Array.isArray((data as any).questions)) {
      rawQuestions = (data as any).questions;
    } else if (data && typeof data === 'object') {
      const values = Object.values(data);
      const arrayValue = values.find(v => Array.isArray(v));
      if (arrayValue) {
        rawQuestions = arrayValue as any[];
      }
    }
    
    return rawQuestions.map(q => ({
      question: q.question || q.text || "سؤال غير محدد",
      options: Array.isArray(q.options) ? q.options : ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      correct_option_index: typeof q.correct_option_index === 'number' ? q.correct_option_index : 0,
      source_reference: q.source_reference || "",
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || "",
      method: q.method || "",
      question_references: q.question_references || []
    })).filter(q => q.question !== "سؤال غير محدد");
  },

  async generateReplicaQuestions(imageUrls: string[]) {
    const BATCH_SIZE = 2;
    const allRawQuestions: any[] = [];

    // تقسيم الصور إلى دفعات صغيرة (2 صور) لتجنب IDLE_TIMEOUT (150s) في Edge Function
    for (let i = 0; i < imageUrls.length; i += BATCH_SIZE) {
      const batch = imageUrls.slice(i, i + BATCH_SIZE);
      const pageOffset = i;

      let batchQuestions: any[] = [];
      let lastError: any = null;

      // محاولة أولى + إعادة محاولة واحدة إذا فشلت
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { data, error } = await supabase.functions.invoke('analyze-lesson', {
            body: { imageUrls: batch, task: 'replica', pageOffset },
          });

          if (error) {
            const errorMsg = await error?.context?.text();
            let friendlyMsg = errorMsg || error.message;
            if (friendlyMsg?.includes('IDLE_TIMEOUT')) {
              friendlyMsg = `⏱️ انتهى الوقت للمعالجة (150 ثانية) — الدفعة ${Math.floor(i / BATCH_SIZE) + 1}. المحاولة ${attempt + 1}/2`;
            }
            throw new Error(friendlyMsg);
          }
          if (data && (data as any).error) throw new Error((data as any).error);

          if (Array.isArray(data)) {
            batchQuestions = data;
          } else if (data && (data as any).questions && Array.isArray((data as any).questions)) {
            batchQuestions = (data as any).questions;
          } else if (data && typeof data === 'object') {
            const values = Object.values(data);
            const arrayValue = values.find(v => Array.isArray(v));
            if (arrayValue) batchQuestions = arrayValue as any[];
          }

          lastError = null;
          break; // نجاح - اخرج من loop المحاولات
        } catch (err: any) {
          lastError = err;
          // انتظر 3 ثوانٍ قبل إعادة المحاولة
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

      allRawQuestions.push(...batchQuestions);
    }

    return allRawQuestions.map(q => ({
      question: q.question || q.text || "سؤال غير محدد",
      options: Array.isArray(q.options) ? q.options : 
               (q.type === 'true_false' ? ["صح", "خطأ"] : ["خيار ١", "خيار ٢", "خيار ٣", "خيار ٤"]),
      correct_option_index: typeof q.correct_option_index === 'number' ? q.correct_option_index : 0,
      source_reference: q.source_reference || "",
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || "",
      method: q.method || "",
      question_references: q.question_references || []
    })).filter(q => q.question !== "سؤال غير محدد");
  },
};

// Saved Questions API
export const savedQuestionsApi = {
  async saveQuestion(lessonId: string, question: any, questionIndex: number) {
    const deviceId = getStudentIdentifier();
    const localId = crypto.randomUUID();

    // حفظ محلي فوراً
    await saveQuestionToFavorites(String(questionIndex), lessonId, deviceId);
    await addPendingSavedQuestionAction('create', {
      id: localId,
      student_id: deviceId,
      lesson_id: lessonId,
      question,
      question_index: questionIndex
    });

    if (!navigator.onLine) {
      return { id: localId, lesson_id: lessonId, question, question_index: questionIndex };
    }

    try {
      const { data, error } = await supabase
        .from('saved_questions')
        .insert([{
          student_id: deviceId,
          lesson_id: lessonId,
          question: question,
          question_index: questionIndex
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[SavedQuestions] فشل الحفظ على السيرفر، سيتم المزامنة لاحقاً');
      return { id: localId, lesson_id: lessonId, question, question_index: questionIndex };
    }
  },

  async getSavedQuestions() {
    const deviceId = getStudentIdentifier();
    const CACHE_KEY = `saved_questions_student_${deviceId}`;

    try {
      const data = await cachedApiCall(
        CACHE_KEY,
        async () => {
          const { data, error } = await supabase
            .from('saved_questions')
            .select(`
              *,
              lessons (
                id,
                title,
                subject_id,
                subjects (
                  id,
                  name,
                  class_id,
                  classes (
                    id,
                    name
                  )
                )
              )
            `)
            .eq('student_id', deviceId)
            .order('saved_at', { ascending: false });

          if (error) {
            console.error('Error fetching saved questions:', error);
            throw error;
          }
          return data || [];
        },
        false
      );

      // حفظ محلي للاستخدام أوفلاين
      if (Array.isArray(data)) {
        const { saveQuestionToFavorites } = await import('@/lib/offline-db');
        for (const q of data) {
          saveQuestionToFavorites(
            String(q.question_index || q.question?.id || ''),
            q.lesson_id,
            deviceId
          ).catch(() => {});
        }
      }
      return data || [];
    } catch (err) {
      // أوفلاين: استرجاع من IndexedDB
      const offline = await getSavedQuestionsOffline(deviceId);
      return offline.map(q => ({
        ...q,
        lessons: { title: '' }
      }));
    }
  },

  async deleteSavedQuestion(id: string) {
    await deleteLocalSavedQuestion(id);
    await addPendingSavedQuestionAction('delete', { id });

    if (!navigator.onLine) return;

    try {
      const { error } = await supabase
        .from('saved_questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn('[SavedQuestions] فشل الحذف على السيرفر، سيتم المزامنة لاحقاً');
    }
  },

  async checkIfSaved(lessonId: string, questionIndex: number) {
    const deviceId = getStudentIdentifier();

    // تحقق محلي أولاً
    const offline = await getSavedQuestionsOffline(deviceId);
    const localSaved = offline.some(q => q.lesson_id === lessonId && q.question_id === String(questionIndex));
    if (localSaved) return true;

    if (!navigator.onLine) return false;

    try {
      const { data, error } = await supabase
        .from('saved_questions')
        .select('id')
        .eq('student_id', deviceId)
        .eq('lesson_id', lessonId)
        .eq('question_index', questionIndex)
        .maybeSingle();

      if (error) return false;
      return !!data;
    } catch {
      return localSaved;
    }
  }
};

/** مزامنة الملاحظات والأسئلة المحفوظة المعلقة عند توفر الإنترنت */
export async function syncPendingStudentData(): Promise<void> {
  if (!navigator.onLine) return;

  // مزامنة الملاحظات
  const pendingNotes = await getPendingNoteActions();
  for (const item of pendingNotes) {
    try {
      const payload = JSON.parse(item.payload);
      if (item.action === 'create') {
        await supabase.from('student_notes').upsert([payload] as any[]);
      } else if (item.action === 'update') {
        const { id, ...updates } = payload;
        await supabase.from('student_notes').update(updates as any).eq('id', id);
      } else if (item.action === 'delete') {
        await supabase.from('student_notes').delete().eq('id', payload.id);
      }
      await removePendingNoteAction(item.id);
    } catch (err) {
      console.warn('[SyncPending] فشل مزامنة ملاحظة:', item.id, err);
    }
  }

  // مزامنة الأسئلة المحفوظة
  const pendingQuestions = await getPendingSavedQuestionActions();
  for (const item of pendingQuestions) {
    try {
      const payload = JSON.parse(item.payload);
      if (item.action === 'create') {
        await supabase.from('saved_questions').insert([payload]);
      } else if (item.action === 'delete') {
        await supabase.from('saved_questions').delete().eq('id', payload.id);
      }
      await removePendingSavedQuestionAction(item.id);
    } catch (err) {
      console.warn('[SyncPending] فشل مزامنة سؤال:', item.id, err);
    }
  }
}
