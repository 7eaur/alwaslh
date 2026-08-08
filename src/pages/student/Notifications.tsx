import React, { useEffect, useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent } from '@/components/ui/card';
import { studentApi } from '@/db/api';
import { Notification } from '@/types';
import { 
  Bell, 
  Calendar,
  Search,
  ChevronLeft,
  BellOff,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getCache, setCache } from '@/lib/offline-cache';

const NOTIF_CACHE_KEY = 'student_notifications';

const StudentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    // ① عرض من الكاش فوراً بدون انتظار الشبكة
    const cached = getCache<Notification[]>(NOTIF_CACHE_KEY);
    if (cached && cached.length > 0) {
      setNotifications(cached);
      setLoading(false);
    }

    // ② إذا لا إنترنت → اكتفِ بالكاش
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      const data = await studentApi.getNotifications();
      setNotifications(data);
      setCache(NOTIF_CACHE_KEY, data);
    } catch (err) {
      console.warn('⚠️ [Notifications] فشل جلب التنبيهات، يُعرض من الكاش');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // تحديث تلقائي كل دقيقتين فقط أثناء نشاط التطبيق (لتوفير البيانات والبطارية)
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (!interval) interval = setInterval(fetchData, 120000); };
    const stop = () => { if (interval) { clearInterval(interval); interval = null; } };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StudentLayout title="التنبيهات" showBack>
      <div className="relative mb-8 animate-fade-in">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="البحث في التنبيهات..." 
          className="h-14 pr-10 rounded-2xl bg-white shadow-md border-primary/10 focus:border-primary transition-all text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl bg-muted" />
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
             <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                <BellOff className="h-12 w-12 text-muted-foreground opacity-20" />
             </div>
             <p className="text-xl font-bold text-muted-foreground mb-2">لا توجد تنبيهات جديدة</p>
             <p className="text-sm text-muted-foreground">سنقوم بإخطارك عندما تكون هناك تحديثات جديدة.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredNotifications.map((n, i) => (
              <Card 
                key={n.id} 
                className="group border-none shadow-md hover:shadow-xl transition-all rounded-3xl overflow-hidden bg-white animate-slide-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <MessageSquare className="h-7 w-7" />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-bold text-xl text-primary leading-tight">{n.title}</h3>
                           <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-100 shadow-sm">
                              <Sparkles className="h-3 w-3" />
                              تنبيه هام
                           </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                          {n.message}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-dashed pt-4">
                           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                              <Calendar className="h-4 w-4" />
                              {new Date(n.created_at).toLocaleString('ar-SA')}
                           </div>
                           <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                              <ChevronLeft className="h-5 w-5" />
                           </div>
                        </div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentNotifications;
