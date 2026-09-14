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
- live `main` observed in Worker B sequence 15: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

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
  - Fastify construction/options — **DONE**
  - Fifth seam — **DISCOVERY NEXT / NOT SELECTED**
- AB-01.5 — PENDING
- AB-01.6 — PENDING

## Closed fourth seam

Source implementation HEAD: `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

Owner:

`apps/api/src/app/create-fastify-instance.ts`

`createFastifyInstance(config)` owns Fastify construction/options; `apps/api/src/app.ts` delegates to it and no longer owns those option literals.

Preserved exactly:

- logger silent/non-silent behavior;
- `disableRequestLogging: false`;
- `trustProxy: true`;
- `bodyLimit: 1_048_576`;
- `requestTimeout: 15_000`;
- one instance per `buildApp()`;
- service construction and all plugin/route/health/error/database-close ordering.

No service graph, business route, DB lifecycle, config default, migration/schema or Student frontend change occurred.

## Closure verification

- Architecture Guard `34820842164` — SUCCESS on source implementation HEAD.
- Compare from source implementation HEAD to verification HEAD `248ce58053bca9d97498d41fdda57aec1ace4033` changed only five canonical documentation files.
- Admin AI `34821032274` — SUCCESS.
- Combined Integration `34821032272` — SUCCESS including clean PostgreSQL, backend/auth regressions and real Admin Chromium.
- Stage13G `34821032271` — SUCCESS including Admin/API quality, clean PostgreSQL, integration/auth regressions and real API + PostgreSQL + Chromium.

The original source-head runs were cancelled by later documentation commits, not by a demonstrated code failure. The source-tree-equivalent later runs provide the required runtime/integration closure evidence.

## Exact next engineering step

Perform **only discovery for the fifth AB-01.4 composition seam**:

1. re-read live `apps/api/src/app.ts` and current branch HEAD;
2. inspect current tests/contracts around the remaining composition responsibilities;
3. choose the smallest evidence-backed remaining boundary from infrastructure/service construction, cross-service composition, route registration, or database `onClose` lifecycle;
4. document current owner, target owner, exact preserved contracts/order, explicit non-goals, switch/deletion condition and required gates;
5. do **not** implement the fifth seam in the same discovery run.

If evidence says no further small AB-01.4 seam is justified, document that and assess whether AB-01.4 should close rather than forcing extraction.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.