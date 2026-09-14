# PROJECT STATUS — الوسيلة الذكية

> Source of truth order: repository code + PostgreSQL migrations/schema + executable CI + verified runtime + canonical project documentation.

**Branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — remains Draft; no merge or auto-merge authorized.  
**Live main checked:** `3053640cc5bb0699cfa7456cf646e8997f6aa81b` — parallel Student/content workstream; do not overwrite.  
**Architecture baseline before pivot:** `302127c3223d00715f1d960f37c7d25044b6b20e`.  
**Latest verified Admin runtime gate:** Stage13G `34793896054` — Admin UI, backend, migrations/integration, Real API + PostgreSQL + Chromium all SUCCESS.  
**Current stage:** Platform Architecture Rebuild — `PA-00 Architecture baseline and guardrails` — **ACTIVE**.

## Direction change — 2026-09-14

The former AR-10 contract limited work to small evidence-driven accessibility/RTL/performance/visual fixes and explicitly avoided redesign/rebuild of already-working surfaces.

That constraint is now **SUPERSEDED**.

The new binding direction is to evaluate the platform from first principles and rebuild its structure into a clear, feature-owned, scalable architecture rather than continuing to improve the current shape merely because it exists.

Canonical plan:

`docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`

This is a controlled structural rebuild, not patching and not an unsafe big-bang rewrite. Existing behavior/CI remains executable evidence until each replacement slice proves parity, then the superseded owner is removed.

## Verified history retained

- Super Admin AR-01 through AR-09 — DONE / VERIFIED.
- AR-10 accessibility work produced valid improvements and exposed/fixed a real authentication focus gap.
- Final AR-10 accessibility/runtime baseline before the architecture pivot: commit `302127c3223d00715f1d960f37c7d25044b6b20e`, Stage13G `34793896054` — SUCCESS across Admin UI, backend/integration and Real API + PostgreSQL + Chromium.
- The old AR-10 “smallest polish only” continuation is no longer the active roadmap.

## Current architecture findings

### Preserve

- `apps/student-web`, `apps/admin-web`, `apps/api` product separation.
- Fastify API + PostgreSQL canonical authority.
- migrations/integrity/business/security contracts.
- backend domain grouping and real CI/browser coverage.
- verified product behavior unless explicitly replaced by a documented architecture/product decision.

### Rebuild / standardize

- Both frontend composition roots are too broad; Admin and Student `App.tsx` files own too many responsibilities.
- Admin eagerly imports major feature workspaces; verified build baseline produced ~`968.58 kB` minified JS (`193.92 kB` gzip) in one main chunk.
- source-root API/CSS/test ownership remains inconsistent and only partially feature-owned.
- shared `domain` / `validation` packages cover only a subset of platform contracts.
- API domain grouping is useful, but app composition and internal module layer conventions/dependency boundaries require standardization.
- design-system ownership must become explicit: tokens → primitives → components → patterns → feature compositions.

## Active roadmap

- `PA-00` — Architecture baseline + ADRs + dependency/ownership rules — **ACTIVE**.
- `PA-01` — Shared design + contract foundation.
- `PA-02` — Thin frontend app shells, providers/router/layout/auth boundaries, route code splitting.
- `PA-03` — Admin feature vertical-slice migration.
- `PA-04` — Student feature vertical-slice migration reconciled against current live `main`.
- `PA-05` — Backend modular-monolith boundary standardization.
- `PA-06` — Design/interaction convergence.
- `PA-07` — Performance/delivery architecture.
- `PA-08` — Legacy removal + dependency enforcement.
- `PA-09` — Full platform verification.

## Immediate execution rule

Do not resume the old AR-10 polish loop. Continue with `PA-00` only:

1. classify current code/files by owner and KEEP / MOVE / REBUILD / REMOVE / STANDARDIZE;
2. record architecture decisions for frontend boundaries, backend module boundaries, data authority and design-system layers;
3. define/enforce dependency rules where practical;
4. baseline current bundle/runtime characteristics;
5. only then start PA-01/PA-02 foundation work.

PR #52 stays Draft. Never auto-merge.