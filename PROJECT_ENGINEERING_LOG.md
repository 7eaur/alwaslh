# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — third AB-01.4 composition seam selected; implementation not yet started.**

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

Work branch: `rebuild/super-admin-foundation`; PR #52 remains Draft. Never auto-merge or force shared history. Latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`; observed delta remains Student frontend/workflow + root documentation only for current AB-01 scope.

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

#### Third seam — PUBLIC ERROR / NOT-FOUND — SELECTED

Discovery performed from live `apps/api/src/app.ts` after the first two extractions.

Current inline responsibility:

- `setNotFoundHandler` builds the public 404 envelope;
- `setErrorHandler` maps through existing `toPublicError`, logs 5xx as `request failed`, and sends canonical public status/body.

Decision:

- target owner: `apps/api/src/app/http/public-errors.ts`;
- target function: `registerPublicErrorHandlers(app)`;
- keep `toPublicError` in its current authority; do not move or duplicate error semantics;
- preserve exact 404 body, status codes, mapped error bodies and 5xx logging threshold/message;
- retain registration after business routes + health and before app return;
- do not combine DB close lifecycle, Fastify construction, service graph or route-registry work.

Parity evidence:

- direct `apps/api/tests/app.test.ts` contract: unknown route returns 404 public error envelope with code `NOT_FOUND`;
- broader API/auth/security/integration suites exercise global error behavior;
- discovery starting HEAD `e592535b082c9284ecf88f19e60cb70821e8aa16` had Admin AI `34813851669`, Combined `34813851671`, Stage13G `34813851684` — all SUCCESS.

Impact:

- no schema/database/business-rule change;
- no intended auth or Student contract semantic change, but shared server error-envelope regressions remain required;
- no Student frontend restructuring.

Deletion/switch condition:

Both inline handlers leave `apps/api/src/app.ts`; one `registerPublicErrorHandlers(app)` call remains at the same composition point; no duplicate ownership; required gates green.

Implementation gates:

Architecture Guard; API lint/typecheck/unit/build; unchanged app not-found test; auth/security/integration regressions; clean PostgreSQL combined gate; Combined Chromium; Stage13G real API + PostgreSQL + Chromium.

### AB-01.5 — PENDING

Only justified common backend technical ownership.

### AB-01.6 — PENDING

Full foundation closure after remaining AB-01 work.

## Alternating execution governance

Binding protocol: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`; live handoff: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. Workers A/B/C share one branch and roadmap and execute one smallest coherent increment at a time.

## Remaining roadmap

AB-01 active → AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.

## Exact continuation

Implement **only** the selected third AB-01.4 public-error/not-found composition seam. Do not bundle database-close lifecycle or any broader app/service/route refactor.
