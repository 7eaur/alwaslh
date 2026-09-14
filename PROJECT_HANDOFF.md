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
  - AB-03.1.2 Operations frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest closed increment

AB-03.1.2 corrected Operations frontend API ownership. Corrected source checkpoint: `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.

Final state:

- Operations transport/types live at `apps/admin-web/src/features/operations/api/admin-operations-api.ts`;
- consumers use the narrow `features/operations/public` boundary;
- stale root imports/tests were removed/corrected;
- transport test is colocated with its actual owner;
- endpoint/query/body/response contracts, credentials/session behavior, pages/routes/styles, backend/API/PostgreSQL/security authority and Student frontend behavior were preserved.

The source checkpoint through verification head `302b86585d4e1eb122c5afe30503828e10c8d025` changed only canonical docs/state, proving no executable source/test/migration/workflow drift.

Closure evidence:

- Architecture Guard `34870253383` — **SUCCESS**;
- Frontend Preparation `34870253413` — **SUCCESS**;
- Admin AI Operations `34870253417` — **SUCCESS**;
- Combined Integration `34870253434` — **SUCCESS**;
- Stage13G Admin Operations `34870253431` — **SUCCESS**, including Admin/API quality, clean PostgreSQL/contracts, security/auth/integration regressions and real API + PostgreSQL + Chromium.

Worker C sequence 38 performed verification/closure only; it made no executable production/test/migration/workflow mutation and opened no new seam.

## Exact continuation

Perform **one discovery-only pass inside AB-03.1 Overview + Operations**:

1. inspect operator jobs and the current PostgreSQL/API/security/audit contracts;
2. inspect current backend/frontend owners plus integration/Chromium evidence;
3. decide whether exactly one smallest high-confidence end-to-end correction remains;
4. if one is justified, document its owner/boundary and verification contract before mutation;
5. if none is justified, prepare AB-03.1 closure/advance rather than inventing a seam;
6. do not begin Curriculum/Content/OCR in the same increment.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` latest observation remains `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; repeat reconciliation if live `main` gains overlapping Admin/API/PostgreSQL/shared-contract changes or at the next structural phase boundary.

## Remaining roadmap

Finish Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.