-- تفعيل Realtime لجدول profiles لمراقبة حذف الحسابات
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;