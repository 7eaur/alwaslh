# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. للتفاصيل الحالية اقرأ `PROJECT_RESUME_SNAPSHOT.md` ثم `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, و`PROJECT_EXECUTION_QUEUE.md`.

Last synchronized: **2026-09-09 22:57 Asia/Aden — Stage13E Combined Gate PASS; wider candidate matrix has 10 SUCCESS and one standalone CI-workflow drift failure; Stage13E remains NOT YET VERIFIED until that workflow is synchronized and exact-head wider matrix is fully green.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Operating model: **ONE REPLACEABLE ENGINEERING OWNER**.
- Sole execution ledger: GitHub Issue `#16`.
- Hosting/deployment: **FULLY DEFERRED UNTIL VPS**; not a current blocker or Stage gate.
- Current `main` after this documentation batch: read live before work; immediately before this sync it was `22e8ad71a413d0d5434710ae3cb58303e3e82b5a`, then documentation commits advanced it.
- Latest fully verified pre-Stage13E baseline remains `4eca7de8877ac9e2289b9c7990c912d33c256935` until Stage13E promotion closes.
- Current product stage: **Stage13E Admin AI Operations / Review**.
- Candidate branch: `integration/stage13e-ai-operations`.
- Current executable candidate HEAD: `e291c6bde3971845048bf8bcc4561b65d3c702e6`.
- Verification-only Draft PR: **#24**. It is for CI triggering only and **MUST NOT BE MERGED**.
- Stage13F remains blocked by Stage13E closure.

## Stage13E Combined Gate — PASS

Workflow: `.github/workflows/stage13e-integration.yml`.

Successful run: **`34394580893`** on exact candidate HEAD `e291c6bde3971845048bf8bcc4561b65d3c702e6`.

PASS evidence includes:

- API lint/typecheck/unit/build;
- Admin lint/typecheck/unit/build;
- clean PostgreSQL migrations through `0018_ai_admin_review.sql`;
- Stage13E PostgreSQL constraints/contracts;
- Stage13E backend authority/review/concurrency regressions;
- isolated Stage12 execution/capacity/control/lifecycle regressions;
- auth regression;
- real Super Admin bootstrap;
- deterministic Stage13E browser fixtures and DB invariants;
- Chromium installation;
- **real Admin Chromium suite 5/5 PASS** including pagination/history, pause/resume/review durability, real session expiry, real stale-review 409 canonical refresh and 390px responsive behavior.

## Root-cause fixes that enabled Combined PASS

1. Admin test mock reused a consumed `Response` → fresh response per request.
2. Combined DB contract shell quote/parenthesis defect → syntax corrected only.
3. Stage13E integration queue state polluted Stage12 global-worker regression → clean DB reset/migrate between suites.
4. Browser seed `CASE` timestamp inferred as text → explicit `::timestamptz`.
5. Playwright heading locator was ambiguous → exact H1 locator.
6. Session-expiry E2E sent JSON Content-Type on a bodyless logout unlike production → logout helper now matches production transport and sends only `Origin`.

No product behavior/test expectation/security boundary was weakened.

## Wider Same-head Candidate Matrix

Draft PR #24 triggered the existing `pull_request` workflows.

### SUCCESS

| Gate | Run |
|---|---:|
| Stage9 Content Import | `34395033866` |
| Stage10 Media Pipeline | `34395033929` |
| OCR Foundation | `34395033922` |
| Stage11 AI Contracts | `34395033876` |
| Stage12 AI Execution | `34395033892` |
| Stage13 Admin Product | `34395033898` |
| Stage13D Content Ingestion | `34395033978` |
| Stage13D Admin Upload UI | `34395034010` |
| Full Rebuild | `34395033928` |
| Stage13E Frontend Preparation | `34395033957` |

### Remaining red gate

`Stage 13E Admin AI Operations Verification` — run `34395034000`, job `102612508570`.

Observed result:

- API quality gates PASS;
- clean migrations PASS;
- failure only at `Verify Stage13E PostgreSQL contracts`;
- shell error: `unexpected EOF while looking for matching ')'`.

Root cause: `.github/workflows/stage13e-ai-operations.yml` is **stale relative to the current migration and the passing Combined workflow**. It still carries the old shell quoting defect and older three-constraint/two-index expectations. Current durable contract has four review constraints including reject-note enforcement, and the redundant latest-review index was intentionally removed.

Classification: **CI WORKFLOW DRIFT / NOT PRODUCT FAILURE**.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 AI Contracts | VERIFIED |
| Stage12 Durable AI Execution | VERIFIED backend/runtime; live provider bootstrap unverified |
| Stage13A Curriculum Backend | VERIFIED |
| Stage13B Admin Curriculum UI | VERIFIED |
| Stage13C Content/Media/OCR | VERIFIED |
| Stage13D Upload/History/Publication | VERIFIED incl. Chromium |
| Stage13E Admin AI Operations / Review | **COMBINED PASS / WIDER MATRIX 10 GREEN + 1 CI-DRIFT RED / NOT YET VERIFIED** |
| Stage13F Question Bank / Quiz Builder | BLOCKED by Stage13E closure |
| Stage13G+ | REQUIRED later |
| Deployment stages | future only after VPS + explicit reopening |

## Current Open Findings

- `AI-013E-DB-001` P1 — FIXED; Combined executable PASS.
- `AI-013E-REVIEW-002` P1 — FIXED; Combined executable PASS.
- `AI-013E-OPS-003` P1 — FIXED; real Chromium pagination PASS.
- `AI-013E-OPS-004` P1 — FIXED; real Chromium audit/current-authority PASS.
- `AI-013E-OPS-005` P2 — FIXED; Combined PASS.
- `AI-013E-OPS-006` P2 — FIXED; Combined PASS.
- `AI-013E-PERF-007` P2 — FIXED; Combined PASS.
- `AI-013E-API-008` P2 — FIXED; Combined PASS.
- `CI-001` historical hosted-runner allocation incident — **not currently blocking**; runners execute again. Exact external historical cause remains NOT YET VERIFIED.
- **`CI-013E-009` P1 — standalone Stage13E workflow contract assertion drift; OPEN, current closure blocker.**
- `AI-011-005` P2 — Stage13F direct reviewed Question Bank persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap NOT YET VERIFIED.

## Exact Next Work

1. Read `PROJECT_RESUME_SNAPSHOT.md` and live-check current GitHub heads/runs.
2. Keep PR #24 Draft/open and unmerged.
3. Compare `.github/workflows/stage13e-ai-operations.yml` with passing `.github/workflows/stage13e-integration.yml` + `0018_ai_admin_review.sql`.
4. Fix only stale standalone DB contract assertions/quoting; preserve all real gates.
5. Push to candidate branch and let PR #24 rerun on the new exact HEAD.
6. Require all wider workflows to PASS.
7. Close PR #24 unmerged.
8. Re-check latest `main` vs candidate overlap; then follow `docs/integration/STAGE13E_PROMOTION_MANIFEST.md` to build `integration/stage13e-promotion` from latest `main`.
9. Run Combined + wider matrix again on exact promotion HEAD.
10. Promotion-head PASS → integrate Stage13E to `main`, update Roadmap/Legacy Coverage/closure docs and Issue #16.
11. Only then begin Stage13F.

## Mandatory Startup

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → PR #24 → current Stage13E code/workflows/tests`.
