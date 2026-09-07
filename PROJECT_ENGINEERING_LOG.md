# PROJECT ENGINEERING LOG

> Engineering source of truth for project understanding, architecture decisions, audit findings, implementation history, verification evidence and remaining work. Repository + GitHub Actions + runtime evidence are authoritative. Anything not executed/tested is `NOT YET VERIFIED`.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بثلاثة أسطح مستقلة:

- `apps/student-web`: Student Web/PWA — activation/auth, curriculum, Reader, practice/tests/models, Notes, Favorites, Needs Review, progress, notifications and Offline/PWA.
- `apps/admin-web`: Super Admin Web — curriculum/content/media/OCR/TTS/AI/Question Bank/students/codes/recovery/device reset/notifications/import-export/reports/audit.
- `apps/api`: authoritative Backend API over private PostgreSQL and derived media/OCR/AI services.

Governance:

- preserve product idea, business outcomes, important user flows and valuable legacy capabilities;
- legacy implementation is evidence/inventory, not the target architecture;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remain hard gates;
- browser never performs authoritative writes directly to PostgreSQL;
- provider/DB secrets stay server-side;
- deployment is `DEFERRED BY PRODUCT OWNER` and hosted runtime remains `NOT YET VERIFIED`;
- root-cause fixes only; no weakening tests/security/business rules to obtain green CI.

Repository:

- repo: `7eaur/alwaslh`;
- branch: `planning/product-evolution-review`;
- draft PR: #12;
- latest fully verified executable baseline: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

## 2. Stable Architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── canonical source/media evidence
                   ├── reviewed OCR text
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable AI execution/admission/control
                   ├── Stage12 bounded dedicated worker runtime
                   └── later TTS / notifications / offline sync
```

Hard engineering boundaries:

- provider/network calls do not run inside long DB transactions;
- durable workers use short claim/finalization transactions;
- stale/expired/cancelled workers cannot commit attempts, units or outputs;
- distributed throughput/health/budget controls are PostgreSQL-coordinated, not process-local only;
- Fastify remains HTTP-only; worker polling is a separate runtime;
- no credential/project rotation to evade quotas/terms;
- operational pressure is not semantic failure;
- no hidden duplicate alternate implementations for the same lifecycle contract.

## 3. Product / Stage Ledger

| Stage | Classification | State |
|---|---|---|
| 1 Product Inventory | KEEP | VERIFIED |
| 2 Brand | KEEP | VERIFIED |
| 3 UX Architecture | KEEP / EVOLVE | VERIFIED baseline |
| 4 PostgreSQL Platform | KEEP / additive migrations | VERIFIED |
| 5 Engineering Foundation | KEEP | VERIFIED |
| 6 Auth & Authorization | REFACTOR | VERIFIED |
| 7 Access Codes & Entitlements | KEEP | VERIFIED |
| 8 Activation/Login/Recovery/Device | REFACTOR | VERIFIED |
| 9 Source Import | KEEP | VERIFIED |
| 10 Media Pipeline | KEEP | VERIFIED |
| OCR Foundation | KEEP | VERIFIED |
| 11 AI Contracts | KEEP | VERIFIED |
| 12 AI Durable Execution | REBUILD over existing durable tables | CORE + CAPACITY + CONTROLS + PAUSE/RESUME + WORKER RUNTIME VERIFIED |

Live provider/model benchmark, production routes and hosted worker remain separate evidence and are `NOT YET VERIFIED`.

## 4. Important Verified User / Runtime Flows

### Student activation/login/recovery — VERIFIED

```text
6-digit Full Code
→ non-consuming verify
→ one-time activation ticket
→ password + P-256 device key/proof
→ atomic account/credential/entitlement/redemption/device/audit
→ device-bound session
```

Returning login requires password + registered-device challenge. Recovery uses temporary password, revokes sessions, forces private password replacement. Device loss requires Admin reset/rebind and a new P-256 key; historical-key reuse is rejected.

### Content/media/OCR — VERIFIED

```text
Stage9 canonical source inventory
→ Stage10 deterministic media variants/checksums/order
→ ready media
→ durable OCR lease/retry
→ conservative normalized text
→ review gate
→ approved searchable/reusable text
```

### AI execution — VERIFIED backend lifecycle/runtime

```text
reviewed OCR/source chunks
→ Stage11 typed request
→ ai_jobs / ai_job_units
→ bounded worker slot
→ short lease claim
→ distributed capacity + operational admission
→ AiModelRouter
→ provider call OUTSIDE DB transaction
→ Stage11 validation
→ lease-protected attempt/output write
→ retry | review_required | completed | failed
→ aggregate durable progress
```

Operational capacity/cooldown/budget pressure is not semantic failure and does not by itself justify escalating to a more expensive route.

## 5. Chronological Engineering History

### 5.1 Stage6/8 Auth / Activation / Device — VERIFIED

Closure head: `016546eca5696337b52063903bb5ba2fb9631c33`.

Implemented:

- two-step non-consuming Full Code verification;
- atomic activation finalization;
- password-only Student bypass removed;
- P-256 registered-device challenge + device-bound sessions;
- temporary-password recovery + forced private password change;
- Admin device reset/rebind;
- historical device-key reuse rejection;
- Student WebCrypto private key stored non-extractably in account-scoped IndexedDB.

Evidence:

- Rebuild `34002283741` — SUCCESS including Chromium.
- Stage9 `34002283819` — SUCCESS.
- Stage10 `34002283817` — SUCCESS.

### 5.2 OCR Foundation — VERIFIED

Closure head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

Implemented:

- `0011_ocr_foundation.sql`;
- durable queued/running/retrying/completed/failed lifecycle;
- `FOR UPDATE SKIP LOCKED` + UUID leases;
- stale-worker write rejection;
- ready/checksum/media-byte execution guards;
- raw + conservative normalized text;
- low-confidence/empty/sensitive review gates;
- approved-only downstream search;
- provider-neutral OCR adapter;
- real Tesseract Arabic/English smoke.

Evidence:

- OCR `34003439653` — SUCCESS.
- Stage9 `34003439660` — SUCCESS.
- Stage10 `34003439659` — SUCCESS.
- Full Rebuild `34003439669` — SUCCESS including Chromium.

### 5.3 Stage11 Provider-Neutral AI Contracts — VERIFIED

Closure executable head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

Implemented:

- typed/Zod request/source/evidence/question/output contracts;
- versioned Prompt Registry;
- provider-neutral prompt envelope;
- deterministic schema/semantic/provenance/count/notation/duplicate validators;
- `valid | invalid | review_required` boundary;
- exact-source unresolved answers stay unknown/review-required instead of fabricated;
- exact duplicate rejection + near-duplicate review;
- provider-neutral benchmark harness.

`direct` extracted questions remain valid AI outputs, but current Question Bank persistence still supports only `multiple_choice | true_false`; no silent schema widening was made.

Evidence:

- Stage11 `34004445273` — SUCCESS.
- OCR `34004445384` — SUCCESS.
- Stage10 `34004445278` — SUCCESS.
- Stage9 `34004445277` — SUCCESS.
- Full Rebuild `34004445394` — SUCCESS including Chromium.

### 5.4 Stage12 Durable Execution Core — VERIFIED

Discovery proved `0004_ai_and_sync.sql` already had `ai_jobs`, `ai_job_units`, `ai_outputs` but no current worker/caller. Decision: reuse/extend them; do not create a second queue.

Initial implementation: `9f44881a24cc30fed958f72f6f5bbc1fc4f9b1a8`.
Final core closure: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Implemented:

- `0012_ai_execution.sql`;
- idempotent plans + fingerprint conflicts;
- durable unit lease claims;
- `ai_execution_attempts` telemetry;
- `AiProviderAdapter` / `AiModelRouter`;
- provider calls outside DB transactions;
- Stage11 validation before persistence;
- bounded route cascade;
- bounded retry/backoff/jitter;
- stale-worker recovery;
- cancellation that revokes current write authority;
- partial-success reconciliation.

Hardening:

- `AI-012-009`: stale worker could originally finalize attempt telemetry after lease expiry. Fixed by lease-protecting attempt finalization too and enforcing running↔lease shape.
- `AI-012-010`: one CI false negative came from ambiguous joined test column `status`; fixed by qualifying the test query without weakening production assertions.

Evidence:

- Stage12 `34006710501` — SUCCESS.
- Stage11 `34006710456` — SUCCESS.
- OCR `34006710511` — SUCCESS.
- Stage10 `34006710490` — SUCCESS.
- Stage9 `34006710461` — SUCCESS.
- Full Rebuild `34006710470` — SUCCESS including Chromium.

### 5.5 Stage12 Distributed Capacity / Backpressure — VERIFIED

Closure head: `881102ff94711f908104cd068a003ad598609944`.

Implemented:

- `0013_ai_capacity_control.sql`;
- PostgreSQL-coordinated global/provider/project/model concurrency;
- short transaction-scoped advisory admission lock;
- `resume_route_key` preserves intended route under pressure;
- `capacity_deferred_count` telemetry;
- repeated capacity deferral does not consume another semantic retry;
- capacity pressure does not trigger expensive-route cascade;
- concurrent race tests prove no over-admission.

Evidence:

- Stage12 `34007356406` — SUCCESS.
- Stage11 `34007356417` — SUCCESS.
- OCR `34007356407` — SUCCESS.
- Stage10 `34007356429` — SUCCESS.
- Stage9 `34007356442` — SUCCESS.
- Full Rebuild `34007356410` — SUCCESS including Chromium.

### 5.6 Stage12 Health / Cooldown / Budget Controls — VERIFIED

Closure head: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Implemented:

- `0014_ai_execution_controls.sql`;
- singleton global kill switch;
- full-route kill switch;
- persisted Retry-After/health cooldown;
- consecutive retryable-failure threshold cooldown;
- conservative global + route budget windows;
- pre-call budget reservations on attempts;
- global/route budget admission under the same short advisory admission lock;
- `control_deferred_count` telemetry.

Budget evidence boundary: configured reservations are safety ceilings, not proof of provider invoice accuracy. Live price/billing reconciliation remains unverified.

#### AI-012-013 — route runtime identity regression

Formatting-only head `3b4b98cbb7bb60a92146bb817d90df458e3862f4` passed lint/typecheck/build/migrations/schema but unchanged lifecycle failed with `ai_route_runtime_identity_mismatch:route-1`.

Root cause: runtime state incorrectly treated `route_key` as globally unique, while independent routers legitimately reused it.

Fix on `7c3c5645…`:

```text
route_key
+ provider_key
+ provider_project_alias
+ credential_alias
+ model_used
```

- surrogate UUID primary key;
- `UNIQUE NULLS NOT DISTINCT` on full identity;
- all cooldown/health/budget reads/writes use full identity;
- route-budget usage aggregation uses the same identity;
- original lifecycle test remained unchanged and passed.

Evidence:

- Stage12 `34086168715` — SUCCESS.
- Stage11 `34086168704` — SUCCESS.
- OCR `34086168712` — SUCCESS.
- Stage10 `34086168727` — SUCCESS.
- Stage9 `34086168687` — SUCCESS.
- Full Rebuild `34086168772` — SUCCESS including Chromium.

### 5.7 Stage12 Explicit Job Pause / Resume / Progress — VERIFIED

Final behavior checkpoint: `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`.
Detailed contract: `docs/ai/STAGE12_JOB_LIFECYCLE.md`.

Implemented:

- `0015_ai_job_lifecycle.sql`;
- `ai_jobs.paused_at` as orthogonal operator scheduling gate;
- existing `ai_job_status` remains aggregate execution state;
- effective progress reports `paused` without widening the DB enum;
- claim locks job+unit rows; pause/resume locks the same job row;
- in-flight leased unit may finish after pause;
- no new claims while paused;
- resume clears only the gate and preserves outputs/attempts/backoff;
- terminal completed/failed/cancelled jobs cannot resume;
- cancellation remains terminal;
- progress is derived from durable unit rows.

#### AI-012-015 — expired lease represented as running while paused

Root cause: expired running lease could remain represented as `running` until a future claim; a paused job intentionally has no future claim, so progress could falsely show active execution authority.

Fix:

- close expired running attempt as `failed/lease_expired`;
- release non-exhausted unit immediately to `retrying` with lease fields cleared;
- exhausted units remain on terminal max-attempt handling;
- paused job remains non-claimable;
- progress reflects durable authority.

#### AI-012-016 — retry test coupled to Retry-After wall-clock timing

Existing generic retry integration used a `10 ms` Retry-After and manually moved only `next_attempt_at` to `now()`, making the assertion timing-dependent after distributed cooldown became authoritative.

Root-cause test correction:

- generic retry lifecycle now uses retryable `provider_busy` without Retry-After;
- dedicated control integration still uses `Retry-After = 60s` and proves cooldown blocks provider execution until route cooldown is explicitly expired;
- production Retry-After behavior was not weakened.

Pause/resume same-head evidence on `8c8c0366…`:

- Stage12 `34088303830` — SUCCESS.
- Stage11 `34088303918` — SUCCESS.
- OCR `34088303831` — SUCCESS.
- Stage10 `34088303835` — SUCCESS.
- Stage9 `34088303869` — SUCCESS.
- Full Rebuild `34088304022` — SUCCESS including Chromium.

### 5.8 Stage12 Lifecycle Ownership Cleanup — VERIFIED

Closure head: `e7b95042a017ea558db9f769a46a37f155273a15`.

Audit after pause/resume found obsolete, unused alternate implementations of job claim and expired-attempt reconciliation still living in `AiExecutionRepository`, while `AiJobLifecycleRepository` had become the real caller/owner.

Root-cause cleanup:

- removed obsolete `AiExecutionRepository.claimNext`;
- removed obsolete `AiExecutionRepository.reconcileExpiredAttempts`;
- kept attempt/output/cancel/aggregate persistence responsibilities separate;
- `AiJobLifecycleRepository` is the single owner for claim + expired-lease recovery.

Evidence:

- Stage12 `34089070993` — SUCCESS.
- Stage11 `34089071172` — SUCCESS.
- OCR `34089070998` — SUCCESS.
- Stage10 `34089071005` — SUCCESS.
- Stage9 `34089071023` — SUCCESS.
- Full Rebuild `34089071001` — SUCCESS including Chromium.

### 5.9 Stage12 Dedicated Bounded Worker Runtime — VERIFIED

Initial implementation head: `dac86de3a0b843b94f736b03192f27a1693fed04`.
Final executable closure: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.
Detailed contract: `docs/ai/STAGE12_WORKER_RUNTIME.md`.

Implemented in `apps/api/src/ai/worker-runtime.ts`:

- fixed bounded concurrency slots;
- one `processNext()` per slot at a time;
- no huge in-memory prefetch queue;
- bounded exponential idle polling/backoff;
- useful work resets idle delay;
- graceful stop wakes idle slots and prevents later claims;
- already-running `processNext()` calls are allowed to drain under existing lease authority;
- database closes after drain;
- unexpected processor exceptions fail fast, stop new claims, drain siblings, close resources and rethrow;
- simultaneous runtime+close failures preserve both errors;
- abrupt process death remains handled by durable Stage12 lease expiry.

Fastify remained unchanged and HTTP-only. No fake provider adapter, credential, production route or `start:ai-worker` script was invented.

Verification in `apps/api/tests/ai-worker.test.ts` proves concurrency bound, stop/no-new-claim behavior, drain-before-close, bounded backoff, backoff reset, fail-fast cleanup and invalid configuration rejection.

The initial worker head failed shared Biome import/format rules before TypeScript/runtime execution. `45a902eb…` applied formatter-only corrections; runtime semantics and assertions stayed unchanged.

Final same-head evidence:

- Stage12 `34089764278` — SUCCESS including explicit worker test + all PostgreSQL regressions.
- Stage11 `34089764339` — SUCCESS.
- OCR `34089764349` — SUCCESS.
- Stage10 `34089764277` — SUCCESS.
- Stage9 `34089764344` — SUCCESS.
- Full Rebuild `34089764467` — SUCCESS including Chromium.

Result: **Stage12 backend lifecycle/runtime is VERIFIED.**

## 6. Architecture Decisions

Historical Preview/media/auth/OCR decisions remain valid. Current AI decisions:

- **AD-080** — Stage11 domain contracts are provider/model-neutral.
- **AD-081** — reviewed OCR + source/page/checksum is primary book-generation evidence.
- **AD-082** — exact modes never fabricate certainty.
- **AD-084** — `direct` AI output is preserved but not silently persisted into current Question Bank.
- **AD-085** — production route selection requires benchmark evidence.
- **AD-086** — reuse/extend `ai_jobs / ai_job_units / ai_outputs`; no second queue.
- **AD-087** — provider calls occur outside DB transactions.
- **AD-088** — attempt/unit/output writes are lease-protected.
- **AD-090** — cascade is bounded and never rotates keys/projects to evade terms.
- **AD-091** — partial success is first-class.
- **AD-092** — distributed throughput limits are DB-coordinated.
- **AD-093** — operational pressure defers without consuming semantic retry or forcing escalation.
- **AD-094** — kill/cooldown/budget admission is DB-coordinated before attempt creation.
- **AD-095** — configured budget reservations are safety ceilings, not billing truth.
- **AD-096** — route runtime state uses full route identity; `route_key` is not globally unique.
- **AD-097** — job pause/resume is separate from internal `resume_route_key`.
- **AD-098** — AI worker runtime is separate from Fastify HTTP server.
- **AD-099** — pause is an orthogonal scheduling gate (`paused_at`), while execution status remains aggregate durable state.
- **AD-100** — pause/claim concurrency is serialized by the same job-row lock; expired leases are released to retrying before any new claim.
- **AD-101** — `AiJobLifecycleRepository` is the single owner for job claim + expired-lease recovery; duplicate alternate implementations are removed.
- **AD-102** — worker process scheduling uses fixed slots + bounded idle backoff; no in-memory bulk queue.
- **AD-103** — graceful worker stop prevents new claims but does not revoke valid in-flight lease authority; drain completes before DB close.
- **AD-104** — unexpected worker processor errors are fail-fast; provider retry/backpressure remains durable inside Stage12, not hidden in a process-level infinite retry loop.
- **AD-105** — live worker bootstrap must wait for authorized, benchmark-approved provider configuration; no fake production adapter/route is acceptable.

## 7. Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | legacy audit | security compromise | private backend authorization | FIXED Stage6 |
| DATA-015 | P0 | Activation | partial/premature code consumption | Stage8 audit | account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Class Codes | racy redemption | Stage7 audit | double/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| AUTH-006-004 | P1 | Student Auth | password-only device-policy bypass | Stage6 review | device boundary bypass | device challenge + bound session | FIXED + VERIFIED |
| AUTH-006-005 | P1 | Recovery | no forced private replacement | Stage6 review | weak recovery | temporary password + revoke + forced change | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable canonical extraction | OCR discovery | unreliable downstream text | `0011` OCR pipeline | FIXED + VERIFIED |
| AI-011-001 | P1 | AI Contracts | legacy provider/prompt coupling | Stage11 discovery | lock-in/weak validation | contracts/registry/validators | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | AI supports `direct`; DB bank does not | schema review | unsafe auto-publish | preserve reviewable output; explicit future rule | OPEN |
| AI-012-001 | P1 | AI Execution | durable tables had no worker/caller | Stage12 discovery | no execution path | execution service | FIXED + VERIFIED |
| AI-012-002 | P1 | Lease | stale worker late write | Stage12 review | corrupt result state | lease-protected writes | FIXED + VERIFIED |
| AI-012-006 | P1 | Scale | no distributed throughput limit | Stage12 requirements | overload | DB capacity/backpressure | FIXED + VERIFIED |
| AI-012-007 | P1 | Operations | no cooldown/budget/kill policy | Stage12 requirements | uncontrolled eligibility/cost | DB operational controls | FIXED + VERIFIED |
| AI-012-009 | P1 | Telemetry | stale attempt finalization after expiry | core review | misleading telemetry | lease-protected attempt completion | FIXED + VERIFIED |
| AI-012-012 | P2 | Budget Evidence | reservation ≠ actual billing | no live billing evidence | false cost certainty | keep billing explicitly unverified | CONTROLLED / OPEN EVIDENCE |
| AI-012-013 | P1 | Route Identity | `route_key` assumed globally unique | unchanged lifecycle CI | regression/cross-talk | full route identity | FIXED + VERIFIED |
| AI-012-014 | P2 | Job Lifecycle | no explicit job pause/resume | Stage12 requirements | weak operator control | durable pause/resume/progress | FIXED + VERIFIED |
| AI-012-015 | P1 | Lease Recovery | expired paused unit could appear running | lifecycle design review | false progress/execution authority | immediate release to retrying | FIXED + VERIFIED |
| AI-012-016 | P3 | Test Determinism | generic retry test depended on 10ms Retry-After timing | run `34088033202` | flaky false negative | separate generic retry from dedicated cooldown test | FIXED + VERIFIED |
| AI-012-017 | P2 | Architecture Ownership | obsolete duplicate claim/recovery implementations remained | post-pause audit | future divergence risk | one lifecycle owner | FIXED + VERIFIED |
| AI-012-008 | P2 | Worker | HTTP server was not worker lifecycle | Stage12 discovery | no bounded polling/drain | dedicated `AiWorkerRuntime` | FIXED + VERIFIED |
| AI-012-018 | P3 | Worker CI | initial worker test import/format order failed Biome | worker run 43 | blocked runtime signal only | formatter-only fix | FIXED + VERIFIED |
| AI-012-019 | P2 | Live AI Runtime | no authorized live adapter/benchmark/bootstrap | current evidence boundary | cannot claim production AI execution | benchmark + real provider config before bootstrap | OPEN / NOT YET VERIFIED |
| PREVIEW-010-002 | P2 | Hosted Runtime | media/OCR/AI hosted behavior unproven | deployment deferred | cannot claim hosted pipeline | verify when deployment re-enabled | NOT YET VERIFIED |
| REPO-001 | P3 | Git Hygiene | accidental `tmp-unused-do-not-use` branch | branch audit | repository noise only | delete ref when a branch-delete capability is available | OPEN HOUSEKEEPING |
| DOC-001 | P2 | Continuity | chat-memory dependency | governance audit | contradictory/repeated work | in-repo Status/Log/Handoff + specialized docs | CONTROLLED |

## 8. Tests & Verification Summary

Latest fully green executable head: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

Same-head green matrix:

- Stage12 `34089764278` — worker lifecycle + all Stage12 PostgreSQL regressions;
- Stage11 `34089764339`;
- OCR `34089764349`;
- Stage10 `34089764277`;
- Stage9 `34089764344`;
- Full Rebuild `34089764467` including Chromium.

Stage12 backend lifecycle/runtime is therefore **VERIFIED**.

## 9. Known Issues / Remaining Risk

- deployment remains deferred; hosted Student/Admin/API/media/OCR/AI worker is unverified;
- live AI provider/model benchmark, credentials, current prices, actual billing and production routes remain unverified;
- production live `worker.ts` bootstrap remains intentionally unimplemented until real provider configuration is authorized and benchmarked;
- direct-question persistence into Question Bank remains unresolved;
- OCR production-quality benchmark beyond current integration/smoke evidence remains unexecuted;
- Stage13 Admin AI operations integration is not implemented;
- Reader Text/Search/TTS, final Offline/PWA lease/update behavior and later Student product stages remain;
- temporary branch `tmp-unused-do-not-use` remains P3 housekeeping because the connected GitHub tool has no ref-delete action.

## 10. Remaining Work — Ordered

1. Continue roadmap with curriculum structure extension / Stage13 backend preparation.
2. Execute live provider/model benchmark before any production AI route/model defaults or live worker bootstrap.
3. Resolve direct-question persistence before Question Bank publish workflows depend on it.
4. Continue Stage13+ according to `MASTER_REBUILD_ROADMAP.md` while preserving verified Stage12 contracts.
5. Restore/verify hosted deployment only after explicit Product Owner re-enable instruction.
6. Delete `tmp-unused-do-not-use` when branch-ref deletion becomes available.

## 11. Current State

**Verified:** Stages1–10 + OCR + Stage11 + Stage12 durable core + distributed capacity + operational controls + explicit pause/resume/progress + centralized lifecycle ownership + bounded dedicated worker runtime.

**Latest verified executable:** `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

**Next engineering focus:** curriculum structure extension / Stage13 backend preparation, with live AI benchmarking required before production provider routing/bootstrap.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
