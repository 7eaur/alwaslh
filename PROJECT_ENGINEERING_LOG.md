# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.2 Curriculum + Content + OCR discovery completed; Curriculum frontend API ownership selected as the next smallest correction.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. No overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed through Worker C sequence 44.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Global shell, inner routing, lazy workflow boundaries and auth login presentation ownership are closed.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

AB-03.1.1 attention application ownership, AB-03.1.2 Operations frontend API ownership and AB-03.1.3 Operations presentation-model ownership are closed.

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

Worker A sequence 42 performed the required slice-closure discovery against live code and found no additional justified root correction. Evidence:

- Overview and Operations Health consume Operations through `features/operations/public`;
- feature public boundary exports only the transport/types and presentation helpers required by consumers;
- backend `admin-operations/http.ts` owns admin authorization and query validation;
- `attention-application.ts` owns cross-query attention orchestration;
- `AdminOperationsService` remains the PostgreSQL-backed authority for operational metrics, governance and audit;
- no schema/migration or security authority change is justified;
- existing `admin/overview` and `admin/operations` presentation/style locations are not duplicate business authority and therefore were not moved merely for folder purity.

Compare `7eda86f...` → pre-run HEAD `4452d246...` contained only the four project docs plus shared execution state, so prior exact-source verification remains authoritative:

- Architecture Guard `34876404251` — SUCCESS;
- Frontend Preparation `34876404345` — SUCCESS;
- Admin AI Operations `34876404287` — SUCCESS;
- Combined Integration `34876404314` — SUCCESS;
- Stage13G Admin Operations `34876404237` — SUCCESS, including clean PostgreSQL and real API + PostgreSQL + Chromium.

### AB-03.2 Curriculum + Content + OCR — ACTIVE / DISCOVERY COMPLETE

Worker C sequence 44 inspected the live slice without production/test/migration mutation.

Findings:

- Curriculum presentation is already grouped under `apps/admin-web/src/admin/curriculum/*`, but its workspace imports the entire Curriculum contract from root `apps/admin-web/src/admin-api.ts`.
- Root `admin-api.ts` currently owns both generic/shared exports and the complete Curriculum contract: Curriculum record types/snapshot plus all fetch/create/update requests. This violates single feature ownership and leaves an overly broad transitional root facade.
- Content ingestion is grouped under `apps/admin-web/src/admin/content/*`, but `ContentIngestionWorkspace.tsx` imports Curriculum from root `admin-api.ts` and ingestion/publication from root `content-ingestion-api.ts`.
- Root `content-ingestion-api.ts` imports `adminApiRequest` from `admin-api.ts`, creating an unnecessary transport dependency on the Curriculum/admin facade instead of canonical `shared/api/client`.
- Backend is already separated into `apps/api/src/curriculum/*` and `apps/api/src/content/*`; Curriculum also has `student-reader.ts`, so Student-facing server compatibility is explicit and must remain intact.
- PostgreSQL migration history has distinct learning/content/media/OCR authorities including `0003_learning.sql`, `0008_content_source_import.sql`, `0009_media_pipeline.sql` and `0011_ocr_foundation.sql`. No direct evidence currently requires schema mutation.

Decision: **AB-03.2.1 Curriculum frontend API ownership** is the next smallest root correction. Move only Curriculum-specific types/requests from root `admin-api.ts` to `features/curriculum/api/admin-curriculum-api.ts`, expose the required consumer contract through `features/curriculum/public/index.ts`, and update Curriculum plus legitimate Content consumers. Do not combine Content API migration, page moves, OCR/AI redesign, backend or PostgreSQL changes.

The discovery itself changed documentation only, so inherited executable evidence remains authoritative: Guard `34876404251`, Combined `34880448851`, Stage13G `34880448862`, Admin AI `34880448853` — all SUCCESS.
