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

Verification:

- Architecture Guard `34808159011` — SUCCESS on source HEAD;
- source HEAD → verification HEAD `3d281eddcdaf4a8d75d810dc0e5ded5a35392cad` differs only in autonomous execution-state documentation;
- Stage13E Admin AI `34809211720` — SUCCESS;
- Stage13E Combined Integration `34809211704` — SUCCESS;
- Stage13G `34809211707` — SUCCESS including real API + PostgreSQL + Chromium.

Conclusion: first AB-01.4 seam is **DONE**.

### Second seam — HEALTH/READINESS IMPLEMENTED / WAITING_FOR_CI

Source implementation HEAD: `a302871b3486ae95810cea40dccca68363a29055`.

Implemented exactly the selected bounded app-level responsibility:

- created `apps/api/src/app/http/health.ts`;
- `registerHealthRoutes(app, database)` now owns `GET /health` and `GET /ready`;
- `apps/api/src/app.ts` imports and invokes the health owner at the same relative position after business route registration and before not-found/error/onClose handling;
- `/health` still returns `{ status: "ok", service: "alwaslh-api" }` without calling PostgreSQL;
- `/ready` still uses only `database.ping()`, returns `{ status: "ready" }` on success, logs `database readiness check failed` on ping failure, and returns 503 `{ status: "not_ready" }`;
- the existing three direct health/readiness tests remain unchanged as parity authority;
- public error/not-found handlers, database-close lifecycle, database construction/config, `server.ts`, service graph, migrations/schema and Student frontend were untouched.

Verification status on the source HEAD:

- Architecture Guard `34811642661` — **SUCCESS**;
- Stage13E Combined Integration `34811642693` — running/pending at this handoff;
- Stage13G `34811642622` — running/pending at this handoff;
- Stage13E Admin AI `34811642629` — running at this handoff.

Therefore the second seam is **not DONE yet**. Required closure still needs the pending API/integration/PostgreSQL/real Chromium evidence to become green on the source tree. No third composition seam may be selected before that closure.

## AB-01.5 — Common backend technical ownership — PENDING

Normalize only proven cross-cutting technical concerns such as public error mapping, auth/session helpers, PostgreSQL connection/transaction helpers, observability hooks or media technical helpers when genuinely shared. Domain/business rules stay with module owners.

## AB-01.6 — Foundation closure gate — PENDING

AB-01 closes only when Admin transport has one owner, auth/session has one feature owner/public contract, common product states have explicit reusable ownership, backend app composition is thinner without behavior loss, no new private dependency violations exist, compatibility bridges have removal conditions, Architecture Guard passes, Admin/API quality passes, clean PostgreSQL passes, real API + PostgreSQL + Chromium passes, and docs match code.

## After AB-01

AB-02 thin Admin shell/router/providers/layouts/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend normalization; AB-05 design/interaction convergence; AB-06 performance/delivery; AB-07 legacy removal/hard enforcement; AB-08 final full verification and live-main reconciliation.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.