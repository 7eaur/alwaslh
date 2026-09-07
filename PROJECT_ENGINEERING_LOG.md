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
- deployment is `DEFERRED BY PRODUCT OWNER` and hosted runtime remains `NOT YET VERIFIED`.

Repository:

- repo: `7eaur/alwaslh`;
- branch: `planning/product-evolution-review`;
- draft PR: #12;
- latest fully verified executable baseline: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`;
- verified-baseline docs closure: `6cac332f356b9f1b4faf3d7fb5b9b736a1e076b4`.

## 2. Stable Architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── canonical source/media evidence
                   ├── reviewed OCR text
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable AI execution/admission/control
                   └── later TTS / notifications / offline sync
```

Hard engineering boundaries:

- provider/network calls do not run inside long DB transactions;
- durable workers use short claim/finalization transactions;
- stale/expired/cancelled workers cannot commit attempts, units or outputs;
- distributed throughput/health/budget controls are PostgreSQL-coordinated, not process-local only;
- no credential/project rotation to evade quotas/terms;
- root-cause fixes are required; tests/security/business rules are never weakened for green CI.

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
| 12 AI Durable Execution | REBUILD over existing durable tables | CORE + CAPACITY + CONTROLS VERIFIED; PAUSE/RESUME IMPLEMENTED / PENDING |

## 4. Important Verified User Flows

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

### AI execution through operational controls — VERIFIED

```text
reviewed OCR/source chunks
→ Stage11 typed request
→ ai_jobs / ai_job_units
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

Implemented under `apps/api/src/ai`:

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

Important hardening:

- `AI-012-009`: stale worker could originally finalize attempt telemetry after lease expiry. Fixed by lease-protecting attempt finalization too and enforcing running↔lease shape.
- `AI-012-010`: one CI false negative came from ambiguous joined test column `status`; fixed by qualifying the test query without weakening production assertions.

Evidence on final core head:

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
- global/route budget admission under same short advisory admission lock;
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

Final evidence:

- Stage12 `34086168715` — SUCCESS including lifecycle/capacity/control tests.
- Stage11 `34086168704` — SUCCESS.
- OCR `34086168712` — SUCCESS.
- Stage10 `34086168727` — SUCCESS.
- Stage9 `34086168687` — SUCCESS.
- Full Rebuild `34086168772` — SUCCESS including Chromium.

### 5.7 Stage12 Explicit Job Pause / Resume / Progress — IMPLEMENTED / VERIFICATION PENDING

Parent verified executable baseline: `7c3c5645…`.
Controls docs closure: `6cac332f…`.
Detailed contract: `docs/ai/STAGE12_JOB_LIFECYCLE.md`.

Design:

- add `ai_jobs.paused_at` as an orthogonal operator scheduling gate;
- keep existing `ai_job_status` as aggregate execution state instead of adding a redundant `paused` enum value;
- progress exposes effective `paused` status when active;
- claim locks job+unit rows; pause/resume lock the same job row, giving pause/claim races deterministic ordering;
- in-flight leased unit may finish after pause;
- no new claims while paused;
- resume clears only the scheduling gate and preserves outputs/attempts/backoff;
- terminal completed/failed/cancelled jobs cannot resume;
- cancellation remains terminal.

#### AI-012-015 — expired lease represented as running while paused

Design review found a correctness issue: expired running lease previously stayed represented as `running` until a later claim reclaimed it. A paused job intentionally has no later claim, so progress could falsely show active execution authority.

Root-cause fix in current batch:

- close expired running attempt as `failed/lease_expired`;
- immediately release non-exhausted unit to `retrying` with lease fields cleared;
- exhausted units remain on existing terminal max-attempt path;
- paused job remains non-claimable;
- progress now reflects actual durable execution authority.

Current verification plan:

- pause before claim consumes zero attempts;
- pause during provider call keeps current lease but blocks sibling claim;
- in-flight completion while paused preserves accepted output;
- resume continues unfinished work without reset;
- expired lease while paused becomes retrying and resumes on the next legitimate attempt;
- cancellation clears pause and stays terminal;
- existing lifecycle/capacity/control regressions remain unchanged.

Status: **NOT YET VERIFIED until same-head CI passes.**

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
- **AD-098** — AI worker runtime must be separate from Fastify HTTP server.
- **AD-099** — pause is an orthogonal scheduling gate (`paused_at`), while execution status remains aggregate durable state.
- **AD-100** — pause/claim concurrency is serialized by the same job-row lock; expired leases are released to retrying before any new claim.

## 7. Audit Findings

| ID | Severity | Area | Problem | Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | security compromise | private backend authorization | FIXED Stage6 |
| DATA-015 | P0 | Activation | partial/premature code consumption | account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Class Codes | racy redemption | double/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| AUTH-006-004 | P1 | Student Auth | password-only device-policy bypass | device boundary bypass | device challenge + bound session | FIXED + VERIFIED |
| AUTH-006-005 | P1 | Recovery | no forced private replacement | weak recovery | temporary password + revoke + forced change | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable canonical extraction | unreliable downstream text | `0011` OCR pipeline | FIXED + VERIFIED |
| AI-011-001 | P1 | AI Contracts | legacy provider/prompt coupling | lock-in/weak validation | Stage11 contracts/registry/validators | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | AI supports `direct`; DB bank does not | unsafe auto-publish | preserve reviewable output; explicit future rule | OPEN |
| AI-012-001 | P1 | AI Execution | durable tables had no worker/caller | no execution path | Stage12 execution service | FIXED + VERIFIED |
| AI-012-002 | P1 | Lease | stale worker late write | corrupt result state | lease-protected writes | FIXED + VERIFIED |
| AI-012-006 | P1 | Scale | no distributed throughput limit | overload | DB capacity/backpressure | FIXED + VERIFIED |
| AI-012-007 | P1 | Operations | no cooldown/budget/kill policy | uncontrolled eligibility/cost | DB operational controls | FIXED + VERIFIED |
| AI-012-009 | P1 | Telemetry | stale attempt finalization after expiry | misleading telemetry | lease-protected attempt completion | FIXED + VERIFIED |
| AI-012-012 | P2 | Budget Evidence | reservation ≠ actual billing | false cost certainty | keep billing explicitly unverified | CONTROLLED / OPEN EVIDENCE |
| AI-012-013 | P1 | Route Identity | `route_key` assumed globally unique | regression/cross-talk | full route identity | FIXED + VERIFIED |
| AI-012-014 | P2 | Job Lifecycle | no explicit job pause/resume | weak operator control | durable pause/resume/progress | IMPLEMENTED / PENDING |
| AI-012-015 | P1 | Lease Recovery | expired paused unit could appear running | false progress/execution authority | release non-exhausted expired unit to retrying | IMPLEMENTED / PENDING |
| AI-012-008 | P2 | Worker | HTTP server is not worker lifecycle | no production polling/drain | dedicated worker process | OPEN NEXT |
| PREVIEW-010-002 | P2 | Hosted Runtime | media/OCR/AI hosted behavior unproven | cannot claim hosted pipeline | verify when deployment re-enabled | NOT YET VERIFIED |
| DOC-001 | P2 | Continuity | chat-memory dependency | contradictory/repeated work | in-repo Status/Log/Handoff + specialized docs | CONTROLLED |

## 8. Tests & Verification Summary

Latest fully green executable head: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Same-head green matrix:

- Stage12 `34086168715`;
- Stage11 `34086168704`;
- OCR `34086168712`;
- Stage10 `34086168727`;
- Stage9 `34086168687`;
- Full Rebuild `34086168772` including Chromium.

Current pause/resume batch: **NOT YET VERIFIED**. Do not replace the baseline until the same six workflows and the new Stage12 lifecycle test pass on one exact implementation head.

## 9. Known Issues / Remaining Risk

- deployment remains deferred; hosted Student/Admin/API/media/OCR/AI worker is unverified;
- current pause/resume/progress implementation is not yet CI-closed;
- dedicated AI worker lifecycle is not implemented yet;
- live provider/model benchmark, credentials, current prices, actual billing and production routes remain unverified;
- direct-question persistence into Question Bank remains unresolved;
- OCR production-quality benchmark remains unexecuted;
- Stage13 Admin AI operations integration waits for Stage12 backend closure;
- Reader Text/Search/TTS, final Offline/PWA lease/update behavior and later Student product stages remain.

## 10. Remaining Work — Ordered

1. Run/fix the explicit pause/resume/progress batch until Stage12 + lower-layer matrix is green on one exact head.
2. Update Status/Log/Handoff/AI docs with exact closure commit/run evidence.
3. Implement dedicated AI worker process with bounded slots, bounded idle polling and graceful drain; keep it separate from Fastify.
4. Run real provider/model benchmark before production route defaults.
5. Continue Stage13+ according to `MASTER_REBUILD_ROADMAP.md` after Stage12 DoD closes.
6. Restore/verify hosted deployment only after explicit Product Owner re-enable instruction.

## 11. Current State

**Verified:** Stages1–10 + OCR + Stage11 + Stage12 durable core + distributed capacity + operational controls on `7c3c5645…`.

**Current implementation:** explicit job pause/resume/progress + expired-paused-lease recovery; `NOT YET VERIFIED` until CI closes.

**Next after closure:** dedicated AI worker lifecycle.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
