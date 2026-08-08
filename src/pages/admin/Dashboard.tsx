import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Layers, BookOpen, Key, Users, Bell, TrendingUp, Settings, Loader2, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    classes: 0,
    subjects: 0,
    lessons: 0,
    codes: 0,
    usedCodes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminCode, setAdminCode] = useState('');
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 بدء تحميل لوحة التحكم...');
      const startTime = Date.now();
      try {
        // استخدام COUNT queries بدلاً من تحميل كل البيانات
        const [classesCount, subjectsCount, lessonsCount, codesData, code] = await Promise.all([
          supabase.from('classes').select('*', { count: 'exact', head: true }),
          supabase.from('subjects').select('*', { count: 'exact', head: true }),
          supabase.from('lessons').select('*', { count: 'exact', head: true }),
          adminApi.getAccessCodes(),
          adminApi.getAdminCode(),
        ]);

        const loadTime = Date.now() - startTime;
        console.log(`✅ تم تحميل لوحة التحكم في ${loadTime}ms`, {
          classes: classesCount.count || 0,
          subjects: subjectsCount.count || 0,
          lessons: lessonsCount.count || 0,
          codes: codesData.length,
          usedCodes: codesData.filter(c => c.is_used).length,
        });

        setStats({
          classes: classesCount.count || 0,
          subjects: subjectsCount.count || 0,
          lessons: lessonsCount.count || 0,
          codes: codesData.length,
          usedCodes: codesData.filter(c => c.is_used).length,
        });
        setAdminCode(code || '');
      } catch (err) {
        console.error('❌ خطأ في تحميل لوحة التحكم:', err);
        toast({
          variant: 'destructive',
          title: 'خطأ في تحميل البيانات',
          description: 'فشل تحميل بيانات لوحة التحكم، يرجى إعادة تحميل الصفحة',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateCode = async () => {
    if (!adminCode) return;
    setIsUpdatingCode(true);
    try {
      await adminApi.updateAdminCode(adminCode);
      toast({ title: 'تم التحديث', description: 'تم تغيير رمز دخول المدير بنجاح' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'فشل التحديث', description: err.message });
    } finally {
      setIsUpdatingCode(false);
    }
  };

  const statCards = [
    { title: 'الصفوف الدراسية', value: stats.classes, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'المواد الدراسية', value: stats.subjects, icon: BookOpen, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'الدروس المضافة', value: stats.lessons, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'أكواد التفعيل', value: stats.codes, icon: Key, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'أكواد مستخدمة', value: stats.usedCodes, icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <AdminLayout title="لوحة التحكم">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl bg-muted" />
          ))
        ) : (
          statCards.map((card, i) => (
            <Card key={i} className="border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`${card.bg} ${card.color} p-1.5 rounded-lg`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold text-primary">{card.value}</div>
                <p className="text-[8px] text-muted-foreground mt-0.5">تحديث قبل لحظات</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 py-3 px-4">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <Bell className="h-4 w-4" />
              أحدث التنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {loading ? (
                 <div className="p-4 space-y-3">
                    <Skeleton className="h-3 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                 </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground italic">لا توجد تنبيهات حالية</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
           <CardHeader className="bg-secondary/5 border-b border-secondary/10 py-3 px-4">
             <CardTitle className="text-base flex items-center gap-2 text-secondary">
               <TrendingUp className="h-4 w-4" />
               النشاط الأخير
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6 text-center text-xs text-muted-foreground italic">
              سيتم عرض آخر الإضافات هنا بمجرد البدء في رفع الدروس
           </CardContent>
        </Card>

        {/* Change Admin Code Card */}
        <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden lg:col-span-2">
           <CardHeader className="bg-primary/5 border-b border-primary/10 py-3 px-4">
             <CardTitle className="text-base flex items-center gap-2 text-primary">
               <Settings className="h-4 w-4" />
               إعدادات المدير
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-end gap-3 max-w-lg">
                 <div className="flex-1 space-y-1.5 w-full">
                    <label className="text-xs font-medium text-muted-foreground">تغيير رمز دخول المدير</label>
                    <Input 
                      type="text" 
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="h-10 rounded-lg text-center text-lg font-bold tracking-widest"
                    />
                 </div>
                 <Button 
                   onClick={handleUpdateCode} 
                   disabled={isUpdatingCode || loading}
                   className="h-10 rounded-lg px-6 gap-2 w-full md:w-auto text-sm"
                 >
                   {isUpdatingCode ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                   حفظ الرمز الجديد
                 </Button>
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">
                 هذا الرمز يُستخدم للدخول إلى لوحة التحكم. الرمز الافتراضي هو 732742752
              </p>
           </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
