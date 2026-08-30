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

| ID | Severity | Area | Problem | Evidence / Impact | Solution | Status |
|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin auth | anonymous privileged password mutation in legacy | privileged identity could be compromised | new server-side auth boundary | ELIMINATED in Stage 6 |
| SEC-002..011 | P0 | Authorization | broad/public DB/RLS privilege paths in legacy | browser could bypass intended service rules | browser has no direct DB access | ELIMINATED by target architecture |
| DATA-015 | P0 | Activation | legacy activation was multi-step/non-transactional | partial account/code state possible | atomic backend activation contract required | OPEN — Stage 8 backend |
| DATA-018 | P0 | Class codes | redemption was racy/non-atomic | concurrent or wasted redemption | row locks + idempotency + no-waste rules | FIXED/RUNTIME VERIFIED Stage 7 |
| SEC-015..018 | P1 | Credentials | plaintext/reversible/device assumptions | account compromise/recovery fragility | salted scrypt + opaque sessions + reset-only recovery | FIXED Stage 6 |
| UI-008-001 | P1 | Student activation UI | base branch has no documented first-time activation API | UI cannot safely create account/entitlement/session without inventing contract | keep UI ready but do not send activation code until backend contract exists | BLOCKED / NOT YET VERIFIED |
| UI-008-002 | P1 | Student recovery UI | Student-side recovery-token issuance has no documented API; existing issuance is Admin-only | self-service recovery cannot be completed from Student UI | support documented reset with existing token; await explicit issuance contract | BLOCKED / NOT YET VERIFIED |
| UI-008-003 | P2 | Student deployment | same-origin `/v1/*` browser routing not verified in this batch | standalone browser E2E may fail without deployment reverse proxy | verify deployment routing before wiring E2E; do not invent Vite/API host | NOT YET VERIFIED |
| DATA-025 | P1 | Assessment | client-trusted score/ranking legacy behavior | result could be forged | server-derived finalization | REMAINING |
| OFF-* | P1/P2 | Offline | stale/overlapping caches/sync | cross-account/stale data risk | account-scoped revision/tombstone Sync Engine | REMAINING |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | unreliable/replay/security risks | durable server jobs + versioned contracts | REMAINING |
| MEDIA-* | P1/P2 | Media | upload page ordering/export defects | wrong content order/output | stable ordered asset model/pipeline | PARTIAL; pipeline later |

## Classification

### KEEP
Product idea, required scenarios, React/Vite frontend direction, IndexedDB offline concept, AI-assisted authoring, educational content.

### IMPROVE
Validation/forms/states, UX/accessibility, querying/pagination, media/export, observability and operations.

### REFACTOR
Large feature modules, practice UI/state boundaries, content authoring pipeline.

### REBUILD
Backend API boundary, Auth/Recovery, authorization, entitlement/code service, Student activation orchestration, Student sync/service worker, durable Gemini execution.

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
- **AD-017 — Frontend consumes documented contracts only.** Missing activation/recovery APIs are explicit blockers; UI must never guess endpoint names, payloads or security semantics.
- **AD-018 — Cold offline launch is not authentication.** Until the account-scoped offline session/replica contract is implemented, Student UI does not promote an unverified local state to authenticated.

## Changes Made

### Stage 1 — Product Contract
**CLI PASS.**

- repository/product audit completed;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` established;
- rebuild roadmap and feature-preservation contract established;
- `scripts/verify-product-contract.py` validates unique/non-empty feature IDs and required capability families.

### Stage 2 — Brand Identity
**CLI PASS.**

- evolved the original teal/open-book identity instead of template assets;
- owned SVG/PNG/PWA assets;
- canonical palette, Arabic typography, focus/reduced-motion/touch tokens;
- `scripts/verify-brand.py` validates assets and identity contracts.

A Mint-token drift was caught and fixed at source rather than weakening the gate.

### Stage 3 — UX Architecture
**CLI PASS.**

Implemented Admin/Student IA, parity mapping, critical flows, async/offline/error states, responsive/accessibility contracts and wireframes. `scripts/verify-ux.py` enforces the contracts.

### Stage 4 — PostgreSQL Data Platform
**CLI/RUNTIME PASS on PostgreSQL 16.**

Canonical migrations:
- `0001_core.sql`
- `0002_access.sql`
- `0003_learning.sql`
- `0004_ai_and_sync.sql`
- `0005_auth.sql`
- `0006_access_contract.sql`

Core relational ownership/order/access/auth integrity is constrained in PostgreSQL. Browser direct DB access is not part of the target.

### Stage 5 — Engineering Foundation
**CLI/RUNTIME PASS.**

Implemented API runtime, DB pool/transaction boundary, migration runner/idempotency, environment validation, public errors/logging, lint/strict TypeScript/unit tests/builds and CI gates. Legacy root PostCSS/Tailwind leakage into new apps was caught and isolated.

### Stage 6 — Auth & Authorization
**CLI/RUNTIME PASS.**

Implemented/tested salted `scrypt`, opaque session tokens with persisted SHA-256 digest only, HttpOnly cookie, role isolation, mutation-origin protection, DB-backed login lockout, reset-only one-time recovery, session invalidation and explicit first-admin CLI bootstrap.

### Stage 7 — Access Codes & Entitlements
**CLI/RUNTIME PASS.**

Implemented/tested secure 6/7-digit code generation, Arabic/Persian normalization, entitlement duration, row-locked transactional redemption, advisory-lock idempotency, profile-bound idempotent replay, renewal extension, full-access no-waste rule, revoke/audit and active-entitlement uniqueness. Integration tests include concurrent redemption races.

Stage 7 gate caught/fixed explicit default typing, PostgreSQL enum inference, JSONB parameter typing, code/audit atomicity and idempotency ownership.

### Stage 8 — Student Activation UI parallel batch
**Student UI sub-scope: CLI PASS. Overall Stage 8: NOT COMPLETE.**

Branching:
- created `rebuild/student-activation-ui` from exact `rebuild/access-entitlements` head `2479960820f338c5b6d7ffd9ec04a557de3c9f74`;
- implementation commit `483ddf4926604b87fcbe7199fd426bc52ea80b9d`;
- draft PR #5 targets `rebuild/access-entitlements`.

Scope discipline:
- all implementation changes are under `apps/student-web`;
- **no PostgreSQL migration changed**;
- **no Auth backend code changed**;
- **no `AccessService` code changed**;
- no undocumented endpoint was created or assumed.

Frontend contract layer (`apps/student-web/src/auth-api.ts`):
- documented `POST /v1/auth/login`;
- documented `POST /v1/auth/logout`;
- documented `GET /v1/student/me`;
- documented `POST /v1/auth/reset-password`;
- documented `GET /v1/student/access/entitlements`;
- same-origin requests with `credentials: "include"` for HttpOnly session cookie behavior;
- typed public API errors and network-unavailable handling;
- activation-code normalization aligned with backend Arabic/Persian digit behavior.

UI behavior (`apps/student-web/src/App.tsx` + styles):
- initial session verification before displaying private account data;
- separate activation/login/recovery surfaces instead of one ambiguous form;
- returning-student login with server errors, busy state and role guard;
- authenticated success/account state with entitlement loading/empty/error/offline states;
- recovery reset with token/password confirmation and documented reset endpoint;
- activation input validates normalized six digits but intentionally does not submit because the first-time activation API contract is absent;
- offline banner after an already verified in-memory session, but cold offline launch does not fabricate authentication;
- logout is disabled offline rather than pretending server session revocation succeeded;
- mobile-first/RTL responsive behavior, high-contrast support, semantic labels/forms, `aria-live`, touch targets and accessible invalid states;
- no fake dashboard data or fake entitlement state.

Quality tooling added inside Student app:
- ESLint configuration;
- Vitest unit tests for access-code normalization/validation;
- `prebuild` executes lint + tests before production build so existing CI verifies them without modifying Stage 1–7 workflow logic.

Blocked behavior intentionally left unimplemented:
1. `POST /v1/student/access/redeem` was **not** misused as first activation because it requires an existing authenticated Student session.
2. No activation endpoint was invented; code is not sent or consumed.
3. No Student recovery-token issuance endpoint was invented; current documented issuance is Admin-only.
4. No Vite dev/API proxy destination was guessed; deployed browser routing remains `NOT YET VERIFIED`.

## Tests & Verification

### Mandatory policy
See:
- `docs/engineering/CLI_VERIFICATION_GATES.md`
- `.github/workflows/rebuild-stage-verification.yml`
- `PROJECT_HANDOFF.md`

### Latest verification covering Student Activation UI

GitHub Actions:
- workflow: `Rebuild Stage Verification`
- run: `33289552826`
- implementation commit: `483ddf4926604b87fcbe7199fd426bc52ea80b9d`
- PR merge-test ref checked out by Actions; all Stage 1–7 jobs completed `success`.

Student verification in Stage 5 job `Stage 5 · Engineering foundation`, step `Install and build Student`:

```text
npm run typecheck --prefix apps/student-web
> tsc --noEmit
PASS

npm run build --prefix apps/student-web
> prebuild
> npm run lint && npm test

npm run lint
> eslint . --max-warnings 0
PASS

npm test
> vitest run
PASS — 1 file, 5 tests, 5 passed

build
> tsc -b && vite build
PASS — Vite 7.1.3, 29 modules transformed
```

Build output recorded by CI:
- `dist/index.html` 0.67 kB;
- CSS 13.71 kB;
- JS 365.07 kB;
- production build completed successfully.

The same run also revalidated:
- Stage 1 product contract — PASS;
- Stage 2 brand — PASS;
- Stage 3 UX — PASS;
- Stage 4 clean PostgreSQL migrations/schema tests — PASS;
- Stage 5 API lint/typecheck/tests/build + migration runner + Admin/Student builds — PASS;
- Stage 6 auth lifecycle/role integration — PASS;
- Stage 7 access lifecycle/renewal/idempotency/race integration — PASS.

No browser E2E was executed in this batch. No unexecuted item is represented as passed.

## Known Issues / Remaining Risk

- **Stage 8 overall remains NOT COMPLETE:** first-time activation backend orchestration/API is still absent on this branch and owned by the main Stage 8 conversation.
- **BLOCKED / NOT YET VERIFIED:** Student self-service recovery-token issuance contract.
- **NOT YET VERIFIED:** browser E2E and production/reverse-proxy routing for same-origin `/v1/*` requests.
- **NOT YET VERIFIED:** account-scoped offline replica/session continuation; current cold offline screen deliberately refuses to infer authentication.
- Quiz completion service still must derive authoritative result server-side from persisted answers.
- Object storage/media provider is not implemented yet.
- `alwaslh-go` full inventory/import is not yet verified.
- PostgreSQL CI proves clean runtime execution, not actual-host tuning/load/network readiness.
- Real hosting backup + restore drill remains `NOT YET VERIFIED`.
- AI prompt contracts, Gemini workers/failover/golden tests remain `NOT YET VERIFIED`.
- Complete Admin/Student products and release E2E are not done.
- Legacy application remains NO-GO and only a behavior/feature reference.

## Remaining Work

1. **Stage 8 backend contract:** first activation, atomic account/profile/credential/entitlement creation, code outcome semantics, activation idempotency/races, account identifier contract and post-activation session establishment.
2. Wire the existing Student activation UI to that documented endpoint after it exists; add API/browser E2E for `activation → authenticated session → entitlement visible`.
3. Decide/document Student recovery-token issuance flow if self-service recovery is required, then wire the existing reset surface.
4. Content domain/API and deterministic `alwaslh-go` inventory/import.
5. Ordered Media/PDF pipeline with checksum/count/order tests.
6. Admin content management implementation.
7. Versioned AI contracts/Prompt Registry + semantic/golden tests.
8. Durable Gemini workers/retries/failover/cancel/resume/observability + AI Ops.
9. Quiz domain + shared PracticeEngine + trusted completion service.
10. Student reader/quizzes/notes/progress/notifications.
11. Offline Sync Engine + PWA/service worker + attempt outbox.
12. Admin access/student/report/export surfaces.
13. Design-system completion/shared UI/accessibility.
14. Performance/security/observability hardening and actual-host/staging/release gates.

## Documentation / Continuity Protocol

At every meaningful implementation batch:

- update this log with decisions, findings, failures/fixes and verification;
- update `PROJECT_STATUS.md` with the current stage, completed/remaining work, blockers, last build/test and next action;
- update `PROJECT_HANDOFF.md` whenever architecture, business rules, branches/PRs, verified baseline or next-stage scope changes;
- retain exact CI evidence and failed checks/fixes;
- mark anything not actually executed as `NOT YET VERIFIED`.

## Current State

**Stages 1–7 remain CLI/runtime verified. Stage 8 Student Activation UI sub-scope is CLI PASS on `rebuild/student-activation-ui`, while Stage 8 overall remains NOT COMPLETE until the missing backend activation/recovery contracts and end-to-end runtime flow are implemented and verified.**
