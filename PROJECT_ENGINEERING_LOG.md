# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-06 DONE / VERIFIED. AR-07 Quiz Builder ACTIVE; Batch 1 + Batch 2A + Batch 2B + Batch 2C + Batch 2D + Batch 2E VERIFIED; Batch 2F focused-create executable proof under exact-head verification.**

## Project and authority invariants

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- AI never auto-publishes Student content/questions.
- Human review remains mandatory where contracts require it.
- Published/revision/audit/provenance authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.

## Binding Admin architecture decisions

- **AD-ADMIN-001:** primary work is route-owned and deep-linkable.
- **AD-ADMIN-002:** Overview is attention-first.
- **AD-ADMIN-003:** Operations owns Health/Audit/Diagnostics.
- **AD-ADMIN-004:** technical IDs/provider/runtime/storage/hash/raw JSON are advanced-only.
- **AD-ADMIN-005:** content publication belongs to lesson content, not ingestion-task identity.
- **AD-ADMIN-006:** OCR review requires visible source evidence.
- **AD-ADMIN-007:** removing legacy/parity UI must not remove legitimate capability.
- **AD-ADMIN-008:** approved AI output is applied contextually under server authority.
- **AD-ADMIN-009:** `/app/questions/:questionId` owns canonical Question Bank entity detail/review/history.
- **AD-ADMIN-010:** Question Bank migration is parity-first.
- **AD-ADMIN-011:** question editing is entity-owned while revision authority stays server-side.
- **AD-ADMIN-012:** approved question regeneration is entity-owned while approval/provenance/idempotency stay server-side.
- **AD-ADMIN-013:** routed Question Bank ownership requires real PostgreSQL + Chromium proof.
- **AD-ADMIN-014:** manual question creation and approved-AI import are focused creation-flow responsibilities.
- **AD-ADMIN-015:** legacy workspaces are removed only after executable replacement parity.
- **AD-ADMIN-016:** Quiz Builder decomposition preserves server lifecycle, published-question revision references, immutable published snapshots and export constraints.
- **AD-ADMIN-017:** Quiz Builder list ownership is route-owned independently from entity/version/lifecycle management.
- **AD-ADMIN-018:** `/app/quizzes/:quizId` is the canonical quiz entity overview/deep link.
- **AD-ADMIN-019:** Quiz lifecycle and lifecycle-gated export belong to the canonical quiz entity route while API/PostgreSQL remain authoritative.
- **AD-ADMIN-020:** Quiz route ownership requires real Chromium list→entity/direct-deep-link evidence.
- **AD-ADMIN-021:** draft quiz version composition/editing belongs to `/app/quizzes/:quizId`; candidate eligibility/mutation validity stay server-owned.
- **AD-ADMIN-022:** test fixtures must obey canonical production contracts; backend validation is never weakened to make fixtures pass.
- **AD-ADMIN-023:** temporary Quiz Builder legacy ownership is limited to creation only once list/entity/version/lifecycle/export parity is executable; successful creation hands off to `/app/quizzes/:quizId`.
- **AD-ADMIN-024:** focused creation proof uses canonical detail contracts and stable semantic accessible names; browser tests must not depend on ambiguous partial accessible-name matches or brittle CSS selectors.

## Super Admin stage ledger

### AR-01 — DONE / VERIFIED
Route-driven shell/deep links and task-oriented navigation.

### AR-02 — DONE / VERIFIED
Attention-first Overview and Operations split.

### AR-03 — DONE / VERIFIED
Curriculum domain preserved; giant composition decomposed and browser-verified.

### AR-04 — DONE / VERIFIED
OCR/source evidence, lesson-owned publication and contextual authoring/export.

### AR-05 — DONE / VERIFIED
Content-first AI review and contextual application while server review/provenance/idempotency authority remained intact. Checkpoint `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.

### AR-06 — Question Bank — DONE / VERIFIED
Execution heads: route-owned detail `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`; list `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`; routed edit `43162f9b4f0468af96ae726f16054a868aff605a`; approved regeneration `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`; routed PostgreSQL/Chromium ownership `424bb1054fbd1a21991aa937be0f4338e08c7f09`; focused create/import `0d9b84a4c389ed0cef1a579e7772e2bde75a3cee`; legacy cleanup `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`. Final runs: Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.

## AR-07 — Quiz Builder — ACTIVE

### Batch 1 — focused list ownership — VERIFIED
Implementation `7746000748129a659e098e016d3ffbfd4d5ddc46`, `30d9443ed1c159440d38dc76db61686028c3d028`, `18607a1bf31392f9143a0e68c4531c972d4199d5`; Frontend `34741610234`, Admin AI `34741610225`, Combined `34741610238` — SUCCESS.

### Batch 2A — canonical entity/deep-link ownership — VERIFIED
Root cause was list navigation to `/app/quizzes/manage?quizId=...` while legacy workspace ignored the parameter. Established `/app/quizzes/:quizId`. Code-head `7b3d23812bafeea25d6c86a2b9a593d4dcf01cac`; Frontend `34742505009`, Admin AI `34742505020`, Combined `34742505015` — SUCCESS.

### Batch 2B — lifecycle/export ownership + routed Chromium — VERIFIED
Lifecycle/export moved into canonical entity under server authority; explicit route/deep-link proof added. Code `39f0d1ef961208b0697b1c8b3c80e352723fad82`, `53efb6951b6f30cc95e84646973d974d2fc4536c`; Frontend `34743947733`, Admin AI `34743947732`, Combined `34743947735` — SUCCESS.

### Batch 2C — entity-owned draft version composition/editing — VERIFIED
Code-head `f9180093617fb4974d1f8652a96b3d1f6fe77fad`; Frontend `34745428055`, Admin AI `34745428031`, Combined `34745428045` — SUCCESS.

### Batch 2D — real Chromium version-management parity — VERIFIED
Expanded browser flow initially exposed an invalid E2E Question Bank fixture. Backend validation was preserved; fixture was corrected to canonical MCQ contract. Final code-head `df73f9d136bc7d84179601a475627ce47e0d1c58`; Frontend `34746324618`, Admin AI `34746324625`, Combined `34746324634` — SUCCESS.

### Batch 2E — legacy workspace reduced to create-only seam — VERIFIED
Inventory proved list/detail/version/lifecycle/export were duplicate ownership and creation was the only legitimate unmigrated responsibility. `1081152e6e95a11684de26398661326f50e82bfe` reduced root `QuizBuilderWorkspace.tsx` to creation only and redirects successful creation to canonical entity. Frontend `34747560417`, Admin AI `34747560473`, Combined `34747560426` — SUCCESS.

### Batch 2F — focused create ownership + executable proof — ACTIVE

#### State received / continuity check

1. Re-read `PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` before mutation.
2. Read live `main` reference `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`, feature branch, Draft PR #52 and exact-head workflows. PR remained open/Draft; no merge.
3. Confirmed previous task had already created focused `apps/admin-web/src/admin/quizzes/QuizBuilderCreatePage.tsx`, wired the deliberate create route and added real Chromium create proof.
4. No Student/audit file, migration or backend business rule was changed in this batch.

#### Initial exact-head evidence

On `47bf6fb0afea89355e3cf6366a58289e97bda6fe`:
- Frontend `34748558483` — SUCCESS.
- Admin AI `34748558485` — SUCCESS.
- Combined `34748558507` — FAILED only in the newly added quiz-create Chromium flow; prior quality/PostgreSQL/backend/security gates were green.

#### Root-cause step 1 — canonical detail response contract

Inspection of `apps/admin-web/src/quiz-builder-api.ts` established canonical quiz detail shape `{ quiz, lessons, versions, events }`. The new E2E incorrectly asserted `payload.quiz.lessonIds` after creation.

Classification:
- **KEEP:** API/PostgreSQL/create validation and canonical entity design.
- **IMPROVE:** E2E assertion only.
- **NO CHANGE:** backend, migrations, lifecycle/export authority, Student workstream.

Commit `d94cff981e7bd89b137ecc37ba1451daee7c28f8` corrected the proof to assert the created lesson through `payload.lessons`.

Exact-head `d94cff...`:
- Frontend `34749369216` — SUCCESS.
- Admin AI `34749369205` — SUCCESS.
- Combined `34749369217` — FAILED only in the same create browser test.

#### Root-cause step 2 — accessible-name ambiguity

Decoded Combined job `103703032072` showed the create flow failed at `page.getByLabel("الصف").selectOption(...)`; partial matching resolved both page region `محتوى الصفحة` and the nested `<select>`.

Rather than introduce a brittle selector, commit `9167d2149e590e0919e558085a707ba6905b8d05` improved the focused create page itself by adding explicit `aria-label="الصف"` and `aria-label="المادة"` to the two selects.

Exact-head `9167d...`:
- Frontend `34749569158` — SUCCESS.
- Admin AI `34749569094` — SUCCESS.
- Combined `34749569104` — FAILED only in the create browser test.

Decoded Combined job `103703587222` proved all quality, clean PostgreSQL, backend authority/security and the first eight browser tests were green. The final create test still failed because Playwright `getByLabel("الصف")` uses partial matching by default; the explicit select label existed, but the region remained a partial match.

#### Root-cause step 3 — exact semantic locator

Commit `79e05cc9e1a219d3b11338bddf9798e3f4d9094d` changes only the browser proof to:
- `getByLabel("الصف", { exact: true })`
- `getByLabel("المادة", { exact: true })`

This keeps semantic accessibility selectors and removes the ambiguity without adding CSS/test-id coupling or weakening product/server behavior.

#### Verification state at this checkpoint

Exact-head workflows for `79e05cc...` are triggered and were queued/pending when this documentation checkpoint was prepared:
- Frontend `34749700272` — pending.
- Combined `34749700260` — pending.
- Admin AI — next task must reconcile the matching exact-head run from the current workflow list.

Batch 2F is **not VERIFIED yet**. AR-07 remains ACTIVE and AR-08 remains blocked.

## Explicit resume point for B / next Admin task

1. Re-read `PROJECT_STATUS.md`, this log and the Super Admin workstream before mutation.
2. Fetch current feature HEAD, live `main`, Draft PR #52 and exact-head CI.
3. Reconcile **all exact-head runs for `79e05cc9e1a219d3b11338bddf9798e3f4d9094d` first**. Do not begin code while any are queued/running.
4. If a run fails, fetch decoded job logs and repair the root cause only; do not weaken backend validation, lifecycle authority or test scope.
5. If Frontend + Admin AI + Combined are all green, inspect route/import ownership and confirm no active code depends on root `apps/admin-web/src/QuizBuilderWorkspace.tsx`.
6. Delete that legacy create seam only after focused create proof is green, then run the full exact-head matrix again.
7. Mark AR-07 DONE / VERIFIED only after the deletion exact-head is green and synchronize all three continuity docs plus PR #52.
8. Only after AR-07 closure begin AR-08 — Students + Access Codes.
9. Keep PR #52 Draft; no automatic merge.
10. Preserve parallel Student/audit work unchanged.

## Current audit/findings register

| ID | Severity | Area | Problem | Status |
|---|---:|---|---|---|
| `ADMIN-001` | P1 | Admin IA | no durable route ownership | FIXED / AR-01 |
| `ADMIN-002` | P1 | Overview | generic metrics vs attention | FIXED / AR-02 |
| `ADMIN-003` | P1 | Curriculum | giant composition | FIXED / AR-03 |
| `ADMIN-004` | P1 | Content publication | task-ID-coupled UI | FIXED / AR-04 |
| `ADMIN-005` | P1 | OCR review | missing visible evidence | FIXED / AR-04 |
| `ADMIN-006` | P1 | AI review | pipeline internals in normal UX | FIXED / AR-05 |
| `ADMIN-007` | P1 | AI authoring | manual internal-ID handoff | FIXED / AR-05 |
| `ADMIN-008` | P1 | Question Bank | giant list/create/edit/review/history owner | FIXED / AR-06 |
| `ADMIN-009` | P1 | Quiz Builder | giant list/create/detail/version/lifecycle/export owner | ACTIVE / list + entity + lifecycle/export + version ownership + browser parity + focused create implementation fixed; focused-create exact-head proof and legacy seam removal remain |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-07 Quiz Builder → AR-08 Students + Access Codes → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

No later AR stage starts before the current stage is verified and documented. PR #52 remains Draft.
