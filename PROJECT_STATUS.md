# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-02 — Thin Admin shell + routing`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read first: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`, then the autonomous protocol, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, and `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

Workers A/B/C share one branch and ordered roadmap. Never overlap an active worker. Every run performs one smallest coherent increment.

## Permanent rules

- PostgreSQL/API are canonical business authority.
- Backend stays one Fastify modular monolith; no microservices/DI/service locator without evidence.
- Admin `app` composes only; features own workflows and expose narrow public/routes boundaries.
- Feature internals stay private; shared cannot import app/features.
- No new global state/query framework or styling-stack rewrite without evidence.
- No fabricated metrics/outcomes/actions.
- Product states, Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are first-class requirements.
- Tests/security/validation are never weakened.
- No permanent dual ownership.

## Branch reconciliation

Live `main`: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

Latest implementation changes on main remain Student-focused and do not touch `apps/admin-web`, `apps/api`, or `database/migrations`. Shared project docs changed on main and require deliberate reconciliation before a structural phase boundary.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — ACTIVE

Canonical execution record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 Global Admin shell/layout ownership — DONE

Source checkpoint: `0d07a24aa062ad569ff654524bdc13a4e368f399`.  
Owner: `apps/admin-web/src/app/layouts/AdminShell.tsx`.

Closure: Architecture Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 Inner Admin route-table ownership — DONE

Source checkpoint: `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`.  
Owner: `apps/admin-web/src/app/router/AdminRoutes.tsx`.

Closure evidence: Architecture Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS on source/source-tree-equivalent heads.

### AB-02.3 Substantial workflow route lazy boundaries — SELECTED / NEXT IMPLEMENTATION

Discovery confirmed `AdminRoutes.tsx` still statically imports every major Admin workflow. The AB-00 baseline was one `968.68 kB / 193.92 kB gzip` JS chunk with a Vite warning; latest verified Stage13G build is improved to one `446.30 kB / 117.48 kB gzip` JS chunk, but still contains the major workflow graph eagerly.

Target: keep route ownership in `AdminRoutes.tsx`, convert substantial workflow destinations to `React.lazy()` dynamic boundaries, and use one existing `PageState kind="loading"` Suspense fallback. Preserve URLs, redirects, `onSessionExpired`, deep links, focus/session behavior and all workflow business/UI behavior. Do not combine with feature migration, navigation/auth redesign or manual chunk tuning.

Required closure: Architecture Guard + Admin quality/build + measured dynamic chunk evidence + direct/deep-link/session-expiry verification + Combined + Stage13G real Chromium.

## Remaining roadmap

Complete AB-02.3 and any further evidence-backed shell/router seams, then AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
