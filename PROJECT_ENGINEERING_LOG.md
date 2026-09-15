# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker C sequence 77 transferred approved AI output application ownership into `features/ai/operations`; exact-head checkpoint `26e46140...` is fully green.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes; reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

## AB-03 — ACTIVE

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED

Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

#### Sequence 75 — AI operations owner + review presentation ownership

Worker A established `features/ai` ownership for jobs/review application capability, API transport, adapter, view-model, tests and review presentation. Exact-head source checkpoint `c4f44953a6d16473e24f8a4188eb36943452812c` was fully green.

#### Sequence 76 — compatibility-facade retirement + direct-owner consumption

Worker B deleted the root AI operations facades and moved review/editor presentation fully under `features/ai/operations`, with body-preserving renames. Exact-head source checkpoint `d1e11bc7b99b50dff480e8f830812492a390983c` was fully green.

#### Sequence 77 — approved-output application ownership

Worker C performed a narrow extraction from the mixed root `admin-ai-authoring-api.ts`:

- `LessonApplyResult` and `QuizApplyResult` are now defined by `features/ai/operations/admin-ai-authoring-api.ts`;
- `applyApprovedLessonOutput` and `applyApprovedQuizOutput` are now implemented there using the shared Admin API client;
- endpoints remain `/v1/admin/authoring/outputs/:outputId/apply-lesson` and `/apply-quiz` with `POST`;
- root `admin-ai-authoring-api.ts` no longer implements these capabilities; it re-exports them/types only for compatibility while retaining unrelated generation/question-bank/export concerns;
- the existing AI review consumer did not need a JSX/import rewrite because its feature-local import path now resolves directly to the canonical implementation.

No endpoint, payload, backend, PostgreSQL, authorization, route, product-copy or styling behavior changed.

Exact-head CI on `26e461407d1508d86fc76b8a3b0151fab83531f9` is fully green:

- Architecture Guard `34992100825` — SUCCESS.
- Frontend Preparation `34992100806` — SUCCESS.
- Admin AI `34992100801` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions.
- Combined Integration `34992100802` — SUCCESS including deterministic browser fixture and real Admin Chromium.
- Stage13G `34992100781` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### Exact next increment

**AB-03.3.5 — AI lesson/quiz generation request ownership.** After a fresh consumer scan, move only the genuinely AI-owned generation contracts (`AiAuthoringSubjectDomain`, lesson/quiz generation modes, AI question target, authoring plan result) and `enqueueLessonGeneration` / `enqueueQuizGeneration` into `features/ai`. Keep `enqueueQuestionRegeneration`, `archiveQuestionBankItem`, specialized quiz export/print and their contracts out of this increment so Question Bank and Quiz Builder retain their later canonical ownership work.
