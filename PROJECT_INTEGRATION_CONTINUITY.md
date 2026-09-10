# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> Operational continuity for replacement engineering conversations. Current code + PostgreSQL migrations + executable CI outrank this file. Anything uninspected/unexecuted = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13G G-A VERIFIED; G-B active.**

## Resume Procedure

1. Confirm `7eaur/alwaslh`.
2. Read README, Documentation Index, Handoff, Status, Resume Snapshot, Engineering Log, this file and Execution Queue.
3. Read latest Issue #16.
4. Live-check `main`, active branch and Actions.
5. Read current-stage specialized code/tests before editing.

## Operating Model

- Track A owns Backend/Admin/DB/AI/Question Bank/Quiz Builder/Stage13G.
- Track B owns Student Product from Stage14 onward on `parallel/stage14-student-product`.
- `main` is the shared verified contract handoff point.
- Track B must adapt to canonical backend contracts and must not duplicate Auth/Access/Content/Question Bank/Quiz authority.
- Deployment/cutover remains future-only.

## Stable Architecture

- Browser is presentation/session UX, not durable authority.
- Auth/devices/entitlements/curriculum publication/assessment publication are server/PostgreSQL owned.
- Stage9 source + Stage10 media + OCR preserve provenance; ready media is not published Lesson content.
- Stage11 owns typed generation contracts.
- Stage12 owns durable AI execution.
- Stage13E owns append-only human AI review.
- Stage13F owns reusable Question Bank identity/revisions/publication and Quiz Builder immutable snapshots.
- Stage13E approval never auto-publishes a bank question.
- published bank/quiz snapshots are immutable downstream authority.

## Shared Git State

Stage13F shared main authority:

`main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Current Track A branch:

`integration/stage13g-admin-product`

G-A verified runtime/test HEAD:

`4822f87d60ab7a467c4708b5f75bb24cb90e7738`

## Stage13G G-A Implemented Authority

### Access / Codes

- existing AccessService remains canonical generation/redemption/renewal/entitlement/revoke authority;
- Stage13G adds bounded Admin code inventory/search/filter/sort/pagination;
- safe unused-code revoke is non-destructive and audited as `code_revoked`;
- redeemed-code deletion and entitlement revoke remain distinct operations.

### Student Account / Recovery / Devices

- existing AuthService remains canonical credential/session/device/recovery authority;
- bounded Admin Student projection exposes safe support metadata only;
- original/stored passwords are never exposed;
- device key material is not exposed;
- Admin can issue a new temporary password, allow device rebind and revoke entitlement through existing services.

### Admin Web

- dedicated `الطلاب والوصول` workspace;
- Students tab with search/status/sort/page + detail/history/actions;
- Access Codes tab with Full/Class inventory, generation, filters and batch unused-code revoke;
- loading/error/empty/session-expiry/mobile states.

## G-A Verification

Final run `34425317912` on `4822f87d60ab7a467c4708b5f75bb24cb90e7738`: **SUCCESS**.

- backend job: lint/typecheck/unit/build/migrations/DB contract/Stage13G integration/Access+Auth regressions all SUCCESS;
- Admin UI quality: lint/typecheck/unit/build SUCCESS;
- real API + PostgreSQL + Chromium: deterministic fixture + 4/4 SUCCESS including recovery/device/entitlement, code generation/revoke, real session expiry and 390px no-overflow.

The prior run `34425093946` was intentionally not accepted because the session-expiry test did not cause a post-logout request. Final test changes the search input, forces a real unauthorized request and verifies return to login.

## Stage13G G-B Boundary

Verified discovery:

- `database/migrations/0003_learning.sql` contains notification authority tables and indexes;
- current API source inventory contains no notification module;
- Admin parity `NOTIF-A-001..006` requires global create, validated title/body, paginated sent list, delete and Student visibility;
- Admin parity `ADMIN-001..006` requires a real dashboard with curriculum counts, access/account usage and latest notifications/activity.

Architecture decision:

```text
existing notification schema
→ typed notification service/API
→ Admin create/list/delete workspace
→ same authority later exposed to Student feed

canonical curriculum/access/auth/content/AI events
→ thin aggregate operations read model
→ real Admin dashboard
```

Do not create a duplicate event/analytics store for basic operational counters.

## Cross-Track / Remaining Work

- Track B latest state must be read from its own branch files/actions before claims.
- G-C reports/import-export/settings/security/audit remains required.
- G-D must close remaining lesson-centric/quiz AI-authoring parity; standalone Question Bank is not enough.
- `AI-012-019` live provider remains `NOT YET VERIFIED`.
- Stages16–25 remain ordered work.
- Stages26–29 deployment/release remain future-only.

## Historical Incident

Accidental `.noop` create/delete before Stage13F had no final tree/runtime/config effect. Cleanup `5fdb23030c77cae9bff5f8c33d4be466427eb6e5` restored exact tree `bcd433bd553b3e7eb539515cffd2a23a92f97192`. Keep history; do not rewrite it.
