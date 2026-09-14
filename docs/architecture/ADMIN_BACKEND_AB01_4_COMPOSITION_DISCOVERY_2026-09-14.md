# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **FIRST EXTRACTION VERIFIED — SECOND SEAM SELECTED / IMPLEMENTATION NEXT**  
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

## First seam decision — CORS/preflight policy

Chosen because it is pure app-level HTTP policy with direct parity tests, no service-graph or route-contract change, no database change, and meaningful root ownership reduction.

Target owner: `apps/api/src/app/plugins/cors.ts`.

Required semantics were:

- reuse existing `allowedOrigins(config)`;
- direct `app.addHook("onRequest", ...)` rather than encapsulated `app.register()`;
- preserve allowed-origin response headers, credentials and `Vary: Origin`;
- preserve OPTIONS methods/headers;
- preserve rejected preflight `AppError("FORBIDDEN", "مصدر الطلب غير مسموح", 403)`;
- invoke from `buildApp()` before business route registration.

## First seam implementation — DONE

Source implementation HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

Implemented:

- created `apps/api/src/app/plugins/cors.ts`;
- moved the exact CORS/preflight registration into `registerCorsPolicy(app, config)`;
- `apps/api/src/app.ts` now imports and invokes that owner at the same lifecycle point;
- only now-unused CORS-specific root imports were removed;
- health/readiness, public errors, database-close lifecycle, services/composites, routes, migrations and Student frontend remained untouched.

Code inspection confirms `registerCorsPolicy()` still derives origins via `allowedOrigins(config)`, installs direct `onRequest`, sets the same headers and throws the same forbidden preflight error. `app.ts` calls it after service construction and before route registration, preserving global request scope.

## First seam verification — DONE

Direct parity authority remained `apps/api/tests/app.test.ts` CORS behavior.

Evidence:

- Architecture Guard `34808159011` — SUCCESS on source implementation HEAD;
- `dbdc9245...` → verification HEAD `3d281eddcdaf4a8d75d810dc0e5ded5a35392cad` compare contains only `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` changes, so verification exercises the same API/Admin source tree;
- Stage13E Admin AI `34809211720` — SUCCESS;
- Stage13E Combined Integration `34809211704` — SUCCESS: API/Admin quality, clean PostgreSQL, backend authority/auth regressions, deterministic fixtures and real Admin Chromium all passed;
- Stage13G `34809211707` — SUCCESS: Admin UI quality, API lint/typecheck/unit/build, clean PostgreSQL, database contracts, Accounts+Access, Notifications+Operations, Reports+Settings+Security+Audit, AI authoring, Access/Auth regression and real API + PostgreSQL + Chromium all passed.

Conclusion: the first CORS/preflight composition extraction is behavior-preserving and **DONE**.

## Rejected broad moves remain rejected

- giant `createServices()` container;
- move all route registrations at once;
- create empty target architecture folders;
- DI framework/service locator/interface ceremony;
- bundle DB/error ownership with unrelated composition work;
- schema changes for folder restructuring.

No evidence from the first seam changes those decisions.

# Second seam discovery — health/readiness HTTP surface

Discovery checkpoint started from live branch HEAD `5478083233516cbd9495a4092511b94c3b50829d` with `main` at `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

The second seam is **selected but NOT implemented in this discovery increment**.

## Why this seam is next

After the CORS extraction, the smallest remaining self-contained app-level responsibility with direct executable parity is the operational health/readiness HTTP surface:

- `GET /health` — process-only liveness, intentionally independent from PostgreSQL reachability;
- `GET /ready` — readiness derived only from `Database.ping()`, returning `200 { status: "ready" }` or logging the database failure and returning `503 { status: "not_ready" }`.

This is a better next extraction than service construction, all-route registration, public-error handling or database-close lifecycle because:

1. it is one coherent technical responsibility;
2. it has no business-module dependencies;
3. it does not alter security/auth/entitlement/domain authority;
4. it requires no schema/config changes;
5. three direct parity tests already prove its externally visible behavior;
6. extracting it genuinely removes operational HTTP mechanics from `buildApp()` rather than merely renaming a service graph.

## Current owner

`apps/api/src/app.ts` currently owns both route definitions inline after business route registration and before not-found/error/lifecycle handlers.

Current behavior that MUST remain exact:

```text
GET /health
→ 200
→ { status: "ok", service: "alwaslh-api" }
→ MUST NOT fail merely because PostgreSQL is unavailable

GET /ready when database.ping() resolves
→ 200
→ { status: "ready" }

GET /ready when database.ping() throws
→ log error with message "database readiness check failed"
→ 503
→ { status: "not_ready" }
```

## Target owner

Proposed owner:

`apps/api/src/app/http/health.ts`

Proposed public app-level composition function:

`registerHealthRoutes(app, database)`

Reasoning:

- these are app/runtime operational endpoints, not a business module;
- `http/health.ts` gives them explicit HTTP ownership without turning them into a fake domain module;
- `app.ts` should retain only the composition call;
- the target file has a real responsibility immediately and is not empty scaffolding.

## Dependency and ordering constraints

The implementation increment MUST:

1. receive the existing `FastifyInstance` and existing `Database` dependency; do not construct a second database owner;
2. continue calling only `database.ping()` for readiness;
3. preserve the readiness failure log through `app.log.error({ err: error }, "database readiness check failed")` or equivalent same logger/message semantics;
4. register the routes directly on the same Fastify instance;
5. preserve the current route paths, methods, status codes and response bodies exactly;
6. keep registration before the final not-found/error/lifecycle handlers as the current composition does;
7. avoid coupling the health owner to AuthService, business services, CORS policy internals or server process-signal handling.

There is no evidence that route ordering relative to business routes currently changes behavior, but the implementation should preserve the current composition position to minimize change surface.

## Direct parity tests / contracts

Existing direct authority: `apps/api/tests/app.test.ts`.

Required unchanged tests:

1. `GET /health is process health only`;
2. `GET /ready returns 200 when PostgreSQL is reachable`;
3. `GET /ready returns 503 when PostgreSQL is unavailable`.

The test fixture proves the important distinction that `/health` stays healthy even when the fake database `ping()` would fail.

No new product test is required merely for moving ownership if these direct behavior tests remain unchanged and green. Add a focused unit test only if implementation introduces logic not already exercised—which is not expected.

## Business / security / Student impact

Expected impact: **none** beyond preserving operational endpoints.

- no business rules change;
- no auth/session/authorization behavior change;
- no Student frontend implementation change;
- no Student-facing API contract change;
- no PostgreSQL schema/migration change;
- no entitlement/publication/assessment/offline authority change.

Because `/health` and `/ready` are server operational surfaces, the implementation still requires broad app regression evidence even though Student consumer-specific regression is not newly required by this extraction alone.

## Required implementation gates

For the source implementation HEAD, require at minimum:

- Architecture Guard;
- API lint;
- API strict typecheck;
- API unit tests including `apps/api/tests/app.test.ts`;
- API build;
- clean PostgreSQL migration verification through the standard integration gates;
- Stage13E Combined Integration / equivalent backend authority + auth regression evidence;
- Stage13G / equivalent real API + PostgreSQL + Chromium evidence.

If documentation commits supersede the source HEAD, source-tree equivalence must be demonstrated before using later green runs as closure evidence.

## Explicit non-goals for the implementation increment

Do NOT combine this seam with:

- `app.setNotFoundHandler()` extraction;
- `app.setErrorHandler()` / `toPublicError()` extraction;
- `app.addHook("onClose")` database-close extraction;
- database creation/config ownership changes;
- `server.ts` process signal/startup changes;
- service/composite construction changes;
- moving all business route registration;
- module boundary normalization;
- migrations/schema changes;
- Student frontend changes.

Those remain separate decisions and require separate evidence.

## Switch / deletion condition

The seam is complete only when:

1. `apps/api/src/app/http/health.ts` is the sole owner of the two operational route handlers;
2. `apps/api/src/app.ts` contains only the explicit `registerHealthRoutes(app, database)` composition call for this responsibility;
3. no duplicate inline `/health` or `/ready` handlers remain in `app.ts`;
4. all direct parity tests remain green;
5. required exact-head or source-tree-equivalent integration/Chromium gates are green;
6. canonical status/log/handoff/discovery documents record the verified implementation evidence.

## Exact next increment — IMPLEMENT SECOND SEAM ONLY

The next coherent worker should implement **only** this selected health/readiness extraction, then run/observe the required gates and document closure before selecting any third composition seam.

Do not select or implement a third seam until this one is verified.