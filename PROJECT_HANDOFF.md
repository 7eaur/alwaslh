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

AB-02 → AB-03 phase-boundary reconciliation found no Admin/API/PostgreSQL implementation overlap from live main. Shared top-level docs remain subject to deliberate final reconciliation.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — ACTIVE
  - AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.1.2 Operations frontend API ownership — IMPLEMENTED / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Last closed correction

AB-03.1.1 source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`.

- `apps/api/src/admin-operations/attention-application.ts` owns `loadOperationsAttention(...)`;
- HTTP owns admin authorization, query validation and application invocation only for that endpoint;
- API path/query bounds/response shape, SQL, migrations/schema and security behavior remained unchanged;
- dedicated application-owner test added;
- closure evidence: Guard `34859593842`, Admin AI `34860142887`, Combined `34860142983`, Stage13G `34860143008` — SUCCESS.

## Current implementation awaiting closure

AB-03.1.2 source checkpoint: `75cab6ca1067f5866a259ad079279757218e805f`.

Worker A sequence 36 moved only Operations frontend transport ownership:

- `apps/admin-web/src/features/operations/api/admin-operations-api.ts` now owns the existing Operations request functions and response/type contracts;
- `apps/admin-web/src/features/operations/public/index.ts` exposes the narrow feature contract;
- Overview, Operations Health, Audit, Diagnostics and Notifications now consume that public boundary;
- root `apps/admin-web/src/admin-operations-api.ts` was deleted;
- exported names, endpoints, query/body construction and session-expiry behavior were preserved;
- pages/models/styles/routes, backend/API, PostgreSQL/schema/migrations and Student frontend implementation were not changed.

Verification observed on source checkpoint:

- Architecture Guard `34866606170` — **SUCCESS**;
- Frontend Preparation `34866606173` — pending/not fully closed;
- Admin AI Operations `34866606148` — in progress/not fully closed;
- Combined Integration `34866606220` — pending/not fully closed;
- Stage13G Admin Operations `34866606179` — pending/not fully closed.

## Exact continuation

Do **verification/closure only** for AB-03.1.2:

1. inspect the source-head runs above; if documentation-only commits caused concurrency cancellation, use the newest source-tree-equivalent runs after confirming no executable source/test/migration/workflow drift from `75cab6ca...`;
2. require Architecture Guard, Admin quality, Combined Integration and Stage13G real API + PostgreSQL + Chromium evidence to be green;
3. if any real failure appears, fix only its root cause inside this ownership seam;
4. if all required gates are green, mark AB-03.1.2 DONE and perform a fresh discovery-only pass inside Overview + Operations;
5. do not start another ownership seam or Curriculum/Content/OCR before closure.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` remains `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; repeat reconciliation if live `main` gains overlapping Admin/API/PostgreSQL/shared-contract changes or at the next structural phase boundary.

## Remaining roadmap

Finish Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
