
-- إنشاء دالة لمزامنة كلمة مرور المدير مع رمز المدير الحالي
CREATE OR REPLACE FUNCTION public.sync_admin_password(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(p_code, gen_salt('bf'))
  WHERE email = 'admin@miaoda.com';
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_admin_password(text) TO anon;
GRANT EXECUTE ON FUNCTION public.sync_admin_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_admin_password(text) TO service_role;

NOTIFY pgrst, 'reload schema';
