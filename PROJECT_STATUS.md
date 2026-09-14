# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-14 — Student Experience V2 merged; STUDENT-016R reconnect revalidation implemented and verified on its pre-doc exact head; PR #59 documentation closure active.**

## Current state

Current baseline on `main`:

`258c5bc2c09a049afb57c0593b5b6ca9db532c62` — merged Student Experience V2 / PR #58.

Active Stage16 branch:

`stage16/student-016r-reconnect-revalidation`

Active PR:

`#59 — feat(student): revalidate offline packages on reconnect` — **DRAFT / NOT MERGED**.

Verified implementation head before documentation synchronization:

`d6cd685006d8cbae27dfd9871af671634404b26d`

## Student Experience V2

V2 is merged and is the accepted Student foundation. Do not redesign/revert it without new evidence.

Verified scope includes:

- App Shell / App Bar / 4-destination Bottom Nav / Desktop Nav;
- Home authoritative overview;
- modular Auth/Activation/Recovery/Help/Support;
- Account / Library / Notifications / Progress surfaces;
- scalable Learn/Subject hierarchy;
- focused Reader;
- modular Practice/Models/Assessment;
- shared icons/brand/UI/cache boundaries;
- Stage16 cold-start Offline Reader reconciliation;
- mobile/RTL/visual fixes and legacy cleanup.

## STUDENT-016R — reconnect revalidation / revocation purge

Implemented behavior:

- detects offline→online browser reconnect;
- restores current server Student session before trusting reconnect state;
- refreshes current profile/device lease;
- re-fetches the current authoritative signed manifest for every stored lesson package;
- re-verifies ES256 authorization and manifest shape;
- rechecks entitlement/publication/current content revision through current Reader/manifest authority;
- reuses stored blobs only after existing exact byte-size + SHA-256 verification runs again against the new signed manifest;
- refreshes valid bounded authorization without duplicate asset download;
- purges stale/revoked/unpublished/unverifiable packages fail-closed;
- preserves centralized session-expiry cleanup for `UNAUTHORIZED`;
- never keeps protected content available merely because bytes remain in IndexedDB.

## Exact-head evidence for 016R

On `d6cd685006d8cbae27dfd9871af671634404b26d`:

- Student lint/typecheck/unit/build — SUCCESS;
- `UX B01 Shared Frontend Foundation` — SUCCESS;
- `UX B02 Student Shell and Navigation` — SUCCESS;
- `UX B03 Student Learning and Reader` — SUCCESS;
- `UX B04 Student Practice and Assessment` — SUCCESS;
- `UX B05 Student Downloads and Account` — SUCCESS;
- `Stage14 Student Product` — SUCCESS;
- `Stage15 Student Assessment` — SUCCESS;
- `Stage16 Student PWA` — SUCCESS.

Stage16 real Chromium now explicitly covers reconnect revocation:

`download → offline → revoke active entitlement in PostgreSQL → reconnect → current server authority denies Reader/manifest → IndexedDB package purge → offline Reader cannot render`.

The Stage16 PostgreSQL lease/download contract job and PWA shell Chromium job also passed on the same exact head.

`STUDENT-016R IMPLEMENTATION = VERIFIED ON d6cd685...`

Documentation commits after this head still receive normal CI before merge.

## Current Stage16 sequence

- `STUDENT-016H` — DONE / VERIFIED.
- `STUDENT-016I` — DONE / VERIFIED / merged through V2; superseded PR #57 closed unmerged.
- `STUDENT-016R` — IMPLEMENTED / VERIFIED / PR #59 CLOSURE ACTIVE.
- `STUDENT-016S` — EXACT NEXT ITEM AFTER PR #59 MERGE.
- `STUDENT-016O` — CONDITIONAL on product-authorized offline writes.
- `STUDENT-016G` — final Stage16 closure gate after 016S + outbox decision.
- Stage17 remains blocked until 016G.

## STUDENT-016S required next

- authoritative content revision writers;
- tombstone semantics;
- bounded cursor/delta API;
- idempotent/retry-safe server behavior;
- client delta application;
- relation to downloaded package revision/publication state;
- integration + reconnect browser evidence;
- no duplicate browser business authority.

## Stable Student data/cache rules

Runtime read-through cache remains profile-scoped:

- curriculum: 2 min;
- quiz catalog: 1 min;
- recent attempts: 30 sec;
- duplicate concurrent reads deduplicated;
- access/assessment changes invalidate affected data.

Stage16 IndexedDB package storage remains the single lesson-download authority.

Notes / Saved / Needs Review remain deferred until Stage17 authoritative ownership/sync contracts exist.

## Content checkpoint retained

Grade 9 English closed technical checkpoints must not be rerun.

Retained reviewed publication totals:

- Lessons: `2`;
- Lesson Assets: `6`;
- Question Revisions: `19`.

Remaining imported content is not implicitly approved for publication.

## Stable system boundaries

- API + PostgreSQL own canonical business state.
- Auth/Authz/device/entitlement/publication authority stays server-owned.
- browser storage is bounded cached state, not hidden backend authority.
- `media ready != published`.
- AI/legacy output never auto-publishes learner content/questions.
- Question Bank publication + immutable Quiz version remain assessment delivery authority.
- `/v1` never becomes Service Worker business-cache authority.
