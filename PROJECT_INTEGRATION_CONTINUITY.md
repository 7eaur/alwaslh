# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية الثابتة للمحادثة الرئيسية Integration / Architecture / QA / Release. أي محادثة بديلة يجب أن تستطيع الاستمرار من هذا الملف + Source of Truth بدون Chat history.
>
> **Authority:** current code/migrations + executable GitHub evidence + actual hosted-runtime evidence تتقدم على هذا الملف. أي شيء غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Render reclassified as free development/test hosting; final production expected on VPS or Railway later**.

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `DOCUMENTATION_INDEX.md`, `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, then this file.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
4. Read `docs/workstreams/TEAM_OPERATING_MODEL.md` + relevant workstream file.
5. Read latest Issues #13/#14/#15/#16.
6. Hosting work: read `render.yaml` + `docs/deployment/RENDER_DEVELOPMENT.md`.
7. Live-check branch heads, GitHub Actions and Render resources/deploys/logs/DB.
8. Anything not inspected/executed stays `NOT YET VERIFIED`.

## 2. Main Integration responsibility

Own architecture coherence, cross-team contracts, QA/security/performance/UX review, integration, release decisions, hosted-development verification, and central docs.

Backend/Frontend readiness never equals Stage PASS. Integration alone declares `VERIFIED` after required same-head executable evidence.

Render reachability is development evidence only, not production approval.

## 3. Product / architecture

**الوسيلة الذكية** Arabic education platform:

- Student Web/PWA: activation/login, entitled curriculum, Reader, practice/tests, personal learning data, notifications, offline.
- Admin: curriculum/content, mixed media upload, OCR review, AI operations/review, Question Bank, students/codes/recovery, reports/settings/audit.
- Backend: Fastify + PostgreSQL authority for auth/access/business state/media/OCR/AI/review/publication.

Stable rules:

- Full Code 6 digits; Class Code 7 digits.
- Student activation verify non-consuming; finalize atomic.
- returning Student requires password + registered P-256 proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source import = provenance, never curriculum authority.
- `media ready != published`.
- browser does not own durable business state.
- exact AI never fabricates unknown answers.
- provider calls outside long DB transactions.
- Fastify HTTP separate from AI worker runtime.
- no secrets/raw provider internals client-side.
- root-cause only; no test weakening/auth bypass/fake API/duplicate authority.

## 4. Git state

`main` is the Integration-approved development delivery branch and feeds the temporary Render development environment.

Legacy old-main archive:

`archive/legacy-main-2026-09-08` @ `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

`planning/product-evolution-review` is synchronized for engineering continuity but is not a hosted deploy source.

Feature branches remain short-lived and must integrate through the main Integration process.

Final production hosting is **not Render-locked**. Current expectation: VPS or Railway after the product and operational requirements stabilize.

## 5. Temporary Render development topology

Workspace:

- ID `tea-daadbd1srm7s73ekrt5g`
- `My Workspace`

Current root `render.yaml` declares only free development resources:

```text
Student static site ─┐
                     ├── Docker Fastify API ── Render Free PostgreSQL
Admin static site ───┘
```

Names:

- `alwaslh-dev-student-7eaur`
- `alwaslh-dev-admin-7eaur`
- `alwaslh-dev-api-7eaur`
- `alwaslh-dev-postgres-7eaur`

Render preview generation is disabled. All temporary hosted development resources use `main`.

### API runtime

API remains Dockerized for portability and because `apps/api/src/media/pdf-processor.ts` executes `pdfinfo` and `pdftoppm`.

`apps/api/Dockerfile`:

- `node:22.22.0-bookworm-slim`;
- installs `poppler-utils`, `ca-certificates`, `gosu`;
- compiles API;
- runtime includes `database/migrations`;
- runs application non-root through `apps/api/docker-entrypoint.sh`.

This Docker image should remain usable later on VPS/Railway. Do not rewrite the application around a temporary hosting provider.

### Free PostgreSQL

- Render Free PostgreSQL 16.
- temporary development database only.
- injected through `DATABASE_URL`.
- current plan must not be treated as long-term data authority.

Free Web Service does not use paid pre-deploy command. Development startup runs:

`node apps/api/dist/migrate.js && node apps/api/dist/server.js`

Migrator remains idempotent, checksum-protected and advisory-lock guarded.

### Media in free mode

`MEDIA_STORAGE_ROOT=/app/runtime-data/media` remains filesystem-backed.

No persistent disk exists in Free mode. Consequences:

- image/PDF workflows may be tested during an active deployment;
- uploaded files can disappear after restart/redeploy;
- hosted free-mode media durability = `NOT YET VERIFIED` by design;
- never claim Render Free as final storage architecture;
- do not add provider-specific storage coupling merely to make temporary testing durable.

Durable production media design is deferred until the final VPS/Railway deployment requirements are known.

### AI worker

No hosted production AI worker yet. Stage12 lacks approved live provider routes/credentials/standalone production bootstrap. Never fake a worker or run it inside Fastify.

## 6. Render exact state

Blueprint has been edited for **zero-cost development/test mode** but has not yet been applied in Render Dashboard.

At this point:

- Render development DB: not provisioned.
- Render development API: not provisioned.
- Student development site: not provisioned.
- Admin development site: not provisioned.
- hosted development runtime: `NOT YET VERIFIED`.

Next hosting action: user applies the free Blueprint. Integration then inspects actual Render resources/deploys/logs/DB.

## 7. Final production direction

Final hosting will be decided later between VPS / Railway or another approved equivalent after product maturity.

Architecture must stay portable:

- Docker Fastify API;
- PostgreSQL through `DATABASE_URL`;
- environment-driven CORS/session configuration;
- migration runner independent of host;
- frontend static builds separated from backend;
- media storage authority isolated from browser concerns.

Do not overengineer final availability/storage before real scale and durability requirements exist.

## 8. Vercel retirement state

Connected Vercel project `alwaslh` remains externally GitHub-linked.

Root minimal `vercel.json` is intentionally retained only as a deployment kill-switch:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": { "deploymentEnabled": false }
}
```

Old Vercel build/serverless files are removed. Do not delete the kill-switch until provider-side Git unlink is confirmed.

## 9. Supabase state

Connected Supabase project `dhlqqgnxsqawidjmedvq` contains tables matching Alwaslh rebuild history and remains a historical/rollback resource.

Do not build new provider coupling around it just for temporary hosting. Do not delete it without an explicit retention decision.

`jfvnqbutsyrctjwczday` (`himma-lab`) is unrelated and must never be touched for Alwaslh.

## 10. Verified application baseline

Latest fully green application head remains:

`4eca7de8877ac9e2289b9c7990c912d33c256935`.

Same-head SUCCESS:

- Stage13D Admin `34177369743`
- Stage13D Backend `34177369784`
- Stage13 Admin `34177369748`
- Stage12 `34177369812`
- Stage11 `34177369753`
- OCR `34177369750`
- Stage10 `34177369777`
- Stage9 `34177369756`
- Full Rebuild `34177369768`

Hosting/config/docs commits do not replace this application verification baseline.

## 11. GitHub Actions blocker

Current independent workflows recently fail before checkout with no runner allocation and `steps=[]`. Treat as external verification-infrastructure evidence, not code regression.

Do not weaken gates or churn product code. Rerun unchanged gates when allocation works; fix only real executed failures.

## 12. Stage13E Backend candidate

Branch `backend/stage13e-ai-operations` @ `348c02646d0ff873fd305beff16f41c46d9c0285`.

REPORT #14 `5579330147`.

Structurally accepted candidate includes Admin AI jobs/units/attempts/outputs, server progress/action authority, Stage12 controls, strict append-only review audit, Stage11 semantic validation and security boundaries.

Not merged to `main`; same-head executable gate pending runner availability.

## 13. Stage13E Frontend candidate

Branch `frontend/stage13e-ai-operations` @ `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`.

REPORT #15 `5579436581`.

Real authenticated API binding exists. Integration bounded return still requires real browser regression preparation for:

- session expiry/auth rejection;
- stale-review `409` conflict/race;
- no mocks/fake endpoint.

Not merged to `main`.

## 14. Render development verification after Apply

1. list Render services and DB; record IDs;
2. inspect first deploys/logs;
3. verify migrations/schema;
4. verify Docker build + Poppler through real PDF processing;
5. `/health` 200;
6. `/ready` 200 with DB;
7. Student site loads;
8. Admin site loads;
9. CORS/session from both origins;
10. Student activation/login/recovery smoke;
11. Admin login/curriculum/content smoke;
12. Stage13D mixed image/PDF functional flow;
13. explicitly record media survival across restart/redeploy as `NOT YET VERIFIED` in Free mode;
14. inspect logs for runtime/security defects.

Render development environment can be accepted as useful testing infrastructure without being final production.

## 15. Next Integration sequence

1. User applies free Render Blueprint.
2. Main chat verifies development resources and records exact IDs/deploys.
3. Frontend finishes bounded Stage13E browser regression prep.
4. When GitHub runners return, run unchanged Stage13E gates.
5. Create Stage13E integration branch from latest `main` and combine accepted Backend/Frontend candidates.
6. Run same-head API/Admin/Postgres/Chromium/390px/full regressions.
7. Merge Stage13E only after PASS to `main` → Render development auto-deploy → hosted smoke.
8. Close Stage13E docs/Legacy Coverage/Roadmap → Stage13F.
9. Near product completion, design final VPS/Railway production topology from measured requirements and migrate using the same portable Docker/PostgreSQL contracts.

## 16. Open risks / NOT YET VERIFIED

- first Render free Blueprint Apply pending;
- hosted development runtime unverified;
- free Render filesystem is ephemeral, so hosted media durability unavailable;
- free Render PostgreSQL is temporary and must not become long-term authority;
- Vercel external Git link remains but automatic deployment is guarded off;
- GitHub hosted-runner allocation blocker;
- production AI worker absent by design;
- final VPS/Railway production topology and durable media storage intentionally deferred;
- `AI-011-005` direct Question Bank persistence unresolved;
- `AI-012-019` live AI provider bootstrap unresolved.

## 17. Update policy

Update this file after any material Backend/Frontend report, Integration decision, branch/head change, root cause, CI result, Render development deploy outcome, hosting-direction decision, merge, or Stage transition.

If a branch advances without REPORT, record as observed WIP / `NOT YET VERIFIED`.
