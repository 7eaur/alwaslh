# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker B sequence 76 retired the remaining root AI operations facades and colocated AI review/editor presentation under `features/ai/operations`; exact-head checkpoint `d1e11bc7...` is fully green.**

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

Worker B performed the follow-up consumer scan and closed the root AI operations compatibility debt without changing behavior:

- deleted root `ai-application-api.ts`, `ai-operations-api.ts`, `ai-operations-adapter.ts`, `ai-operations-view-model.ts` facades;
- moved `AiStructuredOutputEditor.tsx` into `features/ai/operations` as a 100% rename;
- moved `ai-structured-output-editor.css` and `ai-review-workspace.css` into the same owner as 100% renames;
- moved `AiOperationsPage.tsx` and `AiReviewWorkspace.tsx` deeper under `features/ai/operations/ui/reviews` as 100% renames so their existing relative imports resolve directly to feature-owned implementation;
- changed `features/ai/public` only to point at the new presentation path;
- added two one-line internal bridges for generic Admin API helpers and approved-output application hooks, avoiding any broad rewrite of the large review JSX.

GitHub compare classified the editor, review CSS and review UI moves as renames with zero body changes. No endpoint, payload, backend, database, authorization, route behavior, copy or styling semantics changed.

Exact-head CI on `d1e11bc7b99b50dff480e8f830812492a390983c` is fully green:

- Architecture Guard `34990715628` — SUCCESS.
- Frontend Preparation `34990715697` — SUCCESS.
- Admin AI `34990715543` — SUCCESS including clean migrations, PostgreSQL contracts, authorization/observability/review-race/control and Stage12/auth regressions.
- Combined Integration `34990715804` — SUCCESS including deterministic browser fixture and real Admin Chromium.
- Stage13G `34990715570` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### Exact next increment

**AB-03.3.4 — approved-output application ownership.** Perform a fresh consumer scan around `applyApprovedLessonOutput` and `applyApprovedQuizOutput` plus their result contracts. Extract only this AI-owned approved-output application capability from mixed root `admin-ai-authoring-api.ts` into `features/ai`. Do not absorb lesson/quiz generation, Question Bank or Quiz Builder export transports into the AI feature merely because they share the same legacy file. Preserve endpoints/payloads/behavior and remove compatibility only after all consumers are proven.
