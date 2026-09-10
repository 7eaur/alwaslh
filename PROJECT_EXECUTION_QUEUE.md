# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Start from the first incomplete Track A item after reading Source of Truth + Issue #16.

Last synchronized: **2026-09-10 — Stage13G G-A/G-B/G-C1 VERIFIED; G-C2 ACTIVE.**

## Operating Rules

- Repo: `7eaur/alwaslh`.
- Model: Parallel Track A (Backend/Admin/AI) + Track B (Student Product).
- Issue #16 is the shared ledger.
- Code/migrations/executable evidence outrank prose.
- No test weakening, fake API, auth bypass, duplicate authority, force push or history rewrite.
- Production deployment/cutover remains future-only.

## Completed Track A Checkpoints

### EXEC-006 — Stage13F Question Bank / Quiz Builder

**DONE / VERIFIED / CLOSED / PROMOTED**

Shared main checkpoint: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.

### EXEC-007A — Stage13G G-A Accounts + Access

**DONE / VERIFIED**

Runtime `4822f87d60ab7a467c4708b5f75bb24cb90e7738`, run `34425317912`, Chromium 4/4.

Closed: Student account operations, recovery/device UX, entitlement operations, Full/Class code inventory/generation/revoke, session/mobile evidence.

### EXEC-007B — Stage13G G-B Notifications + Operations Dashboard

**DONE / VERIFIED**

Runtime `bc19f6e198c8cfede62e9f1b7a7eb1b0fed121cb`, run `34428052472`, Chromium 7/7 total G-A+G-B.

Closed:

- real Admin operations home;
- curriculum/account/access/notification metrics;
- latest notification + Auth/Access activity;
- one canonical Admin/Student notification authority;
- Admin create/list/search/page/delete;
- Student API visibility/read state;
- real session + 390px evidence.

Student notification UI remains later Student work.

### EXEC-007C1 — Code Import / Export / Print

**DONE / VERIFIED**

Runtime/code HEAD: `345e0712c45e9e4c0479dc65d96efc3fb7da33cd`.
Run `34430915626` — all jobs SUCCESS.
Admin unit: 57/57.
Real Chromium: 10/10 total Stage13G scenarios.

Closed outcomes:

- strict bounded Full Access CSV import over existing Access authority;
- Arabic digit normalization + exact 6-digit validation;
- row-level invalid/duplicate handling;
- durable Access audit for accepted import rows;
- import template;
- canonical Full/Class code export with pagination consistency checks;
- UTF-8 BOM CSV compatible with Excel + spreadsheet formula-injection protection;
- all/filtered/used/selected scopes where supported;
- RTL printable code cards with explicit selected/filtered scope;
- browser Print / Save-as-PDF;
- session/mobile evidence.

Not claimed: binary `.xlsx` generation or server-generated binary PDF.

## Active Queue

### EXEC-007C2 — Reports / Settings / Security / Audit

**Priority: P1 · Status: ACTIVE / FIRST INCOMPLETE TRACK A ITEM**

Start with Repository Discovery, not UI guessing.

Inspect:

1. Auth security/audit authority: `auth_events`, sessions, login guards, reset/recovery/device/challenge state.
2. Access audit authority: `access_events`, redemptions, entitlements and code lifecycle.
3. Content/media/OCR/AI/review/question-bank/quiz history/event authorities.
4. API runtime configuration/environment ownership and any existing settings contracts.
5. Legacy Coverage rows for reports/settings/security/audit and specialized export requirements.

Architecture constraints:

- prefer bounded read projections/search/filter/page/export over existing canonical authorities;
- do not create a second generic audit store without evidence;
- do not make browser state authoritative for runtime/security configuration;
- never expose password hashes, token hashes, raw device key material, provider credentials or secret config;
- classify each gap KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE before implementation;
- add executable API/PostgreSQL/Admin/real Chromium evidence before closure.

### EXEC-007D — Remaining Lesson / Quiz AI Authoring Parity

**Priority: P1 · Status: REQUIRED after G-C2**

Open outcomes include lesson generation trigger/orchestration, selected-lesson bulk generation, direct generation inside Quiz Builder, version generation settings/orchestration, per-version source scope where still required, archive/delete semantics and specialized exports not closed by G-C.

### EXEC-007E — Stage13G Closure

**Priority: P0 process gate · Status: BLOCKED on G-C2/G-D**

- update Legacy Coverage row by row;
- synchronize all Source of Truth;
- adapt earlier Stage13D/E/F Admin E2E helpers to the Operations default home without weakening feature assertions;
- run wider exact-head regression matrix;
- verification-only PR if needed;
- integrate/promote to main only after evidence.

## Open Runtime Boundary

### AI-012-019

**NOT YET VERIFIED** — live provider/model/routes/credentials/bootstrap. Provider-neutral contracts do not prove production generation readiness.

## Parallel Track B

Student Product proceeds independently on `parallel/stage14-student-product`. Before Stage15 consumption it must incorporate verified shared Stage13F+later main authority. Never duplicate Auth/Access/Question Bank/Quiz/Notification backend authority locally.
