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

Worker B sequence 76 closed **AB-03.3.3 compatibility-facade retirement + direct-owner consumption**.

Latest executable/source checkpoint: `d1e11bc7b99b50dff480e8f830812492a390983c`.

Current AI operations/review ownership:

- application capability, jobs/review transport, adapter, view-model + tests → `apps/admin-web/src/features/ai/operations`;
- `AiStructuredOutputEditor.tsx` + its CSS → `features/ai/operations`;
- AI review page/workspace → `features/ai/operations/ui/reviews`;
- public AI boundary → `features/ai/public`;
- root AI operations facades were deleted;
- two one-line internal bridges retain generic API-error/session helpers and approved-output application hooks until their owners are separated deliberately.

The presentation/editor moves reused existing blobs and were recognized as 100% renames. No UI copy/JSX/workflow logic, endpoint, payload, backend, database or security behavior changed.

Exact-head green evidence on `d1e11bc7...`:

- Architecture Guard `34990715628`;
- Frontend Preparation `34990715697`;
- Admin AI `34990715543`;
- Combined Integration `34990715804` including real Admin Chromium;
- Stage13G `34990715570` including Admin UI, backend, PostgreSQL/security integrations, and Real API + PostgreSQL + Chromium.

## Exact continuation

Next worker is **C**. Execute one smallest coherent increment: **AB-03.3.4 — approved-output application ownership**.

1. Re-read live state/HEAD and inspect all consumers before mutation.
2. Locate `applyApprovedLessonOutput`, `applyApprovedQuizOutput` and their result/input contracts in mixed root `admin-ai-authoring-api.ts`.
3. Move only the AI-owned approved-output application capability into `features/ai` and repoint AI review consumers/internal bridge to that owner.
4. Do **not** move lesson generation, quiz generation, question regeneration/archive, specialized quiz export/print, Question Bank or Quiz Builder concerns merely because they share the legacy file.
5. Remove the temporary `features/ai/operations/admin-ai-authoring-api.ts` bridge only when its consumer is feature-local and direct.
6. Preserve routes/endpoints/payloads/copy/styles and run Architecture Guard, Admin quality, Admin AI, Combined and Stage13G/PostgreSQL/security/Chromium gates.

## Remaining roadmap

AB-03.3 AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
