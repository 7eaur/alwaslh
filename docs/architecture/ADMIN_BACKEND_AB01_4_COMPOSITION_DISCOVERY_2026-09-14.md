# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **FOUR SEAMS CLOSED — FIFTH SEAM SELECTED / NOT IMPLEMENTED**  
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

Closure evidence: Architecture Guard `34808159011`, Admin AI `34809211720`, Combined `34809211704`, Stage13G `34809211707` — SUCCESS.

## Second seam — health/readiness HTTP surface — DONE

Source implementation HEAD: `a302871b3486ae95810cea40dccca68363a29055`.

Target owner: `apps/api/src/app/http/health.ts` with `registerHealthRoutes(app, database)`.

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

Closure evidence: Architecture Guard `34811642661`; source-tree-equivalent Admin AI `34811809959`, Combined `34811809962`, Stage13G `34811810021` — SUCCESS.

## Third seam — public error + not-found HTTP handling — DONE

Source implementation HEAD: `001d45892bf4a17458f3beaeaaa1a7430be49b44`.

Owner: `apps/api/src/app/http/public-errors.ts` with `registerPublicErrorHandlers(app)`.

Preserved contracts:

- unknown route → HTTP 404;
- exact body `{ error: { code: "NOT_FOUND", message: "المسار غير موجود" } }`;
- existing `toPublicError(error)` remains the single mapping authority;
- mapped status/body semantics unchanged;
- only mapped status >= 500 logs `request.log.error({ err: error }, "request failed")`;
- ordering remains after business routes/health registration;
- database `onClose` remains outside the helper.

Closure evidence: Architecture Guard `34816433721`; source-tree-equivalent Admin AI `34816613371`, Combined `34816613431`, Stage13G `34816613493` — SUCCESS.

## Fourth seam — Fastify instance construction/options — DONE

Source implementation HEAD: `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

### Implemented owner

`apps/api/src/app/create-fastify-instance.ts`

with:

`createFastifyInstance(config: AppConfig): FastifyInstance`

The helper owns only Fastify construction/options. `buildApp()` remains the composition entry point and continues to construct services, register routes/policies and return the instance.

### Preserved contracts

```ts
Fastify({
  logger: config.LOG_LEVEL === "silent" ? false : { level: config.LOG_LEVEL },
  disableRequestLogging: false,
  trustProxy: true,
  bodyLimit: 1_048_576,
  requestTimeout: 15_000,
})
```

Also preserved:

- one Fastify instance per `buildApp()` call;
- instance creation before all service construction and hook/route/error registration;
- no config/default change;
- no service graph/business route/database lifecycle change;
- no migration/schema or Student frontend change.

### Switch/deletion condition — SATISFIED

1. `create-fastify-instance.ts` is the single owner of `Fastify(...)` construction/options;
2. `apps/api/src/app.ts` no longer imports `Fastify` as a value or embeds option literals;
3. `buildApp()` still returns the same `FastifyInstance` contract and composes downstream owners in the same order;
4. required source-tree-equivalent gates are green.

### Closure evidence

- Architecture Guard `34820842164` — SUCCESS on source implementation HEAD.
- Original source-head Combined `34820842196`, Stage13G `34820842163`, Admin AI `34820842245` were cancelled by later documentation commits, not by code failure.
- Compare `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d...248ce58053bca9d97498d41fdda57aec1ace4033` changes only five canonical documentation files, proving the later successful runs exercise the same affected source tree.
- Admin AI `34821032274` — SUCCESS including API lint/typecheck/unit/build, clean PostgreSQL, DB contracts, authorization/review controls, Stage12 and auth security regressions.
- Combined Integration `34821032272` — SUCCESS including API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth-security regressions, deterministic fixtures and real Admin Chromium.
- Stage13G `34821032271` — SUCCESS including Admin UI quality, API lint/typecheck/unit/build, clean PostgreSQL, Accounts+Access, Notifications+Operations, Reports+Settings+Security+Audit, AI authoring, Access/Auth regressions, and real API + PostgreSQL + Chromium.

Conclusion: the fourth seam is **DONE**.

## Fifth seam discovery — database lifecycle registration — SELECTED / NOT IMPLEMENTED

Worker C sequence 16 re-read live `apps/api/src/app.ts`, `apps/api/tests/app.test.ts`, `apps/api/src/db.ts` and `apps/api/src/server.ts` after the first four seams. The smallest remaining owner boundary is the single Fastify `onClose` hook that binds application shutdown to `Database.close()`.

### Current owner

`apps/api/src/app.ts` currently contains:

```ts
app.addHook("onClose", async () => {
  await database.close();
});
```

This is a cross-cutting application lifecycle responsibility rather than business-module composition.

### Target owner

`apps/api/src/app/plugins/database-lifecycle.ts`

with a narrow function such as:

`registerDatabaseLifecycle(app: FastifyInstance, database: Database): void`

The target owner should register only the existing close hook. It must not create/configure the database or own process signals.

### Evidence that this seam is bounded

- `Database` exposes `close(): Promise<void>` as an explicit infrastructure contract.
- `server.ts` creates the database before `buildApp()` and relies on `await app.close()` during SIGTERM/SIGINT and listen failure; therefore the application lifecycle hook is the bridge that closes PostgreSQL during normal Fastify shutdown.
- `server.ts` directly calls `database.close()` only on legacy-startup failure before an app instance exists; that behavior is outside this seam and must remain unchanged.
- `apps/api/tests/app.test.ts` already closes every built Fastify instance, so the lifecycle path is exercised, but the fake database currently has no assertion that `close()` was invoked. The implementation batch should add one focused lifecycle assertion rather than broaden test structure.

### Contracts/order to preserve exactly

1. `buildApp({ config, database })` still receives an already-created `Database` dependency.
2. The database lifecycle hook remains registered on the same Fastify instance returned by `buildApp()`.
3. A normal `await app.close()` awaits `database.close()`; no fire-and-forget or swallowed error is introduced.
4. Registration remains after business-route, health and public-error composition, preserving current lifecycle-registration order.
5. `server.ts` shutdown behavior remains `await app.close()` for SIGTERM/SIGINT and listen failure.
6. Legacy startup failure before `buildApp()` continues to call `database.close().catch(() => undefined)` directly in `server.ts`.
7. Database pool construction/options, query/transaction semantics, migrations/schema and HTTP/business contracts remain unchanged.

### Required parity test for implementation

Add a focused `apps/api/tests/app.test.ts` assertion using a fake database whose `close()` records invocation, proving that closing a built app delegates to the supplied database lifecycle exactly for that app-close path. Do not introduce a general lifecycle framework.

### Explicit non-goals

- no `createDatabase()` move;
- no database configuration/pool tuning;
- no process-signal abstraction;
- no startup-batch change;
- no service graph/container/DI extraction;
- no business-route registry extraction;
- no infrastructure-adapter bundle;
- no transaction/query changes;
- no migrations/schema change;
- no Student frontend change.

### Switch/deletion condition

The fifth seam can be marked DONE only when:

1. `database-lifecycle.ts` is the single owner of Fastify database-close hook registration;
2. `apps/api/src/app.ts` no longer embeds `app.addHook("onClose", ...)` for the database and calls the narrow registration owner instead;
3. focused app lifecycle unit coverage proves `app.close()` delegates to the supplied `Database.close()`;
4. `server.ts` behavior remains unchanged;
5. Architecture Guard, API lint/typecheck/unit/build, clean PostgreSQL and relevant integration/real API + Chromium gates are green on the affected source tree.

### AB-01.4 closure direction after this seam

After database lifecycle extraction, the remaining classes are broad service construction, cross-service composites, whole-product route registration and multi-consumer infrastructure construction. Current evidence does **not** justify moving those wholesale into a giant container/registry during AB-01.4. Unless implementation exposes a new small bounded responsibility, the next discovery should assess **closing AB-01.4 after the fifth seam** and leave workflow-driven module normalization for AB-03/AB-04.

## Remaining app-composition responsibility classes

After selecting the fifth seam, the still-unmoved broad classes are:

- infrastructure adapter construction with multiple business consumers;
- broad module/service construction;
- cross-service composite construction;
- whole-product route registration.

These remain inventory, not permission for mechanical extraction.

## Rejected broad moves remain rejected

- giant `createServices()` container;
- move all route registrations at once;
- create empty target architecture folders;
- DI framework/service locator/interface ceremony;
- bundle DB lifecycle with unrelated composition work;
- schema changes for folder restructuring.

## Exact next step

Implement **only** the selected fifth seam:

1. create the narrow database lifecycle registration owner;
2. switch `app.ts` from inline `onClose` registration to that owner;
3. add focused lifecycle parity coverage in `apps/api/tests/app.test.ts`;
4. do not move database creation, service construction, routes, signals or startup behavior;
5. run Architecture Guard + API quality + clean PostgreSQL + relevant integration/real API + Chromium gates;
6. close the seam only after green evidence, then reassess whether AB-01.4 should end rather than forcing a sixth broad extraction.

## Permanent AB-01.4 law

For every seam:

`inspect current responsibility → select one bounded owner → document contracts/non-goals → implement only that seam → verify exact/source-tree-equivalent gates → close it → only then discover the next seam`