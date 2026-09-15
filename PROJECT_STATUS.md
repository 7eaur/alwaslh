# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.4 Question Bank`.

## Scope / permanent rules

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. `apps/student-web` frontend implementation itself is excluded. PostgreSQL/API remain canonical authority; backend stays a Fastify modular monolith; Admin `app` composes only; features own workflows and expose narrow public boundaries; tests/security/validation are never weakened; no permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Exact-source evidence:
- Architecture Guard `34993541544` — SUCCESS.
- Frontend Preparation `34993541613` — SUCCESS.
- Admin AI `34993541626` — SUCCESS.
- Combined Integration `34993541546` — SUCCESS including real Admin Chromium.
- Stage13G `34993541607` — SUCCESS including Real API + PostgreSQL + Chromium.

### AB-03.4 Question Bank — ACTIVE

#### AB-03.4.1 Question Bank feature-owner foundation — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Executable/source checkpoint: `11fb063ebe513a6141bb67b6725b5f181d762907`.

Canonical Admin Question Bank API/application ownership now lives in `features/questions/question-bank-api.ts` behind `features/questions/public/index.ts`; root `question-bank-api.ts` is compatibility-only. Backend ownership already exists under `apps/api/src/question-bank/*`, so no backend/database mutation was needed.

Verification:
- Architecture Guard `34995311318` — SUCCESS exact-source.
- Frontend Preparation `34995311313` — SUCCESS exact-source.
- Admin AI `34995415758` — SUCCESS source-tree-equivalent.
- Combined Integration `34995415726` — SUCCESS source-tree-equivalent including real Admin Chromium.
- Stage13G `34995415760` — SUCCESS source-tree-equivalent including Real API + PostgreSQL + Chromium.

#### AB-03.4.2 Question Bank presentation ownership — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca` (`refactor(admin): feature-own Question Bank presentation`).

Worker A sequence 81:
- moved the List/Create/Detail implementations from `admin/questions/*` to `features/questions/*` without changing their JSX, Arabic copy, state handling, CSS imports, props, routes or behavior;
- added page-specific public entry points under `features/questions/public` to preserve route-level lazy chunks;
- switched `app/router/AdminRoutes.tsx` to those feature public entry points;
- reduced the three legacy `admin/questions/*` files to compatibility re-exports;
- kept Question Bank regeneration/archive, Quiz Builder export/print, UI redesign and backend/database mutation outside this increment.

Exact-head verification on `26ca9ab2...`:
- Architecture Guard `34996490917` — SUCCESS.
- Frontend Preparation `34996491028` — SUCCESS.
- Admin AI `34996491040` — SUCCESS.
- Combined Integration `34996491059` — SUCCESS including real Admin Chromium.
- Stage13G `34996491115` — SUCCESS including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### AB-03.4.3 Question Bank regeneration/archive ownership — NEXT

Fresh live inspection confirms root `admin-ai-authoring-api.ts` still implements `enqueueQuestionRegeneration` and `archiveQuestionBankItem`; `AdminAiAuthoringWorkspace.tsx` is the current real consumer. Worker B must move only those Question Bank actions behind `features/questions` ownership and a narrow public boundary, preserve endpoint/payload/response behavior, and leave Quiz Builder specialized export/print untouched. Do not redesign the mixed workspace in this increment.

## Remaining roadmap

Finish Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
