
-- حذف السياسات القديمة
DROP POLICY "Students can delete saved questions" ON saved_questions;
DROP POLICY "Students can view own saved questions" ON saved_questions;
DROP POLICY "Students can save questions" ON saved_questions;

-- حذف الـ FK القديم المرتبط بـ auth.users
ALTER TABLE saved_questions DROP CONSTRAINT saved_questions_student_id_fkey;

-- تغيير نوع student_id من uuid إلى text
ALTER TABLE saved_questions ALTER COLUMN student_id TYPE text USING student_id::text;

-- سياسة: قراءة (anon يُفلتر بـ student_id في الكود)
CREATE POLICY "anon_select_saved_questions"
ON saved_questions FOR SELECT TO anon
USING (true);

-- سياسة: إدراج
CREATE POLICY "anon_insert_saved_questions"
ON saved_questions FOR INSERT TO anon
WITH CHECK (true);

-- سياسة: حذف
CREATE POLICY "anon_delete_saved_questions"
ON saved_questions FOR DELETE TO anon
USING (true);

-- سياسة: إدارة كاملة للـ authenticated (مدير)
CREATE POLICY "auth_manage_saved_questions"
ON saved_questions FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
