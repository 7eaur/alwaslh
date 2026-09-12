# STUDENT PRODUCT ARCHITECTURE — الوسيلة الذكية

Date: 2026-09-13
Status: ACTIVE PRODUCT ARCHITECTURE FOR STUDENT UX/UI

## 1. Purpose

This document defines the future-complete Student product structure so current UX/UI refoundation does not optimize only for the features already implemented today.

The current UI is evidence for behavior and contracts, not a visual preservation target. The architecture must accommodate verified legacy/product capabilities without exposing unfinished destinations prematurely.

### Binding design priority

Every Student screen must be judged in this order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish.**

The interface must feel calm, obvious and comfortable for sustained study. A visually attractive screen that is harder to understand or use is a design failure.

Acceptance rules:

- the learner should understand the screen purpose and next action within seconds;
- hierarchy must be clear without relying on excessive bold text, borders, cards or decoration;
- spacing, line length, contrast and typography must support long reading sessions without visual fatigue;
- navigation and actions must feel predictable between screens;
- primary actions are obvious, secondary actions are quieter, destructive actions are clearly separated;
- mobile touch targets and one-handed use are first-class requirements;
- RTL composition must feel native rather than mirrored mechanically;
- visual density must match the task: calm for learning/reading, focused for assessment, compact but clear for personal libraries;
- avoid card walls, duplicated headings, persistent status chrome, decorative metrics, excessive shadows, gradients, glow and animation;
- remove anything that does not help orientation, learning, decision-making or a real action;
- loading, empty, error, offline, denied, success and recovery states must preserve the same calm visual system;
- no screen is accepted only because it is functional; final acceptance is **Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**.

Source-of-truth precedence remains:

1. current Product Owner direction;
2. live code, PostgreSQL contracts, executable tests/CI and verified runtime;
3. security/offline/assessment/publication authority contracts;
4. PRODUCT_FEATURE_PARITY_MATRIX.md, MASTER_REBUILD_ROADMAP.md and docs/prd.md;
5. this document for Student information placement and UX composition.

## 2. Product inventory relevant to Student architecture

### Implemented / active today

- Activation / returning login / recovery / device binding.
- Home shell.
- Learn → Subject → Lesson hierarchy.
- Protected Reader with image-page display, search and text-to-speech.
- Practice → Quiz → Attempt → Result.
- Downloads/offline package management foundation.
- Account access/entitlement/class-code operations.

### Planned and contractually preserved

The following capabilities are not optional decoration; they exist in the product parity/roadmap and therefore must have an intentional place in the final Student IA:

- local personal notes;
- text/image/camera/audio notes;
- notes linked to lesson/source context;
- saved/bookmarked questions;
- Favorites / Needs Review personal-learning collections where Stage17 formalizes them;
- learning statistics;
- achievements;
- recent practice/history detail;
- notifications feed, unread state and future deep links;
- Reader summary;
- Reader interactive questions;
- Reader notes access;
- Reader zoom/pan;
- Reader previous/next lesson;
- Reader font-size/readability preferences;
- Reader theme/read mode where supported;
- offline Reader after Stage16 closure;
- account/security/recovery/preferences capabilities when backed by real contracts.

Do not render a destination until its implementation exists. The IA is future-complete; the visible product remains capability-aware.

## 3. Final global Student navigation

The Student app should keep four primary destinations on narrow screens:

1. **الرئيسية** — `/app/home`
2. **التعلّم** — `/app/learn`
3. **التدريب** — `/app/practice`
4. **مكتبتي** — `/app/library`

Secondary global actions:

- **الإشعارات** — notification bell in app bar when Stage18 is implemented;
- **الحساب** — profile/account action in app bar, not a fifth bottom-nav item;
- contextual connection/offline state only when it requires attention.

Why `مكتبتي` instead of a permanent top-level `Downloads` destination:

- Downloads are one type of learner-owned content, not the whole personal-learning area.
- Stage17 adds Notes, Favorites/Saved Questions and Needs Review.
- A single Library destination prevents bottom-navigation growth and keeps personal resources together.
- Existing `/app/downloads` must remain compatible while migration happens; it may later redirect to `/app/library/downloads` after executable parity exists.

No fake `Library`, `Notifications`, `Progress` or other routes may be exposed before their underlying capabilities exist.

## 4. Route architecture

Future-complete route tree:

```text
/app
├── home
├── learn
│   ├── subjects/:subjectId
│   └── lessons/:lessonId
├── practice
│   ├── quizzes/:quizId
│   └── attempts/:sessionId
├── library
│   ├── downloads
│   ├── notes
│   │   └── :noteId
│   └── saved
├── progress
├── notifications
└── account
    ├── access
    ├── security
    └── preferences
```

Route rules:

- only implemented children are visible in navigation;
- unsupported account subroutes are not placeholders;
- existing `/app/downloads` remains supported until Stage17/IA migration has executable verification;
- URLs never grant authority; backend authorization remains canonical.

## 5. Home

Home answers: **what should I do now?**

Preferred composition when data contracts exist:

1. compact greeting/context;
2. primary continue/recent-learning action;
3. current subjects or next useful learning destination;
4. relevant Practice shortcut;
5. concise progress summary after Stage19;
6. latest meaningful notification preview after Stage18;
7. offline/download attention only when action is required.

Do not put account forms, full curriculum, full quiz catalog, full notes, decorative KPIs, fake streaks or unsupported recommendations on Home.

## 6. Learn and browsing

`Learn` owns discovery and curriculum browsing:

- class context only when needed;
- subjects;
- sections;
- ordered lessons;
- stable lesson thumbnails when media supports them;
- saved/offline indicators where available;
- clear empty/access states.

Browsing should remain hierarchical and calm. Search may be added only if the real catalog size justifies it.

## 7. Reader

Reader is the core learning workspace and should be designed as a focused app surface, not a generic document page.

### Primary content

- lesson title/context;
- lesson pages/media;
- controlled reading width;
- previous/next lesson where stable ordering exists;
- page position/context.

### Reader tools

Reader actions should be contextual, compact and progressively disclosed:

- zoom/pan;
- search inside lesson;
- listen/read aloud;
- summary;
- interactive questions;
- add/view notes;
- save question when in question context;
- offline/download state;
- font/readability preferences;
- theme/read mode if supported.

Do not make every tool a permanent large tab/bar on small phones. Prefer a small contextual toolbar + bottom sheet/drawer/menu where appropriate.

### Notes inside Reader

Notes have two entry points but one data model:

- create/view a note in lesson context from Reader;
- browse/search all notes from Library.

Notes remain local/private according to the current product rule unless a future explicit business decision changes ownership.

## 8. Practice

Practice remains:

`Library of activities → Quiz detail/choice → Focused attempt → Result/review`.

Saved/bookmarked question action belongs inside question/result context and writes to the Stage17 personal-learning repository. It must retain stable lesson/page/question provenance.

`Needs Review` should be treated as a personal collection/state in Library, not a second Practice catalog.

## 9. My Library — مكتبتي

Library is the final home for learner-owned/offline resources.

### Downloads

- downloaded lessons;
- update/remove;
- storage status in human language;
- open offline lesson after Stage16 makes that contract real.

### Notes

- all local notes;
- text/image/audio/camera types;
- search;
- filter/group by lesson;
- create/edit/delete;
- direct link back to source lesson when source still exists.

### Saved / Favorites

Initial guaranteed capability is saved/bookmarked questions.

- human question preview;
- subject/lesson/page provenance;
- search/filter;
- remove from saved;
- open source question/lesson where contract permits.

Do not claim generic lesson favorites until Stage17 contract explicitly supports them. The UI name `المحفوظات` is safer than pretending every entity type is already favorite-able.

## 10. Notifications

Notifications are a secondary global system, not a primary bottom-nav destination.

Final pattern:

- bell in app bar;
- unread badge based on real unread/last-seen state;
- `/app/notifications` full feed;
- importance/time hierarchy;
- cached offline feed where Stage18 implements it;
- deep links only when real target/action schema exists;
- no persistent intrusive banner for ordinary notifications.

## 11. Progress / Statistics / Achievements

Stage19 should own `/app/progress`.

It may surface from Home and Account but should not automatically become a fifth global navigation destination.

Composition should include only trusted metrics with clear meaning:

- completed lessons/practice;
- answered/correct interactive questions;
- average score/completion metrics according to canonical formulas;
- recent practice;
- achievements when server rules exist;
- ranking only under the approved privacy/trust contract.

No decorative charts or invented streaks.

## 12. Account

Account should be a clean management surface, not a duplicate dashboard.

### Visible now when implemented

- current access/activated classes;
- add class code;
- logout;
- recovery guidance/status where actual action exists.

### Future sections only when real contracts exist

- Security: password change/recovery/session/device operations;
- Preferences: Reader/app preferences that genuinely persist;
- Support/help if product contract requires it.

Avoid low-level device keys, cryptography, storage, fingerprints, UUIDs and session internals.

## 13. Shell redesign rules

The final Student shell must remove accumulated chrome from earlier batches.

### Mobile

- one compact App Bar;
- page title only where necessary, no repeated title stack;
- optional notification bell;
- account/profile action;
- four-item bottom nav;
- connection state appears only when offline/degraded/actionable;
- Reader and active Assessment use focused shells and may suppress global nav.

### Tablet/Desktop

- one coherent rail/top-shell, never logo/header duplicated in multiple layers;
- same semantic destinations as mobile;
- Library/Notes/Progress may use split/list-detail layouts when useful;
- Reader preserves readable width.

## 14. Accumulation cleanup requirements

Before Student UX is called visually closed:

- remove stage-named production styles such as `stage14.css` where responsibilities have migrated;
- consolidate `assessment.css` / `assessment-polish.css` or other layered override chains into owned feature styles;
- remove selectors whose only purpose is hiding earlier composition mistakes;
- keep one shell owner and one route owner per responsibility;
- no duplicated account/access/download state;
- route-level code splitting should be evaluated for the current monolithic Student bundle;
- remove dead legacy components/classes only after E2E parity proves no behavior loss;
- shared state/empty/error/status primitives should be reused only where semantics truly match.

## 15. Execution dependency

This architecture does **not** authorize premature implementation of roadmap stages.

Required dependency order remains:

1. close current UX-B05 and Student visual/architecture cleanup that does not change deferred business contracts;
2. synchronize with Super Admin rebuild for shared design foundations;
3. close shared cross-product responsive/RTL/accessibility/visual regression work;
4. return to Stage16 at `STUDENT-016I` and close offline authority/Reader;
5. Stage17 implements Personal Learning Data (Notes/Favorites/Needs Review);
6. Stage18 implements Notifications;
7. Stage19 implements Progress/Statistics/Achievements.

When Stage17–19 begin, their screens must follow this placement instead of inventing new top-level navigation ad hoc.

## 16. Current verification labels

- Notes/favorites/saved-question final implementation: **NOT YET VERIFIED — Stage17 required**.
- Notification final implementation: **NOT YET VERIFIED — Stage18 required**.
- Progress/statistics/achievements final implementation: **NOT YET VERIFIED — Stage19 required**.
- True cold-start offline Reader: **NOT YET VERIFIED — Stage16 closure required**.
- Student account self-service password/security settings beyond currently verified recovery/device contracts: **NOT YET VERIFIED**.

The architecture reserves correct locations for these capabilities without presenting them as completed product features.