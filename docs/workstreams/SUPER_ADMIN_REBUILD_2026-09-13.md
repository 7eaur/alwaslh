# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE; Batch 1 + Batch 2A + Batch 2B + Batch 2C + Batch 2D + Batch 2E VERIFIED; Batch 2F focused-create exact-head verification pending.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` reference for this checkpoint: `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.

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
- AR-07 — Quiz Builder — ACTIVE.
- AR-08 — Students + Access Codes — NOT STARTED.
- AR-09 — Cleanup + architecture enforcement — NOT STARTED.
- AR-10 — A11y/RTL/performance/visual QA — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 4. Verified closure checkpoints

### AR-05
`cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank
Final code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS. Question Bank is split into focused list, entity detail/edit/review/history/regeneration and focused create/import; giant legacy workspace removed.

## 5. AR-07 — Quiz Builder checkpoint

### Batch 1 — focused list — VERIFIED
Implementation `7746000748129a659e098e016d3ffbfd4d5ddc46`, `30d9443ed1c159440d38dc76db61686028c3d028`, `18607a1bf31392f9143a0e68c4531c972d4199d5`; Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.

### Batch 2A — canonical entity/deep-link — VERIFIED
Established `/app/quizzes/:quizId`; code-head `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`; Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.

### Batch 2B — lifecycle/export + route Chromium — VERIFIED
Implementation `39f0d1ef961208b0697b1c8b3c80e352723fad82`, `53efb6951b6f30cc95e84646973d974d2fc4536c`; Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED
Code-head `f9180093617fb4974d1f8652a96b3d1f6fe77fad`; Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.

### Batch 2D — real Chromium version-management parity — VERIFIED
Canonical backend contracts were preserved when a new E2E fixture proved invalid. Final code-head `df73f9d136bc7d84179601a475627ce47e0d1c58`; Frontend `34746324618`, Admin AI `34746324625`, Combined `34746324634` — SUCCESS.

### Batch 2E — legacy workspace reduced to create-only seam — VERIFIED
Code-head `1081152e6e95a11684de26398661326f50e82bfe`; Frontend `34747560417`, Admin AI `34747560473`, Combined `34747560426` — SUCCESS. List/detail/version/lifecycle/export duplicates were removed from the legacy workspace; creation remained temporarily.

### Batch 2F — focused create ownership + browser proof — ACTIVE

#### State received

Focused creation already exists at `apps/admin-web/src/admin/quizzes/QuizBuilderCreatePage.tsx`, the create route is deliberate, and a real Chromium create→canonical-entity test was added. Root `QuizBuilderWorkspace.tsx` remains only until executable replacement proof is green.

#### Verification / root-cause chain

1. `47bf6fb0afea89355e3cf6366a58289e97bda6fe`
   - Frontend `34748558483` SUCCESS.
   - Admin AI `34748558485` SUCCESS.
   - Combined `34748558507` FAILED only in new create Chromium proof.

2. Inspection proved the E2E asserted a nonexistent `payload.quiz.lessonIds`; canonical quiz detail returns `{ quiz, lessons, versions, events }`.
   - `d94cff981e7bd89b137ecc37ba1451daee7c28f8` fixed the assertion to use `payload.lessons` only.
   - Frontend `34749369216` SUCCESS; Admin AI `34749369205` SUCCESS; Combined `34749369217` still failed create browser.

3. Decoded job `103703032072` proved `getByLabel("الصف")` was ambiguous between the route region and the select.
   - `9167d2149e590e0919e558085a707ba6905b8d05` added explicit accessible labels to the class/subject selects.
   - Frontend `34749569158` SUCCESS; Admin AI `34749569094` SUCCESS; Combined `34749569104` failed only because Playwright partial label matching still included the page region.
   - Decoded job `103703587222` confirmed all quality/PostgreSQL/backend/security gates and first eight Chromium tests were green.

4. `79e05cc9e1a219d3b11338bddf9798e3f4d9094d` changes only browser proof to exact semantic label matching for `الصف` and `المادة`.
   - Exact-head runs triggered; Frontend `34749700272` and Combined `34749700260` were pending at documentation checkpoint time; the matching Admin AI exact-head run must be reconciled from current workflow state.

No migrations, backend authority, lifecycle rules, Question Bank rules or Student files were changed in Batch 2F.

## 6. Explicit next handoff

1. Read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file first.
2. Fetch live `main`, current feature HEAD, PR #52 and exact-head CI.
3. Reconcile all exact-head workflows for `79e05cc9e1a219d3b11338bddf9798e3f4d9094d` before mutation. Do not start parallel code while any run is queued/running.
4. On failure, inspect decoded job logs and fix root cause only.
5. If Frontend + Admin AI + Combined are green, verify no route/import depends on root `QuizBuilderWorkspace.tsx`.
6. Delete that legacy seam only after focused create proof is green; rerun the full exact-head matrix.
7. Close AR-07 only after deletion exact-head green, synchronized docs and PR state.
8. Begin AR-08 only after AR-07 closure.
9. Keep PR #52 Draft; no automatic merge.
10. Preserve parallel Student/audit work.

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
