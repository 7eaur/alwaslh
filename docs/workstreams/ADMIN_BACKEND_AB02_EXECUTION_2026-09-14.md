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

## Seam 3 — Substantial workflow route lazy boundaries — SELECTED / IMPLEMENTATION NEXT

### Discovery evidence

Current `apps/admin-web/src/app/router/AdminRoutes.tsx` still statically imports every major workflow destination under `src/admin/*`: Overview, Curriculum, Content/Lesson Tools, Review workspaces, Questions, Quizzes, Students, Access Codes, Operations and AI Authoring. This means entering `/app` still places all of those workflow modules in the initial route graph even though the operator uses one destination at a time.

The original AB-00 measured baseline was one `968.68 kB` minified / `193.92 kB` gzip main JavaScript chunk with Vite's >500 kB warning. The latest source-tree-equivalent Stage13G Admin build (`34841142975`, job `103966179619`) has improved independently to one `446.30 kB` / `117.48 kB` gzip JavaScript chunk, but it is still a single eager chunk and contains all major Admin workflow imports. The warning disappearing does **not** close the architecture requirement for substantial route lazy boundaries.

React is `18.3.1`, React Router DOM `7.9.5`, and Vite `7.1.3`; no dependency change is required.

### Current owner

`apps/admin-web/src/app/router/AdminRoutes.tsx` owns both the route table and eager imports of all major workflow page components.

### Target owner / implementation shape

Keep route-table ownership in `AdminRoutes.tsx`, but convert substantial workflow page modules to `React.lazy(() => import(...))` route boundaries. Use one route-level `Suspense` fallback backed by the existing Admin `PageState kind="loading"` presentation primitive rather than inventing another loading component.

Named exports may be adapted at the lazy import boundary with the smallest explicit mapping necessary; do not change the underlying workflow module exports merely to satisfy lazy loading.

### Preserved contracts

- all existing `/app/*` URLs and redirects;
- `onSessionExpired` passed to every workflow exactly as today;
- `ReviewArea`, `WorkspaceWithRelatedActions` and not-found route composition;
- outer `router.tsx`, `RouteFocus`, deep-link behavior and focus restoration;
- session restore/login/logout behavior;
- workflow business logic, API calls, CSS and product copy;
- transitional `src/admin/*` ownership until AB-03 vertical slices.

### Explicit non-goals

- no feature-folder migration or new feature public/routes entry points in the same batch;
- no navigation IA changes;
- no auth/login presentation changes;
- no error-boundary redesign;
- no bundler threshold changes/manualChunks tuning;
- no tiny-component splitting;
- no API/PostgreSQL/migration/Student frontend changes.

### Verification required before DONE

1. Architecture Guard.
2. Admin lint + strict typecheck + unit tests + production build.
3. Record resulting Vite chunk topology/sizes against the current `446.30 kB / 117.48 kB gzip` single-chunk evidence and the AB-00 baseline; improvement must come from actual dynamic route chunks, not threshold suppression.
4. Verify representative direct deep links for lazy destinations and route redirects.
5. Verify session-expiry behavior remains intact from a lazily loaded workflow.
6. Combined Integration including clean PostgreSQL/backend/auth regressions and real Admin Chromium.
7. Stage13G including real API + PostgreSQL + Chromium.
8. Keyboard/focus behavior must remain valid across lazy route transitions; no blank/unannounced loading state.

### Deletion / closure condition

Seam 3 closes only when substantial workflow imports are no longer eager from `AdminRoutes.tsx`, the production build emits real route/workflow dynamic chunks, direct/deep-link/session behavior remains green, and required exact-head/source-tree-equivalent gates are successful. No compatibility alias should be introduced.

## Exact next step

Implement **Seam 3 only**: substantial workflow route lazy boundaries plus one accessible route-level Suspense loading state. Do not combine it with feature ownership migration, navigation/auth changes or UI redesign. After implementation, run the listed verification and document measured chunk output before selecting another AB-02 seam.
