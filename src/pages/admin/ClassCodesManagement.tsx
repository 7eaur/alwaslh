import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { Class } from '@/types';
import { Loader2, Plus, Download, CheckCircle, XCircle, Copy, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, ImageDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import CodeCardExport, { CodeCardData } from '@/components/common/CodeCardExport';

interface ClassActivationCode {
  id: string;
  code: string;
  class_id: string;
  created_at: string;
  expires_at: string | null;
  is_used: boolean;
  device_id: string | null;
  activated_at: string | null;
  classes?: { name: string };
}

type SortField = 'created_at' | 'activated_at' | 'expires_at' | 'code' | 'class_name';
type SortDir   = 'asc' | 'desc';

const ClassCodesManagement: React.FC = () => {
  const [codes, setCodes] = useState<ClassActivationCode[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState('10');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // تحديد متعدد
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // فلتر تصدير الكروت
  const [exportFilterOpen, setExportFilterOpen] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [exportClassId, setExportClassId] = useState<string>('all');
  const [exportCodeType, setExportCodeType] = useState<'all' | 'new' | 'used'>('all');
  // بحث وفرز
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const { toast } = useToast();

  useEffect(() => { fetchClasses(); fetchCodes(); }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from('classes').select('*').order('name');
      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error('خطأ في جلب الصفوف:', err);
    }
  };

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('class_activation_codes')
        .select('*, classes(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      console.error('خطأ في جلب الأكواد:', err);
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل الأكواد' });
    } finally {
      setLoading(false);
    }
  };

  // فرز وبحث
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const displayedCodes = useMemo(() => {
    let result = codes.filter(c => {
      const matchCode  = !searchQuery || c.code.includes(searchQuery.trim());
      const matchClass = filterClassId === 'all' || c.class_id === filterClassId;
      return matchCode && matchClass;
    });
    result = [...result].sort((a, b) => {
      let av: string = sortField === 'class_name' ? (a.classes?.name ?? '') : ((a as any)[sortField] ?? '');
      let bv: string = sortField === 'class_name' ? (b.classes?.name ?? '') : ((b as any)[sortField] ?? '');
      if (sortDir === 'desc') [av, bv] = [bv, av];
      return av < bv ? -1 : av > bv ? 1 : 0;
    });
    return result;
  }, [codes, searchQuery, filterClassId, sortField, sortDir]);

  const generateCode = (): string => {
    // توليد كود من 7 خانات
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  };

  const handleGenerate = async () => {
    if (!selectedClassId) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى اختيار الصف',
      });
      return;
    }

    const numCodes = parseInt(count);
    if (isNaN(numCodes) || numCodes < 1 || numCodes > 100) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى إدخال عدد صحيح بين 1 و 100',
      });
      return;
    }

    setGenerating(true);
    try {
      const newCodes = [];
      for (let i = 0; i < numCodes; i++) {
        let code = generateCode();
        // التأكد من عدم تكرار الكود
        let attempts = 0;
        while (codes.some(c => c.code === code) && attempts < 10) {
          code = generateCode();
          attempts++;
        }
        newCodes.push({
          code,
          class_id: selectedClassId,
        });
      }

      const { error } = await supabase
        .from('class_activation_codes')
        .insert(newCodes);

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: `تم توليد ${numCodes} كود بنجاح`,
      });

      fetchCodes();
      setCount('10');
      setSelectedClassId('');
    } catch (err: any) {
      console.error('خطأ في توليد الأكواد:', err);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: err.message || 'فشل توليد الأكواد',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ الكود إلى الحافظة',
    });
  };

  const handleDeleteClick = (codeId: string) => {
    setCodeToDelete(codeId);
    setDeleteDialogOpen(true);
  };

  // تحديد متعدد
  const allDisplayedIds = useMemo(() => displayedCodes.map(c => c.id), [displayedCodes]);
  const isAllSelected = allDisplayedIds.length > 0 && allDisplayedIds.every(id => selectedIds.has(id));
  const isSomeSelected = allDisplayedIds.some(id => selectedIds.has(id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => { const n = new Set(prev); allDisplayedIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); allDisplayedIds.forEach(id => n.add(id)); return n; });
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const { error } = await supabase
        .from('class_activation_codes')
        .delete()
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      toast({ title: 'تم الحذف', description: `تم حذف ${selectedIds.size} كود بنجاح` });
      setSelectedIds(new Set());
      fetchCodes();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ في الحذف', description: err.message });
    } finally {
      setBulkDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  // بيانات تصدير الكروت بعد تطبيق الفلتر
  const filteredExportCardData: CodeCardData[] = useMemo(() => {
    return codes
      .filter(c => {
        const matchClass = exportClassId === 'all' || c.class_id === exportClassId;
        const matchType  = exportCodeType === 'all'
          ? true
          : exportCodeType === 'new'
          ? !c.is_used
          : c.is_used;
        return matchClass && matchType;
      })
      .map(c => ({
        id: c.id,
        code: c.code,
        type: 'class' as const,
        className: c.classes?.name,
        isUsed: c.is_used,
      }));
  }, [codes, exportClassId, exportCodeType]);

  const handleDeleteConfirm = async () => {
    if (!codeToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('class_activation_codes')
        .delete()
        .eq('id', codeToDelete);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الكود بنجاح',
      });

      fetchCodes();
    } catch (err: any) {
      console.error('خطأ في حذف الكود:', err);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: err.message || 'فشل حذف الكود',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  };

  const handleExport = () => {
    const csv = [
      ['الكود', 'الصف', 'الحالة', 'تاريخ الإنشاء', 'تاريخ التفعيل'].join(','),
      ...codes.map(code => [
        code.code,
        code.classes?.name || '-',
        code.is_used ? 'مستخدم' : 'غير مستخدم',
        new Date(code.created_at).toLocaleDateString('ar'),
        code.activated_at ? new Date(code.activated_at).toLocaleDateString('ar') : '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `class_codes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'تم التصدير',
      description: 'تم تصدير الأكواد بنجاح',
    });
  };

  // exportCardData غير مستخدم مباشرةً - نعتمد على filteredExportCardData

  return (
    <AdminLayout title="إدارة أكواد الصفوف">
      <div className="space-y-6 p-4 md:p-6">
        {/* بطاقة توليد الأكواد */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-balance">توليد أكواد صفوف جديدة</CardTitle>
            <CardDescription className="text-pretty">
              أكواد الصفوف مكونة من 7 خانات. عند تفعيل كود الصف، يتم فتح جميع مواد الصف المختار.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>الصف الدراسي</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>عدد الأكواد</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="عدد الأكواد"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !selectedClassId}
                  className="w-full h-12 rounded-xl"
                >
                  {generating ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Plus className="ml-2 h-4 w-4" />
                      توليد الأكواد
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* بطاقة قائمة الأكواد */}
        <Card className="h-full">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-balance">الأكواد المُنشأة</CardTitle>
                <CardDescription className="text-pretty">
                  الإجمالي: {codes.length} | مستخدم: {codes.filter(c => c.is_used).length} | متاح: {codes.filter(c => !c.is_used).length}
                </CardDescription>
              </div>
              <div className="flex gap-2 shrink-0">
                {selectedIds.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteOpen(true)}
                    className="gap-1.5 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف المحدد ({selectedIds.size})
                  </Button>
                )}
                <Button onClick={handleExport} variant="outline" className="rounded-xl" disabled={codes.length === 0}>
                  <Download className="ml-2 h-4 w-4" />تصدير CSV
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl"
                  onClick={() => { setExportClassId('all'); setExportCodeType('all'); setExportFilterOpen(true); }}
                  disabled={codes.length === 0}
                >
                  <Filter className="h-4 w-4" />
                  تصدير كروت
                </Button>
              </div>
            </div>
            {/* أدوات البحث والفرز */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ابحث بالكود..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pr-9 h-10 rounded-xl"
                />
              </div>
              <Select value={filterClassId} onValueChange={setFilterClassId}>
                <SelectTrigger className="h-10 rounded-xl sm:w-48">
                  <SelectValue placeholder="كل الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الصفوف</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : displayedCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || filterClassId !== 'all' ? 'لا توجد نتائج للبحث' : 'لا توجد أكواد بعد. قم بتوليد أكواد جديدة.'}
              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto bg-card min-w-0">
                <Table className="[&>div]:max-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="تحديد الكل"
                          className={isSomeSelected ? 'data-[state=unchecked]:bg-muted' : ''}
                        />
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort('code')}>
                          الكود <SortIcon field="code" />
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort('class_name')}>
                          الصف <SortIcon field="class_name" />
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">الحالة</TableHead>
                      <TableHead className="whitespace-nowrap">
                        <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort('created_at')}>
                          تاريخ الإنشاء <SortIcon field="created_at" />
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort('activated_at')}>
                          تاريخ التفعيل <SortIcon field="activated_at" />
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort('expires_at')}>
                          تاريخ الانتهاء <SortIcon field="expires_at" />
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedCodes.map((code) => (
                      <TableRow key={code.id} className={selectedIds.has(code.id) ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(code.id)}
                            onCheckedChange={() => toggleSelect(code.id)}
                            aria-label={`تحديد ${code.code}`}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono font-bold">{code.code}</TableCell>
                        <TableCell className="whitespace-nowrap">{code.classes?.name || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {code.is_used ? (
                            <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />مستخدم</Badge>
                          ) : (
                            <Badge variant="default" className="gap-1"><XCircle className="h-3 w-3" />متاح</Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(code.created_at).toLocaleDateString('ar')}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {code.activated_at
                            ? new Date(code.activated_at).toLocaleDateString('ar')
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {code.expires_at
                            ? <span className={new Date(code.expires_at) < new Date() ? 'text-destructive font-bold' : ''}>
                                {new Date(code.expires_at).toLocaleDateString('ar')}
                              </span>
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleCopy(code.code)} className="h-8 w-8 p-0"><Copy className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(code.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* مربع حوار تأكيد الحذف المفرد */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              هل أنت متأكد من حذف هذا الكود؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* مربع حوار تأكيد الحذف المتعدد */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف المتعدد</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              سيتم حذف <strong>{selectedIds.size}</strong> كود بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={bulkDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {bulkDeleting ? (
                <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الحذف...</>
              ) : (
                `حذف ${selectedIds.size} كود`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* نافذة فلتر تصدير الكروت */}
      <Dialog open={exportFilterOpen} onOpenChange={setExportFilterOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">خيارات تصدير كروت الأكواد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>الصف الدراسي</Label>
              <Select value={exportClassId} onValueChange={setExportClassId}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="كل الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الصفوف</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع الأكواد</Label>
              <Select value={exportCodeType} onValueChange={v => setExportCodeType(v as 'all' | 'new' | 'used')}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل (جديد + مستخدم)</SelectItem>
                  <SelectItem value="new">جديد (غير مستخدم فقط)</SelectItem>
                  <SelectItem value="used">مستخدم فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              عدد الكروت التي ستُصدَّر: <strong className="text-foreground">{filteredExportCardData.length}</strong>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setExportFilterOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="gap-2 rounded-xl"
              onClick={() => { setExportFilterOpen(false); setExportPreviewOpen(true); }}
            >
              <ImageDown className="h-4 w-4" />
              فتح معاينة الكروت
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CodeCardExport خارج dialog الفلتر تماماً لتجنب إزالته من DOM عند إغلاق الفلتر */}
      <CodeCardExport
        codes={filteredExportCardData}
        open={exportPreviewOpen}
        onOpenChange={setExportPreviewOpen}
      />
    </AdminLayout>
  );
};

export default ClassCodesManagement;
