# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, current code/tests/migrations and exact-head Actions;
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
- live `main` observed in Worker A sequence 14: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

## Execution governance

Workers A/B/C share one branch and roadmap in serial order. Shared state is `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. If another worker is active, do not mutate overlapping work. Each run performs one smallest coherent increment and leaves exact HEAD, CI evidence, next step and one of `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, `COMPLETE`.

## Architecture law

`use case → API/DB/security truth → current owner → target owner → replacement → verify outcome → switch/delete old owner → exact-head gates → document`

Backend remains one Fastify modular monolith over PostgreSQL. No microservices/DI/service-locator/interface ceremony without evidence. Admin app composes only; feature internals remain private. Never weaken tests/security/validation.

## Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 — DONE
- AB-01.2 — DONE
- AB-01.3 — DONE
- AB-01.4 — ACTIVE
  - CORS — DONE
  - Health/readiness — DONE
  - Public error/not-found — DONE
  - **Fastify construction/options — IMPLEMENTED / WAITING FOR REQUIRED CI**
- AB-01.5 — PENDING
- AB-01.6 — PENDING

## Current source implementation

Source HEAD: `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

Created owner:

`apps/api/src/app/create-fastify-instance.ts`

`createFastifyInstance(config)` now owns the Fastify constructor and exact existing options.

`apps/api/src/app.ts` now calls that owner and no longer imports Fastify as a value or contains those option literals.

Preserved exactly:

- logger silent/non-silent behavior;
- `disableRequestLogging: false`;
- `trustProxy: true`;
- `bodyLimit: 1_048_576`;
- `requestTimeout: 15_000`;
- one instance per `buildApp()`;
- service construction and all plugin/route/health/error/database-close ordering.

No service graph, business route, DB lifecycle, config default, migration/schema or Student frontend change occurred.

## Verification state

- Architecture Guard `34820842164` — **SUCCESS**.
- Combined Integration `34820842196` — **IN PROGRESS** at last handoff.
- Stage13G `34820842163` — **IN PROGRESS** at last handoff.
- Admin AI `34820842245` — **QUEUED** at last handoff.

## Exact next engineering step

1. Read live state and verify no newer worker has taken ownership.
2. Inspect runs `34820842196`, `34820842163`, `34820842245`.
3. If all required affected gates are green, mark the Fastify construction/options seam DONE in state/status/log/handoff.
4. Only after closure, perform discovery for the next smallest AB-01.4 seam; do not implement a fifth seam in the same closure batch.
5. If any gate fails, inspect the failing job/log and repair only the root cause of this extraction before advancing.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
