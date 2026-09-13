# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder is NEXT / NOT STARTED.**

Branch: `rebuild/super-admin-foundation`

Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`

Latest live `main` direct branch read before AR-06 closure: `343ff1fd7b3d64d7e990b72606695365f520fa58`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation. This workstream does not replace those sources.

## 0. Product decision summary

The Super Admin is being rebuilt as a task-oriented operational product, not cosmetically polished as a generic dashboard.

Binding decisions:

- KEEP the modular-monolith backend and server authority.
- KEEP correct publication, assessment, access, human-review, revision, provenance and audit boundaries.
- REBUILD Admin information architecture and route ownership.
- REBUILD giant workspaces incrementally into pages/features/workflows.
- MOVE AI authoring/application into contextual workflows.
- SPLIT individual Student support from bulk access-code management.
- FOLD Governance into Operations/Diagnostics.
- KEEP technical IDs/raw provider/runtime/storage/database details advanced-only.
- ADD thin backend use-case commands only when the UI is otherwise forced to understand pipeline internals.
- DO NOT mirror database tables or create a generic admin framework.
- DO NOT break or overwrite the parallel Student/audit workstream.

## 1. Real Super Admin responsibilities

1. Maintain curriculum hierarchy and lesson scope.
2. Ingest lesson content and understand processing/review/readiness/publication/failure state.
3. Review OCR/source evidence.
4. Review AI output and approve/reject/edit it without provider/runtime knowledge.
5. Maintain question lifecycle and provenance.
6. Maintain quiz lifecycle/composition/versioning.
7. Search a student and understand access/device/recovery state.
8. Manage bulk access codes separately from individual support.
9. See operational/review failures needing intervention.
10. Inspect audit evidence for sensitive operations.

## 2. Target information architecture

Primary areas:

1. **نظرة عامة** — `/app`
2. **المحتوى التعليمي** — `/app/curriculum`, `/app/content`, `/app/reviews/...`
3. **الأسئلة والاختبارات** — `/app/questions`, `/app/quizzes`
4. **الطلاب والوصول** — `/app/students`, `/app/access-codes`
5. **التشغيل** — `/app/operations`, `/app/operations/audit`, `/app/operations/diagnostics`

Entity routes are workflow-owned, including `/app/questions/:questionId`. Create/Edit/View/Review/History are not sidebar destinations.

## 3. Data visibility rules

**Normal UI:** human names/titles, curriculum context, localized status, review/publication state, actionable failure cause, student access/device/recovery state, question/quiz/AI content.

**Contextual:** source/page evidence and revision/event history.

**Advanced only:** UUIDs, revision IDs, job/unit/output IDs, provider/model/routing/tokens/cost, storage paths, MIME/hashes, raw JSON and technical error codes.

## 4. Frontend architecture rules

Target feature boundaries:

```text
src/admin/
  shell/
  overview/
  curriculum/
  content/
  reviews/
  questions/
  quizzes/
  students/
  access-codes/
  operations/
  shared/
  api/
  view-models/
```

Rules:

- route owns page;
- feature owns workflow state;
- adapters translate server contracts;
- no component owns list + create + edit + review + history simultaneously;
- server state remains server-owned;
- deep links are mandatory;
- legacy workspaces may remain only as temporary parity adapters while replacement ownership is executable and verified.

## 5. Roadmap

- **AR-01 — Architecture baseline + route-driven shell** — DONE / VERIFIED.
- **AR-02 — Overview + Operations split** — DONE / VERIFIED.
- **AR-03 — Curriculum** — DONE / VERIFIED.
- **AR-04 — Content + OCR** — DONE / VERIFIED.
- **AR-05 — Reviews + AI** — DONE / VERIFIED.
- **AR-06 — Question Bank** — DONE / VERIFIED.
- **AR-07 — Quiz Builder** — NEXT / NOT STARTED.
- **AR-08 — Students + Access Codes** — NOT STARTED.
- **AR-09 — Cleanup + architecture enforcement** — NOT STARTED.
- **AR-10 — A11y/RTL/performance/visual QA** — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 6. Verified closure checkpoints

### AR-05

Exact checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.

- Frontend `34729512441` — SUCCESS.
- Admin AI `34729512433` — SUCCESS.
- Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank

The final structure is intentionally split by responsibility:

- `/app/questions` → focused list/filter/pagination;
- `/app/questions/:questionId` → detail/edit/review/history/approved regeneration;
- `/app/questions/manage` → focused Manual Create + Approved AI Import;
- canonical lifecycle/revision/review/publication/provenance/idempotency authority remains PostgreSQL/API-owned.

Execution ledger:

- Batch 1 route-owned detail — `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.
- Batch 2A focused list — `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`.
- Batch 2B route-owned edit — `43162f9b4f0468af96ae726f16054a868aff605a`.
- Batch 2C approved regeneration — `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`.
- Batch 2D routed PostgreSQL/Chromium ownership — `424bb1054fbd1a21991aa937be0f4338e08c7f09`.
  - Stage 13F Question Bank `34736985564` — SUCCESS.
  - Stage 13F Admin Question Bank `34736985648` — SUCCESS.
- Batch 2E focused create/import — `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`.
  - Frontend `34739142677` — SUCCESS.
  - Combined `34739142686` — SUCCESS.
- Batch 2F legacy cleanup/final closure — `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`.

### AR-06 Batch 2F closure details

#### State received

- Canonical status/log/workstream were read before mutation.
- Feature documentation HEAD received as `a87c3340ca121eb6973d84090d5f0bcacc1e0c9e`.
- Draft PR #52 remained Draft.
- Prior Batch 2E was already verified; no active earlier code batch was bypassed.
- Live `main` was re-read and left untouched; final read before closure was `343ff1fd7b3d64d7e990b72606695365f520fa58`.

#### Inspection and classification

Actual production routing showed:

- `QuestionBankListPage` owns `/app/questions`;
- `QuestionBankCreatePage` owns `/app/questions/manage`;
- `QuestionBankDetailPage` owns `/app/questions/:questionId`.

The old `QuestionBankWorkspace.tsx` therefore duplicated responsibilities already migrated behind executable route owners.

- **KEEP:** list/detail/create pages and focused `/app/questions/manage` create/import route.
- **KEEP:** backend/PostgreSQL question lifecycle, revision, review, publication, validation, provenance and idempotency authority.
- **REMOVE:** orphaned legacy `apps/admin-web/src/QuestionBankWorkspace.tsx`.
- **NO CHANGE:** migrations, backend business rules, Student/audit work.

#### Implementation

`02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`

- deleted only `apps/admin-web/src/QuestionBankWorkspace.tsx`;
- did not change normal routing/navigation;
- retained `/app/questions/manage` because it is a valid focused create/import workflow rather than dead architecture.

#### Final exact code-head verification

On `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`:

- Stage 13E Frontend Preparation `34740148367` — **SUCCESS**: lint, strict typecheck, unit tests, production build.
- Stage 13E Admin AI Operations `34740148382` — **SUCCESS**: API quality, clean PostgreSQL migrations/contracts, authorization/observability/review/control and wider security regressions.
- Stage 13E Combined Integration `34740148361` — **SUCCESS**: API/Admin quality, clean PostgreSQL, DB contract, backend authority/security regressions, deterministic fixtures and real Admin Chromium.

No hidden import/test dependency remained after the deletion. AR-06 is therefore **DONE / VERIFIED**.

## 7. Explicit next handoff — AR-07 only

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI before mutation.
3. AR-06 closure documentation commits follow verified code head `02cf24d5…`; inspect any workflows they trigger before changing code.
4. Do not reopen AR-06 without a real regression.
5. Start **AR-07 — Quiz Builder only**.
6. Inventory actual quiz migrations/schema/integrity contracts, API routes/services/use-cases, `QuizBuilderWorkspace`/related frontend surfaces, metadata route, tests and real Chromium coverage before editing.
7. Classify each area KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE. Do not assume the existing frontend composition is the desired product architecture.
8. Preserve quiz lifecycle/composition/versioning/publication/business authority and question references under server authority.
9. Prefer route/entity/workflow ownership over a giant workspace; add thin backend use-case commands only if the UI is otherwise forced to understand pipeline/database internals.
10. Use small reviewable batches and require exact-head lint/typecheck/unit/build + clean PostgreSQL/API authority regressions + real Chromium proof before AR-07 closure.
11. Do not start AR-08 before AR-07 is verified and documented.
12. Keep PR #52 Draft; no automatic merge.

## 8. Quality gate for every remaining stage

- lint;
- strict typecheck;
- unit tests;
- production build;
- clean PostgreSQL migrations/contracts where relevant;
- backend authority/security regressions;
- real Chromium flows;
- responsive/no-overflow evidence for changed surfaces;
- final exact-head matrix before stage closure.

Acceptance remains:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.