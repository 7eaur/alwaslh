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
  - AB-03.1.2 Operations frontend API ownership — DISCOVERED / NEXT
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Last closed correction

AB-03.1.1 source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`.

- `apps/api/src/admin-operations/attention-application.ts` owns `loadOperationsAttention(...)`;
- HTTP owns admin authorization, query validation and application invocation only for that endpoint;
- API path/query bounds/response shape, SQL, migrations/schema and security behavior remained unchanged;
- dedicated application-owner test added;
- closure evidence: Guard `34859593842`, Admin AI `34860142887`, Combined `34860142983`, Stage13G `34860143008` — SUCCESS.

## Discovery just completed

Worker C sequence 35 inspected live Overview/Operations frontend ownership and selected exactly one smallest next correction.

`apps/admin-web/src/admin-operations-api.ts` is still a root transitional owner for Operations-specific transport and response contracts. It serves the Overview and Operations pages, while the repository's permanent architecture requires feature-owned API adapters exposed through narrow public boundaries. Moving all legacy pages/models/styles simultaneously would be broader than necessary.

## Exact continuation

Implement **AB-03.1.2 Operations frontend API ownership only**:

1. create the Operations feature API owner under `apps/admin-web/src/features/operations/api/`;
2. move the current `admin-operations-api.ts` transport/types there without changing behavior or exported names;
3. expose only required functions/types through `apps/admin-web/src/features/operations/public/index.ts`;
4. update current Overview/Operations consumers to import from the feature public boundary;
5. delete root `apps/admin-web/src/admin-operations-api.ts` once unused;
6. do not move pages, `operations-model`, CSS, route ownership, or UX in this increment;
7. do not alter API endpoints/query construction/payloads/session handling/backend/PostgreSQL/Student frontend.

Then verify Architecture Guard, Admin lint/typecheck/unit/build, focused Overview/Operations tests, Combined Integration and Stage13G real API + PostgreSQL + Chromium. If green, close AB-03.1.2 and return to a fresh discovery-only pass inside Overview + Operations. Do not begin Curriculum/Content/OCR in the same increment.

## Main reconciliation need

`NOT REQUIRED NOW`. Repeat if live `main` gains overlapping Admin/API/PostgreSQL/shared-contract changes or at the next structural phase boundary.

## Remaining roadmap

Finish Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
