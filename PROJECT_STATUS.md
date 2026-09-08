# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable verification تتقدم على prose. اقرأ `PROJECT_HANDOFF.md`, `PROJECT_ENGINEERING_LOG.md`, و`PROJECT_INTEGRATION_CONTINUITY.md` للتفاصيل.

آخر تحديث: 2026-09-08 — hosting/deployment fully deferred until VPS; Stage13E combined candidate remains current work and verification is blocked only by GitHub runner allocation.

## Current Position

- Repository: `7eaur/alwaslh`
- Development baseline: **`main`** = latest Integration-approved development state.
- Hosting/deployment: **FULLY DEFERRED UNTIL VPS IS AVAILABLE**. Not a current task, blocker or Stage gate.
- Legacy pre-rebuild archive: `archive/legacy-main-2026-09-08` → `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Latest fully verified application baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`.
- Current product work: **Stage13E Admin AI Operations / Review — COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`**.
- GitHub Actions: hosted-runner allocation blocker has repeatedly produced jobs with no executable steps; this is verification infrastructure evidence, not product-failure evidence.

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
- architecture stays portable naturally; no hosting-provider implementation work now.

## Current Definition of Done

Until Product Owner reopens deployment after VPS availability, Stage closure uses only executable engineering evidence appropriate to the Stage:

1. code/contracts reviewed;
2. lint + strict typecheck;
3. unit tests;
4. integration tests;
5. clean PostgreSQL migrations and DB contract verification where relevant;
6. build;
7. browser/Chromium E2E and responsive/a11y regressions where relevant;
8. security/performance/legacy regression checks;
9. same-head Integration review;
10. central/specialized docs + Legacy Coverage/roadmap synchronization.

No deploy or hosted smoke is required.

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
| Hosting / deployment | **DEFERRED UNTIL VPS / OUTSIDE CURRENT ROADMAP EXECUTION** |

## Stage13E Candidate State

Backend:

- branch `backend/stage13e-ai-operations`
- HEAD `348c02646d0ff873fd305beff16f41c46d9c0285`
- structurally accepted Integration candidate; standalone executable same-head gates were blocked before checkout.

Frontend:

- branch `frontend/stage13e-ai-operations`
- Product/Test HEAD `7bf2f8c32907032551aace9f3aa27681040c4b0f`
- documented branch HEAD `1eb141e950e96c9f53ffd103a386d59166113c16`
- REPORT #15 `5579577424`
- Integration Review #15 `5580147549`: real-browser session-expiry + stale-review `409` preparation accepted as Integration candidate.

Combined Integration:

- branch `integration/stage13e-ai-operations`
- assembled from `main @ 1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`
- Backend selective commit `227f4c9dba99e7b8c93d25caebe86e38108d4a5c`
- Frontend selective commit `a60274fedf55fb45b6684743da24b24004339917`
- real fixture seed `4ba77703866762c471257bbb914590b817ecc82e`
- combined workflow HEAD `807f733838e2fab2620652025b255c3bc404fec1`
- Integration Report #16 `5580151268`

## Stage13E Combined Browser Contract

Fixture variables:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`

Combined Chromium covers authenticated happy path, pause/resume, approve + reload durability, real session expiry, real stale-action `409` canonical refresh and 390px overflow. No mock API, route interception, fake 401/409, test-only Backend endpoint, cookie forging or sleep-based race.

## Latest Stage13E Executable Attempts

Run: `34193380473`

HEAD: `807f733838e2fab2620652025b255c3bc404fec1`

Attempt 1:

- job `101955846938`
- ended before checkout
- `runner_id=0`
- `steps=[]`

Attempt 2, explicitly rerun after hosting was removed from the roadmap:

- job `101958463625`
- `run_attempt=2`
- `steps=[]`
- no job logs were produced
- no checkout and no executable product/test step.

Interpretation: Stage13E remains **verification-blocked by GitHub runner allocation only**. There is still no executed failure attributable to code, migration, fixture, API or browser tests.

A local execution fallback was also checked from the current assistant environment, but repository network access is unavailable there, so no local test claim is made.

## Immediate Next Work

1. Keep Stage13E outside `main` until executable verification passes.
2. Keep the combined gate unchanged; rerun when GitHub allocates an actual runner.
3. If executable steps run and fail, fix root cause in the owning layer and add regression coverage.
4. If combined gate passes, run required wider same-head regressions.
5. Promote Stage13E to `main`, then synchronize `PROJECT_ENGINEERING_LOG.md`, central/specialized docs, Legacy Coverage and roadmap.
6. Start Stage13F only after Stage13E closure unless Product Owner explicitly changes the stage dependency rule.
7. Do **not** perform any hosting/deployment work until an explicit future VPS command.

## High-Priority Open Boundaries

- Stage13E executable verification is blocked only by GitHub runner allocation.
- `AI-011-005` P2 — `direct` AI question persistence for Stage13F unresolved.
- `AI-012-019` P2 — live AI provider benchmark/config/routes/bootstrap unverified.
- live-provider/production AI worker bootstrap absent by design; do not couple it to Fastify.
- Student full learning product / Offline/PWA / later stages remain incomplete.
- VPS deployment architecture is intentionally future work and not a current blocker.

## Documentation Startup Path

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md (Integration) → TEAM_OPERATING_MODEL/workstream → CURRENT_PRODUCT_OVERRIDES → specialized docs`.
