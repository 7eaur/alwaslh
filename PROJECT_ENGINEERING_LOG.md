# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-05 verified; AR-06 Batch 2E focused create/import ownership verified; AR-06 remains ACTIVE.**

## Project and authority invariants

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- AI never auto-publishes Student content/questions.
- Human review remains mandatory where contracts require it.
- Published/revision/audit/provenance authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.

## Binding Admin architecture decisions

- **AD-ADMIN-001:** primary work is route-owned and deep-linkable.
- **AD-ADMIN-002:** Overview is attention-first.
- **AD-ADMIN-003:** Operations owns Health/Audit/Diagnostics; Governance is not a normal workspace.
- **AD-ADMIN-004:** technical IDs/provider/runtime/storage/hash/raw JSON are advanced-only.
- **AD-ADMIN-005:** content publication belongs to lesson content, not ingestion-task identity.
- **AD-ADMIN-006:** OCR review requires visible source evidence.
- **AD-ADMIN-007:** removing legacy/parity UI must not remove legitimate capability.
- **AD-ADMIN-008:** approved AI output is applied contextually under server authority.
- **AD-ADMIN-009:** `/app/questions/:questionId` owns canonical Question Bank entity detail/review/history.
- **AD-ADMIN-010:** Question Bank migration is parity-first; capabilities move only with executable proof.
- **AD-ADMIN-011:** question editing is entity-owned while revision authority stays server-side.
- **AD-ADMIN-012:** approved question regeneration is entity-owned while approval/provenance/idempotency stay server-side.
- **AD-ADMIN-013:** routed Question Bank ownership requires real PostgreSQL + Chromium proof.
- **AD-ADMIN-014:** manual question creation and approved-AI import are focused creation-flow responsibilities, not responsibilities of a giant list/detail/review workspace.

## Super Admin stage ledger

### AR-01 — DONE / VERIFIED
Route-driven shell/deep links and task-oriented navigation.

### AR-02 — DONE / VERIFIED
Attention-first Overview and Operations split.

### AR-03 — DONE / VERIFIED
Curriculum domain preserved; giant composition decomposed and browser-verified.

### AR-04 — DONE / VERIFIED
OCR/source evidence, lesson-owned publication and contextual legitimate authoring/export capabilities.

Verified checkpoint: `ba74c17902827805d6be0ab91c0ff384fc3e2530`.

### AR-05 — DONE / VERIFIED
Content-first AI review, contextual apply/import, preserved review/provenance/idempotency authority and browser-proven histories/application behavior.

Verified checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.

Runs: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

## AR-06 — Question Bank — ACTIVE

### Batch 1 — route-owned detail — VERIFIED

Verified head `1677770dc6402e4b2825c1b8dd50f546fdf74d0c` established `/app/questions/:questionId` with canonical detail/review/history while existing API lifecycle commands remained authoritative.

### Batch 2A — routed focused list — VERIFIED

Verified head `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac` made `/app/questions` the normal list/filter/pagination surface and routed cards to entity detail.

### Batch 2B — route-owned edit — VERIFIED

Verified head `43162f9b4f0468af96ae726f16054a868aff605a` moved current-revision edit UX into entity detail while preserving revision history and review-state restrictions.

### Batch 2C — route-owned approved regeneration — VERIFIED

Verified head `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e` moved approved regeneration to the entity route while keeping approval/provenance/source/current-published-revision/idempotency authority in the existing backend command.

### Batch 2D — explicit routed Chromium ownership — VERIFIED

Verified head `424bb1054fbd1a21991aa937be0f4338e08c7f09` added executable evidence for list→detail, direct deep-link, edit, submit-review/reject/publish, approved regeneration, provenance, session expiry, responsive width and Quiz Builder regression safety.

- Stage 13F Question Bank `34736985564` — SUCCESS.
- Stage 13F Admin Question Bank `34736985648` — SUCCESS.

### Batch 2E — focused Manual Create + Approved AI Import ownership — VERIFIED

#### State received from A/shared handoff

1. Read `PROJECT_STATUS.md`, this engineering log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Re-fetched `rebuild/super-admin-foundation`; received HEAD was `c7c57905b603b017f915a73bf402566016f24ac9`.
3. Re-fetched live `main`; direct branch read reported `43be0bfddf6709318912a219b818b35e71d7f9a4`.
4. Confirmed Draft PR #52 remained Draft.
5. Re-checked the received-head CI and confirmed the prior AR-06 Batch 2D documentation checkpoint was not hiding an active code batch.
6. Read the actual frontend/backend contracts before editing: `QuestionBankWorkspace.tsx`, `QuestionBankListPage.tsx`, `App.tsx`, `question-bank-api.ts`, existing Stage13F Question Bank browser coverage, and relevant API/service structure.

#### Finding and classification

The backend/domain did **not** need CRUD/schema work. Existing `createManualQuestion` and `importApprovedAiQuestions` already route through the canonical authenticated API/PostgreSQL contracts.

- **KEEP:** API/PostgreSQL lifecycle, manual-create and approved-import authority.
- **KEEP:** question validation semantics and curriculum scope requirements.
- **REFACTOR:** create/import ownership out of `QuestionBankWorkspace.tsx`.
- **IMPROVE:** single-purpose create/import loading/error/success composition.
- **KEEP temporarily:** legacy workspace source file until all duplicate/dead references are proven removable.
- **NO CHANGE:** migrations, API lifecycle rules, Student workstream.

#### Implementation

1. `5e2bbcb8e402927b6e5b3b43b6f9464b577ede62` — created `apps/admin-web/src/admin/questions/QuestionBankCreatePage.tsx`.
   - owns only manual question creation and approved AI import;
   - loads curriculum context;
   - preserves class/subject/lesson scope requirements;
   - preserves multiple-choice/true-false/direct-answer validation and normalization;
   - preserves API success/replay/error semantics;
   - handles session expiry through the normal Admin session boundary.
2. `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee` — updated `App.tsx` so `/app/questions/manage` renders `QuestionBankCreatePage` instead of the giant legacy workspace.
3. Existing browser-visible labels and form semantics were intentionally preserved so the already-real Chromium manual-create/import flows validate replacement ownership instead of silently losing coverage.
4. No cleanup/deletion of `QuestionBankWorkspace.tsx` was mixed into this batch; replacement was verified first.

#### Exact-head verification

Code head: `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`.

- Stage 13E Frontend Preparation `34739142677` — **SUCCESS**.
  - lint — success;
  - strict typecheck — success;
  - unit tests — success;
  - production build — success.
- Stage 13E Combined Integration `34739142686` — **SUCCESS**.
  - API/Admin quality gates — success;
  - clean PostgreSQL migrations — success;
  - Stage13E DB contract — success;
  - backend authority regressions — success;
  - Stage12/Auth security regressions — success;
  - deterministic browser fixture — success;
  - real Admin Chromium suite — success.

Because `/app/questions/manage` now resolves to the new focused page, the existing real browser scenarios for **manual create** and **approved AI import + provenance** execute against the new owner and remained green.

#### Decision after verification

Batch 2E is **VERIFIED**. AR-06 remains **ACTIVE** because source cleanup/final ownership closure has not yet been performed. Starting AR-07 now would be premature.

## Explicit resume point for A / next Admin task

1. Read `PROJECT_STATUS.md`, this log and the Super Admin workstream first.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Documentation commits after code head `0d9b84a4…` may have triggered CI; close/inspect those before mutating code.
4. Continue **AR-06 only**.
5. Search all imports/routes/tests for `QuestionBankWorkspace.tsx` and `/app/questions/manage`.
6. Remove dead/duplicate legacy list/detail/edit/review/regeneration/create/import composition only after proving no valid production/test capability depends on it.
7. Decide from product workflow evidence whether `/app/questions/manage` remains the focused create/import route or should be replaced contextually; do not delete a useful route merely to reduce files.
8. If route ownership changes, update Chromium assertions accordingly.
9. Require final exact-head Frontend + PostgreSQL/API/Chromium green before closing AR-06.
10. Only after documented AR-06 closure proceed to AR-07.
11. Keep PR #52 Draft; no automatic merge.

## Current audit/findings register

| ID | Severity | Area | Problem | Status |
|---|---:|---|---|---|
| `ADMIN-001` | P1 | Admin IA | no durable route ownership | FIXED / AR-01 |
| `ADMIN-002` | P1 | Overview | generic metrics vs attention | FIXED / AR-02 |
| `ADMIN-003` | P1 | Curriculum | giant composition | FIXED / AR-03 |
| `ADMIN-004` | P1 | Content publication | task-ID-coupled UI | FIXED / AR-04 |
| `ADMIN-005` | P1 | OCR review | missing visible evidence | FIXED / AR-04 |
| `ADMIN-006` | P1 | AI review | pipeline internals in normal UX | FIXED / AR-05 |
| `ADMIN-007` | P1 | AI authoring | manual internal-ID handoff | FIXED / AR-05 |
| `ADMIN-008` | P1 | Question Bank | list/create/edit/review/history in one giant owner | IN PROGRESS / AR-06; route detail/edit/regeneration/create/import ownership verified; cleanup/final closure remains |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-06 cleanup/final exact-head closure → AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

No later AR stage starts before the current stage is verified and documented. PR #52 remains Draft.