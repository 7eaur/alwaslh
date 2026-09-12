# Student PWA / App UX

Treat Student as an **installed educational app experience implemented with web/PWA technology**.

## Product goal

A student should understand where they are, what to study next, and how to continue with minimal decisions. Infrastructure concepts such as revisions, leases, authorization signatures, cache layers, or sync internals stay hidden unless they create a user-actionable state.

Primary journey:

`Activation/Login → Home → Subjects → Curriculum → Lesson/Reader → Practice/Test → Offline learning → Progress`

## App information architecture

Do not build Student as one long responsive webpage.

Use a clear app hierarchy:

- top-level destinations are few and stable;
- subjects are a deliberate destination, not mixed with unrelated account/system data;
- curriculum is drilled into from the selected subject;
- Reader is a focused lesson experience;
- Practice/Test is a separate focused task surface;
- offline/download management appears only where the student can understand and act on it;
- profile/settings/access details stay outside the learning flow unless needed.

Each screen should have one obvious purpose. Split unrelated tasks into routes/screens instead of stacking sections endlessly.

Use tabs only for closely related subviews of the same task/object. Do not use tabs to hide an entire product sitemap inside one page.

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

Home is an overview/continue surface, not a place to dump curriculum, downloads, progress, access details, account controls, and every feature into one scrolling page.

## Curriculum and Reader

- Make subject → section → lesson hierarchy obvious.
- Preserve position/continuation where product rules allow.
- Reader controls should prioritize content, navigation, zoom/readability, and next learning action.
- Media states must distinguish loading, unavailable, access denied, expired, and offline-local availability without technical jargon.
- Offline availability should be understandable before disconnecting.
- Keep Reader visually focused; account/system/technical controls do not compete with lesson content.

## Assessment

- One clear task at a time.
- Make unanswered/answered/navigation state clear.
- Avoid accidental submission.
- Preserve server-owned scoring/finalization semantics.
- Distinguish practice feedback from test/finalized behavior.
- Resume/restart actions must communicate consequences.

## Student-facing copy

All visible text must be production-ready Arabic written for the student.

Do not show:
- API/database terminology;
- cryptographic/signature terminology;
- cache/IndexedDB/Service Worker details;
- sync/revision identifiers;
- raw errors or internal codes;
- developer notes or background-process explanations.

Translate internal states into plain meaning and next action. Examples:

- `متاح بدون إنترنت`
- `تعذر الاتصال. تحقق من الإنترنت وحاول مجددًا.`
- `يحتاج هذا الدرس إلى الاتصال بالإنترنت قبل فتحه.`
- `انتهت صلاحية الوصول. اتصل بالإنترنت للتحقق من حسابك.`

Only use messages that map to real supported behavior.

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
