# PROJECT STATUS

- **Current Phase:** Stage 7 Access Codes & Entitlements is **CLI/RUNTIME PASS**. Stage 8 Student Activation & Account Flow is next.
- **Verification Policy:** every stage requires executable CLI/CI verification. Statuses distinguish DESIGN PASS / CLI PASS / RUNTIME PASS / RELEASE PASS. Unexecuted checks remain `NOT YET VERIFIED`.
- **Continuity Source:** `PROJECT_HANDOFF.md` is the mandatory first-read for any new conversation/engineer.
- **Verification Sources:** `docs/engineering/CLI_VERIFICATION_GATES.md`, `.github/workflows/rebuild-stage-verification.yml`, and the recorded GitHub Actions runs.
- **Latest Full Verified Baseline:** branch `rebuild/access-entitlements`, commit `0a7929daf2f79baccca31b8110a6c6e372d49024`, GitHub Actions run `33288330856`. **Stages 1–7 all completed with success** on clean CI, including PostgreSQL 16 runtime/integration tests.

## Completed

- **Stage 1 Product Contract:** **CLI PASS.** Feature IDs/rows and required capability families are automatically validated.
- **Stage 2 Brand Identity:** **CLI PASS.** Canonical owned assets, SVG parsing, PWA dimensions, identity JSON, palette, typography and accessibility tokens are checked.
- **Stage 3 UX Architecture:** **CLI PASS.** Admin/Student IA, flows, states, parity coverage and wireframe SVG validity are automatically checked.
- **Stage 4 PostgreSQL Data Platform:** **CLI/RUNTIME PASS on PostgreSQL 16.** Clean-slate self-hosted PostgreSQL behind backend services; browser has no DB credentials/direct DB access.
- **Stage 5 Engineering Foundation:** **CLI/RUNTIME PASS.** API runtime, PostgreSQL pool/transaction boundary, migration runner/idempotency, environment validation, logging/errors, lint, strict typecheck, unit tests, API build, Admin build and Student build all pass in CI.
- **Stage 6 Auth & Authorization:** **CLI/RUNTIME PASS.** Salted scrypt password hashing, opaque sessions with SHA-256 persisted token digests, HttpOnly cookie, role isolation, mutation origin protection, DB-backed lockout, one-time recovery/reset, session invalidation and explicit first-admin CLI bootstrap are tested against PostgreSQL.
- **Stage 7 Access Codes & Entitlements:** **CLI/RUNTIME PASS.** Secure 6-digit full codes and 7-digit class codes, Arabic/Persian digit normalization, transactional/idempotent redemption, renewal extension, no-waste class redemption behavior, revoke, audit events, uniqueness constraints and concurrent race behavior are tested on PostgreSQL 16.

## Canonical database migrations

`database/migrations/0001_core.sql` → `0002_access.sql` → `0003_learning.sql` → `0004_ai_and_sync.sql` → `0005_auth.sql` → `0006_access_contract.sql`.

## Current branch / PR stack

- Foundation: `rebuild/foundation` / PR #2.
- Auth: `rebuild/auth-authorization` / PR #3, stacked on foundation.
- Access/Entitlements: `rebuild/access-entitlements` / PR #4, stacked on Auth.

## Important decisions

- PostgreSQL is self-hosted on the same hosting environment as backend services.
- Supabase is **not** the target platform.
- Old project is a feature/scenario reference, not a schema/data compatibility target.
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

## NOT YET VERIFIED / remaining release risks

- actual production/self-hosted PostgreSQL connection-pool tuning, load characteristics and network configuration.
- real-host backup + restore drill.
- object storage/media integration.
- full `alwaslh-go` inventory/import integrity.
- Gemini contracts/golden tests/workers/failover/runtime.
- complete Admin application and browser E2E.
- complete Student PWA, reader, quizzes, notes, progress and browser E2E.
- offline account isolation/delta/outbox/service-worker lifecycle.
- production performance/security/accessibility/staging/rollback gates.

## Next Action

**Stage 8 — Student Activation & Account Flow.** Implement first activation on top of the verified Auth + Access systems, returning-student path, atomic account/profile/credential/entitlement creation where required, activation idempotency/race safety, invalid/expired/revoked/redeemed-code behavior, session establishment, and integration tests proving `activation → authenticated session → entitlement visible` on clean PostgreSQL.
