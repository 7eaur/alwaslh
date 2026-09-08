BEGIN;

-- Preview-only hardening for Supabase. The application never authorizes through
-- PostgREST; all business access goes through apps/api and direct PostgreSQL.
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon', r.tablename);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM authenticated', r.tablename);
  END LOOP;
END $$;

REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;

COMMIT;
