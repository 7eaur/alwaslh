# الوسيلة الذكية — Alwaseela Smart

> **المستودع هو ذاكرة المشروع الرسمية.** لا تعتمد على Chat history. ابدأ دائمًا من `DOCUMENTATION_INDEX.md` واتبع Source of Truth الحالي.

## المنتج

**الوسيلة الذكية** منصة تعليمية عربية تحول المحتوى الدراسي الموثوق إلى تجربة تعلم ومراجعة واختبار منظمة، مع إدارة كاملة للمنهج والمحتوى والوصول والذكاء الاصطناعي والأسئلة من جهة الإدارة.

الأسطح الحالية:

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin Web.
- `apps/api` — Fastify/TypeScript API والسلطة الوحيدة للمنطق التجاري والهوية والصلاحيات.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — عقود وهوية وprimitives مشتركة.

الملفات القديمة في root و`supabase/` تبقى parity/failure evidence فقط؛ الـruntime الجديد هو `apps/* + database/migrations/*`.

## الحالة الحالية — 2026-09-10

`main` integration baseline:

`3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

- Stage1–10: VERIFIED.
- OCR Foundation: VERIFIED.
- Stage11 AI contracts: VERIFIED.
- Stage12 durable AI execution: VERIFIED backend/runtime؛ live provider bootstrap ما زال `NOT YET VERIFIED`.
- Stage13A–D: VERIFIED.
- Stage13E Admin AI Operations / Review: VERIFIED / CLOSED.
- Stage13F Question Bank / Quiz Builder / Publish: **VERIFIED / CLOSED / PROMOTED TO MAIN**.
- Stage13G Remaining Admin Product: **ACTIVE على Track A**.
- Stage14 Student Product: **IN PROGRESS على Track B**.

Stage13F أُغلق على runtime `afbe552710b3f1cf79ee70594f691fa836c05a45` ثم closure checkpoint `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`؛ كلاهما اجتاز wider matrix **13/13 SUCCESS** عبر PRs #27/#28 verification-only المغلقة دون دمج.

## نموذج التنفيذ الحالي

المشروع يعمل بنموذج **Parallel Two-Track Execution**:

- **Track A** — Backend / Admin / DB / AI / generation / Question Bank / Quiz Builder / Stage13G؛ الفرع الحالي `integration/stage13g-admin-product`.
- **Track B** — Student Product Stage14+؛ الفرع `parallel/stage14-student-product`.
- Issue #16 هو execution ledger المشترك.
- `main` هو نقطة دمج العقود المتحققة بين المسارين.
- لا يجوز لأي Track إنشاء سلطة Auth/Access/Question Bank/AI/content/sync بديلة لتجنب الدمج.

اقرأ `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md` للتفاصيل. `SINGLE_OWNER_OPERATING_MODEL.md` تاريخي ومُلغى تشغيليًا.

## قواعد ثابتة

1. Correctness > Cleverness، Evidence > Assumptions.
2. لا Feature ذات قيمة تُحذف دون قرار Product Owner صريح.
3. Browser لا يملك canonical durable business state.
4. Full Code = 6 digits؛ Class Code = 7 digits.
5. Student returning login = password + registered P-256 device proof.
6. Curriculum = Class → Subject Offering → optional Section → Lesson.
7. source inventory = provenance وليس curriculum hierarchy.
8. `media ready != published`؛ النشر Draft → Review → Published.
9. raw AI/provider output لا يصبح Student/Question Bank authority تلقائيًا.
10. provider/network calls خارج long DB transactions؛ durable worker هو سلطة التنفيذ.
11. Build وحده لا يساوي PASS؛ استخدم lint/typecheck/unit/integration/PostgreSQL/browser حسب المرحلة.
12. أي شيء غير مفحوص أو غير منفذ = `NOT YET VERIFIED`.
13. Production deployment/cutover ليس عملًا حاليًا. أي preview/staging يحتاج أمر Product Owner صريح مستقل ولا يستبدل CI.

## البداية الإلزامية

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. `PROJECT_RESUME_SNAPSHOT.md`
6. `PROJECT_ENGINEERING_LOG.md`
7. `PROJECT_INTEGRATION_CONTINUITY.md`
8. `PROJECT_EXECUTION_QUEUE.md`
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
10. `docs/workstreams/PARALLEL_TWO_TRACK_OPERATING_MODEL.md`
11. latest Issue #16 comments/body
12. current `main`, current track branch, Actions, code/tests

`NEXT_CONVERSATION_PROMPT.md` launcher فقط وليس Source of Truth مستقلًا.
