# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.5 Quiz Builder`.

## Scope / permanent rules

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. `apps/student-web` frontend implementation itself is excluded. PostgreSQL/API remain canonical authority; backend stays a Fastify modular monolith; Admin `app` composes only; features own workflows and expose narrow public boundaries; tests/security/validation are never weakened; no permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

## AB-03 — ACTIVE
Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

### AB-03.5 Quiz Builder — ACTIVE

#### AB-03.5.1 Quiz Builder feature-owner foundation — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `2254cc8121fd319b17cbd626d683352b23dda229`.

Completed:
- moved the Quiz Builder frontend API/application implementation into `features/quizzes/quiz-builder-api.ts`;
- moved its unit test into the feature;
- exposed `features/quizzes/public/index.ts`;
- reduced root `quiz-builder-api.ts` to compatibility-only;
- preserved endpoint/payload/filter/auth/lifecycle behavior;
- left canonical backend ownership under `apps/api/src/quiz-builder/*` unchanged.

Exact-head verification:
- Architecture Guard `35015668415` — SUCCESS.
- Frontend Preparation `35015668182` — SUCCESS.
- Admin AI `35015668395` — SUCCESS.
- Combined Integration `35015668029` — SUCCESS including real Admin Chromium.
- Stage13G `35015667909` — SUCCESS including Real API + PostgreSQL + Chromium.

#### AB-03.5.2 Quiz Builder presentation ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `4c389e87872621dd70781401d85fadc7df6338b6` (`refactor(admin): feature-own Quiz Builder presentation`).

Completed:
- moved `QuizBuilderListPage`, `QuizBuilderCreatePage`, `QuizBuilderDetailPage` and `QuizMetadataPanel` implementations into `features/quizzes` using the existing source blobs, preserving JSX, Arabic copy, CSS imports, props, accessibility and behavior;
- added page-specific public entry points so the existing route-level lazy boundaries stay separate;
- changed only the four Quiz Builder lazy import paths in `AdminRoutes.tsx` to consume feature public entries;
- reduced old `admin/quizzes/*` page paths to one-line compatibility re-exports pending the Quiz Builder closure scan;
- made no backend, PostgreSQL, route, action, copy or UX redesign change.

Exact-head verification on `4c389e87872621dd70781401d85fadc7df6338b6`:
- Architecture Guard `35020423714` — SUCCESS.
- Frontend Preparation `35020423729` — SUCCESS.
- Admin AI `35020423669` — SUCCESS.
- Combined Integration `35020423630` — SUCCESS including clean PostgreSQL/security regressions and real Admin Chromium.
- Stage13G `35020423618` — SUCCESS including Admin UI/backend and Real API + PostgreSQL + Chromium.

#### AB-03.5.3 Quiz Builder specialized export/print ownership — NEXT

Fresh scan confirms Quiz Builder-specific `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport` and `specializedQuizPrintUrl` are still implemented in mixed root `admin-ai-authoring-api.ts`, consumed by `AdminAiAuthoringWorkspace`, with their contract assertions mixed into `admin-ai-authoring-api.test.ts`. Move this specialized Quiz Builder transport/contract ownership into `features/quizzes`, expose it through the feature public boundary, preserve exact URLs/query semantics, and keep any required root compatibility re-export only while a real consumer exists. Do not redesign the workspace.

## Remaining roadmap

Finish Quiz Builder specialized ownership + compatibility closure → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
