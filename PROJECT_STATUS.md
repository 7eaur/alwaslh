# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.2 Curriculum + Content + OCR`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Permanent rules

- PostgreSQL/API are canonical business authority.
- Backend stays one Fastify modular monolith; no microservices/DI/service locator without evidence.
- Admin `app` composes only; features own workflows and expose narrow public/routes boundaries.
- Feature internals stay private; shared cannot import app/features.
- No new global state/query framework or styling-stack rewrite without evidence.
- No fabricated metrics/outcomes/actions.
- Product states, Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are first-class requirements.
- Tests/security/validation are never weakened.
- No permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `d43fe2afe29b02093510177b921c0407e21a3de9`. Current proven drift remains Student frontend/PWA only; no overlapping Admin/API/PostgreSQL/shared-contract implementation change is proven for AB-03.2.

## AB-00 — DONE

## AB-01 — DONE / EXACT-HEAD VERIFIED

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — ACTIVE

#### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

#### AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Corrected executable/source checkpoint: `4ba7106f910098841a7026114dcfa2f2cd1f83bf`.

#### AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `866912f4640aa4696b896a1d897bff7ad67024f4`.

#### AB-03.2.4 Content operations compatibility facade retirement — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Corrected executable/source checkpoint: `045c1e63b7b34121492c2a26b5017aab4ec35055`.

Green closure evidence: Architecture Guard `34908457279`; Frontend Preparation `34908457311`; Admin AI Operations `34908457270`; successor Combined Integration `34909883950`; successor Stage13G Admin Operations / PostgreSQL / Chromium `34909884028` — all SUCCESS. The Combined/Stage13G successors ran on documentation-only source-tree-equivalent head `a7dc026583e395a14fb06b5c9022cd091d35c07c`.

#### Fresh AB-03.2 closure discovery — NEXT DEFECT SELECTED

Worker A sequence 58 found one evidence-backed remaining Content-ingestion compatibility seam: `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` still imports Content-ingestion transport/types from root compatibility facade `apps/admin-web/src/content-ingestion-api.ts`, although implementation ownership already lives under `features/content/api` and is exported through `features/content/public`.

Next smallest step: `AB-03.2.5 — Content ingestion compatibility facade retirement`: repoint the remaining legitimate Content-ingestion consumers to `features/content/public`, prove whether the root facade has any remaining consumer/test dependency, then delete it only when unused. Do not start AI in the same increment.

## Remaining roadmap

AB-03.2.5 → fresh Content/OCR closure discovery → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
