# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batch 1 VERIFIED.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
Current received checkpoint: `07de0e24475b8af410bf2c213ede2a334062b30c`.  
AR-09 Batch 1 code-head: `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.

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

### AR-05
`cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank
`02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.

### AR-07 — Quiz Builder
`c5bf37d4d72e341817970c7f95ff25bd771f8e17`: Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.

### AR-08 — Students + Access Codes
`20ed69e46d6693925be42464f0c9f85691cec203`: Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.

## 5. AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — VERIFIED

#### Pre-change truth and classification

The root inventory showed `/app/quizzes/metadata` still depended on a root `QuizMetadataPanel.tsx`, while Quiz Builder already had canonical ownership under `src/admin/quizzes/`.

- **KEEP:** metadata route/behavior, `fetchQuizzes`, `fetchQuiz`, `updateQuiz`, server-owned lifecycle/status rules.
- **REFACTOR:** physical ownership under `apps/admin-web/src/admin/quizzes/`.
- **REMOVE:** obsolete root seam after the route import changed.
- **NO CHANGE:** migrations, backend/PostgreSQL/security/business rules and Student workstream.

#### Implementation

- `adc85a6c21eece93560a85febdb2c37e64fe3727` — added feature-owned `admin/quizzes/QuizMetadataPanel.tsx`.
- `6a6360f5c37f96984fe95907783a5ab6e4962557` — `App.tsx` switched to the feature owner.
- `20c128bb4a2b7166ad1d04d24e4672c93422d38e` — removed root `QuizMetadataPanel.tsx`.
- `07de0e24475b8af410bf2c213ede2a334062b30c` — documentation-only checkpoint.

#### Verification closure

Original code-head:
- Frontend `34756904661` — SUCCESS.
- Admin AI `34756904665` — SUCCESS.
- Combined `34756904664` — CANCELLED only after the newer documentation commit superseded the run.
- Stage13G `34756904668` — CANCELLED for the same superseding push.

Current exact checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`, with unchanged production code, completed the missing gates:
- Admin AI `34757034197` — SUCCESS.
- Combined `34757034226` — SUCCESS.
- Stage13G `34757034179` — SUCCESS.
- Stage13G's Admin UI quality, backend operations and Real API + PostgreSQL + Chromium checks are all SUCCESS.

No backend/API/migration/Student code changed and no test was weakened.

**AR-09 Batch 1 = VERIFIED. AR-09 remains ACTIVE.**

### Remaining inventory / next candidate

`App.tsx` still imports multiple route-owned root surfaces. Each requires caller/test evidence before relocation; location alone is insufficient.

`/app/content/lesson-tools` directly renders `LessonAuthoringParityPanel`, making that component the next small candidate for inspection. Its current behavior edits lesson summaries and exports lesson/history/print bundles using existing server APIs; it must remain server-authoritative.

No Batch 2 code begins until the documentation closure checkpoint itself is green and no newer concurrent work exists.

## 6. Explicit handoff — continue AR-09 only

1. Fetch current feature HEAD and re-read the three continuity files before mutation; reconcile newer commits first.
2. Reconcile CI for the Batch-1 closure documentation checkpoint. Do not start a parallel batch while CI is ACTIVE/RUNNING.
3. If green, inspect all callers/tests around `LessonAuthoringParityPanel` and `/app/content/lesson-tools`.
4. If it is exclusively route-owned, classify KEEP behavior/contracts, REFACTOR ownership to `apps/admin-web/src/admin/content/`, REMOVE the root seam only after route import moves, and make NO CHANGE to backend/migrations/Student authority.
5. Run applicable lint/typecheck/unit/integration/build/real Chromium checks and require exact-head green before batch closure.
6. If caller evidence shows it is shared, keep it and choose the next smallest safe seam instead.
7. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
8. Keep PR #52 Draft; no merge or auto-merge.

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
