# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, audit findings, implementation history, verification evidence and remaining work. Read `PROJECT_HANDOFF.md` first for continuation context.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين مترابطين لكن منفصلين في runtime وUX:

- **Student PWA:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص/Practice، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات/إنجازات، Offline/PWA.
- **Admin Web:** إدارة المحتوى والرفع والمعالجة، Gemini/AI generation، Quiz Builder، الطلاب، Full/Class access codes، الإشعارات، التقارير، التصدير والإعدادات.

الهدف هو بناء أفضل نسخة من **نفس الفكرة والسيناريوهات والنتائج للمستخدم** مع إزالة أخطاء التنفيذ القديم. `PRODUCT_FEATURE_PARITY_MATRIX.md` هو عقد منع إسقاط Feature أو User Flow مهم.

### Source repositories

- `7eaur/alwaslh`: مرجع Business Rules / User Flows / legacy behavior والمشكلات التي يجب ألا تتكرر؛ ليس مرجعًا للـschema أو internal architecture الجديدة.
- `7eaur/alwaslh-go`: canonical curriculum/media source input. يجب استهلاكه لاحقًا عبر deterministic import/normalization pipeline؛ لا يُشحن raw داخل frontend.

## Target Architecture

```text
apps/
  admin-web/
  student-web/
  api/
  workers/
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
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    └── background / AI workers
```

Browser never receives PostgreSQL credentials and never connects directly to the database.

## User Flows to Preserve

### Full access / first activation

```text
6-digit Full Code
→ server validation + lock
→ atomic Student profile + credential + entitlement + redemption
→ authenticated HttpOnly session
→ authorized Student experience
```

After first activation the same 6-digit Full Code becomes the Student **account identifier**, not a secret. Returning authentication requires `identifier + password`.

### Class access

```text
7-digit Class Code
→ atomic redemption
→ class entitlement
→ authorized content delta
```

### Learning

`class → subject → lesson → reader → summary/practice/notes/saved questions`

### Quiz

`catalog/filter → quiz/version → persisted shuffled session → resume/restart → trusted completion → attempts/statistics/achievements`

### Admin

`admin auth → overview → content/upload → AI operations → quizzes → students/access → notifications/reports/settings`

## Audit Findings

| ID | Severity | Area | Problem | Evidence / Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged password mutation | Admin identity could be compromised | Explicit server-side Auth + Admin bootstrap only | FIXED / Stage 6 runtime verified |
| SEC-002..011 | P0 | Authorization | Broad/public legacy DB privilege paths | Browser could bypass intended service rules | Browser has no direct DB access; backend owns authorization | ELIMINATED by target architecture |
| DATA-015 | P0 | Activation | Legacy activation was multi-step/non-transactional | Partial account/code states and duplicate races possible | Single atomic activation transaction + idempotency + locks | FIXED / Stage 8 PostgreSQL + Chromium verified |
| DATA-018 | P0 | Class Codes | Redemption was racy/non-atomic | Competing or wasted redemption possible | Row locks + idempotency + no-waste rules | FIXED / Stage 7 runtime verified |
| SEC-015..018 | P1 | Credentials | Plaintext/reversible/device credential assumptions | Account compromise and unsafe recovery | Salted scrypt + opaque sessions + reset-only recovery | FIXED / Stages 6–8 verified |
| CI-005-001 | P1 | Production API | Build emitted `dist/src/server.js` while `npm start` required `dist/server.js` | Production runtime could not start despite green compile | Runtime-only `tsconfig.build.json` with `rootDir: src` | FIXED / Stage 8 browser gate verified |
| CI-008-001 | P2 | Test Isolation | Auth/Access/Activation suites shared mutable DB when run broadly | Cross-stage false failures and nondeterminism | Stage-specific integration files + isolated PostgreSQL DBs | FIXED / full CI verified |
| CI-008-002 | P2 | Test Architecture | Vitest collected Playwright E2E file | Unit build gate failed before browser gate | Scope Vitest to `src`; Playwright remains separate suite | FIXED / full CI verified |
| DATA-025 | P1 | Assessment | Legacy client-trusted score/ranking | Browser could forge trusted learning outcomes | Server-derived Practice/attempt finalization | REMAINING — later Practice/Statistics stages |
| OFF-* | P1/P2 | Offline | Legacy stale/overlapping caches/sync | Cross-account/stale content risk | One account-scoped revision/tombstone/outbox Sync Engine | REMAINING — Stage 16 |
| AI-* | P1/P2 | AI | Browser-owned jobs and weak semantic validation | Reliability/quota/quality failures | Durable server jobs + versioned prompt/schema/semantic contracts | REMAINING — Stages 11–12 |
| MEDIA-* | P1/P2 | Media | Completion-order page reordering and export defects | Educational pages can be persisted/displayed out of order | Deterministic ordered media pipeline | REMAINING — Stage 10 |
| CONTENT-009-001 | P1 | Content Import | Full `alwaslh-go` inventory/import integrity not yet proven | Missing/duplicate/misordered source pages could enter canonical DB | Complete inventory + deterministic parser/order/checksum/report gate | OPEN — Stage 9 |

## Classification

### KEEP
Product idea, required user scenarios, React/Vite direction, PostgreSQL target, IndexedDB offline concept, AI-assisted authoring and educational content sources.

### IMPROVE
Validation/forms/states, UX/accessibility, pagination/querying, media/export, observability and operations.

### REFACTOR
Large feature modules, practice UI/state boundaries and content authoring pipeline.

### REBUILD
Backend API boundary, Auth/Recovery, authorization, entitlement/code service, Student activation, Sync/Service Worker and durable Gemini execution.

### REMOVE
Legacy Supabase coupling, browser-direct DB assumptions, plaintext/reversible credentials, fingerprint credential proof, inherited template branding and verified dead/unsafe implementation paths.

## Architecture Decisions

- **AD-001 — Preserve product, not legacy mistakes.** Feature parity applies to user/business results, not internal implementation compatibility.
- **AD-002 — Security/data integrity before features.** A feature is not complete if bypassable or internally inconsistent.
- **AD-003 — Version-controlled migrations are canonical.** Fresh environments rebuild from repository state.
- **AD-004 — Separate Admin and Student applications.** Their runtime, bundle, UX and PWA needs differ.
- **AD-005 — One normalized entitlement model.** Full/Class access map to server-side entitlements.
- **AD-006 — Durable AI jobs.** Browser creates/observes; workers execute; prompt/schema/semantic contracts are versioned.
- **AD-007 — Gemini capacity scheduled by provider project.** Credentials stay server-only; project quota/cooldown is distinct from individual key health.
- **AD-008 — One Student Sync Engine.** Account-scoped authorized replica driven by revisions/tombstones/outbox.
- **AD-009 — `alwaslh-go` is a content source pipeline.** Raw repository never ships as app assets.
- **AD-010 — Owned brand/design system.** No Miaoda/TailAdmin production identity dependency.
- **AD-011 — Original identity is evolved.** Preserve teal/open-book visual DNA.
- **AD-012 — Self-hosted PostgreSQL behind Backend.** Private database boundary; browser never connects directly.
- **AD-013 — Clean-slate data model.** Old Supabase schema/data is not a compatibility target.
- **AD-014 — Relational integrity before JSON convenience.** Ownership/order/access/assessment relationships are normalized and constrained.
- **AD-015 — Executable verification is mandatory.** Documentation/design alone cannot produce a full PASS.
- **AD-016 — Repository-owned handoff is mandatory.** Handoff/status/log stay current so continuation never depends on chat memory.
- **AD-017 — Full Code becomes Student identifier after first activation.** It preserves the product mental model but is never authentication by itself.
- **AD-018 — Activation account creation is one transaction.** Profile, credential, entitlement, redemption ownership and audit commit or roll back together.
- **AD-019 — Stage integration suites use isolated databases.** Broad cross-feature flows live in explicit integration/browser gates.
- **AD-020 — Unit, integration and browser E2E suites are explicitly separated.** Test discovery must not make one runner execute another runner's suite.
- **AD-021 — Production build output must match the runtime start contract.** Tests are typechecked but are not emitted into the production runtime tree.
- **AD-022 — Stage 8 closes only with a real cross-boundary browser test.** A green backend plus a green frontend build is insufficient for activation/session/cookie/recovery correctness.
- **AD-023 — Stage 9 import order is source-derived and deterministic.** Async completion order must never define curriculum page order.

## Changes Made

### Stage 1 — Product Contract
**CLI PASS.**

- repository/product audit completed;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` established;
- `scripts/verify-product-contract.py` validates stable feature IDs and required capability families.

### Stage 2 — Brand Identity
**CLI PASS.**

- evolved the real original teal/open-book identity;
- owned logo/PWA assets and canonical design tokens;
- Arabic typography/accessibility/focus/reduced-motion/touch contracts;
- automated brand validator.

A real Mint token drift was caught and fixed at source rather than weakening the gate.

### Stage 3 — UX Architecture
**CLI PASS.**

Admin/Student IA, legacy mapping, critical flows, loading/empty/error/offline/permission states, responsive/accessibility contracts, wireframes and parity checks are documented and validated.

### Stage 4 — PostgreSQL Data Platform
**CLI/RUNTIME PASS on PostgreSQL 16.**

Canonical migrations:

- `0001_core.sql`
- `0002_access.sql`
- `0003_learning.sql`
- `0004_ai_and_sync.sql`
- `0005_auth.sql`
- `0006_access_contract.sql`
- `0007_activation_contract.sql`

The schema constrains identity ownership, curriculum relations/order, access/redemption, practice ordering/cross-record validity, auth/session/recovery and activation invariants.

### Stage 5 — Engineering Foundation
**CLI/RUNTIME PASS.**

Implemented real API runtime, PostgreSQL pool/transactions, migration runner/idempotency, env validation, logging/public errors, strict TypeScript, unit/build paths, isolated Admin/Student builds and CI.

Failures found and fixed:

1. legacy root PostCSS/Tailwind leaked into new apps → app boundaries isolated;
2. later Stage 8 browser E2E proved the production API compile/start contract was inconsistent → `apps/api/tsconfig.build.json` now emits only `src` to `dist`, producing the expected `dist/server.js`.

### Stage 6 — Auth & Authorization
**CLI/RUNTIME PASS.**

Implemented salted `scrypt`, opaque sessions with SHA-256 persisted token digests, HttpOnly cookie, role isolation, mutation Origin protection, DB-backed lockout, one-time reset-only recovery/session invalidation and explicit first Admin CLI bootstrap.

### Stage 7 — Access Codes & Entitlements
**CLI/RUNTIME PASS.**

Implemented secure 6/7-digit generation, Arabic/Persian normalization, code duration, row-locked redemption, profile-bound idempotency, renewal extension, Full-access no-waste behavior for Class codes, revoke/audit and active-entitlement uniqueness.

CI/runtime defects fixed during closure:

- explicit TypeScript default boundary;
- PostgreSQL enum inference simplification;
- JSONB integer parameter typing;
- code creation + audit atomicity;
- idempotency ownership binding.

### Stage 8 — Student Activation & Account Flow
**CLI + PostgreSQL RUNTIME + Chromium BROWSER E2E PASS.**

Integrated source of truth:

- branch `rebuild/student-activation-integration`;
- PR #7;
- code baseline `829af003156f4c57ceea1cba2ebca12a4309177a`;
- GitHub Actions run `33292329935`.

Backend:

- `POST /v1/student/activate` with 6-digit Full Code + password + stable idempotency key;
- cheap code preflight before expensive scrypt;
- second code validation under row lock inside transaction;
- atomic Student profile + credential + all-content entitlement + redemption + audit;
- original normalized Full Code becomes returning account identifier;
- post-commit canonical Auth login establishes HttpOnly session;
- replay returns same account result but still requires correct password before session issuance;
- one-redemption DB indexes and redeemed-owner invariant.

Student Web:

- real first activation UI, not a placeholder;
- Arabic/Persian digit normalization;
- stable retry idempotency key per unchanged submission;
- returning login, logout and reset-only recovery UI;
- entitlement confirmation after activation/login;
- loading/error/offline states;
- mobile-first RTL responsive behavior;
- owned open-book brand mark;
- no browser password/code persistence.

Browser integration gate runs clean PostgreSQL 16 + built API + built Student Web + same-origin `/v1` proxy + Chromium and verifies:

```text
invalid code
→ valid Arabic-digit activation
→ 201 + Student session
→ full entitlement visible
→ logout
→ returning login
→ logout
→ Admin-issued one-time recovery token
→ Student password reset
→ old password rejected
→ new password accepted
→ no horizontal overflow at 390px viewport
```

Stage 8 defects caught by CI and fixed before PASS:

1. strict TS rejected an untyped Vitest `fetch` mock call tuple → mock given explicit DOM fetch signature;
2. Vitest discovered Playwright E2E file → Unit suite scoped to `src`;
3. backend integration suites interfered through shared DB state → Auth/Access/Activation suites isolated by stage/database;
4. production API build emitted the wrong runtime path → runtime-only build config introduced.

## Tests & Verification

### Mandatory policy

See:

- `docs/engineering/CLI_VERIFICATION_GATES.md`
- `.github/workflows/rebuild-stage-verification.yml`
- `PROJECT_HANDOFF.md`

### Latest full verified code baseline

- Branch: `rebuild/student-activation-integration`
- Commit: `829af003156f4c57ceea1cba2ebca12a4309177a`
- GitHub Actions run: `33292329935`
- Result: **SUCCESS**

The run verified:

- Stage 1 product contract — PASS;
- Stage 2 brand — PASS;
- Stage 3 UX — PASS;
- Stage 4 clean PostgreSQL migrations/schema tests — PASS;
- Stage 5 API lint/typecheck/unit/build, migration runner/idempotency, Admin build and Student lint/unit/typecheck/build — PASS;
- Stage 6 Auth isolated PostgreSQL lifecycle/role/recovery/bootstrap tests — PASS;
- Stage 7 Access isolated lifecycle/renewal/idempotency/race tests — PASS;
- Stage 8 Activation atomicity/replay/session/race/rollback PostgreSQL integration — PASS;
- Stage 8 Chromium activation/entitlement/logout/returning-login/recovery/password-reset browser E2E — PASS.

No unexecuted item is represented as passed.

## Known Issues / Remaining Risk

- **Stage 9 content import is now active and not yet verified.** Full `alwaslh-go` inventory, helper-file consistency, deterministic ordering, checksums and duplicate/missing reports remain open.
- Production-host PostgreSQL pool/network/load tuning remains `NOT YET VERIFIED`.
- Real-host backup + restore drill remains `NOT YET VERIFIED`.
- Reverse-proxy/API perimeter rate limiting and final security hardening remain later gates.
- Object/media storage and ordered PDF/media processing are not implemented.
- Gemini prompt contracts, golden tests, durable workers and project/key failover are not implemented.
- Complete Admin Product is not implemented.
- Post-auth Student learning product, Practice Engine and trusted scoring are not implemented.
- Account-scoped Offline Sync/PWA/outbox/service-worker lifecycle is not implemented.
- Full production performance/accessibility/device/staging/rollback/release readiness remains `NOT YET VERIFIED`.
- Legacy application remains NO-GO for production.

## Remaining Work

1. **Stage 9 — Content Model & deterministic `alwaslh-go` Import:** full discovery/inventory, helper manifest validation, canonical taxonomy, deterministic order, checksums/dedupe, import manifest, repeatability/idempotency and reporting gate.
2. Stage 10 Media Pipeline.
3. Stage 11 Gemini Prompt/Output Contracts.
4. Stage 12 Durable AI Execution.
5. Stage 13 Admin Product.
6. Stage 14 Student Learning Product.
7. Stage 15 Practice Engine.
8. Stage 16 Offline/PWA.
9. Stages 17–20 Notes/Saved, Notifications, Statistics/Achievements, Export.
10. Stages 21–24 Performance, Security, automated test expansion, Accessibility/Device QA.
11. Stages 25–29 content load, Staging, Release Gate, Production Cutover and Monitoring.

## Documentation / Continuity Protocol

At every meaningful implementation batch:

- update this log with decisions, findings, failures/fixes and verification;
- update `PROJECT_STATUS.md` with current stage, completed/remaining work, blockers, latest evidence and next action;
- update `PROJECT_HANDOFF.md` whenever architecture/business rules/branches/verified baseline/active stage changes;
- retain exact CI evidence and failed checks/fixes;
- mark anything not actually executed as `NOT YET VERIFIED`.

## Current State

**Stages 1–8 are executable/runtime verified. Stage 9 Content Model & deterministic `alwaslh-go` Import is the only active roadmap stage.**
