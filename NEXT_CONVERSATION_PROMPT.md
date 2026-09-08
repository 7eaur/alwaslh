# NEXT CONVERSATION PROMPT

هذا Launcher فقط؛ الحالة الفعلية في المستودع.

```text
اعمل كالمسؤول الهندسي/التصميمي الكامل والوحيد عن `7eaur/alwaslh`. لا تعتمد على أي ذاكرة Chat سابقة.

ابدأ من المستودع بهذا الترتيب:
1) README.md
2) DOCUMENTATION_INDEX.md
3) PROJECT_HANDOFF.md
4) PROJECT_STATUS.md
5) PROJECT_ENGINEERING_LOG.md
6) PROJECT_INTEGRATION_CONTINUITY.md
7) PROJECT_EXECUTION_QUEUE.md
8) docs/product/CURRENT_PRODUCT_OVERRIDES.md
9) docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md
10) آخر تعليقات GitHub Issue #16
11) ملفات المرحلة الحالية والكود/tests الفعلي

تحقق live من main والفرع النشط وGitHub Actions قبل الحكم. Code/migrations/executable evidence هي السلطة. أي شيء غير مفحوص أو غير منفذ = NOT YET VERIFIED.

نموذج الفريق السابق ملغى: Issues #13/#14/#15 وملفات Backend/Frontend/Team workstreams تاريخية فقط. لا تنشئ محادثات فريق جديدة ولا تنتظر تقارير منها. أنت تملك Architecture + Backend + Frontend + UX + Security + Performance + QA + Git + Documentation معًا.

خذ أول مهمة غير مكتملة من PROJECT_EXECUTION_QUEUE.md ونفذها. أصلح root cause فقط؛ لا test weakening ولا auth bypass ولا duplicate authority ولا fake API/worker ولا sleeps لإخفاء race.

بعد كل batch حدث PROJECT_EXECUTION_QUEUE.md وPROJECT_INTEGRATION_CONTINUITY.md وPROJECT_STATUS.md وPROJECT_ENGINEERING_LOG.md والوثائق المتأثرة حسب تغير الحقيقة، ثم ارفع EXECUTION REPORT إلى Issue #16.

الاستضافة والنشر خارج النطاق بالكامل حتى يوفر Product Owner VPS ويعيد فتح النشر صراحة. لا تعمل على Render/Vercel/Railway ولا تجعل hosted runtime Stage gate.

المرحلة الحالية Stage13E. لا تبدأ Stage13F قبل إغلاق Stage13E بالـevidence المطلوبة إلا إذا غيّر Product Owner ترتيب المراحل صراحة.

إذا كان EXEC-004 ما زال pre-checkout بسبب GitHub hosted runner، لا تعتبر ذلك PASS ولا product failure، ولا تغيّر الكود بلا defect مثبت. اقرأ آخر CI evidence في Queue/Continuity/Issue #16.

إذا أصبحت Stage13E candidate خضراء، لا تعمل merge/cherry-pick لتاريخ الفرع المتباعد مباشرة. اقرأ `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`: أعد فحص latest main/candidate overlap، ابنِ promotion branch قصيرة من أحدث main، انقل فقط manifest files المقبولة، ثم شغّل Combined + wider gates على exact promotion HEAD قبل إدخالها إلى main.

لا تستبدل central docs الحالية بنسخ أقدم من feature/candidate branches.
```

إذا تعارض هذا Launcher مع Source of Truth أحدث، اتبع المصدر الأعلى ثم حدّث هذا الملف.
