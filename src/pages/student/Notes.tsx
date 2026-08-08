import React, { useEffect, useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent } from '@/components/ui/card';
import { studentApi, savedQuestionsApi } from '@/db/api';
import { StudentNote } from '@/types';
import { 
  FileText, 
  Search, 
  ChevronLeft,
  Calendar,
  BookOpen,
  StickyNote,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  Mic,
  Sparkles,
  PlayCircle,
  Bookmark,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getStudentIdentifier } from '@/lib/device';
import { getCache, setCache } from '@/lib/offline-cache';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';

const StudentNotes: React.FC = () => {
  const [notes, setNotes] = useState<(StudentNote & { lessons: { title: string } })[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'saved'>('notes');
  const deviceId = getStudentIdentifier();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchNotes = async () => {
    // ① عرض الملاحظات من الكاش الصحيح فوراً (نفس المفتاح الذي تستخدمه cachedApiCall)
    const cached = getCache<any[]>(`student_notes_${deviceId}`);
    if (cached && cached.length > 0) setNotes(cached);

    // ② تحديث من السيرفر في الخلفية
    if (!navigator.onLine) { setLoading(false); return; }
    try {
      const data = await studentApi.getNotes(deviceId);
      setNotes(data);
      setCache(`student_notes_${deviceId}`, data);
    } catch (err) {
      console.warn('⚠️ [Notes] فشل التحديث من السيرفر، تم الاحتفاظ بالبيانات المحلية');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedQuestions = async () => {
    const CACHE_KEY = `saved_questions_student_${deviceId}`;
    // ① عرض الأسئلة المحفوظة من الكاش فوراً
    const cached = getCache<any[]>(CACHE_KEY);
    if (cached && cached.length > 0) setSavedQuestions(cached);

    // ② تحديث من السيرفر في الخلفية
    if (!navigator.onLine) return;
    try {
      const data = await savedQuestionsApi.getSavedQuestions();
      setSavedQuestions(data);
    } catch (err) {
      console.warn('⚠️ [SavedQuestions] فشل التحديث من السيرفر، تم الاحتفاظ بالبيانات المحلية');
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchNotes(), fetchSavedQuestions()]);
    };
    init();
  }, [deviceId]);

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;
    try {
      await studentApi.deleteNote(id);
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      setCache(`student_notes_${deviceId}`, updated);
      toast({ title: 'تم الحذف', description: 'تم حذف الملاحظة بنجاح' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في الحذف' });
    }
  };

  const handleDeleteSavedQuestion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذا السؤال المحفوظ؟')) return;
    try {
      await savedQuestionsApi.deleteSavedQuestion(id);
      const updated = savedQuestions.filter(q => q.id !== id);
      setSavedQuestions(updated);
      setCache(`saved_questions_student_${deviceId}`, updated);
      toast({ title: 'تم الحذف', description: 'تم حذف السؤال المحفوظ بنجاح' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في الحذف' });
    }
  };

  const startEditing = (note: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNote(note);
    setNewContent(note.content);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newContent) return;
    setIsProcessing(true);
    try {
      await studentApi.updateNote(editingNote.id, { content: newContent });
      toast({ title: 'تم التحديث', description: 'تم تحديث الملاحظة بنجاح' });
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في التحديث' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.lessons?.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (n.content?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (n.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const noteColors = [
    { bg: 'bg-emerald-50/50', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', accent: 'text-emerald-700 bg-emerald-100/50' },
    { bg: 'bg-blue-50/50', border: 'border-blue-100', icon: 'bg-blue-100 text-blue-600', accent: 'text-blue-700 bg-blue-100/50' },
    { bg: 'bg-rose-50/50', border: 'border-rose-100', icon: 'bg-rose-100 text-rose-600', accent: 'text-rose-700 bg-rose-100/50' },
    { bg: 'bg-violet-50/50', border: 'border-violet-100', icon: 'bg-violet-100 text-violet-600', accent: 'text-violet-700 bg-violet-100/50' },
    { bg: 'bg-amber-50/50', border: 'border-amber-100', icon: 'bg-amber-100 text-amber-600', accent: 'text-amber-700 bg-amber-100/50' },
  ];

  return (
    <StudentLayout title="ملاحظاتي" showBack>
      {/* Tabs */}
      <div className="flex gap-3 mb-8 p-2 bg-white rounded-3xl shadow-md">
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "flex-1 h-14 rounded-2xl font-black text-lg transition-all",
            activeTab === 'notes' 
              ? "bg-primary text-white shadow-lg shadow-primary/30" 
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <StickyNote className="h-5 w-5" />
            ملاحظاتي
          </div>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={cn(
            "flex-1 h-14 rounded-2xl font-black text-lg transition-all",
            activeTab === 'saved' 
              ? "bg-primary text-white shadow-lg shadow-primary/30" 
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Bookmark className="h-5 w-5" />
            محفوظاتي
          </div>
        </button>
      </div>

      {activeTab === 'notes' ? (
        <>
          <div className="relative mb-8 animate-fade-in">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="البحث في الملاحظات..." 
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
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
             <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <StickyNote className="h-12 w-12 text-blue-500 opacity-20" />
             </div>
             <p className="text-xl font-bold text-blue-900 mb-2">لا توجد ملاحظات محفوظة</p>
             <p className="text-sm text-muted-foreground">أضف ملاحظاتك المهمة والخاصة بك مع ميزة نوع الملاحظة (نص - صور - صوت) من داخل صفحة الدرس.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredNotes.map((note, i) => {
              const color = noteColors[i % noteColors.length];
              return (
                <Card 
                  key={note.id} 
                  className={cn(
                    "group cursor-pointer border-2 shadow-sm hover:shadow-xl transition-all rounded-[32px] overflow-hidden animate-slide-in",
                    color.bg,
                    color.border
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => navigate(`/student/lessons/${note.lesson_id}`)}
                >
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", color.icon)}>
                             <BookOpen className="h-7 w-7" />
                          </div>
                          <div>
                             <h3 className="font-bold text-2xl text-primary leading-tight line-clamp-1">{note.lessons.title}</h3>
                             <div className="flex flex-wrap items-center gap-3 mt-2">
                                <div className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                   <Calendar className="h-3.5 w-3.5" />
                                   {new Date(note.created_at).toLocaleDateString('ar-SA')}
                                </div>
                                <div className="h-4 w-px bg-muted/50 hidden sm:block" />
                                <Badge variant="secondary" className="text-[10px] font-bold bg-white/50 text-primary border-primary/10">
                                   {note.type === 'text' && 'ملاحظة نصية'}
                                   {note.type === 'image' && 'صورة مرفقة'}
                                   {note.type === 'audio' && 'تسجيل صوتي'}
                                   {note.type === 'voice_record' && 'تسجيل صوتي مباشر'}
                                </Badge>
                             </div>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          {note.type === 'text' && (
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-10 w-10 rounded-full bg-white/50 text-blue-600 hover:bg-white hover:text-blue-700 transition-all border border-blue-100"
                               onClick={(e) => startEditing(note, e)}
                             >
                                <Edit3 className="h-4 w-4" />
                             </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-full bg-white/50 text-rose-600 hover:bg-white hover:text-rose-700 transition-all border border-rose-100"
                            onClick={(e) => handleDeleteNote(note.id, e)}
                          >
                             <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-primary/10">
                             <ChevronLeft className="h-5 w-5" />
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/50 min-h-[120px] shadow-inner">
                      {note.type === 'text' ? (
                        <p className="text-lg leading-relaxed text-muted-foreground italic">{note.content}</p>
                      ) : (
                        <div className="space-y-6">
                           {note.type === 'image' && note.media_url && (
                             <div className="relative group/img rounded-2xl overflow-hidden border-4 border-white shadow-xl max-w-sm mx-auto">
                                <img src={note.media_url} alt="Note Attachment" className="w-full h-auto object-cover max-h-60" />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                   <Button variant="secondary" size="sm" className="rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); window.open(note.media_url, '_blank'); }}>
                                      عرض الصورة كاملة
                                   </Button>
                                </div>
                             </div>
                           )}
                           
                           {note.type === 'audio' && note.media_url && (
                             <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-primary/5 shadow-md max-w-sm mx-auto">
                                <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                                   <Mic className="h-6 w-6" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                   <p className="text-xs font-bold text-primary truncate mb-2">تسجيل صوتي</p>
                                   <audio src={note.media_url} controls className="h-8 w-full" />
                                </div>
                             </div>
                           )}

                           {note.description && (
                             <div className="p-4 bg-primary/5 rounded-2xl border-r-4 border-primary/20">
                                <p className="text-sm font-bold text-primary/80 mb-1 flex items-center gap-2">
                                   <Sparkles className="h-3.5 w-3.5" />
                                   البيان التوضيحي:
                                </p>
                                <p className="text-muted-foreground leading-relaxed italic">{note.description}</p>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                       <span className={cn("text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border", color.accent)}>
                          ملاحظة محفوظة
                       </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </>
      ) : (
        /* Saved Questions Tab */
        <div className="space-y-6">
          {savedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Bookmark className="h-12 w-12 text-primary opacity-20" />
              </div>
              <p className="text-xl font-bold text-primary mb-2">لا توجد أسئلة محفوظة</p>
              <p className="text-sm text-muted-foreground mb-4">احفظ الأسئلة المهمة أثناء حل الاختبارات أو مراجعة الدروس لتظهر هنا.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 max-w-md">
                <p className="text-xs text-blue-800 font-bold">💡 كيفية حفظ الأسئلة:</p>
                <p className="text-xs text-blue-700 mt-2">اضغط على أيقونة الحفظ (🔖) بجانب أي سؤال في صفحة الدرس أو الاختبار، وسيظهر هنا تلقائياً.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {savedQuestions.map((item, i) => (
                <Card 
                  key={item.id}
                  className="group border-2 border-primary/10 shadow-sm hover:shadow-xl transition-all rounded-[32px] overflow-hidden animate-slide-in bg-white"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                          <Bookmark className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-primary mb-1">سؤال محفوظ</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.saved_at).toLocaleDateString('ar-SA', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        onClick={(e) => handleDeleteSavedQuestion(item.id, e)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Lesson Info */}
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <BookOpen className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-blue-900">{item.lessons?.title || 'درس غير معروف'}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-blue-600">
                            {item.lessons?.subjects?.classes?.name && (
                              <span className="px-2 py-0.5 bg-blue-100 rounded-lg">{item.lessons.subjects.classes.name}</span>
                            )}
                            {item.lessons?.subjects?.name && (
                              <span className="px-2 py-0.5 bg-blue-100 rounded-lg">{item.lessons.subjects.name}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Question */}
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-lg font-bold text-slate-800 leading-relaxed mb-4">
                          {item.question?.question || 'السؤال غير متوفر'}
                        </p>
                        
                        {item.question?.options && (
                          <div className="space-y-2 mt-4">
                            {item.question.options.map((option: string, idx: number) => (
                              <div 
                                key={idx}
                                className={cn(
                                  "p-3 rounded-xl border-2 transition-all",
                                  idx === item.question.correct_option_index
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-slate-200"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0",
                                    idx === item.question.correct_option_index
                                      ? "bg-green-500 text-white"
                                      : "bg-slate-200 text-slate-600"
                                  )}>
                                    {item.question.type === 'true_false' 
                                      ? (idx === 0 ? '✓' : '✕') 
                                      : String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className="flex-1 font-bold text-slate-700">{option}</span>
                                  {idx === item.question.correct_option_index && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Go to Lesson Button */}
                      <Button
                        onClick={() => navigate(`/student/lessons/${item.lesson_id}`)}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-2"
                      >
                        <ArrowRight className="h-5 w-5" />
                        الرجوع إلى الدرس
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-xl rounded-3xl arabic-font p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <Edit3 className="h-6 w-6" />
              تعديل الملاحظة
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              تعديل الملاحظة الخاصة بدرس: {editingNote?.lessons?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا..."
              className="min-h-[200px] text-lg rounded-2xl border-2 border-muted focus:border-primary p-6 resize-none transition-all leading-relaxed"
            />
          </div>
          
          <DialogFooter className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setEditingNote(null)} 
              className="flex-1 h-12 rounded-xl text-muted-foreground border-2"
              disabled={isProcessing}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleUpdateNote} 
              className="flex-1 h-12 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
              disabled={isProcessing || !newContent}
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
};

export default StudentNotes;
