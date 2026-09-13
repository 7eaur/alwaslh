# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–7A VERIFIED; Batch 8A Lesson Publication ownership relocation ACTIVE with caller switched and exact-head parity running.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — Student workstream advance, untouched.  
Current Batch 8A production code-head: `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4`.

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
- Route/feature-specific components with established owners move under `src/admin/<feature>/` once parity and caller proof permit it.

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
- Batch 4A: AI review ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A: Curriculum ownership + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A: Content review ownership + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A: Content ingestion ownership + root seam removal — VERIFIED. Frontend `34778944908` succeeded on seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`; documentation descendant `803e9b55c2496998358cf257a959bc4a6799a90f` completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.

## AR-09 Batch 8A — Lesson Publication ownership relocation — ACTIVE

### Checkpoint reconciliation

This continuation began by re-fetching live `main`, Admin branch HEAD, the three continuity files, recent commits, Draft PR #52 and exact-head CI.

Inherited Admin documentation HEAD: `0550ab688dc8909d3690a3dce54173d58f5d6aa2`.

Its inherited first-relocation parity is fully green:
- Admin AI `34780605238` — SUCCESS;
- Combined `34780605257` — SUCCESS;
- Stage13G `34780605241` — SUCCESS, including Real API + PostgreSQL + Chromium.

No parallel work was opened before closing that inherited blocker.

### Caller proof

The root file `apps/admin-web/src/LessonPublicationPanel.tsx` was inspected and is only a compatibility re-export:

`export { LessonPublicationPanel } from "./admin/content/LessonPublicationPanel";`

The Content-owned `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` was still importing through that root seam. The real implementation already lives under `admin/content/`.

Contracts remain unchanged:
- canonical lesson-content state loads from server authority;
- `submit_review`, `return_to_draft`, `publish` remain server commands;
- publish still requires explicit confirmation;
- blocked review still prevents publication;
- draft/review/published counts remain server-derived;
- missing-session handling remains unchanged;
- API/PostgreSQL authority and test strength remain unchanged.

Classification:
- **KEEP:** behavior, lifecycle/publication rules, confirmation, blocking, session handling, server authority and tests.
- **IMPROVE:** Content dependency/feature ownership.
- **REFACTOR:** caller imports the local Content-owned implementation.
- **REBUILD:** none.
- **REMOVE:** root compatibility re-export only after caller-switch parity is green.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream or tests.

### Code performed this continuation

Commit `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4` — `refactor(admin): use content-owned lesson publication panel`

Changed only:
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`

The import now uses `./LessonPublicationPanel` instead of `../../LessonPublicationPanel`. No behavior or contract was altered. The root seam remains intentionally present while exact-head parity runs.

### Exact-head verification

Caller-switch code-head `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4` triggered:

- Frontend `34782291937` — IN PROGRESS at checkpoint;
- Admin AI `34782291934` — IN PROGRESS at checkpoint;
- Combined `34782291938` — IN PROGRESS at checkpoint;
- Stage13G `34782291927` — IN PROGRESS at checkpoint.

No failure was observed. Batch 8A therefore remains ACTIVE / CALLER SWITCHED / PARITY PENDING.

## Explicit handoff — Batch 8A first, no parallel work

1. Re-fetch live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–7A as DONE / VERIFIED.
3. Treat Batch 8A as ACTIVE at caller-switch parity.
4. Resolve Frontend `34782291937`, Admin AI `34782291934`, Combined `34782291938`, Stage13G `34782291927` before any production mutation.
5. If all are green, re-prove no legitimate caller still needs root `apps/admin-web/src/LessonPublicationPanel.tsx`.
6. Delete that root compatibility seam only after this proof and green caller-switch parity.
7. Run a new exact-head matrix after deletion. Batch 8A becomes DONE / VERIFIED only when deletion head is green.
8. After Batch 8A closes, perform a fresh AR-09 inventory.
9. If no justified established-owner seam remains, run final AR-09 verification and close AR-09.
10. Only then start AR-10.
11. Keep PR #52 Draft; no merge or auto-merge.

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
