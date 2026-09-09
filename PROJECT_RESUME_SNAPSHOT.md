# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> **Latest continuation authority for the next engineering conversation.**
> Read this after `PROJECT_HANDOFF.md` / `PROJECT_STATUS.md`. Code, migrations and executable CI evidence still outrank prose.

Last synchronized: **2026-09-09 22:57 Asia/Aden**.

## 1. Operating policy

- Repository: `7eaur/alwaslh`.
- Engineering mode: **Single Owner**. GitHub Issue `#16` is the sole execution board.
- `main` is the Integration-approved development baseline, **not** a deployment branch.
- Hosting/deployment is **fully deferred until a VPS exists and Product Owner explicitly reopens it**.
- Do not work on Render/Vercel/Railway/hosted smoke/provider cutover now.
- Root-cause fixes only. No test weakening, fake API, auth bypass, sleeps to hide races, duplicate queue/lifecycle, or client-owned durable state.

## 2. Current exact heads

- Current `main`: `22e8ad71a413d0d5434710ae3cb58303e3e82b5a`.
- Stage13E candidate branch: `integration/stage13e-ai-operations`.
- Current executable candidate HEAD: `e291c6bde3971845048bf8bcc4561b65d3c702e6`.
- Verification-only PR: **#24** (`integration/stage13e-ai-operations` → `main`), Draft, **MUST NOT BE MERGED**.
- PR #24 base at creation: `main @ 22e8ad71a413d0d5434710ae3cb58303e3e82b5a`.
- PR #24 reported candidate diff: **36 files**.

Historical source branches are evidence only; do not merge their old histories directly.

## 3. Current Stage

Current stage: **Stage13E — Admin AI Operations / Review**.

Status: **COMBINED GATE PASS / WIDER MATRIX ALMOST PASS / NOT YET VERIFIED / OUTSIDE `main`**.

Stage13F remains blocked until Stage13E is closed unless Product Owner explicitly changes ordering.

## 4. What Stage13E contains

Candidate includes:

- Admin Jobs/Units/Attempts/Outputs observability;
- server-derived progress and allowed actions;
- Stage12 pause/resume/cancel/retry authority reuse;
- bounded Jobs/Units/Attempts/Review History pagination;
- stable-output review authority (`completed | review_required` only);
- append-only edit/approve/reject review validated by Stage11;
- PostgreSQL reject-note durable invariant;
- canonical latest review independent from historical page selection;
- repeatable-read snapshot consistency for multi-query Admin AI read models;
- Job pagination before expensive Unit aggregation;
- safe pagination offsets bounded to JavaScript safe integers;
- real Admin browser coverage for pagination, pause/resume, review durability, session expiry, stale 409 race and 390px responsive behavior;
- no Stage13F Question Bank publication yet.

## 5. Executed root-cause fixes during final Combined Gate

### CI/Test harness fixes

1. Admin API unit-test mock returned the same `Response` object and consumed its body before transport read it.
   - Root fix: each mocked request gets a fresh `Response`.
   - Result: Admin tests moved from 32/33 to 33/33 PASS.

2. Combined DB contract shell assertion had an unmatched quote/parenthesis.
   - Root fix: correct the assertion shell syntax only.
   - No migration/DB contract weakening.

3. Stage12 wider regressions initially failed because Stage13E integration tests intentionally left claimable queue state in the same database and Stage12 `processNext()` is a global queue worker.
   - Root cause: test-suite database pollution, not lifecycle behavior.
   - Root fix: reset PostgreSQL and re-apply migrations before Stage12/auth regressions.
   - No production worker behavior or expectations changed.

4. Stage13E browser seed used an untyped timestamp parameter in a `CASE`, inferred by PostgreSQL as `text` against `timestamptz` columns.
   - Root fix: explicit `$6::timestamptz` in fixture SQL.

5. Playwright workspace heading locator matched multiple headings.
   - Root fix: exact H1 locator (`exact: true`), no UI behavior change.

6. Real session-expiry E2E helper sent `Content-Type: application/json` on a bodyless logout request; production `logoutAdmin()` does not.
   - This made Fastify parse an empty JSON body and produced HTTP 500 before normal logout behavior.
   - Root fix: logout E2E sends only `Origin`; JSON Content-Type remains only on review PATCH requests with JSON body.
   - This is test-fidelity correction, not auth bypass.

## 6. Combined Gate — PASS

Workflow: `.github/workflows/stage13e-integration.yml`.

Exact candidate HEAD: `e291c6bde3971845048bf8bcc4561b65d3c702e6`.

Successful run: **`34394580893`**.

All required steps PASS:

1. runner/container/checkout/setup;
2. API + Admin dependency install;
3. API lint/typecheck/unit/build;
4. Admin lint/typecheck/unit/build;
5. clean PostgreSQL migrations through `0018_ai_admin_review.sql`;
6. Stage13E PostgreSQL contract assertions;
7. Stage13E backend authority/review/concurrency regressions;
8. fresh DB reset before Stage12/auth;
9. Stage12 execution/capacity/control/job-lifecycle regressions;
10. auth security regression;
11. fresh browser database;
12. explicit Super Admin bootstrap;
13. real Stage13E browser fixture seed;
14. fixture DB invariants;
15. Chromium installation;
16. real Admin Chromium suite.

Final Chromium result on this run: **5/5 PASS**.

Important previous run evidence:

- `34394111277` reached Chromium and produced 4/5 PASS; only session-expiry failed because the E2E helper sent a bodyless request with JSON Content-Type.
- That root cause was corrected at `e291c6bd...`, then run `34394580893` passed completely.

## 7. Wider same-head matrix — current state

Because the connected GitHub tool has no workflow-dispatch write action, a Draft verification-only PR #24 was opened to trigger all existing `pull_request` workflows against the candidate.

PR #24 is **not** a delivery PR and must not be merged.

Candidate commit used for PR trigger: `e291c6bde3971845048bf8bcc4561b65d3c702e6`.

### PASS workflows

- Stage 9 Content Import Verification — run `34395033866` — SUCCESS.
- Stage 10 Media Pipeline — run `34395033929` — SUCCESS.
- OCR Foundation Verification — run `34395033922` — SUCCESS.
- Stage 11 AI Contract Verification — run `34395033876` — SUCCESS.
- Stage 12 AI Execution Verification — run `34395033892` — SUCCESS.
- Stage 13 Admin Product Verification — run `34395033898` — SUCCESS.
- Stage 13D Content Ingestion Verification — run `34395033978` — SUCCESS.
- Stage 13D Admin Upload UI Verification — run `34395034010` — SUCCESS.
- Rebuild Stage Verification — run `34395033928` — SUCCESS.
- Stage 13E Frontend Preparation Verification — run `34395033957` — SUCCESS.

### Only failing workflow

- Stage 13E Admin AI Operations Verification — run `34395034000` — FAILURE.
- Job: `102612508570`.
- API lint/typecheck/unit/build: PASS.
- Clean migrations: PASS.
- Failure step: `Verify Stage13E PostgreSQL contracts`.
- Failure text: `unexpected EOF while looking for matching ')'`.

This is **not a product/database failure**. The standalone workflow `.github/workflows/stage13e-ai-operations.yml` is stale relative to the already-correct Combined Gate:

- it still contains the old shell quoting defect;
- it expects the older three-constraint / two-index contract;
- current migration intentionally has four review constraints including `ai_output_review_events_reject_note_required`;
- the redundant latest-review index was intentionally removed because UNIQUE `(ai_output_id, revision)` already serves latest-revision scans;
- the Combined workflow has the corrected contract and passed it on real PostgreSQL.

Therefore the remaining Stage13E closure blocker is **CI workflow drift**, not application behavior.

## 8. Exact next action for the new conversation

Do these in order:

1. Re-read current GitHub source of truth and live-check heads/runs before editing.
2. Keep PR #24 open and unmerged.
3. Inspect `.github/workflows/stage13e-ai-operations.yml` against `.github/workflows/stage13e-integration.yml` and migration `0018_ai_admin_review.sql`.
4. Fix only the stale standalone PostgreSQL contract assertion:
   - correct shell quoting;
   - expect the current four review constraints;
   - do not require the removed redundant latest-review index;
   - preserve the remaining legitimate index/contract assertions.
5. Add/retain regression protection; do not weaken any gate.
6. Push the workflow sync to `integration/stage13e-ai-operations`.
7. Let PR #24 rerun the wider matrix on the new candidate HEAD.
8. Require all relevant workflows to PASS on that new exact HEAD.
9. Once wider candidate matrix is fully green, close PR #24 unmerged.
10. Re-live-check latest `main` and candidate overlap. Do not assume `main` stayed unchanged.
11. Follow `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`:
    - create `integration/stage13e-promotion` from latest `main`;
    - overlay only the accepted Stage13E manifest files;
    - reject unrelated/central-doc regressions;
    - run Combined + wider matrix again on the exact promotion HEAD.
12. Only after promotion-head PASS, integrate Stage13E into `main` and update Roadmap/Legacy Coverage/central docs + Issue #16 Closure Report.
13. Only then start Stage13F.

## 9. Stage13E findings status

- `AI-013E-DB-001` P1 — FIXED; Combined executable verification PASS.
- `AI-013E-REVIEW-002` P1 — FIXED; Combined executable verification PASS.
- `AI-013E-OPS-003` P1 — FIXED; real Chromium pagination PASS.
- `AI-013E-OPS-004` P1 — FIXED; real Chromium review-history/current-authority PASS.
- `AI-013E-OPS-005` P2 — FIXED; tests/Combined PASS.
- `AI-013E-OPS-006` P2 — FIXED; tests/Combined PASS.
- `AI-013E-PERF-007` P2 — FIXED; tests/Combined PASS.
- `AI-013E-API-008` P2 — FIXED; API tests/Combined PASS.
- `CI-001` P1 old hosted-runner allocation incident — no longer blocking current work; real runners are executing again. Exact historical external cause remains NOT YET VERIFIED unless account/platform evidence becomes available.
- `AI-011-005` P2 — OPEN; Stage13F direct reviewed Question Bank persistence.
- `AI-012-019` P2 — OPEN / NOT YET VERIFIED; live provider benchmark/routes/credentials/bootstrap.

## 10. Do not do

- Do not mark Stage13E VERIFIED yet; one required wider workflow is still red due workflow drift.
- Do not merge PR #24.
- Do not merge the stale candidate history directly into `main`.
- Do not start Stage13F before Stage13E closure.
- Do not reopen hosting/deployment work.
- Do not rewrite product code because the remaining failure is in standalone CI assertion drift.

## 11. Mandatory startup for next chat

Read in this order:

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. **`PROJECT_RESUME_SNAPSHOT.md`**
6. `PROJECT_ENGINEERING_LOG.md`
7. `PROJECT_INTEGRATION_CONTINUITY.md`
8. `PROJECT_EXECUTION_QUEUE.md`
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
10. `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`
11. `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`
12. latest Issue #16 comments
13. PR #24 current checks and changed files
14. current Stage13E workflow/code/migrations/tests

If any older central prose still says Stage13E has no executable runner evidence, this snapshot plus current GitHub Actions evidence supersedes that stale statement until the next full consolidation batch.
