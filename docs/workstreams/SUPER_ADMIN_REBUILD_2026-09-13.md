# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-06 Question Bank in progress. AR-01 through AR-05 are DONE / VERIFIED. AR-06 Batch 2E is VERIFIED.**

Branch: `rebuild/super-admin-foundation`

Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`

Latest live `main` direct branch read before Batch 2E: `43be0bfddf6709318912a219b818b35e71d7f9a4`.

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
- **AR-06 — Question Bank** — ACTIVE / Batch 2E VERIFIED.
- **AR-07 — Quiz Builder** — NOT STARTED by this workstream.
- **AR-08 — Students + Access Codes** — NOT STARTED.
- **AR-09 — Cleanup + architecture enforcement** — NOT STARTED.
- **AR-10 — A11y/RTL/performance/visual QA** — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 6. Verified closure checkpoints before AR-06

### AR-05

Exact checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.

- Frontend `34729512441` — SUCCESS.
- Admin AI `34729512433` — SUCCESS.
- Combined `34729512404` — SUCCESS.

## 7. AR-06 execution ledger

### Batch 1 — route-owned detail — VERIFIED

`/app/questions/:questionId` owns canonical detail/review/history while server lifecycle commands remain unchanged.

Verified code head: `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.

### Batch 2A — focused list + default entity routing — VERIFIED

`/app/questions` owns focused list/filter/pagination and routes to durable entity detail.

Verified code head: `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`.

### Batch 2B — route-owned current-revision editor — VERIFIED

Edit ownership moved to `QuestionBankDetailPage`; existing API/PostgreSQL revision authority and history stayed canonical.

Verified code head: `43162f9b4f0468af96ae726f16054a868aff605a`.

### Batch 2C — route-owned approved regeneration — VERIFIED

Approved regeneration moved to the entity route while approval/provenance/source/current-published-revision/idempotency authority remained server-owned.

Verified code head: `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`.

### Batch 2D — explicit routed Question Bank Chromium ownership — VERIFIED

Real PostgreSQL/API/Chromium verifies list→detail, direct deep-link, edit, review/publish/reject, regeneration, create/import parity, provenance, session expiry and responsive behavior.

Verified code head: `424bb1054fbd1a21991aa937be0f4338e08c7f09`.

- Stage 13F Question Bank `34736985564` — SUCCESS.
- Stage 13F Admin Question Bank `34736985648` — SUCCESS.

### Batch 2E — focused Manual Create + Approved AI Import ownership — VERIFIED

#### State received

- Canonical status/log/workstream read before mutation.
- Feature HEAD received as `c7c57905b603b017f915a73bf402566016f24ac9`.
- Live `main` direct read: `43be0bfddf6709318912a219b818b35e71d7f9a4`.
- Draft PR #52 confirmed Draft.
- Prior exact-head work was reconciled before editing.
- `QuestionBankWorkspace.tsx`, focused list/detail routes, `App.tsx`, `question-bank-api.ts`, existing E2E and backend structure were inspected.

#### Classification

- **KEEP:** PostgreSQL/API question lifecycle, revisions, publication, provenance, manual-create and approved-import authority.
- **KEEP:** existing validation and curriculum-scope semantics.
- **REFACTOR:** create/import ownership out of the giant workspace.
- **IMPROVE:** single-purpose create/import page and explicit loading/error/success handling.
- **KEEP temporarily:** legacy source file only until dead/duplicate references are proven removable.
- **NO CHANGE:** migrations, backend lifecycle/business rules, Student/audit code.

#### Implementation

`5e2bbcb8e402927b6e5b3b43b6f9464b577ede62`

- added `apps/admin-web/src/admin/questions/QuestionBankCreatePage.tsx`;
- owns only manual creation and approved AI import;
- loads curriculum context and supports class/subject/lesson scope;
- preserves multiple-choice, true/false and direct-answer validation/normalization;
- preserves replay/success/error behavior from canonical API commands;
- respects Admin session expiry.

`0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`

- changed `/app/questions/manage` to render `QuestionBankCreatePage`;
- giant `QuestionBankWorkspace.tsx` no longer owns the production route;
- no legacy deletion was mixed into the ownership move.

#### Exact-head verification

On `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`:

- Stage 13E Frontend Preparation `34739142677` — **SUCCESS**: lint, strict typecheck, unit tests, production build.
- Stage 13E Combined Integration `34739142686` — **SUCCESS**: API/Admin quality, clean PostgreSQL migrations/contracts, authority/security regressions, deterministic fixtures and real Admin Chromium.
- Existing browser manual-create and approved-AI-import/provenance scenarios now hit the focused page because the manager route resolves to the new owner.

#### Batch 2E conclusion

Focused create/import ownership is verified. AR-06 remains ACTIVE because legacy source cleanup and final route/architecture closure are intentionally a separate batch.

## 8. Explicit next handoff

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI before mutation.
3. Documentation commits after code head `0d9b84a4…` may have triggered new runs; inspect those first and do not start a parallel batch while they are active.
4. Continue **AR-06 only**; do not start AR-07.
5. Search actual imports/routes/tests for `QuestionBankWorkspace.tsx` and `/app/questions/manage`.
6. Remove dead/duplicate legacy list/detail/edit/review/regeneration/create/import ownership only after proving no valid path depends on it.
7. Decide from workflow evidence whether `/app/questions/manage` should remain the focused create/import route. Do not remove it merely to reduce files.
8. If cleanup changes routing/navigation, update real Chromium coverage.
9. Close AR-06 only on final exact-head Frontend + API/PostgreSQL/Chromium green and synchronized documentation.
10. Keep PR #52 Draft; no automatic merge.

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