# CURRENT PRODUCT OVERRIDES — الوسيلة الذكية

> قرارات Product Owner الحالية تتقدم تشغيليًا على أي وثيقة أقدم متعارضة. الكود والمigrations والاختبارات التنفيذية تبقى Source of Truth للتنفيذ.

آخر تحديث: **2026-09-12**.

## PO-OVR-001 — Hosted inspection is now explicitly authorized

قرار تأجيل كل نشر سابقًا أصبح **SUPERSEDED جزئيًا** بقرار Product Owner اللاحق بدمج المشروع ونشر نسخة يمكن تجربتها على Railway.

الحالة الحالية:

- Railway inspection/dev stack **LIVE / VERIFIED**؛
- API + Admin + Student + PostgreSQL تعمل على Railway؛
- هذا لا يعني أن Stage27 Release Gate أو Stage28 Production Cutover مكتملان؛
- final production release/cutover يحتاج قرارًا وإغلاق gates المراحل اللاحقة.

تفاصيل التشغيل: `docs/operations/RAILWAY_LIVE_STATE.md`.

## PO-OVR-002 — قاعدة Supabase القديمة ليست مصدر تشغيل أو محتوى حالي

- لا تعتمد أي مرحلة حالية على legacy/Supabase database.
- `database/migrations/*` + current PostgreSQL tests هي سلطة قاعدة البيانات.
- Railway PostgreSQL هي قاعدة hosted runtime الحالية.
- مصدر المحتوى الحالي هو repository source/provenance (`7eaur/alwaslh-go`) وليس Supabase.
- لا تستورد أي صفوف/صور من Supabase إلا إذا أصدر Product Owner أمرًا صريحًا جديدًا.

## PO-OVR-003 — Repository Documentation هي ذاكرة المشروع الرسمية

ابدأ من:

`README.md → DOCUMENTATION_INDEX.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → CURRENT_PRODUCT_OVERRIDES.md → STAGE16_STUDENT_HANDOFF.md → RAILWAY_LIVE_STATE.md → LIVE_CONTENT_IMPORT_STATUS.md → Issue #16 → actual code/tests/actions`

## PO-OVR-004 — لا ترقيع أو تغطية للمشكلات

- لا تخفف test لإخفاء product defect.
- لا auth/validation bypass.
- لا duplicate durable authority.
- لا sleeps/timeouts عشوائية لإخفاء race.
- أصلح root cause في owning layer وأضف regression evidence.

## PO-OVR-005 — `main` هو Development Integration baseline

- `main` = آخر verified integration checkpoint مشترك.
- الفروع القصيرة فقط للعمل الجديد المعزول؛ لا تبدأ من فرع Stage قديم لمجرد أنه كان نشطًا سابقًا.
- لا force-push/rewrite للتاريخ المشترك.
- Feature غير منفذة أو غير مختبرة = `NOT YET VERIFIED`.
- قبل أي تعديل جديد: live-check `main`, Issue #16, Actions, Railway state if relevant.

Stage13G + current Student Product were integrated through PR #33, merge commit:

`5e22c3ff157b42b6da47febe205dd91fcb264eed`

PR #33 head `dcdae7579a40878c71f64593280a0df2f8363ee2` passed **19/19 workflows** before merge.

## PO-OVR-006 — المعمارية تبقى portable رغم وجود Railway

- Fastify API منفصل عن frontend builds.
- PostgreSQL authority عبر migrations/contracts واضحة.
- environment-driven configuration.
- frontend لا يصبح business authority.
- storage/provider abstractions تبقى قابلة للنقل.
- Railway إعداد تشغيل حالي، وليس سببًا لكتابة product logic خاص بالمنصة.

## PO-OVR-007 — Single Owner model — HISTORICAL

نموذج Single Owner القديم مرجع تاريخي فقط.

## PO-OVR-008 — Parallel Two-Track model — SUPERSEDED FOR NEW WORK

النموذج المتوازي Track A / Track B كان صحيحًا أثناء Stage13G وStage14–16 المتوازيين، لكنه لم يعد task-routing authority بعد الدمج الكامل في PR #33.

`docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md` يبقى مرجعًا تاريخيًا لفهم ملكية التغييرات السابقة والتعارضات، لا لبدء عمل جديد على فروع طويلة قديمة.

## PO-OVR-009 — Unified post-Stage13 continuation is the current model

**Current Product Owner Decision:** بعد إغلاق ودمج Stage13G، المسؤول الهندسي للمسار التالي يستلم **كل ما تبقى من المنتج بعد Stage13** ويكمل المراحل بالترتيب من baseline موحد في `main`.

المعنى العملي:

- Stage14 وStage15 مغلقتان ومتحققتان.
- Stage16 هي المرحلة النشطة الحالية.
- بعد Stage16 ينتقل نفس المسار إلى Stage17 ثم 18… حتى Stage29، مع تنفيذ shared API/Admin/DB work المطلوب في نفس المنتج عند الحاجة.
- لا تنشئ Backend أو Auth أو Question Bank أو Curriculum authority موازية بحجة أن العمل أصبح موحدًا؛ استخدم السلطات الحالية ووسعها من owning layer.
- عند بدء batch جديد، أنشئ short-lived branch من **live `main`** ثم ارجع verified work إلى `main` عبر CI/PR.
- الفروع `integration/stage13g-admin-product` و`parallel/stage14-student-product` تاريخية/مرجعية بعد دمج محتواها؛ لا تعتبرها baseline أحدث من `main`.

## PO-OVR-010 — Canonical content policy

- canonical source inventory/provenance: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.
- Stage9 proves 48 documents / 5,552 images as inventory; it does not imply all bytes are hosted.
- Grade 9 English is the first verified live byte-materialization proof: 75 source images → 75 ready media assets → 300 variants → 75 Draft lesson assets across 10 lessons.
- Imported content remains Draft until normal Admin review/publication.
- AI/question output never auto-publishes; use the existing AI review → Question Bank review/publish → Quiz snapshot chain.

Detailed content state: `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## PO-OVR-011 — Current priority order

1. Finish Stage16 safely on the unified `main` baseline.
2. In parallel only when it does not destabilize Stage16, review/publish the Grade 9 English Draft sample through normal Admin authority.
3. Close Stage16 with exact-head API/DB/Student/Chromium evidence.
4. Continue Stage17 → Stage25 sequentially.
5. Resolve `AI-012..AI-019` live provider readiness before final release if AI production behavior is required.
6. Execute Stage26–29 release/staging/cutover/monitoring gates before calling the product production-complete.
