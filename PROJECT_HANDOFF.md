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

Worker C sequence 77 completed **AB-03.3.4 — approved-output application ownership**.

Latest executable/source checkpoint: `26e461407d1508d86fc76b8a3b0151fab83531f9`.

Current result:

- `features/ai/operations/admin-ai-authoring-api.ts` is the canonical owner of `LessonApplyResult`, `QuizApplyResult`, `applyApprovedLessonOutput` and `applyApprovedQuizOutput`;
- root `admin-ai-authoring-api.ts` only re-exports those four symbols/types for compatibility while still owning unrelated legacy authoring concerns;
- the AI review UI continues to use its feature-local path directly, so no large JSX rewrite was needed;
- endpoints/payloads/backend/PostgreSQL/security/routes/copy/styles are unchanged.

Exact-head green evidence on `26e46140...`:

- Architecture Guard `34992100825`;
- Frontend Preparation `34992100806`;
- Admin AI `34992100801`;
- Combined Integration `34992100802` including real Admin Chromium;
- Stage13G `34992100781` including Admin UI, backend, PostgreSQL/security integrations, and Real API + PostgreSQL + Chromium.

## Exact continuation

Next worker is **A**. Execute one smallest coherent increment: **AB-03.3.5 — AI lesson/quiz generation request ownership**.

1. Re-read live state/HEAD and perform a fresh consumer scan before mutation.
2. Extract only genuinely AI-owned generation contracts/functions from mixed root `admin-ai-authoring-api.ts`: `AiAuthoringSubjectDomain`, `LessonGenerationMode`, `QuizGenerationMode`, `AiQuestionTarget`, `AuthoringPlanResult`, `enqueueLessonGeneration`, `enqueueQuizGeneration`.
3. Prefer `features/ai` ownership/public contracts for legitimate cross-feature consumption; do not move `AdminAiAuthoringWorkspace.tsx` wholesale merely because it consumes several domains.
4. Keep `enqueueQuestionRegeneration`, `archiveQuestionBankItem`, `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport` and `specializedQuizPrintUrl` out of this increment for their later Question Bank/Quiz Builder ownership work.
5. Preserve routes/endpoints/payloads/copy/styles and run Architecture Guard, Admin quality, Admin AI, Combined and Stage13G/PostgreSQL/security/Chromium gates.

## Remaining roadmap

AB-03.3 AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
