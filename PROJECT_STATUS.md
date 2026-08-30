# PROJECT STATUS

- **Current Phase:** Stage 4 — PostgreSQL Data Platform **COMPLETE / PASS at design/schema baseline**. Stage 5 Engineering Foundation is next.
- **Stage Order Rule:** stages are executed sequentially; runtime verification gates remain explicit and may not be silently treated as passed.
- **Stage 2 Brand Identity:** **COMPLETE / PASS.** Canonical owned identity evolves the original turquoise/open-book product logo.
- **Stage 3 UX Architecture:** **COMPLETE / PASS.** Admin/Student IA, flows, states, responsive/accessibility contracts and wireframes are committed.
- **Stage 4 Database Decision:** rebuilt product uses **self-hosted PostgreSQL on the same hosting environment as backend services**. Supabase is not the target platform.
- **Clean-Slate Rule:** the old project is a product/feature/scenario reference, not a database compatibility target. Legacy IDs, old RLS assumptions, plaintext/reversible credentials, device ownership and schema drift are not preserved.
- **Database Boundary:** Admin/Student browsers never connect directly to PostgreSQL. Only backend API, workers, migrations and backup processes hold DB credentials.
- **Canonical Schema:** `database/migrations/0001_core.sql`, `0002_access.sql`, `0003_learning.sql`, `0004_ai_and_sync.sql`.
- **Database Documentation:** `DATABASE_PLATFORM_ARCHITECTURE.md`, `database/SCHEMA.md`, `database/README.md`, `database/BACKUP_RESTORE.md`, `database/DATABASE_STAGE_DOD.md`.
- **Database Security/Ops:** separate owner/migrator/app/readonly roles; private PostgreSQL network boundary; version-controlled migrations; off-host backups and restore drills required.
- **Key Integrity Guarantees:** UUID ownership; class/subject/lesson FK integrity; stable lesson page positions; exact 6/7-digit code constraints; normalized entitlements; idempotent redemption contract; stable quiz/question/option identity; persisted practice shuffle order; answer-option ownership FK; generated attempt percentage; durable AI jobs; offline content revisions/tombstones.
- **Database Tests:** `database/tests/schema_smoke.sql` committed. It checks core FK/ordering/code/question/attempt invariants.
- **Database Runtime Verification:** **NOT YET RUN** because no real PostgreSQL instance is provisioned in the connected environment. No migration/test runtime-pass claim is made. Runtime database execution remains a pre-release gate.
- **Content Source:** `7eaur/alwaslh-go` remains the canonical curriculum/media source input; content will be normalized/imported into the new model rather than forcing the schema to copy legacy database structures.
- **Implementation Branch:** `rebuild/foundation`.
- **Legacy Product:** remains **NO-GO** for production and is retained only as product behavior/feature reference until tested replacement parity is achieved.
- **Next Action:** Stage 5 — establish the real backend/monorepo engineering foundation around the approved PostgreSQL contracts: API runtime boundary, environment validation, database access layer/migration runner, logging/error contracts, test harness and reproducible Admin/Student builds. Auth/credentials remain Stage 6 and will not be mixed into Stage 5 prematurely.
