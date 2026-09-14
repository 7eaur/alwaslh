# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.1 discovery identified the remaining Operations presentation-model ownership seam.**

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

### AB-03.1.2 — Operations frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Corrected source checkpoint: `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.

Final ownership:

- `features/operations/api/admin-operations-api.ts` owns the Operations transport/types;
- `features/operations/public` is the narrow consumer boundary;
- stale root imports/tests were removed/corrected;
- endpoint/query/body/response/session semantics, routes/styles, backend/API authority, PostgreSQL schema/migrations, security authority and Student frontend behavior were preserved.

Closure evidence: Architecture Guard `34870253383`, Frontend Preparation `34870253413`, Admin AI Operations `34870253417`, Combined Integration `34870253434`, Stage13G Admin Operations `34870253431` — SUCCESS.

### Worker A sequence 39 — AB-03.1 discovery-only decision

No executable production/test/migration/workflow mutation was made. Fresh inspection confirmed:

- backend HTTP still owns admin authorization and Zod query validation only;
- attention orchestration is application-owned;
- `AdminOperationsService` remains PostgreSQL-backed canonical operational/audit authority;
- the frontend feature now owns transport/types behind `features/operations/public`;
- however `apps/admin-web/src/admin/operations/operations-model.ts` and its colocated test still own the Operations presentation-model mapping outside the feature, and current Overview/Health presentation imports that legacy owner;
- `AdminRoutes.tsx` still lazily imports legacy presentation owners under `admin/overview` and `admin/operations`, which is acceptable transitional debt for now but confirms AB-03.1 is not yet ready to close.

Root decision: do not invent an API/schema/security rewrite. The next smallest coherent correction is **AB-03.1.3 Operations presentation-model ownership** only: move the presentation model + test under `features/operations/model`, publish only needed helpers/types through `features/operations/public`, and switch existing consumers. Preserve copy, routes, API/DB/security contracts, styles and Student frontend. Page/style migration is explicitly excluded from that increment.

Required closure gates for AB-03.1.3: Architecture Guard; Admin lint/typecheck/unit/build; relevant Operations/API/PostgreSQL/integration/security gates; real Admin Chromium regression because Overview/Health consumers change imports even though behavior must remain identical.

## Exact continuation

Execute **AB-03.1.3 Operations presentation-model ownership** and nothing broader. After green evidence, re-run AB-03.1 closure discovery before deciding whether presentation pages/styles themselves need migration or the slice can advance. Do not begin Curriculum/Content/OCR in the same increment.