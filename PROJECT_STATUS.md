# PROJECT STATUS

- **Current Phase:** Stage 8 Student Activation & Account Flow is **IN PROGRESS**. Backend is **CLI/RUNTIME PASS**; the parallel Student Activation UI and combined browser E2E are still required before Stage 8 can close.
- **Verification Policy:** every stage requires executable CLI/CI verification. Statuses distinguish DESIGN PASS / CLI PASS / RUNTIME PASS / RELEASE PASS. Unexecuted checks remain `NOT YET VERIFIED`.
- **Continuity Source:** `PROJECT_HANDOFF.md` is the mandatory first-read for any new conversation/engineer.
- **Verification Sources:** `docs/engineering/CLI_VERIFICATION_GATES.md`, `.github/workflows/rebuild-stage-verification.yml`, and the recorded GitHub Actions runs.
- **Latest Backend Verified Baseline:** branch `rebuild/student-activation-backend`, commit `a87c7f766481708e018dcaa1ae6e6643c0667fef`, GitHub Actions run `33289741640`. **Stages 1–8 backend jobs all completed with success**, including clean PostgreSQL 16 activation integration tests.

## Completed

- **Stage 1 Product Contract:** **CLI PASS.** Feature IDs/rows and required capability families are automatically validated.
- **Stage 2 Brand Identity:** **CLI PASS.** Canonical owned assets, SVG parsing, PWA dimensions, identity JSON, palette, typography and accessibility tokens are checked.
- **Stage 3 UX Architecture:** **CLI PASS.** Admin/Student IA, flows, states, parity coverage and wireframe SVG validity are automatically checked.
- **Stage 4 PostgreSQL Data Platform:** **CLI/RUNTIME PASS on PostgreSQL 16.** Clean-slate self-hosted PostgreSQL behind backend services; browser has no DB credentials/direct DB access.
- **Stage 5 Engineering Foundation:** **CLI/RUNTIME PASS.** API runtime, PostgreSQL pool/transaction boundary, migration runner/idempotency, environment validation, logging/errors, lint, strict typecheck, unit tests, API build, Admin build and Student build all pass in CI.
- **Stage 6 Auth & Authorization:** **CLI/RUNTIME PASS.** Salted scrypt password hashing, opaque sessions with SHA-256 persisted token digests, HttpOnly cookie, role isolation, mutation origin protection, DB-backed lockout, one-time recovery/reset, session invalidation and explicit first-admin CLI bootstrap are tested against PostgreSQL.
- **Stage 7 Access Codes & Entitlements:** **CLI/RUNTIME PASS.** Secure 6-digit full codes and 7-digit class codes, Arabic/Persian digit normalization, transactional/idempotent redemption, renewal extension, no-waste class redemption behavior, revoke, audit events, uniqueness constraints and concurrent race behavior are tested on PostgreSQL 16.
- **Stage 8 Backend — Student Activation:** **CLI/RUNTIME PASS.** First activation with a 6-digit full-access code is atomic and idempotent; profile + scrypt credential + full entitlement + redemption + audit commit together; the original six-digit code becomes the returning account identifier, not a secret; session issuance uses canonical Auth login; invalid/expired/revoked/used-code, replay, rollback, Arabic digits, returning login and concurrent activation races are integration-tested.

## Canonical database migrations

`database/migrations/0001_core.sql` → `0002_access.sql` → `0003_learning.sql` → `0004_ai_and_sync.sql` → `0005_auth.sql` → `0006_access_contract.sql` → `0007_activation_contract.sql`.

Stage 8 adds DB-level single-redemption indexes, stronger redeemed-code ownership constraints and the `account_activated` auth audit event.

## Current branch / PR stack

- Foundation: `rebuild/foundation` / PR #2.
- Auth: `rebuild/auth-authorization` / PR #3, stacked on foundation.
- Access/Entitlements: `rebuild/access-entitlements` / PR #4, stacked on Auth.
- Student Activation Backend: `rebuild/student-activation-backend` / PR #6, stacked on Access/Entitlements.
- Student Activation UI: parallel conversation/branch `rebuild/student-activation-ui`; **its final status must be read from that branch/PR and remains NOT YET VERIFIED in this branch until integration.**

## Stage 8 API contract

Canonical UI/backend contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

Key flow:

```text
POST /v1/student/activate
6-digit full code + password + stable idempotency key
→ atomic account/credential/entitlement/redemption
→ canonical Auth login
→ HttpOnly session
```

Returning login remains `POST /v1/auth/login` using the original 6-digit account identifier + password. Recovery resets the password and never reveals the original secret.

## Important decisions

- PostgreSQL is self-hosted on the same hosting environment as backend services.
- Supabase is **not** the target platform.
- Old project is a feature/scenario reference, not a schema/data compatibility target.
- The six-digit full-access code is the Student account identifier after first activation; it is not sufficient authentication by itself.
- Browser never stores/retrieves the password and never connects directly to PostgreSQL.
- `7eaur/alwaslh-go` remains the canonical curriculum/media source input and will be imported deterministically later.
- Legacy application remains **NO-GO** for production until the replacement passes parity/release gates.

## Critical fixes caught by CI so far

- Product parity validator assumption corrected without weakening checks.
- Brand Mint token drift fixed at source.
- PostgreSQL constraint verification corrected to the actual stronger FK contract.
- Legacy root PostCSS/Tailwind configuration leaking into new apps was isolated.
- Auth strict TypeScript/scrypt/optional typing issues fixed before runtime.
- Stage 7 default duration typing, PostgreSQL enum inference and JSONB parameter typing defects were caught and fixed.
- Stage 7 code creation + audit event was made atomic; idempotency was bound to the same profile.
- Stage 8 first CI run caught Biome import/format drift; source was formatted rather than weakening lint.
- Stage 8 exposed cross-stage integration-test interference: Stage 6 was running every integration file concurrently on one DB. CI was corrected so Auth/Access/Activation each run their own integration suite against isolated PostgreSQL databases.

## NOT YET VERIFIED / remaining release risks

- Stage 8 parallel Student UI implementation and its lint/typecheck/tests/build result on its own branch.
- combined Stage 8 browser E2E: activation → session → entitlement-visible → logout → returning login/recovery states.
- actual production/self-hosted PostgreSQL connection-pool tuning, load characteristics and network configuration.
- activation/API perimeter rate limiting under real reverse-proxy hosting; security hardening remains a later mandatory gate.
- real-host backup + restore drill.
- object storage/media integration.
- full `alwaslh-go` inventory/import integrity.
- Gemini contracts/golden tests/workers/failover/runtime.
- complete Admin application and browser E2E.
- complete Student PWA, reader, quizzes, notes, progress and browser E2E.
- offline account isolation/delta/outbox/service-worker lifecycle.
- production performance/security/accessibility/staging/rollback gates.

## Next Action

**Finish Stage 8, do not start Stage 9 yet.** Read/verify the parallel `rebuild/student-activation-ui` work when available, reconcile it with `docs/api/STUDENT_ACTIVATION_CONTRACT.md`, integrate Backend + UI on a dedicated Stage 8 integration branch/PR if needed, then run combined lint/typecheck/tests/build and browser/API E2E. Stage 8 closes only after both halves and the integrated flow are green.
