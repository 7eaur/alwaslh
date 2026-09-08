# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture decisions, audit findings, implementation history, tests and remaining work. Code/migrations/GitHub Actions outrank prose. Anything not executed/tested is `NOT YET VERIFIED`.

Last consolidated: 2026-09-08.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية تُعيد بناء منتج قديم قائم بالفعل مع الحفاظ على الفكرة والنتائج المهمة، لا مع الحفاظ على تنفيذ قديم غير آمن أو غير قابل للصيانة.

Runtime/product surfaces:

- `apps/student-web`: Student Web/PWA.
- `apps/admin-web`: independent Super Admin Web.
- `apps/api`: authoritative Fastify/TypeScript Backend API.
- `database/migrations`: PostgreSQL schema authority.
- `packages/brand`: canonical brand primitives.

Product outcomes:

- الإدارة تدير المنهج والمحتوى والوسائط وOCR/AI/Banks/codes/students/operations؛
- الطالب يفعّل حسابه بأمان، يستهلك ما يحق له فقط، يقرأ ويتدرب ويختبر ويحفظ بيانات تعلمه ويعمل Offline حسب العقد؛
- المحتوى المصدر له provenance واضح؛
- الذكاء الاصطناعي يساعد في التحويل/التوليد لكنه لا يصبح سلطة تعليمية غير مراجعة.

Governance:

- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` يمنعان ضياع legacy capabilities؛
- Product Decisions authority في `docs/product/*`؛
- Current Product Owner overrides في `docs/product/CURRENT_PRODUCT_OVERRIDES.md`؛
- root-cause/no-patching mandatory؛
- repository docs هي ذاكرة المشروع، لا chat memory؛
- old DB خارج scope الحالي؛
- deployment `DEFERRED BY PRODUCT OWNER`.

## 2. Architecture Summary

```text
Admin Web ──┐
            ├── Fastify API ── private PostgreSQL
Student PWA ┘      │
                   ├── Auth / Activation / Access
                   ├── Curriculum
                   ├── Stage9 source/provenance
                   ├── Stage10 media
                   ├── OCR derived/reviewed text
                   ├── Stage11 AI contracts
                   ├── Stage12 durable AI execution + worker
                   └── later publish/TTS/notifications/offline sync
```

### Stable authority boundaries

- Browser owns presentation/session UX, not authoritative data/business state.
- Auth/authorization/entitlements are server-owned.
- Full Code = 6 digits; Class Code = 7 digits.
- Student activation verify is non-consuming; finalization is atomic.
- Student returning auth requires password + registered P-256 application-device proof.
- Admin recovery/rebind cannot reveal stored passwords or reuse old device keys.
- Curriculum authority: Class → Subject Offering (`subject_class_links`) → optional `curriculum_sections` → Lesson.
- Stage9 source inventory is provenance evidence, not curriculum hierarchy.
- Stage10 media is processing evidence, not automatically Published Lesson content.
- OCR/AI/TTS are derived layers; source upload/media success must not depend on them.
- reviewed OCR + source/page/checksum is preferred evidence for source-sensitive AI.
- AI contracts/provider routing/execution are separate concerns.
- provider/network calls are outside long DB transactions.
- durable workers use lease-protected writes and DB-coordinated capacity/controls.
- Fastify HTTP and worker polling are separate runtimes.
- Student uses reviewed/published question/content authority, not raw AI output.

## 3. Stage Ledger

| Stage / Area | Classification | State |
|---|---|---|
| 1 Product Contract | KEEP | VERIFIED |
| 2 Brand | KEEP | VERIFIED |
| 3 UX Architecture | KEEP/EVOLVE | VERIFIED baseline |
| 4 PostgreSQL Platform | additive/current | VERIFIED |
| 5 Engineering Foundation | KEEP | VERIFIED |
| 6 Auth & Authorization | REFACTOR | VERIFIED |
| 7 Access Codes & Entitlements | KEEP/REBUILD enforcement | VERIFIED |
| 8 Activation/Login/Recovery/Device | REFACTOR | VERIFIED incl. Chromium |
| 9 Source Import | KEEP provenance | VERIFIED |
| 10 Media Pipeline | REBUILD implementation, same outcome | VERIFIED |
| OCR Foundation | derived durable layer | VERIFIED |
| 11 AI Contracts | provider-neutral rebuild | VERIFIED |
| 12 AI Durable Execution | REBUILD over durable tables | VERIFIED backend/runtime |
| 13A Curriculum Structure | KEEP + IMPROVE existing model | VERIFIED |
| 13B Admin Curriculum Web | REBUILD UI | VERIFIED |
| 13C Admin Content/Media/OCR Operations | IMPROVE operations over existing authorities | VERIFIED |
| 13D Upload/History/Publication Linking | REQUIRED | NEXT / NOT YET VERIFIED |
| 13E+ Remaining Admin Product | REQUIRED | NOT YET VERIFIED |
| 14+ Student/Learning/Release stages | REQUIRED | NOT YET VERIFIED according to Roadmap |

## 4. Verified Core Flows

### 4.1 Student activation / returning login / recovery

```text
6-digit Full Code
→ non-consuming verification
→ one-time activation ticket
→ chosen password + non-extractable P-256 key/proof
→ atomic profile/credential/entitlement/redemption/device/audit
→ device-bound session
```

Returning Student:

```text
identifier + password
→ device challenge
→ proof with active registered key
→ device-bound session
```

Recovery:

```text
Admin issues temporary password
→ sessions/challenges revoked
→ student authenticates
→ forced private password replacement
→ explicit rebind only when authorized
```

### 4.2 Source → Media → OCR

```text
Stage9 canonical source inventory
→ Stage10 media asset/variants/checksum/order
→ ready media
→ OCR lease/retry
→ raw + conservative normalized text
→ review gate
→ approved searchable/reusable text
```

### 4.3 AI

```text
reviewed source chunks
→ Stage11 typed mode/prompt/version
→ Stage12 job/unit
→ DB-coordinated admission
→ short lease claim
→ provider call outside DB transaction
→ validators/provenance/dedupe
→ lease-protected attempt/output
→ accepted | review_required | retry | failed
```

### 4.4 Admin curriculum/content operations

```text
Admin login/session
→ Curriculum management
→ source document operations
→ ordered source pages
→ media status/variants/errors
→ OCR detail
→ review/correct/approve/reject
```

No step above automatically publishes Stage10 media into a Lesson.

## 5. Chronological Engineering History

### 5.1 Stages1–5 — VERIFIED

Product/brand/UX/PostgreSQL/engineering foundation built and placed under executable CI. Legacy inventories/audits converted into explicit contracts rather than relying on old code behavior.

### 5.2 Stage6/8 Auth / Activation / Device — VERIFIED

Checkpoint: `016546eca5696337b52063903bb5ba2fb9631c33`.

Implemented:
- two-step non-consuming 6-digit Full-Code verification + one-time activation ticket;
- atomic activation transaction;
- role-isolated Admin login vs Student challenge login;
- ECDSA P-256 registered-device identity;
- non-extractable browser private key in account-scoped IndexedDB;
- Student sessions bound to active device;
- Admin temporary-password recovery, session revoke, forced change;
- explicit device rebind and historical key reuse rejection.

Evidence: Full Rebuild `34002283741`, Stage9 `34002283819`, Stage10 `34002283817` SUCCESS at that checkpoint.

### 5.3 Stage7 Access / Entitlements — VERIFIED

Server-owned Full/Class code rules, multiple class entitlements, transactional redemption, renewal/no-waste behavior, expiry and race handling verified. Full Code remains 6 digits; Class Code remains 7 digits.

### 5.4 Stage9 Source Import — VERIFIED

Canonical reference repo: `7eaur/alwaslh-go`.
Pinned revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

Verified inventory: 15 roots / 48 docs / 5,552 images / 4,218 JPG / 1,334 WEBP / 86 recognized helpers / 24 manifests / SHA-256 digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

Import is deterministic/idempotent source evidence only.

### 5.5 Stage10 Media Pipeline — VERIFIED

`0009_media_pipeline.sql`, `MediaStorage`, local filesystem adapter, Sharp variants `source/display/thumbnail/ai`, Poppler PDF extraction, deterministic provenance/order/checksum/idempotency/cleanup.

Hosted durable storage/Poppler remains `NOT YET VERIFIED` while deployment is deferred.

### 5.6 OCR Foundation — VERIFIED

Closure checkpoint: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

`0011_ocr_foundation.sql` + provider-neutral repository/service:
- queued/running/retrying/completed/failed;
- leases/retry timing/stale-worker protection;
- ready-media/checksum guards;
- raw/normalized/confidence/provider metadata;
- pending/approved/rejected review;
- empty/sensitive/low-confidence review behavior;
- approved-text search;
- Tesseract reference adapter and real smoke integration.

Production OCR quality benchmark remains later evidence.

### 5.7 Stage11 Provider-Neutral AI Contracts — VERIFIED

Verified checkpoint: `592123dae33f0cfce2ecd36e9577764767faa95a`.

Added:
- typed modes for summary/question generation/comprehensive/multi-version/exact/replica/regenerate/page detection;
- Prompt Registry versioning;
- `approved_ocr | vision_fallback` source chunks with media/page/checksum provenance;
- MCQ/T-F/direct output contract;
- known/unknown/review_required answer state;
- Arabic/scientific/exact-source validation;
- answer/index/count/provenance/duplicate/near-duplicate checks;
- no fabricated exact answer;
- golden fixtures + provider-neutral benchmark harness.

Question Bank currently persists MCQ/T-F only; `direct` persistence remains unresolved.

### 5.8 Stage12 Durable Execution Core — VERIFIED

Core checkpoint: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Reused `ai_jobs / ai_job_units / ai_outputs`; added plan creation, leases, attempts/telemetry, route cascade, retries/backoff, cancellation, partial success and lease-protected writes.

### 5.9 Stage12 Capacity / Backpressure — VERIFIED

Checkpoint: `881102ff94711f908104cd068a003ad598609944`.

DB-coordinated global/provider/project/model admission. Capacity deferral does not consume semantic retries and resumes the correct route rather than forcing a more expensive tier.

### 5.10 Stage12 Operational Controls — VERIFIED

Checkpoint: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Global/route kill switches, Retry-After/health cooldown, budget reservation windows, full route identity isolation.

### 5.11 Stage12 Pause / Resume / Progress — VERIFIED

Checkpoint: `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`.

`paused_at` is an operator scheduling gate separate from execution result status; pause/claim use job-row locking; expired lease during pause returns to retrying; resume preserves prior outputs/attempts/backoff; progress is server-derived.

### 5.12 Stage12 Lifecycle Ownership Cleanup — VERIFIED

Checkpoint: `e7b95042a017ea558db9f769a46a37f155273a15`.

Removed duplicate claim/recovery implementation. `AiJobLifecycleRepository` is single owner for claim + expired-lease recovery.

### 5.13 Stage12 Dedicated Worker Runtime — VERIFIED

Checkpoint: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

Fixed bounded slots, bounded idle backoff, graceful stop/drain, DB close after drain and fail-fast unexpected errors. No fake provider bootstrap; live provider starts only after benchmarked configuration.

### 5.14 Stage13A Curriculum Structure Backend — VERIFIED

Final backend checkpoint: `6484677dffa80ca0658ce5837750d824e1bb6943`.

Discovery proved `subject_class_links` already is Subject Offering. Added `0016_curriculum_structure.sql`: status/update metadata, exactly one optional `curriculum_sections` layer, nullable `lessons.section_id`, composite same-offering FK, audit events. No duplicate offering table or generic recursive tree.

### 5.15 Stage13B Admin Curriculum Web — VERIFIED

Earlier closure: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

Rebuilt static shell into authenticated server-backed product surface:
- Admin login/session restore/logout;
- Class/Subject/Offering/Section/Lesson create/edit/order/status/move;
- no destructive delete control in foundation;
- loading/error/empty/mutation states;
- RTL responsive shell;
- Chromium full flow + 390px overflow check.

Harness defects found during closure were fixed by making tests more semantically precise, never by weakening product behavior.

### 5.16 Stage13C Admin Content / Media / OCR Operations — VERIFIED

Final executable closure: `260cfef1c48d1290611103f8443d222f8cd041b6`.

Discovery found Stage9/10/OCR authorities were strong but lacked Admin HTTP/read-review model. Implemented a **thin operations layer** rather than a second pipeline.

Backend:
- `apps/api/src/content/admin-operations.ts`;
- `apps/api/src/content/admin-operations-http.ts`;
- `apps/api/src/app.ts` wiring.

Operations API:
- list/filter/search/paginate source documents;
- processing summary/facets;
- ordered source asset detail;
- media ready/failed state + errors + deterministic variants;
- OCR metadata list without raw text payload;
- OCR detail with raw/normalized text + source provenance;
- approve/reject/correct pending OCR;
- empty-text approval guard;
- review conflict/replay guard.

Admin UI:
- real `الوسائط وOCR` navigation;
- metrics/search/class/subject/type filters/pagination;
- document/detail/page/media states;
- OCR review panel;
- loading/error/empty states;
- authoritative refresh after review.

Browser closure found one strict locator conflict because raw OCR appears intentionally in both `<pre>` and review `<textarea>`. Production UX was correct; E2E was scoped to `pre.ocr-source-text`, preserving the assertion.

Specialized contract: `docs/admin/STAGE13_CONTENT_MEDIA_OCR_OPERATIONS.md`.

## 6. Architecture Decisions

### OCR / AI decisions

- **AD-075** — OCR is independent derived state over media identity/checksum; it does not redefine upload/media success.
- **AD-076** — OCR provider/profile/version provenance is durable.
- **AD-077** — OCR workers require lease authority for completion/failure; stale workers cannot write.
- **AD-078** — low-confidence/empty/sensitive OCR can require review; approved content is the safe downstream search path.
- **AD-079** — OCR provider boundary remains replaceable; Tesseract is a reference adapter, not a product lock-in.
- **AD-080** — Stage11 domain contracts are provider/model-neutral.
- **AD-081** — reviewed OCR + source/page/checksum is primary book-generation evidence.
- **AD-082** — exact modes never fabricate certainty.
- **AD-084** — `direct` AI output is preserved but not silently persisted into current Question Bank.
- **AD-085** — production route selection requires benchmark evidence.
- **AD-086** — reuse/extend `ai_jobs / ai_job_units / ai_outputs`; no second queue.
- **AD-087** — provider calls occur outside DB transactions.
- **AD-088** — attempt/unit/output writes are lease-protected.
- **AD-090** — cascade is bounded and never rotates keys/projects to evade provider terms.
- **AD-091** — partial success is first-class.
- **AD-092** — distributed throughput limits are DB-coordinated.
- **AD-093** — operational pressure defers without consuming semantic retry or forcing escalation.
- **AD-094** — kill/cooldown/budget admission is DB-coordinated before attempt creation.
- **AD-095** — configured budget reservations are safety ceilings, not billing truth.
- **AD-096** — route runtime state uses full route identity; `route_key` is not globally unique.
- **AD-097** — job pause/resume is separate from internal `resume_route_key`.
- **AD-098** — AI worker runtime is separate from Fastify HTTP server.
- **AD-101** — `AiJobLifecycleRepository` is sole claim + expired-lease recovery owner.
- **AD-102** — worker uses fixed slots + bounded idle backoff; no in-memory bulk queue.
- **AD-103** — graceful stop prevents new claims but preserves valid in-flight lease authority until drain.
- **AD-104** — unexpected processor errors are fail-fast.
- **AD-105** — live worker bootstrap waits for authorized benchmark-approved provider configuration.

### Curriculum / Admin decisions

- **AD-106** — `subject_class_links` is canonical Subject Offering; no parallel table.
- **AD-107** — exactly one optional curriculum section layer; no recursive tree without new product rule.
- **AD-108** — Lesson→Section same-offering scope is DB-enforced with composite FK.
- **AD-109** — Admin curriculum lifecycle is non-destructive by default; status/archive preserves historical references.
- **AD-110** — Stage9 inventory is provenance evidence and never silently becomes curriculum hierarchy.
- **AD-111** — Admin Web holds presentation/session state only; authoritative data stays API/PostgreSQL-owned and refreshes after mutation.
- **AD-112** — E2E locators target semantic interactive elements; ambiguous text/substring matches are test defects, not reasons to alter product UX.
- **AD-113** — distributed capacity race tests use independent jobs when proving global concurrency, avoiding unrelated same-job row-lock serialization.
- **AD-114** — Admin Content/Media/OCR reuses Stage9/10/OCR authorities; no second media/OCR lifecycle or browser worker.
- **AD-115** — Stage10 media/OCR is not Published Lesson content until an explicit `lesson_assets` publication/linking contract is verified.
- **AD-116** — Content Operations list/read model separates lightweight OCR metadata from raw/detail text payload to keep 5,552-page supervision bounded.
- **AD-117** — OCR empty text cannot transition from pending to approved without a non-empty correction.
- **AD-118** — OCR review remains server-transactional and actor-audited; browser only submits review intent.
- **AD-119** — Stage13C Admin operations are read/review supervision, not upload-authoring or publish authority; those contracts remain Stage13D.
- **AD-120** — current docs distinguish executable baseline from docs-only closure so documentation commits never masquerade as new runtime evidence.

Product/business decisions PED-* remain canonical in `docs/product/*`; do not duplicate or silently reinterpret them here.

## 7. Audit Findings

| ID | Sev | Area | Problem | Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | security compromise | private backend authorization | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | premature/partial Full-Code consumption | account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Access | racy Class-Code redemption | double/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| AUTH-006-004 | P1 | Student Auth | password-only device bypass | device boundary bypass | challenge + bound session | FIXED + VERIFIED |
| AUTH-006-005 | P1 | Recovery | weak recovery/no forced private replacement | account risk | temp password + revoke + forced change | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable canonical extraction | unreliable downstream text | `0011` OCR pipeline | FIXED + VERIFIED |
| AI-011-001 | P1 | AI Contracts | provider/prompt coupling | lock-in/weak validation | contracts/registry/validators | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | AI supports `direct`; DB bank does not | unsafe auto-publish | preserve reviewable output; explicit future persistence rule | **OPEN** |
| AI-012-002 | P1 | Lease | stale worker late write | corrupt state | lease-protected writes | FIXED + VERIFIED |
| AI-012-006 | P1 | Scale | no distributed throughput limit | overload | DB capacity/backpressure | FIXED + VERIFIED |
| AI-012-007 | P1 | Operations | no cooldown/budget/kill policy | uncontrolled cost/eligibility | DB controls | FIXED + VERIFIED |
| AI-012-013 | P1 | Route identity | `route_key` assumed globally unique | cross-talk | full route identity | FIXED + VERIFIED |
| AI-012-015 | P1 | Lease recovery | expired paused unit appeared running | false progress | durable retrying release | FIXED + VERIFIED |
| AI-012-017 | P2 | Architecture | duplicate claim/recovery ownership | future drift | single lifecycle owner | FIXED + VERIFIED |
| AI-012-019 | P2 | Live AI | no authorized live adapter/benchmark/bootstrap | cannot claim production AI | real benchmark/config before routes | **OPEN / NOT YET VERIFIED** |
| AI-012-020 | P3 | Test harness | global-capacity race used two units under one job lock | flaky false negative | independent-job capacity race | FIXED + VERIFIED |
| CURR-013-001 | P2 | Curriculum | no optional Unit/Section model/API | hierarchy unavailable | additive `0016` + API | FIXED + VERIFIED |
| CURR-013-002 | P1 | Integrity | section UUID could cross offering if app-only | invalid hierarchy | composite scope FK + validation | FIXED + VERIFIED |
| CURR-013-003 | P2 | Architecture | risk of duplicate `subject_offerings` table | data drift | retain existing link authority | PREVENTED + VERIFIED |
| CURR-013-004 | P2 | Lifecycle | destructive delete could break history | broken references | status/archive foundation | CONTROLLED + VERIFIED |
| ADMIN-013-001 | P1 | Admin Product | static shell lacked real curriculum operations | unusable Admin product | authenticated server-backed workspace | FIXED + VERIFIED |
| ADMIN-013-002 | P2 | Admin UX | missing loading/error/empty/mutation states | weak clarity | typed UX states | FIXED + VERIFIED |
| ADMIN-013-003 | P3 | Browser tests | ambiguous locators caused false failures | noisy CI | scoped semantic locators | FIXED + VERIFIED |
| CONTENT-013-001 | P2 | Content Ops | no Admin read model joining Stage9→10→OCR | no processing supervision | thin Admin operations API/UI | **FIXED + VERIFIED** |
| CONTENT-013-002 | P1 | Publication | media not explicitly linked/published into `lesson_assets` | processing may be mistaken for published content | explicit Stage13D publication/linking contract | **OPEN / NEXT** |
| CONTENT-013-003 | P2 | OCR Review | empty pending OCR could be approved without content if UI trusted | bad downstream evidence | server non-empty approval guard | FIXED + VERIFIED |
| CONTENT-013-004 | P3 | Browser test | raw OCR intentionally existed in preview + textarea causing strict locator conflict | false Stage13 E2E failure | target raw `<pre>` semantically | FIXED + VERIFIED `34173006035` |
| PREVIEW-010-002 | P2 | Hosted runtime | hosted pipeline/runtime unproven | no production claim | verify only after Product Owner re-enables deployment | NOT YET VERIFIED |
| REPO-001 | P3 | Git hygiene | `tmp-unused-do-not-use` branch remains | repository noise only | delete when safe/tooling permits | OPEN HOUSEKEEPING |
| DOC-001 | P2 | Continuity | chat-memory dependency / stale conflicting docs | repeated/contradictory work | source-of-truth index + synchronized handoff/status/log | CONTROLLED |
| DOC-002 | P1 | Documentation | README/NEXT prompt/Stage13 status lagged executable work | new chat could follow obsolete architecture/order | documentation consolidation + explicit precedence/overrides | FIXED BY CURRENT DOC CLOSURE |

## 8. Latest Verification

Latest fully green executable head:

`260cfef1c48d1290611103f8443d222f8cd041b6`

Same-head matrix:

- Stage13 Admin Product `34173006035` — SUCCESS; backend + Admin Chromium including Content/Media/OCR review.
- Stage12 AI Execution `34173006025` — SUCCESS.
- Stage11 AI Contracts `34173006065` — SUCCESS.
- OCR Foundation `34173006050` — SUCCESS.
- Stage10 Media Pipeline `34173006043` — SUCCESS.
- Stage9 Content Import `34173006055` — SUCCESS.
- Full Rebuild `34173006036` — SUCCESS; includes Student activation/returning-login/recovery Chromium.

This docs consolidation is a docs-only descendant; it does not replace the executable head as runtime evidence.

## 9. Known Issues / Remaining Risk

- deployment remains deferred; hosted Student/Admin/API/media/OCR/AI runtime unverified;
- live AI provider/model benchmark, credentials, actual billing, route choices and production bootstrap unverified;
- `direct` Question Bank persistence unresolved;
- media→`lesson_assets` publication/linking unresolved and is next priority;
- upload progress/history durable contract not yet implemented;
- full Draft→Review→Published lesson content workflow incomplete;
- Admin AI Operations/Question Bank/remaining modules incomplete;
- Student entitlement-filtered curriculum/reader/full learning product incomplete;
- TTS runtime/quality unverified;
- final Offline/PWA/download/sync product incomplete;
- final legacy coverage is not closed until every parity row has evidence or explicit owner-approved removal;
- old database intentionally outside scope;
- P3 temporary branch housekeeping remains.

## 10. Remaining Work — Ordered

1. **Stage13D Upload / Processing History / Publication Linking** — images/PDF/mixed input, order, durable progress/history, explicit source/media→Lesson/publish contract.
2. **Stage13E Admin AI Operations / Review** — observe/control verified Stage12 jobs, reviewed outputs, never a client-owned queue.
3. **Stage13F Question Bank / Quiz Builder / Publish** — resolve `direct`, CRUD/review/version/source/export/publish.
4. **Stage13G Remaining Admin** — students/codes/recovery/device reset/notifications/import-export/reports/settings/security/audit.
5. **Stage14 Student Product/Reader** — entitlement-filtered curriculum and Reader/Text/Search/TTS.
6. **Stage15 Assessment** — Practice/Test/Models/history/provenance.
7. **Stage16 Offline/PWA**, Stage17 personal data, Stage18 notifications, Stage19 progress, Stage20 reporting.
8. Stages21–29 performance/security/tests/a11y/content-load/staging/release/cutover/monitoring.
9. Live provider benchmark before production AI routing.
10. Hosted deployment verification only after explicit Product Owner re-enable.

## 11. Documentation Continuity Contract

Canonical startup order is defined in `DOCUMENTATION_INDEX.md`.

After every meaningful change:

- update `PROJECT_STATUS.md`;
- update this Engineering Log with stage changes/ADs/findings/evidence;
- update `PROJECT_HANDOFF.md` if continuation context changed;
- update current specialized doc;
- update Legacy Coverage evidence;
- record exact executable HEAD + run IDs;
- mark everything else `NOT YET VERIFIED`.

Never make a new conversation depend on information that exists only in chat.