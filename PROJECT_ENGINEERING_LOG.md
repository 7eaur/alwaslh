# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for architecture, findings, changes, verification and remaining work. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-10 — Stage13G G-A/G-B verified; G-C active on Track A.**

## 1. Current Architecture / Operating Model

Runtime surfaces:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin Web.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.

Execution: **Parallel Two-Track**.

- Track A owns API/Admin/DB/AI/current Stage13G.
- Track B owns Student Product Stage14+.
- `main` is verified shared-contract handoff.
- Issue #16 is the cross-track ledger.
- No duplicate durable authority is allowed for integration convenience.

Stable rules remain: browser is not canonical authority; Full Code = 6 digits; Class Code = 7 digits; Auth/Access/device state is server-owned; media readiness != publication; AI/provider output never auto-publishes educational authority; Stage13F published bank/quiz revisions are immutable Student-assessment authority.

## 2. Stage State

- Stage1–10 + OCR: VERIFIED.
- Stage11: VERIFIED.
- Stage12 backend/runtime: VERIFIED; `AI-012-019` live provider remains NOT YET VERIFIED.
- Stage13A–F: VERIFIED/CLOSED; Stage13F promoted to `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13G G-A: VERIFIED.
- Stage13G G-B: VERIFIED.
- Stage13G G-C: ACTIVE.
- Stage13G G-D: REQUIRED.

## 3. G-A Architecture / Evidence

Classification:

- AccessService: **KEEP + IMPROVE**.
- AuthService: **KEEP + IMPROVE**.
- Admin account/access projection: **REBUILD bounded Admin layer**.

Implemented:

- `0023_admin_access_operations.sql`;
- code inventory/search/filter/sort/page;
- unused-code revoke rather than destructive deletion;
- `code_revoked` durable event;
- Student list/detail projection with entitlement/device/redemption/Auth/Access history;
- no sensitive device key data exposed;
- Admin workspace reuses existing recovery/device/entitlement mutations.

Evidence: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.

## 4. G-B Architecture / Evidence

### Notifications

Inspected existing `0003_learning.sql`: `notifications` and `notification_reads` already provided the correct durable base.

Classification: **KEEP schema + REBUILD service/product layer**.

Implemented `NotificationService` and HTTP routes:

- Admin list/search/severity filter/server pagination;
- Admin create/delete;
- global/class/profile target model retained;
- future expiry + safe internal action path validation;
- Student feed resolves global/direct/class visibility from active entitlements;
- Student read state is idempotently persisted in `notification_reads`;
- no separate Student/Admin notification stores.

### Operations Dashboard

Classification: **REBUILD read model, no analytics persistence**.

`AdminOperationsService` derives live metrics from canonical tables and merges recent Auth/Access events at read time. The Admin product home is now `لوحة التشغيل`, showing curriculum/account/access/notification counts, latest notifications and latest operational activity.

### Verification

Runtime HEAD: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Workflow `34428052472`: SUCCESS.

- API lint/typecheck/unit/build: SUCCESS;
- clean migrations through 0023: SUCCESS;
- G-A integration: SUCCESS;
- G-B notification/operations integration: SUCCESS;
- Access/Auth regressions: SUCCESS;
- Admin lint/typecheck/49 unit/build: SUCCESS;
- real API/PostgreSQL/Chromium: **7/7 passed**.

Browser proves real dashboard metrics/activity, global notification create/list/delete, real session expiry, G-A flows and 390px no-overflow.

Student notification API/read authority is verified. Student notifications UI/sync is intentionally later Student roadmap work.

## 5. Root-Cause Findings

| ID | Sev | Area | Problem | Impact | Solution | Status |
|---|---:|---|---|---|---|---|
| `DOC-013G-001` | P2 | Documentation | startup docs reflected superseded single-owner/Stage13F state | wrong continuation model | two-track docs normalization | RESOLVED |
| `ADMIN-013G-ACCESS-002` | P1 | Access | missing Admin inventory/maintenance product | CODE parity incomplete | bounded Admin read/ops on existing Access authority | FIXED + VERIFIED |
| `ADMIN-013G-ACCOUNT-003` | P1 | Auth/Admin | recovery authority existed without canonical Student workspace | account operations fragmented | Admin projection + reuse Auth mutations | FIXED + VERIFIED |
| `ADMIN-013G-RECOVERY-004` | P1 | UX | one-time temp password was cleared by same-account detail refresh | recovery result disappeared | clear only when changing selected student | FIXED + VERIFIED |
| `TEST-013G-005` | P3 | E2E | session-expiry test did not issue post-logout request | false negative | mutate query then assert real 401/logout UI | RESOLVED |
| `ADMIN-013G-NOTIF-006` | P1 | Notifications | schema existed with no canonical service/UI | Admin communication absent | one shared NotificationService + UI | FIXED + VERIFIED |
| `ADMIN-013G-DASH-007` | P1 | Dashboard | Admin landed on curriculum; no real operational home | ADMIN-001..006 incomplete | live aggregate Operations home | FIXED + VERIFIED |
| `TEST-013G-008` | P2 | Integration | G-B exact counts assumed database empty after G-A integration | order-coupled test failed despite correct query | baseline/delta assertions + guaranteed close | RESOLVED |
| `AI-012-019` | P2 | Live AI | provider benchmark/routes/credentials/bootstrap absent | production generation readiness unknown | later authorized runtime evidence | OPEN / NOT YET VERIFIED |

## 6. G-C Discovery / Decisions

Parity evidence inspected:

- `CODE-A-013` strict Excel/CSV import;
- `CODE-A-014` import template;
- `CODE-A-015/016` all/used code export;
- printable code-card outcomes;
- `PRINT-001..009` safe RTL export/identity/performance rules;
- Stage13F still leaves specialized Quiz/Lesson export variants and account-delete semantics open.

Preliminary classification:

- code data authority: **KEEP + IMPROVE** existing Access tables/service;
- import/export generation: **REBUILD bounded server-owned transforms**;
- audit: **KEEP + IMPROVE** existing Auth/Access/content/AI events; do not add a second generic audit store unless a verified gap requires it;
- settings/security: **NOT YET VERIFIED** — inspect real config/schema and legacy outcomes before adding editable settings;
- specialized quiz/lesson exports: inspect existing Stage13F export authority and source/media contracts before extending variants.

## 7. Next Execution

1. G-C1 code import/template/export/print with strict validation and row-level results.
2. G-C2 audit/security/settings/reporting boundary after code/schema inspection.
3. map remaining specialized exports explicitly.
4. G-D lesson/quiz AI-authoring orchestration remains separate.
5. wider exact-head regression only after Stage13G slices are complete.
