# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked in this run:** `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
**AR-09 Batch 1 exact code-head:** `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.  
**Previous documentation checkpoint reconciled:** `a0ea9466becb1c2ba24971e2df8d7a46e8b531b1`.

## Super Admin stage ledger

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED. Final checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — Question Bank — DONE / VERIFIED. Final code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — Quiz Builder — DONE / VERIFIED. Final code-head `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — Students + Access Codes — DONE / VERIFIED. Final code-head `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — Cleanup / architecture enforcement — **ACTIVE**.
  - Batch 1 — quiz metadata feature ownership relocation — code-head `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.
  - Frontend run `34756904661` — SUCCESS.
  - Admin AI run `34756904665` — RUNNING at checkpoint.
  - Combined run `34756904664` — RUNNING at checkpoint.
  - Stage13G run `34756904668` — RUNNING at checkpoint.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 1 truth

### State received

The run began by re-reading `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, fetching live `main`, current feature HEAD and Draft PR #52, and reconciling the AR-08 documentation checkpoint. AR-08 was already DONE / VERIFIED and its executable gates were green, so AR-09 was the first legal incomplete stage.

### Inventory and classification

The root `apps/admin-web/src` inventory still contained several route-owned Admin surfaces outside their owning feature directories. `App.tsx` showed that `/app/quizzes/metadata` directly imported the root `QuizMetadataPanel.tsx`, while the rest of Quiz Builder already lived under `apps/admin-web/src/admin/quizzes/`.

For this smallest safe cleanup seam:
- **KEEP:** `/app/quizzes/metadata` route behavior, quiz metadata form behavior, `fetchQuizzes`, `fetchQuiz`, `updateQuiz`, server-side status authority, PostgreSQL/backend contracts.
- **REFACTOR:** physical ownership of `QuizMetadataPanel` into `apps/admin-web/src/admin/quizzes/`.
- **REMOVE:** obsolete root-level `apps/admin-web/src/QuizMetadataPanel.tsx` seam after the route import moved.
- **NO CHANGE:** migrations, backend validation/security, Student workstream, quiz lifecycle rules.

### Changes

- `adc85a6c21eece93560a85febdb2c37e64fe3727` — created `apps/admin-web/src/admin/quizzes/QuizMetadataPanel.tsx` with behavior preserved and only relative imports adjusted.
- `6a6360f5c37f96984fe95907783a5ab6e4962557` — changed `App.tsx` to import the feature-owned panel.
- `20c128bb4a2b7166ad1d04d24e4672c93422d38e` — removed the old root-level `QuizMetadataPanel.tsx`.

No API, migration, backend, auth, publication or Student-facing behavior was modified.

### Exact-head verification state

On exact code-head `20c128bb4a2b7166ad1d04d24e4672c93422d38e`:
- Stage 13E Frontend Preparation `34756904661` — SUCCESS.
- Stage 13E Admin AI Operations `34756904665` — RUNNING at this checkpoint.
- Stage 13E Combined Integration `34756904664` — RUNNING at this checkpoint.
- Stage 13G Admin Operations `34756904668` — RUNNING at this checkpoint.

Because required exact-head CI is still active, Batch 1 is **not yet VERIFIED** and no second cleanup seam is being started in parallel.

## Shared resume point for task B — continue AR-09 only

1. Fetch current feature HEAD first. If it is newer than this checkpoint, reconcile the newer commits before any mutation.
2. Reconcile runs `34756904665`, `34756904664`, and `34756904668` for exact code-head `20c128bb...`; Frontend `34756904661` is already SUCCESS.
3. If any required run fails, inspect the failing job/log and fix root cause without weakening tests.
4. If all required runs succeed, mark AR-09 Batch 1 VERIFIED in all three continuity files and PR #52.
5. Only then continue the AR-09 inventory and choose the next smallest safe root-level ownership/dead-seam cleanup after checking all callers and tests. Do not assume `AdminReportsWorkspace` or any other root file is removable merely because it is root-level.
6. Do not begin AR-10 until AR-09 is fully DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.
