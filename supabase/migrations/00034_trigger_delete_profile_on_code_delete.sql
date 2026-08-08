-- دالة تحذف الـ profile عند حذف كود التفعيل المستخدم
CREATE OR REPLACE FUNCTION handle_access_code_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- حذف الـ profile المرتبط بالكود المحذوف
  DELETE FROM public.profiles
  WHERE username = OLD.code
     OR full_access_code = OLD.code;
  RETURN OLD;
END;
$$;

-- تعيين الـ trigger على جدول access_codes عند الحذف
DROP TRIGGER IF EXISTS on_access_code_deleted ON access_codes;
CREATE TRIGGER on_access_code_deleted
  AFTER DELETE ON access_codes
  FOR EACH ROW
  EXECUTE FUNCTION handle_access_code_deleted();