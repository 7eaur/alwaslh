# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.1.2 Operations frontend API ownership implemented; awaiting full affected-scope CI.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. AB-02 → AB-03 reconciliation found no Admin/API/PostgreSQL implementation overlap; shared docs remain deliberately branch-local until final reconciliation.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Global shell, inner routing, lazy workflow boundaries and auth login presentation ownership are closed. Canonical evidence is retained in `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1.1 — Operations attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Source checkpoint `5c36365888486cf8297893467bfc4e1c97bc6b43` moved governance/audit orchestration from HTTP into `admin-operations/attention-application.ts`, retained HTTP authorization/query validation, added a dedicated application-owner test and preserved API/PostgreSQL/security behavior. Closure: Guard `34859593842`, Admin AI `34860142887`, Combined `34860142983`, Stage13G `34860143008` — SUCCESS.

### AB-03.1.2 — Operations frontend API ownership — IMPLEMENTED / WAITING_FOR_CI

Worker A sequence 36 implemented only the previously selected transport ownership seam.

Source checkpoint: `75cab6ca1067f5866a259ad079279757218e805f`.

Changes:

- moved the Operations-specific transport/types from root `apps/admin-web/src/admin-operations-api.ts` to `apps/admin-web/src/features/operations/api/admin-operations-api.ts`;
- added `apps/admin-web/src/features/operations/public/index.ts` as the feature public contract;
- switched `AdminOverviewPage`, `AdminOperationsHealthPage`, `AdminOperationsAuditPage`, `AdminOperationsDiagnosticsPage`, and `AdminNotificationsPage` to import the adapter through the public feature boundary;
- deleted the root transitional adapter after consumers switched;
- preserved all exported type/function names and endpoint/query/body/session behavior;
- changed no Overview/Operations page ownership, model, style, route structure, backend/API implementation, PostgreSQL schema/migration, security authority or Student frontend implementation.

Verification on the implementation HEAD:

- Architecture Guard `34866606170` — **SUCCESS**.
- Frontend Preparation `34866606173` — pending/not fully closed at handoff.
- Admin AI Operations `34866606148` — in progress/not fully closed at handoff.
- Combined Integration `34866606220` — pending/not fully closed at handoff.
- Stage13G Admin Operations `34866606179` — pending/not fully closed at handoff.

Because required affected-scope CI is not fully green yet, this subtask remains `WAITING_FOR_CI`; no second architecture seam was started.

## Exact continuation

Verification/closure of **AB-03.1.2 only**:

1. inspect the remaining exact implementation-head runs, or source-tree-equivalent runs if documentation-only commits supersede them;
2. require Admin quality plus Combined and Stage13G real API + PostgreSQL + Chromium to be green;
3. if a real failure appears, fix its root cause within AB-03.1.2 only;
4. if all required evidence is green, close AB-03.1.2 and then perform a fresh discovery-only pass inside Overview + Operations;
5. do not begin Curriculum/Content/OCR in the same increment.
