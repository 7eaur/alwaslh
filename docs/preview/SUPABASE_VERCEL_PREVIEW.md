# Supabase + Vercel Preview Environment

## Purpose

Temporary full-product preview environment for continuous Product Owner/manual verification during the rebuild. It does **not** define the final Production architecture. The portable contract remains PostgreSQL + `apps/api` as the only business-data path + replaceable durable media/blob storage.

## Git baseline — 2026-09-06

- Source branch: `planning/product-evolution-review`
- Final verified Stage10 Preview-integration implementation commit: `68be2f5e750ba3d53bf31fae1641182f29516627`
- Preview integration branch: `preview/supabase-vercel`
- Initial Stage10 sync merge: `b85194085fa5ffdc866f692f837a7a7b105c34b2`
- Final Stage10 build-contract sync merge: `479db8183695c69786d3f4c9e2bde8aba5caeaff`

Verified GitHub Actions on implementation commit `68be2f5…`:

- Stage 10 Media Pipeline `34000105615` — `SUCCESS`
- Stage 9 Content Import Verification `34000105600` — `SUCCESS`
- Rebuild Stage Verification `34000105608` — `SUCCESS`, including Chromium activation/returning-login/recovery E2E

The combined Vercel contract now lives at repository root. `scripts/build-vercel-preview.mjs` fails fast if API, Student, Admin, or combined outputs are missing; `vercel.json` explicitly enables Git deployments and defines `dist-vercel` as the output.

## Supabase Preview

- Project: `linksoftt`
- Project ref: `dhlqqgnxsqawidjmedvq`
- Role: temporary PostgreSQL/testing host. Supabase Auth/PostgREST are **not** application authorization paths.
- Browser clients must not read/write rebuild tables directly.

### Applied migrations

Registered Preview migrations include canonical rebuild migrations `0001` through `0009`, plus Preview hardening migrations:

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

Root `vercel.json` is the single routing/build contract. It runs `node scripts/build-vercel-preview.mjs`, outputs `dist-vercel`, and exposes `api/[...path].js` as the API function. This fixes the prior root cause where planning-branch deployments inherited Vite's default `dist` expectation while the intended combined preview output was `dist-vercel`.

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

### Build-rate incident and recovery

A Vercel attempt on implementation commit `68be2f5…` was initially rejected with:

`Deployment rate limited — retry in 24 hours.`

The provider later accepted planning docs-head `0510fed2327b4511475f95f24b49322cc274c408`, proving the rate window cleared during this engineering session.

Planning deployment evidence:

- deployment: `dpl_CB4WN2Q8M6GchkUVjAWU1UvHBELa`
- source branch: `planning/product-evolution-review`
- source commit: `0510fed2327b4511475f95f24b49322cc274c408`
- state: `READY`
- build log: combined Student/Admin/API build completed and Vercel deployed outputs successfully
- Student `/`: HTTP `200`

Protected routes `/admin` and `/api/health` return Vercel SSO `302` in the available stateless fetch tool. Vercel runtime logs contain no request entries for these attempts, confirming they were stopped by Deployment Protection before reaching Fastify. This is **not** evidence of an API/Admin application failure.

A browser session capable of retaining the Vercel bypass cookie is not available in the current execution runtime. Do not weaken Deployment Protection to make a smoke check pass.

### Preview-branch deployment

This documentation update is intentionally pushed on `preview/supabase-vercel` after the quota window cleared so Git integration can create a fresh deployment from the actual Preview branch. Record its exact deployment ID/commit below once Vercel reports it.

Pending checks until that deployment completes:

- Preview branch deployment reaches `READY`: **NOT YET VERIFIED**
- exact Preview commit/deployment linkage: **NOT YET VERIFIED**
- Student root on Preview branch: **NOT YET VERIFIED**
- Admin `/admin` behind Deployment Protection: **NOT YET VERIFIED** in authenticated browser session
- `/api/health` behind Deployment Protection: **NOT YET VERIFIED** in authenticated browser session
- `/api/ready` against Supabase: **NOT YET VERIFIED** in authenticated browser session
- Vercel Poppler availability and durable media storage: **NOT YET VERIFIED** and not required to claim Stage10 Preview schema sync

## Legacy/parity impact

This batch is deployment/runtime infrastructure plus Stage10 schema hardening. It does **not** implement or remove a Student/Admin legacy capability. Therefore no row in `PRODUCT_FEATURE_PARITY_MATRIX.md` is promoted to a new feature-complete state by this batch. The `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remains fully applicable to later Student/Admin feature stages.

## Rule for future batches

Stable implementation -> CI/runtime gate PASS -> sync `preview/supabase-vercel` -> apply safe Preview migrations/config -> deploy -> health/readiness/relevant smoke/browser verification -> record exact commit/deployment/runtime evidence.
