# Supabase + Vercel Preview Environment

## Purpose

Temporary full-product preview environment for continuous manual testing during the rebuild. It does **not** change the final production architecture decision: portable PostgreSQL + application API + replaceable media storage.

## Git baseline

- Branch: `preview/supabase-vercel`
- Preview-only platform adaptations must not be merged blindly into production/runtime branches.

## Supabase

- Project: `linksoftt@gmail.com's Project`
- Project ref: `dhlqqgnxsqawidjmedvq`
- API URL: `https://dhlqqgnxsqawidjmedvq.supabase.co`
- Role: PostgreSQL hosting and, when Stage 10 needs it, temporary media storage.
- Supabase Auth/PostgREST are **not** the application authorization layer.
- Browser clients must never read/write rebuild tables through Supabase REST.

### Applied migrations

Canonical rebuild migrations `0001` through `0008` were applied in order, followed by preview-only migration `preview_supabase_lockdown`.

### Supabase lockdown

`database/preview/0001_supabase_lockdown.sql` records the preview hardening:

- RLS enabled on every `public` application table.
- No RLS policies intentionally exist because PostgREST is not an application data path.
- `anon` and `authenticated` table/sequence privileges revoked.
- `set_updated_at()` uses a fixed `search_path`.
- The application API remains the only business-data path.

## Vercel topology

The preview uses **one Vercel project** connected to repository `7eaur/alwaslh` and branch `preview/supabase-vercel`.

Routes:

- `/` → Student Web
- `/admin` and `/admin/*` → Admin Web
- `/api/*` → Fastify serverless API

Root `vercel.json` runs `node scripts/build-vercel-preview.mjs`, outputs `dist-vercel`, and exposes `api/[...path].ts` as the serverless function.

Required Vercel environment variables:

```text
NODE_ENV=production
DATABASE_URL=<Supabase pooled PostgreSQL connection string>
DATABASE_SSL=require
DATABASE_POOL_MAX=2
LOG_LEVEL=info
SESSION_COOKIE_NAME=alwaslh_session
SESSION_TTL_HOURS=168
SESSION_COOKIE_SAME_SITE=lax
ALLOWED_ORIGINS=https://alwaslh-git-preview-supabase-vercel-wasl15.vercel.app
```

`DATABASE_URL` is a secret and must never be committed. Use the Supabase pooled PostgreSQL connection string.

Because Student/Admin/API share the same Vercel origin in this topology, Student requests use `/api` and the normal `SameSite=Lax` session cookie is sufficient.

## Seed data

The preview database contains:

- one temporary Admin account for manual testing;
- one unused temporary six-digit Full Access Code for Student activation.

Credentials/codes are intentionally not stored in Git.

## Verification performed

Verified directly against Supabase:

- migrations `0001` through `0008` registered successfully;
- 40 application tables present in `public`;
- 21 public enum types;
- 107 indexes after canonical migrations;
- six-digit and seven-digit code constraints present;
- single-redemption activation index present;
- content source import tables present;
- preview Admin credential uses a `scrypt$...` hash, not plaintext;
- temporary Full Access Code exists and is active;
- `RLS Disabled in Public` findings eliminated after lockdown.

Verified on Vercel before database environment variables were redeployed:

- branch `preview/supabase-vercel` deployment reached `READY`;
- Student root returned HTTP 200;
- Student and Admin bundles built successfully;
- one Node.js serverless function was produced.

## Environment variable deployment checkpoint

On 2026-08-30 the project owner configured the required Vercel environment variables. Secret values are intentionally not recorded here. This documentation commit exists partly to trigger a fresh Preview deployment so the new variables are captured by the runtime.

## Not yet verified

- API `/api/health` and `/api/ready` using the newly configured Supabase connection: **NOT YET VERIFIED** until the fresh deployment completes.
- Browser activation/login against the live Vercel + Supabase environment: **NOT YET VERIFIED**.
- Admin feature completeness follows the main rebuild roadmap and is not implied by preview hosting.
- Media Storage adapter on Supabase belongs to Stage 10.

## Rule for future stages

A feature can be deployed to this preview environment after its stage CLI/CI gate passes. Preview success is an additional runtime signal, not a replacement for the project's CLI/CI Definition of Done.
