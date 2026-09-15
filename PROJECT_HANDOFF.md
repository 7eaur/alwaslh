# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-15**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Confirm repo/branch and live branch + `main` HEAD; read shared execution state, status, engineering log, this handoff, autonomous protocol and active AB-03 record; inspect code/tests/CI; confirm no active-worker collision. Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification. Excluded only: structural/design implementation of `apps/student-web` frontend.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`;
- main reconciliation: `REQUIRED / DEFERRED` because main contains authoritative offline-content API/PostgreSQL changes. Reconcile before overlapping backend/database mutation and before AB-08 final verification.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
  - AB-03.3 AI Jobs / Review / Authoring — **ACTIVE**
- AB-04..AB-08 — PENDING

## Latest verified result

Worker A sequence 75 established the initial AI feature owner and transferred the review presentation without changing behavior.

Latest executable/source checkpoint: `c4f44953a6d16473e24f8a4188eb36943452812c`.

Current ownership:

- AI jobs/review application capability, transport, adapter and view-model implementations + tests → `apps/admin-web/src/features/ai/operations`;
- public AI boundary → `apps/admin-web/src/features/ai/public`;
- `AiOperationsPage.tsx` + `AiReviewWorkspace.tsx` → `apps/admin-web/src/features/ai`;
- old `admin/reviews/AiOperationsPage.tsx` is now a one-line compatibility facade; old `AiReviewWorkspace.tsx` path was removed.

The review presentation move reused the exact existing blobs. No UI copy/JSX/workflow logic, endpoint, payload, backend, database or security behavior changed.

Exact-head green evidence on `c4f44953...`:

- Architecture Guard `34989303067`;
- Frontend Preparation `34989303106`;
- Admin AI `34989303059`;
- Combined Integration `34989303098` including real Admin Chromium;
- Stage13G `34989303031` including Admin UI, backend, PostgreSQL/security integrations, and Real API + PostgreSQL + Chromium.

## Exact continuation

Next worker is **B**. Execute one smallest coherent increment: **AB-03.3.3 — compatibility-facade retirement + direct-owner consumption**.

1. Re-read live state/HEAD and inspect all current consumers before mutation.
2. Repoint legitimate consumers of root `ai-application-api.ts`, `ai-operations-api.ts`, `ai-operations-adapter.ts`, `ai-operations-view-model.ts` and the old `admin/reviews/AiOperationsPage.tsx` facade to the real `features/ai` owners/public boundary.
3. `AiStructuredOutputEditor.tsx` is a known root consumer of AI operations/view-model contracts; handle it deliberately rather than deleting facades underneath it.
4. Delete compatibility files only after a zero-consumer proof.
5. Do not fold Question Bank or Quiz Builder transports into this cleanup. Keep mixed AI-authoring application hooks separate unless a root-cause ownership fix is possible without crossing those later canonical slices.
6. Preserve all current behavior, routes, payloads, product copy and styles.
7. Re-run Architecture Guard, Admin quality, Admin AI, Combined and Stage13G/PostgreSQL/security/Chromium gates.

## Remaining roadmap

AB-03.3 AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
