# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged work and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE.**

## Project and authority invariants

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- Human review/publication/revision/provenance/audit authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.
- Tests must represent canonical production contracts; backend validation is never weakened to satisfy fixtures.

## Binding Admin architecture decisions

- AD-ADMIN-001 — primary work is route-owned and deep-linkable.
- AD-ADMIN-002 — Overview is attention-first.
- AD-ADMIN-003 — Operations owns Health/Audit/Diagnostics.
- AD-ADMIN-004 — technical IDs/provider/runtime/storage/hash/raw JSON are advanced-only.
- AD-ADMIN-005..015 — content/question publication, OCR evidence, contextual AI and Question Bank route ownership remain server-authoritative and parity-first.
- AD-ADMIN-016..025 — Quiz Builder decomposition preserves lifecycle/version/export authority and removes legacy seams only after executable parity.
- AD-ADMIN-026 — Students and Access Codes are separate task owners: `/app/students` owns individual account support/inspection while `/app/access-codes` owns code inventory, issuance and bulk lifecycle; server access/auth authority remains unchanged.
- AD-ADMIN-027 — once focused Access Codes parity is executable, `/app/access-codes` imports its focused owner directly and the root `AdminStudentAccessWorkspace` alias is removed; aliases are not retained as architecture once they serve no compatibility caller.
- AD-ADMIN-028 — AR-08 closure requires both route ownership and exact-head executable parity; documentation-only commits do not replace verification of the code-head they describe.
- **AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; ownership relocation must preserve behavior/contracts and removal waits until the route imports the feature-owned implementation.**

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. Final code-head `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batch 1 code-head `20c128bb4a2b7166ad1d04d24e4672c93422d38e`; Frontend `34756904661` SUCCESS, Admin AI `34756904665` RUNNING, Combined `34756904664` RUNNING, Stage13G `34756904668` RUNNING at checkpoint.
- AR-10 — NOT STARTED.

## AR-08 — Students + Access Codes

### Batch 1 — focused Students route — VERIFIED

Received problem: `/app/students` and `/app/access-codes` both rendered `AdminStudentAccessWorkspace`, so navigation separation was cosmetic rather than ownership separation.

Classification:
- KEEP API/PostgreSQL/auth/access authority and all Student-facing contracts.
- REFACTOR frontend ownership.
- REMOVE legacy giant owner only after executable replacement parity.

Implementation:
- `995203cf9344d5c4c1f3b41b208fdfe2d6bd3507` — added `admin/students/AdminStudentsPage.tsx`.
- `6d8ddf181c9eff6f909c11195eb9ecee4529c47e` — `/app/students` directly routed to focused Students owner.
- `dc8d3b4e44fac90cca23cc21d15e68e90101cbbb` — Chromium proves focused Students support behavior, no Access Codes tab and responsive 390px behavior.

Exact-head `dc8d3b4...`:
- Frontend `34751701107` — SUCCESS.
- Admin AI `34751701104` — SUCCESS.
- Combined `34751701154` — SUCCESS.

Decision: Batch 1 VERIFIED; AR-08 remained ACTIVE for Access Codes.

### Batch 2 — focused Access Codes ownership + final seam cleanup — VERIFIED

#### State inherited from task A

Before this closure run, the branch already contained:
- `5485a2cfb63ba2d664dce0cfa9556b73e43cb042` — focused `apps/admin-web/src/admin/access-codes/AdminAccessCodesPage.tsx`.
- `dbb393af86ae040f174c1dee9dad819e59adfccd` — old giant root workspace reduced to a one-line Access Codes alias.
- `bfac1372a2e6e5794e76c35ed1f75f3d10f1d80f` — real Chromium direct Access Codes parity for generation/filtering/non-destructive revoke and removal of legacy tab dependency.
- `cbbb7eca0d7b97aed0dd5caef8d7ef2bb4c1b795` — Stage13G verification enabled for the rebuild branch.
- `67981130b1234ea55932e93c136208835572992e`, `91ea77bc1c2222535a94ee288e695c452f665302`, `8f90e6fcfa5fac46f4744ef319397485c64aceff` — stale browser assertions corrected to match semantic UI/deterministic fixture reality without weakening backend rules.

Replacement parity before deleting the seam was green on `8f90e6fcfa5fac46f4744ef319397485c64aceff`:
- Frontend `34753821850` — SUCCESS.
- Admin AI `34753821821` — SUCCESS.
- Combined `34753821791` — SUCCESS.
- Stage13G `34753821827` — SUCCESS.

Final ownership cleanup already implemented:
- `7e950c0b4898ad27797e9c6312fe2b84c4f98959` — `App.tsx` imports/renders `AdminAccessCodesPage` directly for `/app/access-codes`.
- `20ed69e46d6693925be42464f0c9f85691cec203` — deleted obsolete `apps/admin-web/src/AdminStudentAccessWorkspace.tsx` alias.

The preceding documentation checkpoint `5aaddd7e2ddb88472c26f07642acb4b1a37db28f` deliberately left AR-08 ACTIVE because some exact-head workflows were still running.

#### Verification performed in closure

Exact-head `20ed69e...`:
- Frontend `34754057319` — SUCCESS.
- Admin AI `34754057304` — SUCCESS.
- Combined `34754057322` — SUCCESS.
- Stage13G Admin Operations `34754057370` — SUCCESS.

Current-tree ownership confirmed focused Students/Access Codes owners and no root `AdminStudentAccessWorkspace.tsx`.

**Decision: AR-08 DONE / VERIFIED.**

## AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — ACTIVE / exact-head CI in progress

#### Pre-mutation reconciliation

Read literally before mutation:
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
- current `apps/admin-web/src/App.tsx`;
- Draft PR #52;
- current root `apps/admin-web/src` inventory.

Fresh repository state:
- live `main`: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`;
- feature HEAD received: `a0ea9466becb1c2ba24971e2df8d7a46e8b531b1`;
- Draft PR #52: open, Draft, unmerged;
- AR-08 documentation/executable state reconciled green, so AR-09 was the first incomplete legal stage.

#### Inventory finding and decision

`App.tsx` still imported several root-level workspaces/components. The smallest unambiguous route-owned seam was `QuizMetadataPanel.tsx`: `/app/quizzes/metadata` used it directly while all primary Quiz Builder owners already lived under `apps/admin-web/src/admin/quizzes/`.

Classification before mutation:
- **KEEP:** route `/app/quizzes/metadata`, existing metadata UX, `fetchQuizzes`, `fetchQuiz`, `updateQuiz`, server status/lifecycle authority.
- **REFACTOR:** move `QuizMetadataPanel` to Quiz feature ownership.
- **REMOVE:** root-level seam after the route imports the focused owner.
- **NO CHANGE:** migrations/backend/PostgreSQL/auth/Student workstream and all quiz lifecycle/publication rules.

#### Implementation

1. `adc85a6c21eece93560a85febdb2c37e64fe3727` — created `apps/admin-web/src/admin/quizzes/QuizMetadataPanel.tsx` with behavior identical to the prior root component and only relative imports adjusted.
2. `6a6360f5c37f96984fe95907783a5ab6e4962557` — changed `apps/admin-web/src/App.tsx` to import the feature-owned panel for the existing metadata route.
3. `20c128bb4a2b7166ad1d04d24e4672c93422d38e` — deleted obsolete root `apps/admin-web/src/QuizMetadataPanel.tsx`.

No API or server code changed. No test was removed, skipped or relaxed.

#### Verification checkpoint

Exact code-head: `20c128bb4a2b7166ad1d04d24e4672c93422d38e`.

Workflow state captured before documentation mutation:
- Stage 13E Frontend Preparation `34756904661` — **SUCCESS**.
- Stage 13E Admin AI Operations `34756904665` — **RUNNING**.
- Stage 13E Combined Integration `34756904664` — **RUNNING**.
- Stage 13G Admin Operations `34756904668` — **RUNNING**.

Per the non-overlap rule, no additional AR-09 code seam was started while these exact-head workflows remained active. Batch 1 is therefore ACTIVE, not VERIFIED, at this checkpoint.

## Findings register

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
| `ADMIN-009` | P1 | Quiz Builder | giant list/create/detail/version/lifecycle/export owner | FIXED / AR-07 |
| `ADMIN-010` | P1 | Students + Access | duplicated giant workspace under two routes | FIXED / AR-08 |
| `ADMIN-011` | P2 | Admin architecture | root-level route-owned components remain outside feature ownership | ACTIVE / AR-09 |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |

## Explicit resume point for task B — AR-09 only

1. Fetch current feature HEAD before doing anything. Reconcile any commits newer than this documentation sequence instead of assuming exclusive ownership.
2. Reconcile exact code-head `20c128bb...` runs: Frontend `34756904661` is SUCCESS; Admin AI `34756904665`, Combined `34756904664`, Stage13G `34756904668` were RUNNING at checkpoint.
3. If any required run fails, inspect the exact failing job/log and fix the root cause without weakening tests or server authority.
4. If all become SUCCESS, mark AR-09 Batch 1 VERIFIED in `PROJECT_STATUS.md`, this log, the workstream and PR #52 before beginning another code cleanup.
5. Continue AR-09 by re-inventorying remaining root-level Admin owners/aliases/routes and checking real callers/tests. Choose one small safe cleanup seam; do not infer removability from filename/location alone.
6. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
7. PR #52 remains Draft. No merge or auto-merge.
