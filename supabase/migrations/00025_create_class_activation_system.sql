-- حذف جدول أكواد المواد القديم
DROP TABLE IF EXISTS subject_activation_codes CASCADE;

-- إنشاء جدول أكواد الصفوف (7 خانات)
CREATE TABLE class_activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (length(code) = 7 AND code ~ '^\d+$'),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false,
  device_id TEXT,
  activated_at TIMESTAMPTZ
);

-- إنشاء جدول تفعيلات الصفوف للطلاب
CREATE TABLE student_class_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(student_id, class_id)
);

-- Indexes
CREATE INDEX idx_class_codes_code ON class_activation_codes(code);
CREATE INDEX idx_class_codes_class ON class_activation_codes(class_id);
CREATE INDEX idx_student_class_activations_student ON student_class_activations(student_id);
CREATE INDEX idx_student_class_activations_class ON student_class_activations(class_id);

-- RLS Policies
ALTER TABLE class_activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_class_activations ENABLE ROW LEVEL SECURITY;

-- المدير يمكنه إدارة أكواد الصفوف
CREATE POLICY "admin_manage_class_codes" ON class_activation_codes
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- الطلاب يمكنهم قراءة أكواد الصفوف للتحقق
CREATE POLICY "students_read_class_codes" ON class_activation_codes
  FOR SELECT TO authenticated
  USING (true);

-- الطلاب يمكنهم تحديث أكواد الصفوف عند التفعيل
CREATE POLICY "students_update_class_codes" ON class_activation_codes
  FOR UPDATE TO authenticated
  USING (true);

-- الطلاب يمكنهم قراءة تفعيلاتهم
CREATE POLICY "students_read_own_activations" ON student_class_activations
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- الطلاب يمكنهم إضافة تفعيلات جديدة
CREATE POLICY "students_insert_activations" ON student_class_activations
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

-- المدير يمكنه قراءة جميع التفعيلات
CREATE POLICY "admin_read_all_activations" ON student_class_activations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));