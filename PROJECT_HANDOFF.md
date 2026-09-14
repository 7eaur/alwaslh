# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-15**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, code/tests and exact-head Actions;
6. confirm no active worker collision;
7. compare live `main` at structural phase boundaries or when overlapping scoped changes appear.

Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned here: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification.

Excluded only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main` latest observation: `d43fe2afe29b02093510177b921c0407e21a3de9`.

The latest proven `main` drift remains confined to Student frontend/PWA work; no overlapping Admin/API/PostgreSQL/shared-contract implementation change is currently proven for AB-03.2.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — ACTIVE
  - AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.3 Content operations + OCR frontend API ownership — DONE / EXACT-HEAD VERIFIED
  - AB-03.2 closure discovery — DONE / DOC-ONLY
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker C sequence 54 completed the requested Content/OCR closure discovery without changing executable source.

Direct inspection established:

- root `apps/admin-web/src/content-operations-api.ts` is a pure compatibility re-export of the feature implementation;
- `apps/admin-web/src/features/content/public/index.ts` already exposes the required Content operations/OCR contract;
- `apps/admin-web/src/OcrSourcePreview.tsx` already consumes that feature boundary directly;
- `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` remains the confirmed stale consumer importing `../../content-operations-api`.

The compare from executable checkpoint `866912f4640aa4696b896a1d897bff7ad67024f4` to the observed sequence-54 start head `707e52a2f28e7028c4ee3fd19ca737e092f260f6` contains only canonical documentation/state files, so AB-03.2.3 exact-head green evidence remains source-tree-equivalent for this discovery.

Authoritative executable checkpoint remains `866912f4640aa4696b896a1d897bff7ad67024f4`, covered by Architecture Guard `34898665849`, Frontend Preparation `34898665740`, Admin AI Operations `34898665783`, Combined Integration `34898665724`, and Stage13G Admin Operations / PostgreSQL / Chromium `34898665675`, all SUCCESS.

## Exact continuation

Execute **AB-03.2.4 — retire the Content operations compatibility facade** only:

1. repoint `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` from `../../content-operations-api` to `../../features/content/public`;
2. delete root `apps/admin-web/src/content-operations-api.ts`;
3. run strict Admin typecheck plus Architecture Guard first; successful resolution is required evidence that no hidden importer remains;
4. then run all relevant Admin/API/PostgreSQL/integration/Chromium gates on the exact source head;
5. preserve API paths, payload/response semantics, backend/PostgreSQL/security authority and UI behavior;
6. do not bulk-move page/CSS ownership and do not begin AI in the same increment.

## Main reconciliation need

`NONE FOR THIS DISCOVERY`. Current live `main` observation is `d43fe2afe29b02093510177b921c0407e21a3de9`; no overlapping scoped drift is currently proven. Re-check before the next structural phase boundary or whenever Admin/API/PostgreSQL/shared-contract overlap appears.

## Remaining roadmap

Finish Curriculum + Content + OCR closure → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
