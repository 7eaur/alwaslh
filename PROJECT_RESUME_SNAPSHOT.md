# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest continuation checkpoint. Code/migrations/executable CI outrank prose.

Last synchronized: **2026-09-10 — Stage13G G-A/G-B verified, G-C active.**

## Execution

- Repo: `7eaur/alwaslh`.
- Main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Track A: `integration/stage13g-admin-product`.
- Track B: `parallel/stage14-student-product`.
- Shared ledger: Issue #16.
- Model: Parallel Two-Track.

## Verified Runtime Checkpoints

- Stage13E: `d5ebc7f25a369430387a758c7c0bb89350963d67`.
- Stage13F/main closure: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13G G-A: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.
- Stage13G G-B: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`, Chromium 7/7.

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
- Operations is default Admin home;
- Admin unit total now 49; real Chromium 7/7 for G-A+G-B.

Student notification UI is **not** part of G-B closure; only its backend feed/read authority is verified.

## Root-Cause Notes

- G-B first integration failed because it expected `activeClasses=1` after G-A had already inserted a fixture. Query was correct; test was order-coupled. Fixed by baseline/delta metrics and guaranteed app close.
- one-time temporary password refresh defect and session-expiry false-negative were fixed earlier in G-A.
- no quality rules or feature assertions were disabled.

## Current Next Action

G-C1: code import/template/export/print on existing Access authority.
Then G-C2: reports/settings/security/audit after real schema/config inspection.
Then G-D: remaining lesson/quiz AI-authoring parity.
Then update Legacy Coverage, adapt older E2E login helpers to Operations default, run wider exact-head matrix and only then consider main promotion.

Open: `AI-012-019` live provider = NOT YET VERIFIED.
