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
- live `main` observed in Worker C sequence 16: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

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
  - Database lifecycle registration — **SELECTED / IMPLEMENTATION NEXT**
- AB-01.5 — PENDING
- AB-01.6 — PENDING

## Fifth-seam discovery result

Live `apps/api/src/app.ts` still owns one isolated cross-cutting lifecycle concern:

```ts
app.addHook("onClose", async () => {
  await database.close();
});
```

Target owner:

`apps/api/src/app/plugins/database-lifecycle.ts`

with narrow registration such as `registerDatabaseLifecycle(app, database)`.

Why this is the smallest justified seam:

- `Database.close()` is already an explicit infrastructure contract;
- `server.ts` intentionally relies on `app.close()` to close PostgreSQL during SIGTERM/SIGINT and listen failure;
- startup failure before app construction closes the database directly and remains out of scope;
- this move does not require moving service construction, business routes, database creation or process signals.

## Contracts to preserve

- `buildApp()` still receives an already-created `Database`;
- the same Fastify instance owns the close hook;
- `app.close()` awaits `database.close()` without swallowing errors;
- lifecycle registration stays after current route/health/public-error composition;
- `server.ts` shutdown/listen-failure behavior stays unchanged;
- legacy startup-failure direct database close stays unchanged;
- database pool/query/transaction/migration/schema behavior stays unchanged.

Implementation must add focused `apps/api/tests/app.test.ts` coverage proving app-close delegates to the supplied database close operation. Do not create a general lifecycle framework.

## Exact next engineering step

Implement **only** this fifth AB-01.4 database lifecycle seam:

1. create `apps/api/src/app/plugins/database-lifecycle.ts`;
2. move only the inline database `onClose` registration into the narrow owner;
3. call it from `app.ts` in the same composition position;
4. add one focused lifecycle parity test;
5. leave `server.ts`, `db.ts`, service graph, route registrations, startup batch, migrations and Student frontend unchanged;
6. run Architecture Guard, API lint/typecheck/unit/build, clean PostgreSQL, relevant integration/security/auth and real API + PostgreSQL + Chromium gates;
7. close the seam only after green evidence;
8. then reassess whether AB-01.4 should close rather than forcing broad service/container/route-registry extraction.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.