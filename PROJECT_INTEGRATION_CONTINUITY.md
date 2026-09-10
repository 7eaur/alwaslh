# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> Operational continuity for any replacement engineering conversation. Current code + migrations + executable CI outrank this file.

Last synchronized: **2026-09-10 — Stage13G G-A/G-B VERIFIED; G-C ACTIVE.**

## Resume Procedure

1. Confirm repo and exact branch/main HEADs.
2. Read README/Index/Handoff/Status/Resume/Engineering Log/this file/Execution Queue.
3. Read latest Issue #16 comments.
4. Read current-stage code/tests; anything not inspected is `NOT YET VERIFIED`.

## Cross-Track Model

- Track A owns Backend/Admin/DB/AI Stage13G.
- Track B owns Student Product Stage14+.
- `main` is the only verified shared-contract handoff point.
- no local duplicate Auth/Access/Notification/Question Bank/Quiz authority to avoid integration.

## Stable Shared Authority

Main remains Stage13F closure checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Stage13F continues to own canonical Question Bank stable identity/revisions and immutable published Quiz snapshots.

## Track A Stage13G Verified Chain

```text
existing Auth + Access authority
→ G-A bounded Admin accounts/access projection + maintenance UX
→ existing notification tables
→ G-B shared NotificationService + Operations read model
→ current G-C import/export/report/security work
```

### G-A

Runtime: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
Run `34425317912` — SUCCESS; Chromium 4/4.

No credential reveal or device-secret exposure. Code deletion semantics are non-destructive revoke for unused codes; redeemed access is a separate entitlement/account operation.

### G-B

Runtime: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Run `34428052472` — SUCCESS; Chromium 7/7.

Notification rules:

- `notifications` + `notification_reads` are durable canonical store;
- Admin global create/list/delete and server pagination;
- backend supports global/profile/class targeting;
- Student feed sees global/direct/entitled-class notifications only while active/not expired;
- read state is idempotent;
- Student UI/sync remains later work.

Operations rules:

- dashboard metrics query canonical tables live;
- recent activity is read from Auth/Access events;
- no secondary analytics/event persistence;
- Operations is the authenticated Admin default home.

G-B integration initially failed only because exact global counts assumed G-A left an empty database. Fixed with baseline/delta assertions; no query behavior was weakened.

## Current Integration Hazard

Earlier Admin browser specs (Stage13D/E/F) often assert Curriculum heading immediately after login. Since G-B intentionally makes Operations the Admin home, those helpers must be updated before the wider Stage13G regression to authenticate via the shell and then explicitly open their target workspace. Feature assertions remain unchanged.

## G-C Boundary

- strict code import + template;
- scoped safe exports and printable cards;
- audit/report product projections from existing authorities;
- inspect settings/security schema/config before adding editable state;
- map specialized Quiz/Lesson exports deliberately.

G-D remains separate for lesson/quiz AI generation orchestration.

## Open Boundary

`AI-012-019` live provider bootstrap/model/routes/credentials = NOT YET VERIFIED.

## Future Promotion Rule

Do not move Stage13G to `main` until G-C/G-D are complete, Legacy Coverage is synchronized, older Admin browser helpers are adapted to Operations default, and the wider exact-head regression matrix is green. No force update or history rewrite.
