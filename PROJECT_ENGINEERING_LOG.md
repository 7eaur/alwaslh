# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-02.2 inner route-table ownership closed with source-tree-equivalent exact verification.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. Main implementation changes since the previous reconciliation are Student-focused and do not overlap Admin/API/migrations; shared project docs require deliberate later reconciliation.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, five bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 — Global shell/layout ownership — DONE

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; owner `apps/admin-web/src/app/layouts/AdminShell.tsx`. Closure: Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 — Inner Admin route-table ownership — DONE

Source checkpoint:

`732555cb9b8499c712ad6cd19ad50cccf26a8e4a`

Owner:

`apps/admin-web/src/app/router/AdminRoutes.tsx`

What changed:

- complete inner `/app/*` route table moved out of `App.tsx`;
- route-only `ReviewArea`, `WorkspaceWithRelatedActions` and `AdminRouteNotFound` moved with it;
- `App.tsx` now composes session/auth boundary plus `AdminShell + AdminRoutes`;
- existing `src/admin/*` workflow ownership, eager loading, URLs, redirects, `onSessionExpired`, workflow UI/CSS/business behavior and outer `router.tsx`/`RouteFocus` remained unchanged.

Verification:

- source Guard `34840954071` — SUCCESS;
- source Frontend Preparation `34840953959` — SUCCESS;
- source-tree-equivalent Admin AI `34841142948` — SUCCESS;
- source-tree-equivalent Combined `34841142987` — SUCCESS, including API/Admin quality gates, clean PostgreSQL, DB contract, backend authority/auth-security regressions and real Admin Chromium;
- source-tree-equivalent Stage13G `34841142975` — SUCCESS, including Admin/API quality, clean PostgreSQL, integrations/auth and real API + PostgreSQL + Chromium.

`732555cb… → 2c2fcb6c…` changes only five documentation files, so the successful source-tree-equivalent runs verify the same implementation tree. No regression was found and no source fix was required during closure.

## Exact continuation

AB-02.2 is closed. The next worker must inspect current `App.tsx`, `app/router/AdminRoutes.tsx`, outer `router.tsx`, route imports and current bundle/ownership evidence and select **one smallest next AB-02 seam**. Discovery and implementation must remain separate if the seam is not already obvious and bounded. Do not mass-migrate feature ownership or combine lazy-loading with unrelated ownership cleanup.

Remaining roadmap: AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final full verification/reconciliation.
