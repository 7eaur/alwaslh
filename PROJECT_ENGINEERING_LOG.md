# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–6A VERIFIED; Batch 7A ACTIVE with `/app/content` routed through the Content-owned seam and exact-head parity running.**

## Project and authority invariants

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- Human review/publication/revision/provenance/audit authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.
- Tests must represent canonical production contracts; backend validation is never weakened to satisfy fixtures.

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
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; relocation must preserve behavior/contracts and removal waits until executable parity.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batches 1, 2, 3, 4A, 5A and 6A VERIFIED; Batch 7A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review route + real implementation ownership relocation and root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### 1. State inherited from task A and reconciled before mutation

The run explicitly refreshed the live repository before code changes:

1. live `main` = `8d11cddb2cde510f233926d394434a384d480745`;
2. branch HEAD at intake = `4bde0c9df9f3c70c16af27f6d0f7334d85537bee`;
3. `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` were read from that branch;
4. recent branch state and Draft PR #52 were inspected; PR #52 remained open, Draft, unmerged;
5. exact-head runs on inherited HEAD were inspected and found fully green: Admin AI `34774426801`, Combined `34774426784`, Stage13G `34774426779` — SUCCESS.

The inherited documentation still described earlier code-head `d184ec9efaa17a89710cd9e9798c8972cd1236fb` as waiting on parity, but the newer documentation HEAD had already completed green CI and contained the same first feature seam. Therefore the inherited ACTIVE/RUNNING blocker was resolved before mutation.

### 2. Contracts and ownership rechecked

`apps/admin-web/src/App.tsx` still imported app-root `ContentIngestionWorkspace`, while `apps/admin-web/src/admin/content/ContentIngestionPage.tsx` existed as the intentionally small feature-owned adapter and delegated to `../../ContentIngestionWorkspace`.

The previously inspected server/API/E2E contracts remain binding:
- `content-ingestion-api.ts` is server-backed ingestion authority;
- `LessonPublicationPanel.tsx` preserves server-owned review/publication transitions;
- `content-ingestion.e2e.spec.mjs` proves ordered mixed-file upload, processing, linking, review/publication, reload durability, archive visibility and 390px no-overflow.

No migration/backend/auth/Student change was justified by the route-ownership problem.

### 3. Decision and classification

- **KEEP:** all existing Content Ingestion behavior, validation, lifecycle/history/detail, linking/publication, session handling, server/PostgreSQL authority and executable tests.
- **IMPROVE:** route and implementation ownership under the established Content feature.
- **REFACTOR:** first route through the already-green adapter; only after routed parity may the real implementation move.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after relocated exact-head parity.

Root cause remains architecture ownership, not a behavior defect.

### 4. Code change performed

Commit `2a687d2b5939fa0b969999ba0ca02d07491ed2c0` — `refactor(admin): route content through feature owner`.

Files changed:
- `apps/admin-web/src/App.tsx` only.

Change details:
- imported `ContentIngestionPage` from `./admin/content/ContentIngestionPage`;
- removed direct app-root `ContentIngestionWorkspace` import;
- `/app/content` now renders `ContentIngestionPage` inside the same `WorkspaceWithRelatedActions` shell;
- real implementation remains in `apps/admin-web/src/ContentIngestionWorkspace.tsx` and is still delegated to by the adapter.

Why: this is the smallest reviewable next step documented by the previous task. It proves route ownership separately from implementation relocation and avoids changing behavior and location simultaneously.

No backend, migration, API contract, auth/security, Student or test file changed. No tests were weakened.

### 5. Exact-head verification started

Exact routed code-head: `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`.

Runs created for that SHA:
- Frontend `34775882723` — IN PROGRESS at final inspection;
- Admin AI `34775882751` — IN PROGRESS at final inspection;
- Combined `34775882734` — QUEUED/ACTIVE at checkpoint;
- Stage13G `34775882780` — QUEUED/ACTIVE at checkpoint.

No failure was observed before documentation checkpoint. Since CI is still active, the run intentionally did **not** relocate the implementation, delete the root seam, start another AR-09 batch or start AR-10.

### 6. Phase status

AR-09 Batch 7A remains **ACTIVE / ROUTED PARITY PENDING**. It is not COMPLETE and must not be marked VERIFIED until the full matrix on the routed implementation is green.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI.
2. Treat Batches 1–6A as DONE / VERIFIED; do not redo them.
3. Batch 7A is ACTIVE; routed code-head under verification is `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`.
4. Resolve Frontend `34775882723`, Admin AI `34775882751`, Combined `34775882734`, Stage13G `34775882780` first; do not create a parallel mutation while any is active.
5. If all become SUCCESS and no newer code supersedes the checkpoint, relocate the real `ContentIngestionWorkspace` implementation under `apps/admin-web/src/admin/content/`, adjusting only relative imports required by the move.
6. Preserve behavior, contracts, server/PostgreSQL authority, Student isolation and test strength.
7. Run exact-head parity after relocation. Keep a root compatibility seam if any caller still needs it.
8. Remove the root seam only after relocated parity is green, then run exact-head parity again.
9. After Batch 7A is fully verified, perform a fresh AR-09 inventory; AR-10 remains blocked until AR-09 is formally DONE / VERIFIED.
10. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Batch 7A routed through Content feature owner, exact-head parity running |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
