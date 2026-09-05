# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, implementation history, verification evidence and remaining work. Read `PROJECT_HANDOFF.md`, then `PROJECT_STATUS.md`, then `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين رئيسيين:

- **Student PWA:** التفعيل/الدخول، المنهج، Reader، الملخصات، Practice/`اختبر نفسك`، الاختبارات والنماذج، الملاحظات، المفضلة، `يحتاج مراجعة`، التقدم والإنجازات الشخصية، Offline/PWA.
- **Admin Web:** الصفوف/المواد/الدروس/المحتوى، الرفع والمعالجة، OCR، الطلاب والوصول، AI authoring، Quiz/Content QA، النشر، Import/Export والتقارير.

### Product governance after Stage 10

الفكرة الأساسية ثابتة. التطبيق القديم reference/inventory للفكرة والمميزات والسيناريوهات والمشكلات، وليس specification للشاشات أو التقنية.

**قاعدة:** لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner. يمكن إعادة تنظيم/دمج آليات مكررة إذا بقيت النتيجة الوظيفية كاملة.

كل Feature/Flow/Business Rule رئيسي يصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW`.

### Sources

- `7eaur/alwaslh`: legacy reference + rebuild repository.
- `7eaur/alwaslh-go`: canonical curriculum/media source input.
- pinned Stage 9 revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    ├── OCR extraction/indexing
                    ├── cached/versioned TTS audio
                    └── background / AI workers
```

Rules:
- Browser never receives PostgreSQL credentials or connects directly to DB.
- Auth/Authorization/Entitlements server-owned.
- PostgreSQL clean-slate/migration-owned.
- Student/Admin separate UX/runtime concerns.
- media transforms server-owned/deterministic.
- OCR is a separate reusable extraction layer; upload does not depend on OCR/AI.
- TTS consumes approved/published text and is cached by content revision; playback does not call TTS on every request.
- Gemini secrets/execution are server-owned.
- Student Offline is account/device-scoped and must reduce repeated server requests.
- Student-generated practice/test sessions use published Admin-reviewed Question Bank only; no live AI question generation for Student.

## User Flows / Business Rules

### Student entry / activation / returning login

```text
Welcome
→ تفعيل جديد | لدي حساب بالفعل
```

New activation target:

```text
6-digit Full Code verification
→ one-time short-lived activation ticket
→ mandatory Create Password
→ atomic account + credential + entitlement + redemption + audit
→ register application-device key
→ authenticated session
```

Returning login:

```text
identifier + password
→ registered-device challenge proof
→ session
```

Admin recovery:

```text
lookup account/code
→ temporary password
→ revoke old sessions
→ must_change_password
→ Student chooses new private password
```

### Reader

```text
Lesson
→ original page/image view
↔ optional approved OCR/published Text View
→ search results map to exact page/source
→ optional cached TTS audio
→ Notes / Favorites / Needs Review
```

No independent Highlight feature in current scope.

### Practice/Test

- Summary, Self Practice, Full Test and Ministerial Model are separate product concepts.
- Student can select lessons/count/types for custom sessions.
- Session questions come only from Published Question Bank reviewed by Admin.
- Original ministerial models remain source-exact; future simulation model is a different type.

### Offline

- explicit lesson/subject downloads;
- explicit full-book download when size/storage budget permits;
- no automatic full curriculum download;
- local account/device-scoped cache + revision/delta sync + outbox;
- signed offline access lease maximum 14 days, capped by entitlement expiry.

## Implemented baseline — Stages 1–10

### Stage 1 Product Inventory — CLI PASS
Legacy feature/user-flow inventory, parity safety net and automated capability checks.

### Stage 2 Brand — CLI PASS
Owned teal/open-book identity, tokens/assets, Arabic typography, focus/reduced-motion/touch rules.

### Stage 3 UX Architecture — CLI PASS
Initial Admin/Student IA, states and critical flows. Product flows may be improved through the current review.

### Stage 4 PostgreSQL Data Platform — CLI/RUNTIME PASS
Clean PostgreSQL 16 schema and relational integrity.

### Stage 5 Engineering Foundation — CLI/RUNTIME PASS
API runtime, bounded DB pool/transactions, migration runner, env validation, logging/error envelope, strict TS/lint/unit/build, isolated Admin/Student builds.

### Stage 6 Auth & Authorization — CLI/RUNTIME PASS
Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery, explicit Admin bootstrap.

### Stage 7 Access Codes & Entitlements — CLI/RUNTIME PASS
Current baseline: Full Code 6 digits / Class Code 7 digits, crypto generation, Arabic/Persian normalization, row-locked transactional/idempotent redemption, renewal/no-waste/revoke/audit/concurrency tests.

### Stage 8 Student Activation & Account Flow — CLI/PostgreSQL/Chromium PASS
Baseline originally used Full Code + password in one activation request, then atomic profile/credential/entitlement/redemption/audit, returning login and reset-only recovery.

Chromium baseline proved:

```text
invalid code
→ activation
→ entitlement visible
→ logout
→ returning login
→ Admin recovery
→ password reset
→ old password rejected
→ new password accepted
```

Product decisions partially reopen Stage 6/8 for two-step activation, temporary-password forced change and registered-device challenge/rebind.

### Stage 9 Content Model / deterministic `alwaslh-go` Import — CLI/PostgreSQL RUNTIME PASS

Verified source facts:

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

Canonical inventory SHA-256:
`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

Canonical DB: `content_import_runs`, `content_source_documents`, `content_source_assets`.

First clean import: 48 docs / 5,552 assets / `replayed=false`; identical import reused same run with `replayed=true`.

Critical defects caught/fixed:
- 8 Arabic-key manifests would have omitted 772 images;
- helper baseline 76→86;
- third manifest schema `filename/pdf_page/book_page`;
- Python/JS `9.0` vs `9` digest mismatch.

### Stage 10 Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS

Migration `0009_media_pipeline.sql` adds `media_assets`, `media_variants`, `media_asset_status`, `media_variant_kind`.

Implemented:
- exact source identity;
- deterministic trusted storage keys;
- safe filesystem/path traversal prevention;
- bounded concurrency 1..8 with stable input/page order;
- Sharp `source/display/thumbnail/ai` variants;
- SHA-256/byte sizes/dimensions from produced bytes;
- Stage 9 provenance linkage;
- source-byte/provenance-bound idempotency/conflict rejection;
- exact replay byte verification;
- storage/metadata/abort cleanup;
- Poppler `pdfinfo`/`pdftoppm` with scoped temp dirs and numeric page validation;
- malformed PDF produces zero successful media rows;
- real 2-page PDF E2E: order `[1,2]`, positions `[100,101]`, tested display long edge `1200..1800` px.

Final Stage 10 head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final CI:
- Stage10 `33302270707` SUCCESS;
- Stage9 regression `33302270692` SUCCESS;
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

Therefore Stage 10 is formally closed at `CLI + PostgreSQL + MEDIA RUNTIME PASS`.

## Product Decision Batches 01–02

Canonical file: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### PED-001 — Preserve idea, improve execution
Same product idea; legacy implementation/UI details are not binding.

### PED-002 — Welcome before auth
Student sees a polished welcome/introduction screen before entry. Visible copy must be final Product-ready Arabic.

### PED-003 — Two-step activation
`6-digit Full Code verification → one-time ticket → mandatory password → atomic activation/session`.

### PED-004 — Admin-assisted recovery
Temporary password/reset, session revocation, forced private password change. Admin never sees old password.

### PED-005 — Simple but feature-complete Student UX
Low-clutter/mobile-first while retaining valuable curriculum/study/personal-learning capabilities.

### PED-006 / PED-010 — Upload independent from AI
Admin upload/process/store works even if OCR/Gemini is unavailable.

### PED-007 / PED-008 — OCR extraction layer
Provider-abstracted reusable OCR text with provenance/confidence/status. Original image remains source of truth.

### PED-009 — Durable Gemini scheduling
Server-only authorized credentials/projects with health, quota/rate awareness, cooldown, retry/backoff, failover and usage/error metadata.

### PED-011 / PED-012 — Feature depth retained and learning modes separated
Summaries, Self Practice, Full Tests, models/ministerials and related legacy capabilities remain; they are reorganized rather than removed.

### PED-013 / PED-014 — Returning account + single registered device
Returning login exists. Device policy uses application cryptographic key challenge, not fingerprint/IP/user-agent.

### PED-015 — Offline is core
Account/device-scoped cache + revisions/outbox; no generic authenticated API SW cache; trusted server authority preserved.

### PED-016 / PED-017 — Personal data and achievements
Notes/Favorites/Needs Review remain separate. Achievements are private/personal; no Global Leaderboard requirement.

### PED-018 — Flexible curriculum hierarchy
`Curriculum/Year → Class → Subject Offering → optional Unit → Lesson → Content`, explicit ordering, no arbitrary generic tree.

### PED-019 / PED-020 — Import/Export + review lifecycle
Scoped safe Import/Export. Content/AI flow `Draft → Review → Published`.

### PED-021 — Preserve AI generation outcomes
Summary/questions/MCQ/T-F/mixed/extraction/page-selected/regenerate/versions/exam/exact/replica/bulk and metadata, each with versioned contract/validator/golden tests.

## Product Decision Batch 03

### PED-022 — Dual Reader
Original page/image is primary; optional approved OCR/published Text View is available. Wide screens may use side-by-side, mobile uses a simple toggle.

### PED-023 — TTS / «استماع للدرس»
Provider-abstracted Arabic TTS reads approved/published lesson text. Audio is generated/cached by content revision, stored with provider/model/voice/checksum/duration metadata, reused across plays and optionally downloaded Offline. Provider/voice benchmark remains pending.

### PED-024 — Book/Lesson search
Arabic-normalized OCR/published text search with exact lesson/page/source mapping. Downloaded content should support local search where practical.

### PED-025 — No Highlight system now
Notes/Favorites/Needs Review provide the personal-learning organization needed; coordinate/text highlight sync is excluded from current scope.

### PED-026 — Custom tests use Published Question Bank only
Student can choose allowed lessons/count/types. Backend selects from Admin-reviewed published questions; no live Gemini generation for Student sessions and no unnecessary full answer-key bank shipping to Browser.

### PED-027 — Original ministerial vs simulation
Original models remain source-exact/provenanced. Simulation is a distinct, clearly labeled future type.

### PED-028 — Offline download policy
Lesson + Subject downloads supported. Whole-book download supported explicitly when storage budget permits. Download Manager handles size/progress/retry/cancel/remove. No automatic full curriculum download.

### PED-029 — 14-day offline authorization
`valid_until = min(now + 14 days, entitlement_expiry)`. Admin revocation cannot reach a completely offline device instantly; worst intentional offline window is the remaining signed lease.

### PED-030 — Practice feedback timing remains open
Immediate correction after each `اختبر نفسك` question vs correction at end is still PENDING and must not be assumed.

## Architecture Decisions

- **AD-001** Preserve product value, not legacy mistakes.
- **AD-002** Security/data integrity before feature velocity.
- **AD-003** Version-controlled migrations canonical.
- **AD-004** Separate Admin/Student runtime concerns.
- **AD-005** Server-owned authorization/entitlements.
- **AD-006** AI secrets/durable execution server-side.
- **AD-007** Provider scheduling/failover belongs in workers.
- **AD-008** Offline sync is account-scoped with revisions/tombstones/outbox.
- **AD-009** `alwaslh-go` is source pipeline, not frontend assets.
- **AD-012** Private PostgreSQL behind Backend.
- **AD-013** Clean-slate data model.
- **AD-015** Executable verification mandatory for Stage PASS.
- **AD-016** Repository-owned handoff/status/log mandatory.
- **AD-018** Final activation account creation remains one transaction.
- **AD-023** Source/page order deterministic and independent from async completion.
- **AD-028** Canonical media processing server-owned.
- **AD-029** Media idempotency bound to exact source provenance+bytes.
- **AD-030** Supabase/Vercel Preview does not redefine final architecture.
- **AD-031** Legacy parity is decision inventory; no valuable feature removal without explicit owner decision.
- **AD-032** Product decision may reopen verified stage only with impact analysis + executable regression.
- **AD-033** Two-step activation uses temporary verification ticket while final write remains atomic.
- **AD-034** Normal Admin upload cannot depend on AI/OCR availability.
- **AD-035** OCR is provider-abstracted reusable extraction layer.
- **AD-036** AI generation text-first by default; original source remains authoritative evidence/fallback.
- **AD-037** AI credentials/projects scheduled server-side with health/rate/cooldown/failover.
- **AD-038** Student account uses registered cryptographic application-device identity, never browser fingerprint as sole proof.
- **AD-039** Offline is first-class; local account/device-scoped data + delta sync/outbox reduce server traffic while authority remains server-side.
- **AD-040** Notes, Favorites and Needs Review are separate product semantics.
- **AD-041** Public/global student leaderboard is not required; achievements are private/personal.
- **AD-042** Content/AI lifecycle requires human review before publish.
- **AD-043** Curriculum hierarchy should be explicit/flexible, not arbitrary generic tree or filename-derived.
- **AD-044** Reader keeps original page as visual source of truth while approved OCR text is an optional searchable/accessibility view.
- **AD-045** TTS audio is a versioned derived media asset generated from approved published text and cached; playback must not regenerate speech.
- **AD-046** Student assessment sessions consume only published Admin-reviewed Question Bank entries; live AI generation is excluded from Student test creation.
- **AD-047** Original ministerial models and simulated models are different content types and labels.
- **AD-048** Offline protected access uses a signed 14-day maximum lease capped by actual entitlement expiry.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Status |
|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged mutation | FIXED Stage 6 |
| SEC-002..011 | P0 | Authorization | public/browser DB privilege paths | ELIMINATED by private backend architecture |
| DATA-015 | P0 | Activation | legacy partial/nontransactional activation | FIXED baseline; two-step refactor must preserve final atomic transaction |
| DATA-018 | P0 | Class Codes | racy redemption | FIXED Stage 7 |
| SEC-015..018 | P1 | Credentials | plaintext/reversible recovery | FIXED; Admin reset only |
| DATA-025 | P1 | Assessment | client-trusted score/rank | REMAINING later trusted Practice/attempt engine |
| OFF-* | P1/P2 | Offline | global/stale/cross-account cache risk | REBUILD required; PED-015/028/029 define direction |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | REBUILD required by PED-007/009/021 |
| CONTENT-009-* | P1/P2 | Content | manifest/helper/digest completeness defects | FIXED Stage 9 |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | FIXED Stage 10 runtime |
| PREVIEW-010-001 | P2 | Vercel | Stage10 direct deploy expects root `dist` | OPEN; Preview reconciliation required |
| PREVIEW-010-002 | P2 | Preview Media | serverless FS ephemeral/Poppler unproven | NOT YET VERIFIED |
| PRODUCT-001 | P1 | Product Strategy | blind legacy parity risks wrong UX | IN PROGRESS review; preserve outcomes, improve organization |
| PRODUCT-002 | P1 | Activation UX | baseline combines code+password | DECIDED refactor pending |
| PRODUCT-003 | P1 | Device Policy | password-only login does not enforce requested one-device policy | DECIDED architecture; implementation pending |
| PRODUCT-004 | P1 | Offline/Load | repeated server fetches conflict with offline/low-load requirement | DECIDED architecture; implementation pending |
| PRODUCT-005 | P2 | Reader | source images alone do not support useful search/read-aloud | DECIDED OCR Text View + search + cached TTS; implementation pending |
| PRODUCT-006 | P1 | Assessment | live AI generation for Student sessions would increase cost/uncertainty | DECIDED Published Question Bank only |
| AI-NEW-001 | P1 | AI Cost | repeated image-to-Gemini use wastes tokens | DECIDED OCR text-first path pending |

## Tests & Verification

### Verified technical baseline

Final Stage 10 documentation head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

- Stage10 workflow `33302270707` — SUCCESS.
- Stage9 regression `33302270692` — SUCCESS.
- Full Rebuild `33302270695` — SUCCESS, including Chromium Stage8 E2E.

### Product-review decisions

Batches 01–03 are documentation/design decisions only. Their implementation/runtime gates are **NOT YET VERIFIED** until the affected stages are reopened and executed. In particular: registered-device auth, new two-step activation UI/API, OCR provider runtime, Reader text/search/TTS, Published Question Bank custom-test flow, and 14-day Offline lease are not represented as implemented.

## Temporary Preview

- Supabase `linksoftt` temporary only.
- migrations through `0008` applied; `0009` still pending there.
- Preview RLS/revokes block direct `anon`/`authenticated` table access.
- Vercel team `wasl15`, project `alwaslh`.
- preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`.
- READY deployment and `/api/health` HTTP 200 verified.
- Preview remains pre-Stage-10.
- direct Stage10 branch deployment error: `No Output Directory named "dist" found after the Build completed.`
- Vercel filesystem/Poppler durability is NOT YET VERIFIED.

## Known Issues / Remaining Risk

- Stage 6/8 product-required auth/device refactor is not implemented yet.
- Stage10 stable code/migration still not synchronized into Preview.
- OCR provider selection/benchmark and extraction persistence not implemented.
- Reader Text View/search/TTS runtime not implemented; TTS provider/voice benchmark pending.
- Practice feedback timing and detailed scoring/review semantics remain undecided.
- Curriculum year/version/archive/replacement semantics remain undecided.
- Admin roles/permissions and Quiz Builder/QA exact workflow remain undecided.
- Offline 14-day lease/download architecture is decided but not runtime-verified.
- final production DB/media backup/restore/load/security/performance/accessibility/staging/release gates remain later work.

## Remaining Work

1. Continue Product Evolution Review and settle Practice feedback/scoring, curriculum versioning, Admin roles, Quiz Builder/QA, Notes media, Notifications, Student direct AI scope and exact reports/import/export.
2. Update `PRODUCT_FEATURE_PARITY_MATRIX.md` into explicit decision inventory as remaining decisions settle.
3. Reopen Stage 6/8 for two-step activation + registered-device flow and rerun API/PostgreSQL/security/Chromium gates.
4. Synchronize Stage10 into Supabase/Vercel Preview and fix Vercel routing/build mismatch.
5. Implement OCR Extraction Foundation with benchmarked provider abstraction.
6. Build Reader text/search/TTS contracts and runtime according to PED-022..024.
7. Build AI contracts/durable execution with preserved Admin generation modes.
8. Build Admin curriculum/upload/OCR/AI review/Quiz Builder/Import-Export product.
9. Build Student curriculum/Reader/Summaries/Practice/Tests/Models/Personal Data/Progress product.
10. Build Offline/PWA with explicit downloads, revision sync/outbox and 14-day entitlement lease.
11. Execute later performance/security/test/accessibility/content-load/staging/release/production/operations gates.

## Documentation / Continuity Protocol

After every meaningful batch:
- update this log;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when business/roadmap/baseline changes;
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md`;
- update `PRODUCT_FEATURE_PARITY_MATRIX.md` / `MASTER_REBUILD_ROADMAP.md` when decisions alter scope;
- retain exact CI evidence;
- mark unexecuted work `NOT YET VERIFIED`.

## Current State

**Stages 1–10 have verified technical gates. Product Evolution Review Batches 01–03 are recorded. Reader/Search/TTS, Published Question Bank-only Student tests, original-vs-simulation model separation and 14-day Offline policy are now decided at product/architecture level but not yet implemented. Stage 6/8 still require deliberate auth/device refactor; Stage10 still needs Preview sync; OCR/text-first AI and the feature-complete Student/Admin products remain upcoming implementation work.**
