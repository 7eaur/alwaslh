import React from 'react';
import { useQuestionGeneration } from '@/contexts/QuestionGenerationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GenerationTaskIndicator: React.FC = () => {
  const { activeTasks, tasks, clearCompletedTasks, cancelTask } = useQuestionGeneration();

  if (tasks.length === 0) return null;

  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled');
  const showCompleted = completedTasks.length > 0 && activeTasks.length === 0;

  const handleCancelTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من إلغاء هذه المهمة؟')) {
      await cancelTask(taskId);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-slide-in">
      {activeTasks.length > 0 && (
        <Card className="border-2 border-primary/20 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <div className="flex-1">
                <h4 className="font-black text-sm text-primary">جاري توليد الأسئلة</h4>
                <p className="text-xs text-muted-foreground">
                  {activeTasks.length} مهمة قيد التنفيذ
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={clearCompletedTasks}
                title="مسح الكل"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {activeTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-primary">
                          {task.task_type === 'questions' ? 'توليد الأسئلة' : 
                           task.task_type === 'summary' ? 'توليد الملخص' : 
                           task.task_type === 'text' ? 'استخراج النص' : 'توليد شامل'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground font-bold">{task.progress}%</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => handleCancelTask(task.id, e)}
                            title="إلغاء المهمة"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {activeTasks.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{activeTasks.length - 5} مهمة أخرى
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showCompleted && (
        <>
          {/* عرض المهام الفاشلة */}
          {completedTasks.filter(t => t.status === 'failed').length > 0 && (
            <Card className="border-2 border-red-200 shadow-2xl bg-white/95 backdrop-blur-sm mb-3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-red-900">❌ فشل التوليد</h4>
                    <p className="text-xs text-muted-foreground">
                      {completedTasks.filter(t => t.status === 'failed').length} مهمة فاشلة
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={clearCompletedTasks}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* عرض رسائل الخطأ */}
                <div className="space-y-2 mt-3">
                  {completedTasks.filter(t => t.status === 'failed').map((task) => (
                    <div key={task.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-900 mb-1">
                        {task.task_type === 'summary' && '📝 توليد الملخص'}
                        {task.task_type === 'questions' && '❓ توليد الأسئلة'}
                        {task.task_type === 'text' && '📄 استخراج النص'}
                        {task.task_type === 'comprehensive' && '🎯 معالجة شاملة'}
                      </p>
                      <p className="text-xs text-red-700">
                        {task.error || 'حدث خطأ غير متوقع'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* عرض المهام المكتملة بنجاح */}
          {completedTasks.filter(t => t.status === 'completed').length > 0 && (
            <Card className="border-2 border-green-200 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-green-900">✅ اكتمل التوليد</h4>
                    <p className="text-xs text-muted-foreground">
                      {completedTasks.filter(t => t.status === 'completed').length} مهمة مكتملة
                      {completedTasks.filter(t => t.status === 'cancelled').length > 0 && 
                        ` • ${completedTasks.filter(t => t.status === 'cancelled').length} ملغاة`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={clearCompletedTasks}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
