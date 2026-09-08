# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> **Purpose:** قائمة التنفيذ الوحيدة للمشروع في Single Owner mode. أي محادثة جديدة تبدأ من أول عنصر غير مكتمل هنا بعد قراءة Source of Truth.
>
> **Rule:** لا تعتمد على Chat memory. Code/migrations/executable evidence أعلى من هذا الملف. غير المفحوص/غير المنفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner active; Stage13E static audit found and fixed two P1 integrity defects; executable verification still blocked before checkout.**

## 1. Operating mode

- One replaceable engineering conversation owns Product + Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation.
- Sole GitHub execution ledger: Issue `#16`.
- Issues `#13/#14/#15`: CLOSED/HISTORICAL only.
- Hosting/deployment: fully outside current scope until Product Owner provides VPS and explicitly reopens it.
- `main`: latest Integration-approved development baseline, not deployment authority.
- Use short task/stage branches when isolation is useful; do not merge a Stage without required executable evidence.

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

Then live-check `main`, active branch HEADs and Actions before conclusions.

## 3. Immutable verified context

Latest fully executable green application baseline:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Verified through Stage13D including Stage9/10/OCR/11/12/13/13D and Full Rebuild same-head matrix.

Current active product stage:

**Stage13E — Admin AI Operations / Review**.

Current combined candidate branch:

`integration/stage13e-ai-operations`

Current branch HEAD at this synchronization:

`1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`

Latest runtime/test candidate beneath that docs commit:

`6494a0ee232cf646eae693054b129db752aee40e`

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
- `DOCUMENTATION_INDEX.md` updated.
- `NEXT_CONVERSATION_PROMPT.md` updated.
- `PROJECT_HANDOFF.md` updated.
- `PROJECT_STATUS.md` updated.
- `PROJECT_INTEGRATION_CONTINUITY.md` updated.
- `PROJECT_ENGINEERING_LOG.md` updated with AD-137/138 and current findings.
- `CURRENT_PRODUCT_OVERRIDES.md` includes PO-OVR-007 Single Owner.
- old workstream docs marked historical/superseded.
- Roadmap reviewed: stage order already matches current execution; hosting stages remain later and require VPS, so no structural rewrite required now.

Acceptance satisfied: a replacement conversation reading repository + Issue #16 is not directed to create/wait for Backend/Frontend chats or hosted deployment work.

---

### EXEC-003 — Stage13E combined candidate static audit

**Priority: P1**

**Status: DONE for current candidate surfaces; reopen only if later evidence exposes a new defect**

Inspected actual implementation:

- Admin HTTP authorization/query/body validation;
- Admin AI list/detail/output/review services;
- Stage12 job lifecycle pause/resume/retry;
- Stage12 cancellation implementation;
- Stage12 output persistence/retry interaction;
- Stage11 review validation + validator issue shapes;
- output persistence and secret/error storage boundaries;
- Frontend API DTOs/adapter/view model/page/workspace;
- real E2E BrowserContext helper/spec;
- deterministic PostgreSQL fixture seed;
- migration `0018_ai_admin_review.sql` and relevant base AI migrations;
- API/Admin package scripts;
- combined workflow commands.

Confirmed:

- no second queue/lifecycle;
- server owns job/review action availability;
- Admin authorization enforced;
- raw response/credential/provider metadata/internal error messages are not exposed;
- cancel clears pause in Stage12 authority;
- retry preserves attempt history and uses Stage12 state;
- review is short-transactional and uses Stage11 semantic validation;
- review mutation now locks output + owning unit and is permitted only for stable `completed | review_required` unit outputs;
- failed/retrying outputs remain observable but are inspection-only;
- Frontend refreshes canonical state after mutation/409;
- validator issues match Frontend adapter shape;
- fixtures use normal durable tables, no test-only endpoint;
- workflow commands match package scripts.

#### Finding AI-013E-DB-001 — P1 Data/Audit Integrity

**Symptom:** reject reason required by HTTP/service but original PostgreSQL migration allowed direct/future DB writer to create reject event with NULL/blank note.

**Root cause:** durable audit invariant existed only at caller validation.

**Correct fix:** PostgreSQL check constraint because terminal rejection reason is a row-level business/audit invariant.

Changes:

- `730989b8bde404b229544c473bba02b05c7e75b4` — adds `ai_output_review_events_reject_note_required`; removes redundant latest-review index.
- `6589d6e53de7ca8cd82b424e5c1496186eb701f1` — direct PostgreSQL NULL/blank reject regression while preserving HTTP 400 tests.
- `bc1bf508897796d0a74d22126094e83180b7ec79` — workflow DB contract now checks all four Stage13E constraints.
- `083992bc7b0b7edf0c88e0b029cc49e10aeca345` — specialized Stage13E contract synchronized.

Execution remains `NOT YET VERIFIED`.

#### Finding AI-013E-REVIEW-002 — P1 Data/Review Integrity

**Symptom:** Stage12 can rewrite the existing `ai_outputs` row during retry/re-execution using `ON CONFLICT (job_unit_id) DO UPDATE`, while Stage13E review events are append-only on the same output id. Original Stage13E review authority did not inspect `ai_job_units.status`.

**Root cause:** human review authority was not explicitly bound to an execution-stable output lifecycle boundary.

**Impact:** a human approve/reject/edit could be recorded for a failed/retrying output, then Stage12 could replace normalized/raw output during retry while the old review event remained, making stale review authority appear attached to different generated content.

**Correct fix location:** Stage13E Backend review authority. Do not delete audit events and do not weaken Stage12 retry semantics.

Changes:

- `5c03fa27f90cd10df06a9e0b7c5e2c0c768e653a` — `allowedReviewActions=[]` unless unit is `completed|review_required`; mutation locks `ai_outputs` + `ai_job_units` and returns `409` for every other unit state before writing an event.
- `6494a0ee232cf646eae693054b129db752aee40e` — real failed/retrying output regressions: inspection remains available, review actions absent, mutations return `409`, audit event count remains zero.
- `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9` — specialized contract synchronized.

Execution remains `NOT YET VERIFIED`.

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
10. Chromium happy path + pause/resume + approve/reload + real session expiry + real stale-review 409 + 390px.

Latest runtime/test run:

- run `34199202570`;
- head `6494a0ee232cf646eae693054b129db752aee40e`;
- job `101973855894`;
- completed with no executable steps/checkout (`steps=null`).

Latest branch-head docs run:

- run `34199371763`;
- head `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`;
- job `101974393620`;
- same pre-checkout condition (`steps=null`).

Previous post-fix runs `34197944201`, `34197629003` and earlier combined run `34193380473` attempts 1/2 also ended before checkout.

Interpretation:

- not product/test failure evidence;
- external/account/platform cause remains `NOT YET VERIFIED`;
- do not weaken tests or churn candidate code to satisfy a job that never starts;
- local fallback is unavailable in current assistant runtime because private-repo clone/network access is unavailable; no local PASS is claimed.

**Exact next action:** rerun the unchanged combined gate on current branch HEAD when GitHub allocates a real runner. If any command executes and fails, root-cause it before any Stage promotion.

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
