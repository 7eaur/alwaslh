# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference for this checkpoint:** `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.  
**Super Admin:** AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE. AR-08+ NOT STARTED.

## Stage ledger

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED. Final checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — Question Bank — DONE / VERIFIED. Final code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — Quiz Builder — ACTIVE.
- AR-08 — Students + Access Codes — NOT STARTED.
- AR-09 — Cleanup / architecture enforcement — NOT STARTED.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-07 verified batches

### Batch 1 — focused list ownership — VERIFIED
Code: `7746000748129a659e098e016d3ffbfd4d5ddc46`, `30d9443ed1c159440d38dc76db61686028c3d028`, `18607a1bf31392f9143a0e68c4531c972d4199d5`.  
Runs: Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.

### Batch 2A — canonical quiz entity / deep link — VERIFIED
Code-head `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`.  
Runs: Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.

### Batch 2B — lifecycle/export on entity + routed Chromium — VERIFIED
Code: `39f0d1ef961208b0697b1c8b3c80e352723fad82`, `53efb6951b6f30cc95e84646973d974d2fc4536c`.  
Runs: Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED
Code-head `f9180093617fb4974d1f8652a96b3d1f6fe77fad`.  
Runs: Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.

### Batch 2D — real Chromium version-management parity — VERIFIED
Code-head `df73f9d136bc7d84179601a475627ce47e0d1c58`.  
Runs: Frontend `34746324618`, Admin AI `34746324625`, Combined `34746324634` — SUCCESS.

### Batch 2E — legacy workspace reduced to create-only seam — VERIFIED
Code-head `1081152e6e95a11684de26398661326f50e82bfe`.  
Runs: Frontend `34747560417`, Admin AI `34747560473`, Combined `34747560426` — SUCCESS.

## AR-07 Batch 2F — focused quiz creation + executable proof — ACTIVE / VERIFICATION PENDING

### State received

The previous task had already moved quiz creation into focused `apps/admin-web/src/admin/quizzes/QuizBuilderCreatePage.tsx`, routed `/app/quizzes/manage` to that focused create surface, added real Chromium create proof, and left root `QuizBuilderWorkspace.tsx` only as the legacy seam pending executable replacement proof/removal.

Exact-head `47bf6fb0afea89355e3cf6366a58289e97bda6fe`:
- Frontend `34748558483` — SUCCESS.
- Admin AI `34748558485` — SUCCESS.
- Combined `34748558507` — FAILED only in the newly added create-route Chromium flow.

### Root-cause step 1 — canonical detail contract mismatch

Inspection of `quiz-builder-api.ts`, the create page, routed E2E and Combined workflow showed the test asserted `payload.quiz.lessonIds`, but canonical `fetchQuiz` returns `{ quiz, lessons, versions, events }` and lesson ownership is represented by `payload.lessons`.

Classification: **KEEP** production/API/PostgreSQL authority; **IMPROVE** test fixture/assertion only.

Commit `d94cff981e7bd89b137ecc37ba1451daee7c28f8` changed the assertion to `payload.lessons.map(...).includes(scope.lessonId)`.

Exact-head results on `d94cff...`:
- Frontend `34749369216` — SUCCESS.
- Admin AI `34749369205` — SUCCESS.
- Combined `34749369217` — FAILED only in the create Chromium test.

### Root-cause step 2 — ambiguous accessible name

Decoded Combined job `103703032072` proved all earlier gates were green and the failure was Playwright strict-mode ambiguity at `getByLabel("الصف")`: the partial label matched both the page region (`محتوى الصفحة`) and the nested select.

Product-level accessibility fix `9167d2149e590e0919e558085a707ba6905b8d05` added explicit `aria-label="الصف"` and `aria-label="المادة"` to the create selects. No backend, migration, lifecycle, Question Bank or Student rule changed.

Exact-head results on `9167d...`:
- Frontend `34749569158` — SUCCESS.
- Admin AI `34749569094` — SUCCESS.
- Combined `34749569104` — FAILED only in the create Chromium test.

Decoded job `103703587222` showed the explicit label existed, but Playwright `getByLabel("الصف")` still uses partial matching by default and continued to include the page region.

### Root-cause step 3 — exact accessible-name proof

Commit `79e05cc9e1a219d3b11338bddf9798e3f4d9094d` updates only the real browser proof to use exact accessible-name matching:
- `getByLabel("الصف", { exact: true })`
- `getByLabel("المادة", { exact: true })`

This preserves semantic selectors and avoids brittle CSS/test-id workarounds. No production business authority was changed.

Exact-head verification for `79e05cc...` has been triggered and is **PENDING** at this checkpoint:
- Frontend `34749700272` — queued/pending at checkpoint time.
- Combined `34749700260` — queued/pending at checkpoint time.
- Admin AI: matching exact-head run must be reconciled by the next task from the current workflow list.

## Shared resume point for B / next task

1. Re-read this file, `PROJECT_ENGINEERING_LOG.md` and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Fetch live `main`, current feature HEAD, Draft PR #52 and exact-head workflows.
3. **First reconcile all exact-head runs for `79e05cc9e1a219d3b11338bddf9798e3f4d9094d`. Do not start parallel code while any is queued/running.**
4. If any gate fails, fetch the failing job logs and fix the root cause only; do not weaken server validation or product authority.
5. If Frontend + Admin AI + Combined are all green, confirm no active route/import still depends on root `apps/admin-web/src/QuizBuilderWorkspace.tsx`.
6. Only then delete the legacy root workspace, rerun Frontend + Admin AI + Combined on the deletion exact-head, and require all green.
7. After that final green matrix, mark AR-07 DONE / VERIFIED, synchronize all three docs and PR #52, and only then begin AR-08.
8. Keep PR #52 Draft; no automatic merge.
9. Do not touch/rebase/overwrite parallel Student work.
