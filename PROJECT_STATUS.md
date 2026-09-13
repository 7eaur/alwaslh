# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no automatic merge.  
**Live main reference for this checkpoint:** `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.  
**Super Admin:** AR-01 through AR-07 DONE / VERIFIED. AR-08 Students + Access Codes is ACTIVE; Batch 1 focused Students route is VERIFIED. AR-09+ NOT STARTED.

## Stage ledger

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED. Final checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — Question Bank — DONE / VERIFIED. Final code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — Quiz Builder — DONE / VERIFIED. Final code-head `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — Students + Access Codes — ACTIVE. Batch 1 focused Students route code-head `dc8d3b4e44fac90cca23cc21d15e68e90101cbbb`; Frontend `34751701107`, Admin AI `34751701104`, Combined `34751701154` — SUCCESS.
- AR-09 — Cleanup / architecture enforcement — NOT STARTED.
- AR-10 — A11y / RTL / performance / visual QA — NOT STARTED.

## AR-07 closure — Quiz Builder — DONE / VERIFIED

### Verified ownership sequence

- Batch 1 — focused list ownership — VERIFIED. Code `7746000748129a659e098e016d3ffbfd4d5ddc46`, `30d9443ed1c159440d38dc76db61686028c3d028`, `18607a1bf31392f9143a0e68c4531c972d4199d5`; Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.
- Batch 2A — canonical quiz entity / deep link — VERIFIED. Code-head `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`; Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.
- Batch 2B — lifecycle/export on entity + routed Chromium — VERIFIED. Code `39f0d1ef961208b0697b1c8b3c80e352723fad82`, `53efb6951b6f30cc95e84646973d974d2fc4536c`; Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.
- Batch 2C — entity-owned draft version composition/editing — VERIFIED. Code-head `f9180093617fb4974d1f8652a96b3d1f6fe77fad`; Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.
- Batch 2D — real Chromium version-management parity — VERIFIED. Code-head `df73f9d136bc7d84179601a475627ce47e0d1c58`; Frontend `34746324618`, Admin AI `34746324625`, Combined `34746324634` — SUCCESS.
- Batch 2E — legacy workspace reduced to create-only seam — VERIFIED. Code-head `1081152e6e95a11684de26398661326f50e82bfe`; Frontend `34747560417`, Admin AI `34747560473`, Combined `34747560426` — SUCCESS.
- Batch 2F — focused create ownership + executable proof + legacy seam removal — VERIFIED. Focused creation lives at `apps/admin-web/src/admin/quizzes/QuizBuilderCreatePage.tsx`; direct routing commit `f62290645360b33e75943c305e69baf49ad4a3a7`; legacy root `apps/admin-web/src/QuizBuilderWorkspace.tsx` removed in final code-head `c5bf37d4d72e341817970c7f95ff25bd771f8e17`.

### Final exact-head evidence

On final AR-07 code-head `c5bf37d4d72e341817970c7f95ff25bd771f8e17`:
- Frontend `34750417663` — SUCCESS.
- Admin AI `34750417642` — SUCCESS.
- Combined `34750417627` — SUCCESS.
- Combined job `103705843424` proved API/Admin quality gates, clean PostgreSQL migrations, Stage13E database contract, backend authority regressions, wider Stage12/auth security regressions, deterministic fixture setup and the real Admin Chromium suite all passed on the same code-head.

### Closure decision

AR-07 is **DONE / VERIFIED**. The giant Quiz Builder ownership has been replaced by focused list, canonical entity detail/deep-link, entity-owned draft version composition, lifecycle/export, and focused create flow. The temporary root legacy seam has been removed only after executable replacement parity and exact-head green verification. No migration, backend business authority, Question Bank rule, or Student workstream contract was weakened to accomplish the cleanup.

## AR-08 — Students + Access Codes — ACTIVE

### Batch 1 — focused Students route ownership — VERIFIED

Evidence-driven finding: both `/app/students` and `/app/access-codes` previously rendered the same `AdminStudentAccessWorkspace`, so the approved IA split existed in navigation but not in actual frontend ownership.

Implemented:
- `995203cf9344d5c4c1f3b41b208fdfe2d6bd3507` — added focused `apps/admin-web/src/admin/students/AdminStudentsPage.tsx`, owning only student lookup, inspection, temporary-password support, device rebind, entitlement revocation, devices, redemption history and activity.
- `6d8ddf181c9eff6f909c11195eb9ecee4529c47e` — routed `/app/students` directly to the focused Students page while leaving `/app/access-codes` on the legacy workspace temporarily for parity-first migration.
- `dc8d3b4e44fac90cca23cc21d15e68e90101cbbb` — updated real Chromium coverage to prove the focused Students route has no Access Codes tab, preserves student support mutations/session-expiry behavior, and verifies both Students and Access Codes routes at 390px without horizontal overflow.

Exact-head verification on `dc8d3b4e44fac90cca23cc21d15e68e90101cbbb`:
- Frontend/Admin Web quality `34751701107` — SUCCESS.
- Admin AI `34751701104` — SUCCESS.
- Combined `34751701154` — SUCCESS.
- Combined job `103709249693` passed API/Admin quality gates, clean PostgreSQL migrations, DB contract, backend authority regressions, Stage12/auth security regressions, deterministic browser fixtures and real Admin Chromium.

No migration, backend validation, access-code issuance/redemption/revocation contract, or Student workstream code was changed. AR-08 remains ACTIVE because Access Codes still needs focused route ownership and the temporary giant workspace must remain until executable parity is proven.

## Shared resume point for B / next AR-08 batch only

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Fetch current live `main`, feature HEAD, Draft PR #52 and exact-head CI; reconcile documentation-only runs from this checkpoint first if still active.
3. Continue **AR-08 only**. Do not start AR-09.
4. Extract Access Codes ownership from `AdminStudentAccessWorkspace` into a focused page under `apps/admin-web/src/admin/access-codes/` and route `/app/access-codes` directly to it.
5. Preserve the existing backend contracts for code inventory/filtering, full/class-code generation, expiry, redemption state, class association and non-destructive bulk revocation. Do not infer or duplicate business authority in the browser.
6. Update real Chromium so `/app/access-codes` is directly usable without switching a legacy tab and still proves generation, filtering, bulk revoke and 390px no-overflow.
7. Only after executable parity is green should the remaining legacy `AdminStudentAccessWorkspace` seam be removed or reduced; shared presentational helpers may be extracted if that reduces duplication without changing behavior.
8. Require applicable lint/typecheck/unit/build + clean PostgreSQL/backend/security + real Chromium before marking the next sub-batch verified.
9. Keep PR #52 Draft; no automatic merge. Preserve parallel Student/audit work unchanged.
