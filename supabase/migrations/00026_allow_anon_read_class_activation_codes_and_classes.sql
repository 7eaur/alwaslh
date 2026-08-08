
-- السماح للـ anon بقراءة class_activation_codes (للتحقق من كود الصف)
CREATE POLICY "anon_read_class_activation_codes"
ON class_activation_codes
FOR SELECT
TO anon
USING (true);

-- السماح للـ anon بتحديث class_activation_codes (لتفعيل الكود)
CREATE POLICY "anon_update_class_activation_codes"
ON class_activation_codes
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- السماح للـ anon بقراءة classes (لعرض اسم الصف)
CREATE POLICY "anon_read_classes"
ON classes
FOR SELECT
TO anon
USING (true);

-- السماح للـ anon بقراءة subjects (لعرض المواد)
CREATE POLICY "anon_read_subjects"
ON subjects
FOR SELECT
TO anon
USING (true);

-- السماح للـ anon بقراءة lessons (لعرض الدروس)
CREATE POLICY "anon_read_lessons"
ON lessons
FOR SELECT
TO anon
USING (true);

-- السماح للـ anon بقراءة quizzes (لعرض الاختبارات)
CREATE POLICY "anon_read_quizzes"
ON quizzes
FOR SELECT
TO anon
USING (true);

-- السماح للـ anon بقراءة notifications (للإشعارات)
CREATE POLICY "anon_read_notifications"
ON notifications
FOR SELECT
TO anon
USING (true);
