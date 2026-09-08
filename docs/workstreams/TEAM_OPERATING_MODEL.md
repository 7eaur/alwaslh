# TEAM OPERATING MODEL — الوسيلة الذكية

> هذا الملف يعرّف طريقة عمل فريق المشروع الدائم. GitHub هو الذاكرة المشتركة ومصدر الأوامر والتقارير بين المحادثات. لا تعتمد أي محادثة على chat memory لتعرف ما الذي يجب فعله.

## 1. هدف الفريق

نبني أفضل نسخة من **نفس منتج الوسيلة الذكية** مع الحفاظ على Business Goals والـUser Flows والنتائج المهمة للمستخدم، مع تحسين Architecture/UX/Security/Performance/Maintainability دون Overengineering.

## Mandatory quality and continuity amendment

قبل أي `Ready for integration` أو Stage closure:

- لا توجد معرفة لازمة للاستمرار داخل chat فقط؛
- workstream doc + Board report يحتويان branch/base/latest commits، ما فُحص ونُفذ، العقود/الملفات المتغيرة، الاختبارات ونتائجها، المشاكل وRoot Cause والإصلاح وRegression test، blockers، `NOT YET VERIFIED`، و`Exact next action`؛
- أي bug/failure مهم يُحل من الجذر: symptom → root cause → blast radius → correct fix location → regression protection؛
- ممنوع test weakening/security bypass/hidden catch/duplicate authority/random timeout أو workaround دائم في الطبقة الخاطئة؛
- نهاية كل Stage تحتاج Closure Report وتحديث الوثائق المتخصصة؛ Integration Lead وحده يغلق Stage بعد same-head CI ومزامنة central docs/Legacy Coverage.

للتفاصيل الكاملة اقرأ النسخة الحالية من هذا الملف على `planning/product-evolution-review` وIssues `#13/#14/#16` قبل العمل.
