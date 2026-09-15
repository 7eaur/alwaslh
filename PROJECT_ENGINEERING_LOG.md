# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker B sequence 85 feature-owned Quiz Builder presentation and passed exact-head verification.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains separate; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use the autonomous execution state as serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. Reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-03 — ACTIVE

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Source: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Source: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Source: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED
Final source: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

### AB-03.5 Quiz Builder — ACTIVE

#### Sequence 84 — AB-03.5.1 feature-owner foundation — DONE / EXACT-HEAD VERIFIED
Source commit: `2254cc8121fd319b17cbd626d683352b23dda229`.

Completed:
1. Added `features/quizzes/quiz-builder-api.ts` as canonical Admin Quiz Builder API/application owner.
2. Moved `quiz-builder-api.test.ts` into the feature without changing its contract assertions.
3. Added `features/quizzes/public/index.ts` as the narrow public boundary.
4. Reduced root `quiz-builder-api.ts` to compatibility re-export for real consumers.
5. Left backend/database unchanged because `apps/api/src/quiz-builder/*` already had correct authorization/validation/service ownership.

Exact-head CI:
- Architecture Guard `35015668415` — SUCCESS.
- Frontend Preparation `35015668182` — SUCCESS.
- Admin AI `35015668395` — SUCCESS.
- Combined Integration `35015668029` — SUCCESS including real Admin Chromium.
- Stage13G `35015667909` — SUCCESS including Real API + PostgreSQL + Chromium.

#### Sequence 85 — AB-03.5.2 presentation ownership — DONE / EXACT-HEAD VERIFIED
Source commit: `4c389e87872621dd70781401d85fadc7df6338b6` (`refactor(admin): feature-own Quiz Builder presentation`).

Fresh evidence before mutation:
- the route composition still lazy-imported all four Quiz Builder surfaces from `admin/quizzes/*`;
- `QuizBuilderListPage`, `QuizBuilderCreatePage`, `QuizBuilderDetailPage` and `QuizMetadataPanel` sat at the same relative depth as the target `features/quizzes` directory, so their implementation blobs could move unchanged;
- specialized export/print remained a separate ownership debt in the mixed AI-authoring root API and was intentionally excluded.

Completed source work:
1. Reused the exact existing page blobs under `features/quizzes/` for List/Create/Detail/Metadata, preserving JSX, copy, imports, CSS and behavior.
2. Added separate public entry points for each page to preserve route-level lazy chunks.
3. Changed only the four Quiz Builder lazy import paths in `app/router/AdminRoutes.tsx` to feature public entries.
4. Converted legacy `admin/quizzes/*` page files to one-line compatibility re-exports pending closure cleanup.
5. Made no backend, database, route, action, text or UX redesign change.

Exact-head CI on `4c389e87872621dd70781401d85fadc7df6338b6`:
- Architecture Guard `35020423714` — SUCCESS.
- Frontend Preparation `35020423729` — SUCCESS (lint + strict typecheck + unit + build).
- Admin AI `35020423669` — SUCCESS.
- Combined Integration `35020423630` — SUCCESS including clean PostgreSQL, backend/security regressions and real Admin Chromium.
- Stage13G `35020423618` — SUCCESS including Admin UI/backend and Real API + PostgreSQL + Chromium.

#### Exact next increment — AB-03.5.3 Quiz Builder specialized export/print ownership

Fresh closure-prep inspection confirms the remaining Quiz Builder-specific transport still lives in mixed root `admin-ai-authoring-api.ts`: `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport` and `specializedQuizPrintUrl`. `AdminAiAuthoringWorkspace` is a real consumer, and `admin-ai-authoring-api.test.ts` still contains the specialized URL/query contract assertion. Move only this Quiz Builder-owned transport/types/test coverage into `features/quizzes`, expose it through the feature public boundary, preserve exact specialized export/print routes and query semantics, and retain compatibility only where a real consumer still requires it. Keep AI authoring functionality and UI behavior unchanged.
