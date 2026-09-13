# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 + Batch 2A + Batch 2B + Batch 2C VERIFIED.**

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
- **AD-ADMIN-003:** Operations owns Health/Audit/Diagnostics.
- **AD-ADMIN-004:** technical IDs/provider/runtime/storage/hash/raw JSON are advanced-only.
- **AD-ADMIN-005:** content publication belongs to lesson content, not ingestion-task identity.
- **AD-ADMIN-006:** OCR review requires visible source evidence.
- **AD-ADMIN-007:** removing legacy/parity UI must not remove legitimate capability.
- **AD-ADMIN-008:** approved AI output is applied contextually under server authority.
- **AD-ADMIN-009:** `/app/questions/:questionId` owns canonical Question Bank entity detail/review/history.
- **AD-ADMIN-010:** Question Bank migration is parity-first.
- **AD-ADMIN-011:** question editing is entity-owned while revision authority stays server-side.
- **AD-ADMIN-012:** approved question regeneration is entity-owned while approval/provenance/idempotency stay server-side.
- **AD-ADMIN-013:** routed Question Bank ownership requires real PostgreSQL + Chromium proof.
- **AD-ADMIN-014:** manual question creation and approved-AI import are focused creation-flow responsibilities.
- **AD-ADMIN-015:** legacy workspaces are removed only after executable replacement parity.
- **AD-ADMIN-016:** Quiz Builder decomposition must preserve server-owned lifecycle, published-question revision references, immutable published snapshots and export constraints.
- **AD-ADMIN-017:** Quiz Builder list ownership is route-owned independently from entity/version/lifecycle management.
- **AD-ADMIN-018:** `/app/quizzes/:quizId` is the canonical quiz entity overview/deep link. The legacy management workspace may remain temporarily only for responsibilities not yet migrated.
- **AD-ADMIN-019:** Quiz lifecycle and lifecycle-gated export belong to the canonical quiz entity route while API/PostgreSQL remain the authority for state transitions, immutable snapshots and export eligibility.
- **AD-ADMIN-020:** Quiz route ownership is not considered verified by a generic browser suite; list→entity and direct `/app/quizzes/:quizId` behavior require explicit real Chromium evidence.
- **AD-ADMIN-021:** draft quiz version composition/editing belongs to `/app/quizzes/:quizId`; candidate eligibility and mutation validity remain server-owned. Browser tests must follow the new entity ownership rather than preserve retired legacy navigation.

## Super Admin stage ledger

### AR-01 — DONE / VERIFIED
Route-driven shell/deep links and task-oriented navigation.

### AR-02 — DONE / VERIFIED
Attention-first Overview and Operations split.

### AR-03 — DONE / VERIFIED
Curriculum domain preserved; giant composition decomposed and browser-verified.

### AR-04 — DONE / VERIFIED
OCR/source evidence, lesson-owned publication and contextual authoring/export.

### AR-05 — DONE / VERIFIED
Content-first AI review and contextual application while server review/provenance/idempotency authority remained intact.

Checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; runs Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank — DONE / VERIFIED

Execution ledger:
- route-owned detail `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`;
- focused list `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`;
- route-owned edit `43162f9b4f0468af96ae726f16054a868aff605a`;
- approved regeneration `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`;
- routed PostgreSQL/Chromium ownership `424bb1054fbd1a21991aa937be0f4338e08c7f09`;
- focused create/import `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`;
- final legacy cleanup `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`.

Final runs on `02cf24d...`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.

## AR-07 — Quiz Builder — ACTIVE

### Batch 1 — focused list ownership — VERIFIED

#### Inventory and decision

`QuizBuilderWorkspace.tsx` owned list + create + detail + version editor + lifecycle + export. `quiz-builder-api.ts` already exposed focused reads/commands. Backend integration tests proved only published Question Bank revisions can enter quiz versions, quiz versions snapshot referenced questions, export is lifecycle-controlled and published snapshots reject mutation.

Classification:
- **KEEP:** PostgreSQL/API lifecycle, question-revision linkage, immutable snapshots and export authority.
- **KEEP TEMPORARILY:** giant workspace as parity adapter.
- **REFACTOR:** list first, then routed entity/management.
- **NO CHANGE:** backend rules/migrations/Student.

Implementation:
- `7746000748129a659e098e016d3ffbfd4d5ddc46` — focused list page.
- `30d9443ed1c159440d38dc76db61686028c3d028` — `/app/quizzes` list + temporary `/app/quizzes/manage` adapter.
- `18607a1bf31392f9143a0e68c4531c972d4199d5` — fixed strict TypeScript narrowing at root.

Verification on `18607a1...`:
- Frontend `34741610234` — SUCCESS.
- Admin AI `34741610225` — SUCCESS.
- Combined `34741610238` — SUCCESS.

### Batch 2A — route-owned entity overview + deep-link correction — VERIFIED

#### State received

1. Read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before editing.
2. Feature HEAD was documentation checkpoint `4a60954c8358edd073d8fe26fd6dafbd16ae8670`.
3. Its docs-only CI was reconciled before code: Admin AI `34741815805` SUCCESS; Combined `34741815816` SUCCESS.
4. Draft PR #52 remained Draft.
5. Live `main` had independently advanced to `343ff1fd7b3d64d7e990b72606695365f520fa58` through Student work. No Student/audit file was changed, merged or rebased into this Admin batch.

#### Root-cause finding

The focused list card navigated to `/app/quizzes/manage?quizId=<id>`, but the legacy `QuizBuilderWorkspace.tsx` did not consume URL search params or `quizId`. The list therefore looked entity-oriented but did not provide durable entity ownership/deep linking.

Decision:
- do not patch the giant workspace to read a hidden query parameter;
- create the canonical entity route `/app/quizzes/:quizId`;
- keep the new entity page read-focused in this batch;
- keep create/version/lifecycle/export in the adapter until each responsibility moves with proof;
- make no backend/migration/Student changes.

#### Implementation

- `3099648db1b1cf95d1af3c1d579e8f7972748006` — created `apps/admin-web/src/admin/quizzes/QuizBuilderDetailPage.tsx`. It reads the route param, calls canonical `fetchQuiz`, handles session/loading/error states and presents status, description, lesson scope, versions/question counts and lifecycle events.
- `1c5707ae089487811401368e4c048720a7b121cf` — changed list cards to `/app/quizzes/:quizId`.
- `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac` — registered `quizzes/:quizId` in `App.tsx` while preserving `/app/quizzes/manage` and metadata routes.

#### Exact-head verification

On exact code head `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`:
- Stage 13E Frontend Preparation `34742505009` — **SUCCESS**.
- Stage 13E Admin AI Operations `34742505020` — **SUCCESS**.
- Stage 13E Combined Integration `34742505015` — **SUCCESS**, including clean PostgreSQL/backend regressions and real Admin Chromium.

No lifecycle, version-snapshot, Question Bank eligibility, export, migration or Student rule changed. Batch 2A is therefore **VERIFIED**. AR-07 remains ACTIVE because create/version editing/lifecycle/export were still owned by the temporary legacy adapter.

### Batch 2B — route-owned lifecycle/export + explicit Quiz Builder Chromium — VERIFIED

#### State received from A / source reconciliation

1. Re-read repository continuity files, branch HEAD, live `main`, Draft PR #52 and exact-head CI before editing.
2. Re-inspected `QuizBuilderWorkspace.tsx` plus `quiz-builder-api.ts`; remaining legitimate legacy responsibilities were create, version composition/editing, lifecycle and export.

#### Decision and classification

- **KEEP:** server lifecycle commands, published Question Bank revision eligibility, immutable published version snapshots and lifecycle-controlled export.
- **REFACTOR:** move submit/reject/publish/archive and CSV/print export into canonical `/app/quizzes/:quizId` ownership.
- **KEEP TEMPORARILY:** legacy management adapter for create + version composition/editing only.
- **NO CHANGE:** PostgreSQL schema, backend business rules, Student/audit workstream.

#### Implementation step 1 — entity lifecycle/export ownership

Commit `39f0d1ef961208b0697b1c8b3c80e352723fad82` updated `apps/admin-web/src/admin/quizzes/QuizBuilderDetailPage.tsx` to own submit for review, reject review back to draft with required note, publish, archive, CSV export and print/PDF export. The page continues to call canonical API commands and reload canonical server detail after mutations.

Exact-head verification on `39f0d1ef...`:
- Frontend `34743770716` — SUCCESS.
- Admin AI `34743770721` — SUCCESS.
- Combined `34743770718` — SUCCESS.

#### Evidence gap found after green generic CI

Combined workflow source inspection showed its Chromium step only executed the AI operations spec; list→quiz entity and direct `/app/quizzes/:quizId` had no explicit named browser proof. The batch therefore remained open until this was corrected.

#### Implementation step 2 — explicit routed Chromium ownership

Commit `53efb6951b6f30cc95e84646973d974d2fc4536c` added `apps/admin-web/e2e/quiz-builder.e2e.spec.mjs` and wired it into Combined Integration. The real browser test logs in through the real Admin UI, creates a real quiz through the seeded Admin API fixture, opens it from `/app/quizzes`, verifies canonical `/app/quizzes/:quizId`, opens the same deep link directly and verifies it after reload.

#### Final exact-head verification

On exact code head `53efb6951b6f30cc95e84646973d974d2fc4536c`:
- Stage 13E Frontend Preparation `34743947733` — **SUCCESS**.
- Stage 13E Admin AI Operations `34743947732` — **SUCCESS**.
- Stage 13E Combined Integration `34743947735` — **SUCCESS**.

No backend lifecycle, migration, published-question eligibility, immutable snapshot, export contract or Student behavior changed. Batch 2B is **VERIFIED**.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED

#### State received and source-truth reconciliation

1. Re-read `PROJECT_STATUS.md`, this log, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, branch HEAD, live `main`, Draft PR #52 and exact-head CI before mutation.
2. Previous documentation HEAD `6bbad8797b26b4b35cf3fa29eead863bd2feff59` had successful Admin AI `34744137027` and Combined `34744137097`; no prior batch remained active.
3. Re-inspection corrected an imprecise earlier assumption: the actual canonical quiz entity is `/app/quizzes/:quizId` rendered by `apps/admin-web/src/admin/quizzes/QuizBuilderDetailPage.tsx`; there is no separate nested `/versions` route and no `QuizBuilderEntityPage` file.
4. `/app/quizzes/manage` still routes to root `QuizBuilderWorkspace.tsx`, which retained create + duplicate version composition/editing.
5. `quiz-builder-api.ts` already provided focused `fetchQuizCandidates`, `addQuizVersion`, `replaceQuizVersionQuestions` and `removeQuizVersion`; no new backend/migration contract was required.

#### Decision and classification

- **KEEP:** PostgreSQL/API lifecycle, published-question revision eligibility, immutable published snapshots and export authority.
- **REFACTOR:** version composition/editing into the existing canonical entity page.
- **KEEP TEMPORARILY:** legacy adapter for quiz creation.
- **REMOVE LATER:** duplicated legacy version-management UI only after explicit real-browser parity.
- **NO CHANGE:** migrations, API business rules and Student workstream.

#### Implementation step 1 — entity-owned draft version management

Commit `8c179f0554ebcb16476cd9d56c0795291ba0b811` updated `QuizBuilderDetailPage.tsx` with draft-only version composition/editing:
- add a version;
- search and paginate server-returned eligible published Question Bank candidates;
- select/deselect exact published revision references;
- replace the question set of an existing draft version;
- delete a draft version;
- preserve existing entity lifecycle and lifecycle-gated export.

Browser state does not implement eligibility or immutable-snapshot rules; it delegates them to existing server commands and reloads canonical detail after mutation.

#### First exact-head result and root-cause analysis

On `8c179f0554ebcb16476cd9d56c0795291ba0b811`:
- Admin AI `34745301663` — **SUCCESS**.
- Combined `34745301662` — **FAILED** only at the Quiz Builder Chromium assertion.
- Combined had already passed API/Admin quality gates, clean migrations, DB contract checks and backend authority/security regressions before Chromium.

Decoded Chromium logs showed production behavior was correct; the E2E still expected the legacy link `إدارة النماذج`, which had intentionally been removed because version ownership had moved into the entity page. Reintroducing the legacy UX would have reversed the architectural migration merely to satisfy a stale test.

#### Implementation step 2 — align executable ownership proof

Commit `f9180093617fb4974d1f8652a96b3d1f6fe77fad` updated `apps/admin-web/e2e/quiz-builder.e2e.spec.mjs` to assert the entity-owned `إضافة نموذج` capability instead of the retired legacy management link. No production behavior was weakened or reverted.

#### Final exact-head verification

On exact code head `f9180093617fb4974d1f8652a96b3d1f6fe77fad`:
- Stage 13E Frontend Preparation `34745428055` — **SUCCESS**.
- Stage 13E Admin AI Operations `34745428031` — **SUCCESS**.
- Stage 13E Combined Integration `34745428045` — **SUCCESS**, including clean PostgreSQL, backend authority/security regressions and real Admin Chromium.

Live `main` was re-read before documentation at `343ff1fd7b3d64d7e990b72606695365f520fa58`; no Student/audit change was overwritten or rebased into this Admin batch.

Batch 2C is **VERIFIED**. AR-07 remains ACTIVE because quiz creation is still in the temporary legacy adapter and duplicate legacy version-management code has not yet been removed after fuller browser parity.

## Explicit resume point for B / next Admin task

1. Re-read `PROJECT_STATUS.md`, this log and the Super Admin workstream first.
2. Fetch current branch HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Reconcile documentation-only CI generated by this Batch 2C checkpoint before editing code.
4. Continue **AR-07 only — Batch 2D**.
5. Extend real Chromium coverage on `/app/quizzes/:quizId` for actual version management: add version → search/select published candidate → save → reopen/replace questions → delete; add non-draft immutability evidence where fixture flow allows.
6. After executable version parity is green, slim/remove duplicate version-management ownership from root `QuizBuilderWorkspace.tsx`, while retaining create until it receives focused ownership.
7. Migrate quiz creation in a separate coherent batch with server validation and curriculum contracts preserved.
8. Remove the legacy workspace only after create + version composition/editing both have executable replacement parity.
9. Do not start AR-08 until AR-07 is fully exact-head green and closure documentation is synchronized.
10. Keep PR #52 Draft; no automatic merge.

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
| `ADMIN-008` | P1 | Question Bank | giant list/create/edit/review/history owner | FIXED / AR-06 |
| `ADMIN-009` | P1 | Quiz Builder | giant list/create/detail/version/lifecycle/export owner | ACTIVE / list + entity + lifecycle/export + entity version editing FIXED; focused create + legacy cleanup remain |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

No later AR stage starts before the current stage is verified and documented. PR #52 remains Draft.