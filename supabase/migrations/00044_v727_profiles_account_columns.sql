ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password text,
ADD COLUMN IF NOT EXISTS activated_subjects jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS full_access_code text;

CREATE INDEX IF NOT EXISTS idx_profiles_full_access_code ON public.profiles(full_access_code);