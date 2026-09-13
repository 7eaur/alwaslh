# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACKS: UX/UI REFOUNDATION + PARALLEL SUPER ADMIN PRODUCT REBUILD**

**SUPER ADMIN CURRENT BATCH:** `AR-06 — Question Bank` — ACTIVE / BATCH 2E VERIFIED.

**SUPER ADMIN COMPLETED:** `AR-01` through `AR-05` — DONE / VERIFIED.

Branch: `rebuild/super-admin-foundation`

Draft PR: **#52 — `refactor(admin): rebuild Super Admin foundation`** — remains Draft.

Live `main` re-read before Batch 2E: `43be0bfddf6709318912a219b818b35e71d7f9a4`. The Admin branch remains isolated and must not overwrite Student/audit work.

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

## AR-06 — Question Bank — ACTIVE

Backend/domain classification remains **KEEP**: PostgreSQL/API own lifecycle, revisions, publication authority, AI provenance/import/regeneration validation and review events. The active problem is frontend composition/ownership.

### Batch 1 — route-owned detail — VERIFIED

Added `/app/questions/:questionId` with canonical detail/review/history while preserving server lifecycle commands.

Verified code head: `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.

### Batch 2A — focused list + entity routing — VERIFIED

`/app/questions` became the focused list/filter/pagination route and cards navigate to durable question detail.

Verified code head: `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`.

### Batch 2B — route-owned edit — VERIFIED

`QuestionBankDetailPage` owns current-revision editing while the existing PATCH command and revision history remain server-authoritative.

Verified code head: `43162f9b4f0468af96ae726f16054a868aff605a`.

### Batch 2C — route-owned approved regeneration — VERIFIED

Approved regeneration moved to the entity route while existing approval/provenance/source/current-published-revision/idempotency authority remained unchanged.

Verified code head: `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`.

### Batch 2D — explicit routed Chromium ownership — VERIFIED

Stage13F browser coverage proves list→detail, direct deep-link, edit, review decisions, publish/reject, approved regeneration, provenance, session expiry, 390px behavior and Quiz Builder regression safety.

Verified code head: `424bb1054fbd1a21991aa937be0f4338e08c7f09`.

- Stage 13F Question Bank `34736985564` — SUCCESS.
- Stage 13F Admin Question Bank `34736985648` — SUCCESS.

### Batch 2E — focused Manual Create + Approved AI Import ownership — VERIFIED

State received before mutation:

- feature documentation HEAD `c7c57905b603b017f915a73bf402566016f24ac9`;
- AR-06 ACTIVE / Batch 2D VERIFIED;
- exact-head received CI green;
- Draft PR #52 still Draft;
- `main` and Student/audit work were read and left untouched.

Repository inspection confirmed there was **no missing backend CRUD/schema contract** for this batch. `createManualQuestion` and `importApprovedAiQuestions` already enforce the canonical API/PostgreSQL path. The root issue was that `QuestionBankWorkspace.tsx` still owned unrelated list/detail/edit/review/regeneration plus create/import composition.

Classification:

- **KEEP:** existing Question Bank API/PostgreSQL commands and validation authority.
- **REFACTOR:** Manual Create and Approved AI Import into focused route ownership.
- **IMPROVE:** loading/error/success states and single-purpose create/import composition.
- **KEEP temporarily:** legacy `QuestionBankWorkspace.tsx` source until duplicate responsibilities can be removed safely after verified replacement.
- **NO CHANGE:** migrations, backend lifecycle rules, Student code.

Implementation:

- `5e2bbcb8e402927b6e5b3b43b6f9464b577ede62` — created `apps/admin-web/src/admin/questions/QuestionBankCreatePage.tsx` owning only manual creation and approved AI import, with curriculum scope selection and the existing question validation/normalization semantics.
- `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee` — routed `/app/questions/manage` to `QuestionBankCreatePage` and removed the giant legacy workspace from the production route.
- existing Chromium labels/flows were intentionally preserved so parity is tested rather than assumed.

Exact-head verification on `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`:

- Stage 13E Frontend Preparation `34739142677` — **SUCCESS**: lint, strict typecheck, unit tests and production build.
- Stage 13E Combined Integration `34739142686` — **SUCCESS**: API/Admin quality, clean PostgreSQL migrations/contracts, backend authority/security regressions, deterministic browser fixtures and real Admin Chromium.
- Existing real Chromium manual-create and approved-AI-import scenarios now execute against the focused page because `/app/questions/manage` resolves to the new owner.

AR-06 is **not complete yet**. Batch 2E proves focused create/import ownership, but source cleanup and route simplification remain deliberately separate.

## Immediate next actions / shared handoff

1. Re-read this file, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, current branch HEAD, live `main`, PR #52 and exact-head CI before editing.
2. If documentation commits triggered newer CI, inspect/close those runs before code mutation.
3. Continue **AR-06 only**; do not start AR-07.
4. Inspect references to `QuestionBankWorkspace.tsx` and `/app/questions/manage` after Batch 2E.
5. Remove duplicate/dead legacy list/detail/edit/review/regeneration/create/import composition only when no production/test/import path still needs it.
6. Decide whether `/app/questions/manage` remains a useful focused create/import route or should be replaced by more contextual create/import routes; do not retire it merely for cosmetic cleanup.
7. Add/adjust browser assertions if cleanup changes navigation ownership.
8. Close AR-06 only on final exact-head Frontend + API/PostgreSQL/Chromium evidence for the final routed structure.
9. Then proceed AR-07 → AR-08 → AR-09 → AR-10 in order.
10. Keep PR #52 Draft and do not merge automatically.

## Parallel product/audit facts that remain open

- `FPA-013` Reader active-search focus remains open in the Student/audit track.
- authenticated production-path verification remains `NOT YET VERIFIED` where recorded by the audit.
- Admin bundle >500 kB warning belongs to evidence-driven AR-10 performance cleanup unless an earlier regression makes it urgent.

## Binding quality rule

The existing UI is functional evidence, not a visual preservation contract. Changed screens must meet:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student is Arabic-first/RTL-first. Super Admin is a task-oriented operations product; technical pipeline/database details stay advanced-only.