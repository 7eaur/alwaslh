# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> **Purpose:** قائمة التنفيذ الوحيدة للمشروع في Single Owner mode. أي محادثة جديدة تبدأ من أول عنصر غير مكتمل هنا بعد قراءة Source of Truth.
>
> **Rule:** لا تعتمد على Chat memory. Code/migrations/executable evidence أعلى من هذا الملف. غير المفحوص/غير المنفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-09 — Single Owner active; Stage13E candidate has four P1 root fixes plus four P2 hardenings; final static contract/schema/lifecycle audit found no additional proven defect; Roadmap + Legacy Coverage are closure-ready without overclaiming verification; executable verification remains blocked before checkout.**

## 1. Operating mode

- One replaceable engineering conversation owns Product + Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation.
- Sole GitHub execution ledger: Issue `#16`.
- Issues `#13/#14/#15`: CLOSED/HISTORICAL only.
- Hosting/deployment: outside current scope until Product Owner provides VPS and explicitly reopens it.
- `main`: latest Integration-approved development baseline, not deployment authority.
- Use short task/stage branches; do not merge a Stage without required executable evidence.
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

Current active product stage: **Stage13E — Admin AI Operations / Review**.

Current combined candidate branch: `integration/stage13e-ai-operations`.

Current candidate docs HEAD: `c48d1e597497e6054340f71235c78937082b9371`.

Latest runtime/test HEAD immediately below docs: `d60218b518fb0fe453c21386e77cd35a2228ad07`.

Historical candidate sources remain evidence only:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`.
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`; Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

## 4. Ordered task queue

### EXEC-001 — Retire multi-chat team topology

**Status: DONE**

#13/#14/#15 closed as historical; #16 is sole Project Execution Board.

---

### EXEC-002 — Synchronize startup/governance docs to Single Owner

**Priority: P1 · Status: DONE**

Repository startup docs, Queue, Continuity, Handoff, Product Overrides and Single Owner model are authoritative. Hosting remains future-only until explicit VPS reopening.

---

### EXEC-003 — Stage13E combined candidate static/operational audit

**Priority: P1**

**Status: DONE for inspected surfaces; reopen whenever later evidence exposes a real defect**

Inspected actual Admin AI HTTP/service/lifecycle/review/persistence/frontend/fixtures/workflow code. Confirmed after fixes:

- no second queue/lifecycle;
- server owns lifecycle/review action availability;
- Admin authorization enforced;
- raw response/credential/provider metadata/internal errors excluded from Frontend contract;
- cancel/retry reuse Stage12 authority;
- review is Stage11-validated and only allowed on stable `completed | review_required` units;
- failed/retrying/in-flight/cancelled outputs are inspection-only;
- canonical refresh after mutations/409;
- complete Jobs/Units/Attempts/Review History is reachable through bounded server pagination;
- polling/refresh stay on current pages;
- selected historical review page never becomes current review authority;
- all multi-query Admin AI read models use one short repeatable-read database snapshot;
- List Jobs applies the bounded Job page before Unit status aggregation;
- all Stage13E pagination offsets are bounded to JavaScript safe integers before service/DB execution;
- Stage13E progress semantics match Stage12 lifecycle authority exactly;
- final HTTP/schema/lifecycle alignment pass found no additional proven defect;
- real fixtures use durable tables and real APIs only.

#### AI-013E-DB-001 — P1 Data/Audit Integrity

Reject reason existed only at caller validation. Fixed by PostgreSQL `ai_output_review_events_reject_note_required` plus direct NULL/blank insert regression.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### AI-013E-REVIEW-002 — P1 Data/Review Integrity

Stage12 can replace `ai_outputs` during retry while review audit is append-only. Fixed by allowing review only for stable `completed|review_required` units and locking output+unit before mutation.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### AI-013E-OPS-003 — P1 Durable Operational History Accessibility

Frontend previously exposed only first 30 Jobs / 50 Units / 50 Attempts. Fixed with end-to-end bounded server pagination and real fixtures proving second Jobs page, Unit 51 and Attempt 1 on page two.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### AI-013E-OPS-004 — P1 Review Audit Completeness / Authority Isolation

Output detail originally returned only newest 100 append-only review events and derived current state from the displayed page. Fixed with bounded review pagination plus an independent canonical-latest authority and real >100 browser fixture.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### AI-013E-OPS-005 — P2 Output Detail Snapshot Consistency

Output row, audit page, count and canonical latest review were separate top-level reads. Fixed by one short `REPEATABLE READ` snapshot. Regression: `apps/api/tests/ai-admin-output-detail-snapshot.test.ts`.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### AI-013E-OPS-006 — P2 Admin Multi-query Read-model Consistency

List Jobs page/total, Job Detail progress/units/allowed-actions, and Unit Detail summary/attempt-page/total were separate reads. Fixed by shared `readSnapshot()` and `apps/api/tests/ai-admin-read-snapshots.test.ts`.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### AI-013E-PERF-007 — P2 Admin Job-list Bounded Aggregation

`listJobs()` originally aggregated Units for every matching durable Job before `LIMIT/OFFSET`. Fixed by paging Jobs first and aggregating Units only for the selected page. Regression: `apps/api/tests/ai-admin-job-list-query-shape.test.ts`.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

#### AI-013E-API-008 — P2 Safe Pagination Input Boundary

**Problem:** `offset`, `unitOffset`, `attemptOffset`, and `reviewOffset` accepted any non-negative JavaScript integer. Integer-looking values outside the safe-integer range could pass HTTP validation and reach PostgreSQL pagination as a representation/DB error instead of client `400`.

**Correct fix:** one shared `PaginationOffsetSchema` now enforces `0..Number.MAX_SAFE_INTEGER` for all Stage13E offsets. This is a representation bound, not a smaller product paging cap.

**Regression:** `apps/api/tests/ai-admin-pagination-bounds.test.ts` uses real Fastify routing/error mapping to prove all four unsafe offsets return `400 BAD_REQUEST` before service execution, while `Number.MAX_SAFE_INTEGER` remains accepted. It is included automatically by the existing `npm test --prefix apps/api` gate.

**Commits:** `887f772df927c8d24df0003b76b9cb7ea0313e15`, final regression `d60218b518fb0fe453c21386e77cd35a2228ad07`. An initial DB integration-test attempt was removed (`6b04c9f50256d96fda9b2f1c322775ddf682aa9f`) after the safety layer rejected a workflow rewrite containing an existing fixed browser-test credential; no workflow was weakened.

**Specialized doc:** `docs/ai/STAGE13E_ADMIN_AI_HTTP_VALIDATION.md`.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

---

### EXEC-004 — Stage13E executable same-head gate

**Priority: P1**

**Status: BLOCKED BY EXTERNAL GITHUB HOSTED-RUNNER ALLOCATION**

Workflow: `.github/workflows/stage13e-integration.yml`.

Expected gate:

1. API lint/typecheck/unit/build, including pagination-bound, Output Detail, List/Job/Unit snapshot and Job-list query-shape regressions;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E DB constraints;
4. Stage13E authorization/action/review/concurrency/DB/stable-review/review-history pagination tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset + real Admin bootstrap;
8. deterministic fixtures: 51 Units, 51 Attempts, 101 Review revisions, later Jobs page;
9. Chromium Jobs/Units/Attempts/Review History pagination;
10. Chromium pause/resume, approve/reload, session expiry, stale-review 409, 390px.

Latest runtime/test-head run:

- run `34283353562`;
- head `d60218b518fb0fe453c21386e77cd35a2228ad07`;
- job `102253102885`;
- `steps=[]` / no checkout or repository command executed.

Latest candidate/docs-head attempt:

- run `34283442253`;
- head `c48d1e597497e6054340f71235c78937082b9371`;
- attempt `2`;
- job `102256556365`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- completed before checkout; no repository command executed.

Local fallback check found `/mnt/data/alwaslh-stage13e` exists but is an empty directory, not a checkout. The execution container can run Node/npm/git, but npm registry access times out and no authenticated private-repository checkout is available; no local PASS is claimed.

Interpretation: this is not product/test failure evidence. External account/platform cause remains `NOT YET VERIFIED`. Repository-level Check Run output/logs do not expose a more specific cause through available connector permissions. Do not weaken tests or churn product code because a job never starts.

**Exact next action:** execute the unchanged combined gate when GitHub allocates a real runner. Any command that actually executes and fails must be root-caused before Stage promotion.

---

### EXEC-005 — Stage13E wider regression + closure

**Priority: P1 · Status: BLOCKED BY EXEC-004; CLOSURE-READINESS DOCS PREPARED**

Closure-readiness completed while the executable gate is externally blocked:

- `MASTER_REBUILD_ROADMAP.md` now records Stage13E as `COMBINED CANDIDATE / EXECUTION PENDING`, not “current next”;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` maps candidate coverage to relevant legacy rows as `CANDIDATE / EXECUTION PENDING` without marking any unexecuted row VERIFIED;
- Stage13F remains explicitly blocked by Stage13E closure;
- deployment remains outside the development gate until VPS.

After combined PASS:

- wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head regression matrix;
- Security/Performance/UX/a11y/Legacy Coverage review;
- promote accepted Stage13E runtime to `main` while preserving central docs;
- convert only actually proven candidate legacy rows to VERIFIED;
- update Status/Continuity/Engineering Log/Handoff/Roadmap/Legacy Coverage;
- Stage13E Closure `EXECUTION REPORT` in Issue #16.

No hosted deployment is required under current policy.

---

### EXEC-006 — Stage13F Question Bank / Quiz Builder / Publish

**Priority: P1 after Stage13E closure · Status: BLOCKED BY EXEC-005**

Do not implement before Stage13E VERIFIED unless Product Owner explicitly changes ordering. First work includes resolving `AI-011-005`, reviewed Question Bank authority/provenance, editing, Draft→Review→Published, Quiz Builder/versioning/regeneration/export, and DB/API/Admin/Chromium evidence.

---

### EXEC-007 — Stage13G Remaining Admin Product

**Status: BLOCKED by Stage13F closure**

Student/account/access code/recovery/device operations, notifications, reporting/settings/audit and remaining Admin parity.

---

### EXEC-008+ — Remaining roadmap

Follow `MASTER_REBUILD_ROADMAP.md`: Stage14 Student Product → Stage15 Assessment → Stage16 Offline/PWA → Stage17 Personal Data → Stage18 Notifications → Stage19 Progress → Stage20 Reporting → Stage21 Performance → Stage22 Security → Stage23 Tests → Stage24 Accessibility/device QA → Stage25 initial content load → Stage26+ deployment/release only after VPS and explicit reopening.

## 5. Open findings

- `CI-001` P1 — GitHub hosted runner terminates before checkout; external cause not verified.
- `AI-011-005` P2 — direct generated-question persistence unresolved; Stage13F owns resolution.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap unverified.
- `AI-013E-DB-001` P1 — fixed in candidate; executable verification pending.
- `AI-013E-REVIEW-002` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-003` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-004` P1 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-005` P2 — fixed in candidate; executable verification pending.
- `AI-013E-OPS-006` P2 — fixed in candidate; executable verification pending.
- `AI-013E-PERF-007` P2 — fixed in candidate; executable verification pending.
- `AI-013E-API-008` P2 — fixed in candidate; executable verification pending.
- later Admin/Student/assessment/offline/product stages remain incomplete.
- Hosting/VPS intentionally not a current blocker.

## 6. Mandatory end-of-batch updates

After meaningful work update: this Queue, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, specialized stage docs, Issue #16 `EXECUTION REPORT`, and Handoff/Index/Roadmap/Legacy Coverage when truth changes.

Never leave continuation-critical information only in chat.