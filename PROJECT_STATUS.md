# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-01 — Shared foundations`.

## Binding responsibility

This workstream owns the complete Super Admin product plus the full backend/server product, PostgreSQL/migrations/integrity, security and shared/server contracts consumed by Admin or Student, and the CI/integration/browser evidence needed to prove them.

The only structural exclusion is `apps/student-web` frontend implementation itself. Student-facing backend capability remains in scope; Student frontend code/tests may be inspected only as consumer-regression evidence when shared/server contracts change.

## Canonical active authorities

Read in this order:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` — live continuation point and worker handoff;
2. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md` — binding alternating execution rules;
3. `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`;
4. `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`;
5. `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`;
6. `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`;
7. `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`;
8. `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`;
9. `docs/architecture/ADMIN_BACKEND_BASELINE_2026-09-14.md`;
10. `docs/architecture/ADMIN_BACKEND_AB00_REVIEW_CHECKLIST_2026-09-14.md`;
11. `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`;
12. `docs/product/DESIGN_SYSTEM_SPEC.md`;
13. `.agents/skills/alwaslh-product-engineering/SKILL.md`.

Older `PLATFORM_ARCHITECTURE_*` documents are historical rationale only and are superseded for execution by the scoped AB workstream.

## Scheduled continuation law

Worker A and Worker B continue the same ordered roadmap, staggered by 30 minutes. Every run reads the live state, current branch/main HEADs, exact-head CI and canonical docs before mutation; performs one smallest coherent increment; verifies it; then records ending HEAD, evidence and the exact next step. If another worker is still active, do not create overlapping mutations.

Normal handoff states are `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE`.

## Branch reconciliation

Continue isolated Admin/backend work without importing Student frontend implementation. Re-compare live `main` before every structural phase boundary and before PR readiness.

Latest reconciliation in Worker A sequence 1:

- live `main`: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`;
- unchanged from prior AB-01 reconciliation;
- no new overlapping Admin/API/migrations/shared-contract change observed.

## Permanent architecture/product rules

- PostgreSQL/API remain canonical business authority.
- Backend remains one Fastify modular monolith; no microservices.
- Student-facing backend security/business authority remains server-owned and protected.
- Admin `app` composes only; features own workflows/routes/API adapters/models/tests.
- App imports feature code through supported public/routes boundaries only.
- Feature internals are private; cross-feature work uses narrow public contracts or app orchestration.
- `packages/ui` owns cross-product primitives only; Admin `shared/ui` owns Admin-only reusable patterns.
- `shared` never becomes a dumping ground and cannot import feature/app internals.
- No new feature files in Admin root `src/`.
- Substantial workflow routes lazy-load by default; no artificial tiny-chunk splitting.
- One Admin shell owns global chrome/navigation.
- Keep verified `/app` base unless runtime evidence justifies changing it.
- No global state/query framework, DI/service locator, microservices or styling-stack rewrite without evidence.
- Database changes require domain/integrity need, never folder restructuring.
- No fabricated metrics/counts/progress/health/outcomes/actions.
- Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class states.
- Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are architecture requirements.
- Tests/security/validation are never weakened to make migration pass.
- No permanent dual ownership: every compatibility bridge has a deletion condition.

Migration law:

`job/use case → DB/API/security contracts → current owner → target owner → states/flow → backend seam correction where needed → replacement → outcome verification → switch → legacy deletion → exact-head gates → documentation`

## AB-00 — CLOSED

- AB-00.1 Ownership & boundary map — DONE
- AB-00.2 Current-file + dependency inventory — DONE
- AB-00.3 Architecture Guard — DONE / active ratchet
- AB-00.4 Admin bundle/runtime + backend composition baseline — DONE
- AB-00.5 Foundation readiness — PASS

Frozen measured baseline:

- Admin JS: **968.68 kB / 193.92 kB gzip**;
- Admin CSS: **91.38 kB / 13.68 kB gzip**;
- Admin unit tests: **71/71 green** across 17 files;
- API unit tests: **66/66 green**; typecheck/build green;
- PostgreSQL 16 clean migration sequence: green;
- Combined real Chromium Admin acceptance at baseline: **9/9 green**.

## AB-01 — ACTIVE

Detailed execution authority: `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`.

### AB-01.1 Shared API transport boundary — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

Owns fetch/credentials, JSON/blob transport, network/service error normalization, `ApiRequestError` and missing-session classification only. Root `admin-api.ts` compatibility re-export remains bounded transitional debt until feature adapters migrate.

### AB-01.2 Auth/session ownership — DONE

Owners:

- `apps/admin-web/src/features/auth/api/admin-auth-api.ts`;
- `apps/admin-web/src/features/auth/model/AdminSessionProvider.tsx`;
- public boundary `apps/admin-web/src/features/auth/public/index.ts`.

`App.tsx` no longer owns session state, restore/logout API calls or auth error interpretation.

Final verification checkpoint for AB-01.1/AB-01.2: `d955a34087552377dc8b426ec1712e57f59fd8f6`.

Evidence:

- Stage13E Admin AI `34800888706` — SUCCESS;
- Stage13E Combined Integration `34800888690` — SUCCESS;
- Stage13G `34800888723` — SUCCESS including Admin quality, API quality, clean PostgreSQL migrations, integration/auth regressions and real API + PostgreSQL + Chromium;
- Architecture Guard `34799891149` — SUCCESS on last source-code head `e0b90cd21c404cc1ab6a65200a08385c1a319e5a`;
- `e0b90cd..d955a340` is documentation-only, so source architecture did not change after the successful guard.

### AB-01.3 Product-state primitives — NEXT

Inspect real repeated states first. Extract only the minimum proven Admin-only primitive. Current evidence shows duplication in Overview/Operations loading/error/retry states; do not create a generic mega-component or generic copy that hides server truth.

### AB-01.4 Backend app composition foundation — PENDING

Thin `apps/api/src/app.ts` by extracting real app-level composition/config/plugin responsibilities without changing business rules or introducing DI/repository ceremony.

### AB-01.5 Common backend technical ownership — PENDING

Normalize only proven cross-cutting technical concerns where ownership is genuinely shared.

### AB-01.6 Foundation closure gate — PENDING

Requires architecture guard, Admin/API quality, clean PostgreSQL, real Chromium and docs/code consistency after all AB-01 foundations are implemented.

## Full roadmap

- AB-00 — baseline + guardrails — DONE
- AB-01 — minimal shared foundations — ACTIVE
- AB-02 — thin Admin shell/router/providers/layouts + major lazy route boundaries
- AB-03 — end-to-end Admin/backend vertical slices in order:
  1. Overview + Operations
  2. Curriculum + Content + OCR
  3. AI Jobs + AI Review + contextual authoring transitions
  4. Question Bank
  5. Quiz Builder
  6. Students
  7. Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — final Admin design/interaction convergence audit
- AB-06 — frontend/backend performance and delivery validation + evidence-based budgets
- AB-07 — legacy removal + hard dependency enforcement
- AB-08 — final Super Admin + full Backend verification and live-main reconciliation

No merge/readiness before AB-08 exact-head green.

## Immediate continuation authority

Always read first:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

The next engineering mutation after Worker A sequence 1 is AB-01.3, subject to the live handoff/state and exact branch evidence at the next run.
