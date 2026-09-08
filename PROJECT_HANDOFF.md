# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** a replacement engineer/chat must be able to resume from GitHub without prior conversation memory.

Last synchronized: 2026-09-08 — Render production cutover, Docker/Poppler correction and Vercel retirement guard.

## 0. Mandatory startup

Before changing code:

1. Confirm repo `7eaur/alwaslh`.
2. Treat **`main` as the production source branch**.
3. Read `README.md` → `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md`.
4. Main/Integration replacement also reads `PROJECT_INTEGRATION_CONTINUITY.md`.
5. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
6. Read `docs/workstreams/TEAM_OPERATING_MODEL.md` + role workstream.
7. Read latest Team Room `#13`, Backend `#14`, Frontend `#15`, Integration `#16` messages.
8. Hosting work: read root `render.yaml` + `docs/deployment/RENDER_PRODUCTION.md`.
9. Inspect actual code/migrations/tests before changing an area.
10. Live-check branch HEADs, GitHub Actions, Render resources/deploys/logs and external old hosting status.
11. Anything not inspected/executed = `NOT YET VERIFIED`.

## 1. Repository / Git / production state

- Repo: `7eaur/alwaslh`.
- Production branch: **`main`**.
- Render cutover began at `febd8ca2fe047a0b3a961bf73060289ed35e79c6`.
- Current Render runtime correction commit: `48334137aad5c975a25076bdb463d3d25ac3f258`.
- Previous legacy `main` preserved at `archive/legacy-main-2026-09-08` → `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- `planning/product-evolution-review` is kept synchronized for current engineering continuity but **is not a production deploy source**.
- Draft PR #12 remains historical/current-development context; its body may be stale.
- Latest fully verified application baseline remains `4eca7de8877ac9e2289b9c7990c912d33c256935`.

The force move of `main` was Product Owner-authorized and protected by the archive branch. Do not casually rewrite production history again.

## 2. Product idea

**الوسيلة الذكية** منصة تعليمية عربية لإدارة منهج ومحتوى موثوق، وصول الطالب، القراءة/التعلم/التدريب والمراجعة.

### Student Web/PWA
Secure Full-Code activation, returning device-bound login, entitlement-filtered curriculum, Reader/media/text/search/TTS, Practice/Tests/Models, Notes/Favorites/Needs Review, progress/private achievements, notifications and Offline/PWA.

### Admin Web
Curriculum/content authoring, image/PDF/mixed ingestion, media/OCR review, AI operations/review, Question Bank/Quiz Builder/publish, students/codes/recovery/device operations, notifications/import-export/reports/settings/audit.

### Backend API
Fastify + PostgreSQL own Auth/Authorization/Entitlements, curriculum/business data, durable media/OCR/AI state, review/publication and trusted assessment/progress. Browser never owns those authorities.

Legacy is capability/scenario/failure reference, not target architecture.

## 3. Permanent team

- Backend / Platform — Issue `#14`, `docs/workstreams/BACKEND_WORKSTREAM.md`.
- Frontend / Product — Issue `#15`, `docs/workstreams/FRONTEND_WORKSTREAM.md`.
- Integration / Architecture / QA / Release — Issue `#16`, `docs/workstreams/INTEGRATION_WORKSTREAM.md`.
- Shared Team Room — Issue `#13`.
- Main operational memory — `PROJECT_INTEGRATION_CONTINUITY.md`.

Chats are replaceable. GitHub is the coordination/memory bus.

## 4. Production delivery model

```text
latest Integration-approved main
→ short Backend/Frontend branch
→ implementation + tests + REPORT
→ Integration review
→ integration candidate + cross-boundary gates
→ merge accepted changes to main
→ Render auto-deploy from main
→ hosted verification
```

Feature branches never deploy directly to production. Stage readiness from one team never equals Stage VERIFIED.

## 5. Product Owner overrides

Current authority: `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.

- **Render is primary production hosting and deployment is re-enabled.**
- **`main` is production source.**
- old Supabase DB is not production authority; legacy data migration remains out of scope.
- repository documentation is official memory.
- root-cause only; no test/security/business-rule weakening.
- Stage13E remains outside `main` until its gates pass.

## 6. Stable architecture / business boundaries

```text
Student Static/PWA ─┐
                    ├── Docker Fastify API ── Render Managed PostgreSQL
Admin Static ───────┘             │
                                  └── Render persistent media disk
```

Core rules:

- Full Code 6 digits; Class Code 7 digits.
- activation verify non-consuming; finalization atomic.
- returning Student = password + registered ECDSA P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source import is provenance, never curriculum authority.
- `media ready != published`.
- upload/media success independent from OCR/AI/TTS.
- exact/extraction AI never fabricates unknown answers.
- provider calls outside long DB transactions; durable lease-protected state.
- Fastify HTTP separate from AI worker runtime.
- secrets/raw provider internals never browser authority.
- production media storage must be durable.

## 7. Render production architecture

Canonical files: root `render.yaml` + `docs/deployment/RENDER_PRODUCTION.md`.

Declared resources:

- `alwaslh-prod-student-7eaur` — Student static/CDN.
- `alwaslh-prod-admin-7eaur` — Admin static/CDN.
- `alwaslh-prod-api-7eaur` — **Docker Fastify service**, current plan ID `0.5c-512mb`.
- `alwaslh-prod-postgres-7eaur` — PostgreSQL 16, plan `0.1c-256mb`, 1 GB initial disk.
- `alwaslh-prod-media-7eaur` — 1 GB persistent API disk at `/app/runtime-data/media`.

Region: Frankfurt for API/DB locality. Render previews are disabled; production source is `main` only.

### API Docker reason

`apps/api/src/media/pdf-processor.ts` calls `pdfinfo` and `pdftoppm`. Render native runtimes do not guarantee Poppler, so the API uses `apps/api/Dockerfile` pinned to Node `22.22.0` and explicitly installs `poppler-utils`.

`apps/api/docker-entrypoint.sh` prepares the media mount then drops to the non-root `node` user using `gosu`.

Render runs compiled migration code as `preDeployCommand`:

`node apps/api/dist/migrate.js`

and starts:

`node apps/api/dist/server.js`.

The image includes `database/migrations`.

### Media durability

Current `FileSystemMediaStorage` requires the disk. This intentionally makes the API single-instance and disables zero-downtime deploys. Future horizontal scale requires a real object/shared storage adapter; do not fake shared local disk.

### AI worker

No Render AI worker yet. Stage12 production provider/bootstrap remains incomplete. Do not move the worker loop into Fastify to simplify hosting.

## 8. Old hosting retirement

### Vercel

The old Vercel runtime/build path is retired:

- `scripts/build-vercel-preview.mjs` removed.
- `api/[...path].js` serverless adapter removed.
- old Vercel build/rewrite configuration removed.

A **minimal `vercel.json` kill-switch is intentionally retained** because the external Vercel project `alwaslh` is still linked to GitHub:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": { "deploymentEnabled": false }
}
```

During cutover, deleting this guard caused pushes to create unwanted Vercel deployments. The guard was restored at `429e2d4165099ab3cfcd8d53522897870f3f90ec`; the immediate follow-up check showed no new deployment after that commit. Keep it until provider-side Git disconnect is confirmed.

### Supabase

Connected Supabase inspection identified project `dhlqqgnxsqawidjmedvq` whose public table names match Alwaslh rebuild schema (`ai_jobs`, `media_assets`, `content_source_assets`, `auth_sessions`, etc.). It remains active temporarily because Render is not yet live.

After Render DB/API/session/media verification passes, **pause** this old Alwaslh Supabase project rather than deleting data. Deletion requires a separate data-retention decision. The separate `himma-lab` Supabase project is unrelated and must not be touched.

## 9. Verified stage history

Verified through Stage13D:

- Stages1–10
- OCR Foundation
- Stage11 provider-neutral AI contracts
- Stage12 durable AI backend/runtime
- Stage13A Curriculum Backend
- Stage13B Admin Curriculum UI incl. Chromium
- Stage13C Content/Media/OCR Operations incl. Chromium
- Stage13D Upload/History/Publication Linking incl. Chromium

Latest fully green application baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`; exact run matrix is in `PROJECT_STATUS.md`.

## 10. Current Stage13E work

Backend candidate:
- branch `backend/stage13e-ai-operations`
- HEAD `348c02646d0ff873fd305beff16f41c46d9c0285`
- REPORT #14 `5579330147`
- structurally accepted; executable same-head gates blocked by GitHub hosted-runner allocation.

Frontend candidate:
- branch `frontend/stage13e-ai-operations`
- HEAD `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`
- REPORT #15 `5579436581`
- real production binding exists; Integration requested only bounded real-browser session-expiry + stale-review `409` regression preparation.

Neither candidate is in `main`.

## 11. GitHub Actions blocker

Recent independent workflows have ended before checkout with no hosted runner and `steps=[]`. This is infrastructure/account/platform allocation evidence, not a product regression.

Do not weaken gates or churn code to obtain a different result. When a runner executes, fix only actual failures at the owning layer.

## 12. Render first-deploy gate

Blueprint has not yet been applied. After Apply, Integration must verify:

1. PostgreSQL healthy;
2. migrations applied;
3. Docker API build/live and Poppler PDF path works;
4. `/health` 200;
5. `/ready` 200 + DB connectivity;
6. Student live;
7. Admin live;
8. production CORS/session from both origins;
9. Student activation/login/recovery smoke;
10. Admin login/curriculum/content smoke;
11. Stage13D mixed image/PDF processing;
12. media survives API redeploy/restart;
13. logs contain no startup/migration/runtime errors or secret/raw-provider leakage.

Until then hosted runtime = `NOT YET VERIFIED`.

## 13. Known open work

- Render Blueprint Apply + hosted verification.
- provider-side Vercel Git unlink after Render live.
- pause old Alwaslh Supabase after Render live.
- `AI-011-005` direct Question Bank persistence unresolved.
- `AI-012-019` live AI provider benchmark/routes/bootstrap unverified.
- production AI worker intentionally absent.
- Stage13E verification/integration incomplete.
- full Student learning/offline/later stages incomplete.

## 14. Session-end documentation rule

Every workstream updates role doc + Board REPORT. Integration updates `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this Handoff, `PROJECT_INTEGRATION_CONTINUITY.md`, specialized docs and deployment evidence. Record exact Git HEAD, GitHub runs and Render resource/deploy IDs.
