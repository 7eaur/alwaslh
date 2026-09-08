# AI PROVIDER / MODEL STRATEGY

> Decision snapshot: 2026-09-07. Provider pricing/free tiers/rate limits change frequently; re-check official terms before live benchmarking or production routing. Architecture must not depend on today's prices.

## Goal

Generate the largest **useful and publishable** educational output volume with controlled cost, low token waste, strong Arabic/scientific correctness and resilient throughput.

Primary KPI:

```text
accepted reviewed outputs
-------------------------
cost + tokens + latency
```

Secondary KPIs: schema-valid rate, semantic/provenance-valid rate, duplicate rate, Admin rejection/edit rate, retry/failure rate, latency and tokens/cost per accepted item.

## Authoritative architecture

No direct provider calls from domain services.

```text
Generation Plan / Service
→ Stage11 typed request + Prompt Registry
→ Stage12 durable unit + lease
→ distributed capacity + operational admission
→ Stage12 AiModelRouter
→ AiProviderAdapter
→ normalized structured Stage11 output
→ Stage11 validators/provenance/dedupe
→ lease-protected durable result / review
```

Provider-specific payloads, errors and usage metadata stay inside adapters. Provider/network calls happen outside database transactions.

The process-level scheduler is separate from Fastify:

```text
standalone worker process
→ fixed AiWorkerRuntime slots
→ AiExecutionService.processNext()
→ durable PostgreSQL claim/admission/lease
```

## Verified checkpoints

### Stage11 contract layer — VERIFIED

Stage11 provides provider-neutral Zod request/output/source/question contracts, versioned Prompt Registry, deterministic schema/semantic/provenance/count/notation/duplicate validators, explicit `valid | invalid | review_required`, exact-source uncertainty handling, golden tests and provider-neutral benchmark harness.

### Stage12 durable execution core — VERIFIED

Checkpoint: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Verified: existing `ai_jobs / ai_job_units / ai_outputs` reuse, idempotent plans, `SKIP LOCKED` claims, UUID leases, stale-worker rejection, attempt telemetry, provider calls outside transactions, Stage11 validation, bounded cascade/retry, cancellation safety and partial success.

### Stage12 distributed capacity / backpressure — VERIFIED

Checkpoint: `881102ff94711f908104cd068a003ad598609944`.

- PostgreSQL-coordinated global/provider/project/model concurrency;
- transaction-scoped advisory admission lock only around count/check/attempt insert;
- `resume_route_key` preserves the intended route under pressure;
- capacity deferral does not consume another semantic retry;
- capacity pressure does not silently escalate to a more expensive route;
- race tests prove concurrent workers cannot over-admit configured limits.

### Stage12 health / cooldown / budget controls — VERIFIED

Checkpoint: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Verified controls:

- singleton global kill switch;
- route kill switch keyed by **full route identity**;
- persisted provider Retry-After / health cooldown;
- consecutive retryable-failure threshold cooldown;
- conservative global and route budget windows;
- pre-call budget reservation persisted on attempts;
- budget admission and capacity admission share the short PostgreSQL advisory critical section;
- `control_deferred_count` records operational deferrals;
- control deferral keeps the intended `resume_route_key` and does not consume another semantic retry.

Route operational identity is:

```text
route_key
+ provider_key
+ provider_project_alias
+ credential_alias
+ model_used
```

`route_key` is not globally unique. Migration `0014_ai_execution_controls.sql` uses a surrogate UUID primary key plus `UNIQUE NULLS NOT DISTINCT` over the full identity. Cooldown, health, route budget configuration and route budget usage aggregation use that same identity.

### Stage12 explicit pause / resume / progress — VERIFIED

Checkpoint: `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`.

Verified semantics:

- `ai_jobs.paused_at` is a durable operator scheduling gate, separate from aggregate execution status;
- `resume_route_key` remains internal route continuation and is not job resume;
- pause and claim serialize on the same job row;
- pause blocks new claims without revoking an already-valid in-flight lease;
- resume preserves completed/review outputs, attempt counts, retry/backoff and route continuation;
- completed/failed/cancelled jobs cannot resume;
- progress is derived from durable unit state;
- expired non-exhausted leases are released immediately to durable `retrying`, including while paused.

Lifecycle ownership cleanup on `e7b95042a017ea558db9f769a46a37f155273a15` removed obsolete duplicate claim/recovery implementations from `AiExecutionRepository`; `AiJobLifecycleRepository` is the single owner. The full same-head matrix remained green.

### Stage12 dedicated worker runtime — VERIFIED

Final executable head: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

Same-head verification:

- Stage12 `34089764278` — SUCCESS including worker lifecycle + execution/capacity/control/pause PostgreSQL regressions.
- Stage11 `34089764339` — SUCCESS.
- OCR `34089764349` — SUCCESS.
- Stage10 `34089764277` — SUCCESS.
- Stage9 `34089764344` — SUCCESS.
- Full Rebuild `34089764467` — SUCCESS including Chromium.

Verified runtime behavior:

- Fastify remains HTTP-only;
- fixed bounded worker slots;
- no large in-memory prefetch queue;
- one `processNext()` call per slot at a time;
- bounded exponential idle polling/backoff;
- useful work resets polling delay;
- graceful stop prevents new claims and wakes idle slots;
- in-flight work is not aborted and drains under its existing lease authority;
- database closes after drain;
- unexpected processor failures are fail-fast rather than silently retried forever;
- abrupt process death is recovered by the existing durable lease-expiry path.

Detailed contract: `docs/ai/STAGE12_WORKER_RUNTIME.md`.

## Budget evidence boundary

Budget admission is conservative safety control, not billing truth.

For an attempt inside the configured window, usage contribution is:

```text
max(configured pre-call reservation, reported estimated cost)
```

A new attempt is rejected/deferred before the provider call if its configured reservation would exceed the global or exact-route ceiling. Actual provider invoice accuracy, live prices and reconciliation remain **NOT YET VERIFIED** until authorized live adapters and benchmark/billing evidence exist.

## Input/source policy

Textbook generation uses reviewed OCR text first:

```text
ready source media
→ reviewed OCR extraction
→ bounded source/page chunk + checksum identity
→ Stage11 request
```

Vision/raw-image input is fallback-only when text evidence cannot safely satisfy the mode. Vision fallback is explicit and review-gated. Book-generated questions require source/page evidence. Exact/source-sensitive output preserves uncertainty; no fabricated answer certainty is allowed.

## Model routing policy

A provider/model is not approved because it is free, fast or popular. Production route eligibility requires benchmark evidence for the relevant mode/domain/sensitivity.

Routing principle:

```text
mode + subject family + sensitivity
→ cheapest benchmark-approved route
→ Stage11 validation
→ accepted/review
   or, only for semantic failure/uncertainty allowed by policy,
→ stronger approved route
```

Capacity, cooldown or budget pressure is **not semantic failure** and therefore does not justify automatic escalation by itself.

## Candidate live benchmark pool

When live benchmarking is explicitly authorized, candidates may include production-grade Gemini Flash-class models, Groq-hosted text models, pinned OpenRouter routes or other providers that can implement the same Stage11 adapter contract. Provider terms, privacy, current pricing and limits must be re-verified at benchmark time.

No current provider/model is production-approved yet.

## Health / quota / credential policy

- provider secrets are server-only;
- no provider keys in Student/Admin bundles or Git;
- DB/UI may reference non-secret provider/project/credential aliases only;
- legitimate failover is allowed only across intentionally authorized routes/projects;
- multiple keys do not imply additional quota and must not be rotated to evade limits/terms;
- Retry-After and configured health cooldown are distributed operational state in PostgreSQL;
- kill switches stop new attempts without invalidating existing lease/cancellation rules.

## Golden / live benchmark dataset

Use the same source-controlled cases across candidates. Include Arabic prose, religious exact-source cases, chemistry notation, physics formulas, mathematics, tables, noisy OCR, short/long lessons, MCQ, T/F, mixed counts, summaries, exact/replica/exam extraction, alternate versions and regeneration.

Measure structured validity, answer correctness, explanation quality, source/page fidelity, unresolved-answer honesty, duplicate/near-duplicate rate, Arabic/scientific notation quality, tokens, latency, estimated/actual cost where available and Admin acceptance/edit rate.

## Worker bootstrap boundary

The **worker lifecycle is verified**, but a live production bootstrap is intentionally not fabricated.

Still `NOT YET VERIFIED`:

- authorized live provider credentials;
- live provider adapters in production configuration;
- benchmark-approved production routes/models;
- a production `worker.ts` entrypoint constructing those adapters/routes;
- hosted worker runtime.

Once authorized live configuration exists, the standalone bootstrap should:

```text
load server-only provider configuration
→ create Database
→ create approved adapters + AiModelRouter
→ create AiExecutionService
→ create AiWorkerRuntime
→ map SIGTERM/SIGINT to AbortController
→ runAiWorkerProcess()
→ close DB after graceful drain
```

Do not add placeholder adapters, fake credentials or invented routes merely to make this script executable.

## Current implementation status

- Stage11 provider-neutral contracts / Prompt Registry / validators / golden harness: **VERIFIED**.
- Stage12 durable execution core: **VERIFIED**.
- Stage12 distributed concurrency/backpressure: **VERIFIED**.
- Stage12 health/cooldown/Retry-After/global+route budget admission: **VERIFIED**.
- Stage12 explicit job pause/resume/progress + lease recovery: **VERIFIED**.
- Stage12 bounded dedicated worker lifecycle/runtime: **VERIFIED** on `45a902eb…`.
- Live provider adapters with authorized credentials: **NOT YET VERIFIED**.
- Live cross-provider/model benchmark: **NOT YET VERIFIED**.
- Production routing/budget values and actual provider billing: **NOT YET VERIFIED**.
- Production live worker bootstrap: **NOT YET VERIFIED**.
- Hosted AI worker/runtime: **NOT YET VERIFIED** while deployment remains deferred by Product Owner.
