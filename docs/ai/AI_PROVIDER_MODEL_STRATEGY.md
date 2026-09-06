# AI PROVIDER / MODEL STRATEGY

> Decision snapshot: 2026-09-06. Provider pricing/free tiers/rate limits change frequently; re-check official terms before live benchmarking or production routing. Architecture must not depend on today's prices.

## Goal

Generate the largest **useful and publishable** educational output volume with controlled cost, low token waste, strong Arabic/scientific correctness and resilient throughput.

Primary KPI:

```text
accepted reviewed outputs
-------------------------
cost + tokens + latency
```

Secondary KPIs include schema-valid rate, semantic/provenance-valid rate, duplicate rate, Admin rejection/edit rate, retry/failure rate, latency and tokens/cost per accepted item.

## Authoritative architecture

No direct provider calls from domain services.

```text
Generation Plan / Service
→ Stage11 typed request + Prompt Registry
→ Stage12 AiModelRouter
→ AiProviderAdapter
→ normalized structured Stage11 output
→ Stage11 validators/provenance/dedupe
→ durable result / review
```

Provider-specific payloads, errors and usage metadata stay inside adapters.

## Stage11 verified contract layer

Stage11 is now **VERIFIED** on exact executable head `592123dae33f0cfce2ecd36e9577764767faa95a`.

Implemented under `apps/api/src/ai`:

- provider-neutral Zod request/output/source/question contracts;
- versioned Prompt Registry;
- provider-neutral prompt envelope;
- deterministic schema/semantic/provenance/count/notation/duplicate validators;
- explicit `valid | invalid | review_required` outcomes;
- exact-source rule that unresolved answers remain unknown/review-required rather than being guessed;
- exact duplicate rejection + near-duplicate review;
- source-controlled golden/hardening tests;
- provider-neutral benchmark adapter harness with usage/result summary.

Stage11 verification: `34004445273` SUCCESS, with OCR `34004445384`, Stage10 `34004445278`, Stage9 `34004445277` and Full Rebuild `34004445394` also SUCCESS on the same executable head.

No live provider/model quality claim was made in Stage11.

## Input/source policy

Textbook generation should use reviewed OCR text first:

```text
ready source media
→ reviewed OCR extraction
→ bounded source/page chunk + checksum identity
→ Stage11 request
```

Vision/raw-image input is fallback-only when text evidence cannot safely satisfy the mode. Vision fallback is explicit and review-gated.

Book-generated questions require source/page evidence. Exact/source-sensitive output must preserve source evidence and uncertainty; no fabricated answer certainty is allowed.

## Candidate provider/model pool for live benchmark

Initial benchmark candidates may include:

1. Google Gemini Flash-class models;
2. Groq-hosted GPT-OSS or other production text models;
3. pinned OpenRouter models where availability/terms are suitable;
4. additional providers only when they can be benchmarked through the same Stage11 adapter contract.

A provider/model is not approved because it is free, fast or popular. It must beat alternatives on accepted-output quality/cost/time for the relevant task family.

## Model routing by task

### Tier A — cheap/fast approved first pass

Use only after golden/live benchmark evidence for modes such as standard MCQ, simple True/False, simple summaries, classification or normalization helpers.

### Tier B — stronger generation

Use directly or as escalation for harder Arabic phrasing, multi-step science, chemistry/math notation, nuanced explanation/method, or units rejected/uncertain after Tier A.

### Exact/sensitive source modes

Religious/source-exact text, formulas/tables and OCR-uncertain material require stricter provenance/evidence. Human Admin review remains mandatory where Stage11 marks the mode/source as review-required.

## Cascade rule

```text
job unit
→ cheapest benchmark-approved route for this mode/domain
→ Stage11 schema validator
→ semantic validator
→ provenance validator
→ duplicate validator
   ├── PASS → Draft/review flow
   └── FAIL/UNCERTAIN → stronger approved route for this unit only
```

Never regenerate already accepted units because another unit failed.

## Stage12 execution policy

Stage12 is the active engineering phase and must reuse/extend existing durable primitives from `database/migrations/0004_ai_and_sync.sql` rather than create a parallel queue.

Required behavior:

- reviewed OCR reuse;
- bounded source/page chunks, not whole-book repeated prompts;
- durable `ai_jobs / ai_job_units / ai_outputs` where appropriate;
- deterministic per-unit idempotency;
- bounded global/provider/project/model concurrency;
- scheduler backpressure;
- retry only retryable errors with exponential backoff + jitter;
- cooldown/Retry-After handling for rate limits;
- provider/credential health state;
- partial-success checkpoints;
- cancel/resume/progress;
- no unbounded in-memory batch state;
- provider/model/prompt/source/validation/token/latency/error/cost telemetry;
- budget ceilings/kill switch;
- server-only provider configuration;
- model cascade only after benchmark evidence;
- no credential/project switching to evade quotas or terms.

## Credential policy

- all provider secrets are server-only;
- no provider keys in Student/Admin bundles or repository files;
- DB/UI may reference non-secret provider/project/credential aliases only;
- credentials/projects have health/cooldown/budget metadata;
- legitimate failover is allowed only across intentionally configured authorized accounts/projects;
- multiple keys in one provider project do not imply extra quota;
- no routing behavior may evade provider limits or terms.

## Golden / live benchmark dataset

Use the same source-controlled cases across candidates. Include Arabic prose, religious exact-source cases, chemistry notation, physics formulas, mathematics, tables, noisy OCR, short/long lessons, MCQ, T/F, mixed counts, summaries, exact/replica/exam extraction, alternate versions and regeneration.

Measure:

- structured-output validity;
- answer correctness;
- explanation quality;
- source/page fidelity;
- unresolved-answer honesty;
- duplicate/near-duplicate rate;
- Arabic/scientific notation quality;
- tokens;
- latency;
- estimated/actual cost where available;
- Admin acceptance/edit rate.

## Production selection rule

Routing decisions are versioned evidence, not hard-coded preference:

```text
mode + subject family + difficulty/sensitivity
→ preferred provider/model
→ fallback/escalation route
→ benchmark version
→ output/token limits
→ concurrency/budget policy
```

A slightly more expensive model can be cheaper overall if it produces materially more accepted outputs.

## Current implementation status

- Provider-neutral Stage11 contracts/Prompt Registry/validators/golden harness: **VERIFIED**.
- Durable Stage12 router/scheduler/worker/cascade: **NOT YET VERIFIED / ACTIVE NEXT WORK**.
- Live provider adapters with authorized credentials: **NOT YET VERIFIED**.
- Live cross-provider/model benchmark results: **NOT YET VERIFIED**.
- Production default routing/budget configuration: **NOT YET VERIFIED**.
- Hosted AI worker/runtime behavior: **NOT YET VERIFIED** while deployment remains deferred by Product Owner.
