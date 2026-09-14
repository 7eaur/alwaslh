# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — fourth AB-01.4 Fastify construction seam implemented; required runtime/integration CI still active.**

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

Current live `main` observed in sequence 14: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; this is the Student Experience V2 merge checkpoint and does not overlap the current AB-01 API seam.

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

#### Fastify construction/options — IMPLEMENTED / WAITING FOR REQUIRED CI

Worker A sequence 14 source implementation HEAD: `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

Created `apps/api/src/app/create-fastify-instance.ts` with narrow `createFastifyInstance(config: AppConfig): FastifyInstance` ownership.

Changed `apps/api/src/app.ts` only enough to:

- import `FastifyInstance` as a type;
- call `createFastifyInstance(config)`;
- remove direct Fastify value construction/options.

Preserved exactly:

- silent logger → `false`, otherwise `{ level: config.LOG_LEVEL }`;
- `disableRequestLogging: false`;
- `trustProxy: true`;
- `bodyLimit: 1_048_576`;
- `requestTimeout: 15_000`;
- one instance per `buildApp()`;
- all downstream service construction, route/plugin/error/health registration and database-close ordering.

Explicitly untouched: service graph, business routes, DB lifecycle, config defaults, migrations/schema and Student frontend.

Verification at handoff:

- Architecture Guard `34820842164` — **SUCCESS**.
- Combined `34820842196` — **IN PROGRESS**.
- Stage13G `34820842163` — **IN PROGRESS**.
- Admin AI `34820842245` — **QUEUED**.

The seam is not DONE until required affected gates finish green.

### AB-01.5 — PENDING

Only justified shared backend technical ownership.

### AB-01.6 — PENDING

Foundation exact-head closure gate.

## Exact continuation

Inspect runs `34820842196`, `34820842163`, `34820842245`. If all relevant gates are green, document Fastify construction/options as DONE before performing discovery for any fifth AB-01.4 seam. If one fails, inspect its failing step/log and repair only the root cause of this extraction.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.
