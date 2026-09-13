# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — Student main preserved; Super Admin AR-01 through AR-05 verified; AR-06 Batch 2D explicit routed Question Bank Chromium coverage verified and AR-06 remains active.**

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
- **AD-ADMIN-013 — routed Question Bank ownership requires real browser proof.** Deep-link, list→detail, edit, review decisions and approved regeneration are not considered migrated until clean PostgreSQL + real Chromium prove the route-owned workflow.

## Parallel Student/audit state

Live `main` re-verified during AR-06 Batch 2D:

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

#### Batch 2D — explicit routed Question Bank Chromium ownership — VERIFIED

**State received from the shared A/B handoff**

1. Read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Received feature documentation HEAD `cae0beca3def90890b59e25798a969a823261eab` with Batch 2C verified and AR-06 ACTIVE.
3. Re-fetched feature branch, Draft PR #52 and live `main@343ff1fd7b3d64d7e990b72606695365f520fa58`.
4. Confirmed no prior exact-head batch/CI remained active before opening Batch 2D.
5. Inspected routed list/detail, the temporary manager, existing Stage13F browser suite, backend regeneration integration and Stage13F fixtures/workflows.

**Finding / classification**

- **KEEP:** API/PostgreSQL Question Bank lifecycle, published-revision history, server review/publish/reject authority, AI approval/provenance and stable regeneration identity.
- **IMPROVE:** explicit browser ownership proof for the migrated routes.
- **REFACTOR tests/fixtures only:** make the Stage13F fixture include a real approved `regenerate_question` output tied to a published sourced question.
- **KEEP temporarily:** manual create/import in `/app/questions/manage`.
- **NO PRODUCTION REBUILD:** no backend lifecycle or schema gap was found.

**Step-by-step implementation and verification**

1. `ac9e72f88ec312a6faab2c3fa0fee473d9c9844f` — extended `stage13f-question-bank-e2e-seed.ts` with a real sourced published regeneration target and a separately approved `regenerate_question` output.
2. `c8cd530a0018e6f3e90183f98f9f2ebb8862970a` — extended Stage13F workflow invariants so both approved AI import and regeneration outputs are proven approved and not imported prematurely.
3. `61ee9a157d640f8ca33138944a6694ea7e7d16f3` — replaced outdated workspace-centric E2E with route-owned assertions for list→detail, deep-link reload, edit, review/publish/reject, regeneration, create/import parity, provenance, session expiry, responsive width and retained Quiz Builder snapshot flow.
4. Admin AI run `34736563386` failed before behavior execution because Biome requested fixture formatting only. Root cause was formatting, not API/schema/business logic.
5. `53b3cd26bb49f6f2b4cc40a8e87200f67135e95c` — formatted the fixture only; no behavior changed.
6. Fast-forwarded the canonical non-production integration branch `integration/stage13f-question-bank` to the same exact code head without force, so Stage13F PostgreSQL/Chromium gates executed on the feature code while `main` and Student work remained untouched.
7. Stage13F authority run `34736699640` passed completely on clean PostgreSQL. Stage13F Admin run `34736699633` passed UI quality and all API/PostgreSQL/fixture setup, but Chromium exposed ambiguous strict locators because the detail page contains both current-status and historical status badges sharing the same class.
8. The failure was correctly classified as test selector ambiguity; production UX and business rules were not changed to satisfy it.
9. `424bb1054fbd1a21991aa937be0f4338e08c7f09` — narrowed status/evidence assertions to the intended visible current item (`.first()` where duplicate history badges are valid).
10. Fast-forwarded `integration/stage13f-question-bank` to `424bb105…` without force and reran the exact Stage13F gates.

**Exact verified code head**

`424bb1054fbd1a21991aa937be0f4338e08c7f09`

**Green evidence on the final exact head**

- Stage 13F Question Bank Verification `34736985564` — SUCCESS:
  - API lint/typecheck/unit/build;
  - clean PostgreSQL migrations/contracts;
  - Question Bank integration;
  - stable regeneration identity integration;
  - Quiz Builder integration.
- Stage 13F Admin Question Bank Verification `34736985648` — SUCCESS:
  - Admin lint/strict typecheck/unit/build;
  - real API + PostgreSQL;
  - clean migrations and DB contract checks;
  - backend authority regressions;
  - deterministic Stage13F browser fixtures;
  - real Chromium routed Question Bank suite;
  - 390px no-horizontal-overflow checks.

**What Batch 2D now proves**

- `/app/questions` list/pagination and list→detail are browser-proven;
- `/app/questions/:questionId` survives direct reload/deep-link;
- routed edit creates a new revision and preserves history;
- routed submit-review/publish/reject uses server authority;
- approved regeneration creates a Draft revision for the same stable question identity and keeps published history/source provenance;
- manual create and approved-AI import remain reachable through the temporary manager and land back in the routed lifecycle;
- AR-06 routed migration no longer depends only on generic regression coverage.

**What remains / no overclaim**

- manual create/import ownership is still concentrated inside `QuestionBankWorkspace.tsx` and `/app/questions/manage`;
- duplicate legacy edit/regeneration/detail responsibilities must be removed only after create/import are moved and new parity remains green;
- AR-06 remains ACTIVE;
- AR-07 must not start yet.

#### Explicit resume point for the next Admin task

1. Re-read the three canonical handoff documents and fetch live `main`, Admin HEAD, Draft PR #52 and current CI before editing.
2. Treat `424bb1054fbd1a21991aa937be0f4338e08c7f09` as the verified Batch 2D **code** checkpoint; later documentation commits are handoff-only until code changes again.
3. Continue **AR-06 only**.
4. Next coherent batch: decompose manual question creation and approved-AI import out of `QuestionBankWorkspace.tsx` into focused Question Bank route/workflow ownership while preserving existing server commands and validation.
5. Add/update Chromium coverage for the new create/import ownership before deleting the temporary manager path.
6. After create/import parity is green, remove duplicate legacy detail/edit/regeneration ownership and retire `/app/questions/manage` only when no legitimate capability is lost.
7. Require exact-head Frontend + API/PostgreSQL/Chromium evidence before declaring AR-06 COMPLETE.
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
| `ADMIN-008` | P1 | Question Bank IA | list/editor/review/history combined | routed list/detail/editor/regeneration verified; manual create/import decomposition remains | IN PROGRESS / AR-06 |
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

`AR-06 Question Bank (ACTIVE: manual create/import decomposition → legacy adapter retirement → final exact-head AR-06 closure) → AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup → AR-10 A11y/RTL/Performance/Visual QA`

Parallel Student work remains Student-owned. PR #52 remains draft. Before eventual Admin merge, resynchronize from live main conservatively, retain concurrent Student/audit work, run exact-head full matrix, and do not merge merely because individual builds pass.
