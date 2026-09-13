# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–6A VERIFIED; Batch 7A ACTIVE with the real Content Ingestion implementation relocated under its Content owner and exact-head parity running.**

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
- Batch 6A — Content review route + implementation ownership relocation and root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### 1. Source-of-truth refresh performed before mutation

This run did not rely on chat memory. It explicitly refreshed and read:

1. live `main` = `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`;
2. branch HEAD at intake = `52a26e65a0a2351d961cfdbab82fd77eb6b6c3d0`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
6. Draft PR #52, which remained open, Draft and unmerged;
7. exact-head GitHub Actions for the inherited routed parity.

The live-main advance belongs to the Student workstream (`docs(product): set STUDENT-016I active batch`) and was treated as out of Admin scope.

### 2. Inherited CI blocker resolved before code work

The continuity docs said routed code-head `2a687d2b5939fa0b969999ba0ca02d07491ed2c0` was waiting on:
- Frontend `34775882723`;
- Admin AI `34775882751`;
- Combined `34775882734`;
- Stage13G `34775882780`.

Fresh CI inspection showed:
- Frontend `34775882723` — SUCCESS;
- Admin AI `34775882751` — SUCCESS;
- Combined `34775882734` — CANCELLED because newer documentation commit `52a26e65...` superseded it, not because of an assertion/test failure.

The newer documentation HEAD carried the same routed production code and completed:
- Admin AI `34775980922` — SUCCESS;
- Combined `34775980920` — SUCCESS;
- Stage13G `34775980894` — SUCCESS.

Therefore the routed-parity blocker was closed before any new mutation.

### 3. Contracts and callers inspected before relocation

The real implementation at `apps/admin-web/src/ContentIngestionWorkspace.tsx` was read before moving it. Its current contracts were retained:

- file validation remains JPG/PNG/WebP/PDF;
- image limit remains 50 MB, PDF limit 100 MB, maximum 100 files/task;
- ordered upload behavior remains unchanged;
- curriculum/history/task state remains server-backed;
- processing, linking, archive and lesson publication flows remain unchanged;
- missing-session handling remains unchanged;
- API/PostgreSQL remain canonical authority.

`apps/admin-web/src/admin/content/ContentIngestionPage.tsx` was also inspected and was still a feature-owned adapter delegating to the root implementation. The feature folder does not currently own `LessonPublicationPanel`; that separate ownership question was intentionally not expanded into this batch.

### 4. Classification and decision

- **KEEP:** all ingestion behavior, server contracts, publication semantics, error/session handling and tests.
- **IMPROVE:** implementation ownership under the established Content feature.
- **REFACTOR:** behavior-preserving file relocation with only relative-import adjustments.
- **REBUILD:** none.
- **REMOVE:** root compatibility re-export only after relocated exact-head parity is green and caller inventory proves it unnecessary.

Root cause remains architecture ownership, not a business-rule defect.

### 5. Code mutations performed

#### Commit `73cc37c8d95bd63d0a0f0be2d90ff5c9b991d357`
`refactor(admin): relocate content ingestion owner`

Created:
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`

The existing implementation was copied without behavioral edits. Required relative imports changed only from root-relative local paths to:
- `../../admin-api`;
- `../../content-ingestion-api`;
- `../../LessonPublicationPanel`.

#### Commit `699c7b215b2f97229f9235a3bc3a3357e7168f7d`
`refactor(admin): point content page at feature owner`

Changed:
- `apps/admin-web/src/admin/content/ContentIngestionPage.tsx`

The feature page now imports `./ContentIngestionWorkspace` directly, so `/app/content` resolves to the implementation owned by `admin/content/`.

#### Commit `4def323146e132bb7f75887f2aa96b6ee92b2447`
`refactor(admin): retain content ingestion compatibility seam`

Changed:
- `apps/admin-web/src/ContentIngestionWorkspace.tsx`

The former root implementation was reduced to:
`export { ContentIngestionWorkspace } from "./admin/content/ContentIngestionWorkspace";`

This intentionally preserves compatibility until executable parity and caller inventory justify deletion.

No backend, migration, API-contract, auth/security, Student or test files were changed. Test strength was not reduced.

### 6. Exact-head verification status

Exact relocated implementation code-head: `4def323146e132bb7f75887f2aa96b6ee92b2447`.

Runs started:
- Frontend `34777260925` — IN PROGRESS at checkpoint;
- Admin AI `34777260918` — IN PROGRESS at checkpoint;
- Combined `34777260910` — IN PROGRESS at checkpoint;
- Stage13G `34777260890` — IN PROGRESS at checkpoint.

No failure was observed before documentation. Because this matrix is still active, the run deliberately did not delete the root compatibility seam, did not start a new AR-09 batch, and did not start AR-10.

### 7. Phase status

AR-09 Batch 7A remains **ACTIVE / RELOCATED PARITY PENDING**. It is not COMPLETE and cannot be marked VERIFIED until exact-head green evidence exists for the relocated implementation and, if the root seam is removed, for the deletion head as well.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI.
2. Treat Batches 1–6A as DONE / VERIFIED; do not redo them.
3. Batch 7A remains ACTIVE; relocated code-head is `4def323146e132bb7f75887f2aa96b6ee92b2447`.
4. Resolve Frontend `34777260925`, Admin AI `34777260918`, Combined `34777260910`, Stage13G `34777260890` first (or newer documentation-head equivalents carrying identical production code).
5. While relevant CI is active, do not mutate code in parallel.
6. If fully green, verify every branch caller of the root `apps/admin-web/src/ContentIngestionWorkspace.tsx` compatibility re-export.
7. If no caller remains, delete only that root seam and run the full exact-head matrix again.
8. Do not mark Batch 7A VERIFIED until that final code-head is green.
9. After Batch 7A verification, perform fresh AR-09 inventory; if no justified seam remains, run final AR-09 verification and formally close AR-09.
10. AR-10 remains blocked until AR-09 closure. Preserve Student isolation and server/PostgreSQL authority.
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
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Content Ingestion implementation relocated, exact-head parity running |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
