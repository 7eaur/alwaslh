# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–7A VERIFIED; Batch 8A Lesson Publication ownership relocation ACTIVE at first exact-head parity.**

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
- AD-ADMIN-026 — Students and Access Codes are separate task owners.
- AD-ADMIN-027 — obsolete Students/Access compatibility aliases are removed after focused parity.
- AD-ADMIN-028 — stage closure requires route ownership plus exact-head executable parity.
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; relocation must preserve behavior/contracts and removal waits until executable parity.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batches 1–7A VERIFIED; Batch 8A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum ownership relocation + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review ownership relocation + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A — Content ingestion ownership relocation + root seam removal — VERIFIED in this run. Frontend `34778944908` succeeded directly on seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`; documentation descendant `803e9b55c2496998358cf257a959bc4a6799a90f` carrying identical production code completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS. Superseded longer runs on the earlier code-head were cancellation-by-newer-commit effects, not assertion failures.

## 2026-09-13 — AR-09 Batch 8A — Lesson Publication ownership relocation

### 1. Source-of-truth refresh before mutation

Before any code change this run, the following were fetched and read:

1. live `main` = `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`;
2. Admin branch HEAD = `803e9b55c2496998358cf257a959bc4a6799a90f`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
6. recent branch commits;
7. Draft PR #52;
8. exact-head GitHub Actions.

The live-main advance belongs to the parallel Student workstream and was not modified.

### 2. Inherited blocker resolved first

Inherited Batch 7A had been left waiting for seam-removal parity. Fresh evidence showed the documentation HEAD `803e9b55...` fully green for every workflow it triggered:

- Admin AI `34779021476` — SUCCESS;
- Combined `34779021471` — SUCCESS;
- Stage13G `34779021457` — SUCCESS.

The underlying seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde` had Frontend `34778944908` — SUCCESS. The documentation descendants changed no production code. This closes Batch 7A as DONE / VERIFIED before any new cleanup work.

### 3. Fresh AR-09 inventory

The current `App.tsx`, root `apps/admin-web/src`, `admin/reviews`, `admin/content/ContentIngestionWorkspace.tsx`, historical AR-05 architecture decision and AI-authoring API tests were inspected.

Important observations:

- normal content route ownership is now correctly under `admin/content/`;
- `admin/content/ContentIngestionWorkspace.tsx` still imported `LessonPublicationPanel` from `../../LessonPublicationPanel` at app root;
- root `LessonPublicationPanel` implements only lesson-content publication state/actions and calls `lesson-content-api`;
- the panel is therefore unambiguously owned by Content and matches AD-ADMIN-029;
- a root `AdminAiAuthoringWorkspace` also exists, but AR-05 deliberately treats AI authoring as cross-feature contextual work rather than an established single feature owner; no parallel or speculative relocation was opened while the smaller Content ownership seam exists.

### 4. Contract review before mutation

`LessonPublicationPanel` behavior was read before moving:

- loads canonical lesson-content state from the server;
- keeps session-expiry handling unchanged;
- supports `submit_review`, `return_to_draft`, and `publish` through `transitionLessonContentPublication`;
- requires explicit browser confirmation before publish;
- disables publication when `reviewBlocked > 0`;
- renders server-derived draft/review/published counts;
- does not own PostgreSQL/business authority locally.

Existing `lesson-content-api`/integration coverage remains the test authority; no tests or backend validation were weakened.

### 5. Classification

- **KEEP:** publication behavior, confirmation, review-blocking rules, state counts, session handling, API/PostgreSQL authority and current tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** relocate real panel implementation under `admin/content/`.
- **REBUILD:** none.
- **REMOVE:** root compatibility re-export only after executable parity and caller proof.
- **NO CHANGE:** backend, migrations, API contract, auth/security, Student workstream and test strength.

Root cause is ownership drift, not a publication-rule defect.

### 6. Code mutation performed

#### Commit `333ed22db2a9708560845cfcc496a81fc18fd743`
`refactor(admin): add content-owned lesson publication panel`

Added:
- `apps/admin-web/src/admin/content/LessonPublicationPanel.tsx`

The implementation is behavior-equivalent to the former root panel; only relative import paths were adjusted to `../../admin-api` and `../../lesson-content-api`.

#### Commit `155759bf1cd9558a976ed1dca77dcce8186fff4e`
`refactor(admin): route lesson publication through content owner`

Changed root:
- `apps/admin-web/src/LessonPublicationPanel.tsx`

It is now only:
`export { LessonPublicationPanel } from "./admin/content/LessonPublicationPanel";`

This makes the Content feature the real implementation owner while deliberately retaining a compatibility seam until parity is executable.

No backend, migration, API-contract, Student, security or test file changed.

### 7. Exact-head verification state

Code-head `155759bf1cd9558a976ed1dca77dcce8186fff4e` triggered four gates:

- Frontend `34780494748` — PENDING at checkpoint;
- Admin AI `34780494751` — PENDING at checkpoint;
- Combined `34780494746` — PENDING at checkpoint;
- Stage13G `34780494761` — PENDING at checkpoint.

No failure was observed before documentation commits. Under the stage gate, Batch 8A remains ACTIVE and no root seam deletion/caller rewrite/AR-10 work may begin until these gates or a newer documentation-only equivalent are green.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–7A as DONE / VERIFIED; do not redo them.
3. Treat Batch 8A as ACTIVE at first relocation parity.
4. Current production code-head is `155759bf1cd9558a976ed1dca77dcce8186fff4e`.
5. Resolve Frontend `34780494748`, Admin AI `34780494751`, Combined `34780494746`, Stage13G `34780494761` first.
6. If green, prove callers of root `LessonPublicationPanel.tsx`, switch the Content implementation caller to local `./LessonPublicationPanel`, and verify exact-head parity before deleting the root re-export.
7. Do not open a parallel AI-authoring cleanup while Batch 8A is active.
8. After Batch 8A fully verifies, perform a fresh AR-09 inventory; close AR-09 only when no justified established-owner seam remains and final exact-head gates are green.
9. Only then begin AR-10.
10. Preserve Student isolation, backend/PostgreSQL authority and current test strength.
11. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-008` | P1 | Question Bank | giant owner | FIXED / AR-06 |
| `ADMIN-009` | P1 | Quiz Builder | giant owner | FIXED / AR-07 |
| `ADMIN-010` | P1 | Students + Access | duplicated giant workspace | FIXED / AR-08 |
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | ACTIVE / AR-09; Batch 7A fixed, Batch 8A parity pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
