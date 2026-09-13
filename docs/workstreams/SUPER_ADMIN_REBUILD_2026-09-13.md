# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–2 VERIFIED.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
AR-09 Batch 2 exact code-head: `d1bf7101135516c751c02d269a384015f9e3a132`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## 0. Product decisions

The Super Admin is a task-oriented operational product, not a cosmetic dashboard.

- KEEP modular-monolith backend and server authority.
- KEEP publication, assessment, access, human-review, revision, provenance and audit boundaries.
- REBUILD Admin information architecture and route ownership incrementally.
- MOVE contextual workflows into focused route-owned surfaces.
- SPLIT individual Student support from bulk Access Code management.
- KEEP technical IDs/provider/runtime/storage/database details advanced-only.
- DO NOT break or overwrite the parallel Student/audit workstream.
- Test fixtures must satisfy production contracts; backend validation is never weakened for E2E.
- Legacy aliases/workspaces may exist only as temporary parity seams and are removed after executable replacement parity.
- Route-specific components with established feature owners move under `src/admin/<feature>/` once no compatibility caller needs a root seam; relocation must preserve behavior and contracts.

## 1. Target information architecture

1. **نظرة عامة** — `/app`
2. **المحتوى التعليمي** — `/app/curriculum`, `/app/content`, `/app/reviews/...`
3. **الأسئلة والاختبارات** — `/app/questions`, `/app/quizzes`
4. **الطلاب والوصول** — `/app/students`, `/app/access-codes`
5. **التشغيل** — `/app/operations`, `/app/operations/audit`, `/app/operations/diagnostics`

Entity routes are workflow-owned. Create/Edit/Review/History are contextual, not sidebar dumping grounds.

## 2. Frontend architecture rules

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
- no component owns unrelated list/create/edit/review/history responsibilities;
- server state remains server-owned;
- deep links are mandatory;
- legacy seams disappear only after replacement parity is executable.

## 3. Roadmap

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED.
- AR-06 — Question Bank — DONE / VERIFIED.
- AR-07 — Quiz Builder — DONE / VERIFIED.
- AR-08 — Students + Access Codes — DONE / VERIFIED.
- AR-09 — Cleanup + architecture enforcement — **ACTIVE**.
- AR-10 — A11y/RTL/performance/visual QA — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 4. Verified closure checkpoints

- AR-05 `cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 `c5bf37d4d72e341817970c7f95ff25bd771f8e17`: Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 `20ed69e46d6693925be42464f0c9f85691cec203`: Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.

## 5. AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — VERIFIED

Classification and implementation:
- **KEEP:** `/app/quizzes/metadata`, metadata UX, quiz API/server lifecycle authority.
- **REFACTOR:** ownership under `apps/admin-web/src/admin/quizzes/`.
- **REMOVE:** obsolete root `QuizMetadataPanel.tsx`.
- **NO CHANGE:** migrations/backend/PostgreSQL/security/Student contracts.
- `adc85a6c21eece93560a85febdb2c37e64fe3727` — add feature-owned panel.
- `6a6360f5c37f96984fe95907783a5ab6e4962557` — route import changed.
- `20c128bb4a2b7166ad1d04d24e4672c93422d38e` — root seam removed.

Verification:
- code-head Frontend `34756904661` — SUCCESS.
- code-head Admin AI `34756904665` — SUCCESS.
- code-head Combined `34756904664` and Stage13G `34756904668` were cancelled solely because the documentation commit superseded them.
- unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`: Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS, including Real API + PostgreSQL + Chromium.

**AR-09 Batch 1 = VERIFIED.**

### Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED

Pre-change reconciliation:
- live `main` was checked at `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.
- inherited branch HEAD `8e0f46b6cdc5425d2b86bc772e54070be63d7986` was reconciled before mutation.
- PR #52 was confirmed open, Draft and unmerged.
- current-head Admin AI, Combined and Stage13G were green, including Real API + PostgreSQL + Chromium, so no active blocker remained.

Inspected evidence before modification:
- `App.tsx` directly rendered `LessonAuthoringParityPanel` at `/app/content/lesson-tools`.
- the panel used existing `fetchAdminCurriculum`, `updateLessonSummary` and `exportLessonAuthoring` contracts and owned no canonical backend authority.
- `admin-parity-closure.e2e.spec.mjs` already exercised the real route against the Stage13G fixture: select lesson, save summary, assert revision increment, download content/history CSV, clear summary, assert another revision increment.

Classification:
- **KEEP:** route behavior, summary save/clear, export behavior, existing API/server authority.
- **REFACTOR:** component ownership into `apps/admin-web/src/admin/content/`.
- **REMOVE:** obsolete root seam only after route import moved.
- **NO CHANGE:** migrations, backend/PostgreSQL contracts, auth/security, Student workstream.

Implementation:
- `6f4638deddc57e3c5c2e1185c57054e39f4fbc86` — add feature-owned `apps/admin-web/src/admin/content/LessonAuthoringParityPanel.tsx` with behavior preserved and relative imports adjusted.
- `ec7ed60aa106767dddfb423e7c626d93a3fa2cea` — point `App.tsx` route import at the content owner.
- `d1bf7101135516c751c02d269a384015f9e3a132` — remove obsolete root `LessonAuthoringParityPanel.tsx`.

Exact-head verification on `d1bf7101135516c751c02d269a384015f9e3a132`:
- Frontend `34759439669` — SUCCESS.
- Admin AI `34759439651` — SUCCESS.
- Combined `34759439615` — SUCCESS.
- Stage13G `34759439612` — SUCCESS, including Admin UI quality, backend operations and Real API + PostgreSQL + Chromium.

No test was weakened or changed for this ownership relocation. No migrations/backend/Student files changed.

**AR-09 Batch 2 = VERIFIED. AR-09 remains ACTIVE.**

### Current checkpoint / non-overlap gate

Continuity documentation now advances beyond code-head `d1bf710...`. The status commit began at `bf79dd10dbe019b88e283cf6881a844093cacf50`, followed by the engineering-log update. The final documentation HEAD must be fetched after this workstream update, and all CI triggered by that final HEAD must be reconciled before Batch 3 starts.

### Remaining candidate inventory

Root route-owned surfaces still include `AdminAiAuthoringWorkspace`, `AdminReportsWorkspace`, `AiOperationsPage`, `ContentIngestionWorkspace`, `ContentOperationsWorkspace`, and `CurriculumWorkspace`. Root location alone does not justify relocation. For each next candidate, inspect callers/tests/contracts and feature ownership first, then select exactly one smallest safe cleanup seam.

## 6. Explicit handoff — continue AR-09 only

1. Fetch live `main`, current feature HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Reconcile every run triggered by the Batch 2 documentation commits before any mutation; if any run remains ACTIVE/RUNNING, do not start code in parallel.
3. If a gate fails, inspect exact failing job/log and repair root cause without weakening tests or authority.
4. When documentation-head CI is green, re-inventory remaining root route-owned surfaces and inspect callers/tests/contracts for the smallest safe candidate.
5. Classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE before modification, then execute one reviewable seam only.
6. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.

## 7. Quality gate for remaining stages

- lint;
- strict typecheck;
- unit/integration tests;
- production build;
- clean PostgreSQL migrations/contracts where relevant;
- backend authority/auth/security regressions;
- real Chromium flows;
- responsive/no-overflow evidence for changed surfaces;
- final exact-head matrix before stage closure.

Acceptance: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
