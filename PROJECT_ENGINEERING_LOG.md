# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for architecture, findings, changes, verification and remaining work. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-10 — Stage13G G-A VERIFIED; G-B discovery active.**

## 1. Project / Architecture Understanding

Runtime surfaces:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin Web.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.

Operating model: **Parallel Two-Track Execution**.

- Track A owns API/Admin/DB/AI/generation/Question Bank/Quiz Builder/Stage13G.
- Track B owns Student Product from Stage14 onward.
- Issue #16 is the cross-track execution ledger.
- Verified shared contracts cross tracks through `main`; no duplicate durable authority is allowed.
- Production deployment/cutover remains future-only.

Stable rules remain unchanged: Full Code = 6 digits; Class Code = 7 digits; Auth/Access are server-owned; Curriculum remains canonical; media readiness is not publication; raw AI/provider output is never educational authority; Stage13F published Question Bank/Quiz snapshots are immutable downstream assessment authority.

## 2. Stage State

- Stage1–10 + OCR: VERIFIED.
- Stage11: VERIFIED.
- Stage12: VERIFIED backend/runtime; live provider `AI-012-019` = `NOT YET VERIFIED`.
- Stage13A–F: VERIFIED/CLOSED; Stage13F promoted to `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13G G-A Accounts + Access Codes: **VERIFIED**.
- Stage13G G-B Notifications + Operations Dashboard: **ACTIVE**.
- Stage13G G-C/G-D: REQUIRED.
- Stage14+: follow ordered roadmap and Track B Source of Truth.

## 3. Stage13G G-A — Architecture Decision

### Existing Access authority

Inspected:

- `database/migrations/0002_access.sql`
- `database/migrations/0006_access_contract.sql`
- `apps/api/src/access/http.ts`
- `apps/api/src/access/service.ts`

Classification: **KEEP + IMPROVE**.

Evidence: existing authority already owns secure code generation, transactional/idempotent redemption, renewal, entitlements, revoke and access audit events.

Decision: do not duplicate redemption/generation authority. Add a bounded Admin read/maintenance layer only.

### Existing Auth / recovery / devices

Inspected:

- `database/migrations/0005_auth.sql`
- `database/migrations/0010_student_auth_device.sql`
- `apps/api/src/auth/http.ts`
- `apps/api/src/auth/service.ts`

Classification: **KEEP + IMPROVE**.

Evidence: existing AuthService already owns temporary-password recovery, session revocation, device challenge/rebind lifecycle and auth events; stored credentials are intentionally not an Admin read surface.

Decision: Admin UX invokes the existing recovery/device mutations and receives a safe account projection; it never reveals prior credentials or device key material.

### New Admin Accounts + Access layer

Classification: **REBUILD as explicit Admin product layer**.

Implemented:

- `database/migrations/0023_admin_access_operations.sql`;
- `apps/api/src/admin-access/service.ts`;
- `apps/api/src/admin-access/http.ts`;
- `apps/api/tests/integration/admin-student-access.integration.test.ts`;
- `apps/admin-web/src/admin-student-access-api.ts` + unit tests;
- `apps/admin-web/src/AdminStudentAccessWorkspace.tsx`;
- `apps/admin-web/src/admin-student-access.css`;
- deterministic browser fixture + real Chromium suite;
- `.github/workflows/stage13g-admin-operations.yml`.

Key design choice: legacy “delete unused code” outcome is implemented as **non-destructive revoke** with durable `code_revoked` event instead of hard deletion. Redeemed codes are not silently deleted; entitlement revoke remains a separate explicit operation.

## 4. G-A Product Flows Verified

### Student account flow

Admin → الطلاب والوصول → حسابات الطلاب → search/filter/sort/page → select Student → inspect entitlement/device/redemption/activity → issue temporary password / allow device rebind / revoke active entitlement.

### Access-code flow

Admin → الطلاب والوصول → أكواد الوصول → Full/Class scope → search/filter/sort/page → generate batch → display new codes → select unused codes → bulk revoke with result summary.

### UX / security rules

- loading/error/empty states are explicit;
- session expiry returns to Admin login after a real unauthorized request;
- temporary password is shown only as the newly issued value and remains visible across same-account refresh, but clears when switching accounts;
- no stored password retrieval;
- no device public key/fingerprint is exposed by the Admin Student read model;
- 390px layout has no horizontal overflow;
- code list uses cards rather than an unbounded mobile table.

## 5. G-A Verification

Final exact runtime/test HEAD:

`4822f87d60ab7a467c4708b5f75bb24cb90e7738`

Final workflow:

`34425317912` — **SUCCESS**

Jobs:

1. Stage13G Accounts + Access backend — SUCCESS:
   - API lint;
   - strict typecheck;
   - unit tests;
   - build;
   - clean PostgreSQL migrations through `0023`;
   - DB contract;
   - Stage13G integration;
   - Access/Auth regressions.
2. Stage13G Accounts + Access Admin UI quality — SUCCESS:
   - lint;
   - strict typecheck;
   - unit tests;
   - build.
3. Stage13G Real API + PostgreSQL + Chromium — SUCCESS:
   - deterministic real Admin/Student/code/entitlement fixture;
   - 4/4 browser scenarios: recovery/device/entitlement, code generate/revoke/class filter, real session expiry, 390px viewport.

Earlier G-A verification iterations were intentionally not accepted as closure:

- initial Biome import/format failure → fixed at source;
- Zod query inference produced `unknown`, then `number | undefined` → corrected with validated/coerced boundary + explicit defaults instead of casts;
- first Chromium run `34425093946` = 3/4 because the session-expiry test resubmitted identical filter state and therefore made no request; test was corrected to change the query and trigger a real post-logout request. Runtime behavior was not weakened.

## 6. Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---:|---|---|---|---|---|---|
| `DOC-013G-001` | P2 | Documentation | startup docs drifted after Stage13F promotion/two-track switch | old Single Owner / Stage13F-next wording | replacement engineer could start from wrong model | align README/Index/Overrides + parallel operating model | **RESOLVED** in `8501ced93ba751b7fd40f2cf2dcdbd29738feb31` |
| `ADMIN-013G-ACCESS-002` | P1 | Access Admin | no Admin inventory/operations product | AccessService existed without list/search/bulk Admin surface | legacy code Admin parity blocked | bounded Admin read/maintenance contract + non-destructive revoke | **FIXED + VERIFIED** |
| `ADMIN-013G-ACCOUNT-003` | P1 | Student Admin | recovery authority existed without account workspace/read model | AuthService mutation paths only | support/admin flow incomplete | bounded Student projection + Admin workspace reusing AuthService | **FIXED + VERIFIED** |
| `ADMIN-013G-RECOVERY-004` | P1 | Admin UX | newly issued temporary password was cleared by same-account refresh | review before browser gate | operator could not deliver the generated recovery secret | clear only on account switch, not same-account reload | **FIXED + VERIFIED** |
| `TEST-013G-005` | P3 | E2E | session-expiry test initially made no post-logout request | run `34425093946` 3/4 | false-negative browser gate | mutate search before submit so 401 is genuinely exercised | **RESOLVED** |
| `ADMIN-013G-NOTIF-006` | P1 | Notifications | DB schema exists but API/Admin product module absent | `0003_learning.sql` + API inventory | NOTIF-A parity incomplete | build typed notification service/API/UI on existing schema | **OPEN — G-B** |
| `ADMIN-013G-DASH-007` | P1 | Admin Dashboard | real dashboard counts/activity absent | parity `ADMIN-001..006`; no dedicated current module | Admin shell lacks operational overview | aggregate canonical tables/events, no duplicate analytics store | **OPEN — G-B** |
| `AI-012-019` | P2 | Live AI | live provider benchmark/routes/credentials/bootstrap not proven | no authorized live-provider evidence | production generation readiness unknown | explicit later runtime gate | **OPEN / NOT YET VERIFIED** |
| `HIST-NOOP-001` | P3 | Git history | historical accidental `.noop` create/delete before Stage13F | cleanup `5fdb23030c77cae9bff5f8c33d4be466427eb6e5` restored tree `bcd433bd553b3e7eb539515cffd2a23a92f97192` | no final tree/runtime/config effect | keep history, do not rewrite | **RESOLVED** |

## 7. Stage13G G-B Discovery

Inspected:

- `database/migrations/0003_learning.sql`;
- current `apps/api/src` inventory;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` rows `NOTIF-A-001..006` and `ADMIN-001..006`.

### Notifications

Schema already provides:

- `notifications`;
- `notification_reads`;
- `notification_severity` (`info|success|warning|critical`);
- optional profile target;
- optional class target;
- global target when both are null;
- action path;
- publish/expiry timestamps;
- creator identity;
- indexes for profile/class/global feeds.

Classification: **KEEP + IMPROVE schema**.

No notification service/module is present in current API source inventory. Product service/API/Admin UI = **REBUILD**.

Minimum Admin acceptance from parity:

- create global notification;
- validated title/body;
- paginated sent list sorted by date;
- explicit delete;
- Student visibility using the same notification authority/change model.

### Operations Dashboard

Parity requires:

- real Admin dashboard home;
- class/subject/lesson counts;
- access/account usage counts;
- latest notifications/activity.

Decision: **REBUILD thin aggregate read model** over canonical existing tables/events. Do not create a second durable analytics/event store for these basic operational metrics.

## 8. Remaining Work

1. G-B notification + operations backend authority/integration.
2. G-B Admin workspaces + real Chromium.
3. G-C import/export/reports + settings/security/audit after discovery.
4. G-D explicit lesson-centric/quiz AI-authoring parity left open by Stage13F.
5. Wider Stage13G regression + Legacy Coverage closure.
6. `AI-012-019` remains separate `NOT YET VERIFIED` live-provider gate.
7. Stage14–25 continue by roadmap/track ownership.
8. Stage26–29 deployment/release remain deferred.
