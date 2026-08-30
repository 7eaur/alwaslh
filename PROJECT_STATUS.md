# PROJECT STATUS

- **Current Phase:** Stage 8 Student Activation & Account Flow is **COMPLETE / CLI + PostgreSQL RUNTIME + BROWSER E2E PASS**. Stage 9 Content Model & deterministic `alwaslh-go` import is next.
- **Verification Policy:** every stage requires executable evidence. Official states: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; anything not executed remains `NOT YET VERIFIED`.
- **Continuity Source:** read `PROJECT_HANDOFF.md` first, then this file, `PROJECT_ENGINEERING_LOG.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, and `MASTER_REBUILD_ROADMAP.md`.
- **Latest Full Verified Baseline:** branch `rebuild/student-activation-integration`, commit `829af003156f4c57ceea1cba2ebca12a4309177a`, GitHub Actions run `33292329935`. **Stages 1–8 and the Stage 8 Chromium browser E2E all completed successfully.**

## Completed

- **Stage 1 Product Contract:** **CLI PASS.** Feature-preservation contract and automated parity checks.
- **Stage 2 Brand Identity:** **CLI PASS.** Owned teal/open-book identity, canonical assets/tokens/PWA icons and automated brand checks.
- **Stage 3 UX Architecture:** **CLI PASS.** Admin/Student IA, critical flows/states, responsive/accessibility contracts and wireframes.
- **Stage 4 PostgreSQL Data Platform:** **CLI/RUNTIME PASS on PostgreSQL 16.** Clean-slate private PostgreSQL behind Backend; migrations and relational integrity verified on clean DBs.
- **Stage 5 Engineering Foundation:** **CLI/RUNTIME PASS.** API runtime, DB pool/transactions, migration runner, environment validation, logging/error envelope, strict TS, tests, production builds and CI. Production API build now uses `tsconfig.build.json`, outputs runtime-only `dist/`, and matches `npm start`.
- **Stage 6 Auth & Authorization:** **CLI/RUNTIME PASS.** Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery and explicit Admin bootstrap.
- **Stage 7 Access Codes & Entitlements:** **CLI/RUNTIME PASS.** Secure 6/7-digit codes, Arabic/Persian normalization, transactional/idempotent redemption, renewal, no-waste behavior, revoke/audit, constraints and race tests.
- **Stage 8 Student Activation & Account Flow:** **CLI/RUNTIME/BROWSER E2E PASS.** Atomic first activation; original six-digit Full Code becomes returning account identifier; password remains the authentication secret; immediate HttpOnly session; entitlement visibility; logout; returning login; recovery reset; offline/loading/error UI states; responsive RTL UI; race/idempotency/rollback tests.

## Stage 8 verified browser flow

```text
invalid code
→ valid 6-digit activation + password
→ atomic profile/credential/full entitlement/redemption
→ HttpOnly Student session
→ entitlement visible in Student Web
→ logout
→ returning login with 6-digit identifier + password
→ Admin-issued one-time recovery token
→ Student password reset
→ old password rejected
→ new password login succeeds
```

Chromium E2E uses clean PostgreSQL 16 + live built API + built Student Web through same-origin Vite preview proxy.

## Canonical database migrations

`0001_core.sql` → `0002_access.sql` → `0003_learning.sql` → `0004_ai_and_sync.sql` → `0005_auth.sql` → `0006_access_contract.sql` → `0007_activation_contract.sql`.

## Current branch / PR stack

- Foundation: `rebuild/foundation` / PR #2.
- Auth: `rebuild/auth-authorization` / PR #3.
- Access/Entitlements: `rebuild/access-entitlements` / PR #4.
- Student Activation UI parallel work: `rebuild/student-activation-ui` / PR #5.
- Student Activation Backend: `rebuild/student-activation-backend` / PR #6.
- **Stage 8 integrated source of truth:** `rebuild/student-activation-integration` / PR #7, stacked on the Stage 8 Backend branch.

## Critical defects caught and fixed by gates

- Legacy root PostCSS/Tailwind leakage into new apps.
- Auth strict-TypeScript/scrypt boundary defects.
- Stage 7 PostgreSQL enum/JSONB/default typing defects and non-atomic audit creation.
- Stage 7 idempotency ownership weakness.
- Stage 8 formatter/lint drift.
- Cross-stage integration-test interference caused by multiple suites sharing one DB; each stage now runs its own suite against an isolated PostgreSQL database.
- Student Unit suite accidentally collected Playwright E2E files; Vitest is now scoped to `src`.
- API production build/start mismatch: build emitted `dist/src/server.js` while `npm start` expected `dist/server.js`; production build is now separated from tests using `tsconfig.build.json`.

## Important decisions

- PostgreSQL is self-hosted/private behind Backend; browser never connects directly.
- Supabase is not the target platform.
- Legacy project is a feature/behavior reference, not a schema compatibility target.
- Full access code = exactly 6 digits; Class access code = exactly 7 digits.
- The Full Code becomes the returning Student identifier only after activation; it is **not** sufficient authentication by itself.
- Recovery resets the secret; it never reveals the original password.
- `7eaur/alwaslh-go` is the canonical curriculum/media source input and must be imported deterministically; raw content is never shipped as a frontend bundle.
- Legacy application remains **NO-GO** for production until final parity/release gates pass.

## NOT YET VERIFIED / remaining release risks

- actual production-host PostgreSQL networking, pool tuning, load behavior and backup/restore drill;
- API/reverse-proxy perimeter rate limiting and final security hardening;
- object/media storage runtime;
- full `alwaslh-go` inventory and deterministic import integrity;
- ordered media/PDF pipeline;
- Gemini prompt contracts, golden tests, durable workers, multi-project/key failover and runtime;
- complete Admin product;
- post-auth Student learning product, Practice Engine and trusted scoring;
- account-scoped Offline Sync/PWA/outbox lifecycle;
- full performance/security/accessibility/device/staging/rollback/release gates.

## Next Action

**Stage 9 — Content Model & Deterministic `alwaslh-go` Import.** Start by reading the real `7eaur/alwaslh-go` repository contents/manifests, create a complete source inventory and canonical import contract, then implement deterministic parsing/order/checksum/dedupe/reporting. Do not begin Stage 10 Media Pipeline until the Stage 9 importer gate is green.
