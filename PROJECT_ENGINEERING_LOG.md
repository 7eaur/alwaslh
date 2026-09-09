# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture, audit findings, decisions, changes, verification and remaining work. Code/migrations + executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-09 — Stage13E Admin AI Operations / Review is VERIFIED and selectively promoted; Stage13F is READY / NOT STARTED; hosting remains deferred until VPS.**

> Historical note: the detailed pre-closure chronological/root-cause log remains permanently available in Git history at verified runtime SHA `d5ebc7f25a369430387a758c7c0bb89350963d67` (blob `85e44ae9a3eac77fe5fffb0cb3905d0dd8a7b515`). This consolidation does not erase Git evidence; it removes stale candidate-state prose from the current working log.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية يعاد بناؤها مع الحفاظ على فكرة المنتج والـBusiness Outcomes والـUser Flows المهمة، مع استبدال التنفيذ غير الآمن/المكرر عندما يلزم.

Runtime/product surfaces:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — independent Super Admin Web.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — shared domain/validation/brand primitives.

Product outcomes:

- Admin يدير المنهج والمحتوى والوسائط وOCR/AI وبنك الأسئلة والوصول والعمليات.
- Student يفعّل حسابه بأمان ويستهلك فقط المحتوى المسموح له ويتعلم ويتدرب ويحفظ بياناته.
- provenance remains explicit from source through reviewed/published educational authority.
- AI assists generation/transformation but never becomes unreviewed Student/Question Bank authority.

Governance:

- one replaceable engineering owner for Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation;
- Issue #16 is sole active execution ledger;
- `PROJECT_EXECUTION_QUEUE.md` is ordered task authority;
- repository/GitHub, not Chat memory, is project memory;
- Issues #13/#14/#15 are historical;
- root-cause fixes and no test weakening are mandatory;
- hosting/deployment fully deferred until VPS + explicit reopening;
- legacy/Supabase migration outside current scope unless explicitly reopened.

## 2. Architecture

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
- activation verification is non-consuming; finalization is atomic.
- returning Student requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- Stage9 source inventory is provenance, never curriculum hierarchy.
- Stage10 `ready` media is processing evidence, not Published Lesson content.
- Stage13D media enters Lesson only through explicit Draft → Review → Published.
- OCR/AI/TTS are derived layers; they do not redefine source-upload success.
- provider routing/execution/review/publication are separate authorities.
- provider/network calls stay outside long DB transactions.
- durable workers own leases/capacity/control; Fastify HTTP is not the worker loop.
- Student/Question Bank never consume raw provider output as trusted authority.
- credentials/raw provider metadata/internal provider errors never become Frontend contracts.
- durable Admin operational/audit history is reachable through bounded server pagination.
- paginated historical views are evidence only; canonical current authority is independent from selected page.
- coupled Stage13E read models use short PostgreSQL `REPEATABLE READ` snapshots.
- bounded pages must also bound expensive query work when the owning query can do so directly.
- HTTP pagination accepts only safely representable integer offsets.

## 3. Core User Flows

### Student activation / returning login / recovery

```text
6-digit Full Code
→ non-consuming verification
→ activation ticket
→ password + non-extractable P-256 key/proof
→ atomic profile/credential/entitlement/redemption/device/audit
→ device-bound session
```

Returning login: password → device challenge → registered proof → bound session. Recovery: Admin temporary password → revocation → forced private password replacement → explicit authorized rebind where required.

### Source → Media → OCR

```text
Stage9 canonical source
→ Stage10 media/checksum/order
→ ready media
→ OCR lease/retry
→ raw + conservative normalized text
→ review
→ approved searchable/reusable text
```

### Admin upload → Lesson publication

```text
ordered image/PDF input
→ durable ingestion task/items
→ Stage10 processing
→ deterministic mixed positions
→ explicit lesson_assets Draft link
→ Review
→ Published
→ lesson revision/timestamp
→ durable history/archive
```

### AI through verified Stage13E

```text
reviewed source
→ Stage11 typed request/prompt/version
→ Stage12 durable job/unit/attempt/output
→ provider call outside DB transaction
→ validators/provenance/dedupe
→ accepted | review_required | retry | failed
→ Stage13E Admin read/control
→ stable-output human review
→ append-only edit/approve/reject
→ bounded audit navigation independent from canonical latest review
```

Stage13E review remains distinct from Stage13F Question Bank publication.

## 4. Stage Ledger

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
| 13E Admin AI Operations / Review | reuse Stage11/12 + reviewed Admin authority | **VERIFIED / PROMOTED** |
| 13F Question Bank / Quiz Builder | REQUIRED | **READY / NOT STARTED** |
| 13G Remaining Admin | REQUIRED | BLOCKED BY STAGE13F |
| 14–25 Student/Product/Hardening | REQUIRED | NOT YET VERIFIED |
| 26–29 Staging/Release/Ops | REQUIRED later | deployment deferred until VPS |

## 5. Architecture Decisions

- **AD-106** — `subject_class_links` is canonical Subject Offering.
- **AD-107** — exactly one optional curriculum Section layer.
- **AD-108** — Lesson→Section remains within same offering.
- **AD-110** — Stage9 inventory is provenance, never curriculum hierarchy.
- **AD-114** — Content/Media/OCR operations reuse existing authorities.
- **AD-115** — media/OCR processing is not Published Lesson content.
- **AD-120** — documentation commits never masquerade as runtime evidence.
- **AD-121** — Stage13D upload/progress is server/PostgreSQL-owned.
- **AD-122** — mixed upload order is fixed before processing and preserved through PDF expansion.
- **AD-123** — Stage13D reuses `MediaPipelineService`.
- **AD-124** — ready media enters Lesson only through Draft→Review→Published.
- **AD-125** — ingestion uses lease/idempotency/stale-owner guards.
- **AD-126** — archive is non-destructive.
- **AD-127/128** — historical multi-workstream model, superseded operationally.
- **AD-134** — hosting/deployment fully deferred until VPS.
- **AD-135** — `main` is integration-approved development baseline, not production authority.
- **AD-136** — divergent branches integrate selectively while preserving current central docs/contracts.
- **AD-137** — Single Owner mode; Issue #16 + Queue + Continuity are operational bus.
- **AD-138** — durable review invariants belong in PostgreSQL as well as caller validation.
- **AD-139** — human AI review is valid only after execution is stable; output+unit are locked together for review mutation.
- **AD-140** — durable operational history is server-paginated authority, not a browser subset.
- **AD-141** — current review authority is independent from paginated audit history.
- **AD-142** — coupled Admin audit/read models require one coherent database snapshot.
- **AD-143** — Stage13E multi-query reads share a short `REPEATABLE READ` policy; mutations remain separate.
- **AD-144** — bounded Admin pages must bound expensive aggregation before speculative indexes/denormalization.
- **AD-145** — pagination validation is an end-to-end numeric representation boundary.
- **AD-146** — divergent Stage promotion uses an exact selective manifest + exact-head re-verification.
- **AD-147** — Stage13E review approval is not Question Bank publication; Stage13F owns reviewed Question Bank persistence/publish authority.

## 6. Audit Findings

| ID | Sev | Area | Problem | Solution | Final Status |
|---|---:|---|---|---|---|
| `SEC-001` | P0 | Admin Auth | legacy anonymous privileged mutation | private backend authorization | FIXED + VERIFIED |
| `DATA-015` | P0 | Activation | premature/partial Full-Code consumption | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| `DATA-018` | P0 | Access | racy Class-Code redemption | row locks + transaction + idempotency | FIXED + VERIFIED |
| `AUTH-006-004` | P1 | Student Auth | password-only device bypass | challenge + bound session | FIXED + VERIFIED |
| `OCR-011-001` | P1 | OCR | no durable canonical extraction | durable OCR pipeline | FIXED + VERIFIED |
| `CONTENT-013-002` | P1 | Publication | ready media could be mistaken published | Draft/Review/Published authority | FIXED + VERIFIED |
| `CONTENT-013-005` | P1 | Upload | browser-owned upload truth | durable server tasks/items | FIXED + VERIFIED |
| `CONTENT-013-006` | P1 | Mixed order | async completion could reorder content | deterministic selected order/expansion | FIXED + VERIFIED |
| `CONTENT-013-007` | P2 | Retry/lease | late-write/retry inconsistency | lease/idempotency/stale guards | FIXED + VERIFIED |
| `AI-013E-DB-001` | P1 | AI Review DB | reject reason caller-only | DB reject-note constraint + regression | FIXED + VERIFIED |
| `AI-013E-REVIEW-002` | P1 | AI Review | review could bind to replaceable retry output | stable-unit gate + output/unit locks | FIXED + VERIFIED |
| `AI-013E-OPS-003` | P1 | Admin AI | later Jobs/Units/Attempts unreachable | bounded end-to-end pagination + Chromium | FIXED + VERIFIED |
| `AI-013E-OPS-004` | P1 | AI Review Audit | old review revisions unreachable/current tied to page | paged audit + independent canonical latest | FIXED + VERIFIED |
| `AI-013E-OPS-005` | P2 | Output Detail | mixed committed snapshots | short repeatable-read snapshot | FIXED + VERIFIED |
| `AI-013E-OPS-006` | P2 | Admin AI Reads | List/Job/Unit could mix committed states | shared `readSnapshot()` policy | FIXED + VERIFIED |
| `AI-013E-PERF-007` | P2 | Performance | aggregate all Unit history before Job page | page Jobs first + correlated aggregate | FIXED + VERIFIED |
| `AI-013E-API-008` | P2 | HTTP | unsafe integer offsets | shared safe-integer schema | FIXED + VERIFIED |
| `CI-013E-009` | P1 | CI | standalone DB contract drift/quote defect | synchronize with migration/Combined contract | FIXED + VERIFIED |
| `AI-011-005` | P2 | Question Bank | reviewed `direct` output persistence unresolved | Stage13F reviewed persistence/publication design | OPEN |
| `AI-012-019` | P2 | Live AI | provider benchmark/routes/credentials/bootstrap unverified | benchmark/config/authorized runtime evidence | OPEN / NOT YET VERIFIED |
| `CI-001` | historical | GitHub Actions | hosted jobs previously ended before checkout | later real runners restored executable evidence | NONBLOCKING; exact historical external cause NOT YET VERIFIED |

## 7. Stage13E Changes Made

Stage13E product implementation includes:

- authenticated Admin Job/Unit/Attempt/Output views;
- Stage12 server-derived progress/actions and pause/resume/cancel/retry reuse;
- safe telemetry/provenance with raw/secret exclusion;
- append-only Stage11-validated human review;
- stable-output review boundary;
- bounded Jobs/Units/Attempts/Review History pagination;
- canonical latest review independent from selected audit page;
- repeatable-read coupled read models;
- Job-page-before-Unit-aggregation query shape;
- safe pagination offset validation;
- deterministic real browser fixtures and responsive UX.

Final CI/root-cause fixes before acceptance:

1. standalone Stage13E workflow DB assertion synchronized to current four-constraint migration contract and legitimate indexes; removed redundant latest-review-index expectation;
2. DB test isolation reset+migrate between Stage13E and Stage12/auth suites to remove queue-state pollution without changing production worker semantics;
3. Combined workflow push trigger includes the short-lived promotion branch so exact promotion-head verification could execute.

No business rule, DB invariant, auth boundary or test expectation was weakened.

## 8. Stage13E Tests & Verification

Accepted candidate:

`72ead8446af237392dc6d953c8e0c2382f468286`

Result: **12/12 SUCCESS** on exact candidate HEAD. Verification-only PR #24 closed unmerged.

Selective promotion/runtime:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Built from `main @ e304d61286b9ca120db2dad695d29f4f1642e733` with exact accepted 36-file manifest. Result: **12/12 SUCCESS** on exact promotion HEAD. Verification-only PR #25 closed unmerged.

Promotion runs:

- Combined Stage13E `34401502463` — SUCCESS
- Stage13E standalone `34401549935` — SUCCESS
- Stage13E Frontend Prep `34401549849` — SUCCESS
- Rebuild `34401550016` — SUCCESS
- Stage13 Admin `34401549835` — SUCCESS
- Stage9 `34401549851` — SUCCESS
- Stage10 `34401549989` — SUCCESS
- OCR `34401549910` — SUCCESS
- Stage11 `34401549927` — SUCCESS
- Stage12 `34401549964` — SUCCESS
- Stage13D Content `34401550065` — SUCCESS
- Stage13D Admin `34401549903` — SUCCESS

Combined evidence includes real checkout/setup, API/Admin lint/typecheck/unit/build, clean PostgreSQL migrations/contracts, Stage13E authority/review/concurrency regressions, isolated Stage12/auth regressions, Super Admin bootstrap, deterministic fixtures and real Chromium pagination/control/review/session/conflict/responsive flows.

`main` was fast-forwarded non-force to verified runtime `d5ebc7f...` after confirming it had not moved.

## 9. Documentation / Git incident in closure batch

A temporary `.stage13e-closure-placeholder` was accidentally created on `main` while preparing the docs branch, then immediately deleted.

- create commit: `0807779299085a5057f13b2ada49a88af485d39d`;
- cleanup commit: `24596c73018678023428bc5bf8bfd1c87c039c69`;
- GitHub confirmed the cleanup commit tree is exactly `8d92692e9f1b796cb06f09a9926c599a592f81cc`, the same tree as verified Stage13E runtime `d5ebc7f...`;
- no runtime/product/config/document file difference remained after cleanup.

Classification: **P3 Git write-method incident / RESOLVED / NO TREE OR RUNTIME EFFECT**. The subsequent documentation closure is isolated on `docs/stage13e-closure` before promotion.

## 10. Known Issues / Remaining Work

- `AI-011-005` — Stage13F reviewed Question Bank persistence and direct-output boundary.
- `AI-012-019` — live provider benchmark/routes/credentials/bootstrap `NOT YET VERIFIED`.
- historical `CI-001` exact external runner-allocation cause remains `NOT YET VERIFIED`, but it is nonblocking because candidate/promotion workflows later ran normally.
- Stage13F–25 remain product work in roadmap order.
- Stage26–29 deployment track remains future-only until VPS + explicit reopening.

## 11. Next Architecture / Product Work

Stage13F is **READY / NOT STARTED**.

Required first action is repository discovery, not blind implementation:

1. inspect existing Question Bank/quiz migrations/tables;
2. inspect Backend routes/services/validation;
3. inspect Admin components/state/API adapters;
4. inspect current tests and legacy coverage;
5. classify KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
6. then design the simplest authority model that reuses Stage11 validation, Stage12 execution and Stage13E review.

Stage13F acceptance must include reviewed persistence/provenance, editing, Draft→Review→Published, stable Quiz Builder/versioning/regeneration/export and PostgreSQL/API/Admin/real Chromium + wider same-head regressions.

## 12. Documentation Continuity Contract

After every meaningful batch, update Queue, Continuity, Status, this log, specialized docs, Issue #16 report, and Handoff/Resume/Roadmap/Legacy Coverage when truth changes. Record exact HEAD/run IDs and explicit `NOT YET VERIFIED`. Never leave continuation-critical state only in chat.
