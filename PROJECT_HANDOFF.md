# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: allow any new/manual/scheduled execution to resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup order

Before any mutation: confirm repo `7eaur/alwaslh`; live-check `main` and `rebuild/super-admin-foundation`; read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first; read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this handoff, the autonomous protocol and active phase docs; inspect current code/tests/migrations and exact-head Actions; compare live `main` at structural boundaries.

Code/migrations/executable CI/runtime evidence outrank prose. Anything not inspected is `NOT YET VERIFIED`.

## Scope

IN: complete Super Admin frontend/product/UX/UI/architecture, full Fastify API/backend, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts/design primitives, CI/security/integration/browser verification and architecture documentation.

OUT only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope; Student frontend tests/code may be used only as consumer-regression evidence when shared/server contracts change.

## Active branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52: Draft, unmerged, never auto-merge;
- never force-reset/force-push shared history;
- latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; no observed scoped overlap with current AB-01 backend work.

## Alternating execution

Workers A/B/C share one branch/roadmap in serial order `A → B → C`, staggered at `:00/:20/:40`. Shared truth is `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. If another worker is active, do not mutate overlapping work. Every run ends in `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE` with exact HEAD/evidence/next step. After verified AB-08 completion, disable all three scheduled tasks.

## Architecture law

`operator job/use case → DB/API/security contracts → current owner → target owner → product states/flow → backend seam correction → replacement → verify outcome → switch → delete legacy owner → exact-head gates → document`

No patch-only closure. No big-bang rewrite. Admin app composes only; backend remains one Fastify modular monolith over PostgreSQL with selective useful boundaries and no DI/service-locator/interface ceremony without evidence.

## Product/testing rules

Priority: **Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**. No fake data. Product states/RTL/keyboard/focus/responsive/reduced-motion are mandatory. Never weaken tests/validation/auth/security. According to affected scope require Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integrations/security/auth, real API + PostgreSQL + Chromium, and Student consumer regressions only when a changed server/shared contract affects them.

## Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 shared Admin API transport/error boundary — DONE
- AB-01.2 Auth/session ownership + SessionProvider — DONE
- AB-01.3 minimum proven shared product-state primitive — DONE
- **AB-01.4 backend app composition foundation — ACTIVE / CORS DONE / HEALTH-READINESS DONE / PUBLIC-ERROR SEAM IMPLEMENTED, WAITING FOR CI**
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

## AB-01.4 verified history

First seam CORS/preflight: source HEAD `dbdc9245f2d0e283d047d7e1254748e55f890a55`; Architecture Guard `34808159011`, Admin AI `34809211720`, Combined `34809211704`, Stage13G `34809211707` — SUCCESS.

Second seam health/readiness: source HEAD `a302871b3486ae95810cea40dccca68363a29055`; owner `apps/api/src/app/http/health.ts`; Architecture Guard `34811642661`, source-tree-equivalent Admin AI `34811809959`, Combined `34811809962`, Stage13G `34811810021` — SUCCESS.

## Third AB-01.4 seam — IMPLEMENTED / NOT YET CLOSED

Source implementation HEAD: `001d45892bf4a17458f3beaeaaa1a7430be49b44`.

Current owner after extraction:

- `apps/api/src/app/http/public-errors.ts`;
- `registerPublicErrorHandlers(app)` owns the global unknown-route and global public-error handlers.

`apps/api/src/app.ts` now only composes that owner after `registerHealthRoutes(app, database)` and before database `onClose`. Direct `toPublicError` ownership/import no longer lives in `app.ts`.

Behavior intentionally unchanged:

- unknown route → 404 + `{ error: { code: "NOT_FOUND", message: "المسار غير موجود" } }`;
- thrown errors still use existing `toPublicError(error)` authority;
- only mapped 5xx errors log `request.log.error({ err: error }, "request failed")`;
- mapped status/body unchanged.

Scope intentionally untouched:

- database `onClose` lifecycle;
- Fastify construction/options;
- service graph/business route registry;
- migrations/schema;
- Student frontend.

Verification state:

- Architecture Guard `34816433721` — SUCCESS on source HEAD;
- Admin AI `34816433699` was cancelled after later documentation commits superseded the source head and therefore is not closure evidence;
- Combined `34816433773` and Stage13G `34816433715` were still running/pending during Worker A handoff;
- documentation-only commits after the source implementation preserve the same affected source tree, so source-tree-equivalent later runs may be used if they fully cover required gates.

## Exact next engineering task

Do **not** start another seam yet.

1. inspect current live branch HEAD and source/source-tree-equivalent workflow runs;
2. require Architecture Guard + API lint/typecheck/unit/build + relevant auth/security/integration + clean PostgreSQL + Combined Chromium + Stage13G real API/PostgreSQL/Chromium;
3. if green, mark the public-error seam DONE;
4. only then perform discovery for the next smallest AB-01.4 responsibility;
5. if any gate fails, fix only its root cause before advancing.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend debt; AB-05 UX/UI convergence; AB-06 performance/delivery; AB-07 legacy deletion + hard enforcement; AB-08 final full verification + live-main reconciliation.

Always defer exact mutation to the live execution-state file because scheduled runs continuously advance the branch.
