# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> **Purpose:** قائمة التنفيذ الوحيدة للمشروع في Single Owner mode. أي محادثة جديدة تبدأ من أول عنصر غير مكتمل هنا بعد قراءة Source of Truth.
>
> **Rule:** لا تعتمد على Chat memory. Code/migrations/executable evidence أعلى من هذا الملف. غير المفحوص/غير المنفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner active; Stage13E static/operational audit found and fixed three P1 defects, including durable-history pagination; executable verification remains blocked before checkout.**

## 1. Operating mode

- One replaceable engineering conversation owns Product + Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation.
- Sole GitHub execution ledger: Issue `#16`.
- Issues `#13/#14/#15`: CLOSED/HISTORICAL only.
- Hosting/deployment: fully outside current scope until Product Owner provides VPS and explicitly reopens it.
- `main`: latest Integration-approved development baseline, not deployment authority.
- Use short task/stage branches when isolation is useful; do not merge a Stage without required executable evidence.
- Root-cause fixes only. No test weakening, auth bypass, fake APIs, client-owned durable state, duplicate lifecycle, or timeout-based masking.

## 2. Mandatory startup

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
11. current stage specialized docs + actual code/migrations/tests
12. Legacy Coverage + Roadmap when closing/starting a stage

Then live-check `main`, active branch HEADs and GitHub Actions before conclusions.

## 3. Immutable verified context

Latest fully executable green application baseline:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Verified through Stage13D including Stage9/10/OCR/11/12/13/13D and Full Rebuild same-head matrix.

Current active product stage:

**Stage13E — Admin AI Operations / Review**.

Current combined candidate branch:

`integration/stage13e-ai-operations`

Current candidate HEAD:

`70f6fe218124498ccb6667e3aefa2e8dd21599a4`

Latest runtime/test head immediately below that documentation commit:

`ae772db53e218037a2b140e9dc08e6528f1a1ac8`

Historical candidate sources remain evidence only:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`.
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

## 4. Ordered task queue

### EXEC-001 — Retire multi-chat team topology

**Status: DONE**

- #13/#14/#15 closed as historical.
- #16 is sole Project Execution Board.
- former Team/Backend/Frontend/Integration workstream docs are historical pointers.

---

### EXEC-002 — Synchronize startup/governance docs to Single Owner

**Priority: P1**

**Status: DONE**

Completed:

- `PROJECT_EXECUTION_QUEUE.md` created.
- `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md` created.
- `DOCUMENTATION_INDEX.md`, `NEXT_CONVERSATION_PROMPT.md`, `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_ENGINEERING_LOG.md`, and Product Overrides synchronized.
- old workstream docs marked historical/superseded.
- Roadmap reviewed: hosting stages remain future-only and require explicit VPS reopening.

Acceptance: a replacement conversation reading repository + Issue #16 is not directed to create/wait for Backend/Frontend chats or hosted deployment work.

---

### EXEC-003 — Stage13E combined candidate static/operational audit

**Priority: P1**

**Status: DONE for currently inspected surfaces; reopen whenever later evidence exposes a real defect**

Inspected actual implementation:

- Admin HTTP authorization/query/body validation;
- Admin AI list/detail/output/review services;
- Stage12 lifecycle pause/resume/retry/cancellation/output persistence;
- Stage11 review validation + issue shapes;
- output/attempt storage + secret/error boundaries;
- Frontend API DTOs/adapter/view-model/controller/workspace;
- Jobs/Units/Attempts pagination behavior;
- real BrowserContext helper/spec;
- deterministic PostgreSQL fixture seed;
- migration `0018_ai_admin_review.sql` plus relevant base AI migrations;
- API/Admin package scripts;
- combined workflow commands.

Confirmed after fixes:

- no second queue/lifecycle;
- server owns lifecycle/review action availability;
- Admin authorization enforced;
- raw response/credential/provider metadata/internal error messages excluded from Frontend contract;
- cancel clears pause in Stage12 authority;
- retry preserves history and uses Stage12 state;
- human review is short-transactional, Stage11-validated, and only allowed for stable `completed | review_required` unit outputs;
- failed/retrying/in-flight/cancelled outputs remain inspection-only;
- Frontend refreshes canonical state after mutations/409;
- complete durable Jobs/Units/Attempts history is reachable through bounded server pagination rather than truncated or loaded unbounded;
- polling/refresh stays on the currently selected server pages;
- fixtures use normal durable tables and real APIs, no test-only endpoint;
- workflow commands match package scripts.

#### Finding AI-013E-DB-001 — P1 Data/Audit Integrity

**Problem:** reject reason required by HTTP/service but original PostgreSQL migration allowed direct/future DB writer to create reject event with NULL/blank note.

**Root cause:** durable audit invariant existed only at caller validation.

**Correct fix:** PostgreSQL check constraint because terminal rejection reason is a row-level transport-independent invariant.

Changes:

- `730989b8bde404b229544c473bba02b05c7e75b4` — adds `ai_output_review_events_reject_note_required`; removes redundant latest-review index.
- `6589d6e53de7ca8cd82b424e5c1496186eb701f1` — direct PostgreSQL NULL/blank reject regression while preserving HTTP 400 tests.
- `bc1bf508897796d0a74d22126094e83180b7ec79` — workflow DB contract checks all four Stage13E constraints.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### Finding AI-013E-REVIEW-002 — P1 Data/Review Integrity

**Problem:** Stage12 can rewrite an existing `ai_outputs` row during retry/re-execution while Stage13E review events remain append-only on that output id. Original review authority did not inspect `ai_job_units.status`.

**Root cause:** human review authority was not bound to an execution-stable output lifecycle boundary.

**Impact:** a review could govern one generated result, then a retry could replace the row while the old human decision remained attached.

**Correct fix location:** Stage13E Backend review authority; do not delete audit history or weaken Stage12 retry.

Changes:

- `5c03fa27f90cd10df06a9e0b7c5e2c0c768e653a` — actions empty unless unit `completed|review_required`; mutation locks output+unit and returns `409` otherwise.
- `6494a0ee232cf646eae693054b129db752aee40e` — real failed/retrying output regressions: inspection works, mutation denied, no audit event.
- `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9` — specialized contract sync.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### Finding AI-013E-OPS-003 — P1 Admin Operations / Durable History Accessibility

**Problem:** Backend exposed bounded pagination but Frontend hard-coded and discarded it, so Admin could see only first 30 Jobs, first 50 Units and first 50 Attempts.

**Evidence:** Stage12 allows plans up to 5,000 units; `GET /v1/admin/ai/jobs`, Job Detail and Unit Detail return `total/limit/offset`; previous controller always requested offsets 0 and view model did not retain pagination.

**Impact:** durable PostgreSQL operational history could exist but be unreachable from the Admin product, including Unit 51+ requiring review or older attempt history needed for diagnosis.

**Correct fix:** preserve server pagination through transport → adapter → view model → controller → Workspace; render accessible Previous/Next controls; refresh/poll current page only; never load unlimited history in browser.

Implementation/testing lineage:

- `92f4d0f8d78697a717efc486420db336534bcc69` — pagination view contract/helpers.
- `8b932faa2d1989e5144e5ea29f84273511347736` — adapter preserves server pagination.
- `0974142fd71c8cfd5c847c699f10e5ab9de51f7b` — controller page offsets + canonical refresh/polling on current pages.
- `3411c1fdceae76fadb8ad3fad190b9fbe21f29d9` — Jobs/Units/Attempts navigation UI.
- `382726705724a2130381e7be9ec56bf54c4fc6dc` — responsive pagination layout.
- `3ab137c96bacaacd23191afc152c013ce46fec6d` — boundary helper unit tests.
- `27de2d6f550508ac88eeacb355e3b6a0d9eff994` — adapter pagination regression.
- `8dd1d712f1bd644c332ea26c4cf3b3c989425fd1` — attempt pagination transport regression.
- `66ac7bd31763c8313299a8179f7afe327b88ea55` / `ae772db53e218037a2b140e9dc08e6528f1a1ac8` — real PostgreSQL pagination fixtures, hardened SQL.
- `a9e97e3470396edadab13e21ca76b3c71a68965f` — workflow fixture assertions.
- `c3420181380e0af4cff835504044b5b0c1df679f` — real Chromium Jobs/Units/Attempts pagination regression.
- `70f6fe218124498ccb6667e3aefa2e8dd21599a4` — specialized Admin documentation.

Real browser fixture now proves a second Jobs page, Unit 51 and Attempt 1 on the second Attempts page using real Backend/PostgreSQL state.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

---

### EXEC-004 — Stage13E executable same-head gate

**Priority: P1**

**Status: BLOCKED BY EXTERNAL GITHUB HOSTED-RUNNER ALLOCATION**

Workflow:

`.github/workflows/stage13e-integration.yml`

Expected gate:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E DB constraints;
4. Stage13E authorization/action/review/concurrency/DB-integrity/stable-review tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset;
8. real Admin bootstrap;
9. deterministic real Stage13E fixtures + invariant assertions;
10. real Chromium complete Jobs/Units/Attempts history pagination;
11. Chromium pause/resume + approve/reload + real session expiry + real stale-review 409 + 390px.

Latest runtime/test run after pagination hardening:

- run `34249182219`;
- head `ae772db53e218037a2b140e9dc08e6528f1a1ac8`;
- job `102138902680`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout, lint, typecheck, unit, build, PostgreSQL, integration or Chromium command executed.

Earlier Stage13E runs had the same pre-checkout condition.

Interpretation:

- not product/test failure evidence;
- external/account/platform cause remains `NOT YET VERIFIED` because current connector cannot read Billing/Actions account settings;
- do not weaken tests or churn product code to satisfy a job that never starts;
- no local PASS is claimed.

**Exact next action:** rerun the unchanged combined gate on the current candidate when GitHub allocates a real runner. Any command that actually executes and fails must be root-caused before Stage promotion.

---

### EXEC-005 — Stage13E wider regression + closure

**Priority: P1**

**Status: BLOCKED BY EXEC-004**

After combined PASS:

- run required wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head regression matrix for changed surfaces;
- review Security/Performance/UX/a11y/Legacy Coverage;
- preserve latest central docs while integrating candidate into `main`;
- promote Stage13E runtime to `main`;
- update `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`;
- update `MASTER_REBUILD_ROADMAP.md` Stage13E = VERIFIED;
- update Status/Continuity/Engineering Log/Handoff/specialized docs with exact executable HEAD/run IDs;
- add Stage13E Closure `EXECUTION REPORT` to Issue #16.

No hosted smoke/deployment is required under current policy.

---

### EXEC-006 — Stage13F Question Bank / Quiz Builder / Publish

**Priority: P1 after Stage13E closure**

**Status: BLOCKED BY EXEC-005**

Do not implement before Stage13E VERIFIED unless Product Owner explicitly changes ordering.

First work after unblock:

- inspect current/legacy question/quiz code + parity rows;
- resolve `AI-011-005` direct-question persistence explicitly;
- define reviewed Question Bank DB/server authority with provenance;
- manual/MCQ/T-F/generated editing;
- Draft → Review → Published;
- Quiz Builder/versioning/exact ministerial provenance;
- regenerate-one-question preserving source/context;
- safe export/print;
- DB/API/Admin/Chromium/regression evidence.

---

### EXEC-007 — Stage13G Remaining Admin Product

**Status: BLOCKED by Stage13F closure**

Student/account operations, access-code management, recovery/device operations, notifications, reporting/settings/audit and remaining Admin parity.

---

### EXEC-008+ — Remaining roadmap

Follow `MASTER_REBUILD_ROADMAP.md` after Admin closure:

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
- Stage26 Staging **only after VPS exists and deployment is explicitly reopened**;
- Stage27 Release Gate;
- Stage28 Production Cutover;
- Stage29 Monitoring/Operations.

## 5. Open findings

- `CI-001` P1 — GitHub hosted runner terminates before checkout; external cause not verified.
- `AI-011-005` P2 — direct generated-question persistence unresolved; Stage13F owns resolution.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- `AI-013E-DB-001` P1 — reject-reason DB invariant fixed in candidate; executable verification pending.
- `AI-013E-REVIEW-002` P1 — stale human-review authority across retryable output replacement fixed in candidate; executable verification pending.
- `AI-013E-OPS-003` P1 — Admin durable-history truncation fixed with bounded server pagination + real browser regression; executable verification pending.
- Later Admin/Student/assessment/offline/product stages remain incomplete by Roadmap.
- Hosting/VPS intentionally not a current blocker.

## 6. Mandatory end-of-batch updates

After meaningful work update:

1. this queue;
2. `PROJECT_INTEGRATION_CONTINUITY.md`;
3. `PROJECT_STATUS.md` when state changes;
4. `PROJECT_ENGINEERING_LOG.md` findings/ADs/tests;
5. specialized stage docs;
6. Issue #16 `EXECUTION REPORT`;
7. Handoff/Index/Roadmap/Legacy Coverage when their truth changes.

Never leave continuation-critical information only in chat.
