# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, code/tests and exact-head Actions;
6. confirm no active worker collision;
7. compare live `main` at structural phase boundaries or when overlapping scoped changes appear.

Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned here: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification.

Excluded only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main` latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — ACTIVE
  - AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.1.2 Operations frontend API ownership — ROOT FIX APPLIED / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Current implementation awaiting closure

Current AB-03.1.2 source checkpoint: `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.

Worker A sequence 36 moved Operations frontend transport/types under `features/operations` and exposed the narrow `features/operations/public` boundary. Worker B sequence 37 then inspected the failed Stage13G Admin UI job and confirmed a real strict-typecheck regression rather than CI concurrency noise: three consumers/tests still referenced the deleted root `admin-operations-api` module.

Worker B corrected exactly that root ownership defect:

- `admin/operations/operations-model.ts` now consumes Operations contracts through `features/operations/public`;
- `admin/operations/operations-model.test.ts` uses the same public feature boundary;
- the API transport test now lives with its owner at `features/operations/api/admin-operations-api.test.ts`;
- the stale root `admin-operations-api.test.ts` was removed;
- endpoints, query/body/response contracts, credentials/session-expiry behavior, pages/routes/styles, backend/API/PostgreSQL/security and Student frontend behavior were not changed.

Exact source-head evidence at handoff:

- Architecture Guard `34868596586` — **SUCCESS**;
- Frontend Preparation `34868596646` — **SUCCESS**;
- Admin AI Operations `34868596701` — **SUCCESS**;
- Combined Integration `34868596865` — **IN PROGRESS** at last observation;
- Stage13G Admin Operations `34868596682` — **IN PROGRESS** at last observation.

## Exact continuation

Do **verification/closure only** for AB-03.1.2:

1. inspect Combined `34868596865` and Stage13G `34868596682`; if documentation-only commits supersede/cancel them, use the newest source-tree-equivalent runs only after proving no executable source/test/migration/workflow drift from `abe4f2c...`;
2. require Combined Integration green plus Stage13G Admin/API quality, clean PostgreSQL/contracts, relevant regression suites and real API + PostgreSQL + Chromium green;
3. fix only a genuine root regression inside this same seam if one appears;
4. when all required evidence is green, mark AB-03.1.2 DONE and only then perform a fresh discovery-only pass inside Overview + Operations;
5. do not start another ownership seam or Curriculum/Content/OCR before closure.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` latest observation remains `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; repeat reconciliation if live `main` gains overlapping Admin/API/PostgreSQL/shared-contract changes or at the next structural phase boundary.

## Remaining roadmap

Finish Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.