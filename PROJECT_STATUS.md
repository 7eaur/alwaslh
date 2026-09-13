# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked:** `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`.  
**Latest fully verified AR-09 code-head:** `141e3e7912171c10356b8d32a268ddcbfda267f3`.  
**Current AR-09 Batch 5A code-head:** `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022` — CI ACTIVE.

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
  - Batch 1 — Quiz metadata ownership relocation — VERIFIED.
  - Batch 2 — Lesson authoring tools ownership relocation — VERIFIED.
  - Batch 3 — Access-code reports ownership relocation — VERIFIED.
  - Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`.
  - Batch 5A — Curriculum route ownership adapter — **ACTIVE / CI RUNNING** on `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022`.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 5A — Curriculum route ownership adapter

### State inherited and verified

Before code mutation, live `main`, branch HEAD, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, Draft PR #52 and latest exact-head CI were refreshed. The inherited documentation HEAD was `faec80191b56833118eda050d19d3b1bb79f7141`; PR #52 remained open + Draft with no merge. The prior AR-09 Batch 4A implementation was fully verified.

Fresh route inventory showed a justified remaining seam: `/app/curriculum` still imported root `apps/admin-web/src/CurriculumWorkspace.tsx`, while a real `src/admin/curriculum/` feature owner already exists and owns the curriculum UI/components.

### Classification

- **KEEP:** `/app/curriculum`, all curriculum CRUD behavior, selection/state flow, server APIs, PostgreSQL authority and tests.
- **IMPROVE:** make route ownership point through the established Curriculum feature boundary.
- **REFACTOR:** adapter-first route ownership only in this batch.
- **REBUILD:** none.
- **REMOVE:** nothing yet; root implementation stays until executable parity is green.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

### Changes

Commit `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022` — `refactor(admin): route curriculum through feature owner`:

- added `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx` as a temporary feature-owned adapter exporting the existing implementation;
- changed `App.tsx` so `/app/curriculum` imports through `src/admin/curriculum/`;
- no runtime behavior, API contract, database rule, styling or test assertion changed.

### Exact-head CI at checkpoint

For `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022`:

- Frontend Preparation `34766693628` — **SUCCESS**.
- Admin AI Operations `34766693635` — **IN PROGRESS** at checkpoint.
- Combined Integration `34766693638` — **IN PROGRESS** at checkpoint.
- Stage13G Admin Operations `34766693674` — **IN PROGRESS** at checkpoint.

Batch 5A is therefore **ACTIVE**, not VERIFIED. No implementation move or compatibility-file deletion is allowed until these gates are reconciled.

## Current blocker / next step

CI is the only blocker. First reconcile runs `34766693635`, `34766693638`, and `34766693674` for exact code-head `39da6e1e...`.

If all are green, continue the **same Curriculum seam only**: move the real `CurriculumWorkspace` implementation under `src/admin/curriculum/` with relative-import changes only, retain the root compatibility file until parity, then remove it only after a second exact-head green matrix. Do not start another cleanup seam or AR-10 in parallel.

## Shared resume point for task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity files, PR #52 and exact-head CI.
2. Reconcile `34766693635`, `34766693638`, `34766693674` before code.
3. If green, continue AR-09 Batch 5A Curriculum ownership only.
4. If any fails, diagnose/root-fix without weakening tests or server authority.
5. Keep PR #52 Draft; no merge or auto-merge.
