# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → Product decisions → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → parity/coverage docs → roadmap. Repository + CI evidence are authoritative.

## Product / repository state

- Product: Arabic educational platform with independent Student PWA, Admin Web and Backend API.
- Repository: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `592123dae33f0cfce2ecd36e9577764767faa95a`.
- Stage11 Provider-Neutral AI Prompt / Output Contracts: **VERIFIED**.
- Active phase: **Stage12 Durable Provider-Neutral AI Execution — ACTIVE / NOT YET VERIFIED**.
- Current Stage12 executable fix head: `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`.
- Deployment: `DEFERRED BY PRODUCT OWNER`; Git auto-deploy remains disabled. Hosted behavior is not PASS until explicitly re-enabled and verified.

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
- stale/expired/cancelled AI workers cannot commit results;
- no valuable legacy capability is removed without Product Owner approval.

## Verified lower-layer baseline

- Stage6/8 activation/login/recovery/device policy — VERIFIED.
- Stage7 transactional access codes/entitlements — VERIFIED.
- Stage9 deterministic content source import — VERIFIED; 15 roots / 48 source documents / 5,552 images.
- Stage10 deterministic media identity/order/checksum/provenance — VERIFIED.
- OCR durable lease/retry/review/search foundation — VERIFIED.
- Stage11 provider-neutral prompt/output contracts, provenance/count/answer/duplicate validation and benchmark harness — VERIFIED.

Exact shared Stage11 regression head: `592123dae33f0cfce2ecd36e9577764767faa95a`:

- Stage11 `34004445273` — SUCCESS.
- OCR `34004445384` — SUCCESS.
- Stage10 `34004445278` — SUCCESS.
- Stage9 `34004445277` — SUCCESS.
- Full Rebuild `34004445394` — SUCCESS including Stage8 Chromium E2E.

## Stage12 discovery result

Do not create another queue.

Actual source inspection proved:

- `database/migrations/0004_ai_and_sync.sql` already defines `ai_jobs`, `ai_job_units`, `ai_outputs`;
- no current AI execution route was registered in `apps/api/src/app.ts`;
- `apps/api/src/server.ts` starts HTTP only;
- no AI worker command existed in `apps/api/package.json`;
- `apps/api/src/ai` contained Stage11 contracts/registry/validators/benchmark only;
- there was no AI execution integration test;
- Admin showed an AI operations shell but no authoritative execution API.

Decision: reuse/extend the existing durable AI tables and connect them to Stage11.

## Stage12 implementation now present

First execution batch landed at `9f44881a24cc30fed958f72f6f5bbc1fc4f9b1a8`, with formatting fixes through `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`.

Implemented:

- additive `database/migrations/0012_ai_execution.sql`;
- durable lease fields + attempt telemetry over existing AI job/unit/output primitives;
- `AiProviderAdapter` and classified provider errors;
- `AiModelRouter` route abstraction;
- `AiExecutionRepository`;
- `AiExecutionService`;
- deterministic idempotency + plan fingerprint conflict detection;
- short transactional `SKIP LOCKED` claims;
- provider calls outside DB transactions;
- Stage11 validation before output acceptance;
- bounded route cascade + retry/backoff/jitter;
- lease-protected final writes;
- cancellation and stale-worker protection;
- partial-success job reconciliation;
- provider/model/project/credential alias + tokens/latency/error/request/cost-micros telemetry without persisting secrets;
- Stage12 PostgreSQL integration tests;
- `.github/workflows/stage12-ai-execution.yml`.

Pipeline:

```text
Generation Plan
→ Stage11 typed requests
→ ai_jobs / ai_job_units
→ claim + lease
→ AiModelRouter
→ provider adapter outside transaction
→ Stage11 validation
→ lease-protected output/attempt write
→ completed | review_required | retrying | failed
→ aggregate job progress
```

## Stage12 invariants

- no provider/network call in a DB transaction;
- no stale lease may write completion/failure/output;
- cancel removes current execution authority;
- same idempotency key with different plan fingerprint is rejected;
- provider/model fields remain execution metadata, not Stage11 domain contract fields;
- provider secrets are server-only and not stored;
- exact-source review rules remain authoritative;
- invalid output retries only within configured max attempts;
- review-required output stays review-required instead of inventing certainty;
- partial success preserves completed units;
- no credential/project rotation is allowed to evade provider quotas/terms.

## Current CI state

Exact head `00c1affe9e7fb1fce4d9e305e7bd650beb8c4e9b` failed all six triggered workflows at the same API lint gate before deeper verification because Biome still requested one import-format change in `apps/api/src/ai/execution-service.ts`.

- Stage12 `34005458936` — FAILURE at lint; typecheck/tests/build/migrations/integration skipped.
- Stage11 `34005458938` — FAILURE from shared lint.
- OCR `34005458953` — FAILURE from shared lint.
- Stage10 `34005458954` — FAILURE from shared lint.
- Stage9 `34005458943` — FAILURE from shared lint.
- Full Rebuild `34005458950` — FAILURE from shared lint.

The requested Biome layout was applied in `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`.

**Do not report Stage12 as VERIFIED until one exact executable head passes Stage12 + Stage11 + OCR + Stage10 + Stage9 + Full Rebuild.**

## Open Stage12 work after core verification

1. Fix any evidence-backed TypeScript/SQL/runtime defect exposed after lint clears.
2. Add bounded global/provider/project/model concurrency/backpressure.
3. Add explicit route health/cooldown/budget eligibility.
4. Add a dedicated worker entrypoint/lifecycle with graceful shutdown and bounded polling.
5. Add authenticated Admin execution/query/cancel/review surfaces after the core worker contract is stable.
6. Run real provider/model benchmark evidence before selecting production defaults.
7. Keep live credentials/pricing/production routing `NOT YET VERIFIED` until explicitly configured and tested.

## Direct-question boundary

Stage11 preserves `direct` extraction. Current `0003_learning.sql` Question Bank persists only `multiple_choice | true_false`. Direct extraction remains reviewable AI output but is not automatically publishable Question Bank data. Do not widen persistence silently.

## Deployment / remaining work

Hosted Student/Admin/API/media/OCR/AI execution remains `NOT YET VERIFIED` while deployment is deferred. Do not publish or re-enable Git deployment without a new Product Owner instruction.

Ordered work:

1. Make Stage12 execution core same-head green.
2. Add concurrency/backpressure + health/cooldown/budget + worker lifecycle.
3. Add Admin execution operations after backend stability.
4. Benchmark real providers/models before production routing.
5. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md`.
6. Resolve direct-question publish persistence.
7. Verify hosted runtime only when deployment is explicitly re-enabled.

## Continuation protocol

After every meaningful batch update Status + Engineering Log; update this Handoff whenever architecture/branch/CI/Preview state changes; update specialized AI/parity docs when affected; preserve exact commit/CI/runtime evidence; unexecuted work is `NOT YET VERIFIED`; never weaken tests/security/business rules for a green build.

## Current transition decision

**Stage11 remains VERIFIED on `592123d…`. Stage12 core is implemented but NOT YET VERIFIED. The correct orchestration direction is reuse/extension of `ai_jobs / ai_job_units / ai_outputs`; current executable fix head is `cc2e2b6…`. Continue by making the Stage12 core and all lower-layer regressions green on one exact head before adding concurrency/backpressure or Admin surfaces.**
