# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 exact-head CI pending.**

Branch: `rebuild/super-admin-foundation`

Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`

Latest live `main` direct branch read before AR-07 Batch 1: `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.

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
- **AR-07 — Quiz Builder** — ACTIVE / Batch 1 IN VERIFICATION.
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

## 7. AR-07 — Quiz Builder — active execution checkpoint

### Source-of-truth inventory completed before Batch 1

The branch handoff received was `ea6c0a07fddeaf0a219440cca277e68f7fa9587b`; live `main` was re-read at `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`, and Draft PR #52 remained Draft.

Inspected frontend owners/contracts:

- `QuizBuilderWorkspace.tsx` currently combines list, create, detail, version composition/editing, lifecycle and export.
- `quiz-builder-api.ts` already separates list/detail/candidates/create/update/version/lifecycle/export server commands.
- `/app/quizzes` previously routed directly to the giant workspace; `/app/quizzes/metadata` remains an auxiliary focused route.

Inspected backend/executable authority:

- `apps/api/src/quiz-builder/http.ts` and `service.ts` remain authoritative.
- `apps/api/tests/integration/quiz-builder.integration.test.ts` proves that only published Question Bank revisions can enter quiz versions; stored quiz questions are frozen snapshots; reviewed/published export obeys server lifecycle; published versions reject mutation; database integrity enforces snapshot immutability.

Classification:

- **KEEP:** server lifecycle, Question Bank revision linkage, snapshot immutability and export rules.
- **KEEP TEMPORARILY:** legacy `QuizBuilderWorkspace.tsx` as a parity adapter while responsibilities migrate.
- **REFACTOR:** list ownership into a focused route/page first.
- **NEXT:** route-owned detail/management decomposition and explicit browser deep-link parity after Batch 1 verification.
- **NO CHANGE:** PostgreSQL/API business rules and Student workstream in this batch.

### Batch 1 implementation

- `7746000748129a659e098e016d3ffbfd4d5ddc46` — added `apps/admin-web/src/admin/quizzes/QuizBuilderListPage.tsx`, with server-backed list/search/status filter/pagination and resilient loading/error/empty states.
- `30d9443ed1c159440d38dc76db61686028c3d028` — `/app/quizzes` now owns the focused list; the existing all-capabilities workspace moved to `/app/quizzes/manage` as a temporary parity-preserving route; metadata and AI related actions remain available.
- No migrations, backend business rules or Student code changed.

### Batch 1 verification state

Exact code head: `30d9443ed1c159440d38dc76db61686028c3d028`.

- Stage 13E Frontend Preparation `34741455324` — **IN PROGRESS** at the documented checkpoint.
- Stage 13E Admin AI Operations `34741455298` — **PENDING** at the documented checkpoint.
- Stage 13E Combined Integration `34741455320` — **PENDING** at the documented checkpoint.

No second code batch was started while those runs remained active. Batch 1 is **NOT YET VERIFIED**.

## 8. Explicit next handoff — AR-07 only

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI before mutation.
3. Documentation commits follow code head `30d9443e…`; reconcile runs `34741455324`, `34741455298`, `34741455320` plus any newer documentation-only exact-head runs before editing code.
4. If a code-head run fails, inspect its failing job/log and fix root cause only; do not weaken tests or preserve a stale giant-workspace assumption at the cost of the route architecture.
5. If green, mark AR-07 Batch 1 VERIFIED.
6. Continue **AR-07 only**: split entity/detail/management ownership and add explicit list→entity/deep-link real Chromium parity while keeping lifecycle/version/export authority server-owned.
7. Use small reviewable batches; keep the legacy workspace only as long as it owns legitimate unmigrated capability.
8. Do not start AR-08 before AR-07 exact-head green and synchronized documentation.
9. Keep PR #52 Draft; no automatic merge.

## 9. Quality gate for every remaining stage

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