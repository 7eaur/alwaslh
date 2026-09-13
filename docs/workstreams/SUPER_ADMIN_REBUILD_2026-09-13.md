# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–6A VERIFIED; Batch 7A ACTIVE with `/app/content` routed through its Content-owned seam and exact-head parity running.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `8d11cddb2cde510f233926d394434a384d480745`.  
Latest fully verified AR-09 code-head: `2a958723d434e10755d35299ba509f69fc411bb3`.  
Current routed Batch 7A code-head under verification: `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`.

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
- Batch 6A: Content-review route + implementation ownership relocation and root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### Reconciliation before mutation

At intake this run refreshed live `main`, branch HEAD, recent commits, Draft PR #52, exact-head CI and literally read the three continuity files.

- live `main`: `8d11cddb2cde510f233926d394434a384d480745`;
- inherited branch/documentation HEAD: `4bde0c9df9f3c70c16af27f6d0f7334d85537bee`;
- Draft PR #52: open + Draft + unmerged;
- inherited exact-head gates: Admin AI `34774426801`, Combined `34774426784`, Stage13G `34774426779` — all SUCCESS.

Thus the earlier documented parity wait on the first Content-owned seam was already resolved by a newer green documentation checkpoint and no inherited ACTIVE/RUNNING CI blocked the next documented step.

### Contracts and classification

The route and adapter were rechecked before mutation:
- `App.tsx` still used app-root `ContentIngestionWorkspace` directly;
- `admin/content/ContentIngestionPage.tsx` existed as the first feature-owned seam and delegated to the unchanged root implementation;
- prior API/publication/E2E analysis remains binding and shows server/PostgreSQL authority with real Chromium coverage.

Classification remains:
- **KEEP:** behavior, upload/file validation, ingestion lifecycle/history/detail, linking/publication, session handling, server authority and tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** route through the feature seam first; implementation move only after green routed parity.
- **REBUILD:** none.
- **REMOVE:** root seam only after relocated executable parity.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Routed ownership change

Commit `2a687d2b5939fa0b969999ba0ca02d07491ed2c0` — `refactor(admin): route content through feature owner` changed only `apps/admin-web/src/App.tsx`.

- direct root `ContentIngestionWorkspace` import was removed;
- `ContentIngestionPage` is imported from `admin/content/`;
- `/app/content` now renders `ContentIngestionPage` under the unchanged related-actions shell;
- `ContentIngestionPage` still delegates to the unchanged root implementation, so behavior and API boundaries are intentionally preserved.

No backend, migration, Student, security or test change occurred.

### Exact-head parity now running

For routed code-head `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`:
- Frontend `34775882723` — IN PROGRESS at checkpoint;
- Admin AI `34775882751` — IN PROGRESS at checkpoint;
- Combined `34775882734` — QUEUED/ACTIVE at checkpoint;
- Stage13G `34775882780` — QUEUED/ACTIVE at checkpoint.

There is no observed assertion failure. Because the matrix is still active, Batch 7A is not VERIFIED and no real implementation relocation or root deletion was started.

## Explicit handoff — finish routed parity before any next mutation

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–6A as DONE / VERIFIED.
3. Batch 7A is ACTIVE; routed code-head is `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`.
4. First resolve Frontend `34775882723`, Admin AI `34775882751`, Combined `34775882734`, Stage13G `34775882780`; do not create parallel code while any remains active.
5. If all are SUCCESS and no newer mutation supersedes the checkpoint, move the real `ContentIngestionWorkspace` implementation into `src/admin/content/`, changing only relative imports required by relocation.
6. Run exact-head parity again. Keep a temporary root compatibility seam if any caller remains.
7. Remove the root seam only after relocated parity is green and rerun the exact-head matrix after removal.
8. Once Batch 7A is fully verified, perform fresh AR-09 inventory. If no justified seam remains, run final AR-09 verification and close AR-09 before starting AR-10.
9. Keep PR #52 Draft; no merge or auto-merge.

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
