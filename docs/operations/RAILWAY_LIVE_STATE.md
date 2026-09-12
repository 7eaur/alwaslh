# RAILWAY LIVE STATE — الوسيلة الذكية

> Operational source for the currently hosted inspection/dev stack. Repository code/migrations and live Railway state outrank this prose. Do not place secrets in this file.

Last synchronized: **2026-09-12**.

## 1. Purpose and release status

The project is currently hosted on Railway so the Product Owner can inspect the integrated product in a real environment. This environment is **live and verified for inspection/development**, but it is **not declared the final Stage28 production cutover**.

Railway project:

- Project name: `charming-peace`
- Project ID: `b5481a3d-7078-476e-b63c-c07b57c28c6f`
- Environment name: `production`
- Environment ID: `38c1dc2a-58b3-4f5a-9098-85df7f879035`
- Source repository: `7eaur/alwaslh`
- Source branch: `main`

The Railway environment name is `production`, but product-release semantics remain controlled by the repository roadmap. Do not infer Stage28 completion from the Railway environment name.

## 2. Public URLs

- Student Web: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin Web: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

No custom domain is currently attached.

## 3. Services

### API

- Service: `alwaslh-dev-api-7eaur`
- Service ID: `914ded1d-1404-4967-a99a-97474a4c909b`
- Latest verified deployment at this sync: `5b889f87-24a5-4fc4-b061-9aeea3f5bea6` — **SUCCESS**
- Builder: Dockerfile
- Dockerfile: `apps/api/Dockerfile`
- Build context/root: repository root `/`
- Start command: `node apps/api/dist/server.js`
- Pre-deploy migration command: `node apps/api/dist/migrate.js`
- Health endpoint: `/ready`
- Health timeout: 120s
- Verified post-content-bootstrap health response: HTTP **200**
- Watch paths: `apps/api/**`, `database/migrations/**`

Configured variable names include normal database/session/CORS/media settings and `OFFLINE_AUTH_SIGNING_PRIVATE_KEY_PEM_B64`. **Never copy secret values into repository documentation, chat, frontend variables or logs.**

### Admin Web

- Service: `alwaslh-dev-admin-7eaur`
- Service ID: `7b873947-afb1-408d-9976-ceb587a2698f`
- Latest verified deployment at this sync: `bc79cdf9-6219-49eb-a158-575a16d80233` — **SUCCESS**
- Dockerfile: `apps/admin-web/Dockerfile`
- Source/build root: repository root `/`
- Public API is supplied through `VITE_API_BASE_URL`.
- Runtime uses the static Nginx image produced by the Docker build.

### Student Web

- Service: `alwaslh-dev-student-7eaur`
- Service ID: `a030601e-5a92-413a-af00-04385b550a76`
- Latest verified deployment at this sync: `9766a6ee-593e-4778-99e8-f8d0cce7ba2c` — **SUCCESS**
- Dockerfile: `apps/student-web/Dockerfile`
- Source/build root: repository root `/`
- Public API is supplied through `VITE_API_BASE_URL`.
- Offline authorization verification uses the **public** verification key variable `VITE_OFFLINE_AUTH_PUBLIC_KEY_SPKI`; no signing private key belongs in Student Web.

### PostgreSQL

- Service: `alwaslh-dev-postgres-7eaur`
- Service ID: `5fe83eeb-f7d6-4198-b76f-6276b0da7e00`
- Latest verified deployment at this sync: `3223001d-766f-4f57-833a-7ffcd2558ed8` — **SUCCESS**
- Persistent volume ID: `4d6a193c-071c-4ea8-84b8-fca53dbe2b8a`
- Mount path: `/var/lib/postgresql/data`
- Current volume size: 500 MB

Railway PostgreSQL is the active hosted runtime database. The old Supabase database is **not** a runtime dependency and must not be imported from unless the Product Owner explicitly reopens that scope.

## 4. Media storage

API persistent media volume:

- Volume: `alwaslh-media-storage`
- Volume ID: `2a76fdb9-1530-456b-bbd6-2cd33deb5cc8`
- Mount path: `/app/runtime-data/media`
- Current size: 500 MB
- Region: `sfo`
- `MEDIA_STORAGE_ROOT` points to this mounted path.

The Grade 9 English proof imported real source bytes into this volume. Before bulk materializing all canonical source images, measure required storage and resize/provision capacity if necessary; do not assume 500 MB is sufficient.

## 5. Deployment history / root fixes

The first hosted attempts failed because Railway configuration did not match the repository monorepo layout:

- API originally used an app-only build context while its Dockerfile expected the repository root and `database/migrations`.
- Admin/Student Railpack builds could not resolve shared `packages/*` dependencies reliably.
- The final stable setup uses repository-root Docker builds for API, Admin and Student.
- Frontend Docker images serve Vite output via Nginx with SPA fallback.
- Student build quality gates were separated from production Vite build variables so unit tests continue to validate relative transport contracts honestly.

Observed Railway caveat:

- direct/manual `redeploy` calls were observed selecting root Railpack despite the service being configured with `apps/api/Dockerfile`;
- commit-based deployment through the Railway deployment path/agent correctly honored the Dockerfile;
- if a future manual redeploy unexpectedly logs `Railpack` at repository root, stop and correct the deployment path rather than modifying application dependencies to satisfy the wrong builder.

## 6. Content bootstrap deployment

Grade 9 English bootstrap execution:

- Bootstrap deployment: `8428981b-aa6d-4927-b1f9-31545265e3f9`
- Canonical source: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`
- Result: 75 source images, 75 ready media assets, 300 variants, 75 Draft lesson assets, 10 lessons.

After bootstrap the API start command was restored to the normal server command and the stable deployment `5b889f87...` passed `/ready` with HTTP 200. The bootstrap command is **not** part of the normal start command and must not be reintroduced as a permanent boot side effect.

## 7. Safe deployment procedure for future work

1. Start from live `main`; use a short-lived feature branch.
2. Run the relevant exact-head GitHub Actions gates and wider regression when shared/runtime code changes.
3. Merge only verified work to `main`.
4. Confirm Railway service configuration still points to repository-root Dockerfiles before deployment.
5. API migrations remain pre-deploy and must finish before runtime health acceptance.
6. Confirm API `/ready`, then Admin and Student HTTP availability.
7. For media/content batches, verify database counts + media volume results + publication state separately from app health.
8. Never expose secrets in frontend build variables or repository docs.
9. Do not call the inspection/dev stack a final release until Stage27/28 release gates are explicitly completed.

## 8. NOT YET VERIFIED / remaining hosting work

- custom domain / TLS product-domain cutover;
- final backup/restore drill on the release candidate;
- final capacity sizing for full canonical media load;
- production monitoring/alerting/incident runbooks from Stage29;
- final Stage27 release gate and Stage28 production-cutover declaration.

Current hosting is sufficient for live product inspection and controlled content proofs, not evidence that the entire release roadmap is complete.
