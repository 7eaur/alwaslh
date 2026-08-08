import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminApi, aiApi } from '@/db/api';
import { simpleCache } from '@/lib/simple-cache';
import { Class, Subject, Lesson, QuizQuestion, QuizVersion } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  FileQuestion, 
  Search, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Settings2,
  ListChecks,
  Copy,
  Layers,
  Type,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Download,
  Calendar,
  RefreshCw,
  GraduationCap,
  ScanText
} from 'lucide-react';
import { exportQuizToExcel, exportQuizToPdf, QuizPdfExportType } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDate } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminQuizCard = React.memo(({ 
  quiz, 
  onExport, 
  onDelete, 
  onEdit 
}: { 
  quiz: any; 
  onExport: (q: any) => void; 
  onDelete: (q: any) => void; 
  onEdit: (q: any) => void 
}) => {
  return (
    <Card key={quiz.id} className="group overflow-hidden rounded-[24px] border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white ring-1 ring-black/5">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent pb-6 pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="bg-white p-3 rounded-2xl text-primary shadow-sm ring-1 ring-black/5">
            <ListChecks className="h-6 w-6" />
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="secondary" 
              size="icon" 
              className="text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-md h-12 w-12 rounded-2xl bg-white border border-blue-600/10 group/btn"
              title="تعديل الاختبار"
              onClick={() => onEdit(quiz)}
            >
              <Edit3 className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-md h-12 w-12 rounded-2xl bg-white border border-primary/10 group/btn"
              title="تصدير الاختبار"
              onClick={() => onExport(quiz)}
            >
              <Download className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10 rounded-xl hover:bg-destructive/5"
              onClick={() => onDelete(quiz)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-xl font-black mt-2 text-primary line-clamp-1 tracking-tight">{quiz.title}</CardTitle>
        <CardDescription className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1.5">
          <Calendar className="h-3 w-3" /> تم النشر في {formatDate(quiz.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2 mb-5">
          <Badge variant="secondary" className="rounded-xl bg-primary/5 text-primary border-none px-4 py-1.5 font-black text-[10px] tracking-wide">
            {quiz.subjects?.name || 'مادة غير محددة'}
          </Badge>
          <Badge variant="outline" className="rounded-xl border-primary/10 text-primary/70 px-4 py-1.5 font-black text-[10px] bg-white shadow-sm">
            {quiz.questions?.length || 0} سؤال ذكي
          </Badge>
          {quiz.versions && quiz.versions.length > 0 && (
            <Badge variant="outline" className="rounded-xl border-amber-500/10 text-amber-600 px-4 py-1.5 font-black text-[10px] bg-amber-50/30">
              {quiz.versions.length} نماذج بديلة
            </Badge>
          )}
        </div>
        
        <div className="space-y-4 pt-2 border-t border-dashed border-muted">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
            <BookOpen className="h-3.5 w-3.5 text-primary/40" /> المحتوى المرتبط
          </p>
          <div className="flex -space-x-3 space-x-reverse overflow-hidden">
            {quiz.lesson_ids.slice(0, 4).map((_: any, i: number) => (
              <div key={i} className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white bg-primary/10 flex items-center justify-center text-primary text-xs font-black shadow-sm border border-primary/5">
                {i + 1}
              </div>
            ))}
            {quiz.lesson_ids.length > 4 && (
              <div className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-black border border-muted-foreground/5">
                +{quiz.lesson_ids.length - 4}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const AdminQuizzes: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  // Pagination
  const [quizzesLimit, setQuizzesLimit] = useState(10); // تحميل 10 اختبارات فقط
  const [hasMoreQuizzes, setHasMoreQuizzes] = useState(false);
  const [loadingMoreQuizzes, setLoadingMoreQuizzes] = useState(false);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [mcqCount, setMcqCount] = useState<number>(3);
  const [trueFalseCount, setTrueFalseCount] = useState<number>(2);
  const [versionCount, setVersionCount] = useState<number>(1);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizGenerationType, setQuizGenerationType] = useState<'custom' | 'extract_from_image' | 'exam_paper_exact'>('custom');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedQuizForExport, setSelectedQuizForExport] = useState<any>(null);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [selectedPdfExportTypes, setSelectedPdfExportTypes] = useState<QuizPdfExportType[]>(['questions_with_all_options']);
  const [selectedVersionsForExport, setSelectedVersionsForExport] = useState<string[]>([]); // 'all' or version IDs
  const [isExporting, setIsExporting] = useState(false);

  const togglePdfExportType = (type: QuizPdfExportType) => {
    setSelectedPdfExportTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersionsForExport(prev => {
      if (versionId === 'all') {
        return prev.includes('all') ? [] : ['all'];
      }
      
      // Remove 'all' if selecting specific versions
      const withoutAll = prev.filter(id => id !== 'all');
      
      if (withoutAll.includes(versionId)) {
        return withoutAll.filter(id => id !== versionId);
      } else {
        return [...withoutAll, versionId];
      }
    });
  };
  
  const [generatedVersions, setGeneratedVersions] = useState<QuizVersion[]>([]);
  // Local state for expanded versions
  const [expandedVersions, setExpandedVersions] = useState<Record<number, boolean>>({});
  // We keep generatedQuestions for backward compatibility or as a "current view" helper
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  // Tracking per-version generation status
  const [generatingVersionIdx, setGeneratingVersionIdx] = useState<number | null>(null);
  // Tracking per-question regeneration: key = "vIdx_qIdx"
  const [regeneratingQuestionKey, setRegeneratingQuestionKey] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchQuizzes = useCallback(async () => {
    console.log('🔄 بدء تحميل الاختبارات...');
    const startTime = Date.now();
    try {
      // استخدام الكاش للتحميل السريع
      const cacheKey = `admin_quizzes_${quizzesLimit}`;
      const data = await simpleCache.getOrFetch(
        cacheKey,
        async () => {
          const result = await adminApi.getQuizzes(undefined, quizzesLimit + 1);
          return result;
        },
        5 // 5 دقائق فقط للاختبارات
      );
      
      // التحقق من وجود المزيد من الاختبارات
      const hasMore = data.length > quizzesLimit;
      const quizzesToShow = hasMore ? data.slice(0, quizzesLimit) : data;
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ تم تحميل ${quizzesToShow.length} اختبار في ${loadTime}ms`, { hasMore });
      
      setQuizzes(quizzesToShow);
      setHasMoreQuizzes(hasMore);
    } catch (err) {
      console.error('❌ خطأ في تحميل الاختبارات:', err);
    } finally {
      setIsLoading(false);
    }
  }, [quizzesLimit]);

  const fetchClasses = useCallback(async () => {
    console.log('🔄 بدء تحميل الصفوف...');
    const startTime = Date.now();
    try {
      const data = await adminApi.getClasses();
      const loadTime = Date.now() - startTime;
      console.log(`✅ تم تحميل ${data.length} صف في ${loadTime}ms`);
      setClasses(data);
    } catch (err) {
      console.error('❌ خطأ في تحميل الصفوف:', err);
    }
  }, []);

  const handleLoadMoreQuizzes = useCallback(async () => {
    setLoadingMoreQuizzes(true);
    try {
      const newLimit = quizzesLimit + 10; // تحميل 10 إضافية
      setQuizzesLimit(newLimit);
      // fetchQuizzes سيتم استدعاؤه تلقائياً بسبب useEffect
    } catch (err) {
      console.error('❌ خطأ في تحميل المزيد:', err);
    } finally {
      setLoadingMoreQuizzes(false);
    }
  }, [quizzesLimit]);

  useEffect(() => {
    fetchQuizzes();
    fetchClasses();
  }, [fetchQuizzes, fetchClasses]);

  useEffect(() => {
    if (selectedClassId) {
      adminApi.getSubjects(selectedClassId).then(setSubjects);
      setSelectedSubjectId('');
      setLessons([]);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedSubjectId) {
      adminApi.getLessons(selectedSubjectId).then(setLessons);
      setSelectedLessonIds([]);
    }
  }, [selectedSubjectId]);

  const addEmptyVersion = () => {
    const newIdx = generatedVersions.length;
    const newVersion: QuizVersion = {
      name: `النموذج (${newIdx + 1})`,
      questions: [],
      lesson_ids: [...selectedLessonIds],
      question_count: questionCount
    };
    setGeneratedVersions([...generatedVersions, newVersion]);
    setExpandedVersions({ ...expandedVersions, [newIdx]: true });
  };

  const removeVersion = (idx: number) => {
    const updated = generatedVersions.filter((_, i) => i !== idx);
    setGeneratedVersions(updated);
  };

  const toggleVersionExpand = (idx: number) => {
    setExpandedVersions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const updateVersionConfig = (idx: number, field: string, value: any) => {
    setGeneratedVersions(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleGenerateSingleVersion = async (vIdx: number) => {
    const version = generatedVersions[vIdx];
    if (!version.lesson_ids || version.lesson_ids.length === 0) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى اختيار درس واحد على الأقل لهذا النموذج' });
      return;
    }

    setGeneratingVersionIdx(vIdx);
    try {
      // إذا كان النموذج يحتوي على lesson_id (من نوع extract_from_image أو exam_paper_exact)
      if (version.lesson_id && (quizGenerationType === 'extract_from_image' || quizGenerationType === 'exam_paper_exact')) {
        const lesson = lessons.find(l => l.id === version.lesson_id);
        if (!lesson || !lesson.image_urls || lesson.image_urls.length === 0) {
          throw new Error('الدرس لا يحتوي على صور');
        }
        
        let questionsRaw: any[] = [];

        if (quizGenerationType === 'exam_paper_exact') {
          // وضع "طبق الأصل" — استخدام extractExamPaper مباشرة بصور الدرس
          questionsRaw = await aiApi.extractExamPaper(lesson.image_urls);
        } else {
          // وضع "الاستخراج من صور الدروس" — الطريقة القديمة
          const { data, error } = await adminApi.generateQuizFromImages(
            [lesson],
            1 // نموذج واحد فقط
          );
          if (error) throw error;
          
          if (data.versions && data.versions[0]) {
            questionsRaw = data.versions[0].questions || [];
          } else if (Array.isArray(data)) {
            questionsRaw = data;
          } else if (data.questions) {
            questionsRaw = data.questions;
          }
        }
        
        const normalizedQuestions = normalizeQuestions(questionsRaw);
        
        // إضافة معلومات الدرس للأسئلة
        const questionsWithLessonInfo = normalizedQuestions.map(q => ({
          ...q,
          lesson_id: lesson.id,
          lesson_page_url: lesson.image_urls?.[0] || undefined
        }));
        
        setGeneratedVersions(prev => {
          const updated = [...prev];
          updated[vIdx] = { 
            ...updated[vIdx],
            // تخزين صورة الدرس على مستوى النموذج مباشرة (المصدر الأساسي للعرض)
            lesson_image_url: lesson.image_urls?.[0] || undefined,
            lesson_id: lesson.id,
            questions: questionsWithLessonInfo,
            question_count: questionsWithLessonInfo.length,
            generated: true
          };
          return updated;
        });

        toast({ title: '✅ تم الاستخراج', description: `تم استخراج ${questionsWithLessonInfo.length} سؤال من درس ${lesson.title}` });
        
      } else {
        // التوليد المخصص (الكود القديم)
        const selectedLessonsData = lessons.filter(l => version.lesson_ids?.includes(l.id));
        
        let combinedContent = selectedLessonsData.map(l => {
          let content = "";
          if (l.title) content += `عنوان الدرس: ${l.title}\n`;
          if (l.summary) content += `ملخص الدرس: ${l.summary}\n`;
          if (l.extracted_text) content += `محتوى الدرس: ${l.extracted_text}\n`;
          return content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
        }).filter(Boolean).join('\n---\n');
        
        if (combinedContent.length > 50000) {
          combinedContent = combinedContent.substring(0, 50000) + "...";
        }

        // Collect avoid questions from ALL other versions
        const avoidQuestions = generatedVersions
          .flatMap((v, i) => i !== vIdx ? v.questions.map(q => q.question) : [])
          .filter(Boolean);

        const { data, error } = await adminApi.generateSingleVersionQuiz(combinedContent, version.question_count || 5, avoidQuestions);
        if (error) throw error;

        const newQuestions = normalizeQuestions(data.questions || data || []);
        
        setGeneratedVersions(prev => {
          const updated = [...prev];
          updated[vIdx] = { ...updated[vIdx], questions: newQuestions, generated: true };
          return updated;
        });

        toast({ title: 'تم التوليد', description: `تم توليد ${newQuestions.length} سؤال للنموذج بنجاح.` });
      }
    } catch (err: any) {
      console.error(err);
      
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
      } else if (errorMessage.includes('non-2xx status code')) {
        errorMessage = '⚠️ فشل الاتصال بخادم التوليد. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
      } else if (errorMessage.includes('الدرس لا يحتوي على صور')) {
        errorMessage = '⚠️ الدرس المختار لا يحتوي على صور. يرجى رفع صور الدرس أولاً أو استخدام التوليد المخصص.';
      }
      
      toast({ variant: 'destructive', title: 'فشل التوليد', description: errorMessage });
    } finally {
      setGeneratingVersionIdx(null);
    }
  };

  const handleGenerateAllVersions = async () => {
    for (let i = 0; i < generatedVersions.length; i++) {
      await handleGenerateSingleVersion(i);
    }
  };

  const handleGenerateQuiz = async () => {
    if (selectedLessonIds.length === 0 || !quizTitle) {
      toast({ variant: 'destructive', title: 'بيانات ناقصة', description: 'يرجى اختيار الدروس وعنوان الاختبار' });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedLessonsData = lessons.filter(l => selectedLessonIds.includes(l.id));
      
      // For extract_from_image OR exam_paper_exact mode, we need lesson images
      if (quizGenerationType === 'extract_from_image' || quizGenerationType === 'exam_paper_exact') {
        // Check if lessons have images
        const lessonsWithImages = selectedLessonsData.filter(l => l.image_urls && l.image_urls.length > 0);
        if (lessonsWithImages.length === 0) {
          throw new Error('الدروس المختارة لا تحتوي على صور. يرجى اختيار دروس تحتوي على صور أو استخدام التوليد المخصص.');
        }
        
        // إنشاء نموذج منفصل لكل درس تلقائياً
        const versions = lessonsWithImages.map((lesson, idx) => ({
          name: `${lesson.title} - نموذج (${idx + 1})`,
          lesson_ids: [lesson.id], // كل نموذج مرتبط بدرس واحد فقط
          lesson_id: lesson.id, // حفظ معرف الدرس للاستخدام في التوليد
          question_count: questionCount || 5, // استخدام العدد المحدد من المستخدم
          questions: [], // فارغ في البداية، سيتم التوليد لاحقاً
          generated: false // علامة لتتبع ما إذا تم التوليد
        }));

        setGeneratedVersions(versions);
        setActiveVersionIndex(0);
        toast({ 
          title: '✅ تم إنشاء النماذج', 
          description: `تم إنشاء ${versions.length} نموذج (نموذج لكل درس). يمكنك الآن البدء بالتوليد.` 
        });
        
      } else {
        // Custom generation mode (existing logic)
        // Combine summary and extracted text for better coverage
        let combinedContent = selectedLessonsData.map(l => {
          let content = "";
          if (l.title) content += `عنوان الدرس: ${l.title}\n`;
          if (l.summary) content += `ملخص الدرس: ${l.summary}\n`;
          if (l.extracted_text) content += `محتوى الدرس: ${l.extracted_text}\n`;
          // Basic cleaning
          return content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
        }).filter(Boolean).join('\n---\n');
        
        // Safety truncation for extremely large selections (e.g. 130 lessons)
        if (combinedContent.length > 100000) {
          combinedContent = combinedContent.substring(0, 100000) + "... [المحتوى طويل جداً، تم الاكتفاء بهذا القدر]";
        }
        
        if (!combinedContent) {
          throw new Error('الدروس المختارة لا تحتوي على بيانات كافية (ملخص أو نص مستخرج) لتوليد الأسئلة. يرجى معالجة الدروس أولاً.');
        }

        // Call the multi-version generation API with question type counts
        const { data, error } = await adminApi.generateMultiVersionQuiz(
          combinedContent, 
        questionCount, 
        versionCount,
        mcqCount,
        trueFalseCount
      );
      if (error) throw error;
      
      // Data robustness check
      let versions = data.versions;
      if (!versions && Array.isArray(data)) {
        versions = [{ name: "النموذج (1)", questions: data }];
      } else if (!versions && data.questions) {
        versions = [{ name: "النموذج (1)", questions: data.questions }];
      }
      
      if (!versions || versions.length === 0) {
        throw new Error('لم يتمكن الذكاء الاصطناعي من توليد أسئلة من المحتوى الموفر. حاول اختيار دروس أخرى أو معالجة الدروس مرة أخرى.');
      }

      // Normalize all versions
      const normalizedVersions = versions.map((v: any, vIdx: number) => ({
        ...v,
        name: v.name || `النموذج (${vIdx + 1})`,
        lesson_ids: [...selectedLessonIds],
        question_count: questionCount,
        questions: normalizeQuestions(v.questions || [])
      }));
      
      setGeneratedVersions(normalizedVersions);
      setActiveVersionIndex(0);
      toast({ title: 'تم التوليد بنجاح', description: `تم إنشاء ${normalizedVersions.length} نماذج اختبار.` });
      }
    } catch (err: any) {
      console.error('Quiz Generation Error:', err);
      let errorMsg = err.message;
      if (err.context && typeof err.context.text === 'function') {
        try {
          errorMsg = await err.context.text() || err.message;
        } catch (e) {}
      }
      toast({ 
        variant: 'destructive', 
        title: 'فشل التوليد', 
        description: `حدث خطأ أثناء معالجة البيانات: ${errorMsg}` 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (generatedVersions.length === 0) return;
    
    // التحقق من البيانات المطلوبة
    if (!quizTitle.trim()) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب إدخال عنوان الاختبار' });
      return;
    }
    
    if (!selectedSubjectId) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب اختيار المادة' });
      return;
    }
    
    if (selectedLessonIds.length === 0) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب اختيار درس واحد على الأقل' });
      return;
    }
    
    setIsSaving(true);
    try {
      // الحصول على بيانات الدروس المحددة
      const selectedLessonsData = lessons.filter(l => selectedLessonIds.includes(l.id));
      const firstLesson = selectedLessonsData[0];
      
      // إضافة معلومات الدرس للأسئلة (مع الحفاظ على lesson_page_url المحدد لكل نموذج)
      const questionsWithLessonInfo = generatedVersions[0].questions.map(q => ({
        ...q,
        lesson_id: q.lesson_id || firstLesson?.id || undefined,
        lesson_page_url: q.lesson_page_url || firstLesson?.image_urls?.[0] || undefined
      }));
      
      const versionsWithLessonInfo = generatedVersions.map(v => {
        // تحديد صورة الدرس لهذا النموذج:
        // 1. استخدام lesson_image_url المحدد للنموذج أثناء التوليد
        // 2. أو استخدام صورة درسه الخاص (إن وجد lesson_id)
        // 3. أو الرجوع لصورة الدرس الأول كبديل أخير
        const versionLesson = v.lesson_id ? lessons.find((l: any) => l.id === v.lesson_id) : null;
        const versionLessonImage = v.lesson_image_url
          || versionLesson?.image_urls?.[0]
          || firstLesson?.image_urls?.[0]
          || undefined;
        return {
          ...v,
          lesson_image_url: versionLessonImage,
          questions: v.questions.map((q: any) => ({
            ...q,
            lesson_id: q.lesson_id || v.lesson_id || firstLesson?.id || undefined,
            // الحفاظ على lesson_page_url الخاص بكل نموذج (تم ضبطه أثناء التوليد)
            lesson_page_url: q.lesson_page_url || versionLessonImage || undefined
          }))
        };
      });
      
      // تصفية lesson_ids لإزالة القيم الفارغة أو غير الصحيحة
      const validLessonIds = selectedLessonIds.filter(id => id && id.trim() !== '');
      
      const quizData = {
        title: quizTitle.trim(),
        subject_id: selectedSubjectId,
        lesson_ids: validLessonIds,
        questions: questionsWithLessonInfo, // Default/First version
        versions: versionsWithLessonInfo // Store all versions
      };

      if (editingQuizId) {
        await adminApi.updateQuiz(editingQuizId, quizData);
        toast({ title: 'تم التحديث', description: 'تم تحديث الاختبار التفاعلي بنجاح' });
      } else {
        await adminApi.createQuiz(quizData);
        toast({ title: 'تم الحفظ', description: 'تم حفظ الاختبار التفاعلي بنجاح' });
      }
      
      // مسح الكاش
      for (let i = 10; i <= 100; i += 10) {
        simpleCache.delete(`admin_quizzes_${i}`);
      }
      
      setIsCreateDialogOpen(false);
      resetForm();
      fetchQuizzes();
    } catch (err: any) {
      console.error('❌ خطأ في حفظ الاختبار:', err);
      toast({ variant: 'destructive', title: 'فشل الحفظ', description: err.message || 'حدث خطأ أثناء حفظ الاختبار' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedClassId('');
    setSelectedSubjectId('');
    setSelectedLessonIds([]);
    setQuizTitle('');
    setGeneratedVersions([]);
    setQuestionCount(5);
    setVersionCount(1);
    setEditingQuizId(null);
  };

  const addQuestion = (vIdx: number) => {
    setGeneratedVersions(prev => {
      const updated = [...prev];
      updated[vIdx] = {
        ...updated[vIdx],
        questions: [
          ...updated[vIdx].questions,
          {
            question: 'سؤال جديد',
            options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
            correct_option_index: 0,
            type: 'mcq',
            difficulty: 'medium',
            explanation: '',
            method: '',
            source_reference: ''
          }
        ]
      };
      return updated;
    });
  };

  const removeQuestion = (vIdx: number, qIdx: number) => {
    setGeneratedVersions(prev => {
      const updated = [...prev];
      updated[vIdx] = {
        ...updated[vIdx],
        questions: updated[vIdx].questions.filter((_, i) => i !== qIdx)
      };
      return updated;
    });
  };

  const handleRegenerateQuestion = async (vIdx: number, qIdx: number) => {
    const key = `${vIdx}_${qIdx}`;
    setRegeneratingQuestionKey(key);
    try {
      const currentQ = generatedVersions[vIdx]?.questions?.[qIdx];
      if (!currentQ) return;

      // جمع محتوى الدروس المحددة للاستعانة به
      let lessonContent = '';
      if (selectedLessonIds.length > 0) {
        const selectedLessons = lessons.filter(l => selectedLessonIds.includes(l.id));
        lessonContent = selectedLessons.map(l => {
          let c = '';
          if (l.title) c += `عنوان الدرس: ${l.title}\n`;
          if (l.summary) c += `ملخص: ${l.summary}\n`;
          return c;
        }).join('\n---\n').substring(0, 2000);
      }

      const newQ = await adminApi.regenerateSingleQuestion(
        currentQ.question,
        lessonContent,
        currentQ.type || 'mcq',
        currentQ.difficulty || 'medium',
        currentQ.options?.length || 4
      );

      if (newQ && newQ.question) {
        setGeneratedVersions(prev => {
          const updated = [...prev];
          const questions = [...updated[vIdx].questions];
          questions[qIdx] = {
            ...questions[qIdx],
            question: newQ.question || questions[qIdx].question,
            options: Array.isArray(newQ.options) && newQ.options.length > 0 ? newQ.options : questions[qIdx].options,
            correct_option_index: typeof newQ.correct_option_index === 'number' ? newQ.correct_option_index : questions[qIdx].correct_option_index,
            explanation: newQ.explanation || questions[qIdx].explanation,
            method: newQ.method || questions[qIdx].method,
          };
          updated[vIdx] = { ...updated[vIdx], questions };
          return updated;
        });
        toast({ title: '✓ تم إعادة توليد السؤال', description: 'تمت إعادة صياغة السؤال بنجاح' });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ في إعادة التوليد', description: err.message || 'حدث خطأ، حاول مرة أخرى' });
    } finally {
      setRegeneratingQuestionKey(null);
    }
  };

  const updateQuestion = (vIdx: number, qIdx: number, field: string, value: any) => {
    setGeneratedVersions(prev => {
      const updated = [...prev];
      const questions = [...updated[vIdx].questions];
      questions[qIdx] = { ...questions[qIdx], [field]: value };
      updated[vIdx] = { ...updated[vIdx], questions };
      return updated;
    });
  };

  const normalizeQuestions = (qs: any[]) => {
    return (qs || []).map(q => ({
      question: q.question || q.text || q.prompt || "",
      options: Array.isArray(q.options) ? q.options : (typeof q.options === 'object' && q.options !== null ? Object.values(q.options) : []),
      correct_option_index: typeof q.correct_option_index === 'number' ? q.correct_option_index : 0,
      source_reference: q.source_reference || "",
      type: q.type || (Array.isArray(q.options) && q.options.length === 2 ? 'true_false' : 'mcq'),
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || "",
      method: q.method || ""
    }));
  };

  const updateOption = (vIdx: number, qIdx: number, oIdx: number, value: string) => {
    setGeneratedVersions(prev => {
      const updated = [...prev];
      const questions = [...updated[vIdx].questions];
      const options = [...questions[qIdx].options];
      options[oIdx] = value;
      questions[qIdx] = { ...questions[qIdx], options };
      updated[vIdx] = { ...updated[vIdx], questions };
      return updated;
    });
  };

  const handleEditQuiz = useCallback(async (quiz: any) => {
    try {
      console.log('🔄 بدء تحميل بيانات الاختبار للتعديل، معرف الاختبار:', quiz.id);
      
      // جلب بيانات الاختبار الكاملة من قاعدة البيانات لضمان وجود الأسئلة والنماذج
      const fullQuiz = await adminApi.getQuizById(quiz.id);
      
      if (!fullQuiz) {
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات الاختبار",
          variant: "destructive"
        });
        return;
      }

      console.log('📋 بيانات الاختبار:', {
        id: fullQuiz.id,
        title: fullQuiz.title,
        subject_id: fullQuiz.subject_id,
        lesson_ids: fullQuiz.lesson_ids,
        class_id: fullQuiz.subjects?.class_id
      });

      setEditingQuizId(fullQuiz.id);
      setQuizTitle(fullQuiz.title);
      
      // تحميل الصف والمواد والدروس
      if (fullQuiz.subjects?.class_id) {
        setSelectedClassId(fullQuiz.subjects.class_id);
        // تحميل المواد للصف
        const subjectsData = await adminApi.getSubjects(fullQuiz.subjects.class_id);
        setSubjects(subjectsData);
      }
      
      if (fullQuiz.subject_id) {
        setSelectedSubjectId(fullQuiz.subject_id);
        // تحميل الدروس للمادة
        const lessonsData = await adminApi.getLessons(fullQuiz.subject_id);
        setLessons(lessonsData);
      }
      
      setSelectedLessonIds(fullQuiz.lesson_ids || []);
      
      if (fullQuiz.versions && fullQuiz.versions.length > 0) {
        console.log(`✅ تم تحميل ${fullQuiz.versions.length} نموذج للاختبار`);
        setGeneratedVersions(fullQuiz.versions);
        // توسيع جميع النماذج تلقائياً عند التعديل
        const expandAll: Record<number, boolean> = {};
        fullQuiz.versions.forEach((_: any, idx: number) => {
          expandAll[idx] = true;
        });
        setExpandedVersions(expandAll);
      } else {
        console.log('📝 الاختبار لا يحتوي على نماذج، استخدام الأسئلة المباشرة');
        setGeneratedVersions([{ name: "النموذج (1)", questions: fullQuiz.questions || [] }]);
        // توسيع النموذج الوحيد
        setExpandedVersions({ 0: true });
      }
      
      setIsCreateDialogOpen(true);
    } catch (err) {
      console.error('❌ خطأ في تحميل بيانات الاختبار للتعديل:', err);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الاختبار للتعديل",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleDeleteQuiz = useCallback(async (quiz: any) => {
    if (confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      try {
        await adminApi.deleteQuiz(quiz.id);
        // مسح الكاش
        for (let i = 10; i <= 100; i += 10) {
          simpleCache.delete(`admin_quizzes_${i}`);
        }
        fetchQuizzes();
        toast({ title: 'تم الحذف بنجاح' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'خطأ في الحذف' });
      }
    }
  }, [fetchQuizzes, toast]);

  const handleExportQuiz = useCallback(async (quiz: any) => {
    try {
      // جلب بيانات الاختبار الكاملة مع النماذج
      console.log('Fetching full quiz data for export dialog, quiz ID:', quiz.id);
      const fullQuizData = await adminApi.getQuizById(quiz.id);
      
      if (!fullQuizData) {
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات الاختبار",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Full quiz data loaded for dialog:', {
        id: fullQuizData.id,
        title: fullQuizData.title,
        versionsCount: fullQuizData.versions?.length || 0
      });
      
      setSelectedQuizForExport(fullQuizData);
      // Initialize with empty selection - admin has full freedom to choose
      setSelectedVersionsForExport([]);
      setIsExportDialogOpen(true);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الاختبار",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleConfirmExport = useCallback(async () => {
    if (!selectedQuizForExport) return;
    
    setIsExporting(true);
    try {
      // استخدام البيانات المحملة مسبقاً (تم جلبها عند فتح dialog)
      const fullQuizData = selectedQuizForExport;
      
      console.log('Using pre-loaded quiz data for export:', {
        id: fullQuizData.id,
        title: fullQuizData.title,
        hasQuestions: !!fullQuizData.questions,
        questionsCount: fullQuizData.questions?.length || 0,
        hasVersions: !!fullQuizData.versions,
        versionsCount: fullQuizData.versions?.length || 0
      });
      
      if (exportType === 'excel') {
        exportQuizToExcel(fullQuizData);
        toast({
          title: "تم التصدير بنجاح",
          description: "تم تصدير الاختبار إلى ملف Excel",
        });
      } else {
        // PDF export
        if (selectedPdfExportTypes.length === 0) {
          toast({
            title: "تنبيه",
            description: "يرجى اختيار نوع تصدير واحد على الأقل",
            variant: "destructive"
          });
          setIsExporting(false);
          return;
        }
        
        // التحقق من اختيار النماذج إذا كان الاختبار يحتوي على نماذج
        if (fullQuizData.versions && fullQuizData.versions.length > 0 && selectedVersionsForExport.length === 0) {
          toast({
            title: "تنبيه",
            description: "يرجى اختيار النماذج المراد تصديرها (جميع النماذج أو نماذج محددة)",
            variant: "destructive"
          });
          setIsExporting(false);
          return;
        }
        
        // التحقق من وجود أسئلة
        const hasQuestions = (fullQuizData.questions && fullQuizData.questions.length > 0) ||
                            (fullQuizData.versions && fullQuizData.versions.some((v: any) => v.questions && v.questions.length > 0));
        
        if (!hasQuestions) {
          toast({
            title: "خطأ",
            description: "الاختبار لا يحتوي على أسئلة للتصدير. يرجى إضافة أسئلة أولاً.",
            variant: "destructive"
          });
          setIsExporting(false);
          return;
        }
        
        // جلب الدروس المرتبطة
        const lessons = await adminApi.getLessons();
        const relatedLessons = lessons.filter(l => fullQuizData.lesson_ids?.includes(l.id));
        
        console.log('Starting PDF export with:', {
          exportTypes: selectedPdfExportTypes,
          relatedLessonsCount: relatedLessons.length
        });
        
        // تصفية النماذج بناءً على الاختيار
        let filteredQuizData = { ...fullQuizData };
        
        if (!selectedVersionsForExport.includes('all') && selectedVersionsForExport.length > 0) {
          // تصفية النماذج المحددة فقط
          filteredQuizData.versions = fullQuizData.versions?.filter((v: any) => 
            selectedVersionsForExport.includes(v.id)
          ) || [];
          
          console.log('Filtered versions:', {
            totalVersions: fullQuizData.versions?.length || 0,
            selectedVersions: filteredQuizData.versions.length,
            selectedIds: selectedVersionsForExport
          });
        }
        
        await exportQuizToPdf(filteredQuizData, selectedPdfExportTypes, relatedLessons);
        toast({
          title: "تم التصدير بنجاح",
          description: "تم تصدير الاختبار إلى ملف PDF",
        });
      }
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      
      // تحسين رسائل الخطأ
      let errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تصدير الاختبار";
      
      // معالجة أخطاء شائعة
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
        errorMessage = '⚠️ فشل الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
      } else if (errorMessage.includes('لا توجد نماذج للتصدير')) {
        errorMessage = '⚠️ لا توجد نماذج للتصدير. يرجى إنشاء نماذج أولاً.';
      } else if (errorMessage.includes('لا يحتوي على أسئلة')) {
        errorMessage = '⚠️ الاختبار لا يحتوي على أسئلة. يرجى إضافة أسئلة أولاً.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('انتهت المهلة')) {
        errorMessage = '⚠️ انتهت مهلة التصدير. يرجى تقليل عدد النماذج أو الصور والمحاولة مرة أخرى.';
      }
      
      toast({
        title: "خطأ في التصدير",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedQuizForExport, exportType, selectedPdfExportTypes, selectedVersionsForExport, toast]);

  return (
    <AdminLayout title="الاختبارات التفاعلية">
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-primary/5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <FileQuestion className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary leading-tight">الاختبارات التفاعلية</h2>
              <p className="text-xs text-muted-foreground font-medium">قم بإنشاء وإدارة نماذج الاختبارات الذكية لطلابك</p>
            </div>
          </div>
          <Button 
            onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}
            className="rounded-2xl h-12 px-6 gap-2 font-black shadow-lg shadow-primary/20 bg-primary hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5" />
            إنشاء اختبار جديد
          </Button>
        </div>

        {/* Quizzes List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="h-64 animate-pulse bg-muted/50 rounded-2xl border-none" />)}
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-muted rounded-[40px] bg-muted/5">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <FileQuestion className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">لا توجد اختبارات حالياً</h3>
            <p className="text-muted-foreground mb-6">ابدأ بإنشاء أول اختبار تفاعلي لطلابك</p>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)} className="rounded-xl">
              إنشاء اختبار الآن
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <AdminQuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onExport={handleExportQuiz} 
                  onDelete={handleDeleteQuiz} 
                  onEdit={handleEditQuiz} 
                />
              ))}
            </div>
            
            {/* زر تحميل المزيد */}
            {hasMoreQuizzes && !isLoading && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMoreQuizzes}
                  disabled={loadingMoreQuizzes}
                  size="lg"
                  className="rounded-2xl px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {loadingMoreQuizzes ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      تحميل المزيد من الاختبارات
                      <ChevronDown className="mr-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { if(!open) resetForm(); setIsCreateDialogOpen(open); }}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl arabic-font flex flex-col" dir="rtl">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingQuizId ? 'تعديل الاختبار التفاعلي' : 'إنشاء اختبار تفاعلي ذكي'}
              </DialogTitle>
              <DialogDescription>
                {editingQuizId ? 'يمكنك تعديل الأسئلة أو إضافة أسئلة جديدة يدوياً' : 'اختر الدروس وسيقوم الذكاء الاصطناعي بتوليد الأسئلة لك'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 py-4 px-1">{/* Added px-1 for scrollbar spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">الصف الدراسي</label>
                  <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">المادة الدراسية</label>
                  <Select onValueChange={setSelectedSubjectId} disabled={!selectedClassId} value={selectedSubjectId}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">عنوان الاختبار</label>
                <Input 
                  placeholder="مثال: مراجعة الوحدة الأولى" 
                  value={quizTitle} 
                  onChange={e => setQuizTitle(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-muted-foreground">حدد الدروس العامة (سيتم تطبيقها على النماذج الجديدة)</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                       <Checkbox 
                         id="select-all-lessons"
                         checked={lessons.length > 0 && selectedLessonIds.length === lessons.length}
                         onCheckedChange={(checked) => {
                           if (checked) setSelectedLessonIds(lessons.map(l => l.id));
                           else setSelectedLessonIds([]);
                         }}
                       />
                       <label htmlFor="select-all-lessons" className="text-xs font-bold text-primary cursor-pointer select-none">تحديد الكل</label>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-bold">{selectedLessonIds.length} دروس مختارة</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-muted/10 rounded-2xl border">
                  {lessons.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground text-sm col-span-2">يرجى اختيار مادة لعرض الدروس</p>
                  ) : (
                    lessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-3 rtl:space-x-reverse p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-primary/20">
                        <Checkbox 
                          id={lesson.id} 
                          checked={selectedLessonIds.includes(lesson.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedLessonIds(prev => [...prev, lesson.id]);
                            else setSelectedLessonIds(prev => prev.filter(id => id !== lesson.id));
                          }}
                        />
                        <label htmlFor={lesson.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          {lesson.title}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                      <Settings2 className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-black text-emerald-700">نوع توليد الأسئلة</h4>
                 </div>
                 
                 <div className="space-y-3">
                    <button
                      onClick={() => setQuizGenerationType('custom')}
                      className={cn(
                        "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 hover:scale-[1.01] active:scale-[0.99]",
                        quizGenerationType === 'custom' 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-slate-200 hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        quizGenerationType === 'custom' ? "border-primary bg-primary" : "border-slate-300"
                      )}>
                        {quizGenerationType === 'custom' && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-black text-base text-primary mb-1">توليد مخصص</h5>
                        <p className="text-xs text-muted-foreground font-bold">تحديد عدد ونوع الأسئلة يدوياً</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setQuizGenerationType('extract_from_image')}
                      className={cn(
                        "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 hover:scale-[1.01] active:scale-[0.99]",
                        quizGenerationType === 'extract_from_image' 
                          ? "border-emerald-500 bg-emerald-50 shadow-md" 
                          : "border-slate-200 hover:border-emerald-500/30"
                      )}
                    >
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        quizGenerationType === 'extract_from_image' ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                      )}>
                        {quizGenerationType === 'extract_from_image' && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-black text-base text-emerald-700 mb-1">الاستخراج من صور الدروس</h5>
                        <p className="text-xs text-muted-foreground font-bold">استخراج جميع الأسئلة بنفس العدد والنوع والصيغة</p>
                      </div>
                    </button>

                    {/* ─── الخيار الثالث: توليد طبق الأصل لصور الدرس ─── */}
                    <button
                      onClick={() => setQuizGenerationType('exam_paper_exact')}
                      className={cn(
                        "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 hover:scale-[1.01] active:scale-[0.99]",
                        quizGenerationType === 'exam_paper_exact'
                          ? "border-violet-500 bg-violet-50 shadow-md"
                          : "border-slate-200 hover:border-violet-500/30"
                      )}
                    >
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        quizGenerationType === 'exam_paper_exact' ? "border-violet-500 bg-violet-500" : "border-slate-300"
                      )}>
                        {quizGenerationType === 'exam_paper_exact' && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-black text-base text-violet-700">توليد طبق الأصل لصور الدرس</h5>
                          <span className="text-[10px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">جديد</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">نسخ الأسئلة حرفياً من صور الدرس مع تحديد الإجابات الصحيحة</p>
                      </div>
                    </button>
                 </div>
              </div>

              {quizGenerationType === 'custom' && (
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                      <ListChecks className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-black text-primary">تحديد عدد الأسئلة لكل نموذج</h4>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-primary flex items-center gap-2">
                          <HelpCircle className="h-5 w-5" />
                          عدد أسئلة الاختيار من متعدد
                       </label>
                       <Input 
                         type="number" 
                         min={0} 
                         max={30} 
                         value={mcqCount} 
                         onChange={e => {
                           const val = parseInt(e.target.value) || 0;
                           setMcqCount(val);
                           setQuestionCount(val + trueFalseCount);
                         }}
                         className="h-12 rounded-xl bg-white"
                       />
                       <p className="text-xs text-muted-foreground">أسئلة مع خيارات (A, B, C, D)</p>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-secondary flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          عدد أسئلة صح أو خطأ
                       </label>
                       <Input 
                         type="number" 
                         min={0} 
                         max={30} 
                         value={trueFalseCount} 
                         onChange={e => {
                           const val = parseInt(e.target.value) || 0;
                           setTrueFalseCount(val);
                           setQuestionCount(mcqCount + val);
                         }}
                         className="h-12 rounded-xl bg-white"
                       />
                       <p className="text-xs text-muted-foreground">أسئلة بنظام صح (✓) أو خطأ (✕)</p>
                    </div>
                 </div>
                 
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-2">
                       <BrainCircuit className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                       <div className="text-xs text-blue-900 font-bold leading-relaxed">
                          <strong className="block mb-1">إجمالي الأسئلة: {mcqCount + trueFalseCount} سؤال</strong>
                          سيتم توليد {mcqCount} سؤال اختيار من متعدد و {trueFalseCount} سؤال صح/خطأ لكل نموذج.
                       </div>
                    </div>
                 </div>
              </div>
              )}

              {quizGenerationType === 'extract_from_image' && (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                 <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-emerald-900 font-bold leading-relaxed">
                       <strong className="block mb-2">استخراج تلقائي من صور الدروس</strong>
                       <p className="mb-2">سيتم استخراج جميع الأسئلة من صور الدروس المختارة بنفس:</p>
                       <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>العدد الكامل للأسئلة الموجودة في الصور</li>
                          <li>نوع كل سؤال (اختيار من متعدد، صح/خطأ، سؤال مباشر)</li>
                          <li>صيغة السؤال والترقيم كما في الصورة</li>
                          <li>ترقيم وصيغة الاختيارات (A, B, C, D)</li>
                       </ul>
                       <p className="mt-2 text-xs">مع توليد الإجابات الصحيحة والشروحات التفصيلية لكل سؤال.</p>
                    </div>
                 </div>
              </div>
              )}

              {quizGenerationType === 'exam_paper_exact' && (
              <div className="p-6 bg-violet-50 rounded-2xl border border-violet-200">
                 <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-violet-900 font-bold leading-relaxed">
                       <strong className="block mb-2">استخراج طبق الأصل من صور الدروس</strong>
                       <p className="mb-2">يستخدم الذكاء الاصطناعي صور الدروس المرفوعة مسبقاً لاستخراج الأسئلة بصورتها الحرفية الكاملة:</p>
                       <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>نسخ كل سؤال بنفس الصياغة الحرفية تماماً كما هو في الصورة</li>
                          <li>الحفاظ على نفس الخيارات والترقيم وأسلوب الكتابة</li>
                          <li>يدعم: صح/خطأ، اختيار من متعدد، أسئلة مباشرة</li>
                          <li>يحدد الإجابة الصحيحة بالاعتماد على المعرفة العلمية</li>
                       </ul>
                       <p className="mt-2 text-xs text-violet-700">✦ لا حاجة لرفع صور إضافية — تُستخدم صور الدروس المرفوعة تلقائياً.</p>
                    </div>
                 </div>
              </div>
              )}

              {/* زر بدء التوليد - يظهر قبل قسم إضافة النماذج */}
              {!editingQuizId && selectedLessonIds.length > 0 && quizTitle && generatedVersions.length === 0 && (
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-2xl border-2 border-primary/20">
                  <Button 
                    onClick={handleGenerateQuiz}
                    disabled={isGenerating}
                    className={cn(
                      "w-full h-16 rounded-2xl text-lg font-black gap-3 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                      quizGenerationType === 'exam_paper_exact'
                        ? "bg-violet-600 hover:bg-violet-700 shadow-violet-400/40 hover:shadow-violet-600/60"
                        : "shadow-primary/40 hover:shadow-primary/60"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        جاري التوليد...
                      </>
                    ) : quizGenerationType === 'exam_paper_exact' ? (
                      <>
                        <GraduationCap className="h-6 w-6" />
                        إنشاء نماذج للاستخراج طبق الأصل
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6" />
                        بدء توليد الاختبار بالذكاء الاصطناعي
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    {quizGenerationType === 'exam_paper_exact'
                      ? 'سيتم إنشاء نموذج لكل درس مختار ثم استخراج الأسئلة من صور الدرس المرفوعة'
                      : 'سيتم توليد الأسئلة تلقائياً بناءً على الإعدادات المحددة أعلاه'}
                  </p>
                </div>
              )}

              {/* قسم إضافة النماذج - يظهر فقط عند التعديل أو بعد التوليد */}
              {(editingQuizId || generatedVersions.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-secondary/5 rounded-2xl border border-secondary/10">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-primary flex items-center gap-2">
                       <Layers className="h-4 w-4" />
                       إضافة نماذج تلقائياً
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        min={1} 
                        max={10} 
                        value={versionCount} 
                        onChange={e => setVersionCount(parseInt(e.target.value) || 1)}
                        className="h-12 rounded-xl bg-white"
                      />
                      <Button 
                        onClick={() => {
                          const updated = [...generatedVersions];
                          for (let i = 0; i < versionCount; i++) {
                            updated.push({
                              name: `النموذج (${updated.length + 1})`,
                              questions: [],
                              lesson_ids: [...selectedLessonIds],
                              question_count: questionCount
                            });
                          }
                          setGeneratedVersions(updated);
                        }}
                        variant="secondary"
                        className="h-12 rounded-xl"
                      >
                        إضافة
                      </Button>
                    </div>
                 </div>
              </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                     <Layers className="h-5 w-5" />
                     نماذج الاختبار ({generatedVersions.length})
                  </h3>
                  <div className="flex gap-2">
                    {generatedVersions.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl gap-2 border-primary/20 text-primary"
                        onClick={handleGenerateAllVersions}
                        disabled={generatingVersionIdx !== null}
                      >
                        {generatingVersionIdx !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                        توليد الكل دفعة واحدة
                      </Button>
                    )}
                    <Button variant="ghost" className="text-destructive text-xs h-9 rounded-xl" onClick={() => setGeneratedVersions([])}>
                       إعادة البدء
                    </Button>
                  </div>
                </div>
                
                {/* رسالة توضيحية لنماذج الاستخراج من الصور */}
                {(quizGenerationType === 'extract_from_image' || quizGenerationType === 'exam_paper_exact') && generatedVersions.length > 0 && (
                  <div className={cn(
                    "p-5 rounded-2xl border-2",
                    quizGenerationType === 'exam_paper_exact'
                      ? "bg-violet-50 border-violet-200"
                      : "bg-emerald-50 border-emerald-200"
                  )}>
                    <div className="flex items-start gap-3">
                      {quizGenerationType === 'exam_paper_exact'
                        ? <GraduationCap className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                        : <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
                      <div className={cn(
                        "text-sm font-bold leading-relaxed",
                        quizGenerationType === 'exam_paper_exact' ? "text-violet-900" : "text-emerald-900"
                      )}>
                        <strong className="block mb-2">تم إنشاء {generatedVersions.length} نموذج منفصل</strong>
                        <p className="mb-2">كل نموذج مرتبط بدرس واحد. يمكنك:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>الضغط على "توليد أسئلة النموذج ذكياً" لتوليد نموذج واحد</li>
                          <li>الضغط على "توليد الكل دفعة واحدة" لتوليد جميع النماذج</li>
                          {quizGenerationType === 'exam_paper_exact'
                            ? <li>سيتم نسخ الأسئلة طبق الأصل من صور كل درس</li>
                            : <li>سيتم استخراج الأسئلة من صور كل درس تلقائياً</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {generatedVersions.map((v, vIdx) => (
                    <Card key={vIdx} className="rounded-2xl border-2 overflow-hidden border-muted/20">
                      <div 
                        className="p-4 bg-muted/5 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                        onClick={() => toggleVersionExpand(vIdx)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${v.generated ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                            {v.generated ? <CheckCircle2 className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                          </div>
                          <div>
                            <Input 
                              value={v.name} 
                              onChange={(e) => { e.stopPropagation(); updateVersionConfig(vIdx, 'name', e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 font-bold text-primary bg-transparent border-none p-0 focus-visible:ring-0 w-64"
                            />
                            <p className="text-xs text-muted-foreground">
                              {v.generated && v.questions.length > 0 ? (
                                <span className="text-emerald-600 font-bold">✓ تم التوليد: {v.questions.length} سؤال</span>
                              ) : v.questions.length > 0 ? (
                                `${v.questions.length} سؤال تم توليدها`
                              ) : (
                                <span className="text-orange-600">⏳ في انتظار التوليد</span>
                              )}
                              {' • '}
                              {v.lesson_ids?.length || 0} دروس مختارة
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); removeVersion(vIdx); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {expandedVersions[vIdx] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>

                      {expandedVersions[vIdx] && (
                        <CardContent className="p-6 space-y-6 bg-white border-t">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">عدد الأسئلة المطلوب</label>
                              <Input 
                                type="number" 
                                min={1}
                                max={50}
                                value={v.question_count || 5} 
                                onChange={(e) => updateVersionConfig(vIdx, 'question_count', Math.max(1, parseInt(e.target.value) || 5))}
                                className="h-10 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">تخصيص الدروس لهذا النموذج</label>
                              <Dialog>
                                <Button asChild variant="outline" className="w-full h-10 rounded-lg gap-2 justify-start">
                                  <button>
                                    <BookOpen className="h-4 w-4" />
                                    تعديل دروس النموذج ({v.lesson_ids?.length || 0})
                                  </button>
                                </Button>
                                <DialogContent className="max-w-md rounded-2xl arabic-font" dir="rtl">
                                  <DialogHeader>
                                    <DialogTitle>اختيار دروس النموذج</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2">
                                    {lessons.map(l => (
                                      <div key={l.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                                        <Checkbox 
                                          id={`v-${vIdx}-l-${l.id}`}
                                          checked={v.lesson_ids?.includes(l.id)}
                                          onCheckedChange={(checked) => {
                                            const currentIds = v.lesson_ids || [];
                                            const updated = checked 
                                              ? [...currentIds, l.id]
                                              : currentIds.filter(id => id !== l.id);
                                            updateVersionConfig(vIdx, 'lesson_ids', updated);
                                          }}
                                        />
                                        <label htmlFor={`v-${vIdx}-l-${l.id}`} className="text-sm cursor-pointer">{l.title}</label>
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleGenerateSingleVersion(vIdx)} 
                              className="flex-1 rounded-xl gap-2 shadow-md h-12"
                              disabled={generatingVersionIdx === vIdx}
                            >
                              {generatingVersionIdx === vIdx ? <Loader2 className="h-5 w-5 animate-spin" /> : <BrainCircuit className="h-5 w-5" />}
                              توليد أسئلة النموذج ذكياً
                            </Button>
                            <Button variant="outline" className="rounded-xl h-12 px-6" onClick={() => addQuestion(vIdx)}>
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>

                          {v.questions.length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                              {v.questions.map((q, qIdx) => (
                                <div key={qIdx} className="p-4 border rounded-xl space-y-3 relative group">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">سؤال {qIdx + 1}</span>
                                       {q.source_reference && (
                                          <Badge variant="outline" className="text-[8px] font-bold border-secondary/20 text-secondary bg-secondary/5 px-2 py-0">
                                             {q.source_reference}
                                          </Badge>
                                       )}
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeQuestion(vIdx, qIdx)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="إعادة توليد هذا السؤال"
                                      disabled={regeneratingQuestionKey !== null}
                                      className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRegenerateQuestion(vIdx, qIdx)}
                                    >
                                      {regeneratingQuestionKey === `${vIdx}_${qIdx}` ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <textarea 
                                    value={q.question} 
                                    onChange={e => updateQuestion(vIdx, qIdx, 'question', e.target.value)}
                                    className="w-full text-sm font-bold bg-transparent border-none p-0 focus:ring-0 resize-none"
                                    rows={2}
                                  />
                                  
                                  {/* Question Metadata */}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <Select 
                                      value={q.type || 'mcq'} 
                                      onValueChange={val => updateQuestion(vIdx, qIdx, 'type', val)}
                                    >
                                      <SelectTrigger className="h-7 px-2 text-[10px] w-fit border-none bg-muted/50 rounded-md">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                                        <SelectItem value="true_false">صح/خطأ</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Select 
                                      value={q.difficulty || 'medium'} 
                                      onValueChange={val => updateQuestion(vIdx, qIdx, 'difficulty', val)}
                                    >
                                      <SelectTrigger className={cn(
                                        "h-7 px-2 text-[10px] w-fit border-none rounded-md",
                                        (q.difficulty || 'medium') === 'easy' ? "bg-emerald-100 text-emerald-700" : 
                                        (q.difficulty || 'medium') === 'medium' ? "bg-blue-100 text-blue-700" : 
                                        "bg-rose-100 text-rose-700"
                                      )}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="easy">سهل</SelectItem>
                                        <SelectItem value="medium">متوسط</SelectItem>
                                        <SelectItem value="hard">صعب</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className={cn(
                                        "flex items-center gap-2 p-2 rounded-lg border text-xs",
                                        q.correct_option_index === oIdx ? "border-green-500 bg-green-50" : "border-muted"
                                      )}>
                                        <Checkbox 
                                          checked={q.correct_option_index === oIdx}
                                          onCheckedChange={() => updateQuestion(vIdx, qIdx, 'correct_option_index', oIdx)}
                                          className="h-3 w-3"
                                        />
                                        <Input 
                                          value={opt} 
                                          onChange={e => updateOption(vIdx, qIdx, oIdx, e.target.value)}
                                          className="h-6 text-xs p-0 border-none bg-transparent"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Attachments and Explanations (Always Visible - Editable) */}
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        شرح وتوضيح الإجابة
                                      </label>
                                      <textarea 
                                        value={q.explanation || ''} 
                                        onChange={e => updateQuestion(vIdx, qIdx, 'explanation', e.target.value)}
                                        placeholder="أضف شرحاً مفصلاً للإجابة..."
                                        className="w-full text-xs bg-white/50 border-blue-100 rounded-md p-2 focus:ring-1 focus:ring-blue-300 min-h-[60px] resize-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
                                          <BrainCircuit className="h-3 w-3" />
                                          طريقة الحل
                                        </label>
                                        <Input 
                                          value={q.method || ''} 
                                          onChange={e => updateQuestion(vIdx, qIdx, 'method', e.target.value)}
                                          placeholder="طريقة الوصول للحل..."
                                          className="h-8 text-xs bg-white/50 border-blue-100 focus:ring-1 focus:ring-blue-300"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
                                          <BookOpen className="h-3 w-3" />
                                          مرجع المعلومة
                                        </label>
                                        <Input 
                                          value={q.source_reference || ''} 
                                          onChange={e => updateQuestion(vIdx, qIdx, 'source_reference', e.target.value)}
                                          placeholder="مثال: ص 15 - الفقرة 2"
                                          className="h-8 text-xs bg-white/50 border-blue-100 focus:ring-1 focus:ring-blue-300"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                  
                  {generatedVersions.length === 0 && (
                    <div className="text-center py-12 bg-muted/5 border-2 border-dashed rounded-2xl">
                      <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">ابدأ بإضافة نماذج الاختبار أعلاه</p>
                      <Button variant="link" onClick={() => addEmptyVersion()}>أو أضف نموذجاً يدوياً الآن</Button>
                    </div>
                  )}

                  <Button variant="outline" className="w-full border-dashed rounded-xl h-12" onClick={addEmptyVersion}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة نموذج اختبار إضافي
                  </Button>
                </div>

                {generatedVersions.length > 0 && (
                  <Button 
                    onClick={handleSaveQuiz} 
                    className="w-full h-14 rounded-2xl text-lg gap-2 shadow-xl shadow-primary/30 mt-6"
                    disabled={isSaving || generatedVersions.some(v => v.questions.length === 0)}
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                    {editingQuizId ? 'حفظ التعديلات ونشر النماذج' : 'حفظ ونشر الاختبار بجميع نماذجه'}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Sheet (Cloud Style) */}
        <Sheet open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <SheetContent side="bottom" className="rounded-t-[32px] h-[85vh] overflow-y-auto">
            <SheetHeader className="text-right">
              <SheetTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Download className="h-6 w-6" />
                </div>
                خيارات تصدير الاختبار السحابي
              </SheetTitle>
              <SheetDescription className="text-sm font-medium text-muted-foreground">
                اختر أنواع التصدير التي تريد دمجها في ملف واحد مرتب
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-8 py-8 px-2">
              {/* Export Type Selection */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-primary flex items-center gap-2">
                  <Layers className="h-4 w-4" /> نوع ملف التصدير
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportType('excel')}
                    className={cn(
                      "p-5 rounded-3xl border-2 transition-all text-right group",
                      exportType === 'excel' 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                        : "border-muted hover:border-primary/20 bg-muted/5"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-black text-primary">Excel</div>
                      <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center", exportType === 'excel' ? "border-primary bg-primary text-white" : "border-muted")}>
                        {exportType === 'excel' && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold">ملف إكسل مع جميع بيانات الاختبار</div>
                  </button>
                  <button
                    onClick={() => setExportType('pdf')}
                    className={cn(
                      "p-5 rounded-3xl border-2 transition-all text-right group",
                      exportType === 'pdf' 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                        : "border-muted hover:border-primary/20 bg-muted/5"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-black text-primary">PDF</div>
                      <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center", exportType === 'pdf' ? "border-primary bg-primary text-white" : "border-muted")}>
                        {exportType === 'pdf' && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold">ملف PDF احترافي قابل للطباعة</div>
                  </button>
                </div>
              </div>

              {/* PDF Export Content Selection */}
              {exportType === 'pdf' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <label className="text-sm font-bold text-primary flex items-center gap-2">
                    <ListChecks className="h-4 w-4" /> حدد محتويات الملف (يمكن اختيار أكثر من نوع)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'questions_with_all_options' as QuizPdfExportType, label: 'الأسئلة مع جميع الخيارات', desc: 'مناسب للامتحانات والمراجعة' },
                      { id: 'questions_only' as QuizPdfExportType, label: 'الأسئلة فقط (بدون خيارات)', desc: 'للتدريب على استخراج المعلومات' },
                      { id: 'questions_with_correct_answers' as QuizPdfExportType, label: 'الأسئلة مع الإجابات الصحيحة', desc: 'للتصحيح الذاتي والمراجعة' },
                      { id: 'answers_with_explanations' as QuizPdfExportType, label: 'الإجابات مع الشرح والتوضيح', desc: 'للفهم العميق وطريقة الحل' },
                      { id: 'answer_key_only' as QuizPdfExportType, label: 'مفتاح الإجابات فقط', desc: 'للتصحيح السريع' },
                      { id: 'lesson_images_only' as QuizPdfExportType, label: 'صور الدروس المرتبطة', desc: 'لعرض المرجع الأصلي' },
                      { id: 'lesson_names_only' as QuizPdfExportType, label: 'أسماء الدروس المرتبطة', desc: 'فهرس للدروس المشمولة' }
                    ].map((type) => (
                      <div 
                        key={type.id}
                        onClick={() => togglePdfExportType(type.id)}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          selectedPdfExportTypes.includes(type.id)
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                            : "border-muted hover:border-primary/20 bg-muted/5"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all",
                          selectedPdfExportTypes.includes(type.id)
                            ? "border-primary bg-primary text-white"
                            : "border-muted-foreground/30"
                        )}>
                          {selectedPdfExportTypes.includes(type.id) && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-primary leading-none mb-1">{type.label}</p>
                          <p className="text-[9px] text-muted-foreground font-bold">{type.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Version Selection - Only show if quiz has versions */}
                  {selectedQuizForExport?.versions && selectedQuizForExport.versions.length > 0 && (() => {
                    return (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-primary flex items-center gap-2">
                          <FileQuestion className="h-4 w-4" /> حدد النماذج المراد تصديرها
                        </label>
                        {selectedVersionsForExport.length === 0 && (
                          <span className="text-[9px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">
                            مطلوب الاختيار
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {/* Select All Option */}
                        <div 
                          onClick={() => {
                            toggleVersionSelection('all');
                          }}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                            selectedVersionsForExport.includes('all')
                              ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                              : "border-muted hover:border-primary/20 bg-muted/5"
                          )}
                        >
                          <div className={cn(
                            "h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all",
                            selectedVersionsForExport.includes('all')
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/30"
                          )}>
                            {selectedVersionsForExport.includes('all') && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <div className="text-right flex-1">
                            <p className="text-xs font-black text-primary leading-none">جميع النماذج ({selectedQuizForExport.versions.length + 1})</p>
                            <p className="text-[9px] text-muted-foreground font-bold mt-1">النموذج الأصلي + جميع النماذج البديلة</p>
                          </div>
                        </div>
                        
                        {/* Individual Version Options - Always show */}
                        <div className="space-y-2">
                          {selectedVersionsForExport.includes('all') ? (
                            // Show message when "all" is selected
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-3 items-center">
                              <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-green-700" />
                              </div>
                              <div className="text-right flex-1">
                                <p className="text-[10px] text-green-900 font-bold">
                                  تم اختيار جميع النماذج ({selectedQuizForExport.versions.length + 1} نموذج)
                                </p>
                                <p className="text-[9px] text-green-700 font-medium mt-0.5">
                                  انقر على "جميع النماذج" أعلاه لإلغاء التحديد واختيار نماذج محددة
                                </p>
                              </div>
                            </div>
                          ) : (
                            // Show individual version checkboxes
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              {selectedQuizForExport.versions.map((version: any, idx: number) => (
                                <div 
                                  key={version.id}
                                  onClick={() => {
                                    toggleVersionSelection(version.id);
                                  }}
                                  className={cn(
                                    "flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                                    selectedVersionsForExport.includes(version.id)
                                      ? "border-primary bg-primary/5"
                                      : "border-muted hover:border-primary/20 bg-muted/5"
                                  )}
                                >
                                  <div className={cn(
                                    "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-all",
                                    selectedVersionsForExport.includes(version.id)
                                      ? "border-primary bg-primary text-white"
                                      : "border-muted-foreground/30"
                                  )}>
                                    {selectedVersionsForExport.includes(version.id) && <CheckCircle2 className="h-3 w-3" />}
                                  </div>
                                  <div className="text-right flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-primary leading-none truncate">{version.name || `النموذج ${idx + 1}`}</p>
                                    <p className="text-[8px] text-muted-foreground font-bold mt-0.5">{version.questions?.length || 0} سؤال</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Selection Summary */}
                      {!selectedVersionsForExport.includes('all') && selectedVersionsForExport.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex gap-2 items-center">
                          <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />
                          </div>
                          <p className="text-[9px] text-blue-900 font-bold">
                            تم اختيار {selectedVersionsForExport.length} نموذج للتصدير
                          </p>
                        </div>
                      )}
                    </div>
                    );
                  })()}
                  
                  {/* Important Note */}
                  <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                      <BrainCircuit className="h-4 w-4 text-amber-700" />
                    </div>
                    <p className="text-[10px] text-amber-900 leading-relaxed font-bold">
                      سيتم دمج جميع الخيارات المختارة في ملف PDF واحد ذكي. تم تحسين الصور لتقليل الحجم مع الحفاظ على دقة القراءة العالية والطباعة.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
                className="flex-1 rounded-2xl h-14 font-black text-muted-foreground"
                disabled={isExporting}
              >
                إلغاء التصدير
              </Button>
              <Button
                onClick={handleConfirmExport}
                className="flex-[2] rounded-2xl h-14 gap-2 font-black text-lg shadow-xl shadow-primary/20"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري التحضير...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    بدء التصدير السحابي
                  </>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
};

export default AdminQuizzes;
