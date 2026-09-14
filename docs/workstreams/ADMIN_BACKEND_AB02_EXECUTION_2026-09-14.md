# AB-02 — Thin Admin Shell + Routing Execution Record

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**  
Branch: `rebuild/super-admin-foundation`  
PR: #52 — Draft only; never auto-merge.

## Goal

Make the Super Admin root a thin composition layer with one shell/navigation owner, explicit router ownership, feature route boundaries and substantial route lazy-loading, while preserving auth/session, deep-link, focus, RTL/responsive and real-browser behavior.

AB-02 does **not** redesign business workflows. Workflow IA/business changes belong to AB-03 vertical slices.

## Permanent constraints

- `app` composes only.
- Feature internals remain private; app eventually consumes feature `public`/`routes` entries.
- Shared cannot import app/features.
- Keep verified `/app` base.
- One shell owns global chrome/navigation.
- Route focus/history/deep links remain first-class.
- Major workflow routes should lazy-load, but do not split tiny components or combine lazy-loading with unrelated ownership migrations.
- Preserve session restoration/login/logout/session-expiry outcomes.
- No new state framework/styling stack/design system.
- Existing legacy `src/admin/*` workflow pages may remain transitional until their AB-03 owner migration; AB-02 must not mechanically rewrite them.

## Seam 1 — Global Admin shell/layout ownership — DONE

Source implementation checkpoint: `0d07a24aa062ad569ff654524bdc13a4e368f399`.

Owner: `apps/admin-web/src/app/layouts/AdminShell.tsx`.

Closure evidence: Architecture Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

## Seam 2 — Inner Admin route-table ownership — DONE

### Source checkpoint

`732555cb9b8499c712ad6cd19ad50cccf26a8e4a`

### Owner

`apps/admin-web/src/app/router/AdminRoutes.tsx`

### What moved

- complete existing inner `/app/*` route table;
- route-local redirect/not-found composition;
- `ReviewArea`;
- `WorkspaceWithRelatedActions`;
- `AdminRouteNotFound`.

### What remains in `App.tsx`

- `AdminSessionProvider`;
- session restoring/error/signed-out/authenticated boundary;
- login/full-page auth-state presentation;
- authenticated composition `AdminShell + AdminRoutes`.

### Explicit non-changes

- workflow imports remain transitional under `src/admin/*`;
- routes remain eager; no `lazy()`/Suspense introduced;
- no route URL or redirect changed;
- `onSessionExpired` remains the route-table contract;
- outer `apps/admin-web/src/router.tsx` and `RouteFocus` remain untouched;
- no feature-folder migration;
- no workflow UI/CSS/business behavior change;
- no API, PostgreSQL, migration or Student frontend implementation change.

### Closure evidence

- Architecture Guard `34840954071` — SUCCESS on source checkpoint;
- Frontend Preparation `34840953959` — SUCCESS on source checkpoint;
- source-tree-equivalent Admin AI `34841142948` — SUCCESS;
- source-tree-equivalent Combined Integration `34841142987` — SUCCESS, including API/Admin quality, clean PostgreSQL, DB contract, backend authority/auth regressions and real Chromium;
- source-tree-equivalent Stage13G `34841142975` — SUCCESS, including Admin/API quality, clean PostgreSQL, integrations/auth and real API + PostgreSQL + Chromium.

Comparison `732555cb… → 2c2fcb6c…` includes documentation files only, so equivalent-head green CI verifies the same implementation tree. No source correction was needed to close this seam.

## Next AB-02 step — DISCOVERY ONLY

Before authorizing another implementation seam, inspect current composition and select one smallest bounded concern. Candidates:

- feature public/routes entry points;
- substantial route lazy boundaries/Suspense;
- outer router/presentation ownership cleanup;
- login/auth presentation ownership;
- navigation definition ownership;
- error-boundary composition.

For the selected candidate record current owner, target owner, preserved contracts, non-goals, tests/gates and deletion condition. Do not combine multiple candidates in one batch and do not mass-migrate `src/admin/*` feature ownership during AB-02.
