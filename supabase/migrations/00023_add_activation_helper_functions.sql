-- دوال مساعدة للتحقق من صلاحية الأكواد

-- 1. دالة للتحقق من صلاحية تفعيل مادة (لم تنتهي الصلاحية)
CREATE OR REPLACE FUNCTION is_subject_active(
  p_profile_id UUID,
  p_subject_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activation JSONB;
  v_expires_at TIMESTAMP;
BEGIN
  -- البحث عن تفعيل المادة في activated_subjects
  SELECT jsonb_array_elements(activated_subjects)
  INTO v_activation
  FROM profiles
  WHERE id = p_profile_id
    AND jsonb_typeof(activated_subjects) = 'array'
    AND activated_subjects @> jsonb_build_array(
      jsonb_build_object('subject_id', p_subject_id::text)
    )
  LIMIT 1;
  
  -- إذا لم يُعثر على تفعيل
  IF v_activation IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- التحقق من تاريخ الانتهاء
  v_expires_at := (v_activation->>'expires_at')::TIMESTAMP;
  
  RETURN v_expires_at > NOW();
END;
$$;

-- 2. دالة للحصول على جميع المواد المفعلة والنشطة
CREATE OR REPLACE FUNCTION get_active_subjects(p_profile_id UUID)
RETURNS TABLE(subject_id UUID, code TEXT, activated_at TIMESTAMP, expires_at TIMESTAMP)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (elem->>'subject_id')::UUID,
    elem->>'code',
    (elem->>'activated_at')::TIMESTAMP,
    (elem->>'expires_at')::TIMESTAMP
  FROM profiles,
       jsonb_array_elements(activated_subjects) AS elem
  WHERE profiles.id = p_profile_id
    AND jsonb_typeof(activated_subjects) = 'array'
    AND (elem->>'expires_at')::TIMESTAMP > NOW();
END;
$$;

-- 3. دالة لإضافة تفعيل مادة جديدة
CREATE OR REPLACE FUNCTION add_subject_activation(
  p_profile_id UUID,
  p_subject_id UUID,
  p_code TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_activation JSONB;
  v_expires_at TIMESTAMP;
BEGIN
  -- حساب تاريخ الانتهاء (سنة من الآن)
  v_expires_at := NOW() + INTERVAL '1 year';
  
  -- بناء كائن التفعيل الجديد
  v_new_activation := jsonb_build_object(
    'subject_id', p_subject_id::text,
    'code', p_code,
    'activated_at', NOW()::text,
    'expires_at', v_expires_at::text
  );
  
  -- إضافة التفعيل للمصفوفة
  UPDATE profiles
  SET activated_subjects = COALESCE(activated_subjects, '[]'::jsonb) || v_new_activation
  WHERE id = p_profile_id;
  
  RETURN FOUND;
END;
$$;