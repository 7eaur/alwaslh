# PROJECT HANDOFF — الوسيلة الذكية

> أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-10 — Stage13G G-A VERIFIED; G-B Notifications + Operations Dashboard ACTIVE.**

## Mandatory Startup

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md` and `DOCUMENTATION_INDEX.md`.
3. Read this file, `PROJECT_STATUS.md`, `PROJECT_RESUME_SNAPSHOT.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_EXECUTION_QUEUE.md`.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and latest Issue #16 body/comments.
5. If working Track B, also read `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md` and `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md` from its branch.
6. Live-check `main`, current branch HEAD and Actions before editing or claiming completion.

Code/migrations/executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## Operating Model

Current model: **Parallel Two-Track Execution**.

- Track A: Backend/Admin/DB/AI/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product on `parallel/stage14-student-product`.
- Issue #16 is the cross-track execution ledger.
- `main` is the verified shared-contract handoff point.
- No force-push/history rewrite, duplicate durable authority, auth bypass, fake API or test weakening.
- Deployment/release work remains explicitly deferred.

## Stable Architecture / Business Rules

- Browser is not canonical durable authority.
- Full Code = 6 digits; Class Code = 7 digits.
- Returning Student requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- `media ready != published`; publication remains explicit.
- raw AI/provider output never becomes Student/Question Bank authority.
- Stage11 owns typed AI contracts/validation.
- Stage12 owns durable AI execution.
- Stage13E owns append-only human AI review.
- Stage13F owns stable reusable Question Bank identity/revisions/publication and immutable Quiz Builder snapshots.
- Stage13E approval is import eligibility, never auto-publication.
- later Student assessment consumes published immutable snapshots only.

## Shared Main Authority

Stage13F is **VERIFIED/CLOSED/PROMOTED**.

Current shared `main` checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Do not reopen Stage13F architecture merely because Stage13G adds Admin product surfaces.

## Stage13G Current State

Track A branch:

`integration/stage13g-admin-product`

### G-A Accounts + Access Codes — VERIFIED

Final runtime/test HEAD:

`4822f87d60ab7a467c4708b5f75bb24cb90e7738`

Final run:

`34425317912` — **SUCCESS**

All three jobs passed:

- Accounts + Access backend;
- Accounts + Access Admin UI quality;
- Real API + PostgreSQL + Chromium, 4/4 scenarios.

Implemented/verified:

- bounded Admin code inventory/search/filter/sort/page;
- Full/Class code generation;
- non-destructive unused-code bulk revoke + audit;
- bounded Student account/detail projection;
- entitlements/devices/redemptions/auth/access activity;
- temporary-password recovery using existing AuthService;
- device rebind using existing AuthService;
- entitlement revoke using existing AccessService;
- real session expiry;
- 390px responsive no-overflow.

Security boundary: Admin never receives stored password values or device public key material.

### G-B Notifications + Operations Dashboard — ACTIVE

Verified discovery so far:

- `0003_learning.sql` already contains `notifications`, `notification_reads`, notification severity, global/class/profile targeting, optional action path, publish/expiry timestamps and feed indexes;
- current API source inventory has no notification product module;
- parity `NOTIF-A-001..006` = global create, validated title/body, paginated sent list, delete, Student visibility;
- parity `ADMIN-001..006` = real dashboard home with curriculum/access/account counts and latest notifications/activity.

Architecture direction: **KEEP + IMPROVE notification schema; REBUILD thin notification service/API/UI; REBUILD thin operational aggregate read model over canonical tables/events.** No second analytics/event store.

## Important Open Boundaries

- `AI-012-019` — live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- Stage13G G-C reports/import-export/settings/security/audit remains required.
- Stage13G G-D must close lesson-centric generation/admin parity deliberately left open by Stage13F; standalone Question Bank is not sufficient evidence.
- Track B status must be read from its own branch before claiming latest completion.
- Stages26–29 release/deployment remain future-only.

## Git / Incident Notes

- historical accidental `.noop` create/delete had no final tree/runtime effect. Cleanup `5fdb23030c77cae9bff5f8c33d4be466427eb6e5` restored exact tree `bcd433bd553b3e7eb539515cffd2a23a92f97192`. Treat as resolved P3 history noise; do not rewrite history.
- G-A initial Chromium run `34425093946` was not accepted because session-expiry test did not issue a post-logout request. Test was corrected, and final exact-head run `34425317912` passed 4/4.

## Exact Continuation

For Track A:

1. confirm branch/HEAD/Actions;
2. continue G-B from existing notification schema + durable events;
3. implement backend contract/integration before Admin UI;
4. add real Chromium gate;
5. update Source of Truth + Issue #16;
6. then G-C → G-D → wider Stage13G closure.

Never infer completion from this file alone; verify GitHub state first.
