# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية الثابتة للمحادثة الرئيسية Integration / Architecture / QA / Release. أي محادثة بديلة يجب أن تستطيع الاستمرار من هذا الملف + Source of Truth بدون Chat history.
>
> **Authority:** current code/migrations + executable GitHub evidence + actual hosted-runtime evidence تتقدم على هذا الملف. أي شيء غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Stage13E combined candidate assembled; hosted runner still terminates before checkout**.

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `DOCUMENTATION_INDEX.md` → `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → this file.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
4. Read `docs/workstreams/TEAM_OPERATING_MODEL.md` + relevant workstream file.
5. Read latest Issues #13/#14/#15/#16.
6. Hosting work: read `render.yaml` + `docs/deployment/RENDER_DEVELOPMENT.md`.
7. Live-check `main`, feature/integration branch heads, GitHub Actions, and Render resources before conclusions.
8. Anything not inspected/executed stays `NOT YET VERIFIED`.

## 2. Main Integration responsibility

Integration owns architecture coherence, cross-team contracts, QA/security/performance/UX review, combined branches, release decisions, hosted-development verification and central docs.

Backend/Frontend readiness never equals Stage PASS. Integration alone declares `VERIFIED` after required same-head executable evidence.

## 3. Stable product / architecture

**الوسيلة الذكية** Arabic education platform:

- Student Web/PWA: secure access, entitled curriculum, Reader, practice/tests, personal learning data, notifications/offline.
- Super Admin: curriculum/content, mixed media ingestion, OCR, AI operations/review, Question Bank, students/codes/recovery/reports/settings/audit.
- Backend: Fastify + PostgreSQL authority for auth/access/business state/media/OCR/AI/review/publication.

Stable rules:

- Full Code 6 digits; Class Code 7 digits.
- activation verify non-consuming; finalize atomic.
- returning Student = password + registered P-256 proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- source import = provenance, never curriculum authority.
- `media ready != published`.
- browser does not own durable business state.
- exact AI never fabricates unknown answers.
- provider calls outside long DB transactions.
- Fastify HTTP remains separate from durable AI worker runtime.
- no secrets/raw provider internals client-side.
- root-cause only; no test weakening/auth bypass/fake API/duplicate authority.

## 4. Git / delivery state

`main` is Integration-approved development delivery and feeds temporary Render development after accepted merges.

Stage13E is **not in `main`**.

Current Stage13E integration branch:

`integration/stage13e-ai-operations`

It was intentionally created from the then-current production/development base:

`main @ 1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`

Central docs have since advanced on `main`; those docs-only commits do not make the Stage13E candidate stale at the product/runtime layer. Before eventual promotion, rebase/selectively sync latest central docs rather than overwrite them from feature branches.

Legacy old-main archive:

`archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

## 5. Temporary Render development direction

Repository authority currently classifies Render as **free development/test hosting only**, not final production.

Declared topology:

```text
Student static ─┐
                ├── Docker Fastify API ── Render Free PostgreSQL
Admin static ───┘
```

API is Dockerized and includes Poppler because Stage10 PDF processing executes `pdfinfo` / `pdftoppm`.

Free media filesystem is ephemeral. Media durability across restart/redeploy remains `NOT YET VERIFIED` by design. Final VPS/Railway production topology and durable media architecture remain deferred until real product/operational requirements stabilize.

Current repository evidence still says Render Blueprint Apply/runtime verification is pending. Verify actual Render state before changing that claim.

Vercel old serverless path is retired; root `vercel.json` is only a Git-deployment kill-switch. Historical Supabase Alwaslh resources remain rollback/history only.

## 6. Fully verified application baseline

Latest fully green application head remains:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

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

Do not replace this baseline with docs/hosting commits or unexecuted Stage13E candidates.

## 7. GitHub Actions blocker

Current independent workflows repeatedly terminate before checkout with no runner allocation:

- `runner_id=0`
- `runner_name=""`
- `steps=[]`

This is external verification-infrastructure evidence, not a product regression. Do not weaken gates or churn product code because of those conclusions.

## 8. Stage13E Backend candidate

Branch:

`backend/stage13e-ai-operations @ 348c02646d0ff873fd305beff16f41c46d9c0285`

Backend candidate provides:

- Admin jobs/units/attempts/outputs read models;
- server-derived progress + `allowedActions`;
- Stage12 pause/resume/cancel/retry authority;
- provider/model/project observability without credentials/raw provider internals;
- source/page/checksum provenance;
- append-only edit/approve/reject audit through `0018_ai_admin_review.sql`;
- Stage11 semantic validation for Admin edit/approve;
- server-derived `allowedReviewActions`;
- strict discriminated review HTTP body;
- terminal review race protection.

Backend candidate is structurally accepted, but its standalone same-head execution is blocked before checkout.

## 9. Stage13E Frontend candidate

Branch:

`frontend/stage13e-ai-operations @ 1eb141e950e96c9f53ffd103a386d59166113c16`

Product/Test HEAD:

`7bf2f8c32907032551aace9f3aa27681040c4b0f`

REPORT #15:

`5579577424`

Latest Integration Review #15:

`5580147549` — **bounded browser regression prep ACCEPTED AS INTEGRATION CANDIDATE**.

Verified by code review:

- production API binding, no invented endpoint;
- real same-BrowserContext logout/session-expiry path;
- real out-of-band review mutation producing stale UI `409`;
- safe feedback + canonical refresh to rejected state;
- 390px overflow assertion;
- no route interception/mock API/fake 401/409/test-only Backend endpoint/manual cookie mutation/sleep race.

Frontend standalone run `34189236669`, job `101943693820`, terminated before checkout with `runner_id=0`, `steps=[]`.

## 10. Stage13E combined Integration branch

Branch:

`integration/stage13e-ai-operations`

Assembly strategy:

Backend/Frontend feature branches predate newer `main` hosting/central-doc changes and had diverged histories. Direct merge was intentionally rejected. Integration overlaid only reviewed Stage13E product/test/specialized-contract files onto current `main` lineage.

Commits:

- `227f4c9dba99e7b8c93d25caebe86e38108d4a5c` — selective Backend candidate;
- `a60274fedf55fb45b6684743da24b24004339917` — selective Frontend candidate;
- `4ba77703866762c471257bbb914590b817ecc82e` — real Stage13E E2E fixture seed;
- `807f733838e2fab2620652025b255c3bc404fec1` — combined integration workflow.

Temporary diff PRs #21/#22 were closed unmerged after file enumeration. They are not delivery PRs.

Final diff review from base `1069aabc...` to `807f7338...`:

- exactly 4 commits ahead, 0 behind at assembly time;
- only Stage13E API/Admin/tests/migration/docs/workflows + Integration fixture/workflow;
- no Render/Docker/Vercel retirement config changed;
- no unrelated Student code changed;
- `App.tsx` retains Curriculum, Content Ingestion and Content Operations and adds AI Operations.

## 11. Combined real-browser fixture authority

Fixture utility:

`apps/api/tests/fixtures/stage13e-e2e-seed.ts`

Environment contract:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`

Happy fixture:

- non-terminal queued job;
- one `review_required` unit with valid open output;
- one additional queued unit;
- real pause/resume remains server-authorized while review remains available.

Race fixture:

- execution-terminal completed job;
- one `review_required` unit with valid open output;
- no review event initially;
- terminal execution prevents normal 5s non-terminal polling from erasing the stale UI state before out-of-band review mutation.

No test-only API endpoint is created. Fixture writes normal durable tables directly in CI after migrations, matching existing repository E2E fixture practice.

## 12. Combined Stage13E gate

Workflow:

`.github/workflows/stage13e-integration.yml`

Expected execution:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E DB contract;
4. Stage13E Backend authority/race integration tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth security regression;
7. fresh DB reset;
8. real Admin bootstrap;
9. seed happy + race fixtures;
10. assert fixture DB invariants;
11. Chromium Stage13E happy/reload/session-expiry/stale-409/390px suite.

Latest attempted run:

- run `34193380473`
- job `101955846938`
- HEAD `807f733838e2fab2620652025b255c3bc404fec1`
- `conclusion=failure`
- `runner_id=0`
- `steps=[]`

No checkout/product/test step ran. Combined candidate therefore remains `NOT YET VERIFIED`.

Integration Report #16:

`5580151268` — **INTEGRATION CANDIDATE ASSEMBLED / HOLD FOR EXECUTABLE RUNNER**.

## 13. Exact next Integration action

1. Do not merge Stage13E to `main`.
2. Do not start Stage13F.
3. When GitHub runner allocation works, rerun the unchanged combined gate on `integration/stage13e-ai-operations`.
4. If any step actually executes and fails, fix the root cause in its owning layer and add regression evidence.
5. After combined PASS, run the required wider same-head regression matrix.
6. Only then promote Stage13E to `main`, allow Render development deploy, verify hosted smoke, update central docs/Legacy Coverage/Roadmap and close Stage13E.
7. Independently verify Render free Blueprint after the pending Dashboard Apply; hosted development evidence never substitutes for Stage13E executable PASS.

## 14. Open risks / NOT YET VERIFIED

- GitHub hosted-runner allocation blocker;
- Stage13E combined executable gates;
- Render free Blueprint Apply/runtime verification;
- Render Free filesystem media durability unavailable by design;
- production AI worker/bootstrap absent by design;
- final VPS/Railway production + durable media design deferred;
- `AI-011-005` direct Question Bank persistence unresolved;
- `AI-012-019` live AI provider benchmark/routes/bootstrap unresolved.

## 15. Administrative cleanup note

Accidental placeholder Issues #19, #20 and #23 were created by Integration tool-routing mistakes and immediately closed `not_planned`. They contain no project command, implementation state or acceptance decision.

## 16. Update policy

Update this file after any material workstream REPORT, Integration decision, branch/head change, root cause, CI result, Render development outcome, merge or Stage transition. If a branch advances without REPORT, record it as observed WIP / `NOT YET VERIFIED`.
