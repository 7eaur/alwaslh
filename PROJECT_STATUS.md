# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F promoted to main; parallel Student Stage14 CLOSED / VERIFIED; Student integration with Stage13F main is the active checkpoint before Stage15.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared execution ledger: GitHub Issue `#16`.
- Current operating model: **parallel two-track execution**.
  - Track A: Backend/Admin/AI/Question Bank/Quiz Builder.
  - Track B: Student Product on `parallel/stage14-student-product`.
- Production deployment/cutover remains future-only.
- Stage13E runtime/application authority: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F canonical promoted main checkpoint: `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — CLOSED / VERIFIED / PROMOTED.
- Stage14 Student verified runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage14 exact runtime evidence:
  - Stage14 Student Product `34420993805` — SUCCESS.
  - Stage14 Student API Regression `34420993840` — SUCCESS.
- Student branch integration with promoted Stage13F is **IN PROGRESS**; Stage15 implementation must not begin until the integrated Student HEAD passes its same-head regression gates.

## Stage13F — VERIFIED / CLOSED / PROMOTED PRODUCT BOUNDARY

Stage13F provides the reviewed assessment-authoring authority between Stage13E AI review and Stage15 Student assessment consumption.

Verified flow:

```text
Stage11 typed generation/validation
→ Stage12 durable execution/output
→ Stage13E human approve
→ Stage13F Question Bank import as Draft
→ Question Bank Review → Published
→ Quiz Builder selects published immutable revisions
→ immutable quiz-version delivery snapshots
→ reviewed/published export
→ Stage15 Student consumption
```

Canonical Stage13F capabilities include stable Question Bank item UUIDs, immutable revisions/history, Draft→Review→Published authority, provenance, published-only Quiz Builder candidates, immutable quiz versions/models, stable regeneration, and reviewed/published export. The final Track A closure report is recorded in Issue #16 and executable evidence outranks this summary.

## Stage14 Student Product — CLOSED / VERIFIED

Verified Student outcomes:

- real activation/returning-login/recovery/device/session flows;
- canonical entitlement listing and seven-digit class redemption;
- server-authorized class → subject → ordered published lesson navigation;
- protected Lesson Reader with re-authorized media, size/SHA-256 integrity validation and no raw `storage_key` exposure;
- OCR exposure only from completed `approved` / `not_required` authority;
- in-lesson search and browser TTS capability state;
- explicit loading/error/empty/session-expired/offline/reconnect states;
- learning-first Arabic RTL shell;
- keyboard Reader entry and return-focus behavior;
- responsive/no-overflow evidence at 390×844, 768×1024 and 1366×900.

Stage14 offline behavior preserves only in-session context. It does **not** implement Stage16 offline-learning/cache authority.

## Stage14 Verification

Runtime HEAD: `ac55f1435d232cadff334816407f1182125dda90`.

- Student ESLint — PASS.
- strict Student TypeScript — PASS.
- Student Vitest — `12/12` PASS.
- Student build — PASS.
- API/Student runtime builds — PASS.
- clean PostgreSQL migrations through `0018` — PASS at Stage14 closure.
- Student Curriculum integration — PASS.
- Student Reader integration — PASS.
- real Chromium — `2/2` PASS.
- dedicated API regression: Biome 87 files, strict typecheck, API unit `46/46`, build — PASS.

The newly integrated Stage13F migrations `0019`–`0022` require fresh same-head Student regression evidence before Stage15 starts.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 AI Contracts | VERIFIED |
| Stage12 Durable AI Execution | VERIFIED backend/runtime; live provider bootstrap remains `NOT YET VERIFIED` |
| Stage13A–D | VERIFIED |
| Stage13E Admin AI Operations / Review | VERIFIED / CLOSED |
| Stage13F Question Bank / Quiz Builder / Publish | **VERIFIED / CLOSED / PROMOTED TO MAIN** |
| Stage13G Remaining Admin Product | Track A later work |
| Stage14 Student Product | **CLOSED / VERIFIED** |
| Stage15 Practice / Assessment | **READY AFTER VERIFIED STUDENT-BRANCH INTEGRATION; NOT STARTED** |
| Stage16 Offline / PWA | REQUIRED after Stage15 |
| Stage17 Personal Learning Data | REQUIRED after Stage16 |
| Stage18 Notifications | REQUIRED later |
| Stage19 Progress / Statistics / Achievements | REQUIRED later |
| Stage20–25 | REQUIRED by roadmap |
| Stage26–29 | future release/deployment track |

## Findings / Authority Boundaries

- `STUDENT-014-API-001` P1 — Student Curriculum read contract — FIXED / VERIFIED.
- `STUDENT-014-READER-001` P1 — protected Reader publication/media/OCR authority — FIXED / VERIFIED.
- `STUDENT-014-UX-002` P2 — learning-first shell/copy/a11y closure — FIXED / VERIFIED.
- `STUDENT-015-QB-001` P1 — Stage15 dependency on canonical Stage13F — **PROMOTION COMPLETE; integration verification active**.
- `AI-011-005` P2 — direct Question Bank/delivery authority — FIXED / VERIFIED in Stage13F; Student direct-answer runtime remains Stage15.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap remains OPEN / `NOT YET VERIFIED`.

## Exact Next Work

1. Complete a real history-preserving merge of `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` into `parallel/stage14-student-product`.
2. Preserve both Student Reader wiring and canonical Stage13F Question Bank/Quiz wiring in `apps/api/src/app.ts`.
3. Run Student lint/typecheck/unit/build, API regression, clean PostgreSQL migrations through Stage13F, Student Curriculum/Reader integrations and real Chromium on the exact integrated HEAD.
4. Synchronize `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_EXECUTION_QUEUE.md` and Student track status with the integration evidence.
5. Post an Issue #16 integration report.
6. Only then begin Stage15 discovery/implementation from canonical published Question Bank/Quiz contracts; no duplicate assessment authority.
