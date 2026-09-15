# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-15**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Confirm repo/branch and live branch + `main` HEAD; read shared execution state, status, engineering log, this handoff, autonomous protocol and active AB-03 record; inspect code/tests/CI; confirm no active-worker collision. Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification. Excluded only: structural/design implementation of `apps/student-web` frontend.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`;
- main reconciliation: `REQUIRED / DEFERRED` because main contains authoritative offline-content API/PostgreSQL changes. Reconcile before overlapping backend/database mutation and before AB-08 final verification.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — ACTIVE
  - AB-03.2.1 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.2 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.3 — DONE / EXACT-HEAD VERIFIED
  - AB-03.2.4 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.5 — DONE / EXACT-HEAD VERIFIED
  - AB-03.2.6 same-slice direct-owner consumption — IMPLEMENTED / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

## Latest result

AB-03.2.5 was fixed safely and closed at exact source checkpoint `7f4a07ebd138106e1c7701bc9820bf978c233643`: `ContentIngestionWorkspace.tsx` now consumes `features/content/public`, the obsolete root `content-ingestion-api.ts` facade was deleted, and exact-head Architecture Guard, Frontend Preparation, Admin AI, Combined Integration, Stage13G/PostgreSQL/security and real Chromium all passed.

Worker A then used the same Curriculum/Content/OCR ownership context for one adjacent cleanup batch. Current executable/source checkpoint is `2dd1ca2a94f03b8299bc2f8759f634c56fc10f78`; compared with the last green checkpoint, only six files changed and all changes are import-boundary ownership corrections. No UI behavior, endpoint, payload, PostgreSQL, security or Student frontend implementation changed.

Current exact-head CI for `2dd1ca2...`:

- Architecture Guard `34963907236` — SUCCESS;
- Frontend Preparation `34963907292` — SUCCESS;
- Admin AI `34963907259` — PENDING at handoff;
- Combined Integration `34963907267` — IN PROGRESS at handoff;
- Stage13G Admin Operations / PostgreSQL / Chromium `34963907247` — IN PROGRESS at handoff.

## Exact continuation

1. Fetch live branch/main and respect shared lease.
2. Check the exact-head runs above or their exact-source successors if GitHub superseded them.
3. If any gate fails, fix root cause only; do not weaken tests/security/validation.
4. If all gates become green, perform fresh AB-03.2 closure inspection before entering AI.
5. `ContentOperationsPage.tsx` still uses generic API/session helpers through `admin-api.ts`, while Content/OCR transport already comes from `features/content/public`. Treat this as a possible compatibility cleanup, not as evidence of split Content implementation ownership. Change it only via a mechanically safe patch; do not rebuild the large file merely to remove one import.
6. Close AB-03.2 only when exact-head evidence and closure inspection support it; then begin the next canonical slice, AI Jobs/Review/authoring, in a separate coherent batch.

## Remaining roadmap

Finish AB-03.2 verification/closure → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
