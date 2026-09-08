# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** a replacement engineer/chat must be able to resume from GitHub without prior conversation memory.

Last synchronized: 2026-09-08 — Render production cutover.

## 0. Mandatory startup procedure

Before changing code:

1. Confirm repo `7eaur/alwaslh`.
2. Treat **`main` as the production source branch**.
3. Read `README.md` and `DOCUMENTATION_INDEX.md`.
4. Read this file, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, and for Integration/Main also `PROJECT_INTEGRATION_CONTINUITY.md`.
5. Read `docs/workstreams/TEAM_OPERATING_MODEL.md` and the role-specific workstream file.
6. Read latest GitHub commands/reports: Team Room `#13`, Backend `#14`, Frontend `#15`, Integration `#16`.
7. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` before older Product Decisions.
8. For hosting/release work read `docs/deployment/RENDER_PRODUCTION.md` and root `render.yaml`.
9. Inspect actual code/callers/migrations/tests before changing an area.
10. Live-check branch HEADs, GitHub Actions and Render deploy state; prose is not executable evidence.
11. Anything not inspected/tested = `NOT YET VERIFIED`.

## 1. Repository / Git / Production state

- Repo: `7eaur/alwaslh`
- Production branch: **`main`**
- Render cutover source commit: `febd8ca2fe047a0b3a961bf73060289ed35e79c6`
- Old legacy `main` preserved at `archive/legacy-main-2026-09-08` → `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`
- `planning/product-evolution-review` remains historical/integration context during transition but is no longer the production deploy source.
- Draft PR #12 remains historical/current-development context and its body may be stale.
- Latest fully verified executable pre-hosting head: `4eca7de8877ac9e2289b9c7990c912d33c256935`.
- Do not rewrite history casually. The force move of `main` during cutover was explicitly Product Owner-authorized and protected by the archive branch.

## 2. Product idea

**الوسيلة الذكية** is an Arabic education platform managing trustworthy curriculum/content, controlled student access, learning/practice and review.

### Student Web/PWA — `apps/student-web`

Secure Full-Code activation and returning device-bound login; entitlement-filtered curriculum; Reader/media/text/search/TTS; Practice/Tests/Models; Notes/Favorites/Needs Review; progress/private achievements; notifications; explicit Offline/PWA lifecycle.

### Admin Web — `apps/admin-web`

Curriculum/content authoring; image/PDF/mixed ingestion; media/OCR review; AI operations/review; Question Bank/Quiz Builder/publish; students/codes/recovery/device reset; notifications/import-export/reports/settings/audit.

### Backend API — `apps/api`

Authority for Auth/Authorization/Entitlements, curriculum/business data, PostgreSQL mutations, media/OCR/AI state/review, and trusted publication/assessment/progress. Browser never owns those authorities.

## 3. Permanent engineering team topology

### Backend / Platform
- Guide: `docs/workstreams/BACKEND_WORKSTREAM.md`
- Board: Issue `#14`
- Owns API/PostgreSQL/server authority/workers/security/backend tests.

### Frontend / Product
- Guide: `docs/workstreams/FRONTEND_WORKSTREAM.md`
- Board: Issue `#15`
- Owns Admin/Student UX, API integration, responsive/a11y/PWA/frontend tests.

### Integration / Architecture / QA / Release
- Guide: `docs/workstreams/INTEGRATION_WORKSTREAM.md`
- Board: Issue `#16`
- Owns architecture coherence, review, integration, same-head gates, central docs and Render production release verification.

### Shared Team Room
- Issue `#13`
- Cross-team contracts, blockers and architecture decisions.

Chats are replaceable. Repository docs + Boards + code/evidence are the memory.

## 4. Delivery / branching model after Render cutover

```text
latest Integration-approved main
→ short Backend or Frontend branch
→ implementation + tests + REPORT
→ Integration review
→ integration candidate / cross-boundary verification
→ merge accepted changes to main
→ Render auto-deploy from main
→ hosted verification
```

Rules:

- Backend/Frontend do not deploy feature branches as production.
- `main` must remain production-quality.
- An unverified stage does not enter `main` just because Render can auto-deploy it.
- Root cause, not patching.
- End of each Stage requires Closure Report + Integration acceptance + central-doc sync.

## 5. Current Product Owner overrides

Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.

Current operational facts:

1. **Render is the primary production hosting platform and deployment is re-enabled.**
2. **`main` is production source.**
3. **Old Supabase database is not production authority and legacy data migration remains out of current scope.**
4. **Repository documentation is official memory.**
5. **No patching/test/security weakening.**
6. **Stage13E stays outside `main` until its gates pass.**

## 6. Stable architecture / business boundaries

```text
Student Static/PWA ─┐
                    ├── Fastify API ── Render Managed PostgreSQL
Admin Static ───────┘       │
                            ├── Auth / Access / Curriculum
                            ├── Source / Media / OCR
                            ├── AI contracts/execution/review
                            └── Persistent media disk on API
```

Stable rules:

- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; final activation atomic.
- returning Student requires password + registered ECDSA P-256 proof.
- Admin auth/recovery separate and secure.
- Curriculum: Class → Subject Offering → optional Section → Lesson.
- Source import is provenance, not curriculum authority.
- `media ready != published`.
- Upload/media success independent from OCR/AI/TTS.
- AI contracts provider-neutral and exact modes never fabricate unknown answers.
- provider calls outside long DB transactions; lease-protected writes.
- Fastify HTTP separate from AI worker runtime.
- raw provider output/internal credentials never client authority.
- Student ultimately consumes reviewed/published authority.

## 7. Render production architecture

Canonical: `render.yaml` + `docs/deployment/RENDER_PRODUCTION.md`.

Declared resources:

- `alwaslh-prod-student-7eaur` — Student static site.
- `alwaslh-prod-admin-7eaur` — Admin static site.
- `alwaslh-prod-api-7eaur` — Fastify Node service, `starter` plan.
- `alwaslh-prod-postgres-7eaur` — PostgreSQL 16, `basic-256mb`.
- `alwaslh-prod-media-7eaur` — 1 GB persistent disk mounted at `/opt/render/project/src/runtime-data/media`.

Region: Frankfurt for API/DB locality.

Why the disk is mandatory: current Stage13D media authority uses `FileSystemMediaStorage`. Render service filesystem is ephemeral without a persistent disk; production uploads must survive deploys/restarts.

This makes API intentionally single-instance for now. Do not pretend the disk is shared. Future horizontal scaling requires a real shared/object-storage adapter architecture decision.

No Render AI worker is declared yet because Stage12 explicitly lacks production `worker.ts` bootstrap/live provider routes/credentials. Do not put the worker loop inside Fastify as a hosting shortcut.

## 8. Old hosting retirement

Repository-side Vercel path was retired at cutover:

- `vercel.json` removed;
- `scripts/build-vercel-preview.mjs` removed;
- `api/[...path].js` removed.

Legacy Supabase/Cloudflare material may remain only as historical/audit/reference evidence unless independently proven unused and removed through a normal cleanup batch.

External provider-dashboard projects/hooks are not automatically deleted by repository changes. Disconnect them only after Render is confirmed live; do not delete legacy data as part of deployment cutover.

## 9. Verified stage history

VERIFIED:
- Stages1–10
- OCR Foundation
- Stage11 AI Contracts
- Stage12 durable AI execution/runtime backend
- Stage13A Curriculum backend
- Stage13B Admin Curriculum UI incl. Chromium
- Stage13C Content/Media/OCR Operations incl. Chromium
- Stage13D Upload/Processing History/Publication Linking incl. Chromium

Latest fully verified executable head remains `4eca7de8877ac9e2289b9c7990c912d33c256935` with the known same-head 9-workflow SUCCESS matrix recorded in `PROJECT_STATUS.md`.

## 10. Current work — Stage13E

Do not confuse Render cutover with Stage13E completion.

Backend candidate:
- branch `backend/stage13e-ai-operations`
- HEAD `348c02646d0ff873fd305beff16f41c46d9c0285`
- REPORT #14 `5579330147`
- structurally accepted candidate; current-head executable gates still blocked by hosted runner allocation.

Frontend candidate:
- branch `frontend/stage13e-ai-operations`
- HEAD `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`
- REPORT #15 `5579436581`
- real production binding implemented; Integration requested only bounded real-browser session-expiry and stale-review `409` regression preparation.

Neither branch is in `main`.

## 11. Render first-deploy verification gate

After Blueprint apply, Integration must verify:

1. database healthy;
2. migrations applied;
3. API deploy live;
4. `/health` 200;
5. `/ready` 200 and DB connectivity;
6. Student static site live;
7. Admin static site live;
8. production CORS/session behavior from both origins;
9. Student activation/login/recovery smoke;
10. Admin login/curriculum/content smoke;
11. Stage13D media upload survives API restart/redeploy;
12. no startup/runtime errors or secret/raw-provider leakage.

Until then, Render hosting is configured but hosted runtime is `NOT YET VERIFIED`.

## 12. Known risks/open work

- `AI-011-005` P2 — `direct` persistence into Stage13F Question Bank unresolved.
- `AI-012-019` P2 — live provider benchmark/config/routes/bootstrap unverified.
- GitHub hosted-runner allocation currently prevents new executable CI evidence.
- production AI worker not yet deployable by design.
- API single-instance while media uses Render disk.
- full Student learning product, Offline/PWA and later stages incomplete.

## 13. What NOT to do

- Do not restore old root Supabase architecture as target.
- Do not migrate old DB without explicit Product Owner decision.
- Do not deploy feature branches as production.
- Do not create duplicate media/OCR/AI lifecycles.
- Do not use ephemeral media storage in production.
- Do not broaden credentialed CORS to `*`.
- Do not expose provider credentials/raw internals.
- Do not run a fake AI worker.
- Do not weaken tests/auth/business rules to obtain green status.
- Do not call hosted runtime or Stage13E VERIFIED without actual evidence.

## 14. Before ending any future session

Workstream chats update their workstream file + Board REPORT. Integration updates `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, specialized docs and Render deployment evidence when relevant. Record exact Git commit, Render resource/deploy IDs and verification results.
