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

Comparison from the prior Admin/backend reconciliation baseline `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0` to current live `main` contains only Student frontend/PWA workflow files under `apps/student-web` plus `.github/workflows/stage16-student-pwa.yml`. No new overlapping Admin/API/PostgreSQL/shared-contract implementation change is present for the current AB-03.2 discovery.

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

Content ingestion transport/types implementation now lives in `apps/admin-web/src/features/content/api/content-ingestion-api.ts`, exposed through `apps/admin-web/src/features/content/public/index.ts`. Root `apps/admin-web/src/content-ingestion-api.ts` is a transitional compatibility facade only; API paths, payloads, response contracts and behavior are unchanged.

Corrected executable source checkpoint: `4ba7106f910098841a7026114dcfa2f2cd1f83bf`.

Source-equivalent green closure evidence:

- Architecture Guard `34891198234` — SUCCESS on the exact corrected source checkpoint;
- Admin AI Operations `34892857039` — SUCCESS;
- Combined Integration `34892857011` — SUCCESS;
- Stage13G Admin Operations / PostgreSQL / Chromium `34892857278` — SUCCESS.

The later CI heads differ from the source checkpoint only by documentation/state changes, so executable source equivalence is preserved.

#### AB-03.2.3 Content operations + OCR frontend API ownership — NEXT / DISCOVERY COMPLETE

Worker A sequence 51 inspected the remaining Content/OCR frontend boundary without changing executable source. Evidence shows root `apps/admin-web/src/content-operations-api.ts` still owns Content operations/OCR transport and types while `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` and root `apps/admin-web/src/OcrSourcePreview.tsx` consume that root owner. This is the next proven split-ownership seam now that `features/content` already owns Content-ingestion transport.

**Exact next smallest step:** move only the `content-operations-api.ts` implementation/types into `apps/admin-web/src/features/content/api`, expose the minimum required contract through `features/content/public`, and update the proven Content/OCR consumers. Preserve API paths, payloads, response semantics, routes, page/CSS behavior, backend/PostgreSQL/security authority and Student frontend. Keep a root compatibility re-export only if an actual remaining consumer proves it necessary. Do not begin the AI slice.

## Remaining roadmap

AB-03 slices in canonical order: finish Curriculum + Content + OCR → AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
