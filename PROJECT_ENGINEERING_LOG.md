# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — fifth AB-01.4 database lifecycle seam implemented; required gates still active.**

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

Current live `main` observed in Worker A sequence 17: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; this is the Student Experience V2 merge checkpoint and does not overlap the current AB-01 API seam.

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

Source `dbdc9245f2d0e283d047d7e1254748e55f890a55`; owner `apps/api/src/app/plugins/cors.ts`; required gates green.

#### Health/readiness — DONE

Source `a302871b3486ae95810cea40dccca68363a29055`; owner `apps/api/src/app/http/health.ts`; full quality/PostgreSQL/integration/Chromium evidence green.

#### Public not-found/error — DONE

Source `001d45892bf4a17458f3beaeaaa1a7430be49b44`; owner `apps/api/src/app/http/public-errors.ts`; full source-tree-equivalent gates green.

#### Fastify construction/options — DONE

Source `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`; owner `apps/api/src/app/create-fastify-instance.ts`. Closure evidence: Architecture Guard `34820842164`, Admin AI `34821032274`, Combined `34821032272`, Stage13G `34821032271` — SUCCESS/source-tree-equivalent green.

#### Database lifecycle registration — IMPLEMENTED / WAITING_FOR_CI

Worker A sequence 17 implemented source+test head `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`.

Owner: `apps/api/src/app/plugins/database-lifecycle.ts` with narrow `registerDatabaseLifecycle(app, database)` responsibility.

Implementation facts:

- `app.ts` no longer embeds the database `onClose` hook;
- registration remains after business routes, health and public error handlers;
- `registerDatabaseLifecycle` owns only the hook that awaits `database.close()`;
- focused `apps/api/tests/app.test.ts` coverage asserts `app.close()` delegates to the supplied database close operation exactly once;
- `server.ts`, database creation/configuration, process signals, service graph, routes, migrations/schema and Student frontend were untouched.

Contract preserved:

- `buildApp()` receives an already-created `Database`;
- the same Fastify instance owns lifecycle shutdown;
- database-close errors are not swallowed by the hook;
- server shutdown/listen-failure semantics remain unchanged;
- pre-app startup failure direct database close remains unchanged.

Verification observed before documentation commits:

- Architecture Guard `34825750566` — SUCCESS on the source composition commit;
- Stage13G `34825773710` — IN_PROGRESS on source+test head; Admin UI lint/typecheck/unit/build already green when inspected;
- Combined `34825773686` — IN_PROGRESS;
- Admin AI `34825773676` — IN_PROGRESS.

Because documentation commits can supersede/cancel those runs, the next worker must verify source-tree-equivalent green evidence before closure. Do not falsely mark DONE.

After this seam closes, current evidence does not justify a broad service/container/route-registry extraction. Reassess AB-01.4 closure first.

### AB-01.5 — PENDING

Only justified shared backend technical ownership.

### AB-01.6 — PENDING

Foundation exact-head closure gate.

## Exact continuation

Verify the implemented database lifecycle seam on current/source-tree-equivalent CI. If green, close only this seam and explicitly decide whether AB-01.4 can close. If any gate fails, fix the root cause only. Do not move database creation, server signals, service construction, routes or startup behavior.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.