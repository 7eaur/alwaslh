# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged work and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 NOT STARTED.**

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
- **AD-ADMIN-028 — AR-08 closure requires both route ownership and exact-head executable parity; documentation-only commits do not replace verification of the code-head they describe.**

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — **DONE / VERIFIED**. Final code-head `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — NOT STARTED.
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

#### Verification performed in this closure run

Read before mutation:
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
- `.agents/skills/alwaslh-product-engineering/SKILL.md`;
- current `apps/admin-web/src/App.tsx`;
- Draft PR #52;
- live `main` and current feature branch metadata.

Fresh references:
- live `main`: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`;
- feature HEAD on arrival: `5aaddd7e2ddb88472c26f07642acb4b1a37db28f`;
- authoritative AR-08 code-head under verification: `20ed69e46d6693925be42464f0c9f85691cec203`;
- Draft PR #52: open, Draft, unmerged.

Reconciled exact-head runs for `20ed69e...`:
- Frontend `34754057319` — SUCCESS.
- Admin AI `34754057304` — SUCCESS.
- Combined `34754057322` — SUCCESS.
- Stage13G Admin Operations `34754057370` — SUCCESS.

Reconciled the later docs-only checkpoint `5aaddd7e...` to ensure there was no still-running newer work:
- Admin AI `34754224070` — SUCCESS.
- Combined `34754224068` — SUCCESS.
- Stage13G `34754224060` — SUCCESS.

Current-tree ownership inspection:
- `App.tsx` directly imports both `AdminStudentsPage` and `AdminAccessCodesPage`.
- `/app/students` directly renders `AdminStudentsPage`.
- `/app/access-codes` directly renders `AdminAccessCodesPage`.
- fetching `apps/admin-web/src/AdminStudentAccessWorkspace.tsx` at the current branch returns 404, confirming the obsolete alias file is absent.

Classification at closure:
- KEEP focused Students/Access Codes ownership and all existing server/API/PostgreSQL authority.
- KEEP Student/audit work untouched.
- IMPROVE/REFACTOR items were already completed in the verified code-head.
- REMOVE item was already completed by deleting the legacy alias.
- NO CHANGE to migrations/backend validation/auth/access/business rules.

No production code was changed in this closure run because there was no remaining root-cause defect after CI reconciliation and ownership inspection.

**Decision: AR-08 Batch 2 VERIFIED. AR-08 DONE / VERIFIED.**

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
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |

## Explicit resume point for task A — AR-09 only

1. Read all three continuity files and fetch live main/current branch/PR #52/current CI before mutation.
2. If CI from this documentation checkpoint is still ACTIVE/RUNNING, reconcile it first and do not start a parallel batch.
3. Start **AR-09 Cleanup / architecture enforcement** with an inventory of remaining root-level Admin workspaces, temporary aliases, obsolete routes, duplicated route ownership, dead compatibility shims and structural violations of `src/admin/<feature>/...` ownership.
4. Inspect real callers and tests before removing anything. Classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE.
5. Implement one small reviewable cleanup batch only; do not weaken tests or server authority and do not touch Student workstream unless a verified shared contract requires it.
6. Run applicable lint/typecheck/unit/integration/build/Chromium checks and require exact-head green before declaring a batch verified.
7. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
8. PR #52 remains Draft. No automatic merge.
