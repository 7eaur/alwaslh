
-- ===== quiz_attempts =====
-- حذف السياسات المعتمدة على student_id أولاً
DROP POLICY "Students can read their own quiz results" ON quiz_attempts;
DROP POLICY "Admins can read all quiz results" ON quiz_attempts;
DROP POLICY "Students can insert their own quiz results" ON quiz_attempts;

-- حذف الـ FK
ALTER TABLE quiz_attempts DROP CONSTRAINT quiz_attempts_student_id_fkey;

-- تغيير نوع student_id إلى text
ALTER TABLE quiz_attempts ALTER COLUMN student_id TYPE text USING student_id::text;

-- إعادة سياسات quiz_attempts
CREATE POLICY "anon_insert_quiz_attempts_v2" ON quiz_attempts
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_quiz_attempts_v2" ON quiz_attempts
  FOR SELECT TO anon USING (true);

CREATE POLICY "auth_all_quiz_attempts" ON quiz_attempts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===== quiz_progress =====
DROP POLICY "Students can manage their own progress" ON quiz_progress;
DROP POLICY "Admins can view all progress" ON quiz_progress;

-- حذف الـ FK
ALTER TABLE quiz_progress DROP CONSTRAINT quiz_progress_student_id_fkey;

-- تغيير نوع student_id إلى text
ALTER TABLE quiz_progress ALTER COLUMN student_id TYPE text USING student_id::text;

-- إعادة سياسات quiz_progress
CREATE POLICY "anon_all_quiz_progress_v2" ON quiz_progress
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_quiz_progress" ON quiz_progress
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
