# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged work and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-07 DONE / VERIFIED. AR-08 ACTIVE; focused Students VERIFIED; focused Access Codes + final legacy cleanup implemented and awaiting exact-head closure.**

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
- **AD-ADMIN-026:** Students and Access Codes are separate task owners: `/app/students` owns individual account support/inspection while `/app/access-codes` owns code inventory, issuance and bulk lifecycle; server access/auth authority remains unchanged.
- **AD-ADMIN-027:** once focused Access Codes parity is executable, `/app/access-codes` imports its focused owner directly and the root `AdminStudentAccessWorkspace` alias is removed; aliases are not retained as architecture once they serve no compatibility caller.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. Final `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. Final `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — ACTIVE.
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

### Batch 2 — focused Access Codes ownership and final seam cleanup — IMPLEMENTED / VERIFICATION ACTIVE

#### 1. State received

Before mutation, re-read:
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`.

Fresh references:
- live `main`: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`;
- feature HEAD on arrival: `8f90e6fcfa5fac46f4744ef319397485c64aceff`;
- Draft PR #52: open, Draft, unmerged.

The continuity files still described only AR-08 Batch 1, while the branch had advanced. Per the anti-parallel rule, no new implementation began until those newer commits and CI were inspected.

#### 2. Reconciled unrecorded commit chain

Compared the previous documented checkpoint against live feature HEAD and inspected the commit chain:

- `5485a2cfb63ba2d664dce0cfa9556b73e43cb042` — **REFACTOR**: created focused `apps/admin-web/src/admin/access-codes/AdminAccessCodesPage.tsx`.
- `dbb393af86ae040f174c1dee9dad819e59adfccd` — **REFACTOR**: reduced giant root `AdminStudentAccessWorkspace.tsx` to a one-line alias of the focused owner.
- `bfac1372a2e6e5794e76c35ed1f75f3d10f1d80f` — **IMPROVE/TEST**: real Chromium direct-route parity for Access Codes generation, filtering and non-destructive revoke; proves no old Students/Access Codes tab switch is required.
- `cbbb7eca0d7b97aed0dd5caef8d7ef2bb4c1b795` — **CI**: enabled Stage13G Admin Operations verification on the Super Admin rebuild branch.
- `67981130b1234ea55932e93c136208835572992e` — **TEST FIX**: aligned AI-authoring parity assertion with current review copy.
- `91ea77bc1c2222535a94ee288e695c452f665302` — **TEST FIX**: aligned export parity with the current semantic picker.
- `8f90e6fcfa5fac46f4744ef319397485c64aceff` — **TEST FIX**: aligned export parity count with deterministic fixture reality.

No migrations or backend authority code changed in this chain.

#### 3. Exact-head proof before cleanup

On exact HEAD `8f90e6fcfa5fac46f4744ef319397485c64aceff` all four applicable workflows were green:

- Frontend Preparation `34753821850` — SUCCESS.
- Admin AI Operations `34753821821` — SUCCESS.
- Combined Integration `34753821791` — SUCCESS.
- Stage13G Admin Operations `34753821827` — SUCCESS.

This established executable replacement parity before deleting the final legacy alias.

#### 4. Ownership inspection before mutation

Inspected `App.tsx`, `AdminStudentAccessWorkspace.tsx` and `admin/access-codes/AdminAccessCodesPage.tsx`.

Findings:
- `/app/students` already directly owned `AdminStudentsPage`.
- `/app/access-codes` still imported the root legacy name.
- the root file contained only:

`export { AdminAccessCodesPage as AdminStudentAccessWorkspace } from "./admin/access-codes/AdminAccessCodesPage";`

- the focused Access Codes owner uses existing API adapters for inventory, type/status/search/class filters, full/class generation, expiry/redemption display and non-destructive bulk revoke.

Classification for the cleanup:
- **KEEP:** focused `AdminAccessCodesPage`, focused `AdminStudentsPage`, `admin-student-access-api.ts`, server/PostgreSQL/auth authority, existing Student contracts.
- **IMPROVE:** make route ownership literal by importing `AdminAccessCodesPage` directly.
- **REMOVE:** obsolete root one-line alias.
- **NO CHANGE:** migrations, backend validation/security/access rules, Student/audit workstream.

#### 5. Mutation performed

- `7e950c0b4898ad27797e9c6312fe2b84c4f98959` — changed `App.tsx` to import and render `AdminAccessCodesPage` directly for `/app/access-codes`.
- `20ed69e46d6693925be42464f0c9f85691cec203` — deleted `apps/admin-web/src/AdminStudentAccessWorkspace.tsx` because it had no remaining independent behavior or compatibility caller.

No migration/backend/Student code was changed.

#### 6. Verification state at documentation time

Exact code-head: `20ed69e46d6693925be42464f0c9f85691cec203`.

Runs created on that exact head:
- Frontend `34754057319` — PENDING at last observation.
- Admin AI `34754057304` — SUCCESS.
- Combined `34754057322` — IN PROGRESS at last observation.
- Stage13G `34754057370` — IN PROGRESS at last observation.

Because all required workflows had not completed green yet, the correct state is:

**AR-08 Batch 2 = IMPLEMENTED / VERIFICATION ACTIVE. AR-08 = ACTIVE.**

No AR-09 work may start until this exact code-head is reconciled.

## Explicit resume point for B — close AR-08 only

1. Read the three continuity files first.
2. Fetch live `main`, branch HEAD, PR #52 and exact-head actions.
3. Reconcile `20ed69e...` runs: Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370`.
4. If all are SUCCESS, search current tree for any remaining `AdminStudentAccessWorkspace` import/reference and verify the two canonical focused routes remain direct owners.
5. If clean, mark AR-08 DONE / VERIFIED and update all three continuity files + Draft PR #52. Stop there; AR-09 begins only on the following clean handoff.
6. If any gate fails, inspect the actual failing job/log, repair root cause, and require a new exact-head green matrix. Do not weaken tests, validation or backend authority.
7. Keep PR #52 Draft; no automatic merge. Preserve Student/audit work unchanged.

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
| `ADMIN-010` | P1 | Students + Access | duplicated giant workspace under two routes | IMPLEMENTED / AR-08; final exact-head closure pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track |

## Remaining Super Admin sequence

`AR-08 exact-head closure → AR-09 Cleanup/architecture enforcement → AR-10 A11y/RTL/performance/visual QA → final release/merge-readiness verification`

PR #52 remains Draft. No automatic merge.