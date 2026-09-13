# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked:** `8d11cddb2cde510f233926d394434a384d480745`.  
**Latest fully verified AR-09 code-head:** `2a958723d434e10755d35299ba509f69fc411bb3`.  
**Current code-head under verification:** `d184ec9efaa17a89710cd9e9798c8972cd1236fb`.  
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
  - Batch 7A — Content ingestion ownership relocation — **ACTIVE; feature seam established, parity CI in progress**.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### State reconciled before mutation

This run refreshed live `main`, branch HEAD, all three continuity files, recent branch commits, Draft PR #52 and exact-head CI before touching code.

- live `main` = `8d11cddb2cde510f233926d394434a384d480745`;
- inherited branch/documentation HEAD = `c7230dd39ee0101b14d3df37a29c68e7c1631141`;
- Draft PR #52 remained open, Draft and unmerged;
- inherited exact-head documentation CI was fully green: Admin AI `34771856670`, Combined `34771856671`, Stage13G `34771856708` — SUCCESS.

Therefore there was no unresolved inherited ACTIVE/RUNNING batch blocking Batch 7A.

### Contracts and tests inspected

The run read the complete route owner and ingestion/publication boundaries before mutation:

- `apps/admin-web/src/App.tsx` — `/app/content` still imported app-root `ContentIngestionWorkspace` directly;
- `apps/admin-web/src/ContentIngestionWorkspace.tsx` — real route-specific orchestration for curriculum lookup, durable ingestion history/task state, upload validation, create/upload/process/link/archive actions and lesson-publication composition;
- `apps/admin-web/src/content-ingestion-api.ts` — server-backed `/v1/admin/content-ingestions` authority;
- `apps/admin-web/src/LessonPublicationPanel.tsx` — server-backed lesson-content review/publication transitions;
- `apps/admin-web/e2e/content-ingestion.e2e.spec.mjs` — real Chromium proof for ordered mixed-file upload, processing, linking, review, publication, reload durability, archive visibility and 390px no-overflow.

Classification remains:
- **KEEP:** behavior, validation, lifecycle, history/detail, linking/publication, session handling, server/PostgreSQL authority and existing tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** parity-first feature seam then route/implementation ownership only after green evidence.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after exact-head parity.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Small code batch started

Commit `d184ec9efaa17a89710cd9e9798c8972cd1236fb` — `refactor(admin): add content ingestion feature seam` added only:

- `apps/admin-web/src/admin/content/ContentIngestionPage.tsx`

The new Content-owned page delegates to the existing root implementation. No route switch, implementation move, root deletion, API change, backend change, migration, Student change or test weakening was made. This deliberately creates the smallest parity seam first.

Exact-head CI on `d184ec9efaa17a89710cd9e9798c8972cd1236fb` at this checkpoint:
- Frontend `34774259547` / job `103769340092` — SUCCESS; lint, strict typecheck, unit tests and build green.
- Admin AI `34774259574` / job `103769340020` — SUCCESS; clean PostgreSQL migrations/contracts and auth regressions green.
- Combined `34774259560` / job `103769340292` — IN PROGRESS; API/Admin quality, clean migrations and backend authority steps already green, wider regressions/browser phase not yet complete.
- Stage13G `34774259581` — IN PROGRESS; Admin UI quality job `103769340158` and backend job `103769340279` are SUCCESS, Real API + PostgreSQL + Chromium job `103769483722` is still IN PROGRESS.

## Current blocker / next step

There is no failing gate, but exact-head parity is still **ACTIVE/RUNNING** for the new feature seam. Therefore no route switch or implementation relocation may start yet.

The next task A/B must first re-fetch branch HEAD and resolve Combined `34774259560` and Stage13G `34774259581` on exact head `d184ec9efaa17a89710cd9e9798c8972cd1236fb`. If both become SUCCESS and no newer code supersedes the checkpoint, switch `/app/content` to `ContentIngestionPage` as the next small change and run exact-head parity again. Do not relocate/delete `ContentIngestionWorkspace.tsx` until that routed parity is green. AR-10 remains forbidden until AR-09 is formally DONE / VERIFIED.

## Shared resume point for task A/B

1. Re-fetch live `main`, branch HEAD, these three continuity files, Draft PR #52 and exact-head CI.
2. Treat Batches 1–6A as DONE / VERIFIED; do not redo them.
3. Treat Batch 7A as ACTIVE on code-head `d184ec9efaa17a89710cd9e9798c8972cd1236fb`.
4. First resolve Combined `34774259560` and Stage13G `34774259581`; do not start parallel code while either is running.
5. If the exact-head matrix becomes fully green, route `/app/content` through `apps/admin-web/src/admin/content/ContentIngestionPage.tsx` only, then run parity again.
6. Keep the root implementation as compatibility seam until routed parity is green; only then consider relocating the real implementation/removing the root seam.
7. Preserve server/PostgreSQL authority, Student isolation and current test strength.
8. Keep PR #52 Draft; no merge or auto-merge.
