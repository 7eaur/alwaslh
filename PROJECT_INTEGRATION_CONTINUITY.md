# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية الثابتة للمحادثة الرئيسية Integration / Architecture / QA / Release. يجب أن تستطيع أي محادثة بديلة قراءة هذا الملف مع Source of Truth ثم تواصل العمل من نفس النقطة بلا أي Chat history.
>
> **Authority:** code + migrations + executable CI + actual Render runtime evidence تتقدم على هذا الملف. أي ادعاء بلا evidence يبقى `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Render production cutover active**.

---

## 1. Mandatory resume procedure

قبل أي تعديل/دمج/نشر:

1. Confirm repo `7eaur/alwaslh`.
2. Treat **`main` as production source branch**.
3. Read `README.md` → `DOCUMENTATION_INDEX.md` → `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → this file.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
5. Read `docs/workstreams/TEAM_OPERATING_MODEL.md` + `docs/workstreams/INTEGRATION_WORKSTREAM.md`.
6. Read Team Room `#13`, Backend `#14`, Frontend `#15`, Integration `#16` latest commands/reports.
7. For deployment read root `render.yaml` + `docs/deployment/RENDER_PRODUCTION.md`.
8. Live-check `main`, feature branch HEADs, GitHub Actions jobs/steps, Render services/deploys/logs/database before conclusions.
9. Inspect actual code/migrations/tests for any accepted change.
10. Anything not inspected/executed = `NOT YET VERIFIED`.

Never use prior chat memory as authority.

---

## 2. Main Integration role

This chat/replacement owns:

- Tech Lead / Software Architect;
- cross-team contract review;
- Integration Engineer;
- QA/regression/security/performance/UX cross-boundary review;
- production branch promotion;
- Render deployment/runtime verification;
- central docs and continuity memory.

Backend/Frontend own their layers. Integration returns defects to the owning layer, prevents wrong-layer patches, combines accepted work, runs same-head gates, merges only approved work to `main`, observes Render auto-deploy, then verifies hosted runtime.

Only Integration may declare Stage `VERIFIED`.

---

## 3. Product understanding

**الوسيلة الذكية** منصة تعليمية عربية، not a PDF viewer.

### Student Web/PWA

Target: secure Full-Code activation + returning device-bound login, entitlement-filtered curriculum, Reader/media/text/search/TTS, Practice/Tests/Models, Notes/Favorites/Needs Review, progress/private achievements, notifications, Offline/PWA.

### Super Admin Web

Target: curriculum/content authoring, mixed image/PDF ingestion, media/OCR review, AI operations/review, Question Bank/Quiz Builder/publish, student/code/recovery/device operations, notifications/import-export/reports/settings/audit.

### Backend

Fastify API + PostgreSQL own Auth/Authorization/Entitlements, curriculum/business data, durable content/media/OCR/AI state, review/publication, and trusted assessment/progress/audit. Browser presentation only.

Legacy is capability/scenario/failure reference; never current architecture authority.

---

## 4. Stable architecture / invariants

```text
Student Web/PWA ─┐
                 ├── Fastify API ── PostgreSQL
Admin Web ───────┘       │
                         ├── Auth / Access / Curriculum
                         ├── Stage9 provenance
                         ├── Stage10 media
                         ├── OCR derived/reviewed text
                         ├── Stage11 AI contracts
                         ├── Stage12 durable execution
                         └── Stage13 Admin operations/publication
```

Non-negotiable:

- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; completion atomic.
- returning Student password + registered ECDSA P-256 proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source folders/names never curriculum authority.
- `media ready != published`.
- upload/media success independent from OCR/AI/TTS.
- AI provider-neutral contracts; exact/extraction never fabricate unknown answers.
- provider calls outside long DB transactions.
- lease-protected durable AI writes; DB-coordinated controls.
- Fastify HTTP remains separate from AI worker runtime.
- Frontend never derives server-owned permission/state when server can project it.
- no secrets/raw provider internals client-side.
- root cause only; no test weakening, auth bypass, hidden catch, arbitrary timeout or duplicate authority.

Every material defect record:

`Symptom → Root Cause → Broken invariant → Blast radius → Correct owning layer → Fix → Regression → Remaining NOT YET VERIFIED`.

---

## 5. Git / branch topology after cutover

Production source:

`main`

Render cutover seed commit:

`febd8ca2fe047a0b3a961bf73060289ed35e79c6`

Legacy main preserved safely:

`archive/legacy-main-2026-09-08` @ `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`

The old main was React/Supabase/Cloudflare-era source. It is rollback/reference only.

`planning/product-evolution-review` remains historical/integration context during transition but **is not Render deploy source**.

Future work rule:

```text
latest Integration-approved main
→ short feature branch
→ REPORT/review/gates
→ integration
→ main
→ Render auto-deploy
```

Do not deploy Backend/Frontend branches directly to production.

Current Stage13E branches predate this production cutover. Preserve their history; Integration will combine/rebase/merge their accepted changes against latest `main` only after Stage13E verification prerequisites are satisfied.

---

## 6. Render production decision

Product Owner explicitly re-enabled deployment on 2026-09-08 and selected **Render as primary hosting platform**.

Authority:

- `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
- root `render.yaml`
- `docs/deployment/RENDER_PRODUCTION.md`

Render workspace confirmed through connected account:

- Workspace ID: `tea-daadbd1srm7s73ekrt5g`
- Name: `My Workspace`

At first inspection the workspace returned no existing services. The Blueprint is therefore the intended initial provisioning path.

### Declared production topology

```text
alwaslh-prod-student-7eaur (static CDN) ─┐
                                        ├── alwaslh-prod-api-7eaur (Fastify)
 alwaslh-prod-admin-7eaur (static CDN) ──┘           │
                                                     ├── alwaslh-prod-postgres-7eaur
                                                     └── alwaslh-prod-media-7eaur disk
```

Region: Frankfurt.

Database: Render Managed PostgreSQL 16, `basic-256mb`, 1 GB initial storage.

API: Render Node web service `starter`, because persistent disk support is required.

Media: 1 GB persistent disk mounted at `/opt/render/project/src/runtime-data/media`; `MEDIA_STORAGE_ROOT` points there.

Student/Admin: static Vite sites using API URL `https://alwaslh-prod-api-7eaur.onrender.com`.

API allows only the two declared Render frontend origins in production CORS.

### Why persistent disk is mandatory

Stage13D uses `FileSystemMediaStorage`. Render filesystem without a disk is ephemeral. Shipping uploads to ephemeral storage would be a data-loss bug, so it is explicitly prohibited.

Current disk architecture makes API single-instance and removes zero-downtime deploy guarantees. This is accepted for the current stage because it preserves correctness with the simplest durable implementation.

Future horizontal scaling requires an explicit shared/object storage adapter. Never simulate shared storage with local disks.

### AI worker boundary

Do **not** deploy a Render AI background worker yet.

Stage12 verified runtime abstractions, but `docs/ai/STAGE12_WORKER_RUNTIME.md` explicitly says production `worker.ts` bootstrap, live provider adapters/routes/credentials and authorized benchmark are not implemented/verified. Creating a fake worker or putting the poll loop inside Fastify would violate architecture.

---

## 7. Old deployment retirement

Repository-side old Vercel deployment path removed at cutover:

- `vercel.json` removed;
- `scripts/build-vercel-preview.mjs` removed;
- `api/[...path].js` Vercel serverless adapter removed.

`.env.example` now describes current Fastify/Postgres/Vite envs, not legacy Supabase keys.

External Vercel/Supabase provider-dashboard links are **not automatically deleted by Git changes**. After Render is proven live, disconnect old Git deployment hooks/projects in their provider dashboards. Do not delete old external data just to retire hosting.

---

## 8. Verified executable baseline

Latest fully verified pre-Render executable head remains:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS matrix:

- Stage13D Admin `34177369743`
- Stage13D Backend `34177369784`
- Stage13 Admin `34177369748`
- Stage12 `34177369812`
- Stage11 `34177369753`
- OCR `34177369750`
- Stage10 `34177369777`
- Stage9 `34177369756`
- Full Rebuild `34177369768`

Render cutover/docs commits are not a new application-verification baseline.

---

## 9. GitHub Actions infrastructure blocker

Current repository workflows have recently failed before checkout with no hosted runner allocation and `steps=[]` across independent workflows. This affects Backend/Frontend Stage13E and planning/main PR-style runs.

Interpretation: infrastructure/account/platform allocation blocker, not application regression evidence.

Rules:

- no workflow weakening;
- no product churn to trigger a different result;
- do not mark PASS;
- rerun unchanged gates when a runner is allocated;
- fix only actual executable failures at owning layer.

Exact underlying billing/quota/platform cause remains `NOT YET VERIFIED` with available permissions.

---

## 10. Stage ledger

VERIFIED through Stage13D:

- Stages1–10
- OCR
- Stage11
- Stage12 backend/runtime
- Stage13A/B/C/D

Current:

**Stage13E Admin AI Operations / Review — IN PROGRESS / NOT YET VERIFIED / not in `main`.**

Later: Stage13F Question Bank, Stage13G remaining Admin, Stage14 Student Product, Stage15 Assessment, Stage16 Offline/PWA, Stage17 personal learning data, Stage18 notifications, Stage19 stats, Stage20 export/reporting, later hardening/release stages.

---

## 11. Stage13E Backend candidate

Branch:

`backend/stage13e-ai-operations`

HEAD:

`348c02646d0ff873fd305beff16f41c46d9c0285`

Formal REPORT: Issue #14 comment `5579330147`.
Same-head CI retry: `5579336922`.
Integration candidate decision: `5579472553`.

Implemented:

- Admin-only jobs/units/attempts/outputs read model;
- server-derived progress/status;
- Stage12 pause/resume/cancel/retry reuse;
- provider/model/project observability sans secrets;
- source/page/checksum/OCR provenance;
- migration `0018_ai_admin_review.sql` append-only review audit;
- `edit|approve|reject` with row lock/revision audit;
- Stage11 semantic validation reused;
- server-derived `allowedActions` and `allowedReviewActions`;
- strict discriminated review request;
- paused cancellation invariant corrected at owning repository layer;
- no Question Bank publication and no second queue/lifecycle.

Current status: **structural implementation candidate accepted; not Ready/Verified until executable same-head gates run.**

Do not churn Backend while runner is unavailable unless new code review evidence finds a defect.

---

## 12. Stage13E Frontend candidate

Branch:

`frontend/stage13e-ai-operations`

HEAD:

`e42644944ca3fcc7e225a263a6e9699bcb70b9f7`

Formal REPORT: Issue #15 comment `5579436581`.
Integration bounded return: see latest Issue #15 Integration Review after that report.

Implemented:

- real authenticated `ai-operations-api.ts`;
- safe DTO adapter excluding raw/internal provider data;
- production controller + Admin navigation;
- server action arrays consumed exactly, no local business permission matrix;
- bounded selected non-terminal polling with overlap guard;
- canonical refresh on mutation success and `409`;
- strict edit/approve/reject payloads;
- jobs → units → attempts → outputs → review history/provenance UX;
- Chromium happy flow for login/pause/resume/approve/reload + 390px prepared.

Integration found one bounded test-contract gap, not architecture rejection:

- add real-backend browser coverage for session expiry / auth rejection;
- add real stale-review `409` race/conflict browser path;
- no mocks, `page.route`, fake production API or test-only production endpoint.

Current-head quality gates remain not executable due the same GitHub runner blocker.

---

## 13. Render first-deploy exact next action

Current Blueprint is committed to `main`.

**Manual Render UI step required because connected MCP tools do not expose Blueprint Apply / persistent-disk creation.**

Open Render Blueprint creation from the GitHub repo and apply `render.yaml`.

After apply, Integration must immediately use connected Render tools to:

1. list services/Postgres and record resource IDs;
2. inspect each deployment status;
3. inspect build/runtime logs;
4. verify Postgres exists/healthy;
5. verify migrations from `schema_migrations`;
6. verify API `/health` and `/ready`;
7. verify Student/Admin URLs live;
8. verify CORS/session behavior;
9. smoke Student activation/login/recovery;
10. smoke Admin login/curriculum/content;
11. upload/process Stage13D media, redeploy/restart API, verify media survives;
12. record hosted evidence in central docs.

Do not manually trigger a duplicate deploy when autoDeploy is already active after the main push.

Hosted runtime remains `NOT YET VERIFIED` until these checks pass.

---

## 14. Next Integration sequence after Render bootstrap

A. Complete/verify Render bootstrap and update exact resource/deploy IDs.

B. Frontend Stage13E finishes bounded browser regression preparation.

C. When GitHub runners execute again, run Backend and Frontend unchanged gates.

D. Create short Stage13E integration branch from latest `main`, bring in accepted Backend `348c026...` and Frontend candidate lineage preserving intent/history where practical.

E. Run same-head API/Admin/Postgres/Stage12/auth/Stage13D/Chromium/390px/full regressions.

F. Only after PASS merge Stage13E to `main` → Render auto-deploy → hosted Stage13E verification.

G. Update central docs/Legacy Coverage/Roadmap and only then issue Stage13F commands.

---

## 15. Open risks

- `AI-011-005` P2 — direct AI question persistence into Stage13F unresolved.
- `AI-012-019` P2 — live provider benchmark/routes/bootstrap unverified.
- GitHub runner allocation blocker.
- Render hosted runtime awaits first Blueprint Apply and evidence.
- API single-instance while using local persistent media disk.
- production AI worker intentionally absent.
- Student full learning/offline/later product incomplete.

---

## 16. Update policy for this file

Update after every meaningful:

- Backend/Frontend REPORT;
- Integration ACCEPT/RETURN/PARTIAL;
- branch/HEAD change affecting resume;
- contract/root-cause decision;
- GitHub CI outcome;
- `main` promotion;
- Render resource/deploy/runtime result;
- Stage transition;
- hosting policy change.

When branch advances without report, record as observed WIP / `NOT YET VERIFIED`, not completed work.

If conflict occurs, precedence is:

1. current code/migrations + actual GitHub/Render executable evidence;
2. Current Product Overrides;
3. central Status/Handoff/Engineering Log;
4. specialized contracts/deployment docs;
5. this current operational snapshot;
6. Boards for dynamic commands/reports;
7. older planning/legacy docs.

Then update this file immediately.
