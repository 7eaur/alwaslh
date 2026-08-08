-- جدول أكواد تفعيل المواد (7 خانات)
CREATE TABLE IF NOT EXISTS subject_activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (length(code) = 7 AND code ~ '^[0-9]+$'),
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_subject_codes_code ON subject_activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_subject_codes_used ON subject_activation_codes(used);

-- تفعيل RLS
ALTER TABLE subject_activation_codes ENABLE ROW LEVEL SECURITY;

-- المدير: يمكنه رؤية وإدارة جميع الأكواد
CREATE POLICY admin_all_subject_codes ON subject_activation_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- أي شخص يمكنه التحقق من صلاحية الكود (للتفعيل)
CREATE POLICY anyone_validate_subject_codes ON subject_activation_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);