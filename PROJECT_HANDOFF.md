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
  - AB-03.2.4 Content operations compatibility facade retirement — IMPLEMENTED / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker A sequence 55 executed only AB-03.2.4:

- repointed `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` from the root compatibility facade to `../../features/content/public`;
- deleted root `apps/admin-web/src/content-operations-api.ts`;
- preserved endpoint/payload semantics, backend/PostgreSQL/security authority, routes, UI behavior and Student frontend exclusion.

Executable/source checkpoint: `ca8381c45cab7ae6a8500c88325042451fbed20f`.

Exact-head verification at handoff:

- Architecture Guard `34906963160` — SUCCESS;
- Frontend Preparation `34906963113` — QUEUED;
- Admin AI Operations `34906963149` — IN PROGRESS;
- Combined Integration `34906963163` — IN PROGRESS;
- Stage13G Admin Operations / PostgreSQL / Chromium `34906963142` — PENDING.

Because required exact-head CI is incomplete, this increment is not DONE yet.

## Exact continuation

Do not start a new seam first. Verify/close **AB-03.2.4** only:

1. inspect the five exact-source runs above or source-tree-equivalent successors if documentation pushes superseded them;
2. require Frontend Preparation/typecheck, Combined Integration and Stage13G/PostgreSQL/Chromium to finish green, with Architecture Guard remaining green;
3. if green, mark AB-03.2.4 DONE and perform fresh AB-03.2 closure discovery before selecting any AI work;
4. if any gate fails, fix only the root cause within this same facade-retirement scope;
5. keep PR #52 Draft and unmerged.

## Main reconciliation need

`NONE CURRENTLY`. Current live `main` remains `d43fe2afe29b02093510177b921c0407e21a3de9`; no overlapping scoped drift is proven. Re-check before the next structural phase boundary or whenever Admin/API/PostgreSQL/shared-contract overlap appears.

## Remaining roadmap

Close AB-03.2.4 verification → fresh Content/OCR closure discovery → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
