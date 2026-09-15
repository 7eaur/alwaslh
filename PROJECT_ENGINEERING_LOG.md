# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker A sequence 78 transferred AI lesson/quiz generation request ownership into `features/ai/authoring`; exact-head checkpoint `9b38c9d2...` is fully green.**

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

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

Sequence 75 established the AI jobs/review feature owner and presentation. Sequence 76 retired root AI operations facades and colocated review/editor presentation. Sequence 77 moved approved-output application ownership into the AI feature.

#### Sequence 78 — AI lesson/quiz generation request ownership

Worker A split genuinely AI-owned generation request contracts/functions out of mixed root `admin-ai-authoring-api.ts`:

- new canonical owner: `features/ai/authoring/ai-generation-api.ts`;
- owns `AiAuthoringSubjectDomain`, `LessonGenerationMode`, `QuizGenerationMode`, `AiQuestionTarget`, `AuthoringPlanResult`;
- owns `enqueueLessonGeneration` → `POST /v1/admin/authoring/lessons/generate`;
- owns `enqueueQuizGeneration` → `POST /v1/admin/quizzes/:quizId/generate`;
- `features/ai/public` exposes this narrow authoring surface;
- root `admin-ai-authoring-api.ts` re-exports AI generation symbols rather than implementing them;
- root retains only actual later-domain implementations: question regeneration/archive and specialized quiz export/print, plus compatibility exports;
- the large `AdminAiAuthoringWorkspace.tsx` was deliberately not rewritten merely to split one import block, avoiding UI/JSX drift. Existing root compatibility remains a consumer facade, not a second implementation owner.

No endpoint, payload, backend, PostgreSQL, authorization, route, product-copy or styling behavior changed.

Exact-head CI on `9b38c9d2f803e220874a40e71ac06399e78435a3` is fully green:

- Architecture Guard `34993541544` — SUCCESS.
- Frontend Preparation `34993541613` — SUCCESS.
- Admin AI `34993541626` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions.
- Combined Integration `34993541546` — SUCCESS including deterministic browser fixture and real Admin Chromium.
- Stage13G `34993541607` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### Exact next increment

**AB-03.3.6 — AI slice closure scan.** Fresh-scan residual root/AI files and consumers, especially mixed `admin-ai-authoring-api.ts`, `AdminAiAuthoringWorkspace.tsx`, the route compatibility facade and any root `ai-*` modules. Do not mistake compatibility re-exports or later Question Bank/Quiz Builder implementation for AI ownership debt. If no real AI-owned implementation remains outside `features/ai`, close AB-03.3 at the verified `9b38c9d2...` source checkpoint and select the first Question Bank increment from live topology.
