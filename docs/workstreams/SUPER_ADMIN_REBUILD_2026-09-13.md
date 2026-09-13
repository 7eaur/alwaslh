# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 + Batch 2A + Batch 2B + Batch 2C VERIFIED; Batch 2D next.**

Branch: `rebuild/super-admin-foundation`

Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`

Latest live `main` direct branch read: `343ff1fd7b3d64d7e990b72606695365f520fa58`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## 0. Product decision summary

The Super Admin is being rebuilt as a task-oriented operational product, not cosmetically polished as a generic dashboard.

Binding decisions:
- KEEP the modular-monolith backend and server authority.
- KEEP publication, assessment, access, human-review, revision, provenance and audit boundaries.
- REBUILD Admin information architecture and route ownership.
- REBUILD giant workspaces incrementally into pages/features/workflows.
- MOVE AI authoring/application into contextual workflows.
- SPLIT individual Student support from bulk access-code management.
- FOLD Governance into Operations/Diagnostics.
- KEEP technical IDs/raw provider/runtime/storage/database details advanced-only.
- DO NOT break or overwrite the parallel Student/audit workstream.

## 1. Target information architecture

Primary areas:
1. **نظرة عامة** — `/app`
2. **المحتوى التعليمي** — `/app/curriculum`, `/app/content`, `/app/reviews/...`
3. **الأسئلة والاختبارات** — `/app/questions`, `/app/quizzes`
4. **الطلاب والوصول** — `/app/students`, `/app/access-codes`
5. **التشغيل** — `/app/operations`, `/app/operations/audit`, `/app/operations/diagnostics`

Entity routes are workflow-owned. `/app/questions/:questionId` and `/app/quizzes/:quizId` are canonical entity deep links. Create/Edit/Review/History are not sidebar destinations.

## 2. Frontend architecture rules

Target boundaries:

```text
src/admin/
  shell/
  overview/
  curriculum/
  content/
  reviews/
  questions/
  quizzes/
  students/
  access-codes/
  operations/
  shared/
  api/
  view-models/
```

Rules:
- route owns page;
- feature owns workflow state;
- adapters translate server contracts;
- no component owns list + create + edit + review + history simultaneously;
- server state remains server-owned;
- deep links are mandatory;
- legacy workspaces may remain only as temporary parity adapters while replacement ownership is executable and verified.

## 3. Roadmap

- **AR-01 — Architecture baseline + route-driven shell** — DONE / VERIFIED.
- **AR-02 — Overview + Operations split** — DONE / VERIFIED.
- **AR-03 — Curriculum** — DONE / VERIFIED.
- **AR-04 — Content + OCR** — DONE / VERIFIED.
- **AR-05 — Reviews + AI** — DONE / VERIFIED.
- **AR-06 — Question Bank** — DONE / VERIFIED.
- **AR-07 — Quiz Builder** — ACTIVE / Batch 1 + Batch 2A + Batch 2B + Batch 2C VERIFIED; Batch 2D next.
- **AR-08 — Students + Access Codes** — NOT STARTED.
- **AR-09 — Cleanup + architecture enforcement** — NOT STARTED.
- **AR-10 — A11y/RTL/performance/visual QA** — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 4. Verified closure checkpoints

### AR-05
Exact checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank
Final exact code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS. Question Bank is split into list, entity detail/edit/review/history/regeneration, and focused create/import. Legacy giant workspace is removed.

## 5. AR-07 — Quiz Builder execution checkpoint

### Batch 1 — focused list ownership — VERIFIED

Inventory proved that `QuizBuilderWorkspace.tsx` combined list/create/detail/version/lifecycle/export while `quiz-builder-api.ts` already exposed focused server reads/commands and integration tests enforced published Question Bank revision eligibility, frozen snapshots, lifecycle-controlled export and published immutability.

Implementation:
- `7746000748129a659e098e016d3ffbfd4d5ddc46` — focused list.
- `30d9443ed1c159440d38dc76db61686028c3d028` — list route + temporary management adapter.
- `18607a1bf31392f9143a0e68c4531c972d4199d5` — strict TypeScript root-cause correction.

Verification: Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.

### Batch 2A — canonical quiz entity/deep-link ownership — VERIFIED

Gap found: the focused list still navigated to `/app/quizzes/manage?quizId=...`, but the legacy workspace did not read the query parameter. This was not durable entity routing.

Decision:
- **KEEP:** server lifecycle, Question Bank published-revision linkage, snapshot immutability and export rules.
- **REFACTOR:** establish `/app/quizzes/:quizId` as canonical entity overview/deep link.
- **KEEP TEMPORARILY:** legacy management workspace only for still-unmigrated create/version/lifecycle/export capabilities.
- **NO CHANGE:** API business rules, PostgreSQL migrations, Student/audit code.

Implementation:
- `3099648db1b1cf95d1af3c1d579e8f7972748006` — new `QuizBuilderDetailPage` backed by canonical `fetchQuiz`.
- `1c5707ae089487811401368e4c048720a7b121cf` — list cards now navigate to `/app/quizzes/:quizId`.
- `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac` — registered `quizzes/:quizId` while keeping `/app/quizzes/manage` and metadata routes.

Verification on `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`: Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.

### Batch 2B — entity lifecycle/export ownership + explicit Chromium route proof — VERIFIED

Decision:
- **KEEP:** server-owned lifecycle, published-question revision eligibility, immutable published snapshots and lifecycle-gated export.
- **REFACTOR:** lifecycle actions and CSV/print export into canonical `/app/quizzes/:quizId` entity ownership.
- **KEEP TEMPORARILY:** `/app/quizzes/manage` only for create + version composition/editing.

Implementation:
- `39f0d1ef961208b0697b1c8b3c80e352723fad82` — entity lifecycle/export ownership.
- `53efb6951b6f30cc95e84646973d974d2fc4536c` — explicit Quiz Builder real Chromium route/deep-link coverage.

Final verification on `53efb6951b6f30cc95e84646973d974d2fc4536c`: Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED

#### Source-truth reconciliation

- The actual canonical quiz entity route is `/app/quizzes/:quizId`, rendered by `apps/admin-web/src/admin/quizzes/QuizBuilderDetailPage.tsx`.
- There is no separate nested `/versions` route and no `QuizBuilderEntityPage` file.
- `/app/quizzes/manage` still points to root `QuizBuilderWorkspace.tsx` and retained create + duplicate version composition/editing before this batch.
- Existing focused API commands already cover eligible candidate reads, add version, replace version questions and remove version; server authority did not require a new API or migration.

#### Decision and classification

- **KEEP:** PostgreSQL/API lifecycle, published Question Bank revision eligibility, immutable published snapshots and export authority.
- **REFACTOR:** draft version composition/editing into the existing canonical entity page.
- **KEEP TEMPORARILY:** legacy adapter for quiz creation.
- **REMOVE LATER:** duplicated legacy version-management UI after executable parity.
- **NO CHANGE:** migrations, backend business rules and Student/audit code.

#### Implementation

- `8c179f0554ebcb16476cd9d56c0795291ba0b811` — `QuizBuilderDetailPage` gained draft-only add/edit/delete version ownership, published-candidate search/pagination and exact revision selection while continuing to call canonical server commands.

First exact-head Combined `34745301662` failed only in the existing Quiz Builder Chromium test because it still expected the retired legacy link `إدارة النماذج`. API/Admin quality gates, migrations/contracts and backend authority/security regressions had passed. Admin AI `34745301663` was SUCCESS.

The production UX was not reverted to satisfy a stale browser assertion.

- `f9180093617fb4974d1f8652a96b3d1f6fe77fad` — aligned `e2e/quiz-builder.e2e.spec.mjs` with the new entity ownership by asserting `إضافة نموذج` on `/app/quizzes/:quizId`.

Final exact-head verification on `f9180093617fb4974d1f8652a96b3d1f6fe77fad`:
- Stage 13E Frontend Preparation `34745428055` — **SUCCESS**.
- Stage 13E Admin AI Operations `34745428031` — **SUCCESS**.
- Stage 13E Combined Integration `34745428045` — **SUCCESS**, including clean PostgreSQL, backend authority/security regressions and real Chromium.

Batch 2C is VERIFIED. AR-07 remains ACTIVE: focused quiz creation and final legacy version-management cleanup remain.

## 6. Explicit next handoff — AR-07 Batch 2D only

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Reconcile documentation-only CI from this checkpoint before mutation.
4. Extend real Chromium coverage for actual version management on `/app/quizzes/:quizId`: add version → search/select published candidate → save → reopen/replace questions → delete; include non-draft immutability evidence where fixture flow permits.
5. When that executable parity is green, remove/slim duplicate version-management ownership from `QuizBuilderWorkspace.tsx`, but retain create capability until a focused create flow exists.
6. Migrate quiz creation as a separate coherent batch, preserving canonical server validation/curriculum contracts.
7. Remove the legacy workspace only after focused create + entity version management both have executable replacement parity.
8. Do not start AR-08 before AR-07 exact-head green and synchronized closure documentation.
9. Keep PR #52 Draft; no automatic merge.

## 7. Quality gate for every remaining stage

- lint;
- strict typecheck;
- unit tests;
- production build;
- clean PostgreSQL migrations/contracts where relevant;
- backend authority/security regressions;
- real Chromium flows;
- responsive/no-overflow evidence for changed surfaces;
- final exact-head matrix before stage closure.

Acceptance remains:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.