# PROJECT ENGINEERING LOG

> Engineering source of truth for project understanding, architecture decisions, audit findings, implementation history, tests and remaining work. Repository + GitHub Actions + runtime evidence are authoritative. Anything not executed/tested is `NOT YET VERIFIED`.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بثلاثة أسطح مستقلة:

- `apps/student-web`: Student Web/PWA — activation/auth, curriculum, Reader, practice/tests/models, Notes, Favorites, Needs Review, progress, notifications and Offline/PWA.
- `apps/admin-web`: Super Admin Web — curriculum/content/media/OCR/TTS/AI/Question Bank/students/codes/recovery/device reset/notifications/import-export/reports/audit.
- `apps/api`: authoritative Backend API over private PostgreSQL and derived media/OCR/AI services.

Governance:

- preserve product idea, business outcomes, important user flows and valuable legacy capabilities;
- legacy implementation is evidence/inventory, not target architecture;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` are hard coverage gates;
- browser never performs authoritative writes directly to PostgreSQL;
- provider/DB secrets stay server-side;
- root-cause fixes only; no weakening tests/security/business rules for green CI;
- deployment is `DEFERRED BY PRODUCT OWNER`; hosted runtime stays `NOT YET VERIFIED`.

Repository state:

- repo: `7eaur/alwaslh`;
- branch: `planning/product-evolution-review`;
- draft PR: #12;
- latest fully verified executable baseline: `6484677dffa80ca0658ce5837750d824e1bb6943`.

## 2. Stable Architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── explicit curriculum hierarchy
                   ├── canonical Stage9 source/provenance evidence
                   ├── Stage10 media evidence
                   ├── reviewed OCR text
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable AI execution/admission/control
                   ├── Stage12 bounded dedicated worker runtime
                   └── later TTS / notifications / offline sync
```

Hard engineering boundaries:

- provider/network calls do not run inside long DB transactions;
- durable workers use short claim/finalization transactions;
- stale/expired/cancelled workers cannot commit attempts/units/outputs;
- distributed throughput/health/budget controls are PostgreSQL-coordinated;
- Fastify remains HTTP-only; worker polling is separate;
- no credential/project rotation to evade quotas/terms;
- no hidden duplicate implementations for one lifecycle/authority;
- Stage9 source inventory is evidence, not curriculum authority;
- curriculum hierarchy is explicit and shallow, not recursive/filename-derived.

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
| 12 AI Durable Execution | REBUILD over existing durable tables | VERIFIED backend lifecycle/runtime |
| 13 Curriculum Structure backend foundation | KEEP + IMPROVE existing core model | VERIFIED |
| 13 Admin Web product | REBUILD UI over verified backend contracts | ACTIVE NEXT / NOT YET VERIFIED |

Live AI provider/model benchmark, production routes and hosted worker remain separate evidence and are `NOT YET VERIFIED`.

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

Returning login requires password + registered-device challenge. Recovery uses temporary password, revokes sessions and forces private password replacement. Device loss requires Admin reset/rebind and a new P-256 key; historical-key reuse is rejected.

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

Operational pressure is not semantic failure and does not by itself justify expensive-route escalation.

### Admin curriculum backend — VERIFIED

```text
Admin session
→ explicit Class / Subject
→ Subject Offering (`subject_class_links`)
→ optional Unit/Section
→ Lesson
→ status/archive/reorder/edit
→ durable curriculum audit
```

Lesson-to-section scope is enforced both by the service and PostgreSQL composite FK. No destructive Admin DELETE endpoint exists in the foundation.

## 5. Chronological Engineering History

### 5.1 Stage6/8 Auth / Activation / Device — VERIFIED

Closure head: `016546eca5696337b52063903bb5ba2fb9631c33`.

Implemented two-step activation, atomic code consumption/account creation, P-256 application-device challenge, device-bound sessions, temporary-password recovery, forced password change, Admin rebind and historical-key reuse rejection.

Evidence included Rebuild `34002283741` SUCCESS including Chromium.

### 5.2 OCR Foundation — VERIFIED

Closure head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

Implemented `0011_ocr_foundation.sql`, durable OCR jobs/leases/retry, stale-worker rejection, ready/checksum/media guards, raw + conservative normalized text, review gates, approved-only downstream search and provider-neutral OCR adapter.

Evidence included OCR `34003439653` and Full Rebuild `34003439669` SUCCESS.

### 5.3 Stage11 Provider-Neutral AI Contracts — VERIFIED

Closure executable head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

Implemented typed/Zod request/source/evidence/question/output contracts, Prompt Registry/versioning, deterministic schema/semantic/provenance/count/notation/duplicate validators, explicit `valid | invalid | review_required`, exact-source uncertainty behavior and provider-neutral benchmark harness.

`direct` AI questions remain reviewable output because current Question Bank persistence supports only `multiple_choice | true_false`.

### 5.4 Stage12 Durable Execution Core — VERIFIED

Final core closure: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Reused existing `ai_jobs / ai_job_units / ai_outputs`; added `0012_ai_execution.sql`, idempotent plans, UUID leases, attempt telemetry, provider-neutral router/adapter, bounded cascade/retry/backoff, stale-worker write rejection, cancellation and partial success.

Key hardening: attempt telemetry finalization is lease-protected too.

### 5.5 Stage12 Distributed Capacity / Backpressure — VERIFIED

Closure head: `881102ff94711f908104cd068a003ad598609944`.

Added PostgreSQL-coordinated global/provider/project/model capacity, short advisory admission lock, `resume_route_key`, deferral telemetry and race tests. Capacity pressure does not consume semantic retry or force model escalation.

### 5.6 Stage12 Health / Cooldown / Budget Controls — VERIFIED

Closure head: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Added `0014_ai_execution_controls.sql`, global/full-route kill switches, persisted Retry-After/health cooldown, consecutive retryable-failure cooldown, conservative global/route budget windows and pre-call reservations.

`AI-012-013` fixed a route identity regression: `route_key` is not globally unique. Runtime identity is:

```text
route_key + provider_key + provider_project_alias + credential_alias + model_used
```

### 5.7 Stage12 Pause / Resume / Progress — VERIFIED

Checkpoint: `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`.

Added `0015_ai_job_lifecycle.sql`, `ai_jobs.paused_at`, race-safe pause/claim locking, server-derived progress, resume without resetting attempts/outputs/backoff and immediate expired-lease release to durable `retrying`.

### 5.8 Stage12 Lifecycle Ownership Cleanup — VERIFIED

Closure head: `e7b95042a017ea558db9f769a46a37f155273a15`.

Removed obsolete duplicate claim/recovery implementations from `AiExecutionRepository`. `AiJobLifecycleRepository` is the single owner for job claim + expired-lease recovery.

### 5.9 Stage12 Dedicated Bounded Worker Runtime — VERIFIED

Final executable closure: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

Implemented fixed bounded slots, no bulk prefetch, bounded exponential idle backoff, graceful stop/no-new-claim, in-flight drain before DB close and fail-fast unexpected processor errors. Fastify remained HTTP-only and no fake provider bootstrap was invented.

Same-head evidence:

- Stage12 `34089764278`;
- Stage11 `34089764339`;
- OCR `34089764349`;
- Stage10 `34089764277`;
- Stage9 `34089764344`;
- Full Rebuild `34089764467` including Chromium — all SUCCESS.

### 5.10 Stage13 Curriculum Structure backend foundation — VERIFIED

Initial implementation: `70621c2f73e13b542960ad0ee3f7c850e0350e00`.
Final executable closure: `6484677dffa80ca0658ce5837750d824e1bb6943`.
Detailed contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

#### Discovery

`0001_core.sql` already provided `classes`, `subjects`, `subject_class_links` and `lessons`. `lessons` already referenced `(class_id, subject_id)` through `subject_class_links`.

Conclusion: `subject_class_links` already represents PED-018 **Subject Offering**. Creating a second `subject_offerings` table would duplicate authority and increase migration/data drift risk.

Stage9 `content_source_documents/assets` was also inspected and confirmed to be a separate source/provenance inventory, not curriculum authority.

#### Implementation

`0016_curriculum_structure.sql`:

- strengthens `subject_class_links` with status + updated_at;
- creates exactly one optional `curriculum_sections` layer;
- adds nullable `lessons.section_id`;
- adds composite `lessons_section_scope_fk` preventing cross-offering section assignment;
- adds `curriculum_events` Admin audit;
- adds targeted ordering/status/audit indexes.

`apps/api/src/curriculum`:

- Admin-only snapshot;
- class/subject/offering/section/lesson create/update;
- server-side slug normalization on create;
- duplicate-conflict behavior;
- parent-row locking during child creation;
- cross-offering scope validation;
- lesson attach/detach from section;
- status/archive/reorder/edit;
- no destructive DELETE route.

`apps/api/tests/integration/curriculum.integration.test.ts` proves API + DB integrity, including a direct SQL attempt that PostgreSQL rejects via `lessons_section_scope_fk`.

#### CI note

Initial head `70621c2f…` failed shared Biome formatting before TypeScript/runtime checks. `6484677d…` applied formatter-only changes; semantics/assertions remained unchanged.

Final exact-head evidence:

- Stage13 `34092024879` — SUCCESS;
- Stage12 `34092024902` — SUCCESS;
- Stage11 `34092024875` — SUCCESS;
- OCR `34092024895` — SUCCESS;
- Stage10 `34092024854` — SUCCESS;
- Stage9 `34092024883` — SUCCESS;
- Full Rebuild `34092024916` — SUCCESS including Chromium.

Result: **Curriculum Structure / Stage13 backend foundation VERIFIED**.

## 6. Architecture Decisions

Existing AI decisions AD-080–AD-105 remain valid. Current key decisions:

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
- **AD-101** — `AiJobLifecycleRepository` is the single owner for claim + expired-lease recovery.
- **AD-102** — worker scheduling uses fixed slots + bounded idle backoff; no in-memory bulk queue.
- **AD-103** — graceful worker stop prevents new claims but preserves valid in-flight lease authority until drain.
- **AD-104** — unexpected worker processor errors are fail-fast.
- **AD-105** — live worker bootstrap waits for authorized benchmark-approved provider configuration.
- **AD-106** — existing `subject_class_links` is the canonical Subject Offering authority; do not add a parallel table.
- **AD-107** — curriculum has exactly one optional `curriculum_sections` layer; no recursive generic tree without a new product rule.
- **AD-108** — lesson→section scope is DB-enforced by composite `(class_id, subject_id, section_id)` FK, not only application validation.
- **AD-109** — Admin curriculum lifecycle is non-destructive by default; status/archive preserves historical references.
- **AD-110** — Stage9 source inventory is provenance evidence and never silently becomes curriculum hierarchy.

## 7. Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | legacy audit | security compromise | private backend authorization | FIXED Stage6 |
| DATA-015 | P0 | Activation | partial/premature code consumption | Stage8 audit | account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Class Codes | racy redemption | Stage7 audit | double/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| AUTH-006-004 | P1 | Student Auth | password-only device-policy bypass | Stage6 review | device boundary bypass | device challenge + bound session | FIXED + VERIFIED |
| AUTH-006-005 | P1 | Recovery | no forced private replacement | Stage6 review | weak recovery | temporary password + revoke + forced change | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable canonical extraction | OCR discovery | unreliable downstream text | `0011` OCR pipeline | FIXED + VERIFIED |
| AI-011-001 | P1 | AI Contracts | provider/prompt coupling | Stage11 discovery | lock-in/weak validation | contracts/registry/validators | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | AI supports `direct`; DB bank does not | schema review | unsafe auto-publish | preserve reviewable output; explicit future rule | OPEN |
| AI-012-002 | P1 | Lease | stale worker late write | Stage12 review | corrupt result state | lease-protected writes | FIXED + VERIFIED |
| AI-012-006 | P1 | Scale | no distributed throughput limit | Stage12 audit | overload | DB capacity/backpressure | FIXED + VERIFIED |
| AI-012-007 | P1 | Operations | no cooldown/budget/kill policy | Stage12 audit | uncontrolled cost/eligibility | DB operational controls | FIXED + VERIFIED |
| AI-012-013 | P1 | Route Identity | `route_key` assumed globally unique | regression CI | cross-talk | full route identity | FIXED + VERIFIED |
| AI-012-015 | P1 | Lease Recovery | expired paused unit could appear running | lifecycle audit | false progress authority | immediate durable retrying release | FIXED + VERIFIED |
| AI-012-017 | P2 | Architecture | duplicate claim/recovery ownership remained | post-pause audit | future divergence | one lifecycle owner | FIXED + VERIFIED |
| AI-012-019 | P2 | Live AI Runtime | no authorized live adapter/benchmark/bootstrap | evidence boundary | cannot claim production AI | benchmark + real config first | OPEN / NOT YET VERIFIED |
| CURR-013-001 | P2 | Curriculum | PED-018 optional Unit/Section had no durable model/API | schema/API audit | Admin cannot represent intended hierarchy | additive `0016` + curriculum API | FIXED + VERIFIED |
| CURR-013-002 | P1 | Curriculum Integrity | plain section UUID could allow cross-offering association if only app-validated | design review | incorrect lesson hierarchy/provenance | composite DB scope FK + API validation | FIXED + VERIFIED |
| CURR-013-003 | P2 | Architecture | creating new `subject_offerings` would duplicate existing `subject_class_links` authority | repository discovery | drift/maintenance risk | keep + strengthen existing link table | PREVENTED / VERIFIED DECISION |
| CURR-013-004 | P2 | Data Lifecycle | destructive Admin delete could break historical lesson references | FK/caller audit | lost/broken learning/media history | archive/status; no DELETE route | CONTROLLED + VERIFIED |
| CURR-013-005 | P3 | CI | initial curriculum source failed Biome formatting only | run on `70621c2f…` | blocked verification signal | formatter-only `6484677d…` | FIXED + VERIFIED |
| PREVIEW-010-002 | P2 | Hosted Runtime | hosted pipeline behavior unproven | deployment deferred | cannot claim hosted runtime | verify only after re-enable | NOT YET VERIFIED |
| REPO-001 | P3 | Git Hygiene | accidental `tmp-unused-do-not-use` branch | branch audit | repository noise only | delete when ref-delete capability exists | OPEN HOUSEKEEPING |
| DOC-001 | P2 | Continuity | chat-memory dependency | governance audit | repeated/contradictory work | in-repo Status/Log/Handoff/docs | CONTROLLED |

## 8. Tests & Verification Summary

Latest fully green executable head: `6484677dffa80ca0658ce5837750d824e1bb6943`.

Same-head green matrix:

- Stage13 Curriculum Backend `34092024879`;
- Stage12 AI Execution `34092024902`;
- Stage11 AI Contracts `34092024875`;
- OCR Foundation `34092024895`;
- Stage10 Media Pipeline `34092024854`;
- Stage9 Content Import `34092024883`;
- Full Rebuild `34092024916` including Chromium.

Stage13 verifies clean migrations, schema contracts, Admin authorization, CRUD-without-delete behavior, optional sections, cross-scope DB protection and audit. Full Rebuild verifies existing Auth/Access/Activation and Student browser flow remain intact.

## 9. Known Issues / Remaining Risk

- deployment remains deferred; hosted Student/Admin/API/media/OCR/AI worker runtime is unverified;
- live AI provider/model benchmark, credentials, current prices, actual billing and production routes remain unverified;
- production live-provider worker bootstrap remains intentionally unimplemented until real provider configuration is authorized/benchmarked;
- `direct` question persistence into Question Bank is unresolved;
- Stage13 Admin Web curriculum/content UI is not yet implemented;
- Student entitlement-filtered curriculum read API is not yet implemented;
- Draft→Review→Published content workflow is not yet implemented;
- TTS implementation/runtime is not yet verified;
- OCR production-quality benchmark beyond current integration/smoke evidence remains future work;
- Reader Text/Search/TTS, final Offline/PWA and later Student stages remain;
- temporary branch `tmp-unused-do-not-use` remains P3 housekeeping.

## 10. Remaining Work — Ordered

1. Audit `apps/admin-web` actual routing/auth/state/design code and legacy Admin coverage.
2. Build Stage13 Admin curriculum management UI against verified `/v1/admin/curriculum`, including loading/error/empty/responsive/a11y and archive/status flows.
3. Add browser/API verification and legacy coverage evidence for Admin curriculum flows.
4. Continue Admin content/media/OCR management using Stage9/10/OCR authority boundaries.
5. Add Admin AI job operations/review over verified Stage12, never a second queue/client-owned progress.
6. Resolve `direct` Question Bank persistence before publish workflows depend on it.
7. Continue Students/Codes/Recovery/Device Rebind, Notifications, Import/Export/Reports/Settings/Audit.
8. Execute live AI provider/model benchmark before production routing/bootstrap.
9. Restore/verify hosted deployment only after explicit Product Owner re-enable instruction.
10. Delete `tmp-unused-do-not-use` when branch-ref deletion becomes available.

## 11. Current State

**Verified:** Stages1–10 + OCR + Stage11 + Stage12 backend lifecycle/runtime + Stage13 Curriculum Structure backend foundation.

**Latest verified executable:** `6484677dffa80ca0658ce5837750d824e1bb6943`.

**Current engineering focus:** Stage13 Admin Web curriculum/content integration.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
