# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11 — Stage13G G-A/G-B/G-C1/G-C2 VERIFIED; G-D Remaining Admin AI-authoring parity ACTIVE on Track A.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — Stage13F promoted authority.
- Track A branch: `integration/stage13g-admin-product`.
- Last verified Track A runtime/code HEAD: `77350523f111398e2e008280938e60a4ad87130d`.
- Latest verified Track A workflow: `34529871808` — **SUCCESS**.
- Track B: `parallel/stage14-student-product`; its own workstream files are its execution truth.
- Shared ledger: Issue #16.
- Operating model: **Parallel Two-Track Execution**.
- Deployment/release remains deferred; no hosting action is part of current Stage13G.

A documentation-only handoff commit may sit above the verified runtime HEAD. Do not mistake prose-only HEAD movement for a new runtime verification point.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; live provider `AI-012-019` NOT YET VERIFIED |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F | VERIFIED / CLOSED / PROMOTED |
| Stage13G G-A Accounts + Access | **VERIFIED** |
| Stage13G G-B Notifications + Operations | **VERIFIED** |
| Stage13G G-C1 Code Import / Export / Print | **VERIFIED** |
| Stage13G G-C2 Reports / Settings / Security / Audit | **VERIFIED** |
| Stage13G G-D Remaining Admin AI-authoring parity | **ACTIVE — CURRENT** |
| Stage13G Closure | BLOCKED on G-D + wider regression |
| Stage14 | parallel Track B; verify from Track B Source of Truth |
| Stage15–25 | REQUIRED |
| Stage26–29 | future release/deployment |

## Stage13G G-A — VERIFIED

Runtime HEAD: `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
Workflow: `34425317912` — SUCCESS.
Chromium: **4/4**.

Verified outcomes:

- Student account list/search/status/detail;
- entitlement/device/redemption/Auth/Access history projection;
- safe temporary-password recovery and device rebind via existing AuthService;
- entitlement revoke via existing AccessService;
- Full/Class code list/search/filter/sort/pagination/generation;
- non-destructive unused-code revoke + durable `code_revoked` audit;
- session expiry + 390px responsive behavior.

## Stage13G G-B — VERIFIED

Runtime HEAD: `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Workflow: `34428052472` — SUCCESS.
Chromium: **7/7** total G-A + G-B scenarios.

Implemented authority:

- existing `notifications` / `notification_reads` schema retained as canonical store;
- Admin notification create/list/search/filter/page/delete;
- validated title/body/severity/internal action path/expiry;
- Student notification feed from the same store with global/class/profile visibility and unread/read tracking;
- Admin Operations overview with live counts for curriculum/students/access/notifications;
- latest Auth/Access activity and latest notifications, without a second analytics/event store;
- **لوحة التشغيل** is now the real Admin home;
- notification UI has inline two-step delete confirmation, loading/error/empty/session states and 390px layout.

Boundary: Student notification **API visibility/read authority is verified**, but Student notification product UI/sync remains Stage18 Track B/later roadmap.

## Stage13G G-C1 — VERIFIED

Runtime/code HEAD: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`.
Workflow: `34430915626` — **SUCCESS**.

Verification on the same runtime code HEAD:

- API lint / strict typecheck / unit / build: SUCCESS;
- clean PostgreSQL migrations through `0023`: SUCCESS;
- Stage13G Accounts + Access integration: SUCCESS;
- Notifications + Operations integration: SUCCESS;
- Access/Auth regressions: SUCCESS;
- Admin lint / strict typecheck / **57 unit tests** / build: SUCCESS;
- real API + PostgreSQL + Chromium: **10/10 passed**.

Implemented outcomes:

- strict bounded Full Access code import endpoint using existing Access tables, not a second code store;
- Arabic-digit normalization, exact 6-digit validation, per-row errors, duplicate-in-file and duplicate-existing handling;
- valid rows can commit while invalid rows return explicit result details;
- import writes durable Access audit events;
- import CSV template with explicit duration field;
- full/class code export over the canonical Admin access projection with pagination consistency checks;
- UTF-8 BOM CSV output compatible with Excel and guarded against spreadsheet formula injection;
- all/filtered/used and explicit selected-code scopes where applicable;
- RTL printable code-card workspace with explicit selected/filtered scope and browser Save-as-PDF path;
- real session-expiry behavior and 390px no-horizontal-overflow evidence.

Important boundary: **no binary `.xlsx` generator and no server-generated binary PDF is claimed**. Current verified spreadsheet output is CSV/Excel-compatible; current verified PDF outcome is browser print/Save as PDF.

## Stage13G G-C2 — VERIFIED

Runtime/code HEAD: `77350523f111398e2e008280938e60a4ad87130d`.
Workflow: `34529871808` — **SUCCESS**.

Verified outcomes:

- read-only operational reports for content ingestion/publication, OCR, AI jobs/review, Question Bank and quizzes;
- safe runtime/settings posture derived from typed `AppConfig` + canonical AI runtime controls only;
- security posture exposes aggregate counts, never credentials/tokens/device-key material or secret config values;
- bounded/filterable/paginated audit projection over canonical `auth_events`, `access_events`, `curriculum_events`, `ai_output_review_events`, `question_bank_events`, and `quiz_builder_events`;
- no duplicate generic audit/settings authority or migration introduced;
- Admin-only authorization with anonymous 401 and student 403 evidence;
- browser UI for Reports / Settings / Security / Audit with loading/error/session-expiry/mobile states;
- real API + PostgreSQL + Chromium gate SUCCESS after fixing the E2E locator to target the visible audit badge rather than a hidden `<option>`.

Security contract: metadata/notes/reviewed output/provider aliases/credentials, database URL, storage paths and allowed-origin values are deliberately absent from the public governance/audit projection.

## Current Findings

| ID | Sev | Area | Status |
|---|---:|---|---|
| `DOC-013G-001` | P2 | Source-of-Truth drift | RESOLVED |
| `ADMIN-013G-ACCESS-002` | P1 | Accounts/access Admin product | FIXED + VERIFIED G-A |
| `ADMIN-013G-ACCOUNT-003` | P1 | Student account/recovery/device UX | FIXED + VERIFIED G-A |
| `ADMIN-013G-RECOVERY-004` | P1 | temp password lost on same-account refresh | FIXED + VERIFIED |
| `TEST-013G-005` | P3 | session-expiry E2E did not trigger request | RESOLVED |
| `ADMIN-013G-NOTIF-006` | P1 | Notification Admin authority/UI absent | FIXED + VERIFIED G-B |
| `ADMIN-013G-DASH-007` | P1 | Real operational Admin home absent | FIXED + VERIFIED G-B |
| `TEST-013G-008` | P2 | G-B metrics test assumed empty DB after G-A | RESOLVED with baseline/delta isolation |
| `ADMIN-013G-CODEIO-009` | P1 | Code import/export/print parity absent | FIXED + VERIFIED G-C1 |
| `SEC-013G-CSV-010` | P2 | Spreadsheet formula injection risk | FIXED + VERIFIED sanitizer tests |
| `UX-013G-SCOPE-011` | P2 | Initial print/export lacked explicit selected scope | FIXED before closure + Chromium verified |
| `ADMIN-013G-GOV-012` | P1 | Reports/settings/security/audit Admin product gap | FIXED + VERIFIED G-C2 |
| `ADMIN-013G-AUDIT-013` | P2 | curriculum event authority initially omitted from unified audit projection | FIXED before G-C2 closure + executable regression |
| `TEST-013G-014` | P3 | Chromium audit-source assertion targeted hidden `<option>` | RESOLVED by visible badge locator |
| `AI-012-019` | P2 | live provider bootstrap | OPEN / NOT YET VERIFIED |

## G-D — Current Boundary

First incomplete Track A work is **Remaining Lesson / Quiz AI Authoring Parity**.

Confirmed from code before implementation:

1. Stage11/12 `AiExecutionRepository.createPlan` + worker/runtime controls remain the canonical durable AI execution authority; do not create another queue/job system.
2. Quiz Builder already owns quiz scope, immutable published-question snapshots, manual version composition, review/publish/archive lifecycle and per-version CSV/print export.
3. Question Bank owns approved revision provenance and regeneration application; generated quiz questions must consume published/known-answer Question Bank revisions rather than bypassing it.
4. G-D must add the missing feature-specific authoring orchestration: lesson summary/question generation triggers, bounded selected-lesson bulk generation, Quiz Builder direct generation/version orchestration/settings and any confirmed lifecycle/export parity gaps.
5. General AI chat/sidekick is explicitly outside G-D.
6. Existing `AI-012-019` live-provider bootstrap remains NOT YET VERIFIED and must not be disguised by fixture/stub generation.

After G-D: update Legacy Coverage row by row, adapt/execute wider Admin regressions on the Operations default home without weakening assertions, synchronize handoff/continuity/queue/log/status + Issue #16, then close Stage13G only on exact-head executable evidence.
