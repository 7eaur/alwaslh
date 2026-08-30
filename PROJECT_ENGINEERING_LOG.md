# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture, audit decisions, changes, verification and remaining work.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بواجهتين رئيسيتين:

- **Student:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، أسئلة تفاعلية، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات وإنجازات، وPWA/Offline.
- **Admin:** إدارة الصفوف والمواد والدروس والمحتوى، الرفع والمعالجة، Gemini/AI generation، الاختبارات والنماذج، أكواد الوصول الكامل وأكواد الصفوف، الحسابات، الإشعارات، التصدير والإعدادات.

الهدف هو بناء أفضل نسخة من **نفس المنتج** مع Feature Parity كاملة. `PRODUCT_FEATURE_PARITY_MATRIX.md` هو بوابة منع إسقاط أي Feature أو User Flow مهم أثناء إعادة البناء.

## Source Repositories

### `7eaur/alwaslh`
مرجع السلوك الحالي، Business Rules، User Flows، Supabase migrations/functions، والـOffline/PWA implementation.

### `7eaur/alwaslh-go`
مرجع المحتوى والصور: 15 مادة لثالث ثانوي وتاسع، نحو 5,552 صورة، كتب مدرسية ونماذج وزارية، وملفات JSON/TXT/XLSX مساعدة. يعامل كـ **Content Source Repository** وليس static frontend assets.

## Key Documents

- `PROJECT_DEEP_AUDIT.md`
- `PROJECT_FULL_AUDIT_CATALOG.md`
- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `PROJECT_REBUILD_BLUEPRINT.md`
- `MASTER_REBUILD_ROADMAP.md`
- `packages/brand/BRAND_GUIDELINES.md`
- `packages/brand/BRAND_STAGE_DOD.md`

## Legacy Architecture

```text
Student/Admin Browser
 -> React monolith
 -> AuthContext / AccessContext / page state
 -> direct Supabase + src/db/api.ts
 -> Postgres/RLS/Auth/Storage/Edge Functions
 -> overlapping IndexedDB/localStorage/memory/CacheStorage/SW layers
```

The stack is viable. The unsafe foundations are authorization, entitlement, credential/recovery, account ownership, offline synchronization and AI orchestration.

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

| ID | Severity | Area | Problem | Status |
|---|---|---|---|---|
| SEC-001 | P0 | Admin auth | anonymous `SECURITY DEFINER sync_admin_password` privilege path | OPEN |
| SEC-002..011 | P0 | RLS/AuthZ | broad/public student/code/admin-style policies and service-role migration paths | OPEN |
| DATA-015 | P0 | Activation | activation is multi-step/non-transactional | OPEN |
| DATA-018 | P0 | Class codes | redemption is non-atomic/racy | OPEN |
| SEC-015..018 | P1 | Credentials | plaintext/reversible recovery and device credential assumptions | OPEN |
| DATA-025 | P1 | Assessment | score/achievement/rank integrity is client-trusted | OPEN |
| AI-* | P1/P2 | AI | browser-owned jobs, weak structured/semantic validation, retry/quota orchestration gaps | OPEN |
| OFF-* | P1/P2 | Offline | overlapping caches/sync, stale deletions, no durable attempt outbox | OPEN |
| MEDIA-* | P1/P2 | Media | async page-ordering and export correctness/sanitization defects | OPEN |

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
Different bundle/runtime/UX/PWA requirements justify two apps in one shared workspace.

### AD-005 — One entitlement model
Full/class access maps to normalized entitlements with explicit scope/source/status/start/expiry/revocation.

### AD-006 — Durable AI jobs
Browser creates/observes; server/queue owns execution. Prompt/schema/semantic validators are versioned.

### AD-007 — Gemini capacity scheduled by provider project
Credentials remain server-side; project cooldown and credential health are separate concepts.

### AD-008 — One Student Sync Engine
Account + entitlement/content revisions, deterministic delta application including deletions.

### AD-009 — `alwaslh-go` is a source pipeline
Never bundle the raw content repository into Student/Admin applications.

### AD-010 — Product identity is owned and tokenized
No Miaoda/TailAdmin brand dependency. Admin is compact/data-oriented; Student is calm/mobile/reading-oriented.

### AD-011 — Original product identity is evolved, not discarded
The approved brand preserves the first product's recognizable **teal + open-book** DNA while replacing inconsistent/template assets with owned canonical vector assets and tokens.

## Changes Made

### Stage 1 — Audit, product contract and rebuild planning

Completed repository discovery, deep/full audit, Feature Parity Matrix, rebuild blueprint and master roadmap. Legacy release decision remains **NO-GO**.

### Foundation work created before stage-order correction

The isolated `rebuild/foundation` branch already contains experimental package boundaries and independent Admin/Student shells. They remain frozen as implementation scaffolds and must follow the approved identity/UX stages before expansion.

### Stage 2 — Brand Identity — COMPLETE

The original logo supplied by the product owner was analyzed and retained as the identity root: turquoise/teal, rounded app tile, white open-book mark and Arabic-first naming. Old repository `TailAdmin` marks are explicitly rejected as product identity.

Implemented canonical identity assets:

- `packages/brand/assets/logo/logo-mark.svg`
- `packages/brand/assets/logo/logo-mark-white.svg`
- `packages/brand/assets/logo/logo-mark-monochrome.svg`
- `packages/brand/assets/logo/logo-primary.svg`
- `packages/brand/assets/logo/logo-horizontal.svg`
- `packages/brand/assets/logo/logo-horizontal-white.svg`
- `packages/brand/assets/app-icons/favicon.svg`
- `packages/brand/assets/app-icons/icon-192.png`
- `packages/brand/assets/app-icons/icon-512.png`
- `packages/brand/assets/app-icons/icon-maskable.svg`
- `packages/brand/assets/app-icons/icon-maskable-512.png`

Identity contracts/documentation:

- `packages/brand/BRAND_GUIDELINES.md`
- `packages/brand/BRAND_STAGE_DOD.md`
- `packages/brand/ASSET_NOTES.md`
- `packages/brand/brand-assets.json`
- `packages/brand/identity.json`
- `packages/brand/src/tokens.css`
- `packages/brand/src/tokens.ts`

Brand Identity v1 palette:

- Primary Teal `#00B5A9`
- Dark Teal `#007F78`
- Brand Ink `#123C43`
- Mint `#E6F7F6`
- Soft Surface `#F2F4F7`
- Charcoal `#1F2937`

Typography baseline:

- Arabic primary: **Cairo**
- fallback: **Tajawal / Noto Sans Arabic / system sans**

Usage rules:

- gradient is restricted to identity/app-icon use; product UI remains mostly flat;
- minimum body text 16px Student / 14px Admin data surfaces;
- no 8–10px production copy;
- consistent 20/24px line icons;
- focus ring, 44px touch target, reduced motion and unrestricted browser zoom;
- RTL by default;
- Admin uses a denser application of the same identity; Student uses larger spacing and reading-first hierarchy.

**Stage 2 Definition of Done: PASS.**

## Tests & Verification

### Performed

- `packages/domain/src/access.ts` and `packages/domain/src/content.ts`: strict TypeScript source check — **PASS**.
- Brand canonical vector assets were generated and committed.
- PWA 192/512/maskable raster assets were generated from the brand mark and committed.
- GitHub repository listing confirms all expected logo and app-icon files exist on `rebuild/foundation`.
- `BRAND_STAGE_DOD.md` records all Stage 2 gates as passed.

### NOT YET VERIFIED

- React/Vite application builds;
- installed Cairo/Tajawal runtime/font rendering in rebuilt apps;
- full workspace install/lockfile;
- deployed Supabase schema/RLS/functions/data/storage;
- production secrets/admin values;
- real-browser accessibility/performance;
- full `alwaslh-go` manifest/image integrity.

No false build-pass claim is made.

## Known Issues

- Legacy P0/P1 findings remain open until database/backend stages.
- Experimental Admin/Student shells are not production UI and will be revised from Stage 3 UX specifications.
- Database reality is **NOT YET VERIFIED**.
- Brand SVG wordmark uses font-family references; application/deployment font loading must be verified when UI implementation resumes.

## Remaining Work

1. **Stage 3 — UX Information Architecture:** lock Admin/Student IA, navigation, user flows, states and responsive wireframe specifications.
2. When the database platform is connected, run `DATABASE_REALITY_AUDIT.md` before final migrations.
3. Design/rebuild Auth/RLS/Entitlement and ownership with tests.
4. Build deterministic `alwaslh-go` importer/media pipeline.
5. Build durable Gemini job/provider platform.
6. Implement full Admin product from approved UX contracts.
7. Implement full Student PWA/Practice/Sync product from approved UX contracts.
8. Migrate legacy data/content and run parity/E2E/security/performance/accessibility gates.
9. Stage, rehearse rollback/cutover, then release only after all gates pass.

## Current State

**Stage 2 Brand Identity is closed. Stage 3 UX Architecture is next.** The legacy app remains untouched as behavioral reference and no destructive production database changes have been made.
