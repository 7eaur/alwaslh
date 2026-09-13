# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — Student main preserved; Super Admin AR-01 through AR-05 verified; AR-06 Batch 1 verified and active.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an installed educational app experience. Current Student product flow is:

`Activation/Login → Home → Learn → Subject → Lesson/Reader`

with separate `Practice`, `Downloads`, and `Account` destinations.

The dedicated Super Admin Product Rebuild owns Admin responsibilities, backend workflow mapping, IA, navigation, frontend architecture, UX/UI and Admin design-system decisions. It supersedes patching the old B06–B14 Admin composition without evidence.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin task-oriented product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — framework-neutral shared presentation foundation.

Stable authority contracts:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- Auth/Authorization and Entitlements remain server-owned;
- `media ready != published`;
- AI output never auto-publishes Student content/questions;
- human review remains mandatory;
- Assessment scoring/finalization remains server-owned;
- immutable/published quiz-version snapshot authority remains server-owned;
- `/v1` is never Service Worker Cache API authority;
- signed offline authorization, integrity and device/session rules remain unchanged;
- no password/session token/device private key is persisted as offline learning content.

## Binding product-quality decision

- **AD-230 — legacy visuals are not a preservation contract.** Existing screens are evidence for functions/flows only. Layout, composition, typography, navigation, spacing, density and interaction patterns may be rebuilt while preserving identity and correct contracts.
- Acceptance is: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
- Student must feel like a modern Arabic-first/RTL-first educational app, not a dashboard.
- Super Admin must be task-oriented, dense but readable, and must not expose pipeline/database internals as normal operator workflow.

## Student User Flows

### B02 — shell/navigation — integrated

Top-level destinations:

`Home | Learn | Practice | Downloads` + `Account`

### B03 — learning hierarchy/Reader — integrated

- `/app/learn`
- `/app/learn/subjects/:subjectId`
- `/app/learn/lessons/:lessonId`

Direct subject/lesson routes resolve only through server-authorized curriculum. Reader remains a focused learning screen.

### B04 — Practice / Assessment — merged

- `/app/practice` — library + recent attempts.
- `/app/practice/quizzes/:quizId` — quiz detail + learner-facing question-set + Practice/Test choice.
- `/app/practice/attempts/:sessionId` — focused attempt or result/review.

Live main after B04 merge:

`f44d5f72eaeb0acd8ca5c67d2816a56596761f21`

The Admin rebuild must preserve this Student state when eventually resynchronizing.

## Parallel architecture/security audit integration

- Audit PR #49 merged as `4249c91e434994343bfe3bd685af6d101c987dc1`.
- `FPA-002` repair PR #50 merged at `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`.
- The repair closes abandoned Assessment-session authorization leakage with PostgreSQL/Chromium evidence.
- Railway deployment `1e5a749a-10ac-47fd-99d8-e2653fce154b` reported SUCCESS.
- `FPA-013` remains open: Reader active-search-match DOM focus finding.
- Authenticated production-path verification remains `NOT YET VERIFIED` where explicitly recorded by the audit.

## Super Admin Architecture Decisions

- **AD-ADMIN-001 — route ownership replaces local workspace switching.** Primary Admin destinations are real routes/deep links.
- **AD-ADMIN-002 — Overview is attention-first.** It answers what needs operator attention; generic metrics are secondary.
- **AD-ADMIN-003 — Governance is not a normal workspace.** Health/Audit/Diagnostics own operations concerns.
- **AD-ADMIN-004 — technical identifiers are advanced-only.** UUIDs, job/unit/output IDs, provider/model/route/tokens/cost, storage paths/checksums/raw JSON do not belong in normal workflows.
- **AD-ADMIN-005 — content publication belongs to lesson content, not ingestion-task identity.** UI does not synthesize pipeline IDs.
- **AD-ADMIN-006 — OCR review requires visible source evidence.** Protected source media is rendered beside extracted text where available.
- **AD-ADMIN-007 — removing a parity panel must not remove a legitimate capability.** Valid lesson-summary/export and quiz-metadata functions were relocated contextually under Content/Quizzes rather than restored as dashboard panels.
- **AD-ADMIN-008 — approved AI output is applied contextually, never by manual internal-ID handoff.** The reviewed result owns the operator action while backend commands retain approval, provenance, idempotency and validation authority.
- **AD-ADMIN-009 — Question Bank entity detail is route-owned.** `/app/questions/:questionId` owns canonical question detail/review/history; legacy split-pane composition may remain only as a temporary parity adapter while list/editor/import/regeneration ownership is migrated.

## Super Admin Changes Made

### AR-01 — DONE / VERIFIED

- Replaced local workspace-state navigation with React Router ownership.
- Reduced navigation to task-oriented target IA.
- Removed Governance / AI Authoring / Reports as top-level sidebar destinations.
- Removed stage/parity/debug panels from normal shell.
- Added deep-link/route coverage.

### AR-02 — DONE / VERIFIED

- Added server-owned attention projection for Admin Overview.
- Rebuilt `/app` around actionable review/failure/support queues.
- Split Operations into Health, Audit and Diagnostics.
- Kept Notifications contextual.
- Humanized actor/resource/event presentation and removed raw diagnostics from normal Overview.

### AR-03 — DONE / VERIFIED

- Preserved correct Curriculum backend/domain contracts.
- Decomposed giant Curriculum workspace into hierarchy browsing, contextual creation and management controls.
- Kept lifecycle changes non-destructive and server-authoritative.
- Moved secondary rename/status/order actions behind contextual/advanced disclosure.
- Verified with API, clean migrations, PostgreSQL contracts and real Chromium.

### AR-04 — DONE / VERIFIED

Backend/content authority:

- Added authenticated safe OCR source preview.
- Source preview verifies stored byte size and SHA-256 before response.
- Storage key/path is not exposed as browser authority.
- Added lesson-level publication command independent of `ingestion_task_id`.
- Source/legacy-imported lesson assets without ingestion tasks can follow Draft → Review → Published.
- Publish blocks when required media is not ready.
- `content_revision` increments remain server-owned and audit events remain retained.
- Legacy task-bound publication endpoint remains for compatibility while normal UI no longer depends on it.

Frontend/UX:

- OCR review now shows the real source image/page beside extracted/editable text.
- Task detail owns upload/process/link/archive, not publication authority.
- Lesson publication is a separate lesson-owned panel/workflow.
- Raw MIME/error codes and raw processing enums were removed from normal operator presentation.
- Valid lesson summary/content-history export capability was relocated to `/app/content/lesson-tools`.
- Valid draft quiz metadata capability was relocated to `/app/quizzes/metadata`.
- Both are contextual routes and not sidebar destinations; parity/stage terminology was removed from visible UI.

Exact-head acceptance checkpoint:

`ba74c17902827805d6be0ab91c0ff384fc3e2530`

Verified runs include:

- Stage 13D Content Ingestion `34726217380` — SUCCESS.
- Stage 13D Admin Upload UI `34726217393` — SUCCESS, including real Chromium flow.
- Stage 13G Admin Operations `34726217382` — SUCCESS, including real API + PostgreSQL + Chromium.
- Stage 13 Admin Product `34726217394` — SUCCESS.
- Stage 13E Frontend Preparation `34726217369` — SUCCESS.
- Stage 13E Admin AI Operations `34726217384` — SUCCESS.
- Stage 13E Combined Integration `34726217359` — SUCCESS.
- OCR Foundation `34726217374` — SUCCESS.
- Stage 9, 10, 11, 12 and completed Student regression workflows on the same head were green.

### AR-05 — Reviews + AI — DONE / VERIFIED

Classification and decisions:

- **KEEP:** `AiOperationsPage` server-canonical refresh, polling for non-terminal jobs, pagination, conflict refresh and review mutation authority.
- **REBUILD:** ordinary AI review composition into a content-first human review queue under `/app/reviews/ai`.
- **REMOVE from normal UX:** raw job/unit/output IDs, prompt keys, provider/model/route/token/cost pipeline details and manual internal-ID handoff.
- **REFACTOR:** application flow so an approved reviewed result exposes its own contextual lesson/quiz apply/import action.

Implemented behavior:

- operator review is centered on generated content, source evidence, validation findings and human decision;
- provider/runtime internals no longer dominate normal review;
- approve/edit/reject remains server-authoritative and conflict recovery refreshes canonical state;
- approved lesson/quiz results can be applied/imported contextually without pasting `Output ID`;
- backend application commands preserve approval checks, provenance, idempotency and validation authority;
- durable attempt/review histories remain paginated and accessible;
- lesson application E2E proves one legal revision transition from baseline `content_revision = 1` to `2`; PostgreSQL `bigint` is asserted as API string `"2"`;
- the final E2E defect was test drift: native `<details>` remained open after mutation/refetch and the old test toggled it closed. Coverage now opens a disclosure only when needed instead of changing correct product UX.

Exact-head acceptance checkpoint:

`cda2c3a683c6101db12f0c7cfad772226c234e0d`

Verified runs:

- Stage 13E Frontend Preparation `34729512441` — SUCCESS.
- Stage 13E Admin AI Operations `34729512433` — SUCCESS.
- Stage 13E Combined Integration `34729512404` — SUCCESS.
- Combined integration passed API/Admin lint, typecheck, unit/build gates, clean PostgreSQL migrations, Stage13E DB contracts, backend authority regressions, Stage12/Auth regressions, deterministic fixture invariants and the real Chromium suite.

### AR-06 — Question Bank — ACTIVE / BATCH 1 VERIFIED

#### State received

- AR-05 was already closed and verified.
- Starting Admin rebuild head for this batch was `2ab2e8c8c16deb26eb8c922d884413244e0813aa`.
- Live `main` had independently advanced with Student work; no main/Student changes were overwritten or merged into this batch.
- No previous Admin CI/batch was active at the moment AR-06 inventory began.

#### Repository-backed inventory and classification

Inspected Question Bank migrations/service/API/adapters/UI/tests before editing. The system already has durable list/detail/revision/event contracts, manual question creation, AI import/regeneration, draft→review→published lifecycle authority, publication validation and PostgreSQL/integration/browser coverage.

- **KEEP:** API/PostgreSQL lifecycle and publication authority; revisions/events; approved AI provenance/import/regeneration validation; existing filters/pagination contracts.
- **IMPROVE:** human status/context presentation, route ownership, source/history progressive disclosure, normal error/retry states.
- **REFACTOR:** feature state into route-owned list/detail/editor/review/history surfaces.
- **REBUILD:** `QuestionBankWorkspace.tsx` composition, which currently combines list/create/import/edit/detail/review/regeneration/history.
- **REMOVE from normal UX:** checksum, OCR/internal IDs, raw AI output identifiers and stage/pipeline terminology. Advanced evidence may remain diagnostic-only.

#### Batch 1 implementation

1. Added `apps/admin-web/src/admin/questions/QuestionBankDetailPage.tsx` in commit `b52147c8a070a2a7e018562b8d80a62fb4a66023`.
2. Added route ownership `/app/questions/:questionId` through `App.tsx` in commit `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.
3. The detail route reads canonical question detail and curriculum data from existing server APIs; it does not duplicate lifecycle authority in the browser.
4. Submit-for-review, publish and reject actions still call the established Question Bank server commands.
5. Normal source evidence shows human-useful page/quote context without checksum, OCR extraction ID, storage path or raw AI identifiers.
6. Revision and event history remain available from the route-owned detail surface.
7. The legacy `/app/questions` workspace remains temporarily mounted because create/import/edit/regeneration parity has not yet been migrated; AR-06 therefore remains ACTIVE.

#### Verification

Verified code head: `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.

- Stage 13E Frontend Preparation run `34731668746` — SUCCESS.
  - Admin lint — SUCCESS.
  - strict typecheck — SUCCESS.
  - unit tests — SUCCESS.
  - production build — SUCCESS.
- Stage 13E Combined Integration run `34731668810` — SUCCESS.
  - API + Admin quality gates — SUCCESS.
  - clean PostgreSQL migrations — SUCCESS.
  - Stage13E DB contract — SUCCESS.
  - backend authority regressions — SUCCESS.
  - Stage12/Auth security regressions — SUCCESS.
  - deterministic browser fixtures — SUCCESS.
  - real Admin Chromium suite — SUCCESS.

No root-cause regression was found in this batch. The new route compiles and survives the existing real-browser parity suite.

#### Explicit resume point for next Admin task

**Do not start AR-07. Continue AR-06.**

Next coherent batch:

1. Read this checkpoint plus `PROJECT_STATUS.md` and the workstream file, then confirm branch HEAD/CI first.
2. Wire the normal Question Bank list/card navigation to `/app/questions/:questionId` so entity routing becomes the default detail path.
3. Migrate editor/review/history ownership out of the giant `QuestionBankWorkspace` incrementally, preserving manual create, approved AI import, edit and regeneration behavior.
4. Remove manual technical-ID handoffs from normal Question Bank UX only when contextual parity is available; do not delete proven server contracts merely to simplify the UI.
5. Add direct deep-link + routed lifecycle browser coverage.
6. Require exact-head Frontend + Question Bank/API/PostgreSQL/Chromium verification before declaring AR-06 complete.

## Audit Findings

| ID | Severity | Area | Problem | Evidence | Solution | Status |
|---|---:|---|---|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | repository shell | BrowserRouter + route ownership | FIXED / B01 |
| `UX-IA-102` | P1 | Student shell | authenticated Student was one aggregate surface | Student app | stable shell + destination routing | FIXED / B02 |
| `UX-IA-104` | P1 | Learn | subject/lesson state was local component navigation | Student Learn | real route hierarchy | FIXED / B03 |
| `UX-IA-105` | P1 | Reader | Reader embedded inside curriculum browser | Student Reader | focused Reader screen | FIXED / B03 |
| `UX-IA-106` | P1 | Practice | catalog/detail/attempt/result shared dashboard-like state | Student Assessment | routed Practice hierarchy | FIXED / B04 |
| `UX-COPY-103` | P1 | Assessment | implementation/version language exposed to Student | UI copy | learner-facing copy | FIXED / B04 |
| `UX-A11Y-102` | P2 | Assessment | focused attempt competed with global chrome | browser QA | focused shell + result scroll/focus | FIXED / B04 |
| `FPA-002` | P1 | Assessment authz | abandoned-session authorization omission | API/PostgreSQL | server repair + regression proof | FIXED / MERGED |
| `FPA-013` | P2 | Reader a11y | active search match does not move DOM focus | audit | accessibility closure | OPEN |
| `ADMIN-001` | P1 | Admin IA | giant state-driven Admin shell / no deep links | legacy `App` | route-driven task IA | FIXED / AR-01 |
| `ADMIN-002` | P1 | Overview | generic metrics instead of actionable attention | old Operations | attention projection + Overview | FIXED / AR-02 |
| `ADMIN-003` | P1 | Curriculum UX | unrelated creation/edit controls crowded in one surface | old Curriculum workspace | hierarchy/context decomposition | FIXED / AR-03 |
| `ADMIN-004` | P1 | Content publication | UI publication coupled to ingestion task identity | source imports may lack task ID | lesson-level publication use case | FIXED / AR-04 |
| `ADMIN-005` | P1 | OCR review | extracted text lacked visible source evidence | old review UI | protected source preview beside OCR | FIXED / AR-04 |
| `ADMIN-006` | P1 | AI review | normal review exposes pipeline/runtime internals | legacy `AiOperationsWorkspace` composition | content-first human review queue + advanced-only diagnostics | FIXED / AR-05 |
| `ADMIN-007` | P1 | AI authoring | operator manually copies `Output ID` to apply approved result | legacy `AdminAiAuthoringWorkspace` flow | contextual approved-result apply/import command | FIXED / AR-05 |
| `ADMIN-008` | P1 | Question Bank IA | list/editor/review/history remain combined and entity detail lacks route ownership | legacy `QuestionBankWorkspace` | route-owned detail + staged decomposition | IN PROGRESS / AR-06 |
| `UX-COPY-101` | P1 | Downloads/Account | Student technical/offline copy remains | Student B05 | UX-B05 | OPEN |
| `STUDENT-016I` | P1 | Offline/PWA | true cold-start offline Reader not closed | roadmap | resume after UX closure | PAUSED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | runtime | separate live verification | NOT YET VERIFIED |

## Tests & Verification Policy

For every final candidate:

- lint;
- strict typecheck;
- unit tests;
- production builds;
- clean PostgreSQL migrations/contracts where triggered;
- real Chromium flows;
- responsive/no-overflow evidence;
- Visual QA for changed product surfaces;
- complete exact-head triggered GitHub Actions matrix before final merge.

A green build alone is not product acceptance.

## Known Issues

- `FPA-013` Reader active-search focus remains open.
- API lint still reports a pre-existing unused `SOURCE_BUCKET` warning in `legacy-supabase-importer.ts`; it is nonblocking and unrelated to completed AR-04/AR-05 work until separately justified.
- Admin production bundle currently emits a >500 kB chunk warning; this is nonblocking now and belongs to evidence-driven AR-10 performance cleanup unless an earlier regression proves urgency.
- `AI-012..AI-019` live provider readiness remains `NOT YET VERIFIED`.
- Stage28 Production Cutover is not complete.

## Remaining Work

Super Admin rebuild:

`AR-06 Question Bank (ACTIVE) → AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup → AR-10 A11y/RTL/Performance/Visual QA`

Parallel Student work:

- UX-B05 remains Student-owned;
- `FPA-013` remains open;
- normal roadmap returns to `STUDENT-016I` only after UX refoundation closure.

PR #52 remains draft. Before eventual Admin merge, resynchronize from live main conservatively, retain concurrent Student/audit work, run exact-head full matrix, and do not merge merely because individual builds pass.