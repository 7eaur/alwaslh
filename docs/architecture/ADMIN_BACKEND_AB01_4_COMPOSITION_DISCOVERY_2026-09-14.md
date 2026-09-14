# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **FOUR SEAMS CLOSED — FIFTH SEAM DISCOVERY NEXT**  
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

## Remaining app-composition responsibility classes

After four closed seams, the live inventory still includes:

- infrastructure adapter construction;
- broad module/service construction;
- cross-service composite construction;
- whole-product route registration;
- database `onClose` lifecycle.

This remains an inventory, **not** permission to extract any item mechanically. A fifth seam must be freshly justified from live code/tests. It is acceptable to conclude that no further small AB-01.4 seam is justified and close AB-01.4 rather than create a giant service container or route registry.

## Rejected broad moves remain rejected

- giant `createServices()` container;
- move all route registrations at once;
- create empty target architecture folders;
- DI framework/service locator/interface ceremony;
- bundle DB lifecycle with unrelated composition work;
- schema changes for folder restructuring.

## Exact next step

Perform **discovery only** for a fifth seam:

1. re-read live `apps/api/src/app.ts` after the four closed extractions;
2. inspect tests/contracts around the remaining responsibilities;
3. select the smallest evidence-backed boundary, if one exists;
4. document current owner, target owner, exact behavior/order contracts, non-goals, switch/deletion condition and required gates;
5. do not implement the fifth seam in the discovery run;
6. if no further small seam is justified, document why AB-01.4 should close instead of forcing extraction.

## Permanent AB-01.4 law

For every seam:

`inspect current responsibility → select one bounded owner → document contracts/non-goals → implement only that seam → verify exact/source-tree-equivalent gates → close it → only then discover the next seam`