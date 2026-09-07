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
- old database is outside current development scope by Product Owner instruction; repository migrations/tests/current PostgreSQL contracts are authoritative;
- deployment is `DEFERRED BY PRODUCT OWNER`; hosted runtime stays `NOT YET VERIFIED`.

Repository state:

- repo: `7eaur/alwaslh`;
- branch: `planning/product-evolution-review`;
- draft PR: #12;
- latest fully verified executable baseline: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

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
- browser does not run OCR/AI workers as authoritative execution;
- no credential/project rotation to evade quotas/terms;
- no hidden duplicate implementations for one lifecycle/authority;
- Stage9 source inventory is evidence, not curriculum authority;
- Stage10 media is not implicitly published curriculum content;
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
| 13 Admin Curriculum Web | REBUILD UI over verified backend contracts | VERIFIED |
| 13 Admin Content/Media/OCR Operations | IMPROVE/REBUILD Admin operations layer over existing authorities | ACTIVE NEXT |

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

### Content/media/OCR backend — VERIFIED

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

### Admin curriculum backend + Web — VERIFIED

```text
Admin login/session restore
→ explicit Class / Subject
→ Subject Offering (`subject_class_links`)
→ optional Unit/Section
→ Lesson
→ status/archive/reorder/edit/move
→ authoritative refresh
→ server session restore/logout
```

Lesson-to-section scope is enforced both by service and PostgreSQL composite FK. Admin Web does not own authoritative data and exposes no destructive curriculum removal control in this foundation.

## 5. Chronological Engineering History

### 5.1 Stage6/8 Auth / Activation / Device — VERIFIED

Closure head: `016546eca5696337b52063903bb5ba2fb9631c33`.

Implemented two-step activation, atomic code consumption/account creation, P-256 application-device challenge, device-bound sessions, temporary-password recovery, forced password change, Admin rebind and historical-key reuse rejection.

Evidence: Full Rebuild `34002283741`, Stage9 `34002283819`, Stage10 `34002283817` — SUCCESS.

### 5.2 OCR Foundation — VERIFIED

Closure head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

Implemented `0011_ocr_foundation.sql`, durable OCR jobs/leases/retry, stale-worker rejection, ready/checksum/media guards, raw + conservative normalized text, review gates, approved-only downstream search and provider-neutral OCR adapter.

Evidence included OCR `34003439653` and Full Rebuild `34003439669` — SUCCESS.

### 5.3 Stage11 Provider-Neutral AI Contracts — VERIFIED

Closure executable head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

Implemented typed request/source/evidence/question/output contracts, Prompt Registry/versioning, schema/semantic/provenance/count/notation/duplicate validators, explicit `valid | invalid | review_required`, exact-source uncertainty behavior and provider-neutral benchmark harness.

`direct` AI questions remain reviewable output because current Question Bank persistence supports only `multiple_choice | true_false`.

### 5.4 Stage12 Durable Execution Core — VERIFIED

Final core closure: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Reused `ai_jobs / ai_job_units / ai_outputs`; added durable plans, UUID leases, attempt telemetry, provider-neutral router/adapter, bounded cascade/retry/backoff, stale-worker write rejection, cancellation and partial success.

### 5.5 Stage12 Distributed Capacity / Backpressure — VERIFIED

Closure head: `881102ff94711f908104cd068a003ad598609944`.

Added PostgreSQL-coordinated global/provider/project/model capacity, short advisory admission lock, `resume_route_key`, deferral telemetry and race tests. Capacity pressure does not consume semantic retry or force model escalation.

### 5.6 Stage12 Health / Cooldown / Budget Controls — VERIFIED

Closure head: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Added kill switches, Retry-After/health cooldown, consecutive retryable-failure cooldown, conservative global/route budget windows and pre-call reservations. Runtime route identity is route + provider + project + credential + model.

### 5.7 Stage12 Pause / Resume / Progress — VERIFIED

Checkpoint: `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`.

Added `ai_jobs.paused_at`, race-safe pause/claim locking, server-derived progress, resume without resetting attempts/outputs/backoff and immediate expired-lease release to durable retrying.

### 5.8 Stage12 Lifecycle Ownership Cleanup — VERIFIED

Closure head: `e7b95042a017ea558db9f769a46a37f155273a15`.

`AiJobLifecycleRepository` is the single owner for claim + expired-lease recovery.

### 5.9 Stage12 Dedicated Bounded Worker Runtime — VERIFIED

Final executable closure: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

Implemented fixed bounded slots, bounded idle backoff, graceful stop/drain and fail-fast unexpected processor errors. Fastify remains HTTP-only.

### 5.10 Stage13 Curriculum Structure backend foundation — VERIFIED

Initial implementation: `70621c2f73e13b542960ad0ee3f7c850e0350e00`.
Final backend closure: `6484677dffa80ca0658ce5837750d824e1bb6943`.
Detailed contract: `docs/curriculum/CURRICULUM_STRUCTURE.md`.

Discovery established that existing `subject_class_links` already is the Subject Offering authority. `0016_curriculum_structure.sql` adds one optional `curriculum_sections` layer, nullable `lessons.section_id`, composite same-offering FK and curriculum audit events. No second offering table or recursive tree was introduced.

Prior same-head evidence at `6484677d…`: Stage13 `34092024879`, Stage12 `34092024902`, Stage11 `34092024875`, OCR `34092024895`, Stage10 `34092024854`, Stage9 `34092024883`, Full Rebuild `34092024916` — SUCCESS.

### 5.11 Stage13 Admin Curriculum Web — VERIFIED

Final executable closure: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.
Detailed contract: `docs/admin/STAGE13_ADMIN_CURRICULUM_UI.md`.

#### Discovery / classification

The previous `apps/admin-web` was a static shell without session restoration, API-backed curriculum state or real management actions. Classification: **REBUILD within the same Super Admin product surface**, preserving brand/design foundations and server authority.

#### Implementation

- Admin login + automatic server-session restoration;
- server-backed logout;
- real curriculum metrics only;
- typed API client;
- create/edit Class, Subject, Offering, optional Section and Lesson;
- sectioned/unsectioned Lesson moves;
- ordering and lifecycle status edits;
- authoritative snapshot refresh after successful mutation;
- explicit loading/error/empty/action-feedback states;
- responsive RTL Admin shell;
- future modules marked rather than faked;
- no browser-direct DB access.

#### Chromium evidence

Fresh PostgreSQL browser flow proves:

```text
login
→ create Class
→ create Subject
→ create Offering
→ create Section
→ create Lesson
→ detach/move Lesson
→ rename Lesson
→ set inactive
→ reload + restore session
→ logout
```

390px viewport overflow check also passes.

#### CI closure and harness corrections

Closure uncovered test-harness defects; none required weakening product behavior:

1. fetch mocks must create a new `Response` per request;
2. URL assertions must tolerate configured `VITE_API_BASE_URL` by checking the effective pathname;
3. Playwright selectors must target actual combobox/summary/status elements rather than ambiguous labels/text;
4. Stage12 capacity race originally ran two units under the same locked `ai_jobs` row. The second claim could legitimately return `null` before capacity admission. The test was corrected to use two independent jobs competing for one global slot, proving the actual distributed-capacity contract deterministically.

Final exact-head matrix at `d3e621e6f60cc56ee3838b7df36a86ebafa37524`:

- Stage13 `34168788666` — SUCCESS including Admin Chromium;
- Stage12 `34168788667` — SUCCESS;
- Stage11 `34168788661` — SUCCESS;
- OCR `34168788704` — SUCCESS;
- Stage10 `34168788646` — SUCCESS;
- Stage9 `34168788663` — SUCCESS;
- Full Rebuild `34168788747` — SUCCESS including Student Chromium.

Result: **Stage13 Admin Curriculum Web VERIFIED**.

### 5.12 Stage13 Content / Media / OCR Operations — DISCOVERY COMPLETE / IMPLEMENTATION NEXT

Verified repository discovery:

- `0008_content_source_import.sql`: ordered source documents/assets + source provenance;
- `0009_media_pipeline.sql`: `media_assets` + deterministic `media_variants`;
- `0011_ocr_foundation.sql`: extraction lifecycle/confidence/review/audit actor;
- `apps/api/src/media/repository.ts`: processor lifecycle, no Admin list/read model;
- `apps/api/src/ocr/repository.ts`: extraction lifecycle/search/get/review primitives, no Admin pending/recent list;
- `apps/api/src/app.ts`: no Admin Content/Media/OCR HTTP routes yet;
- `apps/admin-web`: “الوسائط وOCR” remains disabled;
- `lesson_assets` exists in `0001_core.sql`, but Stage10 media has no automatic publication/linking contract to it.

Architecture decision for the next batch: build a thin Admin operations/read-review layer over existing Stage9→Stage10→OCR authorities. Do not create a second queue or claim media/OCR is published Lesson content. Upload progress/history and media→lesson publication/linking require explicit later contracts.

## 6. Architecture Decisions

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
- **AD-106** — `subject_class_links` is canonical Subject Offering authority; no parallel table.
- **AD-107** — curriculum has exactly one optional `curriculum_sections` layer; no recursive generic tree without a new product rule.
- **AD-108** — lesson→section scope is DB-enforced by composite FK, not only application validation.
- **AD-109** — Admin curriculum lifecycle is non-destructive by default; status/archive preserves historical references.
- **AD-110** — Stage9 source inventory is provenance evidence and never silently becomes curriculum hierarchy.
- **AD-111** — Admin Web holds presentation/session state only; authoritative curriculum data remains API/PostgreSQL-owned and is refreshed after mutation.
- **AD-112** — Browser E2E locators must target semantic interactive elements; ambiguous text/substring matches are test defects, not reasons to change production UX.
- **AD-113** — Distributed capacity race tests use independent jobs when proving global concurrency, avoiding unrelated same-job row-lock serialization.
- **AD-114** — Stage13 Content/Media/OCR Admin operations will reuse Stage9/10/OCR authorities; no second media/OCR lifecycle or browser-owned worker.
- **AD-115** — Stage10 media/OCR records are not considered published Lesson content until an explicit media→`lesson_assets` publication/linking contract is implemented and verified.

## 7. Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | legacy audit | security compromise | private backend authorization | FIXED + VERIFIED |
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
| AI-012-020 | P3 | Stage12 Test | global-capacity race used two units on one job, allowing job-row lock to yield `null` before capacity gate | run `34167018718` + lifecycle SQL review | flaky false-negative CI | race independent jobs sharing global capacity | FIXED + VERIFIED `34168788667` |
| CURR-013-001 | P2 | Curriculum | optional Unit/Section had no durable model/API | schema/API audit | intended hierarchy unavailable | additive `0016` + curriculum API | FIXED + VERIFIED |
| CURR-013-002 | P1 | Curriculum Integrity | section UUID could cross Offering if only app-validated | design review | incorrect lesson hierarchy | composite DB scope FK + API validation | FIXED + VERIFIED |
| CURR-013-003 | P2 | Architecture | new `subject_offerings` would duplicate `subject_class_links` | repository discovery | drift risk | strengthen existing link table | PREVENTED / VERIFIED |
| CURR-013-004 | P2 | Data Lifecycle | destructive lifecycle could break historical references | FK/caller audit | broken learning/media history | status/archive foundation | CONTROLLED + VERIFIED |
| ADMIN-013-001 | P1 | Admin Product | static Admin shell had no authenticated server-backed curriculum operations | source audit | Super Admin product unusable for curriculum | rebuild shell/session/API workspace | FIXED + VERIFIED |
| ADMIN-013-002 | P2 | Admin UX | no explicit loading/error/empty/mutation states | source audit | weak operational clarity | typed states + authoritative refresh | FIXED + VERIFIED |
| ADMIN-013-003 | P3 | Browser Tests | ambiguous Playwright text/label selectors produced false failures | Stage13 runs before `d3e621e6…` | noisy CI / hidden real signal | semantic scoped locators | FIXED + VERIFIED |
| CONTENT-013-001 | P2 | Content Operations | no Admin HTTP/read model joining Stage9 source, Stage10 media and OCR review state | repository discovery | cannot supervise content processing | build thin Admin operations layer | OPEN / CURRENT |
| CONTENT-013-002 | P1 | Publication Boundary | Stage10 `media_assets` are not linked automatically to `lesson_assets` | `0001` + `0009` schema review | risk of treating processing evidence as published content | explicit future publication/linking contract | OPEN |
| PREVIEW-010-002 | P2 | Hosted Runtime | hosted pipeline behavior unproven | deployment deferred | cannot claim hosted runtime | verify only after re-enable | NOT YET VERIFIED |
| REPO-001 | P3 | Git Hygiene | `tmp-unused-do-not-use` branch remains | branch audit | repository noise only | remove when appropriate | OPEN HOUSEKEEPING |
| DOC-001 | P2 | Continuity | chat-memory dependency risk | governance audit | repeated/contradictory work | repository Status/Log/Handoff/docs | CONTROLLED |

## 8. Tests & Verification Summary

Latest fully green executable head: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

Same-head matrix:

- Stage13 Curriculum Verification `34168788666` — SUCCESS including Admin Chromium;
- Stage12 AI Execution `34168788667` — SUCCESS;
- Stage11 AI Contracts `34168788661` — SUCCESS;
- OCR Foundation `34168788704` — SUCCESS;
- Stage10 Media Pipeline `34168788646` — SUCCESS;
- Stage9 Content Import `34168788663` — SUCCESS;
- Full Rebuild `34168788747` — SUCCESS including Student Chromium.

Verified Stage13 Admin browser scenarios: authentication, hierarchy creation, lesson move/detach, rename, status update, reload/session restore, no destructive removal control, logout and 390px responsive overflow check.

## 9. Known Issues / Remaining Risk

- deployment remains deferred; hosted Student/Admin/API/media/OCR/AI worker runtime is unverified;
- live AI provider/model benchmark, credentials, current prices, actual billing and production routes remain unverified;
- production live-provider worker bootstrap remains intentionally unimplemented until real provider configuration is authorized/benchmarked;
- `direct` question persistence into Question Bank is unresolved;
- Admin Content/Media/OCR operations surface is not implemented yet;
- media→`lesson_assets` publication/linking contract is not implemented yet;
- upload progress/history contract is not implemented yet;
- Student entitlement-filtered curriculum read API is not implemented yet;
- Draft→Review→Published content workflow is not implemented yet;
- TTS implementation/runtime is not yet verified;
- OCR production-quality benchmark beyond integration/smoke evidence remains future work;
- Reader Text/Search/TTS, final Offline/PWA and later Student stages remain;
- `tmp-unused-do-not-use` remains P3 housekeeping.

## 10. Remaining Work — Ordered

1. Build Stage13 Admin Content/Media/OCR read model and Admin-only HTTP routes using existing Stage9/10/OCR authorities.
2. Add Admin OCR pending/detail/review/correction operations without duplicating worker lifecycle.
3. Build responsive/a11y Admin “الوسائط وOCR” workspace with search/filter/status/detail/review states.
4. Add API/PostgreSQL/unit/Chromium tests and update legacy coverage evidence.
5. Define upload/progress/history and media→lesson publication linking explicitly before implementation.
6. Add Admin AI job operations/review over verified Stage12, never a second queue/client-owned progress.
7. Resolve `direct` Question Bank persistence before publish workflows depend on it.
8. Continue Students/Codes/Recovery/Device Rebind, Notifications, Import/Export/Reports/Settings/Audit.
9. Execute live AI provider/model benchmark before production routing/bootstrap.
10. Restore/verify hosted deployment only after explicit Product Owner re-enable instruction.

## 11. Current State

**Verified:** Stages1–10 + OCR + Stage11 + Stage12 backend lifecycle/runtime + Stage13 Curriculum Structure backend + Stage13 Admin Curriculum Web.

**Latest verified executable:** `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

**Current engineering focus:** Stage13 Admin Content / Media / OCR Operations.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
