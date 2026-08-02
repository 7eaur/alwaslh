import React, { useEffect, useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentApi } from '@/db/api';
import { getStudentIdentifier } from '@/lib/device';
import { useAuth } from '@/context/AuthContext';
import { QuizProgress } from '@/types';

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
  Users,
  HelpCircle,
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    notesCount: 0,
    interactiveAnswered: 0,
    interactiveCorrect: 0,
    interactiveTotal: 0,
    averageScore: 0,
    completionRate: 0,
    completedLessons: 0,
    progressPoints: 0,
  });
  const [progressRecords, setProgressRecords] = useState<QuizProgress[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<QuizProgress | null>(null);
  const [rank, setRank] = useState<RankInfo>({ rank: 0, total: 0, avgScore: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [notes, records, rankInfo] = await Promise.all([
          studentApi.getNotes(studentId),
          studentApi.getQuizProgressRecords(studentId),
          navigator.onLine ? studentApi.getStudentRank(studentId) : Promise.resolve({ rank: 0, total: 0, avgScore: 0 }),
        ]);

        const answered = records.reduce((sum: number, r: QuizProgress) => sum + (r.user_answers?.length || 0), 0);
        const total = records.reduce((sum: number, r: QuizProgress) => sum + (r.total_questions || r.shuffled_questions?.length || 0), 0);
        const correct = records.reduce((sum: number, r: QuizProgress) => {
          const questions = r.shuffled_questions || [];
          return sum + (r.user_answers || []).filter((ans, idx) => ans === questions[idx]?.correct_option_index).length;
        }, 0);
        const completedLessons = records.filter((r: QuizProgress) => r.is_completed).length;
        const avgScore = answered > 0 ? Math.round((correct / answered) * 100) : 0;
        const completionRate = total > 0 ? Math.round((answered / total) * 100) : 0;
        const progressPoints = answered + correct * 2;

        setStats({
          notesCount: notes.length,
          interactiveAnswered: answered,
          interactiveCorrect: correct,
          interactiveTotal: total,
          averageScore: avgScore,
          completionRate: completionRate,
          completedLessons: completedLessons,
          progressPoints: progressPoints,
        });
        setProgressRecords(records);
        setRank(rankInfo);
      } catch (err) {
        console.error('⚠️ [Statistics] خطأ في جلب الإحصائيات:', err);
      } finally {
        setLoading(false);
      }

      // جلب الإنجازات في الخلفية
      try {
        if (navigator.onLine) {
          const userAchievements = await studentApi.getAchievements(studentId);
          setAchievements(userAchievements);
        }
      } catch (secondaryErr) {
        console.error('⚠️ [Statistics] خطأ في جلب الإنجازات:', secondaryErr);
      }
    };

    fetchStats();
  }, [studentId]);

  const statCards = [
    { title: 'الملاحظات', value: stats.notesCount, icon: StickyNote, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'متوسط الدرجات', value: `${stats.averageScore}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'الدروس المنجزة', value: stats.completedLessons, icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-50' },
    { title: 'الأسئلة التفاعلية', value: stats.interactiveAnswered, icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
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
                  <p className="text-sm text-muted-foreground">ابدأ بحل الأسئلة التفاعلية ليظهر ترتيبك</p>
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

        {/* آخر الدروس التفاعلية */}
        {progressRecords.length > 0 && (
          <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-secondary" />
                آخر الدروس التفاعلية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {progressRecords.slice(0, 10).map((record, index) => {
                  const questions = record.shuffled_questions || [];
                  const answered = record.user_answers?.length || 0;
                  const correct = (record.user_answers || []).filter((ans, idx) => ans === questions[idx]?.correct_option_index).length;
                  const total = record.total_questions || questions.length || 0;
                  const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;
                  const completion = total > 0 ? Math.round((answered / total) * 100) : 0;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedRecord(record)}
                      className="w-full text-right p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-primary">درس {index + 1}</span>
                        <span className={cn('text-sm font-black', percentage >= 80 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-red-500')}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{correct} / {answered} صحيحة</span>
                        <span>•</span>
                        <span>إنجاز {completion}%</span>
                        <span>•</span>
                        <span>{new Date(record.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <Progress value={completion} className="h-2 mt-3" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* لا توجد أسئلة تفاعلية */}
        {!loading && progressRecords.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-[40px]">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold text-muted-foreground">لا توجد أسئلة تفاعلية محلولة بعد</p>
            <p className="text-sm text-muted-foreground">ابدأ بحل الأسئلة داخل الدروس لترى تقدمك</p>
          </div>
        )}
      </div>

      {/* تفاصيل الدرس التفاعلي */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-[2rem] arabic-font p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-primary">تفاصيل الدرس التفاعلي</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {new Date(selectedRecord.created_at).toLocaleDateString('ar-SA')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-center gap-4 p-6 rounded-3xl bg-primary/5">
                <div className="text-center">
                  <p className="text-3xl font-black text-primary">{selectedRecord.score}</p>
                  <p className="text-xs text-muted-foreground font-bold">الإجابات الصحيحة</p>
                </div>
                <div className="h-12 w-px bg-primary/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-primary">{selectedRecord.total_questions || selectedRecord.shuffled_questions?.length || 0}</p>
                  <p className="text-xs text-muted-foreground font-bold">إجمالي الأسئلة</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">نسبة الإنجاز</span>
                  <span className="font-black text-sm">
                    {Math.round(stats.completionRate)}%
                  </span>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </StudentLayout>
  );
};

export default StudentStatistics;
