# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–7A VERIFIED; Batch 8A Lesson Publication ownership relocation ACTIVE at first exact-head parity.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`.  
Current Batch 8A production code-head: `155759bf1cd9558a976ed1dca77dcce8186fff4e`.

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
- Batch 7A: Content-ingestion ownership relocation + root seam removal — VERIFIED this run. Frontend `34778944908` succeeded on seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`; documentation descendant `803e9b55c2496998358cf257a959bc4a6799a90f`, carrying identical production code, completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.

## AR-09 Batch 8A — Lesson Publication ownership relocation — ACTIVE

### Reconciliation before mutation

Before any new code mutation this run:

- live `main` was checked at `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` and its Student-workstream advance was left untouched;
- Admin branch HEAD was `803e9b55c2496998358cf257a959bc4a6799a90f`;
- all three continuity docs, recent commits, Draft PR #52 and exact-head CI were read;
- inherited Batch 7A parity was resolved green before starting a new seam.

### Fresh inventory finding

The post-Batch-7A inventory found:

- `App.tsx` correctly routes Content through `admin/content/ContentIngestionPage`;
- `admin/content/ContentIngestionWorkspace.tsx` still imports `LessonPublicationPanel` from the app root;
- root `LessonPublicationPanel` is exclusively a Content-domain publication decision surface backed by `lesson-content-api`.

This is a smaller and clearer AD-ADMIN-029 ownership seam than the cross-feature AI authoring surface, so only Lesson Publication was selected for the next batch.

### Contracts preserved

Binding behavior remains:

- canonical lesson-content state loads from the server;
- `submit_review`, `return_to_draft` and `publish` remain server commands;
- publication still requires explicit confirmation;
- publication remains disabled when review content is blocked;
- draft/review/published counts remain server-derived;
- missing-session handling remains unchanged;
- API/PostgreSQL authority and test strength remain unchanged.

Classification:
- **KEEP:** behavior, lifecycle/publication rules, confirmation, blocking, session handling, server authority and tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** real implementation under `admin/content/`.
- **REBUILD:** none.
- **REMOVE:** root compatibility re-export only after green parity and caller proof.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream or tests.

### Code performed

Commit `333ed22db2a9708560845cfcc496a81fc18fd743` — `refactor(admin): add content-owned lesson publication panel`

Added:
- `apps/admin-web/src/admin/content/LessonPublicationPanel.tsx`

Commit `155759bf1cd9558a976ed1dca77dcce8186fff4e` — `refactor(admin): route lesson publication through content owner`

Changed root:
- `apps/admin-web/src/LessonPublicationPanel.tsx`

The root file is now only a compatibility re-export of `./admin/content/LessonPublicationPanel`; the real implementation belongs to Content. No backend/API/migration/Student/test file changed.

### Exact-head verification

Code-head `155759bf1cd9558a976ed1dca77dcce8186fff4e` triggered:

- Frontend `34780494748` — PENDING at checkpoint;
- Admin AI `34780494751` — PENDING at checkpoint;
- Combined `34780494746` — PENDING at checkpoint;
- Stage13G `34780494761` — PENDING at checkpoint.

No failure was observed. Batch 8A remains ACTIVE until equivalent exact production-code parity is green.

## Explicit handoff — Batch 8A first, no parallel work

1. Re-fetch live `main`, branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–7A as DONE / VERIFIED.
3. Batch 8A is ACTIVE at first relocation parity.
4. Current production code-head is `155759bf1cd9558a976ed1dca77dcce8186fff4e`.
5. Resolve Frontend `34780494748`, Admin AI `34780494751`, Combined `34780494746`, Stage13G `34780494761` before any further mutation.
6. If green, inspect all callers of root `LessonPublicationPanel.tsx`; switch the Content caller to local `./LessonPublicationPanel` only when proven safe.
7. Re-run exact-head parity after the caller switch; delete the root compatibility seam only after that parity is green.
8. After Batch 8A is fully verified, perform a fresh AR-09 inventory.
9. If no justified established-owner seam remains, perform final AR-09 verification and close AR-09.
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
