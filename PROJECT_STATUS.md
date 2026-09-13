# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference checked:** `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
**Current AR-09 Batch 3A code-head:** `6e7e43e17651d54413ccf6cc234f4e1457942a25`.

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
  - Batch 1 — Quiz metadata feature ownership relocation — VERIFIED.
  - Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on exact code-head `d1bf7101135516c751c02d269a384015f9e3a132`.
  - Batch 3A — Access-code reports route ownership adapter — **ACTIVE / CI PARTIALLY COMPLETE** on exact code-head `6e7e43e17651d54413ccf6cc234f4e1457942a25`.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-09 Batch 3A — current state

The run first reconciled the inherited Batch 2 documentation checkpoint `1b2915c00ee8818d467e1ef7fdc114366efdfb43`. Its Admin AI `34759659708`, Combined `34759659619`, and Stage13G `34759659630` runs are all SUCCESS, so the inherited non-overlap blocker was cleared before mutation.

The remaining root route-owned surfaces were re-inventoried. `AdminReportsWorkspace` was selected as the smallest safe next seam only after callers/tests/contracts were inspected:
- `App.tsx` had one route owner: `/app/access-codes/reports`.
- `admin-reports.e2e.spec.mjs` covers real Stage13G import, selected-code CSV export, print behavior, 390px no-overflow, and session expiry.
- the workspace consumes existing Admin curriculum/access-code APIs and CSV helpers; it does not own canonical business authority.

Classification:
- **KEEP:** `/app/access-codes/reports`, import/export/print behavior, session expiry behavior, existing API/PostgreSQL authority, and existing E2E contract.
- **IMPROVE:** explicit route ownership naming under the access-codes feature.
- **REFACTOR:** route import through `apps/admin-web/src/admin/access-codes/AdminAccessCodeReportsPage.tsx`.
- **REBUILD:** none.
- **REMOVE:** root `AdminReportsWorkspace.tsx` only after full feature implementation relocation and exact-head parity; not removed in Batch 3A.
- **NO CHANGE:** migrations, backend routes/services, PostgreSQL constraints, auth/security, Student workstream, test assertions.

Implementation on exact code-head `6e7e43e17651d54413ccf6cc234f4e1457942a25`:
1. added `apps/admin-web/src/admin/access-codes/AdminAccessCodeReportsPage.tsx` as a temporary feature-owned route adapter to the existing implementation;
2. changed `apps/admin-web/src/App.tsx` so `/app/access-codes/reports` imports/renders `AdminAccessCodeReportsPage` instead of importing the root workspace directly;
3. intentionally retained root `AdminReportsWorkspace.tsx` as a compatibility implementation until executable parity is green.

Current exact-head CI:
- Frontend `34761018736` — SUCCESS.
- Admin AI `34761018755` — SUCCESS.
- Combined `34761018762` — IN PROGRESS at the last check.
- Stage13G `34761018720` — QUEUED at the last check.

**Decision: Batch 3A is not VERIFIED yet. AR-09 remains ACTIVE. No Batch 3B or other seam may start until the two remaining exact-head gates complete green.**

## Shared resume point for task A/B — continue AR-09 Batch 3A only

1. Fetch live `main`, current branch HEAD, the three continuity files, recent commits, PR #52 and exact-head CI before any mutation.
2. Reconcile `34761018762` (Combined) and `34761018720` (Stage13G), and confirm Frontend `34761018736` + Admin AI `34761018755` remain SUCCESS for code-head `6e7e43e17651d54413ccf6cc234f4e1457942a25`.
3. If either remaining gate fails, inspect the exact failing job/log and fix root cause without weakening tests, API/PostgreSQL authority or Student contracts.
4. If all exact-head gates are green, mark Batch 3A VERIFIED, then continue the same seam only: move the actual access-code reports implementation (and its route-specific styling if ownership is exclusive) into `src/admin/access-codes/`, adjust relative imports, remove the root compatibility implementation only after callers are clean, and run the same exact-head matrix including real `admin-reports.e2e.spec.mjs` parity.
5. Do not start a different AR-09 seam while this reports seam is incomplete.
6. Do not begin AR-10 until AR-09 is fully DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.
