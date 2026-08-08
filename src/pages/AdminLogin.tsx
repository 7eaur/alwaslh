import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/db/supabase';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, Loader2, ChevronRight, Settings, Eye, EyeOff } from 'lucide-react';
import Footer from '@/components/common/Footer';

const AdminLogin: React.FC = () => {
  const [adminCode, setAdminCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginAdminWithCode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [inIframe] = React.useState(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  });

  // عرض إصدار التطبيق للتأكد من نشر التعديلات
  React.useEffect(() => {
    const el = document.getElementById('admin-build-version');
    if (el && (window as any).__APP_BUILD_ID) {
      el.textContent = `Build: ${(window as any).__APP_BUILD_ID}`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode) return;

    setIsSubmitting(true);
    try {
      await loginAdminWithCode(adminCode);
      toast({
        title: "تم الدخول بنجاح",
        description: "مرحباً بك في لوحة تحكم المدير",
      });
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "فشل الدخول",
        description: err.message || "رمز دخول غير صحيح",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary arabic-font relative overflow-x-hidden">
      {/* Top Header Section with Teal Background */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4 z-10">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl border-4 border-white/30 overflow-hidden scale-110">
          <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-black text-white mb-1 drop-shadow-md">دخول المدير</h1>
        <p className="text-white/90 text-base font-bold">أدخل رمز دخول المدير للوصول</p>
      </div>

      {/* Login Card Section */}
      <div className="flex-1 flex flex-col items-center px-4 pt-8 relative z-20">
        <Card className="w-full max-w-[340px] bg-white shadow-2xl rounded-3xl border-none animate-fade-in">
          <CardContent className="p-8">
            {inIframe && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
                يبدو أنك تفتح التطبيق داخل معاينة المنصة. افتح الرابط المنشور في متصفح الجهاز مباشرة للحصول على أفضل تجربة.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="adminCode" className="text-base font-bold text-primary mr-1">رمز الدخول للمدير</label>
                <div className="relative group">
                  <Input
                    id="adminCode"
                    type={showCode ? "text" : "password"}
                    placeholder="رمز الدخول"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="h-12 pr-10 pl-10 border-2 border-muted focus:border-primary rounded-xl bg-muted/10 group-focus-within:bg-white transition-all text-center text-2xl tracking-widest font-bold"
                    disabled={isSubmitting}
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-primary shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "تسجيل الدخول كمدير"
                )}
              </Button>
              
              <div className="pt-3 flex justify-center border-t border-dashed">
                <Button 
                  variant="ghost" 
                  className="text-primary hover:bg-primary/5 text-sm font-bold h-10 rounded-xl"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  الرجوع للرئيسية
                </Button>
              </div>
              
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if ('__deepClean' in window && typeof (window as any).__deepClean === 'function') {
                      (window as any).__deepClean();
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive underline"
                >
                  مسح الكاش وإعادة التحميل
                </button>
              </div>
              <div className="pt-1 text-center">
                <span className="text-[10px] text-muted-foreground/60" id="admin-build-version"></span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="pb-12 pt-8 z-0">
        <Footer />
      </div>
      
      <style>{`
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
