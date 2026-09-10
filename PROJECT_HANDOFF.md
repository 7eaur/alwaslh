# PROJECT HANDOFF — الوسيلة الذكية

> Replacement engineering conversation must be able to resume from repository + Actions + Issue #16 without chat memory.

Last synchronized: **2026-09-10 — Track A Stage13G G-A/G-B/G-C1 VERIFIED; G-C2 CURRENT.**

## Mandatory Startup

1. Confirm repository `7eaur/alwaslh` and exact current branch/head.
2. Work on Track A branch `integration/stage13g-admin-product` unless Product Owner explicitly changes it.
3. Read `README.md`, `DOCUMENTATION_INDEX.md`, this file, Status, Resume Snapshot, Engineering Log, Integration Continuity and Execution Queue.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`, `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md`, `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` and latest Issue #16 body/comments.
5. Live-check `main`, Track A branch and GitHub Actions before conclusions.
6. Inspect current-stage DB/API/Admin/tests before changing them.

Code/migrations/executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## Operating Model

**Parallel Two-Track Execution**:

- Track A: Backend/Admin/DB/AI/current Stage13G.
- Track B: Student Product Stage14+ on `parallel/stage14-student-product`.
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
- reports/audit/settings must reuse canonical event/config authorities and must not create a second generic truth store merely for UI convenience.

## Shared Main

Stage13F promoted main checkpoint:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

Do not move shared main from this conversation until Stage13G closure gates pass.

## Stage13G Verified Runtime Chain

### G-A — Accounts + Access

Runtime `4822f87d60ab7a467c4708b5f75bb24cb90e7738`.
Run `34425317912` — SUCCESS; Chromium 4/4.

Owns Admin Student account projection/operations and access-code inventory/maintenance while AuthService/AccessService remain mutation authorities.

### G-B — Notifications + Operations

Runtime `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`.
Run `34428052472` — SUCCESS; Chromium 7/7 total.

Implemented shared NotificationService over existing notification tables plus real Operations dashboard read model over canonical tables/events.

Student notification API/read authority is verified; Student notification product UI/sync remains later Student roadmap work.

### G-C1 — Code Import / Export / Print

**VERIFIED runtime/code HEAD:** `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`.
**Workflow:** `34430915626` — all jobs SUCCESS.
**Admin unit:** 57/57.
**Real API/PostgreSQL/Chromium:** 10/10 passed.

Implemented:

- strict bounded Full Access import through existing Access authority;
- Arabic-digit normalization and exact 6-digit validation;
- per-row invalid/duplicate result reporting;
- durable Access audit for imported codes;
- CSV template;
- Full/Class code export from canonical projection;
- UTF-8 BOM CSV compatible with Excel + spreadsheet formula-injection protection;
- explicit all/filtered/used/selected scopes as supported by the product flow;
- RTL printable code cards with selected/filtered scope;
- browser Print / Save-as-PDF flow;
- session-expiry and 390px responsive evidence.

Do **not** claim binary `.xlsx` generation or server-produced binary PDF; those are not what G-C1 verified.

A documentation-only handoff commit may sit above `345e0712...`. Runtime verification authority remains that code HEAD until executable code changes and a new exact-head run succeeds.

## Current Work — G-C2 Reports / Settings / Security / Audit

This is the **first incomplete Track A item**.

Before writing code:

1. inspect `auth_events` and Auth security state (`auth_sessions`, login guards, reset/challenge/device structures) without exposing hashes/tokens/secrets;
2. inspect `access_events` and entitlement/code audit;
3. inspect content/media/OCR/AI/review/question-bank/quiz event tables and existing services;
4. inspect runtime/config contracts before adding any Admin-editable settings;
5. map legacy report/settings/security/audit rows to exact current authorities;
6. classify each missing surface KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE.

Preferred architecture: bounded read models and filtered/paginated exports over existing event authorities. Do not invent another generic audit/event store unless actual evidence proves the current authorities cannot satisfy a required outcome.

Security boundary: never expose password hashes, session/reset/challenge token hashes, raw device public-key material, AI/provider credentials, environment secrets or private storage internals.

Any new G-C2 surface needs API/PostgreSQL/Admin quality + real Chromium evidence before `VERIFIED`.

## After G-C2

G-D remains required for remaining lesson/quiz AI-authoring parity: generation trigger/orchestration, selected-lesson bulk generation, Quiz Builder generation settings/direct generation/version orchestration, remaining archive/delete semantics and specialized exports.

Then synchronize Legacy Coverage, adapt older Stage13D/E/F Admin E2E helpers to the Operations default home, run the wider exact-head matrix and only then consider promotion to `main`.

## Important Open Boundary

`AI-012-019` live provider/model/routes/credentials/bootstrap = **NOT YET VERIFIED**.
