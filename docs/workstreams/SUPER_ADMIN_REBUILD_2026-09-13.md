# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-07 DONE / VERIFIED. AR-08 Students + Access Codes is NEXT / NOT STARTED.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` reference for this checkpoint: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## 0. Product decisions

The Super Admin is a task-oriented operational product, not a cosmetically polished generic dashboard.

- KEEP modular-monolith backend and server authority.
- KEEP publication, assessment, access, human-review, revision, provenance and audit boundaries.
- REBUILD Admin information architecture and route ownership.
- REBUILD giant workspaces incrementally into pages/features/workflows.
- MOVE AI authoring/application into contextual workflows.
- SPLIT individual Student support from bulk access-code management.
- FOLD Governance into Operations/Diagnostics.
- KEEP technical IDs/provider/runtime/storage/database details advanced-only.
- DO NOT break or overwrite the parallel Student/audit workstream.
- Test fixtures must satisfy canonical production contracts; backend validation is never weakened to make E2E fixtures pass.

## 1. Target information architecture

1. **نظرة عامة** — `/app`
2. **المحتوى التعليمي** — `/app/curriculum`, `/app/content`, `/app/reviews/...`
3. **الأسئلة والاختبارات** — `/app/questions`, `/app/quizzes`
4. **الطلاب والوصول** — `/app/students`, `/app/access-codes`
5. **التشغيل** — `/app/operations`, `/app/operations/audit`, `/app/operations/diagnostics`

Entity routes are workflow-owned. `/app/questions/:questionId` and `/app/quizzes/:quizId` are canonical entity deep links. Create/Edit/Review/History are not sidebar destinations.

## 2. Frontend architecture rules

Target boundaries:

```text
src/admin/
  shell/
  overview/
  curriculum/
  content/
  reviews/
  questions/
  quizzes/
  students/
  access-codes/
  operations/
  shared/
  api/
  view-models/
```

Rules:
- route owns page;
- feature owns workflow state;
- adapters translate server contracts;
- no component owns list + create + edit + review + history simultaneously;
- server state remains server-owned;
- deep links are mandatory;
- legacy workspaces remain only as temporary parity adapters while replacement ownership is executable and verified.

## 3. Roadmap

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED.
- AR-06 — Question Bank — DONE / VERIFIED.
- AR-07 — Quiz Builder — DONE / VERIFIED.
- AR-08 — Students + Access Codes — NEXT / NOT STARTED.
- AR-09 — Cleanup + architecture enforcement — NOT STARTED.
- AR-10 — A11y/RTL/performance/visual QA — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 4. Verified closure checkpoints

### AR-05
`cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank
Final code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS. Question Bank is split into focused list, entity detail/edit/review/history/regeneration and focused create/import; giant legacy workspace removed.

### AR-07 — Quiz Builder
Final code-head `c5bf37d4d72e341817970c7f95ff25bd771f8e17`: Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS. Combined job `103705843424` passed quality gates, clean PostgreSQL migrations/contracts, backend authority/security regressions and real Admin Chromium on the same code-head.

## 5. AR-07 — Quiz Builder closure

### Batch 1 — focused list — VERIFIED
Implementation `7746000748129a659e098e016d3ffbfd4d5ddc46`, `30d9443ed1c159440d38dc76db61686028c3d028`, `18607a1bf31392f9143a0e68c4531c972d4199d5`; Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.

### Batch 2A — canonical entity/deep-link — VERIFIED
Established `/app/quizzes/:quizId`; code-head `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`; Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.

### Batch 2B — lifecycle/export + route Chromium — VERIFIED
Implementation `39f0d1ef961208b0697b1c8b3c80e352723fad82`, `53efb6951b6f30cc95e84646973d974d2fc4536c`; Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED
Code-head `f9180093617fb4974d1f8652a96b3d1f6fe77fad`; Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.

### Batch 2D — real Chromium version-management parity — VERIFIED
Canonical backend contracts were preserved when an E2E fixture proved invalid. Final code-head `df73f9d136bc7d84179601a475627ce47e0d1c58`; Frontend `34746324618`, Admin AI `34746324625`, Combined `34746324634` — SUCCESS.

### Batch 2E — legacy workspace reduced to create-only seam — VERIFIED
Code-head `1081152e6e95a11684de26398661326f50e82bfe`; Frontend `34747560417`, Admin AI `34747560473`, Combined `34747560426` — SUCCESS. List/detail/version/lifecycle/export duplicates were removed; creation remained temporarily.

### Batch 2F — focused create + final legacy removal — VERIFIED

Focused creation lives at `apps/admin-web/src/admin/quizzes/QuizBuilderCreatePage.tsx` and hands successful creation to canonical `/app/quizzes/:quizId`.

Verification/root-cause history preserved server contracts:
- `d94cff981e7bd89b137ecc37ba1451daee7c28f8` corrected the create E2E to use canonical `{ quiz, lessons, versions, events }` response structure.
- `9167d2149e590e0919e558085a707ba6905b8d05` improved accessible labels for class/subject fields.
- `79e05cc9e1a219d3b11338bddf9798e3f4d9094d` made browser proof use exact accessible-name matching.
- Frontend `34749700272` on `79e05cc...` was SUCCESS; subsequent docs-only checkpoint `d4703ef8e6f2a29c06963bb578c885c595be9934` had Admin AI `34749771634` and Combined `34749771649` SUCCESS, establishing focused-create replacement parity before cleanup.

Final cleanup:
- `f62290645360b33e75943c305e69baf49ad4a3a7` routed `/app/quizzes/manage` directly to `QuizBuilderCreatePage`.
- `c5bf37d4d72e341817970c7f95ff25bd771f8e17` removed root `apps/admin-web/src/QuizBuilderWorkspace.tsx`, which had become only a one-line re-export seam.

Final exact-head on `c5bf37d...`:
- Frontend `34750417663` — SUCCESS.
- Admin AI `34750417642` — SUCCESS.
- Combined `34750417627` — SUCCESS.
- Combined job `103705843424` passed API/Admin quality, clean PostgreSQL migrations, DB contracts, backend authority/security regressions and real Admin Chromium.

Therefore **AR-07 is DONE / VERIFIED**. No backend lifecycle/validation, migration, Question Bank, or Student business contract was weakened or replaced.

## 6. Explicit next handoff — AR-08 only

1. Read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file first.
2. Fetch live `main`, current feature HEAD, PR #52 and exact-head CI. Reconcile any docs-only runs before code mutation if still active.
3. Begin **AR-08 — Students + Access Codes** only; AR-09 remains blocked.
4. Inspect the real `AdminStudentAccessWorkspace`, route callers, API/services/tests and PostgreSQL contracts before redesigning or splitting anything.
5. Preserve student/account/access-code authority: issuance, redemption, expiry, revocation, integrity/audit and permission rules remain server-owned.
6. Apply the target boundary from evidence: `/app/students` for individual student lookup/support/inspection; `/app/access-codes` for code inventory/issuance/bulk lifecycle. Do not keep the same giant workspace duplicated under both routes.
7. Implement a small coherent batch and require applicable lint/typecheck/unit/build, database/backend/security and real Chromium evidence before verification.
8. Keep PR #52 Draft; no automatic merge.
9. Preserve parallel Student/audit work.

## 7. Quality gate for every remaining stage

- lint;
- strict typecheck;
- unit tests;
- production build;
- clean PostgreSQL migrations/contracts where relevant;
- backend authority/security regressions;
- real Chromium flows;
- responsive/no-overflow evidence for changed surfaces;
- final exact-head matrix before stage closure.

Acceptance remains: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
