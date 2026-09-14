# STUDENT EXPERIENCE V2 — الوسيلة الذكية

Date: 2026-09-14
Status: **APPROVED PRODUCT / UX / UI ARCHITECTURE**
Branch: `ux/student-experience-v2`

## 1. Purpose

هذه الوثيقة تثبت المعمارية الجديدة لتجربة الطالب قبل اكتمال كل عقود الـBackend المستقبلية.

الهدف ليس إعادة اختراع Business Rules، بل بناء أساس واجهة نهائي ومرن بحيث يمكن ربط الملخصات، أسئلة الدروس، النماذج، الملاحظات، المحفوظات، المراجعة، الإشعارات والإحصائيات لاحقًا بدون إعادة تصميم التطبيق من الصفر.

الأولوية الملزمة:

**Clarity → Ease of use → Flow → Eye comfort → Consistency → Performance → Polish**

## 2. Core product rule

الطالب يرى ما يحتاجه الآن، لا شرحًا لما يستطيع النظام فعله.

- لا تكرار لنفس Navigation أو Action في الشاشة بدون سبب وظيفي.
- لا Card لكل عنصر.
- لا عناوين ضخمة أو Intro paragraphs متكررة.
- لا بيانات أو إحصائيات وهمية.
- لا عرض Capability قبل وجود مصدر بيانات حقيقي أو Empty State صريح.
- كل شاشة يجب أن تكون مفهومة خلال ثوانٍ.

## 3. Global Student structure

Primary phone navigation remains exactly four destinations:

1. `الرئيسية` — `/app/home`
2. `التعلم` — `/app/learn`
3. `التدريب` — `/app/practice`
4. `مكتبتي` — `/app/library`

Secondary global actions:

- Notifications from App Bar.
- Account from App Bar.
- Progress from Home/Account when authoritative data exists.

Focused Reader and active Assessment suppress the global bottom navigation.

## 4. App Bar contract

### Home

Home alone shows the brand lockup:

- official الوسيلة الذكية mark;
- text `الوسيلة الذكية`;
- notifications;
- account.

### Primary pages

`التعلم`, `التدريب`, `مكتبتي`, `حسابي`, `الإشعارات`, `تقدمي` show their page title in the App Bar instead of repeating the logo and a second large page heading.

### Nested pages

Nested routes show:

- back affordance;
- current page/entity title;
- optional low-frequency overflow action.

No duplicate breadcrumb + giant heading + repeated eyebrow chain on mobile.

## 5. Bottom Navigation contract

- fixed phone navigation;
- safe-area aware;
- 4 destinations only;
- icon + persistent label;
- subtle selected surface/indicator;
- >=44px touch target;
- press feedback;
- no glow, glass, floating dock gimmicks or continuous animation.

Motion is functional: 120–220ms for press/state/screen transitions, with `prefers-reduced-motion` respected.

## 6. Visual system

### Typography

Primary direction: **Cairo** with self-hosted delivery before release. Until local font assets are integrated, the stack must fall back safely without changing layout semantics.

Approved working scale:

- App Bar: 18–20px;
- major screen title when required: 24–28px;
- section title: 18–20px;
- row/card title: 16–17px;
- body: 15–16px;
- secondary: 13–14px;
- caption: 12–13px.

Weights: 400 / 500 / 600 / 700 only.

### Color roles

Use the approved brand palette but with neutral-first composition:

- Canvas: soft off-white;
- Surface: white;
- Primary text: charcoal;
- Secondary text: neutral gray;
- Brand accent: teal;
- Strong actionable teal: dark teal;
- Selected background: mint;
- Borders: neutral subtle;
- danger/warning/success/info are semantic and not replaced by brand teal.

Teal is an orientation/accent color, not a universal border/title/background color.

### Iconography

- one outline icon system;
- 20/24px standard sizes;
- unified stroke weight and rounded joins;
- no emoji/3D/filled icon mixing for functional controls.

## 7. Screen architecture

### Welcome

Minimal entry surface:

- logo + name;
- short welcome copy;
- primary `ابدأ التفعيل`;
- secondary `لدي حساب بالفعل`;
- discreet Help/Support.

No marketing landing-page structure.

### Activation / Login

One clear task per step. Compact brand area, clear fields, one primary action, minimal helper copy. No giant top whitespace.

### Home

Home becomes the Student overview, not a duplicate menu.

Order:

1. generic greeting (`مرحبًا بك`) — no assumed student name;
2. real quick stats only: subjects / lessons / available practice;
3. real Library stats when sources exist;
4. limited subject preview;
5. quick path to models/quizzes when available;
6. last real attempt when available.

No fake progress, no fake streaks, no fake completion percentages.

### Learn

Scales from one subject to many:

- one class: show context only, no unnecessary selector;
- multiple classes: compact selector;
- few subjects: direct list;
- many subjects: add search;
- list rows, not card wall.

### Subject

Hierarchy:

`Subject → Sections/Units → Lessons`

- units use accordion/progressive disclosure when content is large;
- unsectioned lessons render directly;
- lesson rows stay compact;
- search appears only when lesson volume justifies it;
- optional badges (`ملخص`, `أسئلة`) appear only from real capability/data.

### Reader

Focused workspace:

- compact app bar;
- content-first layout;
- capability slots for `الدرس`, `الملخص`, `أسئلة الدرس` only when available;
- compact tools: search, listen, download, note, more;
- previous/next only from canonical order;
- no bottom navigation while focused.

### Practice

Architecture reserves:

- `التدريبات`;
- `النماذج` / quiz versions/models;
- recent attempts;
- quiz detail;
- focused attempt;
- result/review.

Search/filter controls appear only when dataset size requires them.

### Library

Library becomes direct access, not a dashboard article.

Primary destinations:

- downloads;
- notes;
- saved;
- needs review.

Summary/statistics move to Home. Child pages do not repeat the same four destinations above their content.

### Account

Account is a management surface:

- access/content;
- add class code;
- help/support;
- future supported preferences/security only when contracts exist;
- logout at the bottom as a restrained danger action.

No assumed student name or fixed class card.

## 8. Content scalability rules

- 1 class: no selector;
- multiple classes: selector;
- 1–5 subjects: direct list;
- more subjects: search;
- few lessons: direct list;
- many lessons: grouped accordion + search;
- avoid pagination for ordinary lesson browsing;
- deeper content levels become denser and less decorative.

Rule:

**Top level = visually calm and orienting. Content level = compact and organized.**

## 9. State system

Every changed surface defines:

- loading;
- ready;
- empty;
- error;
- offline where relevant;
- denied/expired where relevant;
- success feedback where relevant.

Blank white screens are not acceptable states.

## 10. Responsive contract

### Phone

- App Bar + bottom navigation;
- full-screen nested flows;
- bottom sheets for selection where useful;
- safe-area aware.

### Tablet/Desktop

- same semantic IA;
- bottom nav becomes adaptive top/rail navigation;
- no separate product model.

## 11. Code architecture rule

UI must be composed from shared primitives and feature modules, not repeated local implementations.

Target ownership:

```text
packages/brand        → identity/tokens/assets
packages/ui           → reusable primitives
student-web/shell     → App Bar / Bottom Nav / page chrome
student-web/features  → auth/home/learn/reader/practice/library/account/secondary
student-web/data      → read models, cache, local repositories, invalidation
```

Avoid stage-named production UI classes and historical override chains.

## 12. Backend integration rule

The UI reserves stable placement for future capabilities, but must not invent data or claim completion.

When later backend stages land, integrate into these existing surfaces instead of adding new top-level navigation unless a verified product reason requires it.

## 13. Acceptance

Student V2 is accepted only when:

- same visual language across all Student surfaces;
- no unnecessary duplication;
- no content hidden behind mobile chrome;
- responsive target widths pass;
- RTL/focus/touch targets pass;
- performance does not regress;
- navigation avoids needless refetch/flicker;
- changed flows define honest loading/empty/error/offline states;
- backend/security authority remains unchanged.
