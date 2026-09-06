# PROJECT STATUS

- **Current Phase:** Stage10 Preview Sync — engineering/database/branch sync complete; Vercel runtime deployment is blocked by temporary build-rate quota.
- **Official state:** `CI PASS` + `Supabase Preview PASS` + `Preview branch SYNCED` + `Vercel Runtime NOT YET VERIFIED`.
- **Verification Policy:** executable evidence is mandatory. Unexecuted or externally blocked work is `NOT YET VERIFIED`.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Current implementation baseline:** `68be2f5e750ba3d53bf31fae1641182f29516627`.
- **Documentation batch:** started at `1a1efd06eafca41da8d1e6037b89eb576d9cc137`; final docs-head CI must be checked after the documentation updates below land.

## Product Review closure

Product Review Batches 01–06 are closed for Core Product. The previously required same-HEAD documentation verification was independently confirmed on `e293defdaf87169ddbed0cc0c7cae2c525464c23`:

- Stage10 docs-head `33999128114` — `SUCCESS`
- Stage9 docs-head `33999128132` — `SUCCESS`
- Full Rebuild `33999128111` — `SUCCESS`

No routine Product Review discussion is required before implementation. Business-rule conflicts may still reopen a decision explicitly.

## Stage10 Preview Sync — completed engineering work

### Runtime/build contract

Root cause of the repeated Vercel planning-branch failure was fixed at the repository contract instead of with a page-level workaround:

- root `vercel.json` is the single combined deployment contract;
- `outputDirectory` is `dist-vercel`, matching the combined Student/Admin build;
- `/` -> Student Web;
- `/admin` and `/admin/*` -> Admin Web;
- `/api/*` -> Fastify serverless API;
- `git.deploymentEnabled` is explicit;
- `scripts/build-vercel-preview.mjs` now fails fast if API, Student, Admin, or combined output files are missing;
- Student API base is configurable and set to `/api` for the combined Preview build;
- Admin Preview base is `/admin/`;
- API Preview config supports bounded DB pool, required TLS, explicit origins, proxy awareness and configurable cookie SameSite without weakening certificate verification.

### Verified implementation CI

Implementation commit `68be2f5e750ba3d53bf31fae1641182f29516627` passed all required regression gates:

- Stage 10 Media Pipeline `34000105615` — `SUCCESS`
- Stage 9 Content Import Verification `34000105600` — `SUCCESS`
- Rebuild Stage Verification `34000105608` — `SUCCESS`, including Chromium activation / returning-login / recovery E2E

### Supabase Preview

Project `linksoftt` / ref `dhlqqgnxsqawidjmedvq`:

- canonical `0009_media_pipeline` applied as migration version `20260905234708`;
- `preview_media_pipeline_lockdown` applied as version `20260905234729`;
- `media_assets` and `media_variants` exist with RLS enabled;
- `anon` and `authenticated` have no `SELECT` privilege on either table;
- no permissive RLS policies exist for these tables;
- expected Stage10 indexes were verified;
- Browser direct PostgreSQL/PostgREST access remains outside the application contract.

### Preview branch

`preview/supabase-vercel` contains the verified Stage10 integration:

- initial Stage10 sync merge: `b85194085fa5ffdc866f692f837a7a7b105c34b2`;
- final build-contract sync: `479db8183695c69786d3f4c9e2bde8aba5caeaff`;
- Preview evidence/blocker documentation: `d064cc7fedbb4095c82006e51192271c22e70b73`.

## Current blocker — Vercel Preview Runtime

**ID:** `PREVIEW-010-003`  
**Severity:** `P1` for the development Preview gate  
**Area:** Vercel deployment quota  
**Evidence:** Vercel commit status on `68be2f5…` = `failure` with `Deployment rate limited — retry in 24 hours.`  
**Impact:** a new Stage10 deployment cannot currently be created, so Student/Admin/API live verification must not be claimed.  
**Solution:** retry deployment after the provider build-rate window clears; then verify the exact deployment commit, health/readiness and relevant routes.  
**Status:** `BLOCKED EXTERNALLY / NOT YET VERIFIED`.

No Business Rule, auth boundary, validation rule or database permission is weakened to bypass this quota.

## Stage10 media Preview boundary

Stage10 processing remains correctly abstracted behind `MediaStorage`, but the concrete implementation currently verified is `FileSystemMediaStorage`; PDF extraction uses `pdfinfo` / `pdftoppm` and no Student/Admin media-processing HTTP route exists yet.

Therefore:

- Vercel serverless filesystem is **not** accepted as durable media storage;
- Poppler availability in Vercel is **NOT YET VERIFIED**;
- durable Preview media storage/processing belongs to the media/OCR integration work;
- Student media-delivery quality/browser readability remains **NOT YET VERIFIED**.

## Product direction retained

- Student = independent mobile-first installable Web/PWA in `apps/student-web`, also usable in Browser.
- Admin = independent Super Admin Web in `apps/admin-web`.
- `apps/api` is the only business-data path to PostgreSQL.
- Welcome -> `تفعيل جديد` / `لدي حساب بالفعل`.
- two-step activation, temporary-password forced change, registered cryptographic application-device challenge/rebind remain the next Stage6/8 target.
- Full Code = 6 digits; Class Code = 7 digits; multiple class entitlements remain required.
- no valuable legacy feature may disappear without explicit Product Owner approval.
- Reader/OCR/Text Search/TTS, Published Question Bank practice/tests, Notes media, Favorites, Needs Review, Push, Offline lease, progress and provider-neutral AI remain governed by Product Review decisions and roadmap.

## Legacy feature coverage

This Stage10 Preview batch is infrastructure/schema/deployment work. It implements or removes **no Student/Admin legacy capability**, so no feature row is promoted by this batch. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remain mandatory gates for later feature stages.

## What remains

1. Retry the already-synced Vercel Preview after the build-rate window clears.
2. Verify deployment `READY`, exact commit, `/`, `/admin`, `/api/health`, `/api/ready`, and relevant Stage10 media limitations.
3. Only after the Stage10 Preview Runtime gate is closed, begin Stage6/8 partial reopen:
   - two-step activation ticket;
   - atomic final activation;
   - Admin temporary password + forced private password change;
   - registered-device challenge and Admin rebind/reset;
   - API/PostgreSQL/security/Chromium tests;
   - Preview sync.
4. OCR Extraction Foundation.
5. Stage11 provider-neutral AI contracts + benchmark.
6. Stage12 durable provider/model-neutral execution.
7. Stage13+ according to `MASTER_REBUILD_ROADMAP.md` and legacy coverage gate.

## Definition of Done — current Stage10 Preview Sync

- [x] Product Review docs-head closure verified.
- [x] Stage10 stable implementation integrated with Preview runtime contract.
- [x] `0009_media_pipeline.sql` applied to Supabase Preview.
- [x] new media tables locked down from direct browser roles.
- [x] Vercel `dist` vs `dist-vercel` root cause fixed in repository contract.
- [x] implementation CI/regression/Chromium gates pass on `68be2f5…`.
- [x] `preview/supabase-vercel` synchronized.
- [ ] fresh Vercel deployment reaches `READY` — **BLOCKED BY BUILD RATE LIMIT**.
- [ ] `/api/health` and `/api/ready` on fresh deployment — **NOT YET VERIFIED**.
- [ ] Student/Admin routes on fresh deployment — **NOT YET VERIFIED**.
- [ ] final exact deployment/runtime evidence recorded — **NOT YET VERIFIED**.

**Transition decision:** do **not** declare Stage10 Preview Sync complete and do **not** start Stage6/8 implementation until the Vercel runtime gate is actually verified.
