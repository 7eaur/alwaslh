# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE. Batches 1–9A VERIFIED. Batch 10A AI Authoring ownership ACTIVE at caller-switch exact-head verification.**

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
- AR-09 — **ACTIVE**. Batches 1–9A VERIFIED; Batch 10A ACTIVE at caller-switch verification.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata ownership relocation — VERIFIED; checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review page ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum ownership + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review ownership + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A — Content ingestion ownership + root seam removal — VERIFIED; Frontend `34778944908`; descendant `803e9b55c2496998358cf257a959bc4a6799a90f` completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.
- Batch 8A — Lesson Publication ownership + root seam removal — VERIFIED through descendant `998ab1efa5ede52cead73b075d890542e1d5adba`; Admin AI `34783495895`, Combined `34783495898`, Stage13G `34783495896` — SUCCESS.
- Batch 9A — AI Review presentation ownership + root seam removal — VERIFIED this continuation; details below.

## 2026-09-14 — AR-09 continuation

### A. Required pre-mutation read

Before changing code, the continuation re-read live `main`, current Admin branch HEAD, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, recent commits, Draft PR #52 and current/exact-head Actions. The first incomplete item was AR-09 Batch 9A. No parallel batch or AR-10 work was opened.

Live `main` checked: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`; Student workstream remained untouched.

### B. Batch 9A inherited CI resolved

The inherited AI Review caller-switch lineage was resolved first. Documentation descendant `03b55c97e4d0f02442d427480b51c2b1907d9231`, carrying the same caller-switch production tree, completed:
- Admin AI `34786403125` — SUCCESS;
- Combined `34786403117` — SUCCESS;
- Stage13G `34786403122` — SUCCESS, including Real API + PostgreSQL + Chromium job `103802833792`.

Only after this was the next Batch 9A step started.

### C. Batch 9A implementation relocation

Classification remained:
- **KEEP:** polling/review/apply behavior, API contracts, auth/session, server/PostgreSQL authority, tests.
- **IMPROVE:** Reviews feature dependency direction.
- **REFACTOR:** real presentation implementation into `admin/reviews/`, root compatibility seam retained until parity.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after caller proof and executable parity.

Commit `90ce84fb902ee9fe3e67c347c6ac40af9147dfa9` — `refactor(admin): relocate ai review presentation ownership`:
- real implementation moved to `apps/admin-web/src/admin/reviews/AiReviewWorkspace.tsx`;
- root `apps/admin-web/src/AiReviewWorkspace.tsx` became a compatibility re-export;
- only relative imports were adjusted;
- no behavior, backend, migration, API authority, auth/session, Student code or test changed.

Exact-head verification on `90ce84fb902ee9fe3e67c347c6ac40af9147dfa9`:
- Frontend `34786737784` — SUCCESS;
- Admin AI `34786737686` — SUCCESS;
- Combined `34786737704` — SUCCESS;
- Stage13G `34786737670` — SUCCESS, including Admin UI `103803590690`, backend `103803589049`, and Real API + PostgreSQL + Chromium `103803825737`.

### D. Batch 9A root seam removal

`App.tsx` and the local Reviews caller were re-read to prove runtime ownership no longer depended on the root seam. The root file was then removed in commit `8c6a42923f93087dd3edfdaee6987f967530aabf` — `refactor(admin): remove ai review root compatibility seam`.

Exact-head verification on `8c6a42923f93087dd3edfdaee6987f967530aabf`:
- Frontend `34786995492` / job `103804157082` — SUCCESS;
- Admin AI `34786995470` / job `103804157342` — SUCCESS;
- Combined `34786995525` / job `103804157588` — SUCCESS;
- Stage13G `34786995546` — SUCCESS, including Admin UI `103804157284`, backend `103804157412`, and Real API + PostgreSQL + Chromium `103804299795`.

Decision: **Batch 9A DONE / VERIFIED**.

### E. Fresh AR-09 inventory

A fresh root-level and `App.tsx` route inventory was performed rather than assuming AR-09 was complete. Shared root API/view-model/infrastructure files were not classified as cleanup solely because of location.

One justified route-owned seam remained:
- `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` directly backs `/app/tools/ai-authoring` while no `admin/ai-authoring/` owner existed.

Classification:
- **KEEP:** lesson/question/quiz AI authoring behavior, regenerate/archive/export flows, API contracts, session handling, server/PostgreSQL authority and tests.
- **IMPROVE:** route/feature ownership.
- **REFACTOR:** owner seam → route caller switch → implementation relocation → root seam removal, each behind executable parity.
- **REBUILD:** none.
- **REMOVE:** root seam only after proof.

This became **AR-09 Batch 10A**. No AR-10 work began.

### F. Batch 10A feature-owner seam

Commit `3d448c04bcfd9f65663044db1078a19095214cd4` — `refactor(admin): add ai authoring feature owner seam`:
- added `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx` as a behavior-neutral re-export of the current root implementation;
- route and implementation remained unchanged at this step.

Exact-head verification on `3d448c04bcfd9f65663044db1078a19095214cd4` completed fully green:
- Frontend `34787244260` — SUCCESS;
- Admin AI `34787244406` — SUCCESS;
- Combined `34787244263` — SUCCESS; real Admin Chromium suite succeeded;
- Stage13G `34787244262` — SUCCESS, with Admin UI `103804830646`, Admin operations backend `103804830758`, and Real API + PostgreSQL + Chromium `103804959684` all SUCCESS.

### G. Batch 10A caller switch

Only after seam parity was green, `apps/admin-web/src/App.tsx` was changed to import `AdminAiAuthoringWorkspace` from `./admin/ai-authoring/AdminAiAuthoringWorkspace` rather than the root file.

Commit: `8a5cbd680f74062acb47ec7244095e3881f6161c` — `refactor(admin): route ai authoring through feature owner`.

This is an ownership/dependency change only. Route path, props, UI behavior, APIs, backend, migrations, Student workstream and tests remain unchanged.

Caller-switch exact-head runs started:
- Frontend `34787423102` — IN PROGRESS at checkpoint; lint/typecheck/unit had progressed successfully and build was active at latest check;
- Admin AI `34787423098` — IN PROGRESS;
- Combined `34787423110` — IN PROGRESS;
- Stage13G `34787423158` — IN PROGRESS.

Because these gates remain active, no real AI Authoring implementation relocation, root seam deletion, new AR-09 seam, AR-09 closure, or AR-10 work was started.

### H. Files changed this continuation

Production:
- `apps/admin-web/src/admin/reviews/AiReviewWorkspace.tsx` — became real Reviews-owned implementation.
- `apps/admin-web/src/AiReviewWorkspace.tsx` — converted to re-export then removed after parity.
- `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx` — new feature-owner seam.
- `apps/admin-web/src/App.tsx` — AI Authoring import now targets feature owner.

Continuity:
- `PROJECT_STATUS.md` — current Batch 9A closure / Batch 10A checkpoint.
- `PROJECT_ENGINEERING_LOG.md` — this consolidated record.
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` — active checkpoint and explicit resume point.
- Draft PR #52 — must remain Draft and synchronized with this state.

### I. Explicit resume point for A/B

1. Re-fetch live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–9A as DONE / VERIFIED; do not redo them.
3. Treat Batch 10A as ACTIVE / CALLER SWITCHED / PARITY PENDING.
4. Resolve exact production code-head `8a5cbd680f74062acb47ec7244095e3881f6161c` first: Frontend `34787423102`, Admin AI `34787423098`, Combined `34787423110`, Stage13G `34787423158`.
5. If continuity commits supersede a run, reconcile only against a descendant carrying the identical production tree and document it.
6. If caller-switch parity is green, relocate the real root `AdminAiAuthoringWorkspace` implementation into `admin/ai-authoring/`, keep the root file as a compatibility re-export, and adjust only relative imports.
7. Run exact-head matrix again before any root deletion.
8. Prove no caller needs root, remove it, then run exact-head parity again.
9. Perform fresh AR-09 inventory. If no justified route-owned seam remains, run final AR-09 verification and close AR-09.
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
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | ACTIVE / AR-09; Batch 10A caller-switch parity pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
