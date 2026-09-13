# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked:** `8d11cddb2cde510f233926d394434a384d480745`.  
**Latest fully verified AR-09 code-head:** `2a958723d434e10755d35299ba509f69fc411bb3`.  
**Current routed Batch 7A code-head under verification:** `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`.  
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
  - Batch 6A — Content review ownership relocation + root seam removal — DONE / VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`.
  - Batch 7A — Content ingestion ownership relocation — **ACTIVE; route now uses the Content-owned seam, exact-head parity running**.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### Inherited state resolved before mutation

This run re-fetched live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI before changing code.

- live `main` = `8d11cddb2cde510f233926d394434a384d480745`;
- inherited branch/documentation HEAD = `4bde0c9df9f3c70c16af27f6d0f7334d85537bee`;
- Draft PR #52 remained open, Draft and unmerged;
- inherited documentation-head gates were all green: Admin AI `34774426801`, Combined `34774426784`, Stage13G `34774426779` — SUCCESS;
- the previously documented seam code-head `d184ec9efaa17a89710cd9e9798c8972cd1236fb` had therefore been superseded by a green documentation checkpoint carrying the same production seam.

No ACTIVE/RUNNING inherited gate blocked the documented next step.

### Classification retained

- **KEEP:** current ingestion behavior, validation, lifecycle/history/detail, linking/publication semantics, session handling, API/PostgreSQL authority and existing tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** parity-first feature seam, routed ownership, then implementation relocation only after green evidence.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after routed parity becomes green.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Small routed ownership change

Commit `2a687d2b5939fa0b969999ba0ca02d07491ed2c0` — `refactor(admin): route content through feature owner` changed only `apps/admin-web/src/App.tsx`:

- replaced the app-root `ContentIngestionWorkspace` import with `admin/content/ContentIngestionPage`;
- `/app/content` now renders `ContentIngestionPage`;
- the Content-owned page still delegates to the unchanged root implementation;
- no implementation relocation or deletion was performed.

No backend, migration, API-contract, auth/security, Student or test file changed.

### Exact-head parity status

On routed code-head `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`, the following runs started:

- Frontend `34775882723` — IN PROGRESS at checkpoint;
- Admin AI `34775882751` — IN PROGRESS at checkpoint;
- Combined `34775882734` — QUEUED/ACTIVE at checkpoint;
- Stage13G `34775882780` — QUEUED/ACTIVE at checkpoint.

There is no known failing gate. Because routed exact-head parity is not yet fully green, Batch 7A remains ACTIVE and the real implementation/root seam must not move yet.

## Current blocker / next step

The only blocker is active exact-head CI for `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`.

The next task A/B must first resolve runs `34775882723`, `34775882751`, `34775882734` and `34775882780`. If all are SUCCESS and no newer code supersedes them, continue **the same Batch 7A only**: move the real `ContentIngestionWorkspace` implementation under `apps/admin-web/src/admin/content/` with behavior-preserving relative-import adjustments, keep a temporary compatibility seam if any caller still requires it, then run exact-head parity again. Remove the root seam only after executable parity proves the relocated implementation. Do not start AR-10.

## Shared resume point for task A/B

1. Re-fetch live `main`, branch HEAD, these three continuity files, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–6A as DONE / VERIFIED; do not redo them.
3. Treat Batch 7A as ACTIVE; routed code-head under verification is `2a687d2b5939fa0b969999ba0ca02d07491ed2c0`.
4. Resolve Frontend `34775882723`, Admin AI `34775882751`, Combined `34775882734`, Stage13G `34775882780` first.
5. While any run is active, do not start a parallel mutation.
6. If the matrix becomes fully green, relocate the real Content Ingestion implementation under `src/admin/content/` without changing behavior/contracts, then run parity again.
7. Delete the root compatibility seam only after relocated parity is green.
8. Preserve server/PostgreSQL authority, Student isolation and current test strength.
9. AR-10 remains blocked until a fresh AR-09 inventory finds no justified cleanup seams and AR-09 is formally DONE / VERIFIED.
10. Keep PR #52 Draft; no merge or auto-merge.
