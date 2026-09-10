# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest continuation checkpoint. Code, migrations and executable CI evidence outrank prose.

Last synchronized: **2026-09-10 — Stage13F is promoted to main; Student Stage14 is CLOSED / VERIFIED; Stage13F→Student integration is active before Stage15.**

## Current execution model

- Repo: `7eaur/alwaslh`.
- Issue #16 = sole cross-track execution ledger.
- Track A: Backend/Admin/AI/Question Bank/Quiz Builder.
- Track B: Student Product on `parallel/stage14-student-product`.
- No duplicate durable authority between tracks.
- Production cutover remains future-only.

## Canonical checkpoints

- Stage13E runtime: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F canonical promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — CLOSED / VERIFIED / PROMOTED.
- Stage14 Student verified runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Student branch documentation HEAD before Stage13F integration: `9ccfe1e6c6468a6b63cc91bc44311b65bdb067f7`.

## Stage13F authority now available to Student

```text
Stage11 typed generation
→ Stage12 durable execution
→ Stage13E human approve
→ Stage13F Question Bank Draft/Review/Published
→ published immutable Question Bank revisions
→ immutable Quiz Builder versions/models
→ Stage15 Student assessment runtime
```

Verified Stage13F authority includes stable item identity, immutable revisions/history, exact provenance, latest-approved AI import, manual authoring, Draft→Review→Published, published-only quiz candidates, immutable quiz-version snapshots, same-item regeneration, direct-question delivery support and reviewed/published export.

Track A did **not** implement Student assessment runtime; Stage15 must consume these contracts without duplicating them.

## Stage14 Student closure

Verified runtime HEAD: `ac55f1435d232cadff334816407f1182125dda90`.

Evidence:

- Stage14 Student Product `34420993805` — SUCCESS.
- Stage14 Student API Regression `34420993840` — SUCCESS.
- Student lint/typecheck/Vitest `12/12`/build PASS.
- API regression Biome + strict typecheck + unit `46/46` + build PASS.
- clean PostgreSQL through `0018`, Student Curriculum + Reader integrations PASS.
- real Chromium `2/2` PASS.
- responsive/no-overflow 390×844, 768×1024, 1366×900 PASS.
- keyboard Reader entry + return focus, protected media/OCR/search, offline/reconnect PASS.

Stage14 is closed. PWA/offline learning authority remains Stage16 by sequence.

## Active integration checkpoint

`main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` contains verified Stage13F migrations/services/routes/Admin product and is the baseline Track B must integrate before Stage15.

The Student branch and main diverged from `5fdb23030c77cae9bff5f8c33d4be466427eb6e5`; the only material runtime overlap found before integration is `apps/api/src/app.ts`:

- keep Student `StudentReaderService` + Student Curriculum/Reader route registration;
- keep Track A Question Bank/Regeneration/Quiz services and routes;
- do not create a second assessment authority.

Project status/resume docs are reconciled from the newer main truth plus the verified Stage14 closure checkpoint.

## Stage15 entry rule

Stage15 is **READY only after the integrated Student HEAD passes same-head regression**.

Before Stage15 coding:

1. confirm Student branch contains `main @ 3aeca598...` in history;
2. pass Student + API + PostgreSQL + real Chromium gates on the integrated HEAD;
3. inspect actual `apps/api/src/question-bank/*`, `apps/api/src/quiz-builder/*`, migrations `0019`–`0022`, auth/roles and existing tests;
4. classify Stage15 surfaces KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
5. define only the missing Student assessment read/attempt/finalization contracts;
6. consume Published immutable IDs and deterministic scoring/provenance; no mocks, temporary persistence or browser-owned business authority.

Anything uninspected remains `NOT YET VERIFIED`.

## Deferred by sequence

- Stage16: manifest/service worker/account-device IndexedDB learning cache/entitlement lease/sync.
- Stage17: Notes/Favorites/Needs Review.
- Stage18: Student notifications.
- Stage19: progress/statistics/private achievements.
- deployment/production cutover: future-only.

## Mandatory startup for a replacement conversation

`README.md → DOCUMENTATION_INDEX.md → docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md → docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → docs/product/CURRENT_PRODUCT_OVERRIDES.md → Issue #16 latest body/comments → current main/branch/Actions → current-stage code/tests`.
