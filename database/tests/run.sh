#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
: "${TEST_DATABASE_URL:?TEST_DATABASE_URL must point to a disposable PostgreSQL database}"

command -v psql >/dev/null 2>&1 || { echo 'FAIL: psql not found' >&2; exit 1; }
command -v pg_dump >/dev/null 2>&1 || { echo 'FAIL: pg_dump not found' >&2; exit 1; }

export PGOPTIONS='-c client_min_messages=warning'

printf '[Stage 4] PostgreSQL version\n'
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc 'select version();'

printf '[Stage 4] Applying clean migrations\n'
for migration in "$ROOT"/database/migrations/*.sql; do
  printf '  -> %s\n' "$(basename "$migration")"
  psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

printf '[Stage 4] Running schema smoke tests\n'
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/database/tests/schema_smoke.sql"

printf '[Stage 4] Checking schema dump can be produced\n'
pg_dump "$TEST_DATABASE_URL" --schema-only --no-owner --no-privileges >/tmp/alwaslh-schema.sql
test -s /tmp/alwaslh-schema.sql

grep -q 'CREATE TABLE public.profiles' /tmp/alwaslh-schema.sql
grep -q 'CREATE TABLE public.student_entitlements' /tmp/alwaslh-schema.sql
grep -q 'CREATE TABLE public.practice_sessions' /tmp/alwaslh-schema.sql
grep -q 'CREATE TABLE public.ai_jobs' /tmp/alwaslh-schema.sql
grep -q 'CREATE TABLE public.content_revisions' /tmp/alwaslh-schema.sql
grep -q 'CREATE TABLE public.media_assets' /tmp/alwaslh-schema.sql
grep -q 'CREATE TABLE public.student_devices' /tmp/alwaslh-schema.sql
grep -q 'CREATE TABLE public.ocr_extractions' /tmp/alwaslh-schema.sql

printf '[Stage 4] Checking required constraints/indexes exist\n'
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -At <<'SQL' >/tmp/alwaslh-db-contracts.txt
select conname from pg_constraint where conname in (
  'lessons_subject_class_fk',
  'full_access_codes_format',
  'class_access_codes_format',
  'practice_answers_presented_option_fk',
  'practice_sessions_current_question_fk',
  'quiz_attempts_profile_session_fk',
  'quiz_attempts_version_session_fk',
  'quiz_attempts_quiz_version_fk',
  'ocr_extractions_identity_unique',
  'ocr_extractions_running_lease_shape',
  'ocr_extractions_confidence_range'
) order by conname;
select indexname from pg_indexes where indexname in (
  'ux_active_all_content_entitlement',
  'ux_active_class_entitlement',
  'ux_question_single_correct_option',
  'idx_ocr_extractions_ready',
  'idx_ocr_extractions_search_approved'
) order by indexname;
SQL
for required in \
  lessons_subject_class_fk \
  full_access_codes_format \
  class_access_codes_format \
  practice_answers_presented_option_fk \
  practice_sessions_current_question_fk \
  quiz_attempts_profile_session_fk \
  quiz_attempts_version_session_fk \
  quiz_attempts_quiz_version_fk \
  ocr_extractions_identity_unique \
  ocr_extractions_running_lease_shape \
  ocr_extractions_confidence_range \
  ux_active_all_content_entitlement \
  ux_active_class_entitlement \
  ux_question_single_correct_option \
  idx_ocr_extractions_ready \
  idx_ocr_extractions_search_approved; do
  grep -qx "$required" /tmp/alwaslh-db-contracts.txt || { echo "FAIL: missing DB contract $required" >&2; exit 1; }
done

printf 'PASS: Stage 4 migrations + smoke tests + schema dump + DB contracts\n'
