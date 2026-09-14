# STUDENT FRONTEND CODE ARCHITECTURE V2

Date: 2026-09-14
Status: **APPROVED / MANDATORY FOR STUDENT V2**

## الهدف

منع رجوع Student إلى ملفات ضخمة تجمع routing + layout + data loading + UI + business behavior في ملف واحد.

القاعدة:

> Shared once, feature-owned locally, page files stay thin.

أي عنصر مشترك بين أكثر من شاشة لا يعاد نسخه داخل Feature آخر.

## البنية المستهدفة

```text
apps/student-web/src/
├── app/
│   ├── layout/
│   │   ├── StudentAppShell.tsx
│   │   ├── StudentAppBar.tsx
│   │   ├── StudentBottomNav.tsx
│   │   ├── StudentDesktopNav.tsx
│   │   └── student-navigation.ts
│   ├── routing/
│   │   ├── student-routes.ts
│   │   └── route-meta.ts
│   └── providers/
│       ├── StudentSessionProvider.tsx
│       └── StudentDataProvider.tsx
│
├── shared/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   ├── Surface.tsx
│   │   ├── ListRow.tsx
│   │   ├── StatStrip.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── SearchField.tsx
│   │   ├── BottomSheet.tsx
│   │   └── Snackbar.tsx
│   ├── icons/
│   │   └── StudentIcon.tsx
│   ├── data/
│   │   ├── runtime-cache.ts
│   │   ├── cache-keys.ts
│   │   └── invalidation.ts
│   ├── storage/
│   │   ├── preferences.ts
│   │   └── scoped-storage.ts
│   └── utils/
│       ├── formatting.ts
│       └── guards.ts
│
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── state/
│   ├── home/
│   ├── learn/
│   ├── reader/
│   ├── practice/
│   ├── library/
│   ├── account/
│   ├── notifications/
│   └── progress/
│
└── styles/
    ├── tokens.css
    ├── base.css
    ├── shell.css
    ├── components.css
    └── utilities.css
```

هذه بنية هدف. النقل إليها يتم تدريجيًا في PRs صغيرة بدون كسر العقود الحالية.

## قواعد الملكية

### app/layout
يمتلك فقط العناصر المشتركة التي تبني إطار التطبيق:

- App Shell
- App Bar
- Bottom Navigation
- Desktop/Tablet navigation
- safe areas
- page container

لا يجلب بيانات Curriculum أو Quizzes ولا يحتوي Feature logic.

### shared/ui
مكونات presentation عامة لا تعرف معنى `lesson` أو `quiz`.

مثال صحيح:

`<ListRow title subtitle icon trailing />`

مثال غير صحيح داخل shared:

`<EnglishLessonRow />`

هذا يبقى داخل `features/learn`.

### features
كل Feature يمتلك:

- page composition
- feature-specific components
- query/read-model adapters
- feature state
- feature-specific tests

Feature لا ينسخ Button/Icon/EmptyState/Shell من Feature آخر.

## Dependency direction

المسار المسموح:

`app → features → shared`

و:

`features → shared`

غير مسموح:

- `shared` يستورد Feature؛
- Feature يستورد internals من Feature آخر؛
- circular dependency؛
- `app/layout` يستورد Curriculum/Quiz business logic.

أي cross-feature dependency يجب أن يمر عبر shared contract/read model أو public feature boundary واضح.

## قاعدة الملفات

- Page component: orchestration/composition فقط.
- لا نضع routing + API + UI + storage + formatting في ملف واحد.
- إذا تجاوز الملف تقريبًا 250–350 سطر بسبب أكثر من مسؤولية، يجب تقسيمه بدل الاستمرار في التكديس.
- الحجم وحده ليس المعيار؛ **عدد المسؤوليات** هو المعيار الأساسي.
- لا نقسم الملف إلى أجزاء صغيرة بلا معنى؛ كل ملف يجب أن يمثل ownership واضحًا.

## Data flow

```text
API
 ↓
feature query / shared cache
 ↓
read model
 ↓
page/container
 ↓
presentational components
```

المكونات البصرية لا تنادي API مباشرة إلا إذا كانت Component وظيفية مخصصة لذلك ومملوكة للـFeature.

## Cache ownership

Shared runtime cache واحد فقط.

ممنوع:

- Home cache منفصل لنفس Curriculum.
- Learn cache آخر لنفس Curriculum.
- Practice يعيد تنفيذ cache خاص به لنفس Quiz catalog.

الـFeature يطلب من shared data layer ويشتق View Model محليًا.

## Layout ownership

كل الصفحات داخل التطبيق تستخدم نفس:

- `StudentAppShell`
- `StudentAppBar`
- `StudentBottomNav`
- page spacing contract
- safe-area contract

ممنوع إعادة بناء Header أو Bottom Bar داخل صفحة Feature.

Focused modes مثل Reader/Assessment تطلب variant من الـShell بدل إنشاء Layout منفصل عشوائي.

## Icons

Registry واحد.

ممنوع inline SVG مكرر داخل كل Feature إلا رسم محتوى/illustration خاص بالدرس وليس control icon.

## Styling

- tokens قبل القيم hard-coded.
- shell styles لا تدخل feature internals.
- feature stylesheet لا يعدل global navigation selectors.
- لا stage-number CSS في المنتج النهائي.
- لا override chain لحل مشكلة كان يمكن حلها من المكون الأصلي.
- shared component owns its base style؛ feature may compose but not fork it silently.

## Local storage architecture

لا يقرأ كل Feature `localStorage/IndexedDB` مباشرة.

يستخدم repositories/adapters مشتركة ذات scope للحساب، مثال مستقبلي:

```text
shared/storage/
  scoped-db.ts

features/library/data/
  notes-repository.ts
  saved-repository.ts
  review-repository.ts
```

بهذا نضمن profile isolation وlogout policy ومكانًا واحدًا للـmigration/versioning.

## Performance rules

- route-level lazy loading.
- request deduplication.
- reuse fresh read models across routes.
- derive counts بدل إعادة الطلب.
- large lists can adopt virtualization فقط عندما تثبت الحاجة.
- images/media lazy load.
- avoid duplicated state copies.
- avoid mounting hidden expensive views.
- cached route transitions should not flash first-load skeletons.

## Testing contract

لكل extraction/refactor:

1. typecheck/lint.
2. existing behavior tests.
3. route smoke test.
4. mobile visual verification.
5. no duplicate network reads regression for shared read models.
6. RTL/focus/reduced-motion checks when UI chrome changes.

## Migration rule

لا نقوم Big Bang rewrite.

الترتيب:

1. shared primitives + layout.
2. Home extraction.
3. Auth extraction.
4. Learn/Subject after PR #57 reconciliation.
5. Reader.
6. Practice.
7. Library/Account/secondary pages.
8. remove obsolete flat files only after references reach zero.

## Review rejection rules

يرفض أي PR إذا أعاد:

- duplicated app chrome؛
- copied functional SVG icons؛
- feature-local cache لنفس shared read model؛
- hard-coded visual values بدل tokens الموجودة؛
- page component يجمع business/data/storage/presentation بلا فصل؛
- feature-to-feature internal dependency؛
- new permanent browser persistence بدون lifecycle/scope policy.

## Definition of clean

Student V2 لا يعتبر نظيفًا إلا إذا:

- لا يوجد duplicated app chrome.
- لا يوجد duplicated shared icons/components.
- page components قصيرة ومفهومة.
- data fetching منفصل عن visual primitives.
- feature boundaries واضحة.
- cache/storage مركزيان ومحددان.
- import direction مفهوم ولا توجد circular dependencies.
- التعديل على Button/AppBar/ListRow المشترك ينعكس على كل الأماكن التي تستخدمه بدون نسخ يدوي.
