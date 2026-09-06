# PROJECT STATUS

- **Current Phase:** Stage12 Durable Provider-Neutral AI Execution — execution core **VERIFIED**; concurrency/backpressure + health/budget + worker lifecycle remain **ACTIVE / NOT YET VERIFIED**.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Git auto-deployment remains intentionally disabled; hosted runtime is `NOT YET VERIFIED`.

## Verified baseline through Stage12 execution core

Stages 1–10, OCR, Stage11 and the first durable Stage12 execution core are verified on one exact executable head.

Exact verified executable head: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

- Stage12 AI Execution Verification `34006710501` — **SUCCESS**.
- Stage11 AI Contract Verification `34006710456` — **SUCCESS**.
- OCR Foundation Verification `34006710511` — **SUCCESS** including real Tesseract runtime.
- Stage10 Media Pipeline `34006710490` — **SUCCESS** including real PDF extraction/transform/replay.
- Stage9 Content Import Verification `34006710461` — **SUCCESS** including complete 5,552-image inventory + idempotent re-import.
- Rebuild Stage Verification `34006710470` — **SUCCESS** including Stage8 Chromium activation/login/recovery browser E2E.

## Stage12 discovery decision

`database/migrations/0004_ai_and_sync.sql` already contained `ai_jobs`, `ai_job_units` and `ai_outputs`, but there was no current AI execution route, worker entrypoint or integration test consuming them. The implementation therefore **reuses and extends the existing durable AI tables** instead of creating a second queue/orchestration system.

## Verified Stage12 execution core

Implemented and now verified:

- additive `database/migrations/0012_ai_execution.sql`;
- deterministic generation-plan idempotency + plan fingerprint conflict detection;
- durable unit claiming with `FOR UPDATE SKIP LOCKED`;
- UUID lease token + expiry;
- strong `running ↔ active lease` database invariant;
- stale/expired worker rejection for attempt telemetry, unit state and output writes;
- attempt history/telemetry per provider route;
- provider-neutral `AiProviderAdapter` + `AiModelRouter`;
- provider/network execution outside DB transactions;
- Stage11 schema/semantic/provenance/duplicate validation before durable output acceptance;
- bounded route cascade;
- retryable-error retry with exponential backoff + jitter and max attempts;
- `review_required` as a durable non-fabricated review state;
- partial-success job counter reconciliation;
- cancellation that removes worker write authority and preserves lock ordering;
- optional provider/model/project/credential aliases, provider request id, tokens, latency, errors and cost-micros telemetry without storing secrets;
- PostgreSQL lifecycle coverage for idempotency, lease behavior, stale-worker recovery, cascade, retry, cancellation and partial success.

### Execution pipeline

```text
Generation Plan
→ Stage11 typed source/page requests
→ durable ai_jobs / ai_job_units
→ short transactional claim + lease
→ AiModelRouter
→ provider adapter call OUTSIDE DB transaction
→ Stage11 validation
→ lease-protected attempt/output persistence
→ retry | review_required | completed | failed
→ job progress / partial-success reconciliation
```

## Evidence-backed defects fixed during Stage12 core

### Shared formatter gate

Head `00c1affe9e7fb1fce4d9e305e7bd650beb8c4e9b` failed all six workflows at the same API Biome gate. This was formatting-only; TypeScript/PostgreSQL steps had not executed. Fixed without semantic changes.

### AI-012-009 — stale attempt telemetry write

Static review found that unit/output writes were lease-protected but an old worker could still finalize its `ai_execution_attempts` row after lease expiry. Fix at `592e3848fc347ef7aeca9c9de75d4519e2d9433b`:

- `finishAttemptSuccess/Failure` now require the current unexpired unit lease;
- migration enforces the strong running-lease shape;
- cancellation uses unit→attempt lock ordering;
- integration test proves stale attempt remains running until recovery, then becomes `failed/lease_expired`, and a new leased attempt may complete.

### Integration test SQL ambiguity

Stage12 run `34006606146` on `592e3848…` passed lint, typecheck, unit tests, build, clean migrations and DB contract checks, then failed only because the test query selected unqualified `status` after joining two tables that both expose that column. Production execution logic was not failing. The test was corrected to `a.status` / `a.attempt_number` in `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`, after which all six verification workflows passed.

## Stage12 invariants now verified

- no provider/network call occurs inside a DB transaction;
- running AI units always have an active lease identity shape;
- stale/expired/cancelled workers cannot finalize attempts, units or outputs;
- cancellation clears current execution authority;
- same idempotency key with a changed plan fingerprint is rejected;
- provider/model/project/credential fields remain execution metadata, not Stage11 domain contracts;
- provider secrets are not persisted;
- exact-source review requirements remain authoritative;
- retries are bounded;
- partial successes survive sibling failures;
- direct-question Question Bank persistence remains unresolved and is not silently widened.

## Remaining Stage12 work

1. Add **distributed bounded global/provider/project/model concurrency + scheduler backpressure**. Durable claim safety alone is not a throughput limiter.
2. Add route health/cooldown/Retry-After and budget ceilings/kill switch without credential rotation to evade quotas or terms.
3. Add explicit progress/resume semantics where needed by the Stage12 job contract.
4. Add a dedicated worker lifecycle separate from the HTTP server, with graceful shutdown and bounded polling.
5. Run real provider/model benchmark evidence before enabling production routes/defaults.
6. Keep live credentials, current pricing, production routing and hosted worker runtime `NOT YET VERIFIED` until explicitly configured/tested.

Admin execution/query/cancel/review UI/API remains a Stage13 integration concern after the backend worker contract stabilizes.

## Stable lower-layer boundaries

- Stage9 canonical source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR remains derived from ready media; only reviewed/approved OCR is downstream approved text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Current Question Bank persistence supports only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output, not auto-publishable Question Bank data.

## Last build/test

**Last fully green executable head:** `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

**Next engineering batch:** Stage12 distributed concurrency/backpressure, built as a separate batch above the verified core.
