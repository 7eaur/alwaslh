# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**CURRENT UX BATCH: `UX-B00 — Foundation documentation and audit`**

**EXACT RETURN POINT AFTER THIS TRACK: `STUDENT-016I — True cold-start offline Reader`**

Reason: continuing Stage16/17+ feature work on top of the current Student/Admin UX foundation would increase product debt. Backend/domain/security architecture remains intact; this is a structural frontend refoundation, not a restart or blind rewrite.

Canonical pause document:

`docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`

Canonical refoundation foundation documents:

- `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`
- `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
- `docs/product/DESIGN_SYSTEM_SPEC.md`
- `docs/product/CONTENT_LANGUAGE_RULES.md`
- `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`

## Live baseline and branch

PR #41 — unified Alwaslh product engineering skill package — was verified mergeable with successful PR-head CI and merged before refoundation implementation work.

- PR #41 tested/final head: `25f876d3cfe2af95a8a27319c289f102db3e6db0`
- merge commit: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`
- refoundation foundation branch: `ux/refoundation-foundation`
- branch start: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`

The project-scoped engineering/design skill is now integrated at:

`.agents/skills/alwaslh-product-engineering/SKILL.md`

External Product Design/Mobbin/Figma references remain supporting tools only; no external reference can override code/contracts/approved identity.

## Foundation audit decision

The source-backed UX audit is no longer `NOT YET VERIFIED` at the structural inventory level.

Verified high-impact findings:

1. **Routing/navigation foundation:** neither Student nor Admin currently has route-based application navigation; both rely on component/state switching.
2. **Student:** authenticated experience stacks Curriculum + Assessment + Offline Downloads + Access in one aggregate surface; there is no true Home destination and Reader is nested inside curriculum UI.
3. **Admin:** global navigation is 11 flat state-switched workspaces; multiple pages combine independent create/list/detail/review/config/export workflows.
4. **Copy/data:** Student exposes crypto/storage/offline implementation details; Admin exposes Stage/parity/cache/revision/config implementation language and identifiers beyond normal operator need.
5. **Legacy UI:** Lesson/Quiz parity panels duplicate capabilities and should be migrated into canonical detail pages, then removed only after executable parity proof.
6. **Responsive Admin:** current narrow layout moves the full sidebar above content rather than providing a task-focused mobile/narrow workspace shell.
7. **Identity/design foundation:** `packages/brand` tokens/identity are valuable and remain canonical; Student/Admin production lockups should use approved assets consistently.
8. **A11y foundation:** focus styles, touch targets, RTL logical properties and reduced motion exist and should be preserved; full changed-flow keyboard/contrast/device verification remains implementation-gated.

Audit classification and evidence are recorded in `UX_UI_MASTER_AUDIT_2026-09-12.md`.

## Target product IA

### Student

Treat as an installed educational app, not a long responsive webpage.

Stable implemented-era destinations:

- Home
- Learn / Subjects
- Practice
- Downloads / Offline learning
- Account access

Dedicated focused destinations:

- Subject / lesson navigation
- Reader
- active Assessment

Do **not** add Personal Learning or Progress as fake destinations before their roadmap stages exist.

### Super Admin

Treat as an operational workspace grouped by lifecycle:

- Overview
- Curriculum
- Content / Ingestion / OCR
- AI Jobs / Human Review
- Question Bank / Quizzes
- Students / Access Codes
- Operations / Notifications / Audit / constrained System Status

Dashboard remains an overview/attention surface, not the entire product.

Detailed route hierarchy and parent/child relationships are canonicalized in `TARGET_INFORMATION_ARCHITECTURE.md`.

## Design/content foundation

Approved identity remains:

- Arabic-first / RTL-first;
- calm modern educational product;
- teal/open-book direction;
- Cairo typography;
- Student touch-first;
- Admin dense but readable.

Existing semantic tokens are **KEEP/EXTEND**, not replace.

Production copy rule:

- Student sees learning/action/recovery meaning, never storage/crypto/cache/revision mechanics;
- Admin sees real domain terminology, not implementation/stage/parity language;
- raw IDs/enums/errors become secondary diagnostics only when a real operational decision needs them.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN |
| Stage13A–G | VERIFIED / CLOSED / integrated |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED |
| **Stage16 Offline/PWA** | **OPEN / PARTIALLY VERIFIED — roadmap execution temporarily paused** |
| Stage17 | BLOCKED BY Stage16 closure |
| Stage18–25 | pending in roadmap order |
| Stage26–29 | pending release/operations sequence |

`STUDENT-016H`: **DONE / VERIFIED / MERGED**. Do not redo it.

## Exact Stage16 continuation after UX/UI refoundation

1. `STUDENT-016I` — true cold-start offline Reader.
2. `STUDENT-016R` — reconnect revalidation + purge.
3. `STUDENT-016S` — revision/tombstone/cursor/delta synchronization.
4. `STUDENT-016O` — only if later authorized offline writes require bounded durable outbox.
5. `STUDENT-016G` — Stage16 closure matrix/gate.
6. Stage17 only after Stage16 closure.

Verified Stage16 security boundary that UI work must preserve:

- safe PWA shell;
- `/v1` excluded from Service Worker Cache API authority;
- profile/device-bound offline lease;
- protected Published+entitled lesson packages;
- bounded offline storage;
- server-signed P-256/ES256 authorization;
- durable non-secret active scope selector;
- read-time signature/metadata/key/scope/expiry verification;
- read-time size + SHA-256 blob integrity verification;
- logout/late-refresh lifecycle protection.

## Relevant prior verification evidence

### PR #39

- tested head `8659414259fef83183aafa3204883281750491ad`
- 17/17 workflows SUCCESS
- merge `e2344d22820a972b6a29f7d5cca16a94b670cd10`
- hosted Admin same-origin authenticated persistence verified live

### PR #38

- tested head `407d9992c91d95081147fc104e13b69addef5eb8`
- 18/18 workflows SUCCESS
- merge `a6f220c74e46852a8b2e6667271acc41b3fb8c79`
- `STUDENT-016H` DONE / VERIFIED / MERGED

Student authenticated hosted same-origin E2E after PR #39: `NOT YET VERIFIED`.

## Railway/content/AI state

Hosted inspection stack remains API/Admin/Student/PostgreSQL on Railway project `charming-peace`; environment name `production` does **not** imply Stage28 Production Cutover.

Public inspection surfaces remain documented in `docs/operations/RAILWAY_LIVE_STATE.md`.

Canonical content source remains `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

- inventory: 48 documents / 5,552 images;
- bounded Grade 9 English proof: 75 source images / 75 ready media assets / 300 variants / 75 lesson assets / 10 lessons;
- bounded proof remains Draft;
- no automatic Student publication;
- no automatic AI question publication;
- do not bulk-materialize full inventory during refoundation.

`AI-012..AI-019` live provider readiness remains `NOT YET VERIFIED`.

## UX/UI execution roadmap

Refoundation batches are defined in `UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.

Current order begins:

- `UX-B00` foundation audit/docs;
- `UX-B01` shared route/shell/presentation foundation;
- `UX-B02` Student shell/navigation;
- `UX-B03..B05` Student learning/assessment/offline/account;
- `UX-B06` Admin shell/grouped navigation;
- `UX-B07..B14` Admin workflow families;
- `UX-B15` cross-product cleanup;
- `UX-B16` responsive/RTL/accessibility closure;
- `UX-B17` visual/regression/refoundation closure.

No Stage16 continuation is allowed inside these batches.

## UX-B00 verification state

Completed:

- live `main`/PR #41 state verified before branching;
- PR #41 merged cleanly;
- approved brand sources/tokens/assets inspected;
- actual Student UI/source tree inventoried;
- actual Admin UI/source tree inventoried;
- API composition inspected to validate domain families;
- Student/Admin E2E inventories inspected;
- structural UX audit + target IA + design system + content language + roadmap created;
- Issue #16 updated during work.

Not applicable yet:

- application lint/typecheck/build/browser checks, because UX-B00 is documentation/audit only.

Still required before UX-B00 closure:

- central engineering log sync;
- foundation PR;
- exact-head PR CI review;
- merge only after green evidence.

Visual/device inspection of redesigned screens: `NOT YET VERIFIED` because implementation has not started.

## Next action

Close `UX-B00` through a reviewable PR and exact-head CI. Then begin **`UX-B01 — Shared frontend foundation`** from refreshed `main`, introducing route/shell foundations and presentation primitives before migrating major workflows.