# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
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

The latest `main` drift from baseline `62a148e...` is confined to Student frontend/PWA work; no overlapping Admin/API/PostgreSQL/shared-contract implementation change was found for the current discovery.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — ACTIVE
  - AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.3 Content operations + OCR frontend API ownership — NEXT / DISCOVERY COMPLETE
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker A sequence 51 performed discovery only; no executable source was changed. The corrected executable checkpoint remains `4ba7106f910098841a7026114dcfa2f2cd1f83bf` with source-tree-equivalent green evidence: Architecture Guard `34891198234`, Admin AI `34892857039`, Combined `34892857011`, Stage13G/PostgreSQL/Chromium `34892857278`.

Discovery confirmed the next bounded ownership seam: root `apps/admin-web/src/content-operations-api.ts` still owns Content operations/OCR transport and types, while `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` and `apps/admin-web/src/OcrSourcePreview.tsx` consume that root owner. With Content-ingestion transport already owned under `features/content`, this is the next proven split-ownership seam.

No evidence in this discovery justified changing backend/Fastify, PostgreSQL/schema, security contracts, routes, page/CSS behavior, Student frontend or starting AI.

## Exact continuation

Execute **AB-03.2.3 — Content operations + OCR frontend API ownership** only:

1. move the implementation/types from root `content-operations-api.ts` into `apps/admin-web/src/features/content/api`;
2. expose only the minimum required contract via `apps/admin-web/src/features/content/public`;
3. update the proven Content/OCR consumers to the feature public boundary;
4. keep a root compatibility re-export only if an actual remaining consumer proves it necessary;
5. preserve API paths, payload/response semantics, backend/PostgreSQL/security authority, routes and UI behavior;
6. run Architecture Guard plus relevant Admin/API/PostgreSQL/integration/Chromium gates; if exact/source-equivalent required CI is still running, hand off `WAITING_FOR_CI` rather than claiming DONE.

Do not begin the AI slice.

## Main reconciliation need

`NONE FOR THIS DISCOVERY`. Current live `main` drift is Student-only and outside the structural frontend scope owned here. Re-check before the next structural phase boundary or whenever overlapping Admin/API/PostgreSQL/shared-contract changes appear.

## Remaining roadmap

Finish Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
