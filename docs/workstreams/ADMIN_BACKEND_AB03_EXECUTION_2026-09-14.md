# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.2 Curriculum + Content + OCR**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order:

1. Overview + Operations — DONE / EXACT-SOURCE VERIFIED
2. Curriculum + Content + OCR — ACTIVE / DISCOVERY NEXT
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

## AB-03.2 — Curriculum + Content + OCR — ACTIVE / DISCOVERY NEXT

Do not mutate this slice before discovery. The next worker must map:

1. operator jobs/routes for curriculum structure, content ingestion/publication and OCR review/recovery;
2. current Admin frontend page/feature/API/model ownership and any duplicate/legacy owners;
3. backend HTTP/application/domain/infrastructure boundaries and cross-module dependencies;
4. PostgreSQL schema/migrations for curriculum hierarchy, revisions/publication, content/media/provenance, ingestion tasks and OCR extraction/review integrity;
5. authorization/security boundaries and audit requirements;
6. Student-facing backend/shared consumers where server-contract changes could affect compatibility;
7. existing unit/integration/security/Chromium coverage;
8. exactly one smallest evidence-backed correction to implement after discovery.

Do not combine broad restructuring or the AI slice with this discovery increment.
