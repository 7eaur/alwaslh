-- تحديث جدول profiles لدعم نظام الحساب الموحد

-- 1. إضافة حقل full_access_code لتخزين كود 6 خانات
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_access_code TEXT;

-- 2. إضافة حقل password لتخزين كلمة المرور (أرقام فقط)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. تعديل حقل activated_subjects ليخزن معلومات تفصيلية
-- البنية الجديدة: [{subject_id, code, activated_at, expires_at}]
-- لا حاجة لتعديل النوع، JSONB يدعم أي بنية

-- 4. إضافة فهرس على username للبحث السريع
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 5. إضافة فهرس على device_id
CREATE INDEX IF NOT EXISTS idx_profiles_device_id ON profiles(device_id);

-- 6. إضافة قيد unique على username (حروف فقط)
-- سنتحقق من ذلك في الكود، لكن نضيف القيد هنا أيضاً
ALTER TABLE profiles 
ADD CONSTRAINT unique_username UNIQUE (username);