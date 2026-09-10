# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13G G-A Accounts + Access Codes VERIFIED; G-B Notifications + Operations Dashboard ACTIVE on Track A.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` (Stage13F closure checkpoint).
- Track A branch: `integration/stage13g-admin-product`.
- G-A verified runtime HEAD: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
- Track B branch: `parallel/stage14-student-product`; its own workstream files remain its Source of Truth.
- Shared execution ledger: Issue #16.
- Current model: **Parallel Two-Track Execution**.
- Deployment/release work remains deferred; no hosting action is part of current Stage13G.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; live provider bootstrap `AI-012-019` = `NOT YET VERIFIED` |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F | VERIFIED / CLOSED / PROMOTED |
| Stage13G G-A Accounts + Access | **VERIFIED** |
| Stage13G G-B Notifications + Operations | **ACTIVE — discovery** |
| Stage13G G-C Reports/Import-Export/Settings/Security/Audit | REQUIRED |
| Stage13G G-D Remaining Admin AI-authoring parity | REQUIRED |
| Stage14 | parallel Track B; verify from Track B Source of Truth before changing its state |
| Stage15–25 | REQUIRED in roadmap order |
| Stage26–29 | future release/deployment track |

## Stage13G G-A — VERIFIED

### Backend authority

Classification:

- existing `AccessService`: **KEEP + IMPROVE**;
- existing `AuthService`: **KEEP + IMPROVE**;
- Admin accounts/access read + maintenance projection: **REBUILD as bounded Admin layer**, without duplicating redemption/recovery authority.

Implemented:

- migration `0023_admin_access_operations.sql`;
- bounded code inventory/search/filter/sort/pagination;
- safe non-destructive revoke for unused codes with `code_revoked` audit event;
- bounded Student account list/detail projection;
- entitlement/device/redemption/auth/access activity projection;
- Admin routes for inventory/detail/revoke while existing Access/Auth services remain mutation authorities.

### Admin product

Implemented in `apps/admin-web`:

- real **الطلاب والوصول** workspace;
- Student search/status/sort/page + account detail;
- temporary-password recovery using existing AuthService;
- device rebind using existing AuthService;
- active entitlement revoke using existing AccessService;
- Full/Class code inventory, filtering, generation and bulk unused-code revoke;
- loading/error/empty/session-expiry states;
- responsive 390px card-based layout.

### G-A exact-head evidence

Runtime/test HEAD:

`4822f87d60ab7a467c4708b5f75bb24cb90e7738`

Workflow run:

`34425317912` — **SUCCESS**

Jobs:

- Stage13G Accounts + Access backend — SUCCESS;
- Stage13G Accounts + Access Admin UI quality — SUCCESS;
- Stage13G Real API + PostgreSQL + Chromium — SUCCESS, **4/4 browser scenarios**.

Covered evidence includes API/Admin lint, strict typecheck, unit tests, builds, clean PostgreSQL migrations through `0023`, DB contract, Stage13G integration, Access/Auth regressions, deterministic real fixture, recovery/device/entitlement operations, code generate/revoke, real session expiry and 390px no-overflow.

## Stage13G G-B Discovery — verified so far

Inspected `0003_learning.sql`, API source inventory and parity matrix.

- PostgreSQL already has `notifications` + `notification_reads`, `notification_severity`, global/class/profile targeting, expiry and read timestamps: **KEEP + IMPROVE schema**.
- No notification service/module is present in the current `apps/api/src` inventory: Admin/Student notification API remains **REBUILD / NOT YET VERIFIED**.
- Admin parity requires: global notification create, validated title/body, paginated sent list, delete, Student visibility.
- Admin Dashboard parity requires real counts for classes/subjects/lessons/access/accounts plus latest notifications/activity.

## Findings

| ID | Sev | Area | Status |
|---|---:|---|---|
| `DOC-013G-001` | P2 | operating-model documentation drift | **RESOLVED** by `8501ced93ba751b7fd40f2cf2dcdbd29738feb31` |
| `ADMIN-013G-ACCESS-002` | P1 | Admin access-code inventory/operations | **FIXED + VERIFIED** on G-A |
| `ADMIN-013G-ACCOUNT-003` | P1 | Admin Student account/recovery/device workspace | **FIXED + VERIFIED** on G-A |
| `ADMIN-013G-RECOVERY-004` | P1 | temporary password disappeared during same-account refresh | **FIXED + VERIFIED** before final Chromium |
| `TEST-013G-005` | P3 | session-expiry E2E initially did not trigger a post-logout request | **RESOLVED**; final test triggers a real request and passes |
| `ADMIN-013G-NOTIF-006` | P1 | notification schema exists but product service/UI absent | **OPEN — G-B** |
| `ADMIN-013G-DASH-007` | P1 | real operations dashboard remains absent | **OPEN — G-B** |
| `AI-012-019` | P2 | live provider bootstrap | **OPEN / NOT YET VERIFIED** |

## Immediate Next Action

Implement G-B incrementally from the existing notification schema and durable event sources: first freeze the notification/operations contract, then backend integration, Admin UI, real Chromium, documentation and Issue #16 evidence. Do not add a second audit/event authority and do not block current work on deployment.