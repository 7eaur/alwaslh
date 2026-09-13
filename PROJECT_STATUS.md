# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked:** `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
**AR-09 Batch 1 code-head:** `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.  
**Batch 1 verification checkpoint:** `61ab697e4ddcc263330c0826e0c127594712ca53`.

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
  - Original code-head Frontend `34756904661` — SUCCESS; Admin AI `34756904665` — SUCCESS.
  - Original Combined `34756904664` and Stage13G `34756904668` were cancelled only because the later documentation push superseded them.
  - Unchanged-production-code checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`: Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS, including Real API + PostgreSQL + Chromium.
  - Documentation closure checkpoint `61ab697e4ddcc263330c0826e0c127594712ca53` triggered fresh gates: Admin AI `34758285729` — IN PROGRESS; Combined `34758285717` — IN PROGRESS; Stage13G `34758285875` — IN PROGRESS at handoff.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 1 closure

Batch 1 moved `QuizMetadataPanel` from root `apps/admin-web/src/` to canonical Quiz ownership under `apps/admin-web/src/admin/quizzes/`, updated the route import, and removed the obsolete root seam. No migration, API, PostgreSQL authority, auth/security rule, quiz lifecycle rule or Student workstream code changed.

The cancelled long-running checks on the original code-head were superseded by a documentation-only commit, not failures. The immediately following checkpoint, containing unchanged production code, completed Admin AI, Combined and Stage13G successfully, while the original code-head already had Frontend green. This closes the executable verification gap without weakening tests or backend contracts.

**Decision: AR-09 Batch 1 = VERIFIED. AR-09 remains ACTIVE.**

## Current non-overlap blocker

No Batch 2 code was started because the documentation closure checkpoint itself has active CI:
- Admin AI `34758285729` — IN PROGRESS.
- Combined `34758285717` — IN PROGRESS.
- Stage13G `34758285875` — IN PROGRESS.

## Remaining AR-09 inventory snapshot

`App.tsx` still imports route-owned root surfaces including `AdminAiAuthoringWorkspace`, `AdminReportsWorkspace`, `AiOperationsPage`, `ContentIngestionWorkspace`, `ContentOperationsWorkspace`, `CurriculumWorkspace`, and `LessonAuthoringParityPanel`. Root location alone is not evidence of removability.

The next smallest candidate is `LessonAuthoringParityPanel`, directly rendered by `/app/content/lesson-tools`. Its behavior and server contracts are KEEP candidates; physical ownership may be REFACTORed into `admin/content` only after callers/tests are reconciled.

## Shared resume point for task A/B — continue AR-09 only

1. Fetch current branch HEAD first and reconcile any newer commit.
2. Reconcile `34758285729`, `34758285717`, and `34758285875` before any code mutation.
3. If any fails, inspect the failing job/log and fix root cause without weakening tests or server authority.
4. If all are green, inspect all callers/tests for `LessonAuthoringParityPanel` and `/app/content/lesson-tools`; classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE.
5. Only if exclusively route-owned, relocate it under `apps/admin-web/src/admin/content/`, update the route import, remove the root seam, and run exact-head quality gates.
6. Do not begin AR-10 until AR-09 is fully DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.
