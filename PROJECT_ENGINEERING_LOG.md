# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, implementation history, verification evidence and remaining work. Start with `DOCUMENTATION_INDEX.md`, then `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, Product Decision docs, `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`, and legacy coverage/audit references.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بسطحين مستقلين لنفس المنتج:

- **Student Web/PWA (`apps/student-web`)**: Welcome/Auth، curriculum، Reader، summaries، `اختبر نفسك`، tests/models، Notes، Favorites، Needs Review، progress/private achievements، Notifications وOffline/PWA. Mobile-first، RTL، قابل للتثبيت ويعمل أيضًا من Browser.
- **Admin Web (`apps/admin-web`)**: Super Admin واحد حاليًا لإدارة curriculum/content/media/OCR/TTS/AI authoring/Question Bank/students/codes/recovery/device reset/notifications/import-export/reports/audit.
- **Backend API (`apps/api`)**: المسار الوحيد لبيانات PostgreSQL وتطبيق Auth/Authorization/Entitlements والعمليات authoritative.

### Product governance

- الفكرة الأساسية ثابتة؛ لا ننسخ التطبيق القديم تقنيًا أو بصريًا بشكل أعمى.
- التطبيق القديم inventory إلزامي للمميزات والسيناريوهات والمشكلات.
- **لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.**
- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` hard gates قبل إغلاق Student/Admin feature stages.
- Product Review Batches 01–06 حسمت Core Product بما يكفي لاستمرار التنفيذ.
- أي شيء غير مفحوص أو غير منفذ = `NOT YET VERIFIED`.

### Sources

- repo: `7eaur/alwaslh`.
- canonical curriculum/media source: `7eaur/alwaslh-go` pinned at `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23` for Stage9 inventory.
- repository docs + GitHub Actions + runtime evidence are continuity source; chat memory is not.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── durable media/blob storage abstraction
                    ├── OCR extraction + searchable approved text
                    ├── cached/versioned TTS
                    ├── durable provider/model-neutral AI workers/jobs
                    ├── Web Push / In-App notifications
                    └── account/device-scoped offline sync
```

Rules:

- Browser never receives PostgreSQL credentials and does not authorize through Supabase PostgREST.
- Auth/Authorization/Entitlements are server-owned.
- Student and Admin are independent deployable/runtime surfaces.
- final activation account creation remains one transaction.
- registered device identity must be cryptographic application-device key, not IP/User-Agent/browser fingerprint.
- upload must remain independent from OCR/AI/TTS availability.
- source media remains canonical evidence; Student receives appropriate variants.
- AI/OCR/TTS remain provider/model-neutral abstractions where applicable.
- Preview is temporary supervision/runtime evidence and does not redefine Production architecture.
- root-cause fixes are mandatory; Preview workarounds require explicit impact + exit path.

## Verified Engineering Baseline — Stages 1–10

### Stage 1 — Product Inventory — CLI PASS
Legacy feature/user-flow inventory and parity safety net.

### Stage 2 — Brand — CLI PASS
Owned brand/tokens/accessibility direction.

### Stage 3 — UX Architecture — CLI PASS
Initial Admin/Student IA and critical state contracts; later Product decisions explicitly refine flows.

### Stage 4 — PostgreSQL — CLI/RUNTIME PASS
Migration-owned PostgreSQL16 data platform.

### Stage 5 — Engineering Foundation — CLI/RUNTIME PASS
API runtime, bounded pool/transactions, config/logging/errors, strict TS/lint/tests/build/CI.

### Stage 6 — Auth & Authorization — VERIFIED BASELINE / PARTIAL REOPEN PENDING
scrypt credentials, opaque HttpOnly sessions, role isolation, Origin protection, lockout, explicit Admin bootstrap. Product decisions require two-step activation/recovery/device additions before final closure.

### Stage 7 — Access Codes & Entitlements — CLI/RUNTIME PASS
- Full Code = 6 digits.
- Class Code = 7 digits.
- crypto-secure generation.
- Arabic/Persian normalization.
- transactional row-lock redemption.
- idempotency/race safety/renewal/no-waste/revoke/audit.

### Stage 8 — Activation/Login/Recovery — VERIFIED BASELINE / PARTIAL REOPEN PENDING
Baseline Chromium flow proves activation -> entitlement -> logout -> returning login -> Admin recovery -> password reset. Product target requires two-step activation, temporary-password forced change and registered-device challenge/rebind.

### Stage 9 — Deterministic source import — CLI/PostgreSQL RUNTIME PASS
Canonical inventory:

```text
15 subject roots
48 source documents
5,552 images
4,218 JPG
1,334 WEBP
86 recognized helper files
24 manifests
0 fatal inventory issues
100 duplicate blob groups / 201 paths retained for REVIEW
```

Canonical digest: `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage 10 — Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS
Canonical migration `0009_media_pipeline.sql` and media services verify deterministic storage keys/order, path traversal protection, bounded concurrency, Sharp source/display/thumbnail/ai variants, hashes/bytes/dimensions, Stage9 provenance, byte-bound idempotency, replay, cleanup, abort/retry behavior and local Poppler PDF extraction.

Original Stage10 final baseline: `27c6a2ef1118ee44d2e63471e4f925e1296283e0` with Stage10 `33302270707`, Stage9 `33302270692`, Full Rebuild `33302270695` SUCCESS.

## Product Review Closure — 2026-09-06

The required docs-head verification was independently checked on `e293defdaf87169ddbed0cc0c7cae2c525464c23`:

- Stage10 `33999128114` — `SUCCESS`.
- Stage9 `33999128132` — `SUCCESS`.
- Full Rebuild `33999128111` — `SUCCESS`.

Result: Product Review documentation closure = PASS. Implementation bridge resumed in the documented order.

## Stage10 Preview Sync — Implementation Batch

### Repository/runtime changes

Implementation commits culminated in `68be2f5e750ba3d53bf31fae1641182f29516627`.

Changes:

- root `vercel.json` is now the single combined Preview deployment contract;
- explicit `outputDirectory: dist-vercel` fixes the prior Vite-default `dist` mismatch;
- explicit Git deployments enabled;
- `/` -> Student, `/admin/*` -> Admin, `/api/*` -> Fastify serverless API;
- `scripts/build-vercel-preview.mjs` builds all three surfaces and fails fast if API/Student/Admin/combined output files are missing;
- Admin Preview asset base = `/admin/`;
- Student `VITE_API_BASE_URL` contract added and Preview uses `/api`;
- API deployment config supports `DATABASE_SSL=require`, bounded `DATABASE_POOL_MAX`, explicit `ALLOWED_ORIGINS`, proxy awareness and configurable cookie SameSite;
- TLS does **not** use `rejectUnauthorized:false`; certificate verification remains default;
- root serverless wrapper constructs the same Fastify app and DB contract rather than duplicating business logic;
- Preview hardening SQL is tracked under `database/preview/`.

### Implementation CI evidence

Final implementation head `68be2f5e750ba3d53bf31fae1641182f29516627`:

- Stage10 Media Pipeline `34000105615` — `SUCCESS`.
- Stage9 Content Import Verification `34000105600` — `SUCCESS`.
- Rebuild Stage Verification `34000105608` — `SUCCESS`.
- Chromium activation / returning-login / recovery E2E inside Full Rebuild — `SUCCESS`.

### Supabase Preview migration/security evidence

Project `linksoftt`, ref `dhlqqgnxsqawidjmedvq`:

- `0009_media_pipeline` applied, version `20260905234708`.
- `preview_media_pipeline_lockdown` applied, version `20260905234729`.
- `media_assets` and `media_variants` exist.
- RLS enabled on both.
- `anon` table SELECT = false on both.
- `authenticated` table SELECT = false on both.
- zero permissive RLS policies exist for those tables.
- expected Stage10 indexes directly verified.

This preserves the architecture: Supabase is temporary PostgreSQL/testing host; Browser business access still goes only through `apps/api`.

### Preview branch evidence

- prior Preview baseline: `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`.
- initial Stage10 sync merge: `b85194085fa5ffdc866f692f837a7a7b105c34b2`.
- final verified build-contract sync merge: `479db8183695c69786d3f4c9e2bde8aba5caeaff`.
- Preview blocker/evidence doc head: `d064cc7fedbb4095c82006e51192271c22e70b73`.

### Media Preview boundary

Inspected actual Stage10 code:

- storage domain is abstracted by `MediaStorage`;
- concrete verified adapter is currently `FileSystemMediaStorage`;
- PDF processor shells out to `pdfinfo` / `pdftoppm`;
- `apps/api/src/app.ts` does not expose Student/Admin media-processing HTTP routes yet.

Therefore Vercel ephemeral filesystem is **not** accepted as durable media storage, and Poppler availability in Vercel remains `NOT YET VERIFIED`. Durable Preview media adapter/processing belongs to the media/OCR integration work; no filesystem patch is promoted to Production architecture.

## Architecture Decisions Added/Confirmed

- **AD-064 — Single Preview deployment contract:** combined Student/Admin/API Preview routing/build output is defined once at repository root; app-local competing Vercel contracts are not the final design.
- **AD-065 — Verified TLS defaults:** Preview PostgreSQL TLS may be required by configuration without globally disabling certificate verification.
- **AD-066 — Preview DB hardening stays additive:** canonical schema migration remains production-portable; Supabase-specific RLS/revoke hardening lives in explicit Preview migrations.
- **AD-067 — Preview media durability boundary:** Stage10 filesystem storage is a verified local/runtime implementation, not proof of durable serverless storage. A durable adapter is required before claiming hosted media persistence.
- **AD-068 — External quota is not an app workaround trigger:** provider build-rate exhaustion must be recorded and retried after quota clears; it does not justify auth/validation/business-rule bypasses or fake runtime PASS.

## Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged mutation | legacy audit | account/security compromise risk | private Backend authorization | FIXED Stage6 |
| DATA-015 | P0 | Activation | legacy partial/nontransactional activation | baseline audit | partial accounts/code consumption | atomic final transaction | BASELINE FIXED; two-step reopen pending |
| DATA-018 | P0 | Class Codes | racy redemption | Stage7 tests | double redemption/no-waste violation | row locks + transaction + idempotency | FIXED Stage7 |
| CONTENT-009-* | P1/P2 | Content | manifest/helper/digest completeness defects | Stage9 inventory/tests | missing/wrong source import | deterministic audited importer | FIXED Stage9 |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | Stage10 CI | corrupt/non-repeatable variants | deterministic media pipeline | FIXED Stage10 |
| PREVIEW-010-001 | P2 | Vercel Build | planning branch expected `dist` while combined Preview outputs `dist-vercel` | failed Vercel build logs | deployment failure | root `vercel.json` + combined build contract + fail-fast outputs | FIXED IN REPO; fresh hosted deployment blocked by quota |
| PREVIEW-010-002 | P2 | Preview Media | serverless FS durability and Poppler unproven | actual storage/pdf code inspection | cannot claim durable hosted media processing | durable adapter/runtime before hosted claim | NOT YET VERIFIED |
| PREVIEW-010-003 | P1 | Vercel Quota | new deployment rejected by provider build-rate limit | Vercel status on `68be2f5…`: `Deployment rate limited — retry in 24 hours.` | blocks required live Student/Admin/API verification | retry already-synced branch after quota window; no security/business workaround | BLOCKED EXTERNALLY |
| PRODUCT-002 | P1 | Activation UX | baseline combines code+password | Product Review PED-003 | does not meet final flow | two-step ticket + atomic finalization | PENDING Stage6/8 reopen |
| PRODUCT-003 | P1 | Device Policy | password-only login lacks registered-device enforcement | PED-014/AD-038 | account can move devices without intended challenge | cryptographic application-device challenge/rebind | PENDING |
| PRODUCT-006 | P1 | Assessment | live Student AI would raise cost/uncertainty | Product Review | unreviewed questions | Published Question Bank only | DECIDED; implementation pending |
| AI-NEW-002 | P1 | AI Scale | giant requests lose progress and overload providers | Product Review | brittle expensive generation | durable chunks/queue/backpressure | PENDING Stage12 |
| DOC-001 | P2 | Continuity | chat-memory dependency | repository governance | repeated/contradictory work | Status/Log/Handoff/specialized docs | CONTROLLED |

## Tests & Verification

### Final implementation head before documentation-only updates

`68be2f5e750ba3d53bf31fae1641182f29516627`

- Stage10 `34000105615` — SUCCESS.
- Stage9 `34000105600` — SUCCESS.
- Full Rebuild `34000105608` — SUCCESS.
- Chromium activation/returning-login/recovery — SUCCESS.

### Supabase direct verification

- migrations through `0009` plus Preview lockdown registered.
- media tables exist with RLS.
- `anon`/`authenticated` direct SELECT revoked.
- Stage10 indexes present.

### Vercel runtime verification

Fresh Stage10 deployment = **NOT YET VERIFIED** because Vercel refused the build before deployment creation due rate limit.

Pending after quota clears:

- exact deployment commit = `NOT YET VERIFIED`;
- deployment `READY` = `NOT YET VERIFIED`;
- Student `/` = `NOT YET VERIFIED` on fresh Stage10 Preview;
- Admin `/admin` = `NOT YET VERIFIED`;
- `/api/health` = `NOT YET VERIFIED`;
- `/api/ready` against Supabase = `NOT YET VERIFIED`;
- hosted media durability/Poppler = `NOT YET VERIFIED`.

## Legacy Feature Coverage Impact

Stage10 Preview Sync is infrastructure/schema/deployment work. It implements or removes no Student/Admin legacy capability. Therefore:

- no `PRODUCT_FEATURE_PARITY_MATRIX.md` feature row is promoted by this batch;
- no legacy capability is marked `REMOVE`;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remains mandatory unchanged for Stage13/14+ feature closure.

## Known Issues / Remaining Risk

- **P1 external blocker:** Vercel build-rate quota prevents final Stage10 Preview runtime verification.
- Stage6/8 partial reopen not implemented.
- durable hosted media adapter/runtime not implemented.
- OCR Extraction Foundation not implemented.
- Student PWA final install/update/offline lease not runtime-verified.
- Reader Text/Search/TTS not implemented.
- Published Question Bank practice/test engine not implemented.
- Notes media sync, auto Needs Review, Push and progress/weak-area pipelines not implemented.
- Stage11 provider-neutral AI benchmark/contracts and Stage12 durable router/scheduler/cascade not implemented.
- Admin/Student complete product stages not implemented.
- later performance/security/accessibility/content-load/staging/release/production/ops gates remain.

## Remaining Work — Ordered

1. After Vercel build-rate window clears, deploy current `preview/supabase-vercel` without changing Business/Security contracts.
2. Verify deployment `READY`, exact commit, Student, Admin, `/api/health`, `/api/ready`, and document Stage10 hosted limitations.
3. Only then declare Stage10 Preview Sync complete.
4. Stage6/8 partial reopen: two-step activation, temp-password forced change, registered-device challenge/rebind; API/PostgreSQL/security/Chromium gates; Preview sync.
5. OCR Extraction Foundation.
6. Stage11 provider/model-neutral AI contracts + golden benchmark/provenance/validators.
7. Stage12 durable high-throughput provider/model-neutral execution.
8. Continue Stage13+ from `MASTER_REBUILD_ROADMAP.md` with legacy coverage and unified Design System gates.

## Documentation / Continuity Protocol

After every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI/Preview state changes;
- update specialized Product/AI/Preview docs;
- update parity/coverage evidence when actual features land;
- retain exact commit/CI/deployment/runtime evidence;
- unexecuted = `NOT YET VERIFIED`.

## Current State

**Product Review is closed. Stage10 Preview engineering integration, Supabase migration/security hardening, regression CI and Preview branch synchronization are complete. Fresh Vercel runtime deployment is NOT YET VERIFIED because the provider rejected the build due a temporary build-rate limit. Stage10 Preview Sync is therefore not declared complete, and Stage6/8 implementation must not begin until that runtime gate is verified.**
