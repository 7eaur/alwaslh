# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, changes, verification and remaining work. Detailed legacy evidence remains in `PROJECT_FULL_AUDIT_CATALOG.md`.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين مترابطين:

- **Student:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص، أسئلة تفاعلية، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات وإنجازات، PWA وOffline.
- **Admin:** إدارة الصفوف والمواد والدروس والمحتوى، الرفع والمعالجة، Gemini/AI generation، الاختبارات والنماذج، أكواد الوصول الكامل وأكواد الصفوف، الحسابات، الإشعارات، التصدير والإعدادات.

الهدف هو بناء أفضل نسخة من **نفس الفكرة والسيناريوهات**. `PRODUCT_FEATURE_PARITY_MATRIX.md` هو بوابة منع إسقاط Feature أو User Flow مهم.

### Source repositories

- `7eaur/alwaslh`: مرجع الفكرة، السلوك، Business Rules، User Flows والمشكلات التي يجب ألا تتكرر. **ليس مرجعًا لقاعدة البيانات الجديدة أو للبنية الداخلية.**
- `7eaur/alwaslh-go`: مرجع المحتوى والصور والكتب والنماذج الوزارية. يدخل لاحقًا عبر deterministic import/normalization pipeline ولا يحمّل كـfrontend bundle.

## Target Architecture

```text
apps/
  admin-web/
  student-web/
  api/                  # Stage 5
  workers/              # AI/background stages

packages/
  brand/
  ui/
  domain/
  data/
  validation/
  ai-contracts/
  testing/

database/
  migrations/
  tests/
  deploy/

content/
  import-contracts/
  manifests/
  tooling/
```

Runtime boundary:

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private / same hosting)
Student PWA ┘       │
                    ├── media/object storage
                    └── background/AI workers
```

The browser never receives PostgreSQL credentials and never connects directly to the database.

## User Flows to Preserve

### Full access
`6-digit code -> server validation -> atomic claim -> account/profile -> entitlement -> authorized sync -> dashboard`

### Class access
`7-digit class code -> atomic redemption -> class entitlement -> delta sync`

### Learning
`class -> subject -> lesson -> reader -> summary/practice/notes/saved questions`

### Quiz
`catalog/filter -> quiz/version -> persisted shuffled session -> resume/restart -> completion -> trusted attempt/statistics/achievements`

### Admin
`admin auth -> overview -> content/upload -> AI operations -> quizzes -> students/access -> notifications/reports/settings`

## Audit Findings Driving the Rebuild

| ID | Severity | Area | Legacy problem | Target status |
|---|---|---|---|---|
| SEC-001 | P0 | Admin auth | anonymous privileged password mutation | DESIGN ELIMINATED; legacy RPC model not retained |
| SEC-002..011 | P0 | Authorization | broad/public DB/RLS privilege paths | DESIGN ELIMINATED; browser has no DB access |
| DATA-015 | P0 | Activation | multi-step/non-transactional | DB contract redesigned for transactional/idempotent service |
| DATA-018 | P0 | Class codes | redemption racy/non-atomic | DB contract redesigned for transactional/idempotent service |
| SEC-015..018 | P1 | Credentials | plaintext/reversible/device assumptions | Stage 6 rebuild; old mechanism removed |
| DATA-025 | P1 | Assessment | client-trusted score/ranking | DB model strengthened; server finalization required |
| OFF-* | P1/P2 | Offline | stale/overlapping caches/sync | revision/tombstone target established; engine later |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | durable job schema established; worker/platform later |
| MEDIA-* | P1/P2 | Media | upload page ordering/export defects | stable ordered asset model established; pipeline later |

## Classification

### KEEP
Product idea, required scenarios, React/Vite frontend direction, IndexedDB offline concept, AI-assisted authoring, educational content.

### IMPROVE
Validation/forms/states, UX/accessibility, querying/pagination, media/export, observability and operations.

### REFACTOR
Large feature modules, practice UI/state boundaries, content authoring pipeline.

### REBUILD
Backend API boundary, Auth/Recovery, authorization, entitlement/code service, Student sync/service worker, durable Gemini execution.

### REMOVE
Legacy Supabase coupling, direct/public DB assumptions, legacy IDs as ownership, plaintext/reversible credentials, fingerprint credential proof and verified dead/unsafe implementation paths.

## Architecture Decisions

- **AD-001 — Preserve product, not legacy mistakes.** Feature parity applies to user/business results, not internal implementation compatibility.
- **AD-002 — Security/data integrity before feature implementation.** A feature is not complete if bypassable or inconsistent.
- **AD-003 — Version-controlled migrations are canonical.** Fresh staging must rebuild from repository state.
- **AD-004 — Separate Admin and Student applications.** Different runtime/UX/bundle/PWA requirements.
- **AD-005 — One entitlement model.** Full/class access map to normalized server-side entitlements.
- **AD-006 — Durable AI jobs.** Browser creates/observes; workers execute; prompt/schema/semantic contracts are versioned.
- **AD-007 — Gemini capacity scheduled by provider project.** Credentials remain server-only; project quota/cooldown is distinct from key health.
- **AD-008 — One Student Sync Engine.** Account-scoped authorized replica driven by content/entitlement revisions and deletions.
- **AD-009 — `alwaslh-go` is a content source pipeline.** Raw repository never ships as application assets.
- **AD-010 — Owned brand/design system.** No Miaoda/TailAdmin brand dependency.
- **AD-011 — Original identity is evolved.** Preserve teal/open-book visual DNA.
- **AD-012 — Self-hosted PostgreSQL on same hosting.** Private database boundary behind backend services.
- **AD-013 — Clean-slate data model.** Old Supabase schema/data is not a compatibility target.
- **AD-014 — Relational integrity before JSON convenience.** Core ownership/order/assessment/access relationships are normalized and constrained.
- **AD-015 — CLI verification is mandatory for every stage.** Documentation/design review alone cannot produce a full PASS. Use DESIGN PASS / CLI PASS / RUNTIME PASS / RELEASE PASS and keep unexecuted checks as `NOT YET VERIFIED`.

## Changes Made

### Stage 1 — Product Contract
**CLI PASS.**

- repository/product audit completed;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` established;
- rebuild roadmap and feature-preservation contract established;
- `scripts/verify-product-contract.py` now validates unique/non-empty feature IDs and required capability families.

### Stage 2 — Brand Identity
**CLI PASS.**

Implemented owned identity based on the original turquoise/open-book mark:
- primary/horizontal/inverse/monochrome/white logo assets;
- favicon + PWA 192/512/maskable assets;
- Brand Teal `#00B5A9`, Dark Teal `#007F78`, Brand Ink `#123C43`, Mint `#E6F7F6`, Soft Surface `#F2F4F7`, Charcoal `#1F2937`;
- Cairo primary Arabic typography with Tajawal/Noto fallbacks;
- dark/focus/reduced-motion/touch target tokens;
- `scripts/verify-brand.py` checks asset existence, SVG XML, PNG sizes, JSON contracts and brand/template regressions.

CLI found a real drift where Mint existed in `identity.json` but not CSS. Added canonical `--brand-mint` rather than weakening the gate.

### Stage 3 — UX Architecture
**CLI PASS.**

Implemented:
- Admin operational IA;
- Student five-destination mobile IA;
- legacy-to-target mapping;
- critical Admin/Student flows;
- loading/empty/error/offline/stale/permission/destructive states;
- responsive/navigation/accessibility contracts;
- Admin/Student SVG wireframes;
- UX parity review.

`scripts/verify-ux.py` checks required contracts, coverage rows, product feature-ID inventory, DoD state and SVG validity.

### Stage 4 — PostgreSQL Data Platform
**CLI PASS on PostgreSQL 16.15.**

Decision:
- self-hosted PostgreSQL in same hosting environment as backend;
- private DB; no browser DB connection;
- clean-slate schema; Supabase is not the target.

Canonical migrations:
- `0001_core.sql` — profiles, classes, subjects, subject-class links, lessons, ordered assets.
- `0002_access.sql` — exact 6/7-digit codes, entitlements, redemption/idempotency contract.
- `0003_learning.sql` — quizzes/versions/questions/options, persisted question/option order, answers, attempts, saved questions, achievements, notifications.
- `0004_ai_and_sync.sql` — durable AI jobs/units/outputs and content revision/tombstone/sync checkpoint model.

Integrity guarantees include:
- lesson subject must belong to class through composite FK;
- asset page position unique per lesson;
- answer option must be an option actually presented in the same session/question;
- current practice question belongs to the session;
- quiz attempt profile/session/version/quiz relationships are cross-constrained;
- score percentage generated from counts;
- active entitlement uniqueness constraints.

Operations:
- `database/deploy/roles.sql.example`;
- `database/BACKUP_RESTORE.md`;
- `database/SCHEMA.md`;
- `database/tests/schema_smoke.sql`;
- `database/tests/run.sh`.

## Tests & Verification

### Mandatory policy
See:
- `docs/engineering/CLI_VERIFICATION_GATES.md`
- `docs/engineering/CLI_VERIFICATION_REPORT_2026-08-30.md`
- `.github/workflows/rebuild-stage-verification.yml`

### Final Stage 1–4 run

GitHub Actions run `33285502614` on commit `64ee5bbb9489461583425ffa88e4b294638f4bfc`: **SUCCESS**.

Verified:
- Stage 1 product-contract CLI — PASS.
- Stage 2 brand CLI — PASS.
- Stage 3 UX CLI — PASS.
- Stage 4 clean PostgreSQL 16.15 build — PASS.
- migrations `0001`–`0004` executed with `ON_ERROR_STOP` — PASS.
- `database/tests/schema_smoke.sql` — PASS.
- schema-only `pg_dump` — PASS.
- critical table/constraint/index catalog checks — PASS.

### Failures caught and fixed before final PASS

1. Stage 1 checker initially assumed a fixed table width; matrix has deliberate variable-width sections. Checker fixed while preserving strict ID/non-empty validation.
2. Stage 2 detected Mint token drift between identity JSON and CSS; source tokens fixed.
3. Stage 4 migrations and smoke passed on first DB run, but catalog test expected an obsolete FK name. Test was corrected to the stronger `practice_answers_presented_option_fk` and expanded to verify cross-record attempt/session constraints.

### Still NOT YET VERIFIED / later gates

- Stage 5 full workspace install/lint/typecheck/unit/API/build pipeline.
- actual hosting PostgreSQL connection-pool/load/config/network review.
- actual backup + restore drill on hosting.
- Auth/session/recovery/authorization attack matrix.
- API-level concurrent code redemption.
- object storage/media integration.
- content import integrity for `alwaslh-go`.
- AI golden/retry/failover/cancel/resume runtime.
- Admin/Student browser E2E.
- offline account isolation/delta/outbox/update lifecycle.
- production performance/security/accessibility and release rollback gates.

No unexecuted item is represented as passed.

## Known Issues / Remaining Risk

- Auth/session implementation is intentionally deferred to Stage 6; `profiles.auth_subject` remains provider-neutral.
- Quiz completion service must derive `correct_count/question_count` server-side from persisted answers; browser-provided scores will not be trusted.
- Object storage is not implemented yet; database currently stores canonical keys/metadata only.
- PostgreSQL CI proves schema execution, not actual-host tuning/backup readiness.
- Experimental Admin/Student shells created before stage-order correction are scaffolds, not production feature implementation.
- Legacy application remains NO-GO and is only a behavior/feature reference.

## Remaining Work

1. **Stage 5 — Engineering Foundation:** API runtime, PostgreSQL driver/pool/migration runner, environment validation, structured logging/errors, test harness, lockfile/reproducible workspace and CI for lint/typecheck/unit/API/build.
2. **Stage 6 — Auth & Authorization:** secure accounts/sessions/recovery/admin authorization and attack-matrix tests.
3. **Stage 7 — Entitlement & Codes:** transactional service + concurrency/idempotency tests.
4. **Stage 8/9 — Content & Media:** deterministic `alwaslh-go` importer and ordered media pipeline with checksum/count/order tests.
5. **Stage 10/11 — AI:** prompt contracts, structured/semantic validation, durable workers, retries/failover/observability and golden tests.
6. Full Admin implementation + E2E.
7. Full Student PWA/Practice/Offline implementation + E2E.
8. Performance/security/accessibility/staging/backup/rollback gates.
9. Release only after Feature Parity is fully evidenced.

## Current State

**Stages 1–4 are CLI-verified. Stage 5 Engineering Foundation is next.** Every future stage must prove its own CLI/runtime gates before closure.
