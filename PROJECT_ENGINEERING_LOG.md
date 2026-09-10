# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for architecture, findings, changes, verification and remaining work. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-10 — Stage13G G-A/G-B/G-C1 VERIFIED; G-C2 ACTIVE on Track A.**

## 1. Project Understanding

`الوسيلة الذكية` is an Arabic-first RTL educational product with two major product surfaces:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin operational/authoring product.

Authoritative backend/data surfaces:

- `apps/api` — Fastify/TypeScript API and domain services.
- `database/migrations` — PostgreSQL schema/integrity authority.

Core product authorities already established:

- Auth/session/device/recovery is server-owned.
- Access codes/redemption/entitlements are server/PostgreSQL-owned.
- Full Access Code = exactly 6 digits; Class Access Code = exactly 7 digits.
- content/media/OCR publication lifecycle is explicit.
- Stage11 typed AI validation → Stage12 durable execution → Stage13E human review → Stage13F Question Bank/Quiz publication.
- Stage13E approval does not auto-publish Question Bank content.
- published Question Bank revisions and published Quiz version snapshots are immutable Student delivery authority.

Execution model: **Parallel Two-Track**.

- Track A owns API/Admin/DB/AI/current Stage13G.
- Track B owns Student Product Stage14+.
- `main` is verified shared-contract handoff.
- Issue #16 is the cross-track execution ledger.
- no duplicate durable authority is allowed for integration convenience.

## 2. Architecture

Current verified Track A chain:

```text
AuthService + AccessService
→ G-A bounded Admin account/access projections + maintenance UX
→ existing notification tables
→ G-B NotificationService + Operations read model
→ G-C1 strict code import + canonical CSV export + printable-card presentation
→ G-C2 report/security/audit/settings read-product work (current)
```

Architecture classification:

- AuthService: **KEEP + IMPROVE**.
- AccessService: **KEEP + IMPROVE**.
- Notification durable schema: **KEEP**.
- Notification service/product layer: **REBUILD bounded shared layer**.
- Operations dashboard: **REBUILD read model, no analytics persistence**.
- Admin account/access projection: **REBUILD bounded Admin layer**.
- G-C1 import: **REBUILD bounded mutation path over existing Access authority**.
- G-C1 export/print: **REBUILD bounded transforms/presentation over canonical Admin access projection**.
- G-C2 audit: default **KEEP + IMPROVE existing event authorities**, not a new generic store.
- G-C2 settings/security: **NOT YET VERIFIED** until real config/schema/business rules are inspected.

## 3. User Flows

### Admin Accounts / Access — VERIFIED G-A

1. Admin signs in through canonical Auth session.
2. Admin opens Students & Access.
3. Search/filter/page Student accounts and inspect canonical entitlement/device/redemption/Auth/Access state.
4. Issue one-time temporary password through existing Auth authority when recovery is required.
5. Allow device rebind through existing Auth authority.
6. Revoke entitlement through existing Access authority.
7. Search/filter/page Full/Class codes, generate new codes, and non-destructively revoke unused codes.

### Notifications / Operations — VERIFIED G-B

1. Admin lands on real Operations home.
2. Dashboard reads canonical curriculum/account/access/notification counts live.
3. Admin inspects latest Auth/Access activity and notification state.
4. Admin creates global notification with validated severity/action path/expiry.
5. Student notification API resolves global/direct/entitled-class visibility from the same durable store.
6. Admin deletes notification; Student read state remains idempotent through `notification_reads`.

Student notification UI/sync is later Student roadmap work and is not claimed by G-B.

### Code Import / Export / Print — VERIFIED G-C1

1. Admin opens dedicated Files/Reports workspace.
2. Admin downloads CSV import template.
3. Admin uploads strict Full Access CSV rows.
4. API normalizes Arabic digits, validates exact 6-digit format, reports invalid/duplicate rows explicitly, and persists only accepted codes through existing Access tables.
5. Accepted imports emit durable Access audit evidence.
6. Admin chooses canonical code scope: Full/Class plus supported filters/used/selected scope.
7. Export gathers bounded paginated canonical inventory; if total changes mid-export it fails rather than silently emitting an incomplete file.
8. CSV output is UTF-8 BOM/Excel-compatible and sanitizes spreadsheet formula-leading cells.
9. Admin can choose explicit code selections and generate RTL printable cards.
10. Browser print supports Print / Save-as-PDF.

No binary `.xlsx` or server-generated binary PDF acceptance is claimed.

## 4. Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---:|---|---|---|---|---|---|
| `DOC-013G-001` | P2 | Documentation | startup docs reflected superseded Stage13F/single-owner state | stale Handoff/Launcher | replacement conversation could continue wrong stage | normalize two-track/current-stage docs | RESOLVED |
| `ADMIN-013G-ACCESS-002` | P1 | Access | missing Admin inventory/maintenance product | G-A discovery | CODE/Admin parity incomplete | bounded Admin read/ops on existing Access authority | FIXED + VERIFIED |
| `ADMIN-013G-ACCOUNT-003` | P1 | Auth/Admin | recovery authority existed without canonical Student workspace | G-A discovery | fragmented account operations | Admin projection + reuse Auth mutations | FIXED + VERIFIED |
| `ADMIN-013G-RECOVERY-004` | P1 | UX | one-time temp password cleared by same-account refresh | G-A browser flow | recovery result disappeared | clear only when changing selected student | FIXED + VERIFIED |
| `TEST-013G-005` | P3 | E2E | session-expiry test did not trigger post-logout request | original G-A E2E | false negative | issue real protected request before assertion | RESOLVED |
| `ADMIN-013G-NOTIF-006` | P1 | Notifications | durable schema had no canonical Admin/product service | G-B discovery | communication feature absent | shared NotificationService + Admin product | FIXED + VERIFIED |
| `ADMIN-013G-DASH-007` | P1 | Dashboard | no real operational home | pre-G-B Admin shell | weak Admin entry/product hierarchy | live canonical Operations read model | FIXED + VERIFIED |
| `TEST-013G-008` | P2 | Integration | G-B exact counts assumed empty DB after G-A | first G-B integration run | order-coupled failure despite correct query | baseline/delta assertions + guaranteed close | RESOLVED |
| `ADMIN-013G-CODEIO-009` | P1 | Import/Export | code import/export/print parity absent | G-C1 discovery + queue | legacy operations incomplete | strict import + safe CSV + print workspace | FIXED + VERIFIED |
| `SEC-013G-CSV-010` | P2 | Export Security | spreadsheet formula-leading data could execute when opened | G-C1 export design review | unsafe spreadsheet output | explicit CSV formula sanitization + unit evidence | FIXED + VERIFIED |
| `UX-013G-SCOPE-011` | P2 | Export/Print UX | initial G-C1 implementation had all/filtered scope but no explicit selected-code scope | parity review before closure | printable/export selection parity incomplete | selection UI + selected export/print semantics + Chromium | FIXED + VERIFIED |
| `PERF-013G-BUNDLE-012` | P3 | Admin frontend | Vite warns main Admin chunk exceeds 500 kB | G-C1 real build log | future load/perf risk, no current functional failure | measure during Stage21/perf work; avoid premature split without evidence | OPEN / DEFERRED |
| `AI-012-019` | P2 | Live AI | provider benchmark/routes/credentials/bootstrap absent | Stage12+ docs/runtime inspection | production generation readiness unknown | later authorized live runtime evidence | OPEN / NOT YET VERIFIED |

## 5. Architecture Decisions

### AD-13G-01 — Preserve mutation authorities

Admin UI/services do not become new Auth or Access authorities. Recovery/device mutations still use AuthService; entitlement/code lifecycle still uses AccessService/PostgreSQL.

### AD-13G-02 — No second Notification store

Use existing `notifications` + `notification_reads` for both Admin and Student visibility/read state.

### AD-13G-03 — Operations is a read model

Dashboard metrics/activity are derived from canonical tables/events at read time; no separate analytics persistence was introduced.

### AD-13G-04 — G-C1 import is bounded and partial-result aware

Malformed/duplicate rows are explicit per-row results; accepted rows can persist without coercing or silently dropping errors. Import does not create a second redemption/code authority.

### AD-13G-05 — CSV is the verified spreadsheet contract

Use UTF-8 BOM CSV compatible with Excel, proper escaping and formula sanitization. Do not call it binary `.xlsx`; do not add a heavy spreadsheet dependency without an actual product requirement.

### AD-13G-06 — Print/PDF is browser-native for G-C1

RTL printable cards + browser Print/Save-as-PDF satisfy the verified current outcome. No server-generated binary PDF is claimed.

### AD-13G-07 — G-C2 starts from existing event/config authorities

Before adding reporting/security/settings storage, inspect Auth/Access/content/OCR/AI/review/question-bank/quiz event and config authorities. Prefer bounded read projections. A new generic audit store requires evidence that existing authorities cannot satisfy the required outcome.

## 6. Changes Made

### G-A

- `0023_admin_access_operations.sql`;
- Admin code inventory/filter/sort/page;
- unused-code revoke + durable `code_revoked` event;
- Student list/detail projection with entitlement/device/redemption/Auth/Access history;
- no sensitive device key data exposed;
- Admin recovery/device/entitlement actions reuse existing authorities.

### G-B

- `NotificationService` + HTTP routes over existing durable notification schema;
- Admin notification create/list/filter/page/delete;
- Student global/class/profile visibility/read API;
- `AdminOperationsService` live metrics + recent Auth/Access activity;
- real Operations Admin home + responsive/session/error/empty states.

### G-C1

Backend:

- `apps/api/src/access/import-service.ts`;
- Admin Full Access import HTTP route and app wiring;
- integration coverage for Arabic digits, invalid row, duplicate in file, duplicate existing, persistence and audit.

Admin:

- `apps/admin-web/src/admin-access-files-api.ts` + tests;
- `apps/admin-web/src/access-code-files.ts` + tests;
- `apps/admin-web/src/AdminReportsWorkspace.tsx`;
- `apps/admin-web/src/admin-reports.css`;
- Admin shell navigation for Files/Reports;
- `apps/admin-web/e2e/admin-reports.e2e.spec.mjs`;
- Stage13G workflow extended to include reports E2E.

## 7. Tests & Verification

### G-A

Runtime `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
Run `34425317912` — SUCCESS.
Chromium 4/4.

### G-B

Runtime `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Run `34428052472` — SUCCESS.
Chromium 7/7 total.

### G-C1 Final Exact Runtime Verification

Runtime/code HEAD: **`345e0712c45e9e4c0479dc65d96efc3fb7da33cd`**.
Workflow: **`34430915626`** — all jobs SUCCESS.

Backend job:

- API lint: SUCCESS;
- strict typecheck: SUCCESS;
- unit: SUCCESS;
- build: SUCCESS;
- clean migrations through 0023: SUCCESS;
- Stage13G Accounts + Access integration: SUCCESS;
- Notifications + Operations integration: SUCCESS;
- Access/Auth regressions: SUCCESS.

Admin quality job:

- lint: SUCCESS;
- strict typecheck: SUCCESS;
- **57/57 unit tests**: SUCCESS;
- build: SUCCESS.

Real job:

- real API + clean PostgreSQL + seeded Super Admin/fixtures: SUCCESS;
- Chromium: **10/10 passed**;
- includes G-A account/access flows, G-B operations/notification flows and G-C1 import/export/print/session/mobile flows.

A documentation-only handoff commit may be branch HEAD after this runtime. It does not change executable runtime authority.

## 8. Known Issues

- `AI-012-019`: live provider/model/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- Admin production bundle currently emits a >500 kB Vite warning; functional build is successful. Revisit with measured performance evidence, not speculative refactoring.
- binary `.xlsx` generation is not implemented/verified.
- server-generated binary PDF is not implemented/verified; browser Save-as-PDF is verified.
- Student notification UI/sync is later Student roadmap work.
- earlier Stage13D/E/F Admin E2E helpers may assume Curriculum is post-login home and need adaptation before wider Stage13G closure regression.
- specialized Quiz/Lesson export/report variants remain mapped to G-D/later reporting until individually verified.

## 9. Remaining Work

### Immediate — G-C2 Reports / Settings / Security / Audit

Repository Discovery first:

1. Auth security/audit: `auth_events`, `auth_sessions`, `auth_login_guards`, recovery/reset/device/challenge state.
2. Access audit: `access_events`, redemptions, entitlements, code lifecycle.
3. Content/media/OCR/AI/review/question-bank/quiz event/history tables and services.
4. runtime config/environment contracts and any existing settings model.
5. Legacy Coverage acceptance rows for reports/settings/security/audit.

Then classify each gap and implement only evidence-backed product outcomes.

Security rule: never expose password hashes, session/reset/challenge hashes, raw device public-key material, provider credentials, environment secrets or private storage internals.

Verification required: API lint/typecheck/unit/build + clean PostgreSQL + relevant integration + Admin lint/typecheck/unit/build + real Chromium/session/mobile.

### After G-C2 — G-D

Remaining Lesson/Quiz AI authoring parity: trigger/orchestration, selected-lesson bulk generation, direct generation in Quiz Builder, per-version generation settings/orchestration, remaining archive/delete semantics and specialized exports.

### Stage13G Closure

- update Legacy Coverage row-by-row;
- adapt older Admin E2E helpers to Operations default without weakening assertions;
- run wider exact-head regression matrix;
- synchronize all Source of Truth + Issue #16;
- promote to `main` only after executable closure evidence.
