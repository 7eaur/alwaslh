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

Owner: `apps/api/src/app/create-fastify-instance.ts` with narrow `createFastifyInstance(config: AppConfig): FastifyInstance` responsibility.

Closure evidence: Architecture Guard `34820842164`, Admin AI `34821032274`, Combined `34821032272`, Stage13G `34821032271` — successful/source-tree-equivalent green.

### Database lifecycle registration — IMPLEMENTED / WAITING_FOR_CI

Source+test implementation HEAD:

`101f61a9c25e3de116d0074a3ef7e2f760eb98a7`

Owner:

`apps/api/src/app/plugins/database-lifecycle.ts`

with narrow:

`registerDatabaseLifecycle(app: FastifyInstance, database: Database): void`

Implemented behavior:

- owns only Fastify `onClose` registration for the supplied database;
- awaits `database.close()` without swallowing close errors;
- `app.ts` delegates to it in the same composition position after business routes, health and public-error handlers;
- focused `apps/api/tests/app.test.ts` coverage proves `app.close()` delegates to the supplied fake database close operation exactly once.

Preserved exactly:

- `buildApp()` receives an already-created database;
- same Fastify instance owns shutdown lifecycle;
- `server.ts` continues to call `app.close()` for SIGTERM/SIGINT and listen failure;
- legacy startup failure before app construction continues direct database close;
- database creation/pool/query/transaction/migration/schema behavior is unchanged;
- service graph/business routes and Student frontend are unchanged.

Verification observed before documentation commits:

- Architecture Guard `34825750566` — SUCCESS on source composition commit;
- Stage13G `34825773710` — IN_PROGRESS on source+test head; Admin UI quality steps were already green when inspected;
- Combined `34825773686` — IN_PROGRESS;
- Admin AI `34825773676` — IN_PROGRESS.

Switch/deletion condition remains unmet until source/source-tree-equivalent API lint/typecheck/unit/build + clean PostgreSQL + relevant integration/security/auth + real API/Chromium evidence is green. Documentation commits may supersede/cancel the original runs; cancellation is not success.

After this fifth seam closes, reassess AB-01.4 for closure. Current evidence does not justify a sixth broad service-container, route-registry or infrastructure-bundle extraction.

## AB-01.5 — Common backend technical ownership — PENDING

Normalize only proven cross-cutting technical concerns. Domain/business rules remain with module owners.

## AB-01.6 — Foundation closure gate — PENDING

Requires one-owner foundations, no new dependency violations, bounded compatibility debt, Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integration/security/auth and real API + PostgreSQL + Chromium evidence, with docs matching code.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 design/interaction convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.