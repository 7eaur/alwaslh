# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–8A VERIFIED; Batch 9A AI review presentation ownership ACTIVE at adapter exact-head verification.**

## Project and authority invariants

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- Human review/publication/revision/provenance/audit authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.
- Tests represent canonical production contracts; backend validation is never weakened to satisfy fixtures.

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
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; relocation preserves behavior/contracts and removal waits until executable parity.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batches 1–8A VERIFIED; Batch 9A ACTIVE at adapter exact-head verification.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata ownership relocation — VERIFIED; checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review page ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum ownership + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review ownership + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A — Content ingestion ownership + root seam removal — VERIFIED. Frontend `34778944908` on seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`; documentation descendant `803e9b55c2496998358cf257a959bc4a6799a90f` completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.
- Batch 8A — Lesson Publication ownership + root seam removal — VERIFIED through documentation descendant `998ab1efa5ede52cead73b075d890542e1d5adba`; Admin AI `34783495895`, Combined `34783495898`, Stage13G `34783495896` — SUCCESS, with earlier caller-switch Frontend already successful.

## 2026-09-14 — AR-09 Batch 9A — AI review presentation ownership

### A. State inherited from task A / previous continuation

Before any mutation this run, repository evidence was re-read rather than relying on chat memory:

- live `main`: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — Student workstream; untouched;
- inherited Admin branch HEAD: `998ab1efa5ede52cead73b075d890542e1d5adba`;
- Draft PR #52: open, Draft, not merged, auto-merge null;
- AR-01..AR-08: DONE / VERIFIED;
- AR-09 Batches 1–7A: DONE / VERIFIED;
- Batch 8A: inherited as ACTIVE at root seam deletion verification;
- AR-10: NOT STARTED.

Required continuity files, recent feature-branch commits, PR #52 and exact-head Actions were inspected before mutation.

### B. Batch 8A blocker resolved

The seam-removal production code-head `3ad8750b65e357e13b99529d59a751172be9e26b` had code-head runs cancelled after documentation advances, not due to assertions. The latest documentation descendant `998ab1efa5ede52cead73b075d890542e1d5adba` carries the same production tree and completed:

- Admin AI `34783495895` — SUCCESS;
- Combined `34783495898` — SUCCESS;
- Stage13G `34783495896` — SUCCESS.

The caller-switch Frontend verification was already successful in the inherited record. No executable failure was found. Batch 8A was therefore closed as **DONE / VERIFIED** before any new production work.

### C. Fresh AR-09 inventory after Batch 8A closure

Inventory inspected:

- `apps/admin-web/src/App.tsx` route imports and active route owners;
- `apps/admin-web/src/admin/*` established feature directories;
- root `apps/admin-web/src` workspace surfaces;
- `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx`;
- `apps/admin-web/src/AiReviewWorkspace.tsx`.

Evidence:

- `/app/reviews/ai` is already owned by `admin/reviews/AiOperationsPage.tsx`;
- `AiOperationsPage.tsx` still imports `AiReviewWorkspace` via `../../AiReviewWorkspace` from the root;
- `AiReviewWorkspace` is presentation for the Reviews route and consumes review view models/APIs, so `admin/reviews/` is an established feature owner rather than a speculative new domain.

No backend/migration defect was found; the issue is dependency direction/ownership drift.

### D. Classification and decision

- **KEEP:** review/polling/apply behavior, API contracts, backend and PostgreSQL authority, auth/session handling, current tests.
- **IMPROVE:** Reviews feature dependency direction.
- **REFACTOR:** move `AiReviewWorkspace` behind the established `admin/reviews/` owner using parity-first adapter/caller-switch/relocation steps.
- **REBUILD:** none.
- **REMOVE:** none yet. Root implementation stays until caller-switch and relocation parity are green.
- **NO CHANGE:** Student workstream, backend validation, migrations and test strength.

### E. Production mutation performed

Commit `24b066cbfa846fc789da01929f495bdc267d96c0` — `refactor(admin): add reviews ai workspace owner seam`.

Added only:
- `apps/admin-web/src/admin/reviews/AiReviewWorkspace.tsx`

Content:
- parity adapter re-exporting `../../AiReviewWorkspace`.

No route or caller was switched yet. No behavior, API, backend, migration, auth, Student code or test changed.

### F. Tests / CI and current blocker

Exact-head matrix started on `24b066cbfa846fc789da01929f495bdc267d96c0`:

- Frontend `34784977628` — IN PROGRESS at checkpoint;
- Admin AI `34784977631` — IN PROGRESS at checkpoint;
- Combined `34784977632` — IN PROGRESS at checkpoint;
- Stage13G `34784977612` — IN PROGRESS at checkpoint.

Because this coherent Batch 9A adapter verification is active, no caller-switch, implementation relocation, seam deletion, second AR-09 cleanup track, AR-09 closure or AR-10 work was started.

Required documentation then advanced the branch from the production code-head. Any cancellation caused solely by those documentation commits must be reconciled against the newest documentation descendant carrying the identical production tree before further mutation.

### G. Files affected this run

Production:
- `apps/admin-web/src/admin/reviews/AiReviewWorkspace.tsx` — added parity adapter only.

Continuity:
- `PROJECT_STATUS.md` — Batch 8A closure and Batch 9A active checkpoint.
- `PROJECT_ENGINEERING_LOG.md` — this step-by-step record.
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` — checkpoint updated in this run.
- Draft PR #52 — current stage/checkpoint to be synchronized in this run.

### H. Stage state at handoff

- AR-09 Batch 8A — **DONE / VERIFIED**.
- AR-09 Batch 9A — **ACTIVE / ADAPTER CREATED / EXACT-HEAD VERIFICATION PENDING**.
- AR-09 — ACTIVE.
- AR-10 — NOT STARTED.
- Student workstream untouched.
- PR #52 remains Draft; no merge or auto-merge.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–8A as DONE / VERIFIED; do not redo them.
3. Treat Batch 9A as ACTIVE at adapter verification.
4. Production code-head to resolve first: `24b066cbfa846fc789da01929f495bdc267d96c0`.
5. Resolve Frontend `34784977628`, Admin AI `34784977631`, Combined `34784977632`, Stage13G `34784977612`; if documentation commits superseded them, reconcile the newest descendant carrying the identical production tree and record that explicitly.
6. Only after green adapter parity, change the import inside `admin/reviews/AiOperationsPage.tsx` from `../../AiReviewWorkspace` to `./AiReviewWorkspace` and nothing else.
7. Run a new exact-head matrix for the caller switch before relocating the real implementation or deleting root files.
8. Continue this same Batch 9A until relocation + root seam removal are independently verified; do not open another cleanup seam in parallel.
9. After Batch 9A closes, run a fresh AR-09 inventory; if no justified established-owner seam remains, run final AR-09 exact-head gates and close AR-09.
10. Only after formal AR-09 closure may AR-10 begin.
11. Preserve Student isolation, backend/PostgreSQL authority and current test strength.
12. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | ACTIVE / AR-09; Batch 9A adapter parity pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
