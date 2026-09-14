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

## Seam 3 — Substantial workflow route lazy boundaries — IMPLEMENTED / WAITING_FOR_CI

### Source checkpoint

`f60d3d0d163c9f31dead139cc36406396f795a7e`

### Discovery evidence

Before this seam, `apps/admin-web/src/app/router/AdminRoutes.tsx` statically imported every major workflow destination under `src/admin/*`: Overview, Curriculum, Content/Lesson Tools, Review workspaces, Questions, Quizzes, Students, Access Codes, Operations and AI Authoring. Entering `/app` therefore placed all workflow modules in the initial route graph.

The AB-00 baseline was one `968.68 kB / 193.92 kB gzip` JavaScript chunk with a Vite warning. The latest verified pre-seam Stage13G Admin build (`34841142975`, job `103966179619`) had improved independently to one `446.30 kB / 117.48 kB gzip` JavaScript chunk, but remained a single eager workflow graph.

### Implemented ownership shape

`AdminRoutes.tsx` still owns the route table, but substantial workflow page modules are now explicit `React.lazy(() => import(...))` route boundaries. Existing named workflow exports are preserved and adapted only at each lazy import boundary.

One route-level `Suspense` wraps the route table. Its loading fallback uses the already-shared `AdminProductState` primitive with Arabic loading copy, avoiding any new state component or dependency.

### Preserved contracts

- all existing `/app/*` URLs and redirects;
- `onSessionExpired` passed to every workflow as before;
- `ReviewArea`, `WorkspaceWithRelatedActions` and not-found route composition;
- outer `router.tsx`, `RouteFocus`, deep-link behavior and focus ownership;
- session restore/login/logout behavior;
- workflow business logic, API calls, CSS and product copy outside the loading fallback;
- transitional `src/admin/*` ownership until AB-03 vertical slices.

### Explicit non-changes

- no feature-folder migration or new feature public/routes entry points;
- no navigation IA/auth redesign;
- no error-boundary redesign;
- no bundler warning-threshold or `manualChunks` tuning;
- no API/PostgreSQL/migration/Student frontend changes.

### Verification at current handoff

- Architecture Guard `34849322458` — SUCCESS on source checkpoint.
- Frontend Preparation `34849322443` — SUCCESS on source checkpoint.
- Admin AI `34849322533` — still running when documentation handoff began.
- Combined Integration `34849322335` — still running when documentation handoff began.
- Stage13G `34849322551` — still running when documentation handoff began.

Because the required Admin/Combined/Stage13G evidence had not all completed, Seam 3 is intentionally not marked DONE. Documentation-only commits after the source checkpoint may supersede/cancel source-head workflows; a later green run can be accepted only when its Admin source tree is demonstrably equivalent.

### Remaining closure requirements

1. Admin lint + strict typecheck + unit tests + production build.
2. Record actual resulting Vite dynamic chunk topology/sizes against pre-seam `446.30 kB / 117.48 kB gzip` single-chunk evidence and AB-00 baseline.
3. Verify representative direct deep links, redirects, lazy workflow session expiry and accessible focus/loading behavior.
4. Combined Integration with clean PostgreSQL/backend/auth regressions and real Admin Chromium.
5. Stage13G with real API + PostgreSQL + Chromium.
6. If any gate fails, fix its root cause within this seam; do not weaken checks or hide debt with bundler tuning.

### Deletion / closure condition

Seam 3 closes only when substantial workflow imports remain non-eager, the production build demonstrates real route/workflow dynamic chunks, direct/deep-link/session/focus behavior is green, and required exact-head/source-tree-equivalent gates are successful. No compatibility alias was introduced.

## Exact next step

Verification/closure only for Seam 3. Inspect source-head or source-tree-equivalent gates, record measured chunk output and close only if all required evidence is green. Do not select another AB-02 seam before that closure.
