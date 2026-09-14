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
  - AB-02.3 Substantial workflow route lazy boundaries — SELECTED / NEXT IMPLEMENTATION
- AB-03..AB-08 — PENDING

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-02.1 closure

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; owner `apps/admin-web/src/app/layouts/AdminShell.tsx`. Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

## AB-02.2 closure

Source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`; owner `apps/admin-web/src/app/router/AdminRoutes.tsx`. Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS on source/source-tree-equivalent heads.

## AB-02.3 selected seam

Current `AdminRoutes.tsx` still statically imports every major workflow destination. Latest verified Stage13G Admin build (`34841142975`, job `103966179619`) emits one `446.30 kB / 117.48 kB gzip` JS chunk; this is improved from AB-00's `968.68 kB / 193.92 kB gzip` baseline but remains an eager workflow graph.

Target: preserve route-table ownership and convert substantial workflow destinations to `React.lazy()` dynamic boundaries, wrapped by one route-level `Suspense` fallback using existing `PageState kind="loading"` presentation.

Do not change URLs, redirects, `onSessionExpired`, deep links/focus, auth/session outcomes, workflow business/UI behavior or transitional `src/admin/*` ownership. Do not combine feature migration, navigation/auth changes, error-boundary redesign, bundler threshold/manualChunks tuning, API/DB changes or Student frontend work.

## Exact continuation

Implement **AB-02.3 only**:

1. replace static substantial workflow imports in `app/router/AdminRoutes.tsx` with explicit `React.lazy(() => import(...))` boundaries;
2. keep named workflow exports intact and adapt at import boundaries only;
3. add one accessible route-level `Suspense` loading fallback using the existing Admin product-state primitive;
4. preserve all current route wrappers and contracts;
5. run Architecture Guard + Admin lint/typecheck/unit/build;
6. record new Vite chunk topology/sizes against current `446.30 kB / 117.48 kB gzip` single-chunk evidence;
7. verify representative deep links, lazy route session expiry and focus/loading behavior;
8. run Combined + Stage13G real API/PostgreSQL/Chromium before marking DONE.

After AB-02.3 exact/source-equivalent green closure, select at most one next AB-02 seam from evidence. Do not mass-migrate workflow ownership before AB-03.

## Remaining roadmap

Finish AB-02 shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
