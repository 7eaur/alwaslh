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

Final ownership closure moved the remaining real root implementations instead of leaving compatibility ownership:

- `lesson-content-api.ts` + its test moved under `features/content/api`; publication contracts are exposed by `features/content/public` and `LessonPublicationPanel` consumes that boundary.
- `lesson-authoring-parity-api.ts` moved under `features/curriculum/api`; summary/export contracts are exposed by `features/curriculum/public` and `LessonAuthoringParityPanel` consumes that boundary.
- GitHub recognized these as actual renames; transport implementation changed only its shared-client import path. Endpoint/payload/business/UI/security behavior was preserved.
- Remaining `ContentOperationsPage.tsx` root `admin-api.ts` dependency is only generic error/session compatibility; actual Content/OCR transport is already feature-owned and this is not split Content implementation ownership.

Exact-head closure evidence on `3a45d18...`:

- Architecture Guard `34964996524` — SUCCESS.
- Frontend Preparation `34964996555` — SUCCESS: lint + strict typecheck + unit tests + build.
- Admin AI `34964996466` — SUCCESS: quality gates + clean migrations + PostgreSQL contracts + authorization/observability/review race/control + Stage12/auth security regressions.
- Combined Integration `34964996488` — SUCCESS including clean PostgreSQL, authority regressions, deterministic browser fixture and real Admin Chromium.
- Stage13G `34964996480` — SUCCESS for Admin UI, backend, PostgreSQL/security/integrations and Real API + PostgreSQL + Chromium.

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

Fresh topology discovery shows AI is still mostly root-owned in `apps/admin-web/src` and there is no `features/ai` owner yet. The first selected increment is **AB-03.3.1 AI operations frontend ownership**: establish a coherent AI feature boundary around AI jobs/review API + adapter + view model and their tests, expose a narrow public boundary, then repoint legitimate AI operations consumers without mixing Question Bank or Quiz Builder ownership into this increment.

## Remaining roadmap

AB-03.3 AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
