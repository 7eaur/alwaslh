import React, { useEffect, useState } from 'react';
import { studentApi } from '@/db/api';
import { preloadStudentData, isDataPreloaded, isOnline } from '@/lib/offline-cache';
import { Loader2, Download, CheckCircle2, Wifi } from 'lucide-react';
import { useAccess } from '@/context/AccessContext';
import { getDeviceId } from '@/lib/device';

/**
 * مكون التحميل المسبق للبيانات
 * يظهر عند أول دخول للطالب ويحمل جميع البيانات للاستخدام بدون إنترنت
 */
export function DataPreloader() {
  const { isStudent } = useAccess();
  const deviceId = getDeviceId();
  const [isPreloading, setIsPreloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    // عرض المحمل فقط للطلاب عند أول دخول بالإنترنت وتوفر الاتصال
    if (isStudent && isOnline() && !isDataPreloaded()) {
      setShowPreloader(true);
      startPreloading();
    }
  }, [isStudent]);

  // إذا انقطع الإنترنت أثناء التحميل، إخفاء المحمل والسماح بالاستمرار
  useEffect(() => {
    const handleOffline = () => {
      if (isPreloading) {
        console.warn('[DataPreloader] انقطع الإنترنت أثناء التحميل - إيقاف المحمل');
        setIsPreloading(false);
        setShowPreloader(false);
      }
    };
    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, [isPreloading]);

  const startPreloading = async () => {
    setIsPreloading(true);
    setMessage('جاري تجهيز التطبيق للاستخدام بدون إنترنت...');
    setProgress(10);

    try {
      // تحميل الصفوف
      setMessage('تحميل الصفوف الدراسية...');
      setProgress(20);
      const classes = await studentApi.getClasses();
      
      let totalSteps = classes.length * 2; // مواد + دروس لكل صف
      let currentStep = 0;

      // تحميل المواد والدروس لكل صف
      for (const cls of classes) {
        setMessage(`تحميل مواد ${cls.name}...`);
        const subjects = await studentApi.getSubjects(cls.id);
        currentStep++;
        setProgress(20 + (currentStep / totalSteps) * 60);

        for (const subject of subjects) {
          setMessage(`تحميل دروس ${subject.name}...`);
          const lessons = await studentApi.getLessons(subject.id);
          
          // تحميل تفاصيل كل درس لضمان وجودها أوفلاين
          for (const lesson of lessons) {
            await studentApi.getLesson(lesson.id);
          }

          await studentApi.getQuizzes(subject.id);
          
          // تحميل الإشعارات والملاحظات
          if (deviceId) {
            await studentApi.getNotifications();
            await studentApi.getNotes(deviceId);
          }
        }
        currentStep++;
        setProgress(20 + (currentStep / totalSteps) * 60);
      }

      setMessage('اكتمل التجهيز! ✓');
      setProgress(100);
      
      // حفظ علامة اكتمال التحميل
      localStorage.setItem('data_preloaded', 'true');
      localStorage.setItem('data_preloaded_at', new Date().toISOString());

      // إخفاء المحمل بعد ثانيتين
      setTimeout(() => {
        setShowPreloader(false);
      }, 2000);

    } catch (error) {
      console.error('فشل التحميل المسبق:', error);
      setMessage('حدث خطأ في التحميل. يمكنك المتابعة والمحاولة لاحقاً.');
      setTimeout(() => {
        setShowPreloader(false);
      }, 3000);
    } finally {
      setIsPreloading(false);
    }
  };

  if (!showPreloader) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
        <div className="text-center space-y-6">
          {/* أيقونة */}
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            {progress === 100 ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-in zoom-in" />
            ) : (
              <Download className="h-10 w-10 text-primary animate-bounce" />
            )}
          </div>

          {/* العنوان */}
          <div>
            <h3 className="text-2xl font-black text-primary mb-2">
              {progress === 100 ? 'تم التجهيز بنجاح!' : 'تجهيز التطبيق'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {progress === 100 
                ? 'يمكنك الآن استخدام التطبيق بدون إنترنت في أي وقت'
                : 'يتم تحميل جميع البيانات للاستخدام بدون إنترنت'
              }
            </p>
          </div>

          {/* شريط التقدم */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-bold text-primary">
              {Math.round(progress)}%
            </p>
          </div>

          {/* الرسالة */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {isPreloading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span className="font-medium">{message}</span>
          </div>

          {/* ملاحظة */}
          {progress < 100 && (
            <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-2xl text-right">
              <Wifi className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                يرجى عدم إغلاق التطبيق أو قطع الاتصال بالإنترنت حتى اكتمال التجهيز
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
