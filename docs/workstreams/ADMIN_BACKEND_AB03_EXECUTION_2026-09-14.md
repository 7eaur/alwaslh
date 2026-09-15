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

Real AI jobs/review application capability, transport, adapter, view-model and associated tests live under `features/ai/operations`.

### AB-03.3.2 AI review presentation ownership transfer — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `c4f44953a6d16473e24f8a4188eb36943452812c`. Review presentation was moved into `features/ai` without changing JSX, endpoints, payloads, product copy or security behavior.

### AB-03.3.3 Compatibility-facade retirement + direct-owner consumption — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `d1e11bc7b99b50dff480e8f830812492a390983c`.

Worker B sequence 76 closed the root AI operations facade debt:

- deleted root `ai-application-api.ts`, `ai-operations-api.ts`, `ai-operations-adapter.ts`, `ai-operations-view-model.ts` facades;
- moved `AiStructuredOutputEditor.tsx` into `features/ai/operations` as a 100% rename;
- moved editor/review CSS into the AI owner as 100% renames;
- moved `AiOperationsPage.tsx` and `AiReviewWorkspace.tsx` under `features/ai/operations/ui/reviews` as 100% renames, preserving their existing relative imports to feature-owned operations code;
- updated `features/ai/public` to the new review-page path;
- added two one-line internal bridges only for generic Admin API helpers and approved-output application hooks.

No endpoint, payload, backend, PostgreSQL, authorization, route behavior, copy, JSX behavior or style semantics changed.

Exact-head evidence on `d1e11bc7...`:

- Architecture Guard `34990715628` — SUCCESS;
- Frontend Preparation `34990715697` — SUCCESS;
- Admin AI `34990715543` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions;
- Combined Integration `34990715804` — SUCCESS including deterministic fixture and real Admin Chromium;
- Stage13G `34990715570` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

### AB-03.3.4 Approved-output application ownership — NEXT

Next worker C must perform a fresh consumer scan around `applyApprovedLessonOutput`, `applyApprovedQuizOutput` and their contracts in mixed root `admin-ai-authoring-api.ts`. Extract only this AI review/application capability into `features/ai` and repoint the feature-local review consumer. Do not absorb lesson/quiz generation, Question Bank, question regeneration/archive, specialized export/print or Quiz Builder concerns into the AI feature simply because they share the legacy root file. Delete the temporary `features/ai/operations/admin-ai-authoring-api.ts` bridge once direct ownership is proven, then run the full required exact-head gates.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
