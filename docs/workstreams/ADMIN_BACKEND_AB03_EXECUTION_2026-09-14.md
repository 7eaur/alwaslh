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

Implementation ownership moved to `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts`, with narrow consumer access through `features/curriculum/public`.

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Required closure evidence: Architecture Guard `34887051028`; Frontend Preparation `34887051091`; Admin AI Operations `34887416193`; Combined Integration `34887416088`; Stage13G Admin Operations `34887416108` — all SUCCESS.

### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Content ingestion transport/types implementation moved to `apps/admin-web/src/features/content/api/content-ingestion-api.ts`, exposed through `apps/admin-web/src/features/content/public/index.ts`.

Corrected executable/source checkpoint: `4ba7106f910098841a7026114dcfa2f2cd1f83bf`.

Final green closure evidence: Architecture Guard `34891198234`; Admin AI Operations `34892857039`; Combined Integration `34892857011`; Stage13G Admin Operations / PostgreSQL / Chromium `34892857278`.

### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED

Final ownership after this increment:

- `apps/admin-web/src/features/content/api/content-operations-api.ts` owns Content operations/OCR transport and types;
- `apps/admin-web/src/features/content/public/index.ts` exposes the narrow required consumer contract;
- `apps/admin-web/src/OcrSourcePreview.tsx` consumes the feature boundary directly.

Executable/source checkpoint: `866912f4640aa4696b896a1d897bff7ad67024f4`.

Exact-head green closure set: Architecture Guard `34898665849`; Frontend Preparation `34898665740`; Admin AI Operations `34898665783`; Combined Integration `34898665724`; Stage13G Admin Operations / PostgreSQL / Chromium `34898665675` — all SUCCESS.

### AB-03.2 closure discovery — DONE / DOC-ONLY

Worker C sequence 54 proved root `apps/admin-web/src/content-operations-api.ts` was a pure compatibility facade and that `ContentOperationsPage.tsx` was its remaining stale consumer.

### AB-03.2.4 Content operations compatibility facade retirement — IMPLEMENTED / WAITING_FOR_CI

Worker A sequence 55 executed exactly the selected seam:

1. `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` now imports its Content operations/OCR functions and types from `../../features/content/public`;
2. root `apps/admin-web/src/content-operations-api.ts` was deleted;
3. no API path, payload/response contract, Fastify/PostgreSQL/security authority, route, visual behavior or Student frontend implementation changed;
4. no AI work or page/CSS restructuring was started.

Executable/source checkpoint: `ca8381c45cab7ae6a8500c88325042451fbed20f`.

Verification observed on that exact source head:

- Architecture Guard `34906963160` — SUCCESS;
- Frontend Preparation `34906963113` — QUEUED;
- Admin AI Operations `34906963149` — IN PROGRESS;
- Combined Integration `34906963163` — IN PROGRESS;
- Stage13G Admin Operations / PostgreSQL / Chromium `34906963142` — PENDING.

Required continuation: do not start another ownership seam until these gates, or source-tree-equivalent successors after documentation-only pushes, finish green. Only then mark AB-03.2.4 DONE and perform fresh AB-03.2 closure discovery before any AI slice work.
