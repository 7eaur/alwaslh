-- إضافة ربط حساب الطالب بكود التفعيل
ALTER TABLE access_codes
ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- إضافة بيانات إضافية للملف الشخصي
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS install_prompt_shown boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tutorial_shown boolean DEFAULT false;

-- ربط الأكواد المفعلة الحالية بملفات الطلاب الموجودة
UPDATE access_codes ac
SET profile_id = p.id
FROM profiles p
WHERE ac.code = p.username
  AND ac.profile_id IS NULL
  AND ac.is_used = true;

-- ترحيل بيانات الطلاب القدامى من رقم الكود إلى معرّف الحساب
UPDATE student_notes sn
SET student_id = ac.profile_id::text
FROM access_codes ac
WHERE sn.student_id = ac.code
  AND ac.profile_id IS NOT NULL;

UPDATE saved_questions sq
SET student_id = ac.profile_id::text
FROM access_codes ac
WHERE sq.student_id = ac.code
  AND ac.profile_id IS NOT NULL;

UPDATE quiz_attempts qa
SET student_id = ac.profile_id::text
FROM access_codes ac
WHERE qa.student_id = ac.code
  AND ac.profile_id IS NOT NULL;

UPDATE student_achievements sa
SET student_id = ac.profile_id::text
FROM access_codes ac
WHERE sa.student_id = ac.code
  AND ac.profile_id IS NOT NULL;

UPDATE quiz_progress qp
SET student_id = ac.profile_id::text
FROM access_codes ac
WHERE qp.student_id = ac.code
  AND ac.profile_id IS NOT NULL;

-- سياسات إضافية للطالب المصادق للوصول إلى بياناته
DROP POLICY IF EXISTS students_select_own_notes ON public.student_notes;
CREATE POLICY students_select_own_notes ON public.student_notes
  FOR SELECT TO authenticated USING (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_insert_own_notes ON public.student_notes;
CREATE POLICY students_insert_own_notes ON public.student_notes
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_update_own_notes ON public.student_notes;
CREATE POLICY students_update_own_notes ON public.student_notes
  FOR UPDATE TO authenticated USING (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_delete_own_notes ON public.student_notes;
CREATE POLICY students_delete_own_notes ON public.student_notes
  FOR DELETE TO authenticated USING (student_id = auth.uid()::text);

DROP POLICY IF EXISTS students_select_own_saved_questions ON public.saved_questions;
CREATE POLICY students_select_own_saved_questions ON public.saved_questions
  FOR SELECT TO authenticated USING (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_insert_own_saved_questions ON public.saved_questions;
CREATE POLICY students_insert_own_saved_questions ON public.saved_questions
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_delete_own_saved_questions ON public.saved_questions;
CREATE POLICY students_delete_own_saved_questions ON public.saved_questions
  FOR DELETE TO authenticated USING (student_id = auth.uid()::text);

DROP POLICY IF EXISTS students_select_own_quiz_attempts ON public.quiz_attempts;
CREATE POLICY students_select_own_quiz_attempts ON public.quiz_attempts
  FOR SELECT TO authenticated USING (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_insert_own_quiz_attempts ON public.quiz_attempts;
CREATE POLICY students_insert_own_quiz_attempts ON public.quiz_attempts
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid()::text);

DROP POLICY IF EXISTS students_select_own_achievements ON public.student_achievements;
CREATE POLICY students_select_own_achievements ON public.student_achievements
  FOR SELECT TO authenticated USING (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_insert_own_achievements ON public.student_achievements;
CREATE POLICY students_insert_own_achievements ON public.student_achievements
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid()::text);

DROP POLICY IF EXISTS students_select_own_quiz_progress ON public.quiz_progress;
CREATE POLICY students_select_own_quiz_progress ON public.quiz_progress
  FOR SELECT TO authenticated USING (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_insert_own_quiz_progress ON public.quiz_progress;
CREATE POLICY students_insert_own_quiz_progress ON public.quiz_progress
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid()::text);
DROP POLICY IF EXISTS students_update_own_quiz_progress ON public.quiz_progress;
CREATE POLICY students_update_own_quiz_progress ON public.quiz_progress
  FOR UPDATE TO authenticated USING (student_id = auth.uid()::text);
