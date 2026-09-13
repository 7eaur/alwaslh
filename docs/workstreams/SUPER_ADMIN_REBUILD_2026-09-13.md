# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–5A VERIFIED.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`.  
Latest fully verified AR-09 code-head: `d40c71192f513f18d69b0e67be408e6f146a3ec5`.

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
- Batch 5A: Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.

## AR-09 Batch 5A — Curriculum ownership relocation — DONE / VERIFIED

### Reconciliation before mutation

The run refreshed live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI. The inherited adapter code-head `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022` had successful Frontend `34766693628`, Admin AI `34766693635`, and Combined `34766693638`; Stage13G `34766693674` was cancelled only because the branch advanced. The successor documentation HEAD `7b77037d1906418a6713eef191706deed29ddf09` supplied the all-green replacement exact-head evidence, including Stage13G `34766824068`.

### Classification

- **KEEP:** route behavior, CRUD semantics, server refresh, session handling, APIs/PostgreSQL authority and tests.
- **IMPROVE:** route-level ownership inside the established Curriculum feature.
- **REFACTOR:** relocate the implementation with relative-import changes only.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after executable parity.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Implementation and parity

Commit `c06f9dc0a58203f3a5f70f9f47641eadcbd71464` moved the actual `CurriculumWorkspace` implementation into `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx`; the root file remained temporarily for parity. Exact-head CI was all green:

- Frontend `34768120218` — SUCCESS.
- Admin AI `34768120359` — SUCCESS.
- Combined `34768120260` — SUCCESS.
- Stage13G `34768120244` — SUCCESS.

After that proof, commit `d40c71192f513f18d69b0e67be408e6f146a3ec5` removed `apps/admin-web/src/CurriculumWorkspace.tsx`. Its final exact-head matrix was also all green:

- Frontend `34768283004` — SUCCESS.
- Admin AI `34768282985` — SUCCESS.
- Combined `34768283077` — SUCCESS.
- Stage13G `34768282982` — SUCCESS.

No backend, migration, Student behavior or test assertion was changed. Batch 5A is **DONE / VERIFIED**.

## Explicit handoff — fresh AR-09 inventory next

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Confirm this documentation checkpoint has no unresolved newer code/CI state.
3. Inventory remaining root-level route-owned Admin surfaces together with callers/tests/contracts.
4. Do **not** assume another cleanup batch exists. If no justified seam remains, go directly to final AR-09 verification and formal closure.
5. If a justified seam remains, take only the smallest reviewable one and preserve backend/PostgreSQL/Student/test authority.
6. Do not begin AR-10 until AR-09 is DONE / VERIFIED.
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
