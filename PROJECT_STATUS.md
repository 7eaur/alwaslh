# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACKS: UX/UI REFOUNDATION + PARALLEL SUPER ADMIN PRODUCT REBUILD**

**SUPER ADMIN CURRENT BATCH:** `AR-07 — Quiz Builder` — ACTIVE / Batch 1 VERIFIED + Batch 2A VERIFIED; Batch 2B is next.

**SUPER ADMIN COMPLETED:** `AR-01` through `AR-06` — DONE / VERIFIED.

Branch: `rebuild/super-admin-foundation`

Draft PR: **#52 — `refactor(admin): rebuild Super Admin foundation`** — remains Draft.

Latest live `main` re-read in this checkpoint: `343ff1fd7b3d64d7e990b72606695365f520fa58`. This includes independent Student work; the Admin branch remains isolated and must not overwrite or opportunistically rebase that work.

Canonical UX roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.
Super Admin roadmap: `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`.

## Super Admin verified stages

### AR-01 — DONE / VERIFIED
Route-driven Admin shell/deep links and task-oriented navigation.

### AR-02 — DONE / VERIFIED
Attention-first Overview plus Operations Health/Audit/Diagnostics split.

### AR-03 — DONE / VERIFIED
Curriculum hierarchy/context decomposition with backend/domain contracts preserved.

### AR-04 — DONE / VERIFIED
Protected OCR/source evidence, lesson-owned publication, media readiness and contextual authoring/export.

### AR-05 — DONE / VERIFIED
Content-first AI review, contextual apply/import and preserved polling/review/idempotency/provenance authority.

Verified checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`:
- Frontend `34729512441` — SUCCESS.
- Admin AI `34729512433` — SUCCESS.
- Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank — DONE / VERIFIED

Route ownership:
- `/app/questions` — focused list/filter/pagination.
- `/app/questions/:questionId` — canonical detail/edit/review/history/regeneration.
- `/app/questions/manage` — focused Manual Create + Approved AI Import.
- legacy `QuestionBankWorkspace.tsx` removed after executable parity proof.

Final exact code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`:
- Frontend `34740148367` — SUCCESS.
- Admin AI `34740148382` — SUCCESS.
- Combined `34740148361` — SUCCESS.

## AR-07 — Quiz Builder — ACTIVE

### Batch 1 — focused list ownership — VERIFIED

The giant `QuizBuilderWorkspace.tsx` originally combined list/create/detail/version editing/lifecycle/export. Server APIs were already focused and backend integration tests proved published Question Bank revision eligibility, frozen version snapshots, lifecycle-controlled export and published-version immutability.

Implementation:
- `7746000748129a659e098e016d3ffbfd4d5ddc46` — focused `QuizBuilderListPage`.
- `30d9443ed1c159440d38dc76db61686028c3d028` — `/app/quizzes` owns the list; temporary parity adapter moved to `/app/quizzes/manage`.
- `18607a1bf31392f9143a0e68c4531c972d4199d5` — strict TypeScript root-cause correction.

Exact-head verification:
- Frontend `34741610234` — SUCCESS.
- Admin AI `34741610225` — SUCCESS.
- Combined `34741610238` — SUCCESS.

### Batch 2A — routed quiz entity/deep-link ownership — VERIFIED

State reconciled before mutation:
- documentation HEAD `4a60954c8358edd073d8fe26fd6dafbd16ae8670` had successful docs-only gates: Admin AI `34741815805`, Combined `34741815816`.
- PR #52 remained Draft.
- live `main` was re-read at `343ff1fd7b3d64d7e990b72606695365f520fa58` and was not modified.

Root-cause finding:
- list cards routed to `/app/quizzes/manage?quizId=...`;
- the legacy workspace did not read `quizId` from the URL;
- therefore list→entity navigation was not true deep-link ownership even though the list split compiled.

Implementation:
- `3099648db1b1cf95d1af3c1d579e8f7972748006` — added `admin/quizzes/QuizBuilderDetailPage.tsx`, a server-backed route-owned entity overview using `fetchQuiz`.
- `1c5707ae089487811401368e4c048720a7b121cf` — list cards now navigate to `/app/quizzes/:quizId`.
- `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac` — registered the canonical entity route.

The new entity page owns deep-linkable read/detail context: status, description, lesson scope, versions/question counts and lifecycle event history. It deliberately leaves create/version mutation/lifecycle/export inside the temporary management adapter until those responsibilities are migrated with executable parity.

Exact-head verification on `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`:
- Frontend `34742505009` — SUCCESS.
- Admin AI `34742505020` — SUCCESS.
- Combined `34742505015` — SUCCESS, including clean PostgreSQL and real Admin Chromium.

Classification after Batch 2A:
- **KEEP:** PostgreSQL/API lifecycle, published-question revision linkage, snapshot immutability and export authority.
- **KEEP TEMPORARILY:** `QuizBuilderWorkspace.tsx` only for legitimate unmigrated create/version/lifecycle/export capability.
- **REFACTOR NEXT:** move entity-scoped version/lifecycle/export operations into routed/focused ownership.
- **NO CHANGE:** backend business rules, migrations and Student/audit workstream.

## Immediate next actions / shared handoff

1. Re-read this file, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, current branch HEAD, live `main`, PR #52 and exact-head CI before editing.
2. Reconcile CI generated by this synchronized documentation checkpoint before new code.
3. Continue **AR-07 only — Batch 2B**. Inspect which legitimate capabilities remain solely in `QuizBuilderWorkspace.tsx` and migrate the next coherent entity-scoped responsibility, prioritizing version composition/editing and lifecycle/export ownership without duplicating server authority.
4. Add explicit real Chromium ownership coverage for `/app/quizzes` → `/app/quizzes/:quizId` and direct deep-link behavior if the generic Combined suite does not already assert those exact routes.
5. Do not remove the legacy workspace until create/version/lifecycle/export ownership is replaced and exact-head parity is executable.
6. Do not start AR-08 until AR-07 is fully green, legacy ownership is resolved, and closure documentation is synchronized.
7. Keep PR #52 Draft; no automatic merge.

## Parallel product/audit facts that remain open

- `FPA-013` Reader active-search focus remains open in the Student/audit track.
- authenticated production-path verification remains `NOT YET VERIFIED` where recorded by the audit.
- Admin bundle >500 kB warning belongs to evidence-driven AR-10 performance cleanup unless an earlier regression makes it urgent.

## Binding quality rule

Changed screens must meet:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student is Arabic-first/RTL-first. Super Admin is a task-oriented operations product; technical IDs/provider/runtime/storage/database details stay advanced-only.