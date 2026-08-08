
-- جدول ربط المادة بصفوف دراسية إضافية (بخلاف الصف الأساسي في subjects.class_id)
CREATE TABLE subject_extra_classes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id   uuid NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_id, class_id)
);

-- RLS
ALTER TABLE subject_extra_classes ENABLE ROW LEVEL SECURITY;

-- أي شخص يقرأ (الطلاب يحتاجون للقراءة لمعرفة المواد المتاحة)
CREATE POLICY "public_read_subject_extra_classes"
  ON subject_extra_classes FOR SELECT
  USING (true);

-- فقط المصادقون (المدير) يعدّلون
CREATE POLICY "admin_insert_subject_extra_classes"
  ON subject_extra_classes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_delete_subject_extra_classes"
  ON subject_extra_classes FOR DELETE
  TO authenticated
  USING (true);

-- تفعيل Realtime لمزامنة التغييرات
ALTER PUBLICATION supabase_realtime ADD TABLE subject_extra_classes;
