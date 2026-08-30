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

### Full access / first activation
`6-digit full code -> server validation/lock -> atomic Student account + credential + entitlement + redemption -> authenticated session -> dashboard`

After first activation the same 6-digit code is the Student **account identifier**, not a secret. Returning authentication requires `identifier + password`.

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
| DATA-015 | P0 | Activation | multi-step/non-transactional | FIXED in Stage 8 backend; integrated UI/E2E pending |
| DATA-018 | P0 | Class codes | redemption racy/non-atomic | FIXED and runtime-tested in Stage 7 |
| SEC-015..018 | P1 | Credentials | plaintext/reversible/device assumptions | FIXED in Stage 6/8 credential design |
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
Backend API boundary, Auth/Recovery, authorization, entitlement/code service, Student activation, Student sync/service worker, durable Gemini execution.

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
- **AD-017 — Full code becomes Student account identifier after first activation.** The original 6-digit full-access code preserves the legacy mental model as the returning identifier, but is never authentication by itself; password + server session are required.
- **AD-018 — Activation account creation is one transaction.** Profile, scrypt credential, all-content entitlement, code ownership/redemption and audit events either commit together or roll back together.
- **AD-019 — Stage integration suites use isolated databases.** Auth, Access and Activation integration gates do not share mutable test state; broad cross-feature E2E belongs to an explicit integration/release gate.

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

Implemented Admin/Student IA, legacy mapping, critical flows, loading/empty/error/offline/permission states, responsive/accessibility contracts, wireframes and UX parity checks. `scripts/verify-ux.py` enforces the documented contracts.

### Stage 4 — PostgreSQL Data Platform
**CLI/RUNTIME PASS on PostgreSQL 16.**

Decision:
- self-hosted PostgreSQL in same hosting environment as backend;
- private DB; no browser DB connection;
- clean-slate schema; Supabase is not the target.

Canonical migrations:
- `0001_core.sql` — profiles, classes, subjects, subject-class links, lessons, ordered assets.
- `0002_access.sql` — exact 6/7-digit code base and entitlement/redemption model.
- `0003_learning.sql` — quizzes/versions/questions/options, persisted question/option order, answers, attempts, saved questions, achievements, notifications.
- `0004_ai_and_sync.sql` — durable AI jobs/units/outputs and content revision/tombstone/sync checkpoint model.
- `0005_auth.sql` — credentials/sessions/recovery/login security support.
- `0006_access_contract.sql` — access durations/auditing/active entitlement uniqueness and strengthened constraints.
- `0007_activation_contract.sql` — one-redemption-per-code DB indexes, stronger redeemed ownership constraints and `account_activated` auth event.

Integrity guarantees include relational lesson ownership/order, persisted practice ordering, answer/session cross-record constraints, server-generated score percentage, active-entitlement uniqueness and one access redemption per individual code.

Operations include DB role template, backup/restore runbook, schema documentation and clean-PostgreSQL smoke tests.

### Stage 5 — Engineering Foundation
**CLI/RUNTIME PASS.**

Implemented real `apps/api`, PostgreSQL pool/transactions, migration runner/idempotency, environment validation, error/logging foundation, strict TypeScript/unit/build path, separate Admin/Student production builds and CI.

Failure caught and fixed: new apps inherited legacy root PostCSS/Tailwind config; new application PostCSS boundaries were isolated.

### Stage 6 — Auth & Authorization
**CLI/RUNTIME PASS.**

Implemented and tested:
- salted `scrypt` password hashing server-side;
- random opaque session tokens; persisted form is SHA-256 digest only;
- HttpOnly session cookie;
- role isolation for Admin/Student;
- mutation-origin protection foundation;
- PostgreSQL-backed login attempt/lockout state;
- one-time recovery/reset that never reveals original password;
- password reset invalidates existing sessions;
- explicit first-admin CLI bootstrap only; no default/public bootstrap.

Integration gate verifies bootstrap once/refusal on repeat, login/session lifecycle, recovery/reset and Student/Admin role isolation.

Strict TypeScript issues in scrypt wrapper/optional types/Fastify test headers were caught and fixed before runtime closure.

### Stage 7 — Access Codes & Entitlements
**CLI/RUNTIME PASS.**

Implemented secure 6/7 digit generation, Arabic/Persian normalization, duration per code, row-locked transactional redemption, profile-bound idempotency, finite renewal extension, no-waste Class behavior under Full access, revoke, audit events and active-entitlement uniqueness.

Integration gate covers generation, Arabic digits, first redemption, replay, renewal, revoke, no-waste and concurrent competing redemption.

Runtime failures caught and fixed before PASS:
1. `durationDays` default made explicit at TypeScript boundary.
2. PostgreSQL enum inference in UNION audit insert failed; query simplified.
3. `jsonb_build_object` parameter got explicit integer type.
4. code generation + audit made atomic.
5. idempotency ownership bound to same profile.

### Stage 8 Backend — Student Activation & Account Flow
**CLI/RUNTIME PASS for backend; Stage 8 overall remains IN PROGRESS pending parallel UI + integrated E2E.**

Branch/PR:
- `rebuild/student-activation-backend`
- PR #6 stacked on `rebuild/access-entitlements`.

Canonical API contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

Implemented:
- `POST /v1/student/activate` accepting 6-digit Full code + password + stable idempotency key;
- original Full code becomes normalized returning account identifier;
- Arabic/Persian digit normalization;
- cheap code preflight before expensive password hashing;
- second code validation under `FOR UPDATE` inside transaction;
- Student profile creation;
- salted scrypt credential creation;
- all-content entitlement creation from the code duration;
- redeemed-code ownership binding;
- access redemption/idempotency record;
- access and auth audit events;
- post-commit session establishment through canonical `AuthService.login`;
- idempotent replay returns same account/entitlement but still requires password proof before a fresh session;
- safe returning login through existing `/v1/auth/login`;
- recovery stays reset-only and never reveals original password.

Migration `0007_activation_contract.sql` adds:
- `ux_access_redemptions_full_code_once`;
- `ux_access_redemptions_class_code_once`;
- redeemed state requires both timestamp and owner profile;
- `account_activated` auth audit event.

Stage 8 integration test verifies:
- missing code rejected with no account;
- revoked and time-expired code rejected;
- Arabic-digit activation succeeds;
- session immediately authenticates Student;
- entitlement is visible after activation;
- password stored only as scrypt hash;
- code is bound/redeemed exactly once;
- activation/login audit events exist;
- wrong-password replay does not receive session;
- correct idempotent replay returns same profile/entitlement;
- idempotency key cannot be reused with another code;
- already-used code with new key fails;
- logout then returning login with Arabic digits works;
- concurrent activation race yields one success and one conflict, one account and one redemption;
- an artificial credential-identifier conflict rolls back profile creation and leaves code unconsumed.

Failures/quality findings caught while closing Stage 8 backend:
1. First Stage 8 CI run failed Biome import ordering/formatting only; source was formatted without weakening lint.
2. Next full run showed Stage 8 itself green but Stage 6 red because Stage 6's broad `test:integration` command picked up Auth + Access + Activation tests concurrently against one mutable DB. Activation test observed unrelated profile rows (`8 !== 5`). This was a **test-isolation defect, not an Auth regression**.
3. CI now runs `auth.integration.test.ts`, `access.integration.test.ts` and `activation.integration.test.ts` in their stage-specific PostgreSQL databases. The next full run was green.

## Tests & Verification

### Mandatory policy
See:
- `docs/engineering/CLI_VERIFICATION_GATES.md`
- `.github/workflows/rebuild-stage-verification.yml`
- `PROJECT_HANDOFF.md`

### Latest verified backend baseline

- Branch: `rebuild/student-activation-backend`
- Commit: `a87c7f766481708e018dcaa1ae6e6643c0667fef`
- GitHub Actions run: `33289741640`
- Result: **Stages 1–8 backend jobs SUCCESS**.

The full run verifies:
- Stage 1 product contract — PASS;
- Stage 2 brand — PASS;
- Stage 3 UX — PASS;
- Stage 4 clean PostgreSQL build/migrations/schema tests — PASS;
- Stage 5 lint/typecheck/unit/API build/migration runner/Admin build/Student build — PASS;
- Stage 6 auth unit + isolated PostgreSQL auth lifecycle/role tests — PASS;
- Stage 7 access unit + migrations/constraints + isolated lifecycle/renewal/idempotency/race integration — PASS;
- Stage 8 activation lint + strict typecheck + unit suite + migrations/invariants + isolated atomicity/replay/session/race integration — PASS.

No unexecuted item is represented as passed.

## Known Issues / Remaining Risk

- **Stage 8 overall is not complete:** parallel Student Activation UI and combined browser E2E are `NOT YET VERIFIED` in this branch.
- API/reverse-proxy activation perimeter rate limiting remains a later security gate; the six-digit business code has intentionally limited entropy and must be protected operationally.
- Quiz completion service still must derive authoritative results server-side; client scores will not be trusted.
- Object storage/media provider is not implemented yet.
- `alwaslh-go` full inventory/import is not yet verified.
- PostgreSQL CI proves clean runtime execution, not actual-host tuning/load/network readiness.
- Real hosting backup + restore drill remains `NOT YET VERIFIED`.
- AI prompt contracts, Gemini workers/failover/golden tests remain `NOT YET VERIFIED`.
- Admin/Student learning product shells are not complete product implementations.
- Offline account-scoped sync/outbox/service-worker lifecycle is not implemented.
- Legacy application remains NO-GO and only a behavior/feature reference.

## Remaining Work

1. **Finish Stage 8:** verify parallel `rebuild/student-activation-ui`, reconcile to `docs/api/STUDENT_ACTIVATION_CONTRACT.md`, integrate Backend + UI and run combined lint/typecheck/tests/build + browser/API E2E for activation/login/recovery states.
2. **Stage 9:** Content model/API and deterministic `alwaslh-go` inventory/import.
3. **Stage 10:** Ordered Media/PDF pipeline with checksum/count/order tests.
4. **Stage 11:** Versioned AI contracts/Prompt Registry + semantic/golden tests.
5. **Stage 12:** Durable Gemini workers/retries/failover/cancel/resume/observability + AI Ops.
6. Admin product implementation.
7. Student learning product + reader/quizzes/notes/progress/notifications.
8. Shared PracticeEngine + trusted completion service.
9. Offline Sync Engine + PWA/service worker + attempt outbox.
10. Reports/exports, performance/security/observability/accessibility hardening.
11. Actual-host PostgreSQL tuning/load/network, backup/restore drill, staging, browser E2E, release/rollback gates.
12. Release only after Feature Parity is fully evidenced.

## Documentation / Continuity Protocol

At every meaningful implementation batch:

- update this log with decisions, findings, failures/fixes and verification;
- update `PROJECT_STATUS.md` with current stage, completed/remaining work, blockers, last build/test and next action;
- update `PROJECT_HANDOFF.md` whenever architecture, business rules, branches/PRs, verified baseline or next-stage scope changes;
- keep `MASTER_REBUILD_ROADMAP.md` numbering synchronized with actual staged execution;
- retain exact CI evidence and failed checks/fixes;
- mark anything not actually executed as `NOT YET VERIFIED`.

## Current State

**Stages 1–7 are complete and CLI/runtime verified. Stage 8 Backend is CLI/runtime verified; Stage 8 remains active until the parallel Student Activation UI and combined E2E are green. Do not start Stage 9 before that integration gate closes.**
