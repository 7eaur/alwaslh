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

Closure evidence: Architecture Guard `34908457279`; Frontend Preparation `34908457311`; Admin AI Operations `34908457270`; successor Combined Integration `34909883950`; successor Stage13G Admin Operations / PostgreSQL / Chromium `34909884028` — all SUCCESS. The successor integration gates ran on documentation-only source-tree-equivalent head `a7dc026583e395a14fb06b5c9022cd091d35c07c`.

### Worker A sequence 58 — fresh AB-03.2 closure discovery

No executable mutation was made. Inspection found the next concrete compatibility debt:

- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` still imports Content-ingestion transport/types from root `../../content-ingestion-api`;
- root `apps/admin-web/src/content-ingestion-api.ts` contains no implementation and only re-exports `features/content/public`;
- therefore implementation ownership is already feature-correct, but the compatibility facade still has a legitimate production consumer and cannot yet be deleted safely.

Selected next smallest increment: **AB-03.2.5 — Content ingestion compatibility facade retirement**. Repoint all remaining legitimate root-facade consumers/tests to `features/content/public`, then delete the facade only after proving it unused. No endpoint/payload/PostgreSQL/security/UI behavior change is intended. Do not start AI implementation in the same increment.
