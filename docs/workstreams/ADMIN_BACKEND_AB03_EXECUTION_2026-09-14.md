# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.2 Curriculum + Content + OCR**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order:

1. Overview + Operations — DONE / EXACT-SOURCE VERIFIED
2. Curriculum + Content + OCR — ACTIVE / DISCOVERY COMPLETE; NEXT CORRECTION SELECTED
3. AI Jobs + AI Review + contextual authoring — PENDING
4. Question Bank — PENDING
5. Quiz Builder — PENDING
6. Students — PENDING
7. Access Codes — PENDING

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED

### Final owners

- `apps/admin-web/src/admin/overview/AdminOverviewPage.tsx` remains the Overview presentation owner.
- `apps/admin-web/src/admin/operations/*` remains Operations page/style presentation ownership; these locations are not defects by themselves.
- `apps/admin-web/src/features/operations/api/admin-operations-api.ts` owns Operations transport/types.
- `apps/admin-web/src/features/operations/model/operations-model.ts` owns Operations presentation/model policy.
- `apps/admin-web/src/features/operations/public/index.ts` is the narrow consumer boundary for Operations transport + required presentation helpers.
- `apps/api/src/admin-operations/http.ts` owns admin authorization and HTTP query validation.
- `apps/api/src/admin-operations/attention-application.ts` owns attention orchestration.
- `AdminOperationsService` remains PostgreSQL-backed operational/governance/audit authority.

No schema/migration/security authority change is justified for this slice.

### Completed increments

- AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED. Source checkpoint `5c36365888486cf8297893467bfc4e1c97bc6b43`.
- AB-03.1.2 Operations frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED. Corrected source checkpoint `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.
- AB-03.1.3 Operations presentation-model ownership — DONE / EXACT-SOURCE VERIFIED. Final source checkpoint `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### Slice-closure discovery — Worker A sequence 42

The required closure discovery re-inspected live Overview + Operations ownership, backend authority and consumer paths. It found no further direct evidence of duplicate/wrong business ownership or a concrete product-flow defect requiring another mutation.

The decision is therefore to close the slice rather than move pages/styles merely for folder purity. Existing presentation locations may be revisited later only if AB-05 design/interaction convergence produces evidence.

Compare `7eda86f...` → pre-run HEAD `4452d246...` contained only project/workstream documentation, so no executable source drift occurred after the final source checkpoint.

Exact-source verification remains authoritative:

- Architecture Guard `34876404251` — SUCCESS;
- Frontend Preparation `34876404345` — SUCCESS;
- Admin AI Operations `34876404287` — SUCCESS;
- Combined Integration `34876404314` — SUCCESS, including real Admin Chromium;
- Stage13G Admin Operations `34876404237` — SUCCESS, including Admin/API quality, clean PostgreSQL contracts, Operations/security/auth integrations and Real API + PostgreSQL + Chromium.

## AB-03.2 — Curriculum + Content + OCR — ACTIVE / DISCOVERY COMPLETE

### Discovery — Worker C sequence 44

Direct live-code inspection established the following ownership map without changing production source/tests/migrations:

- Admin Curriculum presentation is still under `apps/admin-web/src/admin/curriculum/*`; `CurriculumWorkspace.tsx` directly imports the Curriculum snapshot/types/mutations from root transitional `apps/admin-web/src/admin-api.ts`.
- `admin-api.ts` is not merely a generic shared transport: it currently owns the complete Curriculum frontend contract (`CurriculumRecordStatus`, class/subject/offering/section/lesson records, `AdminCurriculumSnapshot`, fetch/create/update functions) while also re-exporting generic transport/auth symbols. This is mixed ownership at the root.
- Content ingestion presentation is under `apps/admin-web/src/admin/content/*`. `ContentIngestionWorkspace.tsx` consumes Curriculum through the same root `admin-api.ts` and ingestion/publication through root transitional `apps/admin-web/src/content-ingestion-api.ts`.
- `content-ingestion-api.ts` owns ingestion task/item/media/publication types and `/v1/admin/content-ingestions*` requests, but imports `adminApiRequest` from `admin-api.ts` rather than from the canonical shared client. This makes the root Curriculum/admin facade an unnecessary dependency for Content transport.
- Backend authority is already separated into bounded server modules: Curriculum has `apps/api/src/curriculum/http.ts`, `service.ts`, `student-reader.ts` and lesson-authoring export files; Content has dedicated ingestion HTTP/service plus admin content operations. No backend merge or cross-module rewrite is justified by this discovery.
- PostgreSQL already has explicit evolution for learning/content/media/OCR, including `0003_learning.sql`, `0008_content_source_import.sql`, `0009_media_pipeline.sql`, and `0011_ocr_foundation.sql`. Discovery found no evidence justifying a schema mutation before fixing the clearer frontend ownership seam.
- Student frontend remains untouched. Curriculum has an explicit server-side `student-reader.ts`, so future backend changes must preserve that consumer contract.

### Selected next smallest correction — AB-03.2.1 Curriculum frontend API ownership

Implement only this ownership correction:

1. move the Curriculum-specific types and request functions currently owned by root `apps/admin-web/src/admin-api.ts` into a feature-owned Curriculum API module, targeted as `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts`;
2. expose only the required Curriculum contract through `apps/admin-web/src/features/curriculum/public/index.ts`;
3. update Curriculum consumers and the Content ingestion workspace to import the Curriculum contract from that public feature boundary;
4. leave generic transport in `shared/api/client`; do not make Content import Curriculum internals;
5. keep URLs, request payloads, response shapes, auth/session handling, UI behavior and PostgreSQL/API authority unchanged;
6. do not combine `content-ingestion-api.ts` migration, page moves, OCR redesign, AI work, CSS restructuring or backend/schema changes into this increment.

Why this is first: it is a bounded, directly evidenced single-owner correction analogous to the already-verified Operations transport migration. It removes mixed root ownership without changing business behavior and creates a stable Curriculum contract that Content may consume legitimately.

### Required verification for AB-03.2.1

- Architecture Guard;
- Admin lint/typecheck/unit/build and Curriculum API tests/consumer tests;
- relevant API/Curriculum/PostgreSQL integration gates even though server code should be unchanged;
- Combined Integration with real Admin Chromium;
- Stage13G Admin Operations/real API + PostgreSQL + Chromium;
- exact-head or source-tree-equivalent evidence before declaring the increment DONE.

Inherited executable evidence remains green because Worker C sequence 44 changed documentation only:

- Architecture Guard `34876404251` — SUCCESS on executable checkpoint `7eda86f...`;
- Combined Integration `34880448851` — SUCCESS on documentation-equivalent head `694473bf...`;
- Stage13G Admin Operations `34880448862` — SUCCESS on documentation-equivalent head `694473bf...`;
- Admin AI Operations `34880448853` — SUCCESS on documentation-equivalent head `694473bf...`.
