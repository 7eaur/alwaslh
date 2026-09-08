# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable verification + hosted Render evidence تتقدم على prose. اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, و`PROJECT_INTEGRATION_CONTINUITY.md` للتفاصيل.

آخر تحديث: 2026-09-08.

## Current Position

- Repository: `7eaur/alwaslh`
- Production branch: **`main`**
- Current production cutover HEAD: `febd8ca2fe047a0b3a961bf73060289ed35e79c6`
- Previous legacy `main` preserved at: `archive/legacy-main-2026-09-08` → `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`
- Render: **PRIMARY PRODUCTION HOSTING TARGET / DEPLOYMENT RE-ENABLED**
- Old Vercel serverless deployment path: **RETIRED IN REPOSITORY**
- Old Supabase database: **NOT production authority / OUT OF CURRENT DATA-MIGRATION SCOPE**
- Latest fully verified pre-hosting executable baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`
- Current product work: **Stage13E Admin AI Operations / Review — NOT YET VERIFIED and not merged to `main`**
- GitHub Actions: current hosted-runner allocation blocker remains observed; no test weakening permitted.

## Product in one paragraph

الوسيلة الذكية منصة تعليمية عربية بسطحين مستقلين: Student Web/PWA للطالب وSuper Admin Web للإدارة، فوق Fastify API وPostgreSQL خاصين. الإدارة تبني وتراجع المنهج والمحتوى والوسائط وOCR/AI ثم تنشر authority موثوقة، والطالب يستهلك فقط المحتوى المصرح والمنشور ويتعلم ويتدرب ويختبر ويحفظ بياناته وفق المراحل. الـlegacy هو capability/failure reference وليس architecture target.

## Production Architecture — Render

الـproduction topology الحالية المعلنة في `render.yaml`:

```text
Student Vite Static Site ─┐
                          ├── Fastify API ── Render Managed PostgreSQL
Admin Vite Static Site ───┘       │
                                  └── Render Persistent Disk for media
```

Resources declared:

- `alwaslh-prod-student-7eaur` — Student static/CDN.
- `alwaslh-prod-admin-7eaur` — Admin static/CDN.
- `alwaslh-prod-api-7eaur` — Node/Fastify web service.
- `alwaslh-prod-postgres-7eaur` — PostgreSQL 16.
- `alwaslh-prod-media-7eaur` — persistent API media disk.

Canonical deployment doc: `docs/deployment/RENDER_PRODUCTION.md`.

**Important:** Hosted runtime is still `NOT YET VERIFIED` until the Render Blueprint is applied and health/session/media checks pass. Configuration in Git alone is not runtime evidence.

## Delivery Model

```text
short Backend/Frontend branch
→ workstream REPORT + self-review
→ Integration review
→ integration candidate + cross-boundary gates
→ merge accepted state to main
→ Render auto-deploy from main
→ hosted runtime verification
→ central docs/evidence update
```

Backend/Frontend never deploy their branches directly to production. `main` is the production source branch.

## Permanent Team Operating Model

- Backend / Platform — Issue `#14`, `docs/workstreams/BACKEND_WORKSTREAM.md`.
- Frontend / Product — Issue `#15`, `docs/workstreams/FRONTEND_WORKSTREAM.md`.
- Integration / Architecture / QA / Release — Issue `#16`, `docs/workstreams/INTEGRATION_WORKSTREAM.md`.
- Team Room — Issue `#13`.
- Main operational memory — `PROJECT_INTEGRATION_CONTINUITY.md`.
- Team rules — `docs/workstreams/TEAM_OPERATING_MODEL.md`.

Continuity and root-cause gates remain mandatory. Every important defect requires symptom, root cause, broken invariant/contract, blast radius, correct owning layer, regression evidence, and remaining `NOT YET VERIFIED`.

## Fully Verified Pre-Render Runtime Baseline

Exact executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

| Gate | Run | Result |
|---|---:|---|
| Stage13D Admin Upload UI | `34177369743` | SUCCESS |
| Stage13D Content Ingestion | `34177369784` | SUCCESS |
| Stage13 Admin Product | `34177369748` | SUCCESS |
| Stage12 AI Execution | `34177369812` | SUCCESS |
| Stage11 AI Contracts | `34177369753` | SUCCESS |
| OCR Foundation | `34177369750` | SUCCESS |
| Stage10 Media Pipeline | `34177369777` | SUCCESS |
| Stage9 Content Import | `34177369756` | SUCCESS |
| Full Rebuild | `34177369768` | SUCCESS incl. Student Chromium |

Do not replace this baseline until a newer executable same-head matrix actually runs green. Render deployment evidence will be an additional hosted-runtime gate, not a substitute for code verification.

## Stage Ledger

| Stage / Area | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 Provider-neutral AI Contracts | VERIFIED |
| Stage12 Durable AI Execution / Worker Runtime | VERIFIED backend/runtime; live provider bootstrap still unverified |
| Stage13A Curriculum Backend | VERIFIED |
| Stage13B Admin Curriculum UI | VERIFIED incl. Chromium |
| Stage13C Admin Content/Media/OCR | VERIFIED incl. Chromium |
| Stage13D Upload/History/Publication Linking | VERIFIED incl. Chromium |
| Stage13E Admin AI Operations / Review | **IN PROGRESS / NOT YET VERIFIED / OUTSIDE `main`** |
| Stage13F+ | REQUIRED / later |
| Render hosted runtime | **CONFIGURED / AWAITING BLUEPRINT APPLY + VERIFICATION** |

## Stage13E Current Candidate State

Backend:
- branch `backend/stage13e-ai-operations`
- HEAD `348c02646d0ff873fd305beff16f41c46d9c0285`
- Issue #14 REPORT `5579330147`
- Integration candidate accepted structurally; executable same-head gates still blocked by hosted runner allocation.

Frontend:
- branch `frontend/stage13e-ai-operations`
- HEAD `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`
- Issue #15 REPORT `5579436581`
- production binding exists; Integration returned only bounded browser regression preparation for real session-expiry + stale-review `409` conflict.

Neither candidate is in `main` yet.

## Render Cutover Decisions

- Render is current primary hosting provider.
- `main` is current production source.
- legacy pre-rebuild main is archived, not deleted.
- root Vercel deployment config/serverless adapter/build path were removed.
- current PostgreSQL migrations target Render Managed PostgreSQL.
- media storage requires a Render persistent disk; ephemeral filesystem is forbidden for production uploads.
- no fake AI background worker is deployed: Stage12 docs explicitly state production provider/bootstrap is not implemented yet.
- custom domains may be added later; when added, update frontend API URL + API CORS origins together.

## Immediate Next Work

1. Apply the committed `render.yaml` Blueprint in Render.
2. Verify database + API + Student + Admin resources exist and deploy.
3. Verify migrations, `/health`, `/ready`, logs and DB connectivity.
4. Verify session/CORS behavior from both frontends.
5. Verify Stage13D media persists through API restart/redeploy.
6. Record exact Render resource/deploy IDs and hosted results in central docs.
7. Continue Stage13E in its existing feature branches; do not merge to `main` until its gates pass.

## High-Priority Open Boundaries

- `AI-011-005` P2 — `direct` AI question persistence for Stage13F unresolved.
- `AI-012-019` P2 — live AI provider benchmark/config/routes/bootstrap unverified.
- Stage13E same-head executable verification blocked by GitHub hosted runner allocation.
- production AI background worker not yet runnable by design.
- Render hosted deployment has not yet been runtime-verified.
- future shared/object media storage may be needed before horizontal API scaling; current persistent disk intentionally makes API single-instance.
- Student full learning product / Offline/PWA / later stages remain incomplete.

## Stable Non-Negotiable Boundaries

- Browser does not own PostgreSQL/auth/publish/job state.
- Full Code = 6 digits; Class Code = 7 digits.
- Student login requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory is provenance, not curriculum authority.
- `media ready != published`.
- uploaded media in production must be durable.
- exact AI modes never fabricate unknown answers.
- durable AI worker remains separate from Fastify HTTP.
- no test weakening, auth bypass, hidden catch, duplicate lifecycle or wrong-layer production workaround.

## Documentation Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md (Integration) → TEAM_OPERATING_MODEL/workstream → CURRENT_PRODUCT_OVERRIDES → specialized docs`.
