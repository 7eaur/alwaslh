import React, { useEffect, useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentApi, adminApi } from '@/db/api';
import { getStudentIdentifier } from '@/lib/device';
import { useAccess } from '@/context/AccessContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/offline-db';
import {
  BarChart3,
  Trophy,
  BookOpen,
  StickyNote,
  Target,
  Zap,
  Award,
  Sparkles,
  XCircle,
  Users
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface RankInfo {
  rank: number;
  total: number;
  avgScore: number;
}

const StudentStatistics: React.FC = () => {
  const auth = useAuth();
  const studentId = auth.user?.id || getStudentIdentifier();
  const { activatedClassIds } = useAccess();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    notesCount: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    lessonsCount: 0,
  });
  const [attempts, setAttempts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [rank, setRank] = useState<RankInfo>({ rank: 0, total: 0, avgScore: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [notes, quizAttempts, rankInfo] = await Promise.all([
          studentApi.getNotes(studentId),
          studentApi.getQuizAttempts(studentId),
          navigator.onLine ? studentApi.getStudentRank(studentId) : Promise.resolve({ rank: 0, total: 0, avgScore: 0 }),
        ]);

        const totalScore = quizAttempts.reduce(
          (acc: number, curr: any) => acc + (curr.score / (curr.total_questions || 1)) * 100,
          0
        );
        const avgScore = quizAttempts.length > 0 ? Math.round(totalScore / quizAttempts.length) : 0;

        setStats((prev) => ({
          ...prev,
          notesCount: notes.length,
          quizzesCompleted: quizAttempts.length,
          averageScore: avgScore,
        }));
        setAttempts(quizAttempts);
        setRank(rankInfo);
      } catch (err) {
        console.error('⚠️ [Statistics] خطأ في جلب الإحصائيات:', err);
      } finally {
        setLoading(false);
      }

      // جلب البيانات الثانوية في الخلفية
      try {
        const [userAchievements, allLessons] = await Promise.all([
          studentApi.getAchievements(studentId),
          navigator.onLine ? adminApi.getLessons() : Promise.resolve([]),
        ]);
        setStats((prev) => ({ ...prev, lessonsCount: allLessons.length }));
        setAchievements(userAchievements);
      } catch (secondaryErr) {
        console.error('⚠️ [Statistics] خطأ في جلب البيانات الثانوية:', secondaryErr);
        try {
          const offlineLessonsCount = await db.lessons.count();
          setStats((prev) => ({ ...prev, lessonsCount: offlineLessonsCount }));
        } catch { /* تجاهل */ }
      }
    };

    fetchStats();
  }, [studentId]);

  const statCards = [
    { title: 'الملاحظات', value: stats.notesCount, icon: StickyNote, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'متوسط الدرجات', value: `${stats.averageScore}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'الدروس المنجزة', value: stats.lessonsCount, icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-50' },
    { title: 'الاختبارات', value: stats.quizzesCompleted, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <StudentLayout title="إحصائياتي">
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              <BarChart3 className="h-9 w-9 text-secondary" />
              لوحة الإنجازات
            </h2>
            <p className="text-white/80 text-base">تابع مسيرتك التعليمية وتحدياتك هنا.</p>
          </div>
          <Zap className="absolute -left-8 -bottom-8 h-48 w-48 text-white/5 -rotate-12" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[32px] bg-muted/50" />)
          ) : (
            statCards.map((stat, i) => (
              <Card key={i} className="border-none shadow-md rounded-[32px] overflow-hidden bg-white animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className={cn('h-14 w-14 rounded-[1.25rem] flex items-center justify-center mb-3 shadow-inner', stat.bg, stat.color)}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <p className="text-2xl font-black text-primary mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* بطاقة الترتيب */}
        <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center text-amber-500">
                <Trophy className="h-10 w-10" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-40 rounded-lg" />
              ) : rank.total > 0 ? (
                <>
                  <div>
                    <p className="text-4xl font-black text-primary mb-1">
                      {rank.rank}<span className="text-2xl text-muted-foreground">/{rank.total}</span>
                    </p>
                    <p className="text-sm font-bold text-muted-foreground">
                      {rank.rank <= 3 ? 'أنت من المتفوقين 🎉' : 'ترتيبك بين الطلاب'}
                    </p>
                  </div>
                  <Badge className="bg-secondary text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    متوسط {rank.avgScore}%
                  </Badge>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-muted-foreground">لم يتم حساب الترتيب بعد</p>
                  <p className="text-sm text-muted-foreground">أكمل اختباراً ليظهر ترتيبك</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* الإنجازات */}
        {achievements.length > 0 && (
          <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                <Award className="h-6 w-6 text-secondary" />
                إنجازاتي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/5">
                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-primary">{achievement.title || 'إنجاز جديد'}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.quizzes?.title || ''}
                        {achievement.created_at && new Date(achievement.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full text-xs font-bold">{achievement.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* آخر الاختبارات */}
        {attempts.length > 0 && (
          <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-secondary" />
                آخر الاختبارات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {attempts.slice(0, 10).map((attempt, index) => {
                  const percentage = attempt.total_questions ? Math.round((attempt.score / attempt.total_questions) * 100) : 0;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedAttempt(attempt)}
                      className="w-full text-right p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-primary">اختبار {index + 1}</span>
                        <span className={cn('text-sm font-black', percentage >= 80 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-red-500')}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{attempt.score} / {attempt.total_questions}</span>
                        <span>•</span>
                        <span>{new Date(attempt.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <Progress value={percentage} className="h-2 mt-3" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* لا توجد اختبارات */}
        {!loading && attempts.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-[40px]">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold text-muted-foreground">لا توجد اختبارات مكتملة بعد</p>
            <p className="text-sm text-muted-foreground">ابدأ بحل اختبار لترى تقدمك</p>
          </div>
        )}
      </div>

      {/* تفاصيل الاختبار */}
      <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-[2rem] arabic-font p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary">تفاصيل الاختبار</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {new Date(selectedAttempt?.created_at).toLocaleDateString('ar-SA')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-center gap-4 p-6 rounded-3xl bg-primary/5">
              <div className="text-center">
                <p className="text-3xl font-black text-primary">{selectedAttempt?.score}</p>
                <p className="text-xs text-muted-foreground font-bold">الإجابات الصحيحة</p>
              </div>
              <div className="h-12 w-px bg-primary/20" />
              <div className="text-center">
                <p className="text-3xl font-black text-primary">{selectedAttempt?.total_questions}</p>
                <p className="text-xs text-muted-foreground font-bold">إجمالي الأسئلة</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">النسبة</span>
                <span className="font-black text-sm">{selectedAttempt?.total_questions ? Math.round((selectedAttempt.score / selectedAttempt.total_questions) * 100) : 0}%</span>
              </div>
              <Progress
                value={selectedAttempt?.total_questions ? Math.round((selectedAttempt.score / selectedAttempt.total_questions) * 100) : 0}
                className="h-3"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
};

export default StudentStatistics;
