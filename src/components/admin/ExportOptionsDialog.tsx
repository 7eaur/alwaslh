import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ExportOptions } from '@/lib/export';
import { FileText, CheckCircle2, List, HelpCircle, Paperclip, CheckSquare, Image, FileType } from 'lucide-react';

interface ExportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: ExportOptions) => void;
  lessonCount: number;
}

export const ExportOptionsDialog: React.FC<ExportOptionsDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  lessonCount
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    titlesOnly: false,
    titlesAndPages: false,
    questionsOnlyNoAnswers: false,
    titlesPagesQuestions: true,
    questionsWithAnswers: false,
    questionsWithOptionsNoCorrect: false,
    numCorrectAndAttachments: false,
    numCorrectOnly: false,
    numAnswerSymbolOnly: false,
    attachmentsOnly: false,
    lessonImages: false,
    lessonSummary: false,
  });

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = () => {
    console.log('ExportOptionsDialog: handleConfirm called with options:', options);
    
    // Check if at least one option is selected
    const hasSelection = Object.values(options).some(v => v === true);
    if (!hasSelection) {
      console.warn('No export options selected');
      alert('يرجى اختيار خيار واحد على الأقل للتصدير');
      return;
    }
    
    // Close dialog and trigger export immediately (no setTimeout to avoid popup blocker)
    onOpenChange(false);
    onConfirm(options);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-primary text-center mb-4">خيارات تصدير PDF</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <p className="text-sm text-muted-foreground text-center font-bold mb-4">
            تصدير {lessonCount} درس/دروس. اختر المعلومات التي تريد تضمينها في الملف:
          </p>
          
          <div className="grid gap-3">
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('titlesOnly')}>
              <Checkbox checked={options.titlesOnly} onCheckedChange={() => toggleOption('titlesOnly')} />
              <div className="flex-1 flex items-center gap-3">
                <List className="h-5 w-5 text-blue-500" />
                <Label className="font-bold cursor-pointer">أسماء الدروس فقط</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('titlesAndPages')}>
              <Checkbox checked={options.titlesAndPages} onCheckedChange={() => toggleOption('titlesAndPages')} />
              <div className="flex-1 flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-500" />
                <Label className="font-bold cursor-pointer">العناوين مع أرقام الصفحات</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('questionsOnlyNoAnswers')}>
              <Checkbox checked={options.questionsOnlyNoAnswers} onCheckedChange={() => toggleOption('questionsOnlyNoAnswers')} />
              <div className="flex-1 flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-orange-500" />
                <Label className="font-bold cursor-pointer">الأسئلة فقط (بدون إجابات)</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('titlesPagesQuestions')}>
              <Checkbox checked={options.titlesPagesQuestions} onCheckedChange={() => toggleOption('titlesPagesQuestions')} />
              <div className="flex-1 flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <Label className="font-bold cursor-pointer">العناوين والصفحات والأسئلة</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('questionsWithAnswers')}>
              <Checkbox checked={options.questionsWithAnswers} onCheckedChange={() => toggleOption('questionsWithAnswers')} />
              <div className="flex-1 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <Label className="font-bold cursor-pointer">الأسئلة مع الإجابات النموذجية</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('questionsWithOptionsNoCorrect')}>
              <Checkbox checked={options.questionsWithOptionsNoCorrect} onCheckedChange={() => toggleOption('questionsWithOptionsNoCorrect')} />
              <div className="flex-1 flex items-center gap-3">
                <List className="h-5 w-5 text-purple-500" />
                <Label className="font-bold cursor-pointer">الأسئلة مع الخيارات (بدون تحديد الصحيحة)</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('numCorrectAndAttachments')}>
              <Checkbox checked={options.numCorrectAndAttachments} onCheckedChange={() => toggleOption('numCorrectAndAttachments')} />
              <div className="flex-1 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <Label className="font-bold cursor-pointer">رقم السؤال والإجابة الصحيحة والمرفقات</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('numCorrectOnly')}>
              <Checkbox checked={options.numCorrectOnly} onCheckedChange={() => toggleOption('numCorrectOnly')} />
              <div className="flex-1 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-red-500" />
                <Label className="font-bold cursor-pointer">رقم السؤال مع الإجابة الصحيحة فقط</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('numAnswerSymbolOnly')}>
              <Checkbox checked={options.numAnswerSymbolOnly} onCheckedChange={() => toggleOption('numAnswerSymbolOnly')} />
              <div className="flex-1 flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-pink-500" />
                <Label className="font-bold cursor-pointer">رقم السؤال مع رمز الإجابة</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('attachmentsOnly')}>
              <Checkbox checked={options.attachmentsOnly} onCheckedChange={() => toggleOption('attachmentsOnly')} />
              <div className="flex-1 flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-amber-500" />
                <Label className="font-bold cursor-pointer">المرفقات والتوضيحات فقط</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('lessonImages')}>
              <Checkbox checked={options.lessonImages} onCheckedChange={() => toggleOption('lessonImages')} />
              <div className="flex-1 flex items-center gap-3">
                <Image className="h-5 w-5 text-teal-500" />
                <Label className="font-bold cursor-pointer">صور الدرس</Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border rounded-2xl hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => toggleOption('lessonSummary')}>
              <Checkbox checked={options.lessonSummary} onCheckedChange={() => toggleOption('lessonSummary')} />
              <div className="flex-1 flex items-center gap-3">
                <FileType className="h-5 w-5 text-cyan-500" />
                <Label className="font-bold cursor-pointer">ملخص الدرس</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleConfirm} className="w-full h-12 rounded-xl font-bold text-lg">
            بدء التصدير
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-12 rounded-xl font-bold">
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
