# PROJECT STATUS

- **Current Phase:** Stage 4 PostgreSQL Data Platform is **CLI PASS**. Stage 5 Engineering Foundation is next.
- **Verification Policy:** every stage now requires executable CLI/CI verification. Statuses distinguish DESIGN PASS / CLI PASS / RUNTIME PASS / RELEASE PASS. Unexecuted checks remain `NOT YET VERIFIED`.
- **Verification Source:** `docs/engineering/CLI_VERIFICATION_GATES.md` and `docs/engineering/CLI_VERIFICATION_REPORT_2026-08-30.md`.
- **Final Stage 1–4 CI Run:** GitHub Actions run `33285502614` on commit `64ee5bbb9489461583425ffa88e4b294638f4bfc` — **SUCCESS**.
- **Stage 1 Product Contract:** **CLI PASS.** Feature IDs/rows and required capability families are automatically validated.
- **Stage 2 Brand Identity:** **CLI PASS.** Canonical assets exist; SVGs parse; PWA dimensions/identity JSON/palette/typography/accessibility tokens are checked. CLI caught and we fixed a real Mint-token drift.
- **Stage 3 UX Architecture:** **CLI PASS.** Required IA/flows/states/parity coverage and wireframe SVGs are automatically checked. Browser/E2E UX remains later implementation verification.
- **Stage 4 Database Decision:** rebuilt product uses **self-hosted PostgreSQL on the same hosting environment as backend services**. Supabase is not the target platform.
- **Clean-Slate Rule:** the old project is a product/feature/scenario reference, not a database compatibility target. Legacy IDs, old RLS assumptions, plaintext/reversible credentials, device ownership and schema drift are not preserved.
- **Database Boundary:** Admin/Student browsers never connect directly to PostgreSQL. Only backend API, workers, migrations and backup processes hold DB credentials.
- **Canonical Schema:** `database/migrations/0001_core.sql`, `0002_access.sql`, `0003_learning.sql`, `0004_ai_and_sync.sql`.
- **Stage 4 PostgreSQL Verification:** **CLI PASS on PostgreSQL 16.15.** CI created a clean DB, applied all migrations with `ON_ERROR_STOP`, ran `database/tests/schema_smoke.sql`, produced a schema-only dump and verified critical tables/constraints/indexes from PostgreSQL catalogs.
- **Database Integrity:** UUID ownership; class/subject/lesson FK integrity; stable lesson page positions; exact 6/7-digit code constraints; normalized entitlements; idempotent redemption contract; persisted practice question/option order; answer must be a presented option; current question belongs to session; attempt bound to profile/session/version/quiz; generated score; durable AI jobs; content revisions/tombstones.
- **Database Operations Still Pending:** actual-host connection-pool/load tests, API-level concurrent redemption tests, production configuration/network review, and a real backup/restore drill. These are later stage/release gates, not silently treated as passed.
- **Content Source:** `7eaur/alwaslh-go` remains the canonical curriculum/media source input; content will be normalized/imported into the new model.
- **Implementation Branch:** `rebuild/foundation`.
- **Legacy Product:** remains **NO-GO** for production and is retained only as product behavior/feature reference until tested replacement parity is achieved.
- **Next Action:** Stage 5 — build the real engineering foundation: API runtime, PostgreSQL driver/pool/migration runner, environment validation, structured logging/errors, tests, lockfile/reproducible workspace, lint/typecheck/build and CI. Stage 5 will not close until those CLI jobs pass. Auth/credentials remain Stage 6.
