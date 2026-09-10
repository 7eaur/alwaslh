# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest continuation checkpoint. Code, migrations and executable CI evidence outrank prose.

Last synchronized: **2026-09-10 — Stage13G G-A Accounts + Access VERIFIED; G-B Notifications + Operations Dashboard ACTIVE.**

## Current Execution Model

- Repo: `7eaur/alwaslh`.
- Issue #16 = cross-track execution ledger.
- Track A: Backend/Admin/DB/AI/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product on `parallel/stage14-student-product`.
- Shared backend authority crosses tracks through verified `main`.
- No duplicate durable authority.
- Deployment/cutover remains future-only.

## Current Verified Shared Authority

- Stage13E: VERIFIED / CLOSED.
- Stage13F: VERIFIED / CLOSED / PROMOTED.
- Shared `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13G G-A runtime/test HEAD: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.

## Stage13G G-A Evidence

Final workflow run:

`34425317912` — **SUCCESS**.

Passed jobs:

- Accounts + Access backend;
- Accounts + Access Admin UI quality;
- Real API + PostgreSQL + Chromium — 4/4.

Verified capabilities:

- Student search/status/detail;
- entitlement/device/redemption/activity visibility;
- temporary-password recovery without password retrieval;
- device rebind;
- entitlement revoke;
- Full/Class code list/search/filter/sort/page;
- Full/Class code generation;
- safe unused-code batch revoke with audit;
- real Admin session-expiry handling;
- 390px responsive no-overflow.

Important implementation rule: existing `AccessService` and `AuthService` remain canonical mutation authorities. Stage13G added a bounded Admin read/maintenance layer rather than duplicating security/business logic.

## G-A Root-Cause History

- Biome formatting/import ordering — fixed without disabling lint.
- Zod query boundary initially inferred `unknown`, then optional number — corrected with validated coercion + explicit defaults; no unsafe casts.
- Admin temporary password was initially cleared by same-account reload — real UX defect fixed so it clears on account switch, not same-account refresh.
- first final-browser attempt `34425093946` = 3/4 because session-expiry test made no request after logout; test changed to submit a changed search, producing a real 401; final run passed 4/4.

## Current G-B Discovery

Verified from `0003_learning.sql`, API inventory and parity matrix:

- `notifications` + `notification_reads` already exist;
- schema supports severity, global/class/profile targeting, action path, published/expiry timestamps and read timestamps;
- current API source has no notification module;
- Admin parity requires global create, title/body validation, paginated sent list, delete, Student visibility;
- Operations parity requires real curriculum/access/account counts plus latest notifications/activity.

Architecture:

- notification schema: **KEEP + IMPROVE**;
- notification service/API/Admin UI: **REBUILD**;
- operations dashboard: **REBUILD thin aggregate read model** over canonical tables/events; no second analytics store.

## Open Boundaries

- `ADMIN-013G-NOTIF-006` — G-B OPEN.
- `ADMIN-013G-DASH-007` — G-B OPEN.
- G-C reports/import-export/settings/security/audit — REQUIRED.
- G-D lesson-centric/quiz AI-authoring parity left open by Stage13F — REQUIRED.
- `AI-012-019` — live provider `NOT YET VERIFIED`.
- Stage14+ status must be read from Track B Source of Truth before claiming latest progress.
- Stage26–29 deployment/release remain deferred.

## Exact Next Actions

1. confirm Track A branch/HEAD/Actions;
2. implement G-B backend notification + operations contract on existing schema/events;
3. PostgreSQL integration tests;
4. Admin typed client/workspaces;
5. real Chromium/session/mobile evidence;
6. update Source of Truth + Issue #16;
7. continue G-C → G-D → wider Stage13G closure.

## Mandatory Startup for Replacement Conversation

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → docs/product/CURRENT_PRODUCT_OVERRIDES.md → Issue #16 → live main/branch/Actions → current-stage code/tests`.

Anything not inspected/executed remains `NOT YET VERIFIED`.
