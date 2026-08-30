# Supabase + Vercel Preview Environment

## Purpose

This environment is temporary but fully functional. It exists so the product can be exercised continuously while the rebuild proceeds. It does **not** replace the production architecture decision: the final deployment remains portable PostgreSQL + application API + replaceable media storage.

## Git baseline

- Branch: `preview/supabase-vercel`
- The preview branch was created from the Stage 9 verified baseline before Stage 10 implementation.
- Preview-only platform adaptations must not be merged blindly into production/runtime branches.

## Supabase

- Project: `linksoftt@gmail.com's Project`
- Project ref: `dhlqqgnxsqawidjmedvq`
- API URL: `https://dhlqqgnxsqawidjmedvq.supabase.co`
- Role in this environment: PostgreSQL hosting and, when Stage 10 needs it, media storage.
- Supabase Auth/PostgREST are **not** the application authorization layer.
- Browser clients must never read/write the rebuild tables through Supabase REST.

### Applied database migrations

The canonical rebuild migrations were applied in order:

1. `0001_core`
2. `0002_access`
3. `0003_learning`
4. `0004_ai_and_sync`
5. `0005_auth`
6. `0006_access_contract`
7. `0007_activation_contract`
8. `0008_content_source_import`

A preview-only migration named `preview_supabase_lockdown` was then applied.

### Supabase lockdown

`database/preview/0001_supabase_lockdown.sql` records the preview-specific hardening:

- RLS enabled on every `public` application table.
- No RLS policies intentionally exist because PostgREST is not an application data path.
- `anon` and `authenticated` have table and sequence privileges revoked.
- `set_updated_at()` has a fixed `search_path`.
- The API database connection remains the only business-data path.

Supabase Security Advisor should therefore show no `RLS Disabled in Public` errors. `RLS Enabled No Policy` informational notices are expected and intentional for this architecture.

## Vercel topology

Use three projects from repository `7eaur/alwaslh`, all tracking branch `preview/supabase-vercel`:

### API project

- Root directory: `apps/api`
- Runtime route: `/api/*`
- Serverless adapter: `apps/api/api/[...path].ts`
- Health URL after deployment: `https://<api-project>.vercel.app/api/health`
- Readiness URL: `https://<api-project>.vercel.app/api/ready`

Required environment variables:

```text
NODE_ENV=production
DATABASE_URL=<Supabase pooled PostgreSQL connection string>
DATABASE_SSL=require
DATABASE_POOL_MAX=2
LOG_LEVEL=info
SESSION_COOKIE_NAME=alwaslh_session
SESSION_TTL_HOURS=168
SESSION_COOKIE_SAME_SITE=none
ALLOWED_ORIGINS=https://<student-project>.vercel.app,https://<admin-project>.vercel.app
```

Use the Supabase **pooled** PostgreSQL connection string for a serverless runtime. Do not commit it.

### Student project

- Root directory: `apps/student-web`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Enable Vercel's option to include source files outside the Root Directory because this package references `../../packages/*` workspace packages.

Required environment variable:

```text
VITE_API_BASE_URL=https://<api-project>.vercel.app/api
```

### Admin project

- Root directory: `apps/admin-web`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Enable source files outside Root Directory for shared `../../packages/*` packages.

Admin API wiring will follow the same `https://<api-project>.vercel.app/api` contract as Admin functionality is rebuilt.

## Cross-origin session contract

Vercel projects have separate origins during preview. Preview runtime therefore supports:

- exact `ALLOWED_ORIGINS` allowlist;
- credentialed CORS responses only for allowed origins;
- `HttpOnly` cookies;
- `SameSite=None; Secure` only when `SESSION_COOKIE_SAME_SITE=none`;
- normal `SameSite=Lax` remains the default outside this preview configuration.

## Seed data

The preview database contains:

- one temporary Admin account for manual testing;
- one unused temporary six-digit Full Access Code for Student activation.

Credentials/codes are intentionally **not stored in Git**. Rotate or remove them whenever the preview is shared outside the project owner.

## Verification performed

Verified directly against Supabase:

- migrations `0001` through `0008` registered successfully;
- 40 application tables present in `public`;
- 21 public enum types;
- 107 indexes after canonical migrations;
- six-digit and seven-digit code constraints present;
- single-redemption activation index present;
- content source import tables present;
- preview Admin credential is a `scrypt$...` hash, not plaintext;
- temporary Full Access Code exists and is active;
- `RLS Disabled in Public` findings eliminated after lockdown.

## Not yet verified

- Vercel deployment URLs: **NOT YET VERIFIED** until projects are imported into the user's Vercel account.
- API `/ready` against Supabase from Vercel: **NOT YET VERIFIED**.
- Browser login/activation through the deployed Vercel origins: **NOT YET VERIFIED**.
- Admin application feature completeness: follows the main rebuild roadmap and is not implied by preview hosting.
- Media Storage adapter on Supabase: Stage 10 work.

## Rule for future stages

A feature can be deployed to this preview environment once its stage CLI/CI gate passes. Preview success is an additional runtime signal, not a replacement for the project's CLI/CI Definition of Done.
