# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, audit findings, implementation history, verification evidence and remaining work. Read `PROJECT_HANDOFF.md` first, then `PROJECT_STATUS.md` and `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية لها منتجان رئيسيان:

- **Student PWA:** تجربة الطالب من التفعيل/الدخول إلى الوصول للمحتوى والتعلّم والمراجعة والممارسة والبيانات الشخصية.
- **Admin Web:** تشغيل المنصة وإدارة المحتوى والطلاب والوصول والـAI والتقارير.

### Product-governance update after Stage 10

المنتج القديم لم يعد يُعامل كمواصفة يجب الحفاظ على كل تفاصيلها. هو مرجع لـ:

- الفكرة الأساسية وقيمة المنتج؛
- احتياجات وسيناريوهات مستخدم حقيقية؛
- inventory للمميزات حتى لا تسقط المعرفة بالخطأ؛
- المحتوى والمصادر؛
- أخطاء أمنية/معمارية/UX يجب ألا تتكرر.

كل Feature/Flow/Business Rule رئيسي في المراحل القادمة يناقش مع product owner ويصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW`. `PRODUCT_FEATURE_PARITY_MATRIX.md` أصبح Decision Inventory وليس Automatic KEEP list.

### Source repositories

- `7eaur/alwaslh`: legacy product reference + new rebuild repository.
- `7eaur/alwaslh-go`: canonical curriculum/media source input؛ يدخل عبر deterministic pipeline ولا يُشحن raw إلى frontend.
- pinned Stage 9 content revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

## Architecture

Current verified direction:

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    └── background / AI workers
```

Rules:

- Browser never receives PostgreSQL credentials and never connects directly to PostgreSQL.
- PostgreSQL is clean-slate and migration-owned; legacy Supabase schema/data are not compatibility targets.
- Auth/Authorization/Entitlements are server-owned.
- Student/Admin are separate UX/runtime concerns.
- media transformations are server-owned and deterministic.
- `alwaslh-go` is a source pipeline, not frontend assets.
- future AI secrets/execution remain server-owned.

Canonical tree direction:

```text
apps/{admin-web,student-web,api,workers}
packages/{brand,ui,domain,data,validation,ai-contracts,testing}
database/{migrations,tests,deploy,preview}
content/{import-contracts,manifests,tooling,tests}
docs/{engineering,media,preview,product}
```

## User Flows / Business Rules — current implemented baseline

> These are implemented and verified, but Product Evolution Review may deliberately change business rules. Any such change must explicitly reopen the affected stage and rerun executable gates.

### Current Full access / first activation

```text
6-digit Full Code + password + stable idempotency key
→ server normalization/validation + row lock
→ atomic Student profile + scrypt credential + full entitlement
→ code redemption/binding + audit
→ COMMIT
→ canonical login
→ HttpOnly session
```

After activation the normalized six-digit Full Code currently becomes the returning Student identifier, not an authentication secret. Returning login requires `identifier + password`.

### Current Class access

```text
7-digit Class Code
→ normalization + validation + row lock
→ atomic/idempotent redemption
→ class entitlement
→ audit
```

Current rules include renewal benefit, no-waste behavior and race safety.

### Recovery

Reset-only. Original password is never revealed.

### Current curriculum/source direction

```text
alwaslh-go source
→ deterministic source documents/assets
→ provenance/order/checksum
→ later explicit product mapping/publishing
```

Lesson entities are not inferred from filenames.

### Current media direction

```text
source/upload bytes
→ exact identity validation
→ stable position/page
→ Sharp image pipeline OR Poppler PDF extraction
→ bounded ordered transforms
→ source/display/thumbnail/ai variants
→ SHA-256/dimensions/bytes
→ deterministic trusted storage keys
→ storage
→ PostgreSQL metadata transaction
```

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
| DATA-025 | P1 | Assessment | Legacy client-trusted score/ranking | Student could forge outcomes | Server-derived trusted finalization if assessment retained | REMAINING / product review + later stage |
| OFF-* | P1/P2 | Offline | Legacy global/overlapping caches/sync | Cross-account/stale data risk | If retained: account-scoped revision/tombstone/outbox engine | REMAINING / product review |
| AI-* | P1/P2 | AI | Browser-owned jobs + weak semantic validation | Reliability/quota/quality failure | Versioned contracts + durable server jobs/workers if retained | REMAINING / product review + later stage |
| CONTENT-009-001 | P1 | Content Import | Complete source/import integrity originally unproven | Missing/misordered pages could become canonical | Full pinned inventory + deterministic importer + runtime reimport gate | FIXED / Stage 9 runtime verified |
| CONTENT-009-002 | P1 | Manifest Compatibility | Eight Arabic-key manifests dropped 772 assets from canonical payload | Top-level Git count stayed correct, hiding incomplete payload | Arabic schema normalization + payload asset-count invariant | FIXED |
| CONTENT-009-003 | P2 | Helper Contract | Expected helper count 76 vs real 86 recognized helpers | False contract failure | Evidence-based baseline 86 | FIXED |
| CONTENT-009-004 | P1 | Manifest Compatibility | `كتاب القراءة` used third `filename/pdf_page/book_page` manifest shape | 65 unsupported entries + 2 derived errors | Explicit compatibility normalization + tests | FIXED |
| CONTENT-009-005 | P1 | Import Digest | Python `9.0` vs JS `9` produced different SHA-256 for same semantic JSON | First runtime import rejected canonical inventory | Integral-float canonicalization before digest | FIXED / runtime verified |
| CONTENT-009-006 | P2 | Duplicate Source Blobs | 100 duplicate blob groups / 201 paths | Could be intentional repeated educational pages | Retain report/review evidence; no destructive dedupe without semantic proof | REVIEW / non-fatal |
| MEDIA-010-001 | P1 | Legacy Media | Concurrent workers appended by completion order | Educational PDF pages could reorder | Stable position assigned before bounded concurrency | FIXED / Stage 10 runtime verified |
| MEDIA-010-002 | P1 | Media Integrity | Weak retry/idempotency ownership could bind a key to different input | Wrong asset replay/overwrite risk | Bind idempotency to exact provenance + SHA-256 + byte size | FIXED / Stage 10 runtime verified |
| MEDIA-010-003 | P1 | Failure Cleanup | Partial storage/metadata/abort could leave orphan objects | Storage/data inconsistency | Failure injection + cleanup of attempt-written objects | FIXED / Stage 10 runtime verified |
| MEDIA-010-004 | P2 | PDF Runtime | Legacy browser/CDN PDF processing fragile | Availability/order/environment risk | Local/server-owned Poppler with scoped temp dirs and numeric validation | FIXED in Stage 10 CI runtime; production host still later gate |
| PREVIEW-010-001 | P2 | Vercel | Stage 10 branch deploys fail because project expects `dist` output | Live Preview cannot consume Stage 10 directly | Reconcile project/branch build routing during Preview sync | OPEN |
| PREVIEW-010-002 | P2 | Preview Media | Vercel serverless filesystem is ephemeral; Poppler not proven there | Cannot claim durable live media runtime | Preview-specific integration decision + final host durability tests | OPEN / NOT YET VERIFIED |
| DOC-010-001 | P2 | Documentation | Stage 10 final docs-head CI succeeded but status/roadmap/log still said pending/next | Future conversation could resume from stale state | Documentation reconciliation on planning branch | FIXED |
| PRODUCT-001 | P1 | Product Strategy | Blind legacy feature parity could preserve weak UX/business choices | Complexity and wrong product decisions | Product Evolution Review + explicit decision inventory | IN PROGRESS |

## Classification — engineering baseline

### KEEP
- clean backend/data boundary;
- private PostgreSQL direction;
- strong authentication/session primitives;
- transactional/idempotent writes for critical business operations;
- deterministic content provenance/import;
- deterministic server-owned media integrity;
- owned brand identity;
- evidence-based verification policy.

### IMPROVE / REVIEW
- current Student/Admin information architecture;
- access/account UX;
- content publishing model;
- media delivery/authoring UX;
- AI experience and scope;
- search, reporting, support and operational flows.

### REBUILD where still needed
- complete Admin product;
- complete Student learning product;
- assessment/practice if retained;
- Offline/PWA sync if retained;
- durable AI execution if retained.

### REMOVE
- legacy browser-direct DB assumptions;
- plaintext/reversible credentials;
- UI-only authorization;
- device fingerprint as authentication proof;
- async completion order as business order;
- external PDF worker dependency for canonical media processing;
- automatic assumption that every legacy feature must remain.

## Architecture Decisions

- **AD-001** Preserve product value, not legacy implementation mistakes.
- **AD-002** Security/data integrity before feature velocity.
- **AD-003** Version-controlled migrations are canonical.
- **AD-004** Separate Admin and Student applications/runtime concerns.
- **AD-005** One normalized entitlement model for current access contract.
- **AD-006** AI secrets and durable execution belong server-side if AI remains in product.
- **AD-007** Provider capacity scheduling/failover belongs to server workers, not browser.
- **AD-008** If Offline is retained, Student sync must be account-scoped with revisions/tombstones/outbox.
- **AD-009** `alwaslh-go` is a content source pipeline, not frontend assets.
- **AD-010/011** Owned evolved teal/open-book brand system.
- **AD-012** Private PostgreSQL behind Backend.
- **AD-013** Clean-slate data model; no legacy DB compatibility target.
- **AD-014** Relational integrity before JSON convenience.
- **AD-015** Executable verification mandatory for Stage PASS.
- **AD-016** Repository-owned handoff/status/log mandatory.
- **AD-017** Current Full Code activation contract uses the code as returning identifier after activation, never authentication by itself.
- **AD-018** Activation account creation commits/rolls back as one transaction.
- **AD-019** Stage integration suites use isolated databases.
- **AD-020** Unit/integration/browser E2E discovery boundaries are explicit.
- **AD-021** Production build output must match start contract.
- **AD-022** Stage 8 closes only with live cross-boundary browser test.
- **AD-023** Stage 9 import order is source-derived/deterministic; async completion order has no business meaning.
- **AD-024** Stage 9 canonicalizes source documents/assets without inferring Lessons from filenames.
- **AD-025** Canonical source inventory proves `documents[].assets` completeness independently of top-level Git counts.
- **AD-026** Cross-language inventory digest uses shared canonical JSON-number representation; integral floats serialize as integer JSON numbers.
- **AD-027** Duplicate Git blobs are review evidence, not automatic deletion/dedupe.
- **AD-028** Stage 10 media processing is server-owned; browser compression/PDF processing is not canonical pipeline infrastructure.
- **AD-029** Media idempotency is owned by exact source provenance + source bytes, not just a client-provided key.
- **AD-030** Temporary Supabase/Vercel Preview does not redefine final architecture; it is an operational testing environment.
- **AD-031** Legacy feature parity is a product discovery/decision inventory, not an immutable implementation contract.
- **AD-032** If Product Evolution Review changes a verified Stage 1–10 business rule, the affected stage is explicitly reopened with impact analysis and executable regression gates.

## Changes Made

### Stage 1 — Product Inventory / Initial Parity — CLI PASS

- audited repository/product flows;
- captured legacy feature inventory and important user scenarios;
- added automated capability/ID verification;
- later governance change: matrix now tracks discussion decisions rather than forcing KEEP.

### Stage 2 — Brand Identity — CLI PASS

- owned teal/open-book logo/PWA assets;
- canonical design tokens and Arabic typography;
- focus/reduced-motion/touch contracts;
- CLI caught and corrected token drift.

### Stage 3 — UX Architecture — CLI PASS

- Admin/Student IA;
- activation/content/learning/admin flow contracts;
- loading/error/offline/permission states;
- responsive/accessibility contracts and wireframes.

### Stage 4 — PostgreSQL Data Platform — CLI/RUNTIME PASS

- clean PostgreSQL 16 schema with constrained identity/curriculum/access/learning/AI/sync/auth contracts;
- relational integrity and migrations executed on clean DB.

### Stage 5 — Engineering Foundation — CLI/RUNTIME PASS

- real `apps/api` runtime;
- bounded PostgreSQL pool and transactions;
- migration runner/idempotency;
- env validation;
- logging/public error contract;
- strict TypeScript/lint/unit/build;
- isolated Admin/Student builds;
- root PostCSS leakage and production API build/start mismatch discovered and fixed by gates.

### Stage 6 — Auth & Authorization — CLI/RUNTIME PASS

- salted scrypt credentials;
- opaque server sessions + HttpOnly cookies;
- Student/Admin role isolation;
- Origin protection;
- DB lockout;
- reset-only recovery/session invalidation;
- explicit first-admin CLI bootstrap.

### Stage 7 — Access Codes & Entitlements — CLI/RUNTIME PASS

- current 6-digit Full / 7-digit Class contract;
- crypto-secure generation;
- Arabic/Persian digit normalization;
- row-locked idempotent redemption;
- renewal/no-waste rules;
- revoke/audit;
- concurrency/race tests.

### Stage 8 — Student Activation & Account Flow — CLI/PostgreSQL/Chromium PASS

- atomic first activation;
- returning identifier/password login;
- session + entitlement;
- logout/recovery reset;
- mobile RTL Student activation UI;
- built API + built Student Web + clean PostgreSQL browser E2E.

Chromium scenario proved:

```text
invalid code
→ activation
→ entitlement visible
→ logout
→ returning login
→ Admin recovery token
→ password reset
→ old password rejected
→ new password accepted
```

### Stage 9 — Content Model & deterministic `alwaslh-go` Import — CLI/PostgreSQL RUNTIME PASS

Branch/PR: `rebuild/content-import` / PR #8.

Pinned source:
`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Implemented:
- complete deterministic Git-tree inventory;
- source taxonomy for 15 roots / 48 documents;
- textbook/government-exam classification and metadata;
- numeric/manifest-driven stable ordering;
- support for canonical English, Arabic-key and `filename/pdf_page/book_page` manifests;
- helper accounting;
- Git blob SHA-1 provenance + canonical inventory SHA-256;
- duplicate blob reporting;
- PostgreSQL `content_import_runs`, `content_source_documents`, `content_source_assets`;
- transactional presence reconciliation;
- identical-inventory replay/idempotency;
- no automatic Lesson inference.

Verified inventory:

```text
subject roots:         15
source documents:      48
images:              5552
JPG:                 4218
WEBP:                1334
helper files:          86
manifest files:        24
fatal issues:           0
manifest errors:        0
order errors:           0
unmapped images:        0
unparsed assets:        0
classification errors: 0
expected-count errors:  0
duplicate blob groups: 100 / 201 paths (REVIEW only)
```

Canonical inventory SHA-256:
`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

Clean PostgreSQL first import: 48 docs / 5,552 assets / `replayed=false`; identical reimport reused the same run with `replayed=true`; database assertions proved unique active positions and no missing canonical rows.

### Stage 10 — Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS

Branch/PR: `rebuild/media-pipeline` / PR #11.

Migration `0009_media_pipeline.sql` adds:
- `media_assets`;
- `media_variants`;
- `media_asset_status`;
- `media_variant_kind`.

Implemented:
- exact source identity contract;
- deterministic relative storage keys;
- safe filesystem adapter;
- bounded concurrency 1..8 while preserving stable output order;
- Sharp `source/display/thumbnail/ai` variants;
- output SHA-256/byte-size/dimensions from produced bytes;
- media metadata repository + transaction orchestration;
- optional Stage 9 `content_source_asset_id` provenance linkage;
- source-byte/provenance-bound idempotency and conflict rejection;
- exact replay verification against stored byte SHA/size;
- partial storage/metadata/abort cleanup;
- local Poppler `pdfinfo`/`pdftoppm` via argument arrays;
- scoped temporary directories and cleanup;
- page-count and numeric 1..N validation;
- malformed-PDF/no-media-row behavior;
- real two-page PDF end-to-end runtime test.

Real PDF runtime produced page order `[1,2]`, positions `[100,101]`, and display long edge inside tested `1200..1800` px window.

## Tests & Verification

### Mandatory policy

See:
- `docs/engineering/CLI_VERIFICATION_GATES.md`;
- `.github/workflows/rebuild-stage-verification.yml`;
- `.github/workflows/stage9-content-import.yml`;
- `.github/workflows/stage10-media-pipeline.yml`;
- `docs/media/MEDIA_STAGE_DOD.md`;
- `PROJECT_HANDOFF.md`.

No unexecuted item is represented as passed.

### Stage 9 evidence

Implementation baseline:
- commit `30d12d24be93bf306a9da5fffcfb45ea9317a186`;
- dedicated run `33294631418` — SUCCESS;
- full regression `33294631419` — SUCCESS.

Final Stage 9 documentation head:
`cf55bd5d0f36dd9ad0f2df57c46c5541a3b01d0a`

- dedicated `33294974544` — SUCCESS;
- regression `33294974573` — SUCCESS.

### Stage 10 executable code-head evidence

Code head:
`f9f58ed4b9cf599d992a08b9c9eb33d3ae1a17c3`

- Stage 10 dedicated `33302062208` — SUCCESS;
- Stage 9 regression `33302062209` — SUCCESS;
- full rebuild regression `33302062216` — SUCCESS including Chromium E2E.

### Stage 10 final documentation-head evidence

Final Stage 10 head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

- Stage 10 dedicated `33302270707` — **SUCCESS**;
- Stage 9 regression `33302270692` — **SUCCESS**;
- full rebuild verification `33302270695` — **SUCCESS**, including Chromium E2E.

Therefore Stage 10 is formally closed at `CLI + PostgreSQL + MEDIA RUNTIME PASS`.

## Temporary Preview Environment

Purpose: continuous hands-on testing before final hosting.

- Supabase project: `linksoftt` — temporary PostgreSQL/testing host, not final architecture.
- canonical migrations through `0008` are applied there; `0009` remains pending.
- Preview-only RLS/revokes block `anon`/`authenticated` direct application-table access; API remains the boundary.
- Vercel team: `wasl15`.
- Vercel project: `alwaslh`.
- Preview branch: `preview/supabase-vercel`.
- current Preview head: `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`.
- a deployment of this head is READY.
- `/api/health` was rechecked and returned HTTP 200 with `{"status":"ok","service":"alwaslh-api"}`.
- Stage 10 has not yet been mirrored/applied to Preview.
- current direct deploys from `rebuild/media-pipeline` fail with Vercel build error: `No Output Directory named "dist" found after the Build completed.`
- this is a Vercel project/build configuration mismatch; GitHub Stage 10 runtime remains green.
- Vercel serverless filesystem is ephemeral; Poppler/live Admin media upload there remain `NOT YET VERIFIED`.

## Product Evolution Review

Current planning branch:
`planning/product-evolution-review`

Canonical decision file:
`docs/product/PRODUCT_EVOLUTION_REVIEW.md`

The review covers:
- audience/value;
- account/activation/access;
- curriculum/content model;
- Student home/navigation;
- Reader;
- Practice/quizzes;
- Student AI;
- notes/saved/highlights;
- statistics/gamification;
- notifications;
- Offline/PWA;
- Admin roles;
- Admin content/media workflow;
- Admin AI authoring;
- Quiz Builder/content QA;
- students/codes/support;
- reports/export;
- search/discovery;
- content lifecycle/publishing;
- new product ideas.

Every decision records legacy behavior, user need, considered options, chosen approach, classification, data/API/UX/security/offline/AI impact, stages affected and required tests/DoD.

## Known Issues / Remaining Risk

- `PRODUCT-001`: product decisions for remaining feature-heavy stages are still in review.
- Preview remains pre-Stage-10.
- Vercel branch build/output configuration mismatch remains open.
- production-host PostgreSQL pool/network/load tuning remains `NOT YET VERIFIED`.
- real-host DB backup/restore drill remains `NOT YET VERIFIED`.
- durable media volume durability/permissions/backup/restore/capacity remain `NOT YET VERIFIED`.
- production-sized PDF load/performance remains `NOT YET VERIFIED`.
- AI scope/contracts/golden tests/durable workers remain undecided/unimplemented.
- complete Admin product remains unimplemented.
- complete post-auth Student learning product remains unimplemented.
- Practice/trusted scoring remains undecided/unimplemented.
- Offline/PWA sync lifecycle remains undecided/unimplemented.
- full performance/security/accessibility/device/staging/rollback/release readiness remains `NOT YET VERIFIED`.
- legacy application remains NO-GO as production target.

## Remaining Work

1. Complete Product Evolution Review and record decisions.
2. Update `PRODUCT_FEATURE_PARITY_MATRIX.md` from legacy-parity inventory to explicit decision inventory.
3. Revise `MASTER_REBUILD_ROADMAP.md` based on decisions; provisional Stages 11–20 may be reordered/merged/split/removed.
4. Reopen any Stage 1–10 Business Rule only if an explicit decision requires it, with impact analysis + executable regression.
5. Synchronize stable Stage 10/resulting baseline to Supabase/Vercel Preview: apply `0009`, lock down new tables, reconcile Vercel build/routing, deploy and verify.
6. Implement the revised AI/Admin/Student/learning/offline/reporting stages according to decisions.
7. Execute later performance/security/test/accessibility/content-load/staging/release/production/ops gates.

## Documentation / Continuity Protocol

At every meaningful product or engineering batch:

- update this log with decisions, findings, failures/fixes and verification;
- update `PROJECT_STATUS.md` with current phase, blockers, latest evidence and next action;
- update `PROJECT_HANDOFF.md` whenever architecture/business rules/branches/verified baseline/active stage/Preview status changes;
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md` for every product decision;
- update `PRODUCT_FEATURE_PARITY_MATRIX.md` and roadmap when decisions alter scope;
- retain exact CI commit/run evidence;
- mark anything not actually executed as `NOT YET VERIFIED`.

## Current State

**Stages 1–10 have verified technical gates. Stage 10 final documentation-head CI is green. The active phase is Product Evolution Review before feature-heavy Stage 11+ work. Preview is healthy at its older pre-Stage-10 baseline but still needs Stage 10 synchronization and Vercel build-configuration reconciliation.**
