# Stage 5 — Engineering Foundation Definition of Done

Stage 5 is not complete until all runtime checks below pass in CI on a clean runner.

## API runtime

- [x] Dedicated `apps/api` package exists.
- [x] Node.js runtime version contract is explicit.
- [x] Environment is validated at process startup.
- [x] PostgreSQL access is isolated behind a pool/database boundary.
- [x] `/health` checks process health only.
- [x] `/ready` checks PostgreSQL readiness and returns 503 when unavailable.
- [x] Public error envelope does not leak internal errors.
- [x] Graceful SIGTERM/SIGINT shutdown closes database connections.
- [x] Request/body/time limits have explicit safe defaults.

## Database engineering

- [x] Version-controlled SQL migrations remain canonical.
- [x] Application migration runner serializes execution using a PostgreSQL advisory lock.
- [x] Migration runner records SHA-256 checksums.
- [x] Applied migrations cannot silently change on disk.
- [x] Re-running the migration runner skips already-applied unchanged migrations.

## Verification

The CI gate must run on a clean GitHub runner and a disposable PostgreSQL 16 instance:

- [ ] API dependency install PASS.
- [ ] API strict typecheck PASS.
- [ ] API unit tests PASS.
- [ ] API production build PASS.
- [ ] API migration runner applies all four baseline migrations PASS.
- [ ] API migration runner second execution proves idempotent skip behavior PASS.
- [ ] Admin dependency install/typecheck/build PASS.
- [ ] Student dependency install/typecheck/build PASS.
- [ ] Existing Stage 1–4 gates remain green on the same branch head.

## Gate result

**PENDING CI.** Stage 6 Auth & Authorization must not begin until every unchecked Stage 5 verification item is green.
