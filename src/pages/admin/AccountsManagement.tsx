import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { Loader2, Search, Trash2, User, Calendar, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

interface StudentAccount {
  id: string;
  username: string;
  created_at: string;
  full_access_code: string | null;
  device_id: string | null;
}

const AccountsManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<StudentAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAccounts(accounts);
    } else {
      const filtered = accounts.filter(account =>
        account.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAccounts(filtered);
    }
  }, [searchQuery, accounts]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, created_at, full_access_code, device_id')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
      setFilteredAccounts(data || []);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: err.message || 'فشل جلب الحسابات',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (account: StudentAccount) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    setDeleting(true);
    try {
      // استدعاء Edge Function لحذف المستخدم
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: accountToDelete.id },
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'تم الحذف بنجاح',
        description: `تم حذف حساب ${accountToDelete.username}`,
      });

      fetchAccounts();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: err.message || 'فشل حذف الحساب',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  return (
    <AdminLayout title="إدارة الحسابات">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة الحسابات</h1>
        </div>

        {/* البحث */}
        <Card>
          <CardHeader>
            <CardTitle>البحث عن حساب</CardTitle>
            <CardDescription>
              ابحث عن حساب طالب باسم المستخدم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم المستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* قائمة الحسابات */}
        <Card>
          <CardHeader>
            <CardTitle>جميع الحسابات المسجلة</CardTitle>
            <CardDescription>
              عدد الحسابات: {filteredAccounts.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد حسابات مسجلة'}
              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المستخدم</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{account.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(account.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {account.full_access_code ? (
                            <Badge variant="default" className="gap-1">
                              <Shield className="h-3 w-3" />
                              وصول كامل
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              تجربة مجانية
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(account)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* مربع حوار تأكيد الحذف */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حذف الحساب</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف حساب <strong>{accountToDelete?.username}</strong>؟
                <br />
                سيتم حذف جميع بيانات الحساب ولا يمكن التراجع عن هذا الإجراء.
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
                  'حذف الحساب'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AccountsManagement;
