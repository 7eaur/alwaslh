# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-01.4 backend app composition foundation closed after fifth bounded seam verification.**

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

Current live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; Student Experience V2 merge checkpoint, no overlap with the closed AB-01.4 API composition changes.

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

### AB-01.4 — DONE

Five bounded composition seams were extracted and verified without changing business rules:

1. CORS/preflight → `apps/api/src/app/plugins/cors.ts`;
2. health/readiness → `apps/api/src/app/http/health.ts`;
3. public error/not-found → `apps/api/src/app/http/public-errors.ts`;
4. Fastify construction/options → `apps/api/src/app/create-fastify-instance.ts`;
5. database lifecycle registration → `apps/api/src/app/plugins/database-lifecycle.ts`.

#### Fifth seam closure

Source+test implementation HEAD: `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`.

Implementation preserved:

- `buildApp()` receives an already-created `Database`;
- same Fastify instance owns shutdown lifecycle;
- database close errors are not swallowed;
- `server.ts` signal/listen-failure shutdown remains `await app.close()`;
- legacy pre-app startup failure direct database close is unchanged;
- database creation/pool/query/transaction/migrations/schema are unchanged;
- service graph/business routes and Student frontend are unchanged.

Verification:

- Architecture Guard `34825750566` — SUCCESS on source composition commit;
- `101f61a9...e6140065` compare contains only five canonical documentation files, proving source-tree equivalence;
- Admin AI `34826063345` — SUCCESS;
- Combined `34826063326` — SUCCESS: API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth-security regressions, deterministic fixtures, real Admin Chromium;
- Stage13G `34826063330` — SUCCESS: Admin quality, API lint/typecheck/unit/build, clean PostgreSQL, all listed integration/auth regressions, real API + PostgreSQL + Chromium.

#### AB-01.4 closure decision

Live `apps/api/src/app.ts` now retains broad service construction, cross-service composite construction, multi-consumer infrastructure construction and whole-product route registration. These are intentionally **not** extracted wholesale during AB-01.4. A giant `createServices()` container or route registry would add indirection without ownership evidence. Workflow-driven boundary repair belongs in AB-03; residual backend normalization belongs in AB-04.

Therefore AB-01.4 is closed after the fifth seam rather than manufacturing a sixth abstraction.

### AB-01.5 — NEXT

Discovery only first: identify an actual duplicated/misowned cross-cutting backend technical concern before changing ownership. If no justified concern exists, document no-op and proceed to AB-01.6.

### AB-01.6 — PENDING

Foundation exact-head closure gate.

## Exact continuation

Start AB-01.5 with evidence gathering only. Inspect generic HTTP/auth/error/db/observability/media technical ownership and duplication. Select no more than one small correction supported by current code/tests, or explicitly conclude no extraction is justified. Do not reopen AB-01.4 broad composition work.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.