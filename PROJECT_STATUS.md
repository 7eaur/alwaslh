# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.3 AI Jobs / Review / Authoring`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

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

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main contains authoritative offline-content API/PostgreSQL changes, so reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification. Current frontend ownership work does not mutate those backend/database areas.

## AB-00 — DONE

## AB-01 — DONE / EXACT-HEAD VERIFIED

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED

Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

Sub-increments:

- AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED.
- AB-03.2.4 Content operations compatibility facade retirement — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.5 Content ingestion compatibility facade retirement — DONE / EXACT-HEAD VERIFIED at `7f4a07ebd138106e1c7701bc9820bf978c233643`.
- AB-03.2.6 same-slice direct-owner consumption — DONE / SOURCE-TREE-EQUIVALENT VERIFIED at executable checkpoint `2dd1ca2a94f03b8299bc2f8759f634c56fc10f78`.
- AB-03.2.7 final lesson Content/Curriculum transport ownership — DONE / EXACT-HEAD VERIFIED at `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

Worker A sequence 75 established the first real AI feature owner without mixing Question Bank or Quiz Builder ownership into this slice.

- **AB-03.3.1 AI operations feature-owner foundation — DONE / EXACT-HEAD VERIFIED.** Real jobs/review application capability, transport, adapter and view-model implementations now live under `features/ai/operations`; their four tests are colocated with the owner. Root AI operations files are compatibility facades only. Core/test checkpoint: `c82ef8e298103d010a8421ab2df3eecaad038ea5`.
- **AB-03.3.2 AI review presentation ownership transfer — DONE / EXACT-HEAD VERIFIED.** `AiOperationsPage.tsx` and `AiReviewWorkspace.tsx` now live under `features/ai`; the review workspace is a byte-identical rename, and the old `admin/reviews/AiOperationsPage.tsx` is a one-line compatibility facade through `features/ai/public`. Executable/source checkpoint: `c4f44953a6d16473e24f8a4188eb36943452812c`.
- **AB-03.3.3 compatibility-facade retirement + direct-owner consumption — NEXT.** Inspect/repoint every remaining consumer of the root AI operations facades and the old review-page facade, then delete only proven-unused compatibility files. Keep AI authoring application hooks separate where moving them would mix Question Bank/Quiz Builder ownership.

Exact-head evidence on `c4f44953...`:

- Architecture Guard `34989303067` — SUCCESS.
- Frontend Preparation `34989303106` — SUCCESS: lint + strict typecheck + unit tests + build.
- Admin AI `34989303059` — SUCCESS: clean migrations + PostgreSQL contracts + authorization/observability/review-race/control + Stage12/auth regressions.
- Combined Integration `34989303098` — SUCCESS including deterministic fixture and real Admin Chromium.
- Stage13G `34989303031` — SUCCESS across Admin UI, backend, PostgreSQL/security/integrations and Real API + PostgreSQL + Chromium.

No endpoint, payload, backend, database, authorization, route behavior, product copy or styling behavior changed in AB-03.3.2; the large presentation files were moved using their existing blobs to avoid UI drift.

## Remaining roadmap

AB-03.3 AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
