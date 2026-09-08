# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture decisions, audit findings, implementation history, tests and remaining work. Code/migrations, executable GitHub Actions, and actual Render runtime evidence outrank prose. Anything not executed/tested is `NOT YET VERIFIED`.

Last consolidated: 2026-09-08 — Render production cutover.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية تعيد بناء منتج قائم مع الحفاظ على الفكرة والنتائج والسيناريوهات ذات القيمة، وليس الحفاظ على تنفيذ قديم غير آمن أو صعب الصيانة.

Runtime/product surfaces:

- `apps/student-web`: Student Web/PWA.
- `apps/admin-web`: independent Super Admin Web.
- `apps/api`: authoritative Fastify/TypeScript API.
- `database/migrations`: PostgreSQL schema authority.
- `packages/*`: shared domain/validation/brand primitives.

Product outcomes:

- الإدارة تدير المنهج والمحتوى والوسائط وOCR/AI وبنك الأسئلة والوصول والعمليات؛
- الطالب يفعّل حسابه بأمان ويستهلك فقط ما يحق له ويقرأ ويتدرب ويحفظ بيانات تعلمه؛
- source/provenance remains explicit;
- AI assists generation/transformation but never becomes unreviewed educational authority.

Governance:

- parity + legacy coverage prevent silent feature loss;
- Current Product Overrides govern current operations;
- repository docs, not chat memory, are project memory;
- permanent Backend/Frontend/Integration workstreams coordinate through GitHub Issues #13–#16;
- root-cause/no-patching mandatory;
- old Supabase database/data migration is outside current scope unless reopened explicitly;
- **Render is current primary production hosting platform; `main` is production source.**

## 2. Architecture Summary

```text
Student Web/PWA ─┐
                 ├── Fastify API ── PostgreSQL
Admin Web ───────┘       │
                         ├── Auth / Activation / Access
                         ├── Curriculum
                         ├── Stage9 source/provenance
                         ├── Stage10 media
                         ├── OCR derived/reviewed text
                         ├── Stage11 AI contracts
                         ├── Stage12 durable AI execution
                         └── Stage13 Admin operations/publication
```

Production hosting now maps this architecture to Render:

```text
Student static/CDN ─┐
                    ├── Render Fastify API ── Render Managed PostgreSQL
Admin static/CDN ───┘           │
                                └── Render persistent media disk
```

### Stable authority boundaries

- Browser owns presentation/session UX, not durable business state.
- Auth/authorization/entitlements are server-owned.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; finalization atomic.
- returning Student requires password + registered P-256 proof.
- Curriculum: Class → Subject Offering → optional Section → Lesson.
- Stage9 source inventory is provenance, not curriculum hierarchy.
- Stage10 media is processing evidence, not Published Lesson content.
- Stage13D: ready media → explicit link Draft → Review → Published.
- OCR/AI/TTS are derived layers and do not gate source upload success.
- reviewed OCR + source/page/checksum preferred for source-sensitive AI.
- AI contract/provider routing/execution are separate concerns.
- provider/network calls outside long DB transactions.
- durable workers use leases and DB-coordinated capacity/controls.
- Fastify HTTP remains separate from worker polling.
- Student uses reviewed/published authority, not raw AI output.
- production file uploads must use durable storage.

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
| 13A Curriculum Structure | KEEP + IMPROVE | VERIFIED |
| 13B Admin Curriculum Web | REBUILD UI | VERIFIED |
| 13C Content/Media/OCR Operations | IMPROVE over existing authorities | VERIFIED |
| 13D Upload/History/Publication Linking | REBUILD unsafe legacy upload state | VERIFIED incl. Chromium |
| 13E Admin AI Operations / Review | REQUIRED | IN PROGRESS / NOT YET VERIFIED / outside main |
| 13F–G Remaining Admin | REQUIRED | NOT YET VERIFIED |
| 14+ Student/Learning/Release | REQUIRED | NOT YET VERIFIED according to Roadmap |
| Render hosted runtime | deployment architecture | CONFIGURED / NOT YET VERIFIED until first apply + runtime checks |

## 4. Verified Core Flows

### 4.1 Student activation / returning login / recovery

```text
6-digit Full Code
→ non-consuming verification
→ activation ticket
→ password + non-extractable P-256 key/proof
→ atomic profile/credential/entitlement/redemption/device/audit
→ device-bound session
```

Returning login uses password → device challenge → registered proof → bound session.

Recovery uses Admin temporary password → revocation → forced private password replacement → explicit authorized rebind where needed.

### 4.2 Source → Media → OCR

```text
Stage9 canonical source
→ Stage10 media/checksum/order
→ ready media
→ OCR lease/retry
→ raw + conservative normalized text
→ review
→ approved searchable/reusable text
```

### 4.3 Admin upload → Lesson publication

```text
ordered image/PDF input
→ durable content_ingestion tasks/items
→ checksum/staging
→ Stage10 processing
→ deterministic mixed positions
→ explicit lesson_assets Draft link
→ Review
→ Published
→ lesson revision/timestamp
→ durable history/archive
```

### 4.4 AI

```text
reviewed source
→ Stage11 typed prompt/mode/version
→ Stage12 job/unit
→ DB admission + lease
→ provider call outside DB transaction
→ validators/provenance/dedupe
→ lease-protected attempt/output
→ accepted | review_required | retry | failed
```

## 5. Chronological Engineering History

### Stages1–5 — VERIFIED

Product/brand/UX/PostgreSQL/engineering foundations converted legacy requirements into executable contracts.

### Stage6/8 Auth / Activation / Device — VERIFIED

Two-step activation, atomic finalization, Admin/Student isolation, P-256 registered-device proof, bound Student sessions, Admin recovery and explicit device rebind.

### Stage7 Access / Entitlements — VERIFIED

Server-owned Full/Class code rules, class entitlements, transactional redemption, renewal/no-waste, expiry and race handling.

### Stage9 Source Import — VERIFIED

Canonical reference `7eaur/alwaslh-go` pinned at `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.
Verified: 15 roots / 48 documents / 5,552 images / 4,218 JPG / 1,334 WEBP / 86 helpers / 24 manifests / digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage10 Media Pipeline — VERIFIED

`0009_media_pipeline.sql`, MediaStorage, deterministic variants, PDF extraction, checksum/provenance/order/idempotency/cleanup.

### OCR Foundation — VERIFIED

Durable extraction, leases/retries/stale-worker protection, raw+normalized text, review lifecycle, approved search and reference adapter.

### Stage11 Provider-Neutral AI Contracts — VERIFIED

Typed modes, Prompt Registry, provenance, strict validators, exact-answer rules, dedupe, uncertainty and benchmark harness. `direct` Question Bank persistence remains open.

### Stage12 Durable AI Execution / Runtime — VERIFIED backend/runtime

Durable jobs/units/attempts/outputs, leases, capacity, controls, pause/progress, cleanup and bounded worker runtime. Live production provider bootstrap remains unverified.

### Stage13A/B Curriculum + Admin — VERIFIED

Canonical Subject Offering via `subject_class_links`, one optional Section layer, DB scope and authenticated Admin UI.

### Stage13C Content / Media / OCR Operations — VERIFIED

Thin Admin operations/review layer over existing Stage9→10→OCR authorities, not duplicate pipeline.

### Stage13D Upload / Processing History / Publication Linking — VERIFIED

Executable closure `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Important contracts:

- server-owned ingestion tasks/items;
- mixed image/PDF order deterministic;
- Stage10 reuse;
- lease/idempotency/stale-owner safety;
- media ready never auto-published;
- Draft → Review → Published explicit;
- archive non-destructive;
- Admin Chromium covers mixed upload/history/publication + 390px.

Legacy `LES-A-010..015` closed by executable evidence.

### Permanent multi-workstream governance — ACTIVE

Persistent Backend, Frontend and Integration roles use short feature branches, workstream docs and Boards #14/#15/#16 plus Team Room #13. GitHub must be enough for replacement chats to resume. Integration alone closes stages.

### Stage13E candidates — IN PROGRESS

Backend `backend/stage13e-ai-operations` @ `348c02646d0ff873fd305beff16f41c46d9c0285`:

- Admin jobs/units/attempts/outputs;
- server progress + action authority;
- Stage12 pause/resume/cancel/retry reuse;
- strict append-only review audit via `0018_ai_admin_review.sql`;
- Stage11 semantic validation;
- no raw/internal provider leakage;
- no Stage13F publication.

Frontend `frontend/stage13e-ai-operations` @ `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`:

- real authenticated transport/adapter/controller/navigation;
- server action arrays;
- canonical refresh on mutation/409;
- review UX/provenance/history;
- happy-path Chromium + 390px prepared;
- still owes bounded real browser session-expiry and stale-review 409 regression preparation.

Both remain outside `main`; same-head executable gates are blocked by current GitHub hosted-runner allocation issue.

### Render Production Cutover — ACTIVE / HOSTED VERIFICATION PENDING

Product Owner explicitly re-enabled deployment on 2026-09-08 and selected Render as the primary production hosting platform.

Cutover actions:

- legacy `main` `5d16c9ae...` archived at `archive/legacy-main-2026-09-08`;
- current rebuilt integration state promoted to `main` through cutover commit `febd8ca2fe047a0b3a961bf73060289ed35e79c6`;
- root `render.yaml` added;
- `docs/deployment/RENDER_PRODUCTION.md` added;
- `.env.example` corrected from stale Supabase settings to current API/Postgres/Vite contract;
- Vercel-specific `vercel.json`, `scripts/build-vercel-preview.mjs`, `api/[...path].js` removed;
- Product Overrides changed from deployment deferred to Render-primary production;
- `main` is now the only production source branch; short feature branches require Integration acceptance before merge.

Declared Render topology:

- Student static CDN;
- Admin static CDN;
- Fastify API `starter` in Frankfurt;
- Render PostgreSQL 16 `basic-256mb` in Frankfurt;
- 1 GB persistent media disk on API.

The API is intentionally not free-tier because current `FileSystemMediaStorage` requires durable disk. Using Render ephemeral filesystem would cause media data loss across deploys/restarts.

No Render AI worker is declared because Stage12 production worker/provider bootstrap does not exist yet. This is an intentional architecture boundary, not missing deployment wiring.

Hosted runtime remains `NOT YET VERIFIED` until Blueprint apply + database/API/frontend/session/media verification.

## 6. Architecture Decisions

Historical decisions remain embodied in code/history. Active decisions include:

- **AD-106** — `subject_class_links` canonical Subject Offering.
- **AD-107** — exactly one optional curriculum Section layer.
- **AD-108** — Lesson→Section same-offering DB scope.
- **AD-110** — Stage9 inventory provenance, never curriculum hierarchy.
- **AD-114** — Content/Media/OCR operations reuse existing authorities.
- **AD-115** — media/OCR processing is not Published Lesson content.
- **AD-120** — docs commits never masquerade as runtime evidence.
- **AD-121** — Stage13D upload/progress server/PostgreSQL-owned.
- **AD-122** — mixed ordering fixed before processing and preserved through PDF expansion.
- **AD-123** — Stage13D reuses MediaPipelineService.
- **AD-124** — ready media enters Lesson only through explicit Draft→Review→Published.
- **AD-125** — ingestion uses lease/idempotency/stale-owner guards.
- **AD-126** — archive is non-destructive.
- **AD-127** — persistent Backend/Frontend/Integration workstreams coordinate through GitHub, not chat memory.
- **AD-128** — short-lived feature branches; Integration alone declares Stage VERIFIED.
- **AD-129** — **`main` is the production source branch; only Integration-approved state is promoted to it.**
- **AD-130** — **Render is the primary production platform for Student/Admin/API/PostgreSQL.** Production resources are declared through root `render.yaml`.
- **AD-131** — **Stage13D media requires persistent Render disk while FileSystemMediaStorage remains authoritative; ephemeral production storage is prohibited.** Current consequence: API remains single-instance until explicit shared/object-storage architecture replaces it.
- **AD-132** — **Do not deploy a fake AI worker.** A Render background worker is added only after authorized live-provider routing and a real standalone worker bootstrap exist.
- **AD-133** — **legacy Vercel serverless deployment path is retired; old `main` is preserved as an archive rather than deleted.**

## 7. Audit Findings

| ID | Sev | Area | Problem | Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | security compromise | private backend authorization | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | premature/partial Full-Code consumption | account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Access | racy Class-Code redemption | double/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| AUTH-006-004 | P1 | Student Auth | password-only device bypass | device boundary bypass | challenge + bound session | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable canonical extraction | unreliable downstream text | durable OCR pipeline | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | `direct` output not safely persisted | unsafe publish risk | Stage13F explicit rule | OPEN |
| AI-012-019 | P2 | Live AI | no authorized benchmark/provider bootstrap | cannot claim production AI | benchmark/config before live worker/routes | OPEN / NOT YET VERIFIED |
| CONTENT-013-002 | P1 | Publication | media lacked explicit Lesson publication authority | ready could be mistaken as published | Stage13D Draft/Review/Published | FIXED + VERIFIED |
| CONTENT-013-005 | P1 | Upload state | browser-owned upload truth unsafe | lost/racy state | durable server tasks/items | FIXED + VERIFIED |
| CONTENT-013-006 | P1 | Mixed ordering | async completion could reorder content | educational corruption | selected order + deterministic expansion | FIXED + VERIFIED |
| CONTENT-013-007 | P2 | Retry/lease | retry/late write risk | inconsistent media/task state | lease + idempotency + stale guards | FIXED + VERIFIED |
| DOC-001 | P2 | Continuity | chat-memory/stale docs risk | contradictory work | central docs + continuity file | CONTROLLED |
| DOC-003 | P2 | Team | parallel chats may drift | merge debt / duplicate work | Boards/workstreams/Integration gate | CONTROLLED |
| DEPLOY-001 | P0 | Media durability | Render API filesystem would be ephemeral without disk | uploaded media loss on deploy/restart | paid API + persistent disk + durable mount | **CONTROLLED BY BLUEPRINT / HOSTED VERIFY PENDING** |
| DEPLOY-002 | P1 | Release source | old `main` still pointed to legacy architecture | Render could deploy obsolete product | archive old main + promote rebuilt state to `main` | **FIXED IN GIT / HOSTED VERIFY PENDING** |
| DEPLOY-003 | P2 | Legacy hosting | Vercel serverless path remained in repo | competing deployment authority/confusion | remove Vercel-specific build/config/adapter | **FIXED IN REPO** |
| DEPLOY-004 | P2 | AI worker | temptation to host worker without real provider bootstrap | fake/nonfunctional production architecture | intentionally omit worker until Stage12 live bootstrap exists | CONTROLLED |
| CI-001 | P1 | GitHub Actions | hosted jobs currently fail before checkout with `steps=[]` | no new executable gate evidence | keep gates unchanged; rerun when runner allocation works | OPEN / EXTERNAL CAUSE NOT YET VERIFIED |

## 8. Verification Evidence

Latest fully green **pre-Render executable** head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head matrix:

- Stage13D Admin `34177369743` — SUCCESS.
- Stage13D Backend `34177369784` — SUCCESS.
- Stage13 Admin `34177369748` — SUCCESS.
- Stage12 `34177369812` — SUCCESS.
- Stage11 `34177369753` — SUCCESS.
- OCR `34177369750` — SUCCESS.
- Stage10 `34177369777` — SUCCESS.
- Stage9 `34177369756` — SUCCESS.
- Full Rebuild `34177369768` — SUCCESS incl. Student Chromium.

Current GitHub runner-allocation failures execute no repository steps, so they do not invalidate this baseline and do not verify newer heads.

Render cutover Git/config commits are deployment configuration evidence only. Hosted runtime requires separate Render evidence.

## 9. Known Issues / Remaining Risk

- first Render Blueprint apply/runtime verification pending;
- external old provider dashboard hooks may still need manual/provider-side disconnection after Render is live;
- Stage13E remains outside main and not executable-verified;
- live AI provider/model benchmark/credentials/routes/bootstrap unverified;
- production AI worker absent by design;
- current media disk makes API single-instance; future scale may require object storage;
- `direct` Question Bank persistence unresolved;
- Student full learning product/TTS/offline/later stages remain incomplete;
- final legacy coverage not closed;
- P3 temporary branch housekeeping remains.

## 10. Remaining Work — Ordered

1. Apply Render Blueprint from committed `render.yaml` and verify DB/API/Student/Admin/media durability.
2. Record exact Render resource/deploy IDs, logs, health and migration evidence.
3. Frontend Stage13E completes bounded session-expiry + stale-review 409 browser regression preparation.
4. When GitHub runner execution returns, run unchanged Backend/Frontend Stage13E gates.
5. Create Stage13E integration branch from latest `main`, combine accepted candidates, run same-head API/Admin/Postgres/Chromium/regression matrix.
6. Merge Stage13E only after PASS to `main`; observe Render auto-deploy and run hosted Stage13E smoke/evidence.
7. Close Stage13E docs/Legacy Coverage/Roadmap, then issue Stage13F.
8. Stage13F Question Bank, Stage13G remaining Admin, Stage14+ Student/Learning/Offline/release.
9. Live AI provider benchmark/bootstrap before Render worker creation.

## 11. Documentation Continuity Contract

Canonical startup order is defined in `DOCUMENTATION_INDEX.md`.

After meaningful changes:

- workstream updates its role file + Board REPORT;
- Integration updates `PROJECT_STATUS.md`, this Log, `PROJECT_HANDOFF.md`, `PROJECT_INTEGRATION_CONTINUITY.md` and specialized docs;
- deployment changes update `docs/deployment/RENDER_PRODUCTION.md` + exact Render resource/deploy evidence;
- record exact Git HEAD + run/deploy IDs;
- mark everything else `NOT YET VERIFIED`.

Never leave a replacement conversation dependent on information that exists only in chat.
