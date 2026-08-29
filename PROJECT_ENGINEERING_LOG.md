# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture, audit decisions, changes, verification and remaining work.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بواجهتين واضحتين:

- **Student:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، أسئلة تفاعلية، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات وإنجازات، وPWA/Offline.
- **Admin:** إدارة الصفوف والمواد والدروس والمحتوى، الرفع والمعالجة، Gemini/AI generation، الاختبارات والنماذج، أكواد الوصول الكامل وأكواد الصفوف، الحسابات، الإشعارات، التصدير والإعدادات.

الهدف ليس تغيير فكرة المنتج، بل إعادة بناء الأجزاء الخطرة أو غير القابلة للصيانة مع الحفاظ على **Feature Parity** كاملة وتحسين UX، الأداء، الأمان، وقابلية التطوير.

## Source Repositories

### `7eaur/alwaslh`
مرجع السلوك الحالي، Business Rules، User Flows، الواجهة الحالية، Supabase migrations/functions، وOffline/PWA implementation.

### `7eaur/alwaslh-go`
مرجع المحتوى والصور. تم التحقق من README وهيكل الجذر: المستودع يحتوي 15 مادة لثالث ثانوي وتاسع، نحو 5,552 صورة، كتب مدرسية ونماذج وزارية، وملفات فهرسة JSON/TXT/XLSX. سيعامل كـ **Content Source Repository** وليس كـ static assets داخل bundle.

## Audit Documents

- `PROJECT_DEEP_AUDIT.md` — deep production-readiness audit.
- `PROJECT_FULL_AUDIT_CATALOG.md` — expanded issue catalog across security/data/frontend/AI/offline/media/performance/UX/deployment/QA.
- `PRODUCT_FEATURE_PARITY_MATRIX.md` — canonical feature-preservation gate.
- `PROJECT_REBUILD_BLUEPRINT.md` — target technical architecture.
- `MASTER_REBUILD_ROADMAP.md` — end-to-end execution plan from product freeze and identity through staging/release.

## Current Architecture

```text
Student/Admin Browser
  -> React 18 + React Router
  -> AuthContext / AccessContext / page state
  -> direct Supabase calls + src/db/api.ts
     -> Postgres + RLS
     -> Supabase Auth
     -> Storage
     -> Edge Functions -> service role / AI integration
  -> offline layer
     -> IndexedDB (Dexie)
     -> localStorage / memory caches
     -> CacheStorage / manual service worker
```

This stack is viable, but the current authorization, entitlement, account ownership, offline sync and AI job orchestration are not production-grade.

## Target Architecture

```text
apps/
  admin-web/
  student-web/

packages/
  ui/
  brand/
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

- `admin-web`: operational, data-dense Admin product.
- `student-web`: lightweight mobile-first PWA with its own offline/runtime lifecycle.
- Shared packages: brand, UI primitives, domain contracts, validation, data access contracts, AI schemas and testing helpers only.
- Server/database remains canonical; Student IndexedDB becomes an account-scoped authorized replica.

## User Flows to Preserve

### Student full-access activation
`6-digit code -> server validation/rate limit -> atomic claim -> Auth account/session -> profile -> entitlement -> device/local bootstrap -> authorized sync -> dashboard`

### Returning student
`session restore / account login -> entitlement verification -> local authorized replica -> dashboard/offline`

### Class activation
`7-digit class code -> atomic server redemption -> entitlement -> delta sync -> class available`

### Learning
`class -> subject -> lesson -> reader -> summary/practice/notes/saved questions`

### Quiz
`catalog/filter -> quiz/version -> shuffled practice session -> resume/restart -> completion -> attempt/statistics/achievements`

### Admin
`admin auth -> overview -> content/upload -> AI operations -> quizzes -> students/access codes -> notifications/reports/settings`

## Critical Audit Findings

### P0

| ID | Area | Problem | Status |
|---|---|---|---|
| SEC-001 | Admin auth | anonymous `SECURITY DEFINER sync_admin_password` privilege path | OPEN |
| SEC-002..011 | RLS/AuthZ | public/broad access to codes/student/admin-style data and service-role migration path | OPEN |
| DATA-015 | Activation | activation is multi-step and non-transactional | OPEN |
| DATA-018 | Class redemption | class redemption is non-atomic/racy | OPEN |

### P1 examples

- plaintext/reversible student password flows and original-password recovery/reveal.
- UI/local entitlement is stronger than server entitlement enforcement.
- fingerprint/device signature is treated as credential proof.
- `analyze-lesson` lacks verified app-level admin authorization.
- public content/media policies require explicit product decision and entitlement design.
- client can supply score/achievement state; rank integrity is forgeable.

## Major Correctness Findings

- quiz resume state can misalign current/answered state.
- `shuffleOptions()` derives correct answer through option text `indexOf`, unsafe with duplicate text.
- malformed AI responses can be normalized into plausible fabricated answers.
- local saved-question IDs can collide between lessons.
- multi-lesson quiz bookmarks can be attached to the first lesson.
- audio note can be classified as image.
- statistics/achievement UI does not match schema.
- deleted server content can remain in offline stores.
- failed offline attempts have no durable outbox despite promised later sync.
- service-worker logic can cache Supabase GET/API traffic as if it were image content.
- lesson upload `processFiles()` pushes concurrently completed files and can reorder multi-file pages.
- export paths interpolate dynamic content and one image-only mode silently exports only the first two images.

## Architecture / Duplication Findings

- `src/db/api.ts` is a mixed God facade.
- giant Admin/Student page modules combine data, business logic, rendering and side effects.
- duplicate AuthContext implementations and overlapping legacy auth/recovery helpers.
- multiple caching systems and preload/sync paths without one canonical invalidation model.
- no shared Practice Engine.
- duplicate image components and compression implementations.
- error handling can convert auth/schema/server failures into empty/offline-looking data.

## AI / Gemini Findings

Current generation capability is retained, not removed. The implementation will be rebuilt around:

- versioned `PromptRegistry` preserving each existing generation rule;
- structured JSON schema + runtime validation + semantic validation;
- durable `ai_jobs` / `ai_job_units` instead of browser-owned long jobs;
- bounded worker concurrency and resumable/cancellable operations;
- provider adapter and credential/project pool;
- retry/backoff/circuit-breaker/cooldown and health tracking;
- prompt/model/version metadata stored with generated results;
- golden Arabic/scientific/religious/exam regression dataset;
- AI Operations dashboard for queue/progress/failures/retries/cancel.

Important quota decision: capacity scheduling is by Gemini **project**, not simply by API key. Multiple keys may be supported for rotation/credential isolation, but same-project keys are not treated as independent quota pools.

## Content Architecture Decision

`alwaslh-go` becomes a source-of-content pipeline:

```text
alwaslh-go files
 -> discover manifests/indexes
 -> normalize school stage / subject / book / exam set / page metadata
 -> deterministic page ordering
 -> checksum/dedupe
 -> optimize display + AI variants
 -> upload to canonical storage
 -> write content manifest/database records
 -> verify counts/order/checksums
```

Original repository is not loaded directly by Student runtime and will not be bundled into the frontend.

## Classification

### KEEP
- product idea and scenarios;
- React/Vite direction;
- Supabase platform;
- IndexedDB offline concept;
- AI-assisted authoring;
- current educational content.

### IMPROVE
- validation/forms/states;
- design system and accessibility;
- pagination/querying;
- exports/media optimization;
- documentation/observability.

### REFACTOR
- large feature pages;
- domain/data boundaries;
- practice UI/state;
- content upload workflow.

### REBUILD
- Auth/Recovery;
- RLS/Authorization;
- entitlement/code redemption;
- student ownership/FKs;
- Student sync engine/service worker;
- Gemini durable job/provider orchestration.

### REMOVE
Only confirmed dead/unsafe implementation paths after caller verification; never remove a required user scenario merely to simplify the new UI.

## Architecture Decisions

### AD-001 — No blind whole-project rewrite
Preserve working product behavior and rebuild only foundations that are structurally unsafe or incompatible with the target product.

### AD-002 — Security precedes production data migrations
No destructive/final migration until deployed database reality is inspected and backed up.

### AD-003 — Migrations are reproducible source of truth
A fresh staging database must be constructible solely from version-controlled migrations and seed/import tooling.

### AD-004 — Separate Admin and Student frontend applications
Admin and Student have different runtime, bundle, UX, security and PWA needs; keep them in one workspace with shared contracts/tokens rather than one monolithic app.

### AD-005 — One canonical entitlement model
Full access and class access become normalized server-side entitlements with explicit scope/source/status/start/expiry/revocation.

### AD-006 — Durable server-side AI jobs
Browser creates/observes jobs; server/queue owns execution. Prompts, schemas and semantic validators are versioned contracts.

### AD-007 — Gemini capacity grouped by project
Credentials are server-only. Scheduler tracks project-level capacity/cooldown and credential health separately.

### AD-008 — One Student Sync Engine
Server is canonical. IndexedDB replica is scoped by account + entitlement/content revisions and applies additions, updates and deletions deterministically.

### AD-009 — `alwaslh-go` is a content source, not app assets
Build import/normalization tooling and canonical storage manifests; do not ship the repository itself in frontend bundles.

## Execution Log

### Phase 1 — Repository Discovery
Completed initial project map and major flow inspection.

### Phase 2 — Deep Audit
Completed static production-readiness review and expanded full issue catalog. Release decision remains **NO-GO** for the current implementation.

### Phase 3 — Feature Parity & Rebuild Planning
Completed:
- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- `PROJECT_REBUILD_BLUEPRINT.md`
- `MASTER_REBUILD_ROADMAP.md`
- verification of `alwaslh-go` as the content source repository.

### Phase 4 — Implementation Foundation
**STARTED 2026-08-30.**

Execution order:
1. freeze contracts/features;
2. establish implementation branch/workspace foundation;
3. brand/design tokens and shared domain/validation contracts that do not depend on production schema;
4. once database platform is connected, run Database Reality Audit before final RLS/data migrations;
5. then backend security/entitlement foundation, AI platform, Admin, Student, migration, staging and release.

## Tests & Verification

### Runtime/build
`NOT YET VERIFIED` in this connected GitHub environment. No build/test pass claim is made.

### Source verified
- major existing routes/features/flows;
- major migrations/RLS and auth/AI functions already cited in audit docs;
- key quiz/offline/media/export correctness defects;
- repository QA/build configuration;
- `alwaslh-go` top-level content structure and documented inventory.

### NOT YET VERIFIED
- deployed Supabase schema/policies/functions/data;
- production secrets/admin credential;
- storage inventory and production data volume;
- current deployed worker/proxy role;
- runtime/browser performance/accessibility;
- exact integrity of every image/manifest in `alwaslh-go` (pipeline verification pending).

## Known Issues
See `PROJECT_FULL_AUDIT_CATALOG.md`. P0/P1 findings are release blockers.

## Remaining Work
1. Complete implementation foundation and brand contracts.
2. Connect database platform and produce `DATABASE_REALITY_AUDIT.md`.
3. Build tested Auth/RLS/Entitlement foundation.
4. Build content import pipeline for `alwaslh-go`.
5. Build durable Gemini platform.
6. Build new Admin and Student apps against stable contracts.
7. Run migration/parity/E2E/performance/accessibility/staging gates.
8. Production cutover only after all release gates pass.
