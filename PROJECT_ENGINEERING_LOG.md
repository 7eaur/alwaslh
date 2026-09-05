# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, implementation history, verification evidence and remaining work. Read `PROJECT_HANDOFF.md`, then `PROJECT_STATUS.md`, then `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين رئيسيين:

- **Student PWA:** Welcome/Auth، المنهج، Reader، الملخصات، `اختبر نفسك`، الاختبارات والنماذج، الملاحظات، المفضلة، `يحتاج مراجعة`، التقدم، الإنجازات الشخصية وOffline/PWA.
- **Admin Web:** Super Admin واحد يدير الصفوف/المواد/الدروس/المحتوى، الرفع والمعالجة، OCR/TTS، الطلاب والأكواد، AI authoring، Question Bank/QA، النشر، Import/Export والتقارير.

### Product governance

- الفكرة الأساسية ثابتة.
- التطبيق القديم reference/inventory للفكرة والمميزات والسيناريوهات والمشكلات.
- **لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.**
- `PRODUCT_FEATURE_PARITY_MATRIX.md` يبقى coverage checklist قبل إغلاق Student/Admin product stages.
- يمكن تغيير UI/Architecture/Flow إذا بقيت قيمة الميزة وبُنيت بطريقة أفضل.

### Sources

- `7eaur/alwaslh`: legacy reference + rebuild repository.
- `7eaur/alwaslh-go`: canonical curriculum/media source input.
- pinned Stage9 revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    ├── OCR extraction + searchable text
                    ├── cached/versioned TTS audio
                    ├── durable AI workers/jobs
                    └── account/device-scoped offline sync
```

Rules:
- Browser never receives PostgreSQL credentials.
- Auth/Authorization/Entitlements server-owned.
- PostgreSQL clean-slate/migration-owned.
- media transforms server-owned/deterministic.
- normal Upload never depends on OCR/AI/TTS.
- OCR is reusable/provider-abstracted.
- TTS uses approved text and is cached by published content revision.
- Gemini secrets/execution server-owned.
- Student assessment sessions use Published Admin-reviewed Question Bank only.
- Offline is account/device-scoped and designed to reduce repeated server fetches.

## Verified engineering baseline — Stages 1–10

### Stage 1 — Product Inventory — CLI PASS
Legacy feature/user-flow inventory and parity safety net.

### Stage 2 — Brand — CLI PASS
Owned teal/open-book identity, Arabic typography/tokens/accessibility rules.

### Stage 3 — UX Architecture — CLI PASS
Initial Admin/Student IA and critical state contracts; later product decisions may refactor flows explicitly.

### Stage 4 — PostgreSQL — CLI/RUNTIME PASS
Clean PostgreSQL16 data platform.

### Stage 5 — Engineering Foundation — CLI/RUNTIME PASS
API runtime, bounded DB pool/transactions, migrations, config/logging/errors, strict TS/lint/tests/builds/CI.

### Stage 6 — Auth & Authorization — CLI/RUNTIME PASS baseline
scrypt credentials, opaque HttpOnly sessions, role isolation, Origin protection, lockout, reset-only recovery, explicit Admin bootstrap.

### Stage 7 — Access Codes & Entitlements — CLI/RUNTIME PASS
- Full Code = 6 digits.
- Class Code = 7 digits.
- crypto generation.
- Arabic/Persian normalization.
- row-lock transactional/idempotent redemption.
- renewal/no-waste/revoke/audit/concurrency tests.

### Stage 8 — Activation/Login/Recovery — CLI/PostgreSQL/Chromium PASS baseline
Verified baseline used `Full Code + password` in one activation request and proved invalid code → activation → entitlement → logout → returning login → Admin recovery → reset → old password rejected → new password accepted.

**Product decisions now require partial Stage6/8 reopen** for two-step activation, temporary-password forced change and registered-device challenge/rebind.

### Stage 9 — Deterministic `alwaslh-go` import — CLI/PostgreSQL RUNTIME PASS

```text
15 subject roots
48 source documents
5,552 images
4,218 JPG
1,334 WEBP
86 recognized helper files
24 manifests
0 fatal inventory issues
100 duplicate blob groups / 201 paths retained for REVIEW
```

Canonical SHA-256:
`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

Critical defects fixed included Arabic manifests that would omit 772 images, helper-count drift, third manifest schema, and Python/JS `9.0` vs `9` digest mismatch.

### Stage 10 — Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS
Migration `0009_media_pipeline.sql` introduced media assets/variants. Verified:
- deterministic storage keys/order;
- path traversal prevention;
- bounded concurrency 1..8;
- Sharp `source/display/thumbnail/ai` variants;
- SHA-256/bytes/dimensions;
- Stage9 provenance;
- source-byte-bound idempotency;
- exact replay verification;
- cleanup after storage/metadata/abort failures;
- local Poppler PDF extraction;
- malformed PDF creates zero successful rows;
- real 2-page PDF E2E preserved page order `[1,2]` and positions `[100,101]`.

Final head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final CI:
- Stage10 `33302270707` SUCCESS.
- Stage9 regression `33302270692` SUCCESS.
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

## Product Decisions — Batches 01–04

Canonical detailed record: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### Account/Access
- PED-002 Welcome before auth.
- PED-003 two-step activation using one-time ticket while final account write remains atomic.
- PED-004 Admin-assisted temporary password + session revocation + forced password change.
- PED-013 returning `لدي حساب بالفعل` path.
- PED-014 one registered cryptographic application-device key; different/lost device requires Admin reset/rebind.
- PED-033 Full Code 6 digits + Class Code 7 digits retained as core. Student can redeem more Class Codes after login and own multiple class entitlements; Stage7 renewal/no-waste guarantees remain.

### Student learning
- PED-011 no silent removal of valuable legacy learning features.
- PED-012 Summary / Self Practice / Full Test / Model are distinct flows.
- PED-016 Notes / Favorites / Needs Review are separate semantics.
- PED-017 private achievements; no Global Leaderboard requirement.
- PED-022 Reader: original page + optional OCR/published Text View.
- PED-023 TTS `استماع للدرس`: cached derived media from approved text, not generated per Play.
- PED-024 Arabic search to exact lesson/page.
- PED-025 no independent Highlight system now.
- PED-026 Student custom tests consume Published Question Bank only; no live Gemini generation.
- PED-027 original ministerial model distinct from future simulation.
- PED-031 `اختبر نفسك` gives immediate feedback after every question; Full Tests/Models review at end.

### Offline/Performance
- PED-015 Offline first-class with revisions/outbox/account-device scope.
- PED-028 explicit Lesson + Subject + Book download when appropriate; Download Manager and storage budgets.
- PED-029 maximum 14-day signed offline authorization lease capped by entitlement expiry.
- PED-032 Student-facing image delivery uses optimized variants/lazy-responsive loading while retaining source evidence. Browser readability/quality tuning is NOT YET VERIFIED.

### Curriculum/Admin
- PED-018 explicit flexible hierarchy with multiple classes/subjects and optional Unit.
- PED-019 Import/Export required with scoped validation/preview/result reporting.
- PED-020 Draft → Review → Published.
- PED-034 contextual in-place instructions are mandatory UX; no hidden essential instructions.
- PED-035 Admin scope = **Super Admin only**; no multi-role RBAC product work now.
- PED-036 no mandatory annual curriculum version lifecycle. Optional source year/edition metadata only when useful.

### AI/OCR
- PED-007 AI text-first from reusable OCR.
- PED-008 provider-abstracted OCR.
- PED-009 authorized Gemini credential/project scheduler.
- PED-010 upload independent from AI.
- PED-021 preserve valuable legacy generation modes/outcomes.
- PED-037 generated-from-book questions require source + page provenance before publish.
- PED-038 high-throughput durable generation architecture: chunking, queues, bounded concurrency/backpressure, retry/cooldown, partial-success persistence, idempotency, cancel/resume, validation/dedupe/provenance, usage metrics.
- PED-039 Legacy Feature Coverage Gate before closing Student/Admin product stages.

## Architecture Decisions

- **AD-001** Preserve product value, not legacy mistakes.
- **AD-002** Security/data integrity before feature velocity.
- **AD-003** Version-controlled migrations canonical.
- **AD-004** Separate Admin/Student runtime concerns.
- **AD-005** Server-owned Auth/Authorization/Entitlements.
- **AD-006** AI secrets/durable execution server-side.
- **AD-007** AI provider scheduling/failover belongs in workers.
- **AD-008** Offline sync account/device-scoped with revisions/tombstones/outbox.
- **AD-009** `alwaslh-go` source pipeline, not frontend asset dump.
- **AD-012** Private PostgreSQL behind Backend.
- **AD-013** Clean-slate data model.
- **AD-015** Executable verification mandatory for Stage PASS.
- **AD-016** Repository-owned handoff/status/log mandatory.
- **AD-018** Final activation account creation remains one transaction.
- **AD-023** Page/source order deterministic and independent of async completion.
- **AD-028** Canonical media processing server-owned.
- **AD-029** Media idempotency bound to exact source provenance+bytes.
- **AD-030** Supabase/Vercel Preview does not redefine final architecture.
- **AD-031** Legacy parity is decision inventory; no valuable removal without owner decision.
- **AD-032** Product decision may reopen verified stage only with impact analysis + executable regression.
- **AD-033** Two-step activation uses temporary ticket while final write remains atomic.
- **AD-034** Upload cannot depend on OCR/AI/TTS availability.
- **AD-035** OCR reusable/provider-abstracted.
- **AD-036** AI text-first by default; original source remains evidence/fallback.
- **AD-037** AI credentials/projects scheduled server-side with health/rate/cooldown/failover.
- **AD-038** Student account uses registered cryptographic application-device identity, not fingerprint/IP/user-agent.
- **AD-039** Offline first-class and low-request.
- **AD-040** Notes/Favorites/Needs Review separate product semantics.
- **AD-041** Achievements private; no Global Leaderboard requirement.
- **AD-042** Human Admin review required before publish.
- **AD-043** Curriculum hierarchy explicit/flexible, not generic tree/filename-derived.
- **AD-044** Reader keeps original page as visual truth plus optional approved text view.
- **AD-045** TTS audio cached/versioned derived media.
- **AD-046** Student tests consume published Admin-reviewed Question Bank only.
- **AD-047** Original ministerial and simulated models are distinct.
- **AD-048** Offline protected access max 14-day lease capped by entitlement expiry.
- **AD-049** Student media delivery prefers optimized variants while source originals remain canonical evidence.
- **AD-050** Current Admin product has one Super Admin role; avoid unnecessary RBAC.
- **AD-051** Generated source-based questions require source/page provenance to publish.
- **AD-052** High-volume AI generation is durable chunked work with backpressure/partial persistence, never one giant HTTP request.
- **AD-053** Legacy feature matrix is a release coverage gate for feature-heavy Student/Admin stages.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Status |
|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged mutation | FIXED Stage6 |
| SEC-002..011 | P0 | Authorization | public/browser DB privilege paths | ELIMINATED by private backend architecture |
| DATA-015 | P0 | Activation | legacy partial/nontransactional activation | FIXED baseline; new two-step refactor must retain atomic final transaction |
| DATA-018 | P0 | Class Codes | racy redemption | FIXED Stage7 |
| SEC-015..018 | P1 | Credentials | plaintext/reversible recovery | FIXED; Admin reset only |
| DATA-025 | P1 | Assessment | client-trusted score/rank | REMAINING; Stage15 trusted engine |
| OFF-* | P1/P2 | Offline | stale/global/cross-account cache risk | REBUILD required; PED-015/028/029 direction decided |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | REBUILD required; PED-007/009/021/038 direction decided |
| CONTENT-009-* | P1/P2 | Content | manifest/helper/digest completeness defects | FIXED Stage9 |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | FIXED Stage10 runtime |
| PREVIEW-010-001 | P2 | Vercel | Stage10 direct deploy expects root `dist` | OPEN; Preview reconciliation required |
| PREVIEW-010-002 | P2 | Preview Media | serverless FS ephemeral/Poppler unproven | NOT YET VERIFIED |
| PRODUCT-001 | P1 | Product Strategy | blind parity risks weak UX | Controlled by Product Review + PED-039 |
| PRODUCT-002 | P1 | Activation UX | baseline combines code+password | DECIDED refactor pending |
| PRODUCT-003 | P1 | Device Policy | password-only login does not enforce one-device rule | DECIDED architecture; implementation pending |
| PRODUCT-004 | P1 | Offline/Load | repeated fetches conflict with offline/low-load goal | DECIDED architecture; implementation pending |
| PRODUCT-005 | P2 | Reader | image-only experience lacks text/search/audio | DECIDED Reader/Text/Search/TTS; implementation pending |
| PRODUCT-006 | P1 | Assessment | live Student AI would raise cost/uncertainty | DECIDED Published Question Bank only |
| PRODUCT-007 | P1 | Source correctness | generated questions without page provenance hard to review | PED-037 DECIDED; implementation pending |
| AI-NEW-001 | P1 | AI Cost | repeated image-to-Gemini wastes tokens | OCR text-first decided |
| AI-NEW-002 | P1 | AI Scale | giant/brittle generation requests lose progress and overload provider/server | PED-038 durable chunk/backpressure architecture decided |

## Tests & Verification

### Verified technical baseline

Final Stage10 documentation head `27c6a2ef1118ee44d2e63471e4f925e1296283e0`:
- Stage10 `33302270707` SUCCESS.
- Stage9 regression `33302270692` SUCCESS.
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

### Product-review decisions

Batches 01–04 are **design/product decisions only** unless they refer to already verified Stage1–10 behavior. New two-step activation/device binding, image delivery tuning, OCR runtime, Reader Text/Search/TTS, Published Question Bank custom tests, 14-day Offline lease and high-throughput AI execution are `NOT YET VERIFIED` until implementation gates run.

## Temporary Preview

- Supabase `linksoftt` temporary only.
- migrations through `0008` applied; `0009` pending there.
- Preview RLS/revokes block direct browser table access.
- Vercel team `wasl15`, project `alwaslh`.
- preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`.
- READY deployment and `/api/health` HTTP 200 verified.
- Preview remains pre-Stage10.
- direct Stage10 branch deployment error: `No Output Directory named "dist" found after the Build completed.`
- Vercel filesystem/Poppler durability is NOT YET VERIFIED.

## Known Issues / Remaining Risk

- Stage6/8 auth/device refactor not implemented.
- Stage10 code/migration not synchronized into Preview.
- Student image-delivery/browser readability tuning not verified.
- OCR provider benchmark/runtime not implemented.
- Reader Text/Search/TTS not implemented.
- Practice/Question Bank engine not implemented.
- Offline 14-day lease/download runtime not verified.
- Stage11 contracts / Stage12 high-throughput AI execution not implemented.
- exact Notes media scope, Notifications, mastery/recommendation rules, Quiz Builder UX, Import/Export scopes and Student direct AI still under Product Review.
- production backup/restore/load/security/performance/accessibility/staging/release gates remain later work.

## Remaining Work

1. Finish remaining Product Evolution Review decisions.
2. Reconcile every legacy feature via `PRODUCT_FEATURE_PARITY_MATRIX.md` before closing Student/Admin product stages.
3. Reopen Stage6/8 for two-step activation + registered-device flow and rerun API/PostgreSQL/security/Chromium gates.
4. Synchronize Stage10 into Supabase/Vercel Preview and fix Vercel build/routing; verify optimized media delivery.
5. Implement OCR Extraction Foundation.
6. Implement Stage11 AI prompt/output/provenance/golden contracts.
7. Implement Stage12 durable high-throughput generation per PED-038.
8. Build Super Admin curriculum/upload/OCR/AI review/Question Bank/Import-Export product.
9. Build Student Reader/Summaries/Practice/Tests/Models/Personal Data/Progress product.
10. Build Offline/PWA with explicit downloads, revision sync/outbox and 14-day lease.
11. Execute performance/security/tests/accessibility/content-load/staging/release/production/operations gates.

## Documentation / Continuity Protocol

After every meaningful batch:
- update this log;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when business/roadmap/baseline changes;
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md`;
- update `PRODUCT_FEATURE_PARITY_MATRIX.md` / `MASTER_REBUILD_ROADMAP.md` when decisions alter scope;
- retain exact CI evidence;
- unexecuted = `NOT YET VERIFIED`.

## Current State

**Stages 1–10 retain verified technical gates. Product Review Batches 01–04 are recorded. Access codes/multiple class entitlements, image optimization, contextual instructions, immediate Practice feedback, Super Admin-only scope, simplified curriculum hierarchy, mandatory source/page provenance and high-throughput token-efficient AI architecture are now explicit product decisions. Their new implementation work remains NOT YET VERIFIED.**
