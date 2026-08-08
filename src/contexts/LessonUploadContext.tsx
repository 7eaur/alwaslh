import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { storageApi, aiApi, adminApi } from '@/db/api';
import { DetectedPage, QuizQuestion, Lesson } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UploadTask {
  id: string;
  classId: string;
  subjectId: string;
  status: 'uploading' | 'detecting' | 'generating' | 'completed' | 'failed';
  progress: number;
  files: { url?: string, aiUrl?: string, id: string, name?: string, file?: File }[];
  detectedPages: DetectedPage[];
  error?: string;
  isArchive?: boolean;
  createdAt?: string;
}

interface LessonUploadContextType {
  tasks: Record<string, UploadTask>;
  startNewTask: (classId: string, subjectId: string, files: File[]) => string;
  retryTask: (taskId: string) => void;
  removeTask: (taskId: string) => Promise<void>;
  updateTaskPages: (taskId: string, pages: DetectedPage[]) => Promise<void>;
  patchTaskPage: (taskId: string, pageId: string, updates: Partial<DetectedPage>) => Promise<void>;
  reanalyzePage: (taskId: string, pageId: string) => Promise<void>;
  reanalyzePages: (taskId: string, pageIds: string[]) => Promise<void>;
  reanalyzingPageIds: Set<string>;
  completedPageIds: Set<string>;
  clearCompletedPageIds: () => void;
  saveLessonFromTask: (taskId: string, title: string, summary: string | null, pageNumber: number, questions: QuizQuestion[], selectedPageIds: string[]) => Promise<Lesson>;
  batchSaveLessons: (taskId: string, lessonsToSave: { title: string, page_number: number, selectedPageIds: string[] }[]) => Promise<void>;
  isSavingBulk: boolean;
  saveReport: { lesson: string, success: boolean }[];
  clearSaveReport: () => void;
  refreshTasks: () => Promise<void>;
}

const LessonUploadContext = createContext<LessonUploadContextType | undefined>(undefined);

export const LessonUploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Record<string, UploadTask>>({});
  const { toast } = useToast();

  const [reanalyzingPageIds, setReanalyzingPageIds] = useState<Set<string>>(new Set());
  const [completedPageIds, setCompletedPageIds] = useState<Set<string>>(new Set());
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [saveReport, setSaveReport] = useState<{ lesson: string, success: boolean }[]>([]);

  const clearCompletedPageIds = useCallback(() => {
    setCompletedPageIds(new Set());
  }, []);

  const clearSaveReport = useCallback(() => {
    setSaveReport([]);
  }, []);

  const syncTaskToDb = async (task: UploadTask) => {
    try {
      // Don't sync until we have at least some uploaded files or detected pages
      const dbTask = {
        id: task.id,
        class_id: task.classId,
        subject_id: task.subjectId,
        status: task.status,
        progress: task.progress,
        // Don't store the actual File object
        files: task.files.map(f => ({ id: f.id, url: f.url, aiUrl: f.aiUrl, name: f.name || (f.file ? f.file.name : 'Unknown') })),
        detected_pages: task.detectedPages,
        error: task.error
      };

      const existingTasks = await adminApi.getUploadTasks();
      const exists = existingTasks.find(t => t.id === task.id);

      if (exists) {
        await adminApi.updateUploadTask(task.id, dbTask);
      } else {
        await adminApi.createUploadTask(dbTask);
      }
    } catch (err) {
      console.warn('Failed to sync task to DB:', err);
    }
  };

  const updateTask = useCallback((taskId: string, updates: Partial<UploadTask>) => {
    setTasks(prev => {
      const updated = { ...prev[taskId], ...updates };
      // Async sync to DB
      syncTaskToDb(updated);
      return {
        ...prev,
        [taskId]: updated
      };
    });
  }, []);

  const runTask = useCallback(async (taskId: string, task: UploadTask) => {
    try {
      // 1. Parallel Upload with Concurrency Pool
      updateTask(taskId, { status: 'uploading', progress: 5 });
      const totalFiles = task.files.length;
      let uploadedCount = task.files.filter(f => f.url).length;
      const CONCURRENCY_LIMIT = 6;

      const results: { url?: string, aiUrl?: string, id: string, name?: string, file?: File }[] = [...task.files];
      const queue = task.files.map((f, i) => ({ index: i, f })).filter(item => !item.f.url);
      
      let lastProgressUpdate = 0;
      const THROTTLE_MS = 500;

      const worker = async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) break;
          const { index, f: fileEntry } = item;

          if (fileEntry.file) {
            let retryCount = 0;
            const maxRetries = 2;
            
            while (retryCount <= maxRetries) {
              try {
                const { url, aiUrl } = await storageApi.uploadLessonImage(fileEntry.file);
                results[index] = { ...fileEntry, url, aiUrl };
                uploadedCount++;
                
                const now = Date.now();
                if (now - lastProgressUpdate > THROTTLE_MS || uploadedCount === totalFiles) {
                  const uploadProgress = 5 + (uploadedCount / totalFiles) * 45;
                  updateTask(taskId, { progress: uploadProgress });
                  lastProgressUpdate = now;
                }
                break;
              } catch (err: any) {
                retryCount++;
                if (retryCount > maxRetries) throw err;
                await new Promise(r => setTimeout(r, 1000 * retryCount));
              }
            }
          }
        }
      };

      if (queue.length > 0) {
        await Promise.all(
          Array.from({ length: Math.min(CONCURRENCY_LIMIT, queue.length) }).map(worker)
        );
      }

      const finalUploadedResults = results.filter(f => f.url);

      if (finalUploadedResults.length === 0) throw new Error('فشل رفع جميع الصور');

      // 2. Detect Pages (AI Analysis) with retry logic
      updateTask(taskId, { status: 'detecting', progress: 55 });
      
      // Use aiUrl if available for detection to save memory
      const aiUrls = finalUploadedResults.map(f => f.aiUrl || f.url!).filter(Boolean);
      
      let detections: any[] = [];
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          detections = await aiApi.detectPages(aiUrls);
          break; // Success, exit retry loop
        } catch (err: any) {
          retryCount++;
          console.error(`Detection attempt ${retryCount} failed:`, err);
          
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
            console.log(`Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Update progress to show retry
            updateTask(taskId, { 
              status: 'detecting', 
              progress: 55 + (retryCount * 10),
              error: `جاري إعادة المحاولة (${retryCount}/${maxRetries})...`
            });
          } else {
            // All retries failed
            throw new Error(`فشل التحليل بعد ${maxRetries} محاولات. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.`);
          }
        }
      }
      
      const mappedDetections = detections
        .map((d, i) => ({
          ...d,
          id: finalUploadedResults[i].id,
          imageUrl: finalUploadedResults[i].url!,
          aiUrl: finalUploadedResults[i].aiUrl
        }))
        .sort((a, b) => {
          if (a.page_number && b.page_number) return a.page_number - b.page_number;
          const indexA = finalUploadedResults.findIndex(f => f.id === a.id);
          const indexB = finalUploadedResults.findIndex(f => f.id === b.id);
          return indexA - indexB;
        });

      updateTask(taskId, { 
        status: 'completed', 
        detectedPages: mappedDetections, 
        progress: 100,
        error: undefined // Clear any retry messages
      });

      toast({
        title: 'اكتمل التحليل',
        description: 'تم رفع وتحليل الصفحات بنجاح، يمكنك الآن مراجعتها وحفظ الدروس.',
      });
    } catch (err: any) {
      console.error('Task error:', err);
      updateTask(taskId, { status: 'failed', error: err.message, progress: 0 });
      toast({
        variant: 'destructive',
        title: 'فشل العملية',
        description: err.message,
      });
    }
  }, [updateTask, toast]);

  const refreshTasks = useCallback(async () => {
    try {
      const dbTasks = await adminApi.getUploadTasks();
      const mapped: Record<string, UploadTask> = {};
      
      dbTasks.forEach(t => {
        mapped[t.id] = {
          id: t.id,
          classId: t.class_id,
          subjectId: t.subject_id,
          status: t.status,
          progress: t.progress,
          files: t.files || [],
          detectedPages: t.detected_pages || [],
          error: t.error,
          isArchive: true,
          createdAt: t.created_at
        };
      });
      
      setTasks(prev => {
        const next = { ...prev, ...mapped };
        
        // Auto-resume "detecting" tasks if they aren't already running in memory
        Object.keys(next).forEach(taskId => {
          const task = next[taskId];
          const isInMemory = !!prev[taskId];
          
          if (task.status === 'detecting' && !isInMemory) {
            console.log('Resuming detecting task:', taskId);
            runTask(taskId, task);
          } else if (task.status === 'uploading' && !isInMemory) {
            // We can't resume uploading without Files, so mark as failed so user can retry/remove
            updateTask(taskId, { status: 'failed', error: 'توقفت عملية الرفع، يرجى إعادة المحاولة' });
          }
        });
        
        return next;
      });
    } catch (err) {
      console.error('Refresh tasks failed:', err);
    }
  }, [runTask, updateTask]);

  const startNewTask = (classId: string, subjectId: string, files: File[]) => {
    const taskId = crypto.randomUUID();
    const newTask: UploadTask = {
      id: taskId,
      classId,
      subjectId,
      status: 'uploading',
      progress: 0,
      files: files.map(f => ({ file: f, id: crypto.randomUUID(), name: f.name })),
      detectedPages: [],
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => ({ ...prev, [taskId]: newTask }));
    runTask(taskId, newTask);
    return taskId;
  };

  const retryTask = (taskId: string) => {
    const task = tasks[taskId];
    if (task) runTask(taskId, task);
  };

  const removeTask = async (taskId: string) => {
    try {
      await adminApi.deleteUploadTask(taskId);
    } catch (err) {}
    setTasks(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const updateTaskPages = async (taskId: string, pages: DetectedPage[]) => {
    updateTask(taskId, { detectedPages: pages });
  };

  const patchTaskPage = async (taskId: string, pageId: string, updates: Partial<DetectedPage>) => {
    setTasks(prev => {
      const task = prev[taskId];
      if (!task) return prev;
      
      const updatedPages = task.detectedPages.map(p => 
        p.id === pageId ? { ...p, ...updates } : p
      );
      
      const updated = { ...task, detectedPages: updatedPages };
      syncTaskToDb(updated);
      return { ...prev, [taskId]: updated };
    });
  };

  const reanalyzePage = useCallback(async (taskId: string, pageId: string) => {
    // Using a ref or simply tasks state is fine in a provider that's high up
    const task = tasks[taskId];
    if (!task) return;
    const page = task.detectedPages.find(p => p.id === pageId);
    if (!page) return;

    setReanalyzingPageIds(prev => {
      const next = new Set(prev);
      next.add(pageId);
      return next;
    });
    
    try {
      const results = await aiApi.detectPages([page.imageUrl]);
      const newResult = results[0];
      
      await patchTaskPage(taskId, pageId, { 
        title: newResult.title, 
        page_number: newResult.page_number, 
        content_preview: newResult.content_preview 
      });

      setCompletedPageIds(prev => {
        const next = new Set(prev);
        next.add(pageId);
        return next;
      });

      // Clear the completion status after 10 seconds automatically
      setTimeout(() => {
        setCompletedPageIds(prev => {
          const next = new Set(prev);
          next.delete(pageId);
          return next;
        });
      }, 10000);
      
      toast({ 
        title: '✅ تم إعادة التحليل', 
        description: `تم تحديث بيانات الصفحة ${newResult.page_number ? `(ص ${newResult.page_number})` : ''} بنجاح.` 
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'فشل إعادة التحليل', description: err.message });
    } finally {
      setReanalyzingPageIds(prev => {
        const next = new Set(prev);
        next.delete(pageId);
        return next;
      });
    }
  }, [tasks, patchTaskPage, toast]);

  const reanalyzePages = useCallback(async (taskId: string, pageIds: string[]) => {
    // Run them sequentially to show individual toasts
    for (const pageId of pageIds) {
      await reanalyzePage(taskId, pageId);
    }
  }, [reanalyzePage]);

  const saveLessonFromTask = async (
    taskId: string, 
    title: string, 
    summary: string | null, 
    pageNumber: number, 
    questions: QuizQuestion[],
    selectedPageIds: string[]
  ): Promise<Lesson> => {
    const task = tasks[taskId];
    if (!task) throw new Error('المهمة غير موجودة');

    const selectedPages = task.detectedPages.filter(p => selectedPageIds.includes(p.id!));
    const imageUrls = selectedPages.map(p => p.imageUrl);
    const aiThumbnails = selectedPages.map(p => p.aiUrl).filter(Boolean) as string[];

    const created = await adminApi.createLesson({
      subject_id: task.subjectId,
      title,
      summary: summary || null,
      page_number: pageNumber,
      image_urls: imageUrls,
      ai_thumbnails: aiThumbnails,
      ai_questions: questions || [],
    });

    // Keep the task archived - don't delete it
    // Admin can return to it later to create lessons in different ways
    toast({
      title: '✅ تم حفظ الدرس',
      description: 'تم حفظ الدرس بنجاح. يمكنك العودة للأعمال السابقة في أي وقت.',
    });
    return created;
  };

  const batchSaveLessons = async (
    taskId: string,
    lessonsToSave: { title: string, page_number: number, selectedPageIds: string[] }[]
  ) => {
    const task = tasks[taskId];
    if (!task) return;
    
    setIsSavingBulk(true);
    setSaveReport([]);
    
    for (const l of lessonsToSave) {
      try {
        const selectedPages = task.detectedPages.filter(p => l.selectedPageIds.includes(p.id!));
        const imageUrls = selectedPages.map(p => p.imageUrl);
        const aiThumbnails = selectedPages.map(p => p.aiUrl).filter(Boolean) as string[];

        await adminApi.createLesson({
          subject_id: task.subjectId,
          title: l.title,
          summary: null,
          page_number: l.page_number,
          image_urls: imageUrls,
          ai_thumbnails: aiThumbnails,
          ai_questions: [],
        });
        
        setSaveReport(prev => [...prev, { lesson: l.title, success: true }]);
        toast({ title: '✅ تم إنشاء الدرس', description: `تم حفظ درس "${l.title}" بنجاح.` });
      } catch (err: any) {
        setSaveReport(prev => [...prev, { lesson: l.title, success: false }]);
        toast({ variant: 'destructive', title: '❌ فشل حفظ الدرس', description: `فشل حفظ درس "${l.title}": ${err.message}` });
      }
    }
    
    // Keep the task archived - don't delete it
    // Admin can return to it later to create more lessons
    toast({
      title: '✅ اكتمل الحفظ الجماعي',
      description: 'تم حفظ جميع الدروس. يمكنك العودة للأعمال السابقة في أي وقت.',
    });
    
    setIsSavingBulk(false);
  };

  return (
    <LessonUploadContext.Provider value={{ 
      tasks, 
      startNewTask, 
      retryTask, 
      removeTask, 
      updateTaskPages, 
      patchTaskPage, 
      reanalyzePage, 
      reanalyzePages, 
      reanalyzingPageIds, 
      completedPageIds,
      clearCompletedPageIds,
      saveLessonFromTask, 
      batchSaveLessons,
      isSavingBulk,
      saveReport,
      clearSaveReport,
      refreshTasks 
    }}>
      {children}
    </LessonUploadContext.Provider>
  );
};

export const useLessonUpload = () => {
  const context = useContext(LessonUploadContext);
  if (context === undefined) {
    throw new Error('useLessonUpload must be used within a LessonUploadProvider');
  }
  return context;
};
