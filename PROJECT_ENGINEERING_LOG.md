# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — fourth AB-01.4 Fastify construction seam verified and closed; fifth-seam discovery is next.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Frozen baseline

Admin initial JS **968.68 kB / 193.92 kB gzip**; CSS **91.38 kB / 13.68 kB gzip**; Admin unit **71/71**; API unit **66/66**; clean PostgreSQL 16 migrations green; baseline real Chromium **9/9**.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the live serial handoff. Never auto-merge or rewrite shared history.

Current live `main` observed in Worker B sequence 15: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; this is the Student Experience V2 merge checkpoint and does not overlap the current AB-01 API seam.

## Architecture decisions

Keep one Fastify modular monolith over PostgreSQL; Admin app composition stays thin; feature internals remain private; cross-feature/module use narrow public contracts where needed; no microservices, DI/service locator, universal repositories, global state framework or styling rewrite without evidence.

## AB-00 — DONE

Ownership/boundary map, dependency inventory, Architecture Guard, measured baseline and readiness gate are closed.

## AB-01 ledger

### AB-01.1 — DONE

Shared Admin API transport owner: `apps/admin-web/src/shared/api/client.ts`.

### AB-01.2 — DONE

Auth/session owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, public entry `features/auth/public/index.ts`.

### AB-01.3 — DONE

Minimum proven Admin product-state primitive closed at source checkpoint `cfa2016e056f6dc4f9669236414a7acbd9551011`.

### AB-01.4 — ACTIVE

#### CORS/preflight — DONE

Source `dbdc9245f2d0e283d047d7e1254748e55f890a55`; verified by Architecture Guard, Admin AI, Combined and Stage13G.

#### Health/readiness — DONE

Source `a302871b3486ae95810cea40dccca68363a29055`; owner `apps/api/src/app/http/health.ts`; full quality/PostgreSQL/integration/Chromium evidence green.

#### Public not-found/error — DONE

Source `001d45892bf4a17458f3beaeaaa1a7430be49b44`; owner `apps/api/src/app/http/public-errors.ts`; full source-tree-equivalent gates green.

#### Fastify construction/options — DONE

Source implementation HEAD: `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

Owner: `apps/api/src/app/create-fastify-instance.ts` with narrow `createFastifyInstance(config: AppConfig): FastifyInstance` responsibility.

`apps/api/src/app.ts` now delegates Fastify construction/options to that owner and no longer imports Fastify as a value or embeds constructor options.

Preserved exactly:

- silent logger → `false`, otherwise `{ level: config.LOG_LEVEL }`;
- `disableRequestLogging: false`;
- `trustProxy: true`;
- `bodyLimit: 1_048_576`;
- `requestTimeout: 15_000`;
- one instance per `buildApp()`;
- all downstream service construction, route/plugin/error/health registration and database-close ordering.

Explicitly untouched: service graph, business routes, DB lifecycle, config defaults, migrations/schema and Student frontend.

Closure evidence:

- Architecture Guard `34820842164` — SUCCESS on source implementation HEAD.
- Source-head Combined `34820842196`, Stage13G `34820842163`, Admin AI `34820842245` were cancelled by later documentation commits; no code-failure evidence was observed.
- Compare `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d...248ce58053bca9d97498d41fdda57aec1ace4033` contains only `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, `ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`, and `ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`.
- Admin AI `34821032274` — SUCCESS: API lint/typecheck/unit/build, clean PostgreSQL, DB contracts, authorization/review controls, Stage12 regressions and auth security regression.
- Combined `34821032272` — SUCCESS: API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth-security regressions, deterministic fixtures and real Admin Chromium.
- Stage13G `34821032271` — SUCCESS: Admin UI quality, API lint/typecheck/unit/build, clean PostgreSQL, Accounts+Access, Notifications+Operations, Reports+Settings+Security+Audit, AI authoring, Access/Auth regressions and real API + PostgreSQL + Chromium.

Conclusion: switch/deletion condition is satisfied; fourth seam is closed.

No fifth seam was implemented or selected in Worker B sequence 15.

### AB-01.5 — PENDING

Only justified shared backend technical ownership.

### AB-01.6 — PENDING

Foundation exact-head closure gate.

## Exact continuation

Perform fifth AB-01.4 seam **discovery only**: inspect live `apps/api/src/app.ts`, current tests/contracts and remaining responsibilities; select one smallest evidence-backed owner boundary; document contracts/order/non-goals/gates; do not implement the fifth seam in the discovery run.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.