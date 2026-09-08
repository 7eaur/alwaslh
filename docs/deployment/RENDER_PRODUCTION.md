# Render Hosting — الوسيلة الذكية

Status: **PRIMARY HOSTING TARGET / INITIAL FREE TEST MODE / FIRST BLUEPRINT APPLY PENDING** as of 2026-09-08.

## 1. Hosting authority

Render is the primary hosting platform for the rebuilt product.

Deployment source branch: `main`.

Development continues on short-lived Backend/Frontend/Integration branches. A feature reaches the hosted environment only after Integration acceptance and merge into `main`; Render then auto-deploys from `main`.

Legacy pre-cutover `main` is preserved at `archive/legacy-main-2026-09-08` and is rollback/reference history only.

## 2. Current cost mode

The initial Render rollout intentionally uses **free test resources** so development can continue without a recurring hosting bill:

- Student static site — free.
- Admin static site — free.
- Fastify Docker API — Render Free Web Service.
- PostgreSQL — Render Free Postgres.

This mode is for development/testing, not final production reliability.

Important Render limitations:

- Free Web Services spin down after inactivity and may take roughly a minute to wake.
- Free Web Services have ephemeral filesystems and cannot attach persistent disks.
- Free Render Postgres is limited to 1 GB and expires after 30 days unless upgraded.
- Free Postgres has no production backup guarantees.

Therefore no valuable uploaded media may be treated as durable while free mode is active.

## 3. Render topology

Root `render.yaml` declares:

```text
Student static site ─┐
                     ├── Docker Fastify API ── Render Free PostgreSQL
Admin static site ───┘
```

Resources:

- `alwaslh-prod-student-7eaur` — Student Vite static/CDN.
- `alwaslh-prod-admin-7eaur` — Super Admin Vite static/CDN.
- `alwaslh-prod-api-7eaur` — Dockerized Fastify service on free compute during test mode.
- `alwaslh-prod-postgres-7eaur` — Render PostgreSQL 16 on free plan during test mode.

Region: `frankfurt` for API/database locality.

Render Blueprint preview environments are explicitly disabled. Hosted deploy source is `main` only.

## 4. Why API uses Docker

Stage10 PDF processing executes OS binaries `pdfinfo` and `pdftoppm` from Poppler. The API therefore uses `apps/api/Dockerfile` based on pinned Node `22.22.0` and explicitly installs `poppler-utils`, `ca-certificates`, and `gosu`.

This keeps PDF processing reproducible and avoids depending on undeclared host packages.

## 5. Runtime version pinning

Root `.node-version` pins `22.22.0` for Render static-site builds. The API Docker image is also explicitly `node:22.22.0-bookworm-slim`.

## 6. Database lifecycle in free mode

`DATABASE_URL` is injected from the Render PostgreSQL resource.

`DATABASE_SSL=disable` is intentional only for same-workspace Render connectivity.

The API runs migrations before startup using:

```text
node apps/api/dist/migrate.js
```

The migrator remains checksum-protected, idempotent, and advisory-lock guarded.

Because the free Render database expires after 30 days, it is a temporary development datastore only. Before expiry, Integration must either upgrade it or explicitly migrate to the next approved datastore.

## 7. Media limitation in free mode

`MEDIA_STORAGE_ROOT=/app/runtime-data/media` remains configured, but without a persistent disk this path is ephemeral.

Consequences:

- image/PDF ingestion can be exercised for short-lived functional testing;
- uploaded media can disappear on service restart, spin-down, or redeploy;
- no production content should be entrusted to this storage;
- Stage13D durability is **NOT YET VERIFIED on hosted free mode**.

Do not workaround this by storing arbitrary files inside PostgreSQL or by reintroducing legacy storage coupling. When durable hosted uploads become required, upgrade the API to paid compute and attach the documented persistent disk, or introduce a separately approved shared/object-storage adapter.

## 8. AI worker hosting boundary

Stage12 verified durable worker abstractions but the repository still lacks an authorized production worker bootstrap with approved provider routing/credentials.

No Render background worker is declared yet. Do not run a polling worker inside Fastify as a shortcut.

## 9. Frontend/API contract

Both static sites compile with:

`VITE_API_BASE_URL=https://alwaslh-prod-api-7eaur.onrender.com`

API hosted CORS allows only:

- `https://alwaslh-prod-student-7eaur.onrender.com`
- `https://alwaslh-prod-admin-7eaur.onrender.com`

Sessions remain server-owned, HttpOnly, Secure in hosted mode and `SameSite=Lax`; frontend calls use `credentials: include`.

## 10. Delivery workflow

```text
Backend/Frontend short branch
→ REPORT + tests
→ Integration review
→ cross-boundary gates
→ merge accepted state to main
→ Render auto-deploy
→ hosted verification
→ central evidence update
```

A Git commit alone is not release approval.

## 11. Vercel retirement

The former Vercel build/serverless proxy path is removed. A minimal root `vercel.json` retirement guard remains only to block Git-triggered Vercel deployments while the external Vercel project is still linked.

This file is a kill-switch, not a deployment path.

## 12. Supabase retirement boundary

The old Alwaslh Supabase resource remains available temporarily as rollback/continuity evidence. Do not delete it during the Render transition.

Because the initial Render database is free/temporary, do not pause the old Supabase project merely because the first free deployment becomes reachable. Provider retirement should wait until a durable replacement has been accepted.

## 13. Verification after first Render apply

Before calling hosted runtime VERIFIED:

- Render PostgreSQL exists and migrations apply successfully;
- Docker API builds with Poppler;
- API `/health` and `/ready` return 200;
- Student and Admin static sites are live;
- CORS/session flows work from both frontends;
- core Student and Admin smoke flows pass;
- Stage13D image/PDF processing works functionally;
- media persistence remains explicitly `NOT YET VERIFIED` in free mode;
- Render logs show no startup/migration/runtime errors.

Free mode can be accepted as a development/test environment, but not as final production durability.
