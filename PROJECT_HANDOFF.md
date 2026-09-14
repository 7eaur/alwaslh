# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, current code/tests/migrations and exact-head Actions;
6. confirm no active worker collision;
7. compare live `main` at structural phase boundaries or when overlapping scoped changes appear.

Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned here: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification.

Excluded only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

Latest live-main reconciliation shows the only move since the prior checkpoint is Student Experience V2; no `apps/api`, `apps/admin-web`, or `database/migrations` path appears in that main-only delta.

## Execution governance

Workers A/B/C share one branch and roadmap in serial order. Shared state is `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. If another worker is active, do not mutate overlapping work. Each run performs one smallest coherent increment and leaves exact HEAD, CI evidence, next step and one of `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, `COMPLETE`.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — ACTIVE
- AB-03..AB-08 — PENDING

Canonical AB-02 execution record:

`docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`

## AB-02.1 closure — Global Admin shell/layout ownership — DONE

Source implementation checkpoint:

`0d07a24aa062ad569ff654524bdc13a4e368f399`

Owner:

`apps/admin-web/src/app/layouts/AdminShell.tsx`

`App.tsx` no longer owns global sidebar/navigation/account/logout markup. It composes authenticated state as `AdminShell + AdminRoutes`.

Verified closure evidence:

- Architecture Guard `34838037118` — SUCCESS;
- Frontend Preparation `34838037114` — SUCCESS;
- Combined Integration `34838123077` — SUCCESS;
- Stage13G `34838123143` — SUCCESS, including Admin/API quality, clean PostgreSQL, backend/auth/security integrations and real API + PostgreSQL + Chromium.

Earlier long source-head runs were cancelled by later documentation pushes; current-head required equivalent coverage completed green.

## Exact continuation — AB-02.2 Inner Admin route-table ownership

Live `apps/admin-web/src/App.tsx` still owns:

- every large workflow import;
- the full inner `/app/*` route table;
- redirects and inner not-found composition;
- route-only wrappers `ReviewArea` and `WorkspaceWithRelatedActions`.

Live `apps/admin-web/src/app/` has no router owner yet. `features/` currently contains only Auth; other workflow surfaces remain transitional under `src/admin/*`. Outer `router.tsx` already owns product-level `/`, `/app/*`, outer not-found and `RouteFocus` and must not be duplicated in this seam.

### Next smallest source mutation

Create:

`apps/admin-web/src/app/router/AdminRoutes.tsx`

Move **only** the existing inner route-table composition and its route-only wrappers/not-found state from `App.tsx` into that module.

Afterward `App.tsx` should keep session/provider/auth-state composition and `AdminShell + AdminRoutes` only.

### Do not combine in this seam

- no feature folder migrations;
- no new feature public/routes entries for all workflows;
- no lazy imports/Suspense yet;
- no URL/IA changes;
- no workflow redesign;
- no session-expiry contract change;
- no outer `router.tsx` change;
- no broad CSS/navigation-definition move.

### Verification expectations

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- relevant auth/session/navigation/deep-link/focus tests;
- Stage13G real API + PostgreSQL + Chromium;
- Combined Integration when triggered/required.

Mark AB-02.2 DONE only when exact-head-equivalent green evidence exists.

## Remaining roadmap

AB-02 shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.