# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> **Purpose:** قائمة التنفيذ الوحيدة للمشروع في Single Owner mode. أي محادثة جديدة تبدأ من أول عنصر غير مكتمل هنا بعد قراءة ملفات Source of Truth.
>
> **Rule:** لا تعتمد على chat memory. Code/migrations/executable evidence أعلى من هذا الملف. غير المفحوص/غير المنفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner mode enabled; hosting/deployment deferred until VPS**.

## 1. Operating mode

- One replaceable engineering conversation owns Product + Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation.
- Sole GitHub execution ledger: Issue `#16`.
- Issues `#13`, `#14`, `#15` are historical/closed; never issue new commands there.
- Hosting/deployment is completely outside current development scope until Product Owner provides a VPS and explicitly reopens deployment.
- `main` = latest Integration-approved development baseline, **not a deployment contract**.
- Use short task/stage branches when code changes need isolation. Integrate only after review + required executable evidence.

## 2. Mandatory startup for replacement conversation

Read in this order:

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. `PROJECT_ENGINEERING_LOG.md`
6. `PROJECT_INTEGRATION_CONTINUITY.md`
7. **this file**
8. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
9. `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`
10. Issue `#16` latest comments
11. current stage specialized docs + actual code/tests
12. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` + `MASTER_REBUILD_ROADMAP.md` when closing/starting a stage

Then live-check `main`, active branch HEADs and GitHub Actions before conclusions.

## 3. Current immutable context

Latest fully executable green application baseline:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Verified through Stage13D including Stage9/10/OCR/11/12/13/13D + Full Rebuild same-head matrix.

Current `main` documentation/governance HEAD at creation of this file:

`c83500a6f1faa535b9b999f1f592a8f1bace8dfc`

Current active product stage:

**Stage13E — Admin AI Operations / Review**.

Combined candidate:

`integration/stage13e-ai-operations @ 807f733838e2fab2620652025b255c3bc404fec1`

Candidate assembly commits:

- `227f4c9dba99e7b8c93d25caebe86e38108d4a5c` — reviewed Backend overlay.
- `a60274fedf55fb45b6684743da24b24004339917` — reviewed Frontend overlay.
- `4ba77703866762c471257bbb914590b817ecc82e` — real PostgreSQL/browser fixtures.
- `807f733838e2fab2620652025b255c3bc404fec1` — combined Stage13E workflow.

Historical source branches remain only as evidence:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`.
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16` (Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`).

## 4. Current task queue

### EXEC-001 — Retire multi-chat team topology

**Status:** DONE.

Done:

- Issues #13/#14/#15 closed as historical.
- Issue #16 converted to sole Project Execution Board.
- Single Owner docs/queue introduced.

Remaining documentation propagation is tracked under EXEC-002.

---

### EXEC-002 — Synchronize all startup/governance docs to Single Owner mode

**Priority:** P1

**Status:** IN PROGRESS.

Required:

- add `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`;
- update `DOCUMENTATION_INDEX.md`;
- update `NEXT_CONVERSATION_PROMPT.md`;
- update `PROJECT_HANDOFF.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_INTEGRATION_CONTINUITY.md`;
- update `PROJECT_ENGINEERING_LOG.md` with architecture decision;
- mark old `TEAM_OPERATING_MODEL.md`, Backend/Frontend workstream docs as historical/superseded without deleting their evidence;
- update Roadmap current progress wording if needed.

Acceptance:

A replacement chat reading only repository files + Issue #16 does not attempt to resurrect Backend/Frontend chats or hosting work.

---

### EXEC-003 — Stage13E combined candidate static audit

**Priority:** P1

**Status:** IN PROGRESS.

Already inspected in current continuation:

- `.github/workflows/stage13e-integration.yml`;
- `apps/api/tests/fixtures/stage13e-e2e-seed.ts`;
- `apps/admin-web/e2e/ai-operations.e2e.spec.mjs`;
- `apps/admin-web/e2e/stage13e-real-api.mjs`;
- `apps/admin-web/src/AiOperationsPage.tsx`;
- combined diff against pre-candidate `main`.

Observed so far:

- fixture uses normal durable tables after clean migrations; no test-only endpoint;
- happy fixture preserves non-terminal server actions + open review output;
- race fixture is execution-terminal to prevent polling from erasing stale UI before the real 409 mutation;
- BrowserContext request API is used for real logout/out-of-band review with shared session cookies;
- no mock/interception/fake 401/409/sleep race;
- no hosting/deployment file belongs to Stage13E diff.

Still inspect before closure:

- Stage13E API read/mutation implementation for authorization/query bounds/secret filtering/locking;
- lifecycle changes in `job-lifecycle.ts` and `execution-repository.ts` against Stage12 contracts;
- Admin adapter/API/view-model/workspace strict contract alignment;
- migration `0018_ai_admin_review.sql` integrity/index/constraint semantics;
- workflow commands against actual package scripts.

If a real defect is found, fix on `integration/stage13e-ai-operations` with root-cause documentation + regression test. Do not change code merely because GitHub runner cannot allocate.

---

### EXEC-004 — Stage13E executable same-head gate

**Priority:** P1

**Status:** BLOCKED BY EXTERNAL GITHUB HOSTED-RUNNER ALLOCATION.

Workflow:

`.github/workflows/stage13e-integration.yml`

Latest run:

- run `34193380473`;
- attempt `2`;
- latest job `101958463625`;
- HEAD `807f733838e2fab2620652025b255c3bc404fec1`;
- job ended with `steps=[]`; no checkout, no logs, no executable command.

Earlier attempt job `101955846938` had the same condition.

Interpretation:

- this is **not a product/test failure**;
- do not weaken gates, change test assertions, add sleeps, or churn product code;
- retry unchanged gate when GitHub actually allocates a runner;
- if an executable step then fails, investigate root cause in owning layer and add/retain regression coverage.

Expected combined gate:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + `0018` contract checks;
4. Stage13E authority/review/concurrency tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset;
8. real Admin bootstrap;
9. deterministic real Stage13E fixtures;
10. Chromium happy path + pause/resume + approve/reload + real session expiry + real stale-review 409 + 390px.

---

### EXEC-005 — Stage13E wider regression + closure

**Priority:** P1

**Status:** BLOCKED BY EXEC-004.

After combined PASS:

- run required wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head regressions appropriate to changed surfaces;
- review Security/Performance/UX/a11y/Legacy Coverage;
- synchronize latest `main` central docs into candidate without overwriting them from stale feature history;
- promote Stage13E accepted runtime to `main`;
- update `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`;
- update `MASTER_REBUILD_ROADMAP.md` Stage13E = VERIFIED;
- update central docs with exact executable HEAD/run IDs;
- add Closure `EXECUTION REPORT` to Issue #16.

No hosted/deployment smoke is required in current Product Owner policy.

---

### EXEC-006 — Stage13F Question Bank / Quiz Builder / Publish

**Priority:** P1 after Stage13E closure

**Status:** BLOCKED BY EXEC-005.

Do not implement before Stage13E VERIFIED unless Product Owner explicitly changes stage ordering.

Mandatory first work after unblock:

- repository discovery of existing question/quiz legacy/current code + parity rows;
- resolve `AI-011-005` (`direct` generated question persistence) explicitly;
- design reviewed Question Bank authority with provenance and Draft→Review→Published;
- manual/MCQ/T-F/generated editing;
- Quiz Builder/versioning/exact ministerial provenance;
- regenerate-one-question preserving source/context;
- safe export/print;
- backend/frontend/DB/browser tests and closure evidence.

---

### EXEC-007 — Stage13G Remaining Admin Product

**Status:** BLOCKED by Stage13F closure.

Student/account/admin operations, code management, recovery/device operations, notifications, reporting/settings/audit and remaining parity rows.

---

### EXEC-008+ — Remaining roadmap

Follow `MASTER_REBUILD_ROADMAP.md` in order after Admin closure:

- Stage14 Student Web/PWA complete product;
- Stage15 Practice/Assessment;
- Stage16 Offline/PWA;
- Stage17 Personal Learning Data;
- Stage18 Notifications;
- Stage19 Progress/Statistics/Achievements;
- Stage20 Import/Export/Reporting;
- Stage21 Performance;
- Stage22 Security hardening;
- Stage23 CI/test expansion;
- Stage24 Accessibility/device QA;
- Stage25 initial content load;
- Stage26 staging **only when VPS exists / hosting reopened**;
- Stage27 release gate;
- Stage28 production cutover;
- Stage29 monitoring/operations.

## 5. Open product/architecture findings

- `AI-011-005` P2 — direct generated question persistence unresolved; Stage13F owns resolution.
- `AI-012-019` P2 — live AI provider benchmark/routes/credentials/production bootstrap unverified; do not fake provider readiness or worker.
- `CI-001` P1 — GitHub hosted-runner currently terminates before checkout; external cause remains `NOT YET VERIFIED`.
- Full Student learning/offline/later stages remain incomplete by Roadmap.
- Hosting/VPS is intentionally not a development blocker and should not be worked on until explicitly reopened.

## 6. After every meaningful batch

Update at minimum:

1. this queue status + exact next action;
2. `PROJECT_INTEGRATION_CONTINUITY.md`;
3. `PROJECT_STATUS.md` if user-visible project state changed;
4. `PROJECT_ENGINEERING_LOG.md` for findings/ADs/tests/changes;
5. specialized stage doc/contracts;
6. Issue #16 `EXECUTION REPORT`;
7. Handoff/Index/Roadmap/Coverage when their truth changed.

Never leave continuation-critical information only in chat.
