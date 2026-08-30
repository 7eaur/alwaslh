# PostgreSQL Database

Target production database for the rebuilt **الوسيلة الذكية**.

## Principles

- PostgreSQL is self-hosted in the same hosting environment as backend services.
- Frontends never receive database credentials and never connect directly to PostgreSQL.
- Version-controlled SQL migrations are the target schema source of truth.
- The existing Supabase database is a legacy migration source only.

## Layout

```text
database/
  migrations/
    0001_core.sql
    0002_access.sql
    0003_learning.sql
    0004_ai.sql
  tests/
    schema_smoke.sql
  deploy/
    roles.sql.example
```

## Apply to a clean database

Use the deployment/migration runner chosen in the backend foundation stage. For manual staging verification, apply migrations in numeric order using a privileged migration role.

Never run development reset/drop scripts against production.

## Required PostgreSQL

Target baseline: PostgreSQL 16+ unless the production host requires another currently supported major version. The initial schema uses only standard PostgreSQL features plus `pgcrypto` for UUID generation.

## Verification

After migrations, run `database/tests/schema_smoke.sql`. Integration tests for concurrent redemption and business authorization are added with the API/auth stages because they require runtime transaction/session behavior.
