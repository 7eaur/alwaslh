# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION**

**CURRENT BATCH: `UX-B04 — Student Practice / Assessment` — FINAL RESYNC / EXACT-HEAD REVERIFICATION**

**NEXT BATCH AFTER B04 MERGE: `UX-B05 — Student Downloads / Account / Copy Closure`**

**ADMIN B06–B14: DEFERRED.** A dedicated **Super Admin Product Rebuild** workstream owns the Admin product/architecture/IA/frontend/UX rebuild and may supersede the old B06–B14 plan. Do not start or patch the old Admin batches before its Architecture Decision.

Exact normal-roadmap return after the UX refoundation closes remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

Canonical UX roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.

## Live main baseline used for the final B04 resync

Live `main` at the start of this final resync:

`8d0676443aa7e186c41a79cc011f7f828d1290ef`

This main includes the Full Product Architecture Audit documentation and the independent `FPA-002` / SEC-01 Assessment authorization repair. The B04 branch was rebuilt from this live main and only the B04 Student/roadmap files were overlaid; the API authorization repair, its tests, audit documents, Legacy Content work and runtime evidence remain preserved.

Final conservative merge commit before the documentation reconciliation:

`90f93904c2fd9969559fa3bfee9e9b94cf7820ab`

## Completed Student refoundation foundation

- UX-B00 — DONE / VERIFIED / MERGED.
- UX-B01 — DONE / VERIFIED / MERGED.
- UX-B02 — DONE / VERIFIED / MERGED.
- UX-B03 — DONE / VERIFIED / MERGED as `56ee51ab0d5669b4a38f9efec991ea79971d3503`.
- UX-B04 — implementation and visual acceptance complete; final synchronized exact-head CI is being rerun after the latest main/audit resync.

## UX-B04 implemented product shape

Routes:

- `/app/practice` — Practice library and recent attempts.
- `/app/practice/quizzes/:quizId` — quiz detail, learner-facing question-set choice, Practice/Test decision.
- `/app/practice/attempts/:sessionId` — focused active attempt or completed result/review.

Preserved contracts:

- API/PostgreSQL remain canonical authority.
- Auth/Authorization/Entitlements remain server-owned.
- published quiz/version snapshot behavior remains server-owned.
- Assessment answer/scoring/finalization remain server-owned.
- Practice gives immediate feedback; Test defers feedback until finalize.
- `/v1` remains outside Service Worker Cache authority.
- signed offline authorization/integrity/device/session contracts remain unchanged.

Final B04 visual/product corrections include:

- replaced the old two-column dashboard-like Assessment surface with list → detail → focused attempt → result/review composition;
- direct attempt URLs restore canonical session state from the API;
- focused attempt/review suppress distracting Student navigation;
- learner-facing Arabic copy replaces implementation/version/server terminology;
- result completion resets viewport to the result start and programmatically focuses its heading;
- phone/desktop Visual QA covers Library, Quiz detail, Attempt and Result;
- skip-link behavior is kept for normal product chrome and omitted only inside the focused attempt/review state where that chrome is absent.

## B04 previously accepted exact-head evidence

Before the latest main audit resync, docs-synchronized head:

`ee0007d553cd6b351b263a6fc86e4a3333288e9f`

passed **22/22 triggered workflows**, including:

- B04 `34717052253` — SUCCESS
- Stage14 `34717052270` — SUCCESS
- Stage15 `34717052276` — SUCCESS
- Stage16 `34717052304` — SUCCESS
- B03 `34717052258` — SUCCESS
- B02 `34717052244` — SUCCESS
- B01 `34717052303` — SUCCESS
- Rebuild `34717052226` — SUCCESS
- Stage9 Content Import `34717052290` — SUCCESS

The latest resync changes the PR head, so these are historical acceptance evidence only; merge requires a fresh all-green matrix on the new synchronized exact head.

## Parallel Full Product Architecture Audit checkpoint

- Audit PR #49 merged as `4249c91e434994343bfe3bd685af6d101c987dc1`.
- SEC-01 / `FPA-002` repair merged in PR #50 at `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`.
- Repair fixed abandoned Assessment-session authorization and has PostgreSQL/Chromium verification.
- Railway API deployment `1e5a749a-10ac-47fd-99d8-e2653fce154b` reported SUCCESS.
- `FPA-013` remains open: Reader active-search-match DOM focus finding.
- Authenticated production-path verification remains `NOT YET VERIFIED` where the audit says so.

These audit results are preserved and do not reopen completed Student UX batches.

## Binding design-quality rule

The existing UI is functional evidence, not a visual preservation contract. Changed screens must meet:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student is an Arabic-first/RTL-first educational app, not a dashboard. The responsible engineer/designer owns final ship quality, not incremental similarity to legacy visuals.

## Immediate next actions

1. Run full exact-head CI on the new B04 synchronized documentation head.
2. If fully green, update PR #47 and Issue #16, merge PR #47 with exact-head guard, and verify live `main` SHA.
3. Start UX-B05 only from that live main.
4. Complete B05 fully: Downloads, Account, copy closure, loading/error/empty/offline, RTL/accessibility/mobile polish.
5. After B05 merge, record Student Refoundation core B01–B05 complete.
6. Stop before Admin B06–B14 and synchronize with the dedicated Super Admin Product Rebuild workstream.
