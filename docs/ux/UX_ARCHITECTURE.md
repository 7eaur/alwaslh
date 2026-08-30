# UX ARCHITECTURE — الوسيلة الذكية

> Stage 3 source of truth for information architecture, navigation, user flows, screen responsibilities, responsive behavior and required UI states. This stage does not implement production data access or database migrations.

## 1. UX principles

1. **Function before decoration.** Every screen must answer what the user needs to do now.
2. **Arabic-first / RTL-first.** Layout, reading order and actions are designed for Arabic rather than mirrored afterthoughts.
3. **Admin and Student are different products sharing one identity.** Admin is operational/data-dense; Student is calm/touch-first/reading-first.
4. **Progressive disclosure.** Advanced controls appear when needed; they do not compete with primary tasks.
5. **No fake state.** Dashboards never show invented counts/activity/unread badges.
6. **Offline is a first-class Student state.** It is visible, understandable and actionable.
7. **Every async screen has loading, empty, error, stale/offline and success states where relevant.**
8. **Feature parity is mandatory.** Old screens can be reorganized, but no important scenario disappears.

---

# 2. Product shells

## Admin shell

Desktop-first, responsive down to tablet. Persistent right-side navigation in RTL on wide screens; collapsible drawer on smaller screens.

```text
┌────────────────────────────────────────────────────────────────────┐
│ Top bar: page title / context        Search   Tasks   Account       │
├───────────────────────────────────────────────┬────────────────────┤
│                                               │ Brand              │
│                Page content                   │ Overview           │
│                                               │ Content            │
│                                               │ Assessment & AI    │
│                                               │ Students & Access  │
│                                               │ Communication      │
│                                               │ Reports            │
│                                               │ System             │
└───────────────────────────────────────────────┴────────────────────┘
```

Admin navigation is grouped by operational job, not by database table.

## Student shell

Mobile-first PWA. Bottom navigation contains only the highest-frequency destinations.

```text
┌────────────────────────────┐
│ Context header / status    │
│                            │
│       Screen content       │
│                            │
│                            │
├────────────────────────────┤
│ الرئيسية الدروس الاختبارات │
│ الملاحظات المزيد           │
└────────────────────────────┘
```

No permanent six-item navigation row. Secondary destinations live under **المزيد**.

---

# 3. Admin Information Architecture

## 3.1 Overview

### `/admin`
Purpose: operational overview, not decoration.

Shows only server-backed information:
- content requiring review;
- uploads/processing failures;
- AI jobs queued/running/failed;
- code/account anomalies requiring attention;
- recent admin operations if audit data exists;
- quick actions: upload content, create quiz, generate codes, send notification.

Does **not** show placeholder activity or invented “updated moments ago” content.

## 3.2 Content

### Classes & Subjects
Combines the conceptual hierarchy currently spread through class/subject management.

Primary tasks:
- list/search/sort classes;
- create/edit/archive class;
- inspect subjects per class;
- create/edit/reorder/link subject;
- show content counts/status without opening each item.

Desktop pattern: table/list + detail side panel.  
Mobile/tablet pattern: list + full-screen detail sheet.

### Lessons

Primary tasks:
- filter by class/subject/status;
- create lesson;
- edit metadata;
- open reader preview;
- inspect assets/pages;
- publish/unpublish/archive;
- open AI-generated content/review state;
- bulk actions only where behavior is unambiguous.

The old giant `Lessons.tsx` responsibilities are split into:
- lesson index;
- lesson editor;
- asset/page manager;
- upload processing;
- AI review.

### Upload & Processing

Dedicated operational surface rather than embedding the whole pipeline inside Lessons.

Flow:
`select files -> validate -> establish deterministic order -> upload/process -> review page order -> AI optional -> save/publish`

Shows:
- file list in source order;
- page count;
- format/size warnings;
- processing progress;
- failed items with retry;
- cancel action;
- final reconciliation before save.

## 3.3 Assessment & AI

### Quizzes

List screen:
- search/filter class/subject/lesson/status;
- question count/version count;
- create/manual or AI-assisted;
- duplicate/archive/export.

Builder uses a three-level mental model:
`Quiz settings -> Versions -> Questions`

Question editor handles:
- MCQ;
- true/false;
- image/source question;
- correct answer;
- explanation/method;
- difficulty;
- source/page reference;
- regenerate single question.

### AI Operations

A dedicated command center for durable generation jobs.

Tabs/filters:
- queued;
- running;
- needs review;
- failed;
- completed;
- cancelled.

Job row/detail includes:
- task type;
- source lesson/quiz;
- progress units;
- prompt version;
- model;
- provider project alias;
- attempt count;
- latency/timestamps;
- validation errors;
- retry/cancel where valid.

Secrets/API keys are never displayed.

## 3.4 Students & Access

### Students

List:
- account identifier/name if available;
- entitlement summary;
- status;
- last relevant activity when supported;
- filters by class/full access/expiry.

Detail:
- safe profile metadata;
- active/expired/revoked entitlements;
- redemption history;
- assessment summary;
- administrative actions with confirmation and audit reason.

Never reveal original passwords.

### Full Access Codes

Preserve all current workflows:
- generate 6-digit codes;
- search/filter/sort;
- bulk generation;
- import with strict validation;
- export;
- printable cards;
- reset/revoke/delete according to final business rules;
- redemption state/history.

Large datasets use server pagination; no 100k-row client load.

### Class Codes

Preserve:
- generate 7-digit class codes;
- class association;
- expiry;
- used/available status;
- redemption identity/history;
- bulk generation/export;
- renewal/revocation workflows.

## 3.5 Communication

### Notifications

Composer:
- title;
- body;
- audience;
- severity/type;
- optional action/deep link;
- optional expiry/schedule if backend supports it.

History shows delivery/publication state without fabricated read metrics.

## 3.6 Reports

### Reports / Export History

One place for generated documents and exports:
- lesson exports;
- quiz PDFs;
- code cards;
- Excel exports;
- other retained legacy formats.

Each export records source/scope/options/version when backend supports it.

## 3.7 System

### Settings
Product-level settings only.

### Security
Separate security surface for privileged configuration, session/security status and future MFA/reauth controls. Security settings do not live as decorative cards on Overview.

---

# 4. Student Information Architecture

## 4.1 Entry / Activation / Account

### First launch

```text
Launch
 -> check usable local session/replica
 -> if valid: Home
 -> otherwise: activation/login choice
```

### Full-access activation

```text
Enter 6-digit code
 -> validate
 -> claim/create account flow
 -> establish authenticated session
 -> show access summary
 -> authorized initial sync
 -> Home
```

The UI clearly distinguishes **code activation** from **account login**.

### Returning account

Simple identifier/password flow according to the final secure backend contract. Recovery means reset/recovery, never displaying the old password.

### Activate a class

Located under More/Access and contextually surfaced when a locked class action is relevant.

```text
Enter 7-digit class code
 -> verify target class + expiry
 -> confirm
 -> redeem
 -> sync new entitlement
 -> open class
```

## 4.2 Home

Purpose: answer “what should I continue now?”

Priority order:
1. continue last lesson/practice when available;
2. entitled classes/subjects;
3. recent/new content;
4. concise progress summary;
5. meaningful notification/action.

Avoid dashboard card walls. Prefer one primary continue action + compact sections.

## 4.3 Lessons

Navigation model:
`class -> subject -> lesson`

Screen supports:
- class switcher when student has multiple classes;
- subject list;
- lesson list with downloaded/offline state;
- new/update marker when reliable;
- search only if content volume justifies it.

## 4.4 Lesson Reader

Reader is the most important Student surface.

### Header
- back;
- lesson title/context;
- offline/download state;
- concise overflow menu.

### Content
- ordered lesson pages/images;
- text/summary when available;
- page position/progress without obstructing reading.

### Tools
Preserve all old reader scenarios while reducing simultaneous controls:
- zoom/pan for page image;
- font size for textual content;
- text alignment;
- light/dark reader preference;
- previous/next lesson;
- summary;
- practice questions;
- add note;
- save question.

Reader preferences persist locally per account/device.

### Reader navigation
Use a bottom tool bar / contextual sheet rather than many floating controls competing over the page.

## 4.5 Quizzes

Catalog:
- filter by relevant class/subject;
- visible lesson scope;
- version availability where meaningful;
- attempt/progress state.

Before start:
- quiz scope;
- question count;
- whether progress can resume;
- start/resume/restart choice.

During practice:
- one question focus;
- clear selected/answered state;
- explanation only after answer according to practice rule;
- bookmark;
- next/previous where allowed;
- progress count.

Completion:
- derived score;
- correct/incorrect summary;
- retry/review options;
- earned achievement only from trusted result.

## 4.6 Notes / Saved

Primary top-level destination is **الملاحظات** because it is a study tool. Saved questions are available as a tab/segment in the same study-memory area.

Notes preserve:
- text;
- image;
- capture/screenshot;
- audio.

Each item shows lesson/source provenance and works offline according to product contract.

## 4.7 More

Contains lower-frequency destinations:
- notifications;
- statistics/progress;
- achievements/rank;
- access/class activation;
- account;
- offline/storage status;
- install/help.

This keeps the bottom navigation simple without removing features.

---

# 5. Legacy-to-target screen parity map

## Admin

| Legacy surface | Target UX destination | Decision |
|---|---|---|
| Dashboard | Overview | REBUILD UX; real operational data only |
| Classes | Content / Classes & Subjects | REFACTOR |
| Lessons | Content / Lessons + Upload & Processing + AI Review | REFACTOR split |
| Quizzes | Assessment & AI / Quizzes | REFACTOR |
| AccessCodesManagement | Students & Access / Full Access Codes | REFACTOR |
| ClassCodesManagement | Students & Access / Class Codes | REFACTOR |
| AccountsManagement | Students & Access / Students | REFACTOR |
| Notifications | Communication / Notifications | IMPROVE |
| export flows embedded in features | Reports / Export History + contextual export actions | REFACTOR |
| AI generation embedded in Lessons/Quizzes | AI Operations + contextual create actions | REBUILD orchestration / preserve task types |

## Student

| Legacy surface | Target UX destination | Decision |
|---|---|---|
| Dashboard | Home | REBUILD UX |
| Lessons | Lessons hierarchy | IMPROVE |
| LessonDetail | Reader + contextual tools | REFACTOR strongly |
| Quizzes | Quizzes catalog + Practice session | REFACTOR strongly |
| Notes | Notes / Saved study area | IMPROVE |
| Notifications | More / Notifications | IMPROVE |
| Statistics | More / Progress | IMPROVE |
| ActivateNewCode | More / Access + contextual locked-class flow | IMPROVE |
| PWA install prompt | More / Install + contextual prompt | IMPROVE |
| OnlineStatusIndicator | persistent meaningful sync/offline state | REBUILD UX |

No legacy route is removed until its scenarios are mapped and verified in `PRODUCT_FEATURE_PARITY_MATRIX.md`.

---

# 6. Critical user flows

## Admin: publish a lesson from files

```text
Content / Lessons
 -> New lesson
 -> choose class + subject + metadata
 -> Upload files
 -> validation
 -> deterministic page-order preview
 -> process/compress
 -> optional AI extraction/generation job
 -> review content/questions
 -> save draft
 -> preview as Student
 -> publish
```

Failure handling:
- failed file does not silently disappear;
- processing retry is item-specific;
- incomplete required pages block publish or require explicit override with warning;
- browser closing must not terminate server-owned AI job.

## Admin: create quiz with AI

```text
Quizzes
 -> New quiz
 -> select lesson(s)
 -> settings + requested versions/question types/counts
 -> create AI job
 -> progress in AI Operations
 -> validation/review
 -> edit questions/answers/explanations
 -> preview
 -> publish
```

## Admin: issue access codes

```text
Access
 -> choose full/class code type
 -> configure count/expiry/class
 -> generate server-side
 -> review generated batch
 -> export/print
 -> later inspect redemption history
```

## Student: first usable session

```text
Open app
 -> activate/login
 -> entitlement confirmed
 -> initial sync progress with required/optional media distinction
 -> Home
 -> content remains usable offline after successful required sync
```

## Student: study a lesson

```text
Home/Lessons
 -> class
 -> subject
 -> lesson
 -> reader
 -> summary OR note OR practice
 -> continue/next lesson
```

## Student: resume practice

```text
Quiz/Lesson practice
 -> restore exact question/order/answers/current state
 -> continue
 -> complete
 -> trusted attempt result
```

---

# 7. Required UI states

Every data screen must explicitly design relevant states:

### Loading
Use skeletons only for predictable structures. Long operations show actual job/progress state when available.

### Empty
Explain why it is empty and the next useful action. Do not show decorative empty cards with no action.

### Error
Human-readable message + retry when safe. Preserve diagnostic ID internally; do not clear all caches for generic UI errors.

### Offline
Student distinguishes:
- offline but content available;
- offline and requested content not downloaded;
- pending local changes/attempts;
- reconnecting/syncing.

### Stale/update available
Show when local content revision is behind server, without blocking already authorized downloaded content unnecessarily.

### Permission/entitlement
Differentiate:
- not authenticated;
- authenticated but not entitled;
- expired entitlement;
- revoked entitlement;
- admin-only operation.

### Destructive action
Use explicit confirmation component with object name/consequence. Native browser `confirm()` is not the target pattern.

---

# 8. Responsive rules

## Student

- primary target: 360–430px phone widths;
- tablet reader uses wider page canvas but preserves readable line length;
- bottom nav remains thumb reachable;
- landscape must not hide reader navigation;
- no horizontal scrolling for normal UI;
- minimum tap target 44px;
- browser zoom remains enabled.

## Admin

- >= 1280px: persistent navigation + full table density;
- 1024–1279px: narrower navigation, contextual panels may overlay;
- 768–1023px: navigation drawer, tables allow priority-column reduction/scroll only when genuinely tabular;
- phone: supported for urgent/light operations, not used to force complex quiz/content editing into unusable layouts.

---

# 9. Navigation behavior

- Breadcrumbs are used in Admin nested content and Student learning hierarchy where they materially help orientation.
- Back action never relies solely on browser history when the product has a known parent destination.
- Deep links to lesson/quiz/notification actions must resolve through auth/entitlement checks then return to intended destination.
- Bottom-nav destinations preserve their own scroll/filter state within a reasonable session.
- Admin list filters should be URL-addressable where practical for support/shareability.

---

# 10. Accessibility contract

- RTL semantic DOM; do not simulate RTL with CSS-only visual reversal.
- focus order follows reading/task order.
- visible `:focus-visible` from brand tokens.
- form errors are associated with fields and summarized for long forms.
- icon-only buttons require accessible names/tooltips where necessary.
- status uses text/icon + color, never color alone.
- modal/drawer focus is trapped and restored correctly.
- reader image alt/source/page metadata is meaningful where available.
- animations respect reduced motion.
- text remains usable at 200% browser zoom.

---

# 11. What Stage 3 will produce before implementation resumes

1. locked Admin IA and route map;
2. locked Student IA and route map;
3. critical flow definitions;
4. screen responsibility map preventing giant God pages;
5. required UI-state matrix;
6. responsive/navigation/accessibility contracts;
7. low-fidelity wireframe references for Admin and Student;
8. parity review against `PRODUCT_FEATURE_PARITY_MATRIX.md`;
9. `UX_STAGE_DOD.md` pass before Stage 4/next applicable stage.

## Current Stage 3 status

**IN PROGRESS.** IA, primary navigation, legacy-to-target mapping, critical flows and cross-product state contracts are now defined. Low-fidelity wireframe references and final parity/DoD review remain before Stage 3 can close.
