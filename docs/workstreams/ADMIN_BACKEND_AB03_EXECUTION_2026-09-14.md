# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.2 Curriculum + Content + OCR**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order:

1. Overview + Operations — DONE / EXACT-SOURCE VERIFIED
2. Curriculum + Content + OCR — ACTIVE
3. AI Jobs + AI Review + contextual authoring — PENDING
4. Question Bank — PENDING
5. Quiz Builder — PENDING
6. Students — PENDING
7. Access Codes — PENDING

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final owners:

- `apps/admin-web/src/admin/overview/AdminOverviewPage.tsx` remains the Overview presentation owner.
- `apps/admin-web/src/admin/operations/*` remains Operations page/style presentation ownership.
- `apps/admin-web/src/features/operations/api/admin-operations-api.ts` owns Operations transport/types.
- `apps/admin-web/src/features/operations/model/operations-model.ts` owns Operations presentation/model policy.
- `apps/admin-web/src/features/operations/public/index.ts` is the narrow consumer boundary.
- `apps/api/src/admin-operations/http.ts` owns admin authorization and HTTP query validation.
- `apps/api/src/admin-operations/attention-application.ts` owns attention orchestration.
- `AdminOperationsService` remains PostgreSQL-backed operational/governance/audit authority.

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

Authoritative green evidence: Architecture Guard `34876404251`; Frontend Preparation `34876404345`; Admin AI Operations `34876404287`; Combined Integration `34876404314`; Stage13G Admin Operations `34876404237`.

## AB-03.2 — Curriculum + Content + OCR — ACTIVE

### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Implementation ownership moved to `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts`, with narrow consumer access through `features/curriculum/public`. `CurriculumWorkspace.tsx` and the intended Content-ingestion Curriculum consumer were migrated to that boundary. A root compatibility re-export remains intentionally transitional because strict executable typecheck proved legitimate later-slice consumers.

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Required closure evidence: Architecture Guard `34887051028`; Frontend Preparation `34887051091`; Admin AI Operations `34887416193`; Combined Integration `34887416088`; Stage13G Admin Operations `34887416108` — all SUCCESS.

### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Content ingestion transport/types implementation moved to `apps/admin-web/src/features/content/api/content-ingestion-api.ts`, exposed through `apps/admin-web/src/features/content/public/index.ts`. Root `apps/admin-web/src/content-ingestion-api.ts` remains a transitional compatibility facade rather than a second implementation owner. API paths, payloads, response shapes and auth/session semantics were preserved.

Corrected executable/source checkpoint: `4ba7106f910098841a7026114dcfa2f2cd1f83bf`.

Final green closure evidence: Architecture Guard `34891198234`; Admin AI Operations `34892857039`; Combined Integration `34892857011`; Stage13G Admin Operations / PostgreSQL / Chromium `34892857278`.

### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED

Worker B sequence 52 executed the bounded ownership correction selected by Worker A discovery, and Worker B sequence 53 reconciled the stale lease against repository/CI truth before closure.

Final ownership after this increment:

- `apps/admin-web/src/features/content/api/content-operations-api.ts` owns Content operations/OCR transport and types;
- `apps/admin-web/src/features/content/public/index.ts` exposes the narrow required consumer contract;
- `apps/admin-web/src/OcrSourcePreview.tsx` consumes the feature boundary directly;
- root `apps/admin-web/src/content-operations-api.ts` is compatibility-only and no longer owns implementation;
- `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` remains the proven reason the root compatibility facade cannot yet be deleted blindly.

No backend/Fastify, PostgreSQL/migration, security, route, page/CSS behavior, AI or Student frontend implementation semantics were changed by this owner move.

Executable/source checkpoint: `866912f4640aa4696b896a1d897bff7ad67024f4`.

Exact-head green closure set:

- Architecture Guard `34898665849` — SUCCESS;
- Frontend Preparation `34898665740` — SUCCESS;
- Admin AI Operations `34898665783` — SUCCESS;
- Combined Integration `34898665724` — SUCCESS;
- Stage13G Admin Operations / PostgreSQL / Chromium `34898665675` — SUCCESS.

This closes AB-03.2.3 without weakening any gate or preserving duplicate implementation ownership.

### Exact next smallest step — AB-03.2 closure discovery

Perform discovery only before starting AI:

1. inspect remaining Content/OCR imports and ownership boundaries;
2. confirm whether `ContentOperationsPage.tsx` is the final legitimate consumer of root `content-operations-api.ts`;
3. if and only if zero other consumers are proven, select the smallest follow-up seam: switch that one page to `features/content/public` and delete the compatibility facade;
4. do not bulk-move page/CSS ownership merely for folder neatness;
5. do not begin AI until the Content/OCR closure check is complete;
6. preserve API paths, payload/response semantics, backend/PostgreSQL/security authority, product behavior and Student frontend exclusion.
