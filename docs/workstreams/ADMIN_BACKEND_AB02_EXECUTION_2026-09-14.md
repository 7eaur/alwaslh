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

Source implementation checkpoint:

`0d07a24aa062ad569ff654524bdc13a4e368f399`

Owner added:

`apps/admin-web/src/app/layouts/AdminShell.tsx`

The owner now contains:

- global sidebar/navigation chrome;
- Admin brand block used by shell/auth states;
- account/profile display;
- logout action;
- shell layout around route children.

`App.tsx` now composes authenticated state as:

`AdminSessionProvider → session boundary → AdminShell → AdminRoutes`

It no longer owns sidebar/account/navigation markup.

### Deliberate non-goals for seam 1

- route table not moved;
- workflow pages not migrated;
- `admin-navigation.ts` ownership not changed;
- route lazy-loading not introduced;
- CSS ownership not broadened;
- outer `router.tsx`, `RouteFocus` and product-shell semantics not duplicated.

### Verification

Current verification/head after documentation handoff: `1c081a7687cf90242dc57b7fc52522bbe7401f5e`.

- Architecture Guard `34838037118` — SUCCESS.
- Frontend Preparation `34838037114` — SUCCESS.
- Combined Integration `34838123077` — SUCCESS.
- Stage13G `34838123143` — SUCCESS.
- Stage13G includes Admin lint/typecheck/unit/build, backend quality/integration/auth/security, clean PostgreSQL and real API + PostgreSQL + Chromium.

Earlier source-head long runs were cancelled by subsequent documentation pushes; current-head equivalent required gates completed green, so seam 1 is closed.

## Seam 2 — Inner Admin route-table ownership — DISCOVERED / NEXT

### Evidence

Live `apps/admin-web/src/App.tsx` still eagerly imports every major workflow surface and owns:

- the complete inner `/app/*` route table;
- redirect/not-found route composition;
- route-only wrappers `ReviewArea` and `WorkspaceWithRelatedActions`;
- all large workflow imports.

Live `apps/admin-web/src/app/` currently contains only `layouts/`; there is no app-owned inner router yet.

Live `apps/admin-web/src/features/` currently contains only the migrated `auth` feature. Other workflow surfaces remain under transitional `src/admin/*`, so introducing feature route entries for every workflow in one move would be a broad ownership rewrite and is explicitly rejected for this next seam.

Outer `apps/admin-web/src/router.tsx` already owns product-level routing (`/` → `/app`, `/app/*`, outer not-found) plus `RouteFocus`; that outer responsibility must stay separate during seam 2.

### Smallest target

Create an app-owned inner route module, preferably:

`apps/admin-web/src/app/router/AdminRoutes.tsx`

Move **only** the current inner route-table composition from `App.tsx` into that owner, including route-only wrappers/not-found composition required by the table.

`App.tsx` should then retain only:

- `AdminSessionProvider`;
- session boundary states;
- authenticated composition `AdminShell + AdminRoutes`;
- temporary login/full-page auth-state presentation until a later bounded seam.

### Compatibility rule

For this seam, `AdminRoutes.tsx` may keep the same transitional `src/admin/*` page imports. Do **not** simultaneously migrate every workflow into `features/*`, change URLs, introduce lazy imports, redesign pages, or rewrite session-expiry plumbing. Those are later independent seams.

This is an ownership extraction, not a behavior change.

### Required verification for seam 2

At minimum:

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- route/deep-link/focus/auth/session relevant tests;
- Stage13G real API + PostgreSQL + Chromium;
- Combined Integration when triggered/required.

Do not mark seam 2 DONE until exact-head equivalent green evidence exists.

## Later AB-02 candidates — NOT YET AUTHORIZED

After seam 2 closes, inspect evidence before choosing among:

- feature public/routes entry points;
- substantial route lazy boundaries/Suspense;
- outer router/presentation ownership cleanup;
- login/auth presentation ownership;
- navigation definition ownership;
- error-boundary composition.

Do not pre-combine these into seam 2.
