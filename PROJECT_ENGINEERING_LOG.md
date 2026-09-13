# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 + Batch 2A + Batch 2B + Batch 2C + Batch 2D + Batch 2E VERIFIED.**

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
- **AD-ADMIN-020:** Quiz route ownership requires explicit real Chromium list→entity and direct deep-link evidence.
- **AD-ADMIN-021:** draft quiz version composition/editing belongs to `/app/quizzes/:quizId`; candidate eligibility and mutation validity remain server-owned.
- **AD-ADMIN-022:** test fixtures must obey the same canonical domain contracts as production. A failing fixture must not be "fixed" by weakening backend validation or lifecycle authority.
- **AD-ADMIN-023:** temporary Quiz Builder legacy ownership is limited to creation only once list/entity/version/lifecycle/export replacement parity is executable; successful creation must hand off to canonical `/app/quizzes/:quizId`.

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

Checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

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

Inventory: `QuizBuilderWorkspace.tsx` owned list + create + detail + version editor + lifecycle + export while `quiz-builder-api.ts` already exposed focused server reads/commands and backend tests enforced published Question Bank revision eligibility, frozen snapshots, lifecycle-controlled export and published immutability.

Classification: KEEP PostgreSQL/API authority; KEEP giant workspace only as temporary parity adapter; REFACTOR responsibilities incrementally; no backend/migration/Student change.

Implementation:
- `7746000748129a659e098e016d3ffbfd4d5ddc46` — focused list.
- `30d9443ed1c159440d38dc76db61686028c3d028` — `/app/quizzes` list + temporary `/app/quizzes/manage` adapter.
- `18607a1bf31392f9143a0e68c4531c972d4199d5` — strict TypeScript root-cause correction.

Verification: Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.

### Batch 2A — route-owned entity overview + deep-link correction — VERIFIED

State received: documentation checkpoint and CI were reconciled first; Draft PR #52 remained Draft; live `main` had independent Student work and was not rebased/overwritten.

Root cause: list cards targeted `/app/quizzes/manage?quizId=...`, but the legacy workspace did not consume the query parameter, so navigation was not durable entity ownership.

Decision: establish `/app/quizzes/:quizId` rather than patch hidden query-param ownership into the giant workspace; keep still-unmigrated capabilities temporarily.

Implementation:
- `3099648db1b1cf95d1af3c1d579e8f7972748006` — `QuizBuilderDetailPage` backed by canonical `fetchQuiz`.
- `1c5707ae089487811401368e4c048720a7b121cf` — list cards route to `/app/quizzes/:quizId`.
- `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac` — canonical route registration.

Verification: Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.

### Batch 2B — route-owned lifecycle/export + explicit Quiz Builder Chromium — VERIFIED

Classification: KEEP lifecycle/snapshot/export authority on server; REFACTOR lifecycle and export into canonical entity; keep legacy adapter only for create + version composition/editing.

Implementation:
- `39f0d1ef961208b0697b1c8b3c80e352723fad82` — submit/reject/publish/archive and CSV/print export moved into `QuizBuilderDetailPage` using canonical API commands.
- Generic green CI was not treated as sufficient because the Combined browser step lacked explicit quiz routing proof.
- `53efb6951b6f30cc95e84646973d974d2fc4536c` — added real Chromium list→entity/direct-deep-link/reload proof and wired it into Combined Integration.

Verification: Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED

State/source reconciliation:
- canonical entity is `/app/quizzes/:quizId` → `QuizBuilderDetailPage.tsx`;
- no nested `/versions` route exists;
- `/app/quizzes/manage` still pointed to root `QuizBuilderWorkspace.tsx` and retained create + duplicate version editing;
- existing API already exposed candidate reads/add/replace/remove commands.

Classification: KEEP server eligibility/lifecycle/snapshot/export rules; REFACTOR draft version editing into canonical entity; KEEP legacy create temporarily; REMOVE duplicate version UI only after executable parity.

Implementation:
- `8c179f0554ebcb16476cd9d56c0795291ba0b811` — draft-only add/edit/delete version ownership, server-returned published-candidate search/pagination and exact revision selection.
- Combined `34745301662` failed only because the browser test still expected retired legacy navigation. Production UX was not reverted.
- `f9180093617fb4974d1f8652a96b3d1f6fe77fad` — aligned browser evidence with entity-owned `إضافة نموذج`.

Verification: Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.

### Batch 2D — real Chromium version-management parity — VERIFIED

#### State received from A / continuity check

1. Read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Feature branch entered the run at documentation checkpoint `7d0ac717bde4664985850ea549d34d76eefc1216` with Batch 2C marked VERIFIED.
3. Reconciled its documentation-only CI first: Admin AI `34745650179` — SUCCESS; Combined `34745650258` — SUCCESS.
4. Read live `main` at `343ff1fd7b3d64d7e990b72606695365f520fa58`; it contains independent Student work and no Student/audit file was touched or rebased into this Admin batch.
5. Read Draft PR #52; it remained open and Draft with AR-07 as the active stage.
6. Inspected `QuizBuilderDetailPage.tsx`, `quiz-builder.e2e.spec.mjs`, Combined workflow, Stage13E fixture seed, Question Bank API adapter and backend Question Bank service contract before changing tests.

#### Gap and decision

Existing Chromium only proved list→entity, direct deep-link and reload. It did not execute the new entity-owned version-management workflow. Batch 2D therefore targeted proof, not another production refactor.

Classification:
- **KEEP:** production Quiz Builder entity UI and canonical server commands from Batch 2C.
- **KEEP:** PostgreSQL/API eligibility, lifecycle and immutable snapshot authority.
- **IMPROVE:** executable browser proof.
- **NO CHANGE:** migrations, Student workstream, backend business rules.

#### Implementation step 1 — full version-management browser flow

Commit `e783751a144630bf0da1f44acee5a6b4bcd5a575` extended `apps/admin-web/e2e/quiz-builder.e2e.spec.mjs` to:
- create a real quiz scoped to the Stage13E seeded lesson;
- create two Question Bank questions through the real Admin API and publish them through submit-review/publish lifecycle;
- open `/app/quizzes/:quizId` in real Chromium;
- add a version, search/select a published candidate and save;
- reopen the version editor and replace the selected question;
- delete the draft version;
- recreate a version and submit the quiz for review;
- prove add/edit/delete version controls disappear outside `draft`.

Initial exact-head results on `e783751...`:
- Frontend `34746160739` — SUCCESS.
- Admin AI `34746160733` — SUCCESS.
- Combined `34746160743` — FAILED only in the new real Admin Chromium step; all earlier quality gates, migrations/contracts, backend authority/security regressions and fixture setup were green.

#### Root-cause analysis

The failure came from the new E2E fixture payload, not the production Quiz Builder. Backend `question-bank/service.ts` enforces the canonical multiple-choice contract:
- exactly four options;
- when `answerStatus = known`, a valid `correctOptionIndex`;
- `answerText` must equal the correct option.

The new fixture had three options and `answerText: null`. Weakening backend validation or changing product behavior would have been incorrect.

#### Implementation step 2 — fixture aligned to canonical contract

Commit `df73f9d136bc7d84179601a475627ce47e0d1c58` corrected only the fixture:
- four options;
- `correctOptionIndex = 0`;
- `answerText` equals the first/correct option;
- removed a no-op caught ARIA assertion.

No production source, migration or server rule was changed.

#### Final exact-head verification

On exact code-head `df73f9d136bc7d84179601a475627ce47e0d1c58`:
- Stage 13E Frontend Preparation `34746324618` — **SUCCESS**.
- Stage 13E Admin AI Operations `34746324625` — **SUCCESS**.
- Stage 13E Combined Integration `34746324634` — **SUCCESS**, including clean PostgreSQL, backend authority/security regressions and the expanded real Chromium version-management flow.

Batch 2D is therefore **VERIFIED**. AR-07 remains ACTIVE because duplicate version-management code still exists in the temporary legacy workspace and quiz creation has not yet received focused ownership.

### Batch 2E — legacy workspace reduced to create-only seam — VERIFIED

#### State received / continuity check

1. Re-read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Feature branch entered the run at documentation HEAD `bb782055e9a300212d49f2b1520e127076d0308f`.
3. Reconciled the previous documentation CI before code: Admin AI `34746570479` — SUCCESS; Combined `34746570478` — SUCCESS.
4. Read Draft PR #52 and confirmed it remained open and Draft.
5. Re-read live `main`; current reference used by the PR base was `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`. No Student/audit file was modified or rebased.
6. Inspected the full root `apps/admin-web/src/QuizBuilderWorkspace.tsx`, canonical `QuizBuilderDetailPage.tsx`, App routes, Quiz Builder E2E and existing styles before editing.

#### Finding and classification

The legacy workspace still duplicated responsibilities already owned and executable elsewhere: list, quiz detail, version add/edit/delete, lifecycle actions and export. The only legitimate unmigrated responsibility was quiz creation.

- **KEEP:** canonical PostgreSQL/API authority for quiz creation validation, lifecycle, published-question eligibility, immutable snapshots and export eligibility.
- **KEEP temporarily:** quiz creation UI on the existing management route.
- **REMOVE:** duplicate list/detail/version/lifecycle/export state/actions/UI from root workspace.
- **REFACTOR:** root workspace to a focused create-only seam.
- **NO CHANGE:** migrations, backend business rules, Student workstream.

#### Implementation

Commit `1081152e6e95a11684de26398661326f50e82bfe` (`refactor(admin): make quiz workspace create-only`) replaced the giant root workspace with a creation-only flow:
- loads curriculum scope only;
- collects title/description/class/subject/lessonIds/shuffleVersions;
- calls canonical `createQuiz`;
- handles session expiry through existing contract;
- after success navigates directly to `/app/quizzes/:quizId` so all subsequent entity/version/lifecycle/export work is canonical route-owned.

No backend, migration or Student file changed.

#### Exact-head verification

On exact code-head `1081152e6e95a11684de26398661326f50e82bfe`:
- Stage 13E Frontend Preparation `34747560417` — **SUCCESS**.
- Stage 13E Admin AI Operations `34747560473` — **SUCCESS**.
- Stage 13E Combined Integration `34747560426` — **SUCCESS**.

Combined passed clean PostgreSQL migrations/contracts, backend authority/security regressions and real Admin Chromium. The ownership cleanup therefore did not regress the executable Admin flow.

Batch 2E is **VERIFIED**. AR-07 remains ACTIVE only because creation still lives in the root legacy adapter and has not yet received focused feature ownership plus explicit create-through-browser proof.

## Explicit resume point for B / next Admin task

1. Re-read `PROJECT_STATUS.md`, this log and the Super Admin workstream first.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Reconcile CI generated by this synchronized Batch 2E documentation checkpoint before editing code.
4. Continue **AR-07 only**: move the create-only responsibility from root `QuizBuilderWorkspace.tsx` into a focused page under `apps/admin-web/src/admin/quizzes/` while preserving the deliberate create route/deep link.
5. Preserve server validation/curriculum scoping and do not duplicate business authority client-side.
6. Add explicit real Chromium proof for create route → real quiz creation → redirect/landing on canonical `/app/quizzes/:quizId` using real API/PostgreSQL fixture data.
7. Delete root `QuizBuilderWorkspace.tsx` only after the focused create flow is green and no route imports it.
8. Run Frontend + Admin AI + Combined on exact code-head; then synchronize AR-07 closure docs and PR state before considering AR-08.
9. Do not start AR-08 until AR-07 is DONE / VERIFIED on exact-head.
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
| `ADMIN-009` | P1 | Quiz Builder | giant list/create/detail/version/lifecycle/export owner | ACTIVE / list + entity + lifecycle/export + entity version editing + Chromium parity + duplicate ownership cleanup FIXED; focused create + legacy adapter removal remain |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

No later AR stage starts before the current stage is verified and documented. PR #52 remains Draft.