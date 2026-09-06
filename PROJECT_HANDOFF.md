# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → Product decisions → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → parity/coverage docs → roadmap. Repository + CI evidence are authoritative.

## Product / repository state

- Product: Arabic educational platform with independent Student PWA, Admin Web and Backend API.
- Repository: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.
- Stage11 Provider-Neutral AI Prompt / Output Contracts: **VERIFIED**.
- Stage12 durable AI **execution core: VERIFIED**.
- Active Stage12 work: **distributed concurrency/backpressure → health/cooldown/budget → resume/progress → worker lifecycle**.
- Deployment: `DEFERRED BY PRODUCT OWNER`; Git auto-deploy remains disabled. Hosted behavior is `NOT YET VERIFIED` until explicitly re-enabled and tested.

## Stable architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── Stage10 media identity/storage abstraction
                   ├── reviewed OCR text / OCR Foundation
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable AI execution
                   └── later TTS / notifications / offline sync
```

Hard boundaries:

- browser never receives DB/provider secrets or performs authoritative business writes directly;
- auth/authorization/entitlements are server-owned;
- upload/media success is independent from OCR/AI/TTS;
- source media + reviewed OCR remain canonical evidence;
- provider/model payloads stay behind adapters;
- provider calls happen outside DB transactions;
- stale/expired/cancelled workers cannot finalize attempts, units or outputs;
- no credential/project switching to evade provider quotas/terms;
- no valuable legacy capability is removed without Product Owner approval.

## Exact verified checkpoint

Executable head `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`:

- Stage12 AI Execution Verification `34006710501` — **SUCCESS**.
- Stage11 AI Contract Verification `34006710456` — **SUCCESS**.
- OCR Foundation Verification `34006710511` — **SUCCESS**, including real Tesseract.
- Stage10 Media Pipeline `34006710490` — **SUCCESS**, including real PDF lifecycle.
- Stage9 Content Import Verification `34006710461` — **SUCCESS**, including complete 5,552-image inventory + re-import.
- Rebuild Stage Verification `34006710470` — **SUCCESS**, including real Chromium activation/returning-login/recovery E2E.

This exact head is the current rollback/reference point for Stage12 core.

## Stage12 discovery result

Do not create another queue.

Source inspection proved:

- `database/migrations/0004_ai_and_sync.sql` already defines `ai_jobs`, `ai_job_units`, `ai_outputs`;
- no current AI execution route was registered in `apps/api/src/app.ts`;
- `apps/api/src/server.ts` starts HTTP only;
- no AI worker command existed in `apps/api/package.json`;
- `apps/api/src/ai` contained Stage11 contracts/registry/validators/benchmark only;
- there was no AI execution integration test;
- Admin showed an AI operations shell but no authoritative execution API.

Decision: reuse/extend the existing durable AI tables and connect them to Stage11.

## Verified Stage12 execution core

Implemented through `dfd9a456…`:

- additive `database/migrations/0012_ai_execution.sql`;
- deterministic plan idempotency + fingerprint conflicts;
- durable `SKIP LOCKED` unit claim;
- UUID leases + strong running-lease database shape;
- attempt history/telemetry;
- `AiProviderAdapter` and classified provider errors;
- `AiModelRouter`;
- `AiExecutionRepository` / `AiExecutionService`;
- provider calls outside transactions;
- Stage11 validation before acceptance;
- bounded model/route cascade;
- bounded retry/backoff/jitter;
- stale-worker recovery;
- cancellation + stale-write rejection;
- partial-success reconciliation;
- provider/model/project/credential aliases + usage/latency/error/request/cost telemetry without secrets;
- PostgreSQL lifecycle verification.

Pipeline:

```text
Generation Plan
→ Stage11 typed requests
→ ai_jobs / ai_job_units
→ short claim + lease transaction
→ AiModelRouter
→ provider adapter outside transaction
→ Stage11 validation
→ lease-protected attempt/output write
→ completed | review_required | retrying | failed
→ aggregate job progress
```

## Important Stage12 fixes/evidence

### AI-012-009 stale attempt telemetry

Static review found attempt success/failure could be finalized after lease expiry even though unit/output writes were protected. Fixed in `592e3848fc347ef7aeca9c9de75d4519e2d9433b` by:

- requiring current active lease for attempt finalization;
- enforcing `running ↔ lease` shape in PostgreSQL;
- consistent unit→attempt cancellation lock ordering;
- regression proving old attempt becomes `failed/lease_expired` only during recovery, then a new attempt completes.

### Stage12 lifecycle false-negative

Run `34006606146` reached PostgreSQL lifecycle after passing lint/typecheck/unit/build/migrations/contracts but failed because a test query selected ambiguous unqualified `status` after a join. Fixed as `a.status` / `a.attempt_number` in `dfd9a456…`; the subsequent full same-head matrix passed.

## Current Stage12 invariants

- no provider/network call in DB transaction;
- no running unit without lease identity;
- no stale lease may write attempt completion, unit completion/failure or outputs;
- cancel removes current execution authority;
- same idempotency key with different plan fingerprint is rejected;
- provider/model fields remain execution metadata, not Stage11 domain contract fields;
- provider secrets are server-only and not stored;
- exact-source review rules remain authoritative;
- invalid output retries only inside max attempts;
- review-required output stays review-required instead of inventing certainty;
- partial success preserves completed units;
- cascade is bounded and may not rotate credentials/projects to evade limits.

## Next Stage12 batch — do this next

Implement **distributed bounded concurrency/backpressure** before adding live providers:

1. coordinate limits across worker processes through PostgreSQL, not only an in-memory semaphore;
2. support global + provider + project + model capacity;
3. capacity exhaustion must defer work without consuming a semantic retry attempt;
4. cheapest/approved route capacity pressure must not silently escalate to a more expensive route unless routing policy explicitly permits it;
5. preserve current lease/idempotency/cancellation invariants;
6. add concurrency race tests and same-head Stage12 + lower-layer regression evidence;
7. document exact design, limits and CI evidence.

After that:

- route health/cooldown/Retry-After;
- budget ceilings/kill switch;
- explicit resume/progress semantics;
- dedicated worker runtime with bounded polling/graceful shutdown;
- real provider/model benchmark evidence;
- Stage13 Admin integration after backend worker contract is stable.

## Direct-question boundary

Stage11 preserves `direct` extraction. Current `0003_learning.sql` Question Bank persists only `multiple_choice | true_false`. Direct extraction remains reviewable AI output but is not automatically publishable Question Bank data. Do not widen persistence silently.

## Deployment / hosted runtime

Hosted Student/Admin/API/media/OCR/AI execution remains `NOT YET VERIFIED` while deployment is deferred. Do not publish or re-enable Git deployment without a new Product Owner instruction.

## Continuation protocol

After every meaningful batch update Status + Engineering Log; update this Handoff whenever architecture/branch/CI/Preview state changes; update specialized AI/parity docs when affected; preserve exact commit/CI/runtime evidence; unexecuted work is `NOT YET VERIFIED`; never weaken tests/security/business rules for a green build.

## Current transition decision

**Stage12 execution core is VERIFIED on `dfd9a456…`. Continue from that checkpoint with distributed concurrency/backpressure as a separate batch. Do not merge in health/budget/worker/Admin concerns until the capacity-control batch is independently verified.**
