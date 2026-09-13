# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–5A VERIFIED; Batch 6A ACTIVE.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`.  
Latest fully verified AR-09 code-head: `a22795d1ebfee861e3ca6e8d0a1502e09206ee9d`.

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
- Batch 6A: Content-review feature adapter + route ownership — VERIFIED through `a22795d1ebfee861e3ca6e8d0a1502e09206ee9d`; Batch remains ACTIVE until real implementation relocation and root-seam removal complete.

## AR-09 Batch 6A — Content review ownership relocation — ACTIVE

### Reconciliation before mutation

The run refreshed live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI. The inherited documentation checkpoint `be4ee52aa99440b591930f37f35586c99324cc85` had no unresolved state: its exact-head verification was green, so the run did not branch into parallel work.

### Fresh inventory and classification

A fresh root/route inventory found `/app/reviews/content` still directly importing app-root `ContentOperationsWorkspace`, despite Reviews already having an established feature owner under `src/admin/reviews/`. The root component is a route-specific server-backed content/OCR human-review surface.

Classification:
- **KEEP:** route behavior, OCR review semantics, filtering/pagination, detail flow, session handling, server refresh, APIs/PostgreSQL authority and tests.
- **IMPROVE:** feature ownership.
- **REFACTOR:** adapter-first route ownership, then real implementation relocation with relative-import changes only.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after executable parity of the relocated implementation.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Adapter parity

Commit `a8efe7d7c0a811d0b03e25741c1881d87874b79b` added `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` as a temporary adapter to the existing root implementation. No runtime contract changed.

Exact-head matrix:
- Frontend `34769685084` — SUCCESS.
- Admin AI `34769685033` — SUCCESS.
- Combined `34769685141` — SUCCESS.
- Stage13G `34769685089` — SUCCESS.

### Route ownership parity

Only after adapter parity, commit `a22795d1ebfee861e3ca6e8d0a1502e09206ee9d` changed `App.tsx` so `/app/reviews/content` imports/renders the Reviews-owned `ContentOperationsPage`. The root implementation remains intentionally present as a compatibility target.

Exact-head matrix:
- Frontend `34769885941` — SUCCESS.
- Admin AI `34769885857` — SUCCESS.
- Combined `34769885894` — SUCCESS.
- Stage13G `34769885845` — SUCCESS.

No backend, migration, Student or test assertion changed.

## Explicit handoff — continue Batch 6A only

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Confirm no newer concurrent code or unresolved CI supersedes this checkpoint.
3. Replace the temporary `admin/reviews/ContentOperationsPage.tsx` adapter with the real implementation currently in root `ContentOperationsWorkspace.tsx`, changing only relative imports/export naming required by relocation.
4. Keep the root file temporarily during the first relocated-implementation parity run.
5. Require full exact-head Frontend/Admin AI/Combined/Stage13G green before removing the root seam.
6. After green parity, delete the root compatibility file and require a second exact-head matrix.
7. Then perform a fresh AR-09 inventory; if no justified seam remains, formally close AR-09 before starting AR-10.
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
