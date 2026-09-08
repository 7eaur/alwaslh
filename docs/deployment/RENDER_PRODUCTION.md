# Render Production Deployment — الوسيلة الذكية

Status: **ACTIVE PRODUCTION HOSTING TARGET** as of 2026-09-08.

## 1. Production authority

Render is now the primary hosting platform for the current rebuilt product.

Production source branch:

`main`

Development continues on short-lived Backend/Frontend/Integration branches. A feature is promoted to production only after Integration acceptance and merge into `main`. Render auto-deploys from `main`; feature branches are not production deploy sources.

The legacy `main` head from before this cutover is preserved at:

`archive/legacy-main-2026-09-08`

It is rollback/reference history only and must not be used as the current architecture target.

## 2. Render topology

All current hosted product surfaces are declared in root `render.yaml`:

```text
Student static site ─┐
                     ├── public Fastify API ── Render Managed PostgreSQL
Admin static site ───┘           │
                                 └── persistent media disk
```

Resources:

- `alwaslh-prod-student-7eaur` — Student Vite static site / CDN.
- `alwaslh-prod-admin-7eaur` — Super Admin Vite static site / CDN.
- `alwaslh-prod-api-7eaur` — Fastify Node web service.
- `alwaslh-prod-postgres-7eaur` — Render Managed PostgreSQL 16.
- `alwaslh-prod-media-7eaur` — persistent disk mounted only on the API service at `/opt/render/project/src/runtime-data/media`.

Region: `frankfurt` for API/database locality and proximity to the expected user region.

## 3. Why the API is not free-tier

Stage13D stores uploaded canonical media through `FileSystemMediaStorage`. Render web-service filesystems are ephemeral unless a persistent disk is attached. Therefore production API deployment requires a paid web-service plan that supports a disk. Deploying uploads onto an ephemeral filesystem is explicitly rejected because files would disappear on restarts/deploys.

The initial declaration intentionally uses the smallest practical durable topology:

- API: `starter`;
- PostgreSQL: `basic-256mb`, 1 GB initial storage;
- media disk: 1 GB initially, grow-only;
- Student/Admin static sites: CDN/static hosting.

Review capacity/cost after real metrics; do not scale before evidence.

## 4. Database lifecycle

`DATABASE_URL` is injected from the Render PostgreSQL resource and uses Render's same-region private network.

`DATABASE_SSL=disable` is intentional for the internal same-workspace connection. External database connections must use TLS separately.

The API start command runs:

```text
npm run db:migrate --prefix apps/api
→ npm start --prefix apps/api
```

The repository migrator is idempotent, checksum-protected, and guarded by a PostgreSQL advisory lock. This allows safe restart/deploy migration execution while the API remains single-instance because the persistent disk itself enforces that constraint.

No legacy Supabase schema/database is the production authority.

## 5. Media durability

`MEDIA_STORAGE_ROOT` must equal the Render disk mount:

`/opt/render/project/src/runtime-data/media`

Do not change this to `/tmp`, a build directory, or any ephemeral path in production.

Render persistent disks are single-service and single-instance resources. Consequences accepted for the current Stage13 architecture:

- API horizontal autoscaling is not enabled while filesystem media authority remains local-disk based;
- deploys can have brief restart downtime;
- the AI worker cannot assume access to this disk from another Render service.

If future architecture needs horizontally scaled media consumers, replace filesystem media storage with an explicit shared object-storage adapter through a separate architecture decision. Do not fake shared-disk semantics.

## 6. AI worker hosting boundary

Stage12 verified the worker runtime abstraction, but the repository explicitly does **not** yet contain a production `worker.ts` bootstrap with benchmark-authorized live provider routes/credentials.

Therefore no Render background worker is declared yet.

This remains `NOT YET VERIFIED` until the authorized provider benchmark/configuration work produces a real standalone bootstrap. At that point add a Render worker through `render.yaml`; do not run the durable worker loop inside Fastify merely to make hosting easier.

## 7. Frontend/API contract

Both static sites compile with:

`VITE_API_BASE_URL=https://alwaslh-prod-api-7eaur.onrender.com`

The API allows only the two production static-site origins in `ALLOWED_ORIGINS`.

Session cookies remain server-owned, HttpOnly, Secure in production and `SameSite=Lax`. Browser calls use `credentials: include`.

When custom domains are introduced, update all three together:

1. Render custom domains/TLS;
2. `VITE_API_BASE_URL` for Student/Admin;
3. API `ALLOWED_ORIGINS`.

Never broaden production CORS to `*` while credentialed sessions are used.

## 8. Production delivery workflow

```text
Backend/Frontend short branch
→ workstream REPORT + tests
→ Integration review
→ integration candidate / cross-boundary gates
→ merge accepted state to main
→ Render auto-deploy from main
→ hosted health/runtime verification
→ deployment evidence recorded in central docs
```

A GitHub commit by itself is not a release approval. Only Integration-approved changes reach `main`.

## 9. Old deployment path retirement

The current rebuilt product no longer uses the former single-project Vercel preview/serverless proxy path.

Removed at cutover:

- root `vercel.json`;
- `scripts/build-vercel-preview.mjs`;
- `api/[...path].js` Vercel serverless adapter.

Legacy Supabase/Cloudflare material may remain only where it is historical/audit/reference content. It is not current deployment authority.

If an old Vercel/Supabase project remains connected in a provider dashboard, disconnect/delete its Git deployment hook after Render is confirmed live. Do not delete old external data merely as part of hosting cutover.

## 10. Verification required after first Render apply

Before calling hosted runtime VERIFIED:

- Render database status healthy;
- migrations applied successfully;
- API deploy `live`;
- `GET /health` returns 200;
- `GET /ready` returns 200 and proves DB connectivity;
- Student static deploy live;
- Admin static deploy live;
- CORS/session login path works from both frontends;
- Student activation/login/recovery smoke path;
- Admin login/curriculum/content operations smoke path;
- persistent media upload survives an API redeploy/restart;
- no secrets/raw provider metadata in browser responses;
- Render logs contain no startup/migration/runtime errors.

Until these checks execute, Render hosting is configured/deploying but hosted runtime remains `NOT YET VERIFIED`.
