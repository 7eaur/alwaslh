# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.2 Curriculum + Content + OCR**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

## AB-03.2 — Curriculum + Content + OCR — ACTIVE

### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Implementation ownership lives in `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts`, exposed through `features/curriculum/public`. Corrected source checkpoint `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Implementation ownership lives in `apps/admin-web/src/features/content/api/content-ingestion-api.ts`, exposed through `features/content/public`. Corrected source checkpoint `4ba7106f910098841a7026114dcfa2f2cd1f83bf`.

### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED

Implementation/types live in `apps/admin-web/src/features/content/api/content-operations-api.ts`, exposed through `features/content/public`. Source checkpoint `866912f4640aa4696b896a1d897bff7ad67024f4`.

### AB-03.2.4 Content operations compatibility facade retirement — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Worker A retired the root production facade; Worker B moved the stale root transport test beside its feature owner instead of restoring compatibility code. Corrected executable/source checkpoint: `045c1e63b7b34121492c2a26b5017aab4ec35055`.

Closure evidence: Architecture Guard `34908457279`; Frontend Preparation `34908457311`; Admin AI Operations `34908457270`; successor Combined Integration `34909883950`; successor Stage13G Admin Operations / PostgreSQL / Chromium `34909884028` — all SUCCESS.

### AB-03.2.5 Content ingestion compatibility facade retirement — DONE / EXACT-HEAD VERIFIED

Worker A sequence 73 resolved the previous tooling blocker without repeating the unsafe whole-file drift:

- fetched/reconstructed the live `ContentIngestionWorkspace.tsx` exactly and changed only its Content-ingestion import from root compatibility facade to `features/content/public`;
- mechanically compared the change and corrected whitespace-only noise before proceeding;
- confirmed the transport test already consumed `features/content/public`;
- deleted root `apps/admin-web/src/content-ingestion-api.ts` only after proving it no longer owned implementation and no legitimate test depended on it.

Exact source checkpoint: `7f4a07ebd138106e1c7701bc9820bf978c233643`.

Required exact-head verification completed green on that checkpoint: Architecture Guard, Frontend Preparation, Admin AI, Combined Integration, Stage13G Admin/API/PostgreSQL/security and real Chromium.

### AB-03.2.6 Same-slice direct-owner consumption — IMPLEMENTED / WAITING_FOR_CI

To use the same coherent Curriculum/Content/OCR context productively, Worker A continued only adjacent ownership cleanup:

- `CurriculumCreateActions.tsx`, `CurriculumStructure.tsx`, and `curriculum-ui.tsx` now take Curriculum contracts directly from `features/curriculum/public`;
- `LessonAuthoringParityPanel.tsx` now takes generic API/session helpers from `shared/api/client` and Curriculum contracts from `features/curriculum/public`;
- `OcrSourcePreview.tsx` and `LessonPublicationPanel.tsx` now take generic API/session helpers directly from `shared/api/client`.

Current executable/source checkpoint: `2dd1ca2a94f03b8299bc2f8759f634c56fc10f78`.

Compare from exact-green `7f4a07e...` to `2dd1ca2...` shows six files and import-boundary-only changes. No UI behavior, API path/payload, PostgreSQL/schema, authorization/security, or Student frontend implementation changed.

Exact-head verification status at Worker A sequence-73 handoff:

- Architecture Guard `34963907236` — SUCCESS;
- Frontend Preparation `34963907292` — SUCCESS;
- Admin AI `34963907259` — PENDING when last checked;
- Combined Integration `34963907267` — IN PROGRESS when last checked;
- Stage13G Admin Operations / PostgreSQL / Chromium `34963907247` — IN PROGRESS when last checked.

Do not mark AB-03.2.6 or the full AB-03.2 slice DONE until the required final gates are green. After green evidence, do a fresh closure scan. `ContentOperationsPage.tsx` still reaches generic transport/session helpers through root `admin-api.ts`, while its actual Content/OCR API transport already comes from `features/content/public`; this is compatibility debt, not dual Content implementation ownership. Only remove it if a mechanically safe patch is available—do not rebuild that large file solely for one import.

## Main reconciliation

Live `main` observation for this handoff: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification; this Admin import-boundary batch does not overlap it.

## Exact next batch

1. Verify the final exact-source gates for `2dd1ca2...` or exact-source-equivalent successor runs if GitHub concurrency superseded them with documentation-only commits.
2. Fix root cause if any required gate fails; never weaken validation/tests/security.
3. If all green, conduct fresh AB-03.2 closure inspection.
4. Close AB-03.2 only with evidence. Then enter AI Jobs/Review/authoring as the next separate canonical vertical slice.
