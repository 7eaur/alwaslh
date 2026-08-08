-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_code text NOT NULL DEFAULT '732742752',
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial admin settings
INSERT INTO public.admin_settings (id, admin_code)
VALUES (1, '732742752')
ON CONFLICT (id) DO NOTHING;

-- Policies for admin settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view settings" ON public.admin_settings
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update settings" ON public.admin_settings
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (id = 1);

-- Allow public (anon) to check admin code during login
CREATE OR REPLACE FUNCTION public.check_admin_code(p_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_settings WHERE admin_code = p_code
  );
END;
$$;
