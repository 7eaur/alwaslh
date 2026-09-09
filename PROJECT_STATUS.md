# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-09 — Stage13F Question Bank backend foundation VERIFIED on branch; Admin Question Bank UI is the active next batch.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Operating model: **ONE REPLACEABLE ENGINEERING OWNER**.
- Sole execution ledger: GitHub Issue `#16`.
- Hosting/deployment: **FULLY DEFERRED UNTIL VPS + explicit Product Owner reopening**.
- Verified Stage13E runtime/application SHA: `d5ebc7f25a369430387a758c7c0bb89350963d67`.
- Current Stage13F branch: `integration/stage13f-question-bank`.
- Verified Stage13F-A foundation HEAD: `b7a8668bc54b0265e57326b5c64e744366129daa`.
- Stage13F-A verification run: `34409961494` — **SUCCESS**.
- Current product position: **Stage13E CLOSED / VERIFIED; Stage13F ACTIVE — Question Bank backend foundation VERIFIED, Admin UI / Quiz Builder / export remain open.**
- Deployment remains deferred; this branch is development/integration authority only.

## Stage13F-A Question Bank Foundation — VERIFIED

Verified on exact HEAD `b7a8668bc54b0265e57326b5c64e744366129daa`:

- canonical reusable Question Bank persistence separate from assessment delivery snapshots;
- immutable revision history with stable item identity;
- explicit `draft → review → published` lifecycle plus archived historical revisions;
- typed `multiple_choice`, `true_false`, and `direct` persistence, closing the backend portion of `AI-011-005`;
- answer-shape and publication-state PostgreSQL invariants;
- class/subject/lesson provenance;
- AI source/page/checksum/OCR/content-source provenance;
- prompt key/version + generation mode import provenance;
- import only from the latest Stage13E `approve` authority;
- idempotent/concurrent approved-AI import without duplicate Question Bank items;
- manual create/edit/review/reject/publish API under existing Admin auth/origin boundaries;
- bounded pagination and safe offset validation;
- published revision replacement without mutating historical published content.

Run `34409961494` passed:

- API lint;
- API strict typecheck;
- 46 API unit tests;
- API build;
- clean PostgreSQL migrations `0001` through `0019_question_bank.sql`;
- Stage13F PostgreSQL contract checks;
- Stage13F real PostgreSQL integration including Stage13E approval → Stage13F import, direct-question persistence, concurrent idempotency, lifecycle, provenance, Admin-only authorization and HTTP validation.

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

Stage13E review **does not** publish to Question Bank. Stage13F-A now owns that reviewed persistence boundary.

## Root-cause CI fixes closed during verification

- `CI-013E-009`: stale standalone Stage13E DB contract assertion/quoting synchronized to migration + Combined contract — **FIXED / VERIFIED**.
- Standalone suite state pollution into Stage12 global-worker regressions fixed by database reset+migrate between suites — **FIXED / VERIFIED**.
- Combined workflow enabled for the short-lived promotion branch so exact promotion-head evidence could execute.
- Stage13F initial Biome-only failure was fixed without weakening lint; the unsafe test assertion was replaced with a runtime assertion.
- Stage13F authorization fixture failure was fixed by creating a valid student credential/device fixture rather than bypassing AuthService.

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
| Stage13F-A Question Bank Backend | **VERIFIED on branch** |
| Stage13F-B Admin Question Bank UI | **ACTIVE / NOT YET VERIFIED** |
| Stage13F-C Quiz Builder / versioning / regeneration / export | **REQUIRED / NOT YET VERIFIED** |
| Stage13G+ | REQUIRED later |
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
- `AI-011-005` P2 — **backend persistence FIXED + VERIFIED in Stage13F-A; Admin UI + delivery use remain open until Stage13F closure**.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- `CI-001` — historical hosted-runner allocation incident, **not blocking**. Exact external historical cause remains `NOT YET VERIFIED`.

## Exact Next Work

1. Build Stage13F-B Admin Question Bank workspace in `apps/admin-web` using the verified Stage13F-A API.
2. Cover loading/error/empty/search/filter/detail/manual edit/review/publish states and responsive/accessibility behavior.
3. Add Admin unit/API tests and real Chromium evidence for the Question Bank workspace.
4. Then implement Stage13F-C Quiz Builder, stable question selection/versioning, one-question deterministic regeneration and reviewed/published export authority.
5. Keep deployment/hosting deferred.

## Mandatory Startup

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current main/Actions → current stage code`.
