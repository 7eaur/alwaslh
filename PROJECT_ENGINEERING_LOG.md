# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for product understanding, architecture decisions, audit findings, changes, verification and remaining work. Code/migrations + executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-08 — Single Owner mode; hosting deferred until VPS; Stage13E audit found/fixed three P1 defects including durable-history truncation; executable verification blocked before checkout.**

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية تعيد بناء منتج قائم مع الحفاظ على الفكرة والنتائج والـUser Flows المهمة، لا على أخطاء أو تعقيد التنفيذ القديم.

Runtime/product surfaces:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — independent Super Admin Web.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — shared domain/validation/brand primitives.

Product outcomes:

- Admin يدير المنهج والمحتوى والوسائط وOCR/AI وبنك الأسئلة والوصول والعمليات.
- Student يفعّل حسابه بأمان ويستهلك فقط ما يحق له ويقرأ ويتعلم ويتدرب ويحفظ بياناته.
- provenance remains explicit from source through reviewed/published educational authority.
- AI assists generation/transformation but never becomes unreviewed Student/Question Bank authority.

Governance now:

- one replaceable engineering owner for Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation;
- Issue #16 is sole active execution ledger;
- `PROJECT_EXECUTION_QUEUE.md` is ordered task authority;
- repository docs, not chat memory, are project memory;
- Issues #13/#14/#15 and old workstream docs are historical only;
- root-cause/no-patching mandatory;
- hosting/deployment fully deferred until VPS and not a current Stage gate;
- legacy/Supabase migration remains outside current scope unless explicitly reopened.

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
                         └── Stage13 Admin operations/review/publication
```

Stable authority boundaries:

- Browser owns presentation/session UX, not durable business state.
- Auth/Authorization/Entitlements are server-owned.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; finalization atomic.
- returning Student requires password + registered P-256 proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- Stage9 source inventory is provenance, not curriculum hierarchy.
- Stage10 ready media is processing evidence, not Published Lesson content.
- Stage13D ready media enters Lesson only through explicit Draft → Review → Published.
- OCR/AI/TTS are derived layers and do not redefine source-upload success.
- reviewed OCR + source/page/checksum are preferred for source-sensitive AI.
- provider routing/execution/review/publication are separate authorities.
- provider/network calls stay outside long DB transactions.
- durable workers use leases/capacity/control.
- Fastify HTTP remains separate from worker polling.
- Student/Question Bank never consume raw provider output as trusted authority.
- credentials/raw provider metadata/internal provider errors never Frontend contract.
- Admin durable operational history must remain fully reachable through bounded server pagination; browser must not silently truncate or load it unbounded.

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
| OCR Foundation | durable derived layer | VERIFIED |
| 11 AI Contracts | provider-neutral rebuild | VERIFIED |
| 12 AI Durable Execution | durable worker/repository authority | VERIFIED backend/runtime |
| 13A Curriculum Structure | KEEP + IMPROVE | VERIFIED |
| 13B Admin Curriculum | REBUILD UI | VERIFIED |
| 13C Content/Media/OCR Ops | reuse existing authorities | VERIFIED |
| 13D Upload/History/Publication | REBUILD unsafe browser upload state | VERIFIED incl. Chromium |
| 13E Admin AI Operations / Review | REQUIRED | COMBINED CANDIDATE / NOT YET VERIFIED |
| 13F Question Bank / Quiz Builder | REQUIRED | BLOCKED by 13E closure |
| 13G Remaining Admin | REQUIRED | NOT YET VERIFIED |
| 14–25 Student/Product/Hardening | REQUIRED | NOT YET VERIFIED |
| 26–29 Staging/Release/Ops | REQUIRED later | hosting deferred until VPS |

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

Recovery uses Admin temporary password → revocation → forced private password replacement → explicit authorized rebind where required.

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
→ durable ingestion task/items
→ checksum/staging
→ Stage10 processing
→ deterministic mixed positions
→ explicit lesson_assets Draft link
→ Review
→ Published
→ lesson revision/timestamp
→ durable history/archive
```

### 4.4 AI through current Stage13E candidate

```text
reviewed source
→ Stage11 typed request/prompt/version
→ Stage12 job/unit
→ DB admission + lease
→ provider call outside DB transaction
→ validators/provenance/dedupe
→ lease-protected attempt/output
→ accepted | review_required | retry | failed
→ Stage13E Admin read/control
→ stable output only (`completed | review_required`)
→ append-only edit/approve/reject review
```

Stage13E review remains distinct from Stage13F Question Bank publication. Non-stable outputs may be inspected but are not review-mutable.

## 5. Chronological Engineering History

### Stages1–5 — VERIFIED

Product/brand/UX/PostgreSQL/engineering foundations converted legacy requirements into executable contracts.

### Stage6/8 Auth / Activation / Device — VERIFIED

Two-step activation, atomic finalization, Admin/Student role isolation, P-256 registered-device proof, bound Student sessions, recovery and explicit rebind.

### Stage7 Access / Entitlements — VERIFIED

Server-owned Full/Class code rules, class entitlements, transactional redemption, renewal/no-waste, expiry and race handling.

### Stage9 Source Import — VERIFIED

Canonical reference `7eaur/alwaslh-go @ f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

Verified inventory: 15 roots / 48 documents / 5,552 images / 4,218 JPG / 1,334 WEBP / 86 helpers / 24 manifests / digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage10 Media Pipeline — VERIFIED

Durable media storage abstraction, deterministic variants, PDF extraction, checksum/provenance/order/idempotency/cleanup.

### OCR Foundation — VERIFIED

Durable extraction, leases/retries/stale-worker protection, raw+normalized text, review lifecycle and approved search/reference adapter.

### Stage11 AI Contracts — VERIFIED

Typed generation modes, Prompt Registry, provenance, strict validators, exact-answer rules, dedupe, uncertainty and benchmark harness. `direct` Question Bank persistence remains open for Stage13F.

### Stage12 Durable AI Execution — VERIFIED backend/runtime

Durable jobs/units/attempts/outputs, leases, route capacity, operational controls, pause/progress, cleanup and bounded worker runtime. Live provider benchmark/routes/credentials/bootstrap remain unverified.

### Stage13A/B — VERIFIED

Canonical Subject Offering through `subject_class_links`, one optional Section layer, DB scope and authenticated Admin curriculum UI.

### Stage13C — VERIFIED

Thin Admin content/media/OCR layer over Stage9→10→OCR authorities; no duplicate pipeline.

### Stage13D — VERIFIED

Executable closure: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Important contracts:

- server/PostgreSQL-owned ingestion tasks/items;
- deterministic mixed image/PDF ordering;
- Stage10 reuse;
- lease/idempotency/stale-owner safety;
- ready media never auto-published;
- Draft → Review → Published explicit;
- archive non-destructive;
- Admin Chromium incl. 390px.

### Multi-chat governance — HISTORICAL

Issues #13–#16 originally supported permanent Backend/Frontend/Integration chats. Product Owner later retired that model; Issue #16 remains as sole execution ledger, while #13/#14/#15 are historical.

### Hosting experiments — HISTORICAL / SUPERSEDED

Render/Vercel/Supabase deployment work was temporarily explored. Product Owner subsequently set **deployment/hosting fully deferred until VPS**. Existing deployment artifacts are historical/portability evidence only.

### Single Owner mode — ACTIVE

On 2026-09-08 Product Owner chose one replaceable engineering conversation for the full project.

Changes:

- Issues #13/#14/#15 closed historical;
- Issue #16 sole Project Execution Board;
- `PROJECT_EXECUTION_QUEUE.md` introduced;
- `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md` introduced;
- former workstream docs reduced to historical pointers;
- Launcher/Index/Handoff/Product Overrides updated to resume from repository only.

### Stage13E combined candidate — ACTIVE

Combined branch was assembled selectively from reviewed Backend/Frontend candidates to avoid stale divergent history.

Candidate includes:

- Admin Job/Unit/Attempt/Output views;
- server-derived progress + allowed actions;
- Stage12 pause/resume/cancel/retry reuse;
- strict retry/history preservation;
- safe provider/model/project observability;
- source/page/checksum provenance;
- append-only review audit;
- Stage11 semantic validation inside row-locked review transaction;
- Frontend authenticated transport/controller/workspace;
- canonical refresh on 409;
- bounded server pagination for complete Jobs/Units/Attempts history;
- deterministic real session-expiry/stale-review/pagination browser fixtures;
- no Stage13F publication.

Audit hardened three P1 boundaries:

1. reject reason is durable at PostgreSQL boundary;
2. human review is bound to execution-stable outputs;
3. durable AI operational history is completely reachable via bounded server pagination.

## 6. Architecture Decisions

Active/historically important decisions:

- **AD-106** — `subject_class_links` is canonical Subject Offering.
- **AD-107** — exactly one optional curriculum Section layer.
- **AD-108** — Lesson→Section must remain within same offering.
- **AD-110** — Stage9 inventory is provenance, never curriculum hierarchy.
- **AD-114** — Content/Media/OCR operations reuse existing authorities.
- **AD-115** — media/OCR processing is not Published Lesson content.
- **AD-120** — docs commits never masquerade as runtime evidence.
- **AD-121** — Stage13D upload/progress server/PostgreSQL-owned.
- **AD-122** — mixed order fixed before processing and preserved through PDF expansion.
- **AD-123** — Stage13D reuses MediaPipelineService.
- **AD-124** — ready media enters Lesson only through Draft→Review→Published.
- **AD-125** — ingestion uses lease/idempotency/stale-owner guards.
- **AD-126** — archive is non-destructive.
- **AD-127/128** — historical multi-workstream short-branch/Integration gate model; superseded operationally by AD-137.
- **AD-134** — hosting/deployment fully deferred until Product Owner provides VPS.
- **AD-135** — `main` is Integration-approved development baseline, not current production branch.
- **AD-136** — when older branches diverge, prefer selective/rebase integration preserving current central docs/contracts over blind history merge.
- **AD-137** — **Single Owner engineering mode**: one replaceable conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation; Issue #16 + Queue + Continuity are active operational bus.
- **AD-138** — **durable review invariants belong in PostgreSQL as well as transport validation**. Reject reason must be nonblank at DB boundary.
- **AD-139** — **human AI review authority is valid only after unit execution is stable**. Stage13E review mutation only for `completed | review_required`; output+unit locked together.
- **AD-140** — **durable operational history is server-paginated authority, not a browser subset**. Admin must be able to navigate all Jobs/Units/Attempts through bounded server pages; Frontend may not silently truncate records or load unbounded history.

## 7. Audit Findings

| ID | Sev | Area | Problem | Evidence / Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | security compromise | private backend authorization | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | premature/partial Full-Code consumption | account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Access | racy Class-Code redemption | double/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| AUTH-006-004 | P1 | Student Auth | password-only device bypass | device boundary bypass | challenge + bound session | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable canonical extraction | unreliable downstream text | durable OCR pipeline | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | `direct` output not safely persisted | unsafe publication risk | Stage13F reviewed persistence rule | OPEN |
| AI-012-019 | P2 | Live AI | no authorized benchmark/provider bootstrap | cannot claim live provider readiness | benchmark/config before live routes/worker | OPEN / NOT YET VERIFIED |
| CONTENT-013-002 | P1 | Publication | media lacked explicit Lesson publication authority | ready could be mistaken published | Stage13D Draft/Review/Published | FIXED + VERIFIED |
| CONTENT-013-005 | P1 | Upload state | browser-owned upload truth unsafe | lost/racy state | durable server tasks/items | FIXED + VERIFIED |
| CONTENT-013-006 | P1 | Mixed ordering | async completion could reorder content | educational corruption | selected order + deterministic expansion | FIXED + VERIFIED |
| CONTENT-013-007 | P2 | Retry/lease | retry/late-write risk | inconsistent state | lease + idempotency + stale guards | FIXED + VERIFIED |
| DOC-001 | P2 | Continuity | chat-memory/stale docs risk | contradictory continuation | central docs + Queue + Continuity | CONTROLLED |
| DOC-003 | P2 | Team | parallel chats drifted/created merge debt | duplicate coordination overhead | Single Owner mode | SUPERSEDED / CONTROLLED |
| CI-001 | P1 | GitHub Actions | hosted jobs terminate before checkout | no new executable evidence | keep gates unchanged; retry when runner exists | OPEN / EXTERNAL CAUSE NOT YET VERIFIED |
| AI-013E-DB-001 | P1 | AI Review / DB | reject reason required by product but not DB | future/direct writer could create incomplete terminal audit | DB check + direct insert regression | FIXED IN CANDIDATE / EXECUTION PENDING |
| AI-013E-REVIEW-002 | P1 | AI Review / Retry | review could attach to output Stage12 later replaces | stale human authority could govern different AI content | stable-unit gate + output/unit locks + regressions | FIXED IN CANDIDATE / EXECUTION PENDING |
| AI-013E-OPS-003 | P1 | Admin AI Operations | Frontend discarded server pagination and exposed only first 30/50/50 records | durable Jobs/Units/Attempts unreachable | bounded server pagination through full UI + real browser regression | FIXED IN CANDIDATE / EXECUTION PENDING |

### AI-013E-DB-001 Root Cause Record

**Symptom:** HTTP/service rejected missing/blank reason but original `0018_ai_admin_review.sql` allowed `action='reject'` with NULL/whitespace `note`.

**Root cause:** durable audit invariant existed only at caller validation.

**Broken invariant:** every terminal rejection must carry an auditable reason.

**Blast radius:** future writer bypassing current HTTP service could persist incomplete terminal audit history.

**Correct fix location:** PostgreSQL migration.

**Fix:** `730989b8bde404b229544c473bba02b05c7e75b4`; regression `6589d6e53de7ca8cd82b424e5c1496186eb701f1`; workflow contract `bc1bf508897796d0a74d22126094e83180b7ec79`.

**Verification:** NOT YET VERIFIED because hosted runner does not reach checkout.

### AI-013E-REVIEW-002 Root Cause Record

**Symptom:** Stage12 `persistOutputOutcome()` can overwrite the same `ai_outputs` row during retry/re-execution via `ON CONFLICT (job_unit_id) DO UPDATE`, while Stage13E review events remain append-only.

**Root cause:** human review authority derived from review/semantic state but not execution stability.

**Broken invariant:** human decision must govern a stable generated artifact that cannot be replaced underneath it.

**Blast radius:** failed/retrying output could be reviewed, then retry could replace normalized/raw output while old review history remained.

**Correct fix location:** Stage13E Backend review authority; deleting audit events or weakening Stage12 retry is wrong.

**Fix:** `5c03fa27f90cd10df06a9e0b7c5e2c0c768e653a` limits review to `completed|review_required` and locks output+unit; `6494a0ee232cf646eae693054b129db752aee40e` proves failed/retrying outputs are inspection-only with `409` and zero audit writes.

**Verification:** NOT YET VERIFIED; run `34199202570`, job `101973855894`, ended pre-checkout.

### AI-013E-OPS-003 Root Cause Record

**Symptom:** API exposed pagination but Admin controller always loaded Jobs offset 0 with limit 30, Job Detail offset 0 with limit 50, and Unit Detail Attempts offset 0 with limit 50. Adapter/view model discarded pagination metadata and Workspace had no controls.

**Root cause:** transport capability existed but Frontend treated the first bounded response page as the complete durable operational dataset.

**Broken invariant:** every durable AI Job/Unit/Attempt required for operations, diagnosis or review must be reachable from the Admin product.

**Evidence:** Stage12 `enqueue()` allows up to 5,000 units per plan. Backend contracts already return `total/limit/offset` for Jobs/Units/Attempts. Therefore Unit 51+ and older Jobs/Attempts are legitimate durable state.

**Blast radius:** Admin could be unable to review a valid later unit, locate an older job, or inspect older attempt history even though PostgreSQL remained correct.

**Correct fix location:** Frontend pagination state/UI using existing Backend authority. Increasing limits/unbounded loading or duplicating data client-side would be wrong.

**Fix:**

- `92f4d0f8d78697a717efc486420db336534bcc69` — pagination view model/helpers;
- `8b932faa2d1989e5144e5ea29f84273511347736` — adapter retains server pagination;
- `0974142fd71c8cfd5c847c699f10e5ab9de51f7b` — controller current-page offsets and refresh/poll preservation;
- `3411c1fdceae76fadb8ad3fad190b9fbe21f29d9` — accessible Jobs/Units/Attempts controls;
- `382726705724a2130381e7be9ec56bf54c4fc6dc` — responsive pagination layout.

**Regression:**

- `3ab137c96bacaacd23191afc152c013ce46fec6d` — pagination boundary helpers;
- `27de2d6f550508ac88eeacb355e3b6a0d9eff994` — adapter metadata;
- `8dd1d712f1bd644c332ea26c4cf3b3c989425fd1` — attempt pagination transport;
- `66ac7bd31763c8313299a8179f7afe327b88ea55` / `ae772db53e218037a2b140e9dc08e6528f1a1ac8` — real DB fixture: 51 Units, 51 Attempts, old marker + 30 newer Jobs;
- `a9e97e3470396edadab13e21ca76b3c71a68965f` — workflow fixture assertions;
- `c3420181380e0af4cff835504044b5b0c1df679f` — real Chromium proves Jobs page 2, Unit 51 and Attempts page 2;
- `70f6fe218124498ccb6667e3aefa2e8dd21599a4` — specialized Admin documentation.

**Verification:** NOT YET VERIFIED. Latest runtime/test run `34249182219`, job `102138902680`, has `runner_id=0` and `steps=[]`.

## 8. Stage13E Static / Operational Audit Evidence

Reviewed on combined candidate:

- Admin HTTP authorization/query/body validation;
- service list/detail/provenance/secret filtering;
- output+owning-unit locked review transaction;
- Stage11 semantic review validator;
- Stage12 pause/resume/retry/cancel/output persistence;
- attempt history semantics;
- Frontend DTO/API/adapter/view-model/controller/workspace;
- Jobs/Units/Attempts pagination;
- real BrowserContext E2E helper;
- deterministic PostgreSQL fixtures;
- migration integrity/indexes;
- API/Admin package scripts + combined workflow.

Confirmed after fixes:

- no second queue/lifecycle;
- server owns job/review authority;
- raw/credential/provider/internal-error data excluded from Frontend;
- retry remains Stage12 authority and preserves history;
- human review only on stable execution output;
- non-stable output inspection only;
- durable Admin history reachable via bounded server pagination;
- polling/refresh preserve selected server pages;
- no additional proven cross-contract mismatch in inspected surfaces.

Current Stage13E branch:

`integration/stage13e-ai-operations @ 70f6fe218124498ccb6667e3aefa2e8dd21599a4`.

Latest runtime/test head:

`ae772db53e218037a2b140e9dc08e6528f1a1ac8`.

## 9. Verification Evidence

Latest fully green executable baseline:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head successful runs are listed in `PROJECT_STATUS.md`.

Latest Stage13E runtime/test run:

- run `34249182219`;
- head `ae772db53e218037a2b140e9dc08e6528f1a1ac8`;
- job `102138902680`;
- `runner_id=0`, `runner_name=""`, `runner_group_id=0`, `steps=[]`;
- no checkout/lint/typecheck/test/build/PostgreSQL/Chromium command executed.

Earlier Stage13E runs show the same pre-checkout condition.

These failures do not invalidate Stage13D verified baseline and do not verify Stage13E.

## 10. Known Issues / Remaining Risk

- Stage13E latest candidate still needs executable lint/typecheck/unit/build/PostgreSQL/integration/Chromium evidence.
- `AI-013E-DB-001`, `AI-013E-REVIEW-002`, `AI-013E-OPS-003` are fixed in candidate but execution pending.
- GitHub runner allocation root cause remains externally unverified.
- live provider/model benchmark/routes/credentials/bootstrap unverified.
- Question Bank direct-question persistence unresolved until Stage13F.
- later Admin + Student learning/assessment/offline/personal data/notifications/statistics/import-export/hardening stages incomplete.
- deployment/VPS intentionally future work.

## 11. Remaining Work — Ordered

Canonical task authority is `PROJECT_EXECUTION_QUEUE.md`.

Current order:

1. keep Stage13E outside `main`.
2. retain all three Stage13E P1 root fixes/regressions.
3. execute same-head Stage13E combined gate when a real runner is allocated.
4. fix any executed failure from root cause.
5. run wider same-head Stage9/10/OCR/11/12/13/13D/Full Rebuild regressions after combined PASS.
6. promote Stage13E to `main`, close Legacy Coverage/Roadmap/docs.
7. Stage13F Question Bank / Quiz Builder / Publish.
8. Stage13G remaining Admin.
9. Stage14–25 Student/Product/Hardening.
10. Stage26–29 only after VPS/deployment is explicitly reopened.

## 12. Documentation Continuity Contract

After every meaningful batch, the Single Owner updates:

- `PROJECT_EXECUTION_QUEUE.md`;
- `PROJECT_INTEGRATION_CONTINUITY.md`;
- `PROJECT_STATUS.md`;
- this log;
- specialized stage/module docs;
- Issue #16 `EXECUTION REPORT`;
- Handoff/Index/Roadmap/Legacy Coverage whenever their truth changes.

Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED`. Never leave continuation-critical information only in chat.
