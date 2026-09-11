# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11 — Stage13G VERIFIED / CLOSED on Track A; NOT PROMOTED to main.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — Stage13F promoted authority.
- Track A branch: `integration/stage13g-admin-product`.
- Stage13G dedicated closure runtime HEAD: `80115ce27984a6f9098ab7e227f4b81e1f8aad39`.
- Dedicated closure workflow: `34554764124` — **SUCCESS**, including real PostgreSQL + Chromium **17/17**.
- Wider-regression Track A head: `dbb67a52c813aaf8b8d1af0faeacec65edde716b`.
- Verification-only PR #30 against current `main`: **15/15 workflows SUCCESS, 0 failures**, closed without merge.
- Track B: `parallel/stage14-student-product`; inspect its own Source of Truth live.
- Shared ledger: Issue #16.
- Deployment/release remains deferred unless separately directed.

A documentation-only closure commit may sit above `dbb67a52...`. Live-check branch/Actions; runtime evidence remains the executable authority.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; live provider `AI-012-019` NOT YET VERIFIED |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F | VERIFIED / CLOSED / PROMOTED |
| Stage13G G-A Accounts + Access | VERIFIED |
| Stage13G G-B Notifications + Operations | VERIFIED |
| Stage13G G-C1 Code Import / Export / Print | VERIFIED |
| Stage13G G-C2 Reports / Settings / Security / Audit | VERIFIED |
| Stage13G G-D Lesson / Quiz AI Authoring Parity | VERIFIED |
| Stage13G Closure | **VERIFIED / CLOSED ON TRACK A / NOT PROMOTED** |
| Stage14 | parallel Track B; verify from Track B Source of Truth |
| Stage15–25 | REQUIRED by roadmap / ownership depends on current integration state |
| Stage26–29 | future release/deployment |

## Stage13G Closure Outcomes

### G-A — Accounts + Access

Verified canonical Student account/access operations, recovery/device rebind through AuthService, entitlement revoke through AccessService, Full/Class code inventory/generation and non-destructive unused-code revoke with audit.

### G-B — Notifications + Operations

Verified shared notification authority over `notifications` / `notification_reads`, Admin notification management, Student API visibility/read authority, and the real Operations dashboard as Admin home. Student notification UI remains later Student work.

### G-C1 — Import / Export / Print

Verified strict bounded Full Access CSV import, Arabic-digit normalization, exact six-digit validation, row-level errors/duplicates, canonical audit, safe BOM CSV export, selected/filter/used scopes and RTL print/Save-as-PDF. Binary `.xlsx` and server-generated binary PDF are not claimed.

### G-C2 — Reports / Settings / Security / Audit

Verified read-only operational reports and safe settings/security posture. Audit is a bounded projection over canonical `auth_events`, `access_events`, `curriculum_events`, `ai_output_review_events`, `question_bank_events`, and `quiz_builder_events`. No duplicate generic audit/settings authority was created and secret config/review/provider/storage material is not exposed.

### G-D — Lesson / Quiz AI Authoring Parity

Verified feature-specific authoring, not general AI chat:

- selected-lesson generation bounded to 1–32 lessons;
- lesson summary/question/comprehensive/exact/replica generation through existing Stage12 durable `AiExecutionRepository` authority;
- Quiz generation bounded to 1–20 versions with independent per-version lesson/source scopes and typed counts/settings;
- server-resolved canonical published lesson/OCR provenance;
- idempotent authoring plans and apply flows;
- human AI review remains mandatory before application;
- generated questions enter canonical Question Bank and must be published before Quiz version materialization;
- one-click question regeneration preserves source/context;
- non-destructive audited question/quiz archive semantics;
- lesson summary edit/clear with consistent `content_revision` via migration `0025_lesson_summary_content_revision.sql`;
- Admin-only lesson content/history export projected from current curriculum/Question Bank/AI authorities without a second history store;
- Quiz metadata edit and selected-version specialized exports for questions/options/answers/explanations/answer key/lesson names/lesson images.

## Verification

Dedicated Stage13G closure run `34554764124`:

- Backend lint / strict typecheck / unit / build: SUCCESS;
- clean PostgreSQL migrations through **0025**: SUCCESS;
- G-A/G-B/G-C2/G-D integrations + Access/Auth regressions: SUCCESS;
- Admin lint / strict typecheck / unit / build: SUCCESS;
- real API + PostgreSQL + Chromium: **17/17**.

Wider verification-only PR #30 for head `dbb67a52...`:

- **15/15 workflows SUCCESS** covering Rebuild, Stage9, Stage10, OCR, Stage11, Stage12, Stage13 Admin, Stage13D backend/UI, Stage13E preparation/Admin/combined integration, Stage13F backend/Admin, and Stage13G.
- PR closed unmerged; `main` unchanged.

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
| `TEST-013G-008` | P2 | metrics test assumed empty shared DB | RESOLVED with baseline/delta isolation |
| `ADMIN-013G-CODEIO-009` | P1 | Code import/export/print parity absent | FIXED + VERIFIED G-C1 |
| `SEC-013G-CSV-010` | P2 | Spreadsheet formula injection risk | FIXED + VERIFIED |
| `UX-013G-SCOPE-011` | P2 | export/print selection parity | FIXED + VERIFIED |
| `ADMIN-013G-GOV-012` | P1 | reports/settings/security/audit gap | FIXED + VERIFIED G-C2 |
| `ADMIN-013G-AUDIT-013` | P2 | curriculum event authority omitted initially | FIXED + VERIFIED |
| `TEST-013G-014` | P3 | audit-source Chromium locator targeted hidden option | RESOLVED |
| `ADMIN-013G-AUTHORING-015` | P1 | Lesson/Quiz AI authoring parity incomplete | FIXED + VERIFIED G-D |
| `CONSISTENCY-013G-016` | P2 | manual summary changes did not consistently advance content revision | FIXED by migration 0025 + integration regression |
| `TEST-013G-017` | P2 | older Admin E2E assumed Curriculum was post-login home | RESOLVED by explicit workspace navigation; feature assertions unchanged |
| `CI-013G-018` | P2 | Stage13E combined real-browser workflow absent from PR closure matrix | FIXED by enabling `pull_request` trigger |
| `PERF-013G-BUNDLE-019` | P3 | Admin bundle exceeds Vite 500 kB warning threshold | OPEN / DEFERRED; correctness unaffected |
| `AI-012-019` | P2 | live provider bootstrap | OPEN / NOT YET VERIFIED |

## Remaining / Next Decision

Stage13G has no remaining implementation blocker. Next Track A action is **WAITING FOR EXPLICIT PRODUCT OWNER DIRECTION** on promotion/integration to `main` or the next owned stage.

Do not promote to `main` autonomously. `AI-012-019` remains separate and unverified by fixture-based Stage13G tests.