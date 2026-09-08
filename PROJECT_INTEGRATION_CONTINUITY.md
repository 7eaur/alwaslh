# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية الثابتة للمحادثة الرئيسية Integration / Architecture / QA. أي محادثة بديلة يجب أن تستطيع الاستمرار من هذا الملف + Source of Truth بدون Chat history.
>
> **Authority:** current code/migrations + executable GitHub evidence تتقدم على هذا الملف. أي شيء غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — hosting/deployment fully deferred until VPS; Stage13E combined executable verification still blocked before checkout**.

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `DOCUMENTATION_INDEX.md` → `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → this file.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
4. Read `docs/workstreams/TEAM_OPERATING_MODEL.md` + relevant workstream file.
5. Read latest Issues #13/#14/#15/#16.
6. Live-check `main`, feature/integration branch heads and GitHub Actions evidence before conclusions.
7. Anything not inspected/executed stays `NOT YET VERIFIED`.

Do not inspect, configure, deploy or use any hosting provider as current work. Hosting is fully deferred until an explicit Product Owner VPS command.

## 2. Main Integration responsibility

Integration owns architecture coherence, cross-team contracts, QA/security/performance/UX review, combined branches, same-head verification, merge decisions, Stage closure and central docs.

Backend/Frontend readiness never equals Stage PASS. Integration alone declares `VERIFIED` after required same-head executable evidence.

There is currently no hosted-runtime/release gate.

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
- preserve host portability naturally, but do not build hosting infrastructure now.

## 4. Git / development state

`main` is the Integration-approved development baseline.

Stage13E is **not in `main`**.

Current combined branch:

`integration/stage13e-ai-operations @ 807f733838e2fab2620652025b255c3bc404fec1`

It was assembled from:

`main @ 1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`

Central documentation has advanced on `main` afterward. Those docs-only policy commits do not alter the Stage13E runtime candidate. Before promotion, Integration must preserve the latest central docs rather than overwriting them from older feature history.

Legacy archive:

`archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

## 5. Current deployment policy

`DEPLOYMENT / HOSTING FULLY DEFERRED UNTIL VPS IS AVAILABLE`.

Operational consequences:

- no provider is current infrastructure authority;
- no deploy or hosted smoke is required for Stage closure;
- existing hosting files/docs may remain historically but are not active tasks or blockers;
- no provider migration/cutover/cleanup should consume current development time;
- future VPS design starts only after explicit Product Owner command.

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

Do not replace this baseline with docs commits or unexecuted Stage13E candidates.

## 7. Stage13E Backend candidate

`backend/stage13e-ai-operations @ 348c02646d0ff873fd305beff16f41c46d9c0285`

Candidate provides Admin jobs/units/attempts/outputs read models, server-derived progress/action authority, Stage12 controls, safe provider/model/project observability, provenance, append-only review audit, Stage11 semantic validation, strict review bodies and terminal review race protection.

Structurally accepted; executable same-head evidence still required.

## 8. Stage13E Frontend candidate

`frontend/stage13e-ai-operations @ 1eb141e950e96c9f53ffd103a386d59166113c16`

Product/Test HEAD:

`7bf2f8c32907032551aace9f3aa27681040c4b0f`

REPORT #15: `5579577424`.

Integration Review #15: `5580147549` — browser regression preparation accepted as Integration candidate.

Reviewed behavior includes real API binding, same-BrowserContext session expiry, real stale-review `409`, canonical refresh and 390px regression with no mocks/fake endpoint/sleep race.

## 9. Stage13E combined Integration branch

Assembly commits:

- `227f4c9dba99e7b8c93d25caebe86e38108d4a5c` — selective Backend candidate;
- `a60274fedf55fb45b6684743da24b24004339917` — selective Frontend candidate;
- `4ba77703866762c471257bbb914590b817ecc82e` — real Stage13E E2E fixture seed;
- `807f733838e2fab2620652025b255c3bc404fec1` — combined Integration workflow.

Selective integration avoided importing stale/diverged feature history. At assembly the diff contained only Stage13E API/Admin/tests/migration/docs/workflows + Integration fixture/workflow and no unrelated Student product change.

## 10. Combined real-browser fixture authority

Fixture:

`apps/api/tests/fixtures/stage13e-e2e-seed.ts`

Environment:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`

Happy fixture is a non-terminal job with an open valid review output plus a queued unit, enabling real pause/resume + review. Race fixture is execution-terminal with an open valid review output so ordinary polling cannot erase stale UI before the out-of-band mutation.

No test-only API endpoint is created.

## 11. Combined Stage13E gate

Workflow:

`.github/workflows/stage13e-integration.yml`

Expected execution:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + DB contract;
4. Stage13E Backend authority/race integration tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth security regression;
7. fresh DB reset;
8. real Admin bootstrap;
9. seed happy + race fixtures;
10. assert DB fixture invariants;
11. Chromium happy/reload/session-expiry/stale-409/390px.

Run `34193380473`, HEAD `807f733838e2fab2620652025b255c3bc404fec1`:

- Attempt 1 job `101955846938`: no runner, `steps=[]`.
- Attempt 2 job `101958463625`: `run_attempt=2`, `steps=[]`, no job logs generated.

No checkout or product/test step executed in either attempt. Stage13E therefore remains `NOT YET VERIFIED`, with no evidence of an application regression.

A local execution fallback was checked from the current assistant runtime, but that environment cannot resolve GitHub/network access to the private repository. No local test result is claimed.

Integration Report #16 before attempt 2: `5580151268`.

## 12. Verification blocker interpretation

Current blocker is specifically **GitHub hosted-runner allocation**, not hosting/deployment.

Rules:

- do not weaken tests;
- do not modify product code because a job never started;
- keep the combined workflow unchanged until an actual runner executes it;
- any future step that executes and fails is treated as a real defect until root-cause analysis proves otherwise.

## 13. Exact next Integration action

1. Keep Stage13E outside `main`.
2. Rerun the unchanged combined workflow when an actual GitHub runner becomes available.
3. If steps execute and fail, fix root cause in the owning DB/API/Admin/test-harness layer with regression protection.
4. If the combined gate passes, run wider required same-head regressions.
5. Promote Stage13E to `main` while preserving current central docs.
6. Update `PROJECT_ENGINEERING_LOG.md`, central/specialized docs, Legacy Coverage and roadmap; then close Stage13E.
7. Start Stage13F only after Stage13E closure unless Product Owner explicitly changes that dependency rule.
8. Do not perform hosting/deployment work.

## 14. Open risks / NOT YET VERIFIED

- Stage13E combined executable gates;
- GitHub hosted-runner allocation availability;
- `AI-011-005` direct Question Bank persistence for Stage13F;
- `AI-012-019` live provider benchmark/routes/bootstrap;
- live-provider worker bootstrap remains future work and must stay separate from Fastify;
- later Student learning/offline stages;
- VPS deployment is future work, not a current blocker.

## 15. Administrative cleanup note

Accidental placeholder Issues #19, #20 and #23 were created by Integration tool-routing mistakes and immediately closed `not_planned`. They contain no project command, implementation state or acceptance decision.

## 16. Update policy

Update this file after any material workstream REPORT, Integration decision, branch/head change, root cause, CI result, merge or Stage transition. Hosting changes are recorded only if Product Owner explicitly reopens deployment after VPS availability.