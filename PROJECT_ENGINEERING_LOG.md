# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–7A VERIFIED; Batch 8A Lesson Publication ownership relocation ACTIVE with root seam removed and deletion parity running.**

## Project and authority invariants

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- Human review/publication/revision/provenance/audit authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.
- Tests represent canonical production contracts; backend validation is never weakened to satisfy fixtures.

## Binding Admin architecture decisions

- AD-ADMIN-001 — primary work is route-owned and deep-linkable.
- AD-ADMIN-002 — Overview is attention-first.
- AD-ADMIN-003 — Operations owns Health/Audit/Diagnostics.
- AD-ADMIN-004 — technical IDs/provider/runtime/storage/hash/raw JSON are advanced-only.
- AD-ADMIN-005..015 — content/question publication, OCR evidence, contextual AI and Question Bank route ownership remain server-authoritative and parity-first.
- AD-ADMIN-016..025 — Quiz Builder decomposition preserves lifecycle/version/export authority and removes legacy seams only after executable parity.
- AD-ADMIN-026 — Students and Access Codes are separate task owners.
- AD-ADMIN-027 — obsolete Students/Access compatibility aliases are removed after focused parity.
- AD-ADMIN-028 — stage closure requires route ownership plus exact-head executable parity.
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; relocation preserves behavior/contracts and removal waits until executable parity.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batches 1–7A VERIFIED; Batch 8A ACTIVE at seam-removal parity.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata ownership relocation — VERIFIED; checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum ownership + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review ownership + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A — Content ingestion ownership + root seam removal — VERIFIED. Frontend `34778944908` on seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`; documentation descendant `803e9b55c2496998358cf257a959bc4a6799a90f` completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.

## 2026-09-14 — AR-09 Batch 8A — Lesson Publication ownership relocation continuation

### A. State read before mutation

This continuation was reconciled from live repository evidence rather than chat memory:

- live `main`: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — parallel Student workstream, untouched;
- inherited Admin branch HEAD: `d6d5dc3da9777e16d9c88848a30cc75273e8f67e`;
- Draft PR #52: open and Draft, not merged;
- AR-01..AR-08: DONE / VERIFIED;
- AR-09 Batches 1–7A: DONE / VERIFIED;
- Batch 8A: ACTIVE at caller-switch parity;
- AR-10: NOT STARTED.

Before mutation, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, recent commits, PR #52, exact-head Actions, `App.tsx`, the Content caller and the root compatibility seam were inspected.

### B. Inherited caller-switch blocker resolved

Production code-head `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4` had already switched `admin/content/ContentIngestionWorkspace.tsx` from root `../../LessonPublicationPanel` to local `./LessonPublicationPanel`.

Verification resolved as follows:
- Frontend `34782291937` — SUCCESS on `e5d3ebc...`;
- Admin AI `34782291934` — SUCCESS on `e5d3ebc...`;
- Combined `34782291938` — CANCELLED by later documentation pushes rather than a test failure;
- documentation descendant `d6d5dc3da9777e16d9c88848a30cc75273e8f67e`, carrying the same production tree, completed Admin AI `34782412500`, Combined `34782412491`, Stage13G `34782412434` — SUCCESS.

No production mutation was made until that inherited state was reconciled.

### C. Caller and ownership proof before deletion

Evidence inspected:
- root `apps/admin-web/src/LessonPublicationPanel.tsx` contained only `export { LessonPublicationPanel } from "./admin/content/LessonPublicationPanel";`;
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` already imported `./LessonPublicationPanel` directly;
- `apps/admin-web/src/App.tsx` imports the Content ingestion route owner and does not import the root compatibility seam;
- the real Lesson Publication implementation remains in `apps/admin-web/src/admin/content/LessonPublicationPanel.tsx`.

The root file therefore had no established production ownership role remaining; it was a compatibility seam only.

### D. Classification and root-cause decision

- **KEEP:** publication lifecycle and business rules, explicit confirmation, review-blocking, session handling, server/PostgreSQL authority and current tests.
- **IMPROVE:** dependency direction and feature ownership.
- **REFACTOR:** direct Content-owned caller path already established.
- **REBUILD:** none.
- **REMOVE:** root compatibility re-export after caller proof and parity.
- **NO CHANGE:** backend, migrations, API contracts, auth/security, Student workstream and test strength.

Root cause is ownership drift, not a publication business-rule defect.

### E. Production mutation performed

#### Commit `3ad8750b65e357e13b99529d59a751172be9e26b`
`refactor(admin): remove lesson publication root seam`

Deleted only:
- `apps/admin-web/src/LessonPublicationPanel.tsx`

No functional implementation was deleted; the Content-owned real implementation remains. No rendering behavior, props, server commands, backend, migration, API contract, Student code or test was modified.

### F. Exact-head deletion parity and current blocker

Fresh exact-head runs on `3ad8750b65e357e13b99529d59a751172be9e26b`:
- Frontend `34783395314` — QUEUED at checkpoint;
- Admin AI `34783395106` — IN PROGRESS at checkpoint;
- Combined `34783395476` — IN PROGRESS at checkpoint;
- Stage13G `34783395190` — IN PROGRESS at checkpoint.

No failure was observed before required continuity documentation. Because deletion parity is still active, no fresh AR-09 inventory, additional cleanup, AR-09 closure or AR-10 work was started.

### G. Stage state at handoff

- AR-09 Batch 8A — **ACTIVE / ROOT SEAM REMOVED / EXACT-HEAD DELETION PARITY PENDING**.
- AR-09 — ACTIVE.
- AR-10 — NOT STARTED.
- Draft PR #52 remains Draft; no merge or auto-merge.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–7A as DONE / VERIFIED; do not redo them.
3. Treat Batch 8A as ACTIVE at seam-removal verification.
4. Production code-head to verify first: `3ad8750b65e357e13b99529d59a751172be9e26b`.
5. Resolve Frontend `34783395314`, Admin AI `34783395106`, Combined `34783395476`, Stage13G `34783395190` before any production mutation. If required documentation commits supersede a run, reconcile the latest documentation descendant carrying the identical production tree and record the supersession explicitly.
6. Mark Batch 8A DONE / VERIFIED only after the seam-removal production state is executable-green.
7. Then perform a fresh AR-09 inventory. Do not open speculative cross-feature cleanup without established ownership evidence.
8. If no justified ownership seam remains, run final AR-09 exact-head gates and close AR-09.
9. Only after formal AR-09 closure may AR-10 begin.
10. Preserve Student isolation, backend/PostgreSQL authority and current test strength.
11. Keep PR #52 Draft; no merge or auto-merge.

## Findings register

| ID | Severity | Area | Problem | Status |
|---|---:|---|---|---|
| `ADMIN-001` | P1 | Admin IA | no durable route ownership | FIXED / AR-01 |
| `ADMIN-002` | P1 | Overview | generic metrics vs attention | FIXED / AR-02 |
| `ADMIN-003` | P1 | Curriculum | giant composition | FIXED / AR-03 |
| `ADMIN-004` | P1 | Content publication | task-ID-coupled UI | FIXED / AR-04 |
| `ADMIN-005` | P1 | OCR review | missing visible evidence | FIXED / AR-04 |
| `ADMIN-006` | P1 | AI review | pipeline internals in normal UX | FIXED / AR-05 |
| `ADMIN-007` | P1 | AI authoring | manual internal-ID handoff | FIXED / AR-05 |
| `ADMIN-008` | P1 | Question Bank | giant owner | FIXED / AR-06 |
| `ADMIN-009` | P1 | Quiz Builder | giant owner | FIXED / AR-07 |
| `ADMIN-010` | P1 | Students + Access | duplicated giant workspace | FIXED / AR-08 |
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | ACTIVE / AR-09; Batch 8A seam-removal parity pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
