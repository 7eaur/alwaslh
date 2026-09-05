# PRODUCT DECISIONS — BATCH 06

> تاريخ القرار: 2026-09-06. هذه القرارات تكمل Product Evolution Review ولا تغيّر فكرة الوسيلة الذكية؛ توضح شكل المنتج أثناء التطوير وطريقة الاستمرار بين المحادثات.

## PED-049 — Student وAdmin سطحان مستقلان لنفس المنتج

المنتج يملك واجهتين منفصلتين وظيفيًا وتجريبيًا:

```text
Student PWA (apps/student-web)
→ الطالب فقط
→ installable Web App / PWA
→ mobile-first / offline-first

Admin Web (apps/admin-web)
→ Super Admin فقط
→ واجهة إدارة مستقلة
→ لا تظهر داخل تطبيق الطالب ولا تُحمّل ضمن UX الطالب
```

يشتركان في Backend API والعقود والهوية/Design System حيث يلزم، لكن لا نخلط Navigation أو Bundles أو صلاحيات أو States بينهما.

**Classification:** KEEP + CLARIFY ARCHITECTURE
**Status:** DECIDED

## PED-050 — Student يبقى تطبيق ويب قابلًا للتثبيت

Student Product يجب أن يعمل كتطبيق ويب/PWA قابل للتثبيت مثل الفكرة السابقة، لكن بتنفيذ PWA صحيح وآمن:

- Web App Manifest وأيقونات/هوية owned؛
- install flow واضح وسياقي؛
- Service Worker خاص بالطالب فقط؛
- Offline/download/sync حسب العقود المعتمدة؛
- تحديثات PWA لا تمسح بيانات الطالب بلا عقد؛
- لا disable pinch zoom أو accessibility لأجل شكل شبيه Native؛
- Push Notifications حيث يدعم المتصفح والمنصة؛
- التطبيق يظل قابلًا للاستخدام من المتصفح حتى بدون تثبيت.

**Classification:** KEEP OUTCOME + REBUILD IMPLEMENTATION
**Status:** DECIDED

## PED-051 — Preview حي أثناء التطوير شرط تشغيلي

أثناء التطوير لا ننتظر نهاية المشروع لمشاهدة النتيجة. بعد كل دفعة/مرحلة مستقرة وقابلة للنشر، تُزامن النسخة التجريبية المؤقتة حتى يستطيع Product Owner الإشراف والتجربة.

البيئة المؤقتة الحالية:

```text
GitHub development branches
→ validated CI
→ preview/supabase-vercel integration branch
→ Supabase linksoftt (temporary PostgreSQL/testing host)
→ Vercel project alwaslh / team wasl15
→ Student/Admin/API preview surfaces
```

قواعد Preview:

1. Preview ليست Production architecture ولا تغيّر قرار الاستضافة النهائية.
2. لا تُنقل تغييرات غير مستقرة فقط لإظهار شيء بصري؛ يجب أولًا اجتياز Gate المناسبة.
3. بعد كل sync نسجل commit/deployment/URL/runtime evidence في `PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md` و`PROJECT_HANDOFF.md` وrunbook الـPreview.
4. الأسرار تبقى في hosting environment ولا تدخل Git أو المحادثة.
5. أي workaround خاص بـVercel/Supabase مؤقت يجب أن يكون موثقًا مع impact + removal/exit path؛ لا يتحول إلى Architecture دائمة بالصدفة.
6. عند استقرار Feature مرتبطة بالنسخة الحية، نتحقق على الأقل من build/deployment/health والمسار الوظيفي المناسب قبل اعتبار Preview synchronized.
7. إذا كانت منصة Preview لا تدعم جزءًا حقيقيًا من الـProduction architecture (مثل durable filesystem/worker runtime)، يوثق `NOT YET VERIFIED` بدل اختراع سلوك مزيف.

**Classification:** NEW ENGINEERING/PRODUCT-REVIEW POLICY
**Status:** DECIDED

## PED-052 — مستندات التطبيق القديم مرجع إلزامي لا يُنسى

تفاصيل التطبيق القديم محفوظة داخل المستودع ويجب الرجوع إليها عند بناء كل Module، وليس الاعتماد على ذاكرة المحادثة.

المراجع الأساسية:

- `PRODUCT_FEATURE_PARITY_MATRIX.md` — inventory للميزات والسيناريوهات المطلوبة.
- `PROJECT_DEEP_AUDIT.md` — deep audit للمشكلات والـflows والتنفيذ القديم.
- `PROJECT_FULL_AUDIT_CATALOG.md` — catalog موسع للأدلة والمشكلات.
- `PROJECT_REBUILD_BLUEPRINT.md` — فهم/خطة إعادة البناء السابقة والسياق المعماري.
- `OFFLINE_MODE.md` و`OFFLINE_MODE_README.md` — سلوك Offline القديم ومشكلاته كمرجع.
- `DATABASE_PLATFORM_ARCHITECTURE.md` — قرارات منصة البيانات الجديدة.
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` — gate يمنع ضياع أي Feature ذات قيمة.

**Rule:** عند تنفيذ Student/Admin module يجب مراجعة صفوفه في parity matrix + الأدلة القديمة ذات الصلة، ثم تصنيف كل capability إلى `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE(owner-approved)` وربطها بتنفيذ واختبار جديد.

**Classification:** DOCUMENTATION GOVERNANCE
**Status:** DECIDED

## PED-053 — التوثيق هو ذاكرة المشروع الرسمية

لا تعتمد أي محادثة جديدة على chat memory. بعد كل دفعة مهمة يجب تحديث:

- `PROJECT_STATUS.md`؛
- `PROJECT_ENGINEERING_LOG.md`؛
- `PROJECT_HANDOFF.md` عندما تتغير architecture/business/branch/CI/Preview state؛
- الوثيقة المتخصصة ذات الصلة؛
- parity/coverage evidence عند تنفيذ Feature؛
- exact CI/runtime evidence؛
- `NOT YET VERIFIED` لأي شيء لم يُختبر فعليًا.

للاستمرار السريع يوجد `DOCUMENTATION_INDEX.md` و`NEXT_CONVERSATION_PROMPT.md`.

**Classification:** DOCUMENTATION GOVERNANCE
**Status:** DECIDED

## الحالة بعد Batch 06

Core Product Review أصبح مغلقًا بما يكفي لاستئناف التنفيذ. لا نحتاج نقاشًا إضافيًا للتفاصيل الروتينية؛ الهندسة تختار الأنسب وفق القرارات المسجلة، سياسة root-cause/no-patching، Design System الموحد، والـlegacy coverage gate.

الانتقال التنفيذي التالي يبقى:

```text
Product Review documentation/CI closure
→ Stage10 Preview Sync
→ Stage6/8 Auth/Activation/Device Refactor
→ OCR Foundation
→ Stage11 provider-neutral AI contracts/benchmark
→ Stage12 durable high-throughput AI execution
→ Super Admin / Student feature stages
```
