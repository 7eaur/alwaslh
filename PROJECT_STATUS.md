# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-02 — Thin Admin shell + routing`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read in this order before mutation:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`
2. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `PROJECT_HANDOFF.md`
5. `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`
6. active architecture/product docs listed by those authorities.

Workers A/B/C share one branch and ordered roadmap. If another worker is active, do not create overlapping mutations. Every run performs one smallest coherent increment and ends `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE`.

## Permanent rules

- PostgreSQL/API are canonical business authority.
- Backend stays one Fastify modular monolith; no microservices/DI/service locator without evidence.
- Admin `app` composes only; features own workflows and expose narrow public/routes boundaries.
- Feature internals stay private; shared cannot import app/features.
- No new global state/query framework or styling-stack rewrite without evidence.
- No fabricated metrics/outcomes/actions.
- Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class states.
- Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are architecture requirements.
- Tests/security/validation are never weakened to make migration pass.
- No permanent dual ownership.

## Branch reconciliation

Live `main`: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

Compared with prior reconciled main `258c5bc2c09a049afb57c0593b5b6ca9db532c62`, the implementation delta remains Student frontend/workflow focused; it does not touch `apps/admin-web`, `apps/api`, or `database/migrations`. Shared `PROJECT_STATUS.md` / `PROJECT_HANDOFF.md` also changed on main as part of the Student workstream, so future reconciliation must preserve this scoped Admin+Backend authority rather than overwrite it mechanically.

## AB-00 — DONE

Ownership map, dependency inventory, Architecture Guard, measured baseline and readiness gate are closed.

Frozen baseline: Admin JS **968.68 kB / 193.92 kB gzip**, Admin CSS **91.38 kB / 13.68 kB gzip**, Admin unit **71/71**, API unit **66/66**, clean PostgreSQL 16 migrations green, baseline real Chromium **9/9**.

## AB-01 — DONE / EXACT-HEAD VERIFIED

### AB-01.1 Shared API transport — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

### AB-01.2 Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, public boundary `features/auth/public/index.ts`.

### AB-01.3 Product-state primitive — DONE

Source checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

### AB-01.4 Backend app composition foundation — DONE

Five bounded technical app seams are closed: CORS, health/readiness, public errors, Fastify construction/options and database lifecycle.

### AB-01.5 Common backend technical ownership — DONE

Generic request validation owner: `apps/api/src/shared/http/request-validation.ts`.

Complete implementation checkpoint: `d0352917f9df83dd15f9fbd7994ad79c1b9447dd`.

Closure evidence:

- Architecture Guard `34834714337` — SUCCESS;
- Stage13E Admin AI `34834945644` — SUCCESS;
- Stage13E Combined Integration `34834945655` — SUCCESS;
- Stage13G `34834945649` — SUCCESS.

### AB-01.6 Foundation closure gate — PASS / DONE

No further shared-foundation extraction is authorized.

## AB-02 — ACTIVE

Canonical execution record:

`docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`

### AB-02.1 Global Admin shell/layout ownership — DONE

Source implementation checkpoint: `0d07a24aa062ad569ff654524bdc13a4e368f399`.

Owner: `apps/admin-web/src/app/layouts/AdminShell.tsx`.

Closure evidence:

- Architecture Guard `34838037118` — SUCCESS;
- Frontend Preparation `34838037114` — SUCCESS;
- Combined Integration `34838123077` — SUCCESS;
- Stage13G `34838123143` — SUCCESS.

### AB-02.2 Inner Admin route-table ownership — IMPLEMENTED / WAITING_FOR_CI

Source implementation checkpoint: `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`.

New owner:

`apps/admin-web/src/app/router/AdminRoutes.tsx`

The complete inner `/app/*` route table and route-local wrappers/not-found composition moved out of `App.tsx`. `App.tsx` now keeps session/provider/auth-state composition plus `AdminShell + AdminRoutes`.

Deliberately unchanged:

- transitional `src/admin/*` workflow ownership;
- route URLs and redirects;
- eager workflow imports/lazy-loading behavior;
- `onSessionExpired` contract;
- outer `apps/admin-web/src/router.tsx` + `RouteFocus`;
- workflow UI/CSS and business behavior.

Exact-head checks started on `732555cb…`; Architecture Guard, Stage13G/Admin UI/backend, Stage13E Admin Web quality/Admin AI and other required checks were still queued/in-progress at handoff. Do not mark AB-02.2 DONE until required source-head/source-tree-equivalent gates are green.

## Remaining roadmap

- AB-02 — thin Admin shell/router/providers/layouts + substantial lazy routes — **ACTIVE**
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence
- AB-06 — performance/delivery validation
- AB-07 — legacy removal + hard dependency enforcement
- AB-08 — final full verification + live-main reconciliation

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and state `COMPLETE`, disable all three scheduled workers.

## Immediate next action

Inspect the exact-head/source-tree-equivalent checks for `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`. If all required Admin/Architecture/Combined/Stage13G evidence is green, close **AB-02.2 only**. If any check fails, fix its root cause before advancing. Do not begin lazy-loading or feature route migrations while AB-02.2 remains unverified.
