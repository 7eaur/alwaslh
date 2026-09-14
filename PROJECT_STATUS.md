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
- No permanent dual ownership.

## Branch reconciliation

Live `main` latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation is complete. No new overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed through Worker A sequence 42.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

- AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.1.2 Operations frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.1.3 Operations presentation-model ownership — DONE / EXACT-SOURCE VERIFIED.

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

Worker A sequence 42 performed the required slice-closure discovery and found no further evidence-backed correction inside Overview + Operations. Current ownership is coherent: Overview/Operations pages consume the narrow `features/operations/public` contract; Operations transport and presentation model are feature-owned; HTTP owns admin authorization/query validation; attention application owns orchestration; `AdminOperationsService` remains PostgreSQL-backed operational/governance/audit authority. Existing page/style locations are not defects by themselves and were not moved.

Exact-source verification on `7eda86f...` remains authoritative because compare from that checkpoint to the pre-run HEAD contained documentation only:

- Architecture Guard `34876404251` — SUCCESS;
- Frontend Preparation `34876404345` — SUCCESS;
- Admin AI Operations `34876404287` — SUCCESS;
- Combined Integration `34876404314` — SUCCESS, including real Admin Chromium;
- Stage13G Admin Operations `34876404237` — SUCCESS, including Admin/API quality, clean PostgreSQL, relevant operations/security/auth integrations and Real API + PostgreSQL + Chromium.

### AB-03.2 Curriculum + Content + OCR — ACTIVE / DISCOVERY NEXT

Exact next step: perform discovery only for Curriculum + Content + OCR. Map operator jobs, current frontend owners, backend/API/PostgreSQL/security authority, publication/provenance/OCR contracts, consumer paths and tests. Select only the smallest evidence-backed correction after that discovery; do not combine broad restructuring with discovery.

## Remaining roadmap

AB-03 slices in canonical order: Curriculum + Content + OCR → AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
