# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE / Batch 1 + Batch 2A + Batch 2B + Batch 2C + Batch 2D + Batch 2E VERIFIED; focused create ownership next.**

Branch: `rebuild/super-admin-foundation`

Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`

Latest live `main` direct branch read for this checkpoint: `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## 0. Product decision summary

The Super Admin is being rebuilt as a task-oriented operational product, not cosmetically polished as a generic dashboard.

Binding decisions:
- KEEP the modular-monolith backend and server authority.
- KEEP publication, assessment, access, human-review, revision, provenance and audit boundaries.
- REBUILD Admin information architecture and route ownership.
- REBUILD giant workspaces incrementally into pages/features/workflows.
- MOVE AI authoring/application into contextual workflows.
- SPLIT individual Student support from bulk access-code management.
- FOLD Governance into Operations/Diagnostics.
- KEEP technical IDs/raw provider/runtime/storage/database details advanced-only.
- DO NOT break or overwrite the parallel Student/audit workstream.
- Test fixtures must satisfy canonical production contracts; backend validation must not be weakened to make E2E fixtures pass.

## 1. Target information architecture

Primary areas:
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
- legacy workspaces may remain only as temporary parity adapters while replacement ownership is executable and verified.

## 3. Roadmap

- **AR-01 — Architecture baseline + route-driven shell** — DONE / VERIFIED.
- **AR-02 — Overview + Operations split** — DONE / VERIFIED.
- **AR-03 — Curriculum** — DONE / VERIFIED.
- **AR-04 — Content + OCR** — DONE / VERIFIED.
- **AR-05 — Reviews + AI** — DONE / VERIFIED.
- **AR-06 — Question Bank** — DONE / VERIFIED.
- **AR-07 — Quiz Builder** — ACTIVE / Batch 1 + Batch 2A + Batch 2B + Batch 2C + Batch 2D + Batch 2E VERIFIED; focused create + legacy adapter removal remain.
- **AR-08 — Students + Access Codes** — NOT STARTED.
- **AR-09 — Cleanup + architecture enforcement** — NOT STARTED.
- **AR-10 — A11y/RTL/performance/visual QA** — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 4. Verified closure checkpoints

### AR-05
Exact checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`: Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank
Final exact code-head `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS. Question Bank is split into list, entity detail/edit/review/history/regeneration, and focused create/import. Legacy giant workspace is removed.

## 5. AR-07 — Quiz Builder execution checkpoint

### Batch 1 — focused list ownership — VERIFIED

`QuizBuilderWorkspace.tsx` originally combined list/create/detail/version/lifecycle/export while server APIs/tests already enforced the important business rules.

Implementation: `7746000748129a659e098e016d3ffbfd4d5ddc46`, `30d9443ed1c159440d38dc76db61686028c3d028`, `18607a1bf31392f9143a0e68c4531c972d4199d5`.
Verification: Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.

### Batch 2A — canonical quiz entity/deep-link ownership — VERIFIED

Root cause: the focused list had pointed at `/app/quizzes/manage?quizId=...` while the legacy workspace did not consume that query parameter.

Decision: establish `/app/quizzes/:quizId` as canonical entity ownership without changing API/PostgreSQL authority.

Implementation: `3099648db1b1cf95d1af3c1d579e8f7972748006`, `1c5707ae089487811401368e4c048720a7b121cf`, `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`.
Verification: Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.

### Batch 2B — entity lifecycle/export ownership + explicit Chromium route proof — VERIFIED

Decision: KEEP server lifecycle/published-revision/snapshot/export authority; REFACTOR lifecycle and export into `/app/quizzes/:quizId`; keep legacy adapter temporarily for create + version editing.

Implementation:
- `39f0d1ef961208b0697b1c8b3c80e352723fad82` — lifecycle/export ownership.
- `53efb6951b6f30cc95e84646973d974d2fc4536c` — explicit real Chromium routing/deep-link coverage.

Verification: Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED

Source reconciliation confirmed `/app/quizzes/:quizId`/`QuizBuilderDetailPage.tsx` is the canonical entity and existing API commands already cover candidates/add/replace/remove.

Implementation:
- `8c179f0554ebcb16476cd9d56c0795291ba0b811` — draft add/edit/delete version management plus published-candidate search/pagination in canonical entity.
- First Combined `34745301662` failed only on a stale browser assertion for retired legacy navigation; production UX was not reverted.
- `f9180093617fb4974d1f8652a96b3d1f6fe77fad` — browser evidence aligned with entity ownership.

Verification: Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.

### Batch 2D — explicit real Chromium version-management parity — VERIFIED

#### Continuity/source check

- Re-read the three continuity documents, feature branch, live `main`, PR #52 and previous exact-head CI before mutation.
- Previous docs checkpoint `7d0ac717bde4664985850ea549d34d76eefc1216` was reconciled first: Admin AI `34745650179` SUCCESS; Combined `34745650258` SUCCESS.
- Live `main` was `343ff1fd7b3d64d7e990b72606695365f520fa58`; independent Student work was not touched.

#### Executable parity implementation

`e783751a144630bf0da1f44acee5a6b4bcd5a575` expanded the real Chromium test to execute the entity-owned workflow end-to-end with real API/PostgreSQL fixture data:
- create real quiz;
- create two Question Bank questions and publish them;
- add a draft version;
- search/select published candidate and save;
- reopen and replace the selected question;
- delete the version;
- recreate version, submit for review;
- prove draft-only version mutation controls are unavailable outside draft.

Initial result:
- Frontend `34746160739` — SUCCESS.
- Admin AI `34746160733` — SUCCESS.
- Combined `34746160743` — FAILED only at the new Chromium flow after prior gates had passed.

#### Root-cause correction

The E2E fixture violated the canonical Question Bank MCQ contract by using three options and `answerText: null` while declaring `answerStatus = known`. The service contract requires four options and answer text matching the indexed correct option.

The backend was not weakened and no production UX was changed.

`df73f9d136bc7d84179601a475627ce47e0d1c58` corrected the fixture only.

Final exact-head verification:
- Frontend `34746324618` — **SUCCESS**.
- Admin AI `34746324625` — **SUCCESS**.
- Combined `34746324634` — **SUCCESS**, including PostgreSQL/contracts, backend authority/security regressions and expanded real Chromium.

Batch 2D is VERIFIED.

### Batch 2E — remove duplicate legacy ownership / create-only seam — VERIFIED

#### Continuity/source check

- Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file before mutation.
- Entered on feature documentation HEAD `bb782055e9a300212d49f2b1520e127076d0308f`.
- Reconciled prior documentation CI before code: Admin AI `34746570479` — SUCCESS; Combined `34746570478` — SUCCESS.
- Re-read Draft PR #52; it remained open and Draft.
- Live `main` advanced independently to `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`; no Student/audit file was rebased or modified.

#### Inventory and classification

Root `apps/admin-web/src/QuizBuilderWorkspace.tsx` still owned duplicate list/detail/version-management/lifecycle/export code even after canonical route ownership had already been proven in earlier batches.

- **KEEP:** PostgreSQL/API lifecycle, eligibility, snapshot and export authority.
- **KEEP temporarily:** quiz creation capability.
- **REMOVE:** duplicate list/detail/version/lifecycle/export ownership from the legacy workspace.
- **REFACTOR:** legacy workspace into a create-only seam that hands off to the canonical entity route after creation.
- **NO CHANGE:** migrations, backend domain validation, Student workstream.

#### Implementation

Exact code-head `1081152e6e95a11684de26398661326f50e82bfe`:
- reduced `QuizBuilderWorkspace.tsx` to curriculum-scoped quiz creation only;
- removed duplicate quiz list/detail/version/lifecycle/export state/actions/UI;
- after successful `createQuiz`, redirects to `/app/quizzes/:quizId` so all ongoing management belongs to `QuizBuilderDetailPage`.

#### Exact-head verification

- Frontend `34747560417` — **SUCCESS**.
- Admin AI `34747560473` — **SUCCESS**.
- Combined `34747560426` — **SUCCESS**, including clean PostgreSQL migrations/contracts, backend authority/security regressions and real Admin Chromium.

Batch 2E is VERIFIED. AR-07 remains ACTIVE only because quiz creation still lives in root `QuizBuilderWorkspace.tsx`; this temporary seam must receive focused feature ownership and executable browser proof before the legacy adapter is deleted.

## 6. Explicit next handoff — AR-07 focused create only

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this file.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Reconcile CI generated by this synchronized documentation checkpoint before mutation.
4. Move the create-only responsibility from root `QuizBuilderWorkspace.tsx` into a focused page under `src/admin/quizzes/` (for example `QuizBuilderCreatePage.tsx`) while preserving the deliberate create route/deep link.
5. Preserve canonical server validation and curriculum scoping; do not introduce client-side business authority.
6. Add explicit real Chromium proof for opening the create route, creating a quiz through the real Admin UI/API/PostgreSQL path, and landing on canonical `/app/quizzes/:quizId`.
7. Delete root `QuizBuilderWorkspace.tsx` only after the focused create flow is green and no route imports it.
8. Run Frontend + Admin AI + Combined on the exact code-head; then synchronize closure docs/PR and only then mark AR-07 DONE.
9. Do not start AR-08 before AR-07 is closed exact-head green.
10. Keep PR #52 Draft; no automatic merge.

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

Acceptance remains:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.