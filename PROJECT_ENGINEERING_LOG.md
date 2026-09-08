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
- permanent Backend / Frontend / Integration workstreams coordinate through GitHub Boards + Team Room؛
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
                   ├── Stage13D durable content ingestion/publication
                   └── later Question Bank/TTS/notifications/offline sync
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
- Stage13D makes publication explicit: ready media → link as Draft → Review → Published.
- Browser does not own canonical upload/processing progress or publish state.
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
| 13D Upload/History/Publication Linking | REBUILD unsafe legacy upload state | **VERIFIED incl. Chromium** |
| 13E Admin AI Operations / Review | REQUIRED | **CURRENT NEXT / NOT YET VERIFIED** |
| 13F–G Remaining Admin Product | REQUIRED | NOT YET VERIFIED |
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

### 4.3 Admin upload → Lesson publication

```text
Admin chooses Lesson + ordered image/PDF inputs
→ durable content_ingestion_task/items
→ raw upload staging + checksum
→ Stage10 MediaPipeline processing
→ deterministic output positions including PDF pages
→ explicit link into lesson_assets as Draft
→ Review
→ explicit Published transition
→ lesson content_revision increment + published_at
→ durable history/archive retained
```

Important verified rules:

- mixed image/PDF order follows the user's selected order, not async completion order;
- processing `ready/completed` never auto-publishes content;
- canonical task state is PostgreSQL/server-owned;
- retry uses idempotency and lease authority;
- stale processing owner cannot overwrite a newer lease state;
- archive is non-destructive and retains linked Lesson/media history.

### 4.4 AI

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

## 5. Chronological Engineering History

### Stages1–5 — VERIFIED

Product/brand/UX/PostgreSQL/engineering foundation built and placed under executable CI. Legacy inventories/audits converted into explicit contracts rather than relying on old code behavior.

### Stage6/8 Auth / Activation / Device — VERIFIED

Checkpoint `016546eca5696337b52063903bb5ba2fb9631c33`: two-step activation, atomic finalization, Admin/Student role isolation, P-256 registered-device proof, non-extractable browser key, bound Student sessions, Admin recovery and explicit device rebind.

### Stage7 Access / Entitlements — VERIFIED

Server-owned Full/Class code rules, multiple class entitlements, transactional redemption, renewal/no-waste behavior, expiry and race handling verified.

### Stage9 Source Import — VERIFIED

Canonical reference repo `7eaur/alwaslh-go`, pinned revision `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

Verified inventory: 15 roots / 48 documents / 5,552 images / 4,218 JPG / 1,334 WEBP / 86 recognized helpers / 24 manifests. Canonical manifest digest: `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage10 Media Pipeline — VERIFIED

`0009_media_pipeline.sql`, `MediaStorage`, filesystem adapter, deterministic Sharp variants, Poppler PDF extraction, checksum/provenance/order/idempotency/cleanup. Hosted durable storage/Poppler remains `NOT YET VERIFIED` because deployment is deferred.

### OCR Foundation — VERIFIED

Checkpoint `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`. Durable extraction state, leases/retries/stale-worker protection, raw+normalized text, confidence/provider metadata, review lifecycle, approved search and Tesseract reference adapter.

### Stage11 Provider-Neutral AI Contracts — VERIFIED

Checkpoint `592123dae33f0cfce2ecd36e9577764767faa95a`. Typed modes, Prompt Registry, source/page/checksum provenance, strict validators, exact-count/answer rules, duplicate checks, exact-mode uncertainty and golden/benchmark harness. `direct` Question Bank persistence remains open.

### Stage12 Durable AI Execution / Runtime — VERIFIED backend/runtime

Verified checkpoints include core `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`, capacity `881102ff94711f908104cd068a003ad598609944`, controls `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`, pause/progress `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`, lifecycle cleanup `e7b95042a017ea558db9f769a46a37f155273a15`, worker runtime `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

### Stage13A/B Curriculum + Admin Web — VERIFIED

`subject_class_links` remains the canonical Subject Offering. One optional Section layer is DB-scoped to the same offering. Admin has authenticated server-backed curriculum management with responsive Chromium evidence.

### Stage13C Content / Media / OCR Operations — VERIFIED

Executable closure `260cfef1c48d1290611103f8443d222f8cd041b6`. Thin Admin operations/read-review layer over Stage9→10→OCR, not a duplicate pipeline. Search/filter/detail/media/OCR correction/approve/reject and Chromium evidence verified.

### Stage13D Upload / Processing History / Publication Linking — VERIFIED

Executable closure:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Implementation:

- `database/migrations/0017_content_ingestion_publication.sql`;
- `apps/api/src/content/ingestion-service.ts`;
- `apps/api/src/content/ingestion-http.ts`;
- `apps/admin-web/src/content-ingestion-api.ts`;
- `apps/admin-web/src/ContentIngestionWorkspace.tsx`;
- Stage13D backend integration + dedicated Admin Chromium workflow.

Database/runtime contract:

- durable `content_ingestion_tasks/items/media`;
- explicit task/item statuses and processing lease;
- `lesson_assets` media/task/item provenance;
- publication status `draft | review | published`;
- review/publish actor/timestamps;
- explicit Lesson link and non-destructive archive;
- `MEDIA_STORAGE_ROOT` configured server-side.

Verified backend flow includes an Admin session, rejection of unauthenticated and Student access, image → two-page PDF → image mixed order, processing positions `[0,1,2,3]`, ready media producing no Lesson assets before explicit link, link as Draft, Review→Published, content revision increment, `published_at`, provenance alignment and archive retention.

Admin Chromium verifies user-visible mixed upload, ordered file list, processing, draft linking, review, explicit publish, reload/history, archive and a 390px narrow viewport. Test-harness defects discovered during closure were corrected without weakening product assertions; an invalid PNG fixture was replaced by a valid image after the real media decoder correctly rejected it.

Specialized contract: `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md`.

Legacy capabilities `LES-A-010..015` are closed by this executable evidence.

### Permanent multi-workstream team governance — ACTIVE

A docs/governance batch introduced a permanent three-workstream operating model so future stages can proceed in parallel without relying on chat memory or long-lived diverging branches.

Repository guides:

- `docs/workstreams/TEAM_OPERATING_MODEL.md`;
- `docs/workstreams/BACKEND_WORKSTREAM.md`;
- `docs/workstreams/FRONTEND_WORKSTREAM.md`;
- `docs/workstreams/INTEGRATION_WORKSTREAM.md`.

GitHub coordination:

- Issue `#13` Team Room for cross-team contracts/blockers/decisions;
- Issue `#14` Backend/Platform Command Board;
- Issue `#15` Frontend/Product Command Board;
- Issue `#16` Integration/Architecture/QA/Release Board.

Rules: latest Board `COMMAND` defines scope; each workstream self-reviews and posts a `REPORT`; branches are short-lived from the latest Integration-approved HEAD; Backend/Frontend readiness never equals Stage PASS; Integration alone accepts/merges and closes a Stage after same-head cross-boundary evidence. This governance change makes **no new runtime feature claim**.

## 6. Architecture Decisions

Historical ADs remain embodied in the earlier stages and repository history. Current active decisions include:

- **AD-106** — `subject_class_links` is canonical Subject Offering; no parallel table.
- **AD-107** — exactly one optional curriculum Section layer; no recursive tree without a new product rule.
- **AD-108** — Lesson→Section same-offering scope is DB-enforced.
- **AD-110** — Stage9 inventory is provenance evidence, never curriculum hierarchy.
- **AD-114** — Admin Content/Media/OCR reuses Stage9/10/OCR authorities; no second lifecycle/browser worker.
- **AD-115** — Stage10 media/OCR is not Published Lesson content by itself.
- **AD-120** — documentation commits never masquerade as executable runtime evidence.
- **AD-121** — Stage13D upload/processing history is server/PostgreSQL-owned; browser state is presentation only.
- **AD-122** — mixed input ordering is established before processing and carried through PDF page expansion deterministically.
- **AD-123** — Stage13D reuses `MediaPipelineService`; no parallel upload/media processing implementation.
- **AD-124** — ready/completed media can only become Lesson content through explicit link as Draft followed by Review and Published transitions.
- **AD-125** — processing claims use durable lease authority and idempotent media keys so retries do not create duplicate canonical media.
- **AD-126** — task archive is non-destructive; linked content/media provenance remains valid.
- **AD-127** — project execution uses persistent Backend, Frontend and Integration workstreams coordinated through repository docs + GitHub Command Boards/Team Room; chat memory is never the coordination authority.
- **AD-128** — workstreams use short-lived feature branches from the latest Integration-approved HEAD; only Integration may declare Stage VERIFIED after same-head cross-boundary evidence.

Provider-neutral AI decisions remain: no fabricated exact answers, no client/provider credentials, durable Stage12 jobs, lease-protected writes, DB-coordinated capacity/controls and live routing only after authorized benchmark evidence.

## 7. Audit Findings

| ID | Sev | Area | Problem | Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | security compromise | private backend authorization | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | premature/partial Full-Code consumption | account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Access | racy Class-Code redemption | double/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| AUTH-006-004 | P1 | Student Auth | password-only device bypass | device boundary bypass | challenge + bound session | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable canonical extraction | unreliable downstream text | OCR durable pipeline | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | AI supports `direct`; current bank does not safely persist it | unsafe publish risk | explicit future persistence/review rule | **OPEN** |
| AI-012-019 | P2 | Live AI | no authorized live adapter/benchmark/bootstrap | cannot claim production AI | benchmark/config before live routes | **OPEN / NOT YET VERIFIED** |
| CURR-013-002 | P1 | Curriculum integrity | Section could cross offering if app-only | invalid hierarchy | composite DB scope FK | FIXED + VERIFIED |
| CONTENT-013-001 | P2 | Content Ops | no Admin read/review model joining Stage9→10→OCR | no supervision | thin operations API/UI | FIXED + VERIFIED |
| CONTENT-013-002 | P1 | Publication | media was not explicitly linked/published into `lesson_assets` | processing could be mistaken for published content | `0017` + Stage13D Draft/Review/Published contract | **FIXED + VERIFIED** |
| CONTENT-013-005 | P1 | Upload state | legacy/browser-owned canonical upload task state was unsafe | lost/racy task truth | server-owned durable ingestion tasks/items | **FIXED + VERIFIED** |
| CONTENT-013-006 | P1 | Mixed ordering | mixed image/PDF processing could reorder by completion | educational page order corruption | authoritative selected order + sequential PDF expansion | **FIXED + VERIFIED** |
| CONTENT-013-007 | P2 | Retry/lease | processing retry could duplicate/late-write without authority | inconsistent media/task state | lease token + idempotency + stale-owner guards | **FIXED + VERIFIED** |
| CONTENT-013-008 | P3 | E2E fixture | initial PNG fixture was structurally invalid | false product-processing failure | valid PNG fixture; decoder assertion retained | **FIXED + VERIFIED** |
| PREVIEW-010-002 | P2 | Hosted runtime | hosted pipeline/runtime unproven | no production claim | verify after owner re-enables deployment | NOT YET VERIFIED |
| REPO-001 | P3 | Git hygiene | `tmp-unused-do-not-use` branch remains | repository noise only | remove when safe | OPEN HOUSEKEEPING |
| DOC-001 | P2 | Continuity | chat-memory/stale docs risk | repeated or contradictory work | source-of-truth docs/index | CONTROLLED |
| DOC-003 | P2 | Team coordination | parallel chats could diverge in contracts/branches and lose handoffs | merge debt/architecture drift/duplicated work | permanent workstream docs + Boards #14/#15/#16 + Team Room #13 + Integration-only Stage PASS | CONTROLLED |

## 8. Latest Verification

Latest fully green **executable** head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head matrix:

- Stage13D Admin Upload UI `34177369743` — SUCCESS; API/Admin quality gates + clean migrations + real Chromium mixed upload/publication/history + narrow viewport.
- Stage13D Content Ingestion `34177369784` — SUCCESS; backend integration and schema verification.
- Stage13 Admin Product `34177369748` — SUCCESS; backend + Admin Chromium regression.
- Stage12 AI Execution `34177369812` — SUCCESS.
- Stage11 AI Contracts `34177369753` — SUCCESS.
- OCR Foundation `34177369750` — SUCCESS.
- Stage10 Media Pipeline `34177369777` — SUCCESS.
- Stage9 Content Import `34177369756` — SUCCESS.
- Full Rebuild `34177369768` — SUCCESS; includes Student activation/returning-login/recovery Chromium.

Documentation/team-governance commits after this executable head are documentation descendants and do not replace `4eca7de…` as the runtime evidence checkpoint.

## 9. Known Issues / Remaining Risk

- deployment remains deferred; hosted Student/Admin/API/media/OCR/AI runtime is `NOT YET VERIFIED`;
- live AI provider/model benchmark, credentials, billing behavior, route choices and production bootstrap remain unverified;
- `direct` Question Bank persistence remains unresolved and must be settled before unsafe auto-persistence;
- Stage13E Admin AI Operations/Review is not yet implemented;
- Stage13F Question Bank/Quiz Builder/publish and Stage13G remaining Admin modules are incomplete;
- Student entitlement-filtered curriculum/Reader/full learning product remains later work;
- TTS runtime/quality remains unverified;
- final Offline/PWA/download/sync product remains incomplete;
- final legacy coverage is not closed until every parity row has evidence or owner-approved removal;
- old database intentionally remains outside current scope;
- P3 temporary branch housekeeping remains.

## 10. Remaining Work — Ordered

1. **Stage13E Admin AI Operations / Review** — Backend command tracked in #14, Frontend command tracked in #15, Integration acceptance in #16; expose/operate verified Stage12 durable jobs, progress, retry/cancel/pause/resume, output review and provenance without browser-owned queue state.
2. **Stage13F Question Bank / Quiz Builder / Publish** — resolve `direct`, CRUD/review/version/source/export/publish.
3. **Stage13G Remaining Admin** — students/codes/recovery/device reset/notifications/import-export/reports/settings/security/audit.
4. **Stage14 Student Product/Reader** — entitlement-filtered curriculum and Reader/Text/Search/TTS.
5. **Stage15 Assessment** — Practice/Test/Models/history/provenance.
6. **Stage16 Offline/PWA**, Stage17 personal data, Stage18 notifications, Stage19 progress, Stage20 reporting.
7. Stages21–29 performance/security/tests/a11y/content-load/staging/release/cutover/monitoring.
8. Live provider benchmark before production AI routing.
9. Hosted deployment verification only after explicit Product Owner re-enable.

## 11. Documentation Continuity Contract

Canonical startup order is defined in `DOCUMENTATION_INDEX.md`.

After every meaningful change:

- workstream chat updates its role file + Board `REPORT`;
- Integration Lead updates `PROJECT_STATUS.md`;
- Integration Lead updates this Engineering Log with stage changes/ADs/findings/evidence;
- update `PROJECT_HANDOFF.md` if continuation context changed;
- update current specialized doc;
- update Legacy Coverage evidence and parity notes where relevant;
- record exact executable HEAD + run IDs;
- mark everything else `NOT YET VERIFIED`.

Never make a new conversation depend on information that exists only in chat.