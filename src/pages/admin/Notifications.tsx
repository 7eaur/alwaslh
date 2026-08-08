import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/db/api';
import { Notification } from '@/types';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Loader2, 
  Send,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async () => {
    if (!newTitle || !newMessage) return;
    setIsSubmitting(true);
    try {
      await adminApi.createNotification(newTitle, newMessage);
      toast({ title: 'تم الإرسال', description: 'تم إرسال الإشعار لجميع الطلاب' });
      setNewTitle('');
      setNewMessage('');
      setIsAddDialogOpen(false);
      fetchData();
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في الإرسال' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الإشعار؟')) return;
    
    try {
      await adminApi.deleteNotification(id);
      toast({ title: 'تم الحذف', description: 'تم حذف الإشعار بنجاح' });
      // تحديث القائمة محلياً
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ في الحذف', description: 'فشل حذف الإشعار' });
    }
  };

  return (
    <AdminLayout title="إدارة الإشعارات">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
             <Bell className="h-6 w-6" />
             إشعارات الطلاب
           </h2>
           <p className="text-muted-foreground text-sm">إرسال تنبيهات وتحديثات لجميع مستخدمي التطبيق</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              إرسال إشعار جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2 text-primary">
                <Send className="h-6 w-6 text-secondary" />
                إرسال تنبيه جديد
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-medium">عنوان الإشعار</label>
                 <Input 
                   placeholder="مثلاً: تم إضافة دروس جديدة لمادة الفيزياء" 
                   value={newTitle}
                   onChange={(e) => setNewTitle(e.target.value)}
                   className="h-12 rounded-xl bg-muted/20 border-none"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">محتوى الإشعار</label>
                 <Textarea 
                   placeholder="اكتب تفاصيل الإشعار هنا..." 
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   className="min-h-[120px] rounded-xl bg-muted/20 border-none resize-none"
                 />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSend} disabled={isSubmitting || !newTitle || !newMessage} className="w-full rounded-xl h-12 text-lg shadow-md shadow-primary/20">
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "إرسال الآن"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl bg-muted" />
          ))
        ) : notifications.length === 0 ? (
          <Card className="border-none shadow-md rounded-2xl bg-white p-20 text-center">
             <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-10 w-10 text-primary opacity-20" />
             </div>
             <p className="text-xl font-medium text-muted-foreground">لم يتم إرسال أي إشعارات بعد</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="border-none shadow-md rounded-2xl bg-white overflow-hidden group animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-1">{n.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                         <Calendar className="h-3 w-3" />
                         {new Date(n.created_at).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(n.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
