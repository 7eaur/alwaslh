# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–6A VERIFIED; Batch 7A relocation parity VERIFIED and root Content Ingestion compatibility seam removed; deletion-head exact parity ACTIVE.**

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
- AR-09 — **ACTIVE**. Batches 1, 2, 3, 4A, 5A and 6A VERIFIED; Batch 7A ACTIVE at deletion-head parity.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review route + implementation ownership relocation and root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### Intake state from task A / previous checkpoint

The previous checkpoint left the real Content Ingestion implementation relocated under `apps/admin-web/src/admin/content/`, with the root `apps/admin-web/src/ContentIngestionWorkspace.tsx` retained only as a compatibility re-export pending executable parity. The documented relocated code-head was `4def323146e132bb7f75887f2aa96b6ee92b2447` and the explicit next step was: close exact-head parity first, prove the root re-export has no caller, then delete only that seam.

### Source-of-truth refresh before mutation

This run explicitly refreshed, before any code change:

1. live `main` = `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`;
2. Admin branch HEAD = `7ed738b7e42d3c5fc022cf3757a7877a66291dfa`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
6. recent branch state and Draft PR #52;
7. exact-head GitHub Actions.

The live-main change is Student workstream documentation and was treated as out of Admin scope.

### Relocation parity resolved

Fresh exact-head evidence on inherited HEAD `7ed738b7e42d3c5fc022cf3757a7877a66291dfa`, which carries the same production code as the relocation checkpoint, showed:

- Admin AI `34777365375` — SUCCESS;
- Combined `34777365376` — SUCCESS;
- Stage13G `34777365395` — SUCCESS.

Thus the inherited relocation-parity blocker was fully closed before further mutation. Earlier code-head cancellations were supersession effects from newer documentation commits, not assertion failures.

### Caller and ownership verification

The branch files and PR patch were inspected before deletion:

- `apps/admin-web/src/admin/content/ContentIngestionPage.tsx` imports `./ContentIngestionWorkspace`;
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` contains the real implementation;
- `apps/admin-web/src/App.tsx` imports `ContentIngestionPage` from `./admin/content/ContentIngestionPage` and no longer imports the root workspace;
- the root `apps/admin-web/src/ContentIngestionWorkspace.tsx` consisted only of `export { ContentIngestionWorkspace } from "./admin/content/ContentIngestionWorkspace";`;
- PR #52 patch confirms the legacy direct root import was removed from the routed App path and the root implementation had already been reduced to the re-export.

No remaining compatibility caller was identified in the branch-owned route/caller surface, so the root seam was justified for removal under AD-ADMIN-029.

### Classification and decision

- **KEEP:** current ingestion behavior, JPG/PNG/WebP/PDF validation, 50 MB image / 100 MB PDF / 100-file limits, ordered upload, history/detail state, process/link/archive/publication semantics, missing-session handling, API/PostgreSQL authority and tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** real implementation relocation already complete.
- **REBUILD:** none.
- **REMOVE:** obsolete root compatibility re-export — executed now.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream, test fixtures and test strength.

Root cause was architecture ownership, not a business-rule defect.

### Code mutation performed

#### Commit `7b4106f82ab6f1c152ac20caf11c70779224acde`
`refactor(admin): remove content ingestion root seam`

Deleted only:
- `apps/admin-web/src/ContentIngestionWorkspace.tsx`

No production behavior was intentionally changed. No backend, migration, API-contract, Student, security or test file was modified.

### Verification after mutation

The deletion commit immediately triggered exact-head verification. At the documentation checkpoint, the first observed run was:

- Combined `34778944934` — QUEUED.

The remaining branch workflows had not all appeared in the first run listing yet. No failing gate was observed.

Per the workstream gate rule, no additional cleanup seam, fresh AR-09 batch, AR-10 work, merge or test weakening was started while deletion-head CI is active.

### Phase status

AR-09 Batch 7A remains **ACTIVE / ROOT SEAM REMOVED / DELETION-HEAD PARITY PENDING**.

It must not be marked DONE / VERIFIED until the full exact-head matrix for `7b4106f82ab6f1c152ac20caf11c70779224acde` or a newer documentation-head equivalent carrying identical production code is green.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–6A as DONE / VERIFIED; do not redo them.
3. Treat Batch 7A as ACTIVE at deletion-head parity.
4. Relocation-equivalent green evidence is HEAD `7ed738b7e42d3c5fc022cf3757a7877a66291dfa`: Admin AI `34777365375`, Combined `34777365376`, Stage13G `34777365395` — SUCCESS.
5. Current production code-head is `7b4106f82ab6f1c152ac20caf11c70779224acde`; root `ContentIngestionWorkspace.tsx` has been deleted.
6. Resolve the full deletion-head matrix first; first observed run is Combined `34778944934` — QUEUED at checkpoint.
7. While any relevant exact-head run is active, do not mutate code in parallel.
8. If fully green, mark Batch 7A DONE / VERIFIED and perform a fresh AR-09 inventory.
9. If inventory finds no justified seam, run final AR-09 verification and formally close AR-09 before AR-10.
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
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Content Ingestion root seam removed, exact-head deletion parity pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
