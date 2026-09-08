# Render Production Deployment — الوسيلة الذكية

Status: **ACTIVE PRODUCTION HOSTING TARGET / FIRST BLUEPRINT APPLY PENDING** as of 2026-09-08.

## 1. Production authority

Render is the primary hosting platform for the rebuilt product.

Production source branch: `main`.

Development continues on short-lived Backend/Frontend/Integration branches. A feature reaches production only after Integration acceptance and merge into `main`; Render then auto-deploys from `main`.

Legacy pre-cutover `main` is preserved at `archive/legacy-main-2026-09-08` and is rollback/reference history only.

## 2. Render topology

Root `render.yaml` declares:

```text
Student static site ─┐
                     ├── Docker Fastify API ── Render Managed PostgreSQL
Admin static site ───┘            │
                                  └── persistent media disk
```

Resources:

- `alwaslh-prod-student-7eaur` — Student Vite static/CDN.
- `alwaslh-prod-admin-7eaur` — Super Admin Vite static/CDN.
- `alwaslh-prod-api-7eaur` — Dockerized Fastify service.
- `alwaslh-prod-postgres-7eaur` — Render PostgreSQL 16.
- `alwaslh-prod-media-7eaur` — persistent API media disk mounted at `/app/runtime-data/media`.

Region: `frankfurt` for API/database locality.

Render Blueprint preview environments are explicitly disabled. Production deploy source is `main` only.

## 3. Why API uses Docker

Stage10 PDF processing executes OS binaries `pdfinfo` and `pdftoppm` from Poppler. Render's documented native runtime tool list does not guarantee Poppler.

Therefore the API uses `apps/api/Dockerfile` based on pinned Node `22.22.0` and explicitly installs:

- `poppler-utils` for PDF inspection/rendering;
- `ca-certificates`;
- `gosu` for dropping runtime privileges to the `node` user after preparing the media mount.

This makes the PDF runtime reproducible instead of relying on an undeclared host package.

`apps/api/docker-entrypoint.sh` prepares/chowns the media mount and then executes the application as the non-root `node` user.

The Docker image includes compiled API output plus `database/migrations`, so Render can run migrations without TypeScript tooling at runtime.

## 4. Runtime version pinning

Root `.node-version` pins `22.22.0` for Render static-site builds. The API Docker image is also explicitly `node:22.22.0-bookworm-slim`.

Do not rely on Render's changing Node default for production reproducibility.

## 5. Database lifecycle

`DATABASE_URL` is injected from the Render PostgreSQL resource through private same-workspace connectivity.

`DATABASE_SSL=disable` is intentional only for this internal Render connection. External DB connections require TLS.

For the paid Docker API service, Render runs the migration as a pre-deploy command:

```text
node apps/api/dist/migrate.js
```

Then the service starts with:

```text
node apps/api/dist/server.js
```

The migrator is checksum-protected, idempotent and guarded by a PostgreSQL advisory lock.

No legacy Supabase database/schema is the current production authority.

## 6. Media durability

`MEDIA_STORAGE_ROOT=/app/runtime-data/media` and the Render disk is mounted at the same path.

Current Stage13D media authority uses `FileSystemMediaStorage`; a Render service filesystem without an attached disk is ephemeral. Production uploads on ephemeral storage would be a data-loss defect and are prohibited.

Persistent-disk consequences accepted for the current architecture:

- API is single-instance while this local disk is authoritative;
- zero-downtime deploys are unavailable for the disk-backed API;
- other Render services cannot access this disk;
- pre-deploy jobs cannot access this disk, which is fine because migrations only need PostgreSQL.

Future horizontal scaling must introduce a real shared/object-storage adapter by architecture decision. Never simulate shared disk semantics.

## 7. AI worker hosting boundary

Stage12 verified durable worker abstractions but the repository still lacks an authorized production `worker.ts` bootstrap with benchmark-approved provider routes/credentials.

No Render background worker is declared yet. Do not run a polling worker inside Fastify as a hosting shortcut.

The worker becomes a separate Render service only after the live-provider/bootstrap stage is implemented and verified.

## 8. Frontend/API contract

Both static sites compile with:

`VITE_API_BASE_URL=https://alwaslh-prod-api-7eaur.onrender.com`

API production CORS allows only:

- `https://alwaslh-prod-student-7eaur.onrender.com`
- `https://alwaslh-prod-admin-7eaur.onrender.com`

Sessions remain server-owned, HttpOnly, Secure in production and `SameSite=Lax`; frontend calls use `credentials: include`.

When custom domains are added, update Render domains/TLS, both frontend API build values, and API `ALLOWED_ORIGINS` together. Never use credentialed CORS `*`.

## 9. Production delivery workflow

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

## 10. Vercel retirement

The rebuilt product no longer uses the former Vercel build/serverless proxy path.

Removed:

- `scripts/build-vercel-preview.mjs`;
- `api/[...path].js` serverless adapter;
- all former Vercel build/rewrite runtime configuration.

A **minimal root `vercel.json` retirement guard is intentionally retained**:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": { "deploymentEnabled": false }
}
```

Reason: the external Vercel project `alwaslh` is still GitHub-linked. During cutover, removing the guard caused pushes to `main`/`planning` to create unwanted Vercel deployments. Restoring this guard stopped new automatic Git deployments in the observed follow-up check.

This file is not a deployment path; it is a kill-switch until the external Git integration is disconnected from Vercel. Do not delete it before provider-side unlink is confirmed.

Old Supabase/Cloudflare material may remain only as historical/audit/reference evidence. Do not delete external data as part of a hosting cutover.

## 11. Supabase retirement boundary

Connected Supabase inspection found a project whose public tables match the current rebuild schema (`ai_jobs`, `media_assets`, `content_source_assets`, `auth_sessions`, etc.). Because Render is not live yet, it remains active temporarily as a rollback/continuity resource.

Do not pause/delete it before Render DB/API/session/media verification passes. After Render is confirmed healthy, pause the old Alwaslh Supabase project rather than deleting data immediately; deletion requires a separate explicit data-retention decision.

## 12. Verification required after first Render apply

Before calling hosted runtime `VERIFIED`:

- Render PostgreSQL healthy;
- all migrations applied successfully;
- API image build succeeds and Poppler availability is confirmed by real PDF processing;
- API deploy `live`;
- `/health` returns 200;
- `/ready` returns 200 and proves DB connectivity;
- Student static deploy live;
- Admin static deploy live;
- CORS/session login works from both frontends;
- Student activation/login/recovery smoke;
- Admin login/curriculum/content smoke;
- Stage13D image + PDF/mixed ingestion succeeds;
- uploaded media survives API redeploy/restart;
- no credentials/raw provider internals leak;
- Render logs show no startup/migration/runtime errors.

Until these execute, Render hosting is configured but hosted runtime remains `NOT YET VERIFIED`.
