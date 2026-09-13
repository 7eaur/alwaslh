# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-07 DONE / VERIFIED. AR-08 Students + Access Codes ACTIVE; Batch 1 focused Students route VERIFIED.**

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
- **AD-ADMIN-016:** Quiz Builder decomposition preserves server lifecycle, published-question revision references, immutable published snapshots and export constraints.
- **AD-ADMIN-017:** Quiz Builder list ownership is route-owned independently from entity/version/lifecycle management.
- **AD-ADMIN-018:** `/app/quizzes/:quizId` is the canonical quiz entity overview/deep link.
- **AD-ADMIN-019:** Quiz lifecycle and lifecycle-gated export belong to the canonical quiz entity route while API/PostgreSQL remain authoritative.
- **AD-ADMIN-020:** Quiz route ownership requires real Chromium list→entity/direct-deep-link evidence.
- **AD-ADMIN-021:** draft quiz version composition/editing belongs to `/app/quizzes/:quizId`; candidate eligibility/mutation validity stay server-owned.
- **AD-ADMIN-022:** test fixtures must obey canonical production contracts; backend validation is never weakened to make fixtures pass.
- **AD-ADMIN-023:** temporary Quiz Builder legacy ownership is limited to creation only once list/entity/version/lifecycle/export parity is executable; successful creation hands off to `/app/quizzes/:quizId`.
- **AD-ADMIN-024:** focused creation proof uses canonical detail contracts and stable semantic accessible names; browser tests must not depend on ambiguous partial accessible-name matches or brittle CSS selectors.
- **AD-ADMIN-025:** once focused quiz creation has executable parity, `/app/quizzes/manage` imports its focused owner directly and the root legacy Quiz Builder seam is removed rather than preserved as an alias.
- **AD-ADMIN-026:** Students and Access Codes are separate task owners: `/app/students` owns individual account support/inspection while `/app/access-codes` owns code inventory, issuance and bulk lifecycle; server access/auth authority remains unchanged.

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
Content-first AI review and contextual application while server review/provenance/idempotency authority remained intact. Checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank — DONE / VERIFIED
Execution heads: route-owned detail `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`; list `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`; routed edit `43162f9b4f0468af96ae726f16054a868aff605a`; approved regeneration `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`; routed PostgreSQL/Chromium ownership `424bb1054fbd1a21991aa937be0f4338e08c7f09`; focused create/import `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`; legacy cleanup `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`. Final runs: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.

## AR-07 — Quiz Builder — DONE / VERIFIED

### Prior verified batches

- Batch 1 — focused list ownership — VERIFIED. Implementation `7746000748129a659e098e016d3ffbfd4d5ddc46`, `30d9443ed1c159440d38dc76db61686028c3d028`, `18607a1bf31392f9143a0e68c4531c972d4199d5`; Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.
- Batch 2A — canonical entity/deep-link ownership — VERIFIED. Code-head `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`; Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.
- Batch 2B — lifecycle/export ownership + routed Chromium — VERIFIED. Code `39f0d1ef961208b0697b1c8b3c80e352723fad82`, `53efb6951b6f30cc95e84646973d974d2fc4536c`; Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.
- Batch 2C — entity-owned draft version composition/editing — VERIFIED. Code-head `f9180093617fb4974d1f8652a96b3d1f6fe77fad`; Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.
- Batch 2D — real Chromium version-management parity — VERIFIED. Final code-head `df73f9d136bc7d84179601a475627ce47e0d1c58`; Frontend `34746324618`, Admin AI `34746324625`, Combined `34746324634` — SUCCESS.
- Batch 2E — legacy workspace reduced to create-only seam — VERIFIED. `1081152e6e95a11684de26398661326f50e82bfe`; Frontend `34747560417`, Admin AI `34747560473`, Combined `34747560426` — SUCCESS.

### Batch 2F — focused create ownership, executable proof and legacy seam removal — VERIFIED

#### 1. State received from the previous Admin task

- Re-read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
- Fresh live `main` at this run was `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.
- Feature branch started this run at documentation checkpoint `d4703ef8e6f2a29c06963bb578c885c595be9934`; Draft PR #52 was open and remained Draft with no merge.
- The explicit handoff required reconciling focused-create proof first, then removing root `apps/admin-web/src/QuizBuilderWorkspace.tsx` only after replacement parity was executable.
- No Student/audit work was adopted into this Admin branch work.

#### 2. Verification reconciliation before mutation

The create implementation chain had already corrected two test-only problems without changing server authority:
- `d94cff981e7bd89b137ecc37ba1451daee7c28f8` — fixed the E2E assertion to use canonical quiz detail `{ quiz, lessons, versions, events }` rather than nonexistent `quiz.lessonIds`.
- `9167d2149e590e0919e558085a707ba6905b8d05` — added explicit accessible labels for class/subject selects.
- `79e05cc9e1a219d3b11338bddf9798e3f4d9094d` — changed browser proof to exact accessible-name matching.

Reconciliation found:
- Frontend `34749700272` on `79e05cc...` — SUCCESS.
- The later documentation-only checkpoint `d4703ef8...` changed no product code and had Admin AI `34749771634` — SUCCESS and Combined `34749771649` — SUCCESS.

This established focused-create parity before removal of the legacy seam.

#### 3. Dependency / ownership inspection

Inspected current `apps/admin-web/src/App.tsx` and root `apps/admin-web/src/QuizBuilderWorkspace.tsx`.

The root file contained only:

`export { QuizBuilderCreatePage as QuizBuilderWorkspace } from "./admin/quizzes/QuizBuilderCreatePage";`

`App.tsx` was the remaining active import and `/app/quizzes/manage` route consumer. No independent workflow state, lifecycle, version-management or server authority remained in the root workspace.

Classification:
- **KEEP:** focused `admin/quizzes/QuizBuilderCreatePage.tsx`, list/entity/detail/version/lifecycle/export ownership, API/PostgreSQL authority and existing Student contracts.
- **IMPROVE:** route imports the focused create owner directly.
- **REMOVE:** one-line root `QuizBuilderWorkspace.tsx` legacy alias after executable parity.
- **NO CHANGE:** migrations, backend business rules, Question Bank contracts, Student workstream.

#### 4. Implementation

- `f62290645360b33e75943c305e69baf49ad4a3a7` — `App.tsx` now imports `QuizBuilderCreatePage` directly and `/app/quizzes/manage` renders that focused page.
- `c5bf37d4d72e341817970c7f95ff25bd771f8e17` — deleted root `apps/admin-web/src/QuizBuilderWorkspace.tsx` legacy seam.

#### 5. Final exact-head verification

Final AR-07 code-head: `c5bf37d4d72e341817970c7f95ff25bd771f8e17`.

- Frontend `34750417663` — **SUCCESS**.
- Admin AI `34750417642` — **SUCCESS**.
- Combined `34750417627` — **SUCCESS**.

Combined job `103705843424` explicitly passed:
- API + Admin quality gates;
- all migrations on clean PostgreSQL;
- Stage13E database contract;
- backend authority regressions;
- wider Stage12 + auth security regressions;
- deterministic browser fixtures;
- real Admin Chromium suite.

No validation, permission, lifecycle or persistence contract was weakened to make the matrix green.

#### 6. Closure

**AR-07 — Quiz Builder = DONE / VERIFIED.**

The previous giant ownership has been replaced by:
- focused `/app/quizzes` list;
- canonical `/app/quizzes/:quizId` entity deep link;
- entity-owned draft version composition/editing;
- canonical lifecycle/export controls under server authority;
- focused `/app/quizzes/manage` creation surface;
- real PostgreSQL/API/Chromium coverage for routed operations and creation;
- no remaining root Quiz Builder legacy workspace seam.

## AR-08 — Students + Access Codes — ACTIVE

### Batch 1 — focused Students route ownership — VERIFIED

#### 1. State received and verification reconciliation

- Re-read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
- Live `main` remained `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.
- Feature branch began at `765e9b7dca5b4ee8146807ed007ffbf701bed770`; PR #52 was open/Draft.
- Documentation-only CI on that head was reconciled before mutation: Admin AI `34750605622` — SUCCESS; Combined `34750605687` — SUCCESS.

#### 2. Contract and ownership inspection

Inspected:
- `apps/admin-web/src/AdminStudentAccessWorkspace.tsx`;
- route callers in `apps/admin-web/src/App.tsx`;
- `apps/admin-web/src/admin-student-access-api.ts`;
- Stage13G verification workflow and real Chromium coverage.

Finding: both `/app/students` and `/app/access-codes` rendered the same giant workspace. The workspace combined student search/detail/support mutations with access-code filtering/generation/bulk revocation behind local tabs, so the navigation split was not a real ownership split.

Server contracts remain authoritative for:
- student list/detail;
- temporary password and device rebind;
- entitlement revocation;
- access-code inventory and state;
- full/class code generation;
- redemption/expiry/revocation semantics.

Classification:
- **KEEP:** API/PostgreSQL/auth/access authority, existing student support behavior, access-code business rules and Student-facing contracts.
- **REFACTOR:** route ownership so Students and Access Codes no longer share the same giant screen.
- **IMPROVE:** executable browser proof for direct focused routes and mobile no-overflow.
- **REMOVE LATER:** the legacy giant workspace only after Access Codes replacement parity is executable.
- **NO CHANGE:** migrations, backend validation/security, Student/audit workstream.

#### 3. Implementation

- `995203cf9344d5c4c1f3b41b208fdfe2d6bd3507` — created `apps/admin-web/src/admin/students/AdminStudentsPage.tsx` with focused ownership of individual student lookup/inspection/support only.
- `6d8ddf181c9eff6f909c11195eb9ecee4529c47e` — `/app/students` now routes directly to `AdminStudentsPage`; `/app/access-codes` intentionally remains on the legacy workspace for parity-first migration.
- `dc8d3b4e44fac90cca23cc21d15e68e90101cbbb` — updated real Chromium coverage to prove the focused Students route has no Access Codes tab, preserves recovery/device-rebind/entitlement-revoke/session-expiry behavior, enters Access Codes through its own URL, and keeps both routes within a 390px viewport.

#### 4. Exact-head verification

Code-head: `dc8d3b4e44fac90cca23cc21d15e68e90101cbbb`.

- Frontend/Admin Web quality `34751701107` — **SUCCESS**.
- Admin AI `34751701104` — **SUCCESS**.
- Combined `34751701154` — **SUCCESS**.

Combined job `103709249693` passed:
- API/Admin quality gates;
- all migrations on clean PostgreSQL;
- Stage13E database contract;
- backend authority regressions;
- Stage12/auth security regressions;
- deterministic browser fixture setup and invariants;
- real Admin Chromium suite.

No backend or migration changes were made, and no server authority was duplicated into frontend state.

#### 5. Batch decision

**AR-08 Batch 1 = VERIFIED. AR-08 remains ACTIVE.**

The Students route now has focused ownership. Access Codes deliberately remains on the legacy workspace until its own focused page can reproduce inventory, generation, filtering and non-destructive bulk revocation with executable parity.

## Explicit resume point for B — continue AR-08 only

1. Re-read `PROJECT_STATUS.md`, this log and the Super Admin workstream before mutation.
2. Fetch live `main`, current feature HEAD, Draft PR #52 and exact-head CI. Reconcile documentation-only CI from this checkpoint first if it is still active.
3. Continue **AR-08 only**; AR-09 remains blocked.
4. Extract Access Codes ownership from `AdminStudentAccessWorkspace` into a focused page under `apps/admin-web/src/admin/access-codes/`.
5. Route `/app/access-codes` directly to that focused owner; it must not require switching a tab belonging to the Students workspace.
6. Preserve server authority for inventory/filtering, full/class-code generation, expiry/redemption state, class association and non-destructive bulk revocation.
7. Update real Chromium to prove direct `/app/access-codes` generation/filtering/revoke plus responsive no-overflow. Keep existing backend/database/security regressions.
8. Remove/reduce the legacy `AdminStudentAccessWorkspace` only after replacement parity is executable and exact-head green; shared presentational helpers may be extracted without moving business authority.
9. Keep PR #52 Draft; no automatic merge. Preserve parallel Student/audit work unchanged.

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
| `ADMIN-009` | P1 | Quiz Builder | giant list/create/detail/version/lifecycle/export owner | FIXED / AR-07 |
| `ADMIN-010` | P1 | Students + Access | same giant workspace duplicated under `/app/students` and `/app/access-codes` | PARTIAL FIX / AR-08 Batch 1; Students focused, Access Codes pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-08 Students + Access Codes → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

No later AR stage starts before the current stage is verified and documented. PR #52 remains Draft.
