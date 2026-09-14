# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-01 shared foundations closed exact-head green; AB-02 shell/router discovery is next.**

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

## AB-01 — DONE / EXACT-HEAD VERIFIED

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

### AB-01.5 — DONE

Canonical discovery:

`docs/architecture/ADMIN_BACKEND_AB01_5_TECHNICAL_OWNERSHIP_DISCOVERY_2026-09-14.md`

Generic Zod request validation is owned by:

`apps/api/src/shared/http/request-validation.ts`

The first placement under `app/http` was rejected by Architecture Guard and corrected without adding an exception. `parseBody` no longer belongs to private `auth/http.ts`; Auth retains `currentProfile`, `sessionToken` and auth/session/cookie/role behavior. Invalid input semantics remain `safeParse` → `AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400)`.

The initial caller audit missed eight remaining imports; exact-head TypeScript CI exposed them, and only those compiler-proven imports were migrated. No business schema, security behavior, migration, PostgreSQL authority or Student frontend implementation changed.

Complete source implementation checkpoint: `d0352917f9df83dd15f9fbd7994ad79c1b9447dd`.

The five commits from that checkpoint to verification HEAD `16c7ac34078d75b990422374954f30631ebbee45` are documentation-only.

Closure evidence:

- Architecture Guard `34834714337` — SUCCESS;
- Stage13E Admin AI `34834945644` — SUCCESS;
- Stage13E Combined Integration `34834945655` — SUCCESS;
- Stage13G `34834945649` — SUCCESS.

Stage13G explicitly proves API/Admin lint/typecheck/unit/build, clean PostgreSQL migrations, database contract, Accounts/Access, Notifications/Operations, Reports/Settings/Security/Audit, AI authoring, Access/Auth regression and real API + PostgreSQL + Chromium.

### AB-01.6 — PASS / DONE

Foundation closure gate passed. Single-owner technical foundations are established; Architecture Guard is green; compatibility debt is bounded to later phases; Admin/API/PostgreSQL/integration/security/auth/Chromium evidence is green; docs match the code; Student frontend implementation remained untouched.

No further AB-01 foundation extraction is authorized.

## AB-02 — ACTIVE

Next responsibility: thin Admin shell/router/providers/layouts and substantial lazy route boundaries.

Begin with evidence only: current `App.tsx`, shell/navigation/session ownership, route table, feature public/routes boundaries, route focus/history/deep-link behavior, current tests and bundle composition. Define one smallest migration seam before changing code. Preserve auth/session outcomes and defer business workflow redesign to AB-03.

## Exact continuation

Perform AB-02 discovery, document the current root composition and target first seam, then implement at most one coherent shell/router increment with Architecture Guard + Admin quality + relevant real Chromium parity.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.