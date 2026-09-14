# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations/schema + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no merge or auto-merge authorized.  
**Live main checked:** `3053640cc5bb0699cfa7456cf646e8997f6aa81b`.  
**Architecture pivot baseline:** `302127c3223d00715f1d960f37c7d25044b6b20e`.  
**Latest verified Admin runtime gate before pivot:** Stage13G `34793896054` — Admin UI, backend, migrations/integration, Real API + PostgreSQL + Chromium SUCCESS.  
**Current stage:** Admin + Backend Architecture Rebuild — `AB-00 Architecture baseline and guardrails` — **ACTIVE**.

## Binding scope

Active implementation scope:

- `apps/admin-web`
- `apps/api`
- `database/migrations`
- shared packages only where they genuinely serve Admin/API contracts or Admin design-system ownership
- Admin product architecture + UX/UI + IA + routing + data flow + accessibility + RTL + responsive + performance
- backend modular-monolith boundaries + PostgreSQL integrity + HTTP/application contracts + integration/security behavior

Student frontend remains a separate workstream (`stage16/student-016i` / PR #57 at last reconciliation). `apps/student-web` is not refactored or redesigned here. Student tests/code may be used only as consumer regression evidence when a shared API/security contract is affected.

Canonical scoped workstream:

`docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`

Canonical Admin product/design rules:

`docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`

## Binding decision order

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

with:

- correct ownership before convenience;
- verified contracts before visual preservation.

Acceptance target:

**Functional + Clear + Easy + Predictable + Comfortable + Consistent + Fast + Maintainable + Professional**

Legacy Admin presentation is not a preservation contract. Preserve valid behavior/contracts, not presentation debt.

## Permanent architecture/product rules

- PostgreSQL/API remain canonical business authority.
- backend remains a modular monolith; no microservice split is authorized.
- Admin `app` composes; features own workflows/routes/API adapters/models/tests.
- one route/page has one dominant operator job and one primary feature owner.
- independent workflows are not hidden inside giant tabs/cards/accordions.
- Overview is attention-first, not duplicated navigation or decorative KPI cards.
- only authoritative real operational values may be shown; no fabricated metrics/trends/health scores.
- loading/empty/error/permission/conflict/unavailable/success states are first-class product states.
- backend error truth stays server-owned; Admin explains what happened, meaning, and next action.
- technical IDs/provider/runtime/storage/raw JSON details are progressive/advanced unless required for the decision.
- primary/secondary/destructive actions must be visually distinct and obvious.
- no cross-feature private imports.
- `shared` never becomes a dumping ground.
- no new feature dumping into Admin `src/` root.
- route-level Admin features lazy-load by default once shell migration starts.
- browser tests assert operator outcomes/contracts, not obsolete copy/selectors/DOM shape.
- one Admin shell owns global chrome/navigation.
- design ownership is `brand tokens → primitives → components → patterns → feature compositions`.
- RTL/accessibility/responsive/reduced-motion are architecture requirements, not late patches.
- tests/validation/security contracts are never weakened to make migration pass.
- no permanent dual ownership: replacement ends with legacy deletion after parity.

Migration law:

`understand operator job → map API/database contracts → classify owner → define target owner → design states/flow → build replacement → verify outcome → switch → delete old owner → exact-head gates → document`

## AB-00 detailed state

### AB-00.1 — Ownership & boundary map — DONE

Admin/backend ownership and target boundaries are established. Student frontend ownership remains external to this workstream.

### AB-00.2 — Current-file + dependency migration inventory — ACTIVE

Canonical inventory:

`docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`

The first baseline already covers:

- Admin app/root composition;
- Admin feature owners;
- backend app/config/db/error composition;
- backend business modules;
- Student frontend isolation.

Next: inspect actual Admin imports and backend cross-module/internal dependencies and record concrete violations/exceptions before architecture enforcement is written.

### AB-00.3 — Automated architecture guard — PENDING

Add deterministic placement/dependency checks after existing exceptions are explicitly inventoried.

### AB-00.4 — Admin/backend baselines — PENDING

Record reproducible Admin bundle/runtime evidence and backend composition hotspots. No Student bundle work here.

### AB-00.5 — Foundation readiness — PENDING

No structural migration starts until ownership inventory, dependency audit, guardrails, baselines and exact-head CI are coherent.

## Scoped roadmap

- `AB-00` — architecture baseline + ownership/dependency guardrails — **ACTIVE**.
- `AB-01` — Admin design-system/product-state foundation + stable API transport/error conventions.
- `AB-02` — thin Admin shell/router/providers/layouts/lazy boundaries + route focus/history.
- `AB-03` — Admin vertical-slice rebuild by operator workflow.
- `AB-04` — backend modular-monolith boundary standardization.
- `AB-05` — final Admin design/interaction convergence audit (rules apply during every earlier slice, not only here).
- `AB-06` — Admin performance/delivery validation and budgets.
- `AB-07` — legacy removal + hard dependency enforcement.
- `AB-08` — final Admin + Backend verification.

## Proven principles adopted from the independent Student workstream

Adopted as principles only, not implementation:

- preserve contracts, not presentation debt;
- clarity/ease/flow before visual polish;
- one shell owns global chrome;
- outcome-based browser acceptance;
- honest data only;
- failure/unavailable states are first-class;
- route-level code splitting;
- obvious interaction affordance;
- overview/summary surfaces do not duplicate navigation;
- restrained reduced-motion-safe animation.

## Immediate next action

Continue **AB-00.2 only**: audit concrete Admin cross-feature/root imports and backend cross-module/internal dependencies. The audit must also flag UX architecture debt that creates duplicated navigation, mixed primary jobs or technical-detail leakage, because those are now binding architecture findings rather than late design polish.

PR #52 stays Draft. Never auto-merge.