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
- live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

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
- AB-01.4 — **DONE**
  - CORS — DONE
  - Health/readiness — DONE
  - Public error/not-found — DONE
  - Fastify construction/options — DONE
  - Database lifecycle registration — DONE
- AB-01.5 — **NEXT**
- AB-01.6 — PENDING

## AB-01.4 final closure

Fifth seam source+test implementation HEAD:

`101f61a9c25e3de116d0074a3ef7e2f760eb98a7`

Owner:

`apps/api/src/app/plugins/database-lifecycle.ts`

The seam is now verified closed. `app.close()` delegates to the supplied database close operation exactly once, while `server.ts`, database construction, process signals, service graph, business routes, migrations/schema and Student frontend remain unchanged.

Source-tree-equivalent closure evidence:

- Architecture Guard `34825750566` — SUCCESS;
- compare from source+test head to `e61400652267a4c836c40abf35a58a434b0fff08` changes only canonical docs;
- Admin AI `34826063345` — SUCCESS;
- Combined `34826063326` — SUCCESS including quality, clean PostgreSQL, DB/backend/auth regressions and real Chromium;
- Stage13G `34826063330` — SUCCESS including Admin/API quality, clean PostgreSQL, integration/auth regressions and real API + PostgreSQL + Chromium.

## Why AB-01.4 stops here

Current `apps/api/src/app.ts` still composes many services, cross-service composites and route registrations. That remaining work is broad business/module composition, not another small cross-cutting app-foundation seam. Do **not** create a giant service container, route registry or infrastructure bundle merely to shrink the file. Workflow-driven backend boundary corrections belong in AB-03 and residual normalization in AB-04.

## Exact next engineering step

Begin **AB-01.5 discovery only**.

1. inspect generic/cross-cutting backend technical concerns currently scattered or misowned: common HTTP/auth helpers, errors, DB technical ownership, observability, media infrastructure;
2. identify evidence of real duplication/cross-module misuse;
3. select at most one small, bounded ownership correction with explicit contracts/tests, or record that no AB-01.5 extraction is justified;
4. do not change business rules or module workflows during discovery;
5. after any justified implementation, run Architecture Guard + relevant API/Admin/PostgreSQL/integration/Chromium gates;
6. then proceed to AB-01.6 foundation closure gate.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.