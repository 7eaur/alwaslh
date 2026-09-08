# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> قرارات Product Owner الحالية تتقدم تشغيليًا على أي سياسة أو وثيقة أقدم متعارضة. المستودع والكود والاختبارات التنفيذية تبقى Source of Truth للتنفيذ.

آخر تحديث: 2026-09-08.

## PO-OVR-001 — النشر والاستضافة مؤجلان بالكامل حتى يتوفر VPS

**Current Decision:** `DEPLOYMENT / HOSTING FULLY DEFERRED UNTIL VPS IS AVAILABLE`.

قرر Product Owner إيقاف التفكير في النشر والاستضافة بالكامل في المرحلة الحالية والاستمرار في بناء المنتج واختباره وتوثيقه بنفس المعمارية وخط التطوير المتفق عليهما حتى يتوفر VPS مناسب.

الأثر الملزم:

- لا Render ولا Vercel ولا Railway ولا Supabase ولا أي hosted runtime آخر هو هدف حالي للتنفيذ أو الاختبار أو الإغلاق المرحلي.
- لا Stage تحتاج deploy أو hosted smoke أو hosted database/media verification لكي تصبح `VERIFIED`.
- `main` هو **Integration-approved development baseline** وليس فرع production حاليًا.
- التطوير يستمر عبر فروع Backend/Frontend/Integration قصيرة ثم يُدمج العمل المقبول إلى `main` بعد Integration gates.
- اختبارات الإغلاق الحالية هي repository/local/CI executable gates: lint, typecheck, unit, integration, clean PostgreSQL migrations, build, Chromium/E2E, security/performance/regression حسب المرحلة.
- إذا تعطل GitHub hosted runner، يبقى ذلك blocker للتحقق التنفيذي المطلوب فقط؛ لا يتحول إلى مبرر لتخفيف الاختبارات أو لإضافة استضافة بديلة.
- ملفات/configuration الاستضافة الموجودة تاريخيًا لا تُحذف لمجرد هذا القرار، لكنها **ليست Current Work ولا Acceptance Gate** ولا يجوز أن تستهلك وقت التطوير الآن.
- عند توفر VPS مستقبلًا سيصدر Product Owner أمرًا صريحًا لإعادة فتح Deployment/Hosting، وعندها نصمم/نراجع خطة النشر انطلاقًا من المعمارية المحمولة الموجودة فعليًا وقتها.

هذا القرار **يلغي تشغيليًا** قرارات Render السابقة وأي خطوة حالية مرتبطة بتطبيق Blueprint أو hosted smoke أو provider cutover.

## PO-OVR-002 — قاعدة البيانات القديمة خارج النطاق الحالي

- لا تعتمد أي مرحلة حالية على الوصول إلى قاعدة بيانات legacy أو Supabase قديمة.
- لا تجعل تعذر الوصول إليها blocker.
- لا تنقل schema/IDs/JSON legacy عشوائيًا إلى النموذج الجديد.
- `database/migrations/*` + current integration tests هي سلطة PostgreSQL الجديدة.
- `7eaur/alwaslh-go` + Stage9 inventory تبقى سلطة source/provenance للمحتوى المرجعي.
- التطبيق القديم/legacy migrations تبقى feature/evidence reference فقط.

يمكن إعادة فتح legacy data migration لاحقًا فقط بأمر Product Owner صريح وخطة dry-run/idempotent mapping مستقلة.

## PO-OVR-003 — Repository Documentation هي ذاكرة المشروع الرسمية

أي محادثة جديدة تفهم المشروع من المستودع لا من Chat memory.

البدء الإلزامي:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md`

ثم Product Decisions/Parity/Roadmap/وثائق المرحلة المتخصصة حسب الفهرس.

بعد كل batch أو Stage مهمة يجب مزامنة التوثيق مع code/contracts/tests/executable evidence الفعلي. لا توجد حاليًا hosted-deployment evidence مطلوبة.

## PO-OVR-004 — لا ترقيع أو تغطية للمشكلات

- لا تغير test ليخفي product defect.
- إذا كان test نفسه معيبًا، أثبت سبب العيب وحافظ أو قوِّ التغطية.
- لا bypass للـauthorization/validation/data contracts.
- لا duplicate implementation لتجنب إصلاح الأصل.
- لا hard-coded exceptions لتجاوز contract صحيح.
- أصلح root cause ووثّق finding/evidence/solution/regression verification.

## PO-OVR-005 — main هو Integration baseline والفروع القصيرة هي خط التطوير

- `main` = آخر حالة قبلها Integration كقاعدة تطوير موحدة.
- Backend/Frontend لا يدمجان مباشرة إلى `main` دون Integration review.
- كل feature branch يبدأ من أحدث Integration-approved base قدر الإمكان.
- عند وجود branch أقدم متشعبة، يفضّل Integration selective/rebase strategy تمنع استيراد history أو docs قديمة غير مرتبطة.
- Feature غير منفذة أو غير مختبرة تبقى `NOT YET VERIFIED`.
- Stage13E تبقى خارج `main` حتى تحقق same-head executable gates المطلوبة.
- لا تبدأ Stage13F قبل إغلاق Stage13E حسب Stage Closure Gate.

## PO-OVR-006 — المعمارية تبقى قابلة للنشر لاحقًا دون بناء Hosting الآن

التطوير الحالي يجب أن يحافظ على portability الطبيعية فقط:

- Fastify API منفصل عن durable worker runtime.
- PostgreSQL عبر contracts/migrations واضحة.
- environment-driven configuration.
- frontend static build مستقل عن backend authority.
- media/storage abstraction تبقى في الطبقة الصحيحة.
- لا provider-specific rewrite أو infrastructure abstraction غير مطلوبة الآن.

عند توفر VPS نراجع المتطلبات الفعلية ونضيف أبسط deployment architecture تحقق durability/security/operations دون تغيير Business Architecture.