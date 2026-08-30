# Stage 4 — PostgreSQL Data Platform Definition of Done

## Platform decision

- [x] Target database is self-hosted PostgreSQL.
- [x] PostgreSQL lives in the same hosting environment as backend services.
- [x] Database is private; browser clients do not connect directly.
- [x] Supabase is not a production dependency of the rebuilt platform.
- [x] Legacy database compatibility is not a design requirement.

## Schema foundations

- [x] UUID canonical identity/ownership.
- [x] Normalized classes/subjects/links/lessons/assets.
- [x] Composite FK prevents lesson/subject/class mismatch.
- [x] Stable lesson asset ordering enforced by unique `(lesson_id, position)`.
- [x] Six-digit full-access code constraint.
- [x] Seven-digit class-access code constraint.
- [x] Normalized entitlement model.
- [x] Active entitlement uniqueness constraints.
- [x] Redemption idempotency contract.
- [x] Normalized quizzes/versions/questions/options.
- [x] Stable persisted practice question order.
- [x] Stable persisted per-question option order.
- [x] Selected answer must be an option actually presented for the same session/question.
- [x] Current question must belong to the practice session.
- [x] Quiz attempt is relationally bound to the same profile/session/version/quiz.
- [x] Saved questions use stable question UUIDs.
- [x] Achievement definitions separated from student awards.
- [x] Notification target/read model.
- [x] Durable AI job/unit/output model.
- [x] Content revision/tombstone model for later offline sync.

## Operations/security foundation

- [x] Owner/migrator/runtime/readonly role model documented.
- [x] Example least-privilege role bootstrap committed.
- [x] Public PostgreSQL access explicitly rejected.
- [x] Database credentials restricted to backend/worker/migration/backup processes.
- [x] Version-controlled migrations are canonical.
- [x] Backup/off-host/restore-drill runbook committed.
- [x] Schema smoke suite committed.

## CLI/runtime verification

- [x] PostgreSQL 16.15 clean service started in GitHub CI.
- [x] `0001_core.sql` executed with `ON_ERROR_STOP`.
- [x] `0002_access.sql` executed with `ON_ERROR_STOP`.
- [x] `0003_learning.sql` executed with `ON_ERROR_STOP`.
- [x] `0004_ai_and_sync.sql` executed with `ON_ERROR_STOP`.
- [x] `database/tests/schema_smoke.sql` executed successfully.
- [x] schema-only `pg_dump` generated successfully.
- [x] critical tables verified in the dump.
- [x] critical FK/check/index contracts verified from PostgreSQL catalogs.

Final recorded Stage 1–4 verification run: GitHub Actions `33285502614`, commit `64ee5bbb9489461583425ffa88e4b294638f4bfc`, conclusion **success**.

## Later production/infrastructure verification

- [ ] Connection-pool/load measurements — Stage 5/performance infrastructure gate.
- [ ] Concurrent API-level access-code redemption — Stage 7 integration gate.
- [ ] Backup creation + restore drill on actual hosting — staging/release operations gate.
- [ ] Production PostgreSQL configuration/security/network review — deployment gate.

## Gate result

**Stage 4 CLI PASS on real disposable PostgreSQL 16.15.**

This proves the clean migrations and current database contract execute. It does not claim production-hosting readiness until the later operational gates above pass.
