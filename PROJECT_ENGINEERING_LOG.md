# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for product understanding, architecture decisions, audit findings, changes, verification and remaining work. Code/migrations + executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-08 — Single Owner mode; hosting deferred until VPS; Stage13E candidate has four P1 root fixes plus two P2 read-snapshot consistency hardenings; executable verification blocked before checkout.**

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

Governance:

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
- Stage13D ready media enters Lesson only through Draft → Review → Published.
- OCR/AI/TTS are derived layers and do not redefine source-upload success.
- provider routing/execution/review/publication are separate authorities.
- provider/network calls stay outside long DB transactions.
- durable workers use leases/capacity/control; Fastify HTTP remains separate from worker polling.
- Student/Question Bank never consume raw provider output as trusted authority.
- credentials/raw provider metadata/internal provider errors never Frontend contract.
- Admin durable operational/audit history is fully reachable through bounded server pagination; browser must not silently truncate or load unbounded history.
- **paginated historical views are evidence only; they never determine canonical current lifecycle/review authority**.
- **multi-query Stage13E Admin AI read models are assembled from one short PostgreSQL `REPEATABLE READ` snapshot**; page/total, progress/actions, latest-attempt and review authority cannot represent mixed concurrent commits.

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

Returning login uses password → device challenge → registered proof → bound session. Recovery uses Admin temporary password → revocation → forced private password replacement → explicit authorized rebind where required.

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
→ bounded audit navigation independent from canonical-latest review authority
→ snapshot-consistent Admin read models
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
Canonical reference `7eaur/alwaslh-go @ f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`. Verified inventory: 15 roots / 48 documents / 5,552 images / 4,218 JPG / 1,334 WEBP / 86 helpers / 24 manifests / digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage10 Media Pipeline — VERIFIED
Durable media storage abstraction, deterministic variants, PDF extraction, checksum/provenance/order/idempotency/cleanup.

### OCR Foundation — VERIFIED
Durable extraction, leases/retries/stale-worker protection, raw+normalized text, review lifecycle and approved search/reference adapter.

### Stage11 AI Contracts — VERIFIED
Typed generation modes, Prompt Registry, provenance, strict validators, exact-answer rules, dedupe, uncertainty and benchmark harness. `direct` Question Bank persistence remains Stage13F.

### Stage12 Durable AI Execution — VERIFIED backend/runtime
Durable jobs/units/attempts/outputs, leases, route capacity, operational controls, pause/progress, cleanup and bounded worker runtime. Live provider benchmark/routes/credentials/bootstrap remain unverified.

### Stage13A/B/C/D — VERIFIED
Curriculum structure/Admin UI, content/media/OCR operations, and durable Upload/History/Publication linking are verified. Stage13D executable closure remains `4eca7de8877ac9e2289b9c7990c912d33c256935` with Draft→Review→Published, deterministic mixed ordering, Stage10 reuse, leases/idempotency/archive and Admin Chromium incl. 390px.

### Multi-chat governance — HISTORICAL
Issues #13–#16 originally supported permanent workstreams. Product Owner retired that model; Issue #16 remains sole execution ledger and #13/#14/#15 are historical.

### Hosting experiments — HISTORICAL / SUPERSEDED
Render/Vercel/Supabase work is historical/portability evidence only. Hosting is fully deferred until VPS.

### Single Owner mode — ACTIVE
One replaceable conversation owns the full engineering/product responsibility. Queue + Continuity + Issue #16 are the operational bus.

### Stage13E combined candidate — ACTIVE

Candidate includes:

- Admin Job/Unit/Attempt/Output views;
- server-derived progress/actions;
- Stage12 pause/resume/cancel/retry reuse;
- safe provider/model/project observability;
- source/page/checksum provenance;
- append-only Stage11-validated review;
- stable-unit review boundary;
- Frontend authenticated transport/controller/workspace;
- canonical refresh on 409;
- bounded Jobs/Units/Attempts/Review History pagination;
- snapshot-consistent multi-query Admin reads;
- deterministic real session-expiry/stale-review/pagination browser fixtures;
- no Stage13F publication.

Audit hardened four P1 boundaries plus two P2 read-model boundaries:

1. reject reason durable at PostgreSQL boundary;
2. human review bound to execution-stable outputs;
3. Jobs/Units/Attempts durable history completely reachable;
4. Review History completely reachable while canonical latest review remains independent of historical page selection;
5. Output Detail output/history/count/latest/reviewer metadata comes from one repeatable database snapshot;
6. List Jobs, Job Detail and Unit Detail also assemble their coupled read data under one repeatable snapshot.

### Git write-method incident — RESOLVED / NO RUNTIME EFFECT
While switching repository write method after a connector safety rejection, an accidental file `tmp-ignore` was created in `5916ac42f1d6ed216e0efe336b20a8f030d1f45e` and immediately deleted in `52fa960155964903290a78657029b3cb950bd6ee`. The resulting tree returned to the intended documentation tree. No product/runtime behavior, contract, migration or test file was changed by this incident.

## 6. Architecture Decisions

- **AD-106** — `subject_class_links` is canonical Subject Offering.
- **AD-107** — exactly one optional curriculum Section layer.
- **AD-108** — Lesson→Section remains within same offering.
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
- **AD-127/128** — historical multi-workstream model; superseded operationally by AD-137.
- **AD-134** — hosting/deployment fully deferred until VPS.
- **AD-135** — `main` is Integration-approved development baseline, not production authority.
- **AD-136** — integrate divergent branches selectively, preserving current central docs/contracts.
- **AD-137** — Single Owner engineering mode; Issue #16 + Queue + Continuity are active operational bus.
- **AD-138** — durable review invariants belong in PostgreSQL as well as caller validation.
- **AD-139** — human AI review authority is valid only after unit execution is stable; output+unit locked together.
- **AD-140** — durable operational history is server-paginated authority, not a browser subset. Jobs/Units/Attempts cannot be silently truncated or loaded unbounded.
- **AD-141** — **current authority is independent from paginated history views**. Review History pages are audit evidence only; `reviewStatus`, effective reviewed output and allowed actions always derive from the canonical latest durable revision.
- **AD-142** — **a coupled Admin audit/read model must be snapshot-consistent**. Output Detail reads the output/owning unit, requested review page, total review count and canonical latest review inside one short PostgreSQL `REPEATABLE READ` transaction; mapping occurs after commit, with no write locks or provider/network calls.
- **AD-143** — **Stage13E multi-query read responses use one shared read-snapshot policy**. `AdminAiOperationsService.readSnapshot()` owns the short `REPEATABLE READ` boundary for List Jobs, Job Detail, Unit Detail and Output Detail. Server-derived action advice must be read in the same snapshot as the progress/unit data it describes; mutation transactions remain separate.

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
| DOC-003 | P2 | Team | parallel chats created merge debt | duplicate coordination overhead | Single Owner mode | SUPERSEDED / CONTROLLED |
| CI-001 | P1 | GitHub Actions | hosted jobs terminate before checkout | no new executable evidence | keep gates unchanged; retry when runner exists | OPEN / EXTERNAL CAUSE NOT YET VERIFIED |
| AI-013E-DB-001 | P1 | AI Review / DB | reject reason required by product but not DB | incomplete terminal audit possible | DB check + direct insert regression | FIXED IN CANDIDATE / EXECUTION PENDING |
| AI-013E-REVIEW-002 | P1 | AI Review / Retry | review could attach to output Stage12 later replaces | stale human authority over different AI content | stable-unit gate + output/unit locks | FIXED IN CANDIDATE / EXECUTION PENDING |
| AI-013E-OPS-003 | P1 | Admin AI Operations | only first 30/50/50 Jobs/Units/Attempts exposed | durable operational history unreachable | bounded server pagination + real browser regression | FIXED IN CANDIDATE / EXECUTION PENDING |
| AI-013E-OPS-004 | P1 | AI Review Audit | only latest 100 review events exposed; current state tied to `history[0]` | old audit inaccessible; naive paging could redefine authority | paged history + separate canonical-latest query + real browser regression | FIXED IN CANDIDATE / EXECUTION PENDING |
| AI-013E-OPS-005 | P2 | AI Review Read Model | Output/page/count/latest were separate READ COMMITTED snapshots | concurrent review could yield internally mixed reviewer/time/page/current state | short REPEATABLE READ snapshot + regression | FIXED IN CANDIDATE / EXECUTION PENDING |
| AI-013E-OPS-006 | P2 | Admin AI Read Models | List/Job/Unit responses combined multiple committed states | progress/action or page/total/latest-attempt could contradict within one response | shared `readSnapshot()` + explicit regressions | FIXED IN CANDIDATE / EXECUTION PENDING |

### AI-013E-DB-001 Root Cause Record

**Symptom:** HTTP/service rejected blank reason but original `0018_ai_admin_review.sql` allowed reject with NULL/whitespace note.

**Root cause:** durable invariant existed only at caller validation.

**Fix:** DB constraint `730989b8...`; direct regression `6589d6e5...`; workflow contract `bc1bf508...`.

**Verification:** `NOT YET VERIFIED` because hosted runner does not reach checkout.

### AI-013E-REVIEW-002 Root Cause Record

**Symptom:** Stage12 can overwrite `ai_outputs` during retry while Stage13E review events remain append-only.

**Root cause:** human review authority was not tied to execution stability.

**Fix:** `5c03fa27...` stable-unit gate + output/unit locks; `6494a0ee...` failed/retrying inspection-only regressions.

**Verification:** `NOT YET VERIFIED`.

### AI-013E-OPS-003 Root Cause Record

**Symptom:** API had pagination but Frontend always requested offset 0 and discarded metadata for Jobs/Units/Attempts.

**Root cause:** first bounded page was treated as complete durable dataset.

**Broken invariant:** every durable operational record needed for diagnosis/review must be reachable from Admin.

**Fix:** end-to-end server pagination + independent controller offsets + accessible responsive navigation + real fixture (51 Units/51 Attempts/later Jobs page).

**Verification:** `NOT YET VERIFIED`.

### AI-013E-OPS-004 Root Cause Record

**Symptom:** `outputDetail()` returned review events with `ORDER BY revision DESC LIMIT 100` and no total/offset. Older append-only review events were unreachable. Current `reviewStatus`, allowed actions and effective reviewed output were derived from the first returned event.

**Root cause:** review history was modeled as a bounded display array rather than durable navigable audit authority, and canonical-current review derivation was coupled to whichever event was first in that array.

**Broken invariants:** every durable human review revision must remain reachable; selecting a historical page must never change current review state/authority.

**Blast radius:** long-lived outputs could hide old human decisions. A naive pagination patch could make a terminally approved/rejected output appear open while browsing an older page.

**Correct fix location:** Backend output-detail read model + Frontend page state. PostgreSQL append-only audit remains unchanged and correct.

**Fix:** `d242e054...` page/total/latest separation; `f04fe2be...` HTTP query; Frontend DTO/controller/UI lineage `9c18826a...`, `2c82e879...`, `72711ec8...`, `de3a9dc2...`, `bf782c92...`.

**Regression:** `e33d43c1...` 105-revision Backend regression; `a1ef3d7a...` 101-edit real fixture; `f95c1a9e...` Chromium complete audit navigation/current-authority isolation; `6a9e9df0...` workflow fixture assertion.

**Verification:** `NOT YET VERIFIED`; runner remains pre-checkout.

### AI-013E-OPS-005 Root Cause Record

**Symptom:** after OPS-004, `outputDetail()` correctly separated paginated history from canonical latest authority, but it first read `ai_outputs`/unit state and then issued separate top-level page/count/latest queries under PostgreSQL default `READ COMMITTED`.

**Root cause:** logical authority separation was fixed, but the coupled HTTP read model still had no single snapshot boundary.

**Broken invariant:** one Output Detail response must describe one coherent committed database state across current review authority, reviewer/time metadata, requested audit page and total count.

**Blast radius:** if another Admin review commits between reads, durable data stays correct but one response can combine newer current review status with older reviewer/time or page/count metadata, weakening audit observability and operator trust.

**Correct fix location:** Backend Output Detail read path. Adding write locks, serializing reviewers, changing Frontend state, or broadening mutation transactions would be unnecessary and harmful.

**Fix:** `9d59f84fb516db5cfaf89382f548c3eea595e365` wraps output/unit + page + count + latest reads in one short `REPEATABLE READ` transaction. Parsing, Stage11 schema checks and provenance mapping occur after commit. No row write locks and no provider/network calls are added.

**Regression:** `apps/api/tests/ai-admin-output-detail-snapshot.test.ts` fails if any Output Detail read escapes the transaction, asserts `set transaction isolation level repeatable read` is the first transaction operation, and verifies approved state, no actions, reviewer/time, history pagination and effective output remain mapped correctly.

**Verification:** `NOT YET VERIFIED`. Runtime/test run `34277281675`, job `102233304479`, ended before checkout with `runner_id=0`, `steps=[]`.

### AI-013E-OPS-006 Root Cause Record

**Symptom:** after fixing Output Detail, other Stage13E multi-query read models still lacked the same consistency boundary: List Jobs fetched page and total separately; Job Detail fetched job/progress and units separately from Stage12 `getAllowedActions`; Unit Detail fetched unit/latest-attempt, attempt page and attempt total separately.

**Root cause:** snapshot consistency was initially treated as an Output Detail-specific audit concern instead of a general property of any response that combines multiple reads into one operator-facing authority/read model.

**Broken invariant:** a single Admin response must not combine progress, action advice, pagination metadata, latest-attempt state or history authority from different committed points in time.

**Blast radius:** concurrent Stage12 worker/lifecycle commits could produce contradictory but individually valid fields in one HTTP response. Example: progress says a job is still running while `allowedActions` was computed after it became terminal, or attempt total/latest-attempt no longer matches the returned page.

**Correct fix location:** the Stage13E Backend read-policy boundary, not Frontend caching and not Stage12 mutation logic.

**Fix:**

- `6a146c26b771a991530f12b1c1c12b6e3b43263b` — adds private `AdminAiOperationsService.readSnapshot()` and moves List Jobs, Job Detail, Unit Detail and Output Detail into short `REPEATABLE READ` read transactions. Job Detail invokes `lifecycle.getAllowedActions(tx, jobId)` inside the same snapshot. Existing mutations remain on their original transactions.
- `f5c5dddfdcb807b87fd18796e8b1154118a51f6e` — adds `apps/api/tests/ai-admin-read-snapshots.test.ts` to reject top-level reads and verify each read transaction starts by establishing repeatable-read isolation.
- `10f32c72a684a8243a789a3561426a68dad1bcea` — tightens the regression so the Stage12 allowed-action query is matched explicitly and cannot false-pass through a generic Job Detail query fixture branch.

**Security/performance:** read snapshots execute bounded local PostgreSQL reads only. No provider/network call or write lock is introduced. This increases transaction count for Admin polling but keeps transactions short; no evidence currently justifies a more complex materialized/read-model architecture.

**Verification:** `NOT YET VERIFIED`. Runtime/test run `34279168308`, job `102239495903`, ended before checkout with `runner_id=0`, `steps=[]`. Candidate/docs run `34279304388`, job `102239938382`, had the same pre-checkout condition.

## 8. Stage13E Static / Operational Audit Evidence

Reviewed on combined candidate:

- Admin HTTP authorization/query/body validation;
- service list/detail/provenance/secret filtering;
- output+unit locked review mutation transaction;
- shared repeatable-read policy for all multi-query Admin read responses;
- Stage11 semantic validator;
- Stage12 controls/output persistence/action authority;
- Jobs/Units/Attempts/Review History pagination;
- Frontend DTO/API/adapter/view-model/controller/workspace;
- real BrowserContext helper + deterministic PostgreSQL fixtures;
- migration integrity/indexes;
- API/Admin scripts + combined workflow.

Confirmed after fixes:

- no second queue/lifecycle;
- server owns lifecycle/review authority;
- raw/credential/provider/internal-error data excluded from Frontend;
- retry remains Stage12 authority and preserves history;
- review only on stable execution output;
- all durable Admin operational/audit history reachable through bounded pages;
- historical page selection cannot redefine canonical latest review authority;
- List Jobs/Job Detail/Unit Detail/Output Detail each assemble coupled fields from one repeatable snapshot;
- polling/refresh preserve selected pages;
- no additional proven cross-contract mismatch in inspected surfaces after OPS-006 review.

Current Stage13E candidate/docs HEAD:

`integration/stage13e-ai-operations @ dd723f2451a0b2edcdaab2e6045a626cae44c15d`.

Latest runtime/test HEAD:

`10f32c72a684a8243a789a3561426a68dad1bcea`.

## 9. Verification Evidence

Latest fully green executable baseline remains:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Latest Stage13E runtime/test-head run:

- run `34279168308`;
- head `10f32c72a684a8243a789a3561426a68dad1bcea`;
- job `102239495903`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout/lint/typecheck/test/build/PostgreSQL/Chromium command executed.

Latest candidate/docs-head run:

- run `34279304388`;
- head `dd723f2451a0b2edcdaab2e6045a626cae44c15d`;
- job `102239938382`;
- `runner_id=0`, `runner_name=""`, `steps=[]`.

These failures do not invalidate Stage13D baseline and do not verify Stage13E. They contain no executed product/test failure evidence.

## 10. Known Issues / Remaining Risk

- Stage13E still needs executable lint/typecheck/unit/build/PostgreSQL/integration/Chromium evidence.
- four Stage13E P1 findings plus OPS-005/OPS-006 P2 findings are fixed in candidate but execution pending.
- GitHub runner allocation root cause remains externally unverified.
- live provider/model benchmark/routes/credentials/bootstrap unverified.
- Question Bank direct-question persistence unresolved until Stage13F.
- later Admin/Student/product/hardening stages incomplete.
- deployment/VPS intentionally future work.

## 11. Remaining Work — Ordered

Canonical task authority: `PROJECT_EXECUTION_QUEUE.md`.

1. keep Stage13E outside `main`.
2. retain all four Stage13E P1 root fixes plus OPS-005/OPS-006 P2 hardenings/regressions.
3. execute same-head Stage13E combined gate when a real runner is allocated.
4. fix any actually executed failure from root cause.
5. run wider same-head Stage9/10/OCR/11/12/13/13D/Full Rebuild regressions after combined PASS.
6. promote Stage13E to `main`, update Legacy Coverage/Roadmap/docs and Closure Report.
7. Stage13F Question Bank / Quiz Builder / Publish.
8. Stage13G remaining Admin.
9. Stage14–25 Student/Product/Hardening.
10. Stage26–29 only after VPS/deployment explicitly reopens.

## 12. Documentation Continuity Contract

After every meaningful batch, update Queue, Continuity, Status, this log, specialized docs, Issue #16 report, and Handoff/Index/Roadmap/Legacy Coverage when truth changes. Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED`. Never leave continuation-critical information only in chat.
