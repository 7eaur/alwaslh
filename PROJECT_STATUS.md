# PROJECT STATUS

- **Current Phase:** Stage12 Durable Provider-Neutral AI Execution — **ACTIVE / NOT YET VERIFIED**.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `592123dae33f0cfce2ecd36e9577764767faa95a` (Stage11 + OCR + Stage10 + Stage9 + Full Rebuild/Chromium all green).
- **Current Stage12 executable fix head:** `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Git auto-deployment remains intentionally disabled; hosted runtime is `NOT YET VERIFIED`.

## Verified baseline through Stage11

Stages 1–10, OCR and Stage11 are verified. Stage11 provides provider/model-neutral request/output contracts, versioned prompt registry, deterministic semantic/provenance validation, near-duplicate review handling and a provider-neutral benchmark harness.

Exact Stage11 verified executable head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

- Stage11 AI Contract Verification `34004445273` — SUCCESS.
- OCR Foundation Verification `34004445384` — SUCCESS.
- Stage10 Media Pipeline `34004445278` — SUCCESS.
- Stage9 Content Import Verification `34004445277` — SUCCESS.
- Rebuild Stage Verification `34004445394` — SUCCESS including Stage8 Chromium activation/login/recovery/rebind E2E.

## Stage12 discovery completed

Repository/caller inventory found that `database/migrations/0004_ai_and_sync.sql` already defines `ai_jobs`, `ai_job_units` and `ai_outputs`, but there was no current AI execution route, worker entrypoint or integration test consuming them. The active API registered auth/activation/access routes only; Admin still exposed an AI operations shell without an execution API.

Decision: **reuse and extend the existing AI job tables instead of creating a second orchestration system**.

## Stage12 implementation batch now present

The first Stage12 implementation batch adds:

- additive `database/migrations/0012_ai_execution.sql` execution hardening/telemetry;
- durable unit claiming with `FOR UPDATE SKIP LOCKED`;
- UUID lease token + expiry and stale-worker write rejection;
- attempt history/telemetry per provider route;
- deterministic generation-plan idempotency and plan fingerprinting;
- provider-neutral adapter boundary and `AiModelRouter`;
- provider call outside database transactions;
- Stage11 validation before persistence;
- model/route cascade for retryable provider failures or explicitly escalatable uncertain generated output;
- retry/backoff/jitter with bounded attempts;
- partial-success job counter reconciliation;
- cancellation that invalidates running leases and prevents stale completion;
- optional usage/latency/provider request/cost-micros telemetry without storing provider secrets;
- PostgreSQL integration coverage for idempotency, lease behavior, cascade, retry, cancellation and partial success;
- `.github/workflows/stage12-ai-execution.yml`.

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
→ job progress/partial-success reconciliation
```

## Stage12 invariants currently implemented

- no provider/network call occurs inside a database transaction;
- no completion/failure/output write is accepted from a stale or expired lease holder;
- cancellation removes the current worker's right to commit later results;
- the same idempotency key with a different plan fingerprint is rejected;
- provider/model/project/credential aliases are execution metadata only and do not leak into Stage11 domain contracts;
- provider secrets are not persisted in job/output tables;
- exact-source review requirements from Stage11 remain authoritative;
- invalid provider output can retry only within the configured bounded attempt count;
- `review_required` can be persisted as accepted work requiring human review rather than rewritten into fabricated certainty;
- direct-question Question Bank persistence remains unresolved and is not silently widened by Stage12.

## Current CI state

Stage12 implementation initially landed on `9f44881a24cc30fed958f72f6f5bbc1fc4f9b1a8` and received formatter-only follow-up fixes through `00c1affe9e7fb1fce4d9e305e7bd650beb8c4e9b`.

On exact head `00c1affe9e7fb1fce4d9e305e7bd650beb8c4e9b`, all six triggered workflows failed at the same shared API lint gate before TypeScript/PostgreSQL execution because Biome still requested one import formatting change in `apps/api/src/ai/execution-service.ts`:

- Stage12 AI Execution Verification `34005458936` — FAILURE at lint; later steps skipped.
- Stage11 AI Contract Verification `34005458938` — FAILURE from shared API lint.
- Rebuild Stage Verification `34005458950` — FAILURE from shared API lint.
- OCR Foundation Verification `34005458953` — FAILURE from shared API lint.
- Stage9 Content Import Verification `34005458943` — FAILURE from shared API lint.
- Stage10 Media Pipeline `34005458954` — FAILURE from shared API lint.

This was a formatting defect, not evidence of a Stage11/OCR/Stage9/Stage10 semantic regression. The final requested Biome import layout was applied in `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`.

**Stage12 remains `NOT YET VERIFIED` until the new head passes lint, strict typecheck, unit tests, build, clean PostgreSQL migrations, Stage12 integration tests and all lower-layer regression workflows on the same executable head.**

## Open Stage12 work after execution-core verification

1. Verify the current execution core on one exact head and fix any TypeScript/SQL/runtime defect found by evidence.
2. Add bounded global/provider/project/model concurrency/backpressure; current durable claim safety is not yet the full throughput limiter.
3. Add explicit health/cooldown/budget policy around router eligibility without credential rotation to evade quotas.
4. Add a worker entrypoint/lifecycle separate from the HTTP server, with graceful shutdown and bounded polling.
5. Add authenticated Admin execution/query/cancel/review surfaces only after the worker/service contract is stable.
6. Execute real provider/model benchmark evidence before choosing production routes/defaults.
7. Keep live credentials, pricing and production routing `NOT YET VERIFIED` until explicitly configured and tested.

## Stable lower-layer boundaries

- Stage9 canonical source inventory remains 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR remains derived from ready media; only reviewed/approved OCR is downstream approved text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Current Question Bank persistence still supports only `multiple_choice | true_false`; AI `direct` extraction is reviewable output, not auto-publishable Question Bank data.

## Last build/test

**Last fully green executable head:** `592123dae33f0cfce2ecd36e9577764767faa95a`.

**Current Stage12 head:** `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6` — shared Biome fix applied; full same-head verification pending.

## Next step

Run/inspect Stage12 + Stage11 + OCR + Stage10 + Stage9 + Full Rebuild on the current Stage12 head. Fix only evidence-backed defects, update this file and `PROJECT_ENGINEERING_LOG.md` after each meaningful batch, and do not claim Stage12 verified before same-head PostgreSQL/runtime regression evidence is green.
