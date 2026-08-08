
-- حذف السياسات المعتمدة على student_id
DROP POLICY "Students can view their own achievements" ON student_achievements;
DROP POLICY "Admins can manage achievements" ON student_achievements;

-- حذف الـ FK
ALTER TABLE student_achievements DROP CONSTRAINT student_achievements_student_id_fkey;

-- تغيير نوع student_id إلى text
ALTER TABLE student_achievements ALTER COLUMN student_id TYPE text USING student_id::text;

-- إعادة السياسات
CREATE POLICY "anon_all_student_achievements" ON student_achievements
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_student_achievements" ON student_achievements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
