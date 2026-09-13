# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–6A VERIFIED; Batch 7A relocation parity VERIFIED, obsolete root Content Ingestion seam removed, deletion-head exact parity ACTIVE.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`.  
Latest fully verified AR-09 code-head before Batch 7A: `2a958723d434e10755d35299ba509f69fc411bb3`.  
Relocation-equivalent green checkpoint: `7ed738b7e42d3c5fc022cf3757a7877a66291dfa`.  
Current Batch 7A seam-removal code-head under verification: `7b4106f82ab6f1c152ac20caf11c70779224acde`.

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

This run refreshed live `main`, branch HEAD, recent branch state, Draft PR #52, all three continuity files and exact-head CI before code mutation.

- live `main`: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`; latest change belongs to the Student workstream and was not modified;
- inherited Admin branch/documentation HEAD: `7ed738b7e42d3c5fc022cf3757a7877a66291dfa`;
- Draft PR #52: open + Draft + unmerged.

The relocated implementation parity was closed before mutation on the inherited exact head:
- Admin AI `34777365375` — SUCCESS;
- Combined `34777365376` — SUCCESS;
- Stage13G `34777365395` — SUCCESS.

This inherited head carries the same relocated Content Ingestion production code as the previous implementation move. Therefore no active relocation blocker remained.

### Contracts and classification

Existing behavior remains binding:
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
- **REFACTOR:** real implementation relocation under `admin/content/` — complete.
- **REBUILD:** none.
- **REMOVE:** obsolete root compatibility re-export — executed this run after caller proof.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Caller proof before deletion

Before removing the root seam, branch files and the PR patch were checked:
- `ContentIngestionPage` imports the local `./ContentIngestionWorkspace`;
- the real implementation is `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`;
- `App.tsx` imports `ContentIngestionPage` from the Content feature owner and no longer imports the root workspace;
- root `apps/admin-web/src/ContentIngestionWorkspace.tsx` was only a one-line compatibility re-export;
- PR #52 patch confirms the legacy root route import was removed.

No compatibility caller was found in the route-owned branch surface.

### Seam removal performed

Commit `7b4106f82ab6f1c152ac20caf11c70779224acde` — `refactor(admin): remove content ingestion root seam`

Deleted only:
- `apps/admin-web/src/ContentIngestionWorkspace.tsx`

No backend, migration, API-contract, auth/security, Student or test file changed.

### Exact-head parity running

For seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`, CI started immediately. At checkpoint:
- Combined `34778944934` — QUEUED;
- other configured branch gates had not all appeared yet in the first listing.

No failure was observed. Batch 7A is therefore not VERIFIED yet and no additional cleanup batch was started.

## Explicit handoff — finish deletion parity before any next mutation

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–6A as DONE / VERIFIED.
3. Batch 7A is ACTIVE at deletion-head parity.
4. Relocation-equivalent green evidence: `7ed738b7e42d3c5fc022cf3757a7877a66291dfa`; Admin AI `34777365375`, Combined `34777365376`, Stage13G `34777365395` — SUCCESS.
5. Current production code-head: `7b4106f82ab6f1c152ac20caf11c70779224acde`; root Content Ingestion compatibility seam is deleted.
6. Resolve the full exact-head matrix first; first observed run is Combined `34778944934` — QUEUED at checkpoint.
7. While any relevant run remains active, do not create parallel code.
8. If all green, mark Batch 7A DONE / VERIFIED and perform a fresh AR-09 inventory.
9. If no justified seam remains, run final AR-09 verification and formally close AR-09 before AR-10.
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
