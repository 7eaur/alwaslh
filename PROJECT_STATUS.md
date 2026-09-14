# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.2 Curriculum + Content + OCR`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read first: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`, then the autonomous protocol, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, and the active workstream record.

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
- No permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `d43fe2afe29b02093510177b921c0407e21a3de9`.

Comparison from the prior Admin/backend reconciliation baseline `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0` to current live `main` remains confined to Student frontend/PWA workflow files under `apps/student-web` plus `.github/workflows/stage16-student-pwa.yml`. No overlapping Admin/API/PostgreSQL/shared-contract implementation change is currently proven for AB-03.2.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

Authoritative green evidence: Architecture Guard `34876404251`; Frontend Preparation `34876404345`; Admin AI Operations `34876404287`; Combined Integration `34876404314`; Stage13G Admin Operations `34876404237`.

### AB-03.2 Curriculum + Content + OCR — ACTIVE

#### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Feature implementation ownership lives in `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts` with narrow consumer access through `features/curriculum/public`. The root Curriculum compatibility re-export facade remains intentionally transitional for legitimate later-slice consumers; it is compatibility debt only, not duplicate implementation ownership.

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Green closure evidence: Architecture Guard `34887051028`; Frontend Preparation `34887051091`; Admin AI Operations `34887416193`; Combined Integration `34887416088`; Stage13G Admin Operations `34887416108`.

#### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Content ingestion transport/types implementation lives in `apps/admin-web/src/features/content/api/content-ingestion-api.ts`, exposed through `apps/admin-web/src/features/content/public/index.ts`. Root `apps/admin-web/src/content-ingestion-api.ts` is a transitional compatibility facade only; API paths, payloads, response contracts and behavior are unchanged.

Corrected executable/source checkpoint: `4ba7106f910098841a7026114dcfa2f2cd1f83bf`.

Green closure evidence: Architecture Guard `34891198234`; Admin AI Operations `34892857039`; Combined Integration `34892857011`; Stage13G Admin Operations / PostgreSQL / Chromium `34892857278`.

#### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED

The implementation/types live in `apps/admin-web/src/features/content/api/content-operations-api.ts` and the feature public boundary exposes the required contract. `OcrSourcePreview.tsx` consumes the feature boundary directly. Root `apps/admin-web/src/content-operations-api.ts` was compatibility-only before AB-03.2.4.

Executable/source checkpoint: `866912f4640aa4696b896a1d897bff7ad67024f4`.

Exact-head green closure evidence: Architecture Guard `34898665849`; Frontend Preparation `34898665740`; Admin AI Operations `34898665783`; Combined Integration `34898665724`; Stage13G Admin Operations / PostgreSQL / Chromium `34898665675`.

#### AB-03.2.4 Content operations compatibility facade retirement — IMPLEMENTED / WAITING_FOR_CI

`ContentOperationsPage.tsx` now consumes `../../features/content/public` directly and root `apps/admin-web/src/content-operations-api.ts` has been deleted. No API, PostgreSQL, security, route, UI behavior or Student frontend implementation changed.

Executable/source checkpoint: `ca8381c45cab7ae6a8500c88325042451fbed20f`.

Current exact-head CI: Architecture Guard `34906963160` — SUCCESS; Frontend Preparation `34906963113` — QUEUED; Admin AI Operations `34906963149` — IN PROGRESS; Combined Integration `34906963163` — IN PROGRESS; Stage13G Admin Operations / PostgreSQL / Chromium `34906963142` — PENDING. Do not mark AB-03.2.4 DONE until required gates are green.

## Remaining roadmap

Close AB-03.2.4 exact-head verification, then perform fresh Content/OCR closure discovery before advancing to AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
