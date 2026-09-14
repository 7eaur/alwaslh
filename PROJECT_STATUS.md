# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-01 — Shared foundations`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read in this order before mutation:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`
2. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `PROJECT_HANDOFF.md`
5. `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`
6. `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`
7. active architecture/product docs listed by those authorities.

Workers A/B/C share one branch and ordered roadmap. If another worker is active, do not create overlapping mutations. Every run performs one smallest coherent increment and ends `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE`.

## Permanent rules

- PostgreSQL/API are canonical business authority.
- Backend stays one Fastify modular monolith; no microservices/DI/service locator without evidence.
- Admin `app` composes only; features own workflows and expose narrow public/routes boundaries.
- Feature internals stay private; shared cannot import app/features.
- No new global state/query framework or styling-stack rewrite without evidence.
- No fabricated metrics/outcomes/actions.
- Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class states.
- Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are architecture requirements.
- Tests/security/validation are never weakened to make migration pass.
- No permanent dual ownership.

Migration law:

`job/use case → DB/API/security contracts → current owner → target owner → states/flow → backend seam correction → replacement → outcome verification → switch → legacy deletion → exact-head gates → documentation`

## Branch reconciliation

Current live `main` observed during Worker A sequence 17: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`, the Student Experience V2 merge checkpoint. No overlapping Admin/API/migration change was introduced for the current AB-01 seam, and no structural phase boundary is being crossed.

## AB-00 — DONE

Ownership map, dependency inventory, Architecture Guard, measured baseline and readiness gate are closed.

Frozen baseline: Admin JS **968.68 kB / 193.92 kB gzip**, Admin CSS **91.38 kB / 13.68 kB gzip**, Admin unit **71/71**, API unit **66/66**, clean PostgreSQL 16 migrations green, baseline real Chromium **9/9**.

## AB-01 — ACTIVE

### AB-01.1 Shared API transport — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

### AB-01.2 Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, public boundary `features/auth/public/index.ts`.

### AB-01.3 Product-state primitive — DONE

Source checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

### AB-01.4 Backend app composition — ACTIVE

Closed seams:

- CORS/preflight — DONE, source `dbdc9245f2d0e283d047d7e1254748e55f890a55`.
- health/readiness — DONE, source `a302871b3486ae95810cea40dccca68363a29055`.
- public not-found/error handling — DONE, source `001d45892bf4a17458f3beaeaaa1a7430be49b44`.
- Fastify instance construction/options — DONE, source `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`.

Fourth-seam closure evidence: Architecture Guard `34820842164`, Admin AI `34821032274`, Combined `34821032272`, Stage13G `34821032271` — SUCCESS/source-tree-equivalent green.

#### Fifth seam — database lifecycle registration — IMPLEMENTED / WAITING_FOR_CI

Source+test implementation HEAD: `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`.

Changes:

- new sole registration owner `apps/api/src/app/plugins/database-lifecycle.ts`;
- `apps/api/src/app.ts` now delegates database-close hook registration via `registerDatabaseLifecycle(app, database)` in the same composition position after business routes, health and public-error composition;
- focused `apps/api/tests/app.test.ts` parity coverage proves `app.close()` delegates to the supplied `database.close()` exactly once;
- `server.ts`, database creation/pool/query/transaction behavior, service graph, business routes, migrations/schema and Student frontend were not changed.

Verification so far:

- Architecture Guard `34825750566` — **SUCCESS** on the source composition commit;
- Stage13G `34825773710` — **IN_PROGRESS** on the source+test head; Admin UI lint/typecheck/unit/build already green inside that run when last inspected;
- Combined `34825773686` — **IN_PROGRESS**;
- Admin AI `34825773676` — **IN_PROGRESS**.

Do not mark this seam DONE until the required source/source-tree-equivalent API quality, clean PostgreSQL, integration/security/auth and real API+Chromium evidence is green. After closure, reassess whether AB-01.4 itself should close; do not invent a broad sixth extraction without evidence.

### AB-01.5 Common backend technical ownership — PENDING

Only justified cross-cutting technical foundations.

### AB-01.6 Foundation closure gate — PENDING

Requires Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integration/security/auth and real Chromium evidence with docs/code consistency.

## Remaining roadmap

- AB-02 — thin Admin shell/router/providers/layouts + substantial lazy routes
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence
- AB-06 — performance/delivery validation
- AB-07 — legacy removal + hard dependency enforcement
- AB-08 — final full verification + live-main reconciliation

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and state `COMPLETE`, disable all three scheduled workers.

## Immediate next action

Inspect the fifth-seam source/source-tree-equivalent CI above. If green, close **only** the database lifecycle seam and then reassess AB-01.4 for closure before authorizing any sixth composition extraction. If a gate fails, fix the root cause only; do not start unrelated work.