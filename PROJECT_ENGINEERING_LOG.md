# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — fourth AB-01.4 Fastify construction seam selected by discovery; implementation is next.**

## Durable authority invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `apps/student-web` — separate Student frontend workstream; not an implementation target here.
- Student-facing backend contracts remain owned here.
- Browser state is never canonical business authority.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority remains server-owned.
- Tests represent production contracts; validation/security is never weakened to satisfy fixtures.

## Frozen safety baseline

Admin initial JS **968.68 kB / 193.92 kB gzip**; Admin CSS **91.38 kB / 13.68 kB gzip**; Admin unit **71/71**; API unit **66/66**; clean PostgreSQL 16 migrations green; baseline real Chromium **9/9**.

## Branch governance

Work branch: `rebuild/super-admin-foundation`; PR #52 remains Draft. Never auto-merge or force shared history. Latest live `main` observed during Worker C sequence 13: `258c855ace396a3f834199708c926411a3d65f79`. No structural phase boundary was crossed during this docs-only discovery increment.

## Permanent decisions

Keep one Fastify modular monolith, PostgreSQL/API authority, feature-owned Admin with thin app composition, user-job IA, substantial route code splitting, approved Design System/brand, RTL/a11y/responsive/reduced-motion/product states, controlled replacement with legacy deletion, `packages/ui` only for true cross-product primitives, Admin `shared/ui` for Admin-only patterns, selective backend layers, verified `/app` base, evidence-based performance budgets.

Rejected without evidence: microservices, DI/service locator, universal repositories/interfaces, new global state/query library, styling-stack rewrite, artificial tiny splitting and big-bang rewrite.

## AB-00 — CLOSED

AB-00.1 ownership/boundary map — DONE; AB-00.2 migration/dependency inventory — DONE; AB-00.3 Architecture Guard — DONE/ratchet active; AB-00.4 measured baseline — DONE; AB-00.5 readiness — PASS.

## AB-01 implementation ledger

### AB-01.1 — Shared API transport boundary — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

### AB-01.2 — Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, `features/auth/public/index.ts`.

### AB-01.3 — Product-state primitives — DONE

Source implementation checkpoint `cfa2016e056f6dc4f9669236414a7acbd9551011`.

### AB-01.4 — ACTIVE

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

#### First seam — CORS/preflight — DONE

Source HEAD `dbdc9245f2d0e283d047d7e1254748e55f890a55`; Architecture Guard `34808159011`, Admin AI `34809211720`, Combined `34809211704`, Stage13G `34809211707` — SUCCESS.

#### Second seam — health/readiness — DONE

Source HEAD `a302871b3486ae95810cea40dccca68363a29055`; target owner `apps/api/src/app/http/health.ts`. Closure evidence: Architecture Guard `34811642661`; source-tree-equivalent Admin AI `34811809959`, Combined `34811809962`, Stage13G `34811810021` — SUCCESS.

#### Third seam — public error / not-found — DONE

Source implementation HEAD: `001d45892bf4a17458f3beaeaaa1a7430be49b44`.

Implemented owner:

- `apps/api/src/app/http/public-errors.ts`;
- `registerPublicErrorHandlers(app)` owns both `setNotFoundHandler` and `setErrorHandler`.

Composition result:

- `apps/api/src/app.ts` imports/calls `registerPublicErrorHandlers(app)` after `registerHealthRoutes(app, database)`;
- both inline handlers were removed from `app.ts`;
- direct `toPublicError` import was removed from `app.ts`;
- database `onClose`, Fastify construction, service graph, business route registration, migrations and Student frontend were untouched.

Preserved behavior:

- unknown route still returns HTTP 404 with `{ error: { code: "NOT_FOUND", message: "المسار غير موجود" } }`;
- global thrown errors still map through existing `toPublicError(error)` authority;
- only mapped 5xx errors log `request.log.error({ err: error }, "request failed")`;
- mapped status/body behavior remains unchanged.

Closure evidence:

- Architecture Guard `34816433721` — SUCCESS on source implementation HEAD;
- compare `001d45892bf4a17458f3beaeaaa1a7430be49b44...068ee06cf7fec442b95ddada2667d8aac5d1c2a2` contains only documentation files, proving no affected source file changed after implementation;
- source-tree-equivalent Admin AI `34816613371` — SUCCESS;
- Combined `34816613431` — SUCCESS including API/Admin quality, clean PostgreSQL, DB contract, backend authority, auth/security regressions and real Admin Chromium;
- Stage13G `34816613493` — SUCCESS including Admin UI quality, API lint/typecheck/unit/build, clean PostgreSQL, relevant integrations/auth regression, and real API + PostgreSQL + Chromium.

Conclusion: deletion/switch condition and runtime/integration gates are satisfied. Third seam is **DONE**.

#### Fourth seam — Fastify instance construction/options — SELECTED / IMPLEMENTATION NEXT

Worker C sequence 13 performed discovery only. Starting branch HEAD before reservation: `2722de7d1d4d09f2eae7e3f9dc35624255f392fa`; reservation commit: `0b522a7de907c5bcbcc1af78a6db33db8fc6cbae`.

Evidence:

- live `apps/api/src/app.ts` still directly owns `Fastify(...)` construction before service/route composition;
- `apps/api/tests/app.test.ts` consumes `buildApp({ config, database })` as the bootstrap contract and verifies representative liveness/readiness/CORS/public-error outcomes;
- no dedicated contract/evidence authorizes changing Fastify option values, so extraction must preserve them literally rather than combine tuning with ownership cleanup.

Selected target:

- create `apps/api/src/app/create-fastify-instance.ts`;
- narrow owner `createFastifyInstance(config: AppConfig): FastifyInstance`;
- preserve logger silent/non-silent semantics, `disableRequestLogging: false`, `trustProxy: true`, `bodyLimit: 1_048_576`, `requestTimeout: 15_000`, one instance per `buildApp()` call and the current downstream registration order.

Explicit non-goals:

- no service graph/container/DI;
- no broad route move;
- no database `onClose` move;
- no config/default tuning;
- no migration/schema or Student frontend change;
- no fifth seam in the same implementation batch.

Switch/deletion condition:

- the helper becomes the single value owner of `Fastify(...)` construction/options;
- `app.ts` stops importing `Fastify` as a value and stops embedding those option literals;
- `buildApp()` and downstream HTTP/security/database behavior remain unchanged;
- Architecture Guard + API quality + clean PostgreSQL + relevant integration/security/auth + real Chromium/combined gates are green.

### AB-01.5 — PENDING

Only justified common backend technical ownership.

### AB-01.6 — PENDING

Full foundation closure after remaining AB-01 work.

## Alternating execution governance

Binding protocol: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`; live handoff: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. Workers A/B/C share one branch and roadmap and execute one smallest coherent increment at a time.

## Remaining roadmap

AB-01 active → AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.

## Exact continuation

Implement **only** the fourth AB-01.4 Fastify instance construction/options seam exactly as documented. Preserve existing options and `buildApp()` behavior; run the required gates; close the seam before performing discovery for any fifth seam.