# Stage13E Executable Checkpoint — 2026-09-09

> Engineering-log addendum for the current Stage13E closure cycle. This file supplements `PROJECT_ENGINEERING_LOG.md`; it does not replace historical entries.

## Checkpoint

- Stage: Stage13E Admin AI Operations / Review.
- Candidate branch: `integration/stage13e-ai-operations`.
- Executable candidate HEAD: `e291c6bde3971845048bf8bcc4561b65d3c702e6`.
- Combined workflow: `.github/workflows/stage13e-integration.yml`.
- Combined PASS run: `34394580893`.
- Verification-only Draft PR: #24; never merge it.

## Executed verification

Combined run `34394580893` passed API/Admin quality, clean migrations, Stage13E DB contracts, Stage13E backend regressions, isolated Stage12/auth regressions, deterministic browser fixtures/invariants and real Chromium 5/5.

The final browser PASS proves:

- durable pagination/history navigation;
- canonical current review authority independent from historical pages;
- pause/resume control path;
- review approval durability after reload;
- real session expiry/logout path;
- real stale-review 409 canonical refresh;
- 390px no-horizontal-overflow.

## Root-cause fixes executed in the closure cycle

### TEST-013E-001 — Consumed Response body in Admin mock
Severity: P2 · Area: Admin test harness.

Problem: mock returned the same `Response` object; request assertion consumed `body` before transport read it.

Solution: fresh `Response` per request.

Status: FIXED / executable Admin tests PASS.

### CI-013E-002 — Combined DB assertion shell syntax
Severity: P1 · Area: Combined workflow.

Problem: unmatched quote/parenthesis produced shell EOF.

Solution: correct syntax only; DB contract unchanged.

Status: FIXED / Combined DB contract PASS.

### TEST-013E-003 — Cross-suite PostgreSQL queue pollution
Severity: P1 · Area: Integration test isolation.

Problem: Stage13E tests intentionally left claimable queue state; Stage12 `processNext()` is global and consumed the older Stage13E unit, leaving the Stage12 fixture queued.

Solution: reset schema and re-run migrations before Stage12/auth wider regressions.

Status: FIXED / Stage12 + auth regressions PASS. Production worker behavior unchanged.

### TEST-013E-004 — Browser fixture timestamp typing
Severity: P2 · Area: Fixture SQL.

Problem: PostgreSQL inferred a `CASE` parameter as text against `timestamptz` columns.

Solution: explicit `::timestamptz` cast.

Status: FIXED / fixture seed + invariants PASS.

### TEST-013E-005 — Playwright heading ambiguity
Severity: P2 · Area: Browser harness.

Problem: locator matched multiple headings before behavior assertions.

Solution: exact H1 match.

Status: FIXED.

### TEST-013E-006 — Logout helper request fidelity
Severity: P1 · Area: Browser integration harness.

Problem: E2E helper sent `Content-Type: application/json` on a bodyless logout request while production `logoutAdmin()` sends no content type without a body. Fastify rejected the empty JSON request before route behavior.

Solution: logout helper sends only `Origin`; JSON Content-Type remains on JSON PATCH requests.

Status: FIXED / Chromium session-expiry flow PASS.

## Wider candidate regression matrix

Triggered through Draft verification-only PR #24.

SUCCESS:

- Stage9 `34395033866`
- Stage10 `34395033929`
- OCR `34395033922`
- Stage11 `34395033876`
- Stage12 `34395033892`
- Stage13 Admin `34395033898`
- Stage13D Content Ingestion `34395033978`
- Stage13D Admin Upload UI `34395034010`
- Full Rebuild `34395033928`
- Stage13E Frontend Preparation `34395033957`

Remaining failure:

- Stage13E Admin AI Operations `34395034000`, job `102612508570`.
- API quality PASS.
- clean migrations PASS.
- failure only at PostgreSQL contract assertion with shell `unexpected EOF while looking for matching ')'`.

## CI-013E-009 — Standalone Stage13E workflow contract drift
Severity: **P1** · Area: CI / Stage13E standalone workflow.

Problem:

`.github/workflows/stage13e-ai-operations.yml` remains on an older assertion contract. It contains the shell quoting defect and expects the older three review constraints plus two indexes.

Evidence:

- migration `0018_ai_admin_review.sql` currently has four review constraints, including `ai_output_review_events_reject_note_required`;
- redundant latest-review index was intentionally removed because UNIQUE `(ai_output_id, revision)` serves reverse latest revision access;
- Combined workflow uses the current DB contract and passed on real PostgreSQL;
- standalone run reached real runner, checkout, API tests and migrations before failing only at its stale assertion step.

Impact:

Stage13E cannot yet be declared VERIFIED because the required wider same-head matrix is not fully green, despite product/runtime gates being green.

Correct solution:

Synchronize only the standalone DB contract assertion with current migration/Combined workflow:

1. correct shell quoting;
2. require all current four review constraints;
3. stop requiring the removed redundant latest-review index;
4. preserve legitimate remaining index assertions;
5. do not weaken tests or migration rules.

Status: **OPEN — exact next task**.

## Architecture / process decisions reaffirmed

- Combined PASS does not by itself close Stage13E; wider same-head evidence is still required.
- Verification PR #24 is CI-trigger-only and must close unmerged.
- Divergent candidate history must not be merged directly into `main`.
- After wider candidate PASS, promotion must be assembled from latest `main` using `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`, then Combined + wider gates rerun on the exact promotion HEAD.
- If `main` moves, rebuild/reverify promotion from latest `main`.
- Stage13F remains blocked until Stage13E closure.
- Hosting/deployment remains fully deferred until explicit VPS reopening.

## Historical CI-001 update

The prior GitHub-hosted runner allocation incident is no longer the active blocker: current jobs receive real runners and execute checkout/tests. The exact historical external cause remains NOT YET VERIFIED because no account/platform telemetry established it.

## Exact continuation

Read `PROJECT_RESUME_SNAPSHOT.md`. Fix `CI-013E-009` only, rerun the wider PR matrix on the resulting exact candidate HEAD, then continue selective promotion and Stage13E closure.
