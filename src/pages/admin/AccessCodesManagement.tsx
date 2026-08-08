import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { Loader2, Plus, Download, CheckCircle, XCircle, Copy, Trash2, Upload, FileSpreadsheet, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, Eye, EyeOff, RotateCcw } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CodeCardExport, { CodeCardData } from '@/components/common/CodeCardExport';
import * as XLSX from 'xlsx';

interface AccessCode {
  id: string;
  code: string;
  is_used: boolean;
  device_id: string | null;
  device_fingerprint: string | null;
  recovery_password_encrypted: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
}

type SortField = 'created_at' | 'activated_at' | 'expires_at' | 'code' | 'is_used';
type SortDir   = 'asc' | 'desc';

const PAGE_SIZE = 200;

const AccessCodesManagement: React.FC = () => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState('10');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // إعادة تعيين جهاز
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [codeToReset, setCodeToReset] = useState<AccessCode | null>(null);
  const [resetting, setResetting] = useState(false);
  // عرض كلمة المرور
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string | null>>({});
  const [loadingPasswords, setLoadingPasswords] = useState<Set<string>>(new Set());
  // تحديد متعدد
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // بحث وفرز وترقيم
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => { fetchCodes(); }, []);

  // Realtime subscription لتحديث قائمة الأكواد فوراً عند أي تغيير
  useEffect(() => {
    const channel = supabase
      .channel('admin-access-codes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'access_codes' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as AccessCode;
            setCodes(prev => prev.map(c => c.id === updated.id ? updated : c));
          } else {
            // INSERT أو DELETE
            fetchCodes();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCodes = async () => {
    try {
      // جلب كل الأكواد بدفعات لتجاوز حد Supabase الافتراضي (1000 صف)
      const FETCH_BATCH = 1000;
      let allCodes: AccessCode[] = [];
      let from = 0;
      let total: number | null = null;
      while (true) {
        const { data, error, count } = await supabase
          .from('access_codes')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, from + FETCH_BATCH - 1);
        if (error) throw error;
        if (typeof count === 'number') total = count;
        if (!data || data.length === 0) break;
        allCodes = allCodes.concat(data);
        if (data.length < FETCH_BATCH) break; // آخر دفعة
        from += FETCH_BATCH;
        if (total != null && allCodes.length >= total) break; // جلبنا كل الصفوف
        if (from >= 100000) break; // حد أمان عام
      }
      setCodes(allCodes);
      setTotalCount(total ?? allCodes.length);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل جلب الأكواد' });
    } finally {
      setLoading(false);
    }
  };

  // فرز وبحث
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  // إعادة تعيين الصفحة عند تغيير البحث
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const displayedCodes = useMemo(() => {
    let result = codes.filter(c =>
      !searchQuery || c.code.includes(searchQuery.trim())
    );
    result = [...result].sort((a, b) => {
      let av: any = a[sortField] ?? '';
      let bv: any = b[sortField] ?? '';
      // فرز الحالة: متاح (false) قبل مستخدم (true) في الترتيب التصاعدي
      if (sortField === 'is_used') {
        av = a.is_used ? 1 : 0;
        bv = b.is_used ? 1 : 0;
      }
      if (sortDir === 'desc') [av, bv] = [bv, av];
      return av < bv ? -1 : av > bv ? 1 : 0;
    });
    return result;
  }, [codes, searchQuery, sortField, sortDir]);

  // الترقيم الصفحي
  const totalPages = Math.max(1, Math.ceil(displayedCodes.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCodes = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return displayedCodes.slice(start, start + PAGE_SIZE);
  }, [displayedCodes, safePage]);

  const generateCodes = async () => {
    const numCodes = parseInt(count);
    if (isNaN(numCodes) || numCodes < 1 || numCodes > 10000) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى إدخال عدد صحيح بين 1 و 10,000',
      });
      return;
    }

    setGenerating(true);
    try {
      // جمع الأكواد الموجودة حالياً لتجنّب التكرار
      const existing = new Set(codes.map(c => c.code));
      const candidates = new Set<string>();
      while (candidates.size < numCodes) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        if (!existing.has(code)) candidates.add(code);
      }

      const allNewCodes = Array.from(candidates);
      const BATCH_SIZE = 500;
      for (let i = 0; i < allNewCodes.length; i += BATCH_SIZE) {
        const batch = allNewCodes.slice(i, i + BATCH_SIZE).map(code => ({
          code,
          is_used: false,
          device_id: null,
          activated_at: null,
          expires_at: null,
        }));
        const { error } = await supabase.from('access_codes').insert(batch);
        if (error) throw error;
      }

      const duplicatesIgnored = numCodes - allNewCodes.length; // يكون 0 عادة
      toast({
        title: 'تم التوليد بنجاح',
        description: duplicatesIgnored > 0
          ? `تم توليد ${allNewCodes.length} كود جديد. تم تجاهل ${duplicatesIgnored} كود مكرر`
          : `تم توليد ${allNewCodes.length} كود جديد`,
      });

      fetchCodes();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: err.message || 'فشل توليد الأكواد',
      });
    } finally {
      setGenerating(false);
    }
  };

  const computeExpiryDate = (code: AccessCode): Date | null => {
    if (code.expires_at) return new Date(code.expires_at);
    if (code.activated_at) {
      const d = new Date(code.activated_at);
      d.setFullYear(d.getFullYear() + 1);
      return d;
    }
    return null;
  };

  const formatExpiry = (code: AccessCode): string => {
    const expiry = computeExpiryDate(code);
    if (!expiry) return '—';
    return new Date(expiry).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ الكود إلى الحافظة',
    });
  };

  const handleResetClick = (code: AccessCode) => {
    setCodeToReset(code);
    setResetDialogOpen(true);
  };

  const handleResetConfirm = async () => {
    if (!codeToReset) return;

    setResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ success: boolean; error?: string }>(
        'admin-reset-device',
        {
          body: { codeId: codeToReset.id },
          method: 'POST',
        }
      );
      if (error) {
        const errorMsg = await error?.context?.text?.().catch(() => error.message);
        throw new Error(errorMsg || error.message);
      }
      if (!data?.success) throw new Error(data?.error || 'فشل إعادة التعيين');

      toast({ title: 'تم إعادة التعيين', description: `تم فك ربط الجهاز عن الكود ${codeToReset.code}` });
      setCodes(prev =>
        prev.map(c =>
          c.id === codeToReset.id
            ? { ...c, is_used: false, device_id: null, device_fingerprint: null, recovery_password_encrypted: null, activated_at: null }
            : c
        )
      );
      setRevealedPasswords(prev => {
        const next = { ...prev };
        delete next[codeToReset.id];
        return next;
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل إعادة تعيين الجهاز' });
    } finally {
      setResetting(false);
      setResetDialogOpen(false);
      setCodeToReset(null);
    }
  };

  const toggleRevealPassword = async (code: AccessCode) => {
    if (!code.recovery_password_encrypted) return;
    if (revealedPasswords[code.id]) {
      setRevealedPasswords(prev => ({ ...prev, [code.id]: null }));
      return;
    }

    setLoadingPasswords(prev => new Set(prev).add(code.id));
    try {
      const { data, error } = await supabase.functions.invoke<{ password: string | null; error?: string }>(
        'admin-get-recovery-password',
        {
          body: { codeId: code.id },
          method: 'POST',
        }
      );
      if (error) {
        const errorMsg = await error?.context?.text?.().catch(() => error.message);
        throw new Error(errorMsg || error.message);
      }
      setRevealedPasswords(prev => ({ ...prev, [code.id]: data?.password || null }));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل جلب كلمة المرور' });
    } finally {
      setLoadingPasswords(prev => {
        const next = new Set(prev);
        next.delete(code.id);
        return next;
      });
    }
  };

  const handleDeleteClick = (codeId: string) => {
    setCodeToDelete(codeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!codeToDelete) return;

    setDeleting(true);
    const previousCodes = codes;
    setCodes(prev => prev.filter(c => c.code !== codeToDelete));
    try {
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('code', codeToDelete);

      if (error) throw error;

      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف الكود',
      });
    } catch (err: any) {
      setCodes(previousCodes);
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

  // تحديد متعدد - على الصفحة الحالية فقط
  const allDisplayedIds = useMemo(() => paginatedCodes.map(c => c.id), [paginatedCodes]);
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
    const previousCodes = codes;
    setCodes(prev => prev.filter(c => !selectedIds.has(c.id)));
    try {
      const idsToDelete = Array.from(selectedIds);
      // تقسيم الحذف إلى دُفعات من 100 لتجنب تجاوز حد URL في PostgREST
      const BATCH_SIZE = 100;
      for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
        const batch = idsToDelete.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('access_codes')
          .delete()
          .in('id', batch);
        if (error) throw error;
      }
      toast({ title: 'تم الحذف', description: `تم حذف ${idsToDelete.length} كود بنجاح` });
      setSelectedIds(new Set());
    } catch (err: any) {
      setCodes(previousCodes);
      toast({ variant: 'destructive', title: 'خطأ في الحذف', description: err.message });
    } finally {
      setBulkDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  const exportToExcel = () => {
    const rows = codes.map(code => ({
      'الكود': code.code,
      'الحالة': code.is_used ? 'مستخدم' : 'جديد',
      'تاريخ التفعيل': code.activated_at
        ? new Date(code.activated_at).toLocaleDateString('ar-SA')
        : '-',
      'تاريخ الانتهاء': formatExpiry(code),
      'تاريخ الانشاء': new Date(code.created_at).toLocaleDateString('ar-SA'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 16 },  // الكود
      { wch: 12 },  // الحالة
      { wch: 18 },  // تاريخ التفعيل
      { wch: 18 },  // تاريخ الانتهاء
      { wch: 18 },  // تاريخ الانشاء
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'أكواد التفعيل');
    XLSX.writeFile(wb, `access_codes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportUsedToExcel = () => {
    const usedCodes = codes.filter(code => code.is_used);
    const rows = usedCodes.map(code => ({
      'كود التفعيل المستخدم': code.code,
      'تاريخ التفعيل': code.activated_at
        ? new Date(code.activated_at).toLocaleDateString('ar-SA')
        : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 22 },  // كود التفعيل المستخدم
      { wch: 18 },  // تاريخ التفعيل
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الأكواد المستخدمة');
    XLSX.writeFile(wb, `used_access_codes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // تحميل نموذج Excel فارغ للاستيراد
  const handleDownloadTemplate = () => {
    const templateData = [
      { 'الكود': '1234567' },
      { 'الكود': '9876543' },
      { 'الكود': '5551234' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [{ wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج الاستيراد');
    XLSX.writeFile(wb, 'نموذج_استيراد_أكواد_التفعيل.xlsx');
    toast({
      title: 'تم تحميل النموذج',
      description: 'أضف أكوادك في عمود "الكود" ثم ارفع الملف للاستيراد',
    });
  };

  // استيراد أكواد من ملف Excel أو CSV مع فحص المكررات
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const rawCodes = jsonData
          .map(row => (row['الكود'] ?? row['code'] ?? row['Code'] ?? '').toString().trim())
          .filter(code => code.length >= 4);

        if (rawCodes.length === 0) {
          toast({ variant: 'destructive', title: 'لا توجد أكواد صالحة', description: 'تأكد أن الملف يحتوي على عمود باسم "الكود"' });
          return;
        }

        // إزالة التكرار داخل الملف نفسه
        const uniqueFileCodes = Array.from(new Set(rawCodes));
        const duplicateInFile = rawCodes.length - uniqueFileCodes.length;

        // فحص الأكواد الموجودة في قاعدة البيانات بدفعات
        const DB_BATCH = 1000;
        const existingDbCodes = new Set<string>();
        for (let i = 0; i < uniqueFileCodes.length; i += DB_BATCH) {
          const batch = uniqueFileCodes.slice(i, i + DB_BATCH);
          const { data: existing, error } = await supabase
            .from('access_codes')
            .select('code')
            .in('code', batch);
          if (error) throw error;
          (existing || []).forEach((r: any) => existingDbCodes.add(r.code));
        }

        const newCodes = uniqueFileCodes.filter(code => !existingDbCodes.has(code));
        const duplicatesIgnored = uniqueFileCodes.length - newCodes.length;

        if (newCodes.length === 0) {
          toast({
            title: 'لم يتم استيراد أي كود',
            description: `جميع الأكواد (${duplicatesIgnored + duplicateInFile}) مكررة أو غير صالحة`,
            variant: 'destructive',
          });
          fetchCodes();
          return;
        }

        // إدراج الأكواد الجديدة بدفعات 500
        const IMPORT_BATCH = 500;
        for (let i = 0; i < newCodes.length; i += IMPORT_BATCH) {
          const batch = newCodes.slice(i, i + IMPORT_BATCH).map(code => ({
            code,
            is_used: false,
            device_id: null,
            activated_at: null,
            expires_at: null,
          }));
          const { error } = await supabase.from('access_codes').insert(batch);
          if (error) throw error;
        }

        const messages: string[] = [`تم استيراد ${newCodes.length} كود بنجاح`];
        if (duplicatesIgnored > 0) messages.push(`تم تجاهل ${duplicatesIgnored} كود مكرر في قاعدة البيانات`);
        if (duplicateInFile > 0) messages.push(`تم تجاهل ${duplicateInFile} تكرار داخل الملف`);

        toast({ title: 'تم الاستيراد بنجاح', description: messages.join(' • ') });
        fetchCodes();
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'فشل الاستيراد', description: err.message });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <AdminLayout title="إدارة أكواد التفعيل">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة أكواد التفعيل</h1>
        </div>

        {/* توليد أكواد جديدة */}
        <Card>
          <CardHeader>
            <CardTitle>توليد أكواد جديدة</CardTitle>
            <CardDescription>
              قم بتوليد أكواد تفعيل التطبيق (6 خانات) لتوزيعها على الطلاب
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* أزرار الاستيراد والنموذج */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-border">
              <Button
                variant="outline"
                className="gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/5"
                onClick={handleDownloadTemplate}
              >
                <FileSpreadsheet className="h-4 w-4" />
                تحميل نموذج الاستيراد
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => document.getElementById('import-codes-input')?.click()}
              >
                <Upload className="h-4 w-4" />
                استيراد أكواد من Excel
                <input
                  id="import-codes-input"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                />
              </Button>
              <p className="w-full text-xs text-muted-foreground pt-1">
                حمّل النموذج → أضف الأكواد في عمود "الكود" → ارفع الملف
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="count">عدد الأكواد</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="10000"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={generateCodes}
                  disabled={generating}
                  className="w-full md:w-auto"
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
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  disabled={codes.length === 0}
                >
                  <Download className="ml-2 h-4 w-4" />
                  تصدير إلى Excel
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                ℹ️ سيتم توليد أكواد مكونة من 6 أرقام عشوائية فريدة. هذه الأكواد تمنح وصولاً كاملاً لجميع المواد.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الأكواد */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>قائمة الأكواد</CardTitle>
                <CardDescription>
                  الإجمالي: {totalCount} | معروض: {codes.length} | مستخدم: {codes.filter(c => c.is_used).length} | متاح: {codes.filter(c => !c.is_used).length}
                </CardDescription>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {selectedIds.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteOpen(true)}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف المحدد ({selectedIds.size})
                  </Button>
                )}
                <Button variant="outline" onClick={exportToExcel} disabled={codes.length === 0} className="shrink-0">
                  <Download className="ml-2 h-4 w-4" />
                  تصدير Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={exportUsedToExcel}
                  disabled={codes.filter(c => c.is_used).length === 0}
                  className="shrink-0"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تصدير المستخدم فقط
                </Button>
                <CodeCardExport
                  codes={paginatedCodes.map((c): CodeCardData => ({
                    id: c.id,
                    code: c.code,
                    type: 'full',
                    isUsed: c.is_used,
                  }))}
                />
              </div>
            </div>
            {/* شريط البحث */}
            <div className="relative mt-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث بالكود..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pr-9 h-10 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : displayedCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد أكواد. قم بتوليد أكواد جديدة.'}
              </div>
            ) : (
              <>
                {/* معلومات الصفحة */}
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <span>
                    عرض {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, displayedCodes.length)} من {displayedCodes.length} كود
                  </span>
                  <span>صفحة {safePage} من {totalPages}</span>
                </div>

                <div className="w-full max-w-full overflow-x-auto bg-card min-w-0">
                  <Table className="[&>div]:max-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={toggleSelectAll}
                            aria-label="تحديد الكل في هذه الصفحة"
                            className={isSomeSelected ? 'data-[state=unchecked]:bg-muted' : ''}
                          />
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort('code')}>
                            الكود <SortIcon field="code" />
                          </button>
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => handleSort('is_used')}>
                            الحالة <SortIcon field="is_used" />
                          </button>
                        </TableHead>
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
                        <TableHead className="whitespace-nowrap">بصمة الجهاز</TableHead>
                        <TableHead className="whitespace-nowrap">كلمة المرور</TableHead>
                        <TableHead className="whitespace-nowrap">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCodes.map((code) => (
                        <TableRow key={code.id} className={selectedIds.has(code.id) ? 'bg-primary/5' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(code.id)}
                              onCheckedChange={() => toggleSelect(code.id)}
                              aria-label={`تحديد ${code.code}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-lg font-bold whitespace-nowrap">{code.code}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {code.is_used ? (
                              <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />مستخدم</Badge>
                            ) : (
                              <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />متاح</Badge>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {new Date(code.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {code.activated_at
                              ? new Date(code.activated_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
                              : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {(() => {
                              const expiry = computeExpiryDate(code);
                              return expiry
                                ? <span className={expiry < new Date() ? 'text-destructive font-bold' : ''}>
                                    {new Date(expiry).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                : <span className="text-muted-foreground">—</span>;
                            })()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm font-mono max-w-[160px] truncate" title={code.device_fingerprint || undefined}>
                            {code.device_fingerprint ? (
                              <span className="text-xs">{code.device_fingerprint.slice(0, 24)}...</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {code.recovery_password_encrypted ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono">
                                  {revealedPasswords[code.id] ? revealedPasswords[code.id] : '••••••••'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRevealPassword(code)}
                                  disabled={loadingPasswords.has(code.id)}
                                  aria-label={revealedPasswords[code.id] ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                >
                                  {loadingPasswords.has(code.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : revealedPasswords[code.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleCopyCode(code.code)}><Copy className="h-4 w-4" /></Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetClick(code)}
                                disabled={!code.is_used}
                                title="إعادة تعيين ربط الجهاز"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(code.code)} className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* أزرار التنقل بين الصفحات */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="gap-1.5"
                    >
                      <ChevronRight className="h-4 w-4" />
                      السابق
                    </Button>
                    {/* أرقام الصفحات (تُظهر حداً أقصى 5 صفحات حول الحالية) */}
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === '...'
                            ? <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                            : <Button
                                key={item}
                                variant={safePage === item ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 w-8 p-0 text-xs"
                                onClick={() => setCurrentPage(item as number)}
                              >
                                {item}
                              </Button>
                        )
                      }
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="gap-1.5"
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* مربع حوار تأكيد الحذف المفرد */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا الكود؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
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

        {/* مربع حوار تأكيد إعادة تعيين الجهاز */}
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>إعادة تعيين ربط الجهاز</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من إعادة تعيين الكود {codeToReset?.code}؟ سيتم فك ربط الجهاز وحذف كلمة المرور، ويُطلب من الطالب إعادة التفعيل.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={resetting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetConfirm}
                disabled={resetting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {resetting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري إعادة التعيين...
                  </>
                ) : (
                  'إعادة التعيين'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* مربع حوار تأكيد الحذف المتعدد */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف المتعدد</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف <strong>{selectedIds.size}</strong> كود بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={bulkDeleting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-destructive hover:bg-destructive/90"
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
      </div>
    </AdminLayout>
  );
};

export default AccessCodesManagement;
