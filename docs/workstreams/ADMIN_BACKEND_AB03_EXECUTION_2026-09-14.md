# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-15**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.5 Quiz Builder**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

## AB-03.2 — Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

## AB-03.3 — AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

## AB-03.4 — Question Bank — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

## AB-03.5 — Quiz Builder — ACTIVE

### AB-03.5.1 Quiz Builder feature-owner foundation — DONE / EXACT-HEAD VERIFIED
Source: `2254cc8121fd319b17cbd626d683352b23dda229`.

### AB-03.5.2 Quiz Builder presentation ownership — DONE / EXACT-HEAD VERIFIED
Source: `4c389e87872621dd70781401d85fadc7df6338b6`.

### AB-03.5.3 Quiz Builder specialized export/print ownership — DONE / EXACT-HEAD VERIFIED
Source: `da083efb41a08103edb402b4021ccfb792077384`.

Worker C sequence 86:
- moved `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport` and `specializedQuizPrintUrl` into `features/quizzes/quiz-builder-specialized-export-api.ts`;
- split specialized URL/query contract tests into the Quiz Builder feature;
- exported specialized contracts/actions through `features/quizzes/public/index.ts`;
- reduced mixed root `admin-ai-authoring-api.ts` to compatibility re-exports for those specialized Quiz Builder symbols while retaining unrelated AI/QBank exports;
- preserved exact specialized-export and specialized-print routes plus `versionIds`/`variant` serialization;
- inspected backend specialized HTTP ownership and found admin auth + Zod/UUID validation + bounded version IDs + print security headers already canonical, so no backend/PostgreSQL mutation was made.

Exact-head evidence on `da083efb41a08103edb402b4021ccfb792077384`:
- Architecture Guard `35021257562` — SUCCESS;
- Frontend Preparation `35021257744` — SUCCESS;
- Admin AI `35021257706` — SUCCESS;
- Combined Integration `35021257480` — SUCCESS including clean PostgreSQL/backend/security regressions and real Admin Chromium;
- Stage13G `35021257700` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

### AB-03.5.4 Quiz Builder compatibility retirement + closure scan — NEXT

Pre-scan evidence:
- all four feature-owned Quiz Builder presentation files still import API symbols through root `../../quiz-builder-api`;
- router imports already point at `features/quizzes/public/*`, so old `admin/quizzes/*` page files are compatibility-only unless another consumer is discovered;
- mixed `admin-ai-authoring-api.ts` still has a real `AdminAiAuthoringWorkspace` consumer, so its compatibility role must not be removed merely for cosmetic cleanup.

The next increment must fresh-map consumers, switch feature-internal Quiz Builder imports to local canonical ownership where safe, delete only facades proven dead, preserve any compatibility surface with a real consumer, prove no duplicate implementation ownership remains, then rerun all exact-head gates. Only after that may AB-03.5 be marked fully DONE and execution move to Students.

## Main reconciliation

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes. Reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.
