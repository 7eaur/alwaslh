# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–2 VERIFIED; Batch 3A ACTIVE pending exact-head Combined + Stage13G.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
Current AR-09 Batch 3A code-head: `6e7e43e17651d54413ccf6cc234f4e1457942a25`.

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

## AR-09 Batch 3A — Access-code reports route ownership adapter — ACTIVE

### Reconciliation before mutation

The inherited documentation HEAD was `1b2915c00ee8818d467e1ef7fdc114366efdfb43`. Its non-overlap runs were fetched and completed green before code was changed:
- Admin AI `34759659708` — SUCCESS.
- Combined `34759659619` — SUCCESS.
- Stage13G `34759659630` — SUCCESS.

PR #52 remained open, Draft and unmerged.

### Evidence inspected

- `App.tsx` directly routed `/app/access-codes/reports` to root `AdminReportsWorkspace`.
- `AdminReportsWorkspace` uses existing curriculum/access-code APIs plus CSV helpers and owns presentation/client state only; canonical access-code authority stays on the server/PostgreSQL.
- `admin-reports.e2e.spec.mjs` exercises the real route for row-by-row import, selected CSV export, selected print cards, 390px no-overflow and real session expiry.

### Classification

- **KEEP:** route, import/export/print UX, session handling, existing API/PostgreSQL authority and E2E behavior.
- **IMPROVE:** explicit access-code route ownership.
- **REFACTOR:** route import through a page under `src/admin/access-codes/`.
- **REBUILD:** none.
- **REMOVE:** root implementation only after full relocation + executable parity; not in this sub-batch.
- **NO CHANGE:** migrations, backend, PostgreSQL constraints, auth/security, Student workstream and test strength.

### Implementation

Exact code-head `6e7e43e17651d54413ccf6cc234f4e1457942a25`:
- added `apps/admin-web/src/admin/access-codes/AdminAccessCodeReportsPage.tsx` as a temporary feature-owned adapter to the current root implementation;
- changed `App.tsx` to route `/app/access-codes/reports` through `AdminAccessCodeReportsPage` and removed the direct root import;
- retained root `AdminReportsWorkspace.tsx` deliberately until exact-head parity is complete.

No backend, migration, PostgreSQL, Student or test file changed.

### Current exact-head verification

- Frontend `34761018736` — SUCCESS.
- Admin AI `34761018755` — SUCCESS.
- Combined `34761018762` — IN PROGRESS at last check.
- Stage13G `34761018720` — QUEUED at last check.

**Batch 3A is not VERIFIED while those two gates remain incomplete. No additional mutation is permitted.**

## Explicit handoff — continue AR-09 Batch 3A only

1. Fetch live `main`, current branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Reconcile Combined `34761018762` and Stage13G `34761018720` for `6e7e43e17651d54413ccf6cc234f4e1457942a25`; Frontend `34761018736` and Admin AI `34761018755` are already SUCCESS.
3. Fix only a real failing root cause if a remaining gate fails; do not weaken tests or authority contracts.
4. If the exact-head matrix becomes green, record Batch 3A VERIFIED and continue this same seam: move the full access-code reports implementation (and route-specific CSS only after confirming exclusive ownership) under `src/admin/access-codes/`, adjust imports, remove the root compatibility seam after callers are clean, and run the applicable exact-head matrix including real reports Chromium parity.
5. Do not select another AR-09 candidate before closing this seam.
6. Do not begin AR-10 until AR-09 is fully DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.

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
