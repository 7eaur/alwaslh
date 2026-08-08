import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent } from '@/components/ui/card';
import { LazyImage } from '@/components/common/LazyImage';
import { studentApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Lesson, Subject, Class } from '@/types';
import { 
  BookOpen, 
  Search, 
  ChevronLeft,
  Filter,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
  Loader2,
  Lock
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { 
  getLessonsOffline, 
  getSubjectsOffline, 
  getClassesOffline,
  saveLessonsOffline,
  saveSubjectsOffline,
  saveClassesOffline
} from '@/lib/offline-db';
import { removeCache } from '@/lib/offline-cache';import { useAccessControl } from '@/hooks/useAccessControl';
import { useAccess } from '@/context/AccessContext';
import { useToast } from '@/hooks/use-toast';

const LessonCard = React.memo(({ 
  lesson, 
  subjects, 
  onClick,
  isLocked
}: { 
  lesson: Lesson; 
  subjects: Subject[]; 
  onClick: () => void;
  isLocked: boolean;
}) => {
  const sub = useMemo(() => subjects.find(s => s.id === lesson.subject_id), [subjects, lesson.subject_id]);
  const questionCount = useMemo(() => lesson.ai_questions?.length || 0, [lesson.ai_questions]);
  
  return (
    <Card 
      className={cn(
        "group cursor-pointer border-none shadow-md hover:shadow-xl transition-all rounded-3xl overflow-hidden bg-white animate-slide-in",
        isLocked && "opacity-60"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0 flex flex-col sm:flex-row h-full">
        <div className="relative h-40 sm:h-auto sm:w-44 bg-muted shrink-0 overflow-hidden">
          {lesson.image_urls?.[0] ? (
            <LazyImage 
              src={lesson.image_urls[0]} 
              alt={lesson.title} 
              className={cn(
                "h-full w-full object-cover group-hover:scale-110 transition-transform duration-500",
                isLocked && "blur-sm"
              )}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10">
               <BookOpen className="h-10 w-10 text-primary opacity-20" />
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-black shadow-lg">
            {sub?.name || 'مادة'}
          </div>
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-primary text-[9px] px-2 py-0.5 rounded-lg font-black shadow-sm border border-primary/10">
            صفحة {lesson.page_number || '??'}
          </div>
        </div>
        
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg sm:text-xl font-black text-primary group-hover:translate-x-[-4px] transition-transform leading-tight">{lesson.title}</h3>
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
               <ChevronLeft className="h-5 w-5" />
            </div>
          </div>
          
          <p className="text-[11px] text-muted-foreground line-clamp-1 mb-3 leading-relaxed h-4">
            {lesson.summary || 'تصفح محتوى الدرس والملخص الذكي بالإضافة إلى الاختبار التفاعلي.'}
          </p>
          
          <div className="mt-auto flex items-center gap-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 p-2 rounded-xl border border-muted/50">
            <div className="flex items-center gap-1.5 border-l border-muted-foreground/10 pl-2">
               <HelpCircle className="h-3 w-3 text-secondary" />
               <span>{questionCount} سؤال</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-muted-foreground/10 pl-2">
               <Sparkles className="h-3 w-3 text-amber-500" />
               <span>ملخص</span>
            </div>
            <div className="flex items-center gap-1.5">
               <FileText className="h-3 w-3 text-blue-500" />
               <span>ملاحظات</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // تحسين الأداء: عدم إعادة الرسم إلا عند تغيير البيانات الفعلية
  return prevProps.lesson.id === nextProps.lesson.id && 
         prevProps.subjects === nextProps.subjects &&
         prevProps.isLocked === nextProps.isLocked;
});

const StudentLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  // ref لتتبع آخر مواد معروفة - نستخدمه كـ fallback عند حساب isLocked
  const subjectsRef = useRef<Subject[]>([]);
  useEffect(() => { if (subjects.length > 0) subjectsRef.current = subjects; }, [subjects]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { canAccessContent } = useAccessControl();
  const { hasFullAccess, activatedClassIds } = useAccess();
  const { toast } = useToast();

  // إعادة تحميل الدروس عند الضغط على زر التحديث اليدوي
  useEffect(() => {
    const handle = () => setRefreshKey(k => k + 1);
    window.addEventListener('content-refreshed', handle);
    return () => window.removeEventListener('content-refreshed', handle);
  }, []);

  const selectedClassId = searchParams.get('class') || '';
  const selectedSubjectId = searchParams.get('subject') || '';

  useEffect(() => {
    // عرض فوري من IndexedDB بدون loading (لا نعيد تعيين الحالة عشوائياً)
    const showCacheInstant = async () => {
      try {
        const [cachedCls, cachedSub, cachedLess] = await Promise.all([
          getClassesOffline(),
          selectedClassId ? getSubjectsOffline(selectedClassId) : Promise.resolve([] as Subject[]),
          selectedSubjectId
            ? getLessonsOffline(selectedSubjectId)
            : selectedClassId
            ? getLessonsOffline()
            : Promise.resolve([] as Lesson[]),
        ]);

        // تحديث الصفوف دائماً إذا توفرت
        if (cachedCls.length > 0) setClasses(cachedCls);

        // تحديث المواد دائماً (لا نتركها فارغة)
        setSubjects(cachedSub);

        // تحديث الدروس فوراً ثم إخفاء loading
        const sorted = [...(selectedSubjectId
          ? cachedLess
          : cachedLess.filter(l => cachedSub.some(s => s.id === l.subject_id))
        )].sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
        setLessons(sorted);
        setLoading(false);
      } catch {
        // تجاهل أخطاء IndexedDB
        setLoading(false);
      }
    };

    // عرض الكاش فوراً (الأولوية)
    showCacheInstant();

    // تحديث السيرفر في الخلفية فقط إذا متصل
    if (!isOnline) return;

    const refreshFromServer = async () => {
      try {
        const [onlineCls, onlineSub] = await Promise.all([
          studentApi.getClasses(),
          selectedClassId ? studentApi.getSubjects(selectedClassId) : Promise.resolve([] as Subject[]),
        ]);

        // تحديث الحالة دائماً بما ترجعه السيرفر (بما فيه مصفوفة فارغة عند الحذف)
        await saveClassesOffline(onlineCls);
        setClasses(onlineCls);
        await saveSubjectsOffline(onlineSub);
        setSubjects(onlineSub);

        if (selectedSubjectId) {
          const onlineLess = (await studentApi.getLessons(selectedSubjectId))
            .sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
          await saveLessonsOffline(onlineLess);
          setLessons(onlineLess);
        } else if (selectedClassId) {
          const allLessons = (await Promise.all(onlineSub.map(s => studentApi.getLessons(s.id)))).flat()
            .sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
          await saveLessonsOffline(allLessons);
          setLessons(allLessons);
        }
      } catch (err) {
        console.warn('⚠️ تحديث الخلفية فشل، البيانات المحلية معروضة:', err);
      }
    };

    refreshFromServer();
  }, [selectedClassId, selectedSubjectId, isOnline, refreshKey]);

  const handleLessonClick = useCallback((lesson: Lesson) => {
    // التحقق من إمكانية الوصول باستخدام class_id للمادة
    // استخدم subjects الحالية، وإذا فارغة استخدم subjectsRef (آخر قيمة معروفة)
    const subjectsList = subjects.length > 0 ? subjects : subjectsRef.current;
    const subjectClassId = subjectsList.find(s => s.id === lesson.subject_id)?.class_id || '';
    const hasAccess = canAccessContent(subjectClassId);
    
    if (!hasAccess) {
      toast({
        variant: "destructive",
        title: "محتوى مقفل 🔒",
        description: "يرجى تفعيل الصف للوصول لهذا الدرس",
      });
      return;
    }
    
    navigate(`/student/lessons/${lesson.id}`);
  }, [navigate, canAccessContent, subjects, toast]);

  const filteredLessons = useMemo(() => {
    return lessons.filter(l => 
      l.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (l.page_number && String(l.page_number).includes(debouncedSearchTerm))
    );
  }, [lessons, debouncedSearchTerm]);

  // Persist filters
  useEffect(() => {
    const savedClass = localStorage.getItem('student_selected_class');
    const savedSubject = localStorage.getItem('student_selected_subject');
    
    if (savedClass && !searchParams.get('class')) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('class', savedClass);
        if (savedSubject) next.set('subject', savedSubject);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) localStorage.setItem('student_selected_class', selectedClassId);
    if (selectedSubjectId) localStorage.setItem('student_selected_subject', selectedSubjectId);
  }, [selectedClassId, selectedSubjectId]);

  // Realtime subscription to refresh lessons when updated/added/deleted
  useEffect(() => {
    if (!isOnline) return;

    const channel = supabase
      .channel('lessons-realtime-student')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        async (payload) => {
          // تحديث فوري عند إضافة أو تعديل أو حذف درس
          if (selectedSubjectId) {
            const fresh = await studentApi.getLessons(selectedSubjectId);
            const sorted = [...fresh].sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
            await saveLessonsOffline(sorted);
            setLessons(sorted);
          } else if (selectedClassId) {
            // تحديث كل مواد الصف
            const freshSubs = await studentApi.getSubjects(selectedClassId);
            await saveSubjectsOffline(freshSubs);
            setSubjects(freshSubs);
            const allLessons = (await Promise.all(freshSubs.map(s => studentApi.getLessons(s.id)))).flat()
              .sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
            await saveLessonsOffline(allLessons);
            setLessons(allLessons);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'subjects' },
        async () => {
          // مادة جديدة → تحديث قائمة المواد فوراً
          if (selectedClassId) {
            const freshSubs = await studentApi.getSubjects(selectedClassId);
            await saveSubjectsOffline(freshSubs);
            setSubjects(freshSubs);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedSubjectId, selectedClassId, isOnline]);

  return (
    <StudentLayout title="قائمة الدروس" showBack>
      {/* Filters Area */}
      <div className="space-y-4 mb-8 sticky top-[5rem] z-20 bg-background/95 backdrop-blur-md pb-6 pt-2 -mx-4 px-4 border-b-4 border-primary/10">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary group-focus-within:scale-110 transition-transform" />
          <Input 
            placeholder="البحث عن درس باسمه أو رقم الصفحة..." 
            className="h-16 pr-12 rounded-2xl bg-white shadow-xl border-2 border-primary/20 focus:border-primary text-black font-black text-lg transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Select 
            value={selectedClassId} 
            onValueChange={(val) => {
              setSearchParams({ class: val });
            }}
          >
            <SelectTrigger className="h-10 min-w-[140px] rounded-xl bg-white border-muted font-bold text-xs text-primary shadow-sm">
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {(hasFullAccess ? classes : classes.filter(c => activatedClassIds.includes(c.id))).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select 
            value={selectedSubjectId} 
            onValueChange={(val) => {
              setSearchParams({ class: selectedClassId, subject: val });
            }}
            disabled={!selectedClassId}
          >
            <SelectTrigger className="h-10 min-w-[140px] rounded-xl bg-white border-muted font-bold text-xs text-secondary shadow-sm">
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lessons Display */}
      <div className="space-y-4 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-pulse">
            <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-4 border-primary/20 shadow-inner">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-primary">يرجى الانتظار قليلاً...</h3>
              <p className="text-muted-foreground font-bold italic">يتم تجهيز التطبيق وجلب البيانات والصفحات</p>
            </div>
          </div>
        ) : !selectedClassId || !selectedSubjectId ? (
          <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
             <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Filter className="h-12 w-12 text-primary opacity-20" />
             </div>
             <p className="text-xl font-bold text-primary mb-2">
               {!selectedClassId ? 'اختر الصف الدراسي أولاً' : 'اختر المادة الدراسية'}
             </p>
             <p className="text-sm text-muted-foreground">قم باختيار الصف والمادة من القوائم أعلاه لعرض الدروس المتاحة.</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
             <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-12 w-12 text-primary opacity-20" />
             </div>
             <p className="text-xl font-bold text-muted-foreground">لا توجد دروس حالياً</p>
             <p className="text-sm text-muted-foreground mt-2">سيتم إضافة الدروس لهذه المادة قريباً.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredLessons.map((lesson) => {
              // استخدم subjects الحالية، وإذا فارغة استخدم subjectsRef (آخر قيمة معروفة)
              const subjectsList = subjects.length > 0 ? subjects : subjectsRef.current;
              const subjectClassId = subjectsList.find(s => s.id === lesson.subject_id)?.class_id || '';
              const isLocked = !canAccessContent(subjectClassId);
              
              return (
                <LessonCard 
                  key={lesson.id} 
                  lesson={lesson} 
                  subjects={subjects} 
                  onClick={() => handleLessonClick(lesson)}
                  isLocked={isLocked}
                />
              );
            })}
          </div>
        )}
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </StudentLayout>
  );
};

export default StudentLessons;
