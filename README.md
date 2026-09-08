# الوسيلة الذكية — Alwaseela Smart

> **المستودع هو ذاكرة المشروع الرسمية.** لا تعتمد على ذاكرة محادثات سابقة. ابدأ دائمًا من `DOCUMENTATION_INDEX.md` ثم اتبع ترتيب Source of Truth المذكور فيه.

## فكرة المنتج

**الوسيلة الذكية** منصة تعليمية عربية هدفها تحويل المحتوى الدراسي الموثوق إلى تجربة تعلم ومراجعة واختبار منظمة، مع إدارة كاملة للمحتوى والوصول من جهة الإدارة.

المنتج يحافظ على مخرجات التطبيق القديم ذات القيمة، لكنه لا يكرر معماريته القديمة. التطبيق القديم ومستنداته مرجع للميزات والسيناريوهات والمشكلات، وليس مواصفة تقنية ملزمة.

المنتج المستهدف يتكون من:

- **Student Web/PWA** — تفعيل ودخول آمن، صفوف ومواد ودروس، Reader، ملخصات، بحث، TTS، تدريب واختبارات ونماذج، ملاحظات ومفضلة وNeeds Review، تقدم وإشعارات وOffline/PWA.
- **Admin Web** — Super Admin مستقل لإدارة المنهج والمحتوى والوسائط وOCR والذكاء الاصطناعي وبنك الأسئلة والطلاب والأكواد والاسترداد والإشعارات والاستيراد/التصدير والتقارير والتدقيق.
- **Backend API** — السلطة الوحيدة للهوية والصلاحيات والبيانات والمنطق التجاري فوق PostgreSQL خاصة، مع Media/OCR/AI workers خلف الخادم.

## المعمارية الحالية

```text
Student PWA ─┐
             ├── apps/api ── private PostgreSQL
Admin Web ───┘      │
                    ├── Stage9 source/provenance inventory
                    ├── Stage10 media pipeline
                    ├── reviewed OCR
                    ├── provider-neutral AI contracts
                    ├── durable AI jobs/workers/controls
                    └── later TTS / notifications / offline sync
```

أسطح الـrebuild الحالية:

```text
apps/student-web   Student Web/PWA
apps/admin-web     Super Admin Web
apps/api           Fastify + TypeScript Backend API
packages/brand     shared brand/design primitives
packages/contracts shared contracts where applicable
database/migrations PostgreSQL source of truth
```

**مهم:** ما زالت بعض ملفات التطبيق القديم موجودة في root (`src/`, `supabase/`, ملفات legacy أخرى) كمرجع تاريخي/Parity evidence. لا تفترض أنها runtime المعتمد للمنتج الجديد. الـrebuild الحالي هو `apps/* + database/migrations/*` والعقود الموثقة.

## الحالة الحالية

الفرع التنفيذي/التوثيقي الحالي:

`planning/product-evolution-review` — Draft PR #12.

آخر **executable baseline** متحقق بالكامل:

`260cfef1c48d1290611103f8443d222f8cd041b6`

على هذا الرأس نجحت بوابات Stage9 وStage10 وOCR وStage11 وStage12 وStage13 وFull Rebuild، بما فيها Chromium الفعلي للطالب والإدارة.

تم التحقق حتى الآن من:

- Stages 1–10؛
- OCR Foundation؛
- Stage11 provider-neutral AI contracts؛
- Stage12 durable AI execution + distributed capacity/controls + pause/resume/progress + dedicated worker runtime؛
- Stage13 Curriculum backend؛
- Stage13 Admin Curriculum Web؛
- Stage13 Admin Content / Media / OCR Operations.

العمل التالي الموثق يبدأ من **Stage13 Upload / Processing History / Publication Linking** ثم بقية Admin Product وفق `MASTER_REBUILD_ROADMAP.md` وLegacy Coverage Gate.

## قواعد لا يجوز كسرها

1. Correctness > Cleverness، Evidence > Assumptions.
2. لا ترقيع كحل نهائي؛ أصلح السبب الجذري.
3. لا تُحذف Feature قديمة ذات قيمة بدون قرار Product Owner صريح.
4. Browser لا يتصل مباشرة بPostgreSQL ولا يملك auth/progress/publish authority.
5. Upload/Media مستقل عن OCR/AI/TTS.
6. OCR/AI/TTS طبقات مشتقة؛ failure فيها لا يفسد الأصل.
7. Student يستهلك محتوى وأسئلة منشورة ومراجعة فقط.
8. Stage9 source folders = provenance evidence، وليست Curriculum hierarchy.
9. Stage10 media/OCR لا يصبح Published Lesson Content تلقائيًا؛ الربط يحتاج عقدًا صريحًا.
10. AI provider/model-neutral، ولا تُدّعى جودة provider أو production readiness بدون benchmark فعلي.
11. أي شيء لم يُنفذ ويُختبر = `NOT YET VERIFIED`.
12. Deployment/Preview حاليًا **`DEFERRED BY PRODUCT OWNER`**؛ لا تعِد تفعيله أو نشره بدون أمر صريح لاحق.
13. قاعدة البيانات القديمة ليست dependency حالية؛ repository migrations/tests/current PostgreSQL contracts هي السلطة التنفيذية.

## ابدأ من هنا

اقرأ بالترتيب:

1. `DOCUMENTATION_INDEX.md` — خريطة التوثيق وSource of Truth precedence.
2. `PROJECT_HANDOFF.md` — الاستئناف العملي والمراحل والحدود والرأس الحالي.
3. `PROJECT_STATUS.md` — الحالة المختصرة والمتبقي.
4. `PROJECT_ENGINEERING_LOG.md` — السجل الزمني، Architecture Decisions، Findings، CI evidence.
5. `docs/product/CURRENT_PRODUCT_OVERRIDES.md` — قرارات Product Owner الحالية التي تتقدم على قرارات تشغيلية أقدم.
6. Product Decisions + parity/coverage + roadmap حسب `DOCUMENTATION_INDEX.md`.

لإطلاق محادثة جديدة استخدم `NEXT_CONVERSATION_PROMPT.md` فقط كبوابة قصيرة؛ لا تعتبره بديلًا عن قراءة المستندات.

## التحقق والتطوير

كل Stage لها GitHub Actions executable gate. لا تعتبر Build وحده دليلاً كافيًا؛ اعتمد lint/typecheck/unit/integration/PostgreSQL/browser evidence حسب المجال.

بعد كل دفعة مهمة يجب تحديث:

- `PROJECT_STATUS.md`؛
- `PROJECT_ENGINEERING_LOG.md`؛
- `PROJECT_HANDOFF.md`؛
- الوثيقة المتخصصة؛
- Legacy coverage evidence عندما تنفذ capability قديمة؛
- exact commit/run IDs.

التفاصيل الكاملة موجودة في `DOCUMENTATION_INDEX.md`.