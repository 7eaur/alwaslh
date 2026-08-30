# PROJECT STATUS

- **Current Phase:** Stage 8 — Student Activation & Account Flow is active.
- **Stage 8 Overall:** **NOT COMPLETE.** The parallel Student Activation UI sub-scope is **CLI PASS**, but first-time activation backend orchestration and Student recovery-token issuance are still missing from the documented API contract.
- **Verification Policy:** every stage requires executable CLI/CI verification. Statuses distinguish DESIGN PASS / CLI PASS / RUNTIME PASS / RELEASE PASS. Unexecuted checks remain `NOT YET VERIFIED`.
- **Continuity Source:** `PROJECT_HANDOFF.md` is the mandatory first-read for any new conversation/engineer.
- **Verification Sources:** `docs/engineering/CLI_VERIFICATION_GATES.md`, `.github/workflows/rebuild-stage-verification.yml`, and recorded GitHub Actions runs.
- **Latest Full Regression Verification:** GitHub Actions run `33289552826`, covering Student UI implementation commit `483ddf4926604b87fcbe7199fd426bc52ea80b9d`. **Stages 1–7 all completed with success**, including PostgreSQL 16 runtime/integration tests and the Student frontend verification described below.

## Completed

- **Stage 1 Product Contract:** **CLI PASS.** Feature IDs/rows and required capability families automatically validated.
- **Stage 2 Brand Identity:** **CLI PASS.** Owned assets, identity contracts, typography and accessibility tokens validated.
- **Stage 3 UX Architecture:** **CLI PASS.** Admin/Student IA, flows, states, parity coverage and wireframes validated.
- **Stage 4 PostgreSQL Data Platform:** **CLI/RUNTIME PASS on PostgreSQL 16.** Browser has no DB credentials/direct DB access.
- **Stage 5 Engineering Foundation:** **CLI/RUNTIME PASS.** API runtime, migration runner, lint/typecheck/tests/build and Admin/Student production builds pass.
- **Stage 6 Auth & Authorization:** **CLI/RUNTIME PASS.** scrypt credentials, opaque sessions, role isolation, lockout, reset recovery and first-admin bootstrap tested against PostgreSQL.
- **Stage 7 Access Codes & Entitlements:** **CLI/RUNTIME PASS.** Secure 6/7-digit codes, normalization, transactional/idempotent redemption, renewal/no-waste/revoke/audit/uniqueness and race tests pass.
- **Stage 8 Student Activation UI parallel sub-scope:** **CLI PASS.** Implemented only under `apps/student-web`: session restoration, returning-student login, activation/recovery surfaces, entitlement/account success state, loading/error/offline states, accessibility and responsive RTL UX.

## Stage 8 Student UI branch / PR

- Base: `rebuild/access-entitlements` at `2479960820f338c5b6d7ffd9ec04a557de3c9f74` when branch was created.
- Branch: `rebuild/student-activation-ui`.
- Implementation commit: `483ddf4926604b87fcbe7199fd426bc52ea80b9d`.
- Draft PR: #5 → `rebuild/access-entitlements`.
- Verification run: `33289552826`.

No PostgreSQL migration, Auth backend implementation or `AccessService` implementation was changed by this UI batch.

## Student UI verification

GitHub Actions Stage 5 job `Stage 5 · Engineering foundation`, step `Install and build Student` executed:

```text
npm run typecheck --prefix apps/student-web  -> PASS
npm run build --prefix apps/student-web
  prebuild -> npm run lint && npm test
    eslint . --max-warnings 0                 -> PASS
    vitest run                                -> PASS (5/5)
  tsc -b && vite build                        -> PASS (29 modules)
```

The same workflow run completed every existing Stage 1–7 job successfully.

## Stage 8 API contract status

Documented and wired by Student UI:
- `POST /v1/auth/login`
- `POST /v1/auth/logout`
- `GET /v1/student/me`
- `POST /v1/auth/reset-password`
- `GET /v1/student/access/entitlements`

Not used for first activation:
- `POST /v1/student/access/redeem` requires an already authenticated Student session.

### BLOCKED / NOT YET VERIFIED

- **First-time activation API:** no documented endpoint on the current base atomically validates the 6-digit full-access code, creates/claims the Student account/credential, grants entitlement and establishes the session. The UI does not send or consume the activation code until this contract exists.
- **Student recovery-token issuance:** documented issuance is Admin-only. Student UI supports reset only when a valid token has already been issued.
- **Browser E2E / deployment routing:** same-origin `/v1/*` routing and actual Student browser flow are not yet verified; no API host/proxy was guessed.
- **Offline authenticated replica:** cold offline launch does not infer an authenticated session until the future account-scoped offline contract exists.

## Canonical database migrations

`database/migrations/0001_core.sql` → `0002_access.sql` → `0003_learning.sql` → `0004_ai_and_sync.sql` → `0005_auth.sql` → `0006_access_contract.sql`.

## Current branch / PR stack

- Foundation: `rebuild/foundation` / PR #2.
- Auth: `rebuild/auth-authorization` / PR #3.
- Access/Entitlements: `rebuild/access-entitlements` / PR #4.
- Student Activation UI: `rebuild/student-activation-ui` / draft PR #5, stacked on Access/Entitlements.

## Important decisions

- PostgreSQL is self-hosted on the same hosting environment as backend services.
- Supabase is **not** the target platform.
- Old project is a feature/scenario reference, not a schema/data compatibility target.
- `7eaur/alwaslh-go` remains the canonical curriculum/media source input and will be imported deterministically later.
- Frontend consumes only documented API contracts; missing contracts are explicit blockers.
- Legacy application remains **NO-GO** for production until replacement parity/release gates pass.

## Remaining release risks

- Stage 8 backend activation/account orchestration and complete runtime tests.
- Student self-service recovery issuance decision/contract.
- production/self-hosted PostgreSQL connection-pool tuning, load characteristics and network configuration.
- real-host backup + restore drill.
- object storage/media integration.
- full `alwaslh-go` inventory/import integrity.
- Gemini contracts/golden tests/workers/failover/runtime.
- complete Admin application and browser E2E.
- complete Student PWA, reader, quizzes, notes, progress and browser E2E.
- offline account isolation/delta/outbox/service-worker lifecycle.
- production performance/security/accessibility/staging/rollback gates.

## Next Action

Main Stage 8 work should define and implement the missing first-activation backend contract and, if required, Student recovery-token issuance. Then wire the existing Student UI to those documented contracts and verify `activation → authenticated session → entitlement visible` with PostgreSQL integration/API tests and browser E2E. Do not close Stage 8 before that complete runtime evidence exists.
