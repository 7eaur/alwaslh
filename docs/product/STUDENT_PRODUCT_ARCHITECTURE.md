# STUDENT PRODUCT ARCHITECTURE — الوسيلة الذكية

Date: 2026-09-13
Status: ACTIVE PRODUCT ARCHITECTURE FOR STUDENT UX/UI

## 1. Purpose

This document defines the future-complete Student product structure so the application is not repeatedly restructured as later roadmap capabilities arrive.

The Product Owner has explicitly confirmed that no production learner will use the Student app before the remaining product roadmap is complete. Therefore **final UI surfaces and navigation for verified future product capabilities may be built before their backend integration**, provided they do not fabricate data, authority or business behavior.

Binding implementation principle:

**Build the final surface now; connect authoritative data later.**

`docs/product/STUDENT_FUTURE_SURFACES_SPEC.md` is the detailed pre-integration specification for Library/Notes/Saved/Needs Review, Notifications, Progress and Account integration.

### Binding design priority

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish.**

Acceptance is:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional.**

The learner should understand screen purpose and next action within seconds. Avoid excessive bold text, cards, borders, persistent status chrome, decorative metrics, heavy shadows, gradients, glow or motion. RTL, touch targets, loading/empty/error/offline/denied/success states and sustained reading comfort are first-class requirements.

Source-of-truth precedence remains:

1. current Product Owner direction;
2. live code, PostgreSQL contracts, executable tests/CI and verified runtime;
3. security/offline/assessment/publication authority contracts;
4. roadmap/parity/PRD;
5. this architecture for Student placement/composition.

## 2. Pre-integration rule

A Student surface may now exist before its service contract is connected when all of the following are true:

- the capability belongs to the approved product roadmap/parity;
- its final information-architecture location is known;
- the screen can render an honest zero-data/empty state;
- no fake values, counts, records or business outcomes are shown;
- actions requiring missing backend authority remain absent or inert only where clearly non-actionable; no fake save/sync behavior;
- the UI does not claim the roadmap stage itself is complete.

Forbidden fabricated content includes:

- fake notes;
- fake unread notification counts;
- fake progress percentages;
- fake scores/statistics;
- fake achievements/rankings/streaks;
- invented recommendations;
- invented security/account controls.

Backend implementation and product-surface implementation are therefore tracked separately.

## 3. Final global Student navigation

Primary mobile navigation is fixed to four destinations:

1. **الرئيسية** — `/app/home`
2. **التعلّم** — `/app/learn`
3. **التدريب** — `/app/practice`
4. **مكتبتي** — `/app/library`

Secondary global actions:

- **الإشعارات** — app-bar bell → `/app/notifications`;
- **الحساب** — app-bar profile/account action → `/app/account`;
- **تقدمي** — Home/Account and desktop secondary navigation → `/app/progress`;
- connection state appears only when degraded/actionable.

Focused Reader and active Assessment may suppress global navigation.

`/app/downloads` remains a compatibility route while the canonical visual home for downloads is `/app/library/downloads`.

## 4. Route architecture

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
│   │   └── :noteId          # when Stage17 CRUD exists
│   ├── saved
│   └── review
├── notifications
├── progress
└── account
    ├── access               # reserved until useful as a distinct route
    ├── security             # only when real contract exists
    └── preferences          # only when persistence contract exists
```

URLs never grant authority. API/PostgreSQL remain canonical.

## 5. Home

Home answers: **ماذا أفعل الآن؟**

Primary choices:

- Learn;
- Practice;
- Library.

Secondary personal destinations:

- Progress;
- Notifications.

Future real data may add a concise continue-learning action or small meaningful preview, but Home must not become a dashboard containing the whole product.

## 6. Learn / Reader

Learn owns curriculum browsing: class context, subjects, sections and ordered lessons.

Reader is the focused learning workspace. Its future tool architecture includes, as contracts become available:

- previous/next lesson;
- search;
- listen/read aloud;
- zoom/readability;
- add/view notes;
- summary;
- interactive questions;
- save question;
- download/offline state;
- reading preferences.

Phone Reader should use a compact toolbar/progressive disclosure rather than permanently displaying every tool.

Notes opened from Reader and Notes browsed in Library use one Stage17 data model and retain source provenance.

## 7. Practice / Assessment

Practice remains:

`Catalog → Quiz choice → Focused attempt → Result/review`.

Future saved/Needs Review actions live in question/result context and write to Stage17 personal-learning data. Client UI does not invent weakness/mastery authority.

## 8. My Library — مكتبتي

Library is the home of learner-owned resources:

### Downloads

Existing Stage16 storage/signing/checksum/device/session authority remains unchanged. Library changes placement only.

### Notes

Prebuilt surface exists now with honest empty state. Stage17 later connects:

- create/edit/delete;
- source provenance;
- text/image/camera/audio kinds where contract supports them;
- source navigation;
- offline/sync/conflict rules.

### Saved / Bookmarks

Initial guaranteed future entity is saved/bookmarked questions. Use **المحفوظات** rather than claiming generic lesson favorites before contracts support them.

### Needs Review

A learner-owned review collection/state, not a duplicate Practice catalog and not a client-computed diagnosis.

## 9. Notifications

Notifications are secondary global UI, not a bottom-nav item.

The bell and `/app/notifications` surface may exist before Stage18 data connection with a truthful zero-data state and **no fake badge**.

Stage18 later supplies authoritative:

- feed schema;
- unread/last-seen state;
- classification/importance;
- supported deep-link target schema;
- any offline caching policy.

No raw event/provider/type/ID language is shown to the learner.

## 10. Progress / Statistics / Achievements

`/app/progress` may exist before Stage19 data connection with an honest pre-integration state and no invented metrics.

When Stage19 contracts arrive, only server-defined trusted metrics may be shown, such as completed learning, attempts, correct answers, canonical averages, achievements and approved ranking/privacy behavior.

No decorative charts, fake streaks or browser-calculated mastery claims.

## 11. Account

Account is the personal management hub, not another Home.

Current/approved placement:

- learner identity/display name;
- current access;
- add class code;
- Library link;
- Progress link;
- Notifications link;
- Help;
- Support;
- logout.

Security/password/device/session management and persistent preferences appear only when backed by real contracts. Never expose device keys, cryptography, fingerprints, UUIDs or tokens.

## 12. Shell and responsive rules

### Mobile

- one compact App Bar;
- notification/account actions;
- four-item bottom navigation;
- offline state only when actionable;
- no desktop-table patterns;
- focused Reader/Assessment may suppress shell navigation.

### Tablet/Desktop

- one coherent rail/top-shell;
- same semantic primary destinations as mobile;
- Progress and Account may live in secondary rail section;
- Library may later use list/detail layouts when real data warrants it;
- Reader keeps readable line/viewport width.

## 13. Motion / interaction

Motion is functional affordance, not decoration:

- short surface entry;
- subtle hover/elevation where pointer exists;
- press feedback;
- clear save/remove feedback;
- no continuous decorative animation;
- `prefers-reduced-motion` wins.

## 14. Performance architecture

The Student application must not grow as one monolithic initial JavaScript bundle.

Destination-level features are loaded lazily:

- Learn/Reader;
- Practice/Assessment;
- Library and personal surfaces;
- Account.

Shell/Home remains immediately available. Dynamic imports are preferred before manual chunk configuration. Loading fallback copy is learner-facing (`جاري فتح الصفحة`) and must remain calm/accessibility-safe.

Bundle size is verified from production build output after structural changes.

## 15. Accumulation rules

- one shell owner;
- one route/destination owner per responsibility;
- no duplicated access/download state;
- avoid stage-named production CSS;
- remove historical override chains after executable parity;
- reuse state primitives only where semantics match;
- do not preserve legacy UI solely because tests once targeted its text/DOM.

## 16. Roadmap / integration distinction

Prebuilding these surfaces **does not complete Stage17–19 backend work**.

Backend roadmap remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

At Stage17–19, implementation should connect authoritative contracts into the already-built surfaces rather than invent new top-level navigation.

Current labels:

- Notes/Saved/Needs Review UI architecture: **PREBUILT / DATA CONTRACT NOT YET CONNECTED**.
- Notifications UI architecture: **PREBUILT / STAGE18 DATA NOT YET CONNECTED**.
- Progress/Statistics/Achievements UI architecture: **PREBUILT / STAGE19 DATA NOT YET CONNECTED**.
- true cold-start offline Reader: **NOT YET VERIFIED — Stage16 closure required**.
- self-service account security/preferences beyond verified current contracts: **NOT YET VERIFIED**.
