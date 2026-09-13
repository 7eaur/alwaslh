# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACKS: UX/UI REFOUNDATION + PARALLEL SUPER ADMIN PRODUCT REBUILD**

**SUPER ADMIN CURRENT BATCH:** `AR-07 — Quiz Builder` — ACTIVE / Batch 1 list ownership migration; exact-head CI pending.

**SUPER ADMIN COMPLETED:** `AR-01` through `AR-06` — DONE / VERIFIED.

Branch: `rebuild/super-admin-foundation`

Draft PR: **#52 — `refactor(admin): rebuild Super Admin foundation`** — remains Draft.

Latest live `main` re-read before AR-07 Batch 1: `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`. The Admin branch remains isolated and must not overwrite Student/audit work.

Canonical UX roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.
Super Admin roadmap: `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`.

## Super Admin verified stages

### AR-01 — DONE / VERIFIED
Route-driven Admin shell/deep links, task-oriented navigation, and removal of stage/parity/debug surfaces from normal navigation.

### AR-02 — DONE / VERIFIED
Attention-first Overview plus split Operations Health/Audit/Diagnostics and humanized operational read models.

### AR-03 — DONE / VERIFIED
Curriculum backend/domain contracts preserved; giant composition decomposed into hierarchy browsing, contextual creation and entity actions; PostgreSQL/API/Chromium flow verified.

### AR-04 — DONE / VERIFIED
Protected OCR/source evidence, lesson-owned publication, media readiness guards, preserved revision/audit authority and contextual legitimate authoring/export tools.

Verified checkpoint: `ba74c17902827805d6be0ab91c0ff384fc3e2530`.

### AR-05 — DONE / VERIFIED
Content-first AI review, contextual apply/import, preserved server polling/review/idempotency/provenance authority, paginated histories and correct content-revision browser contract.

Verified checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.

- Frontend `34729512441` — SUCCESS.
- Admin AI `34729512433` — SUCCESS.
- Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank — DONE / VERIFIED

Question Bank is now route-owned and decomposed without changing canonical PostgreSQL/API lifecycle authority.

Verified ownership:

- `/app/questions` — focused list/filter/pagination.
- `/app/questions/:questionId` — canonical detail, current-revision edit, review/history, approved regeneration.
- `/app/questions/manage` — focused Manual Create + Approved AI Import route.
- `QuestionBankWorkspace.tsx` — removed after proving it was no longer a production route owner or required parity adapter.

Preserved server authority:

- question lifecycle/revisions/publication;
- review state and events;
- curriculum scope and validation;
- AI provenance/import/regeneration validation;
- approval/current-published-revision/idempotency rules.

Key verified batches:

- Batch 1 detail: `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.
- Batch 2A focused list: `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`.
- Batch 2B route-owned edit: `43162f9b4f0468af96ae726f16054a868aff605a`.
- Batch 2C approved regeneration: `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`.
- Batch 2D routed Chromium ownership: `424bb1054fbd1a21991aa937be0f4338e08c7f09`.
- Batch 2E focused create/import: `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`.
- Batch 2F legacy cleanup/final closure: `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`.

Final exact code-head verification for AR-06 on `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`:

- Stage 13E Frontend Preparation `34740148367` — **SUCCESS**: lint, strict typecheck, unit tests, production build.
- Stage 13E Admin AI Operations `34740148382` — **SUCCESS**: API quality, clean PostgreSQL migrations/contracts, review/authorization/observability/security regressions.
- Stage 13E Combined Integration `34740148361` — **SUCCESS**: API/Admin quality, clean PostgreSQL, backend authority/security regressions, deterministic fixtures and real Admin Chromium.

No route/navigation change was introduced by Batch 2F; existing real Chromium Question Bank flows therefore remained the executable parity proof while the orphaned source was removed.

## AR-07 — Quiz Builder — ACTIVE

Batch 1 started from documented handoff `ea6c0a07fddeaf0a219440cca277e68f7fa9587b` after re-reading live `main`, PR #52, exact-head CI, frontend ownership, API/service contracts and `quiz-builder.integration.test.ts`.

Classification so far:

- **KEEP:** PostgreSQL/API authority for quiz lifecycle, published Question Bank revision references, immutable published snapshots and export rules.
- **REFACTOR:** route ownership in Admin frontend; the old `QuizBuilderWorkspace.tsx` still combines list/create/detail/version editing/lifecycle/export.
- **MIGRATE GRADUALLY:** preserve the legacy management surface while focused routes are proven, rather than removing capability in one large rewrite.

Batch 1 code changes:

- `7746000748129a659e098e016d3ffbfd4d5ddc46` — added `admin/quizzes/QuizBuilderListPage.tsx` as a focused server-backed list/search/status/pagination surface.
- `30d9443ed1c159440d38dc76db61686028c3d028` — routed `/app/quizzes` to the focused list and moved the existing all-capabilities workspace to `/app/quizzes/manage` as a temporary parity-preserving management route.
- No migrations, API business rules or Student code changed.

CI launched for exact code head `30d9443ed1c159440d38dc76db61686028c3d028`:

- Frontend `34741455324` — IN PROGRESS at this checkpoint.
- Admin AI `34741455298` — PENDING at this checkpoint.
- Combined `34741455320` — PENDING at this checkpoint.

AR-07 is **not complete** and Batch 1 must not be declared verified until these exact-head runs are green.

## Immediate next actions / shared handoff

1. Re-read this file, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, current branch HEAD, live `main`, PR #52 and exact-head CI before editing.
2. First reconcile the three runs for code head `30d9443ed1c159440d38dc76db61686028c3d028`; do not start another code batch while they are active.
3. If any run fails, inspect the failing job/log and fix the root cause only; do not weaken coverage or revert the route split merely to satisfy stale UI assumptions.
4. If green, mark AR-07 Batch 1 VERIFIED and continue AR-07 only: next target is route-owned quiz detail/management decomposition with explicit list→entity/deep-link parity, while lifecycle/version/export authority remains server-owned.
5. Do not start AR-08 before AR-07 exact-head verification and synchronized documentation.
6. Keep PR #52 Draft and do not merge automatically.

## Parallel product/audit facts that remain open

- `FPA-013` Reader active-search focus remains open in the Student/audit track.
- authenticated production-path verification remains `NOT YET VERIFIED` where recorded by the audit.
- Admin bundle >500 kB warning belongs to evidence-driven AR-10 performance cleanup unless an earlier regression makes it urgent.

## Binding quality rule

The existing UI is functional evidence, not a visual preservation contract. Changed screens must meet:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student is Arabic-first/RTL-first. Super Admin is a task-oriented operations product; technical pipeline/database details stay advanced-only.