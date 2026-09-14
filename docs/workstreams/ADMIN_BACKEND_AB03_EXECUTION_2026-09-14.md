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

### Discovery — Worker C sequence 44

Direct live-code inspection established:

- Curriculum presentation under `apps/admin-web/src/admin/curriculum/*` consumed its full contract from root `admin-api.ts`.
- root `admin-api.ts` implemented Curriculum records/snapshot plus `/v1/admin/curriculum*` requests while also re-exporting generic transport/auth symbols.
- `ContentIngestionWorkspace.tsx` consumed Curriculum through that root facade.
- root `content-ingestion-api.ts` separately owned Content ingestion transport and imported generic transport through the root facade; this was selected as a separate bounded concern after Curriculum ownership closure.
- backend Curriculum and Content modules are already bounded, and PostgreSQL already has explicit learning/content/media/OCR migration history.

### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Implementation ownership moved to `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts`, with narrow consumer access through `features/curriculum/public`. `CurriculumWorkspace.tsx` and the intended Content-ingestion Curriculum consumer were migrated to that boundary. A root compatibility re-export remains intentionally transitional because strict executable typecheck proved legitimate later-slice consumers.

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Required closure evidence: Architecture Guard `34887051028`; Frontend Preparation `34887051091`; Admin AI Operations `34887416193`; Combined Integration `34887416088`; Stage13G Admin Operations `34887416108` — all SUCCESS.

### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Worker A sequence 48 completed the smallest bounded Content ingestion ownership correction:

1. moved Content ingestion transport/types implementation to `apps/admin-web/src/features/content/api/content-ingestion-api.ts`;
2. exposed the narrow consumer contract through `apps/admin-web/src/features/content/public/index.ts`;
3. retained root `apps/admin-web/src/content-ingestion-api.ts` only as a transitional compatibility facade rather than a second implementation owner;
4. preserved API paths, payloads, response shapes and auth/session semantics;
5. made no backend/Fastify, PostgreSQL/migration, security, OCR/AI, or Student frontend implementation change;
6. detected and restored an accidental intermediate workspace divergence before establishing the corrected source checkpoint, without weakening typecheck/tests/validation.

Corrected executable/source checkpoint: `4ba7106f910098841a7026114dcfa2f2cd1f83bf`.

Final green closure set:

- Architecture Guard `34891198234` — SUCCESS on exact corrected source checkpoint;
- Admin AI Operations `34892857039` — SUCCESS;
- Combined Integration `34892857011` — SUCCESS;
- Stage13G Admin Operations / PostgreSQL / Chromium `34892857278` — SUCCESS.

The later CI heads differ from `4ba7106f...` only by documentation/state changes, so source equivalence is intact and AB-03.2.2 is closed.

### Worker A sequence 51 discovery — AB-03.2.3 selected

Worker A performed discovery only; executable source stayed at `4ba7106f...`.

The remaining Content/OCR frontend boundary has one concrete split owner: root `apps/admin-web/src/content-operations-api.ts` still owns Content operations/OCR transport and types while `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` and root `apps/admin-web/src/OcrSourcePreview.tsx` consume it. Because `features/content` already owns Content-ingestion transport, the next coherent root fix is to consolidate the Content operations/OCR transport under that same feature rather than preserve another root implementation owner.

No evidence in this bounded discovery requires backend/Fastify, PostgreSQL/schema, security, route, page/CSS, Student frontend or AI changes.

### Exact next smallest step — AB-03.2.3

1. move only the implementation/types from root `content-operations-api.ts` into `apps/admin-web/src/features/content/api`;
2. expose the minimum required contract through `apps/admin-web/src/features/content/public`;
3. update only the proven Content/OCR consumers to the feature public boundary;
4. retain a root compatibility re-export only if a real remaining consumer proves it necessary;
5. preserve API paths, payloads, response semantics, routes, UI behavior and server/PostgreSQL/security authority;
6. do not start AI yet;
7. verify Architecture Guard plus all relevant Admin/API/PostgreSQL/integration/Chromium gates before closure.
