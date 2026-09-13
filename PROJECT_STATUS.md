# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked this run:** `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`.  
**Latest fully verified AR-09 code-head before Batch 7A relocation:** `2a958723d434e10755d35299ba509f69fc411bb3`.  
**Current Batch 7A relocated implementation code-head under verification:** `4def323146e132bb7f75887f2aa96b6ee92b2447`.  
**Current stage:** AR-09 Cleanup / architecture enforcement — ACTIVE.

## Super Admin stage ledger

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED. Final checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — Question Bank — DONE / VERIFIED. Final code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — Quiz Builder — DONE / VERIFIED. Final code-head `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — Students + Access Codes — DONE / VERIFIED. Final code-head `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — Cleanup / architecture enforcement — **ACTIVE**.
  - Batch 1 — Quiz metadata ownership relocation — VERIFIED.
  - Batch 2 — Lesson authoring tools ownership relocation — VERIFIED.
  - Batch 3 — Access-code reports ownership relocation — VERIFIED.
  - Batch 4A — AI review ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`.
  - Batch 5A — Curriculum ownership relocation + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`.
  - Batch 6A — Content review ownership relocation + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`.
  - Batch 7A — Content ingestion ownership relocation — **ACTIVE; real implementation relocated under `admin/content/`, compatibility seam retained, exact-head parity running**.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 7A — current checkpoint

### State reconciled before mutation

This run re-fetched live `main`, branch HEAD, all three continuity files, recent branch state, Draft PR #52 and the inherited CI before changing code.

- live `main` = `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` (Student workstream documentation; not touched by Admin work);
- inherited Admin branch/documentation HEAD = `52a26e65a0a2351d961cfdbab82fd77eb6b6c3d0`;
- Draft PR #52 remained open, Draft and unmerged;
- routed code-head `2a687d2b5939fa0b969999ba0ca02d07491ed2c0` had Frontend `34775882723` and Admin AI `34775882751` SUCCESS; its Combined `34775882734` was cancelled only because a newer documentation checkpoint superseded it;
- documentation HEAD `52a26e65...`, carrying the same routed production code, completed Admin AI `34775980922`, Combined `34775980920`, Stage13G `34775980894` — all SUCCESS.

Therefore the inherited routed-parity blocker was resolved before the implementation move.

### Classification retained

- **KEEP:** current ingestion behavior, validation, lifecycle/history/detail, linking/publication semantics, session handling, API/PostgreSQL authority and existing tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** route ownership already proven; real implementation now moved under the Content owner with behavior-preserving relative-import adjustments.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after relocated exact-head parity is green and no caller requires it.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Code changed in this run

1. `73cc37c8d95bd63d0a0f0be2d90ff5c9b991d357` — `refactor(admin): relocate content ingestion owner`
   - created `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`;
   - copied the existing implementation without behavioral changes;
   - adjusted only relative imports to existing `admin-api`, `content-ingestion-api` and `LessonPublicationPanel` owners.
2. `699c7b215b2f97229f9235a3bc3a3357e7168f7d` — `refactor(admin): point content page at feature owner`
   - `ContentIngestionPage` now imports the local Content-owned implementation.
3. `4def323146e132bb7f75887f2aa96b6ee92b2447` — `refactor(admin): retain content ingestion compatibility seam`
   - reduced root `apps/admin-web/src/ContentIngestionWorkspace.tsx` to a compatibility re-export only;
   - no root deletion yet.

No backend, migration, API-contract, auth/security, Student or test file changed.

### Exact-head parity status

On relocated implementation code-head `4def323146e132bb7f75887f2aa96b6ee92b2447` the full matrix started:

- Frontend `34777260925` — IN PROGRESS at checkpoint;
- Admin AI `34777260918` — IN PROGRESS at checkpoint;
- Combined `34777260910` — IN PROGRESS at checkpoint;
- Stage13G `34777260890` — IN PROGRESS at checkpoint.

No failing gate was observed at checkpoint. Because relocated parity is still active, Batch 7A remains ACTIVE and the root compatibility seam must not be deleted yet.

## Current blocker / next step

The only blocker is active exact-head CI on `4def323146e132bb7f75887f2aa96b6ee92b2447`.

The next task A/B must first resolve runs `34777260925`, `34777260918`, `34777260910`, `34777260890` (or newer documentation-head equivalents carrying the same production code). While any relevant run is active, do not mutate code in parallel.

If the relocation matrix becomes fully green:
1. verify callers of root `ContentIngestionWorkspace.tsx`;
2. if no compatibility caller remains, delete only that root re-export seam;
3. run exact-head parity again;
4. only after the deletion head is green, mark Batch 7A DONE / VERIFIED;
5. perform a fresh AR-09 inventory. If no justified cleanup seam remains, run final AR-09 verification and close AR-09 before starting AR-10.

## Shared resume point for task A/B

1. Re-fetch live `main`, branch HEAD, these three continuity files, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–6A as DONE / VERIFIED; do not redo them.
3. Treat Batch 7A as ACTIVE; current relocated implementation code-head is `4def323146e132bb7f75887f2aa96b6ee92b2447`.
4. Resolve Frontend `34777260925`, Admin AI `34777260918`, Combined `34777260910`, Stage13G `34777260890` first.
5. Do not delete the root compatibility seam or start another batch while parity is active.
6. If all green, prove no caller requires the root seam, remove that seam only, and rerun exact-head parity.
7. Preserve server/PostgreSQL authority, Student isolation and current test strength.
8. AR-10 remains blocked until fresh inventory + final AR-09 verification formally close AR-09.
9. Keep PR #52 Draft; no merge or auto-merge.
