# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture, audit decisions, changes, verification and remaining work.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بواجهتين واضحتين:

- **Student:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، أسئلة تفاعلية، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات وإنجازات، وPWA/Offline.
- **Admin:** إدارة الصفوف والمواد والدروس والمحتوى، الرفع والمعالجة، Gemini/AI generation، الاختبارات والنماذج، أكواد الوصول الكامل وأكواد الصفوف، الحسابات، الإشعارات، التصدير والإعدادات.

الهدف هو نفس المنتج ونفس السيناريوهات المهمة، لكن بتنفيذ أقوى وأوضح وأسرع وأكثر أمانًا. `PRODUCT_FEATURE_PARITY_MATRIX.md` هو بوابة منع إسقاط أي Feature أثناء إعادة البناء.

## Source Repositories

### `7eaur/alwaslh`
مرجع السلوك الحالي، Business Rules، User Flows، الواجهة الحالية، Supabase migrations/functions، وOffline/PWA implementation.

### `7eaur/alwaslh-go`
مرجع المحتوى والصور. تم التحقق من README وهيكل الجذر: 15 مادة لثالث ثانوي وتاسع، نحو 5,552 صورة، كتب مدرسية ونماذج وزارية، وملفات JSON/TXT/XLSX مساعدة. يعامل كـ **Content Source Repository** وليس static frontend assets.

## Key Documents

- `PROJECT_DEEP_AUDIT.md`
- `PROJECT_FULL_AUDIT_CATALOG.md`
- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `PROJECT_REBUILD_BLUEPRINT.md`
- `MASTER_REBUILD_ROADMAP.md`
- `packages/brand/BRAND_FOUNDATION.md`

## Legacy Architecture

```text
Student/Admin Browser
 -> React monolith
 -> AuthContext / AccessContext / page state
 -> direct Supabase + src/db/api.ts
 -> Postgres/RLS/Auth/Storage/Edge Functions
 -> overlapping IndexedDB/localStorage/memory/CacheStorage/SW layers
```

The stack is viable. The unsafe parts are authorization, entitlement, credential/recovery, account ownership, offline synchronization and AI orchestration.

## Target Architecture

```text
apps/
  admin-web/
  student-web/
packages/
  brand/
  ui/
  domain/
  data/
  validation/
  ai-contracts/
  testing/
supabase/
  migrations/
  functions/
  tests/
content/
  import-contracts/
  manifests/
  tooling/
```

- Admin and Student are separate deployable frontend applications.
- Shared code is limited to stable contracts/tokens/primitives.
- Server/database is canonical.
- Student IndexedDB becomes an account-scoped authorized replica.
- `alwaslh-go` flows through deterministic import/normalization tooling.

## User Flows to Preserve

### Full access
`6-digit code -> server validation -> atomic claim -> Auth/profile -> entitlement -> authorized sync -> dashboard`

### Class access
`7-digit class code -> atomic redemption -> class entitlement -> delta sync`

### Learning
`class -> subject -> lesson -> reader -> summary/practice/notes/saved questions`

### Quiz
`catalog/filter -> quiz/version -> shuffled session -> resume/restart -> completion -> attempt/statistics/achievements`

### Admin
`admin auth -> overview -> content/upload -> AI operations -> quizzes -> students/access -> notifications/reports/settings`

## Audit Findings

Detailed evidence is maintained in `PROJECT_FULL_AUDIT_CATALOG.md`.

### P0 / release blockers

| ID | Area | Problem | Status |
|---|---|---|---|
| SEC-001 | Admin auth | anonymous `SECURITY DEFINER sync_admin_password` privilege path | OPEN |
| SEC-002..011 | RLS/AuthZ | broad/public student/code/admin-style policies and service-role migration path | OPEN |
| DATA-015 | Activation | activation is multi-step/non-transactional | OPEN |
| DATA-018 | Class redemption | class redemption is non-atomic/racy | OPEN |

### Important correctness risks

- quiz resume and option-correctness drift;
- client-trusted score/achievement/rank;
- malformed AI response normalization can invent plausible answers;
- saved-question ID collisions and wrong lesson provenance;
- audio note type mismatch;
- schema/statistics drift;
- stale deleted offline content;
- no durable offline attempt outbox;
- service worker can cache Supabase API GETs incorrectly;
- multi-file upload page order can change with async completion order;
- export sanitization/scope/truncation problems.

## Classification

### KEEP
Product idea, important scenarios, React/Vite direction, Supabase platform, IndexedDB offline concept, AI authoring, educational content.

### IMPROVE
Validation/forms/states, design/accessibility, querying/pagination, media/export, observability/documentation.

### REFACTOR
Large pages, domain/data boundaries, practice state, content upload pipeline.

### REBUILD
Auth/Recovery, RLS/Authorization, entitlement/code redemption, student ownership/FKs, Student sync/service worker, durable Gemini jobs/provider orchestration.

### REMOVE
Only verified dead/unsafe implementation paths. Never remove a required user scenario merely to simplify the new UI.

## Architecture Decisions

### AD-001 — No blind whole-project rewrite
Preserve working behavior; rebuild only structurally unsafe foundations.

### AD-002 — No final production migration before DB reality audit
Deployed schema/data/RLS/storage must be inspected and backed up first.

### AD-003 — Version-controlled migrations are canonical
Fresh staging must be reproducible from repository migrations/import tooling.

### AD-004 — Separate Admin and Student apps
Different bundle/runtime/UX/PWA requirements justify two apps in one shared codebase.

### AD-005 — One entitlement model
Full/class/admin/migration access maps to normalized entitlements with explicit scope/source/status/start/expiry/revocation.

### AD-006 — Durable AI jobs
Browser creates/observes; server/queue owns execution. Prompt/schema/semantic validators are versioned.

### AD-007 — Gemini capacity is scheduled by provider project
Credentials remain server-side; project cooldown and credential health are separate concepts.

### AD-008 — One Student Sync Engine
Account + entitlement/content revisions, deterministic delta application including deletions.

### AD-009 — `alwaslh-go` is a source pipeline
Never bundle the raw content repository into Student/Admin applications.

### AD-010 — Product identity is owned and tokenized
No Miaoda branding dependency. Admin is compact/data-oriented; Student is calm/mobile/reading-oriented. Same semantic token system, different product density.

## Changes Made

### Audit & planning branch
- completed deep audit, full catalog, feature parity matrix, rebuild blueprint and master roadmap;
- confirmed `alwaslh-go` content repository role;
- release decision for legacy implementation remains **NO-GO**.

### `rebuild/foundation` — Foundation Batch 1

Added:
- `packages/brand/BRAND_FOUNDATION.md`
- `packages/brand/src/tokens.css`
- `packages/brand/src/tokens.ts`
- `packages/domain/src/access.ts`
- `packages/domain/src/content.ts`
- `packages/validation/src/access.ts`

Implemented:
- owned identity tokens: restrained ink/teal/warm accent, neutral surfaces, semantic states, RTL typography, spacing, radius, elevation, focus, reduced motion and touch-target baseline;
- canonical entitlement/access contract;
- one 6-digit full-access and one 7-digit class-code validation contract with Arabic/Persian digit normalization;
- ordered content-manifest contract where `sourceOrder` is assigned before async processing, preventing completion-order page reordering.

### `rebuild/foundation` — Foundation Batch 2 (current)

Added package boundaries:
- `@alwaslh/brand`
- `@alwaslh/domain`
- `@alwaslh/validation`

Added independent application shells:
- `apps/admin-web` — strict TypeScript + Vite + RTL document shell + operational sidebar/content/AI/access structure.
- `apps/student-web` — strict TypeScript + Vite + RTL/mobile-first shell + lightweight five-item bottom navigation + explicit offline status concept.

Both applications consume shared brand tokens and are not wired to production database APIs yet by design.

## Tests & Verification

### Performed

`packages/domain/src/access.ts` and `packages/domain/src/content.ts` were reproduced from the committed definitions and checked with local TypeScript 5.8.3 using:

```text
--strict --noEmit --target ES2022 --module ESNext --moduleResolution bundler
```

Result: **PASS**.

### NOT YET VERIFIED

- React/Vite application builds;
- Zod validation package runtime/typecheck with installed dependency graph;
- final workspace installation/lockfile;
- deployed Supabase schema/RLS/functions/data/storage;
- production secrets/admin values;
- real browser accessibility/performance;
- full `alwaslh-go` manifest/image integrity.

Local GitHub clone/install remains blocked in the current container because `github.com` DNS resolution is unavailable, so no false build-pass claim is made.

## Known Issues

- Legacy P0/P1 findings remain open until database/backend remediation begins.
- New app shells intentionally contain no production data wiring.
- Temporary textual brand mark is not the final logo.
- package/workspace dependency installation and CI remain to be finalized.

## Remaining Work

1. Finish package/workspace wiring, tests and CI for new apps/packages.
2. As soon as database platform access is connected, produce `DATABASE_REALITY_AUDIT.md` and final RLS/schema map.
3. Build Auth/RLS/Entitlement foundation with DB/integration tests.
4. Build deterministic `alwaslh-go` importer/media pipeline.
5. Build durable Gemini job/provider platform.
6. Build full Admin product against stable contracts.
7. Build full Student PWA/Practice/Sync product against stable contracts.
8. Migrate legacy data/content and run Feature Parity, E2E, security, performance and accessibility gates.
9. Stage, rehearse migration/rollback, then production cutover only after release gates pass.

## Current State

Implementation is now underway on `rebuild/foundation`. The legacy app remains untouched as behavioral reference. No destructive database changes have been made while production database reality is still unverified.
