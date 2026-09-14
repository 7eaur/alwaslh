# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-01.5 discovery selected one bounded generic request-validation ownership correction.**

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

Current live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`. Comparison from prior reconciled main `3053640cc5bb0699cfa7456cf646e8997f6aa81b` shows one Student Experience V2 merge only; no Admin/API/migrations path is in that main-only delta.

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

Fifth seam source+test implementation HEAD: `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`.

Closure evidence: Architecture Guard `34825750566`, Admin AI `34826063345`, Combined `34826063326`, Stage13G `34826063330` — SUCCESS. Broad service construction/route registration remains for AB-03/AB-04 rather than a giant container/registry abstraction.

### AB-01.5 — DISCOVERY COMPLETE / IMPLEMENTATION NEXT

Canonical discovery:

`docs/architecture/ADMIN_BACKEND_AB01_5_TECHNICAL_OWNERSHIP_DISCOVERY_2026-09-14.md`

#### Evidence

`apps/api/src/auth/http.ts` exports `parseBody(schema, body)` which only:

- calls Zod `safeParse`;
- returns parsed data;
- maps invalid input to `AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400)`.

It performs no session lookup/authentication/cookie/role behavior, so Auth HTTP is an incidental owner.

Verified private cross-module callers:

- `apps/api/src/question-bank/http.ts` imports `parseBody` from `../auth/http.js` and uses it for params/query/body validation;
- `apps/api/src/quiz-builder/http.ts` imports and uses it likewise.

Both modules also import `currentProfile`, but that is intentionally outside this correction because `currentProfile` invokes AuthService/session authentication. Moving both concerns together would blend generic request parsing with an authorization redesign.

#### Decision

Move only the generic request-validation adapter to:

`apps/api/src/app/http/request-validation.ts`

Preserve exact invalid-input semantics. Search all current branch callers before implementation and migrate only real callers. Do not rename/move AppError, config/db/media/observability, auth/session/cookies/roles or domain schemas in the same batch.

This is the **only** AB-01.5 technical ownership correction authorized. After implementation + exact-head verification, stop AB-01.5 and proceed to AB-01.6.

### AB-01.6 — PENDING

Foundation exact-head closure gate.

## Exact continuation

Implement the single AB-01.5 request-validation ownership correction. Verify Architecture Guard, API lint/typecheck/unit/build, relevant auth/security and Question Bank/Quiz Builder integrations, clean PostgreSQL/DB contract and canonical real API + PostgreSQL + Chromium gates. If those are green, close AB-01.5 and begin AB-01.6; do not manufacture further shared-infrastructure moves.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.