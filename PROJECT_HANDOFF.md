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
- live `main`: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

Relative to prior reconciled main `258c5bc2c09a049afb57c0593b5b6ca9db532c62`, implementation changes are Student-focused and do not overlap `apps/admin-web`, `apps/api`, or `database/migrations`. Shared project docs did move and require deliberate reconciliation later.

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

Source implementation checkpoint: `0d07a24aa062ad569ff654524bdc13a4e368f399`.

Owner: `apps/admin-web/src/app/layouts/AdminShell.tsx`.

Verified closure evidence:

- Architecture Guard `34838037118` — SUCCESS;
- Frontend Preparation `34838037114` — SUCCESS;
- Combined Integration `34838123077` — SUCCESS;
- Stage13G `34838123143` — SUCCESS.

## AB-02.2 — Inner Admin route-table ownership — IMPLEMENTED / WAITING_FOR_CI

Source implementation checkpoint:

`732555cb9b8499c712ad6cd19ad50cccf26a8e4a`

New owner:

`apps/admin-web/src/app/router/AdminRoutes.tsx`

The source seam moved only:

- the complete inner `/app/*` route table;
- `ReviewArea`;
- `WorkspaceWithRelatedActions`;
- `AdminRouteNotFound`.

`App.tsx` now keeps session/provider/auth-state composition plus `AdminShell + AdminRoutes`.

Deliberately unchanged:

- transitional `src/admin/*` workflow imports/ownership;
- eager loading / no new Suspense;
- URLs and redirects;
- `onSessionExpired` contract;
- outer `apps/admin-web/src/router.tsx`, `RouteFocus`, product-shell behavior;
- workflow UI/CSS/business behavior;
- API/PostgreSQL/migrations/Student frontend implementation.

### Current verification

Exact-head Actions for `732555cb…` started but were not complete at handoff:

- Architecture Guard `34840954071` — queued at inspection;
- Stage13G `34840953847` — queued/in-progress;
- Stage13E Admin Web quality `34840953959` — queued;
- Stage13E Admin AI `34840953862` — queued.

Additional exact-head checks may be present; inspect the commit check-runs rather than relying only on this list.

## Exact continuation

1. Re-fetch live branch/main and shared state.
2. Inspect all required checks for source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a` or a source-tree-equivalent documentation head.
3. If Architecture Guard + Admin quality + relevant route/auth/focus + Combined/Stage13G real API/PostgreSQL/Chromium are green, close **AB-02.2 only** and update canonical docs/state.
4. If any gate fails, diagnose and fix the root cause without weakening tests/guardrails.
5. Do not begin lazy-loading, feature route-entry migration, navigation ownership or another AB-02 seam until AB-02.2 is closed.

## Remaining roadmap

AB-02 shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI Jobs + AI Review → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
