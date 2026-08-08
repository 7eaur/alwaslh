-- Enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'student');

-- Profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE NOT NULL,
  role public.user_role DEFAULT 'student',
  device_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Classes table
CREATE TABLE public.classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Subjects table
CREATE TABLE public.subjects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Lessons table
CREATE TABLE public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  image_urls text[] DEFAULT '{}',
  summary text,
  ai_questions jsonb DEFAULT '[]',
  page_number integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Access Codes table
CREATE TABLE public.access_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  device_id text,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- Student Notes table
CREATE TABLE public.student_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper to check if admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'::public.user_role
  );
$$;

-- Trigger to sync profile on user confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  v_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (e.g., student@miaoda.com -> student)
  v_username := split_part(NEW.email, '@', 1);

  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    v_username,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'student'::public.user_role END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Policies
-- Profiles
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Classes, Subjects, Lessons, Notifications
CREATE POLICY "Admins have full access to education data" ON classes FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins have full access to subjects" ON subjects FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins have full access to lessons" ON lessons FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins have full access to notifications" ON notifications FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Students can read education data" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can read subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can read lessons" ON lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can read notifications" ON notifications FOR SELECT TO authenticated USING (true);

-- Access Codes
CREATE POLICY "Admins can manage codes" ON access_codes FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Public can read codes to verify" ON access_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can update codes to use them" ON access_codes FOR UPDATE TO anon, authenticated USING (true);

-- Student Notes
CREATE POLICY "Students can manage their own notes" ON student_notes FOR ALL TO authenticated USING (auth.uid() = student_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson_content', 'lesson_content', true);

-- Storage policies
CREATE POLICY "Admins can upload content" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson_content' AND is_admin(auth.uid()));

CREATE POLICY "Anyone can view lesson content" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'lesson_content');
