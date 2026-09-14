# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **FIRST EXTRACTION VERIFIED — SECOND DISCOVERY NEXT**  
Branch: `rebuild/super-admin-foundation`  
Initial discovery starting HEAD: `60151da0cdcf56d61f5d68ea5cdd3d329523f2a9`

## Purpose

Incrementally thin `apps/api/src/app.ts` without changing business rules, HTTP contracts, database schema, security semantics or the single Fastify modular-monolith deployment model. Every extraction must establish a real owner, preserve behavior and be verified before selecting another seam.

## Original composition findings

`buildApp()` owns eight responsibility classes:

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

## Exact next increment — SECOND DISCOVERY ONLY

The next worker must re-inspect the remaining live `apps/api/src/app.ts` after CORS removal and select **one** next smallest app-level technical/composition seam. The discovery must establish:

1. current owner and exact lines/responsibilities;
2. proposed target owner and why it reduces root responsibility rather than moves code cosmetically;
3. ordering/construction/registration dependencies;
4. business/security/Student-facing impact;
5. direct parity tests/contracts and missing test need if any;
6. exact required gates;
7. explicit non-goals and legacy/deletion condition.

Do **not** implement the selected second seam in the same discovery increment. The purpose is to avoid architecture-by-momentum and keep each root change small, reviewable and evidence-backed.