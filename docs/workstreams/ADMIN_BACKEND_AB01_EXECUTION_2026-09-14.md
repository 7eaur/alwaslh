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

## AB-01.4 — Backend app composition foundation — DONE

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

Closed bounded seams:

1. CORS/preflight — `apps/api/src/app/plugins/cors.ts`;
2. health/readiness — `apps/api/src/app/http/health.ts`;
3. public not-found/error handling — `apps/api/src/app/http/public-errors.ts`;
4. Fastify instance construction/options — `apps/api/src/app/create-fastify-instance.ts`;
5. database lifecycle registration — `apps/api/src/app/plugins/database-lifecycle.ts`.

### Database lifecycle closure

Source+test implementation HEAD:

`101f61a9c25e3de116d0074a3ef7e2f760eb98a7`

The narrow owner `registerDatabaseLifecycle(app, database)` registers only the existing Fastify `onClose` behavior that awaits `database.close()`.

Preserved:

- `buildApp()` still receives an already-created `Database`;
- `server.ts` continues to use `app.close()` for SIGTERM/SIGINT and listen failure;
- legacy pre-app startup failure direct DB close is unchanged;
- database creation/pool/query/transactions/migrations/schema are unchanged;
- service graph/business routes and Student frontend are unchanged.

Focused `apps/api/tests/app.test.ts` coverage proves `app.close()` delegates to supplied database close exactly once.

Closure evidence:

- Architecture Guard `34825750566` — SUCCESS on affected source composition;
- compare `101f61a9...e6140065` contains only canonical documentation files, so later successful runs are source-tree-equivalent;
- Admin AI `34826063345` — SUCCESS;
- Combined `34826063326` — SUCCESS including API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth-security regressions and real Admin Chromium;
- Stage13G `34826063330` — SUCCESS including Admin/API quality, clean PostgreSQL, all listed integration/auth regressions and real API + PostgreSQL + Chromium.

### AB-01.4 stop decision

The remaining `app.ts` responsibilities are broad module/service construction, cross-service composites, multi-consumer infrastructure construction and whole-product route registration. They are not extracted wholesale here.

Rejected as unjustified foundation abstractions:

- giant `createServices()` container;
- giant route registry;
- generic infrastructure bundle;
- DI/service locator/interface ceremony.

Workflow-driven module normalization belongs in AB-03; residual backend normalization belongs in AB-04. AB-01.4 therefore ends after the fifth bounded seam.

## AB-01.5 — Common backend technical ownership — NEXT

Discovery must start from evidence. Inspect only genuinely cross-cutting technical concerns such as generic HTTP/auth helpers, public error plumbing, DB technical ownership, observability and media infrastructure.

Rules:

- fix one real duplicated/misowned technical seam at most;
- do not move domain/business rules into shared;
- do not reopen broad app composition;
- do not create an abstraction because the target folder diagram suggests one;
- if no move is justified, document that and continue to AB-01.6.

## AB-01.6 — Foundation closure gate — PENDING

Requires one-owner foundations, no new dependency violations, bounded compatibility debt, Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integration/security/auth and real API + PostgreSQL + Chromium evidence, with docs matching code.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 design/interaction convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.