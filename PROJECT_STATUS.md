# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACKS: UX/UI REFOUNDATION + PARALLEL SUPER ADMIN PRODUCT REBUILD**

**STUDENT MAIN CHECKPOINT:** live `main` has independently advanced to `c3734366c132ea3919a925bdd0dd37cfd5d82104`; Student/audit work remains owned by the parallel track and must not be overwritten by the Admin rebuild.

**SUPER ADMIN CURRENT BATCH:** `AR-06 — Question Bank` — ACTIVE / BATCH 2A CODE VERIFIED.

**SUPER ADMIN COMPLETED:** `AR-01` through `AR-05` — DONE / VERIFIED on rebuild evidence.

Exact normal-roadmap return after the UX refoundation closes remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

Canonical UX roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.
Super Admin roadmap: `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`.

## Live main baseline

Current live `main` observed at the start of AR-06 Batch 2A:

`c3734366c132ea3919a925bdd0dd37cfd5d82104`

The Super Admin rebuild remains isolated on `rebuild/super-admin-foundation`. Any eventual resynchronization must preserve concurrent Student/audit work.

## Completed Student refoundation foundation

- UX-B00 — DONE / VERIFIED / MERGED.
- UX-B01 — DONE / VERIFIED / MERGED.
- UX-B02 — DONE / VERIFIED / MERGED.
- UX-B03 — DONE / VERIFIED / MERGED as `56ee51ab0d5669b4a38f9efec991ea79971d3503`.
- UX-B04 — DONE / VERIFIED / MERGED on its recorded main checkpoint.
- UX-B05 and later Student work remain Student-owned; the Admin rebuild does not modify them.

## Parallel Super Admin Product Rebuild checkpoint

Branch: `rebuild/super-admin-foundation`

Draft PR: **#52 — `refactor(admin): rebuild Super Admin foundation`**

Verified implementation checkpoint before AR-06:

`cda2c3a683c6101db12f0c7cfad772226c234e0d`

### AR-01 — DONE / VERIFIED

- route-driven Admin shell and deep links;
- five task-oriented navigation areas;
- Governance / AI Authoring / Reports removed from normal top-level navigation;
- stage/parity/debug surfaces removed from normal product shell.

### AR-02 — DONE / VERIFIED

- attention-first Overview;
- Operations split into Health / Audit / Diagnostics;
- contextual Notifications route;
- server-owned `/v1/admin/operations/attention` projection;
- humanized operational read model with technical diagnostics kept advanced-only.

### AR-03 — DONE / VERIFIED

- Curriculum backend/domain contracts preserved;
- giant Curriculum composition decomposed into hierarchy browsing, contextual creation and entity actions;
- secondary rename/status/order controls moved behind contextual/advanced management;
- real PostgreSQL/API/Chromium curriculum flow verified.

### AR-04 — DONE / VERIFIED

Implemented and verified:

- protected OCR source preview with server-side byte-size and SHA-256 integrity checks;
- no public storage-path authority exposed to the browser;
- source image/page rendered beside OCR text during human review;
- OCR review remains authenticated and server-authoritative;
- lesson-level content publication command no longer requires the UI to know `ingestion_task_id`;
- legacy/source-imported lesson assets without ingestion tasks can follow Draft → Review → Published;
- publication remains blocked when required media is not ready;
- `content_revision` and audit authority remain server-owned;
- upload task now owns upload/process/link/archive only; lesson publication is a separate lesson-owned workflow;
- legitimate lesson-summary/export and draft-quiz-metadata capabilities were relocated to contextual routes instead of restoring removed parity panels:
  - `/app/content/lesson-tools`
  - `/app/quizzes/metadata`
- raw MIME/error codes, raw lifecycle strings and parity/stage copy were removed from normal operator presentation.

AR-04 exact-head evidence on `ba74c17902827805d6be0ab91c0ff384fc3e2530`:

- Stage 13D Content Ingestion `34726217380` — SUCCESS;
- Stage 13D Admin Upload UI `34726217393` — SUCCESS, including real Chromium upload/process/link/review/publish/history flow;
- Stage 13G Admin Operations `34726217382` — SUCCESS, including real API + PostgreSQL + Chromium;
- Stage 13 Admin Product `34726217394` — SUCCESS;
- Stage 13E Frontend Preparation `34726217369` — SUCCESS;
- Stage 13E Admin AI Operations `34726217384` — SUCCESS;
- Stage 13E Combined Integration `34726217359` — SUCCESS;
- OCR Foundation `34726217374` — SUCCESS;
- Stage 9/10/11/12 and Student API/Product regressions shown on the same head were also green when completed.

### AR-05 — DONE / VERIFIED

Implemented and verified:

- content-first human AI review queue under `/app/reviews/ai`;
- existing server-canonical polling, refresh, pagination, conflict recovery and review authority preserved;
- provider/model/route/token/cost/job/unit/output internals removed from the normal review experience and retained only where diagnostic context is justified;
- approve/edit/reject remains a server-authoritative human-review decision;
- approved lesson/quiz outputs expose contextual apply/import actions from the reviewed result itself;
- normal Admin flow no longer requires copying `jobId` / `outputId` between workspaces;
- backend application commands preserve approval checks, idempotency/provenance and semantic-validation authority;
- lesson application verification proves the existing `content_revision` baseline `1` advances once to `2`; PostgreSQL `bigint` is intentionally asserted as API string `"2"` in the browser contract;
- durable attempt/review histories remain paginated and accessible without exposing pipeline labels;
- E2E disclosure logic opens native `<details>` only when closed, avoiding a false test failure that previously toggled an already-open review history closed after mutation/refetch.

AR-05 exact-head evidence on `cda2c3a683c6101db12f0c7cfad772226c234e0d`:

- Stage 13E Frontend Preparation `34729512441` — SUCCESS;
- Stage 13E Admin AI Operations `34729512433` — SUCCESS;
- Stage 13E Combined Integration `34729512404` — SUCCESS;
- Combined verification includes API/Admin quality gates, clean PostgreSQL migrations, DB contracts, backend authority regressions, Stage12/Auth regressions, deterministic real fixture checks and real Chromium.

### AR-06 — ACTIVE / BATCH 2A CODE VERIFIED

Repository-backed inventory confirms the Question Bank backend/domain remains **KEEP**: PostgreSQL/API own question lifecycle, revisions, publication authority, AI provenance/import/regeneration validation and review events. The root issue remains frontend composition and route ownership, not missing backend CRUD.

Batch 1 established `/app/questions/:questionId` and route-owned detail/review/history without weakening server authority.

Batch 2A now makes entity routing the normal Question Bank browsing path while retaining mutation parity safely:

- added `apps/admin-web/src/admin/questions/QuestionBankListPage.tsx` as a focused list/filter/pagination surface;
- `/app/questions` now renders the focused list and question cards navigate to `/app/questions/:questionId`;
- the legacy all-in-one `QuestionBankWorkspace` is moved behind `/app/questions/manage` as a temporary compatibility adapter for manual create, approved-AI import, edit and regeneration until those mutation responsibilities are moved contextually;
- no PostgreSQL migration, API lifecycle command or server authority was changed;
- no Student workstream file/code was modified;
- technical-ID handoff is not declared removed until edit/regeneration parity is moved to entity-owned UI and covered by browser verification.

AR-06 Batch 2A code commits:

- `931254e3b62d4cc8465f0bf7cd503ba1e32ae54c` — focused routed Question Bank list;
- `09a84c95b2de59ea318ff43171883756a776a79b` — make entity routes the default flow and isolate legacy manage route;
- `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac` — align the new list with shared styles/type contracts.

Exact code-head evidence on `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`:

- Stage 13E Admin AI Operations `34733273139` — SUCCESS;
- Stage 13E Frontend Preparation `34733273136` — SUCCESS;
- Stage 13E Combined Integration `34733273134` — SUCCESS, including API/Admin quality gates, clean PostgreSQL migrations/contracts, authority/security regressions, deterministic fixtures and real Chromium.

AR-06 is **not complete**. The next coherent work remains inside AR-06: move current-revision edit ownership into `QuestionBankDetailPage`, then approved regeneration contextually; retain manual create/import in `/app/questions/manage` until their ownership is safely separated; add direct deep-link + list→detail + routed lifecycle browser coverage; only then consider removing the legacy workspace.

## Parallel Full Product Architecture Audit checkpoint

- Audit PR #49 merged as `4249c91e434994343bfe3bd685af6d101c987dc1`.
- SEC-01 / `FPA-002` repair PR #50 merged at `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`.
- Repair fixed abandoned Assessment-session authorization and has PostgreSQL/Chromium verification.
- Railway API deployment `1e5a749a-10ac-47fd-99d8-e2653fce154b` reported SUCCESS.
- `FPA-013` remains open: Reader active-search-match DOM focus finding.
- Authenticated production-path verification remains `NOT YET VERIFIED` where the audit says so.

These audit results are preserved and do not reopen completed Student UX or Super Admin batches.

## Binding design-quality rule

The existing UI is functional evidence, not a visual preservation contract. Changed screens must meet:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student is an Arabic-first/RTL-first educational app. Super Admin is a dense but readable task-oriented operations product, not a generic dashboard. The responsible engineer/designer owns final ship quality, not incremental similarity to legacy visuals.

## Immediate next actions

1. Re-read this file, `PROJECT_ENGINEERING_LOG.md`, the Super Admin workstream and current exact-head CI before editing.
2. Continue AR-06 only; do not start AR-07.
3. Move `editQuestionBankItem` / current-revision editor ownership from `QuestionBankWorkspace` into `QuestionBankDetailPage` while preserving server lifecycle authority.
4. Move approved regeneration contextually next; keep manual create/import in `/app/questions/manage` until separate route ownership is proven.
5. Add browser coverage for direct deep-link, list→detail navigation and routed lifecycle/edit/regeneration behavior.
6. Remove the legacy workspace only after create/import/edit/regeneration parity has been verified from the new route-owned composition.
7. Close AR-06 only on exact-head Frontend + API/PostgreSQL/Chromium evidence; then proceed AR-07 → AR-10.
8. Keep PR #52 draft until the Admin rebuild and final exact-head verification are complete.
9. Before eventual merge, resynchronize with live main without overwriting Student/audit work.