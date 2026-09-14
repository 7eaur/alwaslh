# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **THREE SEAMS CLOSED — NEXT DISCOVERY REQUIRED**  
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

## Remaining app-composition responsibility classes

After the first three closures, discovery must re-inspect the live `apps/api/src/app.ts` before selecting another seam. Remaining classes from the original inventory may include:

- Fastify instance construction/options;
- infrastructure adapter construction;
- broad module/service construction;
- cross-service composite construction;
- whole-product route registration;
- database `onClose` lifecycle.

This list is an inventory, **not** permission to extract any item mechanically. The next seam must be selected from live code evidence, existing tests/contracts and a bounded ownership improvement.

## Rejected broad moves remain rejected

- giant `createServices()` container;
- move all route registrations at once;
- create empty target architecture folders;
- DI framework/service locator/interface ceremony;
- bundle DB/error ownership with unrelated composition work;
- schema changes for folder restructuring.

No evidence from the first three closures changes those decisions.

## Exact next step

Perform **discovery only**:

1. re-read live `apps/api/src/app.ts` and relevant direct tests/contracts;
2. identify the smallest remaining responsibility with a real owner boundary;
3. document current owner, target owner, dependency/ordering constraints, behavior contracts, Student/shared impact, explicit non-goals, switch/deletion condition and required verification gates;
4. do **not** implement the newly selected seam in the same discovery increment.

## Permanent AB-01.4 law

For every seam:

`inspect current responsibility → select one bounded owner → document contracts/non-goals → implement only that seam → verify exact/source-tree-equivalent gates → close it → only then discover the next seam`
