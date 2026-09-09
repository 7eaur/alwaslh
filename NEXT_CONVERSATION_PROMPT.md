# NEXT CONVERSATION PROMPT

هذا Launcher فقط؛ الحالة الفعلية في المستودع.

```text
اعمل كالمسؤول الهندسي/التصميمي الكامل والوحيد عن `7eaur/alwaslh`. لا تعتمد على أي ذاكرة Chat سابقة.

ابدأ من المستودع بهذا الترتيب:
1) README.md
2) DOCUMENTATION_INDEX.md
3) PROJECT_HANDOFF.md
4) PROJECT_STATUS.md
5) PROJECT_RESUME_SNAPSHOT.md
6) PROJECT_ENGINEERING_LOG.md
7) PROJECT_INTEGRATION_CONTINUITY.md
8) PROJECT_EXECUTION_QUEUE.md
9) docs/product/CURRENT_PRODUCT_OVERRIDES.md
10) docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md
11) docs/integration/STAGE13E_PROMOTION_MANIFEST.md
12) آخر تعليقات GitHub Issue #16
13) PR #24 الحالي + checks/changed files
14) Stage13E workflows/code/migrations/tests الفعلية

تحقق live من main والفرع النشط وGitHub Actions قبل الحكم. Code/migrations/executable evidence هي السلطة. أي شيء غير مفحوص أو غير منفذ = NOT YET VERIFIED.

الاستضافة والنشر خارج النطاق بالكامل حتى يوفر Product Owner VPS ويعيد فتح النشر صراحة. لا تعمل على Render/Vercel/Railway ولا تجعل hosted runtime Stage gate.

المرحلة الحالية Stage13E. لا تبدأ Stage13F قبل إغلاق Stage13E إلا إذا غيّر Product Owner ترتيب المراحل صراحة.

الحالة عند آخر handoff:
- candidate branch: integration/stage13e-ai-operations
- executable candidate HEAD: e291c6bde3971845048bf8bcc4561b65d3c702e6
- Combined Gate run 34394580893: SUCCESS كامل، بما فيه real Chromium 5/5.
- Draft verification-only PR #24: MUST NOT BE MERGED.
- wider matrix: Stage9/10/OCR/11/12/13/13D backend+Admin/Full Rebuild/Stage13E Frontend كلها SUCCESS.
- الوحيد الأحمر: Stage13E Admin AI Operations standalone run 34395034000 / job 102612508570.
- API quality + clean migrations نجحت فيه؛ الفشل فقط في Verify Stage13E PostgreSQL contracts بسبب shell `unexpected EOF while looking for matching ')'`.
- root cause: `.github/workflows/stage13e-ai-operations.yml` stale؛ ما زال يتوقع contract قديم (3 constraints + 2 indexes) وفيه quote defect. المايغريشن الحالي فيه 4 review constraints بما فيها reject-note invariant، والـlatest-review index المكرر أزيل عمدًا. Combined workflow الصحيح مرّ على نفس DB contract.
- classification: CI workflow drift, not product/database failure. Tracking: CI-013E-009 P1.

أول مهمة:
1) قارن `.github/workflows/stage13e-ai-operations.yml` مع `.github/workflows/stage13e-integration.yml` و`database/migrations/0018_ai_admin_review.sql`.
2) أصلح فقط standalone DB assertion: shell quoting + current four constraints + current legitimate indexes، بدون إعادة فرض index المكرر وبدون تخفيف gates.
3) push على candidate branch ودع PR #24 يعيد wider matrix على exact new HEAD.
4) إذا كل wider workflows PASS، أغلق PR #24 unmerged.
5) أعد live-check latest main/candidate overlap، ثم اتبع STAGE13E_PROMOTION_MANIFEST.md لإنشاء promotion branch من أحدث main ونقل manifest files فقط.
6) شغّل Combined + wider matrix مرة ثانية على exact promotion HEAD.
7) فقط بعد PASS كامل: integrate Stage13E إلى main، حدّث Roadmap/Legacy Coverage/central docs + Issue #16 Closure Report، ثم ابدأ Stage13F.

لا تعمل merge/cherry-pick لتاريخ candidate المتباعد مباشرة. لا تستبدل central docs الحالية بنسخ أقدم من feature branch.

بعد كل batch حدث PROJECT_RESUME_SNAPSHOT.md وPROJECT_STATUS.md وPROJECT_HANDOFF.md وQueue/Continuity/Engineering Log والوثائق المتأثرة، ثم ارفع EXECUTION REPORT إلى Issue #16.
```

إذا تعارض هذا Launcher مع Source of Truth أحدث، اتبع المصدر الأعلى ثم حدّث هذا الملف.
