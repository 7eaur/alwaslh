# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — Student main preserved; Super Admin AR-01 through AR-05 verified; AR-06 Batch 2A code verified and AR-06 remains active.**

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

## Parallel Student/audit state

Live `main` observed at the start of AR-06 Batch 2A:

`c3734366c132ea3919a925bdd0dd37cfd5d82104`

This is newer than the Admin branch's earlier documented Student checkpoint. The Admin rebuild did not merge, reset, overwrite or otherwise modify the Student workstream in this batch.

Architecture/security audit facts retained:

- Audit PR #49 merged as `4249c91e434994343bfe3bd685af6d101c987dc1`.
- `FPA-002` repair PR #50 merged at `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`.
- `FPA-013` Reader active-search focus remains open.
- authenticated production-path verification remains `NOT YET VERIFIED` where recorded by the audit.

## Super Admin changes made

### AR-01 — DONE / VERIFIED

- route-driven Admin shell and deep links;
- five task-oriented navigation areas;
- Governance / AI Authoring / Reports removed from normal top-level navigation;
- stage/parity/debug surfaces removed from normal shell.

### AR-02 — DONE / VERIFIED

- attention-first Overview;
- server-owned operations attention projection;
- Operations split into Health / Audit / Diagnostics;
- Notifications contextualized;
- technical diagnostics kept advanced-only.

### AR-03 — DONE / VERIFIED

- correct Curriculum backend/domain contracts preserved;
- giant composition decomposed into hierarchy browsing, contextual creation and entity actions;
- secondary rename/status/order controls moved behind contextual/advanced management;
- API/PostgreSQL/Chromium verification completed.

### AR-04 — DONE / VERIFIED

- authenticated OCR source preview with server-side byte-size/SHA-256 integrity checks;
- no public storage-path authority exposed;
- source image/page shown beside OCR text during human review;
- lesson-level publication command decoupled normal UI from `ingestion_task_id`;
- publication still blocks when required media is not ready;
- content revision and audit authority remain server-owned;
- contextual lesson summary/export and quiz metadata routes retained legitimate capabilities;
- raw MIME/error/lifecycle/parity labels removed from ordinary operator presentation.

Exact-head checkpoint: `ba74c17902827805d6be0ab91c0ff384fc3e2530`.

Key successful runs: Content Ingestion `34726217380`, Admin Upload UI `34726217393`, Admin Operations `34726217382`, Admin Product `34726217394`, Frontend `34726217369`, Admin AI `34726217384`, Combined `34726217359`, OCR `34726217374`.

### AR-05 — Reviews + AI — DONE / VERIFIED

Classification:

- **KEEP:** server-canonical refresh/polling/pagination/conflict recovery/review authority.
- **REBUILD:** content-first human review queue.
- **REMOVE from normal UX:** raw job/unit/output/provider/model/route/token/cost internals and manual internal-ID handoff.
- **REFACTOR:** approved reviewed results own contextual lesson/quiz application actions.

Implemented:

- approve/edit/reject remains server-authoritative;
- approved results apply/import contextually without pasting Output IDs;
- application commands preserve approval, provenance, idempotency and validation authority;
- histories stay paginated/accessibly disclosed;
- lesson application E2E proves legal revision `1 → 2`, with PostgreSQL `bigint` represented as API string `"2"`;
- native `<details>` E2E drift fixed without changing correct product UX.

Exact-head checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.

Successful runs: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404`.

### AR-06 — Question Bank — ACTIVE

#### Batch 1 — route-owned Question detail — VERIFIED

Repository inventory before editing confirmed durable list/detail/revision/event contracts, manual creation, approved AI import/regeneration, draft→review→published authority and publication validation.

Classification:

- **KEEP:** API/PostgreSQL lifecycle/publication authority; revisions/events; approved-AI provenance/import/regeneration; filters/pagination contracts.
- **IMPROVE:** human state/context, deep links, progressive source/history disclosure and recovery states.
- **REFACTOR:** route/feature ownership into list/detail/editor/review/history.
- **REBUILD:** giant `QuestionBankWorkspace.tsx` composition.
- **REMOVE from normal UX:** checksum/OCR/output/internal IDs and pipeline/stage terminology.

Batch 1 added route-owned `QuestionBankDetailPage` and `/app/questions/:questionId`. Submit-review/publish/reject remain existing server commands; source/revision/event evidence remains available without exposing technical internals.

Verified head: `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.

- Frontend `34731668746` — SUCCESS.
- Combined `34731668810` — SUCCESS including clean migrations, DB contracts, authority/security regressions, deterministic fixtures and real Chromium.

#### Batch 2A — routed list becomes the normal browsing flow — CODE VERIFIED

**State received and reconciliation**

1. Re-read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before changing code.
2. Re-fetched live refs: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`; Admin branch was `68dbda4d3463cb6f04b374815e9dd47a59be7a2b` before new changes.
3. Confirmed Draft PR #52 remains draft.
4. Detected that prose still referenced the earlier Student main checkpoint and AR-06 Batch 1 code head, so current refs/commits/CI were inspected before proceeding.
5. Inspected Question Bank migration `0019_question_bank.sql`, API HTTP/service lifecycle implementation, frontend client/adapters, legacy workspace, route-owned detail page and API unit coverage.
6. Confirmed no missing backend CRUD problem: PostgreSQL/API already enforce open/published revision uniqueness, lifecycle validation and provenance; the next root problem is frontend composition/route ownership.

**Decision/classification for Batch 2A**

- **KEEP:** all existing PostgreSQL/API lifecycle and mutation authority.
- **KEEP temporarily:** legacy manual create, approved-AI import, edit and regeneration inside the old workspace until each receives contextual route ownership.
- **IMPROVE/REFACTOR:** `/app/questions` collection ownership and list→entity navigation.
- **REBUILD incrementally:** giant workspace composition, without a flag-day rewrite.
- **REMOVE later:** normal split-pane selection/manual technical handoffs only after route-owned parity is complete.

**Code changes**

1. `931254e3b62d4cc8465f0bf7cd503ba1e32ae54c` — added `apps/admin-web/src/admin/questions/QuestionBankListPage.tsx` with focused list/filter/pagination behavior and entity navigation.
2. `09a84c95b2de59ea318ff43171883756a776a79b` — updated `App.tsx`: `/app/questions` now uses the focused list; `/app/questions/:questionId` remains canonical detail; `/app/questions/manage` temporarily mounts the legacy mutation workspace for parity.
3. `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac` — aligned the new list with shared styles/types and route navigation behavior.
4. No API, service, migration or Student code was changed.

**Verification on exact code head `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`**

- Stage 13E Admin AI Operations `34733273139` — SUCCESS.
- Stage 13E Frontend Preparation `34733273136` — SUCCESS.
- Stage 13E Combined Integration `34733273134` — SUCCESS.
- Combined includes API/Admin quality gates, all clean PostgreSQL migrations/contracts, backend authority/security regressions, deterministic fixture setup and real Admin Chromium.

**What Batch 2A deliberately did not claim**

- current-revision editing has **not** yet moved into `QuestionBankDetailPage`;
- approved regeneration has **not** yet moved into the route-owned detail flow;
- manual create/import remains in `/app/questions/manage`;
- direct deep-link + list→detail + routed lifecycle/edit/regeneration browser coverage still needs explicit AR-06 coverage;
- AR-06 therefore remains **ACTIVE** and AR-07 must not start.

**Documentation checkpoint**

- `PROJECT_STATUS.md` updated after the verified code head; its documentation commit is `90ea787484983fe170ac93fa5630e735dfd6ca6d`.
- This log and the workstream file are updated as the same handoff sequence; because documentation commits advance HEAD, the next task must inspect the final documentation-head CI before changing code.

#### Explicit resume point for the next Admin task

**Do not start AR-07. Continue AR-06 only.**

1. Read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`; fetch live `main`, branch HEAD, Draft PR #52 and latest exact-head CI.
2. If documentation-head CI is active, finish observing it before changing code.
3. Move `editQuestionBankItem` / current-revision editor ownership into `QuestionBankDetailPage` while preserving server lifecycle authority and review restrictions.
4. Then move approved regeneration contextually to the question entity flow.
5. Keep manual create/import in `/app/questions/manage` until a separate focused ownership path is implemented and verified.
6. Add explicit browser coverage for direct deep-link, `/app/questions` list→detail navigation and routed lifecycle/edit/regeneration behavior.
7. Do not remove legacy workspace until all mutation parity is covered.
8. Require exact-head Frontend + API/PostgreSQL/Chromium evidence before declaring AR-06 COMPLETE.

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
| `ADMIN-008` | P1 | Question Bank IA | list/editor/review/history combined | route-owned list/detail + staged mutation decomposition | IN PROGRESS / AR-06 |
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

`AR-06 Question Bank (ACTIVE) → AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup → AR-10 A11y/RTL/Performance/Visual QA`

Parallel Student work remains Student-owned. PR #52 remains draft. Before eventual Admin merge, resynchronize from live main conservatively, retain concurrent Student/audit work, run exact-head full matrix, and do not merge merely because individual builds pass.