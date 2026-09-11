# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Start from the first incomplete item only after reading current Source of Truth + Issue #16 and checking live repository state.

Last synchronized: **2026-09-11 — Stage13G CLOSED/VERIFIED on Track A; promotion decision pending.**

## Operating Rules

- Repo: `7eaur/alwaslh`.
- Model: Parallel Track A (Backend/Admin/AI) + Track B (Student Product).
- Issue #16 is the shared ledger.
- Code/migrations/executable evidence outrank prose.
- No test weakening, fake API, auth bypass, duplicate authority, force push or history rewrite.
- Production deployment/cutover remains future-only unless separately approved.

## Completed Track A Checkpoints

### EXEC-006 — Stage13F Question Bank / Quiz Builder

**DONE / VERIFIED / CLOSED / PROMOTED**

Shared `main`: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.

### EXEC-007A — Stage13G G-A Accounts + Access

**DONE / VERIFIED**

Runtime `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.

### EXEC-007B — Stage13G G-B Notifications + Operations

**DONE / VERIFIED**

Runtime `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`, Chromium 7/7 total.

### EXEC-007C1 — Code Import / Export / Print

**DONE / VERIFIED**

Runtime `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`, run `34430915626`, Chromium 10/10 total.

### EXEC-007C2 — Reports / Settings / Security / Audit

**DONE / VERIFIED**

Runtime `77350523f111398e2e008280938e60a4ad87130d`, run `34529871808`, all three jobs SUCCESS.

Closed outcomes:

- safe operational reports;
- settings/security posture without secret values;
- bounded canonical audit projection across Auth, Access, Curriculum, AI review, Question Bank and Quiz Builder;
- no duplicate generic audit/settings store.

### EXEC-007D — Remaining Lesson / Quiz AI Authoring Parity

**DONE / VERIFIED**

Dedicated closure runtime `80115ce27984a6f9098ab7e227f4b81e1f8aad39`, run `34554764124`, all jobs SUCCESS, Chromium 17/17.

Closed outcomes:

- selected-lesson summary/question/comprehensive/exact/replica generation;
- bounded/idempotent reuse of Stage12 durable execution;
- per-version Quiz lesson/source selection and typed generation settings;
- one/all-version orchestration;
- review-gated apply through canonical Question Bank/Quiz authority;
- one-question regeneration preserving provenance;
- audited non-destructive archive semantics;
- summary edit/clear + content revision consistency;
- Lesson content/history export;
- Quiz metadata edit + selected-version specialized exports.

### EXEC-007E — Stage13G Closure

**DONE / VERIFIED / CLOSED ON TRACK A / NOT PROMOTED**

Wider-regression head: `dbb67a52c813aaf8b8d1af0faeacec65edde716b`.

Verification-only PR #30 against current Stage13F `main`:

- **15/15 workflows SUCCESS**;
- 0 failures;
- older Stage13D/E/F browser helpers adapted only to Operations default home;
- Stage13E Combined real-browser gate enabled for PR verification;
- PR closed unmerged;
- `main` unchanged.

## First Incomplete Track A Item

### EXEC-008 — Stage13G Promotion / Integration Decision

**Priority: P0 process gate · Status: WAITING FOR EXPLICIT PRODUCT OWNER DIRECTION**

Stage13G code is closed on Track A. Do not promote automatically.

If Product Owner requests promotion:

1. live-check current `main`, Track A and relevant Track B divergence;
2. preserve canonical Auth/Access/Notification/AI/Question Bank/Quiz contracts;
3. prepare promotion candidate without force/history rewrite;
4. run required integration/regression evidence on that candidate;
5. update Issue #16 and central docs after promotion.

If Product Owner instead assigns another Track A stage, begin only from that explicit scope and re-read its current code/tests.

## Open Runtime Boundary

### AI-012-019

**NOT YET VERIFIED** — live provider/model benchmark/routes/credentials/bootstrap. Provider-neutral contracts and fixture-backed authoring do not prove production generation readiness.

## Deferred Quality Boundary

Admin bundle currently triggers Vite’s >500 kB chunk warning. Treat as P3 measured performance debt; do not add speculative code splitting inside Stage13G closure.

## Parallel Track B

Track B proceeds independently on `parallel/stage14-student-product`. Until Stage13G is explicitly promoted, shared `main` remains Stage13F. Track B must consume only contracts actually present on its integrated baseline and must never duplicate backend authority to work around an unpromoted Track A branch.