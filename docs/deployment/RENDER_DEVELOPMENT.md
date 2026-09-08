# Render Development Environment — الوسيلة الذكية

Status: **DEVELOPMENT / TEST HOSTING ONLY** as of 2026-09-08.

Render is not the final production hosting authority for Alwaslh. It is a temporary zero-cost environment used to exercise the rebuilt product while development continues. Final hosting is expected to move to a VPS or Railway after the product and deployment requirements stabilize.

## Development topology

The root `render.yaml` declares only free development resources:

```text
Student static site ─┐
                     ├── Docker Fastify API ── Render Free PostgreSQL
Admin static site ───┘
```

Resource names deliberately use `dev`:

- `alwaslh-dev-student-7eaur`
- `alwaslh-dev-admin-7eaur`
- `alwaslh-dev-api-7eaur`
- `alwaslh-dev-postgres-7eaur`

All are sourced from `main`. Render Preview generation is disabled.

## Why the API remains Dockerized

The API media pipeline executes Poppler binaries (`pdfinfo` / `pdftoppm`). The committed Docker image pins Node `22.22.0` and installs `poppler-utils`, so the runtime remains reproducible and portable to a future VPS or Railway deployment.

Do not rewrite the API around a hosting-provider-specific runtime just to make the temporary test environment cheaper.

## Free-tier limitations accepted for development

The free Render web service may sleep when idle and has an ephemeral filesystem. The free Render PostgreSQL database is a temporary development database and must not be treated as long-term production storage.

Consequences:

- image/PDF upload flows can be tested during a running deployment;
- uploaded files may disappear after restart/redeploy;
- persistence-across-redeploy is therefore `NOT YET VERIFIED` in this environment;
- this limitation must never be mistaken for the final media-storage architecture;
- no production data should depend on this environment.

Free-plan migrations run before the API server in the Docker command:

```text
node apps/api/dist/migrate.js && node apps/api/dist/server.js
```

The migrator is checksum-protected, idempotent and advisory-lock guarded.

## Frontend/API contract

Student and Admin builds target:

`https://alwaslh-dev-api-7eaur.onrender.com`

API CORS allows only:

- `https://alwaslh-dev-student-7eaur.onrender.com`
- `https://alwaslh-dev-admin-7eaur.onrender.com`

Sessions remain server-owned and credentialed requests remain explicit.

## Development delivery workflow

```text
Backend/Frontend short branch
→ REPORT + self-review
→ Integration review
→ same-head verification when available
→ accepted merge to main
→ Render development auto-deploy
→ hosted smoke/regression observation
```

A Render development deployment does not by itself promote a feature to `VERIFIED`; Integration evidence still controls stage closure.

## Future production migration boundary

The final production target is intentionally not locked to Render. VPS or Railway are expected candidates.

The current architecture is kept portable:

- Dockerized Fastify API;
- PostgreSQL via `DATABASE_URL`;
- environment-driven CORS/session configuration;
- migration runner independent of hosting provider;
- media storage behind application storage authority rather than frontend ownership.

Before final production, choose durable media storage and database topology based on real scale/cost requirements. Do not overengineer them during the temporary free-hosting phase.

## Old hosting retirement

The previous Vercel deployment path remains disabled through the minimal root `vercel.json` kill-switch. Old Supabase resources are retained only as historical/rollback resources unless a later explicit retention decision changes that.

## Development verification after Blueprint Apply

Verify:

- free PostgreSQL is provisioned and migrations apply;
- API Docker image builds and `/health` + `/ready` work;
- Poppler works through a real PDF-processing flow;
- Student/Admin static sites load;
- CORS/session flows work from both development origins;
- Student activation/login/recovery smoke;
- Admin curriculum/content smoke;
- Stage13D mixed image/PDF flow works during the active deployment;
- logs show no startup/migration/security defects.

Do **not** require media survival across Render Free redeploys; that is an acknowledged free-environment limitation and remains `NOT YET VERIFIED` until durable final hosting/storage exists.
