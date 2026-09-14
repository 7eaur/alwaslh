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
- **AB-01.4 backend app composition foundation — ACTIVE / CORS DONE / HEALTH-READINESS IMPLEMENTED, VERIFICATION PENDING**
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

## 8. AB-01.4 first seam closure

Source implementation HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

`apps/api/src/app/plugins/cors.ts` owns global CORS/preflight policy through `registerCorsPolicy(app, config)`. Closure evidence: Architecture Guard `34808159011`, Admin AI `34809211720`, Combined `34809211704`, Stage13G `34809211707` — all SUCCESS including real API + PostgreSQL + Chromium.

## 9. Second AB-01.4 seam implementation

Source implementation HEAD: `a302871b3486ae95810cea40dccca68363a29055`.

Implemented:

- created `apps/api/src/app/http/health.ts`;
- `registerHealthRoutes(app, database)` now owns `GET /health` and `GET /ready`;
- `apps/api/src/app.ts` calls that owner at the same relative position after business route registration and before final not-found/error/onClose handling;
- `/health` remains process-only and returns 200 `{ status: "ok", service: "alwaslh-api" }` even when PostgreSQL is unavailable;
- `/ready` continues calling only `database.ping()`, returns 200 `{ status: "ready" }` on success, logs `database readiness check failed` on failure, and returns 503 `{ status: "not_ready" }`;
- the three direct tests in `apps/api/tests/app.test.ts` remain unchanged;
- no public-error/not-found, DB close lifecycle, database construction/config, `server.ts`, service graph, migration/schema or Student frontend changes were included.

Verification observed so far:

- Architecture Guard `34811642661` — SUCCESS on source HEAD;
- Combined Integration `34811642693` — pending/running at Worker A handoff;
- Stage13G `34811642622` — pending/running at Worker A handoff;
- Admin AI `34811642629` — running at Worker A handoff.

The health/readiness seam is **not DONE yet**.

## 10. Exact next engineering task

The next worker must inspect the source-tree verification for `a302871b...` before any new mutation:

1. inspect Combined `34811642693`, Stage13G `34811642622`, Admin AI `34811642629`, and any newer source-tree-equivalent runs triggered by documentation-only commits;
2. verify API lint/typecheck/unit/build, clean PostgreSQL/integration regressions and real API + PostgreSQL + Chromium are green;
3. if green, mark the health/readiness seam DONE in state/status/log/handoff/AB-01 docs;
4. if any gate fails, fix only the root cause for this seam and re-run verification;
5. do **not** select or implement a third composition seam until this one is closed.

## 11. Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend debt; AB-05 UX/UI convergence; AB-06 performance/delivery; AB-07 legacy deletion + hard enforcement; AB-08 final full verification + live-main reconciliation.

Always defer exact mutation to the live execution-state file because scheduled runs continuously advance the branch.