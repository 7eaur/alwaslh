# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.1 Overview + Operations`.

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
- No permanent dual ownership.

## Branch reconciliation

Live `main` latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation is complete. No new overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed at Worker B sequence 40 startup.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — ACTIVE

**AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.**

**AB-03.1.2 Operations frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.**

**AB-03.1.3 Operations presentation-model ownership — IMPLEMENTED / WAITING_FOR_CI.**

Source checkpoint: `25ce968ea90e67240e5e6bffd12b0d52cb37e8b1`.

Worker B sequence 40 moved `operations-model.ts` and its test from the legacy `admin/operations` owner to `features/operations/model`, exported the required presentation helpers through `features/operations/public`, switched Overview and Operations Health consumers to that public boundary, and deleted the legacy model/test owners. UI copy, routes, CSS, API/transport contracts, session behavior, backend/PostgreSQL/security authority and Student frontend behavior were intentionally unchanged.

Exact-head CI on the source checkpoint was started automatically. Architecture Guard `34874655955` is **SUCCESS**. Frontend Preparation `34874655918`, Admin AI Operations `34874655925`, Combined Integration `34874655884`, and Stage13G Admin Operations `34874655953` were still pending/running at handoff, so AB-03.1.3 must not be marked DONE yet.

**Exact next step:** verification/closure only for AB-03.1.3. Confirm the remaining exact-head or source-tree-equivalent Admin/API/PostgreSQL/security/integration/Chromium gates are green, then re-run the AB-03.1 slice-closure decision. Do not begin Curriculum + Content + OCR before this closure.

## Remaining roadmap

Finish Overview + Operations only, then AB-03 slices in canonical order: Curriculum + Content + OCR → AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
