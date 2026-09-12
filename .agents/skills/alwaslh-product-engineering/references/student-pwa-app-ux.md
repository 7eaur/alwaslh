# Student PWA / App UX

Treat Student as an **installed educational app experience implemented with web/PWA technology**.

## Product goal

A student should understand where they are, what to study next, and how to continue with minimal decisions. Infrastructure concepts such as revisions, leases, authorization signatures, cache layers, or sync internals stay hidden unless they create a user-actionable state.

Primary journey:

`Activation/Login → Home → Subjects → Curriculum → Lesson/Reader → Practice/Test → Offline learning → Progress`

## Mobile app behavior

Design mobile-first and verify real narrow widths before desktop.

- Use touch-first controls; never depend on hover.
- Keep primary actions reachable and visually singular.
- Provide adequate touch targets and separation.
- Respect safe-area insets for installed/mobile contexts.
- Avoid desktop sidebars compressed onto phones.
- Prefer stable bottom or top-level navigation only when it matches the small set of high-frequency destinations.
- Preserve clear back behavior and avoid trapping the user in nested overlays.
- Keep content reading width comfortable even on large screens.
- Avoid excessive card nesting.

## Home

Home should answer:
- What should I continue?
- What subjects/content are available?
- Is anything blocking access or offline use?
- What meaningful progress can I see?

Do not make Home a dashboard of internal system modules or low-value metrics.

## Curriculum and Reader

- Make subject → section → lesson hierarchy obvious.
- Preserve position/continuation where product rules allow.
- Reader controls should prioritize content, navigation, zoom/readability, and next learning action.
- Media states must distinguish loading, unavailable, access denied, expired, and offline-local availability without technical jargon.
- Offline availability should be understandable before disconnecting.

## Assessment

- One clear task at a time.
- Make unanswered/answered/navigation state clear.
- Avoid accidental submission.
- Preserve server-owned scoring/finalization semantics.
- Distinguish practice feedback from test/finalized behavior.
- Resume/restart actions must communicate consequences.

## Offline and connectivity UX

Offline is an explicit learning mode, not an illusion that the entire server exists locally.

Provide clear states for:
- online and current
- downloading
- available offline
- offline but usable
- offline and unavailable
- authorization expired
- local package invalid/tampered
- reconnecting/revalidating
- content removed or no longer entitled

Never bypass authority/integrity checks to keep the UI feeling smooth.

## Installability and app shell

For changed PWA surfaces, verify:
- launch from installed context where tooling permits
- viewport/safe-area behavior
- refresh and cold start
- online → offline transition
- offline shell behavior
- network recovery
- update behavior without disruptive forced reloads

The PWA should feel like an app through coherent navigation and state continuity, not by imitating native chrome unnecessarily.
