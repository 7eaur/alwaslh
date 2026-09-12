# UNIFIED PROJECT RESUME PROTOCOL — الوسيلة الذكية

> هذا الملف هو بروتوكول الاستئناف الكامل لأي محادثة هندسية جديدة. الهدف أن تستطيع فهم المشروع والمستودع والتاريخ التنفيذي بسرعة وبشكل صحيح، ثم مراجعة الفجوات والاستمرار في التنفيذ بدون الاعتماد على ذاكرة Chat سابقة.

Last synchronized: **2026-09-12**.

## 1. المهمة

اعمل كالمسؤول الهندسي والتصميمي الكامل عن `7eaur/alwaslh` كمنتج حقيقي سيستمر تشغيله وصيانته وتطويره.

المطلوب ليس قراءة التوثيق وتصديقه، ولا كتابة تقرير فقط. المطلوب:

1. استرجاع فكرة المنتج، المستخدمين، الأدوار، Business Rules، الـUser Flows والنتائج المتوقعة.
2. فهم المعمارية الفعلية من الكود والمigrations والاختبارات والتشغيل، لا من أسماء الملفات فقط.
3. استرجاع تاريخ المراحل والمهام السابقة وما تم تنفيذه ودمجه واختباره ونشره.
4. إعادة فحص المراحل المغلقة بدرجة كافية للتأكد من عدم وجود gaps خطيرة أو contracts متناقضة.
5. تصنيف أي gap أو technical/product debt حسب الأثر والدليل.
6. إصلاح المشاكل الحقيقية في owning layer مع الحفاظ على نفس المنتج وBusiness Rules.
7. الاستمرار من المرحلة الحالية بالترتيب وعدم إعادة بناء ما لا يحتاج إعادة بناء.
8. تشغيل الاختبارات التنفيذية المناسبة بعد كل batch.
9. تحديث Source of Truth وIssue #16 أثناء العمل، لا في النهاية فقط.

المبدأ: **Repository + code + migrations + executable tests/CI + live infrastructure evidence > prose > chat memory.**

أي شيء لم يتم فتحه أو التحقق منه = `NOT YET VERIFIED`.

---

## 2. فكرة المنتج التي يجب فهمها قبل الحكم على الكود

**الوسيلة الذكية** منصة تعليمية عربية تنظم المحتوى الدراسي الموثوق إلى تجربة تعلم ومراجعة واختبار آمنة، مع إدارة كاملة للمحتوى والوصول من جهة الإدارة.

### المستخدمون الرئيسيون

- **Student**: تفعيل/دخول آمن، الوصول حسب entitlement، تصفح الصفوف والمواد والدروس، Reader، محتوى ووسائط، تدريب واختبارات، Offline/PWA، ثم لاحقًا بيانات التعلم الشخصية والإشعارات والتقدم.
- **Super Admin**: إدارة المنهج والمحتوى والوسائط/OCR، AI review/authoring، Question Bank، Quiz Builder، الطلاب والأكواد والاسترداد، notifications، import/export/reporting، settings/security/audit/operations.

### الأسطح التنفيذية الحالية

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin Web.
- `apps/api` — Fastify + TypeScript authoritative backend.
- `database/migrations` — PostgreSQL schema/integrity source of truth.
- `packages/*` — shared brand/domain/validation/contracts where used.

### سلطة البيانات والمنطق

المتصفح ليس authority للهوية أو الصلاحيات أو النشر أو الدرجات أو Question Bank. السلطة الأساسية تبقى API/PostgreSQL.

قواعد ثابتة لا يجوز كسرها:

- Full Code = 6 digits؛ Class Code = 7 digits.
- Returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- `media ready != published`.
- Student لا يستهلك محتوى غير منشور أو AI raw output.
- AI review لا يساوي publication.
- Question Bank published revisions وQuiz published versions immutable delivery authority.
- assessment scoring/finalization server-owned.
- Reader protected media server-authorized ولا يعرض raw storage keys.
- `/v1` ليس Service Worker Cache API authority.
- لا signing private key أو session/token/password/device private key في Student Web/offline storage/docs.

إذا وجدت الكود يخالف أي قاعدة من هذه، لا تعتبره سلوكًا مقبولًا لمجرد أنه يعمل.

---

## 3. baseline الموحّد الحالي

نموذج Track A / Track B المنفصل انتهى كطريقة تشغيل جديدة بعد الدمج. استخدمه فقط لفهم التاريخ والملكية السابقة.

- `main` هو Development Integration baseline الحالي.
- PR #33 دمج Stage13G + Student Product الحالي بعد **19/19 workflows SUCCESS**.
- verification head: `dcdae7579a40878c71f64593280a0df2f8363ee2`.
- PR #33 merge commit: `5e22c3ff157b42b6da47febe205dd91fcb264eed`.
- master handoff documentation PR #36 مرّ **15/15 workflows SUCCESS**.
- documented `main` checkpoint بعد PR #36: `6ee5ad9d0bde8faa690b9eb7a923a1c8a12687b4`.

**لكن لا تعتمد على SHA ثابت قبل live-check لأن main قد يتحرك بعد كتابة هذا الملف.**

العمل الجديد يبدأ من live `main` وعلى short-lived branches منطقية، لا من `integration/stage13g-admin-product` أو `parallel/stage14-student-product` إلا للتحقيق التاريخي.

---

## 4. استرجاع المشروع — ترتيب القراءة الإلزامي

قبل أي تعديل، اقرأ بالترتيب:

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. هذا الملف `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`
4. `PROJECT_HANDOFF.md`
5. `PROJECT_STATUS.md`
6. `PROJECT_RESUME_SNAPSHOT.md`
7. `PROJECT_ENGINEERING_LOG.md`
8. `PROJECT_INTEGRATION_CONTINUITY.md`
9. `PROJECT_EXECUTION_QUEUE.md`
10. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
11. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
12. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
13. `docs/operations/RAILWAY_LIVE_STATE.md`
14. `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
15. `MASTER_REBUILD_ROADMAP.md`
16. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
17. `PRODUCT_FEATURE_PARITY_MATRIX.md`
18. latest Issue #16 body/comments
19. live `main`, recent PRs/commits, Actions and Railway state.

ثم ابدأ قراءة الكود الفعلي حسب مراحل audit التالية. لا تجعل التوثيق بديلًا عن فتح source code الحقيقي.

---

## 5. Full Repository / Product Audit الإلزامي

نفذ audit منظمًا، لا sampling عشوائيًا ولا grep سريعًا ثم حكمًا عامًا.

### Phase 1 — Repository Discovery

افهم:

- root workspace/package/build structure؛
- apps/packages/database/scripts/docs/workflows؛
- runtime vs legacy/reference code؛
- dependency managers وbuild commands؛
- Dockerfiles وRailway integration؛
- environment-driven configuration؛
- migration runner؛
- GitHub Actions gates.

اخرج mental map واضحًا لما هو production runtime وما هو historical/reference.

### Phase 2 — Product & User Flows

استخرج من الكود والtests الفعليين:

- Student activation/login/recovery/device flow؛
- access code + entitlement flow؛
- curriculum/Reader flow؛
- Practice/Test/Model flow؛
- Offline/PWA flow الحالي؛
- Admin curriculum/content/media/OCR flow؛
- AI job/review/authoring flow؛
- Question Bank/Quiz Builder flow؛
- Student/account/access/recovery/notifications/reporting/audit flows؛
- publication boundaries؛
- error/offline/session-expiry states.

قارن هذه flows مع parity/legacy coverage ولا تفترض اكتمالها بسبب وجود route أو component فقط.

### Phase 3 — Backend

افحص فعليًا:

- `apps/api/src/app.ts` composition/registrations؛
- Auth/Session/Device؛
- Access/Entitlements؛
- Curriculum/Reader/Publication؛
- Media/OCR؛
- AI contracts/execution/review/admin authoring؛
- Question Bank؛
- Quiz Builder؛
- Student Assessment؛
- Offline services/signing/download contracts؛
- Admin accounts/access/recovery/notifications/reports/settings/security/audit؛
- error model/validation/logging/idempotency/transactions/concurrency.

تحقق من callers والside effects ولا تغير shared service قبل فهم المستهلكين.

### Phase 4 — Frontend

افحص `apps/student-web` و`apps/admin-web` فعليًا:

- routing/navigation؛
- session/bootstrap؛
- API clients؛
- state ownership؛
- forms/validation؛
- loading/empty/error/offline/session-expiry؛
- responsive/RTL/a11y؛
- PWA/SW/IndexedDB؛
- admin workspaces؛
- bundle/performance issues المثبتة بالدليل.

لا تقيم UX من screenshots أو CSS فقط؛ تتبع flow كامل من بداية المهمة إلى نتيجتها.

### Phase 5 — Database

افحص كل migrations الحالية بترتيبها وفهم:

- tables/enums/constraints/indexes؛
- foreign keys/cascades؛
- immutable/versioned data؛
- publication/provenance؛
- audit/event tables؛
- dormant sync tables؛
- migration compatibility/idempotency؛
- runtime assumptions بين PostgreSQL وTypeScript.

وجود schema لا يعني أن feature wired أو verified.

### Phase 6 — Security

راجع على الأقل:

- authentication/session cookie/device proof؛
- authorization/IDOR؛
- CSRF/CORS/origins/CSP where applicable؛
- upload/media access؛
- secret exposure؛
- offline authorization/signature/integrity؛
- AI/provider credentials؛
- audit/log sensitive data؛
- direct browser authority؛
- injection/formula/export risks؛
- rate/abuse surfaces المثبتة.

### Phase 7 — Performance

ابحث بالدليل عن:

- N+1 أو slow queries؛
- unnecessary requests؛
- large frontend bundle؛
- unnecessary re-renders؛
- media sizing/cache behavior؛
- worker/capacity issues؛
- storage budget behavior.

لا تضف caching/complexity فقط لأنه ممكن.

### Phase 8 — Tests & Quality

افهم test topology:

- unit؛
- integration؛
- clean PostgreSQL contracts؛
- browser/Playwright؛
- migration gates؛
- stage workflows؛
- full rebuild/regression gates.

حدد أي critical flow لا يملك executable evidence ولا تعتبر docs دليلًا بديلًا.

### Phase 9 — Deployment / Operations

افحص live Railway بدل الاعتماد على docs فقط:

- services/status؛
- source branches؛
- Dockerfile/build config؛
- start/preDeploy/healthcheck؛
- domains؛
- media/PostgreSQL volumes؛
- deployment history؛
- current environment-variable names بدون كشف secrets.

احترم `docs/operations/RAILWAY_LIVE_STATE.md`، ولا تعتبر اسم environment `production` دليلًا أن Stage28 Production Cutover مغلق.

### Phase 10 — Content / Data

افهم الفرق بين:

- Stage9 canonical source inventory/provenance؛
- media materialization؛
- lesson linking؛
- Draft/Review/Published؛
- Question Bank generation/review/publication؛
- Student visibility.

المصدر الحالي الموثق: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

Stage9 inventory الموثق: **48 documents / 5,552 images**.

Grade 9 English live proof الحالي: **75 source images / 75 ready media assets / 300 variants / 75 Draft lesson assets / 10 lessons**. لا تعتبرها منشورة للطالب.

Supabase القديمة خارج scope الحالي ما لم يصدر Product Owner override جديد.

---

## 6. مراجعة التاريخ التنفيذي والمراحل السابقة

لا تعيد تنفيذ المشروع من الصفر، لكن لا تثق بحالة CLOSED دون فحص كافٍ.

أعد بناء stage ledger من:

- `MASTER_REBUILD_ROADMAP.md`؛
- `PROJECT_ENGINEERING_LOG.md`؛
- merge history/PRs؛
- exact workflow runs؛
- migrations/code current main؛
- Issue #16 execution reports.

الحالة الحالية المتوقعة قبل live verification:

- Stages 1–10 + OCR — VERIFIED.
- Stage11 — VERIFIED contracts.
- Stage12 — VERIFIED backend/runtime؛ live provider `AI-012..AI-019` ما زالت `NOT YET VERIFIED`.
- Stage13A–G — VERIFIED / CLOSED / integrated.
- Stage14 — CLOSED / VERIFIED.
- Stage15 — CLOSED / VERIFIED.
- Stage16 — ACTIVE / NOT CLOSED.
- Stage17+ — sequence بعد Stage16.

### كيف تراجع المراحل المغلقة بدون إضاعة الوقت

لا تعيد كل test suite من كل commit تاريخي. بدلاً من ذلك:

1. افحص current main implementation الذي يمثل النتيجة المدمجة.
2. افحص latest successful CI evidence للمجال.
3. افحص contract/migration الحالي الذي يحمي السلوك.
4. شغّل wider/current regression المناسب إذا ستعدل surface متصلة.
5. إذا ظهر contradiction أو missing coverage، افتح finding وأصلح root cause.

بهذا تسترجع المشروع بسرعة بدون blind trust وبدون إعادة الماضي كاملًا بلا سبب.

---

## 7. Gap Audit — ماذا تفعل إذا وجدت نقصًا

لكل finding مهم سجّل:

- ID
- Severity: P0 / P1 / P2 / P3
- Area
- Problem
- Evidence
- Impact
- Root Cause
- Solution
- Status

ثم صنف الكود/الجزء:

- `KEEP`
- `IMPROVE`
- `REFACTOR`
- `REBUILD`
- `REMOVE`

### قواعد القرار

- لا Rewrite لمجرد أن التصميم ليس مثاليًا.
- P0/P1 correctness/security/data-integrity gaps تتقدم على feature expansion المرتبط بها.
- P2/P3 debt يوثق ويعالج عندما يكون ضمن المسار أو يمنع الجودة.
- إذا feature موثقة CLOSED لكن التنفيذ الحالي يثبت regression، أعد فتح finding لا المرحلة كلها بلا سبب.
- لا تغير Business Rule إلا إذا كان متناقضًا/خاطئًا ودعّم القرار بالدليل ووثقه.

---

## 8. المرحلة الحالية — Stage16 Offline/PWA

المنفذ والمثبت حاليًا يتضمن:

- safe PWA shell؛
- `/v1` excluded from Service Worker cache؛
- bounded profile/device/session/entitlement offline lease؛
- account/device scoped IndexedDB lifecycle؛
- explicit protected lesson manifest/assets؛
- exact byte-size + SHA-256 verification؛
- 64 MiB lesson / 256 MiB scope budgets؛
- atomic package storage/replacement/remove؛
- server ES256/P-256 signed authorization envelope؛
- Student signature + keyId + canonical-manifest verification before storage؛
- tampered manifest rejection in real Chromium.

لا تعتبر Stage16 مغلقة.

### Exact remaining sequence

ابدأ من `PROJECT_EXECUTION_QUEUE.md`، وأول item المتوقع حاليًا هو `STUDENT-016H`:

1. durable non-secret active offline scope survives true browser restart؛
2. read/use-time re-verification of stored ES256 envelope + canonical signed fields؛
3. read-time SHA-256/byte-size verification of stored blobs against signed manifest؛
4. true cold-start offline library/Reader with network unavailable؛
5. real Chromium rejection for authorization/blob tamper, expiry, backward clock, wrong account/device؛
6. reconnect session/device/entitlement/publication/revision revalidation and purge؛
7. authoritative revisions/tombstones/cursor/delta؛
8. bounded outbox only where product-authorized offline writes need it؛
9. one exact-head Stage16 closure gate؛
10. only then Stage17.

إذا live repo يثبت أن queue تحركت بعد كتابة هذا الملف، اتبع live evidence وحدّث docs.

---

## 9. التسلسل بعد Stage16

المسؤولية الحالية هي إكمال نفس المنتج حتى النهاية، وليس فقط Stage16:

- Stage17 — Personal Learning Data: Notes/Favorites/Needs Review.
- Stage18 — Notifications: In-App + Web Push where supported + lifecycle/quiet hours/opt-out.
- Stage19 — Progress/Statistics/Achievements.
- Stage20 — Import/Export/Reporting closure.
- Stage21 — Performance Engineering.
- Stage22 — Security Hardening.
- Stage23 — Automated Tests & CI Expansion.
- Stage24 — Accessibility / Device QA.
- Stage25 — Initial production content/load verification.
- Stage26 — Staging.
- Stage27 — Release Gate.
- Stage28 — Production Cutover.
- Stage29 — Monitoring & Operations.

لا تقف بعد إغلاق Stage16 إلا إذا يوجد blocker حقيقي أو Product Owner يغير الأولوية.

---

## 10. Execution mode — لا تكتفِ بالتقرير

بعد فهم area كفاية:

1. أنشئ short-lived branch من live `main`.
2. نفذ أصغر batch منطقي قابل للمراجعة.
3. حافظ على contracts الحالية قدر الإمكان.
4. أصلح root cause وليس العرض.
5. لا تضع fake data/bypass حتى تمر tests.
6. شغّل lint/typecheck/unit/integration/build/browser/clean PostgreSQL حسب التغيير.
7. لا تعتبر build وحده قبولًا.
8. إذا فشل test، افهم إن كان product defect أم test defect قبل تغييره.
9. لا تخفف assertion إلا إذا أثبتت أنها خاطئة بالنسبة للعقد الحقيقي.
10. سجل exact SHA/run IDs.
11. دمج فقط بعد evidence المناسب.
12. تابع إلى batch التالي من queue.

---

## 11. Git / Integration discipline

- `main` = verified shared baseline.
- short-lived branches فقط للعمل الجديد.
- لا force-push لتاريخ مشترك.
- لا resurrect old long-lived tracks كسلطة جديدة.
- لا تخلط إصلاحات غير مرتبطة إذا أمكن.
- أي shared API/schema change يحتاج wider regression مناسب.
- migration جديدة فقط عند حاجة حقيقية؛ لا تستخدم DB migration لإخفاء design flaw في app layer.

---

## 12. Documentation discipline — إلزامي أثناء العمل

بعد كل batch مهم حدّث ما تغيرت حقيقته فعليًا من:

- `PROJECT_ENGINEERING_LOG.md`
- `PROJECT_STATUS.md`
- `PROJECT_HANDOFF.md`
- `PROJECT_RESUME_SNAPSHOT.md`
- `PROJECT_INTEGRATION_CONTINUITY.md`
- `PROJECT_EXECUTION_QUEUE.md`
- specialized stage/workstream doc
- `MASTER_REBUILD_ROADMAP.md` إذا تغير stage state
- `PRODUCT_FEATURE_PARITY_MATRIX.md` / Legacy Coverage إذا تغير executable parity evidence
- `docs/operations/RAILWAY_LIVE_STATE.md` إذا تغير hosting/runtime
- `docs/content/LIVE_CONTENT_IMPORT_STATUS.md` إذا تغير content load/publication
- `NEXT_CONVERSATION_PROMPT.md` إذا تغير exact continuation
- Issue #16 EXECUTION REPORT.

لا تؤجل كل التوثيق للنهاية، ولا تترك continuation-critical truth داخل Chat فقط.

---

## 13. EXECUTION REPORT المطلوب في Issue #16

بعد كل meaningful batch، سجل على الأقل:

```md
### EXECUTION REPORT
Stage / Feature:
Branch / exact HEAD:
Source of Truth inspected:
Product/architecture understanding affected:
Gap/findings discovered:
Implemented:
Architecture/contracts/schema/UI changed:
Root causes fixed:
Tests + exact results/run IDs:
Security review:
Performance review:
UX/a11y/responsive review:
Railway/content impact:
Known issues:
NOT YET VERIFIED:
Documentation updated:
Decision:
Exact next action:
```

---

## 14. Definition of Done لأي batch

لا تعتبر batch مكتملة إلا عندما يكون مناسبًا لها:

- behavior صحيح؛
- validation/authorization صحيحان؛
- failure states واضحة؛
- data consistency محفوظة؛
- tests المطلوبة خضراء؛
- browser evidence موجود للـcritical UI flows؛
- no known P0/P1 regression introduced؛
- docs/queue/Issue #16 synchronized؛
- next action explicit.

---

## 15. Definition of Project Completion

المشروع لا يصبح “منتهيًا” فقط لأن المراحل مكتوب عليها VERIFIED.

الاكتمال النهائي يتطلب:

- كل valuable legacy capability إما verified implementation أو explicit Product Owner-approved removal؛
- no unresolved/unaccepted P0/P1؛
- Stage27 Release Gate PASS؛
- staging/real-host evidence؛
- backup/restore and operational readiness where required؛
- production content verified؛
- security/performance/accessibility/CI gates satisfied؛
- Stage28 cutover explicitly executed/approved؛
- Stage29 monitoring/operations established.

---

## 16. أول تصرف في محادثة جديدة

لا تبدأ بالقول “سأكمل Stage16” مباشرة.

نفذ أولًا هذا sequence:

1. اقرأ Source of Truth بالترتيب.
2. live-check `main`, Issue #16, recent Actions, Railway.
3. اكتب لنفسك project map: product → users → flows → architecture → DB/API/frontends → deployment/content → stage ledger.
4. افتح actual code للمجال الحالي والمجالات التي يعتمد عليها.
5. نفذ targeted gap audit للمراحل المغلقة القريبة من current work، وfull repository audit تدريجيًا حسب phases أعلاه.
6. إذا وجدت correctness/security contract gap حقيقي، وثقه وأصلحه قبل توسيع feature التي تعتمد عليه.
7. ثم نفذ أول incomplete item في `PROJECT_EXECUTION_QUEUE.md`.
8. استمر batch بعد batch حتى إغلاق المرحلة ثم انتقل للمرحلة التالية.

لا تسأل Product Owner عن معلومة موجودة أصلًا في repository/Issue/CI/Railway. ابحث عنها ونفذ مباشرة.
