# STAGE12 JOB LIFECYCLE — PAUSE / RESUME / PROGRESS

Status: **IMPLEMENTED / VERIFICATION PENDING**

Parent verified baseline: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.
Documentation closure for that baseline: `6cac332f356b9f1b4faf3d7fb5b9b736a1e076b4`.

## Problem

Stage12 already had durable execution, route continuation (`resume_route_key`), cancellation, capacity/backpressure and operational controls. It did **not** have an explicit operator-level job pause/resume contract.

`resume_route_key` is internal scheduler state and must never be exposed as job resume.

## Architecture decision

Pause is modeled as an **orthogonal scheduling gate** on `ai_jobs.paused_at`; the existing `ai_job_status` continues to describe aggregate execution state (`queued | running | retrying | completed | failed | cancelled`).

This separation avoids conflating two different facts:

- execution state: what durable units are doing;
- operator scheduling control: whether new claims are allowed.

The effective progress status may therefore be `paused` while the underlying durable execution status remains `queued`, `running` or `retrying`.

## Concurrency contract

Pause must be race-safe with claims.

`claimNext` now locks both the selected `ai_jobs` row and `ai_job_units` row in the short claim transaction:

```text
FOR UPDATE OF j, u SKIP LOCKED
```

Pause/resume lock the same `ai_jobs` row with `FOR UPDATE`.

Therefore:

- if claim commits first, that unit is already in-flight and pause may follow; the unit keeps its lease authority;
- if pause commits first, later claims see `paused_at IS NOT NULL` and cannot claim that job;
- provider calls remain outside the transaction.

## Pause semantics

- pause is durable (`paused_at`);
- pause is idempotent while the job is active;
- completed/failed/cancelled jobs are not pauseable;
- no new units may be claimed from a paused job;
- an already leased unit keeps its lease and may safely complete/fail;
- pause does not reset `attempt_count`, `next_attempt_at`, accepted outputs or review state.

## Resume semantics

- resume clears the scheduling gate only;
- it does not reset successful units, failed history, retry count, route continuation or backoff;
- resume is idempotent for an active non-paused job;
- completed/failed/cancelled jobs are not resumable;
- cancellation remains terminal and clears any active pause gate.

## Lease expiry while paused

A separate correctness issue was identified during design: previously an expired running lease could remain represented as `running` until a future claim reclaimed it.

That is misleading when the job is paused because no claim should occur.

Stage12 lifecycle recovery now:

1. closes the expired running attempt as `failed / lease_expired`;
2. immediately releases a non-exhausted unit to durable `retrying` with lease fields cleared;
3. leaves exhausted units for the existing terminal `lease_expired_max_attempts` path;
4. refreshes job aggregate state;
5. claim remains blocked while `paused_at` is set.

This makes progress reflect actual execution authority: an expired worker is no longer shown as running.

## Progress contract

Progress is server-derived from durable `ai_job_units` only.

Returned fields include:

- effective lifecycle status;
- underlying execution status;
- `pausedAt`;
- total units;
- accepted units (`completed + review_required`);
- completed;
- review-required;
- failed;
- cancelled;
- queued;
- running;
- retrying;
- settled units;
- remaining units;
- integer completion percentage based on settled units.

The client does not submit or authoritatively calculate progress.

## Database change

`database/migrations/0015_ai_job_lifecycle.sql` adds:

- `ai_jobs.paused_at timestamptz`;
- partial claim-supporting index `idx_ai_jobs_claimable_unpaused`.

No new job enum is introduced because pause is a scheduling-control dimension, not a replacement execution state.

## Verification plan

The Stage12 workflow adds schema checks and a PostgreSQL/browser-independent lifecycle integration suite covering:

1. pause before first claim → zero attempt consumption;
2. resume → claim becomes possible;
3. pause during a real deferred provider call → in-flight lease remains valid;
4. no second claim while paused;
5. successful in-flight completion preserves pause for unfinished siblings;
6. resume continues remaining work without resetting accepted units/attempt counts;
7. terminal jobs reject pause/resume;
8. lease expiry during pause becomes durable `retrying`, not stale `running`;
9. resume after lease recovery creates the next legitimate attempt;
10. cancellation remains terminal and clears pause.

Until CI passes on one exact head, this batch is **NOT YET VERIFIED**.

## Non-goals

This batch does not add:

- Admin UI/API integration (Stage13 concern);
- live provider adapters/credentials;
- production routing defaults;
- dedicated worker runtime;
- hosted deployment.

The next isolated batch after this closes is the dedicated AI worker process with bounded slots, bounded polling and graceful drain.
