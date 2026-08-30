# PostgreSQL Backup & Restore Runbook

Self-hosting PostgreSQL means backup/restore is a product requirement, not an optional operations task.

## Goals

- Recover from operator mistakes, failed migrations, disk/server failure and corruption.
- Keep at least one encrypted backup outside the application server.
- Prove restore works before production launch.

## Baseline policy

### Daily logical backup

Use `pg_dump` in custom format from a restricted backup process:

```bash
pg_dump \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="alwaslh-$(date -u +%Y%m%dT%H%M%SZ).dump" \
  "$DATABASE_URL"
```

The real `DATABASE_URL` is supplied through server secret management and must never appear in scripts committed to Git.

### Off-host copy

Every successful backup is copied to encrypted storage outside the production server. A disk failure must not destroy both database and backup.

### Retention starting point

- daily: 14 copies;
- weekly: 8 copies;
- monthly: 6 copies.

Adjust after measuring production data growth and hosting capacity.

### Before high-risk migration

Create an explicit pre-deploy backup and record its identifier in the deployment log.

## Point-in-time recovery

If the hosting setup supports WAL archiving safely, enable PITR in the infrastructure stage. WAL archive credentials and destination are infrastructure secrets.

Logical daily backups remain required even when PITR exists because they provide a portable recovery artifact.

## Restore drill

At least monthly during active production operation, restore the newest backup into a separate non-production database.

Example:

```bash
createdb alwaslh_restore_test
pg_restore \
  --exit-on-error \
  --no-owner \
  --no-acl \
  --dbname=alwaslh_restore_test \
  /secure-backups/alwaslh-YYYYMMDDTHHMMSSZ.dump
```

Then run:

1. migration/schema version check;
2. `database/tests/schema_smoke.sql` where appropriate on a disposable database;
3. row-count sanity checks;
4. API smoke tests once the backend exists.

Destroy the restore-test database after verification.

## Monitoring

Alert on:

- backup command failure;
- backup file unexpectedly tiny/empty;
- off-host upload failure;
- no successful backup within expected period;
- restore drill failure;
- rapid database size growth.

## Recovery priorities

1. Stop writes if continued operation may worsen corruption.
2. Preserve current damaged state for investigation when possible.
3. Choose recovery point.
4. Restore into a separate database first when time allows.
5. Verify schema and key product flows.
6. Switch application only after verification.
7. Record incident and root cause.

## Definition of verified backup

A generated `.dump` file alone is **not** a verified backup.

Backup status becomes VERIFIED only after a restore completes and the restored database passes structural/application checks.
