# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 + Batch 2A VERIFIED; Batch 2B next.**

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
- **AR-07 — Quiz Builder** — ACTIVE / Batch 1 + Batch 2A VERIFIED; Batch 2B next.
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

#### Pre-mutation reconciliation

- Documentation checkpoint `4a60954c8358edd073d8fe26fd6dafbd16ae8670` was re-read.
- Docs-only CI was complete: Admin AI `34741815805` SUCCESS; Combined `34741815816` SUCCESS.
- Draft PR #52 remained Draft.
- live `main` was re-read at `343ff1fd7b3d64d7e990b72606695365f520fa58`; its independent Student changes were not touched.

#### Gap found

The focused list still navigated to `/app/quizzes/manage?quizId=...`, but the legacy workspace did not read the query parameter. This was not durable entity routing.

#### Decision and classification

- **KEEP:** server lifecycle, Question Bank published-revision linkage, snapshot immutability and export rules.
- **REFACTOR:** establish `/app/quizzes/:quizId` as canonical entity overview/deep link.
- **KEEP TEMPORARILY:** legacy management workspace only for still-unmigrated create/version/lifecycle/export capabilities.
- **NO CHANGE:** API business rules, PostgreSQL migrations, Student/audit code.

#### Implementation

- `3099648db1b1cf95d1af3c1d579e8f7972748006` — new `QuizBuilderDetailPage` backed by canonical `fetchQuiz`, exposing status, description, lessons, versions and event history with loading/error/session handling.
- `1c5707ae089487811401368e4c048720a7b121cf` — list cards now navigate to `/app/quizzes/:quizId`.
- `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac` — registered `quizzes/:quizId` while keeping `/app/quizzes/manage` and metadata routes.

#### Exact-head verification

On `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`:
- Stage 13E Frontend Preparation `34742505009` — **SUCCESS**.
- Stage 13E Admin AI Operations `34742505020` — **SUCCESS**.
- Stage 13E Combined Integration `34742505015` — **SUCCESS**, including PostgreSQL/backend regressions and real Admin Chromium.

Batch 2A is VERIFIED. AR-07 remains ACTIVE because create/version editing/lifecycle/export still reside in the temporary parity adapter.

## 6. Explicit next handoff — AR-07 Batch 2B only

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Reconcile documentation-only CI from this checkpoint before mutation.
4. Re-inspect `QuizBuilderWorkspace.tsx` and migrate the next smallest coherent responsibility; prefer entity-scoped version composition/editing and lifecycle/export unless dependency inspection proves a safer order.
5. Preserve server ownership of lifecycle, immutable snapshots, published Question Bank revision eligibility and export constraints.
6. Add explicit real Chromium ownership coverage for `/app/quizzes` → `/app/quizzes/:quizId` and direct deep linking if not already asserted explicitly.
7. Do not remove the legacy workspace until every legitimate create/version/lifecycle/export capability has executable replacement ownership.
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