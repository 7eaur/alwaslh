# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked:** `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
**Current feature checkpoint received:** `07de0e24475b8af410bf2c213ede2a334062b30c`.  
**AR-09 Batch 1 code-head:** `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.

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
  - Batch 1 — quiz metadata feature ownership relocation — **VERIFIED**.
  - Code-head `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.
  - Frontend `34756904661` — SUCCESS.
  - Admin AI `34756904665` — SUCCESS.
  - Combined `34756904664` and Stage13G `34756904668` were cancelled only because the later documentation checkpoint superseded that SHA before completion.
  - Exact current checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` then completed equivalent required gates: Admin AI `34757034197` — SUCCESS; Combined `34757034226` — SUCCESS; Stage13G `34757034179` — SUCCESS, including Admin UI quality, backend operations and Real API + PostgreSQL + Chromium.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 1 closure

### State received

The previous shared checkpoint documented Batch 1 as ACTIVE while exact-head CI was still running. Fresh reconciliation found no newer implementation commit beyond the documentation checkpoint. Draft PR #52 remains open, Draft and unmerged.

### What was verified

Batch 1 moved `QuizMetadataPanel` from the root `apps/admin-web/src/` seam to canonical Quiz ownership under `apps/admin-web/src/admin/quizzes/`, updated the route import, and removed the obsolete root file. No migration, API, PostgreSQL authority, auth/security rule, quiz lifecycle rule or Student workstream code changed.

The original code-head had Frontend and Admin AI green; its long Combined/Stage13G runs were cancelled by the immediately-following docs commit, not by a failure. The resulting current checkpoint contains the exact same production code plus documentation only, and its Combined and Stage13G suites are green, including real Chromium/PostgreSQL execution. This closes the verification gap without weakening any gate.

**Decision: AR-09 Batch 1 = VERIFIED. AR-09 remains ACTIVE.**

## Remaining AR-09 inventory snapshot

`App.tsx` still imports route-owned root surfaces including `AdminAiAuthoringWorkspace`, `AdminReportsWorkspace`, `AiOperationsPage`, `ContentIngestionWorkspace`, `ContentOperationsWorkspace`, `CurriculumWorkspace`, and `LessonAuthoringParityPanel`. Root location alone is not evidence of removability; each must be checked against actual route ownership, callers and tests before refactor/removal.

The next smallest candidate identified for inspection is `LessonAuthoringParityPanel`, which is owned by `/app/content/lesson-tools`; however no mutation is authorized until this documentation checkpoint itself has no active CI and the candidate's callers/tests are reconciled.

## Shared resume point for task A/B — continue AR-09 only

1. Fetch current branch HEAD first. If newer than this checkpoint, reconcile it before any mutation.
2. Reconcile CI triggered by this documentation checkpoint; do not start a parallel batch while it is ACTIVE/RUNNING.
3. If green, inspect callers/tests for `LessonAuthoringParityPanel` and the `/app/content/lesson-tools` route. Classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE before modifying anything.
4. If it is exclusively route-owned and no compatibility caller requires the root seam, perform one small relocation into `apps/admin-web/src/admin/content/`, update imports, remove the old seam, and run exact-head Frontend/Admin AI/Combined/Stage13G as applicable.
5. If evidence shows the candidate is shared, keep it and choose the next smallest safe AR-09 seam instead.
6. Do not begin AR-10 until AR-09 is fully DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.
