# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, changes, verification and remaining work.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين مترابطين:

- **Student:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص، أسئلة تفاعلية، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات وإنجازات، PWA وOffline.
- **Admin:** إدارة الصفوف والمواد والدروس والمحتوى، الرفع والمعالجة، Gemini/AI generation، الاختبارات والنماذج، أكواد الوصول الكامل وأكواد الصفوف، الحسابات، الإشعارات، التصدير والإعدادات.

الهدف هو بناء أفضل نسخة من **نفس الفكرة والسيناريوهات**. `PRODUCT_FEATURE_PARITY_MATRIX.md` هو بوابة منع إسقاط Feature أو User Flow مهم.

## Source Repositories

### `7eaur/alwaslh`
مرجع الفكرة، السلوك الحالي، Business Rules، User Flows والمشكلات التي يجب ألا تتكرر. **ليس مرجعًا يجب مطابقة قاعدة بياناته أو بنيته الداخلية.**

### `7eaur/alwaslh-go`
مرجع المحتوى والصور: مواد ثالث ثانوي وتاسع، آلاف صفحات الكتب والنماذج الوزارية وملفات فهرسة مساعدة. يعامل كـ **Content Source Repository** يدخل عبر import/normalization pipeline.

## Key Documents

- `PROJECT_DEEP_AUDIT.md`
- `PROJECT_FULL_AUDIT_CATALOG.md`
- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `PROJECT_REBUILD_BLUEPRINT.md`
- `MASTER_REBUILD_ROADMAP.md`
- `packages/brand/BRAND_GUIDELINES.md`
- `docs/ux/UX_ARCHITECTURE.md`
- `DATABASE_PLATFORM_ARCHITECTURE.md`
- `database/SCHEMA.md`
- `database/DATABASE_STAGE_DOD.md`

## Legacy Architecture

```text
Student/Admin Browser
 -> React monolith
 -> AuthContext / AccessContext / page state
 -> direct Supabase + src/db/api.ts
 -> Postgres/RLS/Auth/Storage/Edge Functions
 -> overlapping IndexedDB/localStorage/memory/CacheStorage/SW layers
```

The legacy implementation remains **NO-GO** for production. Its unsafe foundations include authorization, entitlement, credential/recovery, ownership, offline synchronization and AI orchestration.

## Target Architecture

```text
apps/
  admin-web/
  student-web/
  api/                # Stage 5
  workers/            # later AI/background work

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

Runtime topology:

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private / same hosting)
Student PWA ┘       │
                    ├── media/object storage
                    └── background/AI workers
```

Admin/Student never receive database credentials and never connect directly to PostgreSQL.

## User Flows to Preserve

### Full access
`6-digit code -> server validation -> atomic claim -> account/profile -> entitlement -> authorized sync -> dashboard`

### Class access
`7-digit class code -> atomic redemption -> class entitlement -> delta sync`

### Learning
`class -> subject -> lesson -> reader -> summary/practice/notes/saved questions`

### Quiz
`catalog/filter -> quiz/version -> persisted shuffled session -> resume/restart -> completion -> attempt/statistics/achievements`

### Admin
`admin auth -> overview -> content/upload -> AI operations -> quizzes -> students/access -> notifications/reports/settings`

## Audit Findings That Drive the Rebuild

Detailed evidence remains in `PROJECT_FULL_AUDIT_CATALOG.md`.

| ID | Severity | Area | Legacy Problem | Target Status |
|---|---|---|---|---|
| SEC-001 | P0 | Admin auth | anonymous privileged admin-password mutation | **DESIGN ELIMINATED** — no legacy RPC model |
| SEC-002..011 | P0 | Authorization | broad/public RLS and privileged paths | **DESIGN ELIMINATED** — browser has no DB access |
| DATA-015 | P0 | Activation | multi-step/non-transactional | **DB CONTRACT FIXED** — transactional/idempotent target |
| DATA-018 | P0 | Class codes | redemption racy/non-atomic | **DB CONTRACT FIXED** — transactional/idempotent target |
| SEC-015..018 | P1 | Credentials | plaintext/reversible/device assumptions | Stage 6 rebuild; legacy schema not preserved |
| DATA-025 | P1 | Assessment | client-trusted score/achievement | **DB MODEL FIXED**; backend finalization still Stage 6/learning service |
| OFF-* | P1/P2 | Offline | stale/overlapping sync/caches | revision/tombstone target established; engine later |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | durable job schema established; worker platform later |
| MEDIA-* | P1/P2 | Media | page ordering/export defects | stable ordered asset model established; pipeline later |

## Classification

### KEEP
Product idea, required scenarios, React/Vite frontend direction, IndexedDB offline concept, AI-assisted authoring and educational content.

### IMPROVE
Validation/forms/states, UX/accessibility, querying/pagination, media/export, observability, operations.

### REFACTOR
Large feature modules, practice UI/state boundaries, content authoring pipeline.

### REBUILD
Backend API boundary, Auth/Recovery, authorization, entitlement/code redemption service, Student sync/service worker, durable Gemini execution.

### REMOVE
Legacy Supabase coupling, public/direct DB assumptions, legacy IDs as ownership, plaintext/reversible password structures, fingerprint credential proof, unsafe/dead implementation paths.

## Architecture Decisions

### AD-001 — Preserve product, not legacy mistakes
Feature parity applies to user-visible product results and important business scenarios, not internal implementation compatibility.

### AD-002 — Security/data integrity before feature implementation
A feature is not complete if it can be bypassed or creates inconsistent ownership/state.

### AD-003 — Version-controlled database migrations are canonical
Fresh staging/production schema must be reproducible from repository migrations.

### AD-004 — Separate Admin and Student apps
Different bundle/runtime/UX/PWA requirements justify separate apps sharing stable packages.

### AD-005 — One entitlement model
Full/class access maps to normalized entitlements with explicit scope/source/status/start/expiry/revocation.

### AD-006 — Durable AI jobs
Browser creates/observes jobs; server workers execute them. Prompt/schema/semantic validators are versioned.

### AD-007 — Gemini capacity scheduled by provider project
Credentials remain server-side; project quota/cooldown and credential health are separate.

### AD-008 — One Student Sync Engine
Account-scoped authorized replica driven by server content/entitlement revisions and explicit deletions.

### AD-009 — `alwaslh-go` is a content source pipeline
Raw curriculum repository is never bundled directly into frontend applications.

### AD-010 — Owned brand/design system
No Miaoda/TailAdmin product-brand dependency.

### AD-011 — Original identity is evolved, not discarded
The approved brand preserves the first product's teal/open-book DNA with owned canonical assets.

### AD-012 — Self-hosted PostgreSQL on the same hosting
The target database is PostgreSQL in the same hosting environment as backend services. The browser never connects to it directly.

### AD-013 — Clean-slate data model
The old Supabase schema/data is not a compatibility target. Legacy tables, IDs, RLS assumptions and ownership hacks do not constrain the new schema.

### AD-014 — Relational integrity before JSON convenience
Core ownership/order/assessment/entitlement relationships are normalized and constrained in PostgreSQL. JSONB is limited to bounded metadata/config/output payloads.

## Changes Made

### Stage 1 — Product audit / contract
**COMPLETE.** Repository discovery, deep/full audit, Feature Parity Matrix, rebuild blueprint and roadmap completed.

### Stage 2 — Brand Identity
**COMPLETE / PASS.**

Implemented owned brand system based on the original logo:
- canonical mark/primary/horizontal/inverse/monochrome variants;
- favicon and PWA icons;
- teal/ink/mint palette;
- Cairo Arabic baseline;
- design tokens and accessibility usage rules.

Source of truth: `packages/brand/`.

### Stage 3 — UX Architecture
**COMPLETE / PASS.**

Implemented target Admin/Student IA, navigation, feature mapping, critical flows, async/error/offline/permission state contracts, responsive/accessibility contracts and low-fidelity wireframes.

Source of truth: `docs/ux/`.

### Stage 4 — PostgreSQL Data Platform
**COMPLETE / PASS — design/schema baseline.**

Decision:
- self-hosted PostgreSQL;
- same hosting environment as backend;
- private DB boundary;
- no direct frontend/database connection;
- legacy Supabase not used as target.

Implemented:

#### Core curriculum (`database/migrations/0001_core.sql`)
- UUID profiles;
- classes/subjects/subject-class links;
- lesson composite FK ensures subject belongs to class;
- lesson assets with explicit unique stable position and checksum/media metadata.

#### Access (`0002_access.sql`)
- exact six-digit full-access codes;
- exact seven-digit class codes;
- normalized student entitlements;
- partial unique indexes preventing duplicate active entitlement scopes;
- redemption record with idempotency contract.

#### Learning (`0003_learning.sql`)
- quizzes, lessons, versions, questions/options;
- stable UUID question identity;
- at most one correct option in current MCQ/TF contract;
- normalized persisted practice question order;
- normalized persisted shuffled option order;
- answer FK ensures selected option belongs to same question;
- quiz attempts with generated percentage;
- saved questions, achievement definitions/awards, notifications/read state.

#### AI / Offline (`0004_ai_and_sync.sql`)
- durable `ai_jobs`, `ai_job_units`, `ai_outputs`;
- prompt/model/idempotency/progress/attempt/validation metadata;
- `content_revisions`, `content_tombstones`, `sync_checkpoints` for deterministic later offline sync.

#### Operations
- `database/deploy/roles.sql.example` — owner/migrator/app/readonly least-privilege role model;
- `database/BACKUP_RESTORE.md` — daily logical + off-host + restore verification baseline;
- `database/tests/schema_smoke.sql` — structural/constraint smoke suite;
- `database/SCHEMA.md` — human-readable schema map;
- `database/DATABASE_STAGE_DOD.md` — Stage 4 gate.

## Tests & Verification

### PASS / verified from committed source
- Brand Stage DoD.
- UX Stage DoD.
- Domain access/content TypeScript source checks from earlier foundation batch.
- Static review of Stage 4 PostgreSQL relationships/constraints and migration ordering.
- Stage 4 schema smoke test suite is committed.

### NOT YET RUN / VERIFIED
- PostgreSQL migrations on a real database: no PostgreSQL runtime is provisioned in the connected environment.
- `database/tests/schema_smoke.sql` execution: pending real PostgreSQL.
- Actual connection-pool/load/backup-restore measurements.
- Full Admin/Student React/Vite builds.
- Backend API runtime (Stage 5 not implemented yet).
- Auth/recovery runtime (Stage 6).
- AI worker runtime.
- full content-import integrity and real browser performance/accessibility.

No false runtime pass claim is made.

## Known Issues / Remaining Risk

- The database SQL is a pre-production baseline until executed against the target PostgreSQL version.
- Authentication/session schema and credentials are intentionally deferred to Stage 6, so `profiles.auth_subject` is provider-neutral now.
- Quiz finalization must be implemented server-side to derive `correct_count/question_count` from persisted answers; the browser will not be allowed to submit trusted scores.
- Media/object storage implementation remains later; DB only stores canonical storage keys/metadata.
- Experimental Admin/Student shells created before stage-order correction remain scaffolds, not final feature implementation.

## Remaining Work

1. **Stage 5 — Engineering Foundation:** backend API runtime boundary, database driver/pool/migration runner, environment validation, structured logging, typed errors, test harness, reproducible workspace/build/CI.
2. **Stage 6 — Auth & Authorization:** secure account/session/recovery/admin model and API authorization tests.
3. Stage 7 — transactional entitlement/code service.
4. Stage 8/9 — `alwaslh-go` content importer and ordered media pipeline.
5. Stage 10/11 — Gemini prompt contracts, durable workers, retries/failover/observability.
6. Build full Admin product against stable services.
7. Build full Student PWA/Practice/Sync product.
8. Parity/E2E/security/performance/accessibility/staging gates.
9. Production release only after real PostgreSQL runtime, backup restore and release gates pass.

## Current State

**Stages 1–4 are closed at their documented gates. Stage 5 Engineering Foundation is next.**
