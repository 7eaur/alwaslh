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
- [x] Selected answer must belong to the same question.
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

## Verification boundary

- [x] Static relational/constraint review completed for Stage 4 baseline.
- [ ] Migrations executed against a real clean PostgreSQL instance — **NOT YET RUN** because hosting/database runtime has not been provisioned in this connected environment.
- [ ] `database/tests/schema_smoke.sql` executed on PostgreSQL — **NOT YET RUN** for the same reason.
- [ ] Connection-pool/load measurements — later infrastructure/performance gate.
- [ ] Backup restore drill — production/staging operations gate.

## Gate result

**Stage 4 DESIGN/SCHEMA BASELINE: PASS.**

Stage 5 may build the backend/engineering foundation against these contracts. Before production release, all unchecked runtime/infrastructure items above must pass on a real PostgreSQL environment.
