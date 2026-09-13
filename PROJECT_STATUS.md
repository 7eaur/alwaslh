# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACKS: UX/UI REFOUNDATION + PARALLEL SUPER ADMIN PRODUCT REBUILD**

**SUPER ADMIN CURRENT BATCH:** `AR-07 — Quiz Builder` — ACTIVE / Batch 1 + Batch 2A + Batch 2B VERIFIED; Batch 2C is next.

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

Exact-head verification on `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`:
- Frontend `34742505009` — SUCCESS.
- Admin AI `34742505020` — SUCCESS.
- Combined `34742505015` — SUCCESS, including clean PostgreSQL and real Admin Chromium.

### Batch 2B — entity-owned lifecycle/export + explicit routed Chromium proof — VERIFIED

State received from Batch 2A was re-read from repository documentation, branch HEAD, live `main`, Draft PR #52 and exact-head CI before mutation. `QuizBuilderWorkspace.tsx` was re-inspected and still owned create/version composition/lifecycle/export.

Decision and implementation:
- **KEEP:** PostgreSQL/API lifecycle, published Question Bank revision linkage, immutable published snapshots and export authority.
- **REFACTOR:** move submit/reject/publish/archive and CSV/print export into canonical `/app/quizzes/:quizId` ownership.
- **KEEP TEMPORARILY:** `/app/quizzes/manage` for create + version composition/editing only.
- `39f0d1ef961208b0697b1c8b3c80e352723fad82` — `QuizBuilderDetailPage` now owns lifecycle actions and lifecycle-gated version export while still calling canonical server commands.

The first exact-head matrix on `39f0d1ef...` was fully green (Frontend `34743770716`, Admin AI `34743770721`, Combined `34743770718`), but inspection found the generic Chromium suite still did not assert Quiz Builder routes explicitly. The batch was therefore not closed on that evidence alone.

Explicit browser ownership proof:
- `53efb6951b6f30cc95e84646973d974d2fc4536c` — added `e2e/quiz-builder.e2e.spec.mjs` and wired it into Combined Integration.
- the real test logs in through the Admin UI, creates a quiz through the real API from the seeded curriculum, opens it from `/app/quizzes`, verifies `/app/quizzes/:quizId`, then opens the same deep link directly and verifies it again after reload.

Final exact-head verification on `53efb6951b6f30cc95e84646973d974d2fc4536c`:
- Frontend `34743947733` — **SUCCESS**.
- Admin AI `34743947732` — **SUCCESS**.
- Combined `34743947735` — **SUCCESS**, including clean PostgreSQL, backend authority/security regressions, existing Admin Chromium and the explicit Quiz Builder route/deep-link Chromium test.

Batch 2B is VERIFIED. AR-07 remains ACTIVE because quiz creation and version composition/editing still reside in the temporary adapter.

Classification after Batch 2B:
- **KEEP:** backend lifecycle/snapshot/question-revision/export rules.
- **REFACTOR NEXT:** focused create + version composition/editing ownership, preferably entity-scoped version editor first.
- **REMOVE LATER:** legacy `QuizBuilderWorkspace.tsx` only after remaining parity is executable.
- **NO CHANGE:** migrations, Student/audit workstream and server business rules.

## Immediate next actions / shared handoff

1. Re-read this file, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, current branch HEAD, live `main`, PR #52 and exact-head CI before editing.
2. Reconcile CI generated by this synchronized documentation checkpoint before new code.
3. Continue **AR-07 only — Batch 2C**. Re-inspect remaining `QuizBuilderWorkspace.tsx` responsibilities and migrate the next smallest coherent ownership; prioritize entity-scoped version composition/editing because lifecycle/export have now moved to the canonical entity page.
4. Preserve published Question Bank eligibility, version snapshot immutability and server lifecycle authority. Do not reproduce those rules in browser state.
5. Keep create flow in the temporary adapter if needed until version ownership is stable; then migrate create separately with executable parity.
6. Do not remove the legacy workspace until create + version composition/editing are replaced and exact-head parity is executable.
7. Do not start AR-08 until AR-07 is fully green, legacy ownership is resolved, and closure documentation is synchronized.
8. Keep PR #52 Draft; no automatic merge.

## Parallel product/audit facts that remain open

- `FPA-013` Reader active-search focus remains open in the Student/audit track.
- authenticated production-path verification remains `NOT YET VERIFIED` where recorded by the audit.
- Admin bundle >500 kB warning belongs to evidence-driven AR-10 performance cleanup unless an earlier regression makes it urgent.

## Binding quality rule

Changed screens must meet:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student is Arabic-first/RTL-first. Super Admin is a task-oriented operations product; technical IDs/provider/runtime/storage/database details stay advanced-only.