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

Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Sequence 78 moved genuine lesson/quiz generation ownership to `features/ai/authoring`; sequence 79 closure scan confirmed remaining root implementations belong to later Question Bank and Quiz Builder slices.

Exact-source evidence:
- Architecture Guard `34993541544` — SUCCESS.
- Frontend Preparation `34993541613` — SUCCESS.
- Admin AI `34993541626` — SUCCESS.
- Combined Integration `34993541546` — SUCCESS including real Admin Chromium.
- Stage13G `34993541607` — SUCCESS including Real API + PostgreSQL + Chromium.

## AB-03.4 — Question Bank — ACTIVE

### AB-03.4.1 Question Bank feature-owner foundation — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Executable/source checkpoint: `11fb063ebe513a6141bb67b6725b5f181d762907`.

Completed:
- canonical Admin Question Bank API/application owner: `apps/admin-web/src/features/questions/question-bank-api.ts`;
- narrow public boundary: `apps/admin-web/src/features/questions/public/index.ts`;
- root `apps/admin-web/src/question-bank-api.ts` reduced to compatibility re-export;
- backend inspection confirmed canonical modular ownership already exists under `apps/api/src/question-bank/*`;
- no endpoint/payload/auth/route/UI/copy/CSS behavior changed;
- regeneration/archive and Quiz Builder export/print remained outside the increment.

Verification:
- Architecture Guard `34995311318` — SUCCESS exact-source.
- Frontend Preparation `34995311313` — SUCCESS exact-source.
- Admin AI `34995415758` — SUCCESS source-tree-equivalent.
- Combined Integration `34995415726` — SUCCESS source-tree-equivalent including real Admin Chromium.
- Stage13G `34995415760` — SUCCESS source-tree-equivalent including Real API + PostgreSQL + Chromium.

### AB-03.4.2 Question Bank presentation ownership — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca` (`refactor(admin): feature-own Question Bank presentation`).

Worker A sequence 81 moved presentation ownership without behavior change:
- reused the exact List/Create/Detail page implementations under `features/questions`;
- added page-specific public entry points to preserve independent lazy chunks;
- switched `AdminRoutes.tsx` from `admin/questions/*` implementation imports to `features/questions/public/QuestionBank{List,Create,Detail}Page`;
- reduced all three legacy page files to one-line compatibility re-exports;
- preserved routes, props, loading/error/empty/success states, Arabic copy, CSS, accessibility and runtime behavior;
- did not move Question Bank regeneration/archive or any Quiz Builder concern;
- did not mutate backend/database/security authority.

Exact-head evidence on `26ca9ab2...`:
- Architecture Guard `34996490917` — SUCCESS;
- Frontend Preparation `34996491028` — SUCCESS;
- Admin AI `34996491040` — SUCCESS;
- Combined Integration `34996491059` — SUCCESS including real Admin Chromium;
- Stage13G `34996491115` — SUCCESS including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

### AB-03.4.3 Question Bank regeneration/archive ownership — NEXT

Fresh verified-source inspection shows root `apps/admin-web/src/admin-ai-authoring-api.ts` still implements:
- `enqueueQuestionRegeneration(itemId, { clientRequestId, subjectDomain })` → `POST /v1/admin/authoring/question-bank/:itemId/regenerate`;
- `archiveQuestionBankItem(itemId)` → `POST /v1/admin/authoring/question-bank/:itemId/archive`.

`AdminAiAuthoringWorkspace.tsx` is the current real consumer. The same mixed root file also owns Quiz Builder specialized export/print, which belongs to the next domain slice and must not move with Question Bank.

Worker B sequence 82 must:
1. move only regeneration/archive implementation ownership plus necessary Question Bank-side contracts behind `features/questions`;
2. expose a narrow public boundary and preserve all endpoints, payloads, response shapes and behavior;
3. consume any AI types only through an approved public contract, avoiding internal feature imports and circular dependencies;
4. switch the real consumer if appropriate and retire root compatibility only when consumer evidence permits;
5. leave `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport`, `specializedQuizPrintUrl` and all Quiz Builder work untouched;
6. avoid UI redesign and backend/database mutation unless fresh evidence proves a required correction;
7. if backend/database overlap becomes necessary, reconcile live `main` first.

After this increment verifies green, perform a fresh Question Bank closure scan before entering Quiz Builder.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
