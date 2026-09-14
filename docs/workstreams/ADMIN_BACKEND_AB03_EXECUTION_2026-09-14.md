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
- `ContentIngestionWorkspace.tsx` also consumed Curriculum through that root facade.
- root `content-ingestion-api.ts` separately owns Content ingestion transport and still imports `adminApiRequest` through `admin-api.ts`; that is a later concern and must not be combined with Curriculum ownership migration.
- backend Curriculum and Content modules are already bounded, and PostgreSQL already has explicit learning/content/media/OCR migration history.
- no backend/schema mutation was justified before correcting frontend ownership.

### AB-03.2.1 Curriculum frontend API ownership — IN PROGRESS / WAITING_FOR_CI

Worker A sequence 45 performed one smallest coherent owner move:

1. created `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts` and moved Curriculum-specific types plus request implementations there;
2. created `apps/admin-web/src/features/curriculum/public/index.ts` as the narrow consumer boundary;
3. migrated `CurriculumWorkspace.tsx` to consume Curriculum from that public boundary and generic API error/session helpers directly from `shared/api/client`;
4. reduced root `admin-api.ts` from implementation owner to a temporary compatibility re-export only, because `ContentIngestionWorkspace.tsx` still imports Curriculum through the root facade;
5. preserved endpoint URLs, request payloads, response shapes, auth/session semantics and UI behavior;
6. changed no backend/API/PostgreSQL/security/OCR/AI/Student frontend implementation.

Source implementation checkpoint: `ee58ffe125da9e550b97965976f47240a7f35d68`.

This is not declared DONE because the legitimate Content consumer has not yet switched and the source-checkpoint CI is still running.

### Exact next smallest step

After source-checkpoint gates settle:

1. migrate only `ContentIngestionWorkspace.tsx` Curriculum imports to `features/curriculum/public`;
2. import generic API error/session helpers from `shared/api/client`;
3. remove the temporary Curriculum re-exports from root `admin-api.ts` once unused;
4. do not migrate root `content-ingestion-api.ts` transport, move pages, restructure CSS, redesign OCR/AI, or change backend/schema in the same increment.

### Required verification for AB-03.2.1

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- relevant Curriculum/API/PostgreSQL integration gates;
- Combined Integration with real Admin Chromium;
- Stage13G real API + PostgreSQL + Chromium;
- exact-head or source-tree-equivalent evidence before declaring DONE.

Fresh source-checkpoint runs on `ee58ffe...` were pending/running at handoff, including Frontend Preparation `34884252963` and Admin AI Operations `34884253074`.