# PROJECT HANDOFF — الوسيلة الذكية

> Source-of-truth order: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → product decisions → AI strategy → parity/coverage docs → roadmap. Repository + GitHub Actions are authoritative; unverified work is always `NOT YET VERIFIED`.

## Repository / phase

- Repo: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.
- Stage11 contracts: **VERIFIED**.
- Stage12 durable core: **VERIFIED**.
- Stage12 distributed capacity/backpressure: **VERIFIED**.
- Stage12 kill-switch/cooldown/Retry-After/budget admission: **VERIFIED**.
- Stage12 explicit job pause/resume/progress: **VERIFIED**.
- Stage12 dedicated bounded worker runtime: **VERIFIED**.
- Live provider adapters/benchmark/production worker bootstrap: **NOT YET VERIFIED**.
- Deployment: `DEFERRED BY PRODUCT OWNER`; do not re-enable or publish without a new explicit instruction.

## Latest same-head verification

Exact executable head `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`:

- Stage12 `34089764278` — SUCCESS including dedicated worker lifecycle + lifecycle/capacity/control/pause PostgreSQL regressions.
- Stage11 `34089764339` — SUCCESS.
- OCR `34089764349` — SUCCESS.
- Stage10 `34089764277` — SUCCESS.
- Stage9 `34089764344` — SUCCESS.
- Full Rebuild `34089764467` — SUCCESS including Chromium.

Important Stage12 predecessor checkpoints:

- core `dfd9a456…`;
- distributed capacity `881102ff…`;
- operational controls `7c3c5645…`;
- pause/resume/progress `8c8c0366…`;
- lifecycle ownership cleanup `e7b95042…`;
- worker runtime closure `45a902eb…`.

## Stable runtime architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── Stage10 media evidence
                   ├── reviewed OCR text
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable execution/admission/control
                   ├── Stage12 dedicated bounded worker runtime
                   └── later TTS / notifications / offline sync
```

Hard rules:

- browser never gets DB/provider secrets;
- provider calls remain outside DB transactions;
- stale/expired/cancelled workers cannot commit attempts/outputs;
- no key/project rotation to evade provider limits/terms;
- operational pressure is not semantic failure;
- valuable legacy capability is not removed without Product Owner approval;
- root-cause fixes only; no weakened tests/security/business rules;
- Fastify remains HTTP-only and never owns queue polling.

## Route runtime identity

Never assume `route_key` is globally unique. Operational state is keyed by:

```text
route_key
+ provider_key
+ provider_project_alias
+ credential_alias
+ model_used
```

This is verified and must remain consistent across cooldown, health and route-budget queries.

## Job lifecycle contract — VERIFIED

`resume_route_key` is scheduler continuation only. Job pause is separate.

Durable control:

- `ai_jobs.paused_at` — operator scheduling gate;
- existing `ai_job_status` remains aggregate execution state;
- effective progress may report `paused` while execution status stays queued/running/retrying.

Concurrency:

- claim locks both job and unit rows (`FOR UPDATE OF j, u SKIP LOCKED`);
- pause/resume locks the same job row;
- if claim commits first, that unit is legitimately in-flight and may finish;
- if pause commits first, no later claim from that job is allowed;
- pause does not revoke a valid in-flight lease.

Resume:

- clears only `paused_at`;
- preserves accepted outputs, attempts, retry/backoff and route continuation;
- completed/failed/cancelled jobs are not resumable;
- cancellation remains terminal.

Lease expiry:

- expired running attempt closes as `failed/lease_expired`;
- non-exhausted unit becomes durable `retrying` immediately with lease fields cleared;
- exhausted unit follows terminal max-attempt handling;
- paused jobs remain non-claimable;
- progress reflects real execution authority.

Ownership hardening:

- `AiJobLifecycleRepository` is the single owner of job claim + expired-lease recovery;
- obsolete alternate implementations were removed from `AiExecutionRepository` on `e7b95042…` and the six-workflow matrix remained green.

Detailed design: `docs/ai/STAGE12_JOB_LIFECYCLE.md`.

## Worker lifecycle contract — VERIFIED

`apps/api/src/server.ts` remains HTTP-only.

`apps/api/src/ai/worker-runtime.ts` provides the process-level scheduler:

- fixed bounded slots;
- exactly one `processNext()` per slot at a time;
- no large in-memory prefetch batch;
- empty queue uses bounded exponential idle backoff;
- successful processing resets a slot to minimum polling delay;
- graceful stop prevents any later `processNext()` call and wakes idle sleeps;
- already-running `processNext()` calls are not aborted; they drain under their existing lease authority;
- database closes after all slots drain;
- unexpected processor errors are fail-fast: stop claims, drain siblings, close resources, rethrow;
- abrupt death relies on the existing durable lease expiry/retry contract.

`runAiWorkerProcess()` takes an `AbortSignal`; a future standalone live bootstrap should map `SIGTERM/SIGINT` to it.

Worker verification in `apps/api/tests/ai-worker.test.ts` covers concurrency bounds, stop/no-new-claim behavior, drain-before-close, bounded idle backoff, backoff reset, fail-fast resource cleanup and invalid configuration rejection. Stage12 `34089764278` runs this explicitly before the PostgreSQL regressions.

Detailed design: `docs/ai/STAGE12_WORKER_RUNTIME.md`.

## Live-provider boundary — NOT YET VERIFIED

Do not confuse the verified worker lifecycle with production AI configuration. Still unverified by design:

- authorized live AI provider adapters and credentials;
- live provider/model benchmark evidence;
- benchmark-approved production routes/models;
- production `worker.ts` bootstrap constructing those real adapters/routes;
- current pricing and actual provider billing reconciliation;
- hosted worker deployment/runtime.

Do **not** create fake adapters, placeholder credentials or invented production routes merely to make an entrypoint runnable.

## Other unresolved boundaries

- AI `direct` extraction is not silently publishable because current Question Bank persists only MCQ/T/F.
- configured budget reservations are safety ceilings, not billing truth.
- OCR production-quality benchmark beyond current smoke/integration evidence remains separate future evidence.
- hosted Student/Admin/API/media/OCR/AI runtime remains unverified while deployment is deferred.

## Next ordered work

1. Continue the roadmap with curriculum structure extension / Stage13 backend preparation while preserving Stage12 contracts.
2. Before any production AI routing/bootstrap, execute the live benchmark with authorized providers/models and current terms/pricing.
3. Resolve direct-question persistence explicitly before publish workflows depend on it.
4. Keep deployment disabled until the Product Owner explicitly re-enables it.

## Repository housekeeping

A temporary branch `tmp-unused-do-not-use` was accidentally created while preparing the lifecycle ownership cleanup. It points to already-verified history, contains no unique code and is not used by PR #12. The connected GitHub tool has no ref-delete action, so deletion is tracked as P3 housekeeping rather than hidden behind a workaround.

## Continuation rule

After every meaningful batch update `PROJECT_STATUS.md` and `PROJECT_ENGINEERING_LOG.md`; update this Handoff when architecture/branch/CI/runtime state changes; update specialized docs and AI strategy when affected; preserve exact commits/run IDs; mark anything not executed/tested as `NOT YET VERIFIED`.
