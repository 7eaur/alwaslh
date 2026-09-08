# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** a new engineer/chat should be able to resume the project from this file + `DOCUMENTATION_INDEX.md` without prior conversation memory.

Last synchronized: 2026-09-08.

## 0. Mandatory startup procedure

Before changing code:

1. Confirm repository `7eaur/alwaslh`, branch `planning/product-evolution-review`, Draft PR #12.
2. Read `README.md` and `DOCUMENTATION_INDEX.md`.
3. Read this file, then `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md`.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` before interpreting older Product Decisions.
5. Read Product Decisions, parity/coverage, Roadmap and specialized current-stage docs listed in the Index.
6. Inspect actual code/callers/migrations/tests for the area to modify. File/folder names alone are not evidence.
7. Check GitHub Actions for the exact HEAD; never infer PASS from chat prose.
8. Anything not inspected/tested = `NOT YET VERIFIED`.

## 1. Repository / Git state

- Repo: `7eaur/alwaslh`
- Working branch: `planning/product-evolution-review`
- Draft PR: #12
- PR base: `rebuild/media-pipeline`
- Latest fully verified executable head: `260cfef1c48d1290611103f8443d222f8cd041b6`
- Current docs consolidation is a docs-only descendant of that executable head.
- Do not force-update refs or rewrite prior history.

## 2. Product idea

**الوسيلة الذكية** is an Arabic educational platform. Its business outcome is not “show PDFs”; it manages trustworthy curriculum/content, controlled student access, learning/practice and review.

Three product surfaces:

### Student Web/PWA — `apps/student-web`

Target outcomes:

- secure Full-Code activation and returning login;
- entitlement-filtered classes/subjects/lessons;
- mobile-first Reader with media/text/summary/search/TTS;
- Practice / Full Tests / original and generated models;
- Notes, Favorites, Needs Review;
- progress/private achievements/recommendations;
- notifications;
- explicit offline downloads + PWA install/update/sync lifecycle.

### Admin Web — `apps/admin-web`

Target outcomes:

- curriculum and content authoring;
- image/PDF/mixed upload and processing supervision;
- media/OCR review;
- AI job operations and reviewed generated content;
- Question Bank / Quiz Builder / publish lifecycle;
- students/access codes/recovery/device reset;
- notifications;
- import/export/reports/settings/audit.

### Backend API — `apps/api`

Authoritative boundary for:

- Auth/Authorization/Entitlements;
- curriculum/business data;
- PostgreSQL mutations;
- Media/OCR/AI execution and review;
- trusted assessment/progress/publish state.

Browser never owns those authorities or talks directly to PostgreSQL as the application data path.

## 3. Legacy preservation rule

The legacy product is a **feature/scenario/failure reference**, not target architecture.

Hard gates:

- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
- `PROJECT_DEEP_AUDIT.md`
- `PROJECT_FULL_AUDIT_CATALOG.md`

Every valuable legacy capability must end as:

`KEEP | IMPROVE | REFACTOR | REBUILD | REMOVE(owner-approved)`

and before product completion must have implementation + acceptance evidence. Never silently drop a legacy result because the old code was poor.

## 4. Current Product Owner overrides

Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.

Current operational facts:

1. **Deployment/Preview is deferred.** Do not deploy, sync Preview, or re-enable auto-deploy without an explicit new Product Owner command. This currently supersedes PED-051 cadence.
2. **Old database is outside current scope.** Continue from repository/current PostgreSQL/source-reference evidence; legacy DB access is not a blocker.
3. **Repository documentation is official memory.** New chats must read docs, not rely on chat memory.
4. **Root-cause only.** No test/security/business-rule weakening to get green CI.

## 5. Stable architecture / boundaries

```text
Student PWA ─┐
             ├── Fastify API ── private PostgreSQL
Admin Web ───┘       │
                     ├── Stage9 source/provenance
                     ├── Stage10 media
                     ├── OCR derived/reviewed text
                     ├── Stage11 AI contracts/validation
                     ├── Stage12 jobs/capacity/controls/worker
                     └── later publish/TTS/offline/etc.
```

Stable rules:

- Full Code exactly 6 digits; Class Code exactly 7 digits.
- Student activation verify is non-consuming; final activation is atomic.
- Student returning session requires password + registered ECDSA P-256 device proof.
- Browser private device key is non-extractable; public SPKI/proof only leaves browser.
- Admin login is separate; recovery issues temporary password, revokes sessions, forces private password replacement and supports explicit device rebind.
- Curriculum authority is `Class → Subject Offering(subject_class_links) → optional curriculum_sections → Lesson`.
- No recursive generic curriculum tree without a new product rule.
- Stage9 `alwaslh-go` import is source/provenance evidence, not curriculum hierarchy.
- Source folders must never silently become Business Rules.
- Stage10 media variants are processing evidence, not automatically Published Lesson content.
- Upload/media success is independent from OCR/AI/TTS.
- OCR is durable derived state over media identity/checksum; approved/reviewed text is the safe downstream evidence path.
- AI contracts are provider/model-neutral; Prompt Registry/versioning and validators remain separate from provider selection.
- Exact/extraction AI modes never fabricate unknown answers.
- AI provider calls occur outside long DB transactions.
- lease/attempt/output writes are stale-worker protected.
- distributed capacity/cooldown/kill/budget controls are DB coordinated.
- Fastify remains HTTP-only; dedicated AI worker runtime is separate.
- operational pressure is not semantic failure and does not consume retry/escalation automatically.
- Student ultimately consumes Published Admin-reviewed Question Bank, not raw provider output.

## 6. Verified stage history

### Stages1–5

Product/brand/UX/PostgreSQL/engineering foundation built and placed under executable CI. Legacy inventories/audits converted into explicit contracts rather than relying on old code behavior.

### Stage6 / Stage8 Auth, Activation, Device

Exact implementation checkpoint: `016546eca5696337b52063903bb5ba2fb9631c33`.

Verified behavior: two-step Full-Code activation, atomic finalization, role isolation, returning device challenge, non-extractable P-256 identity, recovery + forced password replacement, session invalidation and device rebind.

### Stage7 Access/Entitlements

Transactional Class Code redemption, multiple entitlements, renewal/no-waste semantics, server authorization and races verified.

### Stage9 Canonical source import

Canonical source repository: `7eaur/alwaslh-go`.
Pinned verified source revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

Verified inventory:

- 15 roots;
- 48 documents;
- 5,552 images;
- 4,218 JPG;
- 1,334 WEBP;
- 86 recognized helpers;
- 24 manifests;
- manifest digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage10 Media Pipeline

`0009_media_pipeline.sql`, deterministic source/display/thumbnail/ai variants, checksums/order/provenance/idempotency/cleanup, local filesystem storage adapter, Sharp image processing and Poppler PDF extraction verified. Hosted durable storage/Poppler remains unverified because deployment is deferred.

### OCR Foundation

Closure checkpoint `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

`0011_ocr_foundation.sql`: queued/running/retrying/completed/failed, leases/retry, raw+normalized text, confidence, review states, approved search, stale worker protection, real Tesseract wiring. Production OCR quality benchmark beyond integration/smoke remains future work.

### Stage11 Provider-neutral AI contracts

Verified checkpoint `592123dae33f0cfce2ecd36e9577764767faa95a`.

Typed generation/extraction modes, Prompt Registry/versioning, source/page/checksum provenance, Arabic/scientific/exact validators, count/answer/index consistency, duplicate/near-duplicate handling, no fabricated exact answer, golden fixtures and benchmark harness.

`direct` question output is preserved but current Question Bank persistence mismatch remains OPEN.

### Stage12 durable AI execution/runtime

Verified sequence:

- core `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`;
- capacity/backpressure `881102ff94711f908104cd068a003ad598609944`;
- operational controls `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`;
- pause/resume/progress `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`;
- lifecycle ownership cleanup `e7b95042a017ea558db9f769a46a37f155273a15`;
- dedicated worker runtime `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

Reuses `ai_jobs/ai_job_units/ai_outputs`; no second queue. Includes attempts, leases, retries/backoff, partial success, bounded cascade, DB capacity, kill/cooldown/budget controls, pause/resume/progress, fixed worker slots, bounded idle backoff, graceful drain, fail-fast unexpected worker errors.

Live provider benchmark/credentials/routes/bootstrap remain intentionally unverified.

### Stage13A Curriculum backend

Final backend checkpoint `6484677dffa80ca0658ce5837750d824e1bb6943`.

Uses existing `subject_class_links` as Offering; adds one optional section layer and DB-enforced same-offering section→lesson scope. Admin lifecycle is status/archive oriented, not destructive by default.

### Stage13B Admin Curriculum Web

Final earlier closure `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

Admin login/session restore/logout, create/edit Class/Subject/Offering/Section/Lesson, order/status/move, loading/error/empty/mutation states, responsive RTL, real Chromium flow.

### Stage13C Admin Content / Media / OCR Operations — VERIFIED

Current executable closure: `260cfef1c48d1290611103f8443d222f8cd041b6`.

Implementation:

Backend:
- `apps/api/src/content/admin-operations.ts`
- `apps/api/src/content/admin-operations-http.ts`
- wired through `apps/api/src/app.ts`.

API:
- `GET /v1/admin/content-operations`
- `GET /v1/admin/content-operations/documents/:documentId`
- `GET /v1/admin/content-operations/ocr/:extractionId`
- `PATCH /v1/admin/content-operations/ocr/:extractionId/review`

Admin Web:
- `ContentOperationsWorkspace.tsx`
- `content-operations-api.ts`
- `content-operations.css`
- sidebar navigation switches between Curriculum and Media/OCR.

Verified results:
- search/filter/pagination and processing metrics;
- ordered source assets;
- ready/failed media + variants/errors;
- OCR metadata list without raw text payload;
- separate OCR raw/detail view;
- review/correct/approve/reject;
- empty text cannot be approved without correction;
- conflicting/replayed review is rejected;
- UI refreshes authoritative pending count;
- loading/error/empty/review UX;
- Chromium proves media inspection and OCR approval.

Specialized doc: `docs/admin/STAGE13_CONTENT_MEDIA_OCR_OPERATIONS.md`.

## 7. Latest exact verification matrix

Executable head: `260cfef1c48d1290611103f8443d222f8cd041b6`.

- Stage13 Admin Product `34173006035` — SUCCESS (backend + Admin Chromium)
- Stage12 AI Execution `34173006025` — SUCCESS
- Stage11 AI Contracts `34173006065` — SUCCESS
- OCR Foundation `34173006050` — SUCCESS
- Stage10 Media Pipeline `34173006043` — SUCCESS
- Stage9 Content Import `34173006055` — SUCCESS
- Full Rebuild `34173006036` — SUCCESS (includes Student Chromium)

## 8. Current next work — Stage13D

**Do not jump to AI/Question Bank UI yet.** First close the content ingestion/publication boundary.

Required discovery/implementation sequence:

1. Inspect actual current media service/storage APIs, source import path, `lesson_assets`, curriculum callers and legacy `LES-A-010..015` evidence.
2. Define a single Admin ingestion contract for images/PDF/mixed input that reuses Stage10.
3. Preserve user-selected ordering through PDF extraction and mixed sources.
4. Define durable upload/processing task progress/history; browser must not own canonical job progress.
5. Define explicit Media/Source → Lesson linking and Draft/Review/Published behavior.
6. Do not equate a ready media asset with published curriculum content.
7. Add API/PostgreSQL/unit/integration/Chromium tests.
8. Record exact same-head regressions.
9. Update Status/Engineering Log/Handoff/specialized doc/Legacy Coverage.

Only after Stage13D is green move to Stage13E Admin AI Operations/Review.

## 9. Remaining major work after Stage13D

- Stage13E Admin AI Operations/Review using verified Stage12, not a client queue.
- Stage13F Question Bank/Quiz Builder/review/publish/export; resolve `direct` persistence first.
- Stage13G Students/Codes/Recovery/Device Rebind/Notifications/Import-Export/Reports/Settings/Audit.
- Stage14 Student full product/Reader.
- Stage15 Assessment/Practice/Test/Models.
- Stage16 final Offline/PWA.
- Stage17 Notes/Favorites/Needs Review.
- Stage18 Notifications/Push.
- Stage19 Progress/Statistics/weak-area recommendations/private achievements.
- Stage20 Import/Export/Reporting.
- Stages21–29 performance/security/test/a11y/data/staging/release/cutover/monitoring.

See `MASTER_REBUILD_ROADMAP.md`.

## 10. Open findings / risks to carry forward

- `CONTENT-013-002` P1 — no verified explicit media→`lesson_assets` publication/linking contract yet.
- `AI-011-005` P2 — `direct` AI question persistence unresolved.
- `AI-012-019` P2 — live provider benchmark/config/routes/bootstrap unverified.
- TTS runtime/quality unverified.
- hosted runtime unverified due deployment deferral.
- final Offline/PWA and Student learning product incomplete.
- `tmp-unused-do-not-use` branch P3 housekeeping.

All other open/closed findings are in `PROJECT_ENGINEERING_LOG.md`.

## 11. What NOT to do

- Do not use old root Supabase architecture as current target.
- Do not re-open the old database task unless Product Owner explicitly asks.
- Do not deploy or re-enable Git/Vercel/Supabase preview automation.
- Do not create a second Subject Offering table.
- Do not create a generic recursive curriculum tree.
- Do not make source filenames/folders curriculum authority.
- Do not create second media/OCR/AI lifecycle just for Admin UI.
- Do not expose provider credentials/secrets/client-side.
- Do not let browser own job progress or publish authority.
- Do not weaken a test to cover a real product defect. If the harness is wrong, prove it and keep coverage at least as strong.
- Do not call a stage VERIFIED without exact executable evidence.

## 12. Documentation rule before ending any future session

Update at minimum:

- `PROJECT_STATUS.md`
- `PROJECT_ENGINEERING_LOG.md`
- `PROJECT_HANDOFF.md`
- current specialized doc
- Legacy Coverage evidence when relevant
- Roadmap if phase/state changed
- exact commit/run IDs

Keep `NEXT_CONVERSATION_PROMPT.md` short; put actual state in repository docs, not in a giant prompt.