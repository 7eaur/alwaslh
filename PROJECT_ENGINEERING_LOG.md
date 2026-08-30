# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, changes, verification and remaining work. Detailed legacy evidence remains in `PROJECT_FULL_AUDIT_CATALOG.md`. For continuation context, read `PROJECT_HANDOFF.md` first.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين مترابطين:

- **Student PWA:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص، أسئلة تفاعلية، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات وإنجازات، PWA وOffline.
- **Admin Web:** إدارة الصفوف والمواد والدروس والمحتوى، الرفع والمعالجة، Gemini/AI generation، الاختبارات والنماذج، أكواد الوصول الكامل وأكواد الصفوف، الحسابات، الإشعارات، التصدير والإعدادات.

الهدف هو بناء أفضل نسخة من **نفس الفكرة والسيناريوهات والنتائج للمستخدم**، مع عدم الحفاظ على أخطاء البنية القديمة. `PRODUCT_FEATURE_PARITY_MATRIX.md` هو عقد منع إسقاط Feature أو User Flow مهم.

### Source repositories

- `7eaur/alwaslh`: مرجع الفكرة والسلوك وBusiness Rules وUser Flows والمشكلات التي يجب ألا تتكرر. **ليس مرجعًا للـschema أو internal architecture الجديدة.**
- `7eaur/alwaslh-go`: مرجع المحتوى والصور والكتب والنماذج الوزارية. سيُستهلك لاحقًا عبر deterministic import/normalization pipeline؛ لا يحمّل raw كـfrontend bundle.

## Target Architecture

```text
apps/
  admin-web/
  student-web/
  api/
  workers/              # AI/background stages later
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

Browser never receives PostgreSQL credentials and never connects directly to the database.

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
| SEC-001 | P0 | Admin auth | anonymous privileged password mutation | ELIMINATED by new auth boundary |
| SEC-002..011 | P0 | Authorization | broad/public DB/RLS privilege paths | ELIMINATED; browser has no DB access |
| DATA-015 | P0 | Activation | multi-step/non-transactional | target Stage 8 requires atomic flow |
| DATA-018 | P0 | Class codes | redemption racy/non-atomic | FIXED and runtime-tested in Stage 7 |
| SEC-015..018 | P1 | Credentials | plaintext/reversible/device assumptions | FIXED in Stage 6 |
| DATA-025 | P1 | Assessment | client-trusted score/ranking | schema strengthened; finalization service later |
| OFF-* | P1/P2 | Offline | stale/overlapping caches/sync | revision/tombstone model exists; engine later |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | durable job schema exists; worker/platform later |
| MEDIA-* | P1/P2 | Media | upload page ordering/export defects | stable ordered asset model exists; pipeline later |

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
- **AD-015 — CLI verification is mandatory for every stage.** Documentation/design review alone cannot produce a full PASS. Use DESIGN PASS / CLI PASS / RUNTIME PASS / RELEASE PASS; unexecuted = `NOT YET VERIFIED`.
- **AD-016 — Repository-owned handoff is mandatory.** `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md` and this log must be kept current so a new conversation can resume from repository evidence rather than chat memory.

## Changes Made

### Stage 1 — Product Contract
**CLI PASS.**

- repository/product audit completed;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` established;
- rebuild roadmap and feature-preservation contract established;
- `scripts/verify-product-contract.py` validates unique/non-empty feature IDs and required capability families.

### Stage 2 — Brand Identity
**CLI PASS.**

- evolved the real original teal/open-book identity instead of TailAdmin assets;
- primary/horizontal/inverse/monochrome logo assets;
- favicon + PWA 192/512/maskable assets;
- canonical Brand Teal/Dark Teal/Ink/Mint/Surface/Charcoal palette;
- Cairo primary Arabic typography with Tajawal/Noto fallbacks;
- dark/focus/reduced-motion/touch target tokens;
- `scripts/verify-brand.py` validates assets, SVG XML, PNG sizes, JSON contracts and template regressions.

CLI caught a real Mint-token drift; source tokens were fixed rather than weakening the gate.

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
**CLI/RUNTIME PASS on PostgreSQL 16.**

Decision:
- self-hosted PostgreSQL in same hosting environment as backend;
- private DB; no browser DB connection;
- clean-slate schema; Supabase is not the target.

Canonical migrations now include:
- `0001_core.sql` — profiles, classes, subjects, subject-class links, lessons, ordered assets.
- `0002_access.sql` — exact 6/7-digit code base and entitlement/redemption model.
- `0003_learning.sql` — quizzes/versions/questions/options, persisted question/option order, answers, attempts, saved questions, achievements, notifications.
- `0004_ai_and_sync.sql` — durable AI jobs/units/outputs and content revision/tombstone/sync checkpoint model.
- `0005_auth.sql` — credentials/sessions/recovery/login security support.
- `0006_access_contract.sql` — Stage 7 access durations/auditing/active entitlement uniqueness and strengthened constraints.

Integrity guarantees include:
- lesson subject belongs to class through relational FK;
- asset position unique per lesson;
- answer option must be an option actually presented for same session/question;
- current practice question belongs to session;
- attempt profile/session/version/quiz relationships are cross-constrained;
- score percentage generated from counts;
- active entitlement uniqueness.

Operations:
- `database/deploy/roles.sql.example`;
- `database/BACKUP_RESTORE.md`;
- `database/SCHEMA.md`;
- `database/tests/schema_smoke.sql`;
- `database/tests/run.sh`.

### Stage 5 — Engineering Foundation
**CLI/RUNTIME PASS.**

Implemented:
- real `apps/api` runtime;
- PostgreSQL pool and transaction boundary;
- migration runner and applied-migration tracking;
- idempotent rerun behavior;
- environment validation;
- structured public error envelope/logging foundation;
- reproducible API install/build path;
- lint + strict TypeScript + unit tests + production API build;
- production builds for Admin and Student shells;
- CI stage gate.

Failure caught and fixed:
- new Admin/Student Vite builds were inheriting legacy root PostCSS/Tailwind config. PostCSS configuration was isolated per new application rather than carrying old build coupling forward.

### Stage 6 — Auth & Authorization
**CLI/RUNTIME PASS.**

Implemented and tested:
- salted `scrypt` password hashing server-side;
- random opaque session tokens; persisted form is SHA-256 digest only;
- HttpOnly session cookie;
- role isolation for Admin/Student;
- mutation-origin protection foundation;
- PostgreSQL-backed login attempt/lockout state;
- one-time recovery flow that resets credentials and never reveals original password;
- password change/recovery invalidates existing sessions;
- explicit first-admin CLI bootstrap only; no default/public bootstrap.

Integration gate verifies on PostgreSQL:
- bootstrap works once and refuses repeat;
- login/session lifecycle;
- recovery/reset behavior;
- Student/Admin role isolation.

Strict TypeScript issues in scrypt wrapper/optional types/Fastify test headers were caught and fixed before runtime closure.

### Stage 7 — Access Codes & Entitlements
**CLI/RUNTIME PASS.**

Implemented:
- cryptographically secure 6-digit full-access and 7-digit class-access generation via server cryptography;
- Arabic/Persian digit normalization;
- entitlement duration stored with code;
- transactional row-locked redemption;
- advisory-lock idempotency;
- idempotency lookup bound to the same profile;
- finite renewal extends existing entitlement instead of creating conflicting active grants;
- no-waste rule: class code is not consumed if active full access already covers the student;
- Admin revoke flow;
- access audit events;
- code generation + audit event in the same transaction;
- unique active entitlement constraints.

Integration gate covers:
- code generation;
- Arabic/Persian digits;
- first redemption;
- idempotent replay;
- renewal extension;
- revoke;
- no-waste class code behavior under full access;
- concurrent redemption race proving only one competing claimant succeeds.

Runtime failures caught and fixed before PASS:
1. `durationDays` default had to be made explicit at the TypeScript boundary (`?? 365`).
2. PostgreSQL enum inference in a UNION-based audit insert failed; query was simplified instead of patched with unnecessary complexity.
3. `jsonb_build_object` could not infer duration parameter type; SQL now uses explicit integer typing.
4. code generation/audit was strengthened to be atomic.
5. idempotency ownership was strengthened so another profile cannot obtain a prior result by reusing a known key.

## Tests & Verification

### Mandatory policy
See:
- `docs/engineering/CLI_VERIFICATION_GATES.md`
- `.github/workflows/rebuild-stage-verification.yml`
- `PROJECT_HANDOFF.md`

### Latest verified baseline

- Branch: `rebuild/access-entitlements`
- Commit: `0a7929daf2f79baccca31b8110a6c6e372d49024`
- GitHub Actions run: `33288330856`
- Result: **Stages 1–7 SUCCESS**.

The same full run verified:
- Stage 1 product contract — PASS;
- Stage 2 brand — PASS;
- Stage 3 UX — PASS;
- Stage 4 clean PostgreSQL build/migrations/schema tests — PASS;
- Stage 5 lint/typecheck/unit/API build/migration runner/Admin build/Student build — PASS;
- Stage 6 auth unit + PostgreSQL integration lifecycle/role tests — PASS;
- Stage 7 access unit + migrations/constraints + lifecycle/renewal/idempotency/race integration — PASS.

No unexecuted item is represented as passed.

## Known Issues / Remaining Risk

- Stage 8 Student Activation is not implemented yet.
- Quiz completion service still must derive authoritative result server-side from persisted answers; client scores will not be trusted.
- Object storage/media provider is not implemented yet; DB stores canonical asset keys/metadata contracts only.
- `alwaslh-go` full inventory/import is not yet verified.
- PostgreSQL CI proves clean runtime execution, not actual-host tuning/load/network readiness.
- Real hosting backup + restore drill remains `NOT YET VERIFIED`.
- AI prompt contracts, Gemini workers/failover/golden tests remain `NOT YET VERIFIED`.
- Admin/Student product shells are scaffolds; complete product screens/E2E are not done.
- Offline account-scoped sync/outbox/service-worker lifecycle is not implemented.
- Legacy application remains NO-GO and only a behavior/feature reference.

## Remaining Work

1. **Stage 8 — Student Activation & Account Flow:** first activation, returning student path, atomic account/profile/credential/entitlement creation, activation idempotency/races, invalid/expired/revoked/redeemed-code behavior, session establishment, PostgreSQL integration tests.
2. Content domain/API and deterministic `alwaslh-go` inventory/import.
3. Ordered Media/PDF pipeline with checksum/count/order tests.
4. Admin content management implementation.
5. Versioned AI contracts/Prompt Registry + semantic/golden tests.
6. Durable Gemini workers/retries/failover/cancel/resume/observability + AI Ops.
7. Quiz domain + shared PracticeEngine + trusted completion service.
8. Student reader/quizzes/notes/progress/notifications.
9. Offline Sync Engine + PWA/service worker + attempt outbox.
10. Admin access/student/report/export surfaces.
11. Design-system completion/shared UI/accessibility.
12. Performance/security/observability hardening.
13. Actual-host PostgreSQL tuning/load/network, backup/restore drill, staging, browser E2E, release/rollback gates.
14. Release only after Feature Parity is fully evidenced.

## Documentation / Continuity Protocol

At every meaningful implementation batch:

- update this log with decisions, findings, failures/fixes and verification;
- update `PROJECT_STATUS.md` with the current stage, completed/remaining work, blockers, last build/test and next action;
- update `PROJECT_HANDOFF.md` whenever architecture, business rules, branches/PRs, verified baseline or next-stage scope changes;
- retain exact CI evidence and failed checks/fixes;
- mark anything not actually executed as `NOT YET VERIFIED`.

## Current State

**Stages 1–7 are CLI/runtime verified on the latest Stage 7 baseline. Stage 8 Student Activation & Account Flow is next.**
