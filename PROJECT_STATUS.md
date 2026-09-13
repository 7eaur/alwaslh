# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked:** `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
**AR-09 Batch 2 code-head:** `d1bf7101135516c751c02d269a384015f9e3a132`.

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
  - Batch 1 — Quiz metadata feature ownership relocation — **VERIFIED**.
  - Batch 2 — Lesson authoring tools feature ownership relocation — **VERIFIED** on exact code-head `d1bf7101135516c751c02d269a384015f9e3a132`.
  - Batch 2 verification: Frontend `34759439669` — SUCCESS; Admin AI `34759439651` — SUCCESS; Combined `34759439615` — SUCCESS; Stage13G `34759439612` — SUCCESS, including Admin UI quality, backend operations and Real API + PostgreSQL + Chromium.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 2 closure

The run first reconciled the inherited Batch 1 documentation handoff and current exact-head CI before mutation. The current pre-change head `8e0f46b6cdc5425d2b86bc772e54070be63d7986` was confirmed green on Admin AI, Combined and Stage13G, including Real API + PostgreSQL + Chromium, so the non-overlap blocker was cleared.

`/app/content/lesson-tools` and its real Chromium test were inspected before modification. `LessonAuthoringParityPanel` owns presentation/state for lesson summary editing and export, while `fetchAdminCurriculum`, `updateLessonSummary` and `exportLessonAuthoring` remain the existing server/API contracts. Classification:
- **KEEP:** route behavior, lesson-summary save/clear flow, content/history/print export, server authority and API contracts.
- **REFACTOR:** physical ownership into `apps/admin-web/src/admin/content/`.
- **REMOVE:** obsolete root `apps/admin-web/src/LessonAuthoringParityPanel.tsx` after the route import moved.
- **NO CHANGE:** migrations, backend authority, PostgreSQL contracts, auth/security, Student workstream.

Implementation chain:
1. `6f4638deddc57e3c5c2e1185c57054e39f4fbc86` — created `apps/admin-web/src/admin/content/LessonAuthoringParityPanel.tsx` with behavior preserved and only relative imports adjusted.
2. `ec7ed60aa106767dddfb423e7c626d93a3fa2cea` — changed `App.tsx` to route through the content-owned implementation.
3. `d1bf7101135516c751c02d269a384015f9e3a132` — removed the obsolete root seam.

Exact-head verification for `d1bf7101135516c751c02d269a384015f9e3a132` is fully green:
- Frontend `34759439669` — SUCCESS.
- Admin AI `34759439651` — SUCCESS.
- Combined `34759439615` — SUCCESS.
- Stage13G `34759439612` — SUCCESS.

**Decision: AR-09 Batch 2 = VERIFIED. AR-09 remains ACTIVE.**

## Current non-overlap gate

This documentation update advances branch HEAD and will trigger fresh CI. Do not start Batch 3 while any current documentation-head gate is ACTIVE/RUNNING. The first action in the next task is to fetch current HEAD and reconcile those runs.

## Remaining AR-09 inventory snapshot

Root route-owned surfaces still include `AdminAiAuthoringWorkspace`, `AdminReportsWorkspace`, `AiOperationsPage`, `ContentIngestionWorkspace`, `ContentOperationsWorkspace`, and `CurriculumWorkspace`. Root location alone is not evidence of removability; callers, tests and domain ownership must be inspected before selecting the next smallest cleanup seam.

## Shared resume point for task A/B — continue AR-09 only

1. Fetch live `main`, current branch HEAD, the three continuity files, recent commits, PR #52 and exact-head CI.
2. Reconcile all CI triggered by the Batch 2 documentation commits before any new code mutation.
3. If a gate fails, inspect exact job/log and fix root cause without weakening tests, contracts or server authority.
4. If all gates are green, re-inventory remaining root route-owned surfaces and inspect callers/tests before choosing exactly one smallest ownership cleanup batch.
5. Continue one cleanup seam at a time; do not infer removability from root location alone.
6. Do not begin AR-10 until AR-09 is fully DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.
