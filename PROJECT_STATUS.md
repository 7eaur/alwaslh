# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13G G-A/G-B/G-C1 VERIFIED; G-C2 Reports / Settings / Security / Audit ACTIVE on Track A.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — Stage13F promoted authority.
- Track A branch: `integration/stage13g-admin-product`.
- Last verified Track A runtime/code HEAD: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`.
- Latest verified Track A workflow: `34430915626` — SUCCESS.
- Track B: `parallel/stage14-student-product`; its own workstream files are its execution truth.
- Shared ledger: Issue #16.
- Operating model: **Parallel Two-Track Execution**.
- Deployment/release remains deferred; no hosting action is part of current Stage13G.

A documentation-only handoff commit may sit above the verified runtime HEAD. Do not mistake prose-only HEAD movement for a new runtime verification point.

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
| Stage13G G-C1 Code Import / Export / Print | **VERIFIED** |
| Stage13G G-C2 Reports / Settings / Security / Audit | **ACTIVE — CURRENT** |
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

Boundary: Student notification **API visibility/read authority is verified**, but Student notification product UI/sync remains Stage18 Track B/later roadmap.

## Stage13G G-C1 — VERIFIED

Runtime/code HEAD: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`.
Workflow: `34430915626` — **SUCCESS**.

Verification on the same runtime code HEAD:

- API lint / strict typecheck / unit / build: SUCCESS;
- clean PostgreSQL migrations through `0023`: SUCCESS;
- Stage13G Accounts + Access integration: SUCCESS;
- Notifications + Operations integration: SUCCESS;
- Access/Auth regressions: SUCCESS;
- Admin lint / strict typecheck / **57 unit tests** / build: SUCCESS;
- real API + PostgreSQL + Chromium: **10/10 passed**.

Implemented outcomes:

- strict bounded Full Access code import endpoint using existing Access tables, not a second code store;
- Arabic-digit normalization, exact 6-digit validation, per-row errors, duplicate-in-file and duplicate-existing handling;
- valid rows can commit while invalid rows return explicit result details;
- import writes durable Access audit events;
- import CSV template with explicit duration field;
- full/class code export over the canonical Admin access projection with pagination consistency checks;
- UTF-8 BOM CSV output compatible with Excel and guarded against spreadsheet formula injection;
- all/filtered/used and explicit selected-code scopes where applicable;
- RTL printable code-card workspace with explicit selected/filtered scope and browser Save-as-PDF path;
- real session-expiry behavior and 390px no-horizontal-overflow evidence.

Important boundary: **no binary `.xlsx` generator and no server-generated binary PDF is claimed**. Current verified spreadsheet output is CSV/Excel-compatible; current verified PDF outcome is browser print/Save as PDF.

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
| `ADMIN-013G-CODEIO-009` | P1 | Code import/export/print parity absent | FIXED + VERIFIED G-C1 |
| `SEC-013G-CSV-010` | P2 | Spreadsheet formula injection risk | FIXED + VERIFIED sanitizer tests |
| `UX-013G-SCOPE-011` | P2 | Initial print/export lacked explicit selected scope | FIXED before closure + Chromium verified |
| `AI-012-019` | P2 | live provider bootstrap | OPEN / NOT YET VERIFIED |

## G-C2 — Current Boundary

First incomplete Track A work is **Reports / Settings / Security / Audit**.

Required approach:

1. inspect actual config and schema before creating editable settings;
2. inspect existing `auth_events`, `access_events`, content/media/OCR/AI/review/question-bank/quiz event authorities;
3. prefer bounded read projections/search/filter/export over a second generic audit store;
4. never expose password hashes, reset/device challenge tokens, raw device public-key material, provider credentials or secret config;
5. keep runtime/security configuration server-owned unless a verified business rule requires an Admin-editable setting;
6. add executable API/PostgreSQL/Admin/Chromium evidence for any new product surface;
7. explicitly map specialized Quiz/Lesson reports/exports instead of silently treating generic CSV as parity.

After G-C2: execute G-D remaining lesson/quiz AI-authoring parity, then Legacy Coverage + wider exact-head regression + closure gates.
