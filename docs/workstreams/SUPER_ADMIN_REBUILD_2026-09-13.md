# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–6A VERIFIED; Batch 7A ACTIVE with the real Content Ingestion implementation relocated under `admin/content/`, compatibility seam retained, exact-head parity running.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`.  
Latest fully verified AR-09 code-head before Batch 7A relocation: `2a958723d434e10755d35299ba509f69fc411bb3`.  
Current relocated Batch 7A code-head under verification: `4def323146e132bb7f75887f2aa96b6ee92b2447`.

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
- Batch 2: Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3: Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A: AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A: Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A: Content-review route + implementation ownership relocation and root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### Reconciliation before mutation

This run refreshed live `main`, branch HEAD, recent branch state, Draft PR #52, the three continuity files and exact-head CI before code mutation.

- live `main`: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`; its latest change belongs to the Student workstream and was not modified here;
- inherited Admin branch/documentation HEAD: `52a26e65a0a2351d961cfdbab82fd77eb6b6c3d0`;
- Draft PR #52: open + Draft + unmerged.

The inherited routed parity was resolved before mutation:
- routed code-head `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`: Frontend `34775882723` SUCCESS, Admin AI `34775882751` SUCCESS; Combined `34775882734` was cancelled because the documentation checkpoint superseded it, not due to test failure;
- documentation HEAD carrying the same production code: Admin AI `34775980922`, Combined `34775980920`, Stage13G `34775980894` — all SUCCESS.

Thus there was no inherited active blocker before moving the implementation.

### Contracts and classification

The real root implementation and the Content-owned page adapter were read before mutation. Existing behavior remains binding:
- ordered JPG/PNG/WebP/PDF upload;
- image 50 MB / PDF 100 MB / 100 files-per-task validation;
- server-backed curriculum, ingestion history and task detail;
- process/link/archive transitions;
- lesson publication flow;
- session-expiry handling;
- API/PostgreSQL authority and existing E2E coverage.

Classification:
- **KEEP:** behavior, validation, lifecycle/history/detail, linking/publication, session handling, server authority and tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** relocate implementation with only relative-import adjustments.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after relocated executable parity and caller proof.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Implementation relocation performed

1. Commit `73cc37c8d95bd63d0a0f0be2d90ff5c9b991d357` — `refactor(admin): relocate content ingestion owner`
   - created `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`;
   - preserved implementation behavior;
   - adjusted imports only to `../../admin-api`, `../../content-ingestion-api`, `../../LessonPublicationPanel`.
2. Commit `699c7b215b2f97229f9235a3bc3a3357e7168f7d` — `refactor(admin): point content page at feature owner`
   - `ContentIngestionPage` now imports `./ContentIngestionWorkspace` directly.
3. Commit `4def323146e132bb7f75887f2aa96b6ee92b2447` — `refactor(admin): retain content ingestion compatibility seam`
   - root `apps/admin-web/src/ContentIngestionWorkspace.tsx` is now only a compatibility re-export;
   - deletion intentionally deferred until relocated parity is green and no branch caller needs it.

No backend, migration, Student, security or test file changed.

### Exact-head parity running

For relocated code-head `4def323146e132bb7f75887f2aa96b6ee92b2447`:
- Frontend `34777260925` — IN PROGRESS at checkpoint;
- Admin AI `34777260918` — IN PROGRESS at checkpoint;
- Combined `34777260910` — IN PROGRESS at checkpoint;
- Stage13G `34777260890` — IN PROGRESS at checkpoint.

No failure was observed. Since the matrix is active, Batch 7A is not VERIFIED and the compatibility seam was not deleted.

## Explicit handoff — finish relocated parity before any next mutation

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–6A as DONE / VERIFIED.
3. Batch 7A is ACTIVE; relocated implementation code-head is `4def323146e132bb7f75887f2aa96b6ee92b2447`.
4. First resolve Frontend `34777260925`, Admin AI `34777260918`, Combined `34777260910`, Stage13G `34777260890` (or newer documentation-head equivalents carrying identical production code).
5. While relevant CI remains active, do not create parallel code.
6. If all green, verify all branch callers of root `apps/admin-web/src/ContentIngestionWorkspace.tsx`.
7. If no caller remains, delete only that root compatibility seam and run the full exact-head matrix again.
8. Mark Batch 7A DONE / VERIFIED only after final code-head green.
9. Then perform fresh AR-09 inventory. If no justified seam remains, run final AR-09 verification and close AR-09 before AR-10.
10. Keep PR #52 Draft; no merge or auto-merge.

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
