# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–6A VERIFIED; Batch 7A ACTIVE with its first Content-owned parity seam under exact-head verification.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `8d11cddb2cde510f233926d394434a384d480745`.  
Latest fully verified AR-09 code-head: `2a958723d434e10755d35299ba509f69fc411bb3`.  
Current Batch 7A code-head under verification: `d184ec9efaa17a89710cd9e9798c8972cd1236fb`.

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

This run refreshed and literally read the three continuity files, fetched live `main`, branch HEAD, recent branch commits, Draft PR #52 and exact-head CI before mutation.

- live `main`: `8d11cddb2cde510f233926d394434a384d480745`;
- inherited branch/documentation HEAD: `c7230dd39ee0101b14d3df37a29c68e7c1631141`;
- Draft PR #52: open + Draft + unmerged;
- inherited exact-head gates: Admin AI `34771856670`, Combined `34771856671`, Stage13G `34771856708` — all SUCCESS.

There was no unresolved inherited ACTIVE/RUNNING batch, so the next documented work could begin.

### Contracts and executable behavior inspected

Before code changes the run inspected:

- `apps/admin-web/src/App.tsx`: `/app/content` still renders root `ContentIngestionWorkspace`;
- `apps/admin-web/src/ContentIngestionWorkspace.tsx`: real route-specific ingestion orchestration;
- `apps/admin-web/src/content-ingestion-api.ts`: durable server-backed ingestion contracts;
- `apps/admin-web/src/LessonPublicationPanel.tsx`: server-backed lesson review/publication authority;
- `apps/admin-web/e2e/content-ingestion.e2e.spec.mjs`: mixed ordered upload → process → link → review → publish → reload → archive flow plus 390px no-overflow;
- `apps/admin-web/src/admin/content/`: established Content feature owner.

No migration/backend change is indicated by the ownership problem. Server/PostgreSQL authority remains canonical.

### Classification

- **KEEP:** `/app/content` behavior, upload/file validation, ingestion lifecycle/history/detail, linking/publication, session handling, API/PostgreSQL authority and existing tests.
- **IMPROVE:** feature ownership under `src/admin/content/`.
- **REFACTOR:** parity-first page seam, then route switch, then real implementation relocation only with green evidence at each boundary.
- **REBUILD:** none identified.
- **REMOVE:** root compatibility seam only after executable routed parity.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### First small Batch 7A change

Commit `d184ec9efaa17a89710cd9e9798c8972cd1236fb` — `refactor(admin): add content ingestion feature seam` added only:

`apps/admin-web/src/admin/content/ContentIngestionPage.tsx`

The feature-owned page currently delegates to the existing root `ContentIngestionWorkspace` while forwarding `onSessionExpired`. The route remains unchanged. The real implementation remains at root. This is intentional: establish the smallest feature boundary first and require exact-head evidence before switching routing.

No backend, migration, API contract, Student code or test assertion changed.

### Exact-head parity status on `d184ec9efaa17a89710cd9e9798c8972cd1236fb`

- Frontend `34774259547`, job `103769340092` — **SUCCESS**; lint, strict typecheck, unit tests, build green.
- Admin AI `34774259574`, job `103769340020` — **SUCCESS**; clean PostgreSQL migrations/contracts and backend/auth regressions green.
- Combined `34774259560`, job `103769340292` — **IN PROGRESS** at checkpoint. Quality gates, clean migrations/database contract and backend authority were already green; wider regression + browser phases remained active/pending.
- Stage13G `34774259581` — **IN PROGRESS**. UI job `103769340158` and backend job `103769340279` are SUCCESS; Real API + PostgreSQL + Chromium job `103769483722` remains IN PROGRESS.

Because the matrix is not yet fully green, no route switch, real implementation move or root seam deletion was started. This is the intentional blocker.

## Explicit handoff — finish current parity before any next mutation

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–6A as DONE / VERIFIED.
3. Batch 7A is ACTIVE; current code-head under verification is `d184ec9efaa17a89710cd9e9798c8972cd1236fb`.
4. First resolve Combined `34774259560` and Stage13G `34774259581`; do not create a parallel mutation while they remain active.
5. If both are SUCCESS and no newer commit supersedes the checkpoint, switch `/app/content` from root `ContentIngestionWorkspace` to `admin/content/ContentIngestionPage` as the next small reviewable change.
6. Run exact-head Frontend/Admin AI/Combined/Stage13G again before moving the real implementation.
7. Keep root `ContentIngestionWorkspace.tsx` as compatibility seam until routed parity is green. Only then may the real implementation be relocated under `admin/content/` and the root seam considered for deletion.
8. After Batch 7A is fully verified, perform a fresh AR-09 inventory. If no justified seam remains, run final AR-09 verification and close the stage before AR-10.
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
