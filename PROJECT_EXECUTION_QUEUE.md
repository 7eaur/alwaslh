# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Always start from the first incomplete item after reading Source of Truth and Issue #16.

Last synchronized: **2026-09-10 — Stage13F implementation verified 13/13; closure checkpoint re-verification/promotion is the active Track A task.**

## Operating Rules

- Repository: `7eaur/alwaslh`.
- Issue #16 is the sole cross-track execution ledger.
- Code/migrations/executable evidence outrank prose.
- Root-cause fixes only; no test weakening, auth bypass, fake API, sleep-based race masking or duplicate durable authority.
- Current model: parallel Track A (Backend/Admin/AI) + Track B (Student Product).
- Production deployment/cutover remains future-only.

## Completed Track A Checkpoints

### EXEC-005 — Stage13E Admin AI Operations / Review

**DONE / VERIFIED / CLOSED**

Runtime authority: `d5ebc7f25a369430387a758c7c0bb89350963d67`.

### EXEC-006A — Stage13F Question Bank foundation

**DONE / VERIFIED**

Canonical stable items/revisions, typed direct/MCQ/T-F persistence, provenance, approved-AI import, manual authoring, lifecycle and PostgreSQL/API integration.

### EXEC-006B — Stage13F Admin Question Bank

**DONE / VERIFIED**

Dedicated Admin workspace, typed client, lifecycle/provenance/history/session/responsive UX and real Chromium.

### EXEC-006C — Stage13F Quiz Builder / immutable snapshots

**DONE / VERIFIED**

Published Question Bank candidates, class/subject/multi-lesson quiz scope, multiple versions/models, immutable delivery snapshots, direct delivery support, review/publish/archive lifecycle.

### EXEC-006D — Regenerate one / export

**DONE / VERIFIED**

Same-item approved regeneration apply, DB identity guard, idempotent replay, exact Review/Published version CSV + RTL print/PDF template and Draft export rejection.

Runtime checkpoint: `afbe552710b3f1cf79ee70594f691fa836c05a45`.

Stage-specific runs `34420441878` and `34420441837` SUCCESS.

Runtime wider verification-only PR #27: **13/13 SUCCESS**, closed unmerged. Runs: `34420900598`, `34420900550`, `34420900527`, `34420900592`, `34420900501`, `34420900492`, `34420900547`, `34420900488`, `34420900522`, `34420900503`, `34420900520`, `34420900476`, `34420900482`.

## Active Queue

### EXEC-006E — Stage13F closure documentation exact-head verification + main promotion

**Priority: P0 process gate · Status: ACTIVE**

1. commit synchronized Status/Engineering Log/Handoff/Resume/Continuity/Queue/Roadmap/Stage13F contract/Legacy Coverage atomically;
2. open verification-only Draft PR to `main`;
3. require the same wider pull-request matrix to pass on that exact closure commit;
4. close PR unmerged;
5. re-check live `main` is still the Stage13F base;
6. fast-forward `main` non-force to the exact verified closure commit;
7. post final Stage13F EXECUTION REPORT in Issue #16.

No merge commit or force update.

---

### EXEC-007 — Stage13G Remaining Admin Product

**Priority: P1 · Status: NEXT AFTER EXEC-006E**

Required outcomes include:

- Student account search/status/admin recovery actions;
- access-code generation/search/filter/sort/bulk/import/export/print;
- recovery/device rebind operations;
- notifications;
- import/export/reporting;
- settings/security/audit/operations dashboard;
- unresolved Admin legacy parity;
- unresolved Quiz/AI authoring outcomes explicitly left open by Stage13F, including direct generation orchestration inside the Admin product and specialized export variants where still valuable.

Before implementation, inspect current code and map each remaining legacy row. Do not infer completion from Stage11/12/13E foundations.

---

### EXEC-007A — Live provider runtime boundary `AI-012-019`

**Priority: P2 · Status: NOT YET VERIFIED**

Benchmark/select live provider/model/routes, configure authorized credentials outside source control, execute real runtime generation and prove billing/limits/errors/fallback behavior. This is not closed by provider-neutral prompts/contracts.

Do not block Stage13F closure on absent live credentials, but do not claim production generation readiness until this gate passes.

---

## Parallel Track B

### STUDENT-014 — Stage14 Student Web/PWA

**Status from Track B Source of Truth: IN PROGRESS**

Verified there: Access, entitlement-safe Curriculum and protected Reader including real Chromium. Latest recorded verified runtime: `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`.

Remaining Stage14 closure: learning-first shell, product copy and whole-surface accessibility polish/audit.

### STUDENT-015 — Practice / Assessment

**BLOCKED until Track B incorporates Stage13F promoted main authority.**

After EXEC-006E, Track B must merge/rebase the exact verified main checkpoint before implementing published quiz consumption. No local/fake Question Bank authority.

---

## Later Roadmap

- Stage15 Practice/Assessment — after Stage13F integration.
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
- Stage26–29 staging/release/production/monitoring only when release/deployment is explicitly active.

## Open Findings

- `AI-012-019` P2 — live provider runtime `NOT YET VERIFIED`.
- legacy Admin/Quiz authoring rows explicitly marked open in `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.
- historical `CI-001` exact external runner-allocation cause `NOT YET VERIFIED`, nonblocking.

## Do Not Reopen

- Stage13E verification PRs #24/#25.
- Stage13F runtime verification PR #27 after closure; it was evidence-only.
- accidental `.noop` history; cleanup restored exact tree and no rewrite is needed.