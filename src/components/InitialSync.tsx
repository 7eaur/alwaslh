import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  isInitialSyncComplete, 
  markInitialSyncComplete,
  saveLessonsOffline,
  saveQuestionsOffline,
  saveQuizzesOffline,
  saveSubjectsOffline,
  saveClassesOffline,
  getClassesOffline,
  getLessonsOffline
} from '@/lib/offline-db';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

interface InitialSyncProps {
  onComplete: () => void;
  studentCode: string;
}

export function InitialSync({ onComplete, studentCode }: InitialSyncProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAndSync();
  }, []);

  async function checkAndSync() {
    try {
      // التحقق من اكتمال التحميل الأولي
      const isComplete = await isInitialSyncComplete();
      const cachedLessons = await getLessonsOffline();
      const cachedClasses = await getClassesOffline();

      // إذا كان لدينا بيانات محلية، نسمح بالدخول حتى لو فشلت المزامنة
      const hasCache = cachedClasses.length > 0 || cachedLessons.length > 0;

      if (isComplete || hasCache) {
        console.log('✅ التحميل الأولي مكتمل أو يوجد محتوى محلي');
        onComplete();
        // محاولة تحديث المحتوى في الخلفية إذا كان متصلاً
        performInitialSync().catch(() => {});
        return;
      }

      console.log('🔄 بدء التحميل الأولي...');
      await performInitialSync();
      
    } catch (error) {
      console.error('❌ خطأ في التحميل الأولي:', error);
      toast.error('تعذر تحميل البيانات. تأكد من تشغيل كاسر الشبكة لأول مرة.');
      setIsLoading(false);
    }
  }

  async function performInitialSync() {
    try {
      // الخطوة 1: تحميل الصفوف
      setCurrentStep('جاري تحميل الصفوف الدراسية...');
      setProgress(10);
      const { data: classes } = await supabase.from('classes').select('*');
      if (classes) {
        await saveClassesOffline(classes);
        console.log(`✅ تم حفظ ${classes.length} صف دراسي`);
      }

      // الخطوة 2: تحميل المواد
      setCurrentStep('جاري تحميل المواد الدراسية...');
      setProgress(20);
      const { data: subjects } = await supabase.from('subjects').select('*, classes(*)');
      if (subjects) {
        await saveSubjectsOffline(subjects);
        console.log(`✅ تم حفظ ${subjects.length} مادة دراسية`);
      }

      // الخطوة 3: تحميل الدروس
      setCurrentStep('جاري تحميل الدروس...');
      setProgress(40);
      const { data: lessons } = await supabase
        .from('lessons')
        .select('*, subjects(name, classes(name))');
      if (lessons) {
        await saveLessonsOffline(lessons);
        console.log(`✅ تم حفظ ${lessons.length} درس`);
      }

      // الخطوة 4: تحميل الأسئلة
      setCurrentStep('جاري تحميل الأسئلة...');
      setProgress(60);
      // جلب جميع الأسئلة من جدول lessons (ai_questions)
      if (lessons) {
        const allQuestions: any[] = [];
        for (const lesson of lessons) {
          if (lesson.ai_questions && Array.isArray(lesson.ai_questions)) {
            lesson.ai_questions.forEach((q: any) => {
              allQuestions.push({
                ...q,
                id: q.id || `${lesson.id}_${Math.random()}`,
                lesson_id: lesson.id
              });
            });
          }
        }
        if (allQuestions.length > 0) {
          await saveQuestionsOffline(allQuestions);
          console.log(`✅ تم حفظ ${allQuestions.length} سؤال`);
        }
      }

      // الخطوة 5: تحميل الاختبارات
      setCurrentStep('جاري تحميل الاختبارات التفاعلية...');
      setProgress(80);
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('*');
      if (quizzes) {
        await saveQuizzesOffline(quizzes);
        console.log(`✅ تم حفظ ${quizzes.length} اختبار`);
      }

      // الخطوة 6: وضع علامة الاكتمال
      setCurrentStep('جاري إنهاء التجهيز...');
      setProgress(95);
      await markInitialSyncComplete();

      setProgress(100);
      setCurrentStep('تم التجهيز بنجاح!');
      
      setTimeout(() => {
        onComplete();
      }, 500);

    } catch (error) {
      console.error('❌ خطأ في التحميل:', error);
      throw error;
    }
  }

  if (!isLoading && progress === 100) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-[90%] max-w-md">
        <CardHeader>
          <CardTitle className="text-center">يرجى الانتظار قليلاً</CardTitle>
          <CardDescription className="text-center">
            يتم تجهيز التطبيق للعمل بدون إنترنت
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            {currentStep}
          </p>
          <p className="text-xs text-center text-muted-foreground">
            {progress}%
          </p>
          {!isLoading && progress < 100 && (
            <div className="space-y-2">
              <p className="text-xs text-center text-destructive">
                لم يتم تحميل المحتوى. تأكد من تشغيل كاسر الشبكة لأول مرة ثم أعد المحاولة.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsLoading(true);
                  setProgress(0);
                  performInitialSync().catch(() => setIsLoading(false));
                }}
              >
                إعادة المحاولة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
