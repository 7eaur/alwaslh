# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> قائمة التنفيذ الحالية في Single Owner mode. ابدأ دائمًا من أول عنصر غير مكتمل بعد قراءة Source of Truth.

Last synchronized: **2026-09-09 22:57 Asia/Aden**.

## Operating rules

- Repository: `7eaur/alwaslh`.
- Issue `#16` is the sole execution board.
- Hosting/deployment fully deferred until VPS + explicit reopening.
- `main` is development baseline, not deployment authority.
- Root-cause fixes only; no test weakening/auth bypass/fake API/sleeps/duplicate authority.
- Code/migrations/executable evidence outrank prose.
- Read `PROJECT_RESUME_SNAPSHOT.md` before executing the queue.

## Current stage

**Stage13E — Admin AI Operations / Review**

Candidate: `integration/stage13e-ai-operations @ e291c6bde3971845048bf8bcc4561b65d3c702e6`

Combined Gate: **PASS** — run `34394580893`.

Wider candidate matrix: **10 SUCCESS + 1 CI-workflow drift failure**.

Verification-only Draft PR: **#24 — MUST NOT BE MERGED**.

## Ordered queue

### EXEC-004A — Synchronize stale standalone Stage13E CI contract

**Priority: P1 · Status: ACTIVE / FIRST TASK**

Tracking: `CI-013E-009`.

Evidence:

- standalone Stage13E Admin run `34395034000`, job `102612508570`;
- API quality PASS;
- clean migrations PASS;
- failure only at `Verify Stage13E PostgreSQL contracts`;
- shell error: `unexpected EOF while looking for matching ')'`.

Root cause:

`.github/workflows/stage13e-ai-operations.yml` still reflects an older DB contract and shell syntax. Current migration/Combined workflow use four review constraints, including reject-note enforcement; the redundant latest-review index was intentionally removed.

Required implementation:

1. inspect `.github/workflows/stage13e-ai-operations.yml`;
2. compare with `.github/workflows/stage13e-integration.yml` and `database/migrations/0018_ai_admin_review.sql`;
3. fix shell quoting;
4. require all current four review constraints;
5. remove only the stale requirement for the intentionally removed redundant latest-review index;
6. preserve legitimate current index/contract assertions;
7. do not weaken any migration/test/product rule;
8. push to `integration/stage13e-ai-operations`.

Acceptance: standalone Stage13E Admin workflow PASS on real runner/PostgreSQL.

---

### EXEC-004B — Re-run full wider candidate matrix on exact new HEAD

**Priority: P1 · Status: BLOCKED BY EXEC-004A**

PR #24 should trigger existing `pull_request` workflows after candidate push.

Require SUCCESS on the new exact HEAD for at least:

- Stage9;
- Stage10;
- OCR;
- Stage11;
- Stage12;
- Stage13 Admin;
- Stage13D Content Ingestion;
- Stage13D Admin Chromium;
- Full Rebuild;
- Stage13E Frontend Prep;
- Stage13E Admin standalone;
- Combined Stage13E gate as applicable to the new candidate HEAD.

Any executed failure must be root-caused in the owning layer.

When fully green, capture run IDs and close PR #24 **unmerged**.

---

### EXEC-005 — Stage13E selective promotion assembly

**Priority: P1 · Status: BLOCKED BY EXEC-004B**

After wider candidate PASS:

1. live-check latest `main` and candidate;
2. re-run changed-file overlap comparison;
3. read `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`;
4. create `integration/stage13e-promotion` from latest `main`;
5. overlay only accepted manifest files;
6. reject unrelated/central-doc regressions or stale candidate history;
7. run Combined + wider matrix on exact promotion HEAD;
8. if `main` moves, rebuild/reverify from latest `main`.

---

### EXEC-005B — Stage13E closure to main

**Priority: P1 · Status: BLOCKED BY EXEC-005**

Only after promotion-head Combined + wider PASS:

- integrate Stage13E to `main`;
- update `PROJECT_RESUME_SNAPSHOT.md`, Status, Handoff, Queue, Continuity, Engineering Log/addendum;
- update `MASTER_REBUILD_ROADMAP.md`;
- update `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` and promote only actually proven rows to VERIFIED;
- update specialized Stage13E docs;
- post Stage13E Closure Report to Issue #16;
- retire/close temporary promotion verification artifacts.

---

### EXEC-006 — Stage13F Question Bank / Quiz Builder / Publish

**Priority: P1 · Status: BLOCKED BY STAGE13E CLOSURE**

Do not start before Stage13E closes unless Product Owner explicitly changes ordering.

Initial Stage13F scope includes `AI-011-005`, reviewed Question Bank persistence/provenance, editing, Draft→Review→Published, Quiz Builder/versioning/regeneration/export, DB/API/Admin/Chromium evidence.

---

### EXEC-007+ — Remaining roadmap

Follow `MASTER_REBUILD_ROADMAP.md` for Stage13G and later Student/Product/Hardening stages. Deployment work remains future-only until VPS.

## Known open boundaries

- `CI-013E-009` P1 — active closure blocker: standalone Stage13E workflow DB assertion drift.
- `CI-001` historical runner-allocation incident — not currently blocking; exact historical external cause NOT YET VERIFIED.
- `AI-011-005` P2 — Stage13F.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap NOT YET VERIFIED.

## Latest successful candidate evidence

Combined run `34394580893`: SUCCESS including Chromium 5/5.

Wider green runs before CI-013E-009 fix:

- Stage9 `34395033866`
- Stage10 `34395033929`
- OCR `34395033922`
- Stage11 `34395033876`
- Stage12 `34395033892`
- Stage13 Admin `34395033898`
- Stage13D Content `34395033978`
- Stage13D Admin UI `34395034010`
- Full Rebuild `34395033928`
- Stage13E Frontend Prep `34395033957`

Do not mark Stage13E VERIFIED until the exact-current candidate/promotion gates satisfy the ordered closure rules.
