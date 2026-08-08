-- السماح للمستخدمين غير المسجلين بقراءة المواد (لصفحة تسجيل الدخول)
CREATE POLICY "Anyone can read subjects"
ON subjects
FOR SELECT
TO anon
USING (true);