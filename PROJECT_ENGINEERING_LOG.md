# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for architecture, findings, changes, verification and remaining work. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-10 — Stage13F promoted to main; Stage13G Track A discovery active.**

## 1. Current Architecture / Operating Model

Runtime surfaces:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin Web.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.

Current execution model: **Parallel Two-Track Execution**.

- Track A owns API/Admin/DB/AI/generation/Question Bank/Quiz Builder/current Stage13G.
- Track B owns Student Product Stage14+.
- Issue #16 is the cross-track execution ledger.
- Shared backend contracts move through verified `main`.
- No duplicate durable authority is allowed to avoid integration.

Stable architecture rules from earlier verified stages remain unchanged: Auth/Access are server-owned; Full Code = 6 digits; Class Code = 7 digits; Curriculum hierarchy remains canonical; media readiness is not publication; AI/provider output is never automatic educational authority; Stage13F published bank/quiz revisions are immutable authority for later Student assessment.

## 2. Stage State

- Stage1–10 + OCR: VERIFIED.
- Stage11: VERIFIED.
- Stage12: VERIFIED backend/runtime; live provider bootstrap `AI-012-019` remains `NOT YET VERIFIED`.
- Stage13A–E: VERIFIED/CLOSED.
- Stage13F: **VERIFIED/CLOSED/PROMOTED**.
- Stage13G: **ACTIVE on `integration/stage13g-admin-product`**.
- Stage14: parallel Track B IN PROGRESS.

Stage13F final integration checkpoint: `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` after PR #27 and PR #28 each completed 13/13 SUCCESS and closed unmerged.

## 3. Stage13G Discovery

### Access / Codes

Inspected:

- `database/migrations/0002_access.sql`
- `database/migrations/0006_access_contract.sql`
- `apps/api/src/access/http.ts`
- `apps/api/src/access/service.ts`

Classification: **KEEP + IMPROVE**.

Evidence:

- PostgreSQL owns Full/Class code format and unique identity.
- AccessService already owns secure generation, idempotent redemption, entitlement renewal, revoke and access audit events.
- HTTP currently exposes Admin generation + entitlement revoke, but no Admin inventory/read/export/delete/import operations.

Decision: extend AccessService and Admin contracts; do not build a second access-code authority.

### Student Account / Auth Operations

Inspected:

- `database/migrations/0010_student_auth_device.sql`
- `apps/api/src/auth/http.ts`
- `apps/api/src/auth/service.ts`

Classification: **KEEP + IMPROVE**.

Evidence:

- existing service owns secure recovery and device-rebind mutations;
- sessions/device challenges/device history are server/PostgreSQL-owned;
- auth events provide durable audit evidence;
- existing credential values are intentionally not an Admin read contract.

Decision: Stage13G adds a canonical Admin Student read model and UI around existing mutation authority.

### Admin Web

Inspected current `apps/admin-web/src` inventory and `admin-api.ts`.

Classification:

- existing Curriculum/Content/AI/Question Bank/Quiz Builder workspaces: **KEEP**;
- Accounts/Access Codes/Notifications/Operations workspaces: **REBUILD new product surfaces**, reusing server authority.

## 4. Findings

| ID | Sev | Area | Problem | Impact | Solution | Status |
|---|---:|---|---|---|---|---|
| `DOC-013G-001` | P2 | Documentation | README/Index/Overrides/Single Owner still contained pre-promotion or superseded operating state | new engineer could start from wrong model | synchronize current two-track model and Stage13G state | FIX IN PROGRESS |
| `ADMIN-013G-ACCESS-002` | P1 | Access Admin | secure access authority lacks Admin inventory/operations read contract | CODE-A/ENT Admin parity incomplete | extend existing AccessService with bounded Admin operations | OPEN |
| `ADMIN-013G-ACCOUNT-003` | P1 | Student Admin | recovery/device authority exists but no canonical account read model/workspace | ACCOUNT-A parity incomplete | add bounded Admin Student projection + reuse existing mutations | OPEN |
| `AI-012-019` | P2 | Live AI | provider benchmark/routes/credentials/bootstrap not proven | live generation readiness unknown | explicit later runtime evidence | OPEN / NOT YET VERIFIED |

## 5. Stage13G Plan

### G-A — Accounts + Access Codes

- bounded code list/search/filter/sort/pagination;
- account list/search/status/detail;
- entitlement/code/device/auth-history projection;
- safe unused-code delete/bulk delete semantics;
- recovery/device Admin UX using existing AuthService methods;
- real PostgreSQL/API/Admin/Chromium evidence.

### G-B — Notifications + Operations Dashboard

Inspect first; build only on real notification/event authority.

### G-C — Import/Export/Reports + Settings/Security/Audit

Validated scoped operations; no browser-owned authority.

### G-D — Remaining lesson/quiz generation parity

Close only rows with executable evidence; preserve `NOT YET VERIFIED` elsewhere.

## 6. Documentation / Verification Contract

During Stage13G keep Status + this log current, then synchronize Queue/Continuity/Handoff/Resume/specialized docs and Legacy Coverage at meaningful checkpoints. Every batch posts an Issue #16 EXECUTION REPORT with exact HEAD/run IDs.
