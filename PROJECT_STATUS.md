# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-01 — Shared foundations`.

## Binding responsibility

This workstream owns the complete Super Admin product plus the full backend/server product, PostgreSQL/migrations/integrity, security and shared/server contracts consumed by Admin or Student, and the CI/integration/browser evidence needed to prove them.

The only structural exclusion is `apps/student-web` frontend implementation itself. Student-facing backend capability remains in scope; Student frontend code/tests may be inspected only as consumer-regression evidence when shared/server contracts change.

## Canonical active authorities

Read in this order:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` — live continuation point and worker handoff;
2. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md` — binding alternating execution rules;
3. `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`;
4. `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`;
5. `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`;
6. `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`;
7. `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`;
8. `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`;
9. `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`;
10. `docs/architecture/ADMIN_BACKEND_BASELINE_2026-09-14.md`;
11. `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`;
12. `docs/product/DESIGN_SYSTEM_SPEC.md`;
13. `.agents/skills/alwaslh-product-engineering/SKILL.md`.

Older platform-wide architecture documents are historical rationale only and are superseded for execution by the scoped AB workstream.

## Scheduled continuation law

Workers A, B and C continue the same ordered roadmap on the same branch, staggered by 20 minutes (`:00`, `:20`, `:40`). Every run reads live state/current branch/main HEADs/exact-head CI/canonical docs before mutation; performs one smallest coherent increment; verifies it; and records ending HEAD, evidence and the exact next step. If another worker is still active, do not create overlapping mutations.

Normal handoff states: `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, `COMPLETE`. After verified AB-08 completion and state `COMPLETE`, the proving worker disables all three scheduled tasks.

## Branch reconciliation

Latest verified `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`, advanced through Student V2 merge #58. Path-level reconciliation found Student frontend/workflow and root documentation changes only; no overlapping `apps/api`, `apps/admin-web`, migrations or scoped shared implementation needs import for current AB-01 work.

## Permanent architecture/product rules

- PostgreSQL/API remain canonical business authority.
- Backend remains one Fastify modular monolith; no microservices.
- Student-facing backend security/business authority remains server-owned and protected.
- Admin `app` composes only; features own workflows/routes/API adapters/models/tests.
- App imports features through supported public/routes boundaries only.
- Feature internals are private; cross-feature work uses narrow public contracts or app orchestration.
- `packages/ui` owns cross-product primitives only; Admin `shared/ui` owns Admin-only reusable patterns.
- `shared` never becomes a dumping ground and cannot import feature/app internals.
- No new feature files in Admin root `src/`.
- Substantial workflow routes lazy-load by default; no artificial tiny-chunk splitting.
- One Admin shell owns global chrome/navigation.
- Keep verified `/app` base unless runtime evidence justifies changing it.
- No global state/query framework, DI/service locator, microservices or styling-stack rewrite without evidence.
- Database changes require domain/integrity need, never folder restructuring.
- No fabricated metrics/counts/progress/health/outcomes/actions.
- Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class states.
- Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are architecture requirements.
- Tests/security/validation are never weakened to make migration pass.
- No permanent dual ownership: every compatibility bridge has a deletion condition.

Migration law:

`job/use case → DB/API/security contracts → current owner → target owner → states/flow → backend seam correction where needed → replacement → outcome verification → switch → legacy deletion → exact-head gates → documentation`

## AB-00 — CLOSED

AB-00.1 ownership map — DONE; AB-00.2 dependency inventory — DONE; AB-00.3 Architecture Guard — DONE/ratchet active; AB-00.4 measured baseline — DONE; AB-00.5 readiness — PASS.

Frozen baseline: Admin JS **968.68 kB / 193.92 kB gzip**, Admin CSS **91.38 kB / 13.68 kB gzip**, Admin unit **71/71**, API unit **66/66**, clean PostgreSQL 16 migrations green, baseline real Chromium **9/9**.

## AB-01 — ACTIVE

Detailed authority: `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`.

### AB-01.1 Shared API transport boundary — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`. Root compatibility re-export remains bounded debt until feature adapters migrate.

### AB-01.2 Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, public boundary `features/auth/public/index.ts`. `App.tsx` no longer owns session lifecycle.

### AB-01.3 Product-state primitives — DONE

Source implementation checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`. The minimum proven loading/error/retry presentation shell is shared; feature state machines and server semantics remain feature-owned.

### AB-01.4 Backend app composition foundation — ACTIVE / SECOND SEAM SELECTED

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

**First seam — CORS/preflight extraction — DONE.**

Source implementation HEAD: `dbdc9245f2d0e283d047d7e1254748e55f890a55`.

- owner: `apps/api/src/app/plugins/cors.ts`;
- `registerCorsPolicy(app, config)` preserves the existing global CORS/preflight behavior and registration scope;
- Architecture Guard `34808159011` — SUCCESS;
- Admin AI `34809211720` — SUCCESS;
- Combined Integration `34809211704` — SUCCESS;
- Stage13G `34809211707` — SUCCESS including real API + PostgreSQL + Chromium.

**Second seam — health/readiness HTTP extraction — DISCOVERY DONE / IMPLEMENTATION NEXT.**

Selected target ownership:

- current owner: inline `GET /health` and `GET /ready` handlers in `apps/api/src/app.ts`;
- target owner: `apps/api/src/app/http/health.ts`;
- target composition function: `registerHealthRoutes(app, database)`;
- direct parity authority: three existing tests in `apps/api/tests/app.test.ts` covering process-only health, ready=200 and ready=503;
- implementation must preserve the existing readiness log/status/body semantics and current composition position.

Explicitly out of this seam: public error/not-found handlers, database close lifecycle, service construction, all-route extraction, `server.ts`, migrations, business/security contracts and Student frontend.

The next worker implements **this seam only**, then runs the required Architecture Guard/API/integration/Chromium gates before any third composition seam is selected.

### AB-01.5 Common backend technical ownership — PENDING

Normalize only proven cross-cutting technical concerns.

### AB-01.6 Foundation closure gate — PENDING

Requires architecture guard, Admin/API quality, clean PostgreSQL, real Chromium and docs/code consistency after remaining AB-01 work.

## Full roadmap

- AB-00 — DONE
- AB-01 — shared foundations — ACTIVE
- AB-02 — thin Admin shell/router/providers/layouts + major lazy routes
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence audit
- AB-06 — frontend/backend performance and delivery validation + evidence-based budgets
- AB-07 — legacy removal + hard dependency enforcement
- AB-08 — final Super Admin + full Backend verification and live-main reconciliation

No merge/readiness before AB-08 exact-head green.

## Immediate continuation authority

Always read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first. Current next step: implement **only** the selected AB-01.4 health/readiness extraction into `apps/api/src/app/http/health.ts`, preserve the three direct parity behaviors, then verify before selecting any third seam.