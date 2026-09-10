# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Always start from the first incomplete item after reading Source of Truth and Issue #16.

Last synchronized: **2026-09-10 — Stage13F promoted + integrated to Student; Stage14 CLOSED; Stage15 discovery is the active Track B task.**

## Operating Rules

- Repository: `7eaur/alwaslh`.
- Issue #16 is the sole cross-track execution ledger.
- Code/migrations/executable evidence outrank prose.
- Root-cause fixes only; no test weakening, auth bypass, fake API, sleep-based race masking or duplicate durable authority.
- Parallel model: Track A Backend/Admin; Track B Student Product.
- Production deployment/cutover remains future-only.

## Completed Shared / Track B Checkpoints

### EXEC-006 — Stage13F Question Bank / Quiz Builder

**DONE / VERIFIED / CLOSED / PROMOTED TO MAIN**

Canonical main checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Provides stable Question Bank items/revisions, Draft→Review→Published, provenance, immutable published quiz snapshots, direct-question delivery support, same-item regeneration and reviewed/published export.

### STUDENT-014 — Stage14 Student Product

**DONE / VERIFIED / CLOSED**

Verified runtime:

`ac55f1435d232cadff334816407f1182125dda90`

Evidence:

- Student Product `34420993805` — SUCCESS.
- API Regression `34420993840` — SUCCESS.
- Student Auth/Access/Curriculum/Reader Chromium and responsive/a11y critical path PASS.

### STUDENT-014I — Integrate canonical Stage13F main

**DONE / VERIFIED**

History-preserving merge runtime:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

- parents: Student `9ccfe1e6...` + main `3aeca598...`;
- non-force branch update;
- `behind_by=0` vs main;
- Student API Regression `34422553459` — SUCCESS;
- Student Product `34422553405` — SUCCESS;
- clean migrations `0001`→`0022` PASS;
- Curriculum/Reader integration + Chromium PASS.

The Stage15 dependency block is resolved.

## Active Track B Queue

### STUDENT-015A — Assessment runtime contract + persistence audit

**Priority: P1 · Status: ACTIVE**

Verified facts:

- Stage13F Admin HTTP is not a Student API.
- `QuizBuilderService.detail()` contains answer correctness/direct answer/Admin audit and must not be exposed to Student.
- existing durable runtime tables in `0003_learning.sql` are canonical:
  - `practice_sessions`
  - `practice_session_questions`
  - `practice_session_options`
  - `practice_answers`
  - `quiz_attempts`
- `0020_quiz_builder_enums.sql` adds `direct` delivery type.
- `0021_quiz_builder.sql` materializes immutable Published+known-answer Question Bank snapshots and DB-blocks invalid scope/publication/mutation.
- proven gap: `practice_answers` has option answer only, no direct-text answer representation.

Required completion:

1. finish caller/constraint audit;
2. define smallest additive direct-answer/finalization migration;
3. document shared DB/API edit in Issue #16 before modifying shared areas;
4. add PostgreSQL contracts for invariants;
5. no second attempt store.

---

### STUDENT-015B — Student-safe assessment service/API

**Priority: P1 · Status: NEXT**

Required:

- authenticated Student role + bound device/session;
- entitlement-safe published quiz discovery;
- immutable version/model selection;
- create/resume/restart/abandon session rules;
- one persisted question order and option order per session;
- answer-key-free Student payload;
- idempotent answer writes;
- Practice feedback policy;
- Test/Model withheld correctness before finalization;
- transactional/idempotent finalization;
- server-derived score and attempt history;
- exact Question Bank/source provenance without answer leakage.

---

### STUDENT-015C — Student Practice UI

**Priority: P1 · Status: AFTER API CONTRACT**

Learning-first Practice workspace with immediate server-authorized feedback, explanation/provenance where policy allows, keyboard/touch/mobile states, loading/error/offline/session expiry and resume.

---

### STUDENT-015D — Student Test / Model UI

**Priority: P1 · Status: AFTER API CONTRACT**

No correctness leakage before finalization; stable progress, resume/restart, final score/result/history and version/model identity.

---

### STUDENT-015E — Stage15 verification/closure

**Priority: P0 process gate · Status: PENDING**

Require exact-head:

- Student lint/typecheck/unit/build;
- API lint/typecheck/unit/build;
- clean PostgreSQL migrations;
- assessment PostgreSQL integration including races/idempotency;
- Auth/Access/Curriculum/Reader regressions;
- real Chromium Practice + Test/Model;
- 390px/tablet/desktop responsive checks;
- keyboard/focus/accessibility checks;
- Issue #16 execution report + synchronized docs.

## Parallel Track A

### EXEC-007 — Stage13G Remaining Admin Product

Track A follow-on. Track B must not absorb Admin ownership or block Student Stage15 on unrelated Stage13G work.

### EXEC-007A — `AI-012-019` live provider runtime

**P2 · NOT YET VERIFIED**

Does not block Stage15 consumption of already-published quiz snapshots.

## Later Student Roadmap

- Stage16 Offline/PWA — blocked until Stage15 closes.
- Stage17 Personal Learning Data.
- Stage18 Notifications.
- Stage19 Progress/Statistics/Achievements.
- Stage20+ later roadmap/hardening.
- Stage26–29 release/deployment only when explicitly active.

## Open Findings

- `STUDENT-015-API-002` P1 — no Student-safe assessment runtime API.
- `STUDENT-015-DIRECT-003` P1 — direct answer persistence gap.
- `AI-012-019` P2 — live provider runtime `NOT YET VERIFIED`.
- historical `CI-001` nonblocking.

## Do Not Reopen / Do Not Do

- do not merge obsolete integration PR #29; integration was completed manually with a verified two-parent merge;
- do not duplicate Question Bank/Quiz models;
- do not expose Admin authoring/detail endpoints to Student;
- do not score canonically in browser;
- do not begin Stage16 before Stage15 closes.
