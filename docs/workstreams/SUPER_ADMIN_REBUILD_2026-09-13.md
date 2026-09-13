# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked in this run: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
AR-09 Batch 1 exact code-head: `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.  
AR-08 closure documentation checkpoint reconciled on arrival: `a0ea9466becb1c2ba24971e2df8d7a46e8b531b1`.

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
Final code-head `20ed69e46d6693925be42464f0c9f85691cec203`:
- Frontend `34754057319` — SUCCESS.
- Admin AI `34754057304` — SUCCESS.
- Combined `34754057322` — SUCCESS.
- Stage13G `34754057370` — SUCCESS.

## 5. AR-08 — Students + Access Codes — CLOSED

`/app/students` directly owns `admin/students/AdminStudentsPage.tsx`; `/app/access-codes` directly owns `admin/access-codes/AdminAccessCodesPage.tsx`; the obsolete root `AdminStudentAccessWorkspace.tsx` alias was removed after executable parity. API/PostgreSQL/auth/access and Student-facing authority remained unchanged.

**AR-08 = DONE / VERIFIED.**

## 6. AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — ACTIVE

#### Pre-change truth

Before mutation this run re-read all three continuity files, fetched live `main`, feature HEAD, Draft PR #52 and current CI, and inspected `App.tsx` plus the root `apps/admin-web/src` inventory.

AR-08 was already closed and its prior CI was green. The root inventory showed several remaining route-owned surfaces outside the target feature structure. The smallest safe seam was `QuizMetadataPanel.tsx`: it is exclusively used by `/app/quizzes/metadata`, while Quiz Builder already has a canonical `src/admin/quizzes/` owner.

Classification:
- **KEEP:** metadata route and behavior; `fetchQuizzes`, `fetchQuiz`, `updateQuiz`; server-owned lifecycle/status rules.
- **REFACTOR:** physical ownership to `apps/admin-web/src/admin/quizzes/`.
- **REMOVE:** obsolete root panel after route ownership changes.
- **NO CHANGE:** migrations, backend/PostgreSQL/security/business rules and Student workstream.

#### Implementation chain

- `adc85a6c21eece93560a85febdb2c37e64fe3727` — added feature-owned `admin/quizzes/QuizMetadataPanel.tsx` with behavior preserved and only relative imports adjusted.
- `6a6360f5c37f96984fe95907783a5ab6e4962557` — `App.tsx` imports that feature-owned implementation for `/app/quizzes/metadata`.
- `20c128bb4a2b7166ad1d04d24e4672c93422d38e` — removed root `apps/admin-web/src/QuizMetadataPanel.tsx`.

No backend/API/migration/Student code changed and no test was weakened.

#### Exact-head CI checkpoint

For `20c128bb4a2b7166ad1d04d24e4672c93422d38e`:
- Frontend `34756904661` — SUCCESS.
- Admin AI `34756904665` — RUNNING at checkpoint.
- Combined `34756904664` — RUNNING at checkpoint.
- Stage13G `34756904668` — RUNNING at checkpoint.

The non-overlap rule is in force: no second AR-09 code seam starts until these runs are reconciled. Batch 1 is not marked VERIFIED yet.

## 7. Explicit handoff — continue AR-09 only

1. Fetch current feature HEAD and re-read the three continuity files before mutation; if newer commits exist, reconcile them first.
2. Reconcile exact code-head `20c128bb...`: Frontend `34756904661` is already SUCCESS; Admin AI `34756904665`, Combined `34756904664`, Stage13G `34756904668` were still RUNNING at this checkpoint.
3. On failure, inspect the failing job/log and fix root cause without weakening tests or changing server authority.
4. If all required runs succeed, mark Batch 1 VERIFIED across status/log/workstream/PR before selecting another cleanup.
5. Re-inventory remaining root-level Admin workspaces, aliases, obsolete routes, duplicate ownership and compatibility shims; inspect real callers/tests and choose only one small safe seam.
6. Do not infer that a root file is dead from location alone.
7. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
8. Keep PR #52 Draft; no merge or auto-merge.

## 8. Quality gate for remaining stages

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
