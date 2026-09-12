# الوسيلة الذكية — Alwaseela Smart

> **المستودع هو ذاكرة المشروع الرسمية.** لا تعتمد على ذاكرة محادثات سابقة. ابدأ دائمًا من `DOCUMENTATION_INDEX.md` واتبع Source of Truth الموجود هناك.

## فكرة المنتج

**الوسيلة الذكية** منصة تعليمية عربية لتحويل محتوى دراسي موثوق إلى تجربة تعلم، قراءة، مراجعة، تدريب واختبار منظمة، مع Super Admin لإدارة المنهج والمحتوى والوصول والذكاء الاصطناعي وبنك الأسئلة والتقارير والتدقيق.

المنتج الحالي مبني حول:

- `apps/student-web` — Student Web/PWA؛
- `apps/admin-web` — Super Admin؛
- `apps/api` — Fastify/TypeScript API والسلطة التجارية؛
- `database/migrations` — PostgreSQL source of truth؛
- `packages/*` — shared domain/design/validation primitives.

ملفات legacy في root/Supabase ليست runtime authority للمنتج الجديد إلا كمرجع تاريخي/parity evidence.

## الوضع الحالي — 2026-09-12

### التكامل

Stage13G Admin/Backend/AI + Student Stage14/15/current Stage16 تم دمجها في `main` عبر PR #33 بعد **19/19 workflows SUCCESS** على head `dcdae7579a40878c71f64593280a0df2f8363ee2`.

Merge commit:

`5e22c3ff157b42b6da47febe205dd91fcb264eed`

الفروع الطويلة القديمة `integration/stage13g-admin-product` و`parallel/stage14-student-product` أصبحت historical/reference بعد الدمج. **أي عمل جديد يبدأ من live `main` على short-lived branch.**

### المرحلة النشطة

- Stage14 Student — CLOSED / VERIFIED.
- Stage15 Practice/Assessment — CLOSED / VERIFIED.
- **Stage16 Offline/PWA — ACTIVE / NOT CLOSED.**
- Stage17+ ينتظر إغلاق Stage16.

Stage16 الحالي يتضمن بالفعل:

- safe PWA shell؛
- server-issued bounded offline lease؛
- account/device-scoped IndexedDB؛
- protected lesson download manifest/assets؛
- checksum + exact byte-size verification؛
- 64 MiB lesson / 256 MiB scope budgets؛
- atomic replacement/cleanup؛
- server-signed ES256 offline authorization envelope؛
- client verification of key ID/signature/canonical signed manifest before storage.

ما يزال غير مكتمل في Stage16:

- durable non-secret active scope across a real browser restart؛
- cold-start offline Reader من stored package؛
- re-verification of signed authorization + blob checksum **at read/use time**؛
- reconnect session/device/entitlement/publication/revision revalidation + purge؛
- authoritative revision/tombstone/cursor/delta/outbox wiring؛
- exact-head Stage16 closure gate.

التفاصيل: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## Railway — live inspection/dev stack

النسخة المدمجة تعمل حاليًا على Railway:

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

API/Admin/Student/PostgreSQL كلها آخر حالة معروفة **SUCCESS**. API يستخدم PostgreSQL وmedia volume دائم، و`/ready` اجتاز HTTP 200 بعد تجربة استيراد المحتوى.

هذه بيئة inspection/dev حية وليست إعلان Stage28 final production cutover.

التفاصيل: `docs/operations/RAILWAY_LIVE_STATE.md`.

## المحتوى الحالي

المصدر الكانوني الحالي للمحتوى هو:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Stage9 يثبت inventory كاملًا: **48 documents / 5,552 images**، لكنه لا يعني أن جميع bytes تم نشرها.

تم تنفيذ proof حي لمادة **إنجليزي الصف التاسع** فقط:

- 75 source images؛
- 8,390,689 bytes؛
- 75 ready media assets؛
- 300 media variants؛
- 75 lesson assets؛
- 10 lessons؛
- كلها **Draft** ولم تُنشر للطالب تلقائيًا.

Supabase القديمة ليست مصدر المحتوى الحالي ولم يتم استيرادها بعد قرار Product Owner بإيقاف ذلك المسار.

التفاصيل: `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## قواعد لا يجوز كسرها

1. Correctness > Cleverness؛ Evidence > Assumptions.
2. `main` المدمج هو baseline؛ لا تبدأ من branch تاريخي دون سبب موثق.
3. Browser لا يملك canonical Auth/Access/Curriculum/Question Bank/Assessment authority.
4. `media ready != published`؛ Student يرى Published + entitled فقط.
5. AI output لا يصبح سؤالًا منشورًا تلقائيًا؛ المسار الآمن: AI review → Question Bank review/publish → immutable Quiz snapshot.
6. `/v1` لا يدخل Service Worker Cache API.
7. لا secrets/private signing keys في Student frontend أو docs.
8. لا test weakening/auth bypass/fake API/duplicate authority/random sleeps.
9. old Supabase ليست runtime dependency أو content source حاليًا.
10. أي شيء غير منفذ/مختبر = `NOT YET VERIFIED`.
11. Railway hosting لا يعني اكتمال Stage27/28 release gates.

## ما بقي من المنتج

الترتيب الحالي:

`Stage16 closure → Stage17 Personal Learning → Stage18 Notifications → Stage19 Progress/Statistics/Achievements → Stage20 Import/Export/Reporting closure → Stage21 Performance → Stage22 Security → Stage23 Tests/CI → Stage24 Accessibility/Device QA → Stage25 Initial Content Load → Stage26 Staging → Stage27 Release Gate → Stage28 Production Cutover → Stage29 Monitoring/Operations`

`AI-012..AI-019` live AI provider/model/routes/credentials/bootstrap ما زالت `NOT YET VERIFIED` ويجب إثباتها قبل release إذا كان AI live behavior ضمن النسخة النهائية.

## ابدأ من هنا

1. `DOCUMENTATION_INDEX.md`
2. `PROJECT_HANDOFF.md`
3. `PROJECT_STATUS.md`
4. `PROJECT_RESUME_SNAPSHOT.md`
5. `PROJECT_ENGINEERING_LOG.md`
6. `PROJECT_INTEGRATION_CONTINUITY.md`
7. `PROJECT_EXECUTION_QUEUE.md`
8. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
9. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
10. `docs/operations/RAILWAY_LIVE_STATE.md`
11. `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
12. latest Issue #16 comments
13. live `main`, GitHub Actions and Railway state before any modification.

`NEXT_CONVERSATION_PROMPT.md` هو launcher جاهز للمحادثة الجديدة، لكنه لا يتقدم على live repository/CI evidence.
