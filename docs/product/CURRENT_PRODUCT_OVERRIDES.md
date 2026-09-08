# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> قرارات Product Owner الحالية التي تتقدم تشغيليًا على أي سياسة أقدم متعارضة. نحافظ على القرارات التاريخية في ملفاتها بدل حذفها، لكن هذا الملف هو authority الحالي للـoverrides.

آخر تحديث: 2026-09-08.

## PO-OVR-001 — Render هو استضافة الإنتاج الحالية

**Current Decision:** `DEPLOYMENT RE-ENABLED — RENDER PRIMARY`.

Product Owner أعاد تفعيل النشر صراحة في 2026-09-08 وقرر أن Render تصبح الاستضافة الأساسية للمشروع الحالي.

الأثر:

- `main` هو Production source branch؛
- التطوير يتم على فروع Backend/Frontend/Integration قصيرة ثم يُدمج العمل المقبول إلى `main`؛
- Render auto-deploy من `main` هو مسار النشر الأساسي؛
- Student Web + Admin Web + Fastify API + PostgreSQL الحالية تستضاف على Render وفق `render.yaml` و`docs/deployment/RENDER_PRODUCTION.md`؛
- PostgreSQL الحالية على Render هي قاعدة الإنتاج للـrebuild، وليست Supabase القديمة؛
- media uploads تحتاج Render Persistent Disk ولا يجوز نشرها على filesystem مؤقت؛
- النشر القديم عبر Vercel/Supabase/Cloudflare ليس authority للمنتج الحالي ويجب ألا يعاد تفعيله؛
- hosted runtime لا يصبح `VERIFIED` لمجرد إنشاء الموارد؛ يلزم health/runtime/session/media verification بعد deploy؛
- Stage غير متحقق منها لا تدخل `main` لمجرد أن Render أصبح متصلًا.

هذا القرار يلغي التأجيل السابق في النسخة القديمة من PO-OVR-001 ويعيد تفعيل cadence النشر، لكن تحت gate جديد: **Integration-approved main → Render production → hosted verification**.

## PO-OVR-002 — قاعدة البيانات القديمة خارج النطاق الحالي

تم بحث إمكانية الاستفادة من قاعدة Supabase القديمة، ثم قرر Product Owner أن ذلك **ليس مهمًا حاليًا** وأن العمل يستمر من المستودع ومصدر المحتوى المرجعي.

لذلك:

- لا تعتمد أي مرحلة حالية على الوصول إلى قاعدة البيانات القديمة؛
- لا تجعل تعذر الوصول إليها blocker؛
- لا تنقل schema/IDs/JSON legacy عشوائيًا إلى النموذج الجديد؛
- `database/migrations/*` + current integration tests هي سلطة PostgreSQL الجديدة؛
- Render Managed PostgreSQL هو hosted production target لهذه الـmigrations؛
- `7eaur/alwaslh-go` + Stage9 inventory هي سلطة source/provenance للمحتوى المرجعي؛
- التطبيق القديم/legacy migrations تبقى feature/evidence reference فقط.

يمكن إعادة فتح legacy data migration لاحقًا فقط بأمر Product Owner صريح وبخطة dry-run/idempotent mapping مستقلة.

## PO-OVR-003 — Repository Documentation هي ذاكرة المشروع الرسمية

أي محادثة جديدة يجب أن تفهم المشروع من المستودع، لا من ذاكرة ChatGPT أو ملخص شفهي.

البدء الإلزامي:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md`

ثم Product Decisions/Parity/Roadmap/وثائق المرحلة المتخصصة حسب الفهرس.

بعد كل دفعة مهمة يجب أن تبقى هذه الملفات متزامنة مع executable evidence وRender deployment evidence عندما يتغير hosted state.

## PO-OVR-004 — لا ترقيع أو تغطية للمشكلات

يتوافق مع PED-046 ويؤكده Product Owner مجددًا:

- لا تغير test ليخفي product defect؛
- إذا كان test نفسه معيبًا، أثبت سبب العيب وحافظ/قوّ التغطية؛
- لا bypass للـauthorization/validation/data contracts؛
- لا duplicate implementation لتجنب إصلاح الأصل؛
- لا hard-coded production exceptions؛
- لا تستخدم ephemeral storage بدل durable media storage في الإنتاج؛
- أصلح root cause ووثّق finding/evidence/solution/verification.

## PO-OVR-005 — main هو خط الإنتاج، والفروع القصيرة هي خط التطوير

بعد cutover إلى Render:

- `main` = آخر Integration-approved production state؛
- Backend/Frontend لا يدمجان مباشرة إلى `main` دون Integration review؛
- كل feature branch يبدأ من أحدث Integration-approved base؛
- `planning/product-evolution-review` يحتفظ بسياق/تاريخ مرحلة التطور الحالية حتى إنهاء انتقاله، لكنه ليس production deploy source بعد cutover؛
- Stage13E تبقى خارج `main` حتى تحقق same-head gates المطلوبة؛
- Render لا يبرر تجاوز CI/QA gates.

أي Feature غير منفذة أو غير مختبرة تبقى `NOT YET VERIFIED` ولا يجوز اعتبارها مكتملة لأن Foundation أو Backend جزئي موجود.
