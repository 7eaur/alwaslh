# Stage 4 — PostgreSQL Data Platform Architecture

## Decision

**Target database:** self-hosted PostgreSQL on the same production hosting/server environment as the backend services.

Supabase is **not** the target platform for the rebuilt product. The existing Supabase project remains a **legacy migration source** only until all required data is reconciled and migrated.

## Why this architecture

- PostgreSQL remains the canonical relational database.
- The browser never connects directly to PostgreSQL.
- Admin and Student applications communicate through the backend API.
- Authentication, authorization, entitlement, AI jobs and writes are enforced server-side.
- Database portability is preserved; the product is not coupled to a hosted proprietary Data API.
- The same-hosting requirement reduces external platform dependency while keeping a clean service boundary.

## Target topology

```text
Internet
  |
  +-- Admin Web
  +-- Student PWA
          |
          v
      Backend API
          |
          +-- PostgreSQL (private network / localhost only)
          +-- Object storage/media service
          +-- AI workers / job runners

PostgreSQL is NOT exposed to public clients.
```

## Database boundary

Only these server processes may hold database credentials:

1. API runtime.
2. Background workers.
3. Migration/deployment process.
4. Backup/restore process.

No `DATABASE_URL` is shipped to frontend bundles.

## Roles

Production uses separate credentials/roles:

- `alwaslh_owner` — owns schema; deployment only; no application traffic.
- `alwaslh_migrator` — migration role; DDL privileges required by migrations.
- `alwaslh_app` — API/worker runtime; CRUD only on explicitly granted application objects.
- `alwaslh_readonly` — optional reporting/diagnostics read access.
- `postgres`/superuser — infrastructure administration only; never used by the app.

Passwords/secrets are created by deployment secret management and are never committed.

## Connection rules

- PostgreSQL listens only on a private interface / local network where possible.
- Public TCP/5432 access is forbidden.
- TLS is required if database traffic crosses hosts.
- API uses a bounded connection pool.
- Application connection limits must leave capacity for migrations, backups and operator sessions.
- Long-running AI work never holds a SQL transaction while calling Gemini or processing media.

## Transaction rules

Transactions are mandatory for:

- full-access code redemption;
- class-code redemption;
- entitlement creation/revocation;
- quiz completion + derived attempt state;
- publishing a complete content import batch;
- state transitions that must be idempotent.

External calls (Auth provider, storage, Gemini) are never performed inside a PostgreSQL transaction. Use idempotency keys and compensating actions around those boundaries.

## Canonical ownership

Every student-owned server record references `profiles.id` (UUID). No student ownership key is a plaintext access code, browser fingerprint or device ID.

`profiles.auth_subject` is a provider-neutral unique identity link. Stage 6 will define the final authentication implementation without requiring the product-domain schema to store plaintext/reversible credentials.

## Data domains

### Identity / profile
- `profiles`

### Curriculum
- `classes`
- `subjects`
- `subject_class_links`
- `lessons`
- `lesson_assets`

### Entitlement / activation
- `full_access_codes`
- `class_access_codes`
- `access_redemptions`
- `student_entitlements`

### Learning
- `quizzes`
- `quiz_lessons`
- `quiz_versions`
- `questions`
- `question_options`
- `practice_sessions`
- `practice_answers`
- `quiz_attempts`
- `saved_questions`
- `student_achievements`
- `notifications`

### AI operations
- `ai_jobs`
- `ai_job_units`
- `ai_outputs`

## Important invariants

1. Full-access codes are exactly six ASCII digits after normalization.
2. Class codes are exactly seven ASCII digits after normalization.
3. Redemption is server-side and atomic.
4. An entitlement has exactly one supported scope: all-content or one class.
5. Lesson assets contain an explicit stable `position`; upload completion order never defines page order.
6. Quiz questions use stable UUIDs; UI array index is never identity.
7. Score is derived from recorded answers, not trusted from client input.
8. AI outputs are not published without schema + semantic validation state.
9. All important timestamps use `timestamptz` and UTC at the database boundary.
10. Deletions that affect offline clients produce revision/tombstone information in the later sync subsystem.

## Migration strategy

Repository migrations under `database/migrations/` are the source of truth for the target database.

Rules:

- append-only numbered migrations after release;
- each migration must be rerunnable only when explicitly designed as idempotent;
- staging is built from zero using repository migrations;
- production schema is never edited manually without a corresponding migration;
- destructive migrations require backup + rehearsal + rollback/data recovery plan.

## Legacy Supabase migration source

The old Supabase database is not repaired into the target schema. It will later be connected in read-only mode for:

- schema/data inventory;
- account/profile reconciliation;
- class/subject/lesson mapping;
- access/class-code migration;
- quizzes/questions/attempts/progress migration;
- notifications/achievements migration;
- storage-object reference extraction.

Migration tooling must produce counts and reconciliation reports. Legacy IDs are recorded in migration mapping tables/tooling, not reused as unsafe ownership semantics.

## Backup / restore baseline

Before production release:

- automated daily logical backup;
- frequent WAL/physical backup strategy if hosting supports it;
- encrypted off-host backup copy;
- documented retention policy;
- monthly restore drill to a non-production database;
- backup monitoring/alerting;
- pre-migration snapshot/backup for high-risk releases.

A backup that has never been restored is not considered verified.

## Observability baseline

Track at minimum:

- active/idle connections;
- connection saturation;
- slow queries;
- lock waits/deadlocks;
- database size and table/index growth;
- backup success/failure;
- transaction error rate;
- job queue depth/age once AI jobs are enabled.

## Stage 4 Definition of Done

- [x] PostgreSQL target platform selected.
- [x] Same-hosting deployment boundary documented.
- [x] Direct browser/database access rejected.
- [x] Production DB role model documented.
- [x] Target domain schema established as version-controlled migrations.
- [x] Code/entitlement/content-order invariants represented in database constraints.
- [x] Backup/restore baseline documented.
- [x] Legacy Supabase classified as migration source, not target.
- [x] Smoke-test SQL added for clean-schema verification.
- [ ] Actual production PostgreSQL instance provisioned — infrastructure access not yet provided.
- [ ] Legacy Supabase live data connected/read — migration execution stage, NOT required to approve the target platform architecture.

**Stage 4 architecture status: COMPLETE / APPROVED BASELINE.**
