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

### AB-02.3 Substantial workflow route lazy boundaries — DONE

Source checkpoint: `f60d3d0d163c9f31dead139cc36406396f795a7e`.

`AdminRoutes.tsx` now owns explicit `React.lazy()` boundaries for substantial Admin workflow destinations and one route-level `Suspense` fallback using the existing shared `AdminProductState` primitive. URLs, redirects, wrappers, `onSessionExpired`, outer router/focus behavior and workflow contracts remain unchanged. No feature migration, navigation/auth redesign, API/DB/migration or Student frontend change was included.

Closure evidence:

- Architecture Guard `34849322458` — SUCCESS on source checkpoint.
- Frontend Preparation `34849322443` — SUCCESS on source checkpoint.
- Admin AI `34849322533` — SUCCESS on source checkpoint.
- Source-tree-equivalent Combined Integration `34849829516` — SUCCESS.
- Source-tree-equivalent Stage13G `34849829576` — SUCCESS, including Admin/API quality, clean PostgreSQL/contracts/integrations/auth regression and Real API + PostgreSQL + Chromium.
- Comparison `f60d3d0d… → c1ac48f0…` contains documentation files only after the source checkpoint, so the later green runs verify the same implementation tree.

Measured production build after the seam:

- initial JS: **196.84 kB / 64.11 kB gzip**, down from verified pre-seam **446.30 kB / 117.48 kB gzip**;
- substantial workflow chunks are emitted independently; largest observed lazy workflow chunk is `AiOperationsPage` at **41.23 kB / 10.82 kB gzip**;
- representative chunks include Curriculum **21.78/5.05**, AI Authoring **18.09/5.27**, Content Ingestion **17.28/5.41**, Question Detail **16.94/4.78**, Quiz Detail **15.25/4.50**, Students **12.74/4.08** kB/gzip;
- no warning-threshold or `manualChunks` tuning was used to manufacture this result.

## Remaining roadmap

Select at most one further evidence-backed AB-02 seam from live repository evidence; if no further shell/router concern is justified, perform the AB-02 closure gate instead of inventing abstraction. Then continue AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
