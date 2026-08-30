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

Verified on GitHub Actions clean runners with PostgreSQL 16:

- [x] API dependency install PASS.
- [x] API lint PASS.
- [x] API strict typecheck PASS.
- [x] API unit tests PASS — 7/7.
- [x] API production build PASS.
- [x] API migration runner applies all four baseline migrations PASS.
- [x] API migration runner second execution proves idempotent skip behavior PASS.
- [x] `schema_migrations` records exactly four baseline migrations PASS.
- [x] Admin dependency install/typecheck/production build PASS.
- [x] Student dependency install/typecheck/production build PASS.
- [x] Existing Stage 1–4 gates remain green on the same branch head.

## Failures found and corrected by the gate

1. Biome rejected formatting drift in API source; source files were formatted rather than weakening the gate.
2. Admin/Student Vite builds inherited the legacy root PostCSS/Tailwind configuration; each rebuilt app now owns an isolated PostCSS configuration.

## Gate result

**PASS — Stage 5 Engineering Foundation is closed. Stage 6 Auth & Authorization may begin.**
