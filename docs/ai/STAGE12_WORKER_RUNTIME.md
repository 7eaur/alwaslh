# Stage12 AI Worker Runtime

Status: **IMPLEMENTED / VERIFICATION PENDING**.

This document defines the dedicated Stage12 worker lifecycle. It intentionally does **not** claim a live-provider bootstrap: no production AI adapter, credential set, benchmark-approved route or hosted worker process exists yet.

## Responsibility boundary

`apps/api/src/server.ts` remains HTTP-only. It must not poll `ai_job_units`.

The worker runtime consumes exactly one durable unit per `processNext()` call through the existing `AiExecutionService` contract:

```text
bounded worker slot
→ AiExecutionService.processNext()
→ short PostgreSQL claim/lease transaction
→ provider call outside DB transaction
→ lease-protected persistence
→ next unit or bounded idle polling
```

The runtime owns process-level scheduling only. PostgreSQL remains authoritative for leases, distributed capacity, pause/resume, cooldown, kill switches and budget admission.

## Bounded concurrency

`AiWorkerRuntime` creates a fixed number of slots at startup. It does not prefetch a book, plan or large unit batch into memory.

Each slot performs at most one `processNext()` at a time. Distributed Stage12 admission remains the final concurrency authority across processes.

Default runtime bounds:

- slots: `4`;
- idle poll minimum: `100 ms`;
- idle poll maximum: `2000 ms`;
- idle backoff factor: `2`.

Constructor validation prevents zero/unbounded slot counts and invalid polling ceilings.

## Idle polling

A slot that receives `null` from `processNext()` sleeps instead of spinning.

The delay increases exponentially up to the configured maximum. Any useful processed unit resets that slot to the minimum delay.

The runtime keeps no in-memory queue.

## Graceful shutdown

Shutdown is a scheduling stop, not a lease revocation:

```text
shutdown signal
→ runtime marks stopping
→ abort idle sleeps
→ no new processNext() calls start
→ already-running processNext() calls continue
→ their existing leases remain authoritative
→ all slots drain
→ database closes last
```

This matches the pause/lease model: a valid in-flight worker may finish, while stale writes are still rejected by the existing lease checks.

`runAiWorkerProcess()` accepts an `AbortSignal` so a future standalone worker entrypoint can map `SIGTERM` / `SIGINT` to the same lifecycle without coupling Fastify to the worker.

## Failure behavior

An unexpected `processNext()` exception is **fail-fast**:

1. the first unexpected slot error requests runtime stop;
2. idle slots wake and stop claiming;
3. other in-flight slots drain;
4. database close is attempted;
5. the original runtime error is rethrown;
6. if both runtime and database close fail, both errors are preserved in an `AggregateError`.

The runtime does not hide programming/data/DB failures inside an infinite polling loop. Expected provider retry/cooldown/backpressure remains handled durably inside Stage12 execution itself.

## Abrupt death

Abrupt process termination cannot run graceful drain. Existing Stage12 UUID leases + expiry recovery remain the recovery mechanism:

```text
process disappears
→ lease expires
→ running attempt closes as lease_expired
→ non-exhausted unit returns to durable retrying
→ future worker may claim it
```

No new recovery queue is introduced.

## Verification coverage

`apps/api/tests/ai-worker.test.ts` covers:

- slot concurrency never exceeds the configured bound;
- shutdown starts no new claims after the signal;
- in-flight work drains before database close;
- idle polling backs off to the configured ceiling;
- useful work resets idle backoff;
- unexpected processor errors fail fast while resources still close;
- invalid/unbounded worker settings are rejected.

Stage12 CI also keeps the PostgreSQL lease-expiry integration tests, which cover crash-style recovery at the durable execution layer.

## Explicitly not yet implemented / verified

- live provider adapters with authorized credentials;
- benchmark-approved production routes/models;
- a production `worker.ts` bootstrap that constructs those live adapters/routes;
- hosted worker deployment/runtime;
- actual provider billing reconciliation.

Do not add a fake adapter or invented route merely to create a runnable production script. Once real provider configuration is authorized and benchmarked, the standalone bootstrap should create the database + router + `AiExecutionService`, pass it into `AiWorkerRuntime`, wire `SIGTERM/SIGINT` to an `AbortController`, and let `runAiWorkerProcess()` close the database after drain.
