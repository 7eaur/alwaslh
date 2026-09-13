# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no merge or auto-merge authorized.  
**Live main checked this run:** `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — parallel Student workstream; untouched.  
**Current stage:** AR-09 Cleanup / architecture enforcement — ACTIVE.  
**Current production code-head:** `24b066cbfa846fc789da01929f495bdc267d96c0`.

## Super Admin stage ledger

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED.
- AR-06 — Question Bank — DONE / VERIFIED.
- AR-07 — Quiz Builder — DONE / VERIFIED.
- AR-08 — Students + Access Codes — DONE / VERIFIED.
- AR-09 — Cleanup / architecture enforcement — **ACTIVE**.
  - Batch 1 — Quiz metadata ownership relocation — VERIFIED.
  - Batch 2 — Lesson authoring tools ownership relocation — VERIFIED.
  - Batch 3 — Access-code reports ownership relocation — VERIFIED.
  - Batch 4A — AI review page ownership relocation — VERIFIED.
  - Batch 5A — Curriculum ownership + root seam removal — VERIFIED.
  - Batch 6A — Content review ownership + root seam removal — VERIFIED.
  - Batch 7A — Content ingestion ownership + root seam removal — VERIFIED.
  - Batch 8A — Lesson Publication ownership + root seam removal — **DONE / VERIFIED**.
  - Batch 9A — AI review presentation ownership — **ACTIVE / ADAPTER CREATED / CALLER SWITCH PENDING**.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## Batch 8A closure verified this run

Before mutation, live `main`, branch HEAD `998ab1efa5ede52cead73b075d890542e1d5adba`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, recent commits, Draft PR #52 and exact-head CI were re-read.

The seam-removal production code-head `3ad8750b65e357e13b99529d59a751172be9e26b` had executable runs cancelled only because required documentation descendants advanced the branch. The latest descendant `998ab1efa5ede52cead73b075d890542e1d5adba` carries the identical production tree and completed:
- Admin AI `34783495895` — SUCCESS;
- Combined `34783495898` — SUCCESS;
- Stage13G `34783495896` — SUCCESS.

The earlier caller-switch Frontend gate was already SUCCESS and no code failure was observed. Batch 8A is therefore **DONE / VERIFIED**.

## Fresh AR-09 inventory and decision

Fresh inventory inspected `App.tsx`, root `src` surfaces, `src/admin/*` owners, `admin/reviews/AiOperationsPage.tsx`, and `AiReviewWorkspace.tsx`.

Evidence found a justified established-owner seam:
- `/app/reviews/ai` is owned by `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx`;
- that feature page still imports `AiReviewWorkspace` from root `apps/admin-web/src/AiReviewWorkspace.tsx`;
- therefore Reviews feature ownership is incomplete even though the route owner is already established.

Classification:
- **KEEP:** AI review behavior, polling, mutation/review/apply flows, API contracts, server/PostgreSQL authority, auth/session behavior and current tests.
- **IMPROVE:** dependency direction inside the established Reviews owner.
- **REFACTOR:** move the presentation dependency behind `src/admin/reviews/` parity-first.
- **REBUILD:** none.
- **REMOVE:** no root file yet; deletion is forbidden until caller-switch and relocation parity prove it safe.
- **NO CHANGE:** backend, migrations, API contracts, Student workstream and test strength.

## Code changed this run

Commit `24b066cbfa846fc789da01929f495bdc267d96c0` — `refactor(admin): add reviews ai workspace owner seam`

Added only:
- `apps/admin-web/src/admin/reviews/AiReviewWorkspace.tsx`

Current adapter content re-exports the existing root implementation. No route, behavior, API, backend, migration, Student code or test changed.

## Exact-head verification state

Fresh matrix on `24b066cbfa846fc789da01929f495bdc267d96c0` started immediately:
- Frontend `34784977628` — IN PROGRESS at checkpoint;
- Admin AI `34784977631` — IN PROGRESS at checkpoint;
- Combined `34784977632` — IN PROGRESS at checkpoint;
- Stage13G `34784977612` — IN PROGRESS at checkpoint.

Because this exact-head CI is active, no caller-switch or further production mutation is permitted in this run.

## Current blocker / explicit next step

The only blocker is completion of the Batch 9A adapter exact-head matrix above.

Next task A/B must:
1. re-fetch live `main`, current branch HEAD, all three continuity docs, recent commits, Draft PR #52 and exact-head CI;
2. resolve `34784977628`, `34784977631`, `34784977632`, `34784977612` first, or reconcile a later documentation descendant carrying the identical production tree if required continuity updates supersede them;
3. if green, switch `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` from `../../AiReviewWorkspace` to `./AiReviewWorkspace` only;
4. run exact-head parity for that caller switch before relocating the real implementation or deleting any root seam;
5. continue the same Batch 9A only after green parity; do not open another cleanup track;
6. keep AR-10 blocked until AR-09 is formally closed.

Preserve Student isolation, backend/PostgreSQL authority and test strength. Keep PR #52 Draft; no merge or auto-merge.
