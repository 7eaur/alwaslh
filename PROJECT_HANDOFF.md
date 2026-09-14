# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, code/tests and exact-head Actions;
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

Main implementation delta remains Student-focused with no Admin/API/migration overlap; shared project docs require deliberate reconciliation before a structural phase boundary.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — ACTIVE
  - AB-02.1 Global Admin shell/layout ownership — DONE
  - AB-02.2 Inner Admin route-table ownership — DONE
- AB-03..AB-08 — PENDING

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-02.1 closure

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; owner `apps/admin-web/src/app/layouts/AdminShell.tsx`. Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

## AB-02.2 closure

Source checkpoint:

`732555cb9b8499c712ad6cd19ad50cccf26a8e4a`

Owner:

`apps/admin-web/src/app/router/AdminRoutes.tsx`

The inner `/app/*` route table and route-local wrappers/not-found were moved out of `App.tsx`; existing URLs, redirects, session-expiry contract, eager loading, workflow UI/business behavior and outer router/focus behavior were preserved.

Verified closure evidence:

- Architecture Guard `34840954071` — SUCCESS on source head;
- Frontend Preparation `34840953959` — SUCCESS on source head;
- Admin AI `34841142948` — SUCCESS on source-tree-equivalent documentation head;
- Combined `34841142987` — SUCCESS with quality gates, clean PostgreSQL, backend/auth regressions and real Chromium;
- Stage13G `34841142975` — SUCCESS with Admin/API quality, clean PostgreSQL, integration/auth and real API + PostgreSQL + Chromium.

Comparison `732555cb… → 2c2fcb6c…` contained documentation files only, so the green equivalent-head runs verify the same source tree.

## Exact continuation

Do **not** implement another concern immediately. First perform one bounded AB-02 discovery step:

1. inspect current `App.tsx`, `app/layouts/AdminShell.tsx`, `app/router/AdminRoutes.tsx`, outer `router.tsx`, route imports and current bundle/ownership evidence;
2. identify one smallest next seam supported by evidence;
3. candidates include feature public/routes entries, substantial lazy route boundaries/Suspense, outer-router/presentation ownership, auth presentation ownership, navigation definition ownership or error-boundary composition;
4. do not combine lazy-loading with feature migration or unrelated UI redesign;
5. record current owner, target owner, preserved contracts, non-goals and required gates before implementation.

## Remaining roadmap

AB-02 shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
