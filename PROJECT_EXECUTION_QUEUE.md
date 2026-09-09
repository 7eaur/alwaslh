# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> قائمة التنفيذ الحالية في Single Owner mode. ابدأ دائمًا من أول عنصر غير مكتمل بعد قراءة Source of Truth.

Last synchronized: **2026-09-09 — Stage13E closure completed technically; Stage13F is the next implementation stage after this documentation batch.**

## Operating rules

- Repository: `7eaur/alwaslh`.
- Issue `#16` is the sole execution board.
- Code/migrations/executable evidence outrank prose.
- Root-cause fixes only; no test weakening/auth bypass/fake API/sleep-based race masking/duplicate authority.
- Hosting/deployment remains **fully deferred until VPS + explicit Product Owner reopening**.
- `main` is the development/integration baseline, not deployment authority.
- Live-check `main`, Issue #16 and Actions before starting the first active task.

## Closed stage checkpoint

### EXEC-004A — Synchronize stale standalone Stage13E CI contract

**Status: DONE / VERIFIED**

`CI-013E-009` was fixed in the owning workflow: shell contract assertion synchronized with `0018_ai_admin_review.sql`, all four current review constraints retained, removed redundant latest-review index no longer required, legitimate current index checks preserved.

### EXEC-004B — Full wider candidate matrix

**Status: DONE / VERIFIED**

Accepted candidate: `72ead8446af237392dc6d953c8e0c2382f468286`.

Result: **12/12 SUCCESS on exact candidate HEAD**. PR #24 closed unmerged.

### EXEC-005 — Selective Stage13E promotion assembly

**Status: DONE / VERIFIED**

Built from latest inspected main `e304d61286b9ca120db2dad695d29f4f1642e733` using exactly the accepted 36-file Stage13E promotion manifest.

Promotion HEAD: `d5ebc7f25a369430387a758c7c0bb89350963d67`.

Result: one promotion commit / 36 changed files; **12/12 SUCCESS on exact promotion HEAD**. PR #25 closed unmerged.

### EXEC-005B — Stage13E closure to main

**Status: DONE / DOCUMENTATION CLOSURE IN THIS BATCH**

`main` was fast-forwarded non-force to verified promotion HEAD `d5ebc7f25a369430387a758c7c0bb89350963d67`; later docs-only closure commits do not change the verified runtime tree.

## Ordered queue

### EXEC-006 — Stage13F Question Bank / Quiz Builder / Publish

**Priority: P1 · Status: READY / FIRST IMPLEMENTATION TASK / NOT STARTED**

Start only after this Stage13E documentation closure commit and Issue #16 closure report are complete.

Required Stage13F product boundary:

1. define canonical reviewed Question Bank persistence from Stage11/12/13E outputs, including `AI-011-005` direct-question persistence;
2. preserve class/subject/lesson/source/page/checksum/prompt/model provenance;
3. distinguish generated candidate, human edit/review and publish authority;
4. support MCQ / True-False / manual/generated editing under typed validation;
5. implement explicit Draft → Review → Published lifecycle; no raw/unreviewed AI output reaches Student authority;
6. implement Quiz Builder with stable question identity, versioning and deterministic regeneration of one question without replacing unrelated questions;
7. define/export safe printable/portable quiz versions only from reviewed/published authority;
8. reuse Stage11 validation + Stage12 durable execution + Stage13E review authority; do not build a second AI queue or review system;
9. add PostgreSQL/API/Admin unit/integration/real Chromium evidence;
10. run same-head wider regressions before closure.

Before coding Stage13F, perform repository discovery of any existing Question Bank/quiz schema/routes/components/tests and classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE. Any uninspected area = `NOT YET VERIFIED`.

---

### EXEC-007 — Stage13G Remaining Admin Product

**Priority: P1 · Status: BLOCKED BY STAGE13F CLOSURE**

Student accounts/search/status, access-code operations, recovery/device rebind operations, notifications, import/export/reports, settings/security/audit/operations dashboard and remaining Admin parity rows.

---

### EXEC-008+ — Student/Product/Hardening roadmap

Follow `MASTER_REBUILD_ROADMAP.md` for Stage14–25. Staging/release/production/monitoring Stage26–29 remain future-only until VPS/deployment is explicitly reopened.

## Open boundaries carried forward

- `AI-011-005` P2 — Stage13F reviewed direct Question Bank persistence.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap `NOT YET VERIFIED`.
- `CI-001` — historical runner-allocation incident no longer blocking; exact external historical cause remains `NOT YET VERIFIED`.

## Stage13E final evidence

Promotion run IDs:

- Combined `34401502463`
- Stage13E standalone `34401549935`
- Stage13E Frontend Prep `34401549849`
- Rebuild `34401550016`
- Stage13 Admin `34401549835`
- Stage9 `34401549851`
- Stage10 `34401549989`
- OCR `34401549910`
- Stage11 `34401549927`
- Stage12 `34401549964`
- Stage13D Content `34401550065`
- Stage13D Admin UI `34401549903`

All were SUCCESS on `d5ebc7f25a369430387a758c7c0bb89350963d67`.
