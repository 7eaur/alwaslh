# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, audit findings, implementation history, verification evidence and remaining work. Read `PROJECT_HANDOFF.md` first for continuation context.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين منفصلين في runtime وUX:

- **Student PWA:** activation/login، صفوف ومواد ودروس، Reader، Summary/Practice، quizzes، notes/saved questions، notifications، statistics/achievements، Offline/PWA.
- **Admin Web:** content/upload/processing، Gemini AI generation، Quiz Builder، students، Full/Class access codes، notifications، reports/exports/settings.

الهدف هو بناء أفضل نسخة من **نفس الفكرة والسيناريوهات والنتائج للمستخدم** مع إزالة أخطاء التنفيذ القديم. `PRODUCT_FEATURE_PARITY_MATRIX.md` هو عقد منع إسقاط Feature/User Flow مهم.

### Source repositories

- `7eaur/alwaslh`: Business Rules / User Flows / legacy behavior والمشكلات التي يجب ألا تتكرر؛ ليس schema target.
- `7eaur/alwaslh-go`: canonical curriculum/media source input؛ يدخل عبر deterministic pipeline ولا يُشحن raw إلى frontend.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    └── background / AI workers
```

Browser never receives PostgreSQL credentials and never connects directly to the database. PostgreSQL is self-hosted/clean-slate; Supabase/legacy schema/data are not compatibility targets.

Canonical tree direction:

```text
apps/{admin-web,student-web,api,workers}
packages/{brand,ui,domain,data,validation,ai-contracts,testing}
database/{migrations,tests,deploy}
content/{import-contracts,manifests,tooling}
```

## User Flows to Preserve

### Full access / first activation

```text
6-digit Full Code
→ server validation + row lock
→ atomic Student profile + credential + entitlement + redemption/audit
→ HttpOnly authenticated session
```

After activation the same six-digit Full Code becomes the Student account identifier, not a secret. Returning authentication requires `identifier + password`.

### Class access

```text
7-digit Class Code
→ atomic redemption
→ class entitlement
→ authorized content delta
```

### Learning / Quiz / Admin

- Learning: `class → subject → lesson → reader → summary/practice/notes/saved questions`.
- Quiz: `catalog/filter → quiz/version → persisted shuffled session → resume/restart → trusted completion → attempts/statistics/achievements`.
- Admin: `admin auth → overview → content/upload → AI operations → quizzes → students/access → notifications/reports/settings`.

## Audit Findings

| ID | Severity | Area | Problem | Evidence / Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged password mutation | Admin identity compromise | Explicit server Auth + CLI bootstrap only | FIXED / Stage 6 runtime verified |
| SEC-002..011 | P0 | Authorization | Broad/public legacy DB privilege paths | Browser could bypass business services | Private DB + Backend authorization | ELIMINATED by target architecture |
| DATA-015 | P0 | Activation | Legacy activation multi-step/non-transactional | Partial accounts/races | One transaction + idempotency + locks | FIXED / Stage 8 PostgreSQL + Chromium verified |
| DATA-018 | P0 | Class Codes | Redemption racy/non-atomic | Competing/wasted redemption | Row locks + idempotency + no-waste | FIXED / Stage 7 runtime verified |
| SEC-015..018 | P1 | Credentials | Plaintext/reversible/device credential assumptions | Credential/recovery compromise | scrypt + opaque sessions + reset-only recovery | FIXED / Stages 6–8 verified |
| CI-005-001 | P1 | Production API | Build/start output mismatch | Green compile could not start production runtime | Runtime-only build config | FIXED / Stage 8 browser verified |
| CI-008-001 | P2 | Test Isolation | Integration suites shared mutable DB | False failures/nondeterminism | Stage-specific isolated DB suites | FIXED |
| CI-008-002 | P2 | Test Discovery | Vitest collected Playwright E2E | Wrong runner executed browser test | Explicit suite boundaries | FIXED |
| DATA-025 | P1 | Assessment | Legacy client-trusted score/ranking | Student could forge outcomes | Server-derived Practice/attempt finalization | REMAINING — Stages 15/19 |
| OFF-* | P1/P2 | Offline | Legacy global/overlapping caches/sync | Cross-account/stale data risk | One account-scoped revision/tombstone/outbox engine | REMAINING — Stage 16 |
| AI-* | P1/P2 | AI | Browser-owned jobs + weak semantic validation | Reliability/quota/quality failure | Versioned contracts + durable server jobs/workers | REMAINING — Stages 11–12 |
| MEDIA-* | P1/P2 | Media | Completion-order page reordering and fragile PDF/media handling | Educational pages could reorder | Deterministic bounded media pipeline | OPEN — Stage 10 |
| CONTENT-009-001 | P1 | Content Import | Complete source/import integrity originally unproven | Missing/misordered pages could become canonical | Full pinned inventory + deterministic importer + runtime reimport gate | FIXED / Stage 9 runtime verified |
| CONTENT-009-002 | P1 | Manifest Compatibility | Eight Arabic-key manifests dropped 772 assets from canonical payload | Top-level Git count stayed correct, hiding incomplete payload | Arabic schema normalization + payload asset-count invariant | FIXED |
| CONTENT-009-003 | P2 | Helper Contract | Expected helper count 76 vs real 86 recognized helpers | False contract failure | Evidence-based baseline 86 | FIXED |
| CONTENT-009-004 | P1 | Manifest Compatibility | `كتاب القراءة` used third `filename/pdf_page/book_page` manifest shape | 65 unsupported entries + 2 derived errors | Explicit compatibility normalization + tests | FIXED |
| CONTENT-009-005 | P1 | Import Digest | Python `9.0` vs JS `9` produced different SHA-256 for same semantic JSON | First runtime import rejected canonical inventory | Integral-float canonicalization before digest | FIXED / runtime verified |
| CONTENT-009-006 | P2 | Duplicate Source Blobs | 100 duplicate blob groups / 201 paths | Could be intentional repeated educational pages | Retain report/review evidence; no automatic destructive dedupe | REVIEW / non-fatal |

## Classification

### KEEP
Product idea, required user scenarios, React/Vite direction, PostgreSQL target, IndexedDB offline concept, AI-assisted authoring and `alwaslh-go` educational content source.

### IMPROVE
Validation/forms/states, UX/accessibility, pagination/querying, media/export, observability/operations.

### REFACTOR
Large feature modules, practice state boundaries and content authoring pipeline.

### REBUILD
Backend API boundary, Auth/Recovery, authorization, entitlements/codes, Student activation, Offline Sync/SW and durable Gemini execution.

### REMOVE
Legacy Supabase coupling, browser-direct DB assumptions, plaintext/reversible credentials, fingerprint proof, inherited template identity and unsafe/dead legacy paths.

## Architecture Decisions

- **AD-001** Preserve product results, not legacy mistakes.
- **AD-002** Security/data integrity before features.
- **AD-003** Version-controlled migrations are canonical.
- **AD-004** Separate Admin and Student applications/runtimes.
- **AD-005** One normalized entitlement model.
- **AD-006** Durable AI jobs; browser creates/observes, workers execute.
- **AD-007** Gemini capacity scheduled by provider project; credentials server-only.
- **AD-008** One account-scoped Student Sync Engine using revisions/tombstones/outbox.
- **AD-009** `alwaslh-go` is a content source pipeline, not frontend assets.
- **AD-010/011** Owned evolved teal/open-book brand system.
- **AD-012** Self-hosted private PostgreSQL behind Backend.
- **AD-013** Clean-slate data model; no legacy DB compatibility target.
- **AD-014** Relational integrity before JSON convenience.
- **AD-015** Executable verification mandatory for Stage PASS.
- **AD-016** Repository-owned handoff/status/log mandatory.
- **AD-017** Full Code becomes Student identifier after activation, never authentication by itself.
- **AD-018** Activation account creation commits/rolls back as one transaction.
- **AD-019** Stage integration suites use isolated databases.
- **AD-020** Unit/integration/browser E2E discovery boundaries are explicit.
- **AD-021** Production build output must match start contract.
- **AD-022** Stage 8 closes only with live cross-boundary browser test.
- **AD-023** Stage 9 import order is source-derived/deterministic; async completion order has no business meaning.
- **AD-024** Stage 9 canonicalizes source documents/assets without inferring Lessons from filenames; lesson mapping remains explicit later.
- **AD-025** Canonical source inventory must prove `documents[].assets` completeness independently of top-level Git counts.
- **AD-026** Cross-language inventory digest uses a shared canonical JSON-number representation; integral floats serialize as integer JSON numbers.
- **AD-027** Duplicate Git blobs are evidence for review, not automatic deletion/dedupe, until semantic equivalence is proven.

## Changes Made

### Stage 1 — Product Contract — CLI PASS
Repository/product audit, feature parity matrix and automated capability/ID verification.

### Stage 2 — Brand Identity — CLI PASS
Owned teal/open-book logo/PWA assets, design tokens, Arabic typography, focus/reduced-motion/touch contracts. Real Mint-token drift was caught/fixed by CLI.

### Stage 3 — UX Architecture — CLI PASS
Admin/Student IA, critical flows/states, responsive/accessibility contracts, wireframes and parity mapping.

### Stage 4 — PostgreSQL Data Platform — CLI/RUNTIME PASS
Clean PostgreSQL 16 schema with constrained identity, curriculum/order, access/redemption, learning/practice, AI/sync, auth/recovery and activation contracts.

### Stage 5 — Engineering Foundation — CLI/RUNTIME PASS
Real API runtime, bounded PostgreSQL pool/transactions, migration runner/idempotency, env validation, logging/public error envelope, strict TS, tests/builds and isolated Admin/Student builds. Root PostCSS leakage and production API build/start mismatch were found/fixed by gates.

### Stage 6 — Auth & Authorization — CLI/RUNTIME PASS
scrypt, opaque sessions, HttpOnly cookie, role isolation, Origin protection, DB lockout, reset-only recovery/session invalidation and explicit first-admin CLI bootstrap.

### Stage 7 — Access Codes & Entitlements — CLI/RUNTIME PASS
Secure 6/7-digit generation, Arabic/Persian normalization, row-locked idempotent redemption, renewal, Full/Class no-waste semantics, revoke/audit and concurrency tests.

### Stage 8 — Student Activation & Account Flow — CLI/PostgreSQL/Chromium PASS
Atomic activation, returning identifier/password login, session, entitlement, logout/recovery reset and mobile RTL Student activation UI. Browser gate uses clean PostgreSQL + built API + built Student Web + same-origin proxy + Chromium.

### Stage 9 — Content Model & deterministic `alwaslh-go` Import — CLI/PostgreSQL RUNTIME PASS

Branch/PR: `rebuild/content-import` / PR #8.

Pinned source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Implemented:

- complete deterministic Git-tree inventory without materializing all image bytes in CI;
- source taxonomy for 15 subject roots / 48 source documents;
- textbook/government-exam classification, Hijri year and math exam-track metadata;
- known filename-family parsing and numeric/manifest-driven stable ordering;
- support for canonical, Arabic-processing and `filename/pdf_page/book_page` manifest variants;
- recognized helper-file accounting;
- Git blob SHA-1 provenance and canonical inventory SHA-256;
- duplicate blob reporting;
- canonical PostgreSQL source model: `content_import_runs`, `content_source_documents`, `content_source_assets`;
- transactional source importer with presence reconciliation;
- identical-inventory replay/idempotency;
- source documents/assets retained independently of Lesson inference;
- Stage-specific CI on PostgreSQL 16.

Verified inventory:

```text
subject roots:       15
source documents:    48
images:            5552
JPG:               4218
WEBP:              1334
helper files:        86
manifest files:      24
fatal issues:         0
manifest errors:      0
order errors:         0
unmapped images:      0
unparsed assets:      0
classification errs:  0
expected-count errs:  0
duplicate blob groups: 100 (201 paths, REVIEW only)
```

Canonical inventory SHA-256:

`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

Clean PostgreSQL 16 applied migrations `0001 → 0008`. First import produced 48 documents / 5,552 assets with `replayed=false`; identical re-import returned the same import run with `replayed=true`. Database assertions proved one run, 48 present docs, 5,552 present assets, zero absent rows and zero duplicate present positions.

## Tests & Verification

### Mandatory policy

See:

- `docs/engineering/CLI_VERIFICATION_GATES.md`
- `.github/workflows/rebuild-stage-verification.yml`
- `.github/workflows/stage9-content-import.yml`
- `PROJECT_HANDOFF.md`

### Latest verified Stage 9 code baseline

- Branch: `rebuild/content-import`
- Commit: `30d12d24be93bf306a9da5fffcfb45ea9317a186`
- Stage 9 dedicated run: `33294631418` — **SUCCESS**
- Full regression run: `33294631419` — **SUCCESS**
- Environment: GitHub Actions Ubuntu + Node 22 + clean PostgreSQL 16.

Dedicated Stage 9 gate verified:

- Python content tests: **14 PASS**;
- API Biome lint: PASS;
- API strict TypeScript: PASS;
- API unit tests: **15 PASS / 0 FAIL**;
- API build: PASS;
- exact pinned `alwaslh-go` revision checkout: PASS;
- complete 5,552-image inventory: PASS;
- fatal inventory issues: 0;
- migrations `0001 → 0008`: PASS;
- first import: PASS;
- identical re-import/idempotency: PASS;
- DB counts/presence/position uniqueness: PASS.

Full `Rebuild Stage Verification` on the same commit also completed **SUCCESS**, proving no regression in previously closed stages.

No unexecuted item is represented as passed.

## Known Issues / Remaining Risk

- Documentation-only Stage 9 closure head must still complete its own dedicated + regression CI before Stage 10 begins.
- Duplicate source blobs (100 groups/201 paths) remain REVIEW evidence; no semantic duplication issue has been asserted.
- Production-host PostgreSQL pool/network/load tuning remains `NOT YET VERIFIED`.
- Real-host backup/restore drill remains `NOT YET VERIFIED`.
- Reverse-proxy/API perimeter rate limiting and final security hardening remain later gates.
- Object/media storage and ordered PDF/media processing are not implemented — Stage 10.
- Gemini prompt contracts/golden tests/durable workers/project-key failover are not implemented — Stages 11–12.
- Complete Admin Product is not implemented — Stage 13.
- Post-auth Student learning product, Practice Engine and trusted scoring are not implemented — Stages 14–15.
- Account-scoped Offline Sync/PWA/outbox/SW lifecycle is not implemented — Stage 16.
- Production performance/accessibility/device/staging/rollback/release readiness remains `NOT YET VERIFIED`.
- Legacy application remains NO-GO for production.

## Remaining Work

1. Finish Stage 9 documentation-head CI closure.
2. **Stage 10 — Media Pipeline.**
3. Stage 11 Gemini Prompt/Output Contracts.
4. Stage 12 Durable AI Execution.
5. Stage 13 Admin Product.
6. Stage 14 Student Learning Product.
7. Stage 15 Practice Engine.
8. Stage 16 Offline/PWA.
9. Stages 17–20 Notes/Saved, Notifications, Statistics/Achievements, Export.
10. Stages 21–24 Performance, Security, automated test expansion, Accessibility/Device QA.
11. Stages 25–29 Initial Content Load, Staging, Release Gate, Production Cutover, Monitoring/Operations.

## Documentation / Continuity Protocol

At every meaningful implementation batch:

- update this log with decisions, findings, failures/fixes and verification;
- update `PROJECT_STATUS.md` with current stage, completed/remaining work, blockers, latest evidence and next action;
- update `PROJECT_HANDOFF.md` whenever architecture/business rules/branches/verified baseline/active stage changes;
- retain exact CI evidence and failed checks/fixes;
- mark anything not actually executed as `NOT YET VERIFIED`.

## Current State

**Stages 1–9 have verified code gates. Stage 9 documentation closure is being re-verified on its final head. Stage 10 Media Pipeline is next and must not start until those final-head workflows are green.**
