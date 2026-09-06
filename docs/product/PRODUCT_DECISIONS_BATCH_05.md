# PRODUCT DECISIONS — BATCH 05

> امتداد رسمي لـ `docs/product/PRODUCT_EVOLUTION_REVIEW.md`. اقرأه بعد Batches 01–04. هذه القرارات ملزمة عند إعادة بناء المراحل المتأثرة، لكنها `NOT YET VERIFIED` تنفيذياً حتى تمر الاختبارات المطلوبة.

## PED-040 — الملاحظات تحافظ على الأنواع المفيدة من القديم

الملاحظات تبقى Feature كاملة وليست Text-only.

الأنواع المطلوبة:
- ملاحظة نصية؛
- صورة يضيفها الطالب؛
- Capture/لقطة مرتبطة بصفحة/محتوى؛
- ملاحظة صوتية.

كل ملاحظة تحمل provenance ثابتًا عند انطباقه: account/device + class/subject/lesson + page/source position. ملفات الصور/الصوت لا تُخزن base64 داخل records الكبيرة؛ تستخدم Media/Blob storage مناسبًا مع metadata/checksum والـOffline sync contract.

**Classification:** KEEP + REBUILD implementation
**Status:** DECIDED

## PED-041 — الإضافة التلقائية إلى «يحتاج مراجعة» بعد الأخطاء المتكررة

يبقى للطالب زر يدوي لإضافة أي درس/سؤال إلى `Needs Review`، ويستطيع النظام أيضًا إضافته تلقائيًا عندما يظهر ضعف متكرر.

القاعدة الافتراضية عند التنفيذ:
- نفس السؤال يُخطأ فيه مرتين في محاولتين/سياقين مستقلين → يصبح مرشحًا تلقائيًا لـNeeds Review؛
- يمنع duplicate review items؛
- نجاح لاحق لا يحذفه فورًا بصمت؛ النظام يخفف/يحل الحالة بعد دليل تحسن كافٍ أو يترك للطالب إزالة العنصر؛
- السبب ظاهر للطالب بنص بسيط مثل: `أخطأت في هذا السؤال أكثر من مرة`.

Thresholds قابلة للضبط من config بعد القياس، وليست hard-coded في UI.

**Classification:** IMPROVE / NEW automation
**Status:** DECIDED

## PED-042 — نقاط الضعف والتقدم مشتقة من بيانات حقيقية

نظهر للطالب تقدمًا مفيدًا ونقاط ضعف على مستوى المادة/الدرس عندما تتوفر عينة كافية، ولا نستنتج ضعفًا من سؤال واحد.

المصادر:
- Full Test attempts؛
- Practice answers؛
- Needs Review history؛
- completion/reading progress عندما يكون له معنى؛
- لا يوجد client-authoritative score/mastery.

الـBackend يحسب aggregate metrics. إذا كانت العينة قليلة تظهر حالة محايدة بدل حكم مضلل. UI يعطي توصيات عملية مثل `راجع درس التكامل` أو `اختبر نفسك في قوانين نيوتن` بدون Global Leaderboard.

**Classification:** KEEP + IMPROVE analytics
**Status:** DECIDED direction / thresholds tuned during Stage 19

## PED-043 — Push Notifications خارج التطبيق من البداية، بتذكير دراسة خفيف

Web/PWA Push Notifications مطلوبة في النسخة الأساسية عندما تسمح المنصة/المتصفح بذلك، مع permission صريح من الطالب.

الأنواع الأساسية:
- تذكير دراسة خفيف؛
- إشعار محتوى/نموذج جديد ذو قيمة؛
- تنبيه انتهاء/قرب انتهاء صلاحية؛
- رسالة مهمة من Admin.

Anti-annoyance defaults:
- لا أكثر من تذكير دراسة واحد في اليوم؛
- default لا يتجاوز 3 تذكيرات دراسة في الأسبوع؛
- quiet hours محلية افتراضيًا 21:00–08:00؛
- الطالب يستطيع تعطيل تذكيرات الدراسة/Push؛
- لا Gamification spam ولا إشعارات بلا قيمة؛
- إذا Push غير مدعوم تبقى In-App Notification Center.

**Classification:** KEEP + IMPROVE notifications
**Status:** DECIDED

## PED-044 — AI ليس مربوطًا بـGemini: Multi-Provider / Multi-Model

لا يوجد vendor/model واحد مقدس. كل AI execution خلف provider/model adapters وعقد موحد قدر الإمكان.

Target:

```text
Generation Job
→ Task classifier / mode requirements
→ Cost+quality-aware Model Router
→ Provider Adapter
→ pinned model revision/config
→ structured output
→ validators / provenance / dedupe
→ accept OR escalate only failed unit
```

المعيار ليس `أرخص request` بل:

`accepted useful outputs / cost / token / time`

نسمح بمزيج:
- model سريع/رخيص للمهام البسيطة أو first-pass؛
- model أقوى للمحتوى العربي/العلمي/الديني الحساس أو للوحدات التي فشل فيها المسار الأرخص؛
- free/near-free tiers للتطوير والـbenchmark والدفعات المناسبة عندما تكون شروط الخصوصية/الاعتمادية مقبولة؛
- لا نعتمد random free model في Production لمحتوى تعليمي يحتاج reproducibility.

كل provider credential server-only، مع health/rate/quota/cooldown/budget tracking. Provider switching لا يستخدم للتحايل على limits أو Terms.

**Classification:** REBUILD AI architecture
**Status:** DECIDED

## PED-045 — Model Cascade لتقليل الكلفة بدون خفض الجودة

عند ملاءمة المهمة:

```text
cheap/fast candidate
→ deterministic schema/semantic/provenance validation
→ accepted: store Draft
→ failed/uncertain: escalate this unit only to stronger model
```

لا نعيد batch كاملًا بسبب failures جزئية. لا نستخدم model أقوى لكل شيء إذا كان model أرخص يحقق نفس acceptance quality. القرارات تسجل في telemetry حتى يمكن تغيير routing بناءً على evidence.

**Classification:** NEW optimization architecture
**Status:** DECIDED / benchmark required before production routing

## PED-046 — لا ترقيع: Root-Cause Change Policy

أي تعديل مهم يجب أن يبدأ بفهم inputs/outputs/dependencies/callers/side-effects/edge cases ثم إصلاح السبب الجذري.

ممنوع اعتبار الآتي حلاً نهائيًا:
- تعطيل test كي يمر build؛
- duplicate implementation لأن تعديل الأصل أصعب؛
- bypass للـauthorization/validation؛
- hard-coded production exception؛
- catch يخفي error ويكمل ببيانات غير صحيحة؛
- temporary compatibility branch بلا issue/exit plan؛
- إصلاح UI يخفي عيب Backend/Data contract.

إذا احتجنا workaround مؤقتًا لتشغيل Preview، يوثق كـKnown Issue + السبب + حدود الأثر + مسار الإزالة، ولا يتحول إلى architecture دائمة.

**Classification:** ENGINEERING GOVERNANCE
**Status:** DECIDED / MANDATORY

## PED-047 — Design System واحد، لا UI duplication

المنتج كله يستخدم هوية موحدة من `packages/brand` ومكونات/tokens مشتركة.

Rules:
- colors/typography/spacing/radius/icons/states مصدر واحد؛
- لا نسخ Button/Form/Card/Modal patterns لكل صفحة؛
- Student وAdmin يشتركان في brand primitives، مع اختلاف density/navigation حسب المستخدم؛
- page-specific component مسموح عندما behavior خاص فعليًا، لا لأن النسخ أسرع؛
- responsive/a11y/loading/error/empty/offline states جزء من component contracts؛
- لا AI-generic decoration/gradients/glass/glow بلا وظيفة؛
- النصوص السياقية PED-034 جزء من كل flow؛
- قبل إغلاق Stage 13/14 نعمل duplicate-component/style audit.

**Classification:** KEEP + STRENGTHEN design governance
**Status:** DECIDED / MANDATORY

## PED-048 — بقية القرارات التفصيلية تُحسم هندسيًا بالأبسط والأقوى

Product Owner لا يريد جلسات نقاش على التفاصيل المعروفة التي لا تغيّر فكرة المنتج. للفريق الهندسي صلاحية اختيار الأنسب بشرط:
- الحفاظ على كل legacy capability ذات القيمة وفق Coverage Gate؛
- عدم تغيير Business Rule أساسي بصمت؛
- توثيق القرار المهم؛
- اختبار السلوك؛
- اختيار أبسط architecture صحيحة وقابلة للصيانة؛
- لا overengineering ولا patching.

**Status:** DECIDED

## أثر Batch 05 على المراحل

- Stage 12: يتحول رسميًا من Gemini scheduler إلى provider/model-neutral durable AI router + scheduler + model cascade.
- Stage 13: Super Admin يحتاج Notification publishing، Question review، AI provider/model observability، Notes/media support where admin-visible.
- Stage 14/17: Notes text/image/capture/audio كاملة.
- Stage 15/19: repeated-error events تغذي Needs Review والـweak-area metrics.
- Stage 18: Web Push + In-App center + quiet/rate policies.
- Stage 19: server-derived progress/mastery/weak-area recommendations.
- Stages 13/14/24: unified Design System + duplicate/style audit.
- كل المراحل: Root-Cause Change Policy إلزامية.

## حالة Product Review بعد Batch 05

Core product decisions أصبحت كافية لإعادة بناء roadmap التنفيذي بدون مزيد من الأسئلة التفصيلية كشرط مسبق. يمكن حسم التفاصيل الصغيرة أثناء التنفيذ وفق PED-048، مع إعادة السؤال فقط إذا ظهر قرار Business حقيقي له أكثر من نتيجة منتجية مهمة.
