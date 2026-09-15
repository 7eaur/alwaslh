# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker C sequence 80 established Question Bank API/application feature ownership and verified it through real integration/browser gates.**

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

Sequence 75 established AI jobs/review feature ownership; sequence 76 moved review presentation; sequence 77 moved approved-output application ownership; sequence 78 moved lesson/quiz generation requests; sequence 79 closed the AI slice after a fresh ownership scan.

Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Exact-source CI:
- Architecture Guard `34993541544` — SUCCESS.
- Frontend Preparation `34993541613` — SUCCESS.
- Admin AI `34993541626` — SUCCESS.
- Combined Integration `34993541546` — SUCCESS including real Admin Chromium.
- Stage13G `34993541607` — SUCCESS including Real API + PostgreSQL + Chromium.

### AB-03.4 Question Bank — ACTIVE

#### Sequence 80 — AB-03.4.1 Question Bank feature-owner foundation

Worker C fresh-mapped the live Question Bank topology:
- Admin presentation: `apps/admin-web/src/admin/questions/{QuestionBankListPage,QuestionBankCreatePage,QuestionBankDetailPage}.tsx`;
- root Admin frontend application/API: `apps/admin-web/src/question-bank-api.ts` + tests;
- mixed root authoring capability: `enqueueQuestionRegeneration` and `archiveQuestionBankItem` in `admin-ai-authoring-api.ts`;
- app composition: `app/router/AdminRoutes.tsx` lazy-loads `admin/questions/*`;
- backend canonical owner already exists at `apps/api/src/question-bank/{http.ts,regeneration-http.ts,regeneration.ts,service.ts}`.

Because backend authority was already correctly modularized, this increment stayed frontend-only and did not reconcile or mutate backend/database state.

Source commit `11fb063ebe513a6141bb67b6725b5f181d762907` (`refactor(admin): feature-own Question Bank API`) made exactly the ownership move required:
1. added `features/questions/question-bank-api.ts` as the single implementation owner for existing Question Bank contracts and frontend API/application functions;
2. added `features/questions/public/index.ts`;
3. reduced root `question-bank-api.ts` to a compatibility re-export;
4. left existing tests/pages/consumers behaviorally unchanged;
5. preserved all endpoint paths, payloads, response shapes, auth behavior, routes, UI, copy and styles;
6. did not mix Question Bank regeneration/archive or Quiz Builder concerns.

CI evidence:
- Architecture Guard `34995311318` — SUCCESS on exact source `11fb063e...`;
- Frontend Preparation `34995311313` — SUCCESS on exact source `11fb063e...`;
- Admin AI `34995415758` — SUCCESS on docs-only source-tree-equivalent `c6d36a2...`;
- Combined Integration `34995415726` — SUCCESS on source-tree-equivalent `c6d36a2...`, including real Admin Chromium;
- Stage13G `34995415760` — SUCCESS on source-tree-equivalent `c6d36a2...`, including Admin UI, clean PostgreSQL/security integration, and Real API + PostgreSQL + Chromium.

The exact-source Stage13G `34995311535` was cancelled by concurrency when the WAITING_FOR_CI state commit superseded the source head. This was not a code failure; the source tree was unchanged and the successor verification run was fully green.

#### Exact next increment — AB-03.4.2 Question Bank presentation ownership

Fresh inspection confirms all three page implementations remain under `admin/questions/*` and app composition imports those legacy locations. Worker A must move only the List/Create/Detail presentation ownership into `features/questions` and expose the minimal page boundary required by `AdminRoutes.tsx`, preserving UI states, props, routes, copy, CSS and behavior.

Do not combine with:
- `enqueueQuestionRegeneration` / `archiveQuestionBankItem` ownership;
- Quiz Builder export/print;
- UI redesign;
- speculative backend/database changes.

After presentation ownership verifies green, handle regeneration/archive as a separate Question Bank increment and remove compatibility facades only when consumer evidence permits.
