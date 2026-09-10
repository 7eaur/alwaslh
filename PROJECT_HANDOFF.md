# PROJECT HANDOFF — الوسيلة الذكية

> Replacement engineering conversation must be able to resume from repository + Actions + Issue #16 without chat memory.

Last synchronized: **2026-09-10 — Track A Stage13G G-A/G-B VERIFIED; G-C ACTIVE.**

## Mandatory Startup

1. Confirm repository `7eaur/alwaslh` and current branch/head.
2. Read `README.md`, `DOCUMENTATION_INDEX.md`, this file, Status, Resume Snapshot, Engineering Log, Integration Continuity and Execution Queue.
3. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and latest Issue #16 body/comments.
4. If working Track B, read its two workstream files from `parallel/stage14-student-product`.
5. Live-check `main`, branch and GitHub Actions before conclusions.

Code/migrations/executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## Operating Model

**Parallel Two-Track Execution**:

- Track A: Backend/Admin/DB/AI/current Stage13G.
- Track B: Student Product Stage14+.
- `main` is verified shared-contract handoff.
- no duplicate durable authority, force-push/history rewrite, fake API, auth bypass or test weakening.
- production release/deployment remains future-only.

## Stable Product / Architecture Rules

- Browser is not durable authority.
- Full Code = 6 digits; Class Code = 7 digits.
- Auth, sessions/devices and entitlements are server/PostgreSQL-owned.
- media ready != published content.
- Stage11 typed AI → Stage12 durable execution → Stage13E human review → Stage13F Question Bank/Quiz publication.
- Stage13E approve never auto-publishes a bank question.
- published Question Bank revisions and Quiz snapshots are immutable delivery authority.

## Shared Main

Stage13F promoted main checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Do not move shared main from this conversation until Stage13G closure gates pass.

## Stage13G G-A — VERIFIED

Runtime `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
Run `34425317912` — SUCCESS; Chromium 4/4.

Owns Admin Student account projection/operations and access-code inventory/maintenance while AuthService/AccessService remain mutation authorities.

## Stage13G G-B — VERIFIED

Runtime `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Run `34428052472` — SUCCESS; Chromium 7/7 G-A+G-B.

Implemented:

- `NotificationService` over existing `notifications` + `notification_reads`;
- Admin create/list/filter/page/delete;
- Student global/class/profile visibility and read state from the same store;
- Operations read model over canonical curriculum/account/access/notification tables;
- recent Auth/Access events without a new analytics store;
- real `لوحة التشغيل` as Admin home;
- responsive/session/error/empty states.

Boundary: Student notification API authority is verified; Student notification product UI/sync is later roadmap work.

## Current Stage13G Continuation

### G-C1 — Code Import/Export/Print

Inspect existing Access contracts first. Implement strict six/seven-digit import, row-level result reporting, template, safe scoped export and branded printable cards without exposing credentials/device secrets.

### G-C2 — Reports/Settings/Security/Audit

Inspect configuration and existing Auth/Access/content/AI event authorities before adding tables or settings. Prefer read projections over another audit store.

### G-D — AI Authoring Parity

Still required after G-C. Do not infer completion from Stage11/12/13E foundations.

## Important Open Boundary

`AI-012-019` live provider/model/routes/credentials/bootstrap = **NOT YET VERIFIED**.

## Test Compatibility Note

Stage13G changed the authenticated Admin default home from Curriculum to Operations. G-A Chromium helper is updated. Earlier Stage13D/E/F browser helpers that assert the old default must be adapted to authenticate via the shell/open their workspace before the final wider Stage13G matrix; do not weaken their feature assertions.
