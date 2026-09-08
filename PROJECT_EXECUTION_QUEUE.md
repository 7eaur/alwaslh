# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> **Purpose:** قائمة التنفيذ الوحيدة للمشروع في Single Owner mode. أي محادثة جديدة تبدأ من أول عنصر غير مكتمل هنا بعد قراءة Source of Truth.
>
> **Rule:** لا تعتمد على Chat memory. Code/migrations/executable evidence أعلى من هذا الملف. غير المفحوص/غير المنفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — Single Owner active; Stage13E audit found/fixed four P1 defects including complete Review History pagination with canonical-latest isolation; executable verification remains blocked before checkout.**

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

Current candidate docs HEAD: `b344c6cdc21ce71e5d8c6b34bb2dc7f6e42b5ebb`.

Latest runtime/test HEAD immediately below docs: `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`.

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

**Problem:** output detail returned only newest 100 append-only review events with no total/offset. Older audit revisions were unreachable. Original service also derived current review state/actions/effective output from `history[0]`, so naive pagination could make an old page appear current.

**Root cause:** review history was modeled as a bounded display array instead of durable paginated audit authority, and historical-page selection was coupled to current review derivation.

**Correct fix:**

- Backend `reviewLimit/reviewOffset`, max 100;
- `reviewPagination { total, limit, offset }`;
- requested audit page query separated from canonical-latest one-row query;
- only canonical latest revision drives `reviewStatus`, `allowedReviewActions`, `effectiveReviewedOutput`;
- Frontend keeps independent review offset and preserves it through polling/refresh/409;
- accessible Review History Previous/Next navigation; no unbounded browser loading.

Regression/evidence lineage:

- `d242e0542df4402392780098418cdd015cb11107` — Backend paged history + canonical-latest separation.
- `f04fe2beeff79dea0353f69fbe5e2774fe5703ea` — bounded HTTP query.
- `e33d43c19c8b954429036bba24ca0f3c72d0ba15` — 105-revision Backend regression: request old page revisions 5..1 but current state still revision 105 approved/no-actions/latest output.
- `9c18826acbc8f2deeb42f70b2e0f651321504f94`, `2c82e8790b066a2ac035f8eee8c172136a0ed28a`, `72711ec8aaefc09fa4e2979008b0be03beb526c3` — Frontend DTO/view-model/adapter contract.
- `de3a9dc260871ab913bd9d60350479b60de708b9` — independent controller review offset.
- `bf782c92bd74436831e74391768c53c9cd9cb075` — Review History UI navigation.
- `d7830d187e89bb16619234609f8480c5bec070cf`, `f64419fa20c930ac0bbd641ba63c229dc9db9605` — transport/adapter regressions.
- `a1ef3d7a824d1e8c7503ecb3203df3bebe850619` — real fixture with 101 edit revisions.
- `f95c1a9ee5e800125bdcc665c5a64d0fe10a1fd9` — Chromium complete audit navigation + current-authority isolation.
- `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b` — workflow fixture assertions.

Real browser contract: pages 1–50, 51–100, 101–101 are reachable; revision 1 is visible; approve remains governed by latest revision while oldest page is open; approve creates revision 102 and reload preserves canonical approved state.

**Status:** FIXED IN CANDIDATE / EXECUTION PENDING.

---

### EXEC-004 — Stage13E executable same-head gate

**Priority: P1**

**Status: BLOCKED BY EXTERNAL GITHUB HOSTED-RUNNER ALLOCATION**

Workflow: `.github/workflows/stage13e-integration.yml`.

Expected gate:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E DB constraints;
4. Stage13E authorization/action/review/concurrency/DB/stable-review/review-history pagination tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset + real Admin bootstrap;
8. deterministic fixtures: 51 Units, 51 Attempts, 101 Review revisions, later Jobs page;
9. Chromium Jobs/Units/Attempts/Review History pagination;
10. Chromium pause/resume, approve/reload, session expiry, stale-review 409, 390px.

Latest runtime/test run:

- run `34275316004`;
- head `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`;
- job `102226771007`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout or repository command executed.

Interpretation: this is not product/test failure evidence. External account/platform cause remains `NOT YET VERIFIED`. Do not weaken tests or churn product code because a job never starts.

**Exact next action:** rerun unchanged combined gate on current candidate when a real runner is allocated. Any command that actually executes and fails must be root-caused before Stage promotion.

---

### EXEC-005 — Stage13E wider regression + closure

**Priority: P1 · Status: BLOCKED BY EXEC-004**

After combined PASS:

- wider Stage9/10/OCR/11/12/13/13D/Full Rebuild same-head regression matrix;
- Security/Performance/UX/a11y/Legacy Coverage review;
- promote accepted Stage13E runtime to `main` while preserving central docs;
- update Legacy Coverage + Roadmap + Status/Continuity/Engineering Log/Handoff;
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
- later Admin/Student/assessment/offline/product stages remain incomplete.
- Hosting/VPS intentionally not a current blocker.

## 6. Mandatory end-of-batch updates

After meaningful work update: this Queue, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, specialized stage docs, Issue #16 `EXECUTION REPORT`, and Handoff/Index/Roadmap/Legacy Coverage when truth changes.

Never leave continuation-critical information only in chat.
