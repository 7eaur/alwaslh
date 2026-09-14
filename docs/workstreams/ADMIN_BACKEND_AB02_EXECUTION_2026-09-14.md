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

Source checkpoint: `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`.

Owner: `apps/admin-web/src/app/router/AdminRoutes.tsx`.

Moved: complete inner `/app/*` route table plus route-local redirect/not-found composition. `App.tsx` retained session/provider/authenticated composition only.

Closure: Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS.

## Seam 3 — Substantial workflow route lazy boundaries — DONE

Source checkpoint: `f60d3d0d163c9f31dead139cc36406396f795a7e`.

`AdminRoutes.tsx` owns explicit `React.lazy()` boundaries for substantial workflow destinations and one route-level `Suspense` fallback using the existing shared `AdminProductState` primitive. URLs, redirects, wrappers, session-expiry callbacks, outer router/focus behavior and workflow contracts remain unchanged.

Closure evidence:

- Architecture Guard `34849322458` — SUCCESS;
- Frontend Preparation `34849322443` — SUCCESS;
- Admin AI `34849322533` — SUCCESS;
- source-tree-equivalent Combined `34849829516` — SUCCESS;
- source-tree-equivalent Stage13G `34849829576` — SUCCESS, including Admin/API quality, clean PostgreSQL/contracts/integrations/auth regression and Real API + PostgreSQL + Chromium.

Measured build: initial JS **196.84 kB / 64.11 kB gzip** from verified pre-seam **446.30 kB / 117.48 kB gzip**, with independent workflow chunks and no threshold/manualChunks tuning.

## Seam 4 — Auth login presentation ownership — DONE

### Evidence / reason

AB-01 explicitly left root `apps/admin-web/src/LoginScreen.tsx` as transitional presentation debt for AB-02. The seam moved this feature presentation into auth ownership without changing behavior.

### Source implementation checkpoint

`d4c3c7896043ea6b1cc4cac1dd404d7912131916`

### Ownership correction

- `apps/admin-web/src/features/auth/ui/LoginScreen.tsx` owns login presentation;
- `features/auth/public/index.ts` exposes `LoginScreen` as the narrow composition contract;
- `App.tsx` consumes `LoginScreen` through the auth public boundary;
- transitional root `apps/admin-web/src/LoginScreen.tsx` is deleted.

Behavior is unchanged: same form fields/validation attributes, pending/error handling, `loginAdmin` call, authenticated profile callback, session acceptance and post-auth focus behavior. No API/backend/PostgreSQL/migration/Student frontend changes were made.

### Closure evidence

Source-tree-equivalent verification head: `080b8e131da72b0795f647809239a815d4604210`.

Compare from source implementation checkpoint to verification head shows only canonical/shared documentation files changed; no Admin/API/migration/test/workflow source changed.

- Architecture Guard `34853562192` — SUCCESS.
- Admin AI `34853935899` — SUCCESS.
- Combined Integration `34853935696` — SUCCESS.
- Stage13G `34853935720` — SUCCESS, including Admin lint/typecheck/unit/build, API lint/typecheck/unit/build, clean PostgreSQL migrations, DB contract verification, operations/security/audit/AI integrations, auth regression, and Real API + PostgreSQL + Chromium.

## Exact next step

1. Perform one final AB-02 closure inspection against live `App.tsx`, shell, router and provider ownership.
2. Existing legacy `src/admin/*` workflow pages are intentionally transitional until AB-03; do not use them as justification for mechanical AB-02 moves.
3. If no material shell/router/provider debt remains, close AB-02 rather than inventing abstraction.
4. Reconcile live `main` before starting AB-03 because it is a structural phase boundary.
5. Do not combine AB-02 closure with an AB-03 workflow migration.
