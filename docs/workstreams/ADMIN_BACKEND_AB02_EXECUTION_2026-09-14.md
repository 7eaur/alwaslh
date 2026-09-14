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

### Closure evidence

- Architecture Guard `34840954071` — SUCCESS;
- Frontend Preparation `34840953959` — SUCCESS;
- Admin AI `34841142948` — SUCCESS;
- Combined `34841142987` — SUCCESS;
- Stage13G `34841142975` — SUCCESS.

No source correction was needed during closure.

## Seam 3 — Substantial workflow route lazy boundaries — DONE

### Source checkpoint

`f60d3d0d163c9f31dead139cc36406396f795a7e`

### Discovery evidence

Before this seam, `apps/admin-web/src/app/router/AdminRoutes.tsx` statically imported every major workflow destination under `src/admin/*`: Overview, Curriculum, Content/Lesson Tools, Review workspaces, Questions, Quizzes, Students, Access Codes, Operations and AI Authoring. Entering `/app` therefore placed all workflow modules in the initial route graph.

The AB-00 baseline was one `968.68 kB / 193.92 kB gzip` JavaScript chunk. The verified immediate pre-seam Stage13G build had improved independently to one `446.30 kB / 117.48 kB gzip` JavaScript chunk, but remained a single eager workflow graph.

### Implemented ownership shape

`AdminRoutes.tsx` still owns the route table, but substantial workflow page modules are explicit `React.lazy(() => import(...))` route boundaries. Existing named workflow exports are preserved and adapted only at each lazy import boundary.

One route-level `Suspense` wraps the route table. Its loading fallback uses the already-shared `AdminProductState` primitive with Arabic loading copy, avoiding any new state component or dependency.

### Preserved contracts

- all existing `/app/*` URLs and redirects;
- `onSessionExpired` passed to every workflow as before;
- route wrappers and not-found composition;
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

### Closure verification

- Architecture Guard `34849322458` — SUCCESS on source checkpoint.
- Frontend Preparation `34849322443` — SUCCESS on source checkpoint.
- Admin AI `34849322533` — SUCCESS on source checkpoint.
- Source-tree-equivalent Combined Integration `34849829516` — SUCCESS.
- Source-tree-equivalent Stage13G `34849829576` — SUCCESS.

Stage13G verifies:

- Admin lint, strict typecheck, **76/76** unit tests and production build;
- API lint/typecheck/unit/build;
- all migrations on clean PostgreSQL and Stage13G DB contract;
- Accounts + Access, Notifications + Operations, Reports + Settings + Security + Audit and AI authoring integration suites;
- Access/Auth regression;
- Real API + PostgreSQL + Chromium suite.

Comparison `f60d3d0d… → c1ac48f0…` includes documentation files only after the source checkpoint; no Admin/API/PostgreSQL implementation changed, so the later green CI is valid source-tree-equivalent closure evidence.

### Measured production chunk topology

Stage13G Admin build at equivalent head produced:

- `index` initial JS: **196.84 kB / 64.11 kB gzip**;
- `AiOperationsPage`: **41.23 / 10.82**;
- `CurriculumWorkspace`: **21.78 / 5.05**;
- `AdminAiAuthoringWorkspace`: **18.09 / 5.27**;
- `ContentIngestionPage`: **17.28 / 5.41**;
- `QuestionBankDetailPage`: **16.94 / 4.78**;
- `QuizBuilderDetailPage`: **15.25 / 4.50**;
- `AdminAccessCodeReportsPage`: **13.17 / 4.46**;
- `AdminStudentsPage`: **12.74 / 4.08** kB/gzip;
- multiple additional smaller workflow/API/shared chunks.

The initial JS therefore fell from verified pre-seam **446.30 / 117.48** to **196.84 / 64.11 kB/gzip** while producing real route/workflow chunks. No threshold or `manualChunks` tuning was introduced.

### Closure decision

Seam 3 is **DONE**. Substantial workflow imports are no longer eager, the production build proves real dynamic route/workflow chunks, and required Admin/API/PostgreSQL/integration/Chromium evidence is green. No compatibility alias was introduced.

## Exact next step

Perform **remaining AB-02 discovery only**. Re-read current `App.tsx`, app router/providers/layout ownership and architecture-guard evidence. Select at most one smallest remaining shell/router concern if current code justifies it. If no material concern remains, close AB-02 rather than inventing abstraction. Before starting AB-03, reconcile live `main` at the structural phase boundary.
