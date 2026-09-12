# UX/UI REFOUNDATION PAUSE — 2026-09-12

## Purpose

This document freezes the current engineering execution point before a dedicated UX/UI refoundation and design-system remediation track begins.

The product is **not being restarted** and the business/product architecture is **not being discarded**. The goal is to preserve the verified backend/domain/platform work while correcting the Student and Super Admin interaction foundations before additional product stages are built on top of an inconsistent or unnecessarily complex UI layer.

## Product Owner direction

Execution of the normal roadmap is temporarily paused because the current interface foundation has material usability and product-design problems:

- the Super Admin dashboard/navigation is too difficult and cognitively heavy;
- the Student interface foundation is visually and structurally constrained rather than naturally organized around the learning journey;
- hierarchy, spacing, component behavior and navigation need stronger consistency;
- Student and Admin surfaces need a deliberate shared design system without making them look like the same product surface;
- future Stage17+ work must not deepen the current UX/UI debt;
- backend/domain contracts and verified business rules should be preserved unless a concrete defect is proven.

This is a **product-quality intervention**, not a blind rewrite.

## Frozen technical baseline

Repository: `7eaur/alwaslh`

Frozen live baseline before this documentation batch:

`main@e2344d22820a972b6a29f7d5cca16a94b670cd10`

That commit is the merge of PR #39, whose tested head was:

`8659414259fef83183aafa3204883281750491ad`

PR #39 fixed hosted session persistence by moving Admin/Student production API usage behind same-origin `/v1` proxying.

Previous Stage16 authority work was merged by PR #38:

- tested head: `407d9992c91d95081147fc104e13b69addef5eb8`
- merge commit: `a6f220c74e46852a8b2e6667271acc41b3fb8c79`

The current `main` tree therefore already includes the completed `STUDENT-016H` read-time authority work.

## Exact roadmap position at pause

### Completed before pause

- Stages 1–10 + OCR — verified foundation completed.
- Stage11 — AI contracts/versioning/provenance foundation completed.
- Stage12 — durable AI runtime foundation completed; live provider readiness remains separate and open.
- Stage13A–G — Super Admin product work integrated.
- Stage14 — Student product foundation closed/verified.
- Stage15 — Student assessment/practice closed/verified.
- Stage16 — partially completed and still OPEN.
- `STUDENT-016H` — **DONE / VERIFIED / MERGED**.
- same-origin hosted session proxy correction — **DONE / MERGED** by PR #39.

### First unfinished product-engineering item

The exact continuation point after UX/UI refoundation is:

`STUDENT-016I — True cold-start offline Reader`

Required acceptance remains:

`online download → close real browser/context → restart → network unavailable → PWA shell → durable scope discovery → signed authorization verification → blob verification → Reader render`

This item must **not** be started during the UI refoundation unless explicitly included in a separately authorized batch.

### Remaining Stage16 order after 016I

1. `STUDENT-016I` — true cold-start offline Reader.
2. `STUDENT-016R` — reconnect revalidation and purge for session/device/entitlement/publication/content revision changes.
3. `STUDENT-016S` — authoritative revision/tombstone/cursor/delta synchronization flow.
4. `STUDENT-016O` — only if later product-authorized offline writes actually require a bounded outbox.
5. `STUDENT-016G` — Stage16 final closure gate and exact-head verification.
6. Stage17 starts only after Stage16 closure.

## Known Stage16 truth that must not regress during design work

The following contracts are implementation/security boundaries, not visual preferences:

- browser is not canonical business authority;
- API + PostgreSQL remain canonical authority;
- `/v1` is never Service Worker Cache API authority;
- protected Reader access remains entitlement/publication controlled;
- offline package authorization is signed and profile/device scoped;
- stored package use requires read-time authorization and integrity verification;
- no password/session token/device private key may become offline browser data;
- Student assessment scoring/finalization remains server-owned;
- `media ready != published`;
- AI output never auto-publishes Student content/questions.

UX/UI refactoring must preserve these contracts.

## Product model to design around

### Student product

The Student experience should be designed around the learning journey rather than around internal modules:

`Activation / Login → Home → Subjects → Curriculum → Lesson / Reader → Practice / Test → Offline learning → Personal learning → Progress`

The interface should minimize decisions, expose the next useful action clearly, and hide infrastructure complexity such as authorization, revisions, protected-media mechanics and synchronization unless a user-facing state truly requires explanation.

Student priorities:

- immediate orientation;
- strong Arabic RTL hierarchy;
- clear subject/lesson progression;
- calm visual density;
- excellent mobile behavior;
- obvious loading, empty, offline, expired-access and error states;
- accessibility;
- consistent learning controls;
- explicit but non-technical offline/download states;
- reduced cognitive load.

### Super Admin product

The Super Admin should be designed as an operational workspace, not as a flat collection of pages/cards.

Core operational chain:

`Curriculum → Content/Ingestion → Media/OCR → AI → Human Review → Question Bank → Quiz Builder → Students/Access → Operations/Audit`

Admin priorities:

- task-oriented information architecture;
- clear global vs contextual navigation;
- role/task grouping instead of exposing implementation modules equally;
- progressive disclosure for advanced operations;
- tables/forms that remain readable at realistic data density;
- strong status semantics;
- predictable actions and confirmation behavior;
- filters/search/bulk workflows only where justified;
- no dashboard clutter for metrics without a decision/action purpose.

## UX/UI refoundation scope

The upcoming maintenance track should first audit before changing code.

Required discovery areas:

1. current Student routes, screens, states and component hierarchy;
2. current Admin routes, workflows, navigation and dashboard composition;
3. existing shared components/design tokens/styles/assets;
4. duplicate/inconsistent components and visual rules;
5. mobile/responsive behavior;
6. RTL and typography behavior;
7. loading/empty/error/offline/permission states;
8. accessibility and keyboard/focus behavior;
9. forms/tables/dialogs/navigation patterns;
10. visual and interaction consistency across both apps.

After audit, each part must be classified as:

- `KEEP`
- `IMPROVE`
- `REFACTOR`
- `REBUILD`
- `REMOVE`

No broad rewrite should be approved solely because the current UI looks weak.

## Required design-system outcome

The remediation track should establish a single product design foundation that can serve both Student and Admin while allowing each surface to have its own density and interaction model.

At minimum it must define:

- color roles and semantic colors;
- typography scale for Arabic/Latin content;
- spacing scale;
- layout/grid rules;
- breakpoints;
- radii/borders/shadows where justified;
- buttons and action hierarchy;
- fields/forms/validation;
- cards only where structurally useful;
- navigation primitives;
- tabs/filters/search patterns;
- tables/data-display patterns;
- modal/drawer/popover rules;
- alerts/toasts/status badges;
- skeleton/loading/empty/error/offline states;
- focus/hover/pressed/disabled states;
- icon rules;
- motion rules with `prefers-reduced-motion` support;
- accessibility rules;
- Student-specific learning/reader patterns;
- Admin-specific dense workspace patterns.

The intended quality order is:

`Function → Clarity → UX → Hierarchy → Consistency → Visual polish`

Avoid unnecessary gradients, glassmorphism, glow, decorative 3D, repetitive cards, generic AI-style layouts and animation without functional purpose.

## Architecture boundary during UI refoundation

Default rule:

- preserve verified backend/API/database behavior;
- preserve existing contracts whenever possible;
- do not change business rules merely to simplify a screen;
- where UI reveals a genuine contract/design flaw, document evidence and fix root cause through a separate reviewed batch;
- do not couple visual tokens to business/domain packages unnecessarily;
- prefer reusable primitives without creating an over-engineered component framework.

## Live/runtime state at pause

Railway inspection stack was live with API/Admin/Student/PostgreSQL successful at the recovery inspection.

Public surfaces were available for controlled inspection, but the Railway environment name `production` must **not** be interpreted as Stage28 Production Cutover completion.

Hosted Admin same-origin login/session persistence was verified after PR #39.

Student live authenticated same-origin end-to-end persistence after PR #39 remains:

`NOT YET VERIFIED`

AI live provider/model/routes/credentials/bootstrap (`AI-012..AI-019`) remains:

`NOT YET VERIFIED`

## Content state at pause

Canonical content source remains:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Known inventory:

- 48 documents;
- 5,552 images.

Bounded Grade 9 English proof:

- 75 source images;
- 75 ready media assets;
- 300 variants;
- 75 lesson assets;
- 10 lessons;
- Draft only.

Do not bulk-materialize the full source inventory during the UX/UI track.

## Parallel items that remain open but are not the current focus

- `CONTENT-PROD-002` controlled review/publication of the bounded Grade 9 English proof.
- `AI-012..AI-019` live AI provider readiness.
- Student authenticated live hosted E2E after PR #39.
- Stage17–29 roadmap.

None of these should be accidentally treated as completed by design work.

## Refoundation completion gate

The normal roadmap may resume only after the UX/UI refoundation has produced and verified:

1. documented product/UX audit for Student and Admin;
2. approved information architecture for both surfaces;
3. shared design-system rules/tokens/primitives;
4. consistent navigation and layout foundations;
5. corrected high-impact Student/Admin flows;
6. responsive behavior on target widths;
7. accessibility baseline for changed components;
8. loading/empty/error/offline/permission states for changed flows;
9. lint/typecheck/tests/build passing for changed applications;
10. no backend/security/business-contract regression;
11. updated `PROJECT_ENGINEERING_LOG.md` and `PROJECT_STATUS.md`;
12. a clear resume marker returning execution to `STUDENT-016I` unless a newly verified dependency changes the order.

## Resume command for a future conversation

When the UX/UI maintenance track is formally closed, resume from:

> Start from live `main`. Read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this pause document, and the current Stage16 handoff. Verify the current main/CI/live state. Do not redo `STUDENT-016H`. Continue with `STUDENT-016I — True cold-start offline Reader`, then 016R, 016S, conditional 016O and the Stage16 closure gate.

## Current state

**NORMAL ROADMAP: PAUSED**

**ACTIVE MANAGEMENT TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**RETURN POINT AFTER COMPLETION: STUDENT-016I**
