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
- live `main` at AB-03 startup: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation is complete. Live-main-only implementation changes are Student frontend/workflow and Student-specific CI/docs; no Admin/API/migration implementation overlap was found. Shared top-level docs diverge and remain subject to deliberate final reconciliation.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — ACTIVE
  - AB-03.1.1 Attention application ownership — IMPLEMENTED / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Current source correction

Source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`.

Discovery found that the Overview endpoint `/v1/admin/operations/attention` had correct PostgreSQL-backed data and admin authorization, but its Fastify route still owned use-case orchestration: reading governance + audit concurrently and then building the attention projection.

AB-03.1.1 corrected that ownership only:

- `apps/api/src/admin-operations/attention-application.ts` now owns `loadOperationsAttention(...)`;
- `apps/api/src/admin-operations/http.ts` owns only admin authorization, query validation and calling the application boundary for this endpoint;
- `apps/api/src/admin-operations/attention.ts` remains the pure projection owner;
- `apps/api/tests/admin-operations-attention-application.test.ts` proves the application orchestration contract;
- API route/query bounds/response shape, SQL, migrations/schema and security behavior are unchanged;
- no Admin frontend or Student frontend implementation changed.

Verification at handoff:

- Architecture Guard `34859593842` — SUCCESS on implementation tree `fe2f3e8811e78e03662a759127dd35fe3588b336`; the final source checkpoint adds only the dedicated test;
- Admin AI `34859616706` — SUCCESS on exact source checkpoint;
- Combined Integration `34859616648` — still in progress at handoff;
- Stage13G `34859617164` — still in progress at handoff and is the relevant broad Admin/API/PostgreSQL/integration/Chromium gate.

Therefore the shared state is `WAITING_FOR_CI`, not DONE.

## Exact continuation

Do **not** start another mutation before closing AB-03.1.1.

1. Inspect `34859616648` and `34859617164`. If documentation commits caused cancellation, use the newest source-tree-equivalent runs only after proving no source/test change since `5c363658...`.
2. If all required gates are green, mark AB-03.1.1 DONE.
3. Then continue discovery within **Overview + Operations only** and choose one next smallest ownership correction based on live code/tests/runtime evidence.
4. Do not combine Curriculum/Content/OCR or any later slice.
5. Main reconciliation is **not currently required**; repeat it if live `main` gains overlapping Admin/API/migration/shared-contract changes or at the next structural phase boundary.

## Remaining roadmap

Finish Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.