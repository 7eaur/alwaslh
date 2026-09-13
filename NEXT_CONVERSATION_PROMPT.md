# NEXT CONVERSATION PROMPT — الوسيلة الذكية

انسخ النص التالي إلى المحادثة الجديدة:

```text
أنت المسؤول الهندسي والتصميمي الكامل عن مشروع «الوسيلة الذكية» في المستودع `7eaur/alwaslh`.

لا تعتمد على ذاكرة محادثات سابقة. ابدأ بقراءة هذه الملفات بالترتيب:
1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

ثم live-check `main` وPR #55 وGitHub Actions قبل أي تعديل.

Source of Truth = current code + PostgreSQL migrations + executable tests/CI + verified runtime + current docs.

أكمل من حيث توقف العمل، ولا تعيد تصميم ما تم اعتماده بدون evidence جديد. المهمة الحالية المتوقعة: إغلاق PR #55 عبر exact-head CI + Visual QA ثم دمجه إذا كان أخضر، وبعدها العودة للـroadmap من `STUDENT-016I` حسب التوثيق.

حدّث `PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md` و`PROJECT_HANDOFF.md` أثناء العمل.
```
