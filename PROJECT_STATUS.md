# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — main/global Stage13E state preserved; parallel Student Track Stage14 CLOSED / VERIFIED on its isolated branch.**

## Parallel Student Product Track — Stage14 CLOSED / VERIFIED

This section is branch-specific and does **not** mean the Student work has been promoted to `main`.

- Branch: `parallel/stage14-student-product`.
- Verified Stage14 runtime/code HEAD: `ac55f1435d232cadff334816407f1182125dda90`.
- Documentation-only closure commits may advance the branch beyond that runtime SHA; they are not new runtime evidence.
- Stage14 Student Product state on this branch: **CLOSED / VERIFIED**.
- Stage14 Student Product run `34420993805`: **SUCCESS** on exact runtime HEAD `ac55f143...`.
- Stage14 Student API Regression run `34420993840`: **SUCCESS** on exact runtime HEAD `ac55f143...`.
- Student: ESLint PASS, strict TypeScript PASS, Vitest **12/12 PASS**, production build PASS.
- Production Student bundle at closure: ~**184.20 kB JS / 57.16 kB gzip**, ~**23.02 kB CSS / 4.82 kB gzip**.
- Shared API regression: Biome **87 files / 0 errors**, strict TypeScript PASS, **46/46 unit tests PASS**, build PASS.
- Clean PostgreSQL migrations `0001` → `0018`: PASS.
- Student Curriculum integration: PASS.
- Student Reader integration: PASS.
- Real Chromium: **2/2 PASS**, covering Auth/Access/Curriculum and protected Reader with media/OCR/search/connectivity/focus/responsive behavior.
- Verified responsive Reader path: 390×844, 768×1024 and 1366×900 with no horizontal overflow.
- Stage14 authenticated hierarchy is learning-first: Curriculum/Reader precedes access administration.
- Stage14 does not claim installable/offline-learning PWA behavior; that is Stage16.
- No Router was added because Stage14 has no verified deep-link/shareable-URL requirement; stateful class→subject→lesson navigation is the simpler verified contract.

Current integration dependency boundary at last live verification:

- `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Track A `integration/stage13f-question-bank @ 24549cd05cfde6d22b6a9847d195456cb3b9514e`
- Stage15 Student Practice/Test/Models: **BLOCKED until Stage13F Question Bank/Quiz authority is canonical in `main`**.
- Do not replace this dependency with mocks, temporary persistence, duplicate Question Bank/Quiz models, or by skipping ahead to Stage16.

## Current Position

- Repository: `7eaur/alwaslh`.
- Operating model: **ONE REPLACEABLE ENGINEERING OWNER**.
- Sole execution ledger: GitHub Issue `#16`.
- Hosting/deployment: **FULLY DEFERRED UNTIL VPS + explicit Product Owner reopening**.
- Verified Stage13E runtime/application SHA: `d5ebc7f25a369430387a758c7c0bb89350963d67`.
- That promotion commit is a direct child of `e304d61286b9ca120db2dad695d29f4f1642e733`; no divergent candidate history or merge commit was imported.
- Current documentation-closure work may advance `main` beyond the verified runtime SHA. Docs-only commits are not new runtime evidence.
- Current global/main product position recorded by this historical section: **Stage13E CLOSED / VERIFIED; Stage13F READY / NOT STARTED**. The live parallel Track A branch may be newer; use GitHub live state before executing Stage13F/Stage15 work.
- Stage13F implementation had not started in the Stage13E closure batch described below.

## Stage13E Verification — CLOSED / VERIFIED

Accepted candidate HEAD:

`72ead8446af237392dc6d953c8e0c2382f468286`

Candidate verification: **12/12 SUCCESS on the exact same HEAD**. Candidate PR `#24` was verification-only and was closed **unmerged**.

Selective promotion HEAD:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Promotion verification: **12/12 SUCCESS on the exact same HEAD**. Promotion PR `#25` was verification-only, contained one commit / 36 changed files, and was closed **unmerged**.

Promotion run evidence:

| Gate | Run |
|---|---:|
| Stage13E Combined Integration | `34401502463` |
| Stage13E Admin AI Operations | `34401549935` |
| Stage13E Frontend Preparation | `34401549849` |
| Rebuild Stage Verification | `34401550016` |
| Stage13 Admin Product | `34401549835` |
| Stage9 Content Import | `34401549851` |
| Stage10 Media Pipeline | `34401549989` |
| OCR Foundation | `34401549910` |
| Stage11 AI Contracts | `34401549927` |
| Stage12 AI Execution | `34401549964` |
| Stage13D Content Ingestion | `34401550065` |
| Stage13D Admin Upload UI | `34401549903` |

The Combined gate includes API/Admin lint, strict typecheck, unit/build, clean PostgreSQL migrations through `0018_ai_admin_review.sql`, Stage13E DB/authority/review/concurrency regressions, isolated Stage12/auth regressions, deterministic fixtures and **real Chromium Admin E2E**.

## Stage13E Closed Scope

Verified Stage13E provides:

- authenticated Admin Jobs/Units/Attempts/Outputs observability;
- server-derived lifecycle/progress/action authority using Stage12;
- pause/resume/cancel/retry without a second queue;
- bounded Jobs/Units/Attempts/Review History pagination;
- append-only edit/approve/reject review validated by Stage11;
- review only for execution-stable outputs;
- durable reject-note DB invariant;
- canonical latest review authority independent from historical audit page;
- short `REPEATABLE READ` snapshots for coupled Admin read models;
- Job-page-before-Unit-aggregation query shape;
- safe pagination offsets bounded to `Number.MAX_SAFE_INTEGER`;
- safe provider/model/project/provenance observability without raw secrets/provider responses/internal errors;
- real session-expiry, stale-review `409`, reload durability and 390px responsive evidence.

Stage13E review **does not** publish to Question Bank. That is Stage13F.

## Root-cause CI fixes closed during verification

- `CI-013E-009`: stale standalone Stage13E DB contract assertion/quoting synchronized to migration + Combined contract — **FIXED / VERIFIED**.
- Standalone suite state pollution into Stage12 global-worker regressions fixed by database reset+migrate between suites — **FIXED / VERIFIED**.
- Combined workflow enabled for the short-lived promotion branch so exact promotion-head evidence could execute.

No product rule, security boundary, DB invariant or test expectation was weakened.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 AI Contracts | VERIFIED |
| Stage12 Durable AI Execution | VERIFIED backend/runtime; live provider bootstrap remains unverified |
| Stage13A Curriculum Backend | VERIFIED |
| Stage13B Admin Curriculum UI | VERIFIED |
| Stage13C Content/Media/OCR | VERIFIED |
| Stage13D Upload/History/Publication | VERIFIED incl. Chromium |
| Stage13E Admin AI Operations / Review | **VERIFIED / PROMOTED TO MAIN** |
| Stage13F Question Bank / Quiz Builder | **LIVE STATE MUST BE RE-CHECKED; parallel Track A branch exists outside `main` at last Student closure verification** |
| Parallel Student Stage14 | **CLOSED / VERIFIED on `parallel/stage14-student-product`; NOT PROMOTED TO MAIN** |
| Student Stage15 | **BLOCKED by Stage13F promotion** |
| Student Stage16+ | REQUIRED later by sequence |
| Deployment stages | FUTURE only after VPS + explicit reopening |

## Findings State

- `AI-013E-DB-001` P1 — FIXED + VERIFIED.
- `AI-013E-REVIEW-002` P1 — FIXED + VERIFIED.
- `AI-013E-OPS-003` P1 — FIXED + VERIFIED incl. Chromium.
- `AI-013E-OPS-004` P1 — FIXED + VERIFIED incl. Chromium.
- `AI-013E-OPS-005` P2 — FIXED + VERIFIED.
- `AI-013E-OPS-006` P2 — FIXED + VERIFIED.
- `AI-013E-PERF-007` P2 — FIXED + VERIFIED.
- `AI-013E-API-008` P2 — FIXED + VERIFIED.
- `CI-013E-009` P1 — FIXED + VERIFIED.
- `CI-001` — historical hosted-runner allocation incident, **not blocking**. Exact external historical cause remains `NOT YET VERIFIED`.
- `AI-011-005` P2 — Stage13F reviewed direct Question Bank persistence; historical OPEN state; use current Track A source for live status.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- `STUDENT-014-API-001` P1 — RESOLVED + VERIFIED.
- `STUDENT-014-READER-001` P1 — RESOLVED + VERIFIED.
- `STUDENT-014-UX-002` P2 — RESOLVED + VERIFIED.
- `STUDENT-014-A11Y-003` P2 — RESOLVED + VERIFIED.
- `STUDENT-014-QA-004` P2 — RESOLVED + VERIFIED.
- `STUDENT-015-QB-001` P1 — BLOCKED by Track A promotion to `main`.

## Exact Next Work

Global/Track A historical next work remains Stage13F according to its own current branch/source of truth.

For the parallel Student Track:

1. Keep Stage14 branch stable; runtime evidence is `ac55f143...`.
2. Re-check `main` + Track A before every Stage15 attempt.
3. Start Stage15 only after canonical Question Bank/Quiz contracts are present in `main` and have been read directly.
4. Keep deployment/hosting deferred.
5. Do not skip Stage15 to begin Stage16 solely because the Stage15 dependency is blocked.

## Mandatory Startup

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current main/Actions → current stage code`.
