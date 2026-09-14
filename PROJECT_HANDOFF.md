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
- live `main` latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — ACTIVE
  - current increment: AB-03.2.1 Curriculum frontend API ownership cleanup — IMPLEMENTED / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker B sequence 46 completed only the remaining Curriculum compatibility cleanup:

- `ContentIngestionWorkspace.tsx` now imports `AdminCurriculumSnapshot` and `fetchAdminCurriculum` from `features/curriculum/public`;
- it imports `ApiRequestError` and `isMissingSessionError` directly from `shared/api/client`;
- root `admin-api.ts` no longer re-exports Curriculum symbols and is no longer a Curriculum compatibility owner;
- root `content-ingestion-api.ts` transport was intentionally not moved in the same increment;
- endpoints, payloads, auth/session semantics, UI behavior, backend, PostgreSQL, security and Student frontend were untouched.

Final source implementation checkpoint: `af4a131b1b039883a318ebb41b7ec5e5146f126d`.

Architecture Guard `34886697714` passed on the exact source HEAD. Frontend Preparation `34886697732`, Admin AI `34886697663`, Combined Integration `34886697673`, and Stage13G `34886697753` had not all settled green at the last source-head observation, so the increment remains `WAITING_FOR_CI`.

## Exact continuation

Do not open another slice yet.

1. verify the source checkpoint `af4a131...` or a documentation-only source-tree-equivalent descendant;
2. require green Architecture Guard/Admin quality plus relevant API/PostgreSQL/integration gates, Combined real Admin Chromium, and Stage13G real API + PostgreSQL + Chromium;
3. if those are all green, close AB-03.2.1 as DONE;
4. only then perform fresh AB-03.2 discovery and choose one smallest Content/OCR ownership correction;
5. do not automatically assume root `content-ingestion-api.ts` must move—inspect its consumers and ownership first;
6. preserve backend/API/PostgreSQL authority and do not touch Student frontend structure.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` remained `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; no fresh overlapping scoped implementation change was observed at sequence 46 startup.

## Remaining roadmap

Finish Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.