# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: allow a new engineering conversation to resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## 1. Mandatory startup

Before any mutation:

1. confirm repo `7eaur/alwaslh`;
2. live-check `main` and `rebuild/super-admin-foundation` HEADs;
3. compare `main` against the architecture branch for scoped paths (`apps/admin-web`, `apps/api`, `database/migrations`, relevant shared packages);
4. read `PROJECT_STATUS.md`;
5. read `PROJECT_ENGINEERING_LOG.md`;
6. read `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`;
7. read `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`;
8. read `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`;
9. read `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`;
10. read `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`;
11. read `docs/architecture/ADMIN_BACKEND_AB00_REVIEW_CHECKLIST_2026-09-14.md`;
12. inspect current code/tests/migrations for the active batch;
13. inspect current exact-head Actions before claiming health.

Code/migrations/executable CI/runtime evidence outrank prose. Anything not inspected is `NOT YET VERIFIED`.

## 2. Scope

IN:

- Super Admin frontend;
- full API/backend;
- PostgreSQL/migrations;
- Admin-facing/shared contracts and genuinely shared design primitives.

OUT:

- Student frontend structural/design work.

Student frontend currently has its own workstream (`stage16/student-016i` / PR #57 at latest reconciliation). Do not copy/migrate its implementation into this branch. Run Student tests only when a changed backend/shared contract needs consumer-regression proof.

## 3. Active branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52: Draft, unmerged, no auto-merge;
- live main at last architecture review: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`.

At review checkpoint the branch was 284 commits ahead and 170 behind main. Path-level inspection showed main-only changes were Student frontend/workflow + docs, not Admin/API/migrations/scoped shared implementation. Continue isolated work only while that remains true. Re-check before each structural phase and before PR readiness.

## 4. Current architecture law

`operator job → API/DB contracts → current owner → target owner → states/actions/flow → build replacement → verify outcome → switch → delete legacy owner → exact-head gates → document`

No patch-only closure. No big-bang rewrite. Existing implementation is behavioral evidence, not target architecture.

## 5. Core architecture decisions

### Admin

Target:

```text
app/        # bootstrap/router/providers/layouts/error boundaries only
features/   # workflow ownership
shared/     # Admin-only generic patterns/api/lib where truly reusable
styles/
```

- app may consume feature `public`/`routes` entry points, never private internals;
- feature internals private;
- shared cannot import features/app;
- major workflow routes lazy-load;
- keep `/app` base unless runtime/deployment evidence requires change;
- migrate child routes toward user-job Target IA;
- centralize session invalidation; pages should not each own `onSessionExpired` plumbing forever;
- no new global state/query library until evidence after ownership cleanup;
- no styling-stack rewrite.

Shared visual ownership:

`packages/brand → packages/ui (cross-product primitives) → Admin shared patterns → feature composition`.

### Backend

Keep one Fastify modular monolith over PostgreSQL.

Conceptual direction where useful:

`HTTP → Application → Domain`, with Infrastructure adapters.

Do not force empty layers/interfaces. No microservices, DI framework, service locator or generic repository ceremony without evidence.

## 6. Important current defects already mapped

Admin:

- broad/eager `App.tsx` composition;
- session expiry callback repeated across features;
- root feature API/CSS ownership;
- Overview imports Operations private model/CSS;
- repeated async/filter/pagination/status patterns;
- large internal compositions in Content Ingestion, Students, Access Codes, Reviews, AI Authoring.

Backend:

- `app.ts` constructs/registers full system graph;
- AI Authoring depends on concrete Question Bank/Quiz Builder services and cross-domain SQL;
- Question Bank HTTP imports AI internal question schema;
- module HTTP imports generic helpers from Auth HTTP;
- root config/db/errors ownership is incidental.

See dependency audit/inventory for exact evidence/removal conditions.

## 7. Product/design rules

Priority:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**.

- one route/page = one dominant operator job;
- Overview = actionable attention, not sidebar duplicated as cards;
- no fake metrics/trends/health claims;
- product states are first-class;
- technical internals progressively disclosed;
- primary/secondary/destructive actions distinct;
- Arabic-first RTL, keyboard, responsive and reduced-motion acceptance are mandatory;
- existing brand/Design System reused, not replaced.

## 8. AB-00 state

- AB-00.1 DONE
- AB-00.2 DONE
- AB-00.3 Architecture Guard implemented and strengthened; fresh exact-head verification required
- AB-00.4 NEXT
- AB-00.5 PENDING

Initial Guard run `34797219591` succeeded. The reviewed Guard now also checks dynamic imports and app→private feature/module imports. Advance its baseline only after accepted exact-head-green architectural cleanup.

## 9. Pre-review verified CI

On `f7c56628bc89e1a534c24bd2ba4771b61313664b`:

- Guard `34797219591` SUCCESS
- Admin AI `34797219497` SUCCESS
- Combined `34797219488` SUCCESS
- Stage13G `34797219505` SUCCESS

Do not assume later heads are green without checking them.

## 10. Exact continuation

1. verify strengthened Guard and current head;
2. complete AB-00.4 measured Admin bundle/runtime/backend-composition baseline;
3. complete AB-00.5 readiness gate;
4. start AB-01 only after the readiness checklist is green;
5. then AB-02 shell/router/session/lazy route architecture;
6. AB-03 first vertical slice = Overview + Operations;
7. backend composition/HTTP foundation then Curriculum + Content cross-layer slice;
8. keep every batch small, reviewable and exact-head verified;
9. update status/log/handoff at phase boundaries;
10. never auto-merge PR #52.
