# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** الذاكرة التشغيلية التفصيلية لأي محادثة هندسية بديلة. يجب أن تستطيع الاستمرار من GitHub فقط بدون Chat history.
>
> **Authority:** current code + PostgreSQL migrations + executable evidence أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner mode; Stage13E static audit complete with two P1 integrity fixes; executable runner still unavailable before checkout.**

## 1. Resume procedure

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md`.
3. Read `DOCUMENTATION_INDEX.md`.
4. Read `PROJECT_HANDOFF.md`.
5. Read `PROJECT_STATUS.md`.
6. Read `PROJECT_ENGINEERING_LOG.md`.
7. Read this file.
8. Read `PROJECT_EXECUTION_QUEUE.md`.
9. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
10. Read `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`.
11. Read latest comments in active Issue `#16`.
12. Read current-stage specialized docs + actual code/migrations/tests.
13. Live-check `main`, active branch HEADs and GitHub Actions before conclusions.

Do not depend on an earlier chat. If this path is insufficient, documentation is defective and must be corrected.

## 2. Current operating model

Product Owner retired the separate Backend/Frontend/Integration multi-chat topology on 2026-09-08.

Current model:

- one replaceable engineering conversation owns Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation;
- Issue `#16` is the sole active Project Execution Board;
- `PROJECT_EXECUTION_QUEUE.md` is the ordered task authority;
- this file is the detailed operational memory.

Historical only:

- Issue #13 Team Room — CLOSED;
- Issue #14 Backend Board — CLOSED;
- Issue #15 Frontend Board — CLOSED;
- former Team/Backend/Frontend/Integration workstream docs are superseded pointers.

Do not resurrect workstream chats unless Product Owner explicitly requests them.

## 3. Hosting policy

`DEPLOYMENT / HOSTING FULLY DEFERRED UNTIL VPS IS AVAILABLE`.

Consequences:

- no Render/Vercel/Railway/Supabase hosting task;
- no hosted smoke/deploy Stage gate;
- no provider cutover/cleanup work now;
- absence of VPS is not a development blocker;
- preserve ordinary portability only;
- deployment resumes only after explicit Product Owner VPS command.

## 4. Product / stable architecture

**الوسيلة الذكية** Arabic education platform:

- Student Web/PWA — secure activation/login, entitled curriculum, Reader, learning/assessment, personal data, notifications/offline in roadmap stages.
- Super Admin — curriculum/content/media/OCR/AI, Question Bank, students/codes/recovery, reports/settings/audit.
- Backend — Fastify + PostgreSQL authority for auth/access/business data/media/OCR/AI/review/publication/trusted scoring/sync as stages mature.

Stable rules:

- Browser does not own durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification non-consuming; completion atomic.
- returning Student requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- source inventory = provenance, not curriculum hierarchy.
- `media ready != published`.
- Stage13D publication = Draft → Review → Published.
- exact AI does not fabricate unknown answers.
- raw provider/AI output never becomes automatic Student authority.
- provider/network calls outside long DB transactions.
- durable AI worker lifecycle separate from Fastify HTTP.
- secrets/credential aliases/provider raw metadata/internal error text never frontend contract.
- no duplicate queue/lifecycle/storage authority.
- root-cause only; no test weakening/auth bypass/fake APIs/sleep races.

## 5. Verified application baseline

Latest fully executable green head:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS:

- Stage13D Admin `34177369743`;
- Stage13D Backend `34177369784`;
- Stage13 Admin `34177369748`;
- Stage12 `34177369812`;
- Stage11 `34177369753`;
- OCR `34177369750`;
- Stage10 `34177369777`;
- Stage9 `34177369756`;
- Full Rebuild `34177369768` incl. Student Chromium.

Verified through Stage13D. Do not replace this baseline with docs-only or unexecuted heads.

## 6. Git / current stage state

`main` is the latest Integration-approved **development baseline**.

Central docs are maintained directly on `main` under Single Owner mode. Always live-check current `main` HEAD before work.

Legacy archive:

`archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

Current active product stage:

**Stage13E — Admin AI Operations / Review**.

Stage13E runtime is not in `main`.

Current combined candidate branch:

`integration/stage13e-ai-operations`

Current branch HEAD at this synchronization:

`1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`

Latest runtime/test candidate beneath that docs commit:

`6494a0ee232cf646eae693054b129db752aee40e`

## 7. Stage13E candidate lineage

Historical source branches are evidence only:

### Backend source

`backend/stage13e-ai-operations @ 348c02646d0ff873fd305beff16f41c46d9c0285`

Provides:

- Admin-only jobs/units/attempts/outputs read models;
- server-derived progress/status/action availability;
- Stage12 pause/resume/cancel/retry reuse;
- bounded retry and hard attempt ceiling 20;
- safe provider/model/project observability;
- source/page/checksum provenance;
- append-only review audit;
- Stage11 semantic review validation;
- strict review HTTP union;
- terminal review concurrency protection;
- no Stage13F Question Bank persistence.

### Frontend source

`frontend/stage13e-ai-operations @ 1eb141e950e96c9f53ffd103a386d59166113c16`

Product/Test head:

`7bf2f8c32907032551aace9f3aa27681040c4b0f`

Provides:

- authenticated transport/adapter/controller/navigation;
- server-provided action arrays only;
- no raw provider/internal error leakage;
- canonical refresh after mutations/409;
- selected non-terminal job polling with overlap prevention;
- jobs→units→attempts→outputs→review/provenance/history UI;
- real browser preparation for happy path/session expiry/stale 409/390px.

### Selective combined assembly

Feature branches predated later central docs, so direct history merge was rejected. Reviewed files were overlaid selectively on the then-current `main` lineage:

- `227f4c9dba99e7b8c93d25caebe86e38108d4a5c` — Backend overlay;
- `a60274fedf55fb45b6684743da24b24004339917` — Frontend overlay;
- `4ba77703866762c471257bbb914590b817ecc82e` — real deterministic E2E fixture;
- `807f733838e2fab2620652025b255c3bc404fec1` — combined workflow.

Static audit then added:

- `730989b8bde404b229544c473bba02b05c7e75b4` — durable reject-note DB invariant + redundant-index removal;
- `6589d6e53de7ca8cd82b424e5c1496186eb701f1` — direct PostgreSQL reject-note regression;
- `bc1bf508897796d0a74d22126094e83180b7ec79` — DB contract workflow assertion update;
- `083992bc7b0b7edf0c88e0b029cc49e10aeca345` — first specialized contract sync;
- `5c03fa27f90cd10df06a9e0b7c5e2c0c768e653a` — bind human review authority to stable unit state;
- `6494a0ee232cf646eae693054b129db752aee40e` — failed/retrying output regression;
- `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9` — specialized contract sync after stable-review fix.

Selective integration avoids importing stale unrelated feature-branch docs/history.

## 8. Stage13E real-browser authority

Fixture utility:

`apps/api/tests/fixtures/stage13e-e2e-seed.ts`

Variables:

- `STAGE13E_E2E_JOB_TYPE=stage13e_e2e_happy`;
- `STAGE13E_E2E_RACE_JOB_TYPE=stage13e_e2e_race`.

Happy fixture:

- non-terminal queued job;
- one `review_required` valid open output;
- one additional queued unit;
- pause/resume remains real server-authorized while review remains available.

Race fixture:

- execution-terminal completed job;
- one open valid review output;
- no initial review event;
- terminal execution prevents regular 5s non-terminal polling from erasing the stale UI before out-of-band rejection.

Browser tests use the real same BrowserContext session for logout and out-of-band review calls. No route interception/mock/fake 401/409/test-only endpoint/manual cookie mutation/sleep race.

## 9. Stage13E static audit — COMPLETE for current candidate surfaces

Inspected actual code:

- `.github/workflows/stage13e-integration.yml`;
- `apps/api/tests/fixtures/stage13e-e2e-seed.ts`;
- Stage13E Chromium spec/helper;
- `AiOperationsPage.tsx`, `AiOperationsWorkspace.tsx`;
- Frontend API/adapter/view-model contracts;
- `admin-operations-http.ts`, `admin-operations.ts`;
- `job-lifecycle.ts`, `execution-repository.ts`, review validator;
- Stage11 validator issue shape and Stage12 output persistence/retry interaction;
- API/Admin package scripts;
- migration `0018_ai_admin_review.sql` plus relevant base AI migrations.

Confirmed after fixes:

- Admin role enforced at HTTP boundary;
- list/detail query bounds max 100;
- raw response/credential/provider metadata/internal provider error text excluded from Admin contract;
- `allowedActions` uses Stage12 lifecycle authority;
- cancel uses Stage12 execution cancellation and clears pause;
- retry remains same Stage12 queue and keeps attempt history;
- human review is only available for unit state `completed | review_required`;
- failed/retrying/cancelled/running/queued outputs may be inspected but cannot be edited/approved/rejected;
- review mutation locks owning output + unit rows before state/revision decision and runs Stage11 semantic validation in the same short transaction;
- frontend consumes server authority rather than reconstructing lifecycle;
- validator issue objects match Frontend adapter mapping;
- workflow commands match actual package scripts;
- deterministic fixtures respect normal durable tables/constraints;
- no confirmed second lifecycle or additional cross-contract drift found.

### Root defect — AI-013E-DB-001 P1

**Area:** Data/Audit Integrity.

**Symptom:** reject reason was required at HTTP/service boundary but not by PostgreSQL.

**Root cause:** durable terminal audit invariant existed only in caller validation. Original `0018` allowed direct/future DB writer to insert `action='reject'` with NULL/blank note.

**Blast radius:** incomplete terminal review audit records from any future writer outside current HTTP service.

**Correct owning layer:** PostgreSQL because reason presence is a durable row invariant independent of transport.

**Fix:** `730989b8bde404b229544c473bba02b05c7e75b4` adds `ai_output_review_events_reject_note_required` and removes a redundant latest-output index because UNIQUE `(ai_output_id, revision)` supports backward latest lookup.

**Regression:** `6589d6e53de7ca8cd82b424e5c1496186eb701f1` preserves HTTP 400 tests and directly proves NULL/blank DB reject rows fail with zero review events.

**Workflow contract:** `bc1bf508897796d0a74d22126094e83180b7ec79` requires all four Stage13E DB constraints.

**Execution:** `NOT YET VERIFIED` because jobs terminate before checkout.

### Root defect — AI-013E-REVIEW-002 P1

**Area:** Data/Review Integrity.

**Symptom:** Stage12 `persistOutputOutcome()` can update the existing `ai_outputs` row for a retry/re-execution using `ON CONFLICT (job_unit_id) DO UPDATE`, while Stage13E review events are append-only on the same output id. Original review authority derived actions from semantic/review state without checking `ai_job_units.status`.

**Root cause:** human review authority was not bound to an execution-stable output boundary.

**Blast radius:** Admin could review a failed/retrying output; Stage12 could later replace normalized/raw output during retry while old approve/reject/edit history remained, making a stale human decision appear to govern different generated content.

**Correct owning layer:** Stage13E Backend review authority. Do not delete audit history and do not weaken Stage12 retry.

**Fix commit:** `5c03fa27f90cd10df06a9e0b7c5e2c0c768e653a`.

- `allowedReviewActions=[]` unless unit is `completed|review_required`;
- `reviewOutput()` locks `ai_outputs` and owning `ai_job_units` together;
- non-stable state returns `409` before any review event;
- stable output still uses Stage11 semantic validation and append-only audit.

**Regression commit:** `6494a0ee232cf646eae693054b129db752aee40e`.

- real failed output row → inspection only, no actions;
- real retrying output row → inspection only, no actions;
- approve/reject mutation → `409`;
- review-event count across both outputs remains zero.

**Specialized contract:** `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`.

**Execution:** `NOT YET VERIFIED` because run `34199202570`, job `101973855894`, ended before checkout with `steps=null`.

## 10. Combined executable gate

Workflow:

`.github/workflows/stage13e-integration.yml`

Expected execution:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E DB contract;
4. Stage13E authorization/action/review/race/integrity/stable-review tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset;
8. real Admin bootstrap;
9. seed/assert real Stage13E fixtures;
10. Chromium happy/pause/resume/approve/reload/session-expiry/stale-409/390px.

Latest runtime/test run:

- run `34199202570`;
- head `6494a0ee232cf646eae693054b129db752aee40e`;
- job `101973855894`;
- ended without executable steps/checkout (`steps=null`).

Latest branch-head docs run:

- run `34199371763`;
- head `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`;
- job `101974393620`;
- same pre-checkout condition.

Previous post-fix runs `34197944201`, `34197629003`, and combined run `34193380473` attempts 1/2 had the same condition.

No executed product/test failure exists for the latest candidate.

## 11. Verification blocker interpretation

Finding `CI-001`:

- Severity P1 verification infrastructure;
- GitHub hosted job allocation terminates before checkout;
- external/account/platform root cause remains `NOT YET VERIFIED` due lack of administration/billing evidence;
- do not weaken tests or churn product code merely because jobs never start;
- local fallback is unavailable in current assistant runtime because private repository network/clone access is unavailable; no local PASS is claimed.

## 12. Exact next action

Read `PROJECT_EXECUTION_QUEUE.md` first. Current dependency sequence:

1. keep Stage13E outside `main`;
2. retain AI-013E-DB-001 and AI-013E-REVIEW-002 root-cause fixes and regressions;
3. rerun the unchanged combined gate on current Stage13E branch when GitHub allocates a real runner;
4. any executed failure → root-cause fix + regression in owning layer;
5. combined PASS → wider Stage9/10/OCR/11/12/13/13D/Full Rebuild regressions;
6. wider PASS → promote Stage13E runtime to `main` preserving latest central docs;
7. update Legacy Coverage/Roadmap/central docs and close Stage13E;
8. only then implement Stage13F under current dependency rule.

## 13. Open work / risks

- `CI-001` P1 — runner allocation before checkout.
- `AI-013E-DB-001` P1 — fixed, executable verification pending.
- `AI-013E-REVIEW-002` P1 — fixed, executable verification pending.
- Stage13E latest candidate executable evidence.
- `AI-011-005` P2 — direct generated-question persistence; Stage13F owns resolution.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- live provider worker bootstrap remains future and separate from Fastify.
- later Admin/Student/assessment/offline stages incomplete.
- VPS/deployment future work only.

## 14. Administrative history

- Issues #13/#14/#15 are closed historical workstream evidence.
- Issue #16 is the sole current execution ledger.
- Accidental placeholder Issues #19/#20/#23 were closed `not_planned` and carry no command/acceptance authority.

## 15. Update policy

After any meaningful branch/head/root-cause/CI/Stage change, update:

- `PROJECT_EXECUTION_QUEUE.md`;
- this file;
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- affected specialized docs;
- Issue #16 `EXECUTION REPORT`;
- Handoff/Index/Roadmap/Legacy Coverage when their truth changes.

Never leave continuation-critical information only in chat.
