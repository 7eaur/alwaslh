# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **THREE SEAMS CLOSED — FOURTH SEAM SELECTED / IMPLEMENTATION NEXT**  
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

### Implemented owner

`apps/api/src/app/http/public-errors.ts`

with:

`registerPublicErrorHandlers(app)`

The helper owns only:

- `app.setNotFoundHandler(...)` producing the canonical public 404 envelope;
- `app.setErrorHandler(...)` converting thrown errors through existing `toPublicError(error)`, preserving 5xx-only server logging and mapped public status/body.

`apps/api/src/app.ts` now composes this helper after health registration and no longer owns those inline handlers or imports `toPublicError` directly.

### Preserved contracts

- unknown route → HTTP 404;
- exact body `{ error: { code: "NOT_FOUND", message: "المسار غير موجود" } }`;
- existing `toPublicError(error)` remains the single mapping authority;
- mapped status/body semantics unchanged;
- only mapped status >= 500 logs `request.log.error({ err: error }, "request failed")`;
- ordering remains after business routes/health registration;
- database `onClose` remains outside the helper.

### Scope intentionally untouched

- database lifecycle;
- Fastify construction/options;
- service/composite graph;
- business route registry;
- migrations/schema;
- Student frontend.

### Closure evidence

- Architecture Guard `34816433721` — SUCCESS on source implementation HEAD;
- compare `001d45892bf4a17458f3beaeaaa1a7430be49b44...068ee06cf7fec442b95ddada2667d8aac5d1c2a2` contains documentation files only, proving later verification exercised the same affected source tree;
- Admin AI `34816613371` — SUCCESS;
- Combined `34816613431` — SUCCESS including API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth-security regressions, deterministic fixtures and real Admin Chromium;
- Stage13G `34816613493` — SUCCESS including Admin UI quality, API lint/typecheck/unit/build, clean PostgreSQL, Accounts+Access, Notifications+Operations, Reports+Settings+Security+Audit, AI authoring, Access/Auth regressions, and real API + PostgreSQL + Chromium.

Conclusion: switch/deletion condition is satisfied and the third seam is **DONE**.

## Fourth seam — Fastify instance construction/options — SELECTED / IMPLEMENTATION NEXT

Discovery checkpoint starts from branch HEAD `2722de7d1d4d09f2eae7e3f9dc35624255f392fa`; Worker C reserved discovery at `0b522a7de907c5bcbcc1af78a6db33db8fc6cbae`.

### Evidence

Live `apps/api/src/app.ts` still constructs the Fastify instance directly before all service construction and route/plugin registration. `apps/api/tests/app.test.ts` uses `buildApp({ config, database })` as the bootstrap contract and verifies health/readiness, CORS and public-error outcomes, but there is no dedicated test authorizing different Fastify construction values. Therefore the existing options are treated as behavioral configuration to preserve exactly, not as tuning opportunities.

Current construction contract:

```ts
Fastify({
  logger: config.LOG_LEVEL === "silent" ? false : { level: config.LOG_LEVEL },
  disableRequestLogging: false,
  trustProxy: true,
  bodyLimit: 1_048_576,
  requestTimeout: 15_000,
})
```

### Current owner

`apps/api/src/app.ts` owns both composition and low-level Fastify instance options.

### Target owner

Create the narrow app-composition helper:

`apps/api/src/app/create-fastify-instance.ts`

with a small function such as:

`createFastifyInstance(config: AppConfig): FastifyInstance`

The helper owns **only** Fastify construction/options. `buildApp()` remains the composition entry point and continues to construct services, register routes/policies and return the instance.

### Contracts that must remain exact

- `LOG_LEVEL === "silent"` disables the Fastify logger exactly as today;
- all other supported log levels continue as `{ level: config.LOG_LEVEL }`;
- `disableRequestLogging: false`;
- `trustProxy: true`;
- `bodyLimit: 1_048_576` bytes;
- `requestTimeout: 15_000` ms;
- one Fastify instance per `buildApp()` call;
- the instance exists before service construction and every hook/route/error registration;
- no change to config parsing/defaults, HTTP surface, auth/security behavior, database behavior or registration order after construction.

### Explicit non-goals

This implementation must **not**:

- tune logger/request/body/proxy options;
- change `AppConfig` parsing or defaults;
- create a DI container/service locator;
- move service graph construction;
- move business route registration;
- move database `onClose` lifecycle;
- bundle another app-composition seam into the same change;
- change migrations/schema;
- modify Student frontend.

### Switch/deletion condition

The fourth seam is switched only when:

1. the new helper is the single owner of `Fastify(...)` construction/options;
2. `apps/api/src/app.ts` no longer imports `Fastify` as a value or embeds those option literals;
3. `buildApp()` still returns the same `FastifyInstance` contract and composes the same downstream owners/order;
4. source-head/exact-head verification is green.

### Required implementation verification

At minimum:

- Architecture Guard;
- API lint + strict typecheck + unit tests + build;
- existing `apps/api/tests/app.test.ts` bootstrap/HTTP outcomes;
- clean PostgreSQL and relevant integration/auth/security regressions;
- real API + PostgreSQL + Chromium/combined gates used by this workstream.

A focused construction test may be added only if it asserts durable behavior rather than private implementation shape; no test should authorize changing the preserved values in the extraction batch.

### Shared / Student impact

No HTTP/database/shared contract is intentionally changed. Student frontend is untouched. Student-facing server behavior remains covered by the unchanged `buildApp()` bootstrap and existing integration/security gates.

## Remaining app-composition responsibility classes

After the first three closures and fourth-seam selection, the remaining inventory still includes:

- infrastructure adapter/service graph construction;
- broad module/service and cross-service composite construction;
- whole-product route registration;
- database `onClose` lifecycle.

This remains an inventory, **not** permission to extract any item mechanically. The next seam after the Fastify construction extraction must be freshly discovered only after the fourth seam is verified closed.

## Rejected broad moves remain rejected

- giant `createServices()` container;
- move all route registrations at once;
- create empty target architecture folders;
- DI framework/service locator/interface ceremony;
- bundle DB/error ownership with unrelated composition work;
- schema changes for folder restructuring.

No evidence from the first three closures changes those decisions.

## Exact next step

Implement **only** the selected Fastify construction/options seam:

1. create `apps/api/src/app/create-fastify-instance.ts`;
2. preserve the current options and config semantics exactly;
3. have `buildApp()` call that owner while leaving service graph, routes and DB lifecycle untouched;
4. run the required source-head/exact-head gates;
5. document closure before discovering any fifth seam.

## Permanent AB-01.4 law

For every seam:

`inspect current responsibility → select one bounded owner → document contracts/non-goals → implement only that seam → verify exact/source-tree-equivalent gates → close it → only then discover the next seam`
