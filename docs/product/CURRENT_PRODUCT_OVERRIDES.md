# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> قرارات Product Owner الحالية التي تتقدم تشغيليًا على أي سياسة أقدم متعارضة. نحافظ على القرارات التاريخية في ملفاتها بدل حذفها، لكن هذا الملف هو authority الحالي للـoverrides.

آخر تحديث: 2026-09-08.

## PO-OVR-001 — Deployment / Preview مؤجل

**Current Decision:** `DEFERRED BY PRODUCT OWNER`.

الأثر:

- لا Git auto-deploy؛
- لا Vercel/Supabase Preview sync؛
- لا publish للـStudent/Admin/API؛
- لا إعادة تفعيل deployment hooks؛
- hosted runtime يبقى `NOT YET VERIFIED`؛
- التطوير يستمر عبر repository CI/PostgreSQL/integration/Chromium evidence.

هذا القرار **يوقف تشغيليًا PED-051** وأي نص أقدم يقول إن كل stable batch يجب نشرها إلى Preview. PED-051 محفوظ كتاريخ قرار، لكنه ليس cadence التشغيل الحالي.

إعادة تفعيل النشر تحتاج أمرًا صريحًا جديدًا من Product Owner.

## PO-OVR-002 — قاعدة البيانات القديمة خارج النطاق الحالي

تم بحث إمكانية الاستفادة من قاعدة Supabase القديمة، ثم قرر Product Owner أن ذلك **ليس مهمًا حاليًا** وأن العمل يستمر من المستودع ومصدر المحتوى المرجعي.

لذلك:

- لا تعتمد أي مرحلة حالية على الوصول إلى قاعدة البيانات القديمة؛
- لا تجعل تعذر الوصول إليها blocker؛
- لا تنقل schema/IDs/JSON legacy عشوائيًا إلى النموذج الجديد؛
- `database/migrations/*` + current integration tests هي سلطة PostgreSQL الجديدة؛
- `7eaur/alwaslh-go` + Stage9 inventory هي سلطة source/provenance للمحتوى المرجعي؛
- التطبيق القديم/legacy migrations تبقى feature/evidence reference فقط.

يمكن إعادة فتح legacy data migration لاحقًا فقط بأمر Product Owner صريح وبخطة dry-run/idempotent mapping مستقلة.

## PO-OVR-003 — Repository Documentation هي ذاكرة المشروع الرسمية

أي محادثة جديدة يجب أن تفهم المشروع من المستودع، لا من ذاكرة ChatGPT أو ملخص شفهي.

البدء الإلزامي:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md`

ثم Product Decisions/Parity/Roadmap/وثائق المرحلة المتخصصة حسب الفهرس.

بعد كل دفعة مهمة يجب أن تبقى هذه الملفات متزامنة مع executable evidence.

## PO-OVR-004 — لا ترقيع أو تغطية للمشكلات

يتوافق مع PED-046 ويؤكده Product Owner مجددًا:

- لا تغير test ليخفي product defect؛
- إذا كان test نفسه معيبًا، أثبت سبب العيب وحافظ/قوّ التغطية؛
- لا bypass للـauthorization/validation/data contracts؛
- لا duplicate implementation لتجنب إصلاح الأصل؛
- لا hard-coded production exceptions؛
- أصلح root cause ووثّق finding/evidence/solution/verification.

## PO-OVR-005 — استمر من المستودع الحالي بشكل متسلسل

العمل الحالي يستمر من `planning/product-evolution-review` / Draft PR #12 وفق Current Next Work الموثق، مع المحافظة على نفس المنتج وكل legacy capabilities ذات القيمة.

أي Feature غير منفذة أو غير مختبرة تبقى `NOT YET VERIFIED` ولا يجوز اعتبارها مكتملة لأن Foundation أو Backend جزئي موجود.