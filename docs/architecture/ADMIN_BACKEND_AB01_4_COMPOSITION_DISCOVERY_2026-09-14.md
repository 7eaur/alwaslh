# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **CLOSED — FIVE BOUNDED SEAMS VERIFIED**  
Branch: `rebuild/super-admin-foundation`

## Purpose

Incrementally thin `apps/api/src/app.ts` without changing business rules, HTTP contracts, database schema, security semantics or the single Fastify modular-monolith deployment model. Every extraction must establish a real owner, preserve behavior and be verified before selecting another seam.

## Closed seams

### 1. CORS/preflight — DONE

Owner: `apps/api/src/app/plugins/cors.ts`.

Source implementation HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

Preserved allowed-origin headers, credentials, `Vary`, OPTIONS methods/headers and rejected-preflight 403 semantics. Required gates green.

### 2. Health/readiness — DONE

Owner: `apps/api/src/app/http/health.ts`.

Source implementation HEAD: `a302871b3486ae95810cea40dccca68363a29055`.

Preserved `/health` process liveness and `/ready` PostgreSQL reachability behavior/logging/status contracts. Required gates green.

### 3. Public error/not-found handling — DONE

Owner: `apps/api/src/app/http/public-errors.ts`.

Source implementation HEAD: `001d45892bf4a17458f3beaeaaa1a7430be49b44`.

Preserved unknown-route 404 body, `toPublicError()` mapping authority and >=500 logging behavior. Required gates green.

### 4. Fastify instance construction/options — DONE

Owner: `apps/api/src/app/create-fastify-instance.ts`.

Source implementation HEAD: `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

Preserved logger, request logging, trust proxy, body limit and timeout options and one Fastify instance per `buildApp()` call. Closure evidence: Architecture Guard `34820842164`, Admin AI `34821032274`, Combined `34821032272`, Stage13G `34821032271` — SUCCESS/source-tree-equivalent green.

### 5. Database lifecycle registration — DONE

Owner: `apps/api/src/app/plugins/database-lifecycle.ts`.

Source+test implementation HEAD: `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`.

Implemented responsibility:

```ts
registerDatabaseLifecycle(app, database)
```

owns only the Fastify `onClose` hook that awaits the supplied `database.close()`.

Preserved contracts:

1. `buildApp({ config, database })` still receives an already-created database;
2. same Fastify instance owns shutdown lifecycle;
3. `app.close()` awaits DB close and does not swallow close errors;
4. registration order stays after business routes, health and public-error composition;
5. `server.ts` SIGTERM/SIGINT and listen-failure behavior remains `await app.close()`;
6. pre-app legacy startup failure direct DB close remains unchanged;
7. pool/query/transaction/migrations/schema and HTTP/business contracts are unchanged.

Focused `apps/api/tests/app.test.ts` coverage proves app close delegates to supplied DB close exactly once.

Closure evidence:

- Architecture Guard `34825750566` — SUCCESS;
- compare from `101f61a9c25e3de116d0074a3ef7e2f760eb98a7` to `e61400652267a4c836c40abf35a58a434b0fff08` changes only canonical documentation files;
- Admin AI `34826063345` — SUCCESS;
- Combined Integration `34826063326` — SUCCESS including API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth-security regressions and real Admin Chromium;
- Stage13G `34826063330` — SUCCESS including Admin/API quality, clean PostgreSQL, Accounts+Access, Notifications+Operations, Reports+Settings+Security+Audit, AI authoring, Access/Auth regressions and real API + PostgreSQL + Chromium.

## Final AB-01.4 assessment

Live `apps/api/src/app.ts` still owns broad construction/registration of:

- infrastructure adapters with multiple business consumers;
- module/service graph construction;
- cross-service composites;
- whole-product route registration.

These are intentionally **not** extracted during AB-01.4. Current evidence does not support a sixth small foundation seam. Mechanical extraction would create one of the explicitly rejected anti-patterns:

- giant `createServices()` container;
- giant route registry;
- generic infrastructure bundle;
- DI/service locator/interface ceremony;
- broad move whose only benefit is reducing `app.ts` line count.

The remaining boundaries should be repaired with workflow/domain context during AB-03 vertical slices, then residual backend cleanup in AB-04.

## Decision

**AB-01.4 is DONE after five bounded verified seams.**

Do not reopen this phase unless new executable evidence reveals a specific foundation-level defect.

## Next phase

AB-01.5 — Common backend technical ownership.

Start with discovery only. Inspect generic HTTP/auth/error/db/observability/media technical concerns for real duplication or private cross-module dependency. Select at most one bounded evidence-backed correction, or document that no move is justified and proceed to AB-01.6.

## Permanent law retained

`inspect current responsibility → select one bounded owner → document contracts/non-goals → implement only that seam → verify exact/source-tree-equivalent gates → close it`
