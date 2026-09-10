# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest continuation checkpoint. Code/migrations/executable CI outrank prose.

Last synchronized: **2026-09-10 — Stage13G G-A/G-B/G-C1 VERIFIED; G-C2 is the next/current Track A slice.**

## Execution

- Repo: `7eaur/alwaslh`.
- Shared main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Track A: `integration/stage13g-admin-product`.
- Track B: `parallel/stage14-student-product`.
- Shared ledger: Issue #16.
- Model: Parallel Two-Track.
- Production deployment/cutover remains future-only.

## Verified Runtime Checkpoints

- Stage13E: `d5ebc7f25a369430387a758c7c0bb89350963d67`.
- Stage13F/main closure: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13G G-A: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.
- Stage13G G-B: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`, Chromium 7/7 total.
- Stage13G G-C1: **`345e0712c45e9e4c0479dc65d96efc3fb7da33cd`**, run **`34430915626`**, all workflow jobs SUCCESS, Chromium **10/10 total**.

A documentation-only commit may be the live branch HEAD above `345e0712...`. Treat `345e0712...` as the last executable runtime authority until new code changes pass a new exact-head gate.

## G-A Authority

- canonical Admin Student list/detail and account status projection;
- existing AuthService remains temporary-password/device-rebind authority;
- existing AccessService remains generation/redemption/entitlement authority;
- code inventory/filter/sort/page + bulk unused-code revoke;
- durable audit and responsive/session browser evidence.

## G-B Authority

- existing notification tables retained;
- one `NotificationService` for Admin create/list/delete and Student visibility/read tracking;
- global/class/profile target model at backend;
- real Operations dashboard aggregates canonical state at read time;
- latest Auth/Access activity + latest notifications;
- Operations is default Admin home.

Student notification UI is **not** part of G-B closure; only backend feed/read authority is verified.

## G-C1 Authority

Backend:

- strict bounded Full Access code import endpoint over existing Access tables;
- exact 6-digit validation after Arabic-digit normalization;
- row-level invalid / duplicate-in-file / duplicate-existing outcomes;
- accepted rows persist with canonical code lifecycle fields;
- import operations emit Access audit events;
- no new code store or alternate redemption authority.

Admin product:

- `AdminReportsWorkspace` added as a dedicated files/reports surface;
- import template and import result report;
- canonical access-code export with pagination consistency protection;
- UTF-8 BOM CSV compatible with Excel;
- spreadsheet formula-injection protection;
- explicit filtered/used/selected output scopes;
- RTL printable code cards with selected/filtered scope;
- browser Print / Save-as-PDF;
- session-expiry and 390px responsive state.

Verification on runtime/code HEAD `345e0712...`:

- API lint/typecheck/unit/build: SUCCESS;
- migrations through 0023 on clean PostgreSQL: SUCCESS;
- G-A integration: SUCCESS;
- G-B integration: SUCCESS;
- Access/Auth regressions: SUCCESS;
- Admin lint/typecheck/**57 unit**/build: SUCCESS;
- real API/PostgreSQL/Chromium: **10 passed**.

Boundary: binary `.xlsx` generation and server-side binary PDF are **not claimed**.

## Root-Cause Notes

- G-B first integration failure was test order-coupling, not query behavior; fixed with baseline/delta metrics.
- G-C1 first backend candidate failed Biome only (import order/format); corrected without weakening rules.
- G-C1 initially lacked explicit selected-code print/export scope. That parity gap was found before closure, fixed, and reverified on `345e0712...`.
- CSV output sanitizes spreadsheet formula-leading cells.
- no quality rules or feature assertions were disabled.

## Current Next Action — G-C2

Start **Reports / Settings / Security / Audit**.

Before implementation inspect actual authorities:

1. Auth security/audit: `auth_events`, sessions, guards, recovery/device/challenge state.
2. Access audit: `access_events`, redemptions, entitlements, code lifecycle.
3. Content/media/OCR/AI/review/question-bank/quiz event/history tables and services.
4. API runtime config and environment-owned settings.
5. Legacy Coverage rows requiring reports/settings/security/audit product outcomes.

Architectural default: build bounded Admin read models, filters, pagination and safe exports over existing canonical authorities. Do not create a generic audit store or browser-owned configuration unless an inspected business requirement proves it necessary.

Never expose password hashes, token hashes, raw device key material, provider credentials or secret runtime config.

Then run API/PostgreSQL/Admin/real Chromium evidence and update all Source of Truth.

After G-C2: G-D remaining lesson/quiz AI authoring parity → Legacy Coverage synchronization → adapt older Admin E2E helpers to Operations default → wider exact-head matrix → Stage13G closure/promotion gate.

Open: `AI-012-019` live provider = `NOT YET VERIFIED`.
