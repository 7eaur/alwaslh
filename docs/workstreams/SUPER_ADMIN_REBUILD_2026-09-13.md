# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–3 VERIFIED; Batch 4A ACTIVE.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`.  
Latest verified AR-09 code-head: `3b1eb104fef1ac70035dcd9875d9807f95bf2009`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## Product and architecture rules

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

Target feature ownership remains under `src/admin/{shell,overview,curriculum,content,reviews,questions,quizzes,students,access-codes,operations,shared,api,view-models}` with route-owned pages, feature-owned workflow state, adapter boundaries, server-owned canonical state and mandatory deep links.

## Roadmap

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

## Verified closure checkpoints

- AR-05 `cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 `c5bf37d4d72e341817970c7f95ff25bd771f8e17`: Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 `20ed69e46d6693925be42464f0c9f85691cec203`: Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 Batch 1: quiz metadata ownership relocation — VERIFIED; unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` with Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- AR-09 Batch 2: lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- AR-09 Batch 3: access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.

## AR-09 Batch 3 — Access-code reports ownership — VERIFIED

### Reconciliation before mutation

The inherited adapter code-head was `6e7e43e17651d54413ccf6cc234f4e1457942a25`. Fresh verification resolved the previously open Combined gate as SUCCESS (`34761018762`). Its Stage13G run `34761018720` was CANCELLED solely because a newer documentation commit advanced the branch, not because of an assertion failure. The later documentation HEAD `7a247a407312ec9af00b5952118d449ab12fefff`, carrying the same production adapter code, then completed Stage13G including Real API + PostgreSQL + Chromium successfully.

No additional seam was started before this non-overlap gate was reconciled.

### Evidence inspected

- `/app/access-codes/reports` already routed through `AdminAccessCodeReportsPage` under `src/admin/access-codes/`.
- the feature page was still only a one-line compatibility adapter to root `AdminReportsWorkspace`.
- root `AdminReportsWorkspace` owned presentation/client state only and used existing server-authoritative curriculum/access-code APIs plus CSV helpers.
- `admin-reports.e2e.spec.mjs` already covered row-level import behavior, selected CSV export, selected printing, 390px no-overflow and session expiry.

### Classification

- **KEEP:** route, report/import/export/print behavior, session handling, CSS behavior, API/PostgreSQL authority and E2E contract.
- **IMPROVE:** align implementation ownership with route ownership.
- **REFACTOR:** move the actual component into `src/admin/access-codes/AdminAccessCodeReportsPage.tsx`.
- **REBUILD:** none.
- **REMOVE:** root `AdminReportsWorkspace.tsx` after relocation.
- **NO CHANGE:** migrations, backend, PostgreSQL constraints, auth/security, Student workstream and test strength.

### Implementation

- `d540eaab7fe1100e27904052c08d2aa05625c8a7` — replaced the temporary adapter with the complete reports implementation under `admin/access-codes`; adjusted only relative imports and renamed the exported component to `AdminAccessCodeReportsPage`.
- `3b1eb104fef1ac70035dcd9875d9807f95bf2009` — deleted root `AdminReportsWorkspace.tsx` after the feature owner became self-contained.
- `admin-reports.css` intentionally stayed at its existing location to keep this batch bounded; no CSS behavior was changed.

No backend, migration, PostgreSQL, Student or test file changed.

### Exact-head verification

For exact code-head `3b1eb104fef1ac70035dcd9875d9807f95bf2009`:
- Frontend Preparation `34762225733` — SUCCESS.
- Admin AI Operations `34762225735` — SUCCESS.
- Combined Integration `34762225728` — SUCCESS.
- Stage13G Admin Operations `34762225748` — SUCCESS.
  - Admin UI quality job `103736953704` — SUCCESS.
  - Admin operations backend job `103736953580` — SUCCESS, including clean migrations/contracts and reports/security/auth regressions.
  - Real API + PostgreSQL + Chromium job `103737110446` — SUCCESS; the real Admin Chromium suite passed.

**Batch 3 is VERIFIED. AR-09 remains ACTIVE; AR-10 remains blocked.**

## AR-09 Batch 4A — AI review route ownership — ACTIVE

### Reconciliation and evidence

- The inherited documentation HEAD `1077fe0c0074976831f1708a61e9372c81cc8386` was verified before mutation.
- Its Admin AI run `34762502501`, Combined `34762502390`, and Stage13G `34762502493` are SUCCESS; Stage13G includes successful Admin UI, backend, and Real API + PostgreSQL + Chromium jobs.
- A fresh route inventory showed `/app/reviews/ai` still importing root `AiOperationsPage` even though `reviews` is an established feature owner.
- `AiOperationsPage` remains client orchestration around server-authoritative AI job/review/application APIs; no migration or backend change is justified.

### Classification

- **KEEP:** route behavior, polling/pagination, review/application semantics, conflict/session handling, API authority and existing tests.
- **IMPROVE:** feature ownership under `src/admin/reviews/`.
- **REFACTOR:** establish a feature-owned route adapter first; move implementation only after parity.
- **REBUILD:** none.
- **REMOVE:** root `AiOperationsPage.tsx` only after executable parity.
- **NO CHANGE:** migrations, backend, PostgreSQL authority, auth/security, Student workstream and test strength.

### Implementation to current checkpoint

- `9427649f29e3bf69d2143dc4b12235652bcefc6b` — added `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` as a temporary adapter.
- `069858ace554e2be51e21b128e76e6089f26edef` — changed `App.tsx` so `/app/reviews/ai` imports through the feature owner.
- No logic, API, backend, migration, Student or test assertion was changed.

### Exact-head verification state

Exact code-head `069858ace554e2be51e21b128e76e6089f26edef` entered the normal matrix:
- Frontend `34763851152` — IN PROGRESS at checkpoint.
- Admin AI `34763851138` — IN PROGRESS at checkpoint.
- Combined `34763851147` — IN PROGRESS at checkpoint.
- Stage13G `34763851137` — IN PROGRESS at checkpoint.

No implementation relocation or root seam removal is allowed until this matrix is green.

## Explicit handoff — continue AR-09 Batch 4A only

1. Fetch live `main`, current branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Reconcile Frontend `34763851152`, Admin AI `34763851138`, Combined `34763851147`, and Stage13G `34763851137` for `069858ace554e2be51e21b128e76e6089f26edef`.
3. If all are green, continue the same AI-review seam only: move the actual implementation into `src/admin/reviews/AiOperationsPage.tsx`, adjust relative imports only, then remove root `AiOperationsPage.tsx` after parity.
4. If a gate fails, fix the root cause without weakening tests or server contracts.
5. Do not select another cleanup candidate and do not begin AR-10 while Batch 4A is unresolved.
6. Keep PR #52 Draft; no merge or auto-merge.

## Quality gate for remaining stages

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
