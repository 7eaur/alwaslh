# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 + Batch 2A + Batch 2B VERIFIED; Batch 2C next.**

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
- **AR-07 — Quiz Builder** — ACTIVE / Batch 1 + Batch 2A + Batch 2B VERIFIED; Batch 2C next.
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

### Batch 2B — entity lifecycle/export ownership + explicit Chromium route proof — VERIFIED

#### State received and re-inspection

- Repository documentation, current branch HEAD, live `main`, Draft PR #52 and previous exact-head CI were re-read before mutation.
- `QuizBuilderWorkspace.tsx` still owned create, version composition/editing, lifecycle and export.
- server APIs already exposed focused lifecycle/export commands, so those responsibilities could move without reproducing business authority client-side.

#### Decision and classification

- **KEEP:** server-owned submit/reject/publish/archive lifecycle, published-question revision eligibility, immutable published snapshots and lifecycle-gated export.
- **REFACTOR:** move lifecycle actions and CSV/print export into canonical `/app/quizzes/:quizId` entity ownership.
- **KEEP TEMPORARILY:** `/app/quizzes/manage` only for create + version composition/editing that still lack replacement ownership.
- **NO CHANGE:** PostgreSQL migrations, backend business rules and Student/audit workstream.

#### Implementation

- `39f0d1ef961208b0697b1c8b3c80e352723fad82` — `QuizBuilderDetailPage` now owns submit-for-review, reject-to-draft with note, publish, archive, CSV export and print/PDF export; all mutations still call canonical server commands and reload canonical detail.

The first exact-head matrix on `39f0d1ef...` was green:
- Frontend `34743770716` — SUCCESS.
- Admin AI `34743770721` — SUCCESS.
- Combined `34743770718` — SUCCESS.

However, source inspection of the Combined workflow showed its Chromium step only executed `e2e/ai-operations.e2e.spec.mjs`; it did not prove Quiz Builder route ownership by name. The batch was intentionally kept open until that evidence gap was closed.

#### Explicit routed Chromium proof

- `53efb6951b6f30cc95e84646973d974d2fc4536c` — added `apps/admin-web/e2e/quiz-builder.e2e.spec.mjs` and updated Stage 13E Combined Integration to execute it alongside AI operations.
- The browser test logs in through the real Admin UI, creates a quiz through the real Admin API using the deterministic seeded curriculum, opens it from `/app/quizzes`, asserts canonical `/app/quizzes/:quizId`, opens the same route directly and verifies the entity after reload.

Final exact-head verification on `53efb6951b6f30cc95e84646973d974d2fc4536c`:
- Stage 13E Frontend Preparation `34743947733` — **SUCCESS**.
- Stage 13E Admin AI Operations `34743947732` — **SUCCESS**.
- Stage 13E Combined Integration `34743947735` — **SUCCESS**, including clean PostgreSQL, backend authority/security regressions, existing Admin Chromium and explicit Quiz Builder list→entity/direct-deep-link Chromium proof.

Batch 2B is VERIFIED. AR-07 remains ACTIVE because create + version composition/editing still reside in the temporary adapter.

## 6. Explicit next handoff — AR-07 Batch 2C only

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Reconcile documentation-only CI from this checkpoint before mutation.
4. Re-inspect the remaining `QuizBuilderWorkspace.tsx` responsibilities.
5. Migrate the next smallest coherent responsibility, prioritizing entity-scoped version composition/editing because lifecycle/export have now moved to `/app/quizzes/:quizId`.
6. Preserve server ownership of published Question Bank eligibility, immutable snapshots, lifecycle and export constraints; do not duplicate those rules in browser state.
7. Keep create in the temporary adapter if version ownership can move independently; otherwise choose the smallest dependency-safe extraction and document why.
8. Do not remove the legacy workspace until create + version composition/editing both have executable replacement parity.
9. Do not start AR-08 before AR-07 exact-head green and synchronized closure documentation.
10. Keep PR #52 Draft; no automatic merge.

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