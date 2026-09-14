# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.1.2 Operations frontend API ownership selected by live discovery.**

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

### AB-03.1.2 — Operations frontend API ownership — DISCOVERED / NEXT

Worker C sequence 35 inspected the live Admin Overview/Operations ownership and found one smallest root correction:

- root `apps/admin-web/src/admin-operations-api.ts` still contains feature-specific Operations response types plus all transport calls for attention, overview, governance, diagnostics, audit and notifications;
- `AdminOverviewPage`, `AdminOperationsHealthPage`, `AdminOperationsAuditPage` and sibling Operations pages consume this adapter;
- `AdminRoutes.tsx` still points at legacy page locations, but moving all pages/models/styles at once would mix concerns and violate the smallest-increment rule;
- the adapter is therefore the clean first frontend ownership seam for this vertical slice.

Target increment:

1. move the adapter unchanged into `apps/admin-web/src/features/operations/api/`;
2. expose required contracts/functions through `apps/admin-web/src/features/operations/public/index.ts`;
3. update existing Overview/Operations consumers to use the public feature boundary;
4. delete root `apps/admin-web/src/admin-operations-api.ts` after all imports switch;
5. do not move pages/models/CSS, alter route IA, redesign UX, or change request/response/session/backend/PostgreSQL behavior.

Verification after implementation: Architecture Guard; Admin lint/typecheck/unit/build; focused Overview/Operations tests; Combined Integration; Stage13G real API + PostgreSQL + Chromium. No migration is expected.

## Exact continuation

Implement **AB-03.1.2 only**. After green affected-scope evidence, close it and run a fresh Overview + Operations discovery pass. Do not start Curriculum/Content/OCR in the same increment.
