# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> قرارات Product Owner الحالية تتقدم تشغيليًا على أي سياسة أو وثيقة أقدم متعارضة. الكود والمigrations والاختبارات التنفيذية تبقى Source of Truth للتنفيذ.

آخر تحديث: 2026-09-08.

## PO-OVR-001 — النشر والاستضافة مؤجلان بالكامل حتى يتوفر VPS

**Current Decision:** `DEPLOYMENT / HOSTING FULLY DEFERRED UNTIL VPS IS AVAILABLE`.

قرر Product Owner إيقاف التفكير في النشر والاستضافة بالكامل والاستمرار في بناء المنتج واختباره وتوثيقه حتى يتوفر VPS مناسب.

الأثر الملزم:

- لا Render ولا Vercel ولا Railway ولا Supabase ولا hosted runtime آخر هو هدف حالي للتنفيذ أو الاختبار أو Stage closure.
- لا Stage تحتاج deploy أو hosted smoke لكي تصبح `VERIFIED`.
- `main` هو Integration-approved **development baseline** وليس فرع production حاليًا.
- اختبارات الإغلاق الحالية هي repository/local/CI executable gates: lint, typecheck, unit, integration, clean PostgreSQL, build, browser/E2E, security/performance/regression حسب المرحلة.
- تعطل GitHub runner لا يبرر تخفيف الاختبارات أو بناء استضافة بديلة.
- ملفات الاستضافة التاريخية قد تبقى في Git لكنها ليست Current Work ولا Acceptance Gate.
- عند توفر VPS سيعيد Product Owner فتح Deployment/Hosting صراحة.

هذا يلغي تشغيليًا قرارات Render السابقة وأي Blueprint/hosted smoke/cutover حالي.

## PO-OVR-002 — قاعدة البيانات القديمة خارج النطاق الحالي

- لا تعتمد أي مرحلة حالية على legacy/Supabase database.
- لا تجعل تعذر الوصول إليها blocker.
- لا تنقل legacy schema/IDs/JSON عشوائيًا.
- `database/migrations/*` + current integration tests هي سلطة PostgreSQL الجديدة.
- `7eaur/alwaslh-go` + Stage9 inventory هي سلطة source/provenance المرجعية.
- legacy code/migrations تبقى capability/failure evidence فقط.

إعادة فتح legacy data migration تحتاج أمر Product Owner صريح وخطة dry-run/idempotent mapping مستقلة.

## PO-OVR-003 — Repository Documentation هي ذاكرة المشروع الرسمية

أي محادثة جديدة تفهم المشروع من المستودع لا من Chat memory.

البدء الإلزامي:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → SINGLE_OWNER_OPERATING_MODEL.md → Issue #16 → current stage code/tests`

بعد كل batch أو Stage مهمة يجب مزامنة التوثيق مع code/contracts/tests/executable evidence الفعلي.

## PO-OVR-004 — لا ترقيع أو تغطية للمشكلات

- لا تغير test ليخفي product defect.
- إذا كان test نفسه معيبًا، أثبت السبب وحافظ/قوِّ التغطية.
- لا bypass للـauthorization/validation/data contracts.
- لا duplicate implementation لتجنب إصلاح الأصل.
- لا hard-coded exceptions لتجاوز contract صحيح.
- لا sleeps/timeouts عشوائية لإخفاء race.
- أصلح root cause في owning layer ووثّق evidence/solution/regression verification.

## PO-OVR-005 — main هو Development Integration baseline والفروع القصيرة هي خط التطوير

- `main` = آخر حالة مقبولة كقاعدة تطوير موحدة.
- العمل البرمجي يفضل branch قصيرة من أحدث baseline عندما يحتاج isolation.
- عند وجود branch قديمة متشعبة، استخدم selective/rebase strategy تمنع استيراد history/docs غير مرتبطة.
- Feature غير منفذة أو غير مختبرة = `NOT YET VERIFIED`.
- Stage13E تبقى خارج `main` حتى تحقق same-head executable gates المطلوبة.
- لا تبدأ Stage13F قبل إغلاق Stage13E ما لم يغير Product Owner ترتيب المراحل صراحة.

## PO-OVR-006 — المعمارية تبقى قابلة للنشر لاحقًا دون بناء Hosting الآن

حافظ فقط على portability الطبيعية:

- Fastify API منفصل عن durable worker runtime.
- PostgreSQL عبر migrations/contracts واضحة.
- environment-driven configuration.
- frontend static build مستقل عن backend authority.
- media/storage abstraction في owning layer.
- لا provider-specific rewrite أو infrastructure abstraction غير مطلوبة الآن.

عند توفر VPS نراجع المتطلبات الفعلية ونضيف أبسط deployment architecture تحقق durability/security/operations دون تغيير Business Architecture.

## PO-OVR-007 — إلغاء نموذج الفريق متعدد المحادثات واعتماد Single Owner

**Current Decision:** `ONE REPLACEABLE ENGINEERING CONVERSATION OWNS THE WHOLE PROJECT`.

Product Owner قرر الاستغناء عن محادثات Backend/Frontend المنفصلة. من الآن:

- محادثة هندسية واحدة تملك Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation معًا.
- Issue `#16` هي execution ledger الوحيدة.
- `PROJECT_EXECUTION_QUEUE.md` هي task authority التشغيلية.
- `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md` هي operating model الحالية.
- Issues `#13/#14/#15` مغلقة ومحفوظة تاريخيًا فقط.
- `TEAM_OPERATING_MODEL.md`, `BACKEND_WORKSTREAM.md`, `FRONTEND_WORKSTREAM.md`, `INTEGRATION_WORKSTREAM.md` historical/superseded pointers؛ لا تُستخدم لتوزيع عمل جديد.
- لا توجد handoff delays بين فرق منفصلة؛ المالك الواحد يفهم العقد كاملًا وينفذ cross-boundary changes في batches منطقية ويحافظ على same-head gates.
- بعد كل batch يحدث Queue + Continuity + docs المتأثرة ويضع `EXECUTION REPORT` في Issue #16.

الهدف: تقليل التعارض وضياع السياق مع الحفاظ على نفس quality gates وعدم تحويل المالك الواحد إلى مبرر لخلط authorities أو تخفيف الاختبارات.
