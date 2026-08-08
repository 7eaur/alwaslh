import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi, aiApi, storageApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Class, Subject, Lesson, QuizQuestion, DetectedPage } from '@/types';
import { cn, parsePageNumber } from '@/lib/utils';
import { useQuestionGeneration } from '@/contexts/QuestionGenerationContext';
import { GenerationTaskIndicator } from '@/components/common/GenerationTaskIndicator';
import ExportHistoryDialog from '@/components/admin/ExportHistoryDialog';
import { 
  Plus, 
  Trash2, 
  Edit3,
  Edit2,
  BookOpen, 
  Loader2, 
  Upload, 
  Sparkles, 
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Save,
  Wand2,
  MoreHorizontal,
  FileText,
  HelpCircle,
  X,
  Type,
  Mic,
  Layout,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings2,
  Check,
  Download,
  Printer,
  ChevronDown,
  FileImage,
  ScanText,
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  exportLessonToExcel, 
  exportMultipleLessonsToExcel, 
  exportLessonToPDF,
  exportLessonsWithOptions,
  ExportOptions
} from '@/lib/export';
import { ExportOptionsDialog } from '@/components/admin/ExportOptionsDialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useLessonUpload } from '@/contexts/LessonUploadContext';
import { processFiles } from '@/lib/file-processing';

const AdminLessonCard = React.memo(({ 
  lesson, 
  isSelected, 
  onToggleBulk, 
  onPreview, 
  onDelete, 
  onEditTitle,
  onAction,
  onQuestionTypeSelect,
  onEditQuestions,
  onExportPDF,
  onEditSummary,
  onDeleteSummary,
  onDeleteQuestions,
  processingTask 
}: { 
  lesson: Lesson; 
  isSelected: boolean; 
  onToggleBulk: (id: string) => void; 
  onPreview: (lesson: Lesson) => void; 
  onDelete: (id: string) => void; 
  onEditTitle: (lesson: Lesson) => void;
  onAction: (lesson: Lesson, task: any) => void;
  onQuestionTypeSelect: (lesson: Lesson) => void;
  onEditQuestions?: (lesson: Lesson) => void;
  onExportPDF: (lesson: Lesson) => void;
  onEditSummary?: (lesson: Lesson) => void;
  onDeleteSummary?: (lesson: Lesson) => void;
  onDeleteQuestions?: (lesson: Lesson) => void;
  processingTask?: string; 
}) => {
  return (
    <Card className={cn(
      "overflow-hidden border-2 shadow-lg rounded-3xl group animate-fade-in transition-all",
      isSelected ? "border-primary bg-primary/5" : "border-primary/10"
    )}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-3 flex-1 ml-4">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onToggleBulk(lesson.id)}
              className="mt-2 h-5 w-5 rounded-md"
            />
            <h3 className="text-2xl font-black text-primary leading-tight line-clamp-2">
              {lesson.title}
              {lesson.page_number && <span className="text-sm font-bold text-muted-foreground mr-2">(صفحة {lesson.page_number})</span>}
            </h3>
          </div>
          <div className="flex gap-2 shrink-0">
             <Button 
               size="icon" 
               variant="outline" 
               className="h-10 w-10 rounded-full border-primary text-primary hover:bg-primary/5" 
               onClick={() => onPreview(lesson)}
             >
                <Eye className="h-5 w-5" />
             </Button>
             <Button 
               size="icon" 
               variant="outline" 
               className="h-10 w-10 rounded-full border-green-500 text-green-500 hover:bg-green-50"
               onClick={() => onExportPDF(lesson)}
               title="تصدير PDF"
             >
                <Download className="h-5 w-5" />
             </Button>
             <Button 
               size="icon" 
               variant="outline" 
               className="h-10 w-10 rounded-full border-amber-500 text-amber-500 hover:bg-amber-50"
               onClick={() => onEditTitle(lesson)}
             >
                <Edit3 className="h-5 w-5" />
             </Button>
             <Button 
               size="icon" 
               variant="outline" 
               className="h-10 w-10 rounded-full border-destructive text-destructive hover:bg-destructive/5"
               onClick={() => onDelete(lesson.id)}
             >
                <Trash2 className="h-5 w-5" />
             </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
            lesson.summary ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"
          )}>
            {lesson.summary ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {lesson.summary ? 'تم التلخيص' : 'بانتظار التلخيص'}
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
            lesson.extracted_text ? "bg-green-100 text-green-700" : "bg-orange-50 text-orange-600"
          )}>
            {lesson.extracted_text ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {lesson.extracted_text ? 'تم استخراج النص' : 'بانتظار النص'}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-muted/30 text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            صفحات {lesson.image_urls?.length || 0}
          </div>
          <div 
            key={`questions-badge-${lesson.id}-${lesson.ai_questions?.length || 0}`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
              lesson.ai_questions?.length > 0 ? "bg-green-100 text-green-700" : "bg-purple-50 text-purple-600"
            )}
          >
            {lesson.ai_questions?.length > 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <HelpCircle className="h-3.5 w-3.5" />}
            {lesson.ai_questions?.length > 0 ? `تم توليد ${lesson.ai_questions.length} سؤال` : 'بانتظار الأسئلة'}
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full h-14 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2 group/btn"
            onClick={() => onAction(lesson, 'comprehensive')}
            disabled={!!processingTask}
          >
            {processingTask === 'comprehensive' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
            )}
            معالجة شاملة للدرس
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-12 rounded-xl gap-2 font-bold border-primary/10 hover:bg-primary/5"
              onClick={() => onAction(lesson, 'summary')}
              disabled={!!processingTask}
            >
              {processingTask === 'summary' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              توليد ملخص
            </Button>
            <Button 
              variant="outline" 
              className="h-12 rounded-xl gap-2 font-bold border-primary/10 hover:bg-primary/5"
              onClick={() => onAction(lesson, 'text')}
              disabled={!!processingTask}
            >
              {processingTask === 'text' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              استخراج النص
            </Button>
          </div>
          
          {/* أزرار إدارة الملخص والأسئلة */}
          {lesson.summary && (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-10 rounded-xl gap-2 text-xs font-bold border-amber-200 hover:bg-amber-50 text-amber-700"
                onClick={() => onEditSummary?.(lesson)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                تعديل الملخص
              </Button>
              <Button 
                variant="outline" 
                className="h-10 rounded-xl gap-2 text-xs font-bold border-red-200 hover:bg-red-50 text-red-600"
                onClick={() => onDeleteSummary?.(lesson)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف الملخص
              </Button>
            </div>
          )}
          
          {lesson.ai_questions && lesson.ai_questions.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-10 rounded-xl gap-2 text-xs font-bold border-blue-200 hover:bg-blue-50 text-blue-600"
                onClick={() => onEditQuestions?.(lesson)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                تعديل الأسئلة
              </Button>
              <Button 
                variant="outline" 
                className="h-10 rounded-xl gap-2 text-xs font-bold border-red-200 hover:bg-red-50 text-red-600"
                onClick={() => onDeleteQuestions?.(lesson)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف ({lesson.ai_questions.length})
              </Button>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl gap-2 font-bold border-primary/10 hover:bg-primary/5"
            onClick={() => onQuestionTypeSelect(lesson)}
            disabled={!!processingTask}
          >
            {processingTask === 'questions' ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
            توليد أسئلة اختبار
          </Button>
        </div>
      </div>
    </Card>
  );
});

const AdminLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [lessonsLimit, setLessonsLimit] = useState(50); // تحميل 50 درس فقط
  const [hasMoreLessons, setHasMoreLessons] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Export History
  const [exportHistoryOpen, setExportHistoryOpen] = useState(false);
  
  // Question Type Selection
  const [questionTypeDialogOpen, setQuestionTypeDialogOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<'mcq' | 'true_false' | 'both' | 'extract_from_image' | 'exam_paper_exact' | 'replica'>('both');
  const [pendingQuestionLesson, setPendingQuestionLesson] = useState<Lesson | null>(null);
  const [pendingBulkQuestions, setPendingBulkQuestions] = useState<Lesson[]>([]);
  // حالة صور ورقة الامتحان (للوضع الجديد exam_paper_exact)
  const [examPaperFiles, setExamPaperFiles] = useState<File[]>([]);
  const [examPaperPreviews, setExamPaperPreviews] = useState<string[]>([]);
  const [examPaperLoading, setExamPaperLoading] = useState(false);
  
  // Context
  const { 
    startNewTask, 
    tasks, 
    removeTask, 
    updateTaskPages, 
    patchTaskPage, 
    reanalyzePage, 
    reanalyzePages, 
    reanalyzingPageIds, 
    completedPageIds,
    saveLessonFromTask, 
    batchSaveLessons,
    isSavingBulk,
    saveReport,
    clearSaveReport,
    refreshTasks 
  } = useLessonUpload();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask = activeTaskId ? tasks[activeTaskId] : null;

  // Archive state
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  // Wizard UI State (only for UI navigation)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [creationMode, setCreationMode] = useState<'single' | 'by-page' | 'by-title'>('single');
  const [wizardSubjectId, setWizardSubjectId] = useState<string>('');
  const [wizardClassId, setWizardClassId] = useState<string>('');
  
  // Selection & Generation Local State
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageData, setEditingPageData] = useState<{ title: string; page_number: number | null }>({ title: '', page_number: null });
  const [visiblePagesCount, setVisiblePagesCount] = useState(12);

  const [generatedLesson, setGeneratedLesson] = useState<{
    title: string;
    summary: string;
    questions: QuizQuestion[];
    page_number: number | '';
  }>({ title: '', summary: '', questions: [], page_number: '' });
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [processingLessons, setProcessingLessons] = useState<Record<string, string>>({}); // lessonId -> taskName
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingQuestionData, setEditingQuestionData] = useState<QuizQuestion | null>(null);
  
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPageNumber, setNewPageNumber] = useState<number | ''>('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Export Options
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [lessonsToExport, setLessonsToExport] = useState<Lesson[]>([]);

  // Filters for lazy loading
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('');


  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { startGeneration, activeTasks } = useQuestionGeneration();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 بدء تحميل البيانات...', { 
        selectedSubjectFilter, 
        lessonsLimit 
      });
      
      const [cls, subs] = await Promise.all([
        adminApi.getClasses(),
        adminApi.getSubjects(),
      ]);
      
      // إذا كانت هناك مادة مختارة، تحميل جميع دروسها (بدون limit)
      let less: Lesson[] = [];
      if (selectedSubjectFilter && selectedSubjectFilter !== 'all') {
        console.log('📚 تحميل جميع دروس المادة:', selectedSubjectFilter);
        less = await adminApi.getLessons(selectedSubjectFilter); // بدون limit
        console.log('✅ تم تحميل:', less.length, 'درس');
      } else {
        // تحميل أول 50 درس فقط
        const allLessons = await adminApi.getLessons(undefined, lessonsLimit + 1);
        const hasMore = allLessons.length > lessonsLimit;
        less = hasMore ? allLessons.slice(0, lessonsLimit) : allLessons;
        setHasMoreLessons(hasMore);
        console.log('✅ تم تحميل:', less.length, 'درس', { hasMore });
      }
      
      setClasses(cls);
      setSubjects(subs);
      setLessons(less);
    } catch (err) {
      console.error('❌ خطأ في جلب البيانات:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonsLimit, selectedSubjectFilter]);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const newLimit = lessonsLimit + 50;
      setLessonsLimit(newLimit);
      // fetchData سيتم استدعاؤه تلقائياً بسبب useEffect
    } catch (err) {
      console.error('❌ خطأ في تحميل المزيد:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [lessonsLimit]);

  const handleLessonAction = useCallback(async (lesson: Lesson, task: 'comprehensive' | 'summary' | 'questions' | 'text', questionType?: 'mcq' | 'true_false' | 'both' | 'extract_from_image' | 'replica') => {
    if (processingLessons[lesson.id]) return;
    
    setProcessingLessons(prev => ({ ...prev, [lesson.id]: task }));
    // CRITICAL: Always use ai_thumbnails (compressed) for faster processing
    const imageUrls = lesson.ai_thumbnails?.length ? lesson.ai_thumbnails : lesson.image_urls || [];
    
    try {
      if (task === 'summary' || task === 'comprehensive') {
        const summary = await aiApi.generateSummary(imageUrls);
        if (summary) {
          await adminApi.updateLesson(lesson.id, { summary });
          
          // CRITICAL: Update state immediately to ensure fresh data for export
          setLessons(prev => prev.map(l => 
            l.id === lesson.id ? { ...l, summary, ai_summary: summary } : l
          ));
          
          toast({ title: '✅ اكتمل الملخص', description: `تم توليد ملخص لدرس ${lesson.title}` });
        } else {
          toast({ variant: 'destructive', title: 'تنبيه', description: `لم يتمكن الذكاء الاصطناعي من توليد ملخص لدرس ${lesson.title}` });
        }
      }
      
      if (task === 'questions' || task === 'comprehensive') {
        const qType = questionType || 'both';
        
        // Check if extraction mode
        if (qType === 'extract_from_image') {
          // Show progress toast for extraction
          toast({ 
            title: '⚡ جاري الاستخراج...', 
            description: `يتم الآن استخراج جميع الأسئلة من صورة درس ${lesson.title}. قد يستغرق هذا 15-30 ثانية.` 
          });
          
          const questions = await aiApi.extractQuestions(imageUrls);
          if (questions && questions.length > 0) {
            // إضافة رابط صورة الدرس الأولى لكل سؤال
            const questionsWithImages = questions.map(q => ({
              ...q,
              lesson_id: lesson.id,
              lesson_page_url: imageUrls[0] || undefined
            }));
            await adminApi.updateLesson(lesson.id, { ai_questions: questionsWithImages });
            
            // CRITICAL: Update state immediately to ensure fresh data
            setLessons(prev => prev.map(l => 
              l.id === lesson.id ? { ...l, ai_questions: questionsWithImages } : l
            ));
            
            toast({ 
              title: '✅ اكتمل الاستخراج', 
              description: `تم استخراج ${questions.length} سؤال من صورة درس ${lesson.title}` 
            });
          } else {
            toast({ variant: 'destructive', title: 'تنبيه', description: `لم يتمكن الذكاء الاصطناعي من استخراج أسئلة من صورة درس ${lesson.title}` });
          }
        } else if (qType === 'replica') {
          // ─── توليد أسئلة "طبق الأصل" ───
          toast({ 
            title: '⚡ جاري التوليد طبق الأصل...', 
            description: `يتم الآن تحليل صور درس ${lesson.title} وتوليد أسئلة مطابقة بنفس العدد والنوع والصيغة. قد يستغرق هذا 20-40 ثانية.` 
          });
          
          const questions = await aiApi.generateReplicaQuestions(imageUrls);
          if (questions && questions.length > 0) {
            const questionsWithMeta = questions.map(q => ({
              ...q,
              lesson_id: lesson.id,
              lesson_page_url: imageUrls[0] || undefined
            }));
            await adminApi.updateLesson(lesson.id, { ai_questions: questionsWithMeta });
            
            setLessons(prev => prev.map(l => 
              l.id === lesson.id ? { ...l, ai_questions: questionsWithMeta } : l
            ));
            
            toast({ 
              title: '✅ اكتمل التوليد طبق الأصل', 
              description: `تم توليد ${questions.length} سؤال مطابق للأصل لدرس ${lesson.title}` 
            });
          } else {
            toast({ variant: 'destructive', title: 'تنبيه', description: `لم يتمكن الذكاء الاصطناعي من توليد أسئلة طبق الأصل لدرس ${lesson.title}` });
          }
        } else {
          // Show progress toast for generation
          toast({ 
            title: '⚡ جاري التوليد...', 
            description: `يتم الآن توليد أسئلة شاملة لدرس ${lesson.title}. قد يستغرق هذا 10-20 ثانية.` 
          });
          
          console.log('Starting question generation for lesson:', lesson.id, lesson.title);
          console.log('Image URLs count:', imageUrls.length);
          
          const questions = await aiApi.generateQuestions(imageUrls, qType, undefined, lesson.subject_id, lesson.id);
          
          console.log('Questions generated:', questions?.length || 0);
          console.log('Questions data:', questions);
          
          if (questions && questions.length > 0) {
            // إضافة رابط صورة الدرس الأولى لكل سؤال
            const questionsWithImages = questions.map(q => ({
              ...q,
              lesson_id: lesson.id,
              lesson_page_url: imageUrls[0] || undefined // استخدام الصورة الأولى كمرجع
            }));
            
            console.log('Saving questions to database...');
            await adminApi.updateLesson(lesson.id, { ai_questions: questionsWithImages });
            console.log('Questions saved successfully');
            
            // CRITICAL: Update state immediately to ensure fresh data
            setLessons(prev => {
              const updated = prev.map(l => 
                l.id === lesson.id ? { ...l, ai_questions: questionsWithImages } : l
              );
              console.log('State updated, new lesson data:', updated.find(l => l.id === lesson.id));
              return updated;
            });
            
            // Force re-fetch to ensure UI is in sync with database
            setTimeout(async () => {
              try {
                console.log('Fetching fresh data from database...');
                const allLessons = await adminApi.getLessons();
                const freshLesson = allLessons.find(l => l.id === lesson.id);
                console.log('Fresh lesson data:', freshLesson);
                
                if (freshLesson) {
                  setLessons(prev => prev.map(l => 
                    l.id === lesson.id ? freshLesson : l
                  ));
                }
              } catch (err) {
                console.error('Error fetching fresh lesson data:', err);
              }
            }, 500);
            
            toast({ 
              title: '✅ اكتملت الأسئلة', 
              description: `تم توليد ${questions.length} سؤال شامل لدرس ${lesson.title}. الأسئلة جاهزة للعرض!` 
            });
          } else {
            console.error('No questions generated');
            toast({ variant: 'destructive', title: 'تنبيه', description: `لم يتمكن الذكاء الاصطناعي من توليد أسئلة لدرس ${lesson.title}` });
          }
        }
      }

      if (task === 'text' || task === 'comprehensive') {
        const text = await aiApi.extractText(imageUrls);
        if (text) {
          await adminApi.updateLesson(lesson.id, { extracted_text: text });
          
          // CRITICAL: Update state immediately to ensure fresh data
          setLessons(prev => prev.map(l => 
            l.id === lesson.id ? { ...l, extracted_text: text } : l
          ));
          
          toast({ title: '✅ اكتمل استخراج النص', description: `تم استخراج النص لدرس ${lesson.title}` });
        } else {
          toast({ variant: 'destructive', title: 'تنبيه', description: `لم يتمكن الذكاء الاصطناعي من استخراج النص لدرس ${lesson.title}` });
        }
      }
      
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error('Lesson processing error:', err);
      
      // تحسين رسائل الخطأ
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
      }
      
      toast({ 
        variant: 'destructive', 
        title: '❌ فشل المعالجة', 
        description: errorMessage
      });
    } finally {
      setProcessingLessons(prev => {
        const next = { ...prev };
        delete next[lesson.id];
        return next;
      });
    }
  }, [processingLessons, fetchData, toast]);

  const handleQuestionTypeSelection = useCallback((lesson: Lesson) => {
    console.log('Opening question type dialog for lesson:', lesson.title);
    setPendingQuestionLesson(lesson);
    setQuestionTypeDialogOpen(true);
  }, []);

  const handleExportPDF = useCallback(async (lesson: Lesson) => {
    setLessonsToExport([lesson]);
    setExportDialogOpen(true);
  }, []);

  const handleBulkExportPDF = useCallback(() => {
    const lessonsToExport = lessons.filter(l => selectedBulkIds.includes(l.id));
    if (lessonsToExport.length === 0) return;
    setLessonsToExport(lessonsToExport);
    setExportDialogOpen(true);
  }, [lessons, selectedBulkIds]);

  const handleExportConfirm = useCallback(async (options: ExportOptions) => {
    if (lessonsToExport.length === 0) {
      toast({ 
        variant: 'destructive', 
        title: '❌ خطأ', 
        description: 'لا توجد دروس محددة للتصدير'
      });
      return;
    }
    
    console.log('Starting export with options:', options);
    console.log('Lessons to export:', lessonsToExport.length);
    
    // CRITICAL: Re-fetch lessons from database to ensure we have latest data including summaries
    console.log('🔄 Re-fetching lessons from database to get latest summaries...');
    const lessonIds = lessonsToExport.map(l => l.id);
    const { data: freshLessons, error: fetchError } = await supabase
      .from('lessons')
      .select('*, subjects(name, classes(name))')
      .in('id', lessonIds);
    
    if (fetchError) {
      console.error('❌ Error fetching fresh lesson data:', fetchError);
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: 'فشل في جلب بيانات الدروس'
      });
      return;
    }
    
    console.log('✅ Fresh lessons fetched:', freshLessons?.length);
    freshLessons?.forEach(lesson => {
      console.log(`📚 Lesson "${lesson.title}":`, {
        has_ai_summary: !!lesson.ai_summary,
        has_summary: !!lesson.summary,
        ai_summary_length: lesson.ai_summary?.length || 0,
        summary_length: lesson.summary?.length || 0,
        subject_name: (lesson as any).subjects?.name,
        class_name: (lesson as any).subjects?.classes?.name
      });
    });
    
    const lessonsWithFreshData = freshLessons || lessonsToExport;
    
    // CRITICAL: Open window IMMEDIATELY (before any async operations) to avoid popup blocker
    console.log('Opening print window immediately...');
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      console.error('Failed to open print window - popup blocked');
      toast({ 
        variant: 'destructive', 
        title: '❌ تم حظر النافذة المنبثقة', 
        description: 'يرجى السماح بالنوافذ المنبثقة لهذا الموقع من إعدادات المتصفح، ثم المحاولة مرة أخرى'
      });
      return;
    }
    
    // Write loading message to the window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>جاري التحميل...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #00acc1, #00838f);
            color: white;
          }
          .loader {
            text-align: center;
          }
          .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <h2>جاري تجهيز المحتوى للطباعة...</h2>
          <p>يرجى الانتظار</p>
        </div>
      </body>
      </html>
    `);
    
    try {
      toast({ 
        title: '⏳ جاري التصدير...', 
        description: 'يتم الآن تجهيز محتوى الدروس للطباعة بالخيارات المختارة',
      });
      
      const result = await exportLessonsWithOptions(lessonsWithFreshData, options, printWindow, (progress, status) => {
        console.log(`Export progress: ${progress}% - ${status}`);
        toast({ 
          title: `⏳ جاري التصدير... ${progress}%`, 
          description: status,
        });
      });
      
      console.log('Export completed successfully:', result);
      
      // Save export history
      try {
        const exportData = {
          lesson_ids: lessonsWithFreshData.map(l => l.id),
          lesson_titles: lessonsWithFreshData.map(l => l.title),
          subject_name: lessonsWithFreshData[0]?.subjects?.name,
          class_name: (lessonsWithFreshData[0]?.subjects as any)?.classes?.name,
          export_options: options
        };
        await adminApi.createExportHistory(exportData);
        console.log('Export history saved');
      } catch (historyError) {
        console.error('Failed to save export history:', historyError);
        // Don't show error to user, just log it
      }
      
      toast({ 
        title: '✅ تم فتح نافذة الطباعة', 
        description: 'اختر "حفظ كـ PDF" أو "Save as PDF" من قائمة الطابعات، ثم اختر مكان الحفظ',
      });
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      console.error('Error stack:', err.stack);
      
      // Close the print window if there's an error
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
      
      toast({ 
        variant: 'destructive', 
        title: '❌ فشل التصدير', 
        description: err.message || 'حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.'
      });
    }
  }, [lessonsToExport, toast]);

  const handleConfirmQuestionGeneration = useCallback(async () => {
    console.log('Confirming question generation with type:', selectedQuestionType);
    console.log('Pending lesson:', pendingQuestionLesson?.title);
    console.log('Pending bulk lessons:', pendingBulkQuestions.map(l => l.title));
    
    setQuestionTypeDialogOpen(false);

    // ─── معالجة خاصة لوضع نسخ ورقة الامتحان طبق الأصل ───
    if (selectedQuestionType === 'exam_paper_exact') {
      if (!pendingQuestionLesson) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم تحديد درس' });
        return;
      }
      if (examPaperFiles.length === 0) {
        toast({ variant: 'destructive', title: 'لم يتم رفع صور', description: 'يرجى رفع صور ورقة الامتحان أولاً' });
        return;
      }

      setExamPaperLoading(true);
      toast({ title: '📤 جاري رفع صور الامتحان...', description: `يتم رفع ${examPaperFiles.length} صورة ثم استخراج الأسئلة` });

      try {
        // رفع صور ورقة الامتحان إلى Supabase Storage
        const uploadedUrls: string[] = [];
        for (const file of examPaperFiles) {
          const { url } = await storageApi.uploadLessonImage(file);
          uploadedUrls.push(url);
        }

        toast({ title: '🔍 جاري التحليل بالذكاء الاصطناعي...', description: 'يستخرج النموذج جميع الأسئلة ويحدد الإجابات الصحيحة' });

        const questions = await aiApi.extractExamPaper(uploadedUrls);

        if (questions && questions.length > 0) {
          const questionsWithMeta = questions.map(q => ({
            ...q,
            lesson_id: pendingQuestionLesson.id,
            lesson_page_url: uploadedUrls[0] || undefined,
          }));
          await adminApi.updateLesson(pendingQuestionLesson.id, { ai_questions: questionsWithMeta });
          setLessons(prev => prev.map(l =>
            l.id === pendingQuestionLesson.id ? { ...l, ai_questions: questionsWithMeta } : l
          ));
          toast({
            title: '✅ اكتمل الاستخراج',
            description: `تم استخراج ${questions.length} سؤال من ورقة الامتحان لدرس ${pendingQuestionLesson.title}`,
          });
        } else {
          toast({ variant: 'destructive', title: 'تنبيه', description: 'لم يتمكن الذكاء الاصطناعي من استخراج أسئلة من الصور المرفوعة' });
        }
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'خطأ في الاستخراج', description: err.message || 'حدث خطأ غير متوقع' });
      } finally {
        setExamPaperLoading(false);
        setExamPaperFiles([]);
        setExamPaperPreviews([]);
        setPendingQuestionLesson(null);
      }
      return;
    }

    // Handle single lesson - use background generation
    if (pendingQuestionLesson) {
      console.log('Starting background generation for single lesson:', pendingQuestionLesson.title);
      await startGeneration(pendingQuestionLesson.id, 'questions', selectedQuestionType);
      setPendingQuestionLesson(null);
    }
    
    // Handle bulk lessons - use background generation with throttling
    if (pendingBulkQuestions.length > 0) {
      const total = pendingBulkQuestions.length;
      console.log(`Starting background generation for ${total} bulk lessons`);
      toast({ 
        title: "🚀 بدأ توليد الأسئلة", 
        description: `يتم الآن معالجة ${total} دروس في الخلفية. يمكنك التنقل بحرية في التطبيق.` 
      });
      
      for (let i = 0; i < pendingBulkQuestions.length; i++) {
        const lesson = pendingBulkQuestions[i];
        try {
          console.log(`Starting background generation for bulk lesson (${i + 1}/${total}):`, lesson.title);
          await startGeneration(lesson.id, 'questions', selectedQuestionType);
          // تأخير 4 ثواني بين كل طلب لتجنب تجاوز حد الـ rate limit في Gemini API
          if (i < pendingBulkQuestions.length - 1) {
            await new Promise(r => setTimeout(r, 4000));
          }
        } catch (err) {
          console.error(`Failed to start generation for ${lesson.title}:`, err);
        }
      }
      
      setPendingBulkQuestions([]);
    }
  }, [pendingQuestionLesson, pendingBulkQuestions, selectedQuestionType, startGeneration, toast]);

  const handlePreview = useCallback((lesson: Lesson) => {
    setPreviewLesson(lesson);
    setEditingQuestionIndex(null);
    setEditingQuestionData(null);
    setIsPreviewDialogOpen(true);
  }, []);

  const handleDeleteQuestion = useCallback(async (questionIndex: number) => {
    if (!previewLesson) return;
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    const previousPreview = previewLesson;
    const updatedQuestions = [...(previewLesson.ai_questions || [])];
    updatedQuestions.splice(questionIndex, 1);
    setPreviewLesson({ ...previewLesson, ai_questions: updatedQuestions });
    setLessons(prev => prev.map(l => l.id === previewLesson.id ? { ...l, ai_questions: updatedQuestions } : l));

    try {
      await adminApi.updateLesson(previewLesson.id, { ai_questions: updatedQuestions });
      toast({ title: 'تم الحذف', description: 'تم حذف السؤال بنجاح' });
      fetchData();
    } catch (err: any) {
      setPreviewLesson(previousPreview);
      setLessons(prev => prev.map(l => l.id === previewLesson.id ? { ...l, ai_questions: previousPreview.ai_questions || [] } : l));
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حذف السؤال' });
    }
  }, [previewLesson, toast, fetchData]);

  const handleStartEditQuestion = useCallback((questionIndex: number) => {
    if (!previewLesson || !previewLesson.ai_questions) return;
    setEditingQuestionIndex(questionIndex);
    setEditingQuestionData({ ...previewLesson.ai_questions[questionIndex] });
  }, [previewLesson]);

  const handleSaveEditedQuestion = useCallback(async () => {
    if (!previewLesson || editingQuestionIndex === null || !editingQuestionData) return;

    const previousPreview = previewLesson;
    const updatedQuestions = [...(previewLesson.ai_questions || [])];
    updatedQuestions[editingQuestionIndex] = editingQuestionData;
    setPreviewLesson({ ...previewLesson, ai_questions: updatedQuestions });
    setLessons(prev => prev.map(l => l.id === previewLesson.id ? { ...l, ai_questions: updatedQuestions } : l));
    setEditingQuestionIndex(null);
    setEditingQuestionData(null);

    try {
      await adminApi.updateLesson(previewLesson.id, { ai_questions: updatedQuestions });
      toast({ title: 'تم التحديث', description: 'تم تحديث السؤال بنجاح' });
      fetchData();
    } catch (err: any) {
      setPreviewLesson(previousPreview);
      setLessons(prev => prev.map(l => l.id === previewLesson.id ? { ...l, ai_questions: previousPreview.ai_questions || [] } : l));
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل تحديث السؤال' });
    }
  }, [previewLesson, editingQuestionIndex, editingQuestionData, toast, fetchData]);

  const handleCancelEditQuestion = useCallback(() => {
    setEditingQuestionIndex(null);
    setEditingQuestionData(null);
  }, []);

  const handleEditTitleRequest = useCallback((lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewTitle(lesson.title);
    setNewPageNumber(lesson.page_number || "");
    setIsEditTitleDialogOpen(true);
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription: يستمع لجميع أحداث lessons (INSERT, UPDATE, DELETE) ويُحدّث الواجهة فوراً
  useEffect(() => {
    const channel = supabase
      .channel('admin-lessons-all-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        async (payload) => {
          if (payload.eventType === 'UPDATE') {
            // تحديث فوري بدون re-fetch كامل لتجنب الوميض
            const updatedLesson = payload.new as Lesson;
            setLessons(prev => prev.map(l => l.id === updatedLesson.id ? { ...l, ...updatedLesson } : l));
            setProcessingLessons(prev => {
              if (prev[updatedLesson.id]) {
                const next = { ...prev };
                delete next[updatedLesson.id];
                return next;
              }
              return prev;
            });
          } else {
            // INSERT أو DELETE → re-fetch كامل لضمان دقة القائمة
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Realtime subscription to refresh preview lesson when updated
  useEffect(() => {
    if (!previewLesson) return;

    const channel = supabase
      .channel(`admin-lesson-preview-${previewLesson.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lessons',
          filter: `id=eq.${previewLesson.id}`,
        },
        (payload) => {
          const updated = payload.new as Lesson;
          if (updated) setPreviewLesson(prev => prev ? { ...prev, ...updated } : prev);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [previewLesson?.id]);

  // Sync step with task status
  useEffect(() => {
    if (activeTask) {
      if (activeTask.status === 'completed' && step < 3) {
        setStep(3);
      }
    }
  }, [activeTask?.status]);

  const filteredSubjects = subjects.filter(s => s.class_id === wizardClassId);

  const handleStartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !wizardClassId || !wizardSubjectId) return;
    
    setProcessingCount(files.length);
    setIsProcessingFiles(true);
    setProcessingProgress(0);
    setStep(2); // Move to step 2 to show overall progress
    
    try {
      const processed = await processFiles(files, (p) => setProcessingProgress(p));
      const taskId = startNewTask(wizardClassId, wizardSubjectId, processed);
      setActiveTaskId(taskId);
    } catch (err: any) {
      console.error('File processing failed:', err);
      toast({ variant: 'destructive', title: 'فشل معالجة الملفات', description: err.message });
      setStep(1);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!activeTask) return;
    const selectedPages = activeTask.detectedPages.filter(p => selectedPageIds.includes(p.id!));
    if (selectedPages.length === 0) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى اختيار صفحة واحدة على الأقل' });
      return;
    }

    const initialTitle = selectedPages[0].title || "درس جديد";
    const initialPageNum = selectedPages[0].page_number || '';
    
    setGeneratedLesson({ 
      title: initialTitle, 
      page_number: initialPageNum,
      summary: '',
      questions: []
    });
    setIsGeneratingContent(true);
    
    try {
      // Use aiUrl for content generation to avoid WORKER_LIMIT
      const aiUrls = selectedPages.map(p => p.aiUrl || p.imageUrl);
      const pageRange = `${selectedPages[0].page_number || '?'} - ${selectedPages[selectedPages.length-1].page_number || '?'}`;
      const content = await aiApi.generateLessonContent(aiUrls, initialTitle, pageRange);
      
      setGeneratedLesson({
        title: initialTitle,
        page_number: initialPageNum,
        summary: content?.summary || '',
        questions: content?.questions || []
      });
      setStep(4);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'فشل التوليد', description: err.message });
      setStep(4); // Allow manual editing
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleBatchSave = async () => {
    if (!activeTaskId || selectedPageIds.length === 0 || !activeTask) return;
    
    const selectedPages = activeTask.detectedPages.filter(p => selectedPageIds.includes(p.id!));
    const lessonsToSave = [];

    if (creationMode === "by-page") {
      for (const page of selectedPages) {
        lessonsToSave.push({
          title: page.title || "درس جديد",
          page_number: parsePageNumber(page.page_number) || 0,
          selectedPageIds: [page.id!]
        });
      }
    } else {
      lessonsToSave.push({
        title: generatedLesson.title,
        page_number: parsePageNumber(generatedLesson.page_number) || 0,
        selectedPageIds: selectedPageIds
      });
    }

    try {
      await batchSaveLessons(activeTaskId, lessonsToSave);
      setStep(5);
    } catch (err: any) {
      toast({ variant: "destructive", title: "فشل الإنشاء", description: err.message });
    }
  };

  const handleSave = async () => {
    if (!activeTaskId || !generatedLesson.title) return;
    
    setIsSaving(true);
    try {
      const created = await saveLessonFromTask(
        activeTaskId,
        generatedLesson.title,
        generatedLesson.summary || '',
        parsePageNumber(generatedLesson.page_number) || 0,
        generatedLesson.questions || [],
        selectedPageIds
      );
      
      // إضافة فورية في الواجهة
      if (created) {
        setLessons(prev => [created, ...prev]);
      }
      
      toast({ title: 'تم الحفظ', description: 'تمت إضافة الدرس بنجاح' });
      setSelectedPageIds([]);
      setGeneratedLesson({ title: '', summary: '', questions: [], page_number: '' });
      
      // If task is gone (all pages used), close dialog
      if (!tasks[activeTaskId]) {
        setIsAddDialogOpen(false);
        resetWizard(true);
      } else {
        setStep(3); // Go back to remaining pages
      }
      fetchData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ في الحفظ', description: err.message || '' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetWizard = (force = false) => {
    if (!activeTask || force) {
      setStep(1);
      setCreationMode('single');
      setWizardClassId('');
      setWizardSubjectId('');
      setSelectedPageIds([]);
      setGeneratedLesson({ title: '', summary: '', questions: [], page_number: '' });
    }
  };

  const handleEditPage = (page: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditingPageData({ title: page.title || '', page_number: page.page_number || '' });
  };

  const savePageEdit = () => {
    if (!activeTaskId || !editingPageId || !activeTask) return;
    
    const updatedPages = activeTask.detectedPages.map(p => 
      p.id === editingPageId ? { ...p, ...editingPageData } : p
    );
    
    updateTaskPages(activeTaskId, updatedPages);
    setEditingPageId(null);
    toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الصفحة بنجاح' });
  };

  const handleReanalyzeSingle = useCallback(async (pageId: string) => {
    if (!activeTaskId) return;
    reanalyzePage(activeTaskId, pageId);
  }, [activeTaskId, reanalyzePage]);

  const handleReanalyzeSelected = useCallback(async () => {
    if (!activeTaskId || selectedPageIds.length === 0) return;
    reanalyzePages(activeTaskId, selectedPageIds);
  }, [activeTaskId, selectedPageIds, reanalyzePages]);

  const handleDeleteLesson = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف الدرس؟')) return;
    const previousLessons = lessons;
    setLessons(prev => prev.filter(l => l.id !== id));
    try {
      await adminApi.deleteLesson(id);
      toast({ title: 'تم الحذف' });
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حذف الدرس' });
    }
  }, [fetchData, toast, lessons]);

  // حذف ملخص الدرس
  const handleDeleteSummary = useCallback(async (lesson: Lesson) => {
    if (!confirm('هل أنت متأكد من حذف ملخص الدرس؟')) return;
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, summary: null } : l));
    try {
      await adminApi.updateLesson(lesson.id, { summary: null });
      toast({ title: '✅ تم الحذف', description: 'تم حذف ملخص الدرس بنجاح' });
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حذف الملخص' });
    }
  }, [fetchData, toast, lessons]);

  // تعديل ملخص الدرس
  const [editingSummary, setEditingSummary] = useState<{ lesson: Lesson; summary: string } | null>(null);
  const [editingQuestions, setEditingQuestions] = useState<{ lesson: Lesson; questions: any[] } | null>(null);
  
  // التعديل الجماعي للدروس
  const [bulkEditLessons, setBulkEditLessons] = useState<Array<{ id: string; title: string; page_number: string | number }>>([]);
  
  const handleBulkEditChange = useCallback((id: string, field: 'title' | 'page_number', value: string) => {
    setBulkEditLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const handleSaveBulkEdit = useCallback(async () => {
    if (bulkEditLessons.length === 0) return;
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => {
      const edit = bulkEditLessons.find(b => b.id === l.id);
      if (!edit) return l;
      return { ...l, title: edit.title, page_number: typeof edit.page_number === 'string' ? parseInt(edit.page_number) || null : edit.page_number };
    }));
    try {
      await Promise.all(
        bulkEditLessons.map(lesson => 
          adminApi.updateLesson(lesson.id, { 
            title: lesson.title, 
            page_number: typeof lesson.page_number === 'string' ? parseInt(lesson.page_number) || null : lesson.page_number
          })
        )
      );
      toast({ title: '✅ تم الحفظ', description: `تم تحديث ${bulkEditLessons.length} دروس بنجاح` });
      setBulkEditLessons([]);
      setSelectedBulkIds([]);
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حفظ التعديلات' });
    }
  }, [bulkEditLessons, fetchData, toast, lessons]);
  
  const handleEditSummary = useCallback((lesson: Lesson) => {
    setEditingSummary({ lesson, summary: lesson.summary || '' });
  }, []);

  const handleEditQuestions = useCallback((lesson: Lesson) => {
    setEditingQuestions({ lesson, questions: lesson.ai_questions || [] });
  }, []);

  const handleSaveSummary = useCallback(async () => {
    if (!editingSummary) return;
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => l.id === editingSummary.lesson.id ? { ...l, summary: editingSummary.summary } : l));
    try {
      await adminApi.updateLesson(editingSummary.lesson.id, { summary: editingSummary.summary });
      toast({ title: '✅ تم الحفظ', description: 'تم تحديث ملخص الدرس بنجاح' });
      setEditingSummary(null);
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حفظ الملخص' });
    }
  }, [editingSummary, fetchData, toast, lessons]);

  const handleSaveQuestions = useCallback(async () => {
    if (!editingQuestions) return;
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => l.id === editingQuestions.lesson.id ? { ...l, ai_questions: editingQuestions.questions } : l));
    try {
      await adminApi.updateLesson(editingQuestions.lesson.id, { ai_questions: editingQuestions.questions });
      toast({ title: '✅ تم الحفظ', description: 'تم تحديث الأسئلة بنجاح' });
      setEditingQuestions(null);
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حفظ الأسئلة' });
    }
  }, [editingQuestions, fetchData, toast, lessons]);

  // حذف جميع أسئلة الدرس
  const handleDeleteQuestions = useCallback(async (lesson: Lesson) => {
    if (!confirm(`هل أنت متأكد من حذف جميع الأسئلة (${lesson.ai_questions?.length || 0}) للدرس؟`)) return;
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, ai_questions: [] } : l));
    try {
      await adminApi.updateLesson(lesson.id, { ai_questions: [] });
      toast({ title: '✅ تم الحذف', description: 'تم حذف جميع أسئلة الدرس بنجاح' });
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حذف الأسئلة' });
    }
  }, [fetchData, toast, lessons]);
  const filteredLessons = useMemo(() => {
    // If no filters selected, return empty array (don't show all lessons)
    if (!selectedClassFilter && !selectedSubjectFilter) {
      return [];
    }
    
    return lessons.filter(lesson => {
      const sub = subjects.find(s => s.id === lesson.subject_id);
      
      // Apply selected filters from top dropdowns
      const matchSelectedClass = !selectedClassFilter || selectedClassFilter === 'all' || sub?.class_id === selectedClassFilter;
      const matchSelectedSubject = !selectedSubjectFilter || selectedSubjectFilter === 'all' || lesson.subject_id === selectedSubjectFilter;
      
      // Apply additional filters
      const matchClass = filterClassId === 'all' || sub?.class_id === filterClassId;
      const matchSubject = filterSubjectId === 'all' || lesson.subject_id === filterSubjectId;
      const matchSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (lesson.page_number && String(lesson.page_number).includes(searchTerm));
      
      return matchSelectedClass && matchSelectedSubject && matchClass && matchSubject && matchSearch;
    });
  }, [lessons, subjects, selectedClassFilter, selectedSubjectFilter, filterClassId, filterSubjectId, searchTerm]);

  // حذف ملخص الدروس المحددة دفعة واحدة
  const [isDeletingBulkSummary, setIsDeletingBulkSummary] = useState(false);
  const handleBulkDeleteSummary = useCallback(async () => {
    const lessonsWithSummary = filteredLessons.filter(l => selectedBulkIds.includes(l.id) && l.summary);
    if (lessonsWithSummary.length === 0) {
      toast({ title: 'لا يوجد ملخص', description: 'الدروس المحددة لا تحتوي على ملخص' });
      return;
    }
    if (!confirm(`هل أنت متأكد من حذف ملخص ${lessonsWithSummary.length} درس؟`)) return;
    setIsDeletingBulkSummary(true);
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => selectedBulkIds.includes(l.id) ? { ...l, summary: null } : l));
    try {
      await Promise.all(lessonsWithSummary.map(l => adminApi.updateLesson(l.id, { summary: null })));
      toast({ title: '✅ تم الحذف', description: `تم حذف ملخص ${lessonsWithSummary.length} درس بنجاح` });
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حذف الملخصات' });
    } finally {
      setIsDeletingBulkSummary(false);
    }
  }, [selectedBulkIds, filteredLessons, fetchData, toast, lessons]);

  // حذف أسئلة الدروس المحددة دفعة واحدة
  const [isDeletingBulkQuestions, setIsDeletingBulkQuestions] = useState(false);
  const handleBulkDeleteQuestions = useCallback(async () => {
    const lessonsWithQuestions = filteredLessons.filter(l => selectedBulkIds.includes(l.id) && (l.ai_questions?.length ?? 0) > 0);
    if (lessonsWithQuestions.length === 0) {
      toast({ title: 'لا توجد أسئلة', description: 'الدروس المحددة لا تحتوي على أسئلة مولدة' });
      return;
    }
    const totalQ = lessonsWithQuestions.reduce((s, l) => s + (l.ai_questions?.length || 0), 0);
    if (!confirm(`هل أنت متأكد من حذف أسئلة ${lessonsWithQuestions.length} درس (${totalQ} سؤال إجمالاً)؟`)) return;
    setIsDeletingBulkQuestions(true);
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => selectedBulkIds.includes(l.id) ? { ...l, ai_questions: [] } : l));
    try {
      await Promise.all(lessonsWithQuestions.map(l => adminApi.updateLesson(l.id, { ai_questions: [] })));
      toast({ title: '✅ تم الحذف', description: `تم حذف أسئلة ${lessonsWithQuestions.length} درس بنجاح` });
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل حذف الأسئلة' });
    } finally {
      setIsDeletingBulkQuestions(false);
    }
  }, [selectedBulkIds, filteredLessons, fetchData, toast, lessons]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedBulkIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedBulkIds.length} دروس؟`)) return;
    
    setIsDeletingBulk(true);
    const previousLessons = lessons;
    setLessons(prev => prev.filter(l => !selectedBulkIds.includes(l.id)));
    try {
      await adminApi.deleteLessons(selectedBulkIds);
      toast({ title: 'تم حذف الدروس المختارة بنجاح' });
      setSelectedBulkIds([]);
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'فشل الحذف', description: err.message });
    } finally {
      setIsDeletingBulk(false);
    }
  }, [selectedBulkIds, fetchData, toast, lessons]);

  const toggleBulkSelection = useCallback((id: string) => {
    setSelectedBulkIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedBulkIds.length === filteredLessons.length) {
      setSelectedBulkIds([]);
    } else {
      setSelectedBulkIds(filteredLessons.map(l => l.id));
    }
  }, [selectedBulkIds.length, filteredLessons]);

  const handleUpdateLessonInfo = async () => {
    if (!editingLesson || !newTitle.trim()) return;
    setIsUpdatingTitle(true);
    const previousLessons = lessons;
    setLessons(prev => prev.map(l => l.id === editingLesson.id ? { ...l, title: newTitle, page_number: newPageNumber === '' ? null : Number(newPageNumber) } : l));
    try {
      await adminApi.updateLesson(editingLesson.id, { 
        title: newTitle,
        page_number: newPageNumber === '' ? null : Number(newPageNumber)
      });
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث معلومات الدرس' });
      setIsEditTitleDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setLessons(previousLessons);
      toast({ variant: 'destructive', title: 'فشل التحديث', description: err.message });
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  return (
    <AdminLayout title="إدارة الدروس">
      <GenerationTaskIndicator />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-black text-primary mb-1">إدارة الدروس</h2>
           <p className="text-muted-foreground font-bold">أضف دروساً جديدة باستخدام المعالج الذكي</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="h-12 px-4 rounded-xl border-primary/10 text-primary hover:bg-primary/5 gap-2" 
            onClick={() => setExportHistoryOpen(true)}
            title="الملفات المصدرة"
          >
            <FileText className="h-5 w-5" />
            <span className="hidden sm:inline">الملفات المصدرة</span>
          </Button>
          
          <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-4 rounded-xl border-primary/10 text-primary hover:bg-primary/5 gap-2 relative group" title="الأعمال السابقة">
                <Clock className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">الأعمال السابقة</span>
                {Object.keys(tasks).length > 0 && (
                   <span className="absolute -top-1 -right-1 h-5 w-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {Object.keys(tasks).length}
                   </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2.5rem] arabic-font p-8 border-none shadow-2xl">
               <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
                     <Clock className="h-6 w-6 text-secondary" />
                     الأعمال والرفوعات السابقة
                  </DialogTitle>
                  <p className="text-muted-foreground font-bold">يمكنك العودة إلى الصور المرفوعة مسبقاً لاستكمال العمل عليها.</p>
               </DialogHeader>
               
               <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                  {Object.values(tasks).length === 0 ? (
                    <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed">
                       <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-10" />
                       <p className="text-muted-foreground font-bold">لا توجد أعمال سابقة حالياً.</p>
                    </div>
                  ) : (
                    Object.values(tasks).map((task) => {
                      const taskClass = classes.find(c => c.id === task.classId);
                      const taskSubject = subjects.find(s => s.id === task.subjectId);
                      
                      return (
                        <Card key={task.id} className="border-none shadow-sm rounded-3xl bg-muted/10 hover:bg-white hover:shadow-md transition-all group overflow-hidden">
                           <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                              <div className="flex items-center gap-4 flex-1 w-full">
                                 <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center border border-muted shadow-sm overflow-hidden shrink-0">
                                    {task.detectedPages?.[0]?.imageUrl ? (
                                      <img src={task.detectedPages[0].imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="h-6 w-6 text-muted-foreground opacity-20" />
                                    )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-primary leading-tight line-clamp-1">
                                       {task.detectedPages?.[0]?.title || 'معالج رفع الصور'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                       <Badge variant="secondary" className="text-[9px] font-bold bg-primary/5 text-primary border-primary/10">
                                          {taskClass?.name || 'صف غير محدد'}
                                       </Badge>
                                       <Badge variant="secondary" className="text-[9px] font-bold bg-secondary/5 text-secondary border-secondary/10">
                                          {taskSubject?.name || 'مادة غير محددة'}
                                       </Badge>
                                       <Badge variant="outline" className="text-[9px] font-bold border-muted-foreground/20">
                                          {task.files?.length || 0} صورة
                                       </Badge>
                                       <Badge variant="outline" className={cn(
                                         "text-[9px] font-bold",
                                         task.status === 'completed' ? "border-green-200 text-green-600 bg-green-50" : 
                                         task.status === 'failed' ? "border-rose-200 text-rose-600 bg-rose-50" :
                                         "border-amber-200 text-amber-600 bg-amber-50"
                                       )}>
                                          {task.status === 'completed' ? 'جاهز للمراجعة' : 
                                           task.status === 'failed' ? 'فشل التحليل' :
                                           'قيد المعالجة'}
                                       </Badge>
                                       {task.createdAt && (
                                         <span className="text-[9px] font-bold text-muted-foreground bg-white px-2 py-0.5 rounded-full shadow-sm">
                                            {new Date(task.createdAt).toLocaleDateString('ar-SA')}
                                         </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-[140px]">
                                 <Button 
                                   size="sm" 
                                   className="w-full rounded-xl h-10 px-6 font-bold bg-primary hover:bg-primary/90 gap-2 shadow-sm"
                                   onClick={() => {
                                      setActiveTaskId(task.id);
                                      setIsArchiveDialogOpen(false);
                                      setIsAddDialogOpen(true);
                                      if (task.status === 'completed') setStep(3);
                                      else if (task.status === 'uploading' || task.status === 'detecting') setStep(2);
                                      else setStep(1);
                                   }}
                                 >
                                    <Eye className="h-4 w-4" />
                                    متابعة
                                 </Button>
                                 <Button 
                                   size="sm" 
                                   variant="ghost"
                                   className="w-full rounded-xl h-9 px-4 font-bold text-destructive hover:bg-destructive/5 gap-2 text-[11px]"
                                   onClick={async () => {
                                      if (confirm('هل أنت متأكد من إلغاء هذه العملية وحذف كافة البيانات المرتبطة بها؟')) {
                                         await removeTask(task.id);
                                         toast({ title: 'تم الحذف', description: 'تم إلغاء العملية وحذف البيانات بنجاح' });
                                      }
                                   }}
                                 >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    إلغاء العمل وحذفه
                                 </Button>
                              </div>
                           </div>
                        </Card>
                      );
                    })
                  )}
               </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            if (!open && activeTask && (activeTask.status !== 'completed' || step < 3)) {
               if (!confirm('سيستمر الرفع في الخلفية. يمكنك العودة لاحقاً.')) return;
            }
            setIsAddDialogOpen(open);
            if (open && activeTask && step === 1) {
              if (activeTask.status === 'completed') setStep(3);
              else setStep(2);
            } else if (!open) {
              resetWizard();
              setActiveTaskId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-8 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2 group/btn">
                <Plus className="h-6 w-6 group-hover/btn:rotate-90 transition-transform" />
                إضافة درس جديد
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col rounded-3xl p-0">
            <DialogHeader className="p-6 bg-primary/5 border-b shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl flex items-center gap-3 text-primary">
                  <Sparkles className="h-6 w-6 text-secondary" />
                  إضافة درس ذكي
                </DialogTitle>
                <div className="flex items-center gap-2">
                   {[1, 2, 3, 4].map(s => (
                     <div key={s} className={cn(
                       "h-2 w-8 rounded-full transition-colors",
                       step >= s ? "bg-primary" : "bg-muted"
                     )} />
                   ))}
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-8">
              {/* Step 1: Select Class & Subject */}
              {step === 1 && (
                activeTask ? (
                  <div className="space-y-8 max-w-2xl mx-auto animate-fade-in text-center py-12">
                    <div className="bg-primary/5 p-8 rounded-3xl border-2 border-primary/10">
                      <Sparkles className="h-16 w-16 text-secondary mx-auto mb-6" />
                      <h3 className="text-2xl font-bold mb-4">لديك عملية رفع قيد التنفيذ</h3>
                      <p className="text-muted-foreground mb-8 text-lg">
                        هناك مهمة يتم معالجتها الآن في الخلفية. يمكنك متابعة التقدم أو البدء بجديد بعد الإلغاء.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          size="lg" 
                          className="rounded-2xl h-14 px-8 text-lg gap-2"
                          onClick={() => activeTask.status === 'completed' ? setStep(3) : setStep(2)}
                        >
                          <Eye className="h-5 w-5" />
                          متابعة التقدم ({activeTask.progress}%)
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="rounded-2xl h-14 px-8 text-lg text-destructive hover:bg-destructive/5"
                          onClick={() => {
                              if (activeTaskId && confirm('هل أنت متأكد من إلغاء المهمة الحالية؟')) {
                                removeTask(activeTaskId!);
                                resetWizard(true);
                              }
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                          إلغاء المهمة
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 max-w-2xl mx-auto animate-fade-in">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold">للبدء، اختر الصف والمادة</h3>
                      <p className="text-muted-foreground">حدد المادة التي تريد رفع الدروس لها</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الصف الدراسي</label>
                        <Select onValueChange={setWizardClassId} value={wizardClassId}>
                          <SelectTrigger className="h-14 rounded-xl text-lg">
                            <SelectValue placeholder="اختر الصف" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">المادة الدراسية</label>
                        <Select 
                          onValueChange={setWizardSubjectId} 
                          value={wizardSubjectId}
                          disabled={!wizardClassId}
                        >
                          <SelectTrigger className="h-14 rounded-xl text-lg">
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSubjects.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl p-8 mt-8 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                         onClick={() => wizardSubjectId && fileInputRef.current?.click()}>
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleStartUpload}
                        accept="image/*,application/pdf"
                        disabled={!wizardSubjectId}
                      />
                      <Upload className="h-10 w-10 text-primary mx-auto mb-4" />
                      <p className="font-bold text-lg text-primary">اضغط هنا لرفع الصور ومتابعة</p>
                    </div>
                  </div>
                )
              )}

              {/* Step 2: Progress (Processing / Uploading / Detecting) */}
              {step === 2 && (isProcessingFiles || (activeTask && activeTask.status !== 'completed')) && (
                <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-muted flex items-center justify-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                      {Math.round(isProcessingFiles ? processingProgress : (activeTask?.progress || 0))}%
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">
                      {isProcessingFiles 
                        ? `جاري معالجة ${processingCount || '?'} ملفات...` 
                        : activeTask?.status === 'uploading' 
                          ? `جاري رفع ${activeTask.files.length} صورة...` 
                          : 'جاري التحليل بالذكاء الاصطناعي...'}
                    </h3>
                    <p className="text-muted-foreground px-8">
                      {isProcessingFiles 
                        ? 'نقوم بضغط الصور وتحويل ملفات PDF لتسريع الرفع مع الحفاظ على الدقة'
                        : activeTask?.status === 'uploading' 
                          ? 'يتم الآن رفع الصور إلى الخادم بسرعة عالية جداً عبر مسارات متوازية' 
                          : 'نقوم بترتيب الصفحات واكتشاف العناوين تلقائياً باستخدام الذكاء الاصطناعي'}
                    </p>
                  </div>
                  
                  <Progress value={isProcessingFiles ? processingProgress : activeTask?.progress} className="w-full max-w-md h-3" />
                  
                  {activeTask?.status === 'failed' && (
                    <div className="text-destructive font-bold bg-destructive/10 p-4 rounded-xl">
                      حدث خطأ: {activeTask.error}
                      <Button variant="outline" className="mr-4" onClick={() => activeTaskId && removeTask(activeTaskId!)}>إلغاء</Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Grouping */}
              {step === 3 && activeTask && activeTask.status === 'completed' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">تجميع صفحات الدرس</h3>
                      <p className="text-muted-foreground">حدد الصفحات التي تنتمي لدرس واحد ثم اضغط "إنشاء محتوى"</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg gap-2 text-primary border-primary/20 hover:bg-primary/5 font-bold"
                        onClick={handleReanalyzeSelected}
                        disabled={selectedPageIds.length === 0 || reanalyzingPageIds.size > 0}
                      >
                        {reanalyzingPageIds.size > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        إعادة تحليل المحددة
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg font-bold" onClick={() => setSelectedPageIds(activeTask.detectedPages.map(p => p.id!))}>تحديد الكل</Button>
                      <Button variant="outline" size="sm" className="rounded-lg font-bold" onClick={() => setSelectedPageIds([])}>إلغاء التحديد</Button>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3">
                    <label className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-wider">
                      <Settings2 className="h-4 w-4" />
                      طريقة إنشاء الدروس للصور المحددة
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={creationMode === 'single' ? 'default' : 'outline'} 
                        className={cn("text-xs rounded-xl h-10 transition-all font-bold", creationMode === 'single' && "shadow-lg shadow-primary/20")}
                        onClick={() => setCreationMode('single')}
                      >
                        درس واحد مجمع
                      </Button>
                      <Button 
                        variant={creationMode === 'by-page' ? 'default' : 'outline'} 
                        className={cn("text-xs rounded-xl h-10 transition-all font-bold", creationMode === 'by-page' && "shadow-lg shadow-primary/20")}
                        onClick={() => setCreationMode('by-page')}
                      >
                        كل صفحة كدرس منفصل
                      </Button>
                      <Button 
                        variant={creationMode === 'by-title' ? 'default' : 'outline'} 
                        className={cn("text-xs rounded-xl h-10 transition-all font-bold", creationMode === 'by-title' && "shadow-lg shadow-primary/20")}
                        onClick={() => setCreationMode('by-title')}
                      >
                        حسب عنوان كل درس
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTask.detectedPages.slice(0, visiblePagesCount).map((page) => {
                      const isReanalyzing = reanalyzingPageIds.has(page.id!);
                      const isCompleted = completedPageIds.has(page.id!);
                      
                      return (
                      <div 
                        key={page.id} 
                        className={cn(
                          "relative flex gap-4 p-3 rounded-xl border-2 transition-all cursor-pointer",
                          selectedPageIds.includes(page.id!) 
                            ? "border-primary bg-primary/5 shadow-md" 
                            : "border-muted hover:border-primary/50",
                          isReanalyzing && "opacity-60 pointer-events-none",
                          isCompleted && "border-green-500 bg-green-50/50"
                        )}
                        onClick={() => {
                          if (selectedPageIds.includes(page.id!)) {
                            setSelectedPageIds(prev => prev.filter(id => id !== page.id));
                          } else {
                            setSelectedPageIds(prev => [...prev, page.id!]);
                          }
                        }}
                      >
                        {isCompleted && (
                          <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg border-2 border-white z-20 animate-bounce-in">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        {isReanalyzing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/20 z-10 rounded-xl">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          </div>
                        )}
                        <div className="h-24 w-20 shrink-0 rounded-lg overflow-hidden bg-muted group/img relative">
                          <img 
                            src={page.imageUrl} 
                            className="h-full w-full object-cover" 
                            loading="lazy" 
                            decoding="async"
                          />
                          <div 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImageUrl(page.imageUrl);
                            }}
                          >
                             <Eye className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-1.5">
                               <Badge 
                                 variant="outline" 
                                 className="bg-white hover:bg-muted cursor-help transition-colors h-7"
                                 onClick={(e) => handleEditPage(page, e)}
                               >
                                 {page.page_number ? `ص ${page.page_number}` : '؟'}
                               </Badge>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className={cn(
                                   "h-7 w-7 rounded-full transition-all duration-300",
                                   isCompleted ? "text-green-600 bg-green-100" : "text-primary/60 hover:text-primary hover:bg-primary/10"
                                 )}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleReanalyzeSingle(page.id!);
                                 }}
                                 disabled={isReanalyzing}
                                 title="إعادة تحليل هذه الصفحة"
                               >
                                 {isCompleted ? <Check className="h-3.5 w-3.5" /> : <RefreshCw className={cn("h-3.5 w-3.5", isReanalyzing && "animate-spin")} />}
                               </Button>
                             </div>
                             <Checkbox checked={selectedPageIds.includes(page.id!)} />
                          </div>
                          <h4 
                            className="font-bold text-sm line-clamp-1 hover:text-primary transition-colors cursor-help" 
                            title={page.title}
                            onClick={(e) => handleEditPage(page, e)}
                          >
                            {page.title || "بدون عنوان"}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{page.content_preview}</p>
                        </div>
                      </div>
                    ); })}
                  </div>

                  {activeTask.detectedPages.length > visiblePagesCount && (
                    <div className="flex justify-center pt-4">
                       <Button variant="ghost" className="gap-2" onClick={() => setVisiblePagesCount(prev => prev + 12)}>
                         عرض المزيد من الصفحات ({activeTask.detectedPages.length - visiblePagesCount} متبقية)
                         <Plus className="h-4 w-4" />
                       </Button>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button variant="ghost" onClick={() => {
                       if (confirm('هل تريد الخروج؟ سيتم حفظ تقدمك في قسم "الأعمال السابقة" ويمكنك العودة إليه لاحقاً.')) {
                          setIsAddDialogOpen(false);
                          resetWizard();
                       }
                    }}>إلغاء</Button>
                    <div className="flex gap-3">
                       {creationMode === 'single' && (
                         <Button 
                          variant="outline" 
                          className="h-12 px-6 rounded-xl gap-2 border-secondary/30 text-secondary hover:bg-secondary/5 font-bold shadow-sm"
                          onClick={handleGenerateContent}
                          disabled={selectedPageIds.length === 0 || isGeneratingContent}
                         >
                           {isGeneratingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                           توليد شامل ومتابعة
                         </Button>
                       )}
                       <Button 
                        className={cn("h-12 px-8 rounded-xl gap-2 font-bold shadow-lg", creationMode === 'single' ? "bg-primary" : "bg-green-600 hover:bg-green-700 shadow-green-600/20")}
                        disabled={selectedPageIds.length === 0 || isSaving}
                        onClick={creationMode === 'single' ? async () => {
                          const selectedPages = activeTask.detectedPages.filter(p => selectedPageIds.includes(p.id!));
                          setGeneratedLesson({
                            title: selectedPages[0].title || "درس جديد",
                            page_number: selectedPages[0].page_number || '',
                            summary: '',
                            questions: []
                          });
                          setStep(4);
                        } : handleBatchSave}
                       >
                         {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : creationMode === 'single' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                         {creationMode === 'single' ? 'تأكيد وإنشاء مجمع' : 'تأكيد إنشاء الدروس المنفصلة'}
                       </Button>
                    </div>
                  </div>
                  <Dialog open={!!editingPageId} onOpenChange={(open) => !open && setEditingPageId(null)}>
                    <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
                      <div className="flex h-[400px] md:h-[500px]">
                        {/* Left: Image Preview */}
                        <div className="hidden md:flex flex-1 bg-muted relative items-center justify-center overflow-hidden">
                           {editingPageId && activeTask?.detectedPages.find(p => p.id === editingPageId)?.imageUrl && (
                             <img 
                               src={activeTask.detectedPages.find(p => p.id === editingPageId)!.imageUrl} 
                               className="w-full h-full object-contain"
                             />
                           )}
                        </div>
                        
                        {/* Right: Form */}
                        <div className="w-full md:w-[350px] p-8 flex flex-col bg-white">
                          <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-black">تعديل بيانات الصفحة</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6 flex-1 overflow-y-auto">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-primary uppercase tracking-widest">عنوان الدرس في الصفحة</label>
                              <Input 
                                className="h-12 rounded-xl bg-primary/5 border-none font-bold"
                                value={editingPageData.title} 
                                onChange={(e) => setEditingPageData({...editingPageData, title: e.target.value})}
                                placeholder="مثلاً: سورة النبأ"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-black text-primary uppercase tracking-widest">رقم الصفحة الحقيقي</label>
                              <Input 
                                className="h-12 rounded-xl bg-primary/5 border-none font-bold text-center"
                                type="number"
                                value={editingPageData.page_number ?? ''} 
                                onChange={(e) => setEditingPageData({...editingPageData, page_number: e.target.value === '' ? null : parseInt(e.target.value)})}
                                placeholder="أدخل رقم الصفحة الظاهر بالصورة"
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3 pt-6 border-t mt-auto">
                            <Button className="w-full h-12 rounded-xl font-black text-lg shadow-lg shadow-primary/20" onClick={savePageEdit}>
                              حفظ التعديلات
                            </Button>
                            <Button variant="ghost" className="w-full h-10 rounded-xl font-bold" onClick={() => setEditingPageId(null)}>
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Full Screen Image Preview Dialog */}
                  <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none">
                      {previewImageUrl && (
                        <div className="relative group">
                          <img src={previewImageUrl} className="w-full h-auto max-h-[90vh] object-contain rounded-2xl" />
                          <Button 
                            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 border-none" 
                            onClick={() => setPreviewImageUrl(null)}
                          >
                             <X className="h-5 w-5 text-white" />
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Step 4: Final Review */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">مراجعة وحفظ الدرس</h3>
                      <p className="text-muted-foreground">راجع البيانات المولدة وعدلها إذا لزم الأمر</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">عنوان الدرس</label>
                        <Input 
                          value={generatedLesson.title} 
                          onChange={(e) => setGeneratedLesson(prev => ({...prev, title: e.target.value}))}
                          className="font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رقم الصفحة</label>
                        <Input 
                          type="number"
                          value={generatedLesson.page_number} 
                          onChange={(e) => setGeneratedLesson(prev => ({...prev, page_number: parseInt(e.target.value) || ''}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الملخص</label>
                        <Textarea 
                          value={generatedLesson.summary} 
                          onChange={(e) => setGeneratedLesson(prev => ({...prev, summary: e.target.value}))}
                          className="min-h-[200px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl max-h-[500px] overflow-y-auto">
                      <div className="flex justify-between items-center mb-2">
                         <label className="text-sm font-bold">الأسئلة ({(generatedLesson.questions || []).length})</label>
                         <Button size="sm" variant="ghost" onClick={() => setGeneratedLesson(prev => ({...prev, questions: [...(prev.questions || []), {question: '', options: ['','','',''], correct_option_index: 0}]}))}>
                           <Plus className="h-4 w-4" />
                         </Button>
                      </div>
                      {(generatedLesson.questions || []).map((q, idx) => (
                        <Card key={idx} className="p-4 border-none shadow-sm relative group">
                          <Button 
                            variant="ghost" size="icon" 
                            className="absolute left-2 top-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"
                            onClick={() => setGeneratedLesson(prev => ({...prev, questions: (prev.questions || []).filter((_, i) => i !== idx)}))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="space-y-2">
                            <Input 
                              value={q.question} 
                              onChange={(e) => {
                                const newQs = [...(generatedLesson.questions || [])];
                                newQs[idx].question = e.target.value;
                                setGeneratedLesson(prev => ({...prev, questions: newQs}));
                              }}
                              placeholder="السؤال"
                              className="font-bold border-none shadow-none px-0"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <div 
                                    className={cn("h-4 w-4 rounded-full border cursor-pointer", q.correct_option_index === optIdx ? "bg-green-500 border-green-500" : "border-muted-foreground")}
                                    onClick={() => {
                                      const newQs = [...(generatedLesson.questions || [])];
                                      newQs[idx].correct_option_index = optIdx;
                                      setGeneratedLesson(prev => ({...prev, questions: newQs}));
                                    }}
                                  />
                                  <Input 
                                    value={opt} 
                                    onChange={(e) => {
                                      const newQs = [...(generatedLesson.questions || [])];
                                      newQs[idx].options[optIdx] = e.target.value;
                                      setGeneratedLesson(prev => ({...prev, questions: newQs}));
                                    }}
                                    className="h-8 text-xs"
                                    placeholder={`خيار ${optIdx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t gap-3">
                     <Button variant="ghost" onClick={() => setStep(3)}>رجوع</Button>
                     <Button 
                       className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700" 
                       onClick={handleSave}
                       disabled={isSaving}
                     >
                       {isSaving ? (
                         <>
                           <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                           جاري الحفظ...
                         </>
                       ) : (
                         <>
                           <Save className="ml-2 h-4 w-4" />
                           حفظ الدرس
                         </>
                       )}
                     </Button>
                  </div>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-3">
                    <div className="h-20 w-20 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 mx-auto shadow-inner border border-green-100">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-3xl font-black text-primary leading-tight">اكتملت عملية الحفظ</h3>
                    <p className="text-muted-foreground font-bold">تم الانتهاء من معالجة وحفظ الدروس المختارة.</p>
                  </div>

                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                    {saveReport.map((rep, idx) => (
                      <div key={idx} className={cn(
                        "p-5 rounded-2xl flex items-center justify-between border-2 transition-all shadow-sm",
                        rep.success ? "bg-green-50/50 border-green-100" : "bg-rose-50/50 border-rose-100"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                            rep.success ? "bg-green-500 text-white" : "bg-rose-500 text-white"
                          )}>
                            {rep.success ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                          </div>
                          <span className="font-black text-primary">{rep.lesson}</span>
                        </div>
                        <Badge variant="outline" className={cn(
                          "font-bold px-3 py-1 rounded-full",
                          rep.success ? "border-green-200 text-green-600" : "border-rose-200 text-rose-600"
                        )}>
                          {rep.success ? "تم الحفظ" : "فشل الحفظ"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-muted">
                    <Button 
                      className="flex-1 h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setStep(1);
                        fetchData();
                        clearSaveReport();
                      }}
                    >
                      <Layout className="h-5 w-5" />
                      الرجوع لقائمة الدروس
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {/* Primary Filters - Required to Load Lessons */}
      <div className="mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-3xl border-2 border-primary/10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layout className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-primary text-lg">اختر الصف والمادة</h3>
            <p className="text-sm text-muted-foreground">حدد الصف والمادة لعرض الدروس</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">الصف الدراسي</label>
            <Select value={selectedClassFilter} onValueChange={(val) => { 
              setSelectedClassFilter(val); 
              setSelectedSubjectFilter(''); 
            }}>
              <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/20 bg-white font-bold text-base shadow-sm">
                <SelectValue placeholder="اختر الصف الدراسي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الصفوف</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary">المادة الدراسية</label>
            <Select 
              value={selectedSubjectFilter} 
              onValueChange={setSelectedSubjectFilter}
              disabled={!selectedClassFilter}
            >
              <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/20 bg-white font-bold text-base shadow-sm">
                <SelectValue placeholder={selectedClassFilter ? "اختر المادة الدراسية" : "اختر الصف أولاً"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المواد</SelectItem>
                {subjects
                  .filter(s => !selectedClassFilter || selectedClassFilter === 'all' || s.class_id === selectedClassFilter)
                  .map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/50 p-6 rounded-3xl border border-primary/5 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <Layout className="h-4 w-4" />
              تصفية حسب الصف
            </label>
            <Select value={filterClassId} onValueChange={(val) => { setFilterClassId(val); setFilterSubjectId('all'); }}>
              <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-white font-bold">
                <SelectValue placeholder="كل الصفوف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الصفوف</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              تصفية حسب المادة
            </label>
            <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
              <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-white font-bold">
                <SelectValue placeholder="كل المواد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المواد</SelectItem>
                {subjects
                  .filter(s => filterClassId === 'all' || s.class_id === filterClassId)
                  .map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-primary flex items-center gap-2">
               <Type className="h-4 w-4" />
               البحث بالاسم
             </label>
             <Input 
               placeholder="ابحث عن درس باسمه أو رقم الصفحة..." 
               className="h-12 rounded-xl border-primary/10 bg-white font-bold"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="flex items-end gap-2">
             <Button 
               variant="ghost" 
               className="h-12 flex-1 rounded-xl text-muted-foreground hover:bg-muted font-bold"
               onClick={() => {
                 setFilterClassId('all');
                 setFilterSubjectId('all');
                 setSearchTerm('');
               }}
             >
               إعادة تعيين
             </Button>
             <Button 
               variant="outline" 
               className="h-12 w-12 rounded-xl border-primary/10"
               onClick={fetchData}
               disabled={loading}
             >
               <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
             </Button>
          </div>
        </div>

        {filteredLessons.length > 0 && (
          <div className="flex justify-between items-center px-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <Checkbox 
                id="select-all"
                checked={selectedBulkIds.length === filteredLessons.length && filteredLessons.length > 0} 
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBulkIds(filteredLessons.map(l => l.id));
                  } else {
                    setSelectedBulkIds([]);
                  }
                }}
                className="h-5 w-5 rounded-md"
              />
              <label htmlFor="select-all" className="text-sm font-bold text-primary cursor-pointer select-none">
                تحديد الكل ({filteredLessons.length} درس)
              </label>
            </div>
            
            {selectedBulkIds.length > 0 && (
              <div className="flex gap-2 animate-in zoom-in-95">
                 <Button 
                   variant="secondary" 
                   className="h-10 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white gap-2 shadow-md shadow-blue-200 px-6 transition-all hover:scale-105 active:scale-95"
                   onClick={() => {
                     const lessonsToEdit = lessons.filter(l => selectedBulkIds.includes(l.id));
                     setBulkEditLessons(lessonsToEdit.map(l => ({ 
                       id: l.id, 
                       title: l.title, 
                       page_number: l.page_number || '' 
                     })));
                   }}
                 >
                    <Edit2 className="h-4 w-4" />
                    تعديل جماعي ({selectedBulkIds.length})
                 </Button>
                 <Button 
                   variant="secondary" 
                   className="h-10 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white gap-2 shadow-md shadow-amber-200 px-6 transition-all hover:scale-105 active:scale-95"
                   onClick={() => {
                      console.log('Bulk question generation clicked, selected IDs:', selectedBulkIds);
                      const lessonsToProcess = lessons.filter(l => selectedBulkIds.includes(l.id));
                      console.log('Lessons to process:', lessonsToProcess.map(l => l.title));
                      setPendingBulkQuestions(lessonsToProcess);
                      setQuestionTypeDialogOpen(true);
                      console.log('Dialog should open now');
                   }}
                 >
                    <Sparkles className="h-4 w-4" />
                    توليد أسئلة ({selectedBulkIds.length})
                 </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl h-10 gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={() => {
                    const lessonsToExport = filteredLessons.filter(l => selectedBulkIds.includes(l.id));
                    exportMultipleLessonsToExcel(lessonsToExport);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Excel ({selectedBulkIds.length})
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl h-10 gap-2 border-green-500/30 hover:bg-green-50 text-green-600 font-bold"
                  onClick={handleBulkExportPDF}
                >
                  <Printer className="h-4 w-4" />
                  تصدير PDF ({selectedBulkIds.length})
                </Button>
                
                <Button 
                  variant="outline"
                  className="rounded-xl h-10 gap-2 border-amber-400/40 hover:bg-amber-50 text-amber-700 font-bold"
                  onClick={handleBulkDeleteSummary}
                  disabled={isDeletingBulkSummary}
                >
                  {isDeletingBulkSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  حذف الملخص ({selectedBulkIds.length})
                </Button>

                <Button 
                  variant="outline"
                  className="rounded-xl h-10 gap-2 border-purple-400/40 hover:bg-purple-50 text-purple-700 font-bold"
                  onClick={handleBulkDeleteQuestions}
                  disabled={isDeletingBulkQuestions}
                >
                  {isDeletingBulkQuestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  حذف الأسئلة ({selectedBulkIds.length})
                </Button>

                <Button 
                  variant="destructive" 
                  className="rounded-xl h-10 gap-2 shadow-lg shadow-destructive/20"
                  onClick={handleBulkDelete}
                  disabled={isDeletingBulk}
                >
                  {isDeletingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  حذف المحدد ({selectedBulkIds.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lessons List Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))
        ) : filteredLessons.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted animate-fade-in">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            {!selectedClassFilter && !selectedSubjectFilter ? (
              <>
                <h3 className="text-xl font-bold text-primary">اختر الصف والمادة لعرض الدروس</h3>
                <p className="text-sm text-muted-foreground mt-2">يرجى تحديد الصف والمادة من الأعلى لعرض الدروس المتاحة</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-muted-foreground">لا توجد دروس تطابق التصفية</h3>
                <p className="text-sm text-muted-foreground mt-2">جرب تغيير خيارات التصفية أو أضف درساً جديداً</p>
              </>
            )}
          </div>
        ) : (
          <>
            {filteredLessons.map((lesson) => (
              <AdminLessonCard 
                key={lesson.id} 
                lesson={lesson} 
                isSelected={selectedBulkIds.includes(lesson.id)} 
                onToggleBulk={toggleBulkSelection} 
                onPreview={handlePreview} 
                onDelete={handleDeleteLesson} 
                onEditTitle={handleEditTitleRequest} 
                onAction={handleLessonAction}
                onQuestionTypeSelect={handleQuestionTypeSelection}
                onEditQuestions={handleEditQuestions}
                onExportPDF={handleExportPDF}
                onEditSummary={handleEditSummary}
                onDeleteSummary={handleDeleteSummary}
                onDeleteQuestions={handleDeleteQuestions}
                processingTask={processingLessons[lesson.id]} 
              />
            ))}
            
            {/* زر تحميل المزيد */}
            {hasMoreLessons && !loading && (
              <div className="col-span-full flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  size="lg"
                  className="rounded-2xl px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      تحميل المزيد من الدروس
                      <ChevronDown className="mr-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
          {previewLesson && (
            <div className="flex flex-col bg-muted/10">
              <div className="p-6 bg-white border-b sticky top-0 z-10 flex justify-between items-center">
                 <h3 className="font-bold text-primary flex items-center gap-2">
                    <Eye className="h-5 w-5 text-secondary" />
                    معاينة: {previewLesson.title}
                 </h3>
                 <div className="flex gap-2">
                   <Button variant="outline" className="gap-2" onClick={() => exportLessonToPDF(previewLesson)}>
                     <Download className="h-4 w-4" />
                     تصدير PDF
                   </Button>
                   <Button variant="outline" className="gap-2" onClick={() => exportLessonToExcel(previewLesson)}>
                     <Download className="h-4 w-4" />
                     تصدير إكسل
                   </Button>
                   <Button variant="ghost" onClick={() => setIsPreviewDialogOpen(false)}>إغلاق</Button>
                 </div>
              </div>
              
              <div className="p-8 space-y-10">
                 {/* Summary Section */}
                 <div className="space-y-4">
                    <h4 className="text-xl font-black text-primary flex items-center gap-2">
                       <Sparkles className="h-6 w-6 text-amber-500" />
                       الملخص الذكي
                    </h4>
                    <Card className="border-none shadow-md rounded-[32px] overflow-hidden bg-white p-8">
                       <div className="prose prose-primary max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap arabic-font text-lg">
                         {previewLesson.summary || 'لم يتم توليد ملخص لهذا الدرس بعد.'}
                       </div>
                    </Card>
                 </div>

                 {/* Questions Section */}
                 <div className="space-y-4">
                    <h4 className="text-xl font-black text-primary flex items-center gap-2">
                       <HelpCircle className="h-6 w-6 text-secondary" />
                       أسئلة الاختبار ({previewLesson.ai_questions?.length || 0})
                    </h4>
                    <div className="grid gap-4">
                       {(!previewLesson.ai_questions || previewLesson.ai_questions.length === 0) ? (
                         <div className="p-12 text-center bg-white rounded-[32px] border-2 border-dashed">
                            <p className="text-muted-foreground">لا توجد أسئلة اختبار.</p>
                         </div>
                       ) : (
                         previewLesson.ai_questions.map((q, idx) => (
                           <Card key={idx} className="border-none shadow-md rounded-3xl bg-white overflow-hidden">
                              {editingQuestionIndex === idx ? (
                                // Edit Mode
                                <div className="p-6 space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary">نص السؤال</label>
                                    <Textarea
                                      value={editingQuestionData?.question || ''}
                                      onChange={(e) => setEditingQuestionData(prev => prev ? { ...prev, question: e.target.value } : null)}
                                      className="min-h-[80px] rounded-2xl border-2 focus:border-primary"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary">الخيارات</label>
                                    {editingQuestionData?.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex gap-2 items-center">
                                        <Input
                                          value={opt}
                                          onChange={(e) => {
                                            const newOptions = [...(editingQuestionData?.options || [])];
                                            newOptions[oIdx] = e.target.value;
                                            setEditingQuestionData(prev => prev ? { ...prev, options: newOptions } : null);
                                          }}
                                          className="h-12 rounded-xl border-2 focus:border-primary"
                                        />
                                        <Button
                                          variant={editingQuestionData.correct_option_index === oIdx ? 'default' : 'outline'}
                                          size="icon"
                                          className="h-12 w-12 rounded-xl shrink-0"
                                          onClick={() => setEditingQuestionData(prev => prev ? { ...prev, correct_option_index: oIdx } : null)}
                                          title="تحديد كإجابة صحيحة"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={handleSaveEditedQuestion}
                                      className="flex-1 h-12 rounded-xl gap-2"
                                    >
                                      <Check className="h-4 w-4" />
                                      حفظ التعديلات
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={handleCancelEditQuestion}
                                      className="flex-1 h-12 rounded-xl gap-2"
                                    >
                                      <X className="h-4 w-4" />
                                      إلغاء
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // View Mode
                                <>
                                  <div className="p-6 border-b bg-muted/5">
                                     <div className="flex justify-between items-start gap-4 mb-2">
                                        <div className="flex gap-4 flex-1">
                                           <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                                              {idx + 1}
                                           </div>
                                           <p className="font-bold text-lg text-primary">{q.question}</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                          {q.source_reference && (
                                             <Badge variant="outline" className="text-[10px] font-bold border-secondary/20 text-secondary bg-secondary/5 whitespace-nowrap">
                                                {q.source_reference}
                                             </Badge>
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => handleStartEditQuestion(idx)}
                                            title="تعديل السؤال"
                                          >
                                            <Edit3 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleDeleteQuestion(idx)}
                                            title="حذف السؤال"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                     {q.options.map((opt, oIdx) => (
                                       <div key={oIdx} className={cn(
                                         "p-4 rounded-xl border-2 text-sm",
                                         q.correct_option_index === oIdx ? "bg-green-50 border-green-200 text-green-700 font-bold" : "bg-white border-muted/50"
                                       )}>
                                          {opt}
                                       </div>
                                     ))}
                                  </div>
                                </>
                              )}
                           </Card>
                         ))
                       )}
                    </div>
                 </div>

                 {/* Content Images */}
                 <div className="space-y-4">
                    <h4 className="text-xl font-black text-primary flex items-center gap-2">
                       <ImageIcon className="h-6 w-6 text-blue-500" />
                       المحتوى المصور
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {previewLesson.image_urls.map((url, i) => (
                         <Card key={i} className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
                            <img src={url} alt={`Page ${i+1}`} className="w-full h-auto" />
                         </Card>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Title Dialog */}
      <Dialog open={isEditTitleDialogOpen} onOpenChange={setIsEditTitleDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-2xl arabic-font" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary mb-2">تعديل معلومات الدرس</DialogTitle>
            <p className="text-muted-foreground text-sm">أدخل المعلومات الجديدة للدرس أدناه</p>
          </DialogHeader>
          <div className="py-6 space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-bold text-primary">عنوان الدرس</label>
                <Input 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: الدرس الأول: مقدمة في الرياضيات"
                  className="h-14 rounded-2xl border-2 focus:border-primary px-6"
                />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-primary">رقم الصفحة</label>
                <Input 
                  type="number"
                  value={newPageNumber}
                  onChange={(e) => setNewPageNumber(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="رقم الصفحة في الكتاب"
                  className="h-14 rounded-2xl border-2 focus:border-primary px-6"
                />
             </div>
          </div>
          <div className="flex gap-3">
             <Button 
               variant="ghost" 
               className="h-12 flex-1 rounded-xl font-bold" 
               onClick={() => setIsEditTitleDialogOpen(false)}
             >
               إلغاء
             </Button>
             <Button 
               className="h-12 flex-[2] rounded-xl font-black bg-primary shadow-lg shadow-primary/20 gap-2"
               onClick={handleUpdateLessonInfo}
               disabled={isUpdatingTitle || !newTitle.trim()}
             >
               {isUpdatingTitle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
               حفظ التعديلات
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Type Selection Dialog */}
      <Dialog open={questionTypeDialogOpen} onOpenChange={(open) => {
        console.log('Dialog open state changed:', open);
        if (!open) {
          // تنظيف صور الامتحان عند الإغلاق
          examPaperPreviews.forEach(url => URL.revokeObjectURL(url));
          setExamPaperFiles([]);
          setExamPaperPreviews([]);
        }
        setQuestionTypeDialogOpen(open);
      }}>
        <DialogContent className="max-w-lg rounded-3xl p-0 border-none shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="bg-primary p-6 text-white relative overflow-hidden shrink-0">
            <div className="relative z-10 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-white hover:bg-white/20"
                onClick={() => setQuestionTypeDialogOpen(false)}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <HelpCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-0.5">اختر نوع الأسئلة</h3>
                <p className="text-white/70 text-xs font-bold">حدد نوع الأسئلة للتوليد</p>
              </div>
            </div>
            <Sparkles className="absolute -left-6 -bottom-6 h-32 w-32 text-white/10" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">{/* Made scrollable */}
            <div className="space-y-3">
              <button
                onClick={() => setSelectedQuestionType('mcq')}
                className={cn(
                  "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 group hover:scale-[1.02] active:scale-[0.98]",
                  selectedQuestionType === 'mcq' 
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                    : "border-slate-200 hover:border-primary/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedQuestionType === 'mcq' ? "border-primary bg-primary" : "border-slate-300"
                )}>
                  {selectedQuestionType === 'mcq' && <Check className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-lg text-primary mb-1">اختيار من متعدد</h4>
                  <p className="text-sm text-muted-foreground font-bold">أسئلة مع خيارات (A, B, C, D)</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedQuestionType('true_false')}
                className={cn(
                  "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 group hover:scale-[1.02] active:scale-[0.98]",
                  selectedQuestionType === 'true_false' 
                    ? "border-secondary bg-secondary/5 shadow-md shadow-secondary/10" 
                    : "border-slate-200 hover:border-secondary/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedQuestionType === 'true_false' ? "border-secondary bg-secondary" : "border-slate-300"
                )}>
                  {selectedQuestionType === 'true_false' && <Check className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-lg text-secondary mb-1">صح أو خطأ</h4>
                  <p className="text-sm text-muted-foreground font-bold">أسئلة بنظام صح (✓) أو خطأ (✕)</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedQuestionType('both')}
                className={cn(
                  "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 group hover:scale-[1.02] active:scale-[0.98]",
                  selectedQuestionType === 'both' 
                    ? "border-accent bg-accent/5 shadow-md shadow-accent/10" 
                    : "border-slate-200 hover:border-accent/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedQuestionType === 'both' ? "border-accent bg-accent" : "border-slate-300"
                )}>
                  {selectedQuestionType === 'both' && <Check className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-lg text-accent mb-1">النوعين معاً</h4>
                  <p className="text-sm text-muted-foreground font-bold">أسئلة متنوعة بدون تكرار</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedQuestionType('extract_from_image')}
                className={cn(
                  "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 group hover:scale-[1.02] active:scale-[0.98]",
                  selectedQuestionType === 'extract_from_image' 
                    ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10" 
                    : "border-slate-200 hover:border-emerald-500/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedQuestionType === 'extract_from_image' ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                )}>
                  {selectedQuestionType === 'extract_from_image' && <Check className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-lg text-emerald-700 mb-1">الاستخراج والتوليد بنفس العدد والنوع والصيغة</h4>
                  <p className="text-sm text-muted-foreground font-bold">استخراج جميع الأسئلة من صورة الدرس بنفس الصيغة والعدد والنوع</p>
                </div>
              </button>

              {/* ─── الخيار الجديد: توليد أسئلة طبق الأصل ─── */}
              <button
                onClick={() => setSelectedQuestionType('replica')}
                className={cn(
                  "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 group hover:scale-[1.02] active:scale-[0.98]",
                  selectedQuestionType === 'replica'
                    ? "border-rose-500 bg-rose-50 shadow-md shadow-rose-500/10"
                    : "border-slate-200 hover:border-rose-500/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedQuestionType === 'replica' ? "border-rose-500 bg-rose-500" : "border-slate-300"
                )}>
                  {selectedQuestionType === 'replica' && <Check className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-lg text-rose-700">طبق الأصل</h4>
                    <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">جديد</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-bold">
                    يحلل صور الدرس ويُولّد أسئلة مطابقة بنفس العدد والنوع والصيغة والأسلوب، مع شرح وطريقة حل مرقمة وإجابة صحيحة ١٠٠٪
                  </p>
                </div>
              </button>

              {/* ─── الخيار: نسخ ورقة الامتحان طبق الأصل ─── */}
              <button
                onClick={() => {
                  setSelectedQuestionType('exam_paper_exact');
                  setExamPaperFiles([]);
                  setExamPaperPreviews([]);
                }}
                className={cn(
                  "w-full p-5 rounded-xl border-2 transition-all text-right flex items-center gap-4 group hover:scale-[1.02] active:scale-[0.98]",
                  selectedQuestionType === 'exam_paper_exact'
                    ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10"
                    : "border-slate-200 hover:border-violet-500/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedQuestionType === 'exam_paper_exact' ? "border-violet-500 bg-violet-500" : "border-slate-300"
                )}>
                  {selectedQuestionType === 'exam_paper_exact' && <Check className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-lg text-violet-700">نسخ ورقة الامتحان طبق الأصل</h4>
                    <span className="text-[10px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">جديد</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-bold">ارفع صور ورقة امتحان رسمية — يستخرج الذكاء الاصطناعي كل سؤال بنفس الصيغة والخيارات ويحدد الإجابات الصحيحة</p>
                </div>
              </button>

              {/* منطقة رفع صور ورقة الامتحان */}
              {selectedQuestionType === 'exam_paper_exact' && (
                <div className="mt-1 space-y-3">
                  <label
                    htmlFor="exam-paper-upload"
                    className={cn(
                      "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all",
                      examPaperFiles.length > 0
                        ? "border-violet-400 bg-violet-50"
                        : "border-slate-300 hover:border-violet-400 hover:bg-violet-50/50"
                    )}
                  >
                    <ScanText className="h-8 w-8 text-violet-400 mb-2" />
                    <p className="text-sm font-black text-violet-700">اسحب صور الامتحان هنا أو اضغط لاختيارها</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG — يمكن رفع أكثر من صورة</p>
                    <input
                      id="exam-paper-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        setExamPaperFiles(prev => [...prev, ...files]);
                        const newPreviews = files.map(f => URL.createObjectURL(f));
                        setExamPaperPreviews(prev => [...prev, ...newPreviews]);
                      }}
                    />
                  </label>

                  {/* معاينة الصور المرفوعة */}
                  {examPaperPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {examPaperPreviews.map((src, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-violet-200 aspect-[3/4]">
                          <img src={src} alt={`صفحة ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExamPaperFiles(prev => prev.filter((_, i) => i !== idx));
                              setExamPaperPreviews(prev => {
                                URL.revokeObjectURL(prev[idx]);
                                return prev.filter((_, i) => i !== idx);
                              });
                            }}
                            className="absolute top-1 left-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {examPaperFiles.length > 0 && (
                    <p className="text-xs text-violet-600 font-bold text-center">
                      {examPaperFiles.length} صورة جاهزة للتحليل
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 font-bold leading-relaxed">
                  {selectedQuestionType === 'exam_paper_exact'
                    ? 'ارفع صور ورقة الامتحان الرسمية، وسيقوم الذكاء الاصطناعي باستخراج كل سؤال بنفس صيغته وخياراته وترقيمه، مع تحديد الإجابة الصحيحة والشرح لكل سؤال.'
                    : selectedQuestionType === 'extract_from_image'
                      ? 'سيتم استخراج جميع الأسئلة من صورة الدرس بنفس العدد والنوع والصيغة والترقيم، مع توليد الإجابات الصحيحة والشروحات التفصيلية.'
                      : 'عند اختيار "النوعين معاً"، سيتم توليد أسئلة متنوعة دون تكرار.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">{/* Made footer fixed */}
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-xl font-black border-2 text-base"
              onClick={() => setQuestionTypeDialogOpen(false)}
              disabled={examPaperLoading}
            >
              إلغاء
            </Button>
            <Button 
              className={cn(
                "flex-[2] h-14 rounded-xl font-black text-base shadow-lg gap-2",
                selectedQuestionType === 'exam_paper_exact'
                  ? "bg-violet-600 hover:bg-violet-700 shadow-violet-200"
                  : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
              onClick={handleConfirmQuestionGeneration}
              disabled={examPaperLoading || (selectedQuestionType === 'exam_paper_exact' && examPaperFiles.length === 0)}
            >
              {examPaperLoading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> جاري الاستخراج...</>
              ) : selectedQuestionType === 'exam_paper_exact' ? (
                <><GraduationCap className="h-5 w-5" /> استخراج الأسئلة</>
              ) : (
                <><Sparkles className="h-5 w-5" /> بدء التوليد</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog لتعديل الملخص */}
      <Dialog open={!!editingSummary} onOpenChange={(open) => !open && setEditingSummary(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-0 border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogTitle className="text-2xl font-black">تعديل ملخص الدرس</DialogTitle>
            <p className="text-white/70 text-sm font-bold mt-1">{editingSummary?.lesson.title}</p>
          </div>
          <div className="p-6 space-y-4">
            <textarea
              value={editingSummary?.summary || ''}
              onChange={(e) => setEditingSummary(prev => prev ? { ...prev, summary: e.target.value } : null)}
              className="w-full min-h-[300px] p-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none font-bold text-base resize-none"
              placeholder="اكتب ملخص الدرس هنا..."
            />
          </div>
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-xl font-black border-2 text-base"
              onClick={() => setEditingSummary(null)}
            >
              إلغاء
            </Button>
            <Button 
              className="flex-[2] h-14 rounded-xl font-black text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
              onClick={handleSaveSummary}
            >
              <Save className="h-5 w-5" />
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog لتعديل الأسئلة */}
      <Dialog open={!!editingQuestions} onOpenChange={(open) => !open && setEditingQuestions(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] rounded-3xl p-0 border-none shadow-2xl flex flex-col">
          <div className="bg-primary p-6 text-white shrink-0">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <HelpCircle className="h-7 w-7" />
              تعديل أسئلة الدرس
            </DialogTitle>
            <p className="text-white/70 text-sm font-bold mt-1">{editingQuestions?.lesson.title} - {editingQuestions?.questions.length} سؤال</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {editingQuestions?.questions.map((q, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-primary uppercase">نص السؤال</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...editingQuestions.questions];
                          updated[idx] = { ...updated[idx], question: e.target.value };
                          setEditingQuestions({ ...editingQuestions, questions: updated });
                        }}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none font-bold text-sm resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-primary uppercase">الخيارات</label>
                      {q.options?.map((opt: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={q.correct_option_index === optIdx}
                            onChange={() => {
                              const updated = [...editingQuestions.questions];
                              updated[idx] = { ...updated[idx], correct_option_index: optIdx };
                              setEditingQuestions({ ...editingQuestions, questions: updated });
                            }}
                            className="h-4 w-4 text-primary"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...editingQuestions.questions];
                              const newOptions = [...updated[idx].options];
                              newOptions[optIdx] = e.target.value;
                              updated[idx] = { ...updated[idx], options: newOptions };
                              setEditingQuestions({ ...editingQuestions, questions: updated });
                            }}
                            className="flex-1 p-2 rounded-lg border-2 border-slate-200 focus:border-primary focus:outline-none font-bold text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-primary uppercase">التفسير</label>
                        <textarea
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...editingQuestions.questions];
                            updated[idx] = { ...updated[idx], explanation: e.target.value };
                            setEditingQuestions({ ...editingQuestions, questions: updated });
                          }}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none font-bold text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        const updated = editingQuestions.questions.filter((_, i) => i !== idx);
                        setEditingQuestions({ ...editingQuestions, questions: updated });
                      }}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف السؤال
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-xl font-black border-2 text-base"
              onClick={() => setEditingQuestions(null)}
            >
              إلغاء
            </Button>
            <Button 
              className="flex-[2] h-14 rounded-xl font-black text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
              onClick={handleSaveQuestions}
            >
              <Save className="h-5 w-5" />
              حفظ التعديلات ({editingQuestions?.questions.length} سؤال)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog للتعديل الجماعي */}
      <Dialog open={bulkEditLessons.length > 0} onOpenChange={(open) => !open && setBulkEditLessons([])}>
        <DialogContent className="max-w-4xl max-h-[85vh] rounded-3xl p-0 border-none shadow-2xl flex flex-col">
          <div className="bg-primary p-6 text-white shrink-0">
            <DialogTitle className="text-2xl font-black">تعديل جماعي للدروس</DialogTitle>
            <p className="text-white/70 text-sm font-bold mt-1">تعديل عناوين وأرقام صفحات {bulkEditLessons.length} دروس</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {bulkEditLessons.map((lesson, index) => (
              <div key={lesson.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-black text-primary text-lg">الدرس {index + 1}</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">عنوان الدرس</label>
                  <Input
                    value={lesson.title}
                    onChange={(e) => handleBulkEditChange(lesson.id, 'title', e.target.value)}
                    className="h-12 rounded-xl border-2 font-bold"
                    placeholder="عنوان الدرس"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">رقم الصفحة</label>
                  <Input
                    value={String(lesson.page_number)}
                    onChange={(e) => handleBulkEditChange(lesson.id, 'page_number', e.target.value)}
                    className="h-12 rounded-xl border-2 font-bold"
                    placeholder="رقم الصفحة"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-xl font-black border-2 text-base"
              onClick={() => setBulkEditLessons([])}
            >
              إلغاء
            </Button>
            <Button 
              className="flex-[2] h-14 rounded-xl font-black text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
              onClick={handleSaveBulkEdit}
            >
              <Save className="h-5 w-5" />
              حفظ جميع التعديلات ({bulkEditLessons.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <ExportOptionsDialog 
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onConfirm={handleExportConfirm}
        lessonCount={lessonsToExport.length}
      />
      
      <ExportHistoryDialog 
        open={exportHistoryOpen}
        onOpenChange={setExportHistoryOpen}
        onOpenFile={async (record) => {
          try {
            // Find lessons by IDs
            const lessonIds = record.lesson_ids || [];
            const lessonsToOpen = lessons.filter(l => lessonIds.includes(l.id));
            
            if (lessonsToOpen.length === 0) {
              toast({
                variant: 'destructive',
                title: '❌ خطأ',
                description: 'لم يتم العثور على الدروس المطلوبة'
              });
              return;
            }
            
            // Generate and open the export directly
            toast({ 
              title: '⏳ جاري فتح الملف...', 
              description: 'يتم الآن تجهيز المحتوى',
            });
            
            // Open print window with loading screen
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
              toast({
                variant: 'destructive',
                title: '❌ تم حظر النافذة المنبثقة',
                description: 'يرجى السماح بالنوافذ المنبثقة في إعدادات المتصفح'
              });
              return;
            }
            
            printWindow.document.write(`
              <!DOCTYPE html>
              <html dir="rtl">
              <head>
                <meta charset="UTF-8">
                <title>جاري التحميل...</title>
                <style>
                  body { 
                    margin: 0; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    min-height: 100vh; 
                    background: linear-gradient(135deg, #00acc1, #00838f);
                    font-family: Arial, sans-serif;
                    color: white;
                  }
                  .loader { 
                    text-align: center; 
                  }
                  .spinner { 
                    border: 4px solid rgba(255,255,255,0.3); 
                    border-top: 4px solid white; 
                    border-radius: 50%; 
                    width: 50px; 
                    height: 50px; 
                    animation: spin 1s linear infinite; 
                    margin: 0 auto 20px;
                  }
                  @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                  }
                  p { font-size: 18px; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="loader">
                  <div class="spinner"></div>
                  <p>جاري تجهيز المحتوى للعرض...</p>
                </div>
              </body>
              </html>
            `);
            
            try {
              const result = await exportLessonsWithOptions(lessonsToOpen, record.export_options, printWindow);
              console.log('File opened successfully:', result);
              
              toast({ 
                title: '✅ تم فتح الملف', 
                description: 'يمكنك الآن عرض المحتوى أو طباعته',
              });
            } catch (err: any) {
              console.error('Open file error:', err);
              
              if (printWindow && !printWindow.closed) {
                printWindow.close();
              }
              
              toast({ 
                variant: 'destructive', 
                title: '❌ فشل فتح الملف', 
                description: err.message || 'حدث خطأ أثناء فتح الملف'
              });
            }
          } catch (error: any) {
            console.error('Open file error:', error);
            toast({
              variant: 'destructive',
              title: '❌ فشل فتح الملف',
              description: error.message || 'حدث خطأ أثناء فتح الملف'
            });
          }
        }}
        onReExport={async (record) => {
          try {
            // Find lessons by IDs
            const lessonIds = record.lesson_ids || [];
            const lessonsToReExport = lessons.filter(l => lessonIds.includes(l.id));
            
            if (lessonsToReExport.length === 0) {
              toast({
                variant: 'destructive',
                title: '❌ خطأ',
                description: 'لم يتم العثور على الدروس المطلوبة'
              });
              return;
            }
            
            // Close history dialog
            setExportHistoryOpen(false);
            
            // Set lessons to export
            setLessonsToExport(lessonsToReExport);
            
            // Trigger export with saved options
            await handleExportConfirm(record.export_options);
          } catch (error: any) {
            console.error('Re-export error:', error);
            toast({
              variant: 'destructive',
              title: '❌ فشل إعادة التصدير',
              description: error.message || 'حدث خطأ أثناء إعادة التصدير'
            });
          }
        }}
      />
    </AdminLayout>
  );
};

export default AdminLessons;
