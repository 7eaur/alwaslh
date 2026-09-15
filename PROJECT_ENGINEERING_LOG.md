# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker A sequence 74 closed AB-03.2 Curriculum + Content + OCR at exact source checkpoint `3a45d18...`, then selected AI operations ownership as the next canonical slice.**

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

Sequence 73 closed the remaining Content-ingestion compatibility facade at exact checkpoint `7f4a07e...`, then completed a same-slice direct-owner import cleanup at executable checkpoint `2dd1ca2...`; successor Admin AI `34964251627`, Combined `34964251663`, and Stage13G `34964251606` were all green.

Sequence 74 performed the final closure scan and found two actual root-owned transports still inside AB-03.2: lesson-content publication and lesson-authoring/export. They were moved without behavior change:

- root `lesson-content-api.ts` + test → `features/content/api/lesson-content-api.ts` + colocated test; `features/content/public` now owns the public contract.
- root `lesson-authoring-parity-api.ts` → `features/curriculum/api/lesson-authoring-parity-api.ts`; `features/curriculum/public` now owns summary/export contracts.
- `LessonPublicationPanel` and `LessonAuthoringParityPanel` were repointed to the proper public boundaries.
- GitHub classified the implementation/test moves as renames; implementation deltas were limited to the `shared/api/client` import path. No endpoint, payload, business rule, UI flow, database, authorization or security behavior changed.

Exact-head CI on `3a45d18...` is fully green:

- Architecture Guard `34964996524` — SUCCESS.
- Frontend Preparation `34964996555` — SUCCESS.
- Admin AI `34964996466` — SUCCESS.
- Combined Integration `34964996488` — SUCCESS including clean PostgreSQL and real Chromium.
- Stage13G `34964996480` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations, and Real API + PostgreSQL + Chromium.

`ContentOperationsPage.tsx` still uses generic `ApiRequestError` / session helpers through root `admin-api.ts`; actual Content/OCR transport is feature-correct. This was intentionally not used as a reason to reconstruct a large file for one compatibility import.

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

Fresh read-only discovery:

- no `features/ai` owner exists yet;
- root AI jobs/review implementation is split across `ai-operations-api.ts`, `ai-operations-adapter.ts`, `ai-operations-view-model.ts` and their tests;
- `AiOperationsPage.tsx` consumes those root modules plus a small AI application capability transport and approved-output application hooks;
- `AdminAiAuthoringWorkspace.tsx` additionally crosses Curriculum, AI authoring, Question Bank and Quiz Builder roots, so it must not be migrated as one indiscriminate batch.

Selected next increment: **AB-03.3.1 AI operations frontend ownership**. Establish a coherent `features/ai` owner for AI jobs/review API + mapping/view-model concerns and tests, expose a narrow public boundary, repoint AI operations/review consumers, and keep Question Bank/Quiz Builder ownership for their later canonical slices.
