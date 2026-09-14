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

Closure evidence:

- Architecture Guard `34838037118` — SUCCESS;
- Frontend Preparation `34838037114` — SUCCESS;
- Combined Integration `34838123077` — SUCCESS;
- Stage13G `34838123143` — SUCCESS.

## Seam 2 — Inner Admin route-table ownership — IMPLEMENTED / WAITING_FOR_CI

### Source checkpoint

`732555cb9b8499c712ad6cd19ad50cccf26a8e4a`

### New owner

`apps/admin-web/src/app/router/AdminRoutes.tsx`

### What moved

- the complete existing inner `/app/*` route table;
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

- all workflow imports remain transitional under `src/admin/*`;
- routes remain eager; no `lazy()`/Suspense introduced;
- no route URL or redirect changed;
- `onSessionExpired` remains the route-table contract;
- outer `apps/admin-web/src/router.tsx` and `RouteFocus` are untouched;
- no feature-folder migration;
- no workflow UI/CSS/business behavior change;
- no API, PostgreSQL, migration or Student frontend implementation change.

### Verification state

Exact-head Actions started for `732555cb…`. At the sequence-25 handoff they were not all complete:

- Architecture Guard run `34840954071` — queued when inspected;
- Stage13G run `34840953847` — queued/in-progress;
- Stage13E Admin Web quality run `34840953959` — queued;
- Stage13E Admin AI run `34840953862` — queued.

Inspect exact commit check-runs for the complete set. This seam remains `WAITING_FOR_CI`; do not mark DONE until required source-head/source-tree-equivalent Architecture Guard + Admin quality + route/auth/focus + Combined/Stage13G real API/PostgreSQL/Chromium evidence is green.

## Later AB-02 candidates — NOT YET AUTHORIZED

Only after seam 2 closes, inspect evidence before selecting one smallest next seam among:

- feature public/routes entry points;
- substantial route lazy boundaries/Suspense;
- outer router/presentation ownership cleanup;
- login/auth presentation ownership;
- navigation definition ownership;
- error-boundary composition.

Do not combine these prematurely.
