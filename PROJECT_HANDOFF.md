# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: allow any new/manual/scheduled execution to resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## 1. Mandatory startup order

Before any mutation: confirm repo `7eaur/alwaslh`; live-check `main` and `rebuild/super-admin-foundation`; read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first; read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this handoff, the autonomous protocol and active phase docs; inspect current code/tests/migrations and exact-head Actions; compare live `main` at structural boundaries.

Code/migrations/executable CI/runtime evidence outrank prose. Anything not inspected is `NOT YET VERIFIED`.

## 2. Scope

IN: complete Super Admin frontend/product/UX/UI/architecture, full Fastify API/backend, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts/design primitives, CI/security/integration/browser verification and architecture documentation.

OUT only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope; Student frontend tests/code may be used only as consumer-regression evidence when shared/server contracts change.

## 3. Active branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52: Draft, unmerged, never auto-merge;
- never force-reset/force-push shared history;
- latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; no observed scoped overlap with current AB-01 backend work.

## 4. Alternating execution

Workers A/B/C share one branch/roadmap in serial order `A → B → C`, staggered at `:00/:20/:40`. Shared truth is `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. If another worker is active, do not mutate overlapping work. Every run ends in `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE` with exact HEAD/evidence/next step. After verified AB-08 completion, disable all three scheduled tasks.

## 5. Architecture law

`operator job/use case → DB/API/security contracts → current owner → target owner → product states/flow → backend seam correction → replacement → verify outcome → switch → delete legacy owner → exact-head gates → document`

No patch-only closure. No big-bang rewrite.

Admin app composes only; features own workflows/contracts; shared never imports app/features; substantial routes lazy-load; one shell owns chrome/navigation. Backend remains one Fastify modular monolith over PostgreSQL with selective useful boundaries and no DI/service-locator/interface ceremony without evidence.

## 6. Product/testing rules

Priority: **Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**. No fake data. Product states/RTL/keyboard/focus/responsive/reduced-motion are mandatory. Never weaken tests/validation/auth/security. According to affected scope require Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integrations/security/auth, real API + PostgreSQL + Chromium, and Student consumer regressions only when a changed server/shared contract affects them.

## 7. Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 shared Admin API transport/error boundary — DONE
- AB-01.2 Auth/session ownership + SessionProvider — DONE
- AB-01.3 minimum proven shared product-state primitive — DONE
- **AB-01.4 backend app composition foundation — ACTIVE / CORS DONE / HEALTH-READINESS SELECTED**
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

## 8. AB-01.4 first seam closure

Source implementation HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

`apps/api/src/app/plugins/cors.ts` now owns the existing global CORS/preflight policy through `registerCorsPolicy(app, config)`. Direct `app.addHook("onRequest")` scope and ordering remain unchanged. `app.ts` composes the helper before route registration.

Closure evidence:

- Architecture Guard `34808159011` — SUCCESS;
- Admin AI `34809211720` — SUCCESS;
- Combined `34809211704` — SUCCESS;
- Stage13G `34809211707` — SUCCESS including real API + PostgreSQL + Chromium.

Therefore the first CORS/preflight extraction is **DONE**.

## 9. Second AB-01.4 seam decision

Discovery inspected live `apps/api/src/app.ts` plus direct contracts in `apps/api/tests/app.test.ts`, `apps/api/src/db.ts` and `apps/api/src/server.ts`.

Selected seam:

- current owner: inline `GET /health` and `GET /ready` handlers in `apps/api/src/app.ts`;
- target owner: `apps/api/src/app/http/health.ts`;
- target composition function: `registerHealthRoutes(app, database)`.

Required exact behavior:

- `/health` remains process-only and returns 200 `{ status: "ok", service: "alwaslh-api" }` even when PostgreSQL is unavailable;
- `/ready` uses only `database.ping()` and returns 200 `{ status: "ready" }` on success;
- failed ping preserves the readiness failure log and returns 503 `{ status: "not_ready" }`;
- current route paths/methods/bodies/statuses and composition position stay intact.

Direct parity authority already exists in the three health/readiness tests in `apps/api/tests/app.test.ts`.

Explicit non-goals for this implementation: do not move not-found/public-error handlers, DB close lifecycle, database creation/config, `server.ts` startup/signals, service graph, all business routes, migrations/schema or Student frontend.

## 10. Exact next engineering task

Implement **only** the selected health/readiness seam:

1. re-read live execution state and confirm no active worker conflict;
2. create `apps/api/src/app/http/health.ts` with `registerHealthRoutes(app, database)`;
3. move only the two operational route handlers from `app.ts` into that owner;
4. leave one composition call in `app.ts` at the same relative position;
5. run/observe Architecture Guard, API lint/typecheck/unit/build, clean PostgreSQL/integration regressions and real API + PostgreSQL + Chromium gates;
6. mark the seam DONE only after exact-head or proven source-tree-equivalent green evidence;
7. do not select a third seam until this one is verified.

## 11. Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend debt; AB-05 UX/UI convergence; AB-06 performance/delivery; AB-07 legacy deletion + hard enforcement; AB-08 final full verification + live-main reconciliation.

Always defer exact mutation to the live execution-state file because scheduled runs continuously advance the branch.