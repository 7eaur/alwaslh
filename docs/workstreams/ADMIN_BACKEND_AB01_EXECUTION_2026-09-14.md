# AB-01 — Admin + Backend Foundation Execution

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**  
Parent roadmap: `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`

## Objective

AB-01 creates only structural foundations required for later end-to-end slices. It does not redesign business workflows, introduce framework ceremony, or move files for appearance.

Root-fix law:

`use case → authority/contract → owner → replacement → verification → switch → legacy removal condition`

## AB-01.1 — Shared API transport boundary — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`. Owns only base URL resolution, credentialed fetch, JSON/blob transport, public API error normalization, network/service errors and missing-session classification. Root `admin-api.ts` compatibility re-exports remain transitional until feature adapters migrate.

## AB-01.2 — Auth/session ownership — DONE

Owner: `apps/admin-web/src/features/auth/` with `api/admin-auth-api.ts`, `model/AdminSessionProvider.tsx` and `public/index.ts`. `App.tsx` no longer owns session state, restore/logout calls or auth error interpretation. Root `LoginScreen.tsx` remains transitional presentation debt to close before AB-02 finishes.

Closure checkpoint: `d955a34087552377dc8b426ec1712e57f59fd8f6`; Admin AI `34800888706`, Combined `34800888690`, Stage13G `34800888723` successful; Architecture Guard `34799891149` successful on last code head with later documentation-only changes.

## AB-01.3 — Product-state primitives — DONE

Source implementation checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

Implemented the smallest proven reusable Admin-only loading/error/retry presentation shell:

- `apps/admin-web/src/shared/ui/AdminProductState.tsx`;
- `apps/admin-web/src/shared/ui/admin-product-state.css`;
- Overview and Operations consume it;
- feature state machines, server copy/truth, retry/session semantics remain feature-owned.

Closure evidence: Architecture Guard `34804704619`, Frontend Preparation `34804704759`, Admin AI `34805721218`, Combined `34805721217`, Stage13G `34805721226` — successful over the same source tree as documented.

## AB-01.4 — Backend app composition foundation — ACTIVE

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

### First seam — CORS/preflight app policy — DONE

Source implementation HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

Implemented ownership:

- `apps/api/src/app/plugins/cors.ts` owns global CORS/preflight registration;
- `registerCorsPolicy(app, config)` derives origins through the existing `allowedOrigins(config)` contract and registers the same direct `onRequest` hook;
- `apps/api/src/app.ts` invokes it at the same pre-route lifecycle point;
- existing allowed-origin headers, credentials, `Vary: Origin`, OPTIONS methods/headers and rejected-preflight `AppError("FORBIDDEN", ..., 403)` semantics are preserved;
- health/readiness, public error mapping, database close lifecycle, service graph and all business route registrations were deliberately untouched.

Verification: Architecture Guard `34808159011`, Admin AI `34809211720`, Combined `34809211704`, Stage13G `34809211707` — SUCCESS.

### Second seam — health/readiness HTTP ownership — DONE

Source implementation HEAD: `a302871b3486ae95810cea40dccca68363a29055`.

Implemented exactly the selected bounded app-level responsibility:

- created `apps/api/src/app/http/health.ts`;
- `registerHealthRoutes(app, database)` owns `GET /health` and `GET /ready`;
- route paths/methods/statuses/bodies and readiness failure logging remain unchanged;
- readiness still calls only `database.ping()`;
- public error/not-found, DB close lifecycle, database construction/config, `server.ts`, service/composite graph, migrations/schema and Student frontend were untouched.

Closure evidence: Architecture Guard `34811642661`; source-tree-equivalent Admin AI `34811809959`, Combined `34811809962`, Stage13G `34811810021` — SUCCESS.

### Third seam — public error/not-found HTTP ownership — DONE

Source implementation HEAD: `001d45892bf4a17458f3beaeaaa1a7430be49b44`.

Implemented exactly the selected app-level HTTP presentation boundary:

- created `apps/api/src/app/http/public-errors.ts`;
- `registerPublicErrorHandlers(app)` owns `setNotFoundHandler` and `setErrorHandler`;
- `apps/api/src/app.ts` composes that owner after health registration and no longer owns the inline handler bodies or imports `toPublicError` directly;
- existing `toPublicError(error)` remains the canonical public-error mapping authority;
- unknown routes still return 404 + `{ error: { code: "NOT_FOUND", message: "المسار غير موجود" } }`;
- mapped statuses/bodies remain unchanged;
- `request.log.error({ err: error }, "request failed")` remains 5xx-only;
- database `onClose`, Fastify construction/options, service graph, business route registry, migrations/schema and Student frontend were untouched.

Closure evidence:

- Architecture Guard `34816433721` — SUCCESS on source implementation HEAD;
- compare `001d45892bf4a17458f3beaeaaa1a7430be49b44...068ee06cf7fec442b95ddada2667d8aac5d1c2a2` changed only `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, and `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`;
- source-tree-equivalent Admin AI `34816613371` — SUCCESS;
- Combined `34816613431` — SUCCESS including API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth-security regressions and real Admin Chromium;
- Stage13G `34816613493` — SUCCESS including Admin/API quality, clean PostgreSQL, relevant integrations/auth regression and real API + PostgreSQL + Chromium.

Conclusion: third AB-01.4 seam is **DONE**.

### Fourth seam — Fastify instance construction/options — SELECTED / IMPLEMENTATION NEXT

Discovery checkpoint: starting branch HEAD `2722de7d1d4d09f2eae7e3f9dc35624255f392fa`; Worker C reservation commit `0b522a7de907c5bcbcc1af78a6db33db8fc6cbae`.

Target owner: `apps/api/src/app/create-fastify-instance.ts` via a narrow `createFastifyInstance(config: AppConfig): FastifyInstance` helper.

The extraction must preserve exactly:

- silent log level disables logger; other supported levels use `{ level: config.LOG_LEVEL }`;
- `disableRequestLogging: false`;
- `trustProxy: true`;
- `bodyLimit: 1_048_576`;
- `requestTimeout: 15_000`;
- one instance per `buildApp()` call and current downstream composition/registration ordering.

Evidence: live `app.ts` still owns the constructor/options; `apps/api/tests/app.test.ts` exercises `buildApp()` as the bootstrap contract but does not authorize option tuning. Therefore extraction and tuning are intentionally separate concerns.

Non-goals: no service container/DI; no service graph or business route move; no DB lifecycle move; no config/default change; no schema/migration/Student frontend change.

Switch condition: the new helper becomes the single value owner of `Fastify(...)`; `app.ts` no longer imports Fastify as a value or embeds those option literals; `buildApp()` contract and all downstream behavior/order remain unchanged; required source-head/exact-head gates are green.

Required closure gates: Architecture Guard, API lint/typecheck/unit/build including existing `app.test.ts`, clean PostgreSQL, relevant integration/auth/security regressions, and the workstream real API/PostgreSQL/Chromium/combined gates.

### Next AB-01.4 action

Implement **only** the selected Fastify instance construction/options seam. Do not discover or combine a fifth seam until that implementation has passed the required gates and been documented closed.

## AB-01.5 — Common backend technical ownership — PENDING

Normalize only proven cross-cutting technical concerns such as auth/session helpers, PostgreSQL connection/transaction helpers, observability hooks or media technical helpers when genuinely shared. Domain/business rules stay with module owners. Public HTTP error registration now has its bounded app-level owner; do not redesign `toPublicError` without separate evidence.

## AB-01.6 — Foundation closure gate — PENDING

AB-01 closes only when Admin transport has one owner, auth/session has one feature owner/public contract, common product states have explicit reusable ownership, backend app composition is thinner without behavior loss, no new private dependency violations exist, compatibility bridges have removal conditions, Architecture Guard passes, Admin/API quality passes, clean PostgreSQL passes, real API + PostgreSQL + Chromium passes, and docs match code.

## After AB-01

AB-02 thin Admin shell/router/providers/layouts/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend normalization; AB-05 design/interaction convergence; AB-06 performance/delivery; AB-07 legacy removal/hard enforcement; AB-08 final full verification and live-main reconciliation.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.