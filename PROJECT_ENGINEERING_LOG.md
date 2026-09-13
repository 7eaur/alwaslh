# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–4A VERIFIED.**

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
- AR-09 — **ACTIVE**. Batch 1 VERIFIED; Batch 2 VERIFIED; Batch 3 VERIFIED; Batch 4A VERIFIED.
- AR-10 — NOT STARTED.

## AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — VERIFIED

Implementation chain: `adc85a6c21eece93560a85febdb2c37e64fe3727` → `6a6360f5c37f96984fe95907783a5ab6e4962557` → `20c128bb4a2b7166ad1d04d24e4672c93422d38e`. Unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` completed Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.

### Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED

Implementation chain: `6f4638deddc57e3c5c2e1185c57054e39f4fbc86` → `ec7ed60aa106767dddfb423e7c626d93a3fa2cea` → `d1bf7101135516c751c02d269a384015f9e3a132`. Exact-head Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS, including real API + PostgreSQL + Chromium.

### Batch 3 — Access-code reports feature ownership relocation — VERIFIED

Implementation chain: `d540eaab7fe1100e27904052c08d2aa05625c8a7` → `3b1eb104fef1ac70035dcd9875d9807f95bf2009`. Exact-head Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS. The final Stage13G Real API + PostgreSQL + Chromium job `103737110446` passed. No backend/migration/Student/test contract changed.

### Batch 4A — AI review route + implementation ownership relocation — VERIFIED

#### 1. State read before mutation

Before mutation this run:

- live `main` was refreshed to `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`;
- branch documentation HEAD was `f48b8f7f7dfa6763e06eb1173e9f99cf7ba97017`;
- `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` were read literally;
- recent commits and Draft PR #52 were inspected; PR #52 remained open + Draft with no merge;
- exact-head CI was reconciled before any new code change.

The inherited route-owner adapter code-head was `069858ace554e2be51e21b128e76e6089f26edef`. Its Frontend/Admin-AI checks had succeeded while Combined/Stage13G had been cancelled by later branch advancement, not by test failure. The later documentation HEAD `f48b8f7f7dfa6763e06eb1173e9f99cf7ba97017`, carrying the same production code, completed:

- Admin AI `34763965876` — SUCCESS;
- Combined `34763965874` — SUCCESS;
- Stage13G `34763965870` — SUCCESS.

Therefore the inherited adapter parity gate was resolved before implementation relocation. No parallel seam was started.

#### 2. Evidence and contracts inspected

The same AI-review seam was continued only. The following were inspected:

- root `apps/admin-web/src/AiOperationsPage.tsx` — the full orchestration implementation;
- `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` — the temporary feature-owned adapter;
- `/app/reviews/ai` route ownership in `App.tsx` — already routed through the Reviews feature owner;
- `AiReviewWorkspace` presentation boundary;
- AI job/detail/output/unit APIs, AI application capability and approved lesson/quiz application calls;
- polling, pagination, conflict handling, session-expiry handling, human-review submission and approved-output application behavior;
- executable Frontend, Admin AI, Combined and Stage13G coverage.

No migration, backend route/service, PostgreSQL rule, authentication/security boundary or Student surface required a change.

#### 3. Classification and decision

- **KEEP:** `/app/reviews/ai`, current polling/pagination UX, review/application semantics, conflict/session handling, API authority and tests.
- **IMPROVE:** make implementation ownership match the established Reviews route/feature ownership.
- **REFACTOR:** move the actual `AiOperationsPage` implementation under `src/admin/reviews/` with relative-import changes only.
- **REBUILD:** none.
- **REMOVE:** root `apps/admin-web/src/AiOperationsPage.tsx` after feature-owned executable parity.
- **NO CHANGE:** migrations, backend, PostgreSQL authority, auth/security, Student workstream and test strength.

Root cause addressed: the route already belonged to Reviews, but its actual orchestration implementation still lived at the app root behind a compatibility adapter.

#### 4. Changes made

1. Commit `27bf196e968a245fe436f2ac135ee2193d3ee021` — `refactor(admin): own AI review implementation`
   - replaced the temporary adapter at `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx` with the full implementation;
   - adjusted imports only from root-relative `./...` to feature-relative `../../...` paths;
   - preserved polling, pagination, job actions, review submission, lesson/quiz output application, conflict recovery and session expiry behavior;
   - deliberately retained root `apps/admin-web/src/AiOperationsPage.tsx` until executable parity completed.

2. Exact-head parity on `27bf196e968a245fe436f2ac135ee2193d3ee021` completed fully green:
   - Frontend `34765234243` — SUCCESS;
   - Admin AI `34765234255` — SUCCESS;
   - Combined `34765234286` — SUCCESS;
   - Stage13G `34765234274` — SUCCESS.

3. Commit `141e3e7912171c10356b8d32a268ddcbfda267f3` — `refactor(admin): remove AI review compatibility seam`
   - deleted root `apps/admin-web/src/AiOperationsPage.tsx` only after the feature implementation had proven parity;
   - no additional behavior or styling change was bundled into the deletion.

No test assertion was weakened or rewritten. No backend, migration or Student file was touched.

#### 5. Final exact-head verification

Exact final code-head: `141e3e7912171c10356b8d32a268ddcbfda267f3`.

- Frontend Preparation `34765398964` — SUCCESS.
- Admin AI Operations `34765398992` — SUCCESS.
- Combined Integration `34765398969` — SUCCESS.
- Stage13G Admin Operations `34765398946` — SUCCESS.

**Batch 4A is VERIFIED.** The feature-owned implementation is now canonical and the root compatibility seam is gone.

#### 6. Stage state and non-overlap decision

AR-09 remains ACTIVE. This run intentionally did not select another cleanup target after Batch 4A turned green. The next correct action is a fresh root-route ownership inventory, not an assumed Batch 5. If that inventory proves no real architecture-cleanup seam remains, AR-09 should proceed directly to its final exact-head verification and closure rather than creating unnecessary work. AR-10 remains blocked until that closure.

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
| `ADMIN-011` | P2 | Admin architecture | root-level route-owned components outside feature ownership | ACTIVE / AR-09; quiz metadata, lesson tools, access reports and AI review ownership fixed; fresh final inventory pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |

## Explicit resume point — AR-09 only

1. Fetch live `main`, current branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI before mutation.
2. Reconcile any active CI on the latest documentation HEAD first; do not start code in parallel.
3. Perform a fresh inventory of remaining root-level Admin route-owned surfaces, their route callers, tests, API/backend contracts and established feature owners.
4. If no justified cleanup seam remains, run the final AR-09 exact-head matrix and document AR-09 as DONE / VERIFIED.
5. If one or more genuine seams remain, choose only the smallest justified seam and apply the parity-first ownership rule; do not batch unrelated cleanup.
6. Preserve backend/PostgreSQL/Student authority and existing production tests.
7. AR-10 remains blocked until AR-09 closes.
8. PR #52 remains Draft; no merge or auto-merge.
