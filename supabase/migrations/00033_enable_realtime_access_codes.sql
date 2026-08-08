-- تفعيل Realtime على جدول الأكواد لاستقبال أحداث الحذف فورياً
ALTER TABLE access_codes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE access_codes;