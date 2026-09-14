# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — architecture decisions re-reviewed before structural implementation; AB-00 active.**

## A. Durable authority invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `apps/student-web` — separate Student frontend workstream; not an implementation target here.
- Browser state is never canonical business authority.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority remains server-owned.
- Tests represent production contracts; validation/security is never weakened to satisfy fixtures.

## B. Verified Super Admin history retained

- AR-01..AR-04 — DONE / VERIFIED historical foundation.
- AR-05 — `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — `c755b209bfa67980afee0ed150bd43b3574b0a3b`; Frontend `34789114130`, Admin AI `34789114112`, Combined `34789114110`, Stage13G `34789114192` — SUCCESS.
- AR-10 accessibility/runtime correction remains valid. Auth route-focus fix at `302127c3223d00715f1d960f37c7d25044b6b20e`; Stage13G `34793896054` fully green (Admin UI `103823172953`, backend `103823173114`, Real API + PostgreSQL + Chromium `103823326277`).

Former AR-10 “smallest polish only” constraint is superseded by the scoped architecture rebuild.

## C. Root architecture findings

### `AB-ARCH-001` — P1 — Admin composition root too broad

`App.tsx` owns session/auth state, login/error states, shell/navigation/account behavior, full route table, route wrappers and eagerly imports most major Admin workspaces.

**Decision:** REBUILD composition boundary into app providers/router/layout + feature public route modules.

### `AB-ARCH-002` — P1 — Admin initial bundle architecture

Verified production baseline before rebuild: main JS about `968.58 kB` minified / `193.92 kB` gzip, with Vite >500 kB warning.

**Cause:** eager static imports of major route workspaces.

**Decision:** major-route lazy boundaries; do not hide the warning by increasing thresholds.

### `AB-ARCH-003` — P1 — Feature ownership incomplete

Feature pages exist under `src/admin/<feature>`, but feature API adapters, CSS, tests/editors and session lifecycle remain rooted/shared inconsistently.

**Decision:** feature-local ownership + narrow truly shared primitives/adapters; no mechanical folder move.

### `AB-ARCH-004` — P1 — Cross-feature coupling

Confirmed `Overview → Operations` private model/CSS import and legitimate curriculum reference-data needs from other features.

**Decision:** explicit public contracts/app orchestration. Do not promote whole feature internals to shared.

### `AB-ARCH-005` — P1 — Large internal feature compositions

Content Ingestion, Students, Access Codes, Reviews and AI Authoring contain combined orchestration/presentation concerns.

**Decision:** REBUILD INTERNAL COMPOSITION where needed; moving giant files unchanged does not satisfy architecture.

### `AB-ARCH-101` — P1 — Backend root composition hotspot

`apps/api/src/app.ts` manually constructs/registers almost the entire service graph and mixes technical Fastify setup with business-module composition.

**Decision:** extract app/plugin/composition boundaries while preserving behavior.

### `AB-ARCH-102` — P1 — Backend private cross-module coupling

Examples:

- AI Authoring depends on concrete Question Bank / Quiz Builder services;
- AI performs direct SQL against data governed by other domains;
- Question Bank HTTP imports question schema from AI internals;
- module HTTP imports generic request/auth helpers from `auth/http`.

**Decision:** narrow public application/read contracts and shared HTTP infrastructure where genuinely generic. Preserve legitimate orchestration; do not force artificial zero coupling.

## D. AB-00 execution

### AB-00.1 — DONE

Ownership/boundary map established.

### AB-00.2 — DONE

Created/closed:

- `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`;
- `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`.

Legacy exceptions are frozen for ratchet enforcement.

### AB-00.3 — IMPLEMENTED / under reviewed exact-head verification

Created:

- `scripts/verify-architecture-boundaries.py`;
- `.github/workflows/admin-backend-architecture-guard.yml`.

Initial guard run `34797219591` — SUCCESS on `f7c56628...`.

Smart review found and fixed guard gaps:

- detect dynamic `import()` used by lazy routes;
- prevent Admin `app` from importing private feature internals (only feature `public`/`routes` entry points);
- prevent new backend `app` composition from bypassing module public entry points;
- document ratchet-baseline advancement after accepted exact-head-green cleanup batches.

The guard remains transitional until AB-07 removes legacy exceptions and hardens target rules.

## E. 2026-09-14 decision review

Canonical review:

`docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`

### Branch evidence

Compared live `main` `3053640cc5bb0699cfa7456cf646e8997f6aa81b` with architecture branch from merge-base `8d0676443aa7e186c41a79cc011f7f828d1290ef`:

- architecture branch 284 commits ahead / 170 behind at review checkpoint;
- inspected 170 main-only commits change Student frontend/workflow and documentation;
- no main-only changes under Admin/API/migrations/current shared implementation paths.

**Decision:** continue scoped isolation; re-compare main before every structural phase boundary and reconcile before PR readiness.

### Decisions confirmed

- KEEP modular monolith.
- KEEP PostgreSQL/API authority.
- KEEP feature-owned Admin + thin app composition target.
- KEEP user-job IA and attention-first Overview.
- KEEP route-level code splitting for major workflow routes.
- KEEP existing Design System/brand authority; no second design system.
- KEEP RTL/a11y/responsive/product states as architecture acceptance.
- KEEP controlled replacement with legacy deletion after parity.

### Decisions refined

- `packages/ui` = cross-product primitives only; Admin `shared/ui` = Admin-only reusable patterns.
- target backend layers are selective dependency boundaries, not mandatory folders/interfaces.
- Target IA route semantics are binding, but current verified `/app` Admin base is preserved unless runtime/deployment evidence justifies changing it.
- performance budgets will be set from measured improved baselines, not arbitrary thresholds.

### Overengineering explicitly rejected

- microservices;
- DI framework/service locator without need;
- repository/interface ceremony everywhere;
- new global state/query library without post-cleanup evidence;
- wholesale Tailwind/CSS-in-JS/styling-stack replacement;
- lazy-splitting tiny components merely to manufacture chunks;
- big-bang rewrite.

## F. Pre-review exact-head CI

On `f7c56628bc89e1a534c24bd2ba4771b61313664b`:

- Architecture Guard `34797219591` — SUCCESS;
- Admin AI Operations `34797219497` — SUCCESS;
- Combined Integration `34797219488` — SUCCESS;
- Stage13G Admin Operations `34797219505` — SUCCESS.

This is behavioral safety evidence for the pre-review checkpoint. Fresh exact-head verification is required after the strengthened guard/document reconciliation before AB-00.3 closes.

## G. Documentation governance correction

The original PA platform-wide architecture documents were created before Product Owner clarified that Student frontend belongs to another branch/workstream. They are now historical/superseded for execution.

Active execution uses **AB-00..AB-08** only.

The stale PA references in status/index/handoff/PR are being removed so a replacement engineer cannot accidentally resume the wrong scope.

## H. Current phase ledger

- AB-00.1 — DONE
- AB-00.2 — DONE
- AB-00.3 — IMPLEMENTED / exact-head verification active
- AB-00.4 — NEXT
- AB-00.5 — PENDING
- AB-01..AB-08 — PENDING

## I. Exact next execution point

1. verify strengthened Architecture Guard/current exact head;
2. record AB-00.4 Admin bundle/runtime + backend composition baselines;
3. perform AB-00.5 readiness review;
4. then begin AB-01.

Keep PR #52 Draft. Never auto-merge.
