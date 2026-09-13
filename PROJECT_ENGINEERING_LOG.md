# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–6A VERIFIED; Batch 7A ACTIVE with its first Content-owned parity seam under exact-head verification.**

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
- AR-09 — **ACTIVE**. Batches 1, 2, 3, 4A, 5A and 6A VERIFIED; Batch 7A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review route + real implementation ownership relocation and root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.

## AR-09 Batch 7A — Content ingestion ownership relocation — ACTIVE

### 1. State read and reconciled before code changes

The run explicitly refreshed and read the live repository before mutation:

1. live `main` = `8d11cddb2cde510f233926d394434a384d480745`;
2. inherited branch/documentation HEAD = `c7230dd39ee0101b14d3df37a29c68e7c1631141`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
6. recent branch commits;
7. Draft PR #52 — open, Draft and unmerged;
8. inherited exact-head CI.

Inherited checkpoint `c7230dd39ee0101b14d3df37a29c68e7c1631141` was fully green:
- Admin AI `34771856670` — SUCCESS;
- Combined `34771856671` — SUCCESS;
- Stage13G `34771856708` — SUCCESS.

Therefore no unresolved inherited ACTIVE/RUNNING work blocked the next documented batch.

### 2. Contracts, callers and executable coverage inspected

The run inspected:
- `apps/admin-web/src/App.tsx` and confirmed `/app/content` directly imports root `ContentIngestionWorkspace`;
- the complete root `apps/admin-web/src/ContentIngestionWorkspace.tsx` orchestration;
- `apps/admin-web/src/content-ingestion-api.ts` server contracts;
- `apps/admin-web/src/LessonPublicationPanel.tsx` server-owned publication transitions;
- `apps/admin-web/e2e/content-ingestion.e2e.spec.mjs` Chromium coverage;
- the established `apps/admin-web/src/admin/content/` feature owner.

The implementation owns route-specific Content behavior: curriculum lookup, durable ingestion history/task loading, validation, task creation, ordered file upload, processing, lesson linking, archival and lesson publication composition. Its canonical data remains server-backed; no schema/backend change is required for this ownership cleanup.

The E2E contract already proves a mixed ordered PNG/PDF/PNG upload, processing, draft linking, review, publication, reload durability, archive visibility and a 390px no-overflow viewport. The test is retained unchanged.

### 3. Classification and decision

- **KEEP:** route behavior, file rules, ingestion lifecycle/history, task details, link/publication semantics, session handling, API/PostgreSQL authority and current executable tests.
- **IMPROVE:** implementation ownership under the established Content feature.
- **REFACTOR:** create a Content-owned page seam first, then switch routing/implementation only after exact-head parity.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after routed implementation parity becomes green.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

Root cause: `/app/content` remains a route-owned Admin workflow whose actual implementation still lives at app root even though `admin/content/` is the established feature boundary.

### 4. Small parity seam created

Commit `d184ec9efaa17a89710cd9e9798c8972cd1236fb` — `refactor(admin): add content ingestion feature seam` added:

- `apps/admin-web/src/admin/content/ContentIngestionPage.tsx`.

The page delegates to the existing root `ContentIngestionWorkspace` and forwards only `onSessionExpired`. It deliberately changes no route, behavior, API, backend, migration, Student code or assertion. The root implementation stays authoritative for this first parity checkpoint.

### 5. Exact-head evidence at checkpoint

On `d184ec9efaa17a89710cd9e9798c8972cd1236fb`:
- Frontend run `34774259547`, job `103769340092` — SUCCESS; lint, strict typecheck, unit tests and production build passed.
- Admin AI run `34774259574`, job `103769340020` — SUCCESS; API quality, clean PostgreSQL migrations/contracts, authorization/review controls and auth regressions passed.
- Combined run `34774259560`, job `103769340292` — **IN PROGRESS**. At inspection time API/Admin quality, clean migrations/database contract and Stage13E backend authority were already SUCCESS; wider Stage12/auth regressions and subsequent real Chromium phases remained active/pending.
- Stage13G run `34774259581` — **IN PROGRESS**. UI job `103769340158` and backend job `103769340279` were SUCCESS; Real API + PostgreSQL + Chromium job `103769483722` remained IN PROGRESS.

Because exact-head parity was still running, the run intentionally did **not** switch `App.tsx`, move the real implementation or delete the root seam. This prevents a parallel mutation while the current batch is ACTIVE.

### 6. Files changed in this checkpoint

- `apps/admin-web/src/admin/content/ContentIngestionPage.tsx` — new feature-owned compatibility page only.
- continuity documentation files — updated to record the active batch, exact SHA, CI IDs, classification and resume point.

No backend, database migration, auth/security, Student, API-contract or test file changed.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI.
2. Treat Batches 1–6A as DONE / VERIFIED and do not redo them.
3. Batch 7A is ACTIVE; current code-head under parity is `d184ec9efaa17a89710cd9e9798c8972cd1236fb`.
4. Resolve Combined `34774259560` and Stage13G `34774259581` first. Do not start parallel code while either remains ACTIVE/RUNNING.
5. If both are SUCCESS and no newer mutation supersedes the checkpoint, make only the next smallest change: switch `/app/content` in `App.tsx` from root `ContentIngestionWorkspace` to `admin/content/ContentIngestionPage`.
6. Run exact-head parity again. Keep root `ContentIngestionWorkspace.tsx` until routed parity is green.
7. Only after routed parity may the real implementation be relocated and the root seam considered for removal.
8. Preserve server/PostgreSQL authority, Student isolation and current test strength.
9. AR-10 remains blocked until fresh AR-09 inventory finds no justified seams and final exact-head verification closes AR-09.
10. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Batch 7A Content Ingestion seam established, exact-head parity running |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
