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
- live `main` observed during Worker C sequence 13: `258c855ace396a3f834199708c926411a3d65f79`.

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
- **AB-01.4 backend app composition foundation — ACTIVE / CORS DONE / HEALTH-READINESS DONE / PUBLIC-ERROR DONE / FASTIFY-CONSTRUCTION SELECTED**
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

## AB-01.4 verified history

First seam CORS/preflight: source HEAD `dbdc9245f2d0e283d047d7e1254748e55f890a55`; Architecture Guard `34808159011`, Admin AI `34809211720`, Combined `34809211704`, Stage13G `34809211707` — SUCCESS.

Second seam health/readiness: source HEAD `a302871b3486ae95810cea40dccca68363a29055`; owner `apps/api/src/app/http/health.ts`; Architecture Guard `34811642661`, source-tree-equivalent Admin AI `34811809959`, Combined `34811809962`, Stage13G `34811810021` — SUCCESS.

Third seam public error/not-found: source HEAD `001d45892bf4a17458f3beaeaaa1a7430be49b44`; owner `apps/api/src/app/http/public-errors.ts`; `registerPublicErrorHandlers(app)` owns both global handlers. Closure evidence: Architecture Guard `34816433721` SUCCESS; compare through `068ee06cf7fec442b95ddada2667d8aac5d1c2a2` shows documentation-only changes; source-tree-equivalent Admin AI `34816613371`, Combined `34816613431`, Stage13G `34816613493` — SUCCESS. Combined includes clean PostgreSQL, DB contract, backend authority/auth-security regressions and real Admin Chromium; Stage13G includes API/Admin quality, clean PostgreSQL, relevant integrations/auth regression and real API + PostgreSQL + Chromium.

## Fourth AB-01.4 seam selected

Worker C sequence 13 performed discovery only from starting branch HEAD `2722de7d1d4d09f2eae7e3f9dc35624255f392fa` and selected **Fastify instance construction/options** as the next smallest bounded owner.

Target:

- create `apps/api/src/app/create-fastify-instance.ts`;
- export a narrow `createFastifyInstance(config: AppConfig): FastifyInstance`;
- preserve exactly logger behavior, `disableRequestLogging: false`, `trustProxy: true`, `bodyLimit: 1_048_576`, `requestTimeout: 15_000`;
- `buildApp()` remains the composition entry and keeps the same service/route/plugin/database order.

Evidence: live `app.ts` owns the constructor/options; `apps/api/tests/app.test.ts` uses `buildApp({ config, database })` as the bootstrap contract and verifies representative server outcomes. There is no evidence authorizing option tuning, therefore extraction and tuning must not be combined.

Explicitly do not move service graph, broad business routes, DB `onClose`, config parsing/defaults, migrations/schema or Student frontend. Do not introduce DI/service container ceremony.

## Exact next engineering task

Implement **only** the selected Fastify construction seam:

1. re-check live branch/state and current `app.ts`;
2. create `apps/api/src/app/create-fastify-instance.ts` with the exact existing Fastify options;
3. make `app.ts` call it and remove only the direct Fastify value construction/option literals;
4. leave every service, route registration and DB lifecycle statement in its current order;
5. run Architecture Guard, API lint/typecheck/unit/build including `app.test.ts`, clean PostgreSQL, relevant integration/auth/security gates and real API/PostgreSQL/Chromium/combined verification;
6. if gates are still running, hand off `WAITING_FOR_CI`; if green, close the fourth seam before discovering a fifth.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend debt; AB-05 UX/UI convergence; AB-06 performance/delivery; AB-07 legacy deletion + hard enforcement; AB-08 final full verification + live-main reconciliation.

Always defer exact mutation to the live execution-state file because scheduled runs continuously advance the branch.