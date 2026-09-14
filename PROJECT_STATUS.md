# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations/schema + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no merge or auto-merge authorized.  
**Live main checked:** `3053640cc5bb0699cfa7456cf646e8997f6aa81b`.  
**Architecture pivot baseline:** `302127c3223d00715f1d960f37c7d25044b6b20e`.  
**Latest verified Admin runtime gate before pivot:** Stage13G `34793896054` — Admin UI, backend, migrations/integration, Real API + PostgreSQL + Chromium SUCCESS.  
**Current stage:** Admin + Backend Architecture Rebuild — `AB-00 Architecture baseline and guardrails` — **ACTIVE**.

## Binding scope

The active architecture rebuild is now intentionally limited to:

- `apps/admin-web`
- `apps/api`
- `database/migrations`
- shared packages only where they serve Admin/API contracts or Admin design-system ownership
- Admin UX/UI architecture, routing, data flow, accessibility, RTL, responsive behavior, performance and visual consistency
- backend modular-monolith boundaries, PostgreSQL integrity, HTTP/application contracts and integration/security behavior

`apps/student-web` is **OUT OF SCOPE for implementation/refactor/design**. Student code/tests may be read or executed only as regression evidence when an API/security contract consumed by Student is affected. No Student migration work is authorized.

Canonical scoped workstream:

`docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`

Migration law:

`understand scenario → map API/database contracts → classify current owner → declare target owner → build replacement → verify → switch → delete old owner → exact-head gates → document`

Existing implementation is behavioral evidence, not the target architecture.

## Permanent rules

- PostgreSQL/API remain canonical business authority.
- backend remains a modular monolith; no microservice split is authorized.
- Admin `app` composes; feature owners own workflows/routes/API adapters/models/tests.
- no cross-feature private imports.
- `shared` never becomes a dumping ground.
- no new feature dumping into Admin `src/` root.
- route-level Admin features lazy-load by default once shell migration starts.
- design ownership is `brand tokens → primitives → components → patterns → feature compositions`.
- RTL/accessibility/responsive/reduced-motion are architecture requirements, not late patches.
- tests/validation/security contracts are never weakened to make migration pass.
- no permanent dual ownership: replacement ends with legacy deletion after parity.
- Student implementation remains untouched by this workstream.

## AB-00 detailed state

### AB-00.1 — Ownership & boundary map — **DONE**

Initial PA-00 ownership work remains useful for Admin/backend, but Student ownership is no longer an execution target. The scoped authority is now `ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`.

### AB-00.2 — Current-file migration inventory — **ACTIVE / FIRST BASELINE COMMITTED**

Created:

`docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`

The first-wave inventory defines exact current → target → classification → preserved contract → removal condition decisions for:

- Admin app/root composition;
- all Admin feature owners;
- backend app/config/db/error composition;
- backend business modules;
- explicit Student isolation.

Next inside AB-00.2: inspect concrete imports/dependencies and record cross-feature/internal-module violations before writing the automated guard.

### AB-00.3 — Automated architecture guard — PENDING

Add deterministic checks for protected Admin roots, shared→feature violations, cross-feature private imports and backend boundary rules after current exceptions are explicitly enumerated.

### AB-00.4 — Admin/backend baselines — PENDING

Record reproducible Admin bundle/runtime evidence and backend composition hotspots. Student bundle work is removed from this stage.

### AB-00.5 — Foundation readiness — PENDING

No structural migration starts until ownership inventory, dependency audit, guardrails, baseline evidence and exact-head CI are coherent.

## Scoped roadmap

- `AB-00` — architecture baseline + ownership/dependency guardrails — **ACTIVE**.
- `AB-01` — shared Admin foundation and stable API transport/error conventions.
- `AB-02` — thin Admin shell/router/providers/layouts/lazy boundaries.
- `AB-03` — Admin vertical-slice rebuild.
- `AB-04` — backend modular-monolith boundary standardization.
- `AB-05` — Admin design/interaction convergence.
- `AB-06` — Admin performance/delivery architecture.
- `AB-07` — legacy removal + hard dependency enforcement.
- `AB-08` — final Admin + Backend verification.

## Immediate next action

Continue **AB-00.2 only** by auditing actual Admin cross-feature/root imports and backend cross-module/internal dependencies. Do not start random file movement or cosmetic redesign before those dependency seams are mapped.

PR #52 stays Draft. Never auto-merge.