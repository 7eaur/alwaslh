import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Trash2, Calendar, BookOpen, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ExportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReExport?: (exportRecord: any) => void;
  onOpenFile?: (exportRecord: any) => void;
}

const ExportHistoryDialog: React.FC<ExportHistoryDialogProps> = ({
  open,
  onOpenChange,
  onReExport,
  onOpenFile
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadHistory();
      setSelectedIds([]);
    }
  }, [open]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getExportHistory();
      setHistory(data);
    } catch (error: any) {
      console.error('Failed to load export history:', error);
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: 'فشل تحميل سجل التصدير'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;

    try {
      await adminApi.deleteExportHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      toast({
        title: '✅ تم الحذف',
        description: 'تم حذف السجل بنجاح'
      });
    } catch (error: any) {
      console.error('Failed to delete export history:', error);
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: 'فشل حذف السجل'
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast({
        variant: 'destructive',
        title: '⚠️ تنبيه',
        description: 'يرجى تحديد ملفات للحذف'
      });
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} ملف؟`)) return;

    setDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => adminApi.deleteExportHistory(id)));
      setHistory(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      toast({
        title: '✅ تم الحذف',
        description: `تم حذف ${selectedIds.length} ملف بنجاح`
      });
    } catch (error: any) {
      console.error('Failed to delete export history:', error);
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: 'فشل حذف بعض الملفات'
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === history.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(history.map(item => item.id));
    }
  };

  const getExportTypesSummary = (options: any) => {
    const types = [];
    if (options.titlesOnly) types.push('العناوين');
    if (options.titlesAndPages) types.push('العناوين والصفحات');
    if (options.questionsOnlyNoAnswers) types.push('الأسئلة');
    if (options.questionsWithAnswers) types.push('الأسئلة مع الإجابات');
    if (options.numCorrectOnly) types.push('رقم السؤال مع الإجابة الصحيحة');
    if (options.numAnswerSymbolOnly) types.push('رقم السؤال مع رمز الإجابة');
    if (options.lessonImages) types.push('صور الدروس');
    return types.length > 0 ? types.join(' - ') : 'تصدير مخصص';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
            <FileText className="h-7 w-7" />
            الملفات المصدرة
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">لا توجد ملفات مصدرة</p>
            <p className="text-sm">قم بتصدير بعض الدروس لتظهر هنا</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-4 p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={selectedIds.length === history.length && history.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedIds.length > 0 ? `تم تحديد ${selectedIds.length} ملف` : 'تحديد الكل'}
                </span>
              </div>
              {selectedIds.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      حذف المحدد ({selectedIds.length})
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-2xl p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedIds.includes(record.id)}
                          onCheckedChange={() => toggleSelection(record.id)}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(record.created_at), 'PPp', { locale: ar })}
                            </span>
                          </div>

                          {record.class_name && record.subject_name && (
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <span>{record.class_name} - {record.subject_name}</span>
                            </div>
                          )}

                          <div className="text-sm">
                            <span className="font-medium">الدروس: </span>
                            <span className="text-muted-foreground">
                              {record.lesson_titles?.slice(0, 2).join(' - ')}
                              {record.lesson_titles?.length > 2 && ` وآخرون (${record.lesson_titles.length} درس)`}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {getExportTypesSummary(record.export_options)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onOpenFile?.(record)}
                          className="h-9 gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          فتح الملف
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReExport?.(record)}
                          className="h-9 gap-2"
                        >
                          <Download className="h-4 w-4" />
                          إعادة التصدير
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(record.id)}
                          className="h-9 gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportHistoryDialog;
