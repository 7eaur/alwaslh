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

## AB-03.4 — Question Bank — ACTIVE

### AB-03.4.1 Question Bank feature-owner foundation — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
Executable/source checkpoint: `11fb063ebe513a6141bb67b6725b5f181d762907`.

Canonical Admin Question Bank API/application ownership moved to `features/questions`; backend standard Question Bank ownership already existed under `apps/api/src/question-bank/*`.

Verification: Architecture `34995311318`, Frontend `34995311313`, Admin AI `34995415758`, Combined `34995415726`, Stage13G `34995415760` — SUCCESS under their recorded exact/source-tree-equivalent classifications.

### AB-03.4.2 Question Bank presentation ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca`.

List/Create/Detail implementations moved to `features/questions`; route composition now uses page-specific feature public entry points; legacy presentation paths became compatibility re-exports without UI/route/copy/CSS behavior change.

Exact-head evidence: Architecture `34996490917`, Frontend `34996491028`, Admin AI `34996491040`, Combined `34996491059`, Stage13G `34996491115` — SUCCESS.

### AB-03.4.3 Question Bank regeneration/archive ownership — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `5ff7028cb069561c5eb45466e9a0fb882fbf9131` (`refactor(admin): feature-own Question Bank regeneration`).

Worker B sequence 82:
- added canonical `features/questions/question-bank-authoring-api.ts` owner for `enqueueQuestionRegeneration` and `archiveQuestionBankItem`;
- imports AI authoring types only through `features/ai/public`;
- exports the actions through `features/questions/public`;
- moved regeneration/archive tests into the Question Bank feature and preserved URL/method/credentials/payload contracts;
- removed duplicate implementations from root `admin-ai-authoring-api.ts` while leaving only a temporary compatibility re-export for the still-real mixed workspace consumer;
- left Quiz Builder specialized export/print code and types untouched;
- verified the existing backend routes in `apps/api/src/ai/admin-authoring-http.ts` already enforce admin authorization, Zod validation and service authority, so no backend/database mutation or main reconciliation was required.

Exact-head evidence on `5ff7028c...`:
- Architecture Guard `34998332362` — SUCCESS;
- Frontend Preparation `34998332394` — SUCCESS;
- Admin AI `34998332370` — SUCCESS including clean PostgreSQL/security regressions;
- Combined Integration `34998332374` — SUCCESS including backend authority regressions and real Admin Chromium;
- Stage13G `34998332377` — SUCCESS including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

### AB-03.4.4 Question Bank compatibility retirement + closure scan — NEXT

Fresh post-AB-03.4.3 topology shows only compatibility/consumer cleanup remains:
- feature-owned Question Bank pages still reference root `question-bank-api.ts` from their inherited imports;
- `AdminAiAuthoringWorkspace.tsx` still consumes Question Bank API/actions through root facades;
- root `question-bank-api.ts` is a one-line feature re-export;
- legacy `admin/questions/*` pages are one-line re-exports while `AdminRoutes.tsx` already composes feature public entries.

Worker C must fresh-map consumers, switch safe consumers to canonical same-feature/public boundaries, delete only facades proven consumer-free, and perform the closure scan. Do not touch Quiz Builder ownership or redesign UI. If no genuine Question Bank ownership remains outside `features/questions` and canonical backend boundaries after cleanup, close AB-03.4 and hand off AB-03.5 Quiz Builder to Worker A.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
