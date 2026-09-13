# STUDENT FUTURE SURFACES SPEC — الوسيلة الذكية

Date: 2026-09-13
Status: ACTIVE DESIGN / PRE-INTEGRATION CONTRACT

## Purpose

The Student application is being structured before all personal-learning services are connected because no production learner will use the app until the remaining roadmap is complete.

This document fixes the product placement, user flows, screen composition and UX states for Stage17–19 capabilities now, while explicitly avoiding invented server data or fake business rules.

The implementation rule is:

**Build the final surface now; connect authoritative data later.**

A pre-integrated surface may render honest empty states and navigation, but it must not fabricate notes, unread counts, scores, progress percentages, achievements, rankings, recommendations or support/security capabilities.

Design order remains:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish.**

---

## 1. Global Student structure

Primary mobile navigation is fixed to four destinations:

1. الرئيسية
2. التعلّم
3. التدريب
4. مكتبتي

Secondary global actions:

- Notifications bell in the App Bar.
- Account/profile action in the App Bar.
- Progress available from Home and Account, and from desktop secondary navigation.

Focused Reader and active Assessment may suppress the global shell.

Legacy `/app/downloads` remains a compatibility route, but the canonical visual home for Downloads is `/app/library/downloads`.

---

## 2. My Library — مكتبتي

Canonical route: `/app/library`

Sections:

- `/app/library/downloads`
- `/app/library/notes`
- `/app/library/saved`
- `/app/library/review`

### Library overview

The overview is not a dashboard of counters. It is an orientation screen that explains the four learner-owned collections and lets the learner enter one quickly.

### Downloads

Existing Stage16 behavior remains authoritative. Library only changes placement/presentation.

Actions:

- save lesson for offline use;
- update saved lesson;
- remove from device;
- later: open saved lesson through the true offline Reader contract.

Do not duplicate download state in Notes or Account.

### Notes — Stage17 integration target

Notes are learner-owned and private under the current product direction.

Entry points:

1. Reader contextual action: `إضافة ملاحظة`.
2. Library → Notes: browse all notes.

Future note editor composition:

- source context strip: subject → lesson → page/source;
- note content area;
- attachment action only for supported note kinds (image/camera/audio) after the contract exists;
- save/cancel actions;
- destructive delete separated from save;
- no exposed UUID/source IDs.

Notes list composition:

- search field only when more than a small list justifies it;
- optional filters by subject/lesson/type when real data exists;
- newest meaningful learner edit first unless Stage17 establishes another canonical ordering;
- each row shows note preview + human source context + edited date;
- opening a note enters detail/edit;
- `العودة إلى المصدر` deep-links to Reader only when source still exists and access is still valid.

Empty state:

`لا توجد ملاحظات بعد` with a clear route back to Learn.

Failure states:

- source removed/unavailable → note remains readable, source link becomes unavailable;
- access revoked → personal note remains governed by Stage17 ownership rules; UI must not silently discard it;
- offline edits/conflicts → Stage17 must define authority before sync UI is implemented.

### Saved / Bookmarks — Stage17 integration target

Guaranteed initial entity: saved/bookmarked questions.

Entry points:

- question context in Practice/Assessment review;
- Reader interactive question context when that feature exists.

Saved row:

- short question preview;
- subject / lesson / page provenance where available;
- saved state action;
- remove from saved;
- open source when source is still authorized.

The UI uses `المحفوظات` instead of claiming generic lesson favorites before the contract supports them.

### Needs Review — Stage17 integration target

`يحتاج مراجعة` is a personal collection/state, not a second Practice catalog.

Entry points:

- result/review question action;
- saved question detail;
- later explicit learner action from Reader questions.

The collection should help the learner return to a question/topic, not calculate weakness rules on the client.

No AI diagnosis or fabricated mastery score belongs here.

---

## 3. Reader integration

Reader remains a focused workspace.

Future compact toolbar order:

- previous / next lesson where canonical lesson order exists;
- search;
- listen;
- zoom/readability tools;
- add/view notes;
- summary when supported;
- interactive questions when supported;
- download state/action;
- overflow menu for low-frequency preferences.

On phones, avoid a permanent row of every tool. Use a compact toolbar plus sheet/menu where needed.

### Add note flow

Reader → Add note → editor opens with source already attached → Save → non-blocking success feedback → Reader remains at the same reading position.

A note action must not navigate the learner away from the lesson unless they explicitly open the full Notes library.

### Saved question flow

Question/Review → Save → immediate tactile/visual confirmation → record appears in Library Saved collection.

Saving is idempotent. Repeated taps must not create duplicates.

---

## 4. Notifications — Stage18 integration target

Canonical route: `/app/notifications`

Global entry: bell icon in App Bar.

Until Stage18 data exists, the feed renders an honest zero-data state and no fake unread badge.

### Feed composition

Each notification must contain only learner-relevant information:

- concise title;
- short explanation if necessary;
- relative/absolute time according to age;
- unread state;
- optional source/action deep link when schema provides a valid target.

Do not show internal event names, provider names, raw types or IDs.

### Unread behavior

- badge appears only from a real unread count/state;
- ordinary notifications do not create persistent global banners;
- important blocking/account states may use a stronger state only if product rules explicitly classify them as actionable.

### Deep links

Allowed only for supported targets, for example:

- lesson;
- quiz/attempt when valid;
- Library item;
- account/access action.

If the target no longer exists, open the feed item safely and explain that the destination is no longer available.

---

## 5. Progress / Statistics / Achievements — Stage19 integration target

Canonical route: `/app/progress`

Entry points:

- Home secondary section;
- Account personal section;
- desktop secondary navigation.

Progress is intentionally not a fifth mobile bottom-navigation item.

### Page hierarchy

1. Page orientation and time/context if needed.
2. Learning progress.
3. Practice/results summary.
4. Recent meaningful activity when supported.
5. Achievements.
6. Ranking only if the approved privacy/trust contract exists.

### Data rules

The page must never infer authoritative metrics in the browser.

Examples of acceptable future metrics only when server-defined:

- completed lessons;
- completed activities;
- attempts;
- correct answers;
- average/score formulas;
- achievements;
- ranking.

No fake percentages, streaks, decorative charts or AI-generated mastery claims.

### Current pre-integration state

The designed page explains where learning, practice and achievements will appear without displaying invented numbers.

---

## 6. Home integration

Home continues to answer: `ماذا أفعل الآن؟`

Primary cards:

- Learn;
- Practice;
- Library.

Secondary personal links:

- Progress;
- Notifications.

Future data may add a concise continue-learning action and a small progress/notification preview, but Home must not become a dashboard of all product data.

---

## 7. Account management

Account is the personal management hub, not a second Home.

Current visible ownership:

- learner identity/display name;
- current access;
- add class code;
- logout;
- personal links to Library, Progress and Notifications;
- Help;
- Support.

Reserved sub-architecture:

- `/app/account/access`
- `/app/account/security`
- `/app/account/preferences`

These subroutes are design-reserved but should not expose fake controls until real contracts are present.

### Security

Potential actions such as password change, recovery/session/device management must use existing/future Auth contracts. Never expose fingerprints, cryptographic keys, device IDs or session tokens.

### Preferences

Reader/app preferences belong here only when persistence semantics exist. Reader-local contextual controls may still appear inside Reader.

---

## 8. Error and instruction rules

Every future surface follows the existing Student error boundary:

1. What happened?
2. What can the learner do now?
3. Never expose implementation detail.

Examples:

- Notes unavailable → `تعذر تحميل ملاحظاتك. أعد المحاولة.`
- Notification target removed → `هذا المحتوى لم يعد متاحًا.`
- Progress unavailable → `تعذر تحديث تقدمك الآن. أعد المحاولة لاحقًا.`
- Saved source access revoked → keep collection state according to Stage17 ownership and explain source availability honestly.

No raw API message is a UI contract.

---

## 9. Loading / empty / offline / denied matrix

Each collection/page must define:

- loading;
- empty;
- ready;
- error;
- offline where meaningful;
- source unavailable;
- access denied/expired where applicable.

Empty states are part of the final product, not temporary development placeholders.

---

## 10. Responsive behavior

### Phone

- four-item bottom navigation;
- Library sections use horizontally scrollable tabs or compact segmented navigation;
- list/detail flows open as full screens;
- note editor uses full available width;
- notification and saved rows remain easy to tap;
- no dense desktop tables.

### Tablet/Desktop

- stable navigation rail;
- Library can evolve to list/detail split view when real Stage17 data warrants it;
- Progress uses a restrained grid without decorative KPI walls;
- Reader preserves readable width.

---

## 11. Motion and interaction

Future surfaces use the shared Student motion contract:

- short surface entry;
- subtle hover/elevation on pointer devices;
- small press response;
- inline feedback after save/remove actions;
- no continuous decorative animation;
- `prefers-reduced-motion` always wins.

---

## 12. Integration gates

### Stage17 must provide/verify

- personal item ownership model;
- note CRUD contract;
- attachment/media rules;
- source provenance schema;
- saved-question identity/idempotency;
- Needs Review semantics;
- offline/sync/conflict rules.

### Stage18 must provide/verify

- notification feed schema;
- unread/last-seen authority;
- notification classification;
- deep-link target schema;
- offline caching policy if any.

### Stage19 must provide/verify

- canonical progress formulas;
- time window semantics;
- achievement rules;
- ranking/privacy rules;
- recent-activity source of truth.

Until those gates are satisfied, the UI may show honest empty architecture but must not fabricate data.
