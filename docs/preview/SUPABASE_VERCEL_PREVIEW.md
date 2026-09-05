# Supabase + Vercel Preview Environment

## Purpose

Temporary full-product preview environment for continuous Product Owner/manual verification during the rebuild. It does **not** define the final Production architecture. The portable contract remains PostgreSQL + `apps/api` as the only business-data path + replaceable durable media/blob storage.

## Git baseline — 2026-09-06

- Source branch: `planning/product-evolution-review`
- Verified implementation commit: `86d62e700d49f803cbad4b83cae6b124b416c896`
- Preview integration branch: `preview/supabase-vercel`
- Stage10 sync merge: `b85194085fa5ffdc866f692f837a7a7b105c34b2`
- Git comparison `86d62e7… -> b851940…`: zero file differences; Preview merge preserves prior integration history only.

Verified GitHub Actions on implementation commit `86d62e7…`:

- Stage 10 Media Pipeline `33999803132` — `SUCCESS`
- Stage 9 Content Import Verification `33999803154` — `SUCCESS`
- Rebuild Stage Verification `33999803135` — `SUCCESS`, including Chromium activation/returning-login/recovery E2E

## Supabase Preview

- Project: `linksoftt`
- Project ref: `dhlqqgnxsqawidjmedvq`
- Role: temporary PostgreSQL/testing host. Supabase Auth/PostgREST are **not** application authorization paths.
- Browser clients must not read/write rebuild tables directly.

### Applied migrations

Registered Preview migrations now include canonical rebuild migrations `0001` through `0009`, plus Preview hardening migrations:

- `preview_supabase_lockdown`
- `preview_media_pipeline_lockdown`

Stage10 migration registration evidence:

- `0009_media_pipeline` version `20260905234708`
- `preview_media_pipeline_lockdown` version `20260905234729`

### Stage10 database verification

Verified directly after migration:

- `media_assets` exists with RLS enabled.
- `media_variants` exists with RLS enabled.
- `anon` has no `SELECT` privilege on either table.
- `authenticated` has no `SELECT` privilege on either table.
- no RLS policies exist for either table, intentionally preventing a PostgREST data path.
- expected Stage10 indexes exist, including `ux_media_assets_content_source_asset`, status/source-order indexes, variant identity/storage indexes.

Tracked hardening SQL:

- `database/preview/0001_supabase_lockdown.sql`
- `database/preview/0002_media_pipeline_lockdown.sql`

## Vercel topology

One temporary Vercel project hosts the three surfaces:

- `/` -> Student Web
- `/admin` and `/admin/*` -> Admin Web
- `/api/*` -> Fastify serverless API

Root `vercel.json` is the single routing/build contract. It runs `node scripts/build-vercel-preview.mjs`, outputs `dist-vercel`, and exposes `api/[...path].js` as the API function. This fixes the previous root cause where planning-branch deployments inherited Vite's default `dist` expectation while the intended combined preview output was `dist-vercel`.

Required environment variable names are documented in `apps/api/.env.example`; secret values must never be committed or copied into documentation.

## Stage10 media runtime boundary

Stage10's canonical implementation is verified in CI, but its Preview runtime boundary is intentionally explicit:

- current durable contract is abstracted behind `MediaStorage`;
- the implemented concrete adapter is currently `FileSystemMediaStorage`;
- PDF extraction invokes external `pdfinfo`/`pdftoppm` binaries;
- `apps/api/src/app.ts` does not expose a Student/Admin media-processing HTTP route yet;
- therefore Vercel serverless filesystem persistence is **not** accepted as durable media storage, and Poppler availability in that runtime must not be assumed.

Consequently, Preview currently verifies Stage10 schema/security and deployment compatibility, not durable media processing/storage. A durable Preview media adapter and any required processing runtime belong to the next media/OCR integration work; no filesystem workaround may become the Production architecture.

## Runtime verification checkpoint

A fresh Vercel deployment is required from this Preview branch after the Stage10 sync.

Pending checks:

- deployment reaches `READY`: **NOT YET VERIFIED**
- `/api/health`: **NOT YET VERIFIED**
- `/api/ready` against Supabase PostgreSQL: **NOT YET VERIFIED**
- Student root: **NOT YET VERIFIED** on the new Stage10 deployment
- Admin `/admin`: **NOT YET VERIFIED** on the new Stage10 deployment
- live activation/login/recovery against Preview Supabase: **NOT YET VERIFIED** for this deployment
- Vercel Poppler availability and durable media storage: **NOT YET VERIFIED** and not required to claim Stage10 Preview schema sync

## Rule for future batches

Stable implementation -> CI/runtime gate PASS -> sync `preview/supabase-vercel` -> apply safe Preview migrations/config -> deploy -> health/readiness/relevant smoke/browser verification -> record exact commit/deployment/runtime evidence.
