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
  - AB-03.1 Overview + Operations — ACTIVE
  - AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.1.2 Operations frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-03.1.3 Operations presentation-model ownership — NEXT
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest discovery result

Worker A sequence 39 performed the required discovery-only pass after AB-03.1.2 closure. No executable source/test/migration/workflow mutation was made.

Evidence confirms the backend/API/PostgreSQL/security ownership for Overview + Operations is already coherent: HTTP owns auth/query validation, attention orchestration is application-owned, and `AdminOperationsService` remains PostgreSQL-backed authority. Frontend transport/types are correctly under `features/operations`.

One remaining justified frontend ownership seam was found: `apps/admin-web/src/admin/operations/operations-model.ts` and its test still own Operations presentation-model policy outside `features/operations`; Overview and Health import that legacy owner. This leaves the slice in split ownership and directly conflicts with the target rule that features own their models/workflow internals.

## Exact continuation

Execute exactly **AB-03.1.3 Operations presentation-model ownership**:

1. move `operations-model.ts` and `operations-model.test.ts` under `apps/admin-web/src/features/operations/model/`;
2. expose only the required presentation helpers/types through `features/operations/public`;
3. switch current Overview/Operations consumers to the feature public boundary;
4. preserve all UI copy, routes, CSS, transport/API contracts, PostgreSQL/schema, security behavior, session behavior and Student frontend behavior;
5. do **not** move Overview/Operations pages or styles in the same increment;
6. verify Architecture Guard, Admin lint/typecheck/unit/build, relevant Operations/API/PostgreSQL/integration/security gates and real Admin Chromium;
7. after green evidence, perform a fresh AB-03.1 closure decision before entering Curriculum/Content/OCR.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` remains `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; no new overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed during this discovery run.

## Remaining roadmap

Finish Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.