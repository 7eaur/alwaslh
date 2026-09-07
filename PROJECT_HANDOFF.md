# PROJECT HANDOFF — الوسيلة الذكية

> Source-of-truth order: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → product decisions → AI strategy → parity/coverage docs → roadmap. Repository + GitHub Actions are authoritative; unverified work is always `NOT YET VERIFIED`.

## Repository / phase

- Repo: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.
- Controls documentation closure: `6cac332f356b9f1b4faf3d7fb5b9b736a1e076b4`.
- Stage11 contracts: **VERIFIED**.
- Stage12 durable core: **VERIFIED**.
- Stage12 distributed capacity/backpressure: **VERIFIED**.
- Stage12 kill-switch/cooldown/Retry-After/budget admission: **VERIFIED**.
- Current batch: explicit job pause/resume/progress **IMPLEMENTED / VERIFICATION PENDING**.
- Next only after closure: dedicated AI worker lifecycle.
- Deployment: `DEFERRED BY PRODUCT OWNER`; do not re-enable or publish without a new explicit instruction.

## Stable runtime architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── Stage10 media evidence
                   ├── reviewed OCR text
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable execution/admission/control
                   └── later TTS / notifications / offline sync
```

Hard rules:

- browser never gets DB/provider secrets;
- provider calls remain outside DB transactions;
- stale/expired/cancelled workers cannot commit attempts/outputs;
- no key/project rotation to evade limits/terms;
- operational pressure is not semantic failure;
- valuable legacy capability is not removed without Product Owner approval;
- root-cause fixes only; no weakening tests/security/business rules.

## Latest verified checkpoint

Exact executable head `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`:

- Stage12 `34086168715` — SUCCESS.
- Stage11 `34086168704` — SUCCESS.
- OCR `34086168712` — SUCCESS.
- Stage10 `34086168727` — SUCCESS.
- Stage9 `34086168687` — SUCCESS.
- Full Rebuild `34086168772` — SUCCESS including Chromium.

Verified Stage12 controls include global/provider/project/model capacity, global/full-route kill switches, Retry-After/health cooldown, conservative global+route budgets and full route runtime identity.

## Route runtime identity

Never assume `route_key` is globally unique. Operational state is keyed by:

```text
route_key
+ provider_key
+ provider_project_alias
+ credential_alias
+ model_used
```

This rule was established after unchanged lifecycle regression exposed cross-router reuse. The fix is verified on `7c3c5645…`.

## Current pause/resume/progress design

`resume_route_key` remains internal scheduler continuation. Job pause is separate.

New durable control:

- `ai_jobs.paused_at` — operator scheduling gate;
- existing `ai_job_status` remains aggregate execution state;
- effective progress can report `paused` while execution status remains queued/running/retrying.

Concurrency contract:

- claim locks both job and unit rows (`FOR UPDATE OF j, u SKIP LOCKED`);
- pause/resume locks the same job row;
- if claim commits first, that unit is legitimately in-flight and pause may follow;
- if pause commits first, no later claim from that job is allowed;
- pause never revokes a valid already-started lease.

Resume contract:

- clears only `paused_at`;
- preserves completed/review outputs, attempt counts, retry/backoff and route continuation;
- terminal completed/failed/cancelled jobs are not resumable;
- cancellation remains terminal and clears pause.

Progress contract is server-derived from durable unit rows and exposes accepted/completed/review/failed/cancelled/queued/running/retrying/settled/remaining totals and integer settled percentage.

## Lease expiry hardening in current batch

An expired running lease previously stayed represented as `running` until a later claim reclaimed it. This is incorrect while a job is paused.

The new lifecycle recovery immediately:

1. closes expired running attempt as `failed/lease_expired`;
2. releases non-exhausted unit to `retrying` and clears lease fields;
3. leaves exhausted units to existing terminal max-attempt handling;
4. refreshes aggregate state;
5. still blocks claims while paused.

Detailed design: `docs/ai/STAGE12_JOB_LIFECYCLE.md`.

## Current verification gate

Do **not** mark pause/resume/progress verified until the exact implementation head passes:

- Stage12 lint/typecheck/unit/build;
- clean migrations + Stage12 DB contracts;
- existing execution lifecycle;
- capacity tests;
- control tests;
- new pause/resume/progress + paused-lease recovery tests;
- Stage11 regression;
- OCR regression;
- Stage10 regression;
- Stage9 regression;
- Full Rebuild + Chromium.

Any failure must be fixed from evidence. No test weakening.

## Worker lifecycle — after pause/resume only

`apps/api/src/server.ts` is HTTP-only. Worker must be a separate process/runtime with:

- bounded slots;
- bounded idle polling/backoff;
- graceful shutdown: stop new claims, drain in-flight, close DB last;
- crash recovery via existing lease expiry;
- no huge in-memory batches.

Do not invent live provider credentials/routes just to make worker bootstrap appear complete. Live adapters/benchmark/production routing remain `NOT YET VERIFIED`.

## Other unresolved boundaries

- AI `direct` extraction is not silently publishable because current Question Bank persists only MCQ/T/F.
- actual provider billing/pricing remains unverified; configured budget reservations are safety ceilings only.
- hosted runtime remains unverified while deployment is deferred.
- Stage13 Admin AI operations integration waits until backend Stage12 lifecycle is stable.

## Continuation rule

After every meaningful batch update `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md`; update this Handoff when architecture/branch/CI/runtime state changes; update AI strategy/parity docs when affected; preserve exact commits/run IDs; mark anything not executed/tested as `NOT YET VERIFIED`.
