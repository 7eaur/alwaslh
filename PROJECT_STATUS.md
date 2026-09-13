# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACKS: UX/UI REFOUNDATION + PARALLEL SUPER ADMIN PRODUCT REBUILD**

**SUPER ADMIN CURRENT BATCH:** `AR-07 — Quiz Builder` — ACTIVE / Batch 1 + Batch 2A + Batch 2B + Batch 2C + Batch 2D VERIFIED; legacy version-management cleanup is next.

**SUPER ADMIN COMPLETED:** `AR-01` through `AR-06` — DONE / VERIFIED.

Branch: `rebuild/super-admin-foundation`

Draft PR: **#52 — `refactor(admin): rebuild Super Admin foundation`** — remains Draft.

Latest live `main` re-read for this execution checkpoint: `343ff1fd7b3d64d7e990b72606695365f520fa58`. It contains independent Student work; the Admin branch remains isolated and must not overwrite or opportunistically rebase that work.

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

The original `QuizBuilderWorkspace.tsx` combined list/create/detail/version editing/lifecycle/export. Server APIs were already focused and backend integration tests proved published Question Bank revision eligibility, frozen version snapshots, lifecycle-controlled export and published-version immutability.

Implementation:
- `7746000748129a659e098e016d3ffbfd4d5ddc46` — focused `QuizBuilderListPage`.
- `30d9443ed1c159440d38dc76db61686028c3d028` — `/app/quizzes` owns the list; temporary parity adapter moved to `/app/quizzes/manage`.
- `18607a1bf31392f9143a0e68c4531c972d4199d5` — strict TypeScript root-cause correction.

Exact-head verification:
- Frontend `34741610234` — SUCCESS.
- Admin AI `34741610225` — SUCCESS.
- Combined `34741610238` — SUCCESS.

### Batch 2A — routed quiz entity/deep-link ownership — VERIFIED

Implementation:
- `3099648db1b1cf95d1af3c1d579e8f7972748006` — canonical route-owned `QuizBuilderDetailPage`.
- `1c5707ae089487811401368e4c048720a7b121cf` — list cards route to `/app/quizzes/:quizId`.
- `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac` — canonical entity route registration.

Verification on `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`:
- Frontend `34742505009` — SUCCESS.
- Admin AI `34742505020` — SUCCESS.
- Combined `34742505015` — SUCCESS.

### Batch 2B — entity-owned lifecycle/export + routed Chromium proof — VERIFIED

Implementation:
- `39f0d1ef961208b0697b1c8b3c80e352723fad82` — lifecycle actions and lifecycle-gated CSV/print export moved into `/app/quizzes/:quizId` while canonical API/PostgreSQL authority stayed intact.
- `53efb6951b6f30cc95e84646973d974d2fc4536c` — explicit real Chromium list→entity/direct-deep-link proof.

Verification on `53efb6951b6f30cc95e84646973d974d2fc4536c`:
- Frontend `34743947733` — SUCCESS.
- Admin AI `34743947732` — SUCCESS.
- Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED

Implementation:
- `8c179f0554ebcb16476cd9d56c0795291ba0b811` — draft-only add/edit/delete version ownership plus server-returned published-candidate search/pagination in `QuizBuilderDetailPage`.
- First Combined `34745301662` failed only because the old Chromium assertion expected retired legacy navigation; production UX was not reverted.
- `f9180093617fb4974d1f8652a96b3d1f6fe77fad` — browser test aligned with canonical entity ownership.

Final exact-head verification on `f9180093617fb4974d1f8652a96b3d1f6fe77fad`:
- Frontend `34745428055` — SUCCESS.
- Admin AI `34745428031` — SUCCESS.
- Combined `34745428045` — SUCCESS.

### Batch 2D — explicit real Chromium version-management parity — VERIFIED

Goal proved on canonical `/app/quizzes/:quizId` using real Admin UI + real API/PostgreSQL fixture:
- create a real quiz against the seeded curriculum scope;
- create and publish two real Question Bank questions;
- add a draft quiz version;
- search/select an eligible published revision;
- save the version;
- reopen and replace its selected question;
- delete the draft version;
- recreate a version, submit the quiz for review and prove add/edit/delete controls are unavailable outside draft.

Execution:
- `e783751a144630bf0da1f44acee5a6b4bcd5a575` — added full Chromium version-management proof.
- Frontend `34746160739` — SUCCESS.
- Admin AI `34746160733` — SUCCESS.
- Combined `34746160743` — FAILED only at the new Chromium flow. All earlier quality/migration/backend-authority steps in Combined were green.

Root cause was in the new fixture, not production behavior: the test created a multiple-choice question with only three options and `answerText: null` while `answerStatus = known`, violating the existing Question Bank contract that requires four options and matching answer text for the correct option. The backend contract was not weakened.

- `df73f9d136bc7d84179601a475627ce47e0d1c58` — corrected the fixture to four options and `answerText` matching the correct answer.

Final exact-head verification on `df73f9d136bc7d84179601a475627ce47e0d1c58`:
- Frontend `34746324618` — **SUCCESS**.
- Admin AI `34746324625` — **SUCCESS**.
- Combined `34746324634` — **SUCCESS**, including clean PostgreSQL, backend authority/security regressions and the expanded real Chromium version-management flow.

Batch 2D is VERIFIED. No production backend rule, migration, Student behavior or server authority was changed to satisfy the test.

## Immediate next actions / shared handoff

1. Re-read this file, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, current feature HEAD, live `main`, Draft PR #52 and exact-head CI before editing.
2. Reconcile CI generated by this synchronized documentation checkpoint before new code.
3. Continue **AR-07 only** with the next small batch: slim/remove duplicate version-management ownership from root `QuizBuilderWorkspace.tsx`, because Batch 2D now proves executable replacement parity on the canonical entity route.
4. **Retain quiz creation capability** in the legacy adapter until a focused create route/flow is built and verified. Do not remove legitimate capability merely to delete the workspace.
5. After cleanup is green, migrate quiz creation as a separate coherent batch while preserving server validation, curriculum scoping and Question Bank eligibility contracts.
6. Remove the legacy workspace only after focused create + entity version management have executable replacement parity and no route depends on it.
7. Do not start AR-08 until AR-07 is fully exact-head green, legacy ownership is resolved, and closure documentation is synchronized.
8. Keep PR #52 Draft; no automatic merge.

## Parallel product/audit facts that remain open

- `FPA-013` Reader active-search focus remains open in the Student/audit track.
- authenticated production-path verification remains `NOT YET VERIFIED` where recorded by the audit.
- Admin bundle >500 kB warning belongs to evidence-driven AR-10 performance cleanup unless an earlier regression makes it urgent.

## Binding quality rule

Changed screens must meet:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student is Arabic-first/RTL-first. Super Admin is a task-oriented operations product; technical IDs/provider/runtime/storage/database details stay advanced-only.