# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Start from the first incomplete Track A item after reading Source of Truth + Issue #16.

Last synchronized: **2026-09-10 — Stage13G G-A/G-B VERIFIED; G-C ACTIVE.**

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

Student notification UI is not silently closed; it remains later Student work.

## Active Queue

### EXEC-007C1 — Code Import / Export / Print

**Priority: P1 · Status: ACTIVE**

Required evidence-backed outcomes:

- `CODE-A-013` strict import with exact format and row-level errors;
- `CODE-A-014` correct template;
- `CODE-A-015/016` safe all/used export scopes;
- printable code cards with explicit Full/Class/filter/selection scope;
- no password/device-secret leakage;
- server-owned validation/output, bounded payloads and real integration tests.

Use existing Access tables/service; do not create a second code store.

### EXEC-007C2 — Reports / Settings / Security / Audit

**Priority: P1 · Status: NEXT**

Inspect actual config/schema/event authorities first. Preserve existing Auth/Access/content/AI audit evidence; add only missing read/product contracts. Do not expose secrets or make browser state authoritative.

### EXEC-007D — Remaining Lesson / Quiz AI Authoring Parity

**Priority: P1 · Status: REQUIRED after G-C**

Open outcomes include lesson generation trigger/orchestration, selected-lesson bulk generation, direct generation inside Quiz Builder, version generation settings/orchestration, per-version source scope where still required, archive/delete semantics and specialized exports not closed by G-C.

### EXEC-007E — Stage13G Closure

**Priority: P0 process gate · Status: BLOCKED on G-C/G-D**

- update Legacy Coverage row by row;
- synchronize all Source of Truth;
- run wider exact-head regression matrix including earlier Admin E2E helpers adapted to the new Operations default home;
- verification-only PR if needed;
- integrate/promote to main only after evidence.

## Open Runtime Boundary

### AI-012-019

**NOT YET VERIFIED** — live provider/model/routes/credentials/bootstrap. Provider-neutral contracts do not prove production generation readiness.

## Parallel Track B

Student Product proceeds independently on `parallel/stage14-student-product`. Before Stage15 consumption it must incorporate verified shared Stage13F+later main authority. Never duplicate Auth/Access/Question Bank/Quiz/Notification backend authority locally.
