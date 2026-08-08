-- إضافة حقل activated_subjects إلى جدول profiles
-- يحتوي على array من المواد المفعلة بأكواد 7 خانات
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activated_subjects JSONB DEFAULT '[]'::jsonb;

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_profiles_activated_subjects ON profiles USING gin(activated_subjects);