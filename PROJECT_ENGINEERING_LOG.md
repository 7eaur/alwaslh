# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker B sequence 79 closed AB-03.3 after a live closure scan; no additional AI source mutation was required and Question Bank is the next slice.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains separate; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use the autonomous execution state as serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes; reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-03 — ACTIVE

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED

Sequence 75 established the AI jobs/review feature owner and presentation. Sequence 76 retired root AI operations facades and colocated review/editor presentation. Sequence 77 moved approved-output application ownership into the AI feature. Sequence 78 moved lesson/quiz generation request ownership into `features/ai/authoring`.

#### Sequence 78 — AI lesson/quiz generation request ownership

Worker A split genuinely AI-owned generation request contracts/functions out of mixed root `admin-ai-authoring-api.ts`:

- canonical owner: `features/ai/authoring/ai-generation-api.ts`;
- owns `AiAuthoringSubjectDomain`, `LessonGenerationMode`, `QuizGenerationMode`, `AiQuestionTarget`, `AuthoringPlanResult`;
- owns `enqueueLessonGeneration` → `POST /v1/admin/authoring/lessons/generate`;
- owns `enqueueQuizGeneration` → `POST /v1/admin/quizzes/:quizId/generate`;
- `features/ai/public` exposes this narrow authoring surface;
- root `admin-ai-authoring-api.ts` re-exports AI generation symbols rather than implementing them;
- root retains only actual later-domain implementations: question regeneration/archive and specialized quiz export/print, plus compatibility exports;
- the large `AdminAiAuthoringWorkspace.tsx` was deliberately not rewritten merely to split one import block, avoiding UI/JSX drift.

No endpoint, payload, backend, PostgreSQL, authorization, route, product-copy or styling behavior changed.

Exact-head CI on `9b38c9d2f803e220874a40e71ac06399e78435a3` is fully green:

- Architecture Guard `34993541544` — SUCCESS.
- Frontend Preparation `34993541613` — SUCCESS.
- Admin AI `34993541626` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions.
- Combined Integration `34993541546` — SUCCESS including deterministic browser fixture and real Admin Chromium.
- Stage13G `34993541607` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### Sequence 79 — AI slice closure scan

Worker B performed a fresh live-head topology scan after sequence 78 and made no source mutation.

Verified findings:

- root `admin-ai-authoring-api.ts` has no duplicate lesson/quiz generation or approved-output application implementation; those are compatibility re-exports into `features/ai`;
- executable residual root functions are Question Bank regeneration/archive and Quiz Builder specialized export/print, deliberately deferred to their own slices;
- `admin/reviews/AiOperationsPage.tsx` is a one-line re-export from `features/ai/public` and therefore not a competing implementation owner;
- `AdminAiAuthoringWorkspace.tsx` remains a mixed orchestration consumer, not a second AI implementation owner;
- remaining root `ai-operations*.css` files are style assets, not application ownership;
- `features/ai` contains canonical `authoring`, `operations`, and `public` boundaries.

Conclusion: AB-03.3 is closed at executable/source checkpoint `9b38c9d2f803e220874a40e71ac06399e78435a3`. Because sequence 79 changed documentation/state only, the exact-source green evidence from sequence 78 remains the applicable executable evidence.

### AB-03.4 Question Bank — NEXT

Fresh topology shows no `apps/admin-web/src/features/questions` directory yet. Current Question Bank ownership is spread across:

- `apps/admin-web/src/admin/questions/*` presentation;
- root `question-bank-api.ts` and its tests;
- Question Bank regeneration/archive actions still implemented in mixed root `admin-ai-authoring-api.ts`;
- app router lazy-loads legacy `admin/questions/*` pages.

#### Exact next increment

**AB-03.4.1 — Question Bank feature-owner foundation.** Worker C must fresh-map Question Bank consumers plus authoritative API/security contracts, then establish the smallest coherent `features/questions` application/API owner and narrow public boundary while preserving behavior. Do not mix Quiz Builder ownership, UI redesign, or speculative backend/database changes. If fresh evidence requires overlapping backend/database mutation, reconcile live main first.
