# PROJECT STATUS

- **Current Phase:** temporary Preview Environment setup is active before continuing Stage 10 Media Pipeline.
- **Main rebuild state:** Stages 1–9 are closed and verified. Stage 10 remains the next implementation stage; its work is paused only long enough to make the project continuously testable on Supabase + Vercel.
- **Verification Policy:** every rebuild stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; anything not executed remains `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md`, this file, `PROJECT_ENGINEERING_LOG.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`, and for the temporary environment `docs/preview/SUPABASE_VERCEL_PREVIEW.md`.

## Last verified rebuild baseline

- Branch: `rebuild/content-import`
- Documentation head: `cf55bd5d0f36dd9ad0f2df57c46c5541a3b01d0a`
- Stage 9 dedicated run: `33294974544` — **SUCCESS**
- Full regression run: `33294974573` — **SUCCESS**
- Stage 9 source: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`
- Verified source inventory: 15 subject roots / 48 documents / 5,552 images / 4,218 JPG / 1,334 WEBP / 86 helper files / 0 fatal issues.

## Completed rebuild stages

1. Product Contract — CLI PASS.
2. Brand Identity — CLI PASS.
3. UX Architecture — CLI PASS.
4. PostgreSQL Data Platform — CLI/RUNTIME PASS.
5. Engineering Foundation — CLI/RUNTIME PASS.
6. Auth & Authorization — CLI/RUNTIME PASS.
7. Access Codes & Entitlements — CLI/RUNTIME PASS.
8. Student Activation & Account Flow — CLI/RUNTIME/BROWSER E2E PASS.
9. Content Model & deterministic `alwaslh-go` Import — CLI/PostgreSQL RUNTIME PASS.

## Temporary Preview Environment — ACTIVE

Branch: `preview/supabase-vercel`.

Purpose: run the evolving product continuously for owner testing while the rebuild proceeds. This does **not** replace the final production architecture decision.

### Supabase

Project: `linksoftt@gmail.com's Project` / ref `dhlqqgnxsqawidjmedvq`.

Verified directly on Supabase:

- canonical migrations `0001_core` → `0008_content_source_import` applied successfully;
- 40 public application tables;
- 21 public enum types;
- 107 indexes after canonical migrations;
- six-digit/full and seven-digit/class access-code constraints present;
- single-redemption activation index present;
- content source import tables present;
- preview-only `preview_supabase_lockdown` applied;
- RLS enabled on every public app table;
- `anon` and `authenticated` table/sequence access revoked;
- Supabase `RLS Disabled in Public` security errors eliminated;
- `RLS Enabled No Policy` INFO notices are intentional because PostgREST is not an application data path.

Preview seed data exists for manual testing:

- one temporary Admin account with a salted `scrypt$...` credential;
- one active temporary six-digit Full Access Code.

Credentials are intentionally not stored in Git.

### Vercel preparation

Implemented on the preview branch:

- `apps/api/api/[...path].ts` Vercel serverless Fastify adapter;
- Supabase SSL and serverless pool-size configuration;
- exact credentialed CORS allowlist;
- preview cross-origin `SameSite=None; Secure` HttpOnly cookie option while `Lax` remains default;
- configurable `VITE_API_BASE_URL` in Student Web;
- Vercel configs for API, Student and Admin apps;
- `database/preview/0001_supabase_lockdown.sql` records Supabase-specific hardening;
- full runbook: `docs/preview/SUPABASE_VERCEL_PREVIEW.md`.

## NOT YET VERIFIED — Preview

- Vercel projects have not yet been imported/deployed in the user's Vercel account because no Vercel connector is available in this environment.
- Actual Vercel deployment URLs: **NOT YET VERIFIED**.
- `/api/ready` from Vercel to Supabase: **NOT YET VERIFIED**.
- Browser activation/login with third-party Vercel origins: **NOT YET VERIFIED**.
- Preview branch API/Student/Admin CI after the platform-adapter changes: pending until the preview PR/workflow run is green.
- Supabase Storage media adapter: belongs to Stage 10 and is not yet complete.

## Final architecture remains unchanged

- Browser never connects directly to PostgreSQL/PostgREST.
- Business Auth/Authorization/Entitlements remain in `apps/api`.
- Supabase is a temporary PostgreSQL/Storage hosting provider during development, not an application dependency.
- Final hosting will move PostgreSQL, media storage and API behind the production infrastructure without changing domain contracts.

## Next Action

1. Run CLI/CI against `preview/supabase-vercel` and fix platform-adapter failures.
2. Import three Vercel projects (API, Student, Admin), set secrets/URLs, and prove `/api/health`, `/api/ready`, Student activation/login/logout/recovery in browser.
3. Keep the Preview environment updated after verified rebuild batches.
4. Resume **Stage 10 — Media Pipeline** immediately after the temporary hosting gate is usable.
