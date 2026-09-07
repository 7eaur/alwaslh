# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → Product decisions → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → parity/coverage docs → roadmap. Repository + CI evidence are authoritative.

## Product / repository state

- Product: Arabic educational platform with independent Student PWA, Admin Web and Backend API.
- Repository: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `881102ff94711f908104cd068a003ad598609944`.
- Stage11 Provider-Neutral AI Prompt / Output Contracts: **VERIFIED**.
- Stage12 durable AI execution core: **VERIFIED**.
- Stage12 distributed global/provider/project/model backpressure: **VERIFIED**.
- Active Stage12 work: **health/cooldown/Retry-After/budget controls — IMPLEMENTED / VERIFICATION PENDING**.
- After controls: resume/progress → dedicated worker lifecycle → real provider/model benchmark.
- Deployment: `DEFERRED BY PRODUCT OWNER`; Git auto-deploy remains disabled. Hosted behavior is `NOT YET VERIFIED` until explicitly re-enabled and tested.

## Stable architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── Stage10 media identity/storage abstraction
                   ├── reviewed OCR text / OCR Foundation
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable AI execution + distributed controls
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

Executable head `881102ff94711f908104cd068a003ad598609944`:

- Stage12 AI Execution Verification `34007356406` — **SUCCESS**, including distributed capacity/backpressure races.
- Stage11 AI Contract Verification `34007356417` — **SUCCESS**.
- OCR Foundation Verification `34007356407` — **SUCCESS**.
- Stage10 Media Pipeline `34007356429` — **SUCCESS**.
- Stage9 Content Import Verification `34007356442` — **SUCCESS**.
- Rebuild Stage Verification `34007356410` — **SUCCESS** including Chromium.

This exact head is the current rollback/reference point.

## Verified Stage12 execution + backpressure

Implemented through `881102ff…`:

- additive `0012_ai_execution.sql` and `0013_ai_capacity_control.sql`;
- deterministic plan idempotency + fingerprint conflicts;
- durable `SKIP LOCKED` unit claim;
- UUID leases + strong running-lease DB shape;
- attempt history/telemetry;
- `AiProviderAdapter` / `AiModelRouter`;
- provider calls outside transactions;
- Stage11 validation before acceptance;
- bounded cascade + retry/backoff/jitter;
- stale-worker recovery;
- cancellation + stale-write rejection;
- partial-success reconciliation;
- PostgreSQL-coordinated global/provider/project/model capacity;
- `resume_route_key` continuation when capacity blocks;
- no semantic retry increment on repeated capacity deferral;
- `capacity_deferred_count` telemetry;
- race tests proving two workers cannot over-admit the same global/provider/project/model limits.

Capacity pressure is operational, not semantic. It does not silently escalate to a more expensive route.

## Current controls batch — do not call verified yet

The active batch introduces `0014_ai_execution_controls.sql` plus `AiExecutionControl`.

Target behavior now implemented for verification:

1. singleton global kill switch;
2. route kill switch;
3. route runtime identity pinned to route/provider/project/credential/model;
4. persisted cooldown state;
5. Retry-After creates a distributed cooldown visible to later workers;
6. consecutive retryable failures can trigger configured threshold cooldown;
7. optional global budget window with per-attempt reservation;
8. optional route budget window with per-attempt reservation;
9. admission is checked under the same PostgreSQL advisory transaction lock used by distributed capacity;
10. budget admission occurs before attempt insertion/provider call;
11. operational block reuses `resume_route_key` and increments `control_deferred_count` without consuming another semantic retry;
12. tests cover kill switches, cooldown/Retry-After, global budget race and route budget ceiling.

Budget reservation is deliberately conservative and is **not actual billing evidence**. Live provider pricing, billing reconciliation and production budget values remain `NOT YET VERIFIED`.

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
- capacity/control deferral does not consume another semantic retry;
- cascade is bounded and may not rotate credentials/projects to evade limits.

## Next verification order

1. Stage12 lint + strict typecheck + unit/build.
2. Clean PostgreSQL migrations through `0014` + DB contract assertions.
3. Existing Stage12 lifecycle test.
4. Distributed capacity race test.
5. New kill-switch/cooldown/Retry-After/budget test.
6. Stage11 + OCR + Stage10 + Stage9 + Full Rebuild on the same exact head.
7. Only after all green: mark controls VERIFIED and move to resume/progress + worker lifecycle.

## Direct-question boundary

Stage11 preserves `direct` extraction. Current `0003_learning.sql` Question Bank persists only `multiple_choice | true_false`. Direct extraction remains reviewable AI output but is not automatically publishable Question Bank data. Do not widen persistence silently.

## Deployment / hosted runtime

Hosted Student/Admin/API/media/OCR/AI execution remains `NOT YET VERIFIED` while deployment is deferred. Do not publish or re-enable Git deployment without a new Product Owner instruction.

## Continuation protocol

After every meaningful batch update Status + Engineering Log; update this Handoff whenever architecture/branch/CI/Preview state changes; update specialized AI/parity docs when affected; preserve exact commit/CI/runtime evidence; unexecuted work is `NOT YET VERIFIED`; never weaken tests/security/business rules for a green build.

## Current transition decision

**Capacity/backpressure is VERIFIED on `881102ff…`. Verify the isolated health/cooldown/Retry-After/budget batch next. Do not mix worker/Admin/live-provider concerns into this verification cycle.**
