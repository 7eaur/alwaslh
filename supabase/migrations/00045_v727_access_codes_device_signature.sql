ALTER TABLE public.access_codes
ADD COLUMN IF NOT EXISTS device_signature text;

CREATE INDEX IF NOT EXISTS idx_access_codes_device_signature ON public.access_codes(device_signature);