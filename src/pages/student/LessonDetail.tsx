import React, { useEffect, useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CachedImage from '@/components/common/CachedImage';
import { LazyImage } from '@/components/common/LazyImage';
import { studentApi, savedQuestionsApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Lesson, StudentNote, QuizQuestion } from '@/types';
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Loader2,
  Save,
  MessageSquare,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  XCircle,
  ListChecks,
  RotateCcw,
  Minus,
  Plus,
  Moon,
  Sun,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Mic,
  Camera,
  Music,
  Download,
  Play,
  Clock3,
  Paperclip,
  Type,
  RefreshCw,
  AlignCenter,
  AlignRight,
  AlignLeft
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

import { Progress } from '@/components/ui/progress';
import { getStudentIdentifier } from '@/lib/device';
import { cn, shuffleOptions, localizeScientificText } from '@/lib/utils';
import { QuizAttempt, QuizProgress } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { db, getLessonsOffline, preloadImages } from '@/lib/offline-db';

const calculateProgressScore = (answers: number[], questions: QuizQuestion[]) =>
  answers.reduce((acc, ans, idx) => (ans === questions[idx]?.correct_option_index ? acc + 1 : acc), 0);

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const StudentLessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonNotes, setLessonNotes] = useState<StudentNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');
  const [newNoteType, setNewNoteType] = useState<StudentNote['type']>('text');
  const [newNoteMediaFile, setNewNoteMediaFile] = useState<File | null>(null);
  const [newNoteMediaPreview, setNewNoteMediaPreview] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [quizFontSize, setQuizFontSize] = useState(20);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [imageScale, setImageScale] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const panStart = React.useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const isPanning = React.useRef(false);
  const [textAlign, setTextAlign] = useState<'center' | 'right' | 'left'>('center'); // ✅ محاذاة النص (افتراضي: توسيط)
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  
  const deviceId = getStudentIdentifier();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [hasProgress, setHasProgress] = useState(false);
  const [progressData, setProgressData] = useState<QuizProgress | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<number>>(new Set());
  const [savingQuestion, setSavingQuestion] = useState(false);

  const fetchProgress = async () => {
    if (!id) return;
    try {
      const progress = await studentApi.getQuizProgress(deviceId, id);
      if (progress && !progress.is_completed) {
        setProgressData(progress);
        setHasProgress(true);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  useEffect(() => {
    if (lesson?.ai_questions) {
      // Shuffling is only done if there's no saved shuffled_questions
      if (!progressData?.shuffled_questions || progressData.shuffled_questions.length === 0) {
        const shuffled = lesson.ai_questions.map(q => shuffleOptions(q.options, q.correct_option_index));
        const finalQs = lesson.ai_questions.map((q, i) => ({
          ...q,
          options: shuffled[i].options,
          correct_option_index: shuffled[i].correct_option_index
        }));
        setShuffledQuestions(finalQs);
      } else {
        setShuffledQuestions(progressData.shuffled_questions);
      }
      fetchProgress();
    }
  }, [lesson?.ai_questions, deviceId, progressData?.id]);

  const resumeProgress = () => {
    if (progressData) {
      setCurrentQuestionIdx(progressData.current_index);
      setUserAnswers(progressData.user_answers || []);
      const qs = progressData.shuffled_questions || shuffledQuestions;
      setShuffledQuestions(qs);
      
      let newScore = 0;
      progressData.user_answers.forEach((ans, idx) => {
        if (ans === qs[idx]?.correct_option_index) {
          newScore++;
        }
      });
      setScore(newScore);
      setHasProgress(false);
    }
  };

  const startNewQuiz = async () => {
    if (deviceId && id) {
      await studentApi.deleteQuizProgress(deviceId, id);
    }
    resetQuiz();
    setShowResumeDialog(false);
  };

  const fetchAdjacentLessons = async (currentLesson: Lesson) => {
    try {
      let lessons: Lesson[] = [];
      // أولاً: من IndexedDB (يعمل بدون إنترنت)
      const cached = await getLessonsOffline(currentLesson.subject_id);
      if (cached.length > 0) {
        lessons = cached.sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
      } else if (isOnline) {
        // ثانياً: من السيرفر فقط إذا لم يكن في الكاش
        lessons = await studentApi.getLessons(currentLesson.subject_id);
      }
      const currentIndex = lessons.findIndex(l => l.id === id);
      if (currentIndex !== -1) {
        setNextLessonId(currentIndex < lessons.length - 1 ? lessons[currentIndex + 1].id : null);
        setPrevLessonId(currentIndex > 0 ? lessons[currentIndex - 1].id : null);
      }
    } catch (err) {
      console.error('Failed to fetch adjacent lessons:', err);
    }
  };

  const fetchLastAttempt = async () => {
    if (deviceId && id) {
      try {
        const attempts = await studentApi.getQuizAttempts(deviceId, id);
        if (attempts.length > 0) {
          setLastAttempt(attempts[0]);
        }
      } catch (err) {
        console.error('Failed to fetch last attempt:', err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      // إعادة تعيين جميع البيانات عند تغيير الدرس
      setLoading(true);
      setLesson(null);
      setShuffledQuestions([]);
      setCurrentQuestionIdx(0);
      setUserAnswers([]);
      setScore(0);
      setShowResult(false);
      setProgressData(null);
      setHasProgress(false);
      setShowResumeDialog(false);
      setLastAttempt(null);
      setLessonNotes([]);
      
      try {
        // محاولة الجلب من التخزين المحلي أولاً
        let data: Lesson | null = null;
        
        try {
          const offlineData = await db.lessons.get(id);
          data = offlineData || null;
          console.log('درس من التخزين المحلي:', data);
        } catch (offlineError) {
          console.log('لا يوجد درس في التخزين المحلي');
        }

        // عرض البيانات المحلية فوراً
        if (data) {
          setLesson(data);
          if (data) fetchAdjacentLessons(data);
          setLoading(false);
          // تخزين صور الدرس مسبقاً إن لم تكن مخزنة بعد
          const urls = Array.isArray(data.image_urls) ? data.image_urls : [];
          if (urls.length > 0) preloadImages(urls).catch(() => {});
        }

        // إذا كان متصل، تحديث البيانات في الخلفية
        if (isOnline) {
          const onlineData = await studentApi.getLesson(id);
          if (JSON.stringify(onlineData) !== JSON.stringify(data)) {
            data = onlineData;
            setLesson(data);
            if (data) {
              await db.lessons.put(data);
              fetchAdjacentLessons(data);
            }
          }
          // حفظ الصور في التخزين المحلي لضمان الوصول بدون إنترنت
          const onlineUrls = Array.isArray(data?.image_urls) ? data!.image_urls : [];
          if (onlineUrls.length > 0) preloadImages(onlineUrls).catch(() => {});
          
          if (deviceId) {
            const notes = await studentApi.getNotes(deviceId);
            setLessonNotes(notes.filter(n => n.lesson_id === id));
            fetchLastAttempt();
          }
        }
      } catch (err) {
        console.error('خطأ في جلب الدرس:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, deviceId, isOnline]);

  // Realtime subscription to refresh lesson when updated (e.g., questions generated)
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`lesson-detail-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lessons',
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          console.log('Lesson updated, refreshing...', payload);
          // Refresh lesson data immediately
          try {
            const data = await studentApi.getLesson(id);
            setLesson(data);
          } catch (err) {
            console.error('Failed to refresh lesson:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSaveNote = async () => {
    if (!id) return;
    if (newNoteType === 'text' && !newNoteContent.trim()) return;
    if ((newNoteType === 'image' || newNoteType === 'capture') && !newNoteMediaFile) return;

    setIsSavingNote(true);
    try {
      let mediaUrl: string | undefined;
      if (newNoteMediaFile) {
        mediaUrl = await fileToBase64(newNoteMediaFile);
      }

      const noteData: Partial<StudentNote> = {
        student_id: deviceId,
        lesson_id: id,
        lesson_title: lesson?.title,
        content: newNoteMediaFile ? newNoteMediaFile.name : newNoteContent,
        description: newNoteDescription,
        type: newNoteType === 'capture' ? 'image' : newNoteType,
        media_url: mediaUrl,
      };

      await studentApi.saveNote(noteData);

      // Refresh notes
      const allNotes = await studentApi.getNotes(deviceId);
      setLessonNotes(allNotes.filter(n => n.lesson_id === id));

      setNewNoteContent('');
      setNewNoteDescription('');
      setNewNoteMediaFile(null);
      setNewNoteMediaPreview(null);
      setNewNoteType('text');
      setIsAddingNote(false);
      toast({ title: 'تم الحفظ', description: 'تم حفظ ملاحظتك بنجاح' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في الحفظ' });
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;
    setIsSavingNote(true);
    try {
      await studentApi.deleteNote(noteId);
      setLessonNotes(prev => prev.filter(n => n.id !== noteId));
      toast({ title: 'تم الحذف', description: 'تم حذف الملاحظة بنجاح' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في الحذف' });
    } finally {
      setIsSavingNote(false);
    }
  };

  // Multimedia handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio' | 'capture') => {
    const file = e.target.files?.[0];
    if (!file || !deviceId || !id) return;

    setNewNoteType(type === 'capture' ? 'capture' : 'image');
    setNewNoteMediaFile(file);
    setNewNoteMediaPreview(URL.createObjectURL(file));
  };



  const handleAnswer = async (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIdx(idx);
    setIsAnswered(true);
    const updatedAnswers = [...userAnswers, idx];
    setUserAnswers(updatedAnswers);
    
    if (idx === shuffledQuestions[currentQuestionIdx]?.correct_option_index) {
      setScore(s => s + 1);
    }

    // Save progress to DB
    if (deviceId && id) {
      try {
        await studentApi.saveQuizProgress({
          student_id: deviceId,
          lesson_id: id,
          current_index: currentQuestionIdx,
          user_answers: updatedAnswers,
          shuffled_questions: shuffledQuestions,
          is_completed: false,
          total_questions: shuffledQuestions.length,
          score: calculateProgressScore(updatedAnswers, shuffledQuestions),
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  };

  const handleSaveQuestion = async () => {
    if (!id || !lesson) {
      console.error('Missing id or lesson:', { id, lesson });
      toast({ variant: 'destructive', title: 'خطأ', description: 'معلومات الدرس غير متوفرة' });
      return;
    }
    setSavingQuestion(true);
    try {
      console.log('Saving question:', { 
        lessonId: id, 
        questionIndex: currentQuestionIdx,
        question: shuffledQuestions[currentQuestionIdx]
      });
      
      const result = await savedQuestionsApi.saveQuestion(
        id,
        shuffledQuestions[currentQuestionIdx],
        currentQuestionIdx
      );
      
      console.log('Question saved successfully:', result);
      setSavedQuestionIds(prev => new Set(prev).add(currentQuestionIdx));
      toast({ 
        title: 'تم الحفظ بنجاح', 
        description: 'يمكنك العثور على السؤال في صفحة (ملاحظاتي) ضمن تبويب (محفوظاتي)' 
      });
    } catch (err: any) {
      console.error('Failed to save question:', err);
      toast({ variant: 'destructive', title: 'فشل الحفظ', description: err.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSavingQuestion(false);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIdx < shuffledQuestions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setSelectedOptionIdx(null);
      setIsAnswered(false);
      
      // Update progress with next index
      if (deviceId && id) {
        try {
          await studentApi.saveQuizProgress({
            student_id: deviceId,
            lesson_id: id,
            current_index: nextIdx,
            user_answers: userAnswers,
            shuffled_questions: shuffledQuestions,
            is_completed: false,
            total_questions: shuffledQuestions.length,
            score: calculateProgressScore(userAnswers, shuffledQuestions),
          });
        } catch (err) {}
      }
    } else {
      if (deviceId && id) {
        try {
          await studentApi.saveQuizAttempt({
            student_id: deviceId,
            lesson_id: id,
            score: score,
            total_questions: shuffledQuestions.length
          });
          // Mark progress as completed
          await studentApi.saveQuizProgress({
            student_id: deviceId,
            lesson_id: id,
            current_index: currentQuestionIdx,
            user_answers: userAnswers,
            shuffled_questions: shuffledQuestions,
            is_completed: true,
            total_questions: shuffledQuestions.length,
            score: calculateProgressScore(userAnswers, shuffledQuestions),
          });
          fetchLastAttempt();
        } catch (err) {
          console.error('Failed to save quiz attempt:', err);
        }
      }
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6">
      <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-4 border-primary/20 shadow-inner animate-pulse">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-3xl font-black text-primary animate-in fade-in slide-in-from-bottom-2">يرجى الانتظار قليلاً...</h3>
        <p className="text-muted-foreground font-bold italic animate-in fade-in slide-in-from-bottom-4 delay-150">يتم تجهيز صفحات الدرس وتحميل المحتوى الذكي</p>
      </div>
    </div>
  );
  if (!lesson) {
    return (
      <StudentLayout title="الدرس غير موجود" showBack>
        <div className="p-20 text-center">
           <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
           <p className="text-xl font-bold">عذراً، لم يتم العثور على الدرس</p>
           <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>الرجوع للقائمة</Button>
        </div>
      </StudentLayout>
    );
  }

  const aiQuestions = shuffledQuestions;
  const currentQuestion = aiQuestions[currentQuestionIdx];
  const imageUrls = Array.isArray(lesson.image_urls) ? lesson.image_urls : [];

  // Clean up title to avoid duplicate page numbers by removing any existing "page number" mentions first
  let displayTitle = (lesson.title || '').replace(/\s*\(?صفحة\s*\d+\)?/g, '').trim();
  if (lesson.page_number) {
    displayTitle = `${displayTitle} (صفحة ${lesson.page_number})`;
  }

  return (
    <StudentLayout 
      title={displayTitle} 
      showBack
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-20 w-full animate-fade-in">
        <Tabs defaultValue="content" className="w-full">
          {/* Stabilized Sticky Navigation Section */}
          <div className="sticky top-[5rem] z-30 pb-4 pt-1">
            {/* Main Action Capsule */}
            <div className={cn(
              "rounded-[2.5rem] shadow-2xl shadow-primary/10 p-2 mb-2 border transition-all duration-500 backdrop-blur-xl",
              isDarkMode 
                ? "bg-slate-900/95 border-slate-800 text-white" 
                : "bg-white/95 border-primary/10 text-slate-800"
            )}>
              {/* Row 1: Primary Navigation */}
              <div className="flex items-center gap-2 p-1">
                <TabsList className={cn(
                  "h-14 rounded-[1.75rem] p-1.5 flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar border-none shadow-inner",
                  isDarkMode ? "bg-slate-800/50" : "bg-slate-100/50"
                )}>
                  {[
                    { val: 'content', icon: ImageIcon, label: 'الدرس' },
                    { val: 'summary', icon: Sparkles, label: 'الملخص' },
                    { val: 'quiz', icon: HelpCircle, label: 'الاختبار' },
                    { val: 'notes', icon: FileText, label: 'ملاحظاتي' }
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.val}
                      value={tab.val} 
                      className={cn(
                        "flex-1 h-full rounded-[1.25rem] font-black text-xs transition-all gap-2 whitespace-nowrap",
                        "data-[state=active]:shadow-lg data-[state=active]:scale-[0.98]",
                        tab.val === 'content' && "data-[state=active]:bg-primary data-[state=active]:text-white",
                        tab.val === 'summary' && "data-[state=active]:bg-secondary data-[state=active]:text-white",
                        tab.val === 'quiz' && "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
                        tab.val === 'notes' && "data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                      )}
                    >
                      <tab.icon className="h-4 w-4 shrink-0" />
                      <span className="hidden xs:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={cn(
                    "h-14 w-14 rounded-[1.75rem] shrink-0 transition-all active:scale-90",
                    isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-400"
                  )} 
                  onClick={() => navigate('/student/lessons')}
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>

              {/* Row 2: Consistent Control Strip (Stability Bar) */}
              <div className={cn(
                "flex items-center justify-between gap-4 px-4 py-2 border-t mt-1 transition-colors duration-500",
                isDarkMode ? "border-slate-800/50" : "border-slate-50"
              )}>
                 <div className="flex-1 flex items-center h-10">
                    <TabsContent value="content" className="mt-0 p-0 border-none shadow-none bg-transparent w-full">
                       <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                          <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl transition-all", isDarkMode ? "bg-slate-800 hover:bg-primary/20" : "bg-slate-50 hover:bg-primary/10")} onClick={() => setImageScale(Math.min(3, imageScale + 0.2))}>
                            <Plus className="h-4 w-4 text-primary" />
                          </Button>
                          <div className={cn("px-4 h-9 flex items-center justify-center rounded-xl border min-w-[100px]", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-primary/5 border-primary/10")}>
                            <span className="text-[10px] font-black text-primary tabular-nums">زوم {Math.round(imageScale * 100)}%</span>
                          </div>
                          <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl transition-all", isDarkMode ? "bg-slate-800 hover:bg-primary/20" : "bg-slate-50 hover:bg-primary/10")} onClick={() => { const next = Math.max(1, imageScale - 0.2); setImageScale(next); if (next <= 1) setImagePan({ x: 0, y: 0 }); }}>
                            <Minus className="h-4 w-4 text-primary" />
                          </Button>
                       </div>
                    </TabsContent>
                    
                    <TabsContent value="summary" className="mt-0 p-0 border-none shadow-none bg-transparent w-full">
                       <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                          <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl transition-all", isDarkMode ? "bg-slate-800 hover:bg-secondary/20" : "bg-slate-50 hover:bg-secondary/10")} onClick={() => setFontSize(Math.max(12, fontSize - 2))}>
                            <Minus className="h-4 w-4 text-secondary" />
                          </Button>
                          <div className={cn("px-4 h-9 flex items-center justify-center rounded-xl border min-w-[100px]", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-secondary/5 border-secondary/10")}>
                            <span className="text-[10px] font-black text-secondary tabular-nums">الخط {fontSize}px</span>
                          </div>
                          <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl transition-all", isDarkMode ? "bg-slate-800 hover:bg-secondary/20" : "bg-slate-50 hover:bg-secondary/10")} onClick={() => setFontSize(Math.min(32, fontSize + 2))}>
                            <Plus className="h-4 w-4 text-secondary" />
                          </Button>
                       </div>
                    </TabsContent>

                    <TabsContent value="quiz" className="mt-0 p-0 border-none shadow-none bg-transparent w-full">
                       <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                          <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl transition-all", isDarkMode ? "bg-slate-800 hover:bg-blue-100" : "bg-slate-50 hover:bg-blue-50")} onClick={() => setQuizFontSize(Math.max(14, quizFontSize - 2))}>
                            <Minus className="h-4 w-4 text-blue-500" />
                          </Button>
                          <div className={cn("px-4 h-9 flex items-center justify-center rounded-xl border min-w-[100px]", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100")}>
                            <span className="text-[10px] font-black text-blue-500 tabular-nums">الاختبار {quizFontSize}px</span>
                          </div>
                          <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl transition-all", isDarkMode ? "bg-slate-800 hover:bg-blue-100" : "bg-slate-50 hover:bg-blue-50")} onClick={() => setQuizFontSize(Math.min(32, quizFontSize + 2))}>
                            <Plus className="h-4 w-4 text-blue-500" />
                          </Button>
                       </div>
                    </TabsContent>
                    
                    <TabsContent value="notes" className="mt-0 p-0 border-none shadow-none bg-transparent w-full">
                       <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                          <Badge variant="outline" className={cn("rounded-lg px-3 py-1.5 border-none font-black text-[10px]", isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-400")}>ملاحظات الدرس</Badge>
                       </div>
                    </TabsContent>
                 </div>

                 <div className="flex items-center gap-2">
                    <div className={cn("w-px h-6 mx-1", isDarkMode ? "bg-slate-800" : "bg-slate-100")} />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all duration-500",
                        isDarkMode ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )} 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                       {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                 </div>
              </div>
            </div>
          </div>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-8 animate-fade-in focus-visible:outline-none pt-[12rem]">
            {imageUrls.length > 0 ? (
              <div className="space-y-12">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group perspective-1000">
                    <div className={cn(
                      "rounded-[2.5rem] p-4 shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden transition-all duration-700 hover:shadow-primary/20",
                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white"
                    )}>
                      <div
                        className={cn(
                          "relative rounded-[2.5rem] overflow-hidden",
                          isDarkMode ? "bg-black/20" : "bg-slate-50"
                        )}
                        style={{ maxHeight: '85vh', cursor: imageScale > 1 ? 'grab' : 'default' }}
                        onMouseDown={(e) => {
                          if (imageScale <= 1) return;
                          isPanning.current = true;
                          panStart.current = { x: e.clientX, y: e.clientY, panX: imagePan.x, panY: imagePan.y };
                          e.preventDefault();
                        }}
                        onMouseMove={(e) => {
                          if (!isPanning.current || !panStart.current) return;
                          setImagePan({ x: panStart.current.panX + (e.clientX - panStart.current.x), y: panStart.current.panY + (e.clientY - panStart.current.y) });
                        }}
                        onMouseUp={() => { isPanning.current = false; }}
                        onMouseLeave={() => { isPanning.current = false; }}
                        onTouchStart={(e) => {
                          if (imageScale <= 1 || e.touches.length !== 1) return;
                          const t = e.touches[0];
                          panStart.current = { x: t.clientX, y: t.clientY, panX: imagePan.x, panY: imagePan.y };
                        }}
                        onTouchMove={(e) => {
                          if (!panStart.current || imageScale <= 1 || e.touches.length !== 1) return;
                          const t = e.touches[0];
                          setImagePan({ x: panStart.current.panX + (t.clientX - panStart.current.x), y: panStart.current.panY + (t.clientY - panStart.current.y) });
                          e.stopPropagation();
                        }}
                        onTouchEnd={() => { panStart.current = null; }}
                      >
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold shadow-md z-10">
                          صفحة {lesson.page_number ? lesson.page_number + i : i + 1}
                        </div>
                        <div
                          style={{
                            transform: `scale(${imageScale}) translate(${imagePan.x / imageScale}px, ${imagePan.y / imageScale}px)`,
                            transformOrigin: 'top center',
                            transition: isPanning.current ? 'none' : 'transform 0.3s ease-out',
                          }}
                        >
                          <CachedImage
                            src={url}
                            alt={`صفحة الدرس ${i + 1}`}
                            className="w-full h-auto object-contain mx-auto"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center px-6">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">محتوى الدرس الموثق</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Bottom Navigation from Image 1 */}
                <div className="flex flex-col items-center py-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/student/lessons')} 
                      className="group flex items-center gap-3 text-primary font-black text-lg hover:bg-transparent transition-all active:scale-95"
                    >
                       <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                       <span className="underline-offset-8 decoration-2 underline">الرجوع لقائمة الدروس</span>
                    </Button>
                    
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center rounded-[4rem] bg-white border border-primary/10 shadow-xl">
                 <div className="h-32 w-32 rounded-full bg-primary/5 flex items-center justify-center mb-8 relative">
                    <ImageIcon className="h-16 w-16 text-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow" />
                 </div>
                 <h3 className="text-2xl font-black text-primary mb-3">محتوى غير متوفر</h3>
                 <p className="text-slate-400 max-w-xs mx-auto text-sm font-bold">عذراً، لا توجد صور لهذا الدرس حالياً. يرجى مراجعة المعلم.</p>
              </div>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="animate-fade-in focus-visible:outline-none pt-[12rem]">
            <div className={cn(
              "rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden transition-all duration-700 border border-primary/10",
              isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"
            )}>
              {/* Content Area */}
              <div className="p-8 sm:p-12">
                 <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
                       </div>
                       <div>
                          <h3 className={cn("text-xl font-black", isDarkMode ? "text-slate-100" : "text-slate-800")}>الملخص الذكي للدرس</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">أهم النقاط والمعلومات الواردة</p>
                       </div>
                    </div>
                    
                    {/* أزرار محاذاة النص */}
                    <div className="flex items-center gap-2 shrink-0">
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setTextAlign('center')}
                         className={cn(
                           "h-10 w-10 rounded-xl transition-all",
                           textAlign === 'center' 
                             ? "bg-primary text-white hover:bg-primary/90" 
                             : "text-muted-foreground hover:bg-muted"
                         )}
                         title="توسيط النص"
                       >
                         <AlignCenter className="h-5 w-5" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setTextAlign('right')}
                         className={cn(
                           "h-10 w-10 rounded-xl transition-all",
                           textAlign === 'right' 
                             ? "bg-primary text-white hover:bg-primary/90" 
                             : "text-muted-foreground hover:bg-muted"
                         )}
                         title="محاذاة يمين"
                       >
                         <AlignRight className="h-5 w-5" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setTextAlign('left')}
                         className={cn(
                           "h-10 w-10 rounded-xl transition-all",
                           textAlign === 'left' 
                             ? "bg-primary text-white hover:bg-primary/90" 
                             : "text-muted-foreground hover:bg-muted"
                         )}
                         title="محاذاة شمال"
                       >
                         <AlignLeft className="h-5 w-5" />
                       </Button>
                    </div>
                 </div>

                 <div  dir="rtl"
                   className={cn(
                     "max-w-none leading-[2] whitespace-pre-wrap arabic-font transition-all duration-500",
                     isDarkMode ? "text-slate-300" : "text-slate-700",
                     textAlign === 'center' && "text-center",
                     textAlign === 'right' && "text-right",
                     textAlign === 'left' && "text-left"
                   )}
                   style={{ fontSize: `${fontSize}px`, unicodeBidi: "plaintext" }}
                 >
                   {lesson.summary?.trim() ? (
                     lesson.summary.split('\n').map((line, idx) => {
                       const trimmed = line.trim();
                       if (!trimmed) return <div key={idx} className="h-6" />;
                       
                       const isTitle = (trimmed.startsWith('**') && trimmed.endsWith('**')) || trimmed.endsWith(':');
                       const isListItem = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed);
                       
                       if (isTitle) {
                          return (
                            <div key={idx} className={cn(
                              "font-black mt-10 mb-6 border-r-[6px] pr-6 py-2 rounded-l-2xl shadow-sm",
                              isDarkMode ? "text-secondary border-secondary bg-secondary/5" : "text-primary border-primary bg-primary/5"
                            )}>
                              {trimmed.replace(/\*\*/g, '')}
                            </div>
                          );
                       }
                       if (isListItem) {
                          return (
                            <div key={idx} className="flex gap-4 items-start mr-4 mb-4 group animate-in slide-in-from-right-4 duration-500" style={{ transitionDelay: `${idx * 50}ms` }}>
                               <div className={cn(
                                 "mt-3 h-2.5 w-2.5 rounded-full shrink-0 transition-all duration-500 group-hover:scale-125",
                                 isDarkMode ? "bg-secondary" : "bg-primary"
                               )} />
                               <span className="flex-1 font-bold">{trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                            </div>
                          );
                       }
                       return <p key={idx} className="mb-6 text-justify font-medium">{trimmed}</p>;
                    })
                   ) : (
                     <div className="py-24 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                        <p className="text-slate-400 font-black">لا يوجد ملخص</p>
                     </div>
                   )}
                 </div>
                 
                 {/* Educational Alert Box */}
                 <div className={cn(
                   "mt-12 p-8 rounded-[2rem] border-2 border-dashed flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm",
                   isDarkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-emerald-50/50 border-emerald-100"
                 )}>
                    <div className="h-14 w-14 rounded-2xl bg-[#00a09d] text-white flex items-center justify-center shrink-0 shadow-lg">
                       <HelpCircle className="h-8 w-8" /> 
                    </div>
                    <div className="text-center sm:text-right">
                      <h4 className="font-black text-[#00a09d] text-lg mb-2">تنبيه تعليمي</h4>
                      <p className={cn("text-sm font-bold leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                        الملخص تم توليده بواسطة تطبيق الوسيلة الذكية لمساعدتك في المذاكرة، ونوصيكم بمراجعة الكتاب المدرسي والرجوع لشرح وتوضيحات معلم المادة دائماً.
                      </p>
                    </div>
                 </div>

                 {/* Bottom Navigation */}
                 <div className="flex flex-col items-center mt-12 space-y-6">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/student/lessons')} 
                      className="group flex items-center gap-3 font-black text-primary hover:bg-transparent"
                    >
                       <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                       <span className="underline underline-offset-4 decoration-2">الرجوع لقائمة الدروس</span>
                    </Button>
                    
                 </div>
              </div>
            </div>
          </TabsContent>

                {/* Quiz Tab */}
        <TabsContent value="quiz" className="animate-fade-in focus-visible:outline-none pt-[12rem]">
          {hasProgress && !showResult && userAnswers.length === 0 && (
            <Card className="mb-6 p-6 border-none shadow-xl rounded-[2.5rem] bg-secondary/10 border-2 border-secondary/20 animate-bounce-in">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <RefreshCw className="h-6 w-6 animate-spin-slow" />
                 </div>
                 <div className="flex-1">
                    <p className="font-black text-secondary">لديك محاولة لم تكتمل!</p>
                    <p className="text-xs text-secondary/70 font-bold">هل ترغب في الاستمرار من السؤال {progressData?.current_index! + 1}؟</p>
                 </div>
                 <div className="flex gap-2">
                    <Button size="sm" onClick={resumeProgress} className="rounded-xl bg-secondary hover:bg-secondary/90 font-bold">استمرار</Button>
                    <Button size="sm" variant="outline" onClick={startNewQuiz} className="rounded-xl text-secondary font-bold">بدء جديد</Button>
                 </div>
              </div>
            </Card>
          )}

          {aiQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-32 text-center rounded-[2.5rem] bg-white border-2 border-dashed border-muted shadow-sm">
               <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center mb-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground opacity-30" />
               </div>
               <h3 className="text-xl font-black text-muted-foreground mb-2">لا توجد أسئلة</h3>
               <p className="text-muted-foreground max-w-xs mx-auto text-sm">عذراً، لم يتم توليد أسئلة لهذا الدرس حالياً.</p>
            </div>
          ) : showResult ? (
            <div className="space-y-8 animate-bounce-in pb-10">
              <Card className={cn(
                "border-none shadow-2xl rounded-[2.5rem] overflow-hidden text-center relative transition-colors duration-500",
                isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white"
              )}>
                <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-primary/10 to-transparent" />
                <CardHeader className="py-16 relative z-10">
                   <div className="h-32 w-32 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500 group">
                      <Trophy className="h-16 w-16 text-amber-500 drop-shadow-lg group-hover:scale-110 transition-transform" />
                   </div>
                   <CardTitle className="text-4xl font-black text-primary mb-3">رائع جداً!</CardTitle>
                   <CardDescription className="text-muted-foreground text-lg font-bold">لقد أتممت الاختبار بنجاح، استمر في هذا التألق</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-16 relative z-10">
                   <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-16">
                      <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 transition-transform hover:scale-105">
                         <p className="text-5xl font-black text-primary mb-2 tabular-nums">{score}</p>
                         <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">إجابة صحيحة</p>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 transition-transform hover:scale-105">
                         <p className="text-5xl font-black text-slate-400 mb-2 tabular-nums">{aiQuestions.length}</p>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">إجمالي الأسئلة</p>
                      </div>
                   </div>
                   
                   <div className="flex justify-center max-w-2xl mx-auto">
                      <Button onClick={resetQuiz} className="h-18 px-10 text-xl font-black rounded-[2rem] gap-4 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all active:scale-95 group w-full max-w-sm">
                         <RotateCcw className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                         إعادة الاختبار
                      </Button>
                   </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-6">
                   <h4 className="text-xl font-black text-primary flex items-center gap-3">
                     <ListChecks className="h-6 w-6" />
                     مراجعة الأداء
                   </h4>
                   <Badge variant="outline" className="rounded-full px-4 border-primary/20 text-primary font-black">
                     تفاصيل الإجابات
                   </Badge>
                </div>
                
                {aiQuestions.map((q: any, idx: number) => {
                  const isCorrect = userAnswers[idx] === q.correct_option_index;
                  return (
                    <Card key={idx} className={cn(
                      "rounded-[2.5rem] border-2 overflow-hidden shadow-sm transition-all hover:shadow-md",
                      isCorrect ? "border-green-100 bg-white" : "border-rose-100 bg-white"
                    )}>
                      <div className="p-8 flex flex-col sm:flex-row gap-6">
                         <div className={cn(
                           "h-16 w-16 rounded-[1.25rem] shrink-0 flex items-center justify-center shadow-inner",
                           isCorrect ? "bg-green-50 text-green-500" : "bg-rose-50 text-rose-500"
                         )}>
                           {isCorrect ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                         </div>
                         <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                               <span className={cn(
                                 "text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-wider",
                                 isCorrect ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                               )}>
                                  {isCorrect ? "أصبت الهدف" : "حاول مجدداً"}
                               </span>
                               <Badge variant="outline" className="text-[10px] font-black text-muted-foreground bg-muted/30 px-4 py-1.5 rounded-full uppercase">
                                  سؤال رقم {idx + 1}
                               </Badge>
                            </div>
                            <p className="font-black text-xl leading-relaxed text-slate-800 arabic-font">{q.question}</p>
                            
                            <div className="mt-8 grid gap-3">
                               {q.options.map((opt: string, oIdx: number) => {
                                 const isSelected = userAnswers[idx] === oIdx;
                                 const isCorrectOption = q.correct_option_index === oIdx;
                                 
                                 return (
                                   <div key={oIdx} className={cn(
                                     "p-5 rounded-2xl border-2 text-base flex items-center justify-between transition-all",
                                     isCorrectOption ? "bg-green-50 border-green-200 text-green-800 font-black shadow-sm" : 
                                     isSelected ? "bg-rose-50 border-rose-200 text-rose-800 font-black" : "bg-slate-50 border-slate-100 text-slate-500"
                                   )}>
                                     <span className="flex-1 leading-snug">{opt}</span>
                                     {isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-600 mr-4" />}
                                     {isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-rose-600 mr-4" />}
                                   </div>
                                 );
                               })}
                            </div>
                         </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {lastAttempt && (
                <Card className="border-none shadow-md bg-white p-4 rounded-[2.5rem] border-2 border-primary/5 mb-6 flex items-center justify-between px-8 py-5">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                         <RotateCcw className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-0.5">آخر محاولة</p>
                        <p className="font-bold text-primary">النتيجة: {lastAttempt.score} من {lastAttempt.total_questions}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">التاريخ</p>
                      <p className="text-sm font-bold text-muted-foreground">{new Date(lastAttempt.created_at).toLocaleDateString('ar-SA')}</p>
                   </div>
                </Card>
              )}

              <Card className={cn("border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-colors duration-300", isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white")}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 bg-white border-b border-primary/10">
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="text-3xl font-black text-primary">السؤال {currentQuestionIdx + 1} <span className="text-lg font-normal text-slate-400 mx-1">من {aiQuestions.length}</span></h3>
                         <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-full border border-primary/10">اختبار ذكي</Badge>
                      </div>
                       <Progress value={((currentQuestionIdx + 1) / aiQuestions.length) * 100} className="h-3 rounded-full bg-slate-100" />
                   </div>
                </div>
                
                <CardContent className="p-10 sm:p-16">
                   <div className="flex flex-col items-center mb-12 relative">
                      <h3 
                        dir="rtl"
                        className={cn(
                          "font-black text-center leading-relaxed transition-all max-w-2xl mx-auto arabic-font",
                          isDarkMode ? "text-slate-100" : "text-slate-900"
                        )}
                        style={{ fontSize: `${quizFontSize}px`, unicodeBidi: 'plaintext' }}
                      >
                        {shuffledQuestions[currentQuestionIdx]?.question}
                      </h3>
                      {shuffledQuestions[currentQuestionIdx]?.source_reference && (
                        <div className="mt-8">
                           <Badge variant="outline" className="rounded-full px-5 py-1.5 border-primary/20 text-primary font-black bg-primary/5 uppercase tracking-widest text-[10px]">
                             {shuffledQuestions[currentQuestionIdx].source_reference}
                           </Badge>
                        </div>
                      )}
                   </div>

                   <div className="grid gap-4 max-w-3xl mx-auto">
                     {shuffledQuestions[currentQuestionIdx]?.options?.map((option: string, idx: number) => {
                       const isSelected = selectedOptionIdx === idx;
                       // CRITICAL: Only show correct/wrong indicators AFTER student has made a selection
                       const isCorrect = isAnswered && selectedOptionIdx !== null && idx === shuffledQuestions[currentQuestionIdx].correct_option_index;
                       const isWrong = isAnswered && selectedOptionIdx !== null && isSelected && idx !== shuffledQuestions[currentQuestionIdx].correct_option_index;
                       
                       return (
                         <button
                           key={idx}
                           disabled={isAnswered}
                           onClick={() => handleAnswer(idx)}
                           className={cn(
                             "relative w-full p-8 rounded-[2rem] border-2 text-right transition-all duration-300 group overflow-hidden flex items-center gap-6",
                             isDarkMode 
                               ? "bg-slate-800/50 border-slate-700 text-slate-200" 
                               : "bg-white border-slate-100 hover:border-primary/30 hover:shadow-lg text-slate-700",
                             isSelected && !isAnswered && "border-primary ring-2 ring-primary/20 bg-primary/5",
                             isCorrect && "bg-green-50 border-green-500 text-green-700 shadow-md",
                             isWrong && "bg-rose-50 border-rose-500 text-rose-700 shadow-md",
                             !isAnswered && "hover:scale-[1.02] active:scale-[0.98]"
                           )}
                         >
                            <div className={cn(
                              "h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-2xl transition-all",
                              !isAnswered && isSelected ? "bg-primary text-white" : 
                              !isAnswered ? "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary" :
                              isCorrect ? "bg-green-500 text-white" :
                              isWrong ? "bg-rose-500 text-white shadow-xl" :
                              "bg-slate-100 text-slate-400"
                            )}>
                               {String.fromCharCode(65 + idx)}
                            </div>
                            <span dir="rtl" style={{ unicodeBidi: "plaintext" }} className="flex-1 font-bold text-xl leading-snug text-right">{option}</span>
                            
                            {isCorrect && <CheckCircle2 className="h-8 w-8 text-green-500 animate-bounce-in" />}
                            {isWrong && <XCircle className="h-8 w-8 text-rose-500 animate-bounce-in" />}
                         </button>
                       );
                     })}
                   </div>

                   {isAnswered && (
                     <div className="mt-12 space-y-4 animate-slide-up">
                       {/* Correction box for True/False questions */}
                       {shuffledQuestions[currentQuestionIdx]?.type === 'true_false' && 
                        selectedOptionIdx !== null && 
                        selectedOptionIdx !== shuffledQuestions[currentQuestionIdx]?.correct_option_index && 
                        shuffledQuestions[currentQuestionIdx]?.explanation && (
                         <div className="bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200 rounded-[2rem] p-8 shadow-lg animate-bounce-in">
                           <div className="flex items-start gap-4">
                             <div className="h-14 w-14 rounded-2xl bg-rose-500 flex items-center justify-center shrink-0 shadow-lg">
                               <XCircle className="h-8 w-8 text-white" />
                             </div>
                             <div className="flex-1 space-y-3">
                               <h4 className="text-2xl font-black text-rose-700 flex items-center gap-2">
                                 تصحيح الخطأ
                               </h4>
                               <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-rose-100 shadow-sm">
                                 <p dir="rtl" style={{ unicodeBidi: "plaintext" }} className="text-slate-700 font-bold leading-relaxed text-lg whitespace-pre-wrap text-right">
                                   {localizeScientificText(shuffledQuestions[currentQuestionIdx].explanation)}
                                 </p>
                               </div>
                               <div className="flex items-center gap-2 text-sm text-rose-600 font-bold">
                                 <Sparkles className="h-4 w-4" />
                                 <span dir="rtl" style={{ unicodeBidi: "plaintext" }} className="text-right">الإجابة الصحيحة: {shuffledQuestions[currentQuestionIdx].options[shuffledQuestions[currentQuestionIdx].correct_option_index]}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}
                       
                       {(shuffledQuestions[currentQuestionIdx]?.explanation || shuffledQuestions[currentQuestionIdx]?.method || shuffledQuestions[currentQuestionIdx]?.source_reference) && (
                         <div className="flex justify-center">
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button className="h-16 w-full rounded-2xl gap-3 font-black text-lg bg-primary text-primary-foreground hover:bg-primary/90 px-10 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/40">
                                 <Sparkles className="h-6 w-6" />
                                 مرفقات وتوضيحات السؤال
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl rounded-[2.5rem] overflow-hidden arabic-font p-0 border-none shadow-2xl flex flex-col max-h-[92dvh]">
                               <div className="bg-primary p-8 text-white relative overflow-hidden shrink-0">
                                 <div className="relative z-10 flex items-center gap-5">
                                   <div className="h-14 w-14 rounded-[1.2rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
                                     <HelpCircle className="h-9 w-9 text-white" />
                                   </div>
                                   <div>
                                     <h3 className="text-2xl font-black mb-0.5">توضيحات السؤال والحل</h3>
                                     <p className="text-white/70 text-sm font-bold">كل ما تحتاجه لفهم فقرة السؤال بالتفصيل</p>
                                   </div>
                                 </div>
                                 <Sparkles className="absolute -right-8 -bottom-8 h-40 w-40 text-white/10" />
                               </div>
                               <div className="p-8 space-y-8 bg-white overflow-y-auto flex-1 min-h-0 no-scrollbar">
                                 {shuffledQuestions[currentQuestionIdx]?.explanation && (
                                   <div className="space-y-4">
                                     <div className="flex items-center gap-3 text-primary font-black text-xl">
                                       <div className="h-2 w-10 rounded-full bg-primary" />
                                       شرح وتوضيح الإجابة
                                     </div>
                                     <div className="text-slate-600 leading-relaxed font-bold bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm whitespace-pre-wrap">
                                       {localizeScientificText(shuffledQuestions[currentQuestionIdx].explanation)}
                                     </div>
                                   </div>
                                 )}
                                 
                                 {shuffledQuestions[currentQuestionIdx]?.method && (
                                   <div className="space-y-4">
                                     <div className="flex items-center gap-3 text-secondary font-black text-xl">
                                       <div className="h-2 w-10 rounded-full bg-secondary" />
                                       طريقة الوصول للحل بالتفصيل
                                     </div>
                                     <div className="bg-secondary/5 p-8 rounded-[2.5rem] border border-secondary/10 shadow-sm space-y-3">
                                       {(() => {
                                         const raw = localizeScientificText(shuffledQuestions[currentQuestionIdx].method) || "";
                                          if (!raw) return null;
                                         const byNewline = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
                                         const steps = byNewline.length > 1
                                           ? byNewline
                                           : raw.split(/(?=[٠-٩\d]+[-–]\s)/).map(s => s.trim()).filter(Boolean);
                                         return steps.map((step, i) => (
                                           <div key={i} className="flex items-start gap-3 text-slate-600 leading-relaxed font-bold">
                                             <span className="flex-1">{step}</span>
                                           </div>
                                         ));
                                       })()}
                                     </div>
                                   </div>
                                 )}

                                 {shuffledQuestions[currentQuestionIdx]?.source_reference && (
                                   <div className="space-y-4">
                                     <div className="flex items-center gap-3 text-blue-600 font-black text-xl">
                                       <div className="h-2 w-10 rounded-full bg-blue-600" />
                                       مكان فقرة الإجابة في الدرس
                                     </div>
                                     <div className="flex items-center gap-6 bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm group hover:bg-blue-100 transition-colors">
                                       <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md border border-blue-100 shrink-0 group-hover:scale-110 transition-transform">
                                         <BookOpen className="h-8 w-8 text-blue-600" />
                                       </div>
                                       <div>
                                         <p className="text-blue-900 font-black text-2xl mb-1">{shuffledQuestions[currentQuestionIdx].source_reference}</p>
                                         <p className="text-blue-600/60 text-xs font-bold uppercase tracking-widest">تجد الإجابة في هذه الصفحة</p>
                                       </div>
                                     </div>
                                   </div>
                                 )}
                               </div>
                               <div className="p-5 bg-secondary shrink-0 text-center flex justify-center shadow-[0_-4px_24px_rgba(0,0,0,0.18)]">
                                 <DialogTrigger asChild>
                                   <Button className="h-20 w-full rounded-2xl bg-white hover:bg-white/95 text-secondary font-black text-2xl shadow-2xl border-0 transition-all hover:scale-105 active:scale-95 gap-3">
                                     <span className="text-3xl">✓</span>
                                     فهمت، شكراً لك
                                   </Button>
                                 </DialogTrigger>
                               </div>
                             </DialogContent>
                           </Dialog>
                         </div>
                       )}

                       <div className="flex flex-col gap-3 justify-center">
                         <Button 
                           onClick={handleSaveQuestion}
                           disabled={savingQuestion || savedQuestionIds.has(currentQuestionIdx)}
                           variant="outline"
                           className="w-full h-16 text-lg font-black rounded-[2rem] border-2 border-primary/20 hover:bg-primary/5 text-primary shadow-lg transition-all hover:scale-105 active:scale-95 gap-2"
                         >
                            {savedQuestionIds.has(currentQuestionIdx) ? (
                              <>
                                <BookmarkCheck className="h-5 w-5" />
                                تم الحفظ
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-5 w-5" />
                                حفظ السؤال
                              </>
                            )}
                         </Button>
                         <Button 
                           onClick={nextQuestion} 
                           className="w-full h-16 text-xl font-black rounded-[2rem] bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 gap-3"
                         >
                            {currentQuestionIdx < shuffledQuestions.length - 1 ? "السؤال التالي" : "عرض النتيجة النهائية"}
                            {currentQuestionIdx < shuffledQuestions.length - 1 ? <ArrowRight className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
                         </Button>
                       </div>
                     </div>
                   )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="animate-fade-in focus-visible:outline-none space-y-8 pt-[12rem]">
          <div className="bg-gradient-to-br from-blue-50/50 to-white/50 backdrop-blur-sm rounded-[2.5rem] p-1 border border-blue-100/50 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 border-b border-blue-100 bg-white/50">
               <div className="text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                     <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                        <FileText className="h-6 w-6" />
                     </div>
                     <h2 className="text-3xl font-black text-blue-900">ملاحظاتي</h2>
                  </div>
                  <p className="text-blue-600/80 font-bold text-lg max-w-md">أضف ملاحظاتك المهمة والخاصة بك — نص أو صور أو صوت</p>
               </div>
               
               <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
                 <DialogTrigger asChild>
                    <Button className="h-16 px-10 rounded-[1.5rem] gap-4 bg-blue-600 hover:bg-blue-700 text-white font-black shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                       <Plus className="h-7 w-7" />
                       إضافة ملاحظة جديدة
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl bg-white">
                    <div className="bg-blue-600 p-10 text-white relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                       <DialogTitle className="text-3xl font-black relative z-10 mb-2">إضافة ملاحظة</DialogTitle>
                       <p className="text-blue-100 font-bold relative z-10 text-sm">اختر الطريقة التي تفضلها للتوثيق</p>
                    </div>
                    
                     <div className="p-10 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                           <button
                             onClick={() => {
                               setNewNoteType('text');
                               setNewNoteContent('');
                               setNewNoteDescription('');
                               setNewNoteMediaFile(null);
                               setNewNoteMediaPreview(null);
                             }}
                             className={cn(
                               "flex flex-col items-center justify-center gap-3 h-28 rounded-[2rem] border-2 transition-all duration-300 shadow-sm",
                               newNoteType === 'text'
                                 ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-100 scale-105"
                                 : "border-slate-100 bg-slate-50 text-slate-400 hover:border-blue-200 hover:text-blue-500"
                             )}
                           >
                              <Type className="h-8 w-8" />
                              <span className="text-xs font-black">نصية</span>
                           </button>

                           <label className="cursor-pointer group">
                             <div className={cn(
                               "flex flex-col items-center justify-center gap-3 h-28 rounded-[2rem] border-2 transition-all duration-300 shadow-sm",
                               (newNoteType === 'image' || newNoteType === 'capture')
                                 ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-100 scale-105"
                                 : "border-slate-100 bg-slate-50 text-slate-400 hover:border-blue-200 hover:text-blue-500"
                             )}>
                                <Camera className="h-8 w-8 group-hover:rotate-12 transition-transform" />
                                <span className="text-xs font-black">صورة بالكاميرا</span>
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileUpload(e, 'capture')} />
                             </div>
                           </label>
                        </div>

                        <div className="space-y-6">
                          {newNoteType === 'text' && (
                             <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
                                <div>
                                   <label className="text-xs font-black text-slate-500 mb-2 mr-1 uppercase tracking-widest block">اكتب ما يدور في ذهنك</label>
                                   <Textarea
                                     placeholder="اكتب ملاحظاتك المهمة هنا..."
                                     className="min-h-[200px] rounded-[2rem] border-2 border-slate-100 p-8 leading-relaxed resize-none focus:border-blue-600 text-lg font-medium bg-slate-50"
                                     value={newNoteContent}
                                     onChange={(e) => setNewNoteContent(e.target.value)}
                                   />
                                </div>
                             </div>
                          )}

                          {(newNoteType === 'image' || newNoteType === 'capture') && (
                            <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
                              <label className="text-xs font-black text-slate-500 mb-2 mr-1 uppercase tracking-widest block">وصف توضيحي</label>
                              <Input
                                placeholder="عن ماذا تتحدث هذه الملاحظة؟"
                                value={newNoteDescription}
                                onChange={(e) => setNewNoteDescription(e.target.value)}
                                className="h-16 rounded-2xl border-2 border-slate-100 focus:border-blue-600 px-6 font-bold bg-slate-50"
                              />
                              {newNoteMediaPreview && (
                                <div className="rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                                  <img src={newNoteMediaPreview} alt="معاينة الملاحظة" className="w-full max-h-64 object-contain" />
                                </div>
                              )}
                            </div>
                          )}
                       </div>

                       <div className="flex gap-4 pt-4">
                          <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black text-muted-foreground" onClick={() => {
                            setIsAddingNote(false);
                            setNewNoteContent('');
                            setNewNoteDescription('');
                            setNewNoteMediaFile(null);
                            setNewNoteMediaPreview(null);
                            setNewNoteType('text');
                          }}>إلغاء</Button>
                          <Button
                            onClick={handleSaveNote}
                            disabled={isSavingNote || (newNoteType === 'text' ? !newNoteContent.trim() : !newNoteMediaFile)}
                            className="flex-[2] h-16 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/30 gap-3 transition-all active:scale-95"
                          >
                             {isSavingNote ? <Loader2 className="animate-spin h-6 w-6" /> : <Save className="h-6 w-6" />}
                             حفظ الملاحظة
                          </Button>
                       </div>
                     </div>
                 </DialogContent>
               </Dialog>
            </div>

            <div className="p-10">
                {lessonNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-[2.5rem] border-4 border-dashed border-blue-100">
                     <div className="h-32 w-32 bg-blue-50 rounded-full flex items-center justify-center mb-10">
                        <MessageSquare className="h-16 w-16 text-blue-200" />
                     </div>
                     <h3 className="text-2xl font-black text-blue-900/40 mb-2">لا توجد ملاحظات حالياً</h3>
                     <p className="text-blue-600/30 font-bold mb-8">ابدأ بتوثيق رحلتك التعليمية الآن</p>
                     <Button variant="link" className="text-blue-600 font-black text-lg underline-offset-8" onClick={() => setIsAddingNote(true)}>
                        + أضف ملاحظتك الأولى للدرس
                     </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                     {lessonNotes.map((note) => (
                       <div key={note.id} className="group relative bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-8">
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                  "h-14 w-14 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6",
                                  note.type === 'text' ? "bg-blue-500 shadow-blue-200" : (note.type === 'image' || note.type === 'capture') ? "bg-purple-500 shadow-purple-200" : "bg-rose-500 shadow-rose-200"
                                )}>
                                   {note.type === 'text' && <Type className="h-7 w-7" />}
                                   {(note.type === 'image' || note.type === 'capture') && <ImageIcon className="h-7 w-7" />}
                                   {note.type === 'audio' && <Mic className="h-7 w-7" />}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-800 tracking-tight">
                                     {note.type === 'text' ? 'ملاحظة نصية' : (note.type === 'image' || note.type === 'capture') ? 'لقطة شاشة' : 'تسجيل صوتي'}
                                   </p>
                                   <p className="text-[10px] font-black text-muted-foreground mt-1 tabular-nums" dir="ltr">{new Date(note.created_at).toLocaleDateString('en-GB')}</p>
                                </div>
                             </div>
                             <Button 
                               variant="outline" 
                               size="icon" 
                               className="h-10 w-10 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                               onClick={() => handleDeleteNote(note.id)}
                             >
                                <Trash2 className="h-5 w-5" />
                             </Button>
                          </div>

                          <div className="flex-1">
                             {note.type === 'text' && (
                                <p className="text-base leading-relaxed text-slate-600 font-bold arabic-font whitespace-pre-wrap line-clamp-6">{note.content}</p>
                             )}
                             {(note.type === 'image' || note.type === 'capture') && (
                                <div className="space-y-4">
                                   <div className="rounded-[1.5rem] overflow-hidden border-4 border-slate-50 bg-slate-50 aspect-video relative group/img cursor-zoom-in shadow-inner">
                                      <LazyImage src={note.media_url || ""} alt="Note Attachment" className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-125" />
                                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                         <ZoomIn className="h-10 w-10 text-white drop-shadow-lg" />
                                      </div>
                                   </div>
                                   {note.description && <p className="text-xs font-black text-slate-500 text-center truncate">{note.description}</p>}
                                </div>
                             )}
                             {note.type === 'audio' && (
                                <div className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100">
                                   <div className="flex items-center gap-4 mb-4">
                                      <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0 border border-rose-50">
                                         <Play className="h-5 w-5 fill-current ml-1" />
                                      </div>
                                      <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                         <div className="h-full w-1/4 bg-rose-400 rounded-full animate-pulse" />
                                      </div>
                                   </div>
                                   <audio src={note.media_url} controls className="w-full h-10 filter hue-rotate-[320deg] brightness-110" />
                                   {note.description && <p className="text-[10px] text-center font-black text-slate-400 mt-4 uppercase tracking-widest">{note.description}</p>}
                                </div>
                             )}
                          </div>
                       </div>
                     ))}
                  </div>
                )}
                
                <div className="mt-12 p-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2.5rem] shadow-2xl shadow-blue-500/30 text-white flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                   <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                   <div className="h-20 w-20 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0 relative z-10">
                      <Sparkles className="h-10 w-10 text-yellow-300 drop-shadow-lg animate-pulse" />
                   </div>
                   <div className="relative z-10 text-center sm:text-right">
                      <h4 className="text-2xl font-black mb-2">تعلّم بذكاء أكثر!</h4>
                      <p className="text-base font-bold text-blue-100 leading-relaxed max-w-2xl">
                        تدوين الملاحظات ليس مجرد كتابة، بل هو استيعاب أعمق للمعلومة. ملاحظاتك هنا هي سلاحك السري للتميز في الاختبارات القادمة.
                      </p>
                   </div>
                </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation Actions at the bottom */}
      {(nextLessonId || prevLessonId) && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {prevLessonId && (
            <Button 
              onClick={() => navigate(`/student/lessons/${prevLessonId}`)} 
              variant="outline"
              className="rounded-[2rem] h-20 px-12 gap-6 text-xl font-black border-4 border-primary text-primary hover:bg-primary/5 transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto"
            >
               <ChevronLeft className="h-8 w-8 group-hover:-translate-x-2 transition-transform" />
               <span>الرجوع للدرس السابق</span>
            </Button>
          )}
          
          {nextLessonId && (
            <Button 
              onClick={() => navigate(`/student/lessons/${nextLessonId}`)} 
              className="rounded-[2rem] h-20 px-16 gap-6 text-xl font-black bg-secondary hover:bg-secondary/90 shadow-2xl shadow-secondary/30 border-4 border-white text-white transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto"
            >
               <ChevronRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
               <span>الانتقال للدرس التالي</span>
            </Button>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
      </div>
    </StudentLayout>
  );
};

export default StudentLessonDetail;
