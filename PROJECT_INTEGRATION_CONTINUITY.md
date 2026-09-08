# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية الثابتة للمحادثة الرئيسية Integration / Architecture / QA / Release. أي محادثة بديلة يجب أن تستطيع الاستمرار من هذا الملف + Source of Truth بدون Chat history.
>
> **Authority:** current code/migrations + executable GitHub evidence + actual Render runtime evidence تتقدم على هذا الملف. أي شيء غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Render Blueprint ready, first Apply pending**.

## 1. Resume procedure

1. Confirm `7eaur/alwaslh`.
2. `main` = production source.
3. Read `DOCUMENTATION_INDEX.md`, `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, then this file.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
5. Read workstream model + latest Issues #13/#14/#15/#16.
6. Hosting work: read `render.yaml` + `docs/deployment/RENDER_PRODUCTION.md`.
7. Live-check Git branch heads, GitHub Actions and Render resources/deploys/logs/DB.
8. Anything not inspected/executed stays `NOT YET VERIFIED`.

## 2. Main Integration responsibility

Own architecture coherence, cross-team contracts, QA/security/performance/UX review, integration, production promotion to `main`, Render verification, central docs and release decisions.

Backend/Frontend readiness never equals Stage PASS. Integration alone declares VERIFIED after same-head evidence.

## 3. Product / architecture

**الوسيلة الذكية** Arabic education platform:

- Student Web/PWA: secure activation/login, entitled curriculum, Reader, practice/tests, personal learning data, notifications, offline.
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

## 4. Git / production branch state

Production branch: `main`.

Legacy old-main archive:

`archive/legacy-main-2026-09-08` @ `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

Render cutover seed: `febd8ca2fe047a0b3a961bf73060289ed35e79c6`.

Render Docker/Poppler runtime correction: `48334137aad5c975a25076bdb463d3d25ac3f258`.

`planning/product-evolution-review` is synchronized for engineering continuity but is not production deploy source.

Future feature branches start from latest Integration-approved `main`.

## 5. Render production topology

Workspace:

- ID `tea-daadbd1srm7s73ekrt5g`
- `My Workspace`

Initial connected inspection: **no Render services existed yet**.

Root `render.yaml` now declares:

```text
Student static/CDN ─┐
                    ├── Docker Fastify API ── PostgreSQL 16
Admin static/CDN ───┘             │
                                  └── persistent media disk
```

Names:

- `alwaslh-prod-student-7eaur`
- `alwaslh-prod-admin-7eaur`
- `alwaslh-prod-api-7eaur`
- `alwaslh-prod-postgres-7eaur`
- `alwaslh-prod-media-7eaur`

Render preview generation is disabled. All services use `main`.

### API runtime

API is Docker, not native Node, because `apps/api/src/media/pdf-processor.ts` executes `pdfinfo` and `pdftoppm` and Poppler is not guaranteed in Render native runtime.

`apps/api/Dockerfile`:

- `node:22.22.0-bookworm-slim`;
- installs `poppler-utils`, `ca-certificates`, `gosu`;
- compiles API;
- runtime includes `database/migrations`;
- non-root application execution through `apps/api/docker-entrypoint.sh`.

Root `.node-version` also pins `22.22.0` for static builds.

Render migration command:

`node apps/api/dist/migrate.js`

Start:

`node apps/api/dist/server.js`

### PostgreSQL

- PostgreSQL 16.
- plan `0.1c-256mb`.
- 1 GB initial storage.
- internal DB connection; `DATABASE_SSL=disable` only for same-workspace internal URL.

### Media

`MEDIA_STORAGE_ROOT=/app/runtime-data/media`.

1 GB persistent disk mounted at same path.

This is mandatory because `FileSystemMediaStorage` would lose uploads on Render ephemeral filesystem. Disk makes API single-instance and removes zero-downtime deploys; accepted current tradeoff. Horizontal scaling later requires real shared/object storage.

### AI worker

No Render worker yet. Stage12 lacks authorized live provider routes/credentials/standalone production bootstrap. Never fake worker or run it inside Fastify.

## 6. Render exact current state

Blueprint configuration is committed to `main`, but **Blueprint has not yet been applied in Render Dashboard** because connected Render tools do not expose Blueprint Apply / persistent-disk creation.

Therefore at this exact point:

- Render DB: not yet provisioned.
- Render API: not yet provisioned.
- Student: not yet provisioned.
- Admin: not yet provisioned.
- media disk: not yet provisioned.
- hosted runtime: `NOT YET VERIFIED`.

Next deployment action is one manual Blueprint Apply from the GitHub repo. After the user applies it, Integration immediately resumes using connected Render tools.

## 7. Vercel retirement exact state

Connected Vercel team:

- team `wasl` / slug `wasl15`
- ID `team_GMTdfNaLP5Pp44BeNBPag27t`

Vercel project:

- project `alwaslh`
- ID `prj_yiKgNOzAu0GznhxwEtPtXYrJfJSW`
- still externally linked to GitHub repo `7eaur/alwaslh`.

During Render cutover, deleting old `vercel.json` caused every push to `main`/`planning` to generate unwanted Vercel deployments, mostly `ERROR`.

Root cause: external Vercel Git integration remained active while repository-level deployment kill-switch had been removed.

Correct fix applied:

`429e2d4165099ab3cfcd8d53522897870f3f90ec` restores **minimal retirement guard only**:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": { "deploymentEnabled": false }
}
```

Old Vercel build/serverless artifacts remain removed:

- `scripts/build-vercel-preview.mjs` removed.
- `api/[...path].js` removed.

Observed follow-up after guard: no new deployment appeared for the guard commit. Do not delete this guard until external Vercel Git disconnect is confirmed.

Connected Vercel MCP currently exposes project/deployment reads but not Git-disconnect write action. Provider-side unlink remains pending after Render goes live.

## 8. Supabase retirement exact state

Connected Supabase projects:

- `dhlqqgnxsqawidjmedvq` — generic-named project; read-only inspection showed public tables matching Alwaslh rebuild schema (`access_events`, `ai_jobs`, `auth_sessions`, `content_source_assets`, `media_assets`, `lesson_assets`, etc.). This is treated as the old Alwaslh preview/DB resource.
- `jfvnqbutsyrctjwczday` — `himma-lab`, unrelated; never touch for Alwaslh.

Do **not** pause/delete `dhlqqgnxsqawidjmedvq` before Render is live because doing so could create avoidable downtime/rollback loss.

After Render DB/API/session/media checks pass, pause `dhlqqgnxsqawidjmedvq`. Pausing is reversible and preserves data. Permanent deletion requires separate Product Owner retention decision.

## 9. Verified application baseline

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

Render/config/docs commits do not replace this application verification baseline.

## 10. GitHub Actions blocker

Current independent workflows recently fail before checkout with no runner allocation and `steps=[]`. This is external verification-infrastructure evidence, not a code regression.

Do not weaken gates or churn product code. Rerun unchanged gates when allocation works; fix only real executed failures.

## 11. Stage13E Backend candidate

Branch `backend/stage13e-ai-operations` @ `348c02646d0ff873fd305beff16f41c46d9c0285`.

REPORT #14 `5579330147`.

Structurally accepted candidate includes Admin AI jobs/units/attempts/outputs, server progress/action authority, Stage12 controls, strict append-only review audit, Stage11 semantic validation and security boundaries.

Not merged to `main`; same-head executable gate pending runner availability.

## 12. Stage13E Frontend candidate

Branch `frontend/stage13e-ai-operations` @ `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`.

REPORT #15 `5579436581`.

Real authenticated production binding exists. Integration bounded return only requires real browser regression preparation for:

- session expiry/auth rejection;
- stale-review `409` conflict/race;
- no mocks/fake endpoint.

Not merged to `main`.

## 13. First Render deploy verification

Immediately after Blueprint Apply:

1. list Render services and DB; record IDs;
2. inspect all first deploys/logs;
3. verify DB healthy and `schema_migrations`;
4. verify Docker build + Poppler path via real PDF processing;
5. `/health` 200;
6. `/ready` 200 with DB;
7. Student live;
8. Admin live;
9. CORS/session from both origins;
10. Student activation/login/recovery smoke;
11. Admin login/curriculum/content smoke;
12. Stage13D mixed image/PDF flow;
13. redeploy/restart API and prove media persists;
14. inspect logs for runtime/security errors.

Only then hosted Render baseline becomes VERIFIED.

After Render is proven live:

15. pause old Alwaslh Supabase project `dhlqqgnxsqawidjmedvq`;
16. disconnect Vercel Git integration through provider UI/API when an authorized write path is available;
17. keep no legacy production auto-deploy path.

## 14. Next Integration sequence

1. User applies Render Blueprint.
2. Main chat verifies Render and records exact resources/deploy IDs.
3. Retire old Supabase/Vercel operational links safely after Render green.
4. Frontend finishes bounded Stage13E browser regression prep.
5. When GitHub runners return, run unchanged Stage13E gates.
6. Create Stage13E integration branch from latest `main` and combine accepted Backend/Frontend candidates.
7. Run same-head API/Admin/Postgres/Chromium/390px/full regressions.
8. Merge Stage13E only after PASS to `main` → Render auto-deploy → hosted Stage13E smoke.
9. Close docs/Legacy Coverage/Roadmap → Stage13F.

## 15. Open risks

- first Render Blueprint Apply pending;
- hosted Render runtime unverified;
- Vercel external Git link remains but automatic deployment is guarded off;
- old Alwaslh Supabase remains active until safe cutover;
- GitHub hosted-runner allocation blocker;
- production AI worker absent by design;
- API is single-instance while using local persistent disk;
- `AI-011-005` direct Question Bank persistence unresolved;
- `AI-012-019` live AI provider bootstrap unresolved.

## 16. Update policy

Update this file after any material Backend/Frontend report, Integration decision, branch/head change, root cause, CI result, Render resource/deploy outcome, old-host retirement action, main promotion, or Stage transition.

If a branch advances without REPORT, record as observed WIP / `NOT YET VERIFIED`.
