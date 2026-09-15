# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-15**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.4 Question Bank**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

## AB-03.2 — Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

## AB-03.3 — AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED

### AB-03.3.1 AI operations feature-owner foundation — DONE / EXACT-HEAD VERIFIED
AI jobs/review application capability, transport, adapter, view-model and tests are owned by `features/ai/operations`.

### AB-03.3.2 AI review presentation ownership transfer — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `c4f44953a6d16473e24f8a4188eb36943452812c`.

### AB-03.3.3 Compatibility-facade retirement + direct-owner consumption — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `d1e11bc7b99b50dff480e8f830812492a390983c`.

### AB-03.3.4 Approved-output application ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `26e461407d1508d86fc76b8a3b0151fab83531f9`.

### AB-03.3.5 AI lesson/quiz generation request ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Worker A sequence 78 moved genuine AI lesson/quiz generation request contracts/functions to `features/ai/authoring/ai-generation-api.ts`; root authoring now re-exports them while retaining later Question Bank and Quiz Builder responsibilities. No endpoint, payload, backend, PostgreSQL, authorization, routing, copy or styling behavior changed.

Exact-head evidence on `9b38c9d2...`:
- Architecture Guard `34993541544` — SUCCESS;
- Frontend Preparation `34993541613` — SUCCESS;
- Admin AI `34993541626` — SUCCESS;
- Combined Integration `34993541546` — SUCCESS including real Admin Chromium;
- Stage13G `34993541607` — SUCCESS including Real API + PostgreSQL + Chromium.

### AB-03.3.6 AI slice closure scan — DONE / NO SOURCE MUTATION REQUIRED

Worker B sequence 79 verified that no genuine AI implementation owner remained outside `features/ai`. Root `admin-ai-authoring-api.ts` contains compatibility re-exports for AI-owned generation/application plus later-domain Question Bank regeneration/archive and Quiz Builder export/print implementations. AB-03.3 therefore closed at `9b38c9d2f803e220874a40e71ac06399e78435a3`.

## AB-03.4 — Question Bank — ACTIVE

### AB-03.4.1 Question Bank feature-owner foundation — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Worker C sequence 80 fresh-mapped the Question Bank surface and confirmed the backend already has canonical modular ownership at `apps/api/src/question-bank/{http.ts,regeneration-http.ts,regeneration.ts,service.ts}`. No backend/database mutation or main reconciliation was necessary for this frontend-only increment.

Executable/source checkpoint: `11fb063ebe513a6141bb67b6725b5f181d762907` (`refactor(admin): feature-own Question Bank API`).

Completed ownership transfer:
- canonical Admin Question Bank API/application owner: `apps/admin-web/src/features/questions/question-bank-api.ts`;
- narrow public boundary: `apps/admin-web/src/features/questions/public/index.ts`;
- root `apps/admin-web/src/question-bank-api.ts` reduced from implementation to compatibility re-export;
- existing pages/tests/consumers retain behavior through the compatibility boundary;
- endpoint paths, payloads, response types, authorization behavior, routes, UI, copy and CSS are unchanged;
- Question Bank regeneration/archive in mixed root authoring and Quiz Builder export/print were deliberately left for separate increments.

Verification note: the WAITING_FOR_CI state commit `c6d36a2f8b042b4c1426e31293799be6816f68b4` changed documentation only and superseded some long-running source-head workflows through GitHub concurrency. The executable source tree remained unchanged. Applicable evidence is therefore labeled precisely:
- Architecture Guard `34995311318` — SUCCESS on exact source `11fb063e...`;
- Frontend Preparation `34995311313` — SUCCESS on exact source `11fb063e...`;
- Admin AI `34995415758` — SUCCESS on source-tree-equivalent `c6d36a2...`;
- Combined Integration `34995415726` — SUCCESS on source-tree-equivalent `c6d36a2...`, including real Admin Chromium;
- Stage13G `34995415760` — SUCCESS on source-tree-equivalent `c6d36a2...`, including Admin UI, backend, clean PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

The earlier source-head Stage13G run `34995311535` was cancelled only because the docs-only WAITING state commit superseded it; this is not a source failure.

### AB-03.4.2 Question Bank presentation ownership — NEXT

Fresh live topology shows `QuestionBankListPage`, `QuestionBankCreatePage`, and `QuestionBankDetailPage` still implement Question Bank presentation under `apps/admin-web/src/admin/questions/*`, and `app/router/AdminRoutes.tsx` lazy-loads those legacy locations.

Next smallest coherent increment for Worker A:
1. move the three Question Bank page implementations behind `features/questions` presentation ownership;
2. expose only the page entry points required by app composition through `features/questions/public`;
3. switch `AdminRoutes.tsx` to the feature public boundary (or feature-owned page entry points if the architecture guard requires the narrow public route contract);
4. preserve routes, props, UI states, copy, CSS and behavior exactly;
5. do **not** move `enqueueQuestionRegeneration` / `archiveQuestionBankItem` in the same increment;
6. do **not** mix Quiz Builder or UI redesign.

After presentation ownership is verified, handle Question Bank regeneration/archive ownership as its own later AB-03.4 increment and retire compatibility facades only when no real consumer remains.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
