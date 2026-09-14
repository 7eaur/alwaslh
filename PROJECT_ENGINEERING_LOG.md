# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-01.4 backend composition discovery complete; first CORS extraction identified.**

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

- Admin initial JS: **968.68 kB / 193.92 kB gzip**;
- Admin CSS: **91.38 kB / 13.68 kB gzip**;
- Admin unit tests: **71/71**;
- API unit tests: **66/66**;
- clean PostgreSQL 16 migration sequence: green;
- baseline real Chromium Admin acceptance: **9/9 green**.

## C. Root architecture findings retained

- `AB-ARCH-001` Admin composition root too broad: move toward app providers/router/layout and feature public routes.
- `AB-ARCH-002` oversized initial Admin bundle caused by eager workflow imports: substantial route-level lazy boundaries; never hide warnings.
- `AB-ARCH-003` incomplete feature ownership: feature-local contracts/styles/tests plus narrow true shared owners.
- `AB-ARCH-004` private cross-feature coupling: use explicit public contracts/app orchestration.
- `AB-ARCH-005` large feature compositions: rebuild internal ownership where needed rather than moving giant files unchanged.
- `AB-ARCH-101` backend `apps/api/src/app.ts` is a composition hotspot mixing technical setup and broad service/module construction.
- `AB-ARCH-102` backend private cross-module coupling requires narrow public application/read contracts where genuinely needed.

## D. AB-00 — CLOSED

AB-00.1 ownership/boundary map — DONE; AB-00.2 migration/dependency inventory — DONE; AB-00.3 Architecture Guard — DONE/ratchet active; AB-00.4 measured baseline — DONE; AB-00.5 readiness — PASS.

Architecture Guard lives at `scripts/verify-architecture-boundaries.py` + `.github/workflows/admin-backend-architecture-guard.yml`. It rejects new Admin root dumping, shared→app/features, feature→app, app→private feature, private cross-feature, backend app→private module and private cross-module debt. Advance its ratchet only after accepted exact-head-green cleanup.

## E. Branch governance

Work branch: `rebuild/super-admin-foundation`; PR #52 remains Draft.

- never auto-merge;
- never force-reset/force-push shared history;
- never import separate Student frontend implementation;
- compare live `main` before structural phase boundaries;
- if `main` introduces overlapping Admin/API/migrations/shared-contract changes, pause and reconcile.

Latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62` after Student V2 merge #58. Compare against prior reconciled `3053640c...` showed Student frontend/workflow and root documentation only; no scoped implementation conflict for AB-01.4 discovery.

## F. Permanent decisions

Keep one Fastify modular monolith, PostgreSQL/API authority, feature-owned Admin with thin app composition, user-job IA, substantial route code splitting, approved Design System/brand, RTL/a11y/responsive/reduced-motion/product states, controlled replacement with legacy deletion, `packages/ui` only for true cross-product primitives, Admin `shared/ui` for Admin-only patterns, selective backend layers, verified `/app` base, evidence-based performance budgets.

Rejected without evidence: microservices, DI/service locator, generic repositories everywhere, new global state/query library, styling-stack rewrite, artificial tiny splitting and big-bang rewrite.

## G. AB-01 implementation ledger

### AB-01.1 — Shared API transport boundary — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`. Owns fetch/credentials, JSON/blob transport, network/service errors, `ApiRequestError` and missing-session classification. Root `admin-api.ts` re-exports remain transitional only.

### AB-01.2 — Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, `features/auth/public/index.ts`. `App.tsx` no longer owns session state, restore/logout calls or auth error interpretation.

Closure checkpoint `d955a34087552377dc8b426ec1712e57f59fd8f6`: Admin AI `34800888706` SUCCESS; Combined `34800888690` SUCCESS; Stage13G `34800888723` SUCCESS including real Chromium; Architecture Guard `34799891149` SUCCESS on last code head with later docs-only changes.

### AB-01.3 — Product-state primitives — DONE

Source implementation checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

Overview and Operations now share `AdminProductState` + one shared CSS owner for the proven loading/error/retry presentation duplication. Feature state machines, copy, server truth, session handling and retry semantics remain feature-owned. Closure evidence: Architecture Guard `34804704619`, Frontend Preparation `34804704759`, Admin AI `34805721218`, Combined `34805721217`, Stage13G `34805721226` — successful as documented.

### AB-01.4 — DISCOVERY COMPLETE / FIRST IMPLEMENTATION NEXT

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

Worker C inspected `apps/api/src/app.ts`, `config.ts`, `db.ts`, `errors.ts`, `server.ts`, `tests/app.test.ts`, package scripts and representative composite dependencies.

Discovery found eight root responsibility classes in `buildApp()`:

1. Fastify construction options;
2. global CORS/preflight request policy;
3. infrastructure adapter construction;
4. broad module/service construction;
5. cross-service composite construction;
6. whole-product route registration;
7. health/readiness HTTP surface;
8. public error/not-found and database-close lifecycle.

Behavior-sensitive dependency edges include media storage → content/reader consumers; quiz builder → quiz exports; offline + reader + signer → offline downloads; Question Bank + Quiz Builder → AI authoring; quiz builder + database + media storage → specialized exports. `server.ts` separately owns env/config load, database creation, legacy startup batch, signals and listen.

First seam decision: **extract only CORS/preflight policy** to `apps/api/src/app/plugins/cors.ts` as `registerCorsPolicy(app, config)`. Preserve direct `app.addHook("onRequest")` semantics and invocation before business route registration. Do not introduce `app.register()` encapsulation in the first move because scope behavior could change.

Direct parity contract: `apps/api/tests/app.test.ts` allowed/denied CORS tests. Post-implementation gates: Architecture Guard, API lint/typecheck/unit/build, current Combined integration/real browser and Stage13G/equivalent. No migration required. CORS is global browser transport policy, so semantics for both Admin and Student origins must remain unchanged; no Student frontend restructuring is needed.

Explicitly rejected as first moves: giant service container, all-route extraction, empty architecture scaffolding, or bundling DB/error ownership into the same increment.

### AB-01.5 — PENDING

Only justified common backend technical ownership.

### AB-01.6 — PENDING

Full foundation closure after remaining AB-01 work.

## H. Alternating execution governance

Binding protocol: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`. Live handoff: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`.

Workers A/B/C share one roadmap and branch, execute one smallest coherent increment at `:00/:20/:40`, and leave exact HEAD/CI/next-step evidence. After verified AB-08 completion, the proving worker disables all three scheduled tasks.

## I. Remaining roadmap

- AB-00 — DONE
- AB-01 — ACTIVE; first AB-01.4 CORS extraction next
- AB-02 — thin Admin shell/router/providers/layouts + major lazy routes
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence audit
- AB-06 — performance/delivery validation and evidence-based budgets
- AB-07 — legacy deletion + hard dependency enforcement
- AB-08 — final Admin + Backend verification and live-main reconciliation

## J. Exact continuation

Never infer the next mutation from this log alone. Read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first. Current durable continuation: implement only the documented AB-01.4 CORS/preflight extraction, then verify exact-head gates before selecting a second composition seam.
