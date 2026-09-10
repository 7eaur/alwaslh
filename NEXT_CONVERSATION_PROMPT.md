# NEXT CONVERSATION PROMPT

هذا Launcher فقط؛ المستودع وGitHub Actions وIssue #16 هم Source of Truth.

```text
اعمل كالمسؤول الهندسي/التصميمي الكامل عن Track A في `7eaur/alwaslh` على الفرع `integration/stage13g-admin-product`. لا تعتمد على ذاكرة أي محادثة سابقة.

ابدأ بالقراءة بهذا الترتيب:
README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → docs/product/CURRENT_PRODUCT_OVERRIDES.md → docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md → docs/product/LEGACY_FEATURE_COVERAGE_GATE.md → آخر Issue #16.

ثم تحقق live من main والفرع وGitHub Actions واقرأ كود/DB/API/Admin/tests للمرحلة الحالية. Code/migrations/executable evidence أعلى من prose، وأي جزء غير مفحوص = NOT YET VERIFIED.

آخر Runtime/Code verified هو `345e0712c45e9e4c0479dc65d96efc3fb7da33cd` عبر run `34430915626` (SUCCESS، Chromium 10/10). أي HEAD أعلى منه قد يكون توثيقًا فقط؛ تحقق قبل الحكم.

ابدأ من أول عنصر غير مكتمل: Stage13G G-C2 Reports / Settings / Security / Audit. افحص السلطات الحالية أولًا، لا تنشئ audit store أو settings authority مكررًا، ولا تعرض secrets. بعد الفهم نفّذ، اختبر، وثق، وحدّث Issue #16. بعد G-C2 انتقل إلى G-D ثم Stage13G closure.
```

إذا تعارض هذا Launcher مع Source of Truth أحدث، اتبع Source of Truth ثم حدّث هذا الملف.
