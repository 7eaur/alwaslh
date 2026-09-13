# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–8A VERIFIED; Batch 9A AI review presentation ownership ACTIVE at caller-switch exact-head verification.**

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
- AR-09 — **ACTIVE**. Batches 1–8A VERIFIED; Batch 9A ACTIVE at caller-switch exact-head verification.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata ownership relocation — VERIFIED; checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review page ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum ownership + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review ownership + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A — Content ingestion ownership + root seam removal — VERIFIED. Frontend `34778944908`; descendant `803e9b55c2496998358cf257a959bc4a6799a90f` completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.
- Batch 8A — Lesson Publication ownership + root seam removal — VERIFIED through descendant `998ab1efa5ede52cead73b075d890542e1d5adba`; Admin AI `34783495895`, Combined `34783495898`, Stage13G `34783495896` — SUCCESS, with earlier caller-switch Frontend successful.

## 2026-09-14 — AR-09 Batch 9A continuation — AI review presentation ownership

### A. Required pre-mutation read

Before any new code change, the continuation re-read repository state rather than relying on chat memory:

- live `main`: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — Student workstream advance; untouched;
- inherited Admin branch HEAD: `a62ca65d6430e68b076f5cebed3105d7f28df88a`;
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
- recent commits;
- Draft PR #52 — open, Draft, not merged, no auto-merge;
- exact-head/current Actions state.

The first incomplete item remained AR-09 Batch 9A. No parallel batch or AR-10 work was opened.

### B. Inherited blocker resolved before mutation

Inherited adapter production code-head:
- `24b066cbfa846fc789da01929f495bdc267d96c0` — added `apps/admin-web/src/admin/reviews/AiReviewWorkspace.tsx` as a parity adapter only.

CI reconciliation:
- Frontend `34784977628` — SUCCESS on the adapter code-head.
- Admin AI `34784977631` — CANCELLED because required continuity commits superseded the run; no test failure was recorded.
- newest documentation descendant `a62ca65d6430e68b076f5cebed3105d7f28df88a` carries the same production adapter tree and completed:
  - Admin AI `34785102555` — SUCCESS;
  - Combined `34785102557` — SUCCESS;
  - Stage13G `34785102562` — SUCCESS, including Real API + PostgreSQL + Chromium job `103799147288` — SUCCESS.

Decision: adapter parity was sufficiently proven without weakening any gate, so the previously documented next step could proceed.

### C. Contracts and ownership checked

`apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` was re-read before mutation. The only intended dependency-direction change was its import of `AiReviewWorkspace`.

Classification remains:
- **KEEP:** polling, review, apply-output behavior; API contracts; session handling; PostgreSQL/server authority; tests.
- **IMPROVE:** Reviews feature dependency direction.
- **REFACTOR:** caller points to established local Reviews owner first; real implementation relocation only after caller parity.
- **REBUILD:** none.
- **REMOVE:** nothing yet; root implementation remains required compatibility seam until later proof.
- **NO CHANGE:** backend, migrations, Student workstream, test strength.

### D. Production mutation performed

Commit `00b35eed478cd49da75784d61775ebb0f7b5df81` — `refactor(admin): route ai review through reviews owner`.

Changed exactly one behavior-neutral dependency:
- `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx`
  - from `../../AiReviewWorkspace`
  - to `./AiReviewWorkspace`

No route logic, UI behavior, API call, backend, migration, auth/session behavior, Student code or test changed.

### E. Exact-head verification after caller switch

Exact-head workflows triggered on `00b35eed478cd49da75784d61775ebb0f7b5df81`:
- Admin AI `34786308544` — IN PROGRESS at checkpoint;
- Combined `34786308488` — IN PROGRESS at checkpoint;
- Stage13G `34786308533` — IN PROGRESS at checkpoint;
- Frontend/Admin Web quality checks on the same exact-head check suite were also active.

Because these gates are still active, this continuation intentionally did **not** relocate the real implementation, delete the root seam, open another AR-09 cleanup seam, close AR-09, or start AR-10.

### F. Files changed this continuation

Production:
- `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` — local owner import only.

Continuity:
- `PROJECT_STATUS.md` — current caller-switch checkpoint and exact-head runs.
- `PROJECT_ENGINEERING_LOG.md` — this step-by-step record.
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` — current Batch 9A checkpoint.
- Draft PR #52 — synchronized with the current stage/checkpoint.

### G. Explicit resume point for task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–8A as DONE / VERIFIED; do not redo them.
3. Treat Batch 9A as ACTIVE at caller-switch verification.
4. Resolve exact production code-head `00b35eed478cd49da75784d61775ebb0f7b5df81` first: Admin AI `34786308544`, Combined `34786308488`, Stage13G `34786308533`, plus the Frontend/Admin Web quality checks on that commit.
5. If documentation commits supersede/cancel any run, reconcile only against a descendant carrying the identical production tree and record that explicitly.
6. Only after green caller-switch parity, relocate the real `AiReviewWorkspace` implementation into `admin/reviews/` while keeping the root file as a compatibility re-export seam.
7. Run a new exact-head matrix for relocation before deleting the root seam.
8. Delete the root seam only after proving no caller requires it and relocation parity is green; run exact-head parity again.
9. After Batch 9A closes, perform fresh AR-09 inventory; if no justified established-owner seam remains, run final AR-09 gates and close AR-09.
10. Start AR-10 only after formal AR-09 closure.
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
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | ACTIVE / AR-09; Batch 9A caller-switch parity pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
