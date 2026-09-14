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
  - AB-02.3 Substantial workflow route lazy boundaries — IMPLEMENTED / WAITING_FOR_CI
- AB-03..AB-08 — PENDING

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-02.1 closure

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; owner `apps/admin-web/src/app/layouts/AdminShell.tsx`. Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

## AB-02.2 closure

Source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`; owner `apps/admin-web/src/app/router/AdminRoutes.tsx`. Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS on source/source-tree-equivalent heads.

## AB-02.3 implementation

Source checkpoint: `f60d3d0d163c9f31dead139cc36406396f795a7e`.

`apps/admin-web/src/app/router/AdminRoutes.tsx` now lazy-loads the substantial workflow destinations through explicit `React.lazy()` boundaries. Named exports remain unchanged and are mapped only at import boundaries. One route-level `Suspense` fallback uses the existing shared `AdminProductState` loading presentation.

Preserved contracts: all `/app/*` URLs/redirects, `onSessionExpired`, `ReviewArea`, `WorkspaceWithRelatedActions`, not-found composition, outer `router.tsx`/`RouteFocus`, session outcomes and workflow UI/business behavior. No feature migration, navigation/auth redesign, bundler threshold/manualChunks tuning, API/DB/migration or Student frontend change was included.

Source-head evidence at handoff:

- Architecture Guard `34849322458` — SUCCESS;
- Frontend Preparation `34849322443` — SUCCESS;
- Admin AI `34849322533` — running at documentation handoff;
- Combined Integration `34849322335` — running at documentation handoff;
- Stage13G `34849322551` — running at documentation handoff.

Because required CI had not completed, AB-02.3 is intentionally `WAITING_FOR_CI`, not DONE.

## Exact continuation

Perform **AB-02.3 verification/closure only**:

1. inspect source-head runs above and any later source-tree-equivalent runs caused by documentation-only commits;
2. confirm Admin lint/typecheck/unit/build and record actual dynamic Vite chunk topology/sizes against prior single `446.30 kB / 117.48 kB gzip` evidence;
3. confirm representative lazy-route direct/deep links, redirects, session expiry and accessible focus/loading behavior through executable/Chromium evidence;
4. require Combined + Stage13G real API/PostgreSQL/Chromium green;
5. if any gate fails, fix the root cause inside this seam and re-run relevant verification;
6. only after green closure mark AB-02.3 DONE and select at most one next AB-02 concern from evidence.

Do not start another seam while AB-02.3 remains waiting.

## Remaining roadmap

Finish AB-02 shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
