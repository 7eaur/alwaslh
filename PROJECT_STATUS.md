# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13G G-A + G-B VERIFIED; G-C Import/Export/Reports + Settings/Security/Audit ACTIVE on Track A.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — Stage13F promoted authority.
- Track A branch: `integration/stage13g-admin-product`.
- Track B: `parallel/stage14-student-product`; its own workstream files are its execution truth.
- Shared ledger: Issue #16.
- Operating model: **Parallel Two-Track Execution**.
- Deployment/release remains deferred; no hosting action is part of current Stage13G.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; live provider `AI-012-019` NOT YET VERIFIED |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F | VERIFIED / CLOSED / PROMOTED |
| Stage13G G-A Accounts + Access | **VERIFIED** |
| Stage13G G-B Notifications + Operations | **VERIFIED** |
| Stage13G G-C Import/Export/Reports + Settings/Security/Audit | **ACTIVE** |
| Stage13G G-D Remaining Admin AI-authoring parity | REQUIRED |
| Stage14 | parallel Track B; verify from Track B Source of Truth |
| Stage15–25 | REQUIRED |
| Stage26–29 | future release/deployment |

## Stage13G G-A — VERIFIED

Runtime HEAD: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
Workflow: `34425317912` — SUCCESS.
Chromium: **4/4**.

Verified outcomes:

- Student account list/search/status/detail;
- entitlement/device/redemption/Auth/Access history projection;
- safe temporary-password recovery and device rebind via existing AuthService;
- entitlement revoke via existing AccessService;
- Full/Class code list/search/filter/sort/pagination/generation;
- non-destructive unused-code revoke + durable `code_revoked` audit;
- session expiry + 390px responsive behavior.

## Stage13G G-B — VERIFIED

Runtime HEAD: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Workflow: `34428052472` — SUCCESS.
Chromium: **7/7** total G-A + G-B scenarios.

Implemented authority:

- existing `notifications` / `notification_reads` schema retained as canonical store;
- Admin notification create/list/search/filter/page/delete;
- validated title/body/severity/internal action path/expiry;
- Student notification feed from the same store with global/class/profile visibility and unread/read tracking;
- Admin Operations overview with live counts for curriculum/students/access/notifications;
- latest Auth/Access activity and latest notifications, without a second analytics/event store;
- **لوحة التشغيل** is now the real Admin home;
- notification UI has inline two-step delete confirmation, loading/error/empty/session states and 390px layout.

Verification includes:

- API lint, strict typecheck, unit, build;
- clean PostgreSQL migrations through `0023`;
- G-A and G-B integration tests + Access/Auth regressions;
- Admin lint/typecheck **49 unit tests**/build;
- real API + PostgreSQL + Chromium **7 passed** including notification lifecycle, dashboard data, real session expiry and mobile no-overflow.

Boundary: Student notification **API visibility/read authority is verified**, but Student notification product UI/sync remains Stage18 Track B/later roadmap; do not claim that Student UX complete.

## Current Findings

| ID | Sev | Area | Status |
|---|---:|---|---|
| `DOC-013G-001` | P2 | Source-of-Truth drift | RESOLVED |
| `ADMIN-013G-ACCESS-002` | P1 | Accounts/access Admin product | FIXED + VERIFIED G-A |
| `ADMIN-013G-ACCOUNT-003` | P1 | Student account/recovery/device UX | FIXED + VERIFIED G-A |
| `ADMIN-013G-RECOVERY-004` | P1 | temp password lost on same-account refresh | FIXED + VERIFIED |
| `TEST-013G-005` | P3 | session-expiry E2E did not trigger request | RESOLVED |
| `ADMIN-013G-NOTIF-006` | P1 | Notification Admin authority/UI absent | FIXED + VERIFIED G-B |
| `ADMIN-013G-DASH-007` | P1 | Real operational Admin home absent | FIXED + VERIFIED G-B |
| `TEST-013G-008` | P2 | G-B metrics test assumed empty DB after G-A | RESOLVED with baseline/delta isolation |
| `AI-012-019` | P2 | live provider bootstrap | OPEN / NOT YET VERIFIED |

## G-C Active Boundary

Inspect before implementation, then close only evidence-backed outcomes:

1. CODE-A-013/014 strict code import + template;
2. CODE-A-015/016 export scopes;
3. CODE-A/PRINT printable code cards where still required;
4. export/report history and safe RTL output boundaries;
5. Settings/Security/Audit product surface based on existing server authorities, not browser-owned configuration;
6. account-delete semantics remain explicit; do not overload access revoke as account deletion.

Specialized Quiz/Lesson export variants that remain open must be mapped deliberately. G-D remains separate for generation/orchestration parity.
