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

The latest `main` drift from baseline `62a148e...` is confined to `apps/student-web` and `.github/workflows/stage16-student-pwa.yml`; no overlapping Admin/API/PostgreSQL/shared-contract implementation change was found for the current closure.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — ACTIVE
  - AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.2.2 Content ingestion frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker C sequence 50 performed verification/closure only; no new production seam was opened.

Corrected executable source checkpoint for AB-03.2.2 remains `4ba7106f910098841a7026114dcfa2f2cd1f83bf`. Content ingestion implementation ownership is under `apps/admin-web/src/features/content/api/content-ingestion-api.ts`, exposed through `features/content/public`. Root `apps/admin-web/src/content-ingestion-api.ts` remains only as a transitional compatibility facade.

Required source-equivalent closure evidence is green:

- Architecture Guard `34891198234` — SUCCESS on exact corrected source checkpoint;
- Admin AI Operations `34892857039` — SUCCESS;
- Combined Integration `34892857011` — SUCCESS;
- Stage13G Admin Operations / PostgreSQL / Chromium `34892857278` — SUCCESS.

This closes the bounded AB-03.2.2 migration. API paths/payloads/contracts, backend/Fastify, PostgreSQL, security, OCR/AI and Student frontend implementation were not changed by this ownership move.

## Exact continuation

Perform **fresh AB-03.2 discovery only** inside the remaining **Content + OCR** portion before any new source mutation:

1. inspect current Content/OCR frontend ownership, backend/API boundaries, PostgreSQL provenance/integrity, security/authorization and existing tests;
2. identify at most one smallest root-cause ownership or workflow seam from live code evidence;
3. do not bulk-migrate unrelated compatibility-facade consumers;
4. do not begin the AI slice until Curriculum + Content + OCR is actually complete;
5. once one seam is selected, execute only that increment and verify Architecture Guard plus relevant Admin/API/PostgreSQL/integration/Chromium gates.

## Main reconciliation need

`NONE FOR THIS CLOSURE`. Current live `main` drift is Student-only and outside the structural frontend scope owned here. Re-check before the next structural phase boundary or whenever overlapping Admin/API/PostgreSQL/shared-contract changes appear.

## Remaining roadmap

Finish Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
