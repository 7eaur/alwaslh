# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — Student main preserved; Super Admin AR-01 through AR-05 verified; AR-06 Batch 2C approved-regeneration ownership verified and AR-06 remains active.**

## Project understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student product flow is broadly:

`Activation/Login → Home → Learn → Subject → Lesson/Reader`

with separate `Practice`, `Downloads`, and `Account` destinations.

The Super Admin Product Rebuild owns Admin responsibilities, backend workflow mapping, IA/navigation, frontend architecture and Admin UX/UI decisions. It does not own the parallel Student UX track.

## Architecture and authority

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin task-oriented product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — shared presentation foundation.

Stable invariants:

- browser is never canonical business authority;
- API + PostgreSQL own canonical state;
- Auth/Authorization/Entitlements remain server-owned;
- `media ready != published`;
- AI output never auto-publishes Student content/questions;
- human review remains mandatory;
- Assessment scoring/finalization remains server-owned;
- immutable/published quiz-version snapshots remain server-owned;
- `/v1` is never Service Worker cache authority;
- signed offline authorization/integrity/device/session rules remain unchanged.

## Binding product-quality decisions

- **AD-230 — legacy visuals are not a preservation contract.** Existing screens are evidence for functions/flows only.
- Acceptance is: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
- Student remains Arabic-first/RTL-first and learner-oriented.
- Super Admin must be task-oriented, dense but readable, and must not expose database/pipeline internals as normal operator workflow.

## Super Admin architecture decisions

- **AD-ADMIN-001 — route ownership replaces local workspace switching.** Primary Admin destinations are real routes/deep links.
- **AD-ADMIN-002 — Overview is attention-first.** It answers what needs operator attention.
- **AD-ADMIN-003 — Governance is not a normal workspace.** Health/Audit/Diagnostics own operations concerns.
- **AD-ADMIN-004 — technical identifiers are advanced-only.** UUIDs, job/unit/output IDs, provider/model/route/tokens/cost, storage paths/checksums/raw JSON do not belong in normal workflows.
- **AD-ADMIN-005 — content publication belongs to lesson content, not ingestion-task identity.**
- **AD-ADMIN-006 — OCR review requires visible source evidence.**
- **AD-ADMIN-007 — removing a parity panel must not remove a legitimate capability.**
- **AD-ADMIN-008 — approved AI output is applied contextually, never by manual internal-ID handoff.**
- **AD-ADMIN-009 — Question Bank entity detail is route-owned.** `/app/questions/:questionId` owns canonical detail/review/history while legacy composition may remain only as a temporary mutation adapter.
- **AD-ADMIN-010 — Question Bank decomposition is parity-first.** List/detail navigation can migrate before create/import/edit/regeneration only if proven mutation capabilities remain reachable and server-authoritative during the transition.
- **AD-ADMIN-011 — Question editing is entity-owned.** The routed question detail owns current-revision edit UX while the existing API/PostgreSQL revision command remains canonical.
- **AD-ADMIN-012 — approved question regeneration is entity-owned.** The routed question detail owns the human regeneration action while `applyApprovedQuestionRegeneration` and the API/PostgreSQL layer retain approval, provenance, source/current-published-revision validation and idempotency authority.

## Parallel Student/audit state

Live `main` re-verified during AR-06 Batch 2C:

`343ff1fd7b3d64d7e990b72606695365f520fa58`

This includes independently merged Student PR #55. The Admin rebuild did not merge, reset, overwrite or otherwise modify the Student workstream.

Architecture/security audit facts retained:

- Audit PR #49 merged as `4249c91e434994343bfe3bd685af6d101c987dc1`.
- `FPA-002` repair PR #50 merged at `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`.
- `FPA-013` Reader active-search focus remains open.
- authenticated production-path verification remains `NOT YET VERIFIED` where recorded by the audit.

## Super Admin changes made

### AR-01 — DONE / VERIFIED

Route-driven Admin shell/deep links, task-oriented navigation and removal of stage/parity/debug surfaces from normal product navigation.

### AR-02 — DONE / VERIFIED

Attention-first Overview, server-owned attention projection, Operations split into Health/Audit/Diagnostics, contextual Notifications and advanced-only technical diagnostics.

### AR-03 — DONE / VERIFIED

Curriculum backend/domain rules preserved; giant composition decomposed into hierarchy browsing, contextual creation and entity actions; PostgreSQL/API/Chromium curriculum journey verified.

### AR-04 — DONE / VERIFIED

Authenticated OCR source evidence, server-side integrity checks, source preview, lesson-owned publication command, media readiness guard, preserved content revision/audit authority and contextual legitimate tools.

Exact-head checkpoint: `ba74c17902827805d6be0ab91c0ff384fc3e2530`.

Key successful runs: Content Ingestion `34726217380`, Admin Upload UI `34726217393`, Admin Operations `34726217382`, Admin Product `34726217394`, Frontend `34726217369`, Admin AI `34726217384`, Combined `34726217359`, OCR `34726217374`.

### AR-05 — Reviews + AI — DONE / VERIFIED

- server-canonical refresh/polling/pagination/conflict/review authority retained;
- content-first human review rebuilt;
- raw job/unit/output/provider/model/route/token/cost internals removed from normal UX;
- approved results apply/import contextually without manual internal-ID handoff;
- application commands preserve approval/provenance/idempotency/validation authority;
- histories remain paginated and accessible;
- lesson application E2E proves legal `content_revision` `1 → 2`, represented as API string `"2"` for PostgreSQL `bigint`;
- native `<details>` test drift fixed without changing correct UX.

Exact-head checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.

Successful runs: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404`.

### AR-06 — Question Bank — ACTIVE

#### Batch 1 — route-owned Question detail — VERIFIED

Inventory confirmed durable API/PostgreSQL lifecycle/publication/revision/event/provenance authority. Added route-owned `QuestionBankDetailPage` and `/app/questions/:questionId`, while submit-review/publish/reject remain existing server commands.

Verified head `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`:

- Frontend `34731668746` — SUCCESS.
- Combined `34731668810` — SUCCESS including clean migrations, DB contracts, authority/security regressions, deterministic fixtures and real Chromium.

#### Batch 2A — routed list becomes normal browsing — VERIFIED

State/evidence read before editing: canonical docs, live refs, PR #52, `0019_question_bank.sql`, API/service lifecycle, frontend adapters, legacy workspace, route-owned detail and tests.

Decision:

- **KEEP:** PostgreSQL/API lifecycle and mutation authority.
- **KEEP temporarily:** manual create, approved-AI import, edit and regeneration in the legacy adapter.
- **IMPROVE/REFACTOR:** `/app/questions` collection ownership and list→entity navigation.
- **REBUILD incrementally:** giant workspace composition.

Changes:

- `931254e3b62d4cc8465f0bf7cd503ba1e32ae54c` — focused list + entity navigation;
- `09a84c95b2de59ea318ff43171883756a776a79b` — routed list/detail plus temporary `/app/questions/manage`;
- `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac` — shared styles/types alignment.

Verification on `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`:

- Admin AI `34733273139` — SUCCESS;
- Frontend `34733273136` — SUCCESS;
- Combined `34733273134` — SUCCESS.

#### Batch 2B — route-owned current-revision editor — VERIFIED

State received: docs read; live main preserved; PR #52 confirmed draft; prior documentation-head CI closed green; routed detail, legacy editor and `question-bank-api.ts` inspected before mutation.

Decision:

- **KEEP:** existing PATCH edit command and PostgreSQL revision/history authority;
- **REFACTOR:** edit ownership into `QuestionBankDetailPage`;
- **IMPROVE:** route-local validation/feedback/canonical reload;
- **KEEP temporarily:** regeneration + manual create/import under `/app/questions/manage`;
- **NO CHANGE:** backend lifecycle, migrations, Student code.

Code `43162f9b4f0468af96ae726f16054a868aff605a` moved editing into the routed detail, kept review-state restrictions, preserved validation/normalization and reloaded canonical server detail/history.

Verification:

- Frontend `34733906701` — SUCCESS;
- Admin AI `34733906692` — SUCCESS;
- Combined `34733906716` — SUCCESS.

#### Batch 2C — route-owned approved regeneration — VERIFIED

**State received and reconciliation**

1. Re-read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before code mutation.
2. Received Admin documentation HEAD `332bd77e88ad7fd93d67c8527dd04c1b0cea3489`.
3. Re-verified live `main@343ff1fd7b3d64d7e990b72606695365f520fa58`; Student PR #55 remained preserved.
4. Confirmed Draft PR #52 remains open/draft.
5. Closed received-head CI before mutation; no batch was active.
6. Inspected `QuestionBankDetailPage.tsx`, the legacy regeneration flow in `QuestionBankWorkspace.tsx`, and `question-bank-api.ts` before changing ownership.
7. Confirmed the canonical regeneration command already exists as `applyApprovedQuestionRegeneration(itemId, outputId)`; therefore no backend CRUD, API route or migration was missing.

**Classification / decision**

- **KEEP:** existing regeneration API/service/PostgreSQL contract and all server approval/provenance/source/current-published-revision/idempotency authority.
- **REFACTOR:** approved-regeneration human action from giant legacy workspace into `QuestionBankDetailPage`.
- **IMPROVE:** route-local success/error/replay feedback and canonical reload.
- **KEEP temporarily:** duplicate legacy regeneration affordance as a parity adapter until explicit routed Chromium coverage is added.
- **KEEP temporarily:** manual create/import under `/app/questions/manage`.
- **NO CHANGE:** backend, migrations, lifecycle authority and Student workstream.

**Code change**

`60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e` — `feat(admin): move approved question regeneration to detail route`

- route detail exposes regeneration only for `published` questions with source evidence;
- operator supplies the approved `regenerate_question` output reference in the contextual action;
- existing API remains the authority for whether the output is approved and belongs to the correct current published question/source;
- replay returns successful idempotent feedback without creating duplicate revisions;
- successful first application creates a server-owned Draft revision and reloads canonical detail/history;
- edit/regeneration panels are mutually exclusive;
- no API/migration/Student code changed.

**Exact code-head verification**

- Stage 13E Frontend Preparation `34735333581` — SUCCESS.
- Stage 13E Admin AI Operations `34735333557` — SUCCESS.
- Stage 13E Combined Integration `34735333555` — SUCCESS.
- Combined passed API/Admin quality gates, clean PostgreSQL migrations/contracts, backend authority/security regressions, Stage12/Auth regressions, deterministic fixtures and the real Admin Chromium suite.

**What Batch 2C does not claim**

- existing Combined Chromium proves regression safety but does not yet explicitly exercise every new routed Question Bank transition;
- dedicated E2E must still cover direct detail deep-link, list→detail, routed edit, routed regeneration and submit-review/publish/reject lifecycle;
- manual create/import remain legacy-owned;
- legacy workspace cannot yet be removed;
- AR-06 remains ACTIVE and AR-07 must not start.

#### Explicit resume point for the next Admin task

1. Re-read the three canonical handoff documents and fetch live `main`, Admin HEAD, Draft PR #52 and exact-head CI.
2. First close/record CI triggered by the documentation sequence; do not start a parallel batch while it is active.
3. Continue **AR-06 only**.
4. Next coherent batch: add explicit Browser E2E for direct `/app/questions/:questionId`, `/app/questions` list→detail, routed edit, approved regeneration, and submit-review/publish/reject authority.
5. Keep manual create/import in `/app/questions/manage` during this parity proof.
6. After explicit routed E2E is green, move manual create/import into focused ownership and remove duplicate legacy edit/regeneration/detail responsibilities only when parity is proven.
7. Require exact-head Frontend + API/PostgreSQL/Chromium coverage before declaring AR-06 COMPLETE.
8. Keep PR #52 draft; no automatic merge.

## Audit findings

| ID | Severity | Area | Problem | Solution | Status |
|---|---:|---|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | route ownership | FIXED / B01 |
| `UX-IA-102` | P1 | Student shell | aggregate authenticated Student surface | stable shell/destinations | FIXED / B02 |
| `UX-IA-104` | P1 | Learn | subject/lesson local-state navigation | real route hierarchy | FIXED / B03 |
| `UX-IA-105` | P1 | Reader | Reader embedded in browser | focused Reader | FIXED / B03 |
| `UX-IA-106` | P1 | Practice | catalog/detail/attempt/result shared state | routed Practice hierarchy | FIXED / B04 |
| `FPA-002` | P1 | Assessment authz | abandoned-session authorization omission | server repair + regression proof | FIXED / MERGED |
| `FPA-013` | P2 | Reader a11y | active search match lacks DOM focus | accessibility closure | OPEN |
| `ADMIN-001` | P1 | Admin IA | giant state-driven shell/no deep links | route-driven task IA | FIXED / AR-01 |
| `ADMIN-002` | P1 | Overview | generic metrics instead of attention | attention projection | FIXED / AR-02 |
| `ADMIN-003` | P1 | Curriculum UX | unrelated controls crowded together | hierarchy/context decomposition | FIXED / AR-03 |
| `ADMIN-004` | P1 | Content publication | task-ID-coupled UI authority | lesson publication use case | FIXED / AR-04 |
| `ADMIN-005` | P1 | OCR review | text lacked visible source evidence | protected source preview | FIXED / AR-04 |
| `ADMIN-006` | P1 | AI review | normal review exposed pipeline internals | content-first review | FIXED / AR-05 |
| `ADMIN-007` | P1 | AI authoring | manual output-ID handoff | contextual apply/import | FIXED / AR-05 |
| `ADMIN-008` | P1 | Question Bank IA | list/editor/review/history combined | route-owned list/detail/editor/regeneration + staged mutation decomposition | IN PROGRESS / AR-06 |
| `UX-COPY-101` | P1 | Downloads/Account | technical Student copy remains | Student UX workstream | OPEN |
| `STUDENT-016I` | P1 | Offline/PWA | cold-start offline Reader not closed | normal roadmap | PAUSED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | live verification | NOT YET VERIFIED |

## Tests & verification policy

For every final candidate:

- lint;
- strict typecheck;
- unit tests;
- production builds;
- clean PostgreSQL migrations/contracts where triggered;
- real Chromium flows;
- responsive/no-overflow evidence;
- visual QA for changed surfaces;
- complete exact-head triggered GitHub Actions matrix before final merge.

A green build alone is not product acceptance.

## Known issues

- `FPA-013` Reader active-search focus remains open.
- API lint has a pre-existing unused `SOURCE_BUCKET` warning in `legacy-supabase-importer.ts`; unrelated/nonblocking until separately justified.
- Admin production bundle emits a >500 kB chunk warning; evidence-driven AR-10 performance cleanup owns this unless an earlier regression proves urgency.
- `AI-012..AI-019` live provider readiness remains `NOT YET VERIFIED`.
- Stage28 Production Cutover is not complete.

## Remaining work

Super Admin rebuild:

`AR-06 Question Bank (ACTIVE: explicit routed Browser E2E → manual create/import decomposition → legacy adapter retirement) → AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup → AR-10 A11y/RTL/Performance/Visual QA`

Parallel Student work remains Student-owned. PR #52 remains draft. Before eventual Admin merge, resynchronize from live main conservatively, retain concurrent Student/audit work, run exact-head full matrix, and do not merge merely because individual builds pass.