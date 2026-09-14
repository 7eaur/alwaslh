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
  - AB-02.3 Substantial workflow route lazy boundaries — DONE
- AB-03..AB-08 — PENDING

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-02.1 closure

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; owner `apps/admin-web/src/app/layouts/AdminShell.tsx`. Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

## AB-02.2 closure

Source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`; owner `apps/admin-web/src/app/router/AdminRoutes.tsx`. Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS on source/source-tree-equivalent heads.

## AB-02.3 closure

Source checkpoint: `f60d3d0d163c9f31dead139cc36406396f795a7e`.

`apps/admin-web/src/app/router/AdminRoutes.tsx` lazy-loads substantial workflow destinations through explicit `React.lazy()` boundaries. Existing named exports remain unchanged and are adapted only at import boundaries. One route-level `Suspense` fallback uses the existing shared `AdminProductState` loading presentation.

Preserved contracts: all `/app/*` URLs/redirects, `onSessionExpired`, route wrappers, not-found composition, outer `router.tsx`/`RouteFocus`, session outcomes and workflow behavior. No feature migration, navigation/auth redesign, bundler threshold/manualChunks tuning, API/DB/migration or Student frontend change was included.

Closure evidence:

- Guard `34849322458` — SUCCESS;
- Frontend Preparation `34849322443` — SUCCESS;
- Admin AI `34849322533` — SUCCESS;
- source-tree-equivalent Combined `34849829516` — SUCCESS;
- source-tree-equivalent Stage13G `34849829576` — SUCCESS, including clean PostgreSQL/contracts/integrations/auth and Real API + PostgreSQL + Chromium.

Measured production build: initial JS **196.84 kB / 64.11 kB gzip**, down from verified pre-seam **446.30 kB / 117.48 kB gzip**. Substantial workflows now emit independent chunks; largest observed workflow chunk is AI Operations at **41.23 kB / 10.82 kB gzip**. No threshold/manualChunks tuning was used.

Comparison from source checkpoint through the closure documentation contains documentation files only, so the later green CI verifies the same Admin implementation tree.

## Exact continuation

Perform **remaining AB-02 discovery only**:

1. re-read live `apps/admin-web/src/App.tsx`, `src/app/router/*`, providers/layout ownership and architecture guard evidence;
2. identify at most one remaining shell/router/provider concern that is materially justified by current code;
3. if no meaningful concern remains, close AB-02 instead of inventing abstractions;
4. before entering AB-03, reconcile live `main` because this is a structural phase boundary;
5. do not combine the discovery with an AB-03 workflow migration.

## Remaining roadmap

Finish/close AB-02 → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
