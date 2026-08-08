import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Layers, 
  BookOpen, 
  FileQuestion, 
  Key, 
  Bell,
  Home,
  FileText,
  Settings,
  Sparkles
} from 'lucide-react';

interface OnboardingProps {
  type: 'admin' | 'student';
}

const Onboarding: React.FC<OnboardingProps> = ({ type }) => {
  const { profile, updateProfileFlag } = useAuth();
  const [open, setOpen] = useState(false);
  const storageKey = `has_seen_onboarding_${type}`;

  useEffect(() => {
    // حالة العرض في حساب الطالب أولوية على التخزين المحلي
    if (profile?.tutorial_shown) {
      setOpen(false);
      return;
    }
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setOpen(true);
    }
  }, [storageKey, profile?.tutorial_shown]);

  const handleClose = () => {
    localStorage.setItem(storageKey, 'true');
    if (profile && type === 'student') {
      updateProfileFlag('tutorial_shown', true);
    }
    setOpen(false);
  };

  const adminIcons = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', desc: 'نظرة عامة على إحصائيات النظام والنشاط الأخير.' },
    { icon: Layers, label: 'الصفوف والمواد', desc: 'إدارة الصفوف الدراسية والمواد التابعة لها.' },
    { icon: BookOpen, label: 'إدارة الدروس', desc: 'رفع الدروس (PDF/صور) وتنظيمها بعناوين ذكية.' },
    { icon: FileQuestion, label: 'الاختبارات التفاعلية', desc: 'توليد اختبارات ذكية باستخدام الذكاء الاصطناعي.' },
    { icon: Key, label: 'أكواد التفعيل', desc: 'توليد وإدارة الأكواد السبعة للطلاب وتتبع استخدامها.' },
    { icon: Bell, label: 'الإشعارات', desc: 'إرسال تنبيهات للطلاب حول التحديثات أو الدروس الجديدة.' },
  ];

  const studentIcons = [
    { icon: Home, label: 'الرئيسية', desc: 'الوصول السريع للمواد الدراسية وآخر التحديثات.' },
    { icon: BookOpen, label: 'قاموسي', desc: 'تصفح الدروس والمحتوى التعليمي الخاص بصفك.' },
    { icon: FileQuestion, label: 'الاختبارات التفاعلية', desc: 'اختبر معلوماتك مع أسئلة ذكية يتم توليدها آلياً.' },
    { icon: FileText, label: 'ملاحظاتي', desc: 'مكان لحفظ ملاحظاتك الشخصية لكل درس.' },
    { icon: Settings, label: 'الإعدادات', desc: 'إدارة حسابك والتفضيلات الشخصية.' },
  ];

  const icons = type === 'admin' ? adminIcons : studentIcons;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto rounded-3xl arabic-font p-8 border-none shadow-2xl">
        <DialogHeader className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-black text-primary">مرحباً بك في الوسيلة الذكية! 🎉</DialogTitle>
          <DialogDescription className="text-lg">إليك شرح سريع للأيقونات والميزات المتاحة لك:</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {icons.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/5 hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
              <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-primary">{item.label}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-8">
          <Button onClick={handleClose} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg">
            ابدأ الاستخدام الآن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;
