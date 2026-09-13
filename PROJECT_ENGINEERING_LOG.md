# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 VERIFIED.**

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
- **AD-ADMIN-015:** a legacy workspace is removed once all production route ownership has moved and exact-head compile/API/PostgreSQL/real-browser gates prove no hidden dependency remains.
- **AD-ADMIN-016:** Quiz Builder migration is parity-first: server-owned lifecycle, published-question revision references, immutable published snapshots and export constraints must survive frontend decomposition unchanged.
- **AD-ADMIN-017:** Quiz Builder list ownership is route-owned independently from entity/version/lifecycle management; legacy management may remain only as a temporary parity adapter until entity/deep-link ownership is executable and verified.

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

## AR-06 — Question Bank — DONE / VERIFIED

### Previously verified ownership batches

- Batch 1 route-owned detail — `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.
- Batch 2A focused list/entity routing — `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`.
- Batch 2B route-owned edit — `43162f9b4f0468af96ae726f16054a868aff605a`.
- Batch 2C route-owned approved regeneration — `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`.
- Batch 2D explicit routed Chromium ownership — `424bb1054fbd1a21991aa937be0f4338e08c7f09`.
  - Stage 13F Question Bank `34736985564` — SUCCESS.
  - Stage 13F Admin Question Bank `34736985648` — SUCCESS.
- Batch 2E focused Manual Create + Approved AI Import — `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`.
  - Frontend `34739142677` — SUCCESS.
  - Combined `34739142686` — SUCCESS.

### Batch 2F — legacy ownership cleanup + AR-06 closure — VERIFIED

#### State received

1. Re-read `PROJECT_STATUS.md`, this engineering log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Received feature documentation HEAD `a87c3340ca121eb6973d84090d5f0bcacc1e0c9e`; prior Batch 2E was documented/verified and AR-06 was the only open Admin stage.
3. Re-read live `main`; the Student track had advanced independently. Final live-main read before closure was `343ff1fd7b3d64d7e990b72606695365f520fa58`. No Student/audit code was modified or rebased into this batch.
4. Confirmed Draft PR #52 remained Draft.
5. Inspected current exact routes and owners instead of trusting the old workspace filename.

#### Inspection and classification

Actual `App.tsx` routing proved:

- `/app/questions` → `QuestionBankListPage`;
- `/app/questions/manage` → `QuestionBankCreatePage`;
- `/app/questions/:questionId` → `QuestionBankDetailPage`.

`QuestionBankCreatePage` already owned the focused Manual Create + Approved AI Import flow. The routed detail page already owned entity detail/edit/review/history/regeneration. `QuestionBankWorkspace.tsx` was therefore no longer a production route owner or required parity adapter.

Classification:

- **KEEP:** `QuestionBankListPage`, `QuestionBankDetailPage`, `QuestionBankCreatePage`.
- **KEEP:** `/app/questions/manage` because it remains a useful focused create/import route; it was not removed merely to reduce routes.
- **KEEP:** PostgreSQL/API lifecycle, revisions, publication, review, provenance, validation and idempotency authority.
- **REMOVE:** orphaned `apps/admin-web/src/QuestionBankWorkspace.tsx` because it duplicated migrated responsibilities and had no production route ownership.
- **NO CHANGE:** migrations, API business rules, Student/audit workstream.

#### Implementation

- `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1` — deleted `apps/admin-web/src/QuestionBankWorkspace.tsx` only.
- No route or navigation semantics changed in this cleanup batch, so existing real Chromium Question Bank scenarios remained the correct executable parity proof.

#### Exact-head verification

On code head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`:

- Stage 13E Frontend Preparation `34740148367` — **SUCCESS**.
- Stage 13E Admin AI Operations `34740148382` — **SUCCESS**.
- Stage 13E Combined Integration `34740148361` — **SUCCESS**.

No hidden import dependency surfaced after deletion; compile/build and the full real-browser integration matrix stayed green.

#### AR-06 closure decision

AR-06 is **DONE / VERIFIED**. The giant Question Bank owner is gone, valid capabilities are owned by focused routes, server authority was preserved, and the final routed structure is green on exact code-head.

## AR-07 — Quiz Builder — ACTIVE

### Batch 1 — focused list ownership + parity-preserving management route — VERIFIED

#### State received

1. Read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before editing.
2. Feature HEAD was `ea6c0a07fddeaf0a219440cca277e68f7fa9587b`, an explicit documentation handoff to AR-07; AR-06 was already closed.
3. Re-read live `main` at `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`; no Student/audit files were changed.
4. Draft PR #52 remained Draft.
5. Exact-head transition workflows had no unresolved code blocker before AR-07 inventory began.

#### Inventory / source-of-truth findings

Frontend:

- `QuizBuilderWorkspace.tsx` still owned list + create + detail + version editor + lifecycle + export in one component.
- `quiz-builder-api.ts` already exposed focused server commands/read models (`fetchQuizzes`, `fetchQuiz`, candidate lookup, create/update, version add/replace/remove, submit/reject/publish/archive, export).
- `/app/quizzes` previously pointed directly to the giant workspace; `/app/quizzes/metadata` was already separate.

Backend/executable contracts inspected:

- `apps/api/src/quiz-builder/http.ts` and `service.ts` retain lifecycle/business authority.
- `apps/api/tests/integration/quiz-builder.integration.test.ts` proves that Quiz Builder accepts only published Question Bank revisions, snapshots referenced questions into quiz versions, allows export only in valid lifecycle states, freezes published versions, and relies on database integrity to reject mutation of frozen snapshots.

Classification:

- **KEEP:** PostgreSQL/API lifecycle, question-revision linkage, published snapshot immutability, export authority.
- **KEEP TEMPORARILY:** `QuizBuilderWorkspace.tsx` as a parity adapter while responsibilities move.
- **REFACTOR:** list ownership out of the giant workspace.
- **NEXT REFACTOR:** route-owned entity/detail and creation/version management after list parity is verified.
- **NO CHANGE:** backend business rules, migrations and Student workstream in Batch 1.

#### Implementation

- `7746000748129a659e098e016d3ffbfd4d5ddc46` — created `apps/admin-web/src/admin/quizzes/QuizBuilderListPage.tsx` with server-backed search/status filtering, pagination, loading/error/empty states and entry into the management workflow.
- `30d9443ed1c159440d38dc76db61686028c3d028` — routed `/app/quizzes` to the focused list and moved the existing all-capabilities workspace to `/app/quizzes/manage` as an explicit temporary parity-preserving route.
- No quiz API, migration, lifecycle or Student code changed.

#### First exact-head failure and root cause

Initial Stage 13E Frontend Preparation run `34741455324` failed during strict TypeScript checking, while lint had already passed. The failure was local to `QuizBuilderListPage.tsx`: inside the render branch where `state` was already narrowed to `"ready"`, two pagination-button expressions still compared `state === "loading"`, producing `TS2367` impossible-comparison errors.

Decision:

- do **not** revert route ownership;
- do **not** weaken TypeScript or tests;
- do **not** change backend/business behavior;
- remove only the impossible comparisons because the branch cannot be loading by construction.

`18607a1bf31392f9143a0e68c4531c972d4199d5` — root-cause fix: pagination buttons now depend only on `canPrevious` / `canNext` after the render-state narrowing.

#### Exact-head verification

On exact code head `18607a1bf31392f9143a0e68c4531c972d4199d5`:

- Stage 13E Frontend Preparation `34741610234` — **SUCCESS**: lint, strict typecheck, unit tests and production build.
- Stage 13E Admin AI Operations `34741610225` — **SUCCESS**: API quality, clean PostgreSQL migrations/contracts, authorization/observability/review/security regressions.
- Stage 13E Combined Integration `34741610238` — **SUCCESS**: API/Admin quality, clean PostgreSQL, DB contract, backend authority/security regressions, deterministic fixtures and real Admin Chromium.

The real Chromium suite stayed green after the list split, so Batch 1 is **VERIFIED**. AR-07 itself remains ACTIVE because entity/detail/version/lifecycle/export ownership is not yet fully decomposed.

## Explicit resume point for A / next Admin task

1. Re-read `PROJECT_STATUS.md`, this log and the Super Admin workstream first.
2. Fetch current branch HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Documentation commits follow verified code head `18607a1bf31392f9143a0e68c4531c972d4199d5`; reconcile any documentation-only CI still ACTIVE before editing code.
4. Continue **AR-07 only — Batch 2**: establish route-owned quiz entity/detail/management behavior and explicit list→entity/deep-link ownership.
5. Preserve server authority for lifecycle, version snapshots, published Question Bank revision eligibility and export constraints.
6. Add or update real Chromium coverage for `/app/quizzes` → entity/deep-link behavior. Do not revert the route split to satisfy stale giant-workspace assumptions.
7. Keep `QuizBuilderWorkspace.tsx` only while it owns legitimate unmigrated create/version/lifecycle/export capability; remove/split it only after replacement ownership is executable and verified.
8. Do not start AR-08 until AR-07 is fully exact-head green and closure documentation is synchronized.
9. Keep PR #52 Draft; no automatic merge.

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
| `ADMIN-008` | P1 | Question Bank | list/create/edit/review/history in one giant owner | FIXED / AR-06 |
| `ADMIN-009` | P1 | Quiz Builder | list/create/detail/version/lifecycle/export in one giant owner | ACTIVE / AR-07; list ownership FIXED in Batch 1 |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

No later AR stage starts before the current stage is verified and documented. PR #52 remains Draft.