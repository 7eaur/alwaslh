# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — fifth AB-01.4 database lifecycle seam selected; implementation is next.**

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

Current live `main` observed in Worker C sequence 16: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; this is the Student Experience V2 merge checkpoint and does not overlap the current AB-01 API seam.

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

Preserved exactly: logger mode, request logging, trust proxy, body limit, request timeout, one instance per `buildApp()`, downstream service/route/plugin/error/health/database-close ordering. Service graph, business routes, DB lifecycle, config defaults, migrations/schema and Student frontend were untouched.

Closure evidence: Architecture Guard `34820842164`, Admin AI `34821032274`, Combined `34821032272`, Stage13G `34821032271` — successful/source-tree-equivalent green. Fourth seam closed.

#### Fifth seam — database lifecycle registration — SELECTED / NOT IMPLEMENTED

Worker C sequence 16 inspected live `apps/api/src/app.ts`, `apps/api/tests/app.test.ts`, `apps/api/src/db.ts` and `apps/api/src/server.ts`.

Current owner is the inline `app.addHook("onClose", ...)` in `app.ts` that awaits `database.close()`.

Target owner: `apps/api/src/app/plugins/database-lifecycle.ts` with one narrow `registerDatabaseLifecycle(app, database)` responsibility.

Evidence:

- `Database.close(): Promise<void>` is an explicit infrastructure contract.
- `server.ts` relies on `app.close()` during SIGTERM/SIGINT and listen failure, so the hook is a real application lifecycle boundary.
- legacy startup failure closes the database directly before `buildApp()` exists; that path must remain unchanged.
- `app.test.ts` closes every built app but does not explicitly assert database-close delegation, so implementation should add one focused parity assertion.

Preserve exactly:

- already-created `Database` injected into `buildApp()`;
- `app.close()` awaits database close without swallowing error;
- registration remains on the same app after route/health/error composition;
- server signal/startup-failure behavior unchanged;
- pool config, queries, transactions, migrations/schema unchanged.

Non-goals: database creation, signal abstraction, startup batch, service graph/container, route registry, infrastructure-adapter bundle, transaction/query changes, Student frontend.

Switch condition: narrow owner is sole database-close hook registrar; `app.ts` no longer embeds it; focused lifecycle unit coverage is added; `server.ts` unchanged; Architecture Guard/API quality/clean PostgreSQL/relevant integration/real API+Chromium green.

After this seam, current evidence does not justify broad service/container/route-registry extraction. Reassess AB-01.4 closure instead of forcing a sixth seam.

### AB-01.5 — PENDING

Only justified shared backend technical ownership.

### AB-01.6 — PENDING

Foundation exact-head closure gate.

## Exact continuation

Implement only the selected fifth AB-01.4 database lifecycle seam and focused parity test, then run required gates. Do not move database creation, server signals, service construction, routes or startup behavior. After green closure, assess whether AB-01.4 should end and advance to AB-01.5.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.