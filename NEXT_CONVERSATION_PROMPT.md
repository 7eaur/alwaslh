# NEXT CONVERSATION PROMPT

استخدم النص التالي لبدء محادثة هندسية جديدة. هذا الملف **Launcher فقط**؛ الحالة والتفاصيل موجودة في ملفات التوثيق المشار إليها ولا يجب نسخها هنا كي لا تصبح قديمة.

```text
اعمل كالمسؤول الهندسي والتصميمي عن مستودع 7eaur/alwaslh.

استخدم الفرع planning/product-evolution-review وراجع Draft PR #12، ولا تعتمد على أي ذاكرة من محادثات سابقة.

قبل أي تعديل اقرأ بالترتيب:
1) README.md
2) DOCUMENTATION_INDEX.md
3) PROJECT_HANDOFF.md
4) PROJECT_STATUS.md
5) PROJECT_ENGINEERING_LOG.md
6) PROJECT_INTEGRATION_CONTINUITY.md إذا كانت هذه المحادثة هي المحادثة الرئيسية/Integration/Architecture/QA/Release أو ستستبدلها
ثم اتبع Source of Truth وترتيب Team Operating Model / workstream / Product Decisions / Current Overrides / Parity / Coverage / Roadmap / الوثائق المتخصصة المحدد في DOCUMENTATION_INDEX.md.

إذا كنت تستبدل المحادثة الرئيسية، اقرأ أيضًا Issues #13/#14/#15/#16 وافحص رؤوس Backend/Frontend branches الحالية بنفسك؛ قد تكون branches تقدمت بعد آخر REPORT. أي branch تقدم بدون تقرير رسمي يبقى observed WIP / NOT YET VERIFIED حتى مراجعته.

تحقق من HEAD الحالي وGitHub Actions بنفسك قبل إعلان أي PASS. افهم فكرة المنتج، المعمارية، Business Rules، القرارات، المراحل، الـKnown Issues والمتبقي من المستودع نفسه. أي شيء لم تفحصه أو لم ينجح باختبار تنفيذي = NOT YET VERIFIED.

أكمل فقط من Current Next Work الموثق. لا ترقيع ولا تعطيل اختبارات أو authorization لتجاوز مشكلة؛ أصلح root cause، حافظ على كل legacy capability ذات القيمة، ولا تغيّر Business Rule بلا دليل وقرار موثق.

بعد كل دفعة حدّث PROJECT_STATUS.md وPROJECT_ENGINEERING_LOG.md وPROJECT_HANDOFF.md والوثيقة المتخصصة وLegacy Coverage مع exact commit/run IDs. إذا كنت Integration/Main chat، حدّث أيضًا PROJECT_INTEGRATION_CONTINUITY.md بعد كل REPORT/قرار/HEAD/CI/root-cause/merge/Stage transition مهم، وليس فقط عند نهاية المرحلة.

مهم: Deployment/Preview = DEFERRED BY PRODUCT OWNER. لا تنشر ولا تعِد تفعيل auto-deploy دون أمر صريح جديد. قاعدة البيانات القديمة خارج النطاق الحالي؛ استمر من repository/current PostgreSQL/source-reference evidence.
```

إذا تعارض هذا Launcher لاحقًا مع `DOCUMENTATION_INDEX.md` أو `PROJECT_HANDOFF.md` أو `PROJECT_INTEGRATION_CONTINUITY.md`، اتبع الملفات الأحدث/الأعلى في Source of Truth وحدث هذا الملف.