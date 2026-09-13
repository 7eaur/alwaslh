# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no merge or auto-merge authorized.  
**Live main checked this run:** `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — parallel Student workstream; untouched.  
**Current stage:** AR-09 Cleanup / architecture enforcement — ACTIVE.  
**Current Batch 8A production code-head:** `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4`.

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
  - Batch 4A — AI review ownership relocation — VERIFIED.
  - Batch 5A — Curriculum ownership + root seam removal — VERIFIED.
  - Batch 6A — Content review ownership + root seam removal — VERIFIED.
  - Batch 7A — Content ingestion ownership + root seam removal — VERIFIED.
  - Batch 8A — Lesson Publication ownership relocation — **ACTIVE / CALLER SWITCHED / EXACT-HEAD PARITY RUNNING**.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## Batch 8A reconciliation in this run

The inherited documentation HEAD was `0550ab688dc8909d3690a3dce54173d58f5d6aa2`. Before mutation, live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI were re-read.

The inherited first relocation parity is now green on `0550ab688dc8909d3690a3dce54173d58f5d6aa2`:
- Admin AI `34780605238` — SUCCESS;
- Combined `34780605257` — SUCCESS;
- Stage13G `34780605241` — SUCCESS, including Real API + PostgreSQL + Chromium.

Caller proof then showed:
- root `apps/admin-web/src/LessonPublicationPanel.tsx` is only a compatibility re-export to `./admin/content/LessonPublicationPanel`;
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` was still importing that root seam;
- the real implementation already belongs to Content.

Classification remains:
- **KEEP:** publication lifecycle, confirmation, review-blocking, session handling, server/PostgreSQL authority and current tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** callers use the Content-owned implementation directly.
- **REBUILD:** none.
- **REMOVE:** root compatibility re-export only after caller-switch parity is green.
- **NO CHANGE:** backend, migrations, API contract, auth/security, Student workstream and test strength.

## Code changed this run

Commit `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4` — `refactor(admin): use content-owned lesson publication panel`

Changed only:
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`

The import changed from root compatibility path `../../LessonPublicationPanel` to local Content owner `./LessonPublicationPanel`. Behavior and contracts were not changed. The root compatibility file remains intentionally present while parity runs.

## Exact-head verification state

For production code-head `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4`:
- Frontend `34782291937` — IN PROGRESS at checkpoint;
- Admin AI `34782291934` — IN PROGRESS at checkpoint;
- Combined `34782291938` — IN PROGRESS at checkpoint;
- Stage13G `34782291927` — IN PROGRESS at checkpoint.

No failure was observed. Because exact-head parity is active, Batch 8A is not COMPLETE and no further production mutation is permitted in this run.

## Current blocker / explicit next step

The only blocker is completion of the caller-switch exact-head matrix above.

Next task A/B must:
1. re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI;
2. resolve `34782291937`, `34782291934`, `34782291938`, `34782291927` first;
3. if all are green, re-prove there are no remaining legitimate callers of root `apps/admin-web/src/LessonPublicationPanel.tsx`;
4. delete that root compatibility re-export only then;
5. run and close a new exact-head matrix after deletion before marking Batch 8A DONE / VERIFIED;
6. after Batch 8A closes, perform a fresh AR-09 inventory; close AR-09 only if no justified established-owner seam remains and final AR-09 gates are green;
7. begin AR-10 only after formal AR-09 closure.

Preserve Student isolation, backend/PostgreSQL authority and test strength. Keep PR #52 Draft; no merge or auto-merge.
