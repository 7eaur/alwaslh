# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-01 — Shared foundations`.

## Binding responsibility

This workstream is responsible for:

- **the complete Super Admin product** — frontend architecture, IA, UX/UI, routing, accessibility, RTL, responsive behavior, performance and maintainability;
- **the full backend/server product** — Fastify API, PostgreSQL/migrations, security, business rules, module boundaries, data flow, performance and integration;
- server-side capabilities consumed by Admin, Student or both, including auth/session/device, access/entitlements, curriculum/publication, content/media/OCR, AI/human review, Question Bank, Quiz Builder, assessment/scoring, offline authorization/integrity, notifications and operations;
- shared packages only where a real shared contract/design responsibility exists;
- CI, integration/security/contract tests and runtime/browser evidence needed to prove the above.

### The only structural exclusion

`apps/student-web` **frontend implementation itself** is owned by the separate Student workstream/conversation.

Therefore this workstream does **not** redesign/restructure the Student shell, routes, pages, visual composition or frontend feature architecture.

This exclusion does **not** exclude Student-facing backend capabilities. If this workstream changes a shared/server contract, Student tests/code may be inspected or run as consumer-regression evidence.

Latest observed independent Student continuation during reconciliation: PR #57 / `stage16/student-016i`, head `ce97ef2524cd3735a0200ee0f15fa6e6e224e01e` at the observed checkpoint.

## Canonical active authorities

Read in this order for this workstream:

1. `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`
2. `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`
3. `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`
4. `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`
5. `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`
6. `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`
7. `docs/architecture/ADMIN_BACKEND_BASELINE_2026-09-14.md`
8. `docs/architecture/ADMIN_BACKEND_AB00_REVIEW_CHECKLIST_2026-09-14.md`
9. `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
10. `docs/product/DESIGN_SYSTEM_SPEC.md`
11. `.agents/skills/alwaslh-product-engineering/SKILL.md`

Older `PLATFORM_ARCHITECTURE_*` documents are historical rationale only and are superseded for execution by the scoped AB workstream.

## Cross-workstream principles adopted from Student refoundation

The Student frontend implementation remains isolated, but these proven principles are binding here as well:

- **Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**;
- one shell/route/workflow owner per responsibility;
- preserve contracts, not presentation debt;
- no fabricated metrics/counts/progress/health/outcomes/actions;
- loading/empty/error/permission/conflict/unavailable/success/recovery are first-class states;
- clickable must look clickable; static must look static;
- lazy-load substantial destination/workflow routes rather than tiny components;
- tests assert outcomes/contracts, not obsolete wording/DOM shape;
- old UI is not preserved merely because historical tests targeted it;
- compatibility/legacy bridges have explicit deletion conditions;
- motion is functional and honors reduced motion;
- UI completion never implies backend/stage completion without authoritative server evidence.

## Branch reconciliation rule

Continue isolated Admin/backend work without importing Student frontend implementation, but re-compare live `main` before every structural phase boundary.

If `main` gains Admin/API/migrations/shared-contract changes, pause and reconcile before continuing. Reconcile current `main` again before PR #52 becomes review/merge-ready.

Latest AB-01 entry reconciliation confirmed live `main` remained `3053640cc5bb0699cfa7456cf646e8997f6aa81b`; no newer Admin/API/migrations work needed importing before foundation execution.

## Permanent architecture/product rules

- PostgreSQL/API remain canonical business authority.
- Backend remains one Fastify modular monolith; no microservices.
- Student-facing backend security/business authority remains server-owned and protected.
- Admin `app` composes only; features own workflows/routes/API adapters/models/tests.
- Feature internals are private; cross-feature work uses narrow public contracts or app orchestration.
- Target Admin feature concepts follow operator jobs: auth, overview, curriculum, content/OCR, AI jobs/review, questions, quizzes, students, access-codes, operations.
- Contextual AI authoring belongs with Lesson/Question/Quiz workflows rather than a permanent catch-all top-level workspace.
- `packages/ui` owns cross-product primitives/semantics; Admin `shared/ui` owns Admin-only reusable patterns.
- `shared` never becomes a dumping ground.
- No new feature files in Admin root `src/`.
- Major workflow routes lazy-load by default; no artificial tiny-chunk splitting.
- One Admin shell owns global chrome/navigation.
- Keep verified `/app` as Admin base unless runtime evidence justifies changing it; improve child-route semantics instead.
- No new global state/query framework without evidence.
- No Tailwind/CSS-in-JS/styling-stack rewrite without evidence.
- Backend module layers are a dependency model, not mandatory empty folders/interfaces.
- No DI/service-locator/interface ceremony without demonstrated value.
- Database schema changes require domain/integrity need, never folder restructuring.
- Overview is attention-first and uses authoritative values only.
- Technical IDs/provider/runtime/storage/raw JSON are progressive/advanced details unless needed for the operator decision.
- RTL/a11y/responsive/reduced-motion are architecture requirements.
- Tests/security/validation are never weakened to make migration pass.
- No permanent dual ownership: replacement closes with legacy deletion or a bounded explicit removal condition.

Migration law:

`job/use case → DB/API/security contracts → current owner → target owner → states/flow → backend seam correction where needed → replacement → outcome verification → switch → legacy deletion → exact-head gates → documentation`

## AB-00 — CLOSED

- **AB-00.1 Ownership & boundary map — DONE**
- **AB-00.2 Current-file + dependency inventory — DONE**
- **AB-00.3 Architecture Guard — DONE / active ratchet**
- **AB-00.4 Admin bundle/runtime + backend composition baseline — DONE**
- **AB-00.5 Foundation readiness — PASS**

### Frozen measured baseline

Measured behavioral/build head: `4e4e75445cf18d0e811f60b023c52cd7696bd102`.

- Admin JS: **968.68 kB / 193.92 kB gzip** — one oversized initial chunk; solve through ownership + route code splitting, never warning suppression.
- Admin CSS: **91.38 kB / 13.68 kB gzip**.
- Admin unit tests: **71/71 green** across 17 files.
- API unit tests: **66/66 green**; typecheck/build green.
- API lint: 154 files checked with one recorded legacy unused-variable warning in `content/legacy-supabase-importer.ts`.
- PostgreSQL 16 clean migration sequence: green.
- Stage 13E Admin AI baseline run `34798894378`: **SUCCESS**.
- Stage 13E Combined Integration baseline run `34798894391`: **SUCCESS**.
- Combined real Chromium Admin acceptance: **9/9 green**.
- Admin hotspot: `apps/admin-web/src/App.tsx` historically owned session + shell + navigation + routes and eagerly imported major workflows.
- Backend hotspot: `apps/api/src/app.ts` manually composes/registers the broad service/module graph.

Canonical baseline: `docs/architecture/ADMIN_BACKEND_BASELINE_2026-09-14.md`.

## AB-01 — ACTIVE

Detailed execution authority: `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`.

- **AB-01.1 Shared API transport boundary — IMPLEMENTED; exact-head verification on current head required before DONE**
  - transport owner: `apps/admin-web/src/shared/api/client.ts`;
  - root `admin-api.ts` compatibility re-export is bounded transitional debt.
- **AB-01.2 Auth/session ownership — IMPLEMENTED; exact-head verification on current head required before DONE**
  - auth API owner: `apps/admin-web/src/features/auth/api/admin-auth-api.ts`;
  - session lifecycle owner: `apps/admin-web/src/features/auth/model/AdminSessionProvider.tsx`;
  - supported external boundary: `apps/admin-web/src/features/auth/public/index.ts`;
  - `App.tsx` no longer owns session state, restore/logout API calls or auth error interpretation.
- **AB-01.3 Product-state primitives — NEXT**
- **AB-01.4 Backend app composition foundation — PENDING**
- **AB-01.5 Common backend technical ownership — PENDING**
- **AB-01.6 Foundation closure gate — PENDING**

## Full roadmap

- `AB-00` — baseline + guardrails — **DONE**
- `AB-01` — minimal shared foundations: Admin product states/transport/session + backend app composition/common HTTP/auth/error/db ownership where justified — **ACTIVE**
- `AB-02` — thin Admin shell/router/providers/layouts + major lazy route boundaries
- `AB-03` — **end-to-end Admin/backend vertical slices** by operator workflow:
  1. Overview + Operations
  2. Curriculum + Content + OCR
  3. AI Jobs + AI Review + contextual authoring transitions
  4. Question Bank
  5. Quiz Builder
  6. Students
  7. Access Codes
- `AB-04` — remaining backend modular-monolith normalization, including server-only/Student-facing boundaries not naturally closed in AB-03
- `AB-05` — final Admin design/interaction convergence audit
- `AB-06` — frontend/backend performance and delivery validation + evidence-based budgets
- `AB-07` — legacy removal + hard dependency enforcement
- `AB-08` — final Super Admin + full Backend verification

This order intentionally avoids building a clean Admin UI on top of backend seams already known to be structurally weak. Each business slice repairs the backend boundary it actually uses, proves behavior, switches ownership and removes the legacy owner.

## Immediate next action

1. require exact-head Architecture Guard + Admin/API quality + PostgreSQL + real Chromium evidence for AB-01.1/AB-01.2;
2. if green, mark AB-01.1 and AB-01.2 DONE;
3. execute **AB-01.3 Product-state primitives** only after that gate;
4. then AB-01.4 backend composition foundation;
5. keep PR #52 Draft; never auto-merge.
