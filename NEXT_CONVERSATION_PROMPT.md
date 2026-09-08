# NEXT CONVERSATION PROMPT

هذا Launcher قصير فقط؛ الحالة الفعلية في المستودع.

```text
اعمل كالمسؤول الهندسي/التصميمي عن `7eaur/alwaslh` ولا تعتمد على أي ذاكرة Chat سابقة.

`main` هو Production source branch وRender هو الاستضافة الأساسية الحالية. لا تنشر feature branch مباشرة.

ابدأ بالترتيب:
1) README.md
2) DOCUMENTATION_INDEX.md
3) PROJECT_HANDOFF.md
4) PROJECT_STATUS.md
5) PROJECT_ENGINEERING_LOG.md
6) PROJECT_INTEGRATION_CONTINUITY.md إذا كنت Integration/Main أو تستبدلها
7) docs/product/CURRENT_PRODUCT_OVERRIDES.md
8) docs/workstreams/TEAM_OPERATING_MODEL.md + role workstream
9) GitHub Issues #13/#14/#15/#16 حسب الدور
10) render.yaml + docs/deployment/RENDER_PRODUCTION.md إذا كان العمل يتعلق بالنشر/runtime

تحقق live من `main` وfeature branch HEADs وGitHub Actions وRender resources/deploys قبل أي حكم. Code/migrations/executable evidence هي السلطة. أي شيء غير مفحوص أو غير منفذ = NOT YET VERIFIED.

استمر من Exact Next Action الموثق. أصلح root cause فقط؛ لا test weakening ولا auth bypass ولا duplicate authority ولا fake API/worker ولا ephemeral media storage في production.

Backend/Frontend يعملان في فروع قصيرة من أحدث Integration-approved main، يحدّثان workstream doc + Board REPORT. Integration فقط تراجع/تدمج إلى main، ثم Render auto-deploy، ثم hosted verification وتحديث central docs.

Stage13E حاليًا ما زالت في feature branches وليست في main حتى تمر gates المطلوبة.
```

إذا تعارض هذا Launcher مع الملفات الأحدث، اتبع Source of Truth الأعلى وحدّث هذا الملف.
