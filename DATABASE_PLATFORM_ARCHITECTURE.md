# Stage 4 — PostgreSQL Data Platform Architecture

## Decision

**Target database:** self-hosted PostgreSQL on the same production hosting/server environment as the backend services.

The rebuilt product is **clean-slate at the data-platform level**. The existing Supabase project is not a schema target and is not required for Stage 4 completion. The old project is used to preserve product idea, business scenarios, feature parity and useful content assets — not to constrain the new database design.

## Why this architecture

- PostgreSQL remains the canonical relational database.
- The browser never connects directly to PostgreSQL.
- Admin and Student applications communicate through the backend API.
- Authentication, authorization, entitlement, AI jobs and writes are enforced server-side.
- Database portability is preserved; the product is not coupled to a hosted proprietary Data API.
- The same-hosting requirement reduces external platform dependency while keeping a clean service boundary.
- We can model the product correctly from first principles instead of reproducing legacy ownership/RLS/schema mistakes.

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
          +-- Object/media storage
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
- Application connection limits leave capacity for migrations, backups and operator sessions.
- Long-running AI work never holds a SQL transaction while calling Gemini or processing media.

## Transaction rules

Transactions are mandatory for:

- full-access code redemption;
- class-code redemption;
- entitlement creation/revocation;
- quiz completion + derived attempt state;
- publishing a complete content import batch;
- state transitions that must be idempotent.

External calls (Auth, storage, Gemini) are never performed inside a PostgreSQL transaction. Use idempotency keys and compensating actions around those boundaries.

## Canonical ownership

Every student-owned server record references `profiles.id` (UUID). No student ownership key is a plaintext access code, browser fingerprint or device ID.

`profiles.auth_subject` is a provider-neutral unique identity link. The authentication stage will define the final credential/session implementation without requiring the product-domain schema to store plaintext or reversibly encrypted passwords.

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
- `achievement_definitions`
- `student_achievements`
- `notifications`

### Offline synchronization
- `content_revisions`
- `content_tombstones`
- `sync_checkpoints` (server/account metadata where required)

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
8. AI outputs are not publishable without schema + semantic validation state.
9. All important timestamps use `timestamptz`; application/API boundaries operate in UTC.
10. Deletions that affect offline clients create revision/tombstone information.
11. Every uniqueness/business rule that can be safely guaranteed by PostgreSQL is represented as a constraint/index, not only application code.
12. No JSONB is used as a substitute for relational structure where querying/integrity matters; JSONB is reserved for bounded metadata/configuration/snapshots.

## Migration strategy

Repository migrations under `database/migrations/` are the source of truth for the target database.

Rules:

- append-only numbered migrations after release;
- migrations are reviewed like application code;
- staging is built from zero using repository migrations;
- production schema is never edited manually without a corresponding migration;
- destructive migrations require backup + rehearsal + rollback/data recovery plan;
- seed/demo data is separate from schema migrations.

## Legacy project policy

The previous project is a **product specification and feature/reference source**, not a database compatibility target.

We preserve:

- product idea;
- required Student/Admin scenarios;
- activation-code semantics where intentionally retained;
- lessons/quizzes/notes/offline/AI/export workflows;
- useful curriculum/media assets from `alwaslh-go`.

We do **not** preserve merely for compatibility:

- legacy database IDs;
- old RLS assumptions;
- text-based student ownership keys;
- plaintext/reversible credential structures;
- duplicate entitlement models;
- accidental schema drift;
- unsafe triggers/functions/policies.

If selected old content/data is imported later, it is transformed into the new canonical model through explicit import tooling; the new schema will not bend around legacy defects.

## Backup / restore baseline

Before production release:

- automated daily logical backup;
- WAL/physical/PITR strategy when supported by hosting;
- encrypted off-host backup copy;
- documented retention policy;
- periodic restore drill to a non-production database;
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
- [x] Clean-slate target domain model established as version-controlled migrations.
- [x] Code/entitlement/content-order/ownership invariants represented in database constraints.
- [x] Learning/quiz/attempt ownership model represented with stable UUID identities.
- [x] AI job persistence model represented.
- [x] Offline revision/tombstone model represented.
- [x] Backup/restore baseline documented.
- [x] Previous Supabase schema explicitly rejected as compatibility target.
- [x] Smoke-test SQL provided for clean-schema verification.
- [ ] Actual production PostgreSQL instance provisioned — infrastructure deployment step, not a design blocker.

**Stage 4 architecture status: COMPLETE / APPROVED CLEAN-SLATE BASELINE.**
