# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**EXACT RETURN POINT AFTER THIS TRACK: `STUDENT-016I — True cold-start offline Reader`**

Reason for the temporary pause: the current Student and Super Admin interface foundations have material usability, hierarchy, navigation, consistency and cognitive-load problems. Continuing Stage16/17+ feature work on top of that foundation would increase product debt. The product/backend/domain architecture remains intact; this is not a restart or blind rewrite.

Canonical pause document:

`docs/workstreams/UX_UI_REFOUNDATION_PAUSE_2026-09-12.md`

## Unified repository skill package

The project now has one project-scoped Codex skill entry point:

`.agents/skills/alwaslh-product-engineering/SKILL.md`

It intentionally uses **one triggerable skill** plus focused `references/` rather than multiple overlapping skills. This avoids competing trigger instructions and keeps context loading progressive.

Specialized references cover:

- Student PWA / installed-app UX;
- Super Admin workspace UX;
- Design System + Arabic RTL + responsive + accessibility;
- React/Vite frontend engineering;
- Backend/API/database/security/performance;
- educational product logic;
- browser/Playwright QA and regression verification;
- Product Design + Mobbin + Figma routing;
- project architecture/change guardrails.

Conflict priority is explicit: Product Owner direction and verified project authority/contracts outrank project references; project references outrank external plugins, generic skills and visual inspiration. Product Design, Mobbin and Figma are supporting tools, never canonical product authority.

## Frozen baseline before skill-package batch

Repository: `7eaur/alwaslh`

Live `main` before the skill-package branch:

`5513d7ba7f3aac11231479c99d656cbffe458a9d`

This includes PR #40, which froze the roadmap for UX/UI refoundation and recorded `STUDENT-016I` as the exact continuation point.

Earlier verified integration evidence remains:

### PR #39

- tested head: `8659414259fef83183aafa3204883281750491ad`
- tested head workflows: **17/17 SUCCESS**
- merge commit: `e2344d22820a972b6a29f7d5cca16a94b670cd10`
- tested-head and merge tree equality verified during project recovery
- hosted Admin same-origin authenticated persistence verified live

### PR #38 — Stage16 read-time authority

- tested head: `407d9992c91d95081147fc104e13b69addef5eb8`
- workflows: **18/18 SUCCESS**
- merge commit: `a6f220c74e46852a8b2e6667271acc41b3fb8c79`
- `STUDENT-016H`: **DONE / VERIFIED / MERGED**

Do **not** redo 016H after the UI maintenance track.

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

## Exact Stage16 continuation after UX/UI maintenance

First unfinished engineering item:

### `STUDENT-016I — True cold-start offline Reader`

Required acceptance:

`online download → close real browser/context → restart → network unavailable → PWA shell → durable scope discovery → signed authorization verification → stored blob integrity verification → Reader renders`

Then continue in this order:

1. `STUDENT-016I` — cold-start offline Reader.
2. `STUDENT-016R` — reconnect session/device/entitlement/publication/revision revalidation + purge.
3. `STUDENT-016S` — authoritative revision/tombstone/cursor/delta synchronization.
4. `STUDENT-016O` — only if later authorized offline writes require a bounded durable outbox.
5. `STUDENT-016G` — Stage16 final closure matrix/gate.
6. Stage17 only after Stage16 closure.

## Stage16 verified boundary that UI work must preserve

Current integrated implementation already includes:

- safe PWA app shell;
- `/v1` excluded from Service Worker Cache API authority;
- server-issued profile/device-bound offline lease;
- protected lesson manifest + revision-pinned assets;
- Published + entitled material only;
- bounded offline package storage;
- server-signed P-256/ES256 offline authorization;
- durable non-secret active scope selector;
- read-time signature/metadata/key/scope/expiry verification;
- read-time exact blob-size + SHA-256 integrity verification;
- logout/late-refresh lifecycle protection;
- real-browser tamper rejection coverage from the Stage16 authority batch.

Security/business boundaries must not be weakened to simplify interface work.

## Current UX/UI refoundation objective

The design track must first audit real code and flows, then establish a coherent product system for both surfaces.

Student target flow:

`Activation / Login → Home → Subjects → Curriculum → Lesson / Reader → Practice / Test → Offline learning → Personal learning → Progress`

Super Admin operational chain:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

Required outcome:

- correct information architecture;
- lower cognitive load;
- unified tokens/components/states;
- strong Arabic RTL hierarchy;
- responsive/mobile-first Student installed-app UX;
- efficient dense Admin workspace patterns;
- loading/empty/error/offline/permission states;
- accessibility baseline;
- visual consistency without forcing Student and Admin into identical layouts;
- no unnecessary gradients/glass/glow/repetitive-card/AI-looking decoration.

Quality order:

`Function → Clarity → UX → Hierarchy → Consistency → Visual polish`

## Railway live inspection state

Railway project: `charming-peace`

Environment: `production` — this is the current hosted inspection environment name and **does not mean Stage28 Production Cutover is complete**.

Services observed successful during recovery:

- API
- Admin
- Student
- PostgreSQL

Public surfaces:

- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`

PR #39 same-origin hosted Admin login/session persistence was verified live.

Student authenticated live same-origin E2E after PR #39:

`NOT YET VERIFIED`

## Content state

Canonical source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Inventory:

- 48 documents
- 5,552 images

Bounded Grade 9 English proof:

- 75 source images
- 8,390,689 source bytes
- 75 ready media assets
- 300 variants
- 75 lesson assets
- 10 lessons
- **Draft only**

No automatic Student publication and no automatic AI question publication.

Do not bulk-materialize the 5,552-image inventory during the UX/UI refoundation.

## AI / Question Bank state

The safe chain remains:

`AI output → human AI review → Question Bank Draft → QB Review/Published → immutable Quiz version`

`AI-012..AI-019` live provider/model/routes/credentials/bootstrap:

`NOT YET VERIFIED`

Do not infer production AI readiness from fixtures/tests.

## Parallel open work — intentionally not the active focus

- `CONTENT-PROD-002` — controlled review/publication of the bounded Grade 9 English proof.
- Student authenticated hosted E2E after PR #39.
- `AI-012..AI-019` production provider readiness.
- Stage17–29 roadmap.

## UX/UI refoundation completion gate

Normal roadmap execution resumes only after:

1. Student + Admin UX/code inventory audit;
2. approved information architecture;
3. unified design-system rules/tokens/primitives;
4. corrected navigation/layout foundations;
5. high-impact Student/Admin flows remediated;
6. responsive behavior verified;
7. accessibility baseline verified for changed components;
8. changed loading/empty/error/offline/permission states verified;
9. lint/typecheck/tests/build pass for changed apps;
10. no backend/security/business-contract regression;
11. `PROJECT_ENGINEERING_LOG.md` and `PROJECT_STATUS.md` synchronized;
12. return marker remains `STUDENT-016I` unless new evidence proves a dependency/order change.

## Next management action

Use the unified skill package to perform a structured Student/Admin source-and-flow inventory audit. Do not begin broad visual implementation before the audit, IA and design-system decisions are evidence-backed.
