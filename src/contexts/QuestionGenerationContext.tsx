import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { adminApi, aiApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { useToast } from '@/hooks/use-toast';

interface GenerationTask {
  id: string;
  lesson_id: string;
  task_type: 'questions' | 'summary' | 'text' | 'comprehensive';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: any;
  error?: string;
  question_type?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface QuestionGenerationContextType {
  tasks: GenerationTask[];
  activeTasks: GenerationTask[];
  startGeneration: (lessonId: string, taskType: string, questionType?: string) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  onGenerationComplete?: (lessonId: string) => void;
}

const QuestionGenerationContext = createContext<QuestionGenerationContextType | undefined>(undefined);

export const QuestionGenerationProvider: React.FC<{ 
  children: React.ReactNode;
  onGenerationComplete?: (lessonId: string) => void;
}> = ({ children, onGenerationComplete }) => {
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const { toast } = useToast();

  const refreshTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('question_generation_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to refresh generation tasks:', err);
    }
  }, []);

  // Poll for task updates every 10 seconds (only while visible) to save battery/data
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (!interval) interval = setInterval(refreshTasks, 10000); };
    const stop = () => { if (interval) { clearInterval(interval); interval = null; } };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshTasks();
        start();
      } else {
        stop();
      }
    };

    refreshTasks();
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshTasks]);

  // Listen for realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('question_generation_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_generation_tasks'
        },
        (payload) => {
          console.log('Generation task change:', payload);
          refreshTasks();
          
          // Show notification when task completes
          if (payload.eventType === 'UPDATE' && payload.new) {
            const task = payload.new as GenerationTask;
            if (task.status === 'completed') {
              toast({
                title: '✅ اكتمل التوليد',
                description: `تم توليد ${task.task_type === 'questions' ? 'الأسئلة' : task.task_type === 'summary' ? 'الملخص' : 'المحتوى'} بنجاح`,
                duration: 5000,
              });
              
              // Trigger callback to refresh lessons
              if (onGenerationComplete && task.lesson_id) {
                onGenerationComplete(task.lesson_id);
              }
            } else if (task.status === 'failed') {
              toast({
                variant: 'destructive',
                title: '❌ فشل التوليد',
                description: task.error || 'حدث خطأ أثناء التوليد',
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTasks, toast]);

  const startGeneration = useCallback(async (lessonId: string, taskType: string, questionType?: string) => {
    try {
      // Create task record
      const { data: task, error: createError } = await supabase
        .from('question_generation_tasks')
        .insert([{
          lesson_id: lessonId,
          task_type: taskType,
          status: 'pending',
          question_type: questionType
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: '🚀 بدأ التوليد',
        description: 'سيتم إشعارك عند اكتمال العملية. يمكنك التنقل بحرية في التطبيق.',
      });

      // Start processing in background
      processGenerationTask(task.id, lessonId, taskType, questionType);
      
      refreshTasks();
    } catch (err: any) {
      console.error('Failed to start generation:', err);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: err.message || 'فشل بدء عملية التوليد',
      });
    }
  }, [toast, refreshTasks]);

  const processGenerationTask = async (taskId: string, lessonId: string, taskType: string, questionType?: string) => {
    try {
      // Check if task was cancelled before starting
      const { data: taskCheck } = await supabase
        .from('question_generation_tasks')
        .select('status')
        .eq('id', taskId)
        .single();
      
      if (taskCheck?.status === 'cancelled') {
        console.log('Task was cancelled before processing started');
        return;
      }

      // Update status to processing
      await supabase
        .from('question_generation_tasks')
        .update({ status: 'processing', progress: 10 })
        .eq('id', taskId);

      // Get lesson data directly by ID (more reliable than searching in array)
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();
      
      if (lessonError) {
        console.error('Error fetching lesson:', lessonError);
        throw new Error('فشل في جلب بيانات الدرس');
      }
      
      if (!lesson) {
        console.error('Lesson not found with ID:', lessonId);
        throw new Error('الدرس غير موجود. قد يكون تم حذفه.');
      }

      // Use ai_thumbnails if available (optimized), otherwise use image_urls
      const imageUrls = (lesson.ai_thumbnails && lesson.ai_thumbnails.length > 0) 
        ? lesson.ai_thumbnails 
        : lesson.image_urls || [];
      
      if (imageUrls.length === 0) throw new Error('No images found');

      let result: any = null;

      // Update progress
      await supabase
        .from('question_generation_tasks')
        .update({ progress: 30 })
        .eq('id', taskId);

      // Check for cancellation before each major step
      const checkCancelled = async () => {
        const { data } = await supabase
          .from('question_generation_tasks')
          .select('status')
          .eq('id', taskId)
          .single();
        return data?.status === 'cancelled';
      };

      // Process based on task type
      if (taskType === 'summary' || taskType === 'comprehensive') {
        if (await checkCancelled()) return;
        
        const summary = await aiApi.generateSummary(imageUrls);
        result = { summary };
        
        // Save to lesson
        await adminApi.updateLesson(lessonId, { summary });
        
        await supabase
          .from('question_generation_tasks')
          .update({ progress: taskType === 'summary' ? 90 : 50 })
          .eq('id', taskId);
      }

      if (taskType === 'questions' || taskType === 'comprehensive') {
        if (await checkCancelled()) return;
        
        const qType = (questionType as any) || 'both';
        let questions: any[] = [];
        
        if (qType === 'replica') {
          questions = await aiApi.generateReplicaQuestions(imageUrls);
        } else {
          questions = await aiApi.generateQuestions(imageUrls, qType, undefined, lesson.subject_id, lesson.id);
        }
        
        if (result) {
          result.questions = questions;
        } else {
          result = { questions };
        }
        
        // Save to lesson
        await adminApi.updateLesson(lessonId, { ai_questions: questions });
        
        await supabase
          .from('question_generation_tasks')
          .update({ progress: 90 })
          .eq('id', taskId);
      }

      if (taskType === 'text' || taskType === 'comprehensive') {
        if (await checkCancelled()) return;
        
        const extractedText = await aiApi.extractText(imageUrls);
        if (result) {
          result.text = extractedText;
        } else {
          result = { text: extractedText };
        }
        
        await supabase
          .from('question_generation_tasks')
          .update({ progress: 90 })
          .eq('id', taskId);
      }

      // Final check before marking as completed
      if (await checkCancelled()) return;

      // Mark as completed
      await supabase
        .from('question_generation_tasks')
        .update({ 
          status: 'completed', 
          progress: 100, 
          result,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

    } catch (err: any) {
      console.error('Generation task failed:', err);
      
      // Check if task was cancelled during error
      const { data: taskCheck } = await supabase
        .from('question_generation_tasks')
        .select('status')
        .eq('id', taskId)
        .single();
      
      if (taskCheck?.status !== 'cancelled') {
        // تحسين رسائل الخطأ - تحويل رسائل API الإنجليزية إلى العربية
        let errorMessage = err.message || 'حدث خطأ غير متوقع';
        
        // معالجة أخطاء Gemini API
        if (errorMessage.includes('Balance') && errorMessage.includes('exhausted')) {
          errorMessage = '⚠️ نفذ رصيد API الخاص بـ Google Gemini. يرجى إضافة رصيد في حساب Google AI Studio الخاص بك.';
        } else if (errorMessage.includes('HTTP 402')) {
          errorMessage = '⚠️ نفذ رصيد API. يرجى إضافة رصيد في حساب Google AI Studio.';
        } else if (errorMessage.includes('HTTP 429')) {
          errorMessage = '⚠️ تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
        } else if (errorMessage.includes('HTTP 500') || errorMessage.includes('HTTP 503')) {
          errorMessage = '⚠️ خطأ في خادم Google Gemini. يرجى المحاولة مرة أخرى بعد قليل.';
        } else if (errorMessage.includes('API key')) {
          errorMessage = '⚠️ مفتاح API غير صحيح أو غير مفعّل. يرجى التحقق من إعدادات API.';
        } else if (errorMessage.includes('No images found')) {
          errorMessage = '⚠️ لا توجد صور للدرس. يرجى رفع صور الدرس أولاً.';
        } else if (errorMessage.includes('الدرس غير موجود')) {
          errorMessage = '⚠️ الدرس غير موجود. قد يكون تم حذفه.';
        } else if (errorMessage.includes('IDLE_TIMEOUT')) {
          errorMessage = '⏱️ انتهى الوقت المسموح لمعالجة الدرس (150 ثانية). الدرس كبير جداً. جارٍ المحاولة بدفعات أصغر. إذا استمر الفشل، يرجى المحاولة بدرس أصغر أو تقسيم الدرس.';
        }
        
        await supabase
          .from('question_generation_tasks')
          .update({ 
            status: 'failed', 
            error: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', taskId);
      }
    }
  };

  const cancelTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('question_generation_tasks')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: '🚫 تم إلغاء المهمة',
        description: 'تم إلغاء عملية التوليد بنجاح',
      });

      refreshTasks();
    } catch (err: any) {
      console.error('Failed to cancel task:', err);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: err.message || 'فشل إلغاء المهمة',
      });
    }
  }, [toast, refreshTasks]);

  const clearCompletedTasks = useCallback(async () => {
    try {
      const completedIds = tasks.filter(t => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled').map(t => t.id);
      if (completedIds.length > 0) {
        await supabase
          .from('question_generation_tasks')
          .delete()
          .in('id', completedIds);
        refreshTasks();
      }
    } catch (err) {
      console.error('Failed to clear completed tasks:', err);
    }
  }, [tasks, refreshTasks]);

  const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'processing');

  return (
    <QuestionGenerationContext.Provider value={{ 
      tasks, 
      activeTasks,
      startGeneration,
      cancelTask,
      refreshTasks,
      clearCompletedTasks,
      onGenerationComplete
    }}>
      {children}
    </QuestionGenerationContext.Provider>
  );
};

export const useQuestionGeneration = () => {
  const context = useContext(QuestionGenerationContext);
  if (context === undefined) {
    throw new Error('useQuestionGeneration must be used within QuestionGenerationProvider');
  }
  return context;
};
