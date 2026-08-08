
-- حذف السياسة أولاً ثم تغيير النوع
DROP POLICY "Students can manage their own notes" ON student_notes;

-- حذف الـ FK المرتبط بـ auth.users
ALTER TABLE student_notes DROP CONSTRAINT student_notes_student_id_fkey;

-- تغيير نوع student_id من uuid إلى text
ALTER TABLE student_notes ALTER COLUMN student_id TYPE text USING student_id::text;

-- سياسة: إدارة كاملة للـ anon (الطالب بدون auth)
CREATE POLICY "anon_manage_student_notes"
ON student_notes FOR ALL TO anon
USING (true)
WITH CHECK (true);

-- سياسة: إدارة كاملة للـ authenticated (مدير)
CREATE POLICY "auth_manage_student_notes"
ON student_notes FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
