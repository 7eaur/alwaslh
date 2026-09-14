# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations/schema + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no merge or auto-merge authorized.  
**Live main checked:** `3053640cc5bb0699cfa7456cf646e8997f6aa81b` — parallel Student/content workstream; do not overwrite.  
**Architecture pivot baseline:** `302127c3223d00715f1d960f37c7d25044b6b20e`.  
**Latest verified Admin runtime gate before pivot:** Stage13G `34793896054` — Admin UI, backend, migrations/integration, Real API + PostgreSQL + Chromium SUCCESS.  
**Current stage:** Platform Architecture Rebuild — `PA-00 Architecture baseline and guardrails` — **ACTIVE**.

## Binding architecture direction

The former AR-10 “smallest polish only” rule is superseded. The platform is now being rebuilt structurally from first principles while preserving verified business/security/data contracts.

This is not patching and not a blind big-bang rewrite.

Migration law:

`understand scenario → map contracts → declare target owner → build/move/rebuild → verify → switch → delete old owner → exact-head gates → document`

Existing implementation is behavioral evidence, not the target architecture.

## Canonical architecture documents

- `docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`
- `docs/workstreams/PLATFORM_ARCHITECTURE_DECISIONS_2026-09-14.md`
- `docs/architecture/PLATFORM_OWNERSHIP_BOUNDARIES_2026-09-14.md`
- `docs/workstreams/PLATFORM_ARCHITECTURE_EXECUTION_RULES_2026-09-14.md`
- product/UX authority remains:
  - `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`
  - `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
  - `docs/product/DESIGN_SYSTEM_SPEC.md`
  - `docs/product/CONTENT_LANGUAGE_RULES.md`

## Permanent rules

- PostgreSQL/API remain canonical business authority.
- Auth/authorization/entitlement/publication/review/assessment/offline security remain server-owned.
- frontend `app` composes; feature owners own workflows/routes/API adapters/models/tests.
- no cross-feature private imports.
- `shared` never imports application features and never becomes a dumping ground.
- no new feature dumping into frontend `src/` roots.
- route-level features lazy-load by default once shell migration starts.
- backend remains a modular monolith; no microservice split is authorized.
- design ownership is `tokens → primitives → components → patterns → feature compositions`.
- RTL/accessibility/responsive/reduced-motion are architecture requirements, not later patches.
- tests/validation/security contracts are never weakened to make migration pass.
- no permanent dual ownership: replacement must end with legacy deletion after parity.

## PA-00 detailed state

### PA-00.1 — Ownership & boundary map — **DONE**

Commit `c7b221de2386a4e8fb6b92de3a781aecbc03e9da` established:

- application/package authority map;
- Admin feature ownership and target owners;
- Student feature ownership and target owners;
- backend module ownership;
- shared-package promotion rules;
- mandatory `KEEP / MOVE / STANDARDIZE / REBUILD / REMOVE` classification;
- root-fix migration protocol and legacy-removal condition.

Execution rules were then frozen in commit `04eb55a99e7b6be1e63d5d7a071b28cd23129d5b`.

### PA-00.2 — Current-file migration inventory — **NEXT**

Build exact `current → target → classification → contract → removal condition` inventory for first-wave Admin/Student/API ownership and identify duplicate/legacy seams.

### PA-00.3 — Automated architecture guard — PENDING

Add deterministic checks for protected roots, shared→feature/app dependency violations, and cross-feature private imports after the accepted baseline is explicit.

### PA-00.4 — Reproducible baselines — PENDING

Record Admin/Student bundle/runtime evidence and architecture hotspots from reproducible repository commands/workflows.

### PA-00.5 — Foundation readiness gate — PENDING

PA-01/PA-02 cannot start until ownership decisions, guardrails, baseline evidence and exact-head CI are coherent.

## Roadmap

- `PA-00` — Architecture baseline + ownership/dependency guardrails — **ACTIVE; PA-00.1 DONE**.
- `PA-01` — Shared design + proven shared contracts.
- `PA-02` — Thin frontend app shells/router/providers/layouts/lazy boundaries.
- `PA-03` — Admin vertical-slice migration.
- `PA-04` — Student vertical-slice migration reconciled against fresh live `main`.
- `PA-05` — Backend modular-monolith boundary standardization.
- `PA-06` — Design/interaction convergence.
- `PA-07` — Performance/delivery architecture.
- `PA-08` — Legacy removal + hard dependency enforcement.
- `PA-09` — Full platform verification.

## Immediate next action

Execute **PA-00.2 only**. Do not begin random file movement or visual changes. First produce the exact migration inventory from current code, then use it to build the automated guard and choose the first structural implementation slice.

PR #52 stays Draft. Never auto-merge.