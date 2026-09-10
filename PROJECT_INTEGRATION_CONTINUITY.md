# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> Operational continuity for any replacement engineering conversation. Current code + migrations + executable CI outrank this file.

Last synchronized: **2026-09-10 — Stage13G G-A/G-B/G-C1 VERIFIED; G-C2 CURRENT.**

## Resume Procedure

1. Confirm repo and exact branch/main HEADs.
2. Read README/Index/Handoff/Status/Resume/Engineering Log/this file/Execution Queue.
3. Read current Product Overrides, Parallel Two-Track model and latest Issue #16 comments.
4. Read current-stage code/tests; anything not inspected is `NOT YET VERIFIED`.
5. Distinguish documentation-only HEAD from last executable runtime HEAD.

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
→ G-C1 strict code import + safe CSV export + explicit printable-card scopes
→ G-C2 reports/settings/security/audit read-product work  ← CURRENT
```

### G-A

Runtime: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
Run `34425317912` — SUCCESS; Chromium 4/4.

No credential reveal or device-secret exposure. Code deletion semantics are non-destructive revoke for unused codes; redeemed access is a separate entitlement/account operation.

### G-B

Runtime: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Run `34428052472` — SUCCESS; Chromium 7/7 total.

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

### G-C1

Verified runtime/code HEAD: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`.
Run `34430915626` — SUCCESS across backend, Admin quality and real API/PostgreSQL/Chromium.
Chromium total: 10/10.

Import rules:

- import is Admin-only and bounded;
- Full Access import normalizes Arabic digits then requires exact 6-digit codes;
- duplicate rows and already-existing codes produce explicit per-row rejection rather than silent coercion;
- accepted rows use existing Access tables/lifecycle and emit Access audit events;
- no separate import store becomes redemption authority.

Export/print rules:

- export reads canonical Admin access projection with bounded pagination;
- if inventory total changes mid-export, fail rather than silently emit an incomplete file;
- UTF-8 BOM CSV is Excel-compatible and protects formula-leading cells;
- Full/Class/filter/used/selected scopes are explicit in product flow where supported;
- printable cards are RTL and selection-aware;
- browser Print / Save-as-PDF is verified; server binary PDF is not claimed;
- binary `.xlsx` generation is not claimed.

A prose-only handoff commit may sit above the verified runtime HEAD and does not invalidate its executable evidence.

## Current Integration Hazard

Earlier Admin browser specs (Stage13D/E/F) often assert Curriculum heading immediately after login. Since G-B intentionally makes Operations the Admin home, those helpers must be updated before the wider Stage13G regression to authenticate via the shell and then explicitly open their target workspace. Feature assertions remain unchanged.

## G-C2 Current Boundary

Inspect before implementation:

- `auth_events` and security-relevant Auth state;
- `access_events` and access lifecycle evidence;
- content/media/OCR/AI/review/question-bank/quiz event/history authorities;
- current runtime configuration and environment ownership;
- legacy report/settings/security/audit acceptance rows.

Preferred architecture:

- bounded read projections;
- server pagination/filter/search;
- safe export only where the business outcome requires it;
- no duplicate generic audit persistence;
- no browser-owned security/runtime config;
- no secret exposure.

Do not expose password hashes, session/reset/challenge token hashes, raw device public keys, provider credentials or secret environment/storage configuration.

Any new G-C2 capability must pass API/PostgreSQL/Admin quality + real Chromium before being marked verified.

G-D remains separate for lesson/quiz AI generation orchestration and remaining specialized authoring/export parity.

## Open Boundary

`AI-012-019` live provider bootstrap/model/routes/credentials = NOT YET VERIFIED.

## Future Promotion Rule

Do not move Stage13G to `main` until G-C2/G-D are complete, Legacy Coverage is synchronized, older Admin browser helpers are adapted to Operations default, and the wider exact-head regression matrix is green. No force update or history rewrite.
