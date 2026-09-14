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
- root `content-ingestion-api.ts` separately owns Content ingestion transport and still imports `adminApiRequest` through `admin-api.ts`; that remains a separate concern and must not be automatically combined with Curriculum ownership migration.
- backend Curriculum and Content modules are already bounded, and PostgreSQL already has explicit learning/content/media/OCR migration history.
- no backend/schema mutation was justified before correcting frontend ownership.

### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Worker A sequence 45 established feature implementation ownership:

1. created `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts` and moved Curriculum-specific types plus request implementations there;
2. created `apps/admin-web/src/features/curriculum/public/index.ts` as the narrow consumer boundary;
3. migrated `CurriculumWorkspace.tsx` to consume Curriculum from that public boundary and generic API error/session helpers directly from `shared/api/client`;
4. kept a transitional root re-export facade for consumers not yet migrated.

Worker B sequence 46 performed the next bounded consumer migration:

1. migrated `ContentIngestionWorkspace.tsx` Curriculum symbols to `features/curriculum/public`;
2. migrated its generic API error/session helpers to `shared/api/client`;
3. deliberately did not migrate root `content-ingestion-api.ts`, move pages, restructure CSS, redesign OCR/AI, or change backend/schema;
4. preserved endpoint URLs, request payloads, response shapes, auth/session semantics and UI behavior.

A first cleanup attempt removed the root Curriculum compatibility exports at `af4a131b1b039883a318ebb41b7ec5e5146f126d`. Stage13G `34886697753` rejected that assumption at Admin strict typecheck: live Curriculum subcomponents plus Access Codes, AI authoring, Question Bank, Quiz Builder and `admin-api.test.ts` still consume the root facade. Its backend/PostgreSQL job nevertheless passed API quality, clean migrations, DB contract, integration and auth regressions. No test or validation was weakened.

The correct smallest repair was to restore only the transitional re-export facade, not Curriculum implementation ownership. The Content-ingestion consumer remains migrated to the feature boundary. Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Worker C sequence 47 re-verified that the difference from `4cd3daf...` to handoff HEAD `926013d1af3824cc50836660ca85615bb2ec8593` is documentation/state only. Required source-tree-equivalent closure evidence is green:

- Architecture Guard `34887051028` — SUCCESS;
- Frontend Preparation `34887051091` — SUCCESS;
- Admin AI Operations `34887416193` — SUCCESS;
- Combined Integration `34887416088` — SUCCESS;
- Stage13G Admin Operations `34887416108` — SUCCESS.

AB-03.2.1 is therefore closed. The root Curriculum compatibility facade remains intentional migration debt until its owning later slices migrate their legitimate consumers; it must not be deleted through a cross-slice bulk migration.

### Exact next smallest step

Fresh AB-03.2 discovery only:

1. inspect live Curriculum + Content + OCR ownership across Admin frontend, API/backend, PostgreSQL/security and existing tests;
2. select one smallest root-cause ownership/workflow correction from current code evidence;
3. do not bulk-migrate Access Codes/AI/Question Bank/Quiz Builder consumers merely to delete compatibility;
4. do not begin the AI slice until Curriculum + Content + OCR is actually complete;
5. verify any chosen increment with Architecture Guard plus all relevant Admin/API/PostgreSQL/integration/Chromium gates.
