# PROJECT STATUS

- **Current Phase:** Stage12 Durable Provider-Neutral AI Execution — core + distributed capacity/backpressure + health/cooldown/Retry-After/budget controls **VERIFIED**; explicit job pause/resume/progress **IMPLEMENTED / VERIFICATION PENDING**; dedicated worker lifecycle follows only after this batch closes.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.
- **Verified-baseline documentation closure:** `6cac332f356b9f1b4faf3d7fb5b9b736a1e076b4`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Git auto-deployment remains intentionally disabled; hosted runtime is `NOT YET VERIFIED`.

## Verified baseline through Stage12 operational controls

Exact executable head: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

- Stage12 AI Execution Verification `34086168715` — **SUCCESS** including lifecycle, distributed capacity races, global/route kill switches, Retry-After cooldown and global/route budget ceilings.
- Stage11 AI Contract Verification `34086168704` — **SUCCESS**.
- OCR Foundation Verification `34086168712` — **SUCCESS** including real Tesseract.
- Stage10 Media Pipeline `34086168727` — **SUCCESS**.
- Stage9 Content Import Verification `34086168687` — **SUCCESS**.
- Rebuild Stage Verification `34086168772` — **SUCCESS** including Chromium.

Earlier Stage12 checkpoints:

- execution core: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`;
- distributed capacity/backpressure: `881102ff94711f908104cd068a003ad598609944`.

## Verified Stage12 execution / operational behavior

Verified through `0014_ai_execution_controls.sql`:

- existing `ai_jobs / ai_job_units / ai_outputs` reused; no parallel queue;
- deterministic plan idempotency/fingerprint conflict detection;
- durable short `SKIP LOCKED` unit claims + UUID leases;
- stale/expired/cancelled workers cannot finalize attempts/units/outputs;
- provider calls remain outside DB transactions;
- Stage11 validation remains authoritative;
- bounded cascade/retry/backoff/jitter;
- cancellation + partial success;
- PostgreSQL-coordinated global/provider/project/model capacity;
- capacity/control deferral does not consume another semantic retry;
- global and full-route kill switches;
- persisted Retry-After/health cooldown;
- conservative global + route budget admission;
- full route runtime identity: route + provider + project + credential + model;
- no operational pressure causes silent expensive-route escalation.

Budget reservation remains a safety ceiling, not proof of actual provider billing. Live pricing/billing evidence is `NOT YET VERIFIED`.

## Current isolated batch — explicit job pause/resume/progress

Implementation is present in this batch but remains **NOT YET VERIFIED** until Stage12 + Stage11 + OCR + Stage10 + Stage9 + Full Rebuild/Chromium all pass on one exact implementation head.

Architecture:

- `ai_jobs.paused_at` is an operator scheduling gate, separate from aggregate `ai_job_status`;
- effective progress may report `paused` while underlying execution status stays `queued | running | retrying`;
- `resume_route_key` remains internal route continuation and is not job resume;
- pause and claim lock the same `ai_jobs` row, so pause/claim races have an explicit ordering;
- pause stops new claims but does not revoke an already valid in-flight lease;
- resume clears only the scheduling gate; it does not reset accepted outputs, attempts or retry/backoff state;
- completed/failed/cancelled jobs cannot be resumed;
- progress is derived from durable unit state.

### Root-cause lease recovery hardening in this batch

Design review found that an expired running lease could remain represented as `running` until a later claim. That is incorrect for a paused job because there must be no claim while paused.

The new lifecycle recovery closes the expired attempt and immediately releases non-exhausted units to durable `retrying` with lease fields cleared. Exhausted units remain handled by the existing terminal max-attempt path. This makes progress match actual execution authority.

Detailed contract: `docs/ai/STAGE12_JOB_LIFECYCLE.md`.

## Verification gates for current batch

Stage12 workflow now verifies:

- `ai_jobs.paused_at` + unpaused claim index;
- existing execution lifecycle regression unchanged;
- capacity regression unchanged;
- operational-control regression unchanged;
- pause before claim consumes zero attempts;
- pause during provider call preserves in-flight authority and blocks sibling claims;
- resume preserves prior accepted output and attempt counts;
- paused lease expiry becomes `retrying`, not stale `running`;
- terminal/cancel rules remain strict.

Until those gates and lower-layer regressions pass: **pause/resume/progress = NOT YET VERIFIED**.

## Remaining Stage12 work

1. Fix any evidence-backed failure in the pause/resume/progress batch and close it on one exact head.
2. Implement dedicated AI worker process separate from Fastify, with bounded slots/polling and graceful drain.
3. Run real provider/model benchmark evidence before production routes/defaults.
4. Keep live credentials, current pricing, actual provider billing, production routing and hosted worker runtime `NOT YET VERIFIED` until explicitly configured/tested.

Admin AI execution/query/cancel/review UI/API remains Stage13 integration after backend worker stability.

## Stable lower-layer boundaries

- Stage9 source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR derives only from ready media; only reviewed/approved OCR is downstream approved text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Question Bank currently persists only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output, not auto-publishable data.

## Last verified build/test

**Last fully green executable head:** `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

**Current implementation state:** pause/resume/progress implemented, verification pending. Deployment remains deferred.
