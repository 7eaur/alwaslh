# PROJECT HANDOFF — الوسيلة الذكية

> Replacement engineering conversation must be able to resume from repository + Actions + Issue #16 without chat memory.

Last synchronized: **2026-09-11 — Track A Stage13G VERIFIED / CLOSED; NOT PROMOTED TO MAIN.**

## Mandatory Startup

1. Confirm repository `7eaur/alwaslh` and exact live branch/head.
2. Track A Stage13G branch is `integration/stage13g-admin-product`; do not move to `main` unless Product Owner explicitly directs promotion.
3. Read `README.md`, `DOCUMENTATION_INDEX.md`, this file, Status, Resume Snapshot, Engineering Log, Integration Continuity and Execution Queue.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`, `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md`, `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` and latest Issue #16.
5. Live-check `main`, Track A, Track B when relevant, and GitHub Actions before conclusions.
6. Inspect current code/migrations/tests before any new change.

Code/migrations/executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## Operating Model

**Parallel Two-Track Execution**:

- Track A: Backend/Admin/DB/AI/Question Bank/Quiz authoring.
- Track B: Student Product Stage14+ on `parallel/stage14-student-product`.
- `main` is verified shared-contract handoff.
- no duplicate durable authority, force-push/history rewrite, fake API, auth bypass or test weakening.
- production release/deployment remains future-only unless separately approved.

## Shared Main

`main` remains Stage13F promoted checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Stage13G is deliberately **not promoted** by this Track A closure.

## Stage13G Closure Authority

Dedicated G-D/parity runtime:

- HEAD `80115ce27984a6f9098ab7e227f4b81e1f8aad39`.
- Run `34554764124` — all Stage13G jobs SUCCESS.
- real API/PostgreSQL/Chromium: **17/17**.
- Admin unit: **63/63**.
- migrations: **25**, through `0025_lesson_summary_content_revision.sql`.

Final wider-regression code/workflow head:

`dbb67a52c813aaf8b8d1af0faeacec65edde716b`

Verification-only PR #30 against current `main` ran **15/15 workflows SUCCESS, 0 failures** and was closed **unmerged**. This includes Stage9/10/OCR/11/12/13/13D/13E/13F/13G/Rebuild gates.

A later documentation-only closure commit may be live branch HEAD. Check it live; executable runtime authority above remains valid unless code changes.

## Stable Product / Architecture Rules

- Browser is not durable authority.
- Full Code = 6 digits; Class Code = 7 digits.
- Auth, sessions/devices and entitlements are server/PostgreSQL-owned.
- media ready != published content.
- Stage11 typed AI → Stage12 durable execution → Stage13E human review → Stage13F Question Bank/Quiz publication.
- Stage13E approval never auto-publishes Question Bank content.
- G-D authoring reuses Stage12 queue and Stage13E review; it does not create a second AI lifecycle or general chat assistant.
- generated Quiz questions enter Question Bank first and must be published before Quiz version materialization.
- published Question Bank revisions and Quiz snapshots remain immutable delivery authority.
- reports/audit/settings reuse canonical authorities; no generic duplicate truth store.

## Stage13G Completed Slices

### G-A — Accounts + Access

Admin Student/account/access projection + safe recovery/device/entitlement operations, Full/Class code inventory/generation/revoke, audit, responsive/session evidence.

### G-B — Notifications + Operations

One NotificationService over existing tables, Student API visibility/read authority, real canonical Operations dashboard, notifications lifecycle. Student-facing notification UI is not claimed.

### G-C1 — Code Import / Export / Print

Strict bounded CSV import, safe BOM CSV export, formula sanitization, selected/filter/used scopes, RTL browser Print/Save-as-PDF. No binary `.xlsx` or server PDF claim.

### G-C2 — Reports / Settings / Security / Audit

Safe reports/settings/security posture plus bounded audit projection across Auth, Access, Curriculum, AI review, Question Bank and Quiz Builder canonical event authorities. Secret config/provider/review/storage material is excluded.

### G-D — Lesson / Quiz AI Authoring Parity

- lesson generation for summary/questions/comprehensive/exact/replica modes, including selected lessons;
- Quiz generation with independent per-version lesson/source scope, counts/settings and bounded orchestration;
- one-click question regeneration preserving provenance;
- review-gated application to Lesson/Question Bank/Quiz;
- non-destructive audited archive semantics;
- summary edit/clear with consistent content revision;
- Lesson content/history export from current authorities;
- Quiz metadata editing and specialized selected-version print/export variants.

## Root-Cause / Quality Notes

- G-C2 audit initially omitted `curriculum_events`; corrected before closure and covered by integration/browser tests.
- G-D test failures encountered during development were rooted in fixture/typing/selectors and were fixed without weakening product validation.
- older Stage13D/E/F browser helpers were updated only to explicitly navigate from the intentional Operations default home; feature assertions stayed intact.
- Stage13E Combined now runs on Pull Requests so its real browser regression participates in cross-stage closure.
- Admin bundle still emits a Vite >500 kB warning; track as deferred P3 performance debt, not a Stage13G correctness blocker.

## Open Boundary

`AI-012-019` live provider/model/routes/credentials/bootstrap = **NOT YET VERIFIED**. Fixture-backed provider-neutral execution does not prove production provider readiness.

## Exact Next Action

Stage13G implementation is closed on Track A. Wait for explicit Product Owner direction to either:

1. promote/integrate the verified Stage13G branch to `main`, or
2. begin the next explicitly assigned Track A scope.

Do not autonomously merge to `main`.