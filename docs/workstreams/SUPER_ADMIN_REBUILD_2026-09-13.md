# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–6A VERIFIED; Batch 7A is the next justified cleanup seam.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `3fe51062aa9c5ed0c39682f0da8e814ece0b0c62`.  
Latest fully verified AR-09 code-head: `2a958723d434e10755d35299ba509f69fc411bb3`.

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

## AR-09 Batch 6A — Content review ownership relocation — DONE / VERIFIED

### Reconciliation before mutation

The run refreshed live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI. The inherited documentation checkpoint `0846aa2cebde010dd1544e3361c4089ae72a0da2` was fully green before code changes:

- Admin AI `34770167069` — SUCCESS.
- Combined `34770166985` — SUCCESS.
- Stage13G `34770167023` — SUCCESS.

No unresolved ACTIVE/RUNNING batch or newer undocumented mutation remained.

### Classification carried forward

- **KEEP:** `/app/reviews/content` behavior, OCR review semantics, filtering/pagination, detail/source flow, session handling, server refresh, API/PostgreSQL authority and tests.
- **IMPROVE:** feature implementation ownership.
- **REFACTOR:** move the real implementation into the established Reviews owner with relative-import/export changes only.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after executable parity.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Real implementation relocation

Commit `b3580fcac2a8f9536e86d993e035af1262b34ca4` replaced the temporary `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` adapter with the full content/OCR human-review implementation. The move changed only feature ownership, relative import paths and the exported component name. The root `ContentOperationsWorkspace.tsx` was intentionally retained during the first parity run.

Exact-head matrix:
- Frontend `34771348426` — SUCCESS.
- Admin AI `34771348425` — SUCCESS.
- Combined `34771348397` — SUCCESS.
- Stage13G `34771348464` — SUCCESS.

### Root seam removal

Only after relocation parity became fully green, commit `2a958723d434e10755d35299ba509f69fc411bb3` deleted `apps/admin-web/src/ContentOperationsWorkspace.tsx`.

Second exact-head matrix:
- Frontend `34771526703` — SUCCESS.
- Admin AI `34771526711` — SUCCESS.
- Combined `34771526699` — SUCCESS.
- Stage13G `34771526724` — SUCCESS.

No backend, migration, Student or test assertion changed. Batch 6A is **DONE / VERIFIED**.

## Fresh AR-09 inventory after Batch 6A

The run did not assume AR-09 was complete. It re-read `App.tsx`, the app-root source inventory and the established `admin/content/` feature owner after Batch 6A went green.

Finding: `/app/content` still imports and renders app-root `ContentIngestionWorkspace`, while `src/admin/content/` is already the established Content feature owner. The implementation is route-specific and orchestrates existing curriculum and server-backed ingestion flows: ingestion history/task loading, upload validation, upload/process/link/archive operations and lesson publication composition.

Therefore AR-09 still has justified cleanup work. The smallest next seam is **Batch 7A — Content ingestion ownership relocation**.

Preliminary classification:
- **KEEP:** route behavior, upload validation, ingestion lifecycle, history/detail behavior, lesson linking/publication, session handling, API/PostgreSQL authority and existing tests.
- **IMPROVE:** feature ownership under `src/admin/content/`.
- **REFACTOR:** parity-first feature owner, route wiring and real implementation relocation.
- **REBUILD:** none identified.
- **REMOVE:** root compatibility seam only after exact-head parity.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

## Explicit handoff — Batch 7A next, AR-10 forbidden

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Confirm no newer concurrent code or unresolved CI supersedes this checkpoint.
3. Do not redo Batch 6A; final verified code-head is `2a958723d434e10755d35299ba509f69fc411bb3`.
4. Inspect the complete `apps/admin-web/src/ContentIngestionWorkspace.tsx`, its callers, tests, APIs and `LessonPublicationPanel` dependency before mutation.
5. Execute **AR-09 Batch 7A only** as a small parity-first ownership move into `apps/admin-web/src/admin/content/`.
6. Require exact-head Frontend/Admin AI/Combined/Stage13G green before removing any root compatibility seam.
7. After Batch 7A, perform another fresh AR-09 inventory; if no justified seam remains, run final AR-09 verification and close the stage before AR-10.
8. Keep PR #52 Draft; no merge or auto-merge.

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
