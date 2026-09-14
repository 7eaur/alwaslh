# STUDENT EXPERIENCE V2 — EXECUTION MASTER PLAN

Date: 2026-09-14
Status: **ACTIVE / APPROVED**
Branch: `ux/student-experience-v2`
PR: `#58`

## 1. Goal

إعادة تأسيس واجهة الطالب كمنتج Mobile/PWA حقيقي: واضح، مريح، سريع، حيّ بدون مبالغة، قابل للتوسع مع كثرة المواد والوحدات والدروس، ويستوعب خصائص الـBackend المستقبلية بدون إعادة بناء الواجهة من الصفر.

الأولوية التنفيذية:

**Clarity → Ease of use → Flow → Eye comfort → Consistency → Performance → Accessibility → Polish**

## 2. Non-negotiable boundaries

- لا تغيير Business Rules في هذه المرحلة إلا عند وجود defect مثبت.
- لا بيانات أو إحصائيات وهمية.
- API + PostgreSQL يبقيان authority للحالة التجارية والصلاحيات.
- الـBrowser cache تحسين أداء فقط وليس authority.
- لا Big Bang rewrite.
- لا دمج إلى `main` قبل الاختبارات + Visual QA + mobile/safe-area verification.
- PR #57 الخاص بـStage16 Offline Reader يبقى workstream منفصلًا؛ أي ملف متداخل معه لا يعاد بناؤه قبل reconciliation واضح.

## 3. Target product structure

```text
Welcome / Activation / Login
        ↓
Student App Shell
├── Home
│   ├── Quick real stats
│   ├── Library stats when real
│   ├── Subjects preview
│   ├── Models/quiz shortcut when real
│   └── Last real attempt
├── Learn
│   ├── Class context/selector when needed
│   ├── Subjects
│   ├── Subject
│   │   ├── Sections / Units
│   │   └── Lessons
│   └── Focused Reader
├── Practice
│   ├── Practice
│   ├── Models / Versions
│   ├── Attempts
│   └── Results / Review
├── Library
│   ├── Downloads
│   ├── Notes
│   ├── Saved
│   └── Needs Review
├── Notifications
├── Progress
└── Account / Help / Support
```

Primary bottom navigation on phone remains exactly:

`الرئيسية — التعلم — التدريب — مكتبتي`

## 4. Phase plan

### V2-00 — Architecture freeze — DONE

Deliverables:

- `STUDENT_EXPERIENCE_V2.md`
- `STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`
- `STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`
- this execution plan
- implementation rules document

Gate: architecture documented before broad UI migration.

### V2-01 — Foundation / Shell / Home — IN PROGRESS

Scope:

- Student visual tokens.
- Cairo-first typography contract.
- unified icon registry.
- App Bar contract.
- Bottom Navigation + safe area.
- shared runtime read cache.
- Home as overview instead of duplicate menu.
- no repeated destination cards.

Home uses real data only:

- subject count;
- lesson count;
- available quiz/practice count;
- local download count;
- limited subject preview;
- last attempt if available.

Gate:

- no bottom-nav overlap;
- no needless duplicate network reads across Home/Learn transitions;
- RTL + mobile layout verified;
- no fake stats.

### V2-02 — Shared code extraction + Welcome/Auth

Scope:

- extract `app/layout` components from flat files;
- shared UI primitives used by 2+ features;
- rebuild Welcome as minimal app entry, not marketing page;
- compact Activation/Login surfaces;
- remove unnecessary top whitespace and repeated explanatory copy;
- keep security/auth flows unchanged.

Gate:

- auth behavior unchanged;
- keyboard/mobile form usability verified;
- no duplicated brand/header/form primitives.

### V2-03 — Learn / Subject / Curriculum scale

**Start only after PR #57 reconciliation for overlapping files.**

Scope:

- Learn app-bar title.
- one class = context only; multiple classes = compact selector.
- subject list scales to many subjects.
- search appears only when dataset size warrants it.
- Subject → Units → Lessons.
- accordion/progressive disclosure for many units.
- unsectioned lessons render directly.
- lesson rows compact; real summary/question capability badges only.

Gate:

- works with 1 subject and many subjects;
- works with few and many units/lessons;
- no card wall;
- no large editorial headings.

### V2-04 — Focused Reader

Scope:

- focused app bar;
- no global bottom nav;
- content-first layout;
- slots for Lesson / Summary / Lesson Questions only when backed by real data;
- tools: search, listen, download, note, more;
- previous/next using canonical order only;
- preserve Stage16 offline authorization/integrity rules.

Gate:

- reader remains usable online/offline according to Stage16 contracts;
- no heavy always-mounted tool panels;
- media lazy loaded.

### V2-05 — Practice / Models / Assessment

Scope:

- simplify catalog hierarchy;
- separate Practice and Models/Versions in IA without duplicating data;
- filters only when data size requires them;
- recent attempts;
- focused question attempt mode;
- result/review hierarchy;
- preserve immutable quiz/version backend semantics.

Gate:

- student can reach models directly without adding a fifth bottom tab;
- recent attempts reuse cached read models;
- completion invalidates only relevant Home/attempt cache.

### V2-06 — Library / Account / Secondary surfaces

Scope:

- Library summary removed from Library body; Home owns summary stats.
- Library becomes direct destinations.
- Account reordered around access/content, help/support, logout last.
- Notifications/Progress use shared empty/loading/error patterns.
- Help becomes concise grouped/expandable content rather than long article.

Gate:

- no duplicate navigation inside child pages;
- no oversized logout action;
- no fake future data.

### V2-07 — Local-first personal data

Start when Stage17 ownership/conflict rules are explicit.

Scope:

- account-scoped IndexedDB adapters/repositories for Notes, Saved, Needs Review;
- stable IDs + source provenance;
- Blob attachments only where supported;
- lifecycle/logout/account-switch rules;
- explicit future sync contract if approved.

Gate:

- profile isolation proven;
- no cross-account leakage;
- no copied display text used as identity.

### V2-08 — Durable read-model caching

Deferred until authoritative revision/tombstone/delta semantics exist.

Scope:

- safe persistent curriculum/practice snapshots only after versioning contract is closed;
- reconnect revalidation;
- stale content cannot grant authorization.

### V2-09 — Final quality gate

Must include:

- lint;
- typecheck;
- unit/integration tests;
- build;
- route smoke tests;
- iPhone Safari safe areas;
- Android Chrome;
- small + large phone;
- tablet/desktop sanity;
- RTL;
- keyboard/focus;
- reduced motion;
- contrast/readability;
- repeated-navigation network check;
- performance profile for Home/Learn/Reader/Practice.

## 5. Design rules

- Home alone shows official logo + `الوسيلة الذكية` in the app bar.
- Primary pages show page title in App Bar; no repeated giant H1 below.
- Nested pages use back + entity title.
- Teal is accent/action/selected state, not every border/title.
- primary text is charcoal; secondary text neutral gray.
- large headings are exceptional, not default.
- use list rows for dense content; cards only for meaningful grouped surfaces.
- no gradients/glows/glass/3D for functional app chrome.
- motion is functional and short; respects reduced motion.
- all touch targets >= 44px.

## 6. Data/performance rules

Initial memory TTLs:

- curriculum: 2 minutes;
- quiz catalog: 1 minute;
- recent attempts: 30 seconds.

Rules:

- request deduplication;
- cache is profile-scoped;
- failed requests do not become successful cache values;
- access change invalidates curriculum/practice;
- quiz completion invalidates recent attempts/home summary;
- logout/session expiry clears active profile cache;
- derive counts from loaded models, do not refetch for counters;
- first meaningful load may show skeleton; cached navigation should not flash loading skeletons;
- media/images are lazy;
- do not keep duplicate large arrays in multiple stores.

## 7. Local data direction

Durable on-device personal data when contracts are ready:

- Notes;
- Saved/bookmarked items;
- Needs Review;
- reader/UI preferences.

Existing Stage16 offline lesson packages remain the only lesson-download storage path. Do not duplicate binaries.

Forbidden ordinary persistence:

- plaintext password;
- reusable auth/session secrets;
- raw auth challenges;
- fake entitlement/progress authority;
- `/v1` API responses as Service Worker business cache.

## 8. Definition of Done for every batch

A batch is not `DONE` because it looks good.

It must have:

1. documented scope;
2. clean ownership/no duplicated shared components;
3. lint/typecheck/build green;
4. relevant automated tests green;
5. mobile browser verification;
6. visual QA against V2 rules;
7. no regression in auth/access/offline semantics;
8. docs/status updated;
9. no known P0/P1 issue hidden as cosmetic debt.

## 9. Current exact next action

Continue `V2-01` then extract shared layout/primitives before expanding feature work.

Do **not** rebuild `student-learning.tsx` / `student-reader.tsx` until PR #57 overlap is reconciled.
