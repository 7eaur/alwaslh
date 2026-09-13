# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–4A VERIFIED; Batch 5A ACTIVE / CI RUNNING.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`.  
Latest fully verified AR-09 code-head: `141e3e7912171c10356b8d32a268ddcbfda267f3`.  
Current Batch 5A code-head: `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## Product and architecture rules

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

## Verified AR-09 checkpoints

- Batch 1: Quiz metadata ownership relocation — VERIFIED; checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2: Lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3: Access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A: AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.

## AR-09 Batch 5A — Curriculum route ownership adapter — ACTIVE

### Reconciliation before mutation

The run refreshed live `main`, branch HEAD, the three continuity files, recent repository state, Draft PR #52 and exact-head CI. Inherited documentation HEAD `faec80191b56833118eda050d19d3b1bb79f7141` represented fully verified Batch 4A and no unresolved code mutation was continued in parallel.

### Fresh inventory

`App.tsx` still routed `/app/curriculum` through root `CurriculumWorkspace.tsx`, while `src/admin/curriculum/` already owns the curriculum structure, creation actions, UI helpers and styles. Root `CurriculumWorkspace.tsx` was inspected and confirmed to be the route-level orchestration layer over existing server-backed curriculum CRUD APIs.

### Classification

- **KEEP:** route behavior, CRUD semantics, server refresh, session handling, APIs and tests.
- **IMPROVE:** route ownership through the established Curriculum feature boundary.
- **REFACTOR:** adapter-first ownership only.
- **REBUILD:** none.
- **REMOVE:** nothing until parity is proven.
- **NO CHANGE:** backend, migrations, PostgreSQL authority, auth/security, Student workstream and test strength.

### Implementation

Commit `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022` — `refactor(admin): route curriculum through feature owner`:

- added `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx` as a temporary feature-owned adapter;
- changed `App.tsx` to resolve `/app/curriculum` through that feature-owned boundary;
- preserved the root implementation until executable parity.

### Verification state

For exact code-head `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022`:

- Frontend Preparation `34766693628` — **SUCCESS**.
- Admin AI Operations `34766693635` — **IN PROGRESS** at checkpoint.
- Combined Integration `34766693638` — **IN PROGRESS** at checkpoint.
- Stage13G Admin Operations `34766693674` — **IN PROGRESS** at checkpoint.

No completion is claimed while these gates remain active.

## Explicit handoff — continue AR-09 Batch 5A only

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Reconcile runs `34766693635`, `34766693638`, `34766693674` first.
3. If green, move the actual `CurriculumWorkspace` implementation into `src/admin/curriculum/`, changing only relative imports and preserving behavior; keep root compatibility until parity.
4. Remove root `CurriculumWorkspace.tsx` only after the feature-owned implementation passes exact-head parity.
5. If any run fails, root-fix the failure without weakening tests or server/PostgreSQL authority.
6. Do not open another AR-09 seam and do not begin AR-10 until this work is reconciled.
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
