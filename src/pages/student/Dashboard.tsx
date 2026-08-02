import React, { useEffect, useState, useCallback, useMemo } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent } from '@/components/ui/card';
import { studentApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Class } from '@/types';
import { removeCache } from '@/lib/offline-cache';
import { preloadAllContent, isInitialSyncComplete } from '@/lib/offline-db';
import { cn } from '@/lib/utils';
import { useAccess } from '@/context/AccessContext';
import { useAuth } from '@/context/AuthContext';
import { useNewContentCheck } from '@/hooks/useNewContentCheck';
import { 
  BookOpen, 
  ChevronLeft,
  BookMarked,
  Sparkles,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  WifiOff,
  Clock,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const StudentDashboard: React.FC = () => {
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasFullAccess, activatedClassIds, activatedClasses } = useAccess();
  const { lastLogin } = useAuth();
  useNewContentCheck();

  const fetchClasses = useCallback(async (opts?: { force?: boolean; silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      // محاولة الكاش المحلي أولاً (IndexedDB أو localStorage) لعرض فوري
      if (!opts?.force) {
        const savedClasses = localStorage.getItem('student_dashboard_classes');
        if (savedClasses) {
          const parsed = JSON.parse(savedClasses);
          setAllClasses(parsed);
          setLoading(false);
        }
        const { getClassesOffline } = await import('@/lib/offline-db');
        const offlineClasses = await getClassesOffline();
        if (offlineClasses.length > 0) {
          setAllClasses(offlineClasses);
          setLoading(false);
        }
      }

      if (!navigator.onLine) {
        // لا نظهر رسالة خطأ عند قطع الإنترنت؛ نكتفي بالبيانات المحلية إن وُجدت
        return;
      }

      // تحديث من السيرفر مباشرة (بدون cachedApiCall) لتمرير الأخطاء بوضوح
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const classesData = (data as Class[]) ?? [];
      setAllClasses(classesData);
      localStorage.setItem('student_dashboard_classes', JSON.stringify(classesData));
    } catch (err: any) {
      console.warn('خطأ في جلب الصفوف من السيرفر:', err);
      // نمنع ظهور رسائل الخطأ المتعلقة بالشبكة للمستخدم
    } finally {
      setLoading(false);
    }
  }, [allClasses.length]);

  useEffect(() => {
    fetchClasses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatedClassIds.length, hasFullAccess]);

  // إعادة تحميل الصفوف عند الضغط على زر التحديث اليدوي
  useEffect(() => {
    const handle = () => fetchClasses({ force: true });
    window.addEventListener('content-refreshed', handle);
    return () => window.removeEventListener('content-refreshed', handle);
  }, [fetchClasses]);

  // تحميل شامل في الخلفية عند أول اتصال لضمان التصفح الكامل بدون إنترنت
  useEffect(() => {
    if (!navigator.onLine) return;
    const runPreload = async () => {
      const alreadyDone = await isInitialSyncComplete();
      if (alreadyDone) return; // تم التحميل مسبقاً → لا نعيد
      await preloadAllContent(
        () => studentApi.getClasses(),
        (classId) => studentApi.getSubjects(classId),
        (subjectId) => studentApi.getLessons(subjectId)
      );
    };
    // تأخير بسيط حتى تنتهي الواجهة من التحميل أولاً
    const t = setTimeout(runPreload, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    fetchClasses({ force: true });
  }, [fetchClasses]);

  // تصفية الصفوف حسب الأكواد المفعّلة
  const visibleClasses = useMemo(() => {
    if (hasFullAccess) return allClasses;
    return allClasses.filter(cls => activatedClassIds.includes(cls.id));
  }, [allClasses, hasFullAccess, activatedClassIds]);

  const classColors = useMemo(() => [
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-emerald-50 text-emerald-600 border-emerald-100',
    'bg-amber-50 text-amber-600 border-amber-100',
    'bg-rose-50 text-rose-600 border-rose-100',
    'bg-violet-50 text-violet-600 border-violet-100',
    'bg-teal-50 text-teal-600 border-teal-100',
  ], []);

  const handleClassClick = useCallback((id: string) => {
    navigate(`/student/lessons?class=${id}`);
  }, [navigate]);

  return (
    <StudentLayout title="الرئيسية">
      {/* Welcome Banner */}
      <div className="relative mb-8 rounded-[40px] bg-primary p-10 text-white overflow-hidden shadow-2xl shadow-primary/30 animate-fade-in border-4 border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="h-32 w-32 rounded-[32px] bg-white p-4 shadow-2xl shrink-0 rotate-3 transition-transform hover:rotate-0">
             <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-4xl font-black mb-3 leading-tight drop-shadow-lg">أهلاً بك في الوسيلة الذكية</h2>
            <p className="text-white/90 text-lg max-w-md font-medium leading-relaxed">ابدأ رحلتك التعليمية الآن مع وسيلة الذكية واستمتع بأفضل تجربة تعلم ذكي</p>
            {lastLogin && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold border border-white/20">
                <Clock className="h-3.5 w-3.5" />
                آخر دخول: {new Date(lastLogin).toLocaleDateString('ar-SA')} {new Date(lastLogin).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
              {hasFullAccess ? (
                <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-black border border-emerald-400/30 shadow-inner">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  وصول كامل لجميع المواد
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-black border border-white/20 shadow-inner">
                  <KeyRound className="h-5 w-5 text-amber-300" />
                  {activatedClasses.length} صف مفعّل
                </div>
              )}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-black border border-white/20 shadow-inner">
                <Sparkles className="h-5 w-5 text-amber-300" />
                تعلم بذكاء
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-black border border-white/20 shadow-inner">
                <BookOpen className="h-5 w-5 text-blue-200" />
                دروس تفاعلية
              </div>
            </div>
          </div>
        </div>
        <BookMarked className="absolute -left-10 -bottom-10 h-64 w-64 text-white/5 rotate-12 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>

      {/* قائمة الصفوف */}
      <div className="space-y-6">
         <h3 className="text-xl font-black text-primary flex items-center gap-2 px-2">
           <Layers className="h-6 w-6 text-secondary" />
           {hasFullAccess ? 'تصفح الصفوف الدراسية' : 'صفوفك المفعّلة'}
         </h3>

         {/* إذا لم يكن هناك صفوف متاحة */}
         {!loading && visibleClasses.length === 0 && (
           <div className="text-center py-12 space-y-4">
             <div className="mx-auto h-20 w-20 rounded-3xl bg-muted flex items-center justify-center">
               <KeyRound className="h-10 w-10 text-muted-foreground" />
             </div>
             <p className="text-lg font-bold text-muted-foreground">
               {hasFullAccess ? 'لا توجد صفوف متاحة' : 'لا توجد صفوف مفعّلة'}
             </p>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
               {hasFullAccess
                 ? 'قد تحتاج لتحديث المحتوى أو التأكد من الاتصال بالإنترنت'
                 : 'أضف كود صف لتفعيل محتواه'}
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
               <Button
                 onClick={handleRetry}
                 variant="default"
                 className="font-bold rounded-xl"
               >
                 <RefreshCw className="ml-2 h-4 w-4" />
                 إعادة تحميل الصفوف
               </Button>
               {!hasFullAccess && (
                 <Button
                   onClick={() => navigate('/student/activate')}
                   variant="outline"
                   className="font-bold rounded-xl"
                 >
                   <KeyRound className="ml-2 h-4 w-4" />
                   إضافة كود صف جديد
                 </Button>
               )}
             </div>
           </div>
         )}

         <div className="grid grid-cols-2 @md:grid-cols-3 gap-5">
           {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} className="h-32 w-full rounded-3xl bg-muted/50" />
             ))
           ) : (
             visibleClasses.map((cls, idx) => (
               <div 
                 key={cls.id} 
                 className={cn(
                   "flex flex-col items-center justify-center p-6 rounded-3xl border-2 shadow-sm hover:shadow-lg transition-all cursor-pointer group animate-slide-in",
                   classColors[idx % classColors.length]
                 )}
                 style={{ animationDelay: `${idx * 100}ms` }}
                 onClick={() => handleClassClick(cls.id)}
               >
                 <div className="h-14 w-14 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <Layers className="h-8 w-8" />
                 </div>
                 <span className="font-bold text-center leading-tight">{cls.name}</span>
               </div>
             ))
           )}
         </div>
      </div>
    </StudentLayout>
  );
};

const Layers = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.34a2 2 0 0 0 0 3.66l9.07 4.16a2 2 0 0 0 1.66 0l9.07-4.16a2 2 0 0 0 0-3.66z" />
    <path d="m2.1 14.34 9.07 4.15a2 2 0 0 0 1.66 0l9.07-4.15" />
    <path d="m2.1 10.34 9.07 4.15a2 2 0 0 0 1.66 0l9.07-4.15" />
  </svg>
);

export default StudentDashboard;
