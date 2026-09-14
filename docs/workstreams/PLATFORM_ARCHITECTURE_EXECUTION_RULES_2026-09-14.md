# Platform Architecture Rebuild — Execution Rules & Gates

Date: **2026-09-14**  
Status: **BINDING for PA-00 through PA-09**

This document is the execution contract for the structural rebuild. It exists to prevent the rebuild from degrading into either patching or an uncontrolled rewrite.

## 1. Definition of a root fix

A change is a root fix only when it addresses the incorrect owner, dependency, contract, composition, data authority, or reusable system layer that caused the problem.

The following are **not sufficient** on their own:

- moving a file without changing ownership;
- renaming components/folders;
- wrapping a giant component in another component;
- introducing a generic helper that hides coupling;
- adding CSS overrides over inconsistent primitives;
- adding browser state to compensate for weak API/domain boundaries;
- keeping two permanent implementations and routing around them;
- weakening validation/tests to make a migration pass.

## 2. Required decision before every implementation batch

Every touched area must first be classified:

- `KEEP`
- `MOVE`
- `STANDARDIZE`
- `REBUILD`
- `REMOVE`

For each batch record:

1. current owner;
2. target owner;
3. product scenario;
4. contracts/invariants that must survive;
5. obsolete owner to remove;
6. tests/gates required before closure.

No coding starts from “this file looks messy”. It starts from ownership and scenario evidence.

## 3. Permanent platform rules

### Authority

- PostgreSQL + server application/domain logic remain canonical business authority.
- Browser state is presentation/session state, never a second business database.
- Auth, authorization, entitlement, publication, assessment finalization, review, audit and offline security remain server-owned.
- Migrations remain schema/integrity authority.

### Frontend ownership

- app layer composes; features own work;
- one route/workflow has one primary feature owner;
- feature private internals are not cross-imported;
- shared cannot import features;
- new feature files do not accumulate in `src/` root;
- route-level features lazy-load by default;
- feature-specific API adapters live with their feature;
- tests live with or clearly target the same owner;
- duplicated business rules in Admin/Student are forbidden.

### Backend ownership

- modular monolith remains the deployment architecture;
- HTTP depends on application; application depends on domain;
- infrastructure implements technical concerns/ports;
- cross-module dependencies must be explicit;
- no microservice split without independent product/scale evidence;
- no repository/service import simply because it is convenient.

### Shared-code rule

Shared is earned, not assumed. Promote only a primitive/contract used semantically by multiple independent owners and free from one feature's vocabulary.

### Design-system rule

`tokens → primitives → components → patterns → feature compositions`

- brand tokens have one canonical owner;
- no parallel palettes/spacing systems;
- state patterns are consistent;
- RTL/accessibility/responsive/reduced-motion are architecture requirements;
- Student/Admin may have different density and composition while sharing system semantics.

## 4. Vertical-slice migration protocol

Each slice follows exactly:

`understand scenario → map contracts → create target owner → migrate/rebuild → verify → switch → delete old owner → exact-head gates → document`

A compatibility bridge may exist only when:

- it has a named owner;
- it has a removal condition;
- it is not used as a permanent route.

## 5. Anti-patching rules

Forbidden during PA work unless explicitly justified:

- adding another root `*Workspace.tsx`/feature API/CSS file;
- adding one-off global CSS to compensate for a component ownership problem;
- duplicate API adapters for the same contract without a bounded migration bridge;
- `any`/unchecked casts to bypass contract migration;
- raw DB/status/provider values leaking into normal UI because mapping is inconvenient;
- disabling a failing assertion that exposes a real contract/accessibility/security problem;
- keeping dead aliases after callers are migrated;
- building new screens against legacy aggregate components when the target feature owner exists.

## 6. Change-size rule

Root fix does not mean giant commit.

Each commit should have one architectural purpose and remain reviewable. Large migrations are divided by scenario/owner, not arbitrary file counts.

Preferred sequence:

1. foundation/contract;
2. replacement owner;
3. parity/switch;
4. legacy deletion;
5. closure docs.

## 7. Testing pyramid for migrations

Use the smallest deterministic test that proves the contract, then retain representative real-browser coverage.

Required as applicable:

- typecheck/lint;
- unit tests for pure model/presentation logic;
- contract/schema tests at HTTP boundaries;
- integration tests with PostgreSQL for business/integrity rules;
- production build;
- real Chromium for critical user scenarios;
- accessibility/keyboard/RTL/responsive checks for UI slices;
- security/auth regressions for sensitive paths.

No phase is closed by screenshots alone.

## 8. Performance rule

Performance is architectural:

- route code splitting begins in shell/foundation work;
- duplicate fetch/state must be removed at ownership boundaries;
- bundle budgets are based on measured improved baselines, not arbitrary numbers;
- no feature may force unrelated large features into the critical initial bundle without evidence;
- no optimization may weaken offline/security/data authority.

## 9. Documentation rule

Canonical active documents:

1. `DOCUMENTATION_INDEX.md`
2. `PROJECT_STATUS.md`
3. `docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`
4. `docs/workstreams/PLATFORM_ARCHITECTURE_DECISIONS_2026-09-14.md`
5. `docs/architecture/PLATFORM_OWNERSHIP_BOUNDARIES_2026-09-14.md`
6. this file
7. existing UX product authorities:
   - `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`
   - `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
   - `docs/product/DESIGN_SYSTEM_SPEC.md`
   - `docs/product/CONTENT_LANGUAGE_RULES.md`

Historical plans may explain history but cannot override the active architecture workstream.

## 10. PA-00 detailed execution

### PA-00.1 — Ownership & boundary map

Deliverables:

- application/package authority map;
- Admin feature ownership;
- Student feature ownership;
- backend module ownership;
- shared-package promotion rule;
- migration classification model.

Gate: committed and referenced. **COMPLETE.**

### PA-00.2 — Current-file migration inventory

Deliverables:

- root-level frontend debt inventory;
- feature-by-feature source ownership inventory;
- API composition/module dependency inventory;
- duplicate/legacy/public-contract seams;
- exact `current → target → classification → removal condition` table.

Gate: every first-wave file/owner has an explicit destination/decision.

### PA-00.3 — Automated architecture guard

Deliverables:

- deterministic boundary/placement verification;
- prevent new feature dumping into protected roots;
- prevent shared→feature/app imports;
- prevent cross-feature private imports where target structure exists;
- integrate into relevant CI only after current baseline is explicitly handled.

Gate: guard passes existing accepted baseline and fails a known invalid fixture/example.

### PA-00.4 — Baselines

Deliverables:

- Admin initial/route bundle evidence;
- Student initial/route bundle evidence;
- representative browser/runtime baseline;
- current architecture hotspots recorded.

Gate: measurements reproducible from repository commands/workflows.

### PA-00.5 — Foundation readiness

Confirm:

- decisions and ownership map are consistent;
- no unresolved owner blocks first migration;
- architecture guard is green;
- baseline tests/CI green on exact head;
- first PA-01/PA-02 slice selected by dependency value, not visual convenience.

Only then PA-01/PA-02 implementation starts.

## 11. PA-01 through PA-09 execution order

- `PA-01` shared design + proven shared contracts.
- `PA-02` thin app shells/router/providers/layouts/lazy boundaries.
- `PA-03` Admin vertical slices.
- `PA-04` Student vertical slices, reconciled with fresh live `main`.
- `PA-05` backend modular-monolith boundary standardization.
- `PA-06` design/interaction convergence.
- `PA-07` performance/delivery architecture.
- `PA-08` legacy removal and hard dependency enforcement.
- `PA-09` full platform verification.

PA phases can overlap only when they change independent owners and do not create two competing authorities. A later phase cannot be used to postpone deletion or tests required by the current slice.

## 12. Definition of Done for the rebuild

The platform is structurally rebuilt only when:

- ownership is obvious from the repository;
- app roots are thin;
- routes/workflows are feature-owned;
- backend module dependencies are explicit;
- shared packages are small and semantically shared;
- no obsolete dual owners remain;
- design/system behavior is consistent without page patches;
- critical routes do not eagerly ship unrelated product areas;
- clean PostgreSQL + API + browser scenarios are green;
- Student/Admin remain understandable, Arabic-first, RTL-safe, responsive and accessible;
- documentation describes the current code, not a hoped-for architecture;
- final exact-head PA-09 gates are green.

No automatic merge is authorized.