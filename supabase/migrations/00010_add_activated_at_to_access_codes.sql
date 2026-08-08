ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS activated_at timestamp with time zone;

-- Update existing codes if they are used but don't have activated_at
UPDATE public.access_codes 
SET activated_at = created_at 
WHERE is_used = true AND activated_at IS NULL;

-- Ensure expires_at is set for used codes
UPDATE public.access_codes
SET expires_at = activated_at + interval '1 year'
WHERE is_used = true AND activated_at IS NOT NULL AND expires_at IS NULL;
