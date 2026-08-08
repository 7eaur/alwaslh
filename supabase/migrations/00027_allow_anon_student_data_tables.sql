
-- السماح للـ anon بإدارة student_notes (student_id = device_id)
CREATE POLICY "anon_all_student_notes"
ON student_notes
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- السماح للـ anon بإدراج وقراءة quiz_attempts (الحالية تخص public فقط)
CREATE POLICY "anon_insert_quiz_attempts"
ON quiz_attempts
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anon_select_quiz_attempts"
ON quiz_attempts
FOR SELECT
TO anon
USING (true);

-- السماح للـ anon بإدارة quiz_progress
CREATE POLICY "anon_all_quiz_progress"
ON quiz_progress
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- السماح للـ anon بقراءة student_achievements
CREATE POLICY "anon_select_student_achievements"
ON student_achievements
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon_insert_student_achievements"
ON student_achievements
FOR INSERT
TO anon
WITH CHECK (true);
