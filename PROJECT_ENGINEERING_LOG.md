# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — second AB-01.4 composition seam implemented; verification still active.**

## A. Durable authority invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `apps/student-web` — separate Student frontend workstream; not an implementation target here.
- Student-facing backend contracts remain owned here.
- Browser state is never canonical business authority.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority remains server-owned.
- Tests represent production contracts; validation/security is never weakened to satisfy fixtures.

## B. Frozen safety baseline

Admin initial JS **968.68 kB / 193.92 kB gzip**; Admin CSS **91.38 kB / 13.68 kB gzip**; Admin unit **71/71**; API unit **66/66**; clean PostgreSQL 16 migrations green; baseline real Chromium **9/9**.

## C. Root architecture findings retained

- `AB-ARCH-001` Admin composition root too broad.
- `AB-ARCH-002` oversized initial Admin bundle from eager workflow imports.
- `AB-ARCH-003` incomplete feature ownership.
- `AB-ARCH-004` private cross-feature coupling.
- `AB-ARCH-005` large feature compositions.
- `AB-ARCH-101` backend `apps/api/src/app.ts` mixes technical setup, lifecycle, service graph and route composition.
- `AB-ARCH-102` backend private cross-module coupling needs narrow public application/read contracts where justified.

## D. AB-00 — CLOSED

AB-00.1 ownership/boundary map — DONE; AB-00.2 migration/dependency inventory — DONE; AB-00.3 Architecture Guard — DONE/ratchet active; AB-00.4 measured baseline — DONE; AB-00.5 readiness — PASS.

## E. Branch governance

Work branch: `rebuild/super-admin-foundation`; PR #52 remains Draft. Never auto-merge or force shared history. Latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; the observed delta is Student frontend/workflow + root documentation only and does not overlap current scoped implementation.

## F. Permanent decisions

Keep one Fastify modular monolith, PostgreSQL/API authority, feature-owned Admin with thin app composition, user-job IA, substantial route code splitting, approved Design System/brand, RTL/a11y/responsive/reduced-motion/product states, controlled replacement with legacy deletion, `packages/ui` only for true cross-product primitives, Admin `shared/ui` for Admin-only patterns, selective backend layers, verified `/app` base, evidence-based performance budgets.

Rejected without evidence: microservices, DI/service locator, universal repositories/interfaces, new global state/query library, styling-stack rewrite, artificial tiny splitting and big-bang rewrite.

## G. AB-01 implementation ledger

### AB-01.1 — Shared API transport boundary — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

### AB-01.2 — Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, `features/auth/public/index.ts`.

### AB-01.3 — Product-state primitives — DONE

Source implementation checkpoint `cfa2016e056f6dc4f9669236414a7acbd9551011`; minimum duplicated loading/error/retry presentation extracted to `shared/ui/AdminProductState` with successful architecture/integration/Chromium closure evidence already recorded.

### AB-01.4 — ACTIVE

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

#### First composition seam — CORS/preflight — DONE

Source HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

- `apps/api/src/app/plugins/cors.ts` owns the existing global CORS/preflight policy;
- `registerCorsPolicy(app, config)` preserves direct `onRequest` behavior, origin filtering, credentials, `Vary`, methods/headers and rejected-preflight semantics;
- Architecture Guard `34808159011`, Admin AI `34809211720`, Combined `34809211704`, Stage13G `34809211707` — SUCCESS.

#### Second composition seam — health/readiness — IMPLEMENTED / WAITING_FOR_CI

Source implementation HEAD: `a302871b3486ae95810cea40dccca68363a29055`.

Implemented:

- created `apps/api/src/app/http/health.ts`;
- `registerHealthRoutes(app, database)` is now the sole owner of `/health` and `/ready` handlers;
- `apps/api/src/app.ts` retains one composition call at the same relative position;
- liveness remains process-only and independent from PostgreSQL;
- readiness still calls only `database.ping()` and preserves the same success body, failure log message, 503 status and `not_ready` body;
- direct tests in `apps/api/tests/app.test.ts` remain unchanged as parity authority;
- public errors/not-found, DB close lifecycle, database setup, server startup/signals, service graph, migrations/schema and Student frontend were intentionally untouched.

Verification observed at handoff:

- Architecture Guard `34811642661` — SUCCESS;
- Combined Integration `34811642693` — pending/running;
- Stage13G `34811642622` — pending/running;
- Admin AI `34811642629` — running.

The second seam is not DONE until the pending API/PostgreSQL/integration/real Chromium evidence is green on the source tree. No third seam is authorized before closure.

### AB-01.5 — PENDING

Only justified common backend technical ownership.

### AB-01.6 — PENDING

Full foundation closure after remaining AB-01 work.

## H. Alternating execution governance

Binding protocol: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`; live handoff: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. Workers A/B/C share one branch and roadmap and execute one smallest coherent increment at a time.

## I. Remaining roadmap

AB-01 active → AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.

## J. Exact continuation

Read the live execution-state file first. Current durable continuation: **inspect the source-tree gates for the health/readiness extraction; close the seam only if green, otherwise fix the root cause. Do not select a third composition seam before closure.**