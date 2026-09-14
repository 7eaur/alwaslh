# AB-01 — Admin + Backend Foundation Execution

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**

AB-01 creates only structural foundations required for later slices. No business-workflow redesign, framework ceremony, tuning mixed with ownership extraction, or folder movement for appearance.

Root-fix law:

`use case → authority/contract → owner → replacement → verification → switch → legacy removal condition`

## AB-01.1 — Shared API transport — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

## AB-01.2 — Auth/session ownership — DONE

Owner: `apps/admin-web/src/features/auth/` with API, SessionProvider and public entry point. Root `LoginScreen.tsx` remains transitional presentation debt for AB-02.

## AB-01.3 — Product-state primitive — DONE

Source checkpoint `cfa2016e056f6dc4f9669236414a7acbd9551011`; shared Admin loading/error/retry presentation is owned by `shared/ui` while feature state machines and server truth remain feature-owned.

## AB-01.4 — Backend app composition foundation — ACTIVE

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

### CORS/preflight — DONE

Source `dbdc9245f2d0e283d047d7e1254748e55f890a55`; owner `apps/api/src/app/plugins/cors.ts`; required gates green.

### Health/readiness — DONE

Source `a302871b3486ae95810cea40dccca68363a29055`; owner `apps/api/src/app/http/health.ts`; required gates green.

### Public not-found/error handling — DONE

Source `001d45892bf4a17458f3beaeaaa1a7430be49b44`; owner `apps/api/src/app/http/public-errors.ts`; required source-tree-equivalent gates green.

### Fastify instance construction/options — DONE

Source implementation HEAD: `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

Implemented owner:

`apps/api/src/app/create-fastify-instance.ts`

with narrow `createFastifyInstance(config: AppConfig): FastifyInstance` responsibility.

`apps/api/src/app.ts` calls that owner and no longer imports `Fastify` as a value or embeds constructor options.

Preserved exactly:

- silent log level disables logger, otherwise `{ level: config.LOG_LEVEL }`;
- `disableRequestLogging: false`;
- `trustProxy: true`;
- `bodyLimit: 1_048_576`;
- `requestTimeout: 15_000`;
- one Fastify instance per `buildApp()` invocation;
- all downstream service construction, plugin/route registration, health/error registration and database close ordering.

Non-goals remained untouched: service graph/container/DI, business route registry, DB lifecycle, config/default tuning, migrations/schema and Student frontend.

Closure evidence:

- Architecture Guard `34820842164` — SUCCESS on source implementation HEAD.
- Original source-head Combined `34820842196`, Stage13G `34820842163`, and Admin AI `34820842245` were cancelled by later documentation commits rather than a demonstrated code failure.
- Compare `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d...248ce58053bca9d97498d41fdda57aec1ace4033` contains only five canonical documentation files; no source/migration/workflow/test file changed.
- Admin AI `34821032274` — SUCCESS including API quality, clean PostgreSQL, contracts, authorization/review controls, Stage12 and auth security regressions.
- Combined Integration `34821032272` — SUCCESS including API/Admin quality, clean PostgreSQL, DB contract, backend/auth regressions and real Admin Chromium.
- Stage13G `34821032271` — SUCCESS including Admin/API quality, clean PostgreSQL, all Stage13G integration/auth regressions and real API + PostgreSQL + Chromium.

Switch/deletion condition is satisfied; this seam is closed.

### Exact next AB-01.4 action

Perform **discovery only** for a fifth seam. Re-read live `apps/api/src/app.ts`, remaining composition responsibilities and current tests/contracts. Select one smallest evidence-backed boundary, document current/target owner, exact preserved contracts/order, non-goals, switch condition and gates. Do not implement it in the discovery run. If no further small seam is justified, document why AB-01.4 should close instead of forcing extraction.

## AB-01.5 — Common backend technical ownership — PENDING

Normalize only proven cross-cutting technical concerns. Domain/business rules remain with module owners.

## AB-01.6 — Foundation closure gate — PENDING

Requires one-owner foundations, no new dependency violations, bounded compatibility debt, Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integration/security/auth and real API + PostgreSQL + Chromium evidence, with docs matching code.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 design/interaction convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.