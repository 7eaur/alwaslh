# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **TWO EXTRACTIONS VERIFIED — THIRD SEAM DISCOVERY NEXT**  
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

## Rejected broad moves remain rejected

- giant `createServices()` container;
- move all route registrations at once;
- create empty target architecture folders;
- DI framework/service locator/interface ceremony;
- bundle DB/error ownership with unrelated composition work;
- schema changes for folder restructuring.

No evidence from the first two seams changes those decisions.

## Third seam discovery — NEXT / NOT YET SELECTED

The next coherent increment is **discovery only**. It must inspect the remaining inline responsibilities in current `apps/api/src/app.ts` after CORS and health/readiness extraction and select exactly one smallest evidence-backed app-level composition boundary.

Required discovery output:

1. current inline owner/responsibility;
2. target owner/file/function;
3. authoritative tests/contracts proving parity;
4. dependency and ordering constraints;
5. business/security/Student impact assessment;
6. explicit non-goals;
7. switch/deletion condition;
8. exact gates required for implementation closure.

Do **not** implement the third seam in the same discovery increment.

Candidate areas may include public error/not-found handling, database-close lifecycle, or another smaller app-level composition concern, but no candidate is authorized until current code/tests prove it is the smallest correct next seam. Broad service-container or all-route extraction remains rejected.

## Permanent AB-01.4 law

For every seam:

`inspect current responsibility → select one bounded owner → document contracts/non-goals → implement only that seam → verify exact/source-tree-equivalent gates → close it → only then discover the next seam`
