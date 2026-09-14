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
- live `main` observed in Worker A sequence 17: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

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
  - Fastify construction/options — DONE
  - Database lifecycle registration — **IMPLEMENTED / WAITING_FOR_CI**
- AB-01.5 — PENDING
- AB-01.6 — PENDING

## Fifth-seam implementation

Source+test implementation HEAD:

`101f61a9c25e3de116d0074a3ef7e2f760eb98a7`

New owner:

`apps/api/src/app/plugins/database-lifecycle.ts`

`app.ts` now delegates with:

`registerDatabaseLifecycle(app, database)`

in the same composition position after business routes, health and public errors.

Focused `apps/api/tests/app.test.ts` coverage proves `app.close()` delegates to the supplied fake database close operation exactly once.

Unchanged by this seam:

- `server.ts`;
- database creation/pool/query/transaction behavior;
- process-signal and startup-failure paths;
- service graph and business routes;
- migrations/schema;
- Student frontend.

## Verification state

Architecture Guard `34825750566` — **SUCCESS** on the source composition commit.

On source+test HEAD before documentation commits:

- Stage13G `34825773710` — IN_PROGRESS; Admin UI lint/typecheck/unit/build already green when inspected;
- Combined `34825773686` — IN_PROGRESS;
- Admin AI `34825773676` — IN_PROGRESS.

Documentation commits may supersede or cancel these runs. The next worker must inspect current/source-tree-equivalent Actions and must not infer success from cancellation.

## Exact next engineering step

Do **not** start another extraction yet.

1. fetch current branch/main HEADs and shared state;
2. verify source-tree-equivalent Architecture Guard/API lint/typecheck/unit/build/clean PostgreSQL/relevant integration/security/auth/real API+Chromium evidence for the implemented database lifecycle seam;
3. if any gate fails, fix only its root cause;
4. if the seam is fully green, mark **Database lifecycle registration — DONE**;
5. then explicitly reassess whether AB-01.4 should close rather than inventing a broad sixth service-container, route-registry or infrastructure-bundle extraction;
6. only after that decision may AB-01.5 begin.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.