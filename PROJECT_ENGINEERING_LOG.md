# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–3 VERIFIED; Batch 4A ACTIVE.**

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
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; ownership relocation must preserve behavior/contracts and removal waits until the route imports the feature-owned implementation.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batch 1 VERIFIED; Batch 2 VERIFIED; Batch 3 VERIFIED; Batch 4A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — VERIFIED

Implementation chain: `adc85a6c21eece93560a85febdb2c37e64fe3727` → `6a6360f5c37f96984fe95907783a5ab6e4962557` → `20c128bb4a2b7166ad1d04d24e4672c93422d38e`. Unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` completed Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS. No backend/migration/Student authority changed.

### Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED

Implementation chain: `6f4638deddc57e3c5c2e1185c57054e39f4fbc86` → `ec7ed60aa106767dddfb423e7c626d93a3fa2cea` → `d1bf7101135516c751c02d269a384015f9e3a132`. Exact-head Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS, including real API + PostgreSQL + Chromium. No tests were weakened and no backend/migration/Student files changed.

### Batch 3 — Access-code reports feature ownership relocation — VERIFIED

#### 1. State read before mutation

At the start of this execution, the branch documentation HEAD was `7a247a407312ec9af00b5952118d449ab12fefff`. The three canonical continuity files were read literally before any mutation, recent commits and Draft PR #52 were inspected, and live `main` was refreshed to `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`.

The inherited code checkpoint was the route-owner adapter `6e7e43e17651d54413ccf6cc234f4e1457942a25`. Its previously incomplete gates were reconciled before continuing:
- Frontend `34761018736` — SUCCESS.
- Admin AI `34761018755` — SUCCESS.
- Combined `34761018762` — SUCCESS.
- Stage13G `34761018720` — CANCELLED due branch advancement, not a failing assertion.

The later documentation HEAD `7a247a407312ec9af00b5952118d449ab12fefff`, containing the same production adapter code, completed its Stage13G Real API + PostgreSQL + Chromium checks green. Therefore the adapter parity gate was resolved before the compatibility implementation was touched.

#### 2. Evidence and contracts inspected

The same access-code reports seam was continued; no parallel candidate was selected.

Files/contracts reviewed:
- `apps/admin-web/src/AdminReportsWorkspace.tsx` — full client-side reports implementation.
- `apps/admin-web/src/admin/access-codes/AdminAccessCodeReportsPage.tsx` — temporary feature-owned adapter.
- `/app/access-codes/reports` route ownership in `App.tsx` — already pointed at the feature-owned page.
- existing APIs: `fetchAdminCurriculum`, `fetchAllAccessCodesForExport`, `importFullAccessCodes`.
- existing CSV helpers and `admin-reports.e2e.spec.mjs` behavior: import validation, selected export, print selection, 390px no-overflow and session-expiry handling.

No migration, backend route/service, PostgreSQL authority, authentication/security rule or Student surface required a change.

#### 3. Classification and decision

- **KEEP:** route behavior, import/export/print UX, session handling, API/PostgreSQL authority, CSS behavior and real browser contract.
- **IMPROVE:** make implementation ownership match the already-established route ownership.
- **REFACTOR:** move the complete implementation into `src/admin/access-codes/AdminAccessCodeReportsPage.tsx` and adjust only relative imports.
- **REBUILD:** none.
- **REMOVE:** root `AdminReportsWorkspace.tsx` once the feature implementation was in place.
- **NO CHANGE:** migrations, backend, PostgreSQL constraints, auth/security, Student workstream and test strength.

Root cause addressed: route ownership had been moved but implementation ownership was still split through a root compatibility seam.

#### 4. Changes made

1. Commit `d540eaab7fe1100e27904052c08d2aa05625c8a7` — `refactor(admin): own access-code reports implementation`
   - replaced the one-line adapter in `apps/admin-web/src/admin/access-codes/AdminAccessCodeReportsPage.tsx` with the full reports implementation;
   - renamed the component export to `AdminAccessCodeReportsPage`;
   - changed only relative imports (`../../admin-api`, `../../admin-access-files-api`, `../../admin-student-access-api`, `../../access-code-files`, `../../admin-reports.css`);
   - preserved behavior and server authority.
2. Commit `3b1eb104fef1ac70035dcd9875d9807f95bf2009` — `refactor(admin): remove access-code reports compatibility seam`
   - deleted `apps/admin-web/src/AdminReportsWorkspace.tsx` after the feature owner contained the implementation;
   - kept `admin-reports.css` in place to avoid enlarging the batch without a functional reason.

No test assertion was weakened or rewritten. No Student file was touched.

#### 5. Exact-head verification

Exact code-head: `3b1eb104fef1ac70035dcd9875d9807f95bf2009`.

- Frontend Preparation `34762225733` — SUCCESS.
- Admin AI Operations `34762225735` — SUCCESS.
- Combined Integration `34762225728` — SUCCESS.
- Stage13G Admin Operations `34762225748` — SUCCESS.
  - Admin UI quality job `103736953704` — SUCCESS.
  - Admin operations backend job `103736953580` — SUCCESS, including lint, strict typecheck, unit tests, build, clean PostgreSQL migrations, database contract, Reports/Settings/Security/Audit integration and Access/Auth regression.
  - Real API + PostgreSQL + Chromium job `103737110446` — SUCCESS; real Admin Chromium suite completed green.

**Batch 3 is VERIFIED. AR-09 remains ACTIVE because remaining root route-owned candidates still require a fresh ownership/caller/test inventory before stage closure.**

#### 6. Non-overlap and next-stage decision

No second cleanup seam was started after the exact-head matrix turned green. This run stops code mutation at the reports seam and records the next inventory point. AR-10 remains blocked until AR-09 itself is DONE / VERIFIED on a final exact-head matrix.

### Batch 4A — AI review route feature ownership adapter — ACTIVE

#### 1. State inherited and reconciled

- Live `main` was refreshed to `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194` before mutation.
- Branch HEAD was `1077fe0c0074976831f1708a61e9372c81cc8386`.
- `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` were read literally.
- Draft PR #52 was inspected and remained open + Draft with no merge.
- The inherited documentation-head runs were reconciled before code work: Admin AI `34762502501` SUCCESS; Combined `34762502390` SUCCESS; Stage13G `34762502493` SUCCESS. Stage13G included successful Admin UI, backend, and Real API + PostgreSQL + Chromium jobs.

#### 2. Fresh inventory and classification

`App.tsx` still imported root `AiOperationsPage` for the route `/app/reviews/ai`, while Reviews is already an explicit route/feature owner in the rebuilt IA. `AiOperationsPage` is client orchestration over existing AI job/review/application APIs and preserves server-owned review/application authority.

Classification for this bounded seam:
- **KEEP:** `/app/reviews/ai`, review/application behavior, polling/pagination, conflict/session handling, API authority and existing executable tests.
- **IMPROVE:** align route ownership with feature ownership under `src/admin/reviews/`.
- **REFACTOR:** first establish a feature-owned adapter and route import; only after parity may the implementation move.
- **REBUILD:** none.
- **REMOVE:** root `AiOperationsPage.tsx` only after the feature-owned implementation is proven.
- **NO CHANGE:** migrations, backend, PostgreSQL authority, auth/security, Student workstream and test assertions.

#### 3. Changes made

1. `9427649f29e3bf69d2143dc4b12235652bcefc6b` — `refactor(admin): establish AI review route ownership`
   - added `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` as a temporary adapter re-exporting the current root implementation.
2. `069858ace554e2be51e21b128e76e6089f26edef` — `refactor(admin): route AI reviews through feature owner`
   - changed the `App.tsx` import so `/app/reviews/ai` now resolves through the feature-owned adapter.
   - no behavior, backend, migration, Student or test file changed.

#### 4. Verification state at checkpoint

Exact code-head: `069858ace554e2be51e21b128e76e6089f26edef`.

Runs started and were still active at the documentation checkpoint:
- Frontend Preparation `34763851152` — IN PROGRESS.
- Admin AI Operations `34763851138` — IN PROGRESS.
- Combined Integration `34763851147` — IN PROGRESS.
- Stage13G Admin Operations `34763851137` — IN PROGRESS.

Because CI is active, no implementation relocation, root deletion, second cleanup seam, or AR-10 work was started.

#### 5. Explicit continuation

1. Reconcile all four runs for `069858ace554e2be51e21b128e76e6089f26edef` first.
2. If fully green, continue the same seam only by moving the actual `AiOperationsPage` implementation into `src/admin/reviews/AiOperationsPage.tsx`, adjusting relative imports only; retain `AiReviewWorkspace` and API contracts unchanged.
3. Remove root `AiOperationsPage.tsx` only after executable parity of the feature implementation.
4. If any gate fails, fix the root cause without weakening production contracts or tests.
5. AR-10 remains blocked.

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
| `ADMIN-011` | P2 | Admin architecture | root-level route-owned components remain outside feature ownership | ACTIVE / AR-09; reports fixed, AI review route adapter active |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |

## Explicit resume point — AR-09 Batch 4A only

1. Fetch live `main`, current feature HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI before mutation.
2. Reconcile Frontend `34763851152`, Admin AI `34763851138`, Combined `34763851147`, Stage13G `34763851137` for code-head `069858ace554e2be51e21b128e76e6089f26edef`.
3. Continue only the AI review ownership seam if all are green; do not select another candidate yet.
4. Preserve API/PostgreSQL/Student authority and current review/application behavior.
5. PR #52 remains Draft; no merge or auto-merge.
