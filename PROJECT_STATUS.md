# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable verification + hosted development evidence تتقدم على prose. اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, و`PROJECT_INTEGRATION_CONTINUITY.md` للتفاصيل.

آخر تحديث: 2026-09-08.

## Current Position

- Repository: `7eaur/alwaslh`
- Integration/development delivery branch: **`main`**
- Legacy pre-rebuild `main` preserved at: `archive/legacy-main-2026-09-08` → `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`
- Render: **TEMPORARY FREE DEVELOPMENT / TEST HOSTING ONLY**
- Expected final production hosting: **VPS or Railway; final choice deferred until product requirements stabilize**
- Old Vercel serverless deployment path: **RETIRED / Git auto-deploy guarded off**
- Old Supabase resources: **historical/rollback resources; not final production authority**
- Latest fully verified application baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`
- Current product work: **Stage13E Admin AI Operations / Review — NOT YET VERIFIED and not merged to `main`**
- GitHub Actions: hosted-runner allocation blocker remains observed; no test weakening permitted.

## Product in one paragraph

الوسيلة الذكية منصة تعليمية عربية بسطحين مستقلين: Student Web/PWA للطالب وSuper Admin Web للإدارة، فوق Fastify API وPostgreSQL خاصين. الإدارة تبني وتراجع المنهج والمحتوى والوسائط وOCR/AI ثم تنشر authority موثوقة، والطالب يستهلك فقط المحتوى المصرح والمنشور ويتعلم ويتدرب ويختبر ويحفظ بياناته وفق المراحل. الـlegacy هو capability/failure reference وليس architecture target.

## Development Hosting — Render Free

Canonical doc: `docs/deployment/RENDER_DEVELOPMENT.md`.

Current temporary topology in `render.yaml`:

```text
Student Vite Static Site ─┐
                          ├── Docker Fastify API ── Render Free PostgreSQL
Admin Vite Static Site ───┘
```

Resources declared:

- `alwaslh-dev-student-7eaur` — Student static site.
- `alwaslh-dev-admin-7eaur` — Admin static site.
- `alwaslh-dev-api-7eaur` — Docker Fastify development API.
- `alwaslh-dev-postgres-7eaur` — temporary Render Free PostgreSQL 16.

The API remains Dockerized because Stage10 PDF processing requires Poppler (`pdfinfo` / `pdftoppm`). This is portable to future VPS/Railway hosting and avoids provider-specific rewrites.

Important free-environment limitation: there is no persistent disk. `MEDIA_STORAGE_ROOT=/app/runtime-data/media` is ephemeral, so upload flows can be tested functionally but media survival across restart/redeploy remains **NOT YET VERIFIED** and must not be treated as production durability.

Render Free Postgres is temporary development infrastructure and is not the long-term data authority.

## Delivery Model

```text
short Backend/Frontend branch
→ workstream REPORT + self-review
→ Integration review
→ integration candidate + cross-boundary gates
→ merge accepted state to main
→ Render development auto-deploy
→ hosted smoke/regression observation
→ central docs/evidence update
```

Render development reachability does not equal Stage PASS. Integration still declares `VERIFIED` only after required same-head executable evidence.

Final production promotion later will target the approved VPS/Railway environment, not automatically Render.

## Permanent Team Operating Model

- Backend / Platform — Issue `#14`, `docs/workstreams/BACKEND_WORKSTREAM.md`.
- Frontend / Product — Issue `#15`, `docs/workstreams/FRONTEND_WORKSTREAM.md`.
- Integration / Architecture / QA / Release — Issue `#16`, `docs/workstreams/INTEGRATION_WORKSTREAM.md`.
- Team Room — Issue `#13`.
- Main operational memory — `PROJECT_INTEGRATION_CONTINUITY.md`.
- Team rules — `docs/workstreams/TEAM_OPERATING_MODEL.md`.

Continuity and root-cause gates remain mandatory. Every important defect requires symptom, root cause, broken invariant/contract, blast radius, correct owning layer, regression evidence, and remaining `NOT YET VERIFIED`.

## Fully Verified Application Baseline

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

Do not replace this baseline until a newer executable same-head matrix actually runs green. Hosted development evidence is additional observation, not a substitute.

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
| Render free development runtime | **CONFIGURED / AWAITING BLUEPRINT APPLY + DEVELOPMENT VERIFICATION** |
| Final VPS/Railway production | **NOT YET DESIGNED / DEFERRED UNTIL PRODUCT MATURITY** |

## Stage13E Current Candidate State

Backend:
- branch `backend/stage13e-ai-operations`
- HEAD `348c02646d0ff873fd305beff16f41c46d9c0285`
- Issue #14 REPORT `5579330147`
- structurally accepted Integration candidate; executable same-head gates still blocked by hosted runner allocation.

Frontend:
- branch `frontend/stage13e-ai-operations`
- HEAD `e42644944ca3fcc7e225a263a6e9699bcb70b9f7`
- Issue #15 REPORT `5579436581`
- production-style API binding exists; Integration returned only bounded browser regression preparation for real session-expiry + stale-review `409` conflict.

Neither candidate is in `main` yet.

## Hosting Decisions

- Render is development/test only and should remain near-zero cost.
- `main` feeds the Render development environment after Integration acceptance.
- Final production hosting is expected to be VPS or Railway; do not introduce Render-specific architecture coupling.
- Dockerized API, environment-driven configuration, PostgreSQL via `DATABASE_URL`, and migration tooling must remain portable.
- free Render media filesystem is intentionally ephemeral; do not add a provider-specific storage rewrite only to make temporary testing durable.
- durable media architecture will be selected before final production based on real requirements.
- no fake AI background worker is deployed: Stage12 production provider/bootstrap is not implemented yet.

## Immediate Next Work

1. Apply the free `render.yaml` Blueprint for development/testing only.
2. Verify free database + API + Student + Admin resources deploy.
3. Verify migrations, `/health`, `/ready`, logs, DB connectivity and Poppler PDF processing.
4. Verify session/CORS behavior from both frontends.
5. Verify Stage13D mixed image/PDF flow functionally; explicitly do not claim media durability across redeploy.
6. Record exact Render development resource/deploy IDs and observations in central docs.
7. Continue Stage13E in its existing feature branches; do not merge to `main` until its gates pass.
8. Revisit VPS/Railway production architecture only when later product stages make capacity/storage/availability requirements concrete.

## High-Priority Open Boundaries

- `AI-011-005` P2 — `direct` AI question persistence for Stage13F unresolved.
- `AI-012-019` P2 — live AI provider benchmark/config/routes/bootstrap unverified.
- Stage13E same-head executable verification blocked by GitHub hosted runner allocation.
- production AI background worker not yet runnable by design.
- Render development environment not yet applied/runtime-verified.
- Render Free media durability is intentionally unavailable and remains `NOT YET VERIFIED`.
- final VPS/Railway production topology and durable media storage are intentionally deferred.
- Student full learning product / Offline/PWA / later stages remain incomplete.

## Stable Non-Negotiable Boundaries

- Browser does not own PostgreSQL/auth/publish/job state.
- Full Code = 6 digits; Class Code = 7 digits.
- Student login requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory is provenance, not curriculum authority.
- `media ready != published`.
- exact AI modes never fabricate unknown answers.
- durable AI worker remains separate from Fastify HTTP.
- no test weakening, auth bypass, hidden catch, duplicate lifecycle or wrong-layer hosting workaround.

## Documentation Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md (Integration) → TEAM_OPERATING_MODEL/workstream → CURRENT_PRODUCT_OVERRIDES → specialized docs`.
