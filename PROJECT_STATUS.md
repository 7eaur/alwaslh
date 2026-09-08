# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable verification + actual hosted-runtime evidence تتقدم على prose. اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, و`PROJECT_INTEGRATION_CONTINUITY.md` للتفاصيل.

آخر تحديث: 2026-09-08 — Stage13E combined candidate assembled; executable runner still blocked.

## Current Position

- Repository: `7eaur/alwaslh`
- Development delivery branch: **`main`**
- Current `main` application/hosting base before this docs update: `1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`
- Legacy pre-rebuild `main`: `archive/legacy-main-2026-09-08` → `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`
- Render: **TEMPORARY FREE DEVELOPMENT / TEST HOSTING ONLY**
- Expected final production hosting: **VPS or Railway; deferred until requirements stabilize**
- Old Vercel serverless path: **RETIRED / Git auto-deploy guarded off**
- Old Supabase resources: historical/rollback only; not final production authority
- Latest fully verified application baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`
- Current product work: **Stage13E Admin AI Operations / Review — COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`**
- GitHub Actions: hosted-runner allocation blocker remains observed (`runner_id=0`, `steps=[]`); no test weakening permitted.

## Product / Architecture

الوسيلة الذكية منصة تعليمية عربية بواجهتي Student Web/PWA وSuper Admin Web فوق Fastify API وPostgreSQL. الإدارة تبني وتراجع المنهج والمحتوى والوسائط وOCR/AI ثم تنشر authority موثوقة، والطالب يستهلك فقط المحتوى المصرح والمنشور. الـlegacy capability/failure reference وليس architecture target.

Stable boundaries:

- Browser لا يملك PostgreSQL/auth/publish/job authority.
- Full Code = 6 digits; Class Code = 7 digits.
- Student returning login = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source inventory = provenance, not curriculum authority.
- `media ready != published`.
- exact AI modes never fabricate unknown answers.
- AI worker lifecycle remains separate from Fastify HTTP.
- no test weakening, auth bypass, fake API, duplicate lifecycle or wrong-layer workaround.

## Temporary Render Development Hosting

Canonical: `render.yaml` + `docs/deployment/RENDER_DEVELOPMENT.md`.

```text
Student Vite Static Site ─┐
                          ├── Docker Fastify API ── Render Free PostgreSQL
Admin Vite Static Site ───┘
```

Declared free resources:

- `alwaslh-dev-student-7eaur`
- `alwaslh-dev-admin-7eaur`
- `alwaslh-dev-api-7eaur`
- `alwaslh-dev-postgres-7eaur`

API remains Dockerized because PDF processing requires Poppler. Free Render media filesystem is ephemeral; media durability across restart/redeploy remains `NOT YET VERIFIED` by design. Final durable storage/production topology is intentionally deferred.

Blueprint Apply/runtime verification is still pending according to current repository evidence; do not claim hosted PASS until actual Render resources/deploys/logs are inspected.

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

Do not replace this baseline until a newer same-head executable matrix actually runs green.

## Stage Ledger

| Stage / Area | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 Provider-neutral AI Contracts | VERIFIED |
| Stage12 Durable AI Execution / Worker Runtime | VERIFIED backend/runtime; live provider bootstrap unverified |
| Stage13A Curriculum Backend | VERIFIED |
| Stage13B Admin Curriculum UI | VERIFIED incl. Chromium |
| Stage13C Admin Content/Media/OCR | VERIFIED incl. Chromium |
| Stage13D Upload/History/Publication Linking | VERIFIED incl. Chromium |
| Stage13E Admin AI Operations / Review | **COMBINED CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`** |
| Stage13F+ | REQUIRED / later |
| Render free development runtime | CONFIGURED / APPLY + runtime verification pending |
| Final VPS/Railway production | DEFERRED until product/operational requirements stabilize |

## Stage13E Candidate State

Backend:

- branch `backend/stage13e-ai-operations`
- HEAD `348c02646d0ff873fd305beff16f41c46d9c0285`
- structurally accepted Integration candidate; executable same-head gates blocked before checkout.

Frontend:

- branch `frontend/stage13e-ai-operations`
- Product/Test HEAD `7bf2f8c32907032551aace9f3aa27681040c4b0f`
- documented branch HEAD `1eb141e950e96c9f53ffd103a386d59166113c16`
- REPORT #15 `5579577424`
- Integration Review #15 `5580147549`: bounded real-browser session-expiry + stale-review `409` preparation **ACCEPTED AS INTEGRATION CANDIDATE**.

Combined Integration:

- branch `integration/stage13e-ai-operations`
- based on current `main @ 1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`
- Backend selective commit `227f4c9dba99e7b8c93d25caebe86e38108d4a5c`
- Frontend selective commit `a60274fedf55fb45b6684743da24b24004339917`
- real fixture seed `4ba77703866762c471257bbb914590b817ecc82e`
- combined workflow HEAD `807f733838e2fab2620652025b255c3bc404fec1`
- Integration Report #16 `5580151268`

The combined branch is exactly 4 commits ahead of that `main` base and contains only Stage13E API/Admin/tests/migration/docs/workflows plus Integration fixture/workflow. Current Render/Docker/Vercel guard configuration is not modified by the Stage13E diff.

## Stage13E Combined Browser Contract

Real fixture variables:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy` — non-terminal job with an open valid review output plus a queued unit; enables real pause/resume + approval.
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race` — completed execution with an open valid review output; prevents non-terminal polling from erasing stale UI before a real out-of-band review mutation.

Combined Chromium covers:

- authenticated happy path;
- pause/resume;
- approve + reload durability;
- real same-context session logout/expiry handling;
- real stale-action `409` canonical refresh;
- 390px overflow regression.

No mock API, route interception, fake 401/409, test-only Backend endpoint, cookie forging or sleep-based race is introduced.

## Latest Stage13E Executable Attempt

Combined run: `34193380473`

Job: `101955846938`

HEAD: `807f733838e2fab2620652025b255c3bc404fec1`

Observed result:

- `conclusion=failure`
- `runner_id=0`
- `runner_name=""`
- `steps=[]`
- no checkout and no executable product/test step.

Interpretation: repository-wide hosted-runner allocation blocker, **not evidence of Stage13E code failure**. Do not alter product behavior or weaken tests because of this conclusion.

## Immediate Next Work

1. Keep Stage13E outside `main`.
2. When GitHub runner allocation works, rerun the unchanged combined gate on `integration/stage13e-ai-operations`.
3. Review actual API/Admin/PostgreSQL/Chromium results and fix only executed defects at their owning layer.
4. If same-head combined gate passes, run required wider regressions, then Integration may promote Stage13E to `main` and close docs/Legacy Coverage.
5. Independently, apply/verify the free Render development Blueprint when the Product Owner performs the pending Dashboard step; hosted development evidence does not substitute for Stage PASS.
6. Stage13F must not start until Stage13E closure.

## High-Priority Open Boundaries

- `AI-011-005` P2 — `direct` AI question persistence for Stage13F unresolved.
- `AI-012-019` P2 — live AI provider benchmark/config/routes/bootstrap unverified.
- Stage13E same-head executable verification blocked by hosted runner allocation.
- production AI worker absent by design.
- Render development environment not yet runtime-verified.
- Render Free media durability intentionally unavailable.
- final VPS/Railway production topology and durable media storage deferred.
- Student full learning product / Offline/PWA / later stages remain incomplete.

## Documentation Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md (Integration) → TEAM_OPERATING_MODEL/workstream → CURRENT_PRODUCT_OVERRIDES → specialized docs`.
