# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker A sequence 81 moved Question Bank presentation ownership into `features/questions` and passed exact-head verification.**

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
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — ACTIVE

#### Sequence 80 — AB-03.4.1 Question Bank feature-owner foundation — DONE

Source commit: `11fb063ebe513a6141bb67b6725b5f181d762907`.

- `features/questions/question-bank-api.ts` became the canonical Admin Question Bank API/application owner.
- `features/questions/public/index.ts` became the narrow public boundary.
- root `question-bank-api.ts` became compatibility-only.
- backend inspection confirmed canonical ownership already exists in `apps/api/src/question-bank/*`; no backend/database mutation was required.
- regeneration/archive and Quiz Builder concerns were deliberately deferred.

Verification:
- Architecture Guard `34995311318` — SUCCESS exact-source.
- Frontend Preparation `34995311313` — SUCCESS exact-source.
- Admin AI `34995415758` — SUCCESS source-tree-equivalent.
- Combined Integration `34995415726` — SUCCESS source-tree-equivalent including real Chromium.
- Stage13G `34995415760` — SUCCESS source-tree-equivalent including Real API + PostgreSQL + Chromium.

#### Sequence 81 — AB-03.4.2 Question Bank presentation ownership — DONE / EXACT-HEAD VERIFIED

Source commit: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca` (`refactor(admin): feature-own Question Bank presentation`).

Fresh inspection proved the three page implementations and the router were the only presentation ownership debt for this increment. The migration intentionally reused the exact existing page blobs at the same relative depth, so presentation behavior did not change.

Completed:
1. `QuestionBankListPage.tsx`, `QuestionBankCreatePage.tsx`, and `QuestionBankDetailPage.tsx` implementations now live under `features/questions`.
2. Added page-specific public entry points so the router can keep each page as its own lazy-loaded boundary.
3. `AdminRoutes.tsx` now lazy-loads `features/questions/public/QuestionBank{List,Create,Detail}Page` instead of `admin/questions/*`.
4. Legacy `admin/questions/*` files are one-line compatibility re-exports only.
5. Routes, props, loading/error/empty/success states, Arabic copy, accessibility semantics, CSS and behavior are unchanged.
6. No backend/database/security mutation and no live-main reconciliation was required.
7. `enqueueQuestionRegeneration` / `archiveQuestionBankItem` and Quiz Builder export/print remain intentionally outside this increment.

Exact-head CI on `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca`:
- Architecture Guard `34996490917` — SUCCESS.
- Frontend Preparation `34996491028` — SUCCESS.
- Admin AI `34996491040` — SUCCESS.
- Combined Integration `34996491059` — SUCCESS including deterministic fixture and real Admin Chromium.
- Stage13G `34996491115` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### Exact next increment — AB-03.4.3 Question Bank regeneration/archive ownership

Fresh source inspection at the verified checkpoint shows:
- `apps/admin-web/src/admin-ai-authoring-api.ts` still implements `enqueueQuestionRegeneration` and `archiveQuestionBankItem`;
- both functions are Question Bank responsibilities, not generic AI authoring ownership;
- `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx` is the current real consumer;
- the same mixed root file also owns Quiz Builder `fetchSpecializedQuizExport` / `specializedQuizPrintUrl`, which must remain untouched in this increment.

Worker B must move only the regeneration/archive functions and their necessary contracts behind `features/questions` ownership, expose a narrow public boundary, preserve existing endpoints/payloads/response behavior, and keep the workspace behavior unchanged. Cross-feature AI types may be consumed only through an approved narrow public contract; do not introduce circular dependencies or move types merely for aesthetics.
