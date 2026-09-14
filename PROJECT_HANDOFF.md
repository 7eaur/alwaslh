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

Main implementation delta remains Student-focused with no Admin/API/migration overlap; shared project docs require deliberate reconciliation before the AB-03 structural phase boundary.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — ACTIVE
  - AB-02.1 Global Admin shell/layout ownership — DONE
  - AB-02.2 Inner Admin route-table ownership — DONE
  - AB-02.3 Substantial workflow route lazy boundaries — DONE
  - AB-02.4 Auth login presentation ownership — DONE
- AB-03..AB-08 — PENDING

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-02.4 closure

Source implementation checkpoint: `d4c3c7896043ea6b1cc4cac1dd404d7912131916`.

Ownership is now feature-correct:

- `apps/admin-web/src/features/auth/ui/LoginScreen.tsx` owns login presentation;
- `apps/admin-web/src/features/auth/public/index.ts` exposes the narrow composition contract;
- `App.tsx` consumes login presentation through that public boundary;
- transitional root `apps/admin-web/src/LoginScreen.tsx` is removed.

The verification head `080b8e131da72b0795f647809239a815d4604210` differs from the implementation checkpoint only by canonical/shared documentation. Required closure evidence is green:

- Architecture Guard `34853562192` — SUCCESS;
- Admin AI `34853935899` — SUCCESS;
- Combined Integration `34853935696` — SUCCESS;
- Stage13G `34853935720` — SUCCESS, including Admin/API quality, clean PostgreSQL migrations/contracts, auth/security/integration regressions and Real API + PostgreSQL + Chromium.

## Exact continuation

1. Perform one **final AB-02 closure inspection only** against live `App.tsx`, shell, router, providers and current architecture rules.
2. Do not manufacture a new abstraction. Existing legacy `src/admin/*` workflow pages are explicitly transitional to AB-03 vertical-slice ownership.
3. If no additional material AB-02 shell/router/provider debt is proven, close AB-02.
4. Before starting AB-03, reconcile live `main` deliberately because this is a structural phase boundary.
5. Do not combine AB-02 closure with the first AB-03 workflow migration.

## Remaining roadmap

Close AB-02 → reconcile live `main` → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
