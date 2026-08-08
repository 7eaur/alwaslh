import React, { useEffect, useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { studentApi, savedQuestionsApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { removeCache } from '@/lib/offline-cache';
import { 
  FileQuestion, 
  HelpCircle, 
  ChevronLeft, 
  Sparkles, 
  Trophy, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  ListChecks,
  Play,
  Clock,
  Minus,
  Plus,
  Moon,
  Sun,
  ArrowRight,
  BookOpen,
  Layout,
  Search,
  Layers,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  ImageIcon,
  Filter,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn, shuffleOptions, localizeScientificText } from '@/lib/utils';
import { getStudentIdentifier } from '@/lib/device';
import { useNavigate } from 'react-router-dom';
import { QuizAttempt, QuizProgress, QuizQuestion } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import CachedImage from '@/components/common/CachedImage';
import { preloadImages } from '@/lib/offline-db';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { 
  getQuizzesOffline, 
  getClassesOffline, 
  getSubjectsOffline,
  saveQuizzesOffline,
  saveClassesOffline,
  saveSubjectsOffline
} from '@/lib/offline-db';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useAccess } from '@/context/AccessContext';

const StudentQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const { canAccessContent } = useAccessControl();
  const { hasFullAccess, activatedClassIds } = useAccess();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, QuizAttempt>>({});
  const [versionAttempts, setVersionAttempts] = useState<Record<string, Record<string, QuizAttempt>>>({});
  const [lastAccessDates, setLastAccessDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [quizStartLoading, setQuizStartLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const deviceId = getStudentIdentifier();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState(22);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isOnline = useOnlineStatus();
  
  // Quiz Player State
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState<any | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [hasProgress, setHasProgress] = useState(false);
  const [progressData, setProgressData] = useState<QuizProgress | null>(null);
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<number>>(new Set());
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [versionDialogQuizId, setVersionDialogQuizId] = useState<string | null>(null);

  const fetchProgress = async (quizId: string) => {
    // deviceId always exists
    try {
      const progress = await studentApi.getQuizProgress(deviceId, undefined, quizId);
      if (progress && !progress.is_completed) {
        setProgressData(progress);
        setHasProgress(true);
      } else {
        setHasProgress(false);
        setProgressData(null);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const resumeProgress = () => {
    if (progressData && activeQuiz) {
      setCurrentIdx(progressData.current_index);
      setUserAnswers(progressData.user_answers || []);
      const qs = progressData.shuffled_questions || activeQuestions;
      setActiveQuestions(qs);
      
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
    if (deviceId && activeQuiz?.id) {
      await studentApi.deleteQuizProgress(deviceId, undefined, activeQuiz.id);
    }
    setCurrentIdx(0);
    setScore(0);
    setShowResults(false);
    setIsAnswered(false);
    setSelectedIdx(null);
    setUserAnswers([]);
    setHasProgress(false);
  };

  const fetchData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      // ① عرض البيانات المحفوظة فوراً من IndexedDB + localStorage (بدون انتظار السيرفر)
      if (!showToast) {
        try {
          const [cachedQuizzes, cachedClasses, cachedSubjects] = await Promise.all([
            getQuizzesOffline(),
            getClassesOffline(),
            getSubjectsOffline(),
          ]);
          if (cachedQuizzes.length > 0 || cachedClasses.length > 0) {
            setQuizzes(cachedQuizzes);
            setClasses(cachedClasses);
            setSubjects(cachedSubjects);
            setLoading(false); // إخفاء loading فوراً بعد عرض المحفوظ
          }
        } catch {
          // تجاهل أخطاء IndexedDB
        }

        // ① ب — تحميل آخر دخول وأعلى درجة من localStorage (يعمل بدون إنترنت)
        if (deviceId) {
          try {
            const cachedAttempts = localStorage.getItem(`quiz_attempts_${deviceId}`);
            const cachedVersionAttempts = localStorage.getItem(`quiz_version_attempts_${deviceId}`);
            const cachedAccessDates = localStorage.getItem(`quiz_access_dates_${deviceId}`);
            if (cachedAttempts) setAttempts(JSON.parse(cachedAttempts));
            if (cachedVersionAttempts) setVersionAttempts(JSON.parse(cachedVersionAttempts));
            if (cachedAccessDates) setLastAccessDates(JSON.parse(cachedAccessDates));
          } catch { /* تجاهل أخطاء localStorage */ }
        }
      }

      if (!isOnline) {
        if (showToast) {
          toast({ variant: 'destructive', title: 'لا يوجد اتصال', description: 'يرجى التحقق من اتصال الإنترنت' });
        }
        return;
      }

      // مسح كاش localStorage للبيانات الأساسية لضمان عدم عرض بيانات قديمة/فارغة
      removeCache('student_classes');
      removeCache('student_subjects_all');

      // ② تحديث من السيرفر في الخلفية
      const [onlineQuizData, onlineClassData, onlineSubjectData] = await Promise.all([
        studentApi.getQuizzes(),
        studentApi.getClasses(),
        studentApi.getSubjects(),
      ]);

      // تحديث الحالة فقط إذا أعاد السيرفر بيانات فعلية (لتجنب إخفاء الاختبارات المعروضة)
      if (onlineQuizData.length > 0) setQuizzes(onlineQuizData);
      if (onlineClassData.length > 0) setClasses(onlineClassData);
      if (onlineSubjectData.length > 0) setSubjects(onlineSubjectData);

      // حفظ في IndexedDB للتصفح دون إنترنت
      await Promise.all([
        saveQuizzesOffline(onlineQuizData),
        saveClassesOffline(onlineClassData),
        saveSubjectsOffline(onlineSubjectData),
      ]);

      // تحميل مسبق لصور الدروس في ذاكرة المتصفح لضمان ظهورها بلا إنترنت
      if (onlineQuizData.length > 0) {
        const imageUrls = new Set<string>();
        onlineQuizData.forEach((quiz: any) => {
          // صور من النماذج
          quiz.versions?.forEach((v: any) => {
            if (v.lesson_image_url) imageUrls.add(v.lesson_image_url);
            v.questions?.forEach((q: any) => {
              if (q.lesson_page_url) imageUrls.add(q.lesson_page_url);
            });
          });
          // صور من الأسئلة الأساسية
          quiz.questions?.forEach((q: any) => {
            if (q.lesson_page_url) imageUrls.add(q.lesson_page_url);
          });
        });
        // تحميل الصور في الخلفية (لا ننتظرها)
        imageUrls.forEach(url => { const img = new Image(); img.src = url; });
      }

      // جلب محاولات الطالب
      if (deviceId) {
        const attemptData = await studentApi.getQuizAttempts(deviceId);
        const attemptMap: Record<string, QuizAttempt> = {};
        const vAttemptMap: Record<string, Record<string, QuizAttempt>> = {};
        attemptData.forEach(a => {
          if (a.quiz_id) {
            if (!attemptMap[a.quiz_id] || new Date(a.created_at) > new Date(attemptMap[a.quiz_id].created_at)) {
              attemptMap[a.quiz_id] = a;
            }
            const vName = a.version_name || "النموذج الأصلي";
            if (!vAttemptMap[a.quiz_id]) vAttemptMap[a.quiz_id] = {};
            if (!vAttemptMap[a.quiz_id][vName] || new Date(a.created_at) > new Date(vAttemptMap[a.quiz_id][vName].created_at)) {
              vAttemptMap[a.quiz_id][vName] = a;
            }
          }
        });
        setAttempts(attemptMap);
        setVersionAttempts(vAttemptMap);

        // بناء خريطة آخر دخول من quiz_progress (تشمل الاختبارات غير المكتملة)
        const accessMap: Record<string, string> = {};
        // إضافة تواريخ المحاولات المكتملة أولاً
        Object.entries(attemptMap).forEach(([quizId, a]) => {
          accessMap[quizId] = a.created_at;
        });
        // جلب جميع سجلات التقدم للطالب (لإظهار آخر دخول حتى للاختبارات غير المكتملة)
        try {
          const { data: progressRows } = await supabase
            .from('quiz_progress')
            .select('quiz_id, updated_at, created_at')
            .eq('student_id', deviceId)
            .not('quiz_id', 'is', null);
          if (progressRows) {
            progressRows.forEach((p: any) => {
              if (p.quiz_id) {
                const progressDate = p.updated_at || p.created_at;
                if (!accessMap[p.quiz_id] || new Date(progressDate) > new Date(accessMap[p.quiz_id])) {
                  accessMap[p.quiz_id] = progressDate;
                }
              }
            });
          }
        } catch { /* تجاهل أخطاء quiz_progress */ }
        setLastAccessDates(accessMap);

        // حفظ المحاولات وآخر دخول في localStorage لعرضها أوفلاين
        try {
          localStorage.setItem(`quiz_attempts_${deviceId}`, JSON.stringify(attemptMap));
          localStorage.setItem(`quiz_version_attempts_${deviceId}`, JSON.stringify(vAttemptMap));
          localStorage.setItem(`quiz_access_dates_${deviceId}`, JSON.stringify(accessMap));
        } catch { /* تجاهل أخطاء localStorage */ }
      }

      if (showToast) {
        toast({ title: '✓ تم التحديث', description: 'تم تحديث قائمة الاختبارات بنجاح' });
      }
    } catch (err: any) {
      console.error('❌ [Quizzes] خطأ في جلب البيانات:', err);
      if (showToast) {
        toast({ variant: 'destructive', title: 'خطأ في التحديث', description: err.message || 'فشل تحديث البيانات' });
      }
    } finally {
      setLoading(false);
      if (showToast) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, isOnline]);

  // تحميل مسبق لصورة الدرس المرتبطة بالسؤال الحالي والتالي + تخزينها في IndexedDB
  useEffect(() => {
    if (!activeQuestions.length) return;
    const preloadUrls: string[] = [];
    // صورة السؤال الحالي
    const curUrl = currentVersion?.lesson_image_url || activeQuestions[currentIdx]?.lesson_page_url;
    if (curUrl) preloadUrls.push(curUrl);
    // صورة السؤال التالي (تحميل استباقي)
    const nextUrl = activeQuestions[currentIdx + 1]?.lesson_page_url;
    if (nextUrl) preloadUrls.push(nextUrl);

    // تخزين في IndexedDB للعمل بدون إنترنت
    preloadImages(preloadUrls);

    // تحميل متصفحي عادي أيضاً
    preloadUrls.forEach(url => {
      const img = new Image();
      img.fetchPriority = 'high';
      img.src = url;
    });
  }, [currentIdx, activeQuestions, currentVersion]);

  // مراقبة التغييرات الفورية في الاختبارات والمواد والصفوف عبر Realtime
  useEffect(() => {
    if (!isOnline) return;

    const channel = supabase
      .channel('quizzes-realtime-student')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quizzes' },
        async () => {
          // تحديث فوري عند إضافة أو تعديل أو حذف اختبار
          try {
            const freshQuizzes = await studentApi.getQuizzes();
            if (freshQuizzes.length > 0 || quizzes.length > 0) {
              setQuizzes(freshQuizzes);
              await saveQuizzesOffline(freshQuizzes);
            }
          } catch (err) {
            console.warn('⚠️ [Quizzes Realtime] فشل تحديث الاختبارات:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subjects' },
        async () => {
          try {
            const freshSubjects = await studentApi.getSubjects();
            setSubjects(freshSubjects);
            await saveSubjectsOffline(freshSubjects);
          } catch (err) {
            console.warn('⚠️ [Quizzes Realtime] فشل تحديث المواد:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes' },
        async () => {
          try {
            const freshClasses = await studentApi.getClasses();
            setClasses(freshClasses);
            await saveClassesOffline(freshClasses);
          } catch (err) {
            console.warn('⚠️ [Quizzes Realtime] فشل تحديث الصفوف:', err);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOnline]);

  const startQuiz = async (quiz: any, versionIdx?: number) => {
    // التحقق من إمكانية الوصول
    const subjectClassId = subjects.find((s: any) => s.id === quiz.subject_id)?.class_id || '';
    const hasAccess = canAccessContent(subjectClassId);
    if (!hasAccess) {
      toast({
        variant: "destructive",
        title: "اختبار مقفل 🔒",
        description: "يرجى تفعيل الصف للوصول لهذا الاختبار",
      });
      return;
    }

    setQuizStartLoading(true);
    try {
    // جلب الاختبار الكامل (مع versions وquestions) من السيرفر مباشرة
    let fullQuiz = quiz;
    try {
      const fetched = await studentApi.getQuizById(quiz.id);
      if (fetched) fullQuiz = fetched;
    } catch (err) {
      console.warn('⚠️ [Quiz] تعذّر جلب الاختبار من السيرفر، سيتم استخدام البيانات المحفوظة:', err);
    }

    setActiveQuiz(fullQuiz);
    setVersionDialogQuizId(null);

    // اختيار النموذج المناسب
    let baseQuestions: any[] = [];
    let version: any = { name: "النموذج الأصلي" };

    if (fullQuiz.versions && Array.isArray(fullQuiz.versions) && fullQuiz.versions.length > 0) {
      const vIdx = versionIdx !== undefined ? versionIdx : Math.floor(Math.random() * fullQuiz.versions.length);
      version = fullQuiz.versions[vIdx];
      setCurrentVersion(version);
      baseQuestions = Array.isArray(version.questions) ? version.questions : [];
      toast({ title: 'نموذج الاختبار', description: `أنت الآن تخضع لـ ${version.name}` });
    } else {
      setCurrentVersion(version);
      baseQuestions = Array.isArray(fullQuiz.questions) ? fullQuiz.questions : [];
    }

    // تصفية الأسئلة التي لا تحتوي على خيارات
    const validQuestions = baseQuestions.filter((q: any) =>
      q.options && Array.isArray(q.options) && q.options.length > 0
    );

    if (validQuestions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ في الاختبار',
        description: 'لا توجد أسئلة صالحة في هذا الاختبار. يرجى التواصل مع المدير.',
      });
      setVersionDialogQuizId(null);
      setActiveQuiz(null);
      setQuizStartLoading(false);
      return;
    }

    // خلط الخيارات
    const shuffled = validQuestions.map((q: any) => {
      const s = shuffleOptions(q.options, q.correct_option_index);
      return { ...q, options: s.options, correct_option_index: s.correct_option_index };
    });

    setActiveQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setUserAnswers([]);
    setQuizStartLoading(false);

    if (deviceId) {
      fetchProgress(fullQuiz.id);
    }
    } catch (outerErr: any) {
      console.error('❌ [Quiz] خطأ أثناء بدء الاختبار:', outerErr);
      toast({ variant: 'destructive', title: 'خطأ في تحميل الاختبار', description: 'يرجى المحاولة مرة أخرى' });
      setQuizStartLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    // إخفاء الاختبارات المحذوفة
    if (q.deleted_at) return false;
    
    // عدم عرض الاختبارات إلا بعد اختيار الصف والمادة
    if (selectedClassId === 'all' || selectedSubjectId === 'all') return false;
    
    const matchesClass = q.subjects?.class_id === selectedClassId;
    const matchesSubject = q.subject_id === selectedSubjectId;
    return matchesClass && matchesSubject;
  });

  const handleAnswer = async (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    const updatedAnswers = [...userAnswers, idx];
    setUserAnswers(updatedAnswers);
    if (idx === activeQuestions[currentIdx].correct_option_index) {
      setScore(s => s + 1);
    }

    // Save progress to DB
    if (deviceId && activeQuiz?.id) {
      try {
        await studentApi.saveQuizProgress({
          student_id: deviceId,
          quiz_id: activeQuiz.id,
          current_index: currentIdx,
          user_answers: updatedAnswers,
          shuffled_questions: activeQuestions,
          is_completed: false
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  };

  const handleSaveQuestion = async () => {
    if (!activeQuiz?.id) {
      console.error('No active quiz');
      return;
    }
    
    // For quiz questions, we need to find the lesson_id from the quiz
    // Since quizzes can have questions from multiple lessons, we'll use the quiz_id as a reference
    // But we need a lesson_id for the saved_questions table
    // Let's get the first lesson from the quiz's lessons
    const firstLessonId = activeQuiz.lesson_ids?.[0];
    if (!firstLessonId) {
      console.error('No lesson_id found in quiz:', activeQuiz);
      toast({ variant: 'destructive', title: 'خطأ', description: 'لا يمكن حفظ السؤال' });
      return;
    }
    
    setSavingQuestion(true);
    try {
      console.log('Saving quiz question:', {
        lessonId: firstLessonId,
        questionIndex: currentIdx,
        question: activeQuestions[currentIdx]
      });
      
      const result = await savedQuestionsApi.saveQuestion(
        firstLessonId,
        activeQuestions[currentIdx],
        currentIdx
      );
      
      console.log('Quiz question saved successfully:', result);
      setSavedQuestionIds(prev => new Set(prev).add(currentIdx));
      toast({ 
        title: 'تم الحفظ بنجاح', 
        description: 'يمكنك العثور على السؤال في صفحة (ملاحظاتي) ضمن تبويب (محفوظاتي)' 
      });
    } catch (err: any) {
      console.error('Failed to save quiz question:', err);
      toast({ variant: 'destructive', title: 'فشل الحفظ', description: err.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSavingQuestion(false);
    }
  };

  const nextQuestion = async () => {
    if (currentIdx < activeQuestions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedIdx(null);
      setIsAnswered(false);
      
      // Update progress with next index
      if (deviceId && activeQuiz?.id) {
        try {
          await studentApi.saveQuizProgress({
            student_id: deviceId,
            quiz_id: activeQuiz.id,
            current_index: nextIdx,
            user_answers: userAnswers,
            shuffled_questions: activeQuestions,
            is_completed: false
          });
        } catch (err) {}
      }
    } else {
      if (deviceId && activeQuiz?.id) {
        try {
          await studentApi.saveQuizAttempt({
            student_id: deviceId,
            quiz_id: activeQuiz.id,
            score: score,
            total_questions: activeQuestions.length,
            questions: activeQuestions,
            user_answers: userAnswers,
            version_name: currentVersion?.name || "النموذج الأصلي"
          });
          
          // Mark progress as completed
          await studentApi.saveQuizProgress({
            student_id: deviceId,
            quiz_id: activeQuiz.id,
            current_index: currentIdx,
            user_answers: userAnswers,
            is_completed: true
          });
          
          // Award achievements if performance is high
          const percentage = (score / activeQuestions.length) * 100;
          if (percentage >= 90) {
            const type = percentage === 100 ? 'distinction' : 'excellence';
            await studentApi.saveAchievement({
              student_id: deviceId,
              quiz_id: activeQuiz.id,
              achievement_type: type,
              points: type === 'distinction' ? 50 : 30
            });
            toast({ 
              title: type === 'distinction' ? 'وسام التميز! 🏆' : 'وسام التفوق! ⭐', 
              description: `لقد حصلت على وسام جديد لتفوقك في اختبار ${activeQuiz.title}` 
            });
          }

          fetchData();
        } catch (err) {
          console.error('Failed to save attempt:', err);
        }
      }
      setShowResults(true);
    }
  };

  return (
    <StudentLayout title="الاختبارات التفاعلية" showBack>
      <div className="space-y-6">
        <div className="p-8 rounded-[2.5rem] bg-secondary text-white shadow-xl shadow-secondary/20 flex items-center justify-between overflow-hidden relative animate-fade-in">
           <div className="relative z-10">
              <h2 className="text-3xl font-black mb-2">تحدى ذكاءك</h2>
              <p className="text-white/80 text-sm font-bold">مجموعة من الاختبارات التفاعلية المتعددة النماذج لتطوير مهاراتك.</p>
           </div>
           <Button
             onClick={() => fetchData(true)}
             disabled={refreshing}
             className="relative z-10 bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-2xl h-12 px-6 font-black shadow-lg"
             size="lg"
           >
             <RefreshCw className={cn("h-5 w-5 ml-2", refreshing && "animate-spin")} />
             {refreshing ? 'جاري التحديث...' : 'تحديث'}
           </Button>
           <Layers className="h-24 w-24 text-white/10 absolute -left-4 -bottom-4 rotate-12" />
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-in">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mr-2">
                <Layout className="h-3 w-3" />
                تصفية حسب الصف
             </label>
             <Select value={selectedClassId} onValueChange={(val) => { setSelectedClassId(val); setSelectedSubjectId('all'); }}>
                <SelectTrigger className="h-14 rounded-2xl bg-white shadow-sm border-primary/5 focus:ring-primary">
                   <SelectValue placeholder="كل الصفوف" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">كل الصفوف</SelectItem>
                   {(hasFullAccess ? classes : classes.filter((c: any) => activatedClassIds.includes(c.id))).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
             </Select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mr-2">
                <BookOpen className="h-3 w-3" />
                تصفية حسب المادة
             </label>
             <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="h-14 rounded-2xl bg-white shadow-sm border-primary/5 focus:ring-primary">
                   <SelectValue placeholder="كل المواد" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">كل المواد</SelectItem>
                   {subjects
                     .filter(s => selectedClassId === 'all' || s.class_id === selectedClassId)
                     .map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                   }
                </SelectContent>
             </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-3xl bg-muted" />)}
          </div>
        ) : selectedClassId === 'all' || selectedSubjectId === 'all' ? (
          <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in bg-white rounded-[2.5rem] border-dashed border-2 border-primary/10 shadow-inner">
             <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Filter className="h-12 w-12 text-primary opacity-20" />
             </div>
             <p className="text-xl font-bold text-primary mb-2">
               {selectedClassId === 'all' ? 'اختر الصف الدراسي أولاً' : 'اختر المادة الدراسية'}
             </p>
             <p className="text-sm text-muted-foreground">قم باختيار الصف والمادة من القوائم أعلاه لعرض الاختبارات المتاحة.</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-dashed border-2 border-primary/10 shadow-inner">
             <HelpCircle className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-10" />
             <p className="text-xl font-bold text-muted-foreground">لا توجد اختبارات متاحة حالياً وفق التصفية.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuizzes.map((quiz, qIdx) => {
              const lastAttempt = attempts[quiz.id];
              const lastAccess = lastAccessDates[quiz.id];
              const versionsCount = quiz.versions?.length || 1;
              const subjectClassId = subjects.find((s: any) => s.id === quiz.subject_id)?.class_id || '';
              const isLocked = !canAccessContent(subjectClassId);
              
              return (
                <Card 
                  key={quiz.id} 
                  className={cn(
                    "rounded-[2.5rem] border-none shadow-md hover:shadow-2xl transition-all bg-white group overflow-hidden animate-slide-in",
                    isLocked && "opacity-60"
                  )}
                  style={{ animationDelay: `${qIdx * 100}ms` }}
                >
                  <CardContent className="p-0">
                    {isLocked && (
                      <div className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-lg">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-6">
                          <div className="h-20 w-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-primary/5">
                            <Layers className="h-10 w-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                               <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary uppercase">
                                  {quiz.subjects?.name || 'مادة غير محددة'}
                               </Badge>
                               <Badge variant="outline" className="text-[9px] font-black border-secondary/20 text-secondary uppercase">
                                  {versionsCount} نماذج
                               </Badge>
                            </div>
                            <h3 className="font-black text-primary text-2xl truncate mb-1">{quiz.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                               <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/60">
                                  <ListChecks className="h-3.5 w-3.5" />
                                  متوسط {quiz.questions?.length || 0} أسئلة للنموذج
                               </div>
                               {lastAccess && (
                                 <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                                   <Clock className="h-3.5 w-3.5" />
                                   آخر دخول: {new Date(lastAccess).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                 </div>
                               )}
                               {lastAttempt && (
                                 <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                   <CheckCircle2 className="h-3.5 w-3.5" />
                                   أعلى درجة: {lastAttempt.score} / {lastAttempt.total_questions}
                                 </div>
                               )}
                            </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-2 md:self-center">
                          {quiz.versions && quiz.versions.length > 0 ? (
                            <Dialog open={versionDialogQuizId === quiz.id} onOpenChange={(open) => {
                              if (!open) setVersionDialogQuizId(null);
                            }}>
                               <DialogTrigger asChild>
                                  <Button 
                                    onClick={() => {
                                      setVersionDialogQuizId(quiz.id);
                                    }}
                                    className="rounded-2xl h-14 px-8 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3 group/btn"
                                  >
                                     <Play className="h-5 w-5 fill-current" />
                                     عرض النماذج
                                     <ChevronLeft className="h-5 w-5 group-hover/btn:-translate-x-1 transition-transform" />
                                  </Button>
                               </DialogTrigger>
                               <DialogContent className="max-w-2xl rounded-[3rem] arabic-font p-0 border-none shadow-2xl bg-white overflow-hidden">
                                  <div className="relative p-10 pt-16 text-center">
                                     <button 
                                       onClick={() => setVersionDialogQuizId(null)}
                                       className="absolute top-6 right-6 h-10 w-10 rounded-full border-2 border-muted flex items-center justify-center text-muted-foreground hover:bg-muted/10 transition-colors"
                                     >
                                        <XCircle className="h-6 w-6" />
                                     </button>
                                     
                                     <DialogHeader className="mb-12">
                                        <DialogTitle className="text-4xl font-black text-[#008b8b] mb-4">اختر نموذج الاختبار</DialogTitle>
                                        <DialogDescription className="font-bold text-muted-foreground text-xl max-w-md mx-auto leading-relaxed">
                                           يتوفر هذا الاختبار بعدة نماذج مختلفة لضمان تجربة تعليمية شاملة.
                                        </DialogDescription>
                                     </DialogHeader>

                                     <div className="space-y-4 max-h-[55vh] overflow-y-auto px-2 pb-6 custom-scrollbar">
                                        {quiz.versions.map((v: any, vIdx: number) => {
                                          const vLastAttempt = versionAttempts[quiz.id]?.[v.name];
                                          const isEven = vIdx % 2 === 0;
                                          return (
                                            <div 
                                              key={vIdx} 
                                              onClick={() => !quizStartLoading && startQuiz(quiz, vIdx)}
                                              className={cn(
                                                "relative min-h-24 rounded-[3rem] border-2 transition-all cursor-pointer flex items-center justify-between px-8 py-4 group",
                                                quizStartLoading ? "opacity-60 pointer-events-none" : "",
                                                vLastAttempt 
                                                  ? "bg-[#f0f9f9] border-[#008b8b]/30 shadow-sm" 
                                                  : "bg-white border-muted/30 hover:border-[#008b8b]/40 hover:shadow-lg"
                                              )}
                                            >
                                               {/* Question Count Badge (Orange) */}
                                               <div className="flex items-center gap-4 flex-1 min-w-0">
                                                  <div className="bg-[#ffaa44] text-white px-5 py-2 rounded-2xl font-black text-sm shadow-sm shrink-0">
                                                     {v.questions?.length || 0} سؤال
                                                  </div>
                                                  <div className="text-right flex-1 min-w-0">
                                                     <h4 className="text-xl font-black text-[#008b8b] leading-tight break-words">{v.name}</h4>
                                                     {vLastAttempt && (
                                                       <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-widest">
                                                          آخر درجة: {vLastAttempt.score} / {vLastAttempt.total_questions}
                                                       </p>
                                                     )}
                                                  </div>
                                               </div>

                                               {/* Selection Icon/Chevron */}
                                               <div className="h-14 w-14 rounded-full border-2 border-muted/20 flex items-center justify-center text-[#008b8b] group-hover:bg-[#008b8b] group-hover:text-white group-hover:border-[#008b8b] transition-all bg-white shadow-sm shrink-0">
                                                  {quizStartLoading ? <span className="h-6 w-6 rounded-full border-2 border-[#008b8b] border-t-transparent animate-spin" /> : <ChevronLeft className="h-7 w-7 group-hover:-translate-x-1 transition-transform" />}
                                               </div>
                                            </div>
                                          );
                                        })}
                                     </div>
                                  </div>
                               </DialogContent>
                            </Dialog>
                          ) : (
                            <Button 
                              onClick={() => startQuiz(quiz)} 
                              disabled={isLocked || quizStartLoading}
                              className="rounded-2xl h-14 px-10 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3 group/btn"
                            >
                               {quizStartLoading ? <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
                               بدء الاختبار
                               <ChevronLeft className="h-5 w-5 group-hover/btn:-translate-x-1 transition-transform" />
                            </Button>
                          )}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!activeQuiz} onOpenChange={(open) => !open && setActiveQuiz(null)}>
          {hasProgress && !showResults && userAnswers.length === 0 && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 rounded-[2.5rem] p-10 text-center animate-fade-in">
              <div className="max-w-md">
                 <div className="h-20 w-20 rounded-3xl bg-secondary/20 text-secondary flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="h-10 w-10 animate-spin-slow" />
                 </div>
                 <h3 className="text-2xl font-black text-primary mb-2">لديك تقدم محفوظ!</h3>
                 <p className="text-muted-foreground font-bold mb-8">هل ترغب في العودة للسؤال {progressData?.current_index! + 1} ومتابعة الحل؟</p>
                 <div className="flex flex-col gap-3">
                    <Button onClick={resumeProgress} className="h-14 rounded-2xl bg-secondary hover:bg-secondary/90 font-black text-lg shadow-lg shadow-secondary/20">استمرار الحل</Button>
                    <Button variant="ghost" onClick={startNewQuiz} className="h-12 rounded-2xl text-primary font-bold">بدء من جديد</Button>
                 </div>
              </div>
            </div>
          )}

           <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] arabic-font p-0 border-none shadow-2xl">
              {activeQuiz && (
                 <div className={cn("flex flex-col min-h-[500px] transition-colors duration-300", isDarkMode ? "bg-slate-950" : "bg-muted/10")}>
                    {!showResults ? (
                      <>
                        <div className={cn("p-6 border-b sticky top-0 z-20 flex flex-wrap justify-between items-center gap-4 transition-colors duration-300", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white")}>
                           <div className="flex items-center gap-3">
                              <Sparkles className="h-6 w-6 text-secondary" />
                              <div className="flex flex-col">
                                 <h3 className={cn("font-black text-xl leading-none", isDarkMode ? "text-slate-100" : "text-primary")}>
                                    {activeQuiz.title}
                                 </h3>
                                 <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1">{currentVersion?.name || 'النموذج الأصلي'}</p>
                              </div>
                           </div>
                           
                           {/* Back buttons */}
                           <div className="flex items-center gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setActiveQuiz(null);
                                 setActiveQuestions([]);
                                 setCurrentVersion(null);
                                 setVersionDialogQuizId(null);
                               }}
                               className="rounded-xl font-bold text-xs h-9 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary"
                             >
                               <ChevronLeft className="h-4 w-4 ml-1" />
                               قائمة الاختبارات
                             </Button>
                           </div>
                           
                           <div className="flex items-center gap-2 bg-muted/20 p-1.5 rounded-2xl">
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setFontSize(Math.max(12, fontSize - 2))}>
                               <Minus className="h-4 w-4 text-muted-foreground" />
                             </Button>
                             <span className="text-xs font-bold w-12 text-center text-muted-foreground tabular-nums">{fontSize}px</span>
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setFontSize(Math.min(48, fontSize + 2))}>
                               <Plus className="h-4 w-4 text-muted-foreground" />
                             </Button>
                             <div className="w-px h-6 bg-muted mx-1" />
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setIsDarkMode(!isDarkMode)}>
                               {isDarkMode ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                             </Button>
                           </div>

                           <div className="bg-primary/5 px-4 py-2 rounded-full text-primary font-black text-xs border border-primary/10 tabular-nums">
                              سؤال {currentIdx + 1} من {activeQuestions.length}
                           </div>
                        </div>
                        
                        <div className="p-8 space-y-8">
                           <Progress value={((currentIdx + 1) / activeQuestions.length) * 100} className="h-3 rounded-full" />
                           
                           <Card className={cn("border-none shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-300 relative", isDarkMode ? "bg-slate-900" : "bg-white")}>
                              {activeQuestions[currentIdx].source_reference && (
                                <div className="absolute top-6 right-8 z-10">
                                   <Badge variant="outline" className="text-[9px] font-black border-secondary/20 text-secondary bg-secondary/5 px-3 py-1 rounded-full uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                                      {activeQuestions[currentIdx].source_reference}
                                   </Badge>
                                </div>
                              )}
                              <div dir="rtl" className={cn("p-12 font-black text-center leading-relaxed transition-all", isDarkMode ? "text-slate-100" : "text-primary")} style={{ fontSize: `${fontSize}px`, unicodeBidi: "plaintext" }}>
                                 {activeQuestions[currentIdx].question}
                              </div>
                              <div className={cn("p-12 pt-0 space-y-4", isDarkMode ? "bg-slate-900" : "bg-muted/5")}>
                                 {activeQuestions[currentIdx].options && activeQuestions[currentIdx].options.length > 0 ? (
                                   activeQuestions[currentIdx].options.map((opt: string, idx: number) => (
                                     <button
                                       key={idx}
                                       disabled={isAnswered}
                                     onClick={() => handleAnswer(idx)}
                                     className={cn(
                                       "w-full p-6 text-right rounded-[1.5rem] border-2 transition-all flex items-center justify-between group",
                                       !isAnswered 
                                         ? isDarkMode ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-primary" : "bg-white border-muted hover:border-primary hover:bg-primary/5" 
                                         : isAnswered && idx === activeQuestions[currentIdx].correct_option_index
                                           ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                                           : isAnswered && idx === selectedIdx
                                             ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20"
                                             : isDarkMode ? "bg-slate-800/30 border-slate-700 text-slate-500 opacity-40" : "bg-muted/30 border-muted opacity-40"
                                     )}
                                   >
                                     <span dir="rtl" className="font-bold text-right" style={{ fontSize: `${fontSize - 4}px`, unicodeBidi: "plaintext" }}>{opt}</span>
                                     {isAnswered && idx === activeQuestions[currentIdx].correct_option_index && (
                                       <CheckCircle2 className="h-6 w-6 text-white" />
                                     )}
                                     {isAnswered && idx === selectedIdx && idx !== activeQuestions[currentIdx].correct_option_index && (
                                       <XCircle className="h-6 w-6 text-white" />
                                     )}
                                   </button>
                                 ))
                                 ) : (
                                   <div className="text-center p-8 bg-destructive/10 rounded-2xl">
                                     <p className="text-destructive font-bold">⚠️ هذا السؤال لا يحتوي على خيارات</p>
                                     <p className="text-sm text-muted-foreground mt-2">يرجى التواصل مع المدير لإصلاح هذا الاختبار</p>
                                   </div>
                                 )}
                              </div>
                           </Card>
                           
                           {isAnswered && (
                             <div className="space-y-4">
                               {/* Correction box for True/False questions */}
                               {activeQuestions[currentIdx]?.type === 'true_false' && 
                                selectedIdx !== null && 
                                selectedIdx !== activeQuestions[currentIdx]?.correct_option_index && 
                                activeQuestions[currentIdx]?.explanation && (
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
                                           {localizeScientificText(activeQuestions[currentIdx].explanation)}
                                         </p>
                                       </div>
                                       <div className="flex items-center gap-2 text-sm text-rose-600 font-bold">
                                         <Sparkles className="h-4 w-4" />
                                         <span dir="rtl" style={{ unicodeBidi: "plaintext" }} className="text-right">الإجابة الصحيحة: {activeQuestions[currentIdx].options[activeQuestions[currentIdx].correct_option_index]}</span>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               )}
                               
                               {(activeQuestions[currentIdx]?.explanation || activeQuestions[currentIdx]?.method || activeQuestions[currentIdx]?.source_reference) && (
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
                                         {activeQuestions[currentIdx]?.explanation && (
                                           <div className="space-y-4">
                                             <div className="flex items-center gap-3 text-primary font-black text-xl">
                                               <div className="h-2 w-10 rounded-full bg-primary" />
                                               شرح وتوضيح الإجابة
                                             </div>
                                             <div className="text-slate-600 leading-relaxed font-bold bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm whitespace-pre-wrap">
                                               {localizeScientificText(activeQuestions[currentIdx].explanation)}
                                             </div>
                                           </div>
                                         )}
                                         
                                         {activeQuestions[currentIdx]?.method && (
                                           <div className="space-y-4">
                                             <div className="flex items-center gap-3 text-secondary font-black text-xl">
                                               <div className="h-2 w-10 rounded-full bg-secondary" />
                                               طريقة الوصول للحل بالتفصيل
                                             </div>
                                             <div className="bg-secondary/5 p-8 rounded-[2.5rem] border border-secondary/10 shadow-sm space-y-3">
                                               {(() => {
                                                 const raw = localizeScientificText(activeQuestions[currentIdx].method) || "";
                                                 const byNewline = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
                                                 const steps = byNewline.length > 1
                                                   ? byNewline
                                                   : raw.split(/(?=[\u0660-\u0669\d]+[-–]\s)/).map(s => s.trim()).filter(Boolean);
                                                 return steps.map((step, i) => (
                                                   <div key={i} className="flex items-start gap-3 text-slate-600 leading-relaxed font-bold">
                                                     <span className="flex-1">{step}</span>
                                                   </div>
                                                 ));
                                               })()}
                                             </div>
                                           </div>
                                         )}

                                         {activeQuestions[currentIdx]?.question_references && activeQuestions[currentIdx].question_references.length > 0 && (
                                           <div className="space-y-4">
                                             <div className="flex items-center gap-3 text-purple-600 font-black text-xl">
                                               <div className="h-2 w-10 rounded-full bg-purple-600" />
                                               مراجع السؤال
                                             </div>
                                             <div className="space-y-3">
                                               {activeQuestions[currentIdx].question_references.map((ref: any, idx: number) => (
                                                 <div key={idx} className="flex items-start gap-4 bg-purple-50 p-6 rounded-[2rem] border border-purple-100 shadow-sm hover:bg-purple-100 transition-colors">
                                                   <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-purple-100 shrink-0 font-black text-purple-600">
                                                     {idx + 1}
                                                   </div>
                                                   <div className="flex-1 space-y-1">
                                                     {ref.subject_name && (
                                                       <div className="inline-block px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full mb-2">
                                                         📚 {ref.subject_name}
                                                       </div>
                                                     )}
                                                     <p className="text-purple-900 font-black text-lg">{ref.lesson_title}</p>
                                                     <div className="flex flex-wrap gap-3 text-sm">
                                                       <span className="text-purple-600/80 font-bold">📄 صفحة {ref.page_number}</span>
                                                       <span className="text-purple-600/60">•</span>
                                                       <span className="text-purple-600/80 font-bold">📍 {ref.paragraph_location}</span>
                                                     </div>
                                                   </div>
                                                 </div>
                                               ))}
                                             </div>
                                           </div>
                                         )}

                                         {activeQuestions[currentIdx]?.source_reference && (
                                           <div className="space-y-4">
                                             <div className="flex items-center gap-3 text-blue-600 font-black text-xl">
                                               <div className="h-2 w-10 rounded-full bg-blue-600" />
                                               مكان فقرة الإجابة في الدرس
                                             </div>
                                             <div className="flex flex-col gap-4 bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
                                               <div className="flex items-center gap-6">
                                                 <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md border border-blue-100 shrink-0">
                                                   <BookOpen className="h-8 w-8 text-blue-600" />
                                                 </div>
                                                 <div className="flex-1">
                                                   <p className="text-blue-900 font-black text-2xl mb-1">{activeQuestions[currentIdx].source_reference}</p>
                                                   <p className="text-blue-600/60 text-xs font-bold uppercase tracking-widest">تجد الإجابة في هذه الصفحة</p>
                                                 </div>
                                               </div>
                                               {/* زر عرض صورة الدرس — تحت عبارة "تجد الإجابة في هذه الصفحة" */}
                                               {(currentVersion?.lesson_image_url || activeQuestions[currentIdx]?.lesson_page_url) && (
                                                 <Dialog>
                                                   <DialogTrigger asChild>
                                                     <Button 
                                                       variant="outline" 
                                                       className="w-full h-14 rounded-xl border-2 border-blue-500 text-blue-700 hover:bg-blue-500 hover:text-white font-black gap-2 transition-all hover:scale-105"
                                                     >
                                                       <ImageIcon className="h-5 w-5" />
                                                       عرض صورة الدرس
                                                     </Button>
                                                   </DialogTrigger>
                                                   <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl p-0">
                                                     <div className="bg-primary p-6 text-white">
                                                       <DialogTitle className="text-2xl font-black">صورة الدرس - {activeQuestions[currentIdx].source_reference}</DialogTitle>
                                                       <p className="text-white/70 text-sm font-bold mt-1">الصفحة التي تحتوي على إجابة السؤال</p>
                                                     </div>
                                                     <div className="p-6 overflow-y-auto max-h-[70vh]">
                                                       <CachedImage
                                                         src={currentVersion?.lesson_image_url || activeQuestions[currentIdx].lesson_page_url || ''}
                                                         alt={`صورة الدرس - ${activeQuestions[currentIdx].source_reference}`}
                                                         className="w-full h-auto rounded-2xl shadow-lg"
                                                       />
                                                     </div>
                                                   </DialogContent>
                                                 </Dialog>
                                               )}
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
                               <div className="flex flex-col gap-3">
                                 <Button 
                                   onClick={handleSaveQuestion}
                                   disabled={savingQuestion || savedQuestionIds.has(currentIdx)}
                                   variant="outline"
                                   className="w-full h-14 rounded-[2rem] text-lg font-black border-2 border-primary/20 hover:bg-primary/5 text-primary shadow-lg transition-all hover:scale-105 active:scale-95 gap-2"
                                 >
                                    {savedQuestionIds.has(currentIdx) ? (
                                      <>
                                        <BookmarkCheck className="h-5 w-5" />
                                        تم الحفظ
                                      </>
                                    ) : (
                                      <>
                                        <Bookmark className="h-5 w-5" />
                                        حفظ
                                      </>
                                    )}
                                 </Button>
                                 <Button 
                                   onClick={nextQuestion} 
                                   className="w-full h-14 rounded-[2rem] text-xl font-black shadow-xl bg-secondary hover:bg-secondary/90 shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                 >
                                    {currentIdx < activeQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار وعرض النتيجة'}
                                    <ChevronLeft className="h-6 w-6" />
                                 </Button>
                               </div>
                             </div>
                           )}
                        </div>
                      </>
                    ) : (
                      <div className="p-8 space-y-10 animate-bounce-in bg-white">
                         <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-primary/5 relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-secondary to-primary" />
                           <div className="mb-8 mx-auto w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl">
                             <Trophy className="h-14 w-14 text-primary animate-pulse" />
                           </div>
                           <h3 className="text-4xl font-black text-primary mb-3">أحسنت يا بطل! 🎉</h3>
                           <p className="text-muted-foreground font-bold mb-8 text-lg">لقد أتممت الاختبار بنجاح، فخورين بك يا بطل.</p>
                           
                           <div className="flex justify-center gap-12 my-10 bg-primary/5 p-8 rounded-[2rem] shadow-inner">
                              <div className="text-center">
                                 <p className="text-6xl font-black text-primary mb-1 tabular-nums">{score}</p>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">إجابات صحيحة</p>
                              </div>
                              <div className="h-20 w-px bg-primary/10 self-center" />
                              <div className="text-center">
                                 <p className="text-6xl font-black text-secondary mb-1 tabular-nums">{activeQuestions.length}</p>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">إجمالي الأسئلة</p>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Button 
                                variant="outline" 
                                onClick={() => setActiveQuiz(null)} 
                                className="rounded-2xl px-8 h-16 font-black text-lg shadow-lg border-2 border-primary/10 bg-white text-primary hover:bg-primary/5 gap-3"
                              >
                                 <Layout className="h-5 w-5" />
                                 العودة للقائمة
                              </Button>
                              
                              {activeQuiz.versions && activeQuiz.versions.findIndex((v: any) => v.name === currentVersion?.name) < activeQuiz.versions.length - 1 ? (
                                <Button 
                                  onClick={() => {
                                     const curIdx = activeQuiz.versions.findIndex((v: any) => v.name === currentVersion?.name);
                                     startQuiz(activeQuiz, curIdx + 1);
                                  }} 
                                  className="rounded-2xl px-8 h-16 font-black text-lg shadow-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-3 transition-transform active:scale-95"
                                >
                                   النموذج التالي
                                   <ChevronLeft className="h-6 w-6" />
                                </Button>
                              ) : (
                                <Button onClick={() => { setActiveQuiz(null); navigate('/student/lessons'); }} className="rounded-2xl px-8 h-16 font-black text-lg shadow-xl bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-3 transition-transform active:scale-95">
                                   قائمة الدروس
                                   <ArrowRight className="h-6 w-6" />
                                </Button>
                              )}
                           </div>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-2xl font-black text-primary flex items-center gap-3 mb-6 px-2">
                              <ListChecks className="h-8 w-8" />
                              مراجعة الإجابات
                            </h4>
                            {activeQuestions.map((q: any, idx: number) => {
                              const isCorrect = userAnswers[idx] === q.correct_option_index;
                              return (
                                <Card key={idx} className={cn(
                                  "rounded-[2.5rem] border-2 overflow-hidden bg-white shadow-sm transition-all",
                                  isCorrect ? "border-green-100" : "border-rose-100"
                                )}>
                                  <div className="p-8 border-b flex justify-between items-start gap-6 relative">
                                     <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                           <span className={cn(
                                             "text-[10px] font-black uppercase px-4 py-1.5 rounded-full",
                                             isCorrect ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                                           )}>
                                              {isCorrect ? "إجابة صحيحة" : "إجابة خاطئة"}
                                           </span>
                                           {q.source_reference && (
                                              <Badge variant="outline" className="text-[10px] font-black border-secondary/20 text-secondary bg-secondary/5 px-3 py-1 rounded-full uppercase">
                                                 {q.source_reference}
                                              </Badge>
                                           )}
                                        </div>
                                        <p className="font-black text-xl mt-4 text-primary leading-relaxed">{q.question}</p>
                                     </div>
                                     {isCorrect ? (
                                       <CheckCircle2 className="h-10 w-10 text-green-500 shrink-0" />
                                     ) : (
                                       <XCircle className="h-10 w-10 text-rose-500 shrink-0" />
                                     )}
                                  </div>
                                  <div className="p-8 space-y-4 bg-muted/5">
                                     {q.options.map((opt: string, oIdx: number) => {
                                        const isUserAns = userAnswers[idx] === oIdx;
                                        const isCorrectOpt = q.correct_option_index === oIdx;
                                        return (
                                          <div key={oIdx} className={cn(
                                            "p-5 rounded-2xl border-2 text-sm flex items-center justify-between transition-all",
                                            isCorrectOpt ? "bg-green-50 border-green-200 text-green-800 font-bold shadow-sm" : 
                                            isUserAns ? "bg-rose-50 border-rose-200 text-rose-800 font-bold" : "bg-white border-muted/50"
                                          )}>
                                            <span className="font-bold">{opt}</span>
                                            {isCorrectOpt && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                            {isUserAns && !isCorrectOpt && <XCircle className="h-5 w-5 text-rose-600" />}
                                          </div>
                                        );
                                     })}
                                  </div>
                                </Card>
                              );
                            })}
                         </div>
                      </div>
                    )}
                 </div>
               )}
            </DialogContent>
         </Dialog>
      </div>
    </StudentLayout>
  );
};

export default StudentQuizzes;
