# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.3 AI Jobs / Review / Authoring**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

## AB-03.2 — Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED

### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Implementation ownership lives in `features/curriculum/api/admin-curriculum-api.ts`, exposed through `features/curriculum/public`.

### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Implementation ownership lives in `features/content/api/content-ingestion-api.ts`, exposed through `features/content/public`.

### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED

Implementation ownership lives in `features/content/api/content-operations-api.ts`, exposed through `features/content/public`.

### AB-03.2.4 Content operations compatibility facade retirement — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Corrected executable checkpoint: `045c1e63b7b34121492c2a26b5017aab4ec35055`.

### AB-03.2.5 Content ingestion compatibility facade retirement — DONE / EXACT-HEAD VERIFIED

Exact checkpoint: `7f4a07ebd138106e1c7701bc9820bf978c233643`. The final production consumer was repointed to `features/content/public`, the obsolete root facade was deleted, and all required architecture/admin/integration/PostgreSQL/security/Chromium gates passed.

### AB-03.2.6 Same-slice direct-owner consumption — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Executable checkpoint: `2dd1ca2a94f03b8299bc2f8759f634c56fc10f78`. Curriculum/Content/OCR consumers were repointed to direct feature/shared owners with import-boundary-only changes. Successor Admin AI `34964251627`, Combined `34964251663`, and Stage13G `34964251606` all passed.

### AB-03.2.7 Final lesson Content/Curriculum transport ownership — DONE / EXACT-HEAD VERIFIED

Fresh closure inspection found two actual root implementations, so the slice was not closed prematurely. Worker A sequence 74 moved them into the correct feature owners in a single coherent source commit:

- `lesson-content-api.ts` + test → `features/content/api/lesson-content-api.ts` + colocated test; exposed via `features/content/public`;
- `lesson-authoring-parity-api.ts` → `features/curriculum/api/lesson-authoring-parity-api.ts`; exposed via `features/curriculum/public`;
- `LessonPublicationPanel` and `LessonAuthoringParityPanel` now consume those public boundaries.

Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

GitHub classified the implementation/test moves as renames. Implementation changes were limited to import paths from root `admin-api.ts` to `shared/api/client`; endpoint and payload contracts were unchanged.

Exact-head evidence:

- Architecture Guard `34964996524` — SUCCESS;
- Frontend Preparation `34964996555` — SUCCESS;
- Admin AI `34964996466` — SUCCESS;
- Combined Integration `34964996488` — SUCCESS including clean PostgreSQL and real Admin Chromium;
- Stage13G `34964996480` — SUCCESS for Admin UI, backend, PostgreSQL/security integrations, and Real API + PostgreSQL + Chromium.

`ContentOperationsPage.tsx` retains only generic root `admin-api.ts` error/session helper compatibility. Actual Content/OCR transport ownership is feature-correct, so this does not block slice closure and no unsafe large-file rewrite was performed solely for one helper import.

## AB-03.3 — AI Jobs / Review / Authoring — ACTIVE

### AB-03.3.1 AI operations frontend ownership — ACTIVE

Fresh topology inspection shows there is not yet a `features/ai` owner. Current root AI operations implementation is split across:

- `ai-operations-api.ts` + test;
- `ai-operations-adapter.ts` + test;
- `ai-operations-view-model.ts` + test;
- `ai-operations-pagination.test.ts`.

`AiOperationsPage.tsx` consumes this family along with a small AI-application capability transport and approved-output application hooks. `AdminAiAuthoringWorkspace.tsx` additionally crosses Curriculum, AI authoring, Question Bank and Quiz Builder, so it must not be migrated as one indiscriminate batch.

Selected first coherent increment: establish `features/ai` ownership for the AI jobs/review API + adapter + view-model/test family, expose a narrow public surface, repoint AI operations/review consumers, and keep Question Bank / Quiz Builder transports for their later canonical slices.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
