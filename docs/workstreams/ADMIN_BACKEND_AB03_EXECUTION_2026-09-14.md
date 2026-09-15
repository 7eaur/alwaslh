# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.3 AI Jobs / Review / Authoring**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

## AB-03.2 — Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED

Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

## AB-03.3 — AI Jobs / Review / Authoring — ACTIVE

### AB-03.3.1 AI operations feature-owner foundation — DONE / EXACT-HEAD VERIFIED

AI jobs/review application capability, transport, adapter, view-model and tests are owned by `features/ai/operations`.

### AB-03.3.2 AI review presentation ownership transfer — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `c4f44953a6d16473e24f8a4188eb36943452812c`. Review presentation moved into the AI feature without behavior drift.

### AB-03.3.3 Compatibility-facade retirement + direct-owner consumption — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `d1e11bc7b99b50dff480e8f830812492a390983c`. Root AI operations facades were removed and review/editor presentation became feature-owned. Required Admin/API/PostgreSQL/security/Chromium gates all passed.

### AB-03.3.4 Approved-output application ownership — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `26e461407d1508d86fc76b8a3b0151fab83531f9`.

Worker C sequence 77 separated the AI-owned approved-output application capability from mixed root authoring ownership:

- `features/ai/operations/admin-ai-authoring-api.ts` now owns `LessonApplyResult`, `QuizApplyResult`, `applyApprovedLessonOutput` and `applyApprovedQuizOutput`;
- the two application endpoints remain exactly `/v1/admin/authoring/outputs/:outputId/apply-lesson` and `/apply-quiz`, using `POST`;
- root `admin-ai-authoring-api.ts` no longer implements these capabilities and only re-exports them/types for compatibility while continuing to host unrelated generation/question-bank/export concerns;
- the AI review consumer already resolves to the feature-local module, so no JSX or presentation rewrite was required.

No endpoint, payload, backend, PostgreSQL, authorization, routing, product-copy or styling behavior changed.

Exact-head evidence on `26e46140...`:

- Architecture Guard `34992100825` — SUCCESS;
- Frontend Preparation `34992100806` — SUCCESS;
- Admin AI `34992100801` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions;
- Combined Integration `34992100802` — SUCCESS including deterministic fixture and real Admin Chromium;
- Stage13G `34992100781` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

### AB-03.3.5 AI lesson/quiz generation request ownership — NEXT

Next worker A must perform a fresh consumer scan, then extract only the AI-owned generation contracts/functions from mixed root `admin-ai-authoring-api.ts`: `AiAuthoringSubjectDomain`, `LessonGenerationMode`, `QuizGenerationMode`, `AiQuestionTarget`, `AuthoringPlanResult`, `enqueueLessonGeneration`, `enqueueQuizGeneration`. Do not migrate the mixed authoring workspace wholesale and do not pull `enqueueQuestionRegeneration`, `archiveQuestionBankItem`, specialized export/print or their contracts into the AI feature; those remain later Question Bank/Quiz Builder ownership work. Preserve behavior and rerun the full exact-head gates.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
