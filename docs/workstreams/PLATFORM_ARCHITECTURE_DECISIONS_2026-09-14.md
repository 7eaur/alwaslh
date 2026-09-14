# Platform Architecture Decisions — 2026-09-14

Status: **ACTIVE / BINDING for PA-00 onward**

This document codifies architecture decisions for the platform rebuild. It does not replace product/UX authorities; it connects engineering structure to them.

## Existing authorities that remain binding

The architecture rebuild **reuses rather than duplicates** the existing UX/UI refoundation work:

- `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md` — source-backed Student/Admin UX findings and classification.
- `docs/product/TARGET_INFORMATION_ARCHITECTURE.md` — binding product screen/route boundaries and user-job hierarchy.
- `docs/product/DESIGN_SYSTEM_SPEC.md` — canonical design-system behavior, tokens, components, RTL/accessibility/responsive rules.
- `docs/product/CONTENT_LANGUAGE_RULES.md` — user-facing language and technical-copy boundaries.

The active engineering roadmap is:

- `docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`.

When structure and UX terminology differ, repository/runtime evidence wins first, then current Product Owner overrides, then these active architecture/product authorities.

# ADR-PA-001 — Modular monolith remains the backend architecture

**Status:** ACCEPTED

The API remains one Fastify application backed by PostgreSQL. Current business-domain grouping is valuable and there is no evidence justifying microservices.

Target change is internal module consistency and dependency direction, not network/service fragmentation.

**Consequences:**

- one deployable API remains valid;
- modules gain explicit internal/public boundaries;
- cross-module calls are application contracts, not arbitrary imports into internals;
- database transactions remain easy to coordinate where a workflow genuinely crosses domains.

# ADR-PA-002 — Frontends are feature-owned, app roots are composition-only

**Status:** ACCEPTED

`App.tsx`/router/bootstrap layers may compose providers, layouts, auth boundary and feature routes, but they may not accumulate feature workflows, API calls or feature-specific UI logic.

Target shape:

```text
app/ → features/ → shared/
```

Dependency direction:

- `app` may import feature public contracts;
- a feature may import `shared`;
- `shared` may never import a feature;
- one feature may not import another feature's private folders.

# ADR-PA-003 — Product route/IA authority is user-job based

**Status:** ACCEPTED

Route/screen ownership follows `TARGET_INFORMATION_ARCHITECTURE.md`, not backend table/module names.

Admin major workflows and Student learning tasks receive real route ownership. Tabs/dialogs are reserved for bounded subviews/actions, matching existing IA rules.

# ADR-PA-004 — Route-level code splitting is the default

**Status:** ACCEPTED

Major route features are lazy-loaded unless they are required for the critical initial path.

Reason: Admin verified build currently loads a main JS chunk around `968.58 kB` minified / `193.92 kB` gzip because large route surfaces are eagerly imported.

Do not solve this by merely increasing `chunkSizeWarningLimit`.

# ADR-PA-005 — Canonical business state stays server-owned

**Status:** ACCEPTED

Frontend state is divided into:

- server state — retrieved/mutated through feature API boundaries;
- app state — session/connectivity/theme-like concerns only where truly global;
- local UI state — forms, open/closed controls, local selection and view state;
- derived view state — calculated presentation data only.

No browser global store may become an alternative authority for permissions, publication, entitlement, assessment finalization, review or audit.

# ADR-PA-006 — Contracts are explicit at boundaries, shared only when truly shared

**Status:** ACCEPTED

Request/response validation belongs at system boundaries. Domain/validation packages are expanded only for contracts genuinely shared across multiple owners.

Feature-private DTO/view-model types remain feature-private.

This prevents `packages/domain`, `packages/validation` or `shared/` from becoming generic dumping grounds.

# ADR-PA-007 — Design architecture reuses the existing Design System Spec

**Status:** ACCEPTED

No second design system will be invented by this workstream.

Canonical hierarchy remains:

`brand/tokens → primitives → components → patterns → feature compositions`

`packages/brand` remains identity/token authority. `packages/ui` may own genuinely shared presentation primitives/patterns. App/feature layers own task-specific composition.

Student and Admin share primitives/state language but not forced density/layout.

# ADR-PA-008 — Arabic-first, RTL, accessibility and responsive behavior are architecture concerns

**Status:** ACCEPTED

RTL, keyboard focus, reduced motion, semantic landmarks, safe areas and responsive behavior are not final QA patches. They are component/pattern acceptance requirements.

Page-by-page emergency overrides are considered migration debt and must not become the target solution.

# ADR-PA-009 — Controlled replacement, not patching and not blind rewrite

**Status:** ACCEPTED

Every migrated vertical slice follows:

`target boundary → replacement owner → contract/parity tests → route/composition switch → remove legacy owner → exact-head gates`

The old implementation does not dictate the new architecture, but its verified behavior and tests remain evidence until the replacement is proven.

Permanent dual ownership is prohibited.

# ADR-PA-010 — Database schema changes require domain need, not folder refactors

**Status:** ACCEPTED

Architecture restructuring alone does not justify changing PostgreSQL schema or migrations.

Database changes require a demonstrated product/domain/integrity need and must remain forward-migratable with executable clean-database verification.

# ADR-PA-011 — API module target boundary

**Status:** ACCEPTED

Target module layers where useful:

```text
modules/<domain>/
  domain/
  application/
  infrastructure/
  http/
  tests/
```

This is a dependency model, not a mandate to create empty folders/classes. Small modules may remain compact if the dependency direction is still obvious.

# ADR-PA-012 — No abstraction without ownership or reuse value

**Status:** ACCEPTED

Clean architecture does not mean maximum layering. Create an abstraction only when it provides at least one of:

- stable ownership boundary;
- meaningful test seam;
- multiple implementations;
- genuine reuse;
- protection from infrastructure/framework coupling.

Avoid repository/service/interface ceremony where direct module-local code is clearer.

# ADR-PA-013 — Architecture enforcement becomes executable

**Status:** ACCEPTED

PA-00/PA-08 must introduce deterministic checks where practical for:

- forbidden cross-feature private imports;
- root-level feature dumping;
- shared → feature reverse dependencies;
- route lazy-boundary regression where measurable;
- duplicate/legacy owner inventory.

Do not rely on prose alone.

# ADR-PA-014 — Performance budgets come from measured baseline and product needs

**Status:** ACCEPTED

The current Admin bundle is a baseline finding, not the final threshold. After PA-02 code splitting, record the improved initial/route chunks and establish budgets that detect regression without arbitrary numbers.

Also verify request waterfalls, duplicate fetches and rendering/loading behavior in representative real-browser flows.

# ADR-PA-015 — Documentation is part of architecture completion

**Status:** ACCEPTED

A migrated area is incomplete if code ownership changed but status/ownership/architecture docs still point engineers to the old owner.

Canonical continuity docs and PR checkpoints must be updated at phase boundaries.

## PA-00 ownership/classification frame

Use these classifications consistently:

- **KEEP** — behavior/boundary is structurally correct.
- **STANDARDIZE** — concept is correct; conventions/dependency direction need alignment.
- **MOVE** — implementation is valid but lives under the wrong owner.
- **REBUILD** — responsibility boundary/composition is structurally wrong; reimplement under the target architecture while preserving valid contracts.
- **REMOVE** — superseded/duplicate/legacy owner after replacement parity.

High-level current classification:

| Area | Classification | Target |
|---|---|---|
| API/PostgreSQL business authority | KEEP | preserve server authority |
| backend business-domain grouping | KEEP + STANDARDIZE | modular-monolith modules |
| `apps/api/src/app.ts` composition | STANDARDIZE | app/composition boundary |
| Admin `App.tsx` composition | REBUILD | thin app shell + feature routes |
| Student `App.tsx` composition | REBUILD | thin app shell + auth/feature routes |
| Admin route/workspace eager imports | REBUILD | lazy feature boundaries |
| existing feature implementations with correct behavior | MOVE / REBUILD case-by-case | feature ownership |
| root feature API/CSS/editor/test files | MOVE / STANDARDIZE | feature-local ownership |
| `packages/brand` | KEEP | canonical identity/tokens |
| `packages/ui` | KEEP + STANDARDIZE | shared generic UI only |
| `packages/domain` | STANDARDIZE | shared pure contracts only |
| `packages/validation` | STANDARDIZE | shared boundary schemas only |
| existing UX/UI audit + Target IA | KEEP | product architecture authority |
| existing Design System Spec | KEEP + IMPLEMENT consistently | design architecture authority |
| legacy/duplicate owners after parity | REMOVE | no permanent compatibility debt |

## Next decision gate

PA-00 may close only after:

1. app/module/feature ownership map is reconciled against the latest live `main`;
2. dependency rules are represented in code/tooling where practical;
3. Admin and Student build baselines are recorded from current heads;
4. branch strategy is chosen without overwriting parallel Student/content work;
5. `PROJECT_STATUS.md`, engineering log and active workstream agree on the same execution point.
