# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> **Latest continuation authority for the next engineering conversation.** Code, migrations and executable CI evidence outrank prose.

Last synchronized: **2026-09-10 — parallel Student Stage14 CLOSED / VERIFIED; global/main Stage13E history preserved; Student Stage15 blocked by Stage13F promotion.**

## 0. Parallel Student Track continuation checkpoint

This checkpoint applies only to `parallel/stage14-student-product`; it does not claim promotion to `main`.

Verified Stage14 runtime/code HEAD:

`ac55f1435d232cadff334816407f1182125dda90`

Documentation closure commits may make the branch HEAD newer. Do not substitute a docs-only SHA for runtime evidence.

Final exact-head evidence:

- Stage14 Student Product run `34420993805` — **SUCCESS**.
- Stage14 Student API Regression run `34420993840` — **SUCCESS**.
- Student ESLint PASS; strict TypeScript PASS; Vitest **12/12 PASS**; production build PASS.
- Student production bundle: ~184.20 kB JS / 57.16 kB gzip; ~23.02 kB CSS / 4.82 kB gzip.
- Shared API Biome: 87 files / 0 errors; strict TypeScript PASS; **46/46 unit tests PASS**; build PASS.
- Clean PostgreSQL migrations `0001` → `0018` PASS.
- Student Curriculum integration PASS.
- Student Reader integration PASS.
- Real Chromium **2/2 PASS**, including 390px Auth/Access/Curriculum and protected Reader media/OCR/search/connectivity/focus, plus Reader responsive checks at 768×1024 and 1366×900.

Stage14 product boundary now verified:

- activation/login/recovery/device/session;
- canonical entitlements + class-code redemption;
- server-authorized class → subject → ordered published lessons;
- protected Reader with server-authorized media and approved text only;
- in-lesson search + browser TTS capability UX;
- explicit loading/error/offline/reconnect behavior;
- learning-first authenticated hierarchy;
- keyboard lesson open + focus return;
- Student-local high-contrast focus-visible treatment.

Architecture decisions:

- No browser-owned curriculum/publication authority.
- No raw storage key exposure.
- No immutable Student media cache before entitlement-aware Stage16 design.
- No Router added without a verified deep-link/history requirement; current stateful navigation is simpler and verified.
- No Stage14 claim of installable/offline-learning PWA behavior.

Stage15 dependency at last live verification:

- `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Track A `integration/stage13f-question-bank @ 24549cd05cfde6d22b6a9847d195456cb3b9514e`
- Stage13F is still outside `main`.
- Therefore Student Stage15 = **BLOCKED**. Do not use mocks/temporary Question Bank/Quiz persistence and do not skip to Stage16.

When resuming Student work, first re-read `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`, `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`, Issue #16, live `main`, live Track A branch and exact current diffs.

## 1. Operating policy

- Repository: `7eaur/alwaslh`.
- Engineering mode: **Single Owner**; GitHub Issue `#16` is the sole execution board.
- `main` is the integration-approved development baseline, not deployment authority.
- Hosting/deployment is **fully deferred until VPS + explicit Product Owner reopening**.
- Root-cause fixes only. No test weakening, fake API, auth bypass, race-masking sleeps, duplicate queue/lifecycle, or client-owned durable state.

## 2. Stage13E final authority

Accepted candidate:

`72ead8446af237392dc6d953c8e0c2382f468286`

- candidate exact-head matrix: **12/12 SUCCESS**;
- PR #24: verification-only, closed unmerged.

Verified selective promotion/runtime SHA:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

- built from inspected `main @ e304d61286b9ca120db2dad695d29f4f1642e733`;
- exact accepted 36-file manifest;
- one promotion commit;
- promotion exact-head matrix: **12/12 SUCCESS**;
- PR #25: verification-only, closed unmerged;
- `main` fast-forwarded non-force after confirming it had not moved.

Docs-only closure commits may advance `main` later. The verified Stage13E runtime/application evidence remains `d5ebc7f...`.

## 3. Promotion verification runs

All SUCCESS on `d5ebc7f...`:

- Combined Stage13E `34401502463`
- Stage13E standalone `34401549935`
- Stage13E Frontend Prep `34401549849`
- Rebuild `34401550016`
- Stage13 Admin `34401549835`
- Stage9 `34401549851`
- Stage10 `34401549989`
- OCR `34401549910`
- Stage11 `34401549927`
- Stage12 `34401549964`
- Stage13D Content Ingestion `34401550065`
- Stage13D Admin Upload UI `34401549903`

The Combined workflow executed real checkout/setup, API/Admin lint+typecheck+unit+build, clean PostgreSQL migrations/contracts, Stage13E authority/review/concurrency, isolated Stage12/auth regressions, deterministic fixtures and real Admin Chromium.

## 4. Stage13E closed product boundary

Verified:

- authenticated Jobs/Units/Attempts/Outputs observability;
- server-derived progress/action authority;
- Stage12 pause/resume/cancel/retry reuse;
- complete bounded operational and review-history pagination;
- stable-output human review only;
- append-only edit/approve/reject under Stage11 validation;
- durable reject-note DB constraint;
- canonical latest review independent from selected audit page;
- snapshot-consistent Admin read models;
- bounded Job aggregation work;
- safe HTTP pagination representation boundary;
- safe telemetry/provenance with secret/raw-provider exclusion;
- real pagination/review/session-expiry/stale-409/reload/390px browser evidence.

Not Stage13E: Question Bank persistence/publication. That begins at Stage13F.

## 5. Findings state

- `AI-013E-DB-001` P1 — FIXED + VERIFIED.
- `AI-013E-REVIEW-002` P1 — FIXED + VERIFIED.
- `AI-013E-OPS-003` P1 — FIXED + VERIFIED.
- `AI-013E-OPS-004` P1 — FIXED + VERIFIED.
- `AI-013E-OPS-005` P2 — FIXED + VERIFIED.
- `AI-013E-OPS-006` P2 — FIXED + VERIFIED.
- `AI-013E-PERF-007` P2 — FIXED + VERIFIED.
- `AI-013E-API-008` P2 — FIXED + VERIFIED.
- `CI-013E-009` P1 — FIXED + VERIFIED.
- `AI-011-005` P2 — historical OPEN for Stage13F; use current Track A source for live status.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap `NOT YET VERIFIED`.
- `CI-001` — historical/nonblocking; exact external historical runner-allocation cause `NOT YET VERIFIED`.
- `STUDENT-014-API-001` P1 — RESOLVED + VERIFIED.
- `STUDENT-014-READER-001` P1 — RESOLVED + VERIFIED.
- `STUDENT-014-UX-002` P2 — RESOLVED + VERIFIED.
- `STUDENT-014-A11Y-003` P2 — RESOLVED + VERIFIED.
- `STUDENT-014-QA-004` P2 — RESOLVED + VERIFIED.
- `STUDENT-015-QB-001` P1 — BLOCKED by Stage13F promotion to `main`.

## 6. Current stage

Global Track A live state must be re-read before execution; the historical Stage13E closure below described Stage13F as ready/not started at that time.

Parallel Student Track current state:

**Stage14 CLOSED / VERIFIED; Stage15 BLOCKED pending canonical Stage13F Question Bank/Quiz authority.**

Do not infer Student Stage15 implementation from Stage13F branch work until that authority is in `main` and re-inspected.

Before any Student Stage15 coding:

1. live-check current `main`, Track A Stage13F and Issue #16;
2. verify Stage13F has been promoted to `main`;
3. inspect actual Question Bank/Quiz DB/API/Admin contracts and tests;
4. consume canonical authority instead of duplicating it;
5. define Student Practice/Test/Model flows from the real contract;
6. require PostgreSQL/API/Student real Chromium + wider same-head regressions.

Any uninspected Stage15 area = `NOT YET VERIFIED`.

## 7. Do not do

- Do not reopen PR #24/#25 or merge them; both served verification only.
- Do not re-import divergent Stage13E history.
- Do not start deployment/hosting.
- Do not claim live provider readiness from Stage13E.
- Do not allow raw/unreviewed AI output to become Question Bank/Student authority.
- Do not start Student Stage15 before Stage13F authority is canonical in `main`.
- Do not skip Student Stage15 to Stage16 merely because the dependency is blocked.

## 8. Mandatory startup

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. `PROJECT_RESUME_SNAPSHOT.md`
6. `PROJECT_ENGINEERING_LOG.md`
7. `PROJECT_INTEGRATION_CONTINUITY.md`
8. `PROJECT_EXECUTION_QUEUE.md`
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
10. `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`
11. latest Issue #16 comments
12. current `main` + Actions
13. current-stage code/tests
