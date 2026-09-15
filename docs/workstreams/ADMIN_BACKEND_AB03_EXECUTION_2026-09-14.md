# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.3 AI Jobs / Review / Authoring; closure scan next**

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
Executable/source checkpoint: `c4f44953a6d16473e24f8a4188eb36943452812c`.

### AB-03.3.3 Compatibility-facade retirement + direct-owner consumption — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `d1e11bc7b99b50dff480e8f830812492a390983c`.

### AB-03.3.4 Approved-output application ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `26e461407d1508d86fc76b8a3b0151fab83531f9`. Approved lesson/quiz output application contracts/functions are feature-owned; root authoring only re-exports them for compatibility.

### AB-03.3.5 AI lesson/quiz generation request ownership — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Worker A sequence 78 separated the genuinely AI-owned generation request capability from mixed root authoring ownership:

- new canonical owner `features/ai/authoring/ai-generation-api.ts`;
- owns `AiAuthoringSubjectDomain`, `LessonGenerationMode`, `QuizGenerationMode`, `AiQuestionTarget`, `AuthoringPlanResult`;
- owns `enqueueLessonGeneration` and `enqueueQuizGeneration` with the existing POST endpoints/payloads unchanged;
- `features/ai/public` now exports the generation surface;
- root `admin-ai-authoring-api.ts` now re-exports those AI generation symbols instead of implementing them;
- the remaining implementations in root are deliberately later-domain responsibilities: Question Bank question regeneration/archive and Quiz Builder specialized export/print;
- `AdminAiAuthoringWorkspace.tsx` was not rewritten solely to split a transitional import because that would add large JSX churn without changing implementation ownership.

No endpoint, payload, backend, PostgreSQL, authorization, routing, product-copy or styling behavior changed.

Exact-head evidence on `9b38c9d2...`:

- Architecture Guard `34993541544` — SUCCESS;
- Frontend Preparation `34993541613` — SUCCESS;
- Admin AI `34993541626` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions;
- Combined Integration `34993541546` — SUCCESS including deterministic fixture and real Admin Chromium;
- Stage13G `34993541607` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

### AB-03.3.6 AI slice closure scan — NEXT

Next worker B must fresh-scan live topology for residual AI implementation outside `features/ai`, especially root `admin-ai-authoring-api.ts`, mixed `AdminAiAuthoringWorkspace.tsx`, any review route facade and remaining root `ai-*` modules. Compatibility re-exports and actual later-domain Question Bank/Quiz Builder implementations are not by themselves AI ownership debt. If no genuine AI-owned implementation remains outside `features/ai`, close AB-03.3 at verified source checkpoint `9b38c9d2...` and select the first Question Bank increment; do not manufacture a large-file cleanup solely to remove a legitimate transitional import.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
