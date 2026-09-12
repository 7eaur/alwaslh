# NEXT CONVERSATION PROMPT — MASTER RESUME

> هذا الملف هو الـcopy/paste launcher الرسمي للمحادثة الهندسية الجديدة. لا يعتمد على ذاكرة أي Chat سابقة. التفاصيل التنفيذية الكاملة موجودة في GitHub و`docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`.

انسخ النص التالي كاملًا إلى المحادثة الجديدة:

```text
اعمل كالمسؤول الهندسي والتصميمي الكامل عن مشروع «الوسيلة الذكية» في مستودع:

7eaur/alwaslh

أريدك أن تستلم المشروع كاملًا، وليس مهمة Stage16 فقط.

مهمتك هي:
1) تفهم فكرة المنتج والمستخدمين والأدوار والـBusiness Rules والـUser Flows بالكامل.
2) تفهم المستودع الفعلي: Frontend + Backend + Database + APIs + Auth + Authorization + State + Storage + AI + Media/OCR + Question Bank + Quiz Builder + Assessment + Offline/PWA + Tests + GitHub Actions + Railway + Content pipeline.
3) تسترجع تاريخ العمل والمراحل السابقة وما تم تنفيذه ودمجه واختباره ونشره من الأدلة الحقيقية.
4) تتأكد أن المراحل السابقة ما زالت صحيحة على current main، ولا تثق بكلمة VERIFIED بدون فحص كافٍ للكود والعقود والـCI الحالي.
5) تبحث عن gaps / regressions / security issues / architecture problems / UX problems / missing coverage / documentation drift.
6) تصلح أي مشكلة حقيقية من root cause في owning layer، ولا تكتب تقريرًا فقط.
7) تكمل من المكان الذي توقفنا عنده حاليًا، ثم تستمر في المراحل التالية بالتسلسل حتى اكتمال المشروع.
8) تختبر كل batch فعلًا وتوثق كل شيء أثناء العمل داخل المستودع وIssue #16.

لا تعتمد على ذاكرة أي محادثة. Source of Truth = current repository code + PostgreSQL migrations + executable tests/CI + live Railway state + Issue #16 + docs الحالية.

إذا تعارض prose مع code/CI/live evidence، اتبع code/CI/live evidence ثم أصلح التوثيق.
أي شيء لم تفحصه أو تنفذه = NOT YET VERIFIED.

========================
A. أول شيء — استرجاع كامل للمشروع
========================

قبل أي تعديل اقرأ بهذا الترتيب:

1. README.md
2. DOCUMENTATION_INDEX.md
3. docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md
4. PROJECT_HANDOFF.md
5. PROJECT_STATUS.md
6. PROJECT_RESUME_SNAPSHOT.md
7. PROJECT_ENGINEERING_LOG.md
8. PROJECT_INTEGRATION_CONTINUITY.md
9. PROJECT_EXECUTION_QUEUE.md
10. docs/product/CURRENT_PRODUCT_OVERRIDES.md
11. docs/workstreams/STAGE16_STUDENT_HANDOFF.md
12. docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md
13. docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md
14. docs/operations/RAILWAY_LIVE_STATE.md
15. docs/content/LIVE_CONTENT_IMPORT_STATUS.md
16. MASTER_REBUILD_ROADMAP.md
17. docs/product/LEGACY_FEATURE_COVERAGE_GATE.md
18. PRODUCT_FEATURE_PARITY_MATRIX.md
19. latest Issue #16 body/comments
20. live main HEAD + recent PRs/commits + GitHub Actions + Railway current services/deployments

ثم افتح actual source code، ولا تعتمد على الملفات التوثيقية فقط.

`docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md` إلزامي. نفذ منه Repository Discovery + Product/User Flows + Backend + Frontend + Database + Security + Performance + Tests + Deployment + Content audit بشكل منظم، لا sampling عشوائي.

لا تسألني عن معلومة موجودة في المستودع أو Issue #16 أو GitHub Actions أو Railway. ابحث عنها بنفسك.

========================
B. افهم فكرة المنتج قبل تعديل الكود
========================

«الوسيلة الذكية» منصة تعليمية عربية هدفها تحويل المحتوى الدراسي الموثوق إلى تجربة تعلم ومراجعة واختبار منظمة، مع Super Admin يدير المحتوى والوصول والوسائط والذكاء الاصطناعي والأسئلة والاختبارات والطلاب.

Student Product يجب أن يغطي بصورة متماسكة:
- activation/login/recovery/device؛
- entitlements/access codes؛
- classes/subjects/lessons؛
- protected Reader/media/text/OCR/search/TTS where supported؛
- Practice/Test/Models؛
- Offline/PWA؛
- لاحقًا Notes/Favorites/Needs Review؛
- notifications؛
- progress/statistics/private achievements.

Admin Product يجب أن يغطي:
- curriculum/content/media/OCR؛
- uploads/processing/publication؛
- AI jobs/review/authoring؛
- Question Bank؛
- Quiz Builder/versioning/regeneration/exports؛
- students/accounts/access codes/recovery؛
- notifications؛
- reporting/import/export؛
- settings/security/audit/operations.

السلطة الدائمة ليست في browser.
API/PostgreSQL هما السلطة للهوية والصلاحيات والمنهج والنشر والأسئلة والاختبارات والدرجات.

قواعد ثابتة:
- Full Code = 6 digits.
- Class Code = 7 digits.
- returning Student يحتاج password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- media ready != published.
- Student لا يرى محتوى غير Published/entitled.
- AI raw output لا يصبح authority تلقائيًا.
- AI review → Question Bank Draft → human QB review/publish → immutable Quiz version.
- assessment scoring/finalization server-owned.
- protected Reader/media server-authorized ولا يكشف raw storage keys.
- /v1 لا يدخل Service Worker Cache API.
- لا private signing key/session token/password/device private key في Student frontend/offline DB/docs.

إذا الكود الحالي يخالف قاعدة ثابتة، أصلحها حتى لو كان الكود “يعمل”.

========================
C. baseline الحالي / ماذا حدث سابقًا
========================

نموذج Track A / Track B المنفصل انتهى كطريقة تشغيل جديدة.

Stage13G + Student Product الحالي تم دمجهما في main عبر PR #33.

PR #33:
- verification head: dcdae7579a40878c71f64593280a0df2f8363ee2
- 19/19 workflows SUCCESS
- merge commit: 5e22c3ff157b42b6da47febe205dd91fcb264eed

Master handoff sync PR #36:
- documentation/handoff matrix: 15/15 workflows SUCCESS
- documented merge checkpoint: 6ee5ad9d0bde8faa690b9eb7a923a1c8a12687b4

لكن لا تفترض أن هذا هو HEAD الحالي؛ افحص live main أولًا.

لا تبدأ من:
- integration/stage13g-admin-product
- parallel/stage14-student-product

هذان historical/reference بعد الدمج.
العمل الجديد يبدأ من live main على short-lived branch.

الحالة المتوقعة للمراحل قبل live verification:
- Stage1–10 + OCR VERIFIED.
- Stage11 VERIFIED.
- Stage12 backend/runtime VERIFIED؛ AI-012..AI-019 live provider readiness ما زالت NOT YET VERIFIED.
- Stage13A–G CLOSED / VERIFIED / integrated.
- Stage14 CLOSED / VERIFIED.
- Stage15 CLOSED / VERIFIED.
- Stage16 Offline/PWA ACTIVE / NOT CLOSED.
- Stage17+ بعد Stage16.

لكن لا تعتبر CLOSED = ممنوع الفحص.
راجع current main implementation + contracts + migrations + latest successful CI لكل area بدرجة كافية.
إذا وجدت regression/gap حقيقيًا افتح finding وأصلحه.

========================
D. المطلوب منك في مراجعة المستودع السابق
========================

أريد مراجعة شاملة ومنظمة للمشروع، لا إعادة بناء عشوائية.

افحص على مراحل:

1. Repository Discovery
2. Product & User Flows
3. Backend
4. Frontend
5. Database
6. UX/UI & Design System
7. Security
8. Performance
9. Tests & Quality
10. Deployment / Railway
11. Content / publication / questions
12. Architecture Decision

في كل جزء اسأل:
- هل المنطق صحيح؟
- هل السلطة في المكان الصحيح؟
- هل يوجد duplicate state/authority؟
- هل يوجد missing validation/authorization؟
- هل API contract واضح؟
- هل DB integrity تحمي السلوك؟
- هل transaction/idempotency/concurrency صحيحة؟
- هل UX واضح للمستخدم؟
- هل loading/error/empty/offline/session-expired states موجودة؟
- هل responsive/RTL/a11y جيدة؟
- هل يوجد slow query/N+1/unnecessary requests/re-renders/bundle debt مثبت؟
- هل test فعلي يغطي critical outcome؟
- هل docs تطابق التنفيذ؟

صنف الأجزاء:
KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE.

لا تعمل blind rewrite.
لا تعمل overengineering.

لكل مشكلة مهمة سجل:
ID / Severity P0-P3 / Area / Problem / Evidence / Impact / Root Cause / Solution / Status.

P0/P1 correctness/security/data-integrity gaps التي تؤثر على المسار الحالي تُصلح قبل توسيع feature تعتمد عليها.

========================
E. Stage16 — أين توقفنا فعليًا
========================

المنفذ والمتحقق حاليًا في Offline/PWA يتضمن:
- safe PWA shell؛
- /v1 خارج SW cache؛
- bounded server-issued lease مربوط profile/device/session/entitlement/PostgreSQL time؛
- account/device IndexedDB lifecycle؛
- explicit protected lesson manifest/assets؛
- Published + entitled issuance only؛
- exact byte-size + SHA-256 validation؛
- 64 MiB per lesson / 256 MiB per scope budget؛
- atomic package storage/replacement/removal؛
- server P-256/ES256 signed offline authorization envelope؛
- Student keyId/public-key/signature/canonical-manifest verification before storage؛
- real Chromium tampered-manifest rejection.

Stage16 run على PR #33 head:
34560999667 — all Stage16 jobs SUCCESS.

Stage16 ليست مغلقة.

المتبقي المتوقع بالترتيب — راجع PROJECT_EXECUTION_QUEUE.md live قبل التنفيذ:

1. durable non-secret active offline scope يعيش عبر true browser restart؛ الحالي sessionStorage فقط.
2. re-verify stored signed ES256 envelope وقت offline use/render، وليس فقط وقت download.
3. derive trusted metadata من signed payload وارفض stored-field mismatch.
4. re-hash stored blobs وقت القراءة وقارن byte size + SHA-256 مع signed manifest.
5. true cold-start offline library/Reader:
   download online → close/restart browser → network unavailable → PWA shell → discover scope/package → verify auth/blobs → render.
6. real Chromium fail-closed cases:
   signature tamper / field tamper / blob tamper / expiry / backward clock / wrong profile/device.
7. reconnect revalidation:
   session/device/entitlement/publication/content revision → purge/disable invalid/revoked/expired/unpublished content.
8. authoritative revision writers + tombstones + bounded server cursor/delta + client application.
9. bounded outbox فقط إذا later product-authorized offline writes تحتاجه، مع stable IDs/idempotency/retry/conflict semantics.
10. exact-head Stage16 closure: lint/typecheck/unit/build/API/clean PostgreSQL/real Chromium/wider regression/a11y/responsive/docs/Issue #16.
11. بعد Stage16 فقط ابدأ Stage17.

أول incomplete item المتوقع حاليًا: STUDENT-016H.

========================
F. بعد Stage16 لا توقف المشروع
========================

بعد إغلاق Stage16 استمر بالتسلسل:

Stage17 — Personal Learning Data: Notes/Favorites/Needs Review.
Stage18 — Notifications: In-App + Web Push where supported + secure lifecycle/quiet hours/opt-out.
Stage19 — Progress / Statistics / Achievements.
Stage20 — Import / Export / Reporting closure.
Stage21 — Performance Engineering.
Stage22 — Security Hardening.
Stage23 — Automated Tests & CI Expansion.
Stage24 — Accessibility / Device QA.
Stage25 — Initial Data / Content Load.
Stage26 — Staging.
Stage27 — Release Gate.
Stage28 — Production Cutover.
Stage29 — Monitoring & Operations.

لا تعتبر المشروع مكتملًا حتى يمر Release Gate وتغلق valuable legacy parity أو توثق explicit Product Owner-approved removals.

========================
G. Railway / النشر الحالي
========================

يوجد hosted inspection/dev stack على Railway:

Student:
https://alwaslh-dev-student-7eaur-production.up.railway.app

Admin:
https://alwaslh-dev-admin-7eaur-production.up.railway.app

API:
https://alwaslh-dev-api-7eaur-production.up.railway.app

آخر حالة موثقة: API/Admin/Student/PostgreSQL SUCCESS.

API contract الحالي:
- apps/api/Dockerfile
- pre-deploy migrations
- start node apps/api/dist/server.js
- /ready healthcheck
- persistent media volume /app/runtime-data/media

اقرأ docs/operations/RAILWAY_LIVE_STATE.md وافحص live Railway قبل أي تغيير.

اسم environment = production لا يعني أن Stage28 Production Cutover مكتمل.
هذه استضافة فحص/تجربة حالية حتى Release Gate.

لا تكشف secrets أو values من environment variables في docs أو replies.

========================
H. المحتوى الحالي
========================

canonical source الحالي:
7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23

Stage9 inventory:
48 documents / 5,552 images.

live materialized proof الحالي فقط Grade 9 English:
- 75 source images
- 8,390,689 bytes
- 75 ready media assets
- 300 media variants
- 75 Draft lesson assets
- 10 lessons

هذه Draft فقط وغير ظاهرة للطالب حتى normal Admin review/publish.

bootstrap لم يولد أو ينشر أسئلة تلقائيًا.

Supabase القديمة خارج scope الحالي؛ لا تستورد منها شيء بدون Product Owner override جديد.

لا تعمل bulk 5,552 images مباشرة.
قبل full content load:
- verify mappings على عينات ممثلة؛
- احسب storage requirement؛
- افحص/وسع media volume عند الحاجة؛
- import idempotently؛
- review/publish through canonical authority؛
- verify Student Reader.

يمكن مراجعة/نشر Grade9 English sample كbatch منفصل عن Stage16.

========================
I. AI / Question Bank / Quiz rules
========================

Stage13G AI authoring موجود ومندمج:
- lesson generation؛
- quiz version generation؛
- question regeneration؛
- AI review؛
- Question Bank Draft/Review/Published؛
- Quiz Builder immutable versions؛
- specialized exports.

لا تنشئ AI chat عام أو authority موازية.
لا auto-publish AI outputs.

السلسلة الصحيحة:
AI output → human AI review → Question Bank Draft → QB review/publish → immutable Quiz version.

AI-012..AI-019 live provider/model/routes/credentials/bootstrap ما زالت NOT YET VERIFIED حتى يوجد live evidence حقيقي.

========================
J. طريقة التنفيذ
========================

بعد الاسترجاع والفحص:

1. لا تكتفِ بتقرير؛ نفذ الإصلاحات.
2. ابدأ من live main وأنشئ short-lived branch.
3. افهم callers/inputs/outputs/dependencies/side effects قبل التعديل.
4. أصلح root cause في owning layer.
5. حافظ على contracts الحالية قدر الإمكان.
6. لا fake API / auth bypass / test weakening / random sleep / race masking.
7. لا duplicate durable authority.
8. لا client-owned canonical business state.
9. لا تغير Business Rule بلا دليل وقرار موثق.
10. بعد كل batch شغل المناسب من:
   lint / strict typecheck / unit / integration / clean PostgreSQL / build / real Chromium / responsive / a11y / wider regression.
11. build وحده ليس PASS.
12. سجل exact SHA + workflow/run IDs.
13. ادمج فقط بعد evidence مناسب.
14. تابع للـbatch التالي بدل التوقف بعد أول إصلاح.

إذا فشل test:
- حدد هل هو product defect أم test defect.
- لا تخفف assertion لمجرد تمرير CI.

========================
K. التوثيق إلزامي أثناء العمل
========================

حافظ محدثًا حسب ما يتغير فعليًا على:

PROJECT_ENGINEERING_LOG.md
PROJECT_STATUS.md
PROJECT_HANDOFF.md
PROJECT_RESUME_SNAPSHOT.md
PROJECT_INTEGRATION_CONTINUITY.md
PROJECT_EXECUTION_QUEUE.md
current stage/workstream docs
MASTER_REBUILD_ROADMAP.md
PRODUCT_FEATURE_PARITY_MATRIX.md / LEGACY_FEATURE_COVERAGE_GATE.md عند تغير parity evidence
docs/operations/RAILWAY_LIVE_STATE.md عند تغير deployment
docs/content/LIVE_CONTENT_IMPORT_STATUS.md عند تغير content
NEXT_CONVERSATION_PROMPT.md عند تغير نقطة الاستئناف
Issue #16 بعد كل meaningful batch

لا تترك أي continuation-critical information داخل Chat فقط.

في Issue #16 أضف EXECUTION REPORT يحتوي:
- Stage/Feature
- branch/exact HEAD
- inspected source of truth
- gaps/findings
- implementation
- architecture/contracts/schema/UI changes
- root cause/fix
- exact tests/run IDs
- security/performance/UX/a11y review
- Railway/content impact
- known issues
- NOT YET VERIFIED
- docs updated
- decision
- exact next action

========================
L. أول تصرف لك الآن
========================

لا تبدأ برد نظري طويل ولا تقل فقط “فهمت المشروع”.

نفذ فعليًا في نفس المهمة:

1. اقرأ الملفات الإلزامية وUNIFIED_PROJECT_RESUME_PROTOCOL.md.
2. افحص live main + Issue #16 + Actions + Railway.
3. كوّن project map من actual source code.
4. راجع المراحل السابقة والـcontracts القريبة من current work بما يكفي لاكتشاف gaps الحقيقية.
5. وثق أي finding مثبت.
6. أصلح أي P0/P1 متعلق بالمسار الحالي بدل تجاهله.
7. ثم ابدأ أول incomplete item في PROJECT_EXECUTION_QUEUE.md، والمتوقع حاليًا STUDENT-016H.
8. اختبر، وثق، ادمج عند نجاح gates، ثم تابع للbatch التالي.

المطلوب منك أن تستلم المشروع كاملًا وتكمله، لا أن تنتظر مني كل مرة أقول “اكمل”.
استمر حسب queue والRoadmap بعد كل batch طالما لا يوجد blocker حقيقي أو قرار Product Owner جديد.
```

إذا تعارض أي سطر في هذا الـPrompt مع live repository/CI/Railway evidence أحدث، اتبع الدليل الأحدث ثم حدّث هذا الملف وSource of Truth.
