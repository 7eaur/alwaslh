# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no merge or auto-merge authorized.  
**Live main checked this run:** `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — parallel Student workstream; untouched.  
**Current stage:** AR-09 Cleanup / architecture enforcement — ACTIVE.  
**Current production code-head:** `00b35eed478cd49da75784d61775ebb0f7b5df81`.

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
  - Batches 1–8A — DONE / VERIFIED.
  - Batch 9A — AI review presentation ownership — **ACTIVE / CALLER SWITCHED / EXACT-HEAD PARITY RUNNING**.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## This continuation

Before mutation, live `main`, branch HEAD `a62ca65d6430e68b076f5cebed3105d7f28df88a`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, recent commits, Draft PR #52 and CI were re-read.

The inherited Batch 9A adapter commit `24b066cbfa846fc789da01929f495bdc267d96c0` was reconciled first. Its Frontend run `34784977628` completed SUCCESS. Admin AI `34784977631` was cancelled by later required continuity commits, not by a test failure. The newest documentation descendant `a62ca65d6430e68b076f5cebed3105d7f28df88a` carries the same production adapter tree and completed its executable checks successfully, including Admin AI run `34785102555`, Combined run `34785102557`, and Stage13G run `34785102562`/real PostgreSQL+Chromium job `103799147288`.

Only after that reconciliation, the caller in `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` was changed from `../../AiReviewWorkspace` to `./AiReviewWorkspace` and nothing else.

Commit:
- `00b35eed478cd49da75784d61775ebb0f7b5df81` — `refactor(admin): route ai review through reviews owner`.

No backend, migrations, API contracts, auth/session behavior, Student workstream or tests changed.

## Exact-head verification state

Caller-switch exact-head workflows started on `00b35eed478cd49da75784d61775ebb0f7b5df81`:
- Admin AI `34786308544` — IN PROGRESS at checkpoint;
- Combined `34786308488` — IN PROGRESS at checkpoint;
- Stage13G `34786308533` — IN PROGRESS at checkpoint;
- Frontend quality is part of the same exact-head check suite and was still active at checkpoint.

No implementation relocation or root seam deletion is allowed until this caller-switch parity is green.

## Current blocker / explicit next step

The only blocker is completion of exact-head parity on `00b35eed478cd49da75784d61775ebb0f7b5df81`.

Next task A/B must:
1. re-fetch live `main`, branch HEAD, all three continuity docs, recent commits, Draft PR #52 and exact-head CI;
2. resolve the caller-switch matrix above first, reconciling a documentation descendant only if it carries the identical production tree;
3. if green, continue only Batch 9A: relocate the real `AiReviewWorkspace` implementation under `admin/reviews/` while preserving behavior/contracts and keeping the root file as a compatibility seam;
4. run exact-head parity before deleting the root seam;
5. after Batch 9A closes, run a fresh AR-09 inventory; if no justified established-owner seam remains, perform final AR-09 exact-head verification and close AR-09;
6. do not start AR-10 before formal AR-09 closure.

Preserve Student isolation, backend/PostgreSQL authority and test strength. Keep PR #52 Draft; no merge or auto-merge.
