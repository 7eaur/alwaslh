# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-07 DONE / VERIFIED. AR-08 Students + Access Codes ACTIVE; focused Students VERIFIED; focused Access Codes ownership + legacy-seam cleanup implemented and awaiting final exact-head closure.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked in this run: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
Current AR-08 code-head before this docs checkpoint: `20ed69e46d6693925be42464f0c9f85691cec203`.

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
- AR-08 — Students + Access Codes — ACTIVE; final exact-head closure pending.
- AR-09 — Cleanup + architecture enforcement — NOT STARTED.
- AR-10 — A11y/RTL/performance/visual QA — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 4. Verified closure checkpoints

### AR-05
`cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank
Final `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.

### AR-07 — Quiz Builder
Final `c5bf37d4d72e341817970c7f95ff25bd771f8e17`: Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.

### AR-08 Batch 1 — Students
`dc8d3b4e44fac90cca23cc21d15e68e90101cbbb`: Frontend `34751701107`, Admin AI `34751701104`, Combined `34751701154` — SUCCESS.

## 5. AR-08 — Students + Access Codes

### Batch 1 — focused Students — VERIFIED

`/app/students` now directly owns `admin/students/AdminStudentsPage.tsx` and no longer shares the combined Students/Access-Codes giant workspace. Server-owned support/recovery/device/entitlement behavior remained unchanged, and real Chromium proves the focused route plus 390px no-overflow.

### Batch 2 — focused Access Codes — IMPLEMENTED / VERIFICATION ACTIVE

#### Reconciled branch work that existed before this checkpoint

The branch had advanced beyond the previous docs, so those commits were inspected and verified before any new cleanup:

- `5485a2cfb63ba2d664dce0cfa9556b73e43cb042` — focused `admin/access-codes/AdminAccessCodesPage.tsx`.
- `dbb393af86ae040f174c1dee9dad819e59adfccd` — giant root Students/Access workspace reduced to a one-line Access Codes alias.
- `bfac1372a2e6e5794e76c35ed1f75f3d10f1d80f` — real Chromium direct Access Codes parity: generation/filtering/non-destructive revoke and removal of legacy tab dependency.
- `cbbb7eca0d7b97aed0dd5caef8d7ef2bb4c1b795` — Stage13G verification enabled for the rebuild branch.
- `67981130b1234ea55932e93c136208835572992e`, `91ea77bc1c2222535a94ee288e695c452f665302`, `8f90e6fcfa5fac46f4744ef319397485c64aceff` — corrected stale AI/export browser assertions to match current semantic UI and deterministic fixtures; no backend rule was weakened.

Exact `8f90e6...` replacement-parity matrix:
- Frontend `34753821850` — SUCCESS.
- Admin AI `34753821821` — SUCCESS.
- Combined `34753821791` — SUCCESS.
- Stage13G `34753821827` — SUCCESS.

#### Final legacy-seam cleanup in this run

Inspection showed the only remaining root seam was:

`export { AdminAccessCodesPage as AdminStudentAccessWorkspace } from "./admin/access-codes/AdminAccessCodesPage";`

Classification:
- KEEP focused Students + Access Codes pages and all server/API/PostgreSQL authority.
- IMPROVE literal route ownership.
- REMOVE the obsolete one-line alias.
- NO CHANGE to migrations/backend/Student workstream.

Implementation:
- `7e950c0b4898ad27797e9c6312fe2b84c4f98959` — `/app/access-codes` imports `AdminAccessCodesPage` directly.
- `20ed69e46d6693925be42464f0c9f85691cec203` — removed root `AdminStudentAccessWorkspace.tsx` alias.

Exact-head runs for `20ed69e...` at this checkpoint:
- Frontend `34754057319` — PENDING at last observation.
- Admin AI `34754057304` — SUCCESS.
- Combined `34754057322` — IN PROGRESS at last observation.
- Stage13G `34754057370` — IN PROGRESS at last observation.

Therefore **AR-08 remains ACTIVE until all required runs are SUCCESS**. AR-09 is blocked.

## 6. Explicit handoff — AR-08 closure only

1. Read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file before mutation.
2. Fetch live `main`, current feature HEAD, Draft PR #52 and exact-head CI.
3. Reconcile `20ed69e...` runs `34754057319`, `34754057304`, `34754057322`, `34754057370`.
4. If all are SUCCESS, verify no remaining `AdminStudentAccessWorkspace` reference/import exists and both `/app/students` and `/app/access-codes` directly own their focused pages.
5. Only then update all three continuity files + PR #52 to **AR-08 DONE / VERIFIED**. Do not start AR-09 during an unresolved verification window.
6. If a gate fails, inspect the real failing job/log and fix root cause without weakening contracts or tests, then require a new exact-head green matrix.
7. Keep PR #52 Draft; no automatic merge. Preserve parallel Student/audit work.

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
