# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F promoted/integrated; Stage14 CLOSED / VERIFIED; Stage15 CLOSED / VERIFIED; Stage16 next by sequence.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared execution ledger: GitHub Issue `#16`.
- Operating model: **parallel two-track execution**.
  - Track A: Backend/Admin/AI/Question Bank/Quiz Builder and Stage13G follow-on.
  - Track B: Student Product on `parallel/stage14-student-product`.
- Production deployment/cutover remains future-only.
- Stage13E runtime authority: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F canonical promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — VERIFIED / CLOSED / PROMOTED.
- Stage14 Student runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F→Student integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- **Stage15 Student runtime: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.**
- Documentation commits newer than the runtime SHA do not replace runtime evidence.

## Verified Stage13F → Student Integration

Canonical Question Bank / Quiz Builder authority was merged into the Student branch through real two-parent merge commit:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

The resolution preserved both Student Curriculum/Reader wiring and Stage13F Question Bank/Quiz services/routes. No duplicate assessment authoring authority or history rewrite was introduced.

## Stage14 — CLOSED / VERIFIED

Verified Student outcomes:

- activation/login/recovery/device/session;
- canonical entitlements and seven-digit class redemption;
- server-authorized class → subject → ordered published lessons;
- protected Reader with publication/access/media/OCR checks;
- search/TTS capability and honest connectivity/session states;
- learning-first Arabic RTL shell;
- responsive and keyboard/focus behavior.

Stage14 intentionally does not claim Stage16 offline-learning/PWA authority.

## Stage15 — Practice / Assessment Engine — CLOSED / VERIFIED

Stage15 consumes canonical Stage13F published immutable quiz snapshots and activates the existing durable Student runtime rather than creating a second engine.

Implemented and verified:

- entitlement-filtered published quiz catalog;
- immutable version/model selection;
- durable Practice/Test session create/resume/restart/abandon;
- persisted question and option presentation order;
- direct-answer persistence through migration `0023_student_assessment_runtime.sql`;
- Student-safe payloads with no answer-key leakage before policy permits feedback/results;
- Practice immediate server feedback and answer locking after reveal;
- Test feedback/correctness withheld until finalize while allowing edits before finalize;
- server-side direct/choice scoring;
- idempotent finalization and durable attempt history;
- entitlement/publication recheck on active assessment access;
- future-scheduled lesson publication boundary aligned with Curriculum (`published_at <= now()`);
- reconnect behavior that exits stale assessment workspace when entitlement/resource becomes unavailable;
- learning-first UI order: Curriculum → Practice/Tests → Access;
- offline write blocking and server refresh on reconnect;
- responsive no-overflow checks at 390×844, 768×1024 and 1366×900.

### Exact same-head Stage15 closure evidence

Runtime:

`9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`

- Stage14 Student API Regression `34427900263` — **SUCCESS**
  - Biome **104 files**;
  - API strict typecheck PASS;
  - API unit **46/46 PASS**;
  - API build PASS.
- Stage15 Student Assessment `34427900257` — **SUCCESS**
  - clean PostgreSQL `0001`→`0023` PASS;
  - assessment + future-publication integration PASS;
  - real Chromium Stage15 **1/1 PASS**.
- Stage14 Student Product `34427900209` — **SUCCESS**
  - Student lint/typecheck PASS;
  - Student unit **15/15 PASS**;
  - production build PASS;
  - clean PostgreSQL `0001`→`0023` PASS;
  - Curriculum + Reader integration **2/2 PASS**;
  - full real Chromium suite **3/3 PASS**.

Production Student build evidence:

- JS **200.16 kB raw / 60.78 kB gzip**;
- CSS **30.84 kB raw / 5.71 kB gzip**;
- index **0.67 / 0.40 kB gzip**.

## Stage15 Findings / Resolution

- `STUDENT-015-QB-001` P1 — Stage13F dependency — **RESOLVED / VERIFIED**.
- `STUDENT-015-ASSESSMENT-001` P1 — Student-safe assessment runtime absent — **FIXED / VERIFIED**.
- `STUDENT-015-DIRECT-003` P1 — direct answers not representable in original runtime row — **FIXED / VERIFIED via 0023**.
- `STUDENT-015-PUBLISH-002` P1 — future-scheduled lesson could bypass some direct Student read paths — **FIXED / VERIFIED**.
- `STUDENT-015-ACCESS-004` P1 — stale assessment workspace after entitlement loss/reconnect — **FIXED / VERIFIED**.
- `STUDENT-015-UX-003` P2 — Practice/Test needed learning-first placement/policy clarity — **FIXED / VERIFIED**.
- `STUDENT-015-QA-005` P2 — full-suite selector ambiguity / stale locator race — **FIXED / VERIFIED**.
- `AI-012-019` P2 — live provider runtime remains `NOT YET VERIFIED`; not a blocker for already-published assessment consumption.

No open P0/P1 Student Stage14/15 implementation blocker remains.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 AI Contracts | VERIFIED |
| Stage12 Durable AI Execution | VERIFIED backend/runtime; live provider bootstrap `NOT YET VERIFIED` |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F Question Bank / Quiz Builder | **VERIFIED / CLOSED / PROMOTED + INTEGRATED TO STUDENT** |
| Stage13G Remaining Admin | Track A follow-on |
| Stage14 Student Product | **CLOSED / VERIFIED** |
| Stage15 Practice / Assessment | **CLOSED / VERIFIED** |
| Stage16 Offline / PWA | **NEXT / NOT YET STARTED** |
| Stage17 Personal Learning Data | REQUIRED after Stage16 |
| Stage18 Notifications | REQUIRED later |
| Stage19 Progress / Statistics / Achievements | REQUIRED later |
| Stage20–25 | REQUIRED by roadmap |
| Stage26–29 | future release/deployment track |

## Exact Next Work

1. re-read the Stage16 source-of-truth contract and latest Issue #16 after this closure;
2. inspect actual existing Service Worker / IndexedDB / sync/offline code before editing;
3. distinguish honest transient offline UI from durable offline-learning authority;
4. classify Stage16 areas KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
5. implement Stage16 incrementally only after its contracts are verified;
6. keep deployment deferred.
