import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/db/api';
import { simpleCache } from '@/lib/simple-cache';
import { Class, Subject, SubjectExtraClass } from '@/types';
import { Plus, Trash2, Layers, BookOpen, Loader2, Pencil, Link2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // حالات تعديل الصف
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // حالات تعديل المادة
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectClassId, setEditSubjectClassId] = useState<string>('');
  const [isEditSubjectDialogOpen, setIsEditSubjectDialogOpen] = useState(false);

  // حالات الصفوف الإضافية للمادة
  const [linkingSubject, setLinkingSubject] = useState<Subject | null>(null);
  const [linkClassId, setLinkClassId] = useState<string>('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isLinkSubmitting, setIsLinkSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cls, sub] = await Promise.all([
        simpleCache.getOrFetch('admin_classes', () => adminApi.getClasses(), 10),
        simpleCache.getOrFetch('admin_subjects', () => adminApi.getSubjects(), 10),
      ]);
      setClasses(cls);
      setSubjects(sub);
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في تحميل البيانات', description: 'فشل تحميل البيانات، يرجى إعادة تحميل الصفحة' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddClass = async () => {
    if (!newClassName) return;
    setIsSubmitting(true);
    try {
      await adminApi.createClass(newClassName);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة الصف بنجاح' });
      setNewClassName('');
      simpleCache.delete('admin_classes');
      fetchData();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إضافة الصف' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName || !selectedClassId) return;
    setIsSubmitting(true);
    try {
      await adminApi.createSubject(newSubjectName, selectedClassId);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة المادة بنجاح' });
      setNewSubjectName('');
      simpleCache.delete('admin_subjects');
      fetchData();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إضافة المادة' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف الصف وجميع المواد التابعة له؟')) return;
    try {
      await adminApi.deleteClass(id);
      toast({ title: 'تم الحذف' });
      simpleCache.delete('admin_classes');
      simpleCache.delete('admin_subjects');
      fetchData();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ' });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف المادة؟')) return;
    try {
      await adminApi.deleteSubject(id);
      toast({ title: 'تم الحذف' });
      simpleCache.delete('admin_subjects');
      fetchData();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ' });
    }
  };

  // تعديل الصف
  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClass = async () => {
    if (!editingClass || !editClassName) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateClass(editingClass.id, editClassName);
      toast({ title: 'تم التعديل', description: 'تم تعديل اسم الصف بنجاح' });
      setIsEditDialogOpen(false);
      setEditingClass(null);
      setEditClassName('');
      simpleCache.delete('admin_classes');
      fetchData();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تعديل الصف' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // تعديل المادة
  const handleEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setEditSubjectName(sub.name);
    setEditSubjectClassId(sub.class_id);
    setIsEditSubjectDialogOpen(true);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject || !editSubjectName || !editSubjectClassId) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateSubject(editingSubject.id, editSubjectName, editSubjectClassId);
      toast({ title: 'تم التعديل', description: 'تم تعديل المادة بنجاح' });
      setIsEditSubjectDialogOpen(false);
      setEditingSubject(null);
      setEditSubjectName('');
      setEditSubjectClassId('');
      simpleCache.delete('admin_subjects');
      fetchData();
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تعديل المادة' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ربط المادة بصف إضافي
  const handleOpenLinkDialog = (sub: Subject) => {
    setLinkingSubject(sub);
    setLinkClassId('');
    setIsLinkDialogOpen(true);
  };

  const handleAddExtraClass = async () => {
    if (!linkingSubject || !linkClassId) return;
    // منع الربط بالصف الأساسي نفسه
    if (linkClassId === linkingSubject.class_id) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'هذا هو الصف الأساسي للمادة بالفعل' });
      return;
    }
    // منع الربط بصف مربوط بالفعل
    const alreadyLinked = linkingSubject.extra_classes?.some(ec => ec.class_id === linkClassId);
    if (alreadyLinked) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'المادة مرتبطة بهذا الصف بالفعل' });
      return;
    }
    setIsLinkSubmitting(true);
    try {
      await adminApi.addSubjectExtraClass(linkingSubject.id, linkClassId);
      toast({ title: 'تم الربط', description: 'تم ربط المادة بالصف الإضافي بنجاح' });
      setLinkClassId('');
      simpleCache.delete('admin_subjects');
      // تحديث المادة في الحالة المحلية
      const updatedSubs = await adminApi.getSubjects();
      setSubjects(updatedSubs);
      const updatedSub = updatedSubs.find(s => s.id === linkingSubject.id);
      if (updatedSub) setLinkingSubject(updatedSub);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل ربط الصف' });
    } finally {
      setIsLinkSubmitting(false);
    }
  };

  const handleRemoveExtraClass = async (extraClass: SubjectExtraClass) => {
    try {
      await adminApi.removeSubjectExtraClass(extraClass.id);
      toast({ title: 'تم إلغاء الربط', description: 'تم إزالة الصف الإضافي' });
      simpleCache.delete('admin_subjects');
      const updatedSubs = await adminApi.getSubjects();
      setSubjects(updatedSubs);
      const updatedSub = updatedSubs.find(s => s.id === linkingSubject?.id);
      if (updatedSub) setLinkingSubject(updatedSub);
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إزالة الصف' });
    }
  };

  // الصفوف المتاحة للربط (بدون الصف الأساسي والمرتبطة مسبقاً)
  const availableClassesForLink = classes.filter(cls =>
    cls.id !== linkingSubject?.class_id &&
    !linkingSubject?.extra_classes?.some(ec => ec.class_id === cls.id)
  );

  return (
    <AdminLayout title="إدارة الصفوف والمواد">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* إدارة الصفوف */}
        <Card className="border-none shadow-md rounded-2xl bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-primary">
                <Layers className="h-5 w-5" />
                الصفوف الدراسية
              </CardTitle>
              <CardDescription>إدارة المستويات والصفوف التعليمية</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  إضافة صف
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl max-w-[calc(100%-2rem)] md:max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة صف جديد</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="اسم الصف (مثلاً: الثالث الثانوي)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAddClass} disabled={isSubmitting} className="rounded-xl w-full">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "إضافة الصف"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full bg-muted rounded-xl" />
                <Skeleton className="h-12 w-full bg-muted rounded-xl" />
              </div>
            ) : classes.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">لا توجد صفوف حالياً</div>
            ) : (
              <div className="divide-y">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Layers className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-lg">{cls.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClass(cls)} className="text-primary hover:bg-primary/5 rounded-xl">
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(cls.id)} className="text-destructive hover:bg-destructive/5 rounded-xl">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* إدارة المواد */}
        <Card className="border-none shadow-md rounded-2xl bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-secondary">
                <BookOpen className="h-5 w-5" />
                المواد الدراسية
              </CardTitle>
              <CardDescription>إدارة المواد لكل صف دراسي</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/5 rounded-xl gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة مادة
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl max-w-[calc(100%-2rem)] md:max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة مادة جديدة</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium mr-1">اختر الصف</label>
                    <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="اختر الصف الدراسي" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                        {classes.length === 0 && (
                          <div className="p-2 text-center text-sm text-muted-foreground">لا توجد صفوف</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium mr-1">اسم المادة</label>
                    <Input
                      placeholder="اسم المادة (مثلاً: اللغة العربية)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddSubject} disabled={isSubmitting || !selectedClassId} className="rounded-xl w-full bg-secondary hover:bg-secondary/90">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "إضافة المادة"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full bg-muted rounded-xl" />
                <Skeleton className="h-12 w-full bg-muted rounded-xl" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">لا توجد مواد حالياً</div>
            ) : (
              <div className="divide-y">
                {subjects.map((sub) => {
                  const cls = classes.find(c => c.id === sub.class_id);
                  const extraClasses = sub.extra_classes ?? [];
                  return (
                    <div key={sub.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold block text-pretty">{sub.name}</span>
                            {/* الصف الأساسي */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
                                {cls?.name || 'صف محذوف'}
                              </Badge>
                              {/* الصفوف الإضافية */}
                              {extraClasses.map(ec => (
                                <Badge
                                  key={ec.id}
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5 rounded-full border-primary/40 text-primary gap-1"
                                >
                                  <Link2 className="h-2.5 w-2.5" />
                                  {ec.classes?.name || 'صف محذوف'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* زر ربط صف إضافي */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenLinkDialog(sub)}
                            className="text-primary hover:bg-primary/5 rounded-xl h-8 w-8"
                            title="ربط بصف إضافي"
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditSubject(sub)} className="text-secondary hover:bg-secondary/5 rounded-xl h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSubject(sub.id)} className="text-destructive hover:bg-destructive/5 rounded-xl h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog تعديل الصف */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل اسم الصف</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="اسم الصف الجديد"
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateClass} disabled={isSubmitting || !editClassName} className="rounded-xl w-full">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "حفظ التعديل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تعديل المادة */}
      <Dialog open={isEditSubjectDialogOpen} onOpenChange={setIsEditSubjectDialogOpen}>
        <DialogContent className="rounded-2xl max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل المادة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المادة</label>
              <Input
                placeholder="اسم المادة الجديد"
                value={editSubjectName}
                onChange={(e) => setEditSubjectName(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الصف الدراسي الأساسي</label>
              <Select value={editSubjectClassId} onValueChange={setEditSubjectClassId}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="اختر الصف" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateSubject} disabled={isSubmitting || !editSubjectName || !editSubjectClassId} className="rounded-xl w-full bg-secondary hover:bg-secondary/90">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "حفظ التعديل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ربط المادة بصف إضافي */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="rounded-2xl max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              ربط المادة بصف إضافي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* معلومات المادة */}
            {linkingSubject && (
              <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                <p className="text-sm font-semibold">{linkingSubject.name}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground ml-1">الصف الأساسي:</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {classes.find(c => c.id === linkingSubject.class_id)?.name || 'غير محدد'}
                  </Badge>
                </div>
                {/* الصفوف المرتبطة حالياً */}
                {(linkingSubject.extra_classes ?? []).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">الصفوف الإضافية المرتبطة:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(linkingSubject.extra_classes ?? []).map(ec => (
                        <div key={ec.id} className="flex items-center gap-1 bg-primary/5 border border-primary/20 rounded-full px-2 py-0.5">
                          <span className="text-[11px] text-primary font-medium">
                            {ec.classes?.name || 'صف محذوف'}
                          </span>
                          <button
                            onClick={() => handleRemoveExtraClass(ec)}
                            className="text-destructive hover:text-destructive/80 ml-0.5"
                            title="إزالة هذا الربط"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* إضافة صف إضافي جديد */}
            <div className="space-y-2">
              <label className="text-sm font-medium">ربط بصف إضافي</label>
              {availableClassesForLink.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3 bg-muted/30 rounded-xl">
                  لا توجد صفوف أخرى متاحة للربط
                </p>
              ) : (
                <div className="flex gap-2">
                  <Select value={linkClassId} onValueChange={setLinkClassId}>
                    <SelectTrigger className="h-11 rounded-xl flex-1">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClassesForLink.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddExtraClass}
                    disabled={!linkClassId || isLinkSubmitting}
                    className="h-11 rounded-xl shrink-0"
                  >
                    {isLinkSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-xl">
              💡 عند ربط المادة بصف إضافي، سيتمكن طلاب ذلك الصف من رؤيتها والوصول إليها تلقائياً.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)} className="rounded-xl">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminClasses;
