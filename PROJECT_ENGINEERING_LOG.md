# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-02.2 inner route-table owner implemented; waiting for exact-head-equivalent CI.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the live serial handoff. Never auto-merge or rewrite shared history.

Live main is `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. Relative to `258c5bc2c09a049afb57c0593b5b6ca9db532c62`, implementation changes are Student-focused and do not overlap Admin/API/migrations; shared project docs did move and require deliberate reconciliation later.

## AB-00 — DONE

Ownership/boundary map, dependency inventory, Architecture Guard, measured baseline and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

AB-01 foundations are closed. Canonical shared owners include Admin API transport, Auth/session, product-state primitive, five bounded API app composition seams and shared request validation. Closure evidence includes Architecture Guard `34834714337`, Admin AI `34834945644`, Combined `34834945655` and Stage13G `34834945649`, all successful.

## AB-02 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 — Global shell/layout ownership — DONE

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399` introduced `apps/admin-web/src/app/layouts/AdminShell.tsx`. Current-head-equivalent closure evidence: Architecture Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 — Inner Admin route-table ownership — IMPLEMENTED / WAITING_FOR_CI

Worker A sequence 25 implemented the selected ownership seam at source checkpoint:

`732555cb9b8499c712ad6cd19ad50cccf26a8e4a`

New owner:

`apps/admin-web/src/app/router/AdminRoutes.tsx`

Changes:

- moved the complete inner `/app/*` route table out of `App.tsx`;
- moved route-only `ReviewArea`, `WorkspaceWithRelatedActions` and `AdminRouteNotFound` with the table;
- preserved all current `src/admin/*` workflow imports and eager loading;
- preserved URLs, redirects, `onSessionExpired`, workflow UI, CSS and outer `router.tsx`/`RouteFocus` behavior;
- reduced `App.tsx` to session/provider/auth-state composition plus `AdminShell + AdminRoutes`.

No feature migration, lazy-loading, business-rule, API, migration, PostgreSQL or Student frontend implementation change was made.

Exact-head Actions were started for `732555cb…`; at handoff required checks were still queued/in-progress, including Architecture Guard `34840954071`, Stage13G `34840953847`, Stage13E Admin Web quality `34840953959` and Admin AI `34840953862`. Therefore the seam is not yet DONE.

## Exact continuation

Inspect required checks for source checkpoint `732555cb…` (or documentation-only source-tree-equivalent heads). Close AB-02.2 only when Architecture Guard + Admin quality + relevant route/auth/focus + Combined/Stage13G real API/PostgreSQL/Chromium evidence is green. If a check fails, fix the root cause. Do not start lazy-loading or feature route entries until this seam is verified.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.
