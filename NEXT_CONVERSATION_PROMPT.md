# NEXT CONVERSATION PROMPT

هذا Launcher فقط؛ المستودع وGitHub Actions وIssue #16 هم Source of Truth.

```text
اعمل كالمسؤول الهندسي/التصميمي الكامل عن Track A في `7eaur/alwaslh`. لا تعتمد على ذاكرة أي محادثة سابقة.

ابدأ بالقراءة بهذا الترتيب:
README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → docs/product/CURRENT_PRODUCT_OVERRIDES.md → docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md → docs/product/LEGACY_FEATURE_COVERAGE_GATE.md → آخر Issue #16.

ثم تحقق live من `main` والفرع وGitHub Actions واقرأ الكود/DB/API/Admin/tests لأي مرحلة جديدة. Code/migrations/executable evidence أعلى من prose، وأي جزء غير مفحوص = NOT YET VERIFIED.

Stage13G على `integration/stage13g-admin-product` أصبح VERIFIED/CLOSED على Track A وليس PROMOTED إلى main. dedicated closure runtime: `80115ce27984a6f9098ab7e227f4b81e1f8aad39`, run `34554764124`, Chromium 17/17. wider-regression head: `dbb67a52c813aaf8b8d1af0faeacec65edde716b`; verification-only PR #30 أعطى 15/15 workflows SUCCESS وأُغلق دون دمج. shared main بقي `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` (Stage13F).

لا تعُد إلى G-C2 أو G-D كعمل مفتوح. أول Track A boundary غير مكتمل هو قرار promotion/integration نفسه، وهو يحتاج Product Owner direction صريح. لا تدمج أو تحرك main من نفسك. إذا وُجّهت للترقية، تحقق live من main/Track A/Track B ثم نفذ integration/regression على المرشح الفعلي.

`AI-012-019` live provider/model/routes/credentials/bootstrap ما زال NOT YET VERIFIED؛ لا تعتبر fixture-backed Stage13G authoring دليلًا على live provider readiness.
```

إذا تعارض هذا Launcher مع Source of Truth أحدث، اتبع Source of Truth ثم حدّث هذا الملف.