# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي مهندس/محادثة بديلة يجب أن تستطيع استئناف المشروع من GitHub بدون ذاكرة محادثة سابقة.

Last synchronized: 2026-09-08 — hosting/deployment fully deferred until VPS; development/testing/documentation continue normally.

## 0. Mandatory startup

قبل تغيير أي كود:

1. Confirm repo `7eaur/alwaslh`.
2. Treat **`main` as the Integration-approved development baseline**.
3. Read `README.md` → `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md`.
4. Main/Integration replacement also reads `PROJECT_INTEGRATION_CONTINUITY.md`.
5. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
6. Read `docs/workstreams/TEAM_OPERATING_MODEL.md` + relevant workstream file.
7. Read latest Team Room `#13`, Backend `#14`, Frontend `#15`, Integration `#16` messages.
8. Inspect actual code/migrations/tests before changing an area.
9. Live-check branch HEADs and executable GitHub Actions evidence before conclusions.
10. Anything not inspected/executed = `NOT YET VERIFIED`.

**Do not perform hosting/deployment work.** Hosting is fully deferred until Product Owner explicitly reopens it after a VPS is available.

## 1. Repository / Git state

- Repo: `7eaur/alwaslh`.
- Integration-approved development baseline: **`main`**.
- Legacy pre-rebuild archive: `archive/legacy-main-2026-09-08` → `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Latest fully verified application baseline remains `4eca7de8877ac9e2289b9c7990c912d33c256935` until a newer same-head executable matrix is green.
- Current product work: Stage13E Admin AI Operations / Review.
- Current Stage13E combined branch: `integration/stage13e-ai-operations @ 807f733838e2fab2620652025b255c3bc404fec1`.

Do not rewrite `main` history casually. Use short-lived workstream branches and Integration review.

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
- Integration / Architecture / QA — Issue `#16`, `docs/workstreams/INTEGRATION_WORKSTREAM.md`.
- Shared Team Room — Issue `#13`.
- Main operational memory — `PROJECT_INTEGRATION_CONTINUITY.md`.

Chats are replaceable. GitHub is the coordination/memory bus.

## 4. Development delivery model

```text
latest Integration-approved main
→ short Backend/Frontend branch
→ implementation + tests + REPORT
→ Integration review
→ integration candidate + cross-boundary gates
→ required same-head regression
→ merge accepted changes to main
→ central docs / Legacy Coverage / roadmap closure
→ next Stage
```

There is **no deploy/hosted-runtime step** in the current Definition of Done.

## 5. Current Product Owner overrides

Authority: `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.

- Hosting/deployment are fully deferred until VPS is available and Product Owner explicitly reopens them.
- `main` is Integration-approved development baseline, not current production source.
- old hosting/provider state is not a current blocker or acceptance gate.
- old database migration remains out of scope.
- repository documentation is official memory.
- root-cause only; no test/security/business-rule weakening.
- Stage13E remains outside `main` until its executable gates pass.

## 6. Stable architecture / business boundaries

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
- browser never owns durable queue/progress/publication/trusted scoring.
- preserve portability naturally; do not build provider-specific hosting architecture now.

## 7. Verified stage history

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

## 8. Current Stage13E work

Backend candidate:

- branch `backend/stage13e-ai-operations`
- HEAD `348c02646d0ff873fd305beff16f41c46d9c0285`
- structurally accepted; standalone executable same-head gates were blocked before checkout by GitHub runner allocation.

Frontend candidate:

- branch `frontend/stage13e-ai-operations`
- Product/Test HEAD `7bf2f8c32907032551aace9f3aa27681040c4b0f`
- documented HEAD `1eb141e950e96c9f53ffd103a386d59166113c16`
- REPORT #15 `5579577424`
- browser regression preparation accepted by Integration Review #15 `5580147549`.

Combined candidate:

- `integration/stage13e-ai-operations`
- Backend selective integration `227f4c9dba99e7b8c93d25caebe86e38108d4a5c`
- Frontend selective integration `a60274fedf55fb45b6684743da24b24004339917`
- real E2E fixture `4ba77703866762c471257bbb914590b817ecc82e`
- combined workflow HEAD `807f733838e2fab2620652025b255c3bc404fec1`
- Integration Report #16 `5580151268`

Combined gate covers API/Admin lint/typecheck/unit/build, clean PostgreSQL migration/contracts, Stage13E + Stage12/auth regressions, Admin bootstrap, real fixture, Chromium happy/reload/session-expiry/stale-409/390px.

No mocks/fake API/test-only Backend route/sleep race are used.

## 9. GitHub Actions blocker

Latest Stage13E combined run before this handoff:

- run `34193380473`
- job `101955846938`
- HEAD `807f733838e2fab2620652025b255c3bc404fec1`
- `runner_id=0`
- `steps=[]`

No checkout/product/test step ran, so this is not code-failure evidence.

Do not weaken tests. Rerun unchanged gates when runner allocation executes; fix only actual executed failures at the owning layer.

## 10. Exact next work

1. Keep Stage13E outside `main` until executable verification passes.
2. Rerun unchanged `.github/workflows/stage13e-integration.yml` on the combined branch.
3. If a real step fails, identify root cause, fix in correct layer and add regression protection.
4. After combined PASS, run wider same-head regressions required by Stage Closure.
5. Promote accepted Stage13E runtime to `main`.
6. Update `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file, `PROJECT_INTEGRATION_CONTINUITY.md`, specialized docs, Legacy Coverage and roadmap.
7. Only then start Stage13F.
8. Ignore all hosting/deployment work until explicit future VPS command.

## 11. Known open work

- Stage13E executable verification/integration closure.
- `AI-011-005` direct Question Bank persistence unresolved for Stage13F.
- `AI-012-019` live AI provider benchmark/routes/bootstrap unverified.
- production/live-provider worker bootstrap remains future work, but must stay architecturally separate from Fastify.
- full Student learning/offline/later stages incomplete.
- final VPS deployment architecture intentionally **not current work**.

## 12. Session-end documentation rule

Every workstream updates role doc + Board REPORT. Integration updates central status/log/handoff/continuity, specialized docs, Legacy Coverage and roadmap using exact Git HEAD + executable test/run evidence.

Do not require or record hosted deployment evidence while PO-OVR-001 is active.