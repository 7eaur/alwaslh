import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccess } from '@/context/AccessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Key, Loader2, ChevronLeft, Info, Lock } from 'lucide-react';
import Footer from '@/components/common/Footer';
import { InitialSync } from '@/components/InitialSync';

const StudentCodeLogin: React.FC = () => {
  const {
    enterWithCode,
    setRecoveryPassword,
    verifyRecoveryPassword,
    isStudent,
    loading: accessLoading,
    flowState,
    pendingCode,
    resetActivation,
  } = useAccess();
  const { toast } = useToast();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInitialSync, setShowInitialSync] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (accessLoading || !isStudent) return;
    const goToDashboard = async () => {
      const { isInitialSyncComplete } = await import('@/lib/offline-db');
      const isComplete = await isInitialSyncComplete();
      if (isComplete) {
        navigate('/student/dashboard', { replace: true });
      } else {
        setShowInitialSync(true);
      }
    };
    goToDashboard();
  }, [accessLoading, isStudent, navigate]);

  const [inIframe] = React.useState(() => {
    try { return window.self !== window.top; } catch { return true; }
  });

  useEffect(() => {
    const el = document.getElementById('student-build-version');
    if (el && (window as any).__APP_BUILD_ID) {
      el.textContent = `Build: ${(window as any).__APP_BUILD_ID}`;
    }
  }, []);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast({ variant: 'destructive', title: 'كود غير صالح', description: 'الكود يجب أن يكون 6 أرقام' });
      return;
    }
    setIsSubmitting(true);
    try {
      await enterWithCode(code);
      toast({ title: 'تم التحقق', description: 'تم التحقق من الكود' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'الكود غير صالح' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      toast({ variant: 'destructive', title: 'كلمة المرور قصيرة', description: 'كلمة المرور يجب أن تكون 4 أرقام على الأقل' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'كلمة المرور غير متطابقة', description: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    setIsSubmitting(true);
    try {
      await setRecoveryPassword(password);
      toast({ title: 'تم إنشاء الحساب', description: 'تم إنشاء الحساب بنجاح' });
      const { isInitialSyncComplete } = await import('@/lib/offline-db');
      const isComplete = await isInitialSyncComplete();
      if (isComplete) navigate('/student/dashboard', { replace: true });
      else setShowInitialSync(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'فشل إنشاء الحساب', description: err.message || 'فشل إنشاء الحساب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      toast({ variant: 'destructive', title: 'كلمة المرور قصيرة', description: 'كلمة المرور يجب أن تكون 4 أرقام على الأقل' });
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyRecoveryPassword(password);
      toast({ title: 'تم تسجيل الدخول', description: 'تم تسجيل الدخول بنجاح' });
      const { isInitialSyncComplete } = await import('@/lib/offline-db');
      const isComplete = await isInitialSyncComplete();
      if (isComplete) navigate('/student/dashboard', { replace: true });
      else setShowInitialSync(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'كلمة المرور غير صحيحة', description: err.message || 'كلمة المرور غير صحيحة' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value.replace(/\D/g, '').slice(0, 12));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 12));
  };

  if (showInitialSync) {
    return <InitialSync onComplete={() => navigate('/student/dashboard')} studentCode={pendingCode || code} />;
  }

  if (accessLoading || flowState === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-primary items-center justify-center px-6">
        <Loader2 className="h-10 w-10 text-white animate-spin" />
        <p className="text-white/90 mt-4 font-bold text-center">جاري التحقق من الجهاز...</p>
        <p className="text-white/70 mt-2 text-sm text-center">قد يستغرق بضع ثوانٍ حسب سرعة الإنترنت.</p>
        {showSkip && (
          <Button
            type="button"
            variant="secondary"
            className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold"
            onClick={() => resetActivation()}
          >
            إدخال الكود يدوياً
          </Button>
        )}
      </div>
    );
  }

  const renderForm = () => {
    if (flowState === 'needs_password_creation') {
      return (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block text-right">
              أنشئ كلمة مرور للدخول
            </label>
            <Input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="\d*"
              placeholder="أدخل كلمة المرور..."
              value={password}
              onChange={handlePasswordChange}
              className="h-14 text-center text-2xl tracking-[0.3em] font-black border-2 border-primary/20 focus:border-primary rounded-xl bg-primary/5 transition-colors"
              disabled={isSubmitting}
              autoFocus
              dir="ltr"
            />
            <Input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              placeholder="أعد إدخال كلمة المرور..."
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="h-14 text-center text-2xl tracking-[0.3em] font-black border-2 border-primary/20 focus:border-primary rounded-xl bg-primary/5 transition-colors"
              disabled={isSubmitting}
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground text-center">
              احفظها جيداً؛ تُستخدم لإعادة الدخول من هذا الجهاز فقط
            </p>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-primary"
            disabled={isSubmitting || password.length < 4 || password !== confirmPassword}
          >
            {isSubmitting ? (
              <><Loader2 className="ml-2 h-5 w-5 animate-spin" /> جاري الحفظ...</>
            ) : (
              <><ChevronLeft className="ml-2 h-5 w-5" /> إنشاء الحساب</>
            )}
          </Button>
        </form>
      );
    }

    if (flowState === 'needs_password') {
      return (
        <form onSubmit={handleVerifyPassword} className="space-y-4">
          <div className="space-y-2">
            {pendingCode && (
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-2 text-center">
                <span className="text-xs text-muted-foreground">الجهاز مرتبط بالكود</span>
                <div className="font-black text-lg tracking-[0.2em] text-primary" dir="ltr">{pendingCode}</div>
              </div>
            )}
            <label className="text-sm font-medium text-foreground block text-right">
              أدخل كلمة المرور
            </label>
            <Input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="\d*"
              placeholder="كلمة المرور..."
              value={password}
              onChange={handlePasswordChange}
              className="h-14 text-center text-2xl tracking-[0.3em] font-black border-2 border-primary/20 focus:border-primary rounded-xl bg-primary/5 transition-colors"
              disabled={isSubmitting}
              autoFocus
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground text-center">
              أدخل كلمة المرور الخاصة بهذا الجهاز للدخول
            </p>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-primary"
            disabled={isSubmitting || password.length < 4}
          >
            {isSubmitting ? (
              <><Loader2 className="ml-2 h-5 w-5 animate-spin" /> جاري الدخول...</>
            ) : (
              <><ChevronLeft className="ml-2 h-5 w-5" /> تسجيل الدخول</>
            )}
          </Button>
          {pendingCode && (
            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 text-sm text-muted-foreground hover:text-primary"
              onClick={() => {
                setCode('');
                setPassword('');
                resetActivation();
              }}
              disabled={isSubmitting}
            >
              استخدام كود تفعيل آخر
            </Button>
          )}
        </form>
      );
    }

    return (
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block text-right">كود التفعيل</label>
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            placeholder="أدخل الكود هنا..."
            value={code}
            onChange={handleCodeChange}
            className="h-14 text-center text-2xl tracking-[0.4em] font-black border-2 border-primary/20 focus:border-primary rounded-xl bg-primary/5 transition-colors"
            disabled={isSubmitting}
            autoFocus
            dir="ltr"
          />
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-bold bg-emerald-50 border-emerald-200 text-emerald-600">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>كود وصول كامل</span>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-primary"
          disabled={isSubmitting || code.length !== 6}
        >
          {isSubmitting ? (
            <><Loader2 className="ml-2 h-5 w-5 animate-spin" /> جاري التحقق...</>
          ) : (
            <><ChevronLeft className="ml-2 h-5 w-5" /> متابعة</>
          )}
        </Button>
        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 space-y-2">
          <p className="text-xs font-bold text-muted-foreground text-center flex items-center justify-center gap-1">
            <Info className="h-3.5 w-3.5" /> تعليمات
          </p>
          <p className="text-xs text-muted-foreground text-center">
            أدخل كود التفعيل 6 أرقام لإنشاء حسابك، ثم أنشئ كلمة مرور للدخول لاحقاً.
          </p>
        </div>
      </form>
    );
  };

  const titleText =
    flowState === 'needs_password_creation'
      ? 'إنشاء كلمة مرور'
      : flowState === 'needs_password'
      ? 'تسجيل الدخول'
      : 'إدخال كود التفعيل';

  const subtitleText =
    flowState === 'needs_password_creation'
      ? 'أنشئ كلمة مرور خاصة بك للدخول من هذا الجهاز'
      : flowState === 'needs_password'
      ? 'أدخل كلمة المرور الخاصة بحسابك'
      : 'الوسيله التفاعلية الأولى في اليمن';

  return (
    <div className="flex flex-col min-h-screen bg-primary arabic-font relative overflow-x-hidden">
      <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4 z-10">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl border-4 border-white/30 overflow-hidden scale-110">
          <img
            src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-black text-white mb-1 drop-shadow-md">الوسيلة الذكية</h1>
        <p className="text-white/90 text-base font-bold text-center">{subtitleText}</p>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 relative z-20">
        <Card className="w-full max-w-[340px] bg-white shadow-2xl rounded-3xl border-none animate-fade-in">
          <CardHeader className="text-center pt-6 pb-2 px-6">
            <div className="mx-auto mb-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#f0f9f9] text-primary gap-2 border border-primary/10">
              <Key className="h-5 w-5" />
              <span className="font-bold text-lg">{titleText}</span>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {inIframe && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                يبدو أنك تفتح التطبيق داخل معاينة المنصة. افتح الرابط المنشور في متصفح الجهاز مباشرة.
              </div>
            )}
            {renderForm()}
            <div className="pt-1 text-center">
              <span className="text-[10px] text-muted-foreground/60" id="student-build-version"></span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-8 pb-4 z-0">
        <Footer />
      </div>

      <div className="pb-8 z-10 flex justify-center">
        <button
          type="button"
          onClick={() => navigate('/admin-login')}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white underline underline-offset-2 transition-colors"
          aria-label="دخول المدير"
        >
          <Lock className="h-3 w-3" />
          دخول المدير
        </button>
      </div>

      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
    </div>
  );
};

export default StudentCodeLogin;
