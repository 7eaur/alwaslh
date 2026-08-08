import React, { useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { useAccess, ActivatedClass } from '@/context/AccessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Key, CheckCircle2, Calendar, Loader2, ShieldCheck, BookOpen, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ألوان التدرج لكل صف (تطابق CodeCardExport)
const CLASS_CARD_PALETTES = [
  { bg: 'linear-gradient(135deg,#c62828,#7f0000)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // أحمر
  { bg: 'linear-gradient(135deg,#283593,#1a237e)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // كحلي
  { bg: 'linear-gradient(135deg,#f57c00,#bf360c)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // برتقالي
  { bg: 'linear-gradient(135deg,#2e7d32,#1b5e20)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // أخضر
  { bg: 'linear-gradient(135deg,#D4AC0D,#9A7D0A)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // ذهبي
  { bg: 'linear-gradient(135deg,#8B5E3C,#5C3A1E)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // بني فاتح
  { bg: 'linear-gradient(135deg,#B5835A,#8B6040)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // بيج
  { bg: 'linear-gradient(135deg,#FF69B4,#C2185B)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // زهري
  { bg: 'linear-gradient(135deg,#6a1b9a,#38006b)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // بنفسجي
  { bg: 'linear-gradient(135deg,#1565c0,#0d47a1)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // أزرق
  { bg: 'linear-gradient(135deg,#006064,#004d40)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // تيل
  { bg: 'linear-gradient(135deg,#1A5276,#0D2B3E)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // كحلي داكن
  { bg: 'linear-gradient(135deg,#117A65,#0B5345)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // زمردي
  { bg: 'linear-gradient(135deg,#7D3C98,#4A235A)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // ملكي
  { bg: 'linear-gradient(135deg,#E8630A,#C0390B)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // برتقالي زاهي
  { bg: 'linear-gradient(135deg,#B7950B,#7D6608)',   text: '#fff', badge: 'rgba(255,255,255,0.25)' }, // ذهبي معدني
];

function getCardPalette(key: string) {
  let hash = 0;
  const word = (key || '').trim().split(/\s+/)[0] || key;
  for (let i = 0; i < word.length; i++) hash = (hash * 97 + word.charCodeAt(i)) >>> 0;
  return CLASS_CARD_PALETTES[hash % CLASS_CARD_PALETTES.length];
}

const ActivateNewCode: React.FC = () => {
  const { hasFullAccess, activatedClasses, addClassCode, getRecoveryPassword } = useAccess();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  React.useEffect(() => {
    if (!hasFullAccess) return;
    let cancelled = false;
    setLoadingPassword(true);
    getRecoveryPassword().then(pw => {
      if (!cancelled) setRecoveryPassword(pw);
    }).finally(() => {
      if (!cancelled) setLoadingPassword(false);
    });
    return () => { cancelled = true; };
  }, [hasFullAccess, getRecoveryPassword]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error('يرجى إدخال الكود');
      return;
    }
    if (!/^\d{7}$/.test(trimmed)) {
      toast.error('كود الصف يجب أن يكون 7 أرقام بالضبط');
      return;
    }

    setIsSubmitting(true);
    try {
      const newClass: ActivatedClass = await addClassCode(trimmed);
      toast.success(`تم تفعيل صف "${newClass.className}" بنجاح! 🎉`);
      setCode('');
    } catch (err: any) {
      toast.error(err.message || 'فشل تفعيل الكود');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentLayout title="تفعيل كود جديد" showBack>
      <div className="p-4 space-y-4 pb-20 max-w-lg mx-auto">

        {/* حالة الوصول الكامل */}
        {hasFullAccess && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm">لديك وصول كامل</p>
                  <p className="text-emerald-600 text-xs">يمكنك الوصول لجميع الصفوف والمواد</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/60 border border-emerald-200 p-3">
                <p className="text-xs font-bold text-emerald-800 mb-1.5">كلمة مرور الاسترجاع</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 h-10 px-3 rounded-lg bg-emerald-100/60 flex items-center justify-center font-mono text-emerald-900 font-bold tracking-wider">
                    {loadingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    ) : recoveryPassword ? (
                      showPassword ? recoveryPassword : '••••••••'
                    ) : (
                      <span className="text-xs text-emerald-700">غير متوفرة</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    onClick={() => {
                      if (!recoveryPassword) return;
                      if (!showPassword) {
                        setShowPassword(true);
                      } else {
                        setShowPassword(false);
                      }
                    }}
                    disabled={!recoveryPassword || loadingPassword}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1.5 leading-relaxed">
                  احفظها في مكان آمن؛ تحتاجها عند حذف التطبيق وإعادة تثبيته على نفس الجهاز.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* تنبيه حفظ الكود */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">احتفظ بكود التفعيل</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                يُحفظ الوصول محلياً على جهازك. إذا قمت بحذف بيانات التطبيق أو مسح ذاكرة التخزين،
                قد تحتاج لإعادة إدخال الكود. يُفضل تسجيل الكود في مكان آمن.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* نموذج تفعيل كود صف */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              إضافة كود صف جديد
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              أدخل كود مكون من 7 أرقام لتفعيل صف دراسي إضافي
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivate} className="space-y-3">
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder="أدخل الكود (7 أرقام)"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 7))}
                className="h-12 text-center text-xl tracking-[0.3em] font-black border-2 border-primary/20 focus:border-primary rounded-xl"
                disabled={isSubmitting}
                dir="ltr"
              />
              <Button
                type="submit"
                className="w-full h-11 font-bold rounded-xl"
                disabled={isSubmitting || code.length !== 7}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <Plus className="ml-2 h-4 w-4" />
                    تفعيل الكود
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* قائمة الصفوف المفعّلة */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              الصفوف المفعّلة
              <Badge variant="secondary" className="mr-auto">{activatedClasses.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activatedClasses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد صفوف مفعّلة بعد</p>
                {!hasFullAccess && (
                  <p className="text-xs mt-1">أدخل كود صف لتفعيل محتواه</p>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {activatedClasses.map((cls) => {
                  const palette = getCardPalette(cls.className);
                  return (
                    <div
                      key={cls.classId}
                      className="flex items-center gap-3 rounded-2xl p-4 shadow-md"
                      style={{ background: palette.bg }}
                    >
                      <div className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <CheckCircle2 className="h-6 w-6" style={{ color: palette.text }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base truncate" style={{ color: palette.text }}>{cls.className}</p>
                        <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <Calendar className="h-3 w-3" />
                          <span>
                            ينتهي:{' '}
                            {new Date(cls.expiresAt).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-black px-3 py-1 rounded-full" style={{ background: palette.badge, color: palette.text }}>
                        مفعّل ✓
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default ActivateNewCode;
