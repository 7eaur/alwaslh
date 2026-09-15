# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.2 Curriculum + Content + OCR`.

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

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main now contains authoritative offline-content API/PostgreSQL changes, so reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification. The current Admin import-boundary batch does not overlap those changes.

## AB-00 — DONE

## AB-01 — DONE / EXACT-HEAD VERIFIED

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — ACTIVE

- AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED.
- AB-03.2.4 Content operations compatibility facade retirement — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.
- **AB-03.2.5 Content ingestion compatibility facade retirement — DONE / EXACT-HEAD VERIFIED.**

AB-03.2.5 source checkpoint: `7f4a07ebd138106e1c7701bc9820bf978c233643`. The remaining production consumer was repointed from root `content-ingestion-api.ts` to `features/content/public`, the root facade was deleted, and the existing transport test already consumed the feature boundary. Exact-head Architecture Guard, Frontend Preparation, Admin AI, Combined Integration, and Stage13G including PostgreSQL/security/real Chromium all completed successfully on this checkpoint.

#### AB-03.2.6 Same-slice direct-owner consumption — IMPLEMENTED / WAITING_FOR_CI

Current executable/source checkpoint: `2dd1ca2a94f03b8299bc2f8759f634c56fc10f78`.

The same Curriculum/Content/OCR ownership context was cleaned further without behavior changes:

- Curriculum create/structure/UI type consumers now import from `features/curriculum/public` instead of root `admin-api.ts`.
- Lesson authoring uses `shared/api/client` for generic transport/session errors and `features/curriculum/public` for Curriculum contracts.
- OCR preview and lesson publication use `shared/api/client` directly for generic API/session helpers.
- Diff from the last green checkpoint is import-boundary-only across six files; no UI/business/API/PostgreSQL/security behavior changed.

Exact-head evidence currently available on `2dd1ca2...`:

- Architecture Guard `34963907236` — SUCCESS.
- Frontend Preparation `34963907292` — SUCCESS.
- Admin AI `34963907259` — PENDING at handoff.
- Combined Integration `34963907267` — IN PROGRESS at handoff.
- Stage13G Admin Operations / PostgreSQL / Chromium `34963907247` — IN PROGRESS at handoff.

AB-03.2 must not be declared closed until these required exact-head gates finish green. `ContentOperationsPage.tsx` still consumes only generic shared API helpers through root `admin-api.ts`; this is a compatibility dependency rather than Content transport ownership. Do not risk whole-file reconstruction solely to remove it; reassess after CI as part of fresh slice-closure evidence.

## Remaining roadmap

Finish exact-head verification / closure of AB-03.2 → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
