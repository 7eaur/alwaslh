# Admin + Backend Baseline — AB-00.4

Date: **2026-09-14**  
Status: **COMPLETE / BINDING COMPARISON BASELINE**  
Measured head: `4e4e75445cf18d0e811f60b023c52cd7696bd102`

This document records the measurable starting point for the Super Admin + full-backend rebuild. It is not a performance target and it does not approve the current architecture. Future structural work must compare against this baseline instead of claiming improvement without evidence.

## 1. Evidence source

Primary exact-head evidence:

- Stage 13E Admin AI Operations run `34798894378` — **SUCCESS**.
- Stage 13E Combined Integration run `34798894391` — **SUCCESS**.
- Combined integration job `103837398252` — **SUCCESS**.
- Architecture Guard strengthened implementation previously verified on `2b0106cddfaefd4b481a75b70b66926ffa52135e`, run `34797722703` — **SUCCESS**.

The Combined run executes API/Admin lint, typecheck, unit tests, production builds, clean PostgreSQL migrations, backend regressions and real Chromium acceptance against one checkout.

## 2. Admin production-build baseline

Vite: `7.1.3`.

- transformed modules: **108**
- `dist/index.html`: **0.54 kB**, gzip **0.35 kB**
- main CSS: **91.38 kB**, gzip **13.68 kB**
- main JavaScript chunk: **968.68 kB**, gzip **193.92 kB**
- production build time in the recorded CI run: about **2.35 s**
- Vite reports a chunk-size warning because the main JS chunk exceeds **500 kB** after minification.

### Baseline interpretation

The size warning is a real architecture signal, not a configuration nuisance. Current `apps/admin-web/src/App.tsx` eagerly imports major Admin workspaces and also owns session, shell, navigation and route composition. The planned correction is route/workflow ownership plus lazy route boundaries. **Do not raise `chunkSizeWarningLimit` to hide this baseline.**

After AB-02/AB-03, budgets will be established from the improved measured state rather than an arbitrary number chosen before code splitting.

## 3. Admin verification baseline

Admin Vitest suite on the measured head:

- test files: **17 passed / 17**
- tests: **71 passed / 71**
- failures: **0**
- representative suite duration: about **2.59–2.67 s** in CI.

The exact-head Combined flow also ran real Chromium Admin acceptance:

- **9 tests passed**
- about **15.1 s**
- covered AI review durable navigation, canonical human-review authority/reload, approved lesson application, real session expiry, 409 race refresh, 390 px viewport containment, Quiz Builder canonical routes/deep links/version behavior and real quiz creation.

These are behavioral contracts to preserve while ownership changes.

## 4. API quality baseline

Exact-head API gates are green:

- lint completed over **154 files**;
- typecheck: **SUCCESS**;
- API unit tests: **66 passed / 66**, failures **0**;
- build: `tsc -p tsconfig.build.json` — **SUCCESS**.

One existing lint warning is recorded rather than silently patched during baseline work:

`apps/api/src/content/legacy-supabase-importer.ts:19` — unused `SOURCE_BUCKET`.

This is existing debt. Its owning migration may remove it; AB-00.4 does not make unrelated cleanup changes merely to produce a prettier baseline.

## 5. PostgreSQL baseline

CI uses PostgreSQL **16** and proves migrations from a clean schema.

The current migration sequence applies successfully from `0001_core.sql` through `0026_legacy_supabase_import_support.sql`, including the two current `0023_*` files:

- `0023_admin_access_operations.sql`
- `0023_student_assessment_runtime.sql`

A clean-schema reset in the recorded run reports cascading over **110 database objects**, then migrations are reapplied successfully before further regressions/browser fixtures.

Database schema remains authority. Folder/architecture changes do not justify schema changes by themselves.

## 6. Backend composition baseline

`apps/api/src/app.ts` is the principal composition hotspot.

It currently imports, constructs and wires a broad system graph, including auth, access, activation, Admin access, operations, notifications, curriculum, content, AI, Question Bank, Quiz Builder, Student Reader, Student Assessment and Offline capabilities, then registers the related HTTP routes centrally.

### Interpretation

The modular-monolith business grouping is useful and is retained. The defect is concentration of composition/infrastructure ownership and inconsistent cross-module boundaries, not the existence of one deployable API.

AB-01 may extract app composition/common HTTP infrastructure only where behavior can remain unchanged. Business-module boundary repair then proceeds end-to-end with the slices that actually use those seams.

## 7. Admin composition baseline

`apps/admin-web/src/App.tsx` is the principal frontend composition hotspot.

It currently owns or coordinates:

- session restoration/expiry/logout;
- login and global error flow;
- Admin shell/sidebar/navigation;
- route table/composition;
- related/review navigation;
- direct eager imports of the major Admin workspaces.

### Interpretation

The target is a thin app layer plus feature-owned workflows. This root is **REBUILD**, not a file to move intact into a new folder.

## 8. Reproducible quality commands

API:

```text
npm run lint --prefix apps/api
npm run typecheck --prefix apps/api
npm test --prefix apps/api
npm run build --prefix apps/api
npm run db:migrate --prefix apps/api
```

Admin:

```text
npm run lint --prefix apps/admin-web
npm run typecheck --prefix apps/admin-web
npm test --prefix apps/admin-web
npm run build --prefix apps/admin-web
```

Runtime/browser authority is the current real PostgreSQL + API + Chromium CI flow, not a mocked UI-only result.

## 9. Baseline comparison rules

For later structural batches:

1. preserve or improve functional/security/integrity gates;
2. never trade server authority for frontend convenience;
3. compare Admin initial/route chunks after lazy boundaries exist;
4. compare test/runtime behavior by scenario, not only raw test counts;
5. measure request/query/fetch behavior before claiming backend/frontend performance improvement;
6. any regression accepted temporarily must have an explicit reason, owner and removal gate;
7. warning suppression does not count as improvement;
8. a smaller bundle does not justify duplicated state, weakened contracts or broken deep links.

## 10. AB-00.4 decision

**AB-00.4 — DONE.**

We now have a reproducible baseline for:

- Admin build/bundle size;
- Admin unit behavior;
- API lint/type/unit/build behavior;
- clean PostgreSQL migration behavior;
- real browser integration behavior;
- Admin composition hotspot;
- backend composition hotspot.

Next gate: **AB-00.5 — Foundation Readiness Review**. No AB-01 implementation starts until that gate confirms scope, branch reconciliation, guard evidence, baseline and active documentation are coherent.