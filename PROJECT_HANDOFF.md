# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: allow any new/manual/scheduled execution to resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## 1. Mandatory startup order

Before any mutation:

1. confirm repo `7eaur/alwaslh`;
2. live-check `main` and `rebuild/super-admin-foundation` HEADs;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` FIRST for the exact continuation point;
4. read `PROJECT_STATUS.md`;
5. read `PROJECT_ENGINEERING_LOG.md`;
6. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`;
7. read the active phase execution doc referenced by status/state;
8. inspect current code/tests/migrations for the active batch;
9. inspect exact-head Actions before claiming health;
10. before structural phase boundaries, compare live `main` for scoped Admin/API/migrations/shared changes.

Code/migrations/executable CI/runtime evidence outrank prose. Anything not inspected is `NOT YET VERIFIED`.

## 2. Scope

IN: complete Super Admin frontend/product/UX/UI/architecture, full Fastify API/backend, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts/design primitives, CI/security/integration/browser verification and architecture documentation.

OUT only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope; Student frontend tests/code may be used as consumer regression evidence when shared/server contracts change.

## 3. Active branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52: Draft, unmerged, never auto-merge;
- never force-reset/force-push shared history;
- never mix separate Student frontend implementation into this workstream.

Latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62` after Student V2 merge #58. Its delta from the prior reconciled main is Student frontend/workflow + root docs only; no overlapping API/Admin/migration/scoped-shared implementation requires import for AB-01.4.

## 4. Alternating execution

Workers A, B and C share one roadmap and branch in serial order `A → B → C`, staggered at `:00`, `:20`, `:40`. Each run performs one smallest coherent increment, writes the shared state, and hands the exact next step to the following worker.

Shared truth: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`.

If the prior worker appears still active, do not mutate overlapping work. Every run ends in `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE` with starting/ending HEAD, task, changes, CI evidence and exact next step. After verified AB-08 completion, the proving worker disables all three scheduled tasks.

## 5. Architecture law

`operator job/use case → DB/API/security contracts → current owner → target owner → product states/flow → backend seam correction where needed → replacement → verify outcome → switch → delete legacy owner → exact-head gates → document`

No patch-only closure. No big-bang rewrite.

### Admin

App composes only; app imports feature public/routes boundaries; feature internals private; shared never imports app/features; substantial routes lazy-load; one shell owns chrome/navigation; preserve verified `/app`; browser state is not canonical authority; no state/query/styling rewrite without evidence.

### Backend

One Fastify modular monolith over PostgreSQL; PostgreSQL/API canonical authority; useful direction `HTTP → Application → Domain` with Infrastructure adapters; no mandatory empty layers/interfaces; no microservices/DI/service locator/generic repository ceremony without evidence; cross-module dependencies use narrow public contracts; schema changes only for real domain/integrity needs.

## 6. Product/design rules

Priority: **Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**.

Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class. No fake data. Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are mandatory. Reuse approved brand/design system.

## 7. Testing rules

Never weaken tests, validation, auth or security. As affected require Architecture Guard; Admin lint/typecheck/unit/build; API lint/typecheck/unit/build; clean PostgreSQL migrations; backend/auth/security/integration regressions; real API + PostgreSQL + Chromium; Student consumer regression only for changed shared/server contracts; RTL/keyboard/focus/responsive/visual QA for UI changes.

If required CI is still running, use `WAITING_FOR_CI`.

## 8. Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 shared Admin API transport/error boundary — DONE
- AB-01.2 Auth/session ownership + SessionProvider — DONE
- AB-01.3 minimum proven shared product-state primitive — DONE
- **AB-01.4 backend app composition foundation — DISCOVERY COMPLETE / FIRST IMPLEMENTATION NEXT**
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

Canonical AB-01.4 discovery:

`docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`

The discovery mapped `apps/api/src/app.ts` as owner of Fastify construction, CORS/preflight policy, adapters, service graph, cross-service composites, route registration, health/readiness, public error/not-found handling and database close lifecycle. It recorded behavior-sensitive service dependencies and explicitly rejected a giant service container, broad route move, empty folder scaffolding and combined DB/error migration.

## 9. Exact next engineering task — AB-01.4 FIRST IMPLEMENTATION

Implement **only the proven CORS/preflight extraction**:

1. create `apps/api/src/app/plugins/cors.ts`;
2. move the existing allowed-origin/CORS/preflight `onRequest` behavior unchanged into `registerCorsPolicy(app, config)`;
3. continue using direct `app.addHook()` semantics — do not switch to an encapsulated `app.register()` plugin in this increment;
4. invoke `registerCorsPolicy(app, config)` in `buildApp()` at the same position: after Fastify construction, before business route registration;
5. remove only the now-unused inline `allowedOrigins`/`AppError` ownership from `app.ts` if no longer needed there;
6. do **not** move health/readiness, public errors, DB lifecycle, service construction or route registration in this increment;
7. preserve `apps/api/tests/app.test.ts` CORS behavior exactly;
8. verify Architecture Guard + API lint/typecheck/unit/build + current Combined/real-browser and Stage13G/equivalent exact-head gates before marking this extraction done.

CORS is global browser transport policy, so Admin and Student HTTP semantics must remain unchanged. No Student frontend restructuring is authorized.

## 10. Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend debt; AB-05 UX/UI convergence; AB-06 performance/delivery; AB-07 legacy deletion + hard dependency enforcement; AB-08 final full verification + live-main reconciliation.

Always defer exact mutation to the live execution-state file because scheduled runs continuously advance the branch.
