# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Always start from the first incomplete item after reading Source of Truth and Issue #16.

Last synchronized: **2026-09-10 — Stage13G G-A VERIFIED; G-B Notifications + Operations Dashboard is active Track A work.**

## Operating Rules

- Repository: `7eaur/alwaslh`.
- Issue #16 is the cross-track execution ledger.
- Code/migrations/executable evidence outrank prose.
- Root-cause fixes only; no test weakening, auth bypass, fake API, sleep-based race masking or duplicate durable authority.
- Current model: parallel Track A (Backend/Admin/AI) + Track B (Student Product).
- Production deployment/cutover remains future-only.

## Completed Track A Checkpoints

### EXEC-005 — Stage13E Admin AI Operations / Review

**DONE / VERIFIED / CLOSED**

### EXEC-006 — Stage13F Question Bank / Quiz Builder

**DONE / VERIFIED / CLOSED / PROMOTED**

Shared main checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Question Bank reusable identity/revisions/publication, Quiz Builder immutable snapshots, stable regenerate-one, reviewed/published export and real Admin Chromium are closed Stage13F authority.

### EXEC-007A — Stage13G G-A Accounts + Access Codes

**DONE / VERIFIED**

Final exact runtime/test HEAD:

`4822f87d60ab7a467c4708b5f75bb24cb90e7738`

Verification run:

`34425317912` — backend SUCCESS + Admin UI quality SUCCESS + real PostgreSQL/API/Chromium SUCCESS (4/4).

Closed outcomes:

- Student account list/search/status/detail;
- entitlement/device/redemption/activity projection;
- secure recovery action UX without password retrieval;
- device rebind operation;
- active entitlement revoke;
- Full/Class access-code list/search/filter/sort/page;
- code generation;
- safe non-destructive unused-code bulk revoke with audit;
- session-expiry and 390px responsive evidence.

## Active Queue

### EXEC-007B — Stage13G Notifications + Operations Dashboard

**Priority: P1 · Status: ACTIVE**

Discovery already verified:

- `notifications` + `notification_reads` exist in `0003_learning.sql` with severity, target, expiry/read timestamps and useful indexes;
- no notification product module is present in current API source inventory;
- parity `NOTIF-A-001..006` requires global create, validated title/body, paginated sent list, delete and Student visibility;
- parity `ADMIN-001..006` requires a real operational dashboard with curriculum counts, access/account counts and latest notification/activity.

Execution order:

1. freeze thin notification + operations read/write contract on existing schema/events;
2. implement API service/routes and PostgreSQL integration tests;
3. implement Admin notification + dashboard workspaces/typed client;
4. verify loading/error/empty/session/RTL/mobile behavior;
5. add real PostgreSQL/API/Chromium gate;
6. update Source of Truth + Issue #16.

Do not create a second event/analytics store for dashboard counters.

---

### EXEC-007C — Stage13G Import/Export/Reports + Settings/Security/Audit

**Priority: P1 · Status: NEXT AFTER EXEC-007B**

Inspect actual authorities first. Preserve explicit validation, scope and audit boundaries.

---

### EXEC-007D — Stage13G Remaining Admin AI-Authoring Parity

**Priority: P1 · Status: REQUIRED**

Must close the lesson-centric generation/admin outcomes intentionally left open by Stage13F: Class → Subject → Lesson → source pages → generation/review/question bank, requested counts/types, source/exact/comprehensive modes where supported, edit/manual/regenerate/bulk flows and remaining valuable export variants. Do not treat the standalone Question Bank as sufficient evidence.

---

### EXEC-007E — Stage13G Wider Regression / Legacy Coverage Closure

**Priority: P0 process gate · Status: AFTER G-B/G-C/G-D**

Require exact-head wider verification, synchronize all Source of Truth, map remaining legacy rows to verified implementation or explicit owner-approved removal, then promote only through the project’s verified integration process.

---

### EXEC-007F — Live provider runtime boundary `AI-012-019`

**Priority: P2 · Status: NOT YET VERIFIED**

Benchmark/select live provider/model/routes, configure authorized credentials outside source control and prove real generation/billing/limits/errors/fallback behavior. Provider-neutral contracts do not close this gate.

## Parallel Track B

Stage14+ Student work proceeds on `parallel/stage14-student-product` under its own Source of Truth. Before making claims about its latest status, read its branch files and current Actions. Shared backend authority must come from verified `main`; Track B must not duplicate Auth/Access/Content/Question Bank/Quiz authority.

## Later Roadmap

- Stage15 Practice/Assessment.
- Stage16 Offline/PWA.
- Stage17 Personal Learning Data.
- Stage18 Notifications.
- Stage19 Progress/Statistics/Achievements.
- Stage20 Import/Export/Reporting.
- Stage21 Performance.
- Stage22 Security hardening.
- Stage23 automated tests/CI expansion.
- Stage24 accessibility/device QA.
- Stage25 initial canonical data/content load.
- Stage26–29 staging/release/production/monitoring only when deployment is explicitly reopened.

## Open Findings

- `ADMIN-013G-NOTIF-006` P1 — G-B.
- `ADMIN-013G-DASH-007` P1 — G-B.
- `AI-012-019` P2 — live provider `NOT YET VERIFIED`.
- legacy Admin/AI-authoring rows explicitly left open in `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.

## Do Not Reopen

- Stage13E/Stage13F verification-only PR history.
- resolved historical `.noop` incident; cleanup restored the exact prior tree and no history rewrite is required.
