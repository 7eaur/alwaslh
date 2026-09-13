# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — AR-01 through AR-09 DONE / VERIFIED. AR-10 ACTIVE.**

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
- AR-09 — DONE / VERIFIED on `c755b209bfa67980afee0ed150bd43b3574b0a3b`; Frontend `34789114130`, Admin AI `34789114112`, Combined `34789114110`, Stage13G `34789114192` — SUCCESS.
- AR-10 — **ACTIVE — Batch 1 accessibility baseline under exact-head verification.**

## AR-09 closure summary

AR-09 completed route/feature ownership cleanup, including Quiz metadata, lesson authoring, Access Code reports, AI review, Curriculum, Content review/ingestion, Lesson Publication and AI Authoring ownership. Final root cleanup removed superseded `AdminGovernanceWorkspace.tsx`, `AdminOperationsWorkspace.tsx` and `AiOperationsWorkspace.tsx`. Production exact-head `c755b209bfa67980afee0ed150bd43b3574b0a3b` passed Frontend `34789114130`, Admin AI `34789114112`, Combined `34789114110`, Stage13G `34789114192`, including backend `103809925133`, Admin UI `103809925136`, and Real API + PostgreSQL + Chromium `103810061281`.

## 2026-09-14 — AR-10 Batch 1 accessibility baseline

### A. State inherited / verified before mutation

- Branch inherited documentation head: `fdc6a4ed2a3de8f7481b7522d1f14907a0018219`.
- Draft PR #52: open, Draft, unmerged; no auto-merge.
- Live `main` re-fetched as `3053640cc5bb0699cfa7456cf646e8997f6aa81b`; parallel Student/content work remains untouched.
- The inherited documentation exact-head gates were closed before AR-10 mutation:
  - Admin AI `34789354837` — SUCCESS;
  - Combined `34789354801` — SUCCESS;
  - Stage13G `34789354857` — SUCCESS.
- AR-01 through AR-09 therefore remain DONE / VERIFIED and were not reopened.

### B. AR-10 inspection and classification

Current Admin code/runtime contracts were inspected before change:
- `presentation-foundation.tsx` already provides `dir="rtl"`, a skip link, route-content landmark/focus target, and route-change focus management — **KEEP**.
- `App.tsx` already uses semantic `aside`/`nav` labels and route-owned surfaces — **KEEP**.
- `styles.css` already has responsive shell/card/grid breakpoints and logical inline properties — **KEEP / VERIFY**.
- Stage13G already provides real API + clean PostgreSQL + Chromium coverage — **KEEP / EXTEND only when evidence requires**.
- Global keyboard focus styling covered button/input/select/summary but omitted anchors, textarea and programmatic tabindex targets — **IMPROVE**.
- No reduced-motion fallback existed in Admin CSS — **IMPROVE**.
- No backend, migrations, API contract or Student change is justified for this batch — **KEEP**.
- REBUILD/REMOVE: none.

### C. Production change

Commit `1d3fd708bb913f4363721b17e4d78c90d02b8ddc` — `fix(admin): strengthen AR-10 accessibility baseline`.

Affected file only: `apps/admin-web/src/styles.css`.

Changes:
1. Replaced the narrow focus selector with a shared `:focus-visible` rule covering links, buttons, inputs, textarea, select, summary and `[tabindex]` targets.
2. Increased focus-ring alpha and offset so keyboard focus remains clearly visible on both light surfaces and dark navigation.
3. Added `@media (prefers-reduced-motion: reduce)` fallback that suppresses nonessential animation/transition duration and smooth scrolling for users requesting reduced motion.

Why: these are root accessibility baseline fixes, not visual redesign. They preserve current RTL/layout/business behavior while closing concrete keyboard/motion gaps.

No backend, migrations, API contracts, Student code or tests were changed.

### D. Exact-head verification now running

Production code-head: `1d3fd708bb913f4363721b17e4d78c90d02b8ddc`.

Runs started by the push:
- Frontend `34791103952` — ACTIVE at last check;
- Admin AI `34791103945` — ACTIVE/queued at last check;
- Combined `34791103997` — ACTIVE at last check;
- Stage13G `34791104004` — ACTIVE/queued at last check.

AR-10 Batch 1 is **NOT VERIFIED YET** until this exact-head matrix closes green.

### E. Explicit resume point for the next task

1. Re-fetch live `main`, Admin branch HEAD, continuity docs, PR #52 and Actions.
2. Do not start another production mutation while the current Batch 1 matrix or its documentation descendants are active.
3. Close Frontend `34791103952`, Admin AI `34791103945`, Combined `34791103997`, Stage13G `34791104004` for production head `1d3fd708bb913f4363721b17e4d78c90d02b8ddc`.
4. If green, mark Batch 1 VERIFIED and continue AR-10 only with evidence-driven keyboard/RTL/responsive/no-overflow/visual/runtime checks; add the smallest next fix or test only if a real gap is proven.
5. Preserve Student isolation, server/PostgreSQL authority and existing test strength.
6. AR-10 is COMPLETE only after accessibility + RTL + performance + visual/responsive QA are exact-head green.
7. Final verification starts only after AR-10 closure. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | FIXED / AR-09 |
| `ADMIN-012` | P2 | Admin accessibility | incomplete global keyboard focus coverage + no reduced-motion fallback | FIXED IN CODE / AR-10 Batch 1 — exact-head CI pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
