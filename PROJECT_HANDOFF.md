# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth order: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → `docs/product/PRODUCT_EVOLUTION_REVIEW.md` → Batch05/06 decisions → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` → `MASTER_REBUILD_ROADMAP.md` → `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md` → `docs/preview/SUPABASE_VERCEL_PREVIEW.md`. Repository + GitHub Actions + runtime evidence are authoritative; do not rely on chat memory.

## 1. Product direction

**الفكرة الأساسية ثابتة.** الوسيلة الذكية منصة تعليمية عربية بثلاثة أجزاء مستقلة وظيفيًا:

- `apps/student-web` — Student Web/PWA، mobile-first/offline-first، RTL، قابل للتثبيت ويعمل أيضًا من Browser، ولا يحتوي Admin navigation/functionality.
- `apps/admin-web` — Admin Web مستقل، Super Admin فقط حاليًا.
- `apps/api` — Backend API الوحيد للوصول إلى PostgreSQL وتطبيق Auth/Authorization/Entitlements.

التطبيق القديم mandatory feature/scenario inventory وليس specification تقنية أو بصرية. **لا تُحذف Feature قديمة ذات قيمة بدون موافقة Product Owner صريحة.** استخدم `PRODUCT_FEATURE_PARITY_MATRIX.md` و`docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` قبل إغلاق Student/Admin feature stages.

Product Review Batches 01–06 حسمت Core Product. التفاصيل الروتينية تُختار هندسيًا وفق Correctness/Clarity/Maintainability/UX/Security دون Overengineering.

## 2. Product Review closure — VERIFIED

PR #12 / branch `planning/product-evolution-review`.

Product Review documentation closure was verified on exact head `e293defdaf87169ddbed0cc0c7cae2c525464c23`:

- Stage10 docs-head `33999128114` — SUCCESS.
- Stage9 docs-head `33999128132` — SUCCESS.
- Full Rebuild `33999128111` — SUCCESS.

Therefore implementation resumed in the required bridge order.

## 3. Stable Stage1–10 engineering baseline

Original Stage10 stable head: `27c6a2ef1118ee44d2e63471e4f925e1296283e0`.

Original final CI:

- Stage10 `33302270707` — SUCCESS.
- Stage9 regression `33302270692` — SUCCESS.
- Full Rebuild `33302270695` — SUCCESS including Chromium E2E.

Key baseline outcomes:

- private PostgreSQL behind API;
- scrypt credentials + opaque HttpOnly sessions;
- Full Code 6 digits / Class Code 7 digits;
- transactional/idempotent access/activation baseline;
- Stage9 5,552-image deterministic source inventory/import;
- Stage10 deterministic Sharp/Poppler media pipeline with provenance/order/idempotency/cleanup.

## 4. Stage10 Preview Sync — current work

### Final verified implementation head

`68be2f5e750ba3d53bf31fae1641182f29516627`

CI on this exact commit:

- Stage10 Media Pipeline `34000105615` — SUCCESS.
- Stage9 Content Import Verification `34000105600` — SUCCESS.
- Rebuild Stage Verification `34000105608` — SUCCESS.
- Chromium activation / returning-login / recovery E2E — SUCCESS.

### Root-cause fixes implemented

The prior Vercel `No Output Directory named "dist"` failures came from missing root deployment contract on the planning branch while the intended combined output was `dist-vercel`.

Repository now has one root Preview contract:

- root `vercel.json`;
- `buildCommand: node scripts/build-vercel-preview.mjs`;
- `outputDirectory: dist-vercel`;
- Git deployments explicitly enabled;
- `/` -> Student;
- `/admin` / `/admin/*` -> Admin;
- `/api/*` -> Fastify serverless API;
- build script asserts API/Student/Admin/final combined outputs before success.

Preview runtime config also includes:

- bounded DB pool;
- configurable `DATABASE_SSL=require` with normal certificate verification;
- explicit CORS origins + proxy awareness;
- configurable cookie SameSite;
- Student API base contract;
- Admin `/admin/` base.

No Business Logic duplication or auth bypass was introduced.

## 5. Supabase Preview — Stage10 schema/security VERIFIED

Temporary project: `linksoftt`, ref `dhlqqgnxsqawidjmedvq`.

Applied:

- canonical `0009_media_pipeline` — version `20260905234708`;
- `preview_media_pipeline_lockdown` — version `20260905234729`.

Verified directly:

- `media_assets` + `media_variants` exist;
- RLS enabled on both;
- `anon` SELECT = false;
- `authenticated` SELECT = false;
- no permissive RLS policies;
- expected Stage10 indexes present.

Supabase remains a temporary PostgreSQL/testing host; Browser direct business-data access is still prohibited.

## 6. Preview branch state

Branch: `preview/supabase-vercel`.

Important commits:

- old pre-Stage10 Preview: `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`;
- initial Stage10 sync: `b85194085fa5ffdc866f692f837a7a7b105c34b2`;
- final build-contract sync: `479db8183695c69786d3f4c9e2bde8aba5caeaff`;
- current Preview evidence/blocker doc head: `d064cc7fedbb4095c82006e51192271c22e70b73`.

Canonical Preview evidence doc: `docs/preview/SUPABASE_VERCEL_PREVIEW.md`.

## 7. Current blocking issue — DO NOT BYPASS

**PREVIEW-010-003 — P1 — Vercel Build Rate Limit**

Evidence on final implementation commit `68be2f5…` from Vercel/GitHub status:

`Deployment rate limited — retry in 24 hours.`

Meaning:

- application CI did not fail;
- Supabase migration/security did not fail;
- Vercel did not create a fresh Stage10 deployment because provider quota blocked it before runtime verification;
- do not claim Student/Admin/API hosted PASS yet.

Exit path:

1. after the Vercel build-rate window clears, deploy the already-synced `preview/supabase-vercel` branch;
2. confirm deployment points to the expected current Preview commit;
3. verify `READY`;
4. verify `/` Student;
5. verify `/admin` Admin;
6. verify `/api/health`;
7. verify `/api/ready` against Supabase;
8. inspect runtime errors/logs;
9. update `docs/preview/SUPABASE_VERCEL_PREVIEW.md`, `PROJECT_STATUS.md`, this Handoff and Engineering Log with exact deployment/runtime evidence.

No auth/validation/security/business workaround is permitted to bypass quota.

## 8. Stage10 hosted media boundary

Actual code inspection confirms:

- media storage domain is behind `MediaStorage`;
- concrete verified implementation currently = `FileSystemMediaStorage`;
- PDF extraction calls `pdfinfo` / `pdftoppm`;
- no Student/Admin media-processing HTTP endpoint exists in `apps/api/src/app.ts` yet.

Therefore:

- Vercel filesystem is not accepted as durable media storage;
- Vercel Poppler availability = `NOT YET VERIFIED`;
- durable hosted media adapter/processing belongs to media/OCR integration work;
- Student image quality/readability delivery remains `NOT YET VERIFIED`.

Do not turn an ephemeral filesystem workaround into Production architecture.

## 9. Stage6/8 partial reopen — NEXT ONLY AFTER PREVIEW GATE

Do **not** begin implementation until current Stage10 Preview deployment/runtime verification closes.

Required target:

### Activation

`6-digit Full Code`
→ eligibility verification without consumption
→ short-lived one-time activation ticket
→ mandatory password creation
→ one final transaction: account + credential + entitlement + redemption + audit
→ register cryptographic application-device key
→ authenticated session.

No partial account; no code consumption before successful final transaction.

### Returning login

identifier + password + registered-device challenge.

Do not use IP/User-Agent/browser fingerprint as security identity.

### Recovery

Admin temporary password/reset credential
→ revoke sessions
→ `must_change_password`
→ Student login
→ mandatory private password replacement.

Lost/replaced device: Admin reset/rebind.

Required verification: API + PostgreSQL + security + Chromium E2E + Preview sync.

## 10. Ordered roadmap after Stage6/8

1. OCR Extraction Foundation.
2. Stage11 provider/model-neutral AI contracts + benchmark + provenance/validators.
3. Stage12 durable provider/model-neutral high-throughput execution.
4. Stage13+ from `MASTER_REBUILD_ROADMAP.md`.

Keep all recorded Product decisions: Reader page+optional approved text+Arabic search+cached TTS, Published Question Bank only for Student tests, original ministerial provenance, Notes text/image/capture/audio, separate Favorites/Needs Review, repeated-error auto review, Push with gentle limits, signed max-14-day Offline lease, multiple Class Codes/entitlements, Super Admin only, unified Design System and no valuable legacy feature removal without approval.

## 11. Legacy/parity state

Stage10 Preview Sync is infrastructure/schema/deployment work only. No Student/Admin legacy capability was implemented or removed by this batch. Therefore no parity row is newly closed.

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remain mandatory before Stage13/14+ feature closure.

## 12. Mandatory continuation protocol

After every meaningful batch:

- update `PROJECT_STATUS.md`;
- update `PROJECT_ENGINEERING_LOG.md`;
- update this Handoff when architecture/branch/CI/Preview changes;
- update specialized docs;
- update parity/coverage evidence when actual feature implementation changes;
- retain exact commit/CI/deployment/runtime evidence;
- unexecuted = `NOT YET VERIFIED`;
- never weaken tests/security/business rules to get a green environment.

## Current transition decision

**Stage10 Preview Sync is NOT fully complete. Engineering CI, Supabase migration/security and Preview branch synchronization are complete. Fresh Vercel Runtime is blocked externally by build-rate quota and remains NOT YET VERIFIED. Do not move to Stage6/8 implementation until the hosted runtime gate closes.**
