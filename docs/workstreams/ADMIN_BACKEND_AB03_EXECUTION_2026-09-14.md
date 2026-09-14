# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.1 Overview + Operations**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order:

1. Overview + Operations — ACTIVE
2. Curriculum + Content + OCR — PENDING
3. AI Jobs + AI Review + contextual authoring — PENDING
4. Question Bank — PENDING
5. Quiz Builder — PENDING
6. Students — PENDING
7. Access Codes — PENDING

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations

### Current owners

- `apps/admin-web/src/admin/overview/AdminOverviewPage.tsx` owns the Overview presentation.
- `apps/admin-web/src/admin/operations/*` still owns health, audit, diagnostics, notifications, shared Operations presentation/model code and styles.
- `apps/admin-web/src/features/operations/api/admin-operations-api.ts` owns Operations transport/types behind `features/operations/public`.
- `apps/admin-web/src/app/router/AdminRoutes.tsx` lazy-loads the current Overview/Operations presentation owners.
- `apps/api/src/admin-operations/service.ts` reads authoritative PostgreSQL operational state for governance/attention inputs and the multi-source audit stream.
- `apps/api/src/admin-operations/http.ts` owns admin authorization and HTTP query validation.
- `apps/api/src/admin-operations/attention.ts` owns the pure actionable projection used by Overview.
- `apps/api/src/admin-operations/attention-application.ts` owns the attention orchestration use case.

No schema or migration change is currently justified for AB-03.1.

### AB-03.1.1 — Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`.

Closure evidence: Architecture Guard `34859593842`, Admin AI `34860142887`, Combined Integration `34860142983`, Stage13G Admin Operations `34860143008` — **SUCCESS**.

### AB-03.1.2 — Operations frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Corrected source checkpoint: `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.

Final ownership:

- `features/operations/api/admin-operations-api.ts` owns the Operations transport/types;
- `features/operations/public` is the narrow consumer boundary;
- stale root imports/tests were removed/corrected;
- endpoint/query/body/response/session semantics, routes/styles, backend/API authority, PostgreSQL schema/migrations, security authority and Student frontend behavior were preserved.

Closure evidence: Architecture Guard `34870253383`, Frontend Preparation `34870253413`, Admin AI Operations `34870253417`, Combined Integration `34870253434`, Stage13G Admin Operations `34870253431` — **SUCCESS**.

### Worker A sequence 39 — fresh AB-03.1 discovery decision

This increment was deliberately **discovery-only**. No production source, test, migration or workflow mutation was made.

Repository evidence shows the server side does not currently justify another correction: HTTP remains limited to admin authorization/query validation; attention orchestration is application-owned; operational/governance/audit reads stay PostgreSQL-backed in the Admin Operations service; existing integration/security/Chromium evidence is green.

The remaining justified ownership defect is on the Admin presentation-model boundary:

- `apps/admin-web/src/admin/operations/operations-model.ts` contains Operations/Overview presentation policy such as attention-item projection, labels and date/audit formatting;
- its test remains under the same legacy `admin/operations` owner;
- `AdminOverviewPage.tsx` and `AdminOperationsHealthPage.tsx` import those helpers from that legacy owner;
- `features/operations` currently owns only API/public transport, leaving permanent split feature ownership if AB-03.1 were closed now.

This is architecture debt backed by current code, not a speculative redesign. The smallest root correction is therefore model ownership only, not a page/style rewrite.

### AB-03.1.3 — Operations presentation-model ownership — NEXT

Required scope:

1. move `operations-model.ts` and `operations-model.test.ts` under `apps/admin-web/src/features/operations/model/`;
2. expose only the helpers/types actually needed by consumers through `features/operations/public`;
3. switch Overview and Operations consumers to that public boundary;
4. preserve copy, routes, CSS, API/transport contracts, session behavior, PostgreSQL/schema/migrations, backend/security authority and Student frontend behavior;
5. do not move presentation pages or styles in the same increment.

Required verification before closure:

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- relevant Operations/API/PostgreSQL/security/integration gates;
- real API + PostgreSQL + Admin Chromium regression.

After AB-03.1.3 green evidence, perform a fresh slice-closure decision. Do not begin Curriculum + Content + OCR in the same increment.