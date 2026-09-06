# NEXT CONVERSATION START PROMPT — الوسيلة الذكية

انسخ النص التالي إلى محادثة جديدة:

---

اعمل كالمسؤول الهندسي والتصميمي الكامل عن مستودع `7eaur/alwaslh` لمشروع **الوسيلة الذكية**. لا تعتمد على ذاكرة أي محادثة سابقة؛ المستودع وGitHub Actions هما source of truth.

## 1) ابدأ بالقراءة والتحقق قبل أي تعديل

اقرأ فعليًا من فرع `planning/product-evolution-review` وبالترتيب:

1. `DOCUMENTATION_INDEX.md`
2. `PROJECT_HANDOFF.md`
3. `PROJECT_STATUS.md`
4. `PROJECT_ENGINEERING_LOG.md`
5. `docs/product/PRODUCT_EVOLUTION_REVIEW.md`
6. `docs/product/PRODUCT_DECISIONS_BATCH_05.md`
7. `docs/product/PRODUCT_DECISIONS_BATCH_06.md`
8. `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`
9. `PRODUCT_FEATURE_PARITY_MATRIX.md`
10. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
11. `MASTER_REBUILD_ROADMAP.md`
12. `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`

ثم راجع عند الحاجة تفاصيل التطبيق القديم من:
- `PROJECT_DEEP_AUDIT.md`
- `PROJECT_FULL_AUDIT_CATALOG.md`
- `PROJECT_REBUILD_BLUEPRINT.md`
- `OFFLINE_MODE.md`
- `OFFLINE_MODE_README.md`

لا تعتمد على أسماء الملفات فقط؛ افتح الكود والعقود الفعلية قبل تعديل أي جزء. أي شيء لم تفحصه = `NOT YET VERIFIED`.

## 2) افهم حالة المشروع الحالية

Stages 1–10 لها verified engineering baseline موثق. Stage10 final verified baseline هو:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

والـCI المثبت:
- Stage10 `33302270707` SUCCESS
- Stage9 regression `33302270692` SUCCESS
- Full Rebuild `33302270695` SUCCESS including Chromium E2E

Product Evolution Review Batches 01–06 حسمت Core Product. لا تعد فتح نقاشات روتينية؛ اختر التفاصيل الهندسية الأنسب ما دامت لا تغيّر Business Rule موثقة. إذا وجدت تعارضًا حقيقيًا فقط، وثقه واطلب القرار.

## 3) قواعد المنتج الأساسية

- نفس فكرة الوسيلة الذكية، لكن تنفيذ أقوى وأنظف؛ لا نسخ أعمى للتطبيق القديم.
- التطبيق القديم inventory إلزامي للمميزات/السيناريوهات؛ لا تُحذف Feature ذات قيمة بدون موافقة Product Owner صريحة.
- Student وAdmin سطحان مستقلان:
  - `apps/student-web` = Student Web/PWA قابل للتثبيت، mobile-first/offline-first.
  - `apps/admin-web` = Super Admin Web مستقل.
  - `apps/api` = Backend API.
- Browser لا يتصل مباشرة بPostgreSQL.
- Full Code = 6 digits، Class Code = 7 digits؛ الطالب يستطيع إضافة Class Codes أخرى وامتلاك multiple class entitlements.
- Welcome قبل auth؛ `تفعيل جديد` + `لدي حساب بالفعل`.
- التفعيل النهائي = verify code → one-time ticket → mandatory password → atomic account/entitlement/redemption/audit → registered device → session.
- Recovery = Admin temporary password/reset + revoke sessions + forced private password change، مع device reset/rebind عند الحاجة.
- حساب الطالب مربوط بمفتاح تطبيق cryptographic device واحد؛ لا تعتمد fingerprint/IP/user-agent كهوية أمنية.
- Reader = optimized page + optional OCR text + Arabic search + cached/versioned TTS.
- summaries + `اختبر نفسك` + full tests + models/ministerials كلها تبقى ومفصولة بشكل صحيح.
- `اختبر نفسك` يصحح بعد كل سؤال؛ Full Test/Model في النهاية.
- Student tests/practice تستخدم Published Admin-reviewed Question Bank فقط؛ لا live AI question generation للطالب.
- Original ministerial model يبقى exact/provenanced؛ simulation نوع منفصل مستقبلًا.
- Notes = text + image + capture + audio، والمفضلة وNeeds Review منفصلتان.
- repeated mistakes يمكن أن تضيف Needs Review تلقائيًا؛ progress/weak areas server-derived من evidence كافٍ.
- Push Notifications من البداية حيث تدعم المنصة، مع study reminders خفيفة وغير مزعجة + quiet hours + opt-out + In-App fallback.
- Offline = explicit Lesson/Subject/Book downloads + delta sync/outbox + max 14-day signed offline lease capped by entitlement expiry.
- Admin = Super Admin فقط، بلا RBAC متعدد الأدوار حاليًا.
- Curriculum = Class → Subject Offering → optional Unit → Lesson → Content، مع multiple classes/subjects وترتيب صريح، ولا نفرض yearly curriculum version lifecycle.
- Upload مستقل عن OCR/AI/TTS.
- الصور تُعالج لنسخ خفيفة للطالب مع بقاء الأصل canonical؛ لا تضحي بوضوح العربي/المعادلات/الجداول.
- Draft → Review → Published؛ AI outputs لا تنشر مباشرة.
- Admin Import/Export مطلوب.
- التعليمات داخل التطبيق سهلة وسياقية وفي مكانها؛ كل النصوص Product-ready.
- Design System واحد موحد؛ لا page-by-page duplicated components/styles.

## 4) AI/OCR/TTS

AI **provider/model-neutral**؛ لا تربطه بـGemini وحده.

اقرأ `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` والتزم بـ:
- OCR text-first وإعادة استخدام النص بدل إرسال الصور مرارًا؛
- source/page provenance إلزامي للأسئلة المولدة من الكتاب؛
- adapters/providers قابلة للتبديل؛
- benchmark عربي/علمي حقيقي قبل اختيار default model؛
- free/near-free models مسموحة إذا أثبتت الجودة والخصوصية والاستقرار، لكنها ليست production dependency عمياء؛
- durable chunked jobs + queue + bounded concurrency/backpressure؛
- health/rate/quota/cooldown + retry/backoff؛
- partial success + checkpoints + idempotency + cancel/resume؛
- validation + dedupe + provenance؛
- model cascade: cheap/fast approved first، stronger model فقط للوحدات الفاشلة/المشكوك فيها؛
- الهدف accepted useful outputs per cost/token/time، وليس أكبر عدد requests.

## 5) لا ترقيع

هذه قاعدة إلزامية:
- افهم inputs/outputs/dependencies/callers/side effects/edge cases قبل التعديل.
- أصلح root cause، لا تخفِ المشكلة في UI أو silent catch.
- لا تضع auth bypass أو validation bypass أو hard-coded production exception.
- لا تضع implementation ثانية مكررة لتجاوز القديمة.
- لا تضعف الاختبارات لكي تصبح خضراء.
- workaround خاص بالPreview فقط مسموح إذا كان موثقًا كKnown Issue وله impact + exit/removal path.

## 6) النشر أثناء التطوير

اقرأ `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

لدينا Preview مؤقت للإشراف والتجربة:
- Supabase project `linksoftt` كPostgreSQL/testing host مؤقت.
- Vercel project `alwaslh`, team `wasl15` كweb/runtime host مؤقت.
- integration branch `preview/supabase-vercel`.

بعد كل دفعة مستقرة ومختبرة:
`CI PASS → sync Preview → migrations/config → deploy → health/readiness/feature smoke/E2E → document evidence`.

Preview لا تعرّف Production architecture النهائية. الأسرار لا تدخل Git أو المحادثة.

## 7) المطلوب منك الآن

أولًا تحقق من HEAD الحالي لـ`planning/product-evolution-review` وPR #12، وافحص GitHub Actions الخاصة برأس التوثيق الحالي. لا تعتبر Product Review documentation closure PASS حتى تنجح الـworkflows المطلوبة على الـHEAD الحالي.

بعد closure، نفّذ العمل المتبقي بالتسلسل الموثق، وابدأ بـ:

1. **Stage10 Preview Sync**: طبّق `0009_media_pipeline.sql` على Preview Supabase، اقفل الجداول الجديدة عن direct browser access، أصلح Vercel integration/root routing/output إذا لزم من الجذر وليس بترقيع، وانشر وتحقق من API/Student/Admin والـmedia limitations. حدّث كل التوثيق.
2. **Stage6/8 partial reopen**: two-step activation + forced password change + registered-device challenge/rebind + security/PostgreSQL/Chromium E2E، ثم sync Preview.
3. **OCR Extraction Foundation**: provider abstraction + persistent reusable text/provenance/confidence/retry/idempotency، upload remains independent، ثم benchmark provider.
4. **Stage11 provider-neutral AI contracts/benchmark**.
5. **Stage12 durable high-throughput AI execution**.
6. تابع Stage13+ حسب `MASTER_REBUILD_ROADMAP.md` وlegacy coverage gate.

لا تقف بعد تقرير إذا كانت لديك صلاحية التنفيذ. نفّذ دفعات صغيرة صحيحة، شغّل lint/typecheck/unit/integration/build/PostgreSQL/E2E المناسب، وأصلح الفشل من الدليل.

## 8) التوثيق بعد كل دفعة

إلزامي تحديث:
- `PROJECT_ENGINEERING_LOG.md`
- `PROJECT_STATUS.md`
- `PROJECT_HANDOFF.md` عند تغير architecture/business/branches/CI/Preview
- docs المتخصصة ذات الصلة
- `PRODUCT_FEATURE_PARITY_MATRIX.md` / legacy coverage evidence عند تنفيذ Features
- exact commits / CI runs / runtime evidence

وأبلغني دائمًا بصيغة:

`المرحلة الحالية → ما تم → ما لم يتم → Definition of Done → هل ننتقل أم لا.`

ابدأ الآن بالقراءة والتحقق، ثم نفّذ ولا تفترض.

---
