BEGIN;

-- Preview-only hardening for Stage 10 tables added after the initial Supabase lockdown.
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_variants ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.media_assets FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.media_assets FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.media_variants FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.media_variants FROM authenticated;

COMMIT;
