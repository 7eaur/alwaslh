# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **THIRD SEAM SELECTED — IMPLEMENTATION NEXT**  
Branch: `rebuild/super-admin-foundation`  
Initial discovery starting HEAD: `60151da0cdcf56d61f5d68ea5cdd3d329523f2a9`

## Purpose

Incrementally thin `apps/api/src/app.ts` without changing business rules, HTTP contracts, database schema, security semantics or the single Fastify modular-monolith deployment model. Every extraction must establish a real owner, preserve behavior and be verified before selecting another seam.

## Original composition findings

`buildApp()` originally owned eight responsibility classes:

1. Fastify instance construction/options;
2. cross-cutting HTTP request policy (CORS/preflight);
3. infrastructure adapter construction;
4. broad module/service construction;
5. cross-service composite construction;
6. whole-product route registration;
7. health/readiness HTTP surface;
8. public error/not-found + database-close lifecycle.

Behavior-sensitive dependencies include media storage → content/reader consumers; quiz builder → exports; offline + reader + signer → offline downloads; Question Bank + Quiz Builder → AI authoring; quiz builder + database + media storage → specialized exports. `server.ts` separately owns config/database creation, startup batch, process signals and listen.

## First seam — CORS/preflight policy — DONE

Target owner: `apps/api/src/app/plugins/cors.ts`.

Source implementation HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

Implemented `registerCorsPolicy(app, config)` with the existing `allowedOrigins(config)` contract and direct `onRequest` hook. Existing allowed-origin headers, credentials, `Vary`, OPTIONS methods/headers and rejected-preflight `AppError("FORBIDDEN", "مصدر الطلب غير مسموح", 403)` semantics were preserved. Health/readiness, public errors, DB close lifecycle, services/composites, routes, migrations and Student frontend were untouched.

Closure evidence:

- Architecture Guard `34808159011` — SUCCESS;
- Admin AI `34809211720` — SUCCESS;
- Combined Integration `34809211704` — SUCCESS;
- Stage13G `34809211707` — SUCCESS including real API + PostgreSQL + Chromium.

## Second seam — health/readiness HTTP surface — DONE

Source implementation HEAD: `a302871b3486ae95810cea40dccca68363a29055`.

Target owner implemented: `apps/api/src/app/http/health.ts` with `registerHealthRoutes(app, database)`.

Preserved contracts:

```text
GET /health
→ 200
→ { status: "ok", service: "alwaslh-api" }
→ process-only; PostgreSQL reachability does not determine liveness

GET /ready when database.ping() resolves
→ 200
→ { status: "ready" }

GET /ready when database.ping() throws
→ log error with message "database readiness check failed"
→ 503
→ { status: "not_ready" }
```

Implementation constraints satisfied:

- same Fastify instance and existing `Database` dependency are reused;
- readiness still calls only `database.ping()`;
- route paths/methods/statuses/bodies and failure log semantics are unchanged;
- registration remains at the same relative app composition position;
- no coupling to AuthService/business services/CORS internals/server process signals was introduced;
- public error/not-found, DB close lifecycle, database construction/config, `server.ts`, service/composite graph, migrations/schema and Student frontend remain untouched;
- the three direct parity tests in `apps/api/tests/app.test.ts` were not weakened or rewritten.

### Second seam verification — DONE

- Architecture Guard `34811642661` — SUCCESS on source implementation HEAD;
- direct source Combined `34811642693` was cancelled when newer documentation-only commits superseded it;
- compare `a302871b3486ae95810cea40dccca68363a29055...b095741e621f9241ff3eed0de86b4e64048604bf` contains only `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`, and `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`, proving the later runs exercised the same API/Admin source tree;
- Admin AI `34811809959` — SUCCESS;
- Combined Integration `34811809962` — SUCCESS including API/Admin quality, clean PostgreSQL, backend authority/auth regressions, deterministic fixtures and real Admin Chromium;
- Stage13G `34811810021` — SUCCESS including Admin UI quality, API lint/typecheck/unit/build, clean PostgreSQL, database/integration/auth regressions and real API + PostgreSQL + Chromium.

Conclusion: second health/readiness extraction is behavior-preserving and **DONE**.

## Third seam — public error + not-found HTTP handling — SELECTED / IMPLEMENTATION NEXT

### Current owner

`apps/api/src/app.ts` still owns two adjacent global HTTP concerns inline after all business/health route registration:

- `app.setNotFoundHandler(...)` producing the public 404 envelope;
- `app.setErrorHandler(...)` converting thrown errors through `toPublicError(error)`, logging server-side failures at 5xx, and sending the canonical public error body/status.

These are app-level HTTP presentation concerns. They do not own business rules, database transactions, module services or route-specific authorization.

### Target owner

Create:

`apps/api/src/app/http/public-errors.ts`

with one narrow registration function:

`registerPublicErrorHandlers(app)`

The target owner should import/use the existing `toPublicError` implementation rather than moving or duplicating error-domain semantics.

### Existing parity evidence

Direct contract in `apps/api/tests/app.test.ts`:

- `unknown routes use the public error envelope` asserts `GET /missing` returns 404 and `error.code === "NOT_FOUND"`.

Broader API/integration/auth/security suites already exercise errors flowing through the global Fastify error handler; those remain regression evidence for the error envelope and security behavior.

Exact-head evidence before this documentation-only discovery was green on `e592535b082c9284ecf88f19e60cb70821e8aa16`:

- Admin AI `34813851669` — SUCCESS;
- Combined Integration `34813851671` — SUCCESS;
- Stage13G `34813851684` — SUCCESS.

### Dependency / ordering constraints

- register after all business routes and `registerHealthRoutes(...)`, matching current relative placement;
- register before returning the app;
- do not combine database lifecycle into this helper;
- preserve `toPublicError` as the single existing public-error mapping authority;
- preserve 5xx logging exactly: `request.log.error({ err: error }, "request failed")` only when mapped status is >= 500;
- preserve exact 404 body `{ error: { code: "NOT_FOUND", message: "المسار غير موجود" } }`;
- preserve status codes and body shapes for all existing thrown errors.

### Impact assessment

- database/schema: none;
- business rules: none;
- auth/authorization semantics: none expected; regression suites must confirm;
- Student-facing backend contracts: HTTP error envelopes are shared server contracts, so full API/auth/integration regression evidence is required even though no Student frontend restructuring is permitted;
- Admin frontend: no intended change; real Chromium remains closure evidence.

### Explicit non-goals

Do not in this seam:

- move or redesign `errors.ts` / `toPublicError`;
- change error codes, Arabic messages, HTTP statuses or logging policy;
- extract `onClose`/database lifecycle;
- create generic HTTP plugin frameworks;
- change Fastify construction/options;
- create a service container or route registry;
- move any business route/module/service;
- touch migrations/schema or Student frontend.

### Switch / deletion condition

The seam is complete only when both inline handlers are removed from `apps/api/src/app.ts`, `registerPublicErrorHandlers(app)` is called once at the same relative composition point, no duplicate handler ownership remains, and required gates are green.

### Required implementation closure gates

At minimum:

1. Architecture Guard;
2. API lint + strict typecheck + unit tests + build;
3. unchanged direct `apps/api/tests/app.test.ts` not-found contract;
4. relevant auth/security/integration regressions;
5. clean PostgreSQL migration verification from the established combined gates;
6. Combined real Admin Chromium;
7. Stage13G real API + PostgreSQL + Chromium;
8. documentation/state synchronization.

## Rejected broad moves remain rejected

- giant `createServices()` container;
- move all route registrations at once;
- create empty target architecture folders;
- DI framework/service locator/interface ceremony;
- bundle DB/error ownership with unrelated composition work;
- schema changes for folder restructuring.

No evidence from the first three discoveries changes those decisions.

## Exact next step

Implement **only** the selected public-error/not-found seam. Do not combine it with database-close lifecycle or any service/route composition move.

## Permanent AB-01.4 law

For every seam:

`inspect current responsibility → select one bounded owner → document contracts/non-goals → implement only that seam → verify exact/source-tree-equivalent gates → close it → only then discover the next seam`
