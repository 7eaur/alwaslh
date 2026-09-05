# PRODUCT EVOLUTION REVIEW — الوسيلة الذكية

> هذه الوثيقة هي سجل القرارات المنتجية الجديدة بعد اكتمال الأساس الهندسي حتى Stage 10. التطبيق القديم مرجع للفكرة والاحتياجات والسيناريوهات والمشكلات، وليس مواصفة ملزمة للتنفيذ الجديد.

## الهدف

نبني أفضل نسخة من **فكرة الوسيلة الذكية** بما يناسب المنتج الذي نريده الآن، لا نسخة مطابقة للتطبيق القديم.

كل Feature/Flow/Business Rule تُناقش صراحةً ثم تُصنف إلى أحد الخيارات:

- `KEEP` — نحافظ عليها كما هي في الجوهر.
- `IMPROVE` — نفس الفكرة مع تحسين محدود.
- `REFACTOR` — نفس النتيجة للمستخدم لكن بتنظيم/تدفق مختلف.
- `REBUILD` — نعيد تصميم الميزة أو السيناريو من أساسه.
- `REMOVE` — لا توجد قيمة كافية أو يوجد بديل أفضل.
- `NEW` — ميزة جديدة لم تكن في التطبيق القديم.
- `PENDING` — لم يُحسم القرار بعد.

أي قرار يغير Business Rule نُفذ بالفعل في Stages 1–10 لا يُطبق بصمت. نسجل أثره، Contracts المتأثرة، migrations/API/UI/tests المطلوبة، ثم نفتح Refactor واضحًا قبل بناء مراحل تعتمد عليه.

## مبادئ القرار

1. قيمة المستخدم أهم من مطابقة القديم.
2. البساطة أهم من كثرة المميزات.
3. الأمان وسلامة البيانات ليست نقاط تفاوضية.
4. Student يجب أن يكون أبسط وأسرع من Admin.
5. Admin يجب أن يقلل الجهد المتكرر في إدارة المحتوى والطلاب.
6. AI أداة مساعدة يمكن التحقق منها، وليس مصدر حقيقة غير مراقب.
7. لا نضيف Offline أو Sync أو Automation إلا عندما تكون الفائدة واضحة ومثبتة.
8. كل Flow يجب أن يملك loading/error/empty/offline/permission states المناسبة.
9. أي ميزة نقرر إبقاءها يجب أن يكون لها Definition of Done واختبار قابل للتنفيذ.
10. لا نستخدم Feature Parity Matrix كقائمة إلزامية؛ نستخدمها كـinventory لضمان أن كل شيء قد نوقش ولم يُسقط بالخطأ.
11. التطبيق يحتفظ **بنفس الفكرة الأساسية**؛ التطوير هدفه تحسين التجربة والبنية وليس تغيير المنتج إلى منتج آخر.
12. لا يوجد placeholder copy في الواجهات النهائية؛ أي نص ظاهر للمستخدم يجب أن يكون نصًا Product-ready ومقصودًا للعرض.

## ما تم تثبيته هندسيًا حتى الآن

هذه ليست بالضرورة Business Rules نهائية إلى الأبد، لكنها baseline منفذة ومختبرة:

- private PostgreSQL خلف Backend API؛ لا اتصال مباشر من المتصفح.
- Auth server-side مع scrypt وopaque sessions وHttpOnly cookies.
- Admin/Student authorization boundaries.
- transactional/idempotent access-code redemption.
- current Full Code contract = 6 digits.
- current Class Code contract = 7 digits.
- Stage 8 baseline الحالي كان first activation = Full Code + password في طلب واحد؛ **قرار المنتج الجديد أدناه يعيد تصميم UX/API إلى خطوتين مع الحفاظ على atomic account creation النهائي**.
- current returning Student identifier is the normalized Full Code + password.
- recovery is reset-only ولا يكشف كلمة المرور القديمة.
- deterministic `alwaslh-go` source inventory/import with provenance/order.
- server-owned deterministic media pipeline with Sharp/Poppler, checksums, variants and failure cleanup.

إذا قرر المنتج تغيير أي نقطة من هذه، نعيد فتح الجزء المتأثر رسميًا.

# القرارات المعتمدة — Batch 01

## PED-001 — الفكرة الأساسية للمنتج

**Area:** Product identity

**Decision:** نحافظ على نفس فكرة الوسيلة الذكية ونطورها للأفضل؛ التطبيق القديم inventory/reference للمميزات والسيناريوهات وليس specification ملزمة.

**Classification:** KEEP + IMPROVE

**Status:** DECIDED

## PED-002 — شاشة ترحيب وتعريف قبل دخول الطالب

**Area:** Student entry

**Chosen approach:** توجد واجهة ترحيبية/تعريفية أنيقة قبل شاشة تسجيل دخول الطالب، تشرح القيمة الأساسية وطريقة البدء بنصوص قصيرة نهائية صالحة للعرض. لا نعرض نصوص تطوير أو placeholders أو تعليمات تقنية.

**UX direction:**

```text
Welcome / Product introduction
→ Student entry
→ Activate new access OR Returning login
```

يمكن جعل الشرح التفصيلي يظهر في أول استخدام فقط مع بقاء صفحة ترحيب خفيفة في الزيارات اللاحقة؛ هذا التفصيل يحتاج قرارًا لاحقًا.

**Classification:** NEW / IMPROVE

**Stages affected:** Student Product / UX / Accessibility / E2E.

**Status:** DECIDED at product-flow level.

## PED-003 — تفعيل الطالب يصبح مرحلتين واضحتين

**Area:** Student activation/Auth

**Legacy/current rebuilt baseline:** Stage 8 الحالي يستقبل Full Code + password في خطوة واحدة.

**Chosen UX:**

```text
Enter 6-digit Full Code
→ server verifies eligibility
→ mandatory Create Password screen
→ confirm activation atomically
→ authenticated Student session
```

**Engineering rule:** التحقق الأول لا ينشئ حسابًا جزئيًا ولا يستهلك الكود نهائيًا. Backend يصدر activation ticket قصير العمر/one-time مرتبط بالكود. إنشاء الحساب + credential + entitlement + redemption + audit يبقى transaction واحدة عند تأكيد كلمة المرور.

بهذا نحصل على UX المطلوب بدون العودة إلى مشكلة legacy partial activation.

**Classification:** REFACTOR

**Stages affected:** Re-open Stage 8 activation contract/UI/API tests before Student Product depends on it.

**Status:** DECIDED.

## PED-004 — استرداد حساب الطالب عبر Admin Support

**Area:** Recovery/Support

**Chosen business flow:** الطالب الذي نسي كلمة المرور يتواصل مع الإدارة ويعطي **رقم/معرّف الكود**. Admin يبحث عن الحساب المرتبط ويبدأ reset آمن.

**Security invariant:** لا يمكن للإدارة عرض كلمة المرور القديمة. كلمة المرور المخزنة hash فقط.

**Recommended implementation:** Admin يعيّن كلمة مرور مؤقتة أو يصدر reset credential، وتكون `must_change_password=true` بحيث يُجبر الطالب بعد أول دخول ناجح على اختيار كلمة مرور جديدة. كل عملية reset تُسجل في audit log وتبطل الجلسات القديمة.

هذا يحقق المقصود من "الإدارة تصلح كلمة السر" بدون إنشاء سر دائم معروف للموظف.

**Classification:** IMPROVE / REBUILD recovery UX

**Status:** DECIDED في مبدأ Admin-assisted recovery؛ اختيار temporary-password vs one-time reset code يحتاج تثبيت نهائي.

## PED-005 — Student UX بسيط وأنيق

**Area:** Student experience

**Decision:** واجهة الطالب مرتبة، واضحة، سهلة، mobile-first، قليلة الضوضاء، ولا تعرض كل المميزات في الشاشة نفسها.

المنتج يجب أن يحافظ على الوصول إلى:

- المنهج والمواد والدروس؛
- النماذج/الاختبارات؛
- الملاحظات؛
- المفضلة/الحفظ؛
- تتبع التقدم؛
- بقية الوظائف المفيدة من التطبيق القديم بعد مراجعتها؛

لكن Navigation وHome يعيدان تنظيمها حسب الاستخدام المتكرر بدل نسخ layout القديم.

**Classification:** IMPROVE / REBUILD UX

**Status:** DECIDED direction; detailed IA remains under review.

## PED-006 — إدارة المنهج من Admin تبقى طبيعية ومباشرة

**Area:** Admin curriculum/content

**Decision:** Admin يستطيع إضافة الصفوف/الفصول والمواد والدروس والمحتوى مباشرة. إضافة/رفع المحتوى لا تعتمد على AI ولا تتوقف عليه.

**Core rule:**

```text
Upload/Import
→ validate/process/store
→ content available for Admin review
```

AI/OCR عمليات مستقلة لاحقة وليست prerequisite لنجاح الرفع.

**Classification:** KEEP + IMPROVE

**Status:** DECIDED.

## PED-007 — AI generation يكون نصّيًا أولًا ومقتصدًا بالتوكن

**Area:** Admin AI authoring

**Decision:** لا نرسل الصور الخام إلى Gemini افتراضيًا عند كل عملية توليد. نعتمد text-first generation قدر الإمكان.

**Target flow:**

```text
page image/source
→ OCR provider
→ extracted text + confidence + page/source provenance
→ store OCR result
→ AI generation receives selected text + compact metadata
→ structured output validation
→ human review/publish
```

**Benefits:** token usage أقل، latency أقل، retry أرخص، prompt inputs أسهل في الاختبار، ويمكن إعادة استخدام OCR text لعدة عمليات توليد بدون إعادة قراءة الصورة.

**Safety/correctness rule:** الصورة الأصلية تبقى source of truth. OCR text لا يُعامل على أنه دقيق 100%. العمليات الحساسة مثل النصوص الدينية الدقيقة، الصيغ العلمية/الكيميائية، الجداول أو OCR منخفض الثقة يجب أن تملك review/fallback path بدل توليد محتوى غير موثوق بصمت.

**Classification:** NEW architecture / REBUILD AI input path

**Stages affected:** Stage 11 contracts, Stage 12 execution, Admin content workflow; likely add dedicated OCR stage/substage before AI authoring integration.

**Status:** DECIDED.

## PED-008 — OCR Provider abstraction

**Area:** Content extraction

**Decision:** نربط OCR API/service مخصص لتحويل صور الصفحات إلى نص، لكن domain لا يعتمد على vendor واحد.

يحفظ النظام على الأقل:

- page/source asset identity؛
- extracted text؛
- provider + model/version؛
- confidence/evidence عندما يوفرها المزود؛
- processing status/error؛
- timestamps؛
- optional normalized text منفصل عن raw extraction.

يمكن تغيير المزود لاحقًا بدون تغيير lesson/question business logic.

**Classification:** NEW

**Status:** DECIDED architecture; provider selection PENDING.

## PED-009 — AI credential pool/failover

**Area:** Durable AI execution

**Decision:** Gemini secrets تبقى server-only. التنفيذ يدعم مجموعة credentials/projects مصرح بها مع health tracking، quota/rate awareness، cooldown، retry/backoff وfailover المنظم.

**Rule:** التبديل بين المفاتيح هدفه الاستمرارية وتوزيع الحمل على الموارد المصرح بها، وليس التحايل على حدود أو شروط المزود.

**Architecture direction:**

```text
AI job
→ scheduler
→ healthy configured credential/project
→ execute
→ record latency/tokens/result/error
→ cooldown/failover when appropriate
```

**Classification:** REBUILD

**Stage:** Stage 12.

**Status:** DECIDED.

## PED-010 — Upload مستقل تمامًا عن AI

**Area:** Admin upload/media

**Decision:** لا يتم استدعاء Gemini أثناء الرفع العادي. Stage 10 Media Pipeline هي المسار الأساسي للرفع والمعالجة. OCR يمكن أن يعمل كjob مستقل بعد نجاح الرفع؛ AI generation لا يبدأ إلا بطلب/Workflow واضح.

هذا يمنع أن فشل AI أو quota يمنع Admin من رفع كتاب أو صور.

**Classification:** IMPROVE

**Status:** DECIDED.

## محاور المراجعة

### A. هوية المنتج والجمهور

الفكرة الأساسية ثابتة: الوسيلة الذكية منصة الطالب للدراسة من المنهج مع أدوات التدريب والتنظيم، ومع Admin لإدارة المحتوى والوصول والتوليد. أدوار Teacher/Parent لم تُعتمد حاليًا.

**Decision:** PARTIALLY DECIDED — PED-001.

### B. الحساب والتفعيل والوصول

- Full Code الحالي 6 digits ما زال baseline ولم يطلب تغييره.
- Class Code الحالي 7 digits ما زال baseline ولم يطلب تغييره.
- Activation UX أصبح خطوتين وفق PED-003.
- Admin-assisted recovery وفق PED-004.
- expiry/renewal/multiple class access/transfer تحتاج مراجعة لاحقة.

**Decision:** PARTIALLY DECIDED.

### C. الصفوف والمواد والمحتوى

هيكل الصفوف/الفصول والمواد والدروس يبقى في الجوهر، مع تحسين الإدارة والتنقل وعدم نسخ UI القديم حرفيًا. تفاصيل الكتب/السنوات/الإصدارات والنشر ما زالت للمراجعة.

**Decision:** PARTIALLY DECIDED.

### D. الصفحة الرئيسية والتنقل للطالب

يجب أن تكون مرتبة وأنيقة وسهلة وتعرض المنهج والنماذج والملاحظات والمفضلة والتقدم بدون ازدحام. IA النهائية ما زالت للمراجعة.

**Decision:** PARTIALLY DECIDED — PED-005.

### E. Reader / تجربة الدراسة

- عرض صفحات الكتاب وصحة الترتيب مصدر أساسي.
- zoom/pan/navigation/search/highlights/notes/reading settings تحتاج قرارًا تفصيليًا.

**Decision:** PENDING detailed review.

### F. Practice / Questions / Quizzes

الوظائف المهمة من القديم تبقى inventory: Practice، الاختبارات، النماذج، الحفظ، resume/restart، explanations، versions، الوزاريات. سنقرر لكل منها UX/business rule أفضل بدل النسخ المباشر.

**Decision:** PENDING detailed review.

### G. AI داخل تجربة الطالب

لم يُعتمد حاليًا Chat حر أو AI مباشر للطالب. القرار الحالي يركز على Admin generation text-first. AI Student use يحتاج نقاشًا مستقلًا.

**Decision:** PENDING.

### H. Notes / Saved / Personal Learning

الملاحظات والمفضلة/الحفظ Features مطلوبة من حيث الجوهر. الشكل النهائي، أنواع الملاحظات، tags/folders، sync/offline ما زالت للمراجعة.

**Decision:** PARTIALLY DECIDED.

### I. Statistics / Progress / Achievements

تتبع التقدم مطلوب. Gamification/rank/leaderboard/achievements تحتاج مراجعة قيمة المستخدم قبل اعتمادها.

**Decision:** PARTIALLY DECIDED.

### J. Notifications

**Decision:** PENDING.

### K. Offline / PWA

**Decision:** PENDING.

### L. Admin roles and permissions

**Decision:** PENDING.

### M. Admin curriculum/content workflow

إضافة الصفوف/المواد/الدروس والرفع المباشر مع Media Pipeline معتمدة. الرفع لا يعتمد على AI. OCR post-upload منفصل.

**Decision:** PARTIALLY DECIDED — PED-006/PED-010.

### N. Admin AI authoring

Text-first generation + OCR reuse + durable credential scheduling معتمدة. أوضاع التوليد الدقيقة وطريقة المراجعة والنشر تحتاج مراجعة.

**Decision:** PARTIALLY DECIDED — PED-007/PED-009.

### O. Quiz Builder / Content QA

**Decision:** PENDING.

### P. Students / Codes / Support in Admin

Admin account lookup + assisted password reset مطلوبان. بقية account/code operations تحتاج مراجعة.

**Decision:** PARTIALLY DECIDED — PED-004.

### Q. Reports / Export

**Decision:** PENDING.

### R. Search and discovery

**Decision:** PENDING.

### S. Content lifecycle and publishing

**Decision:** PENDING.

### T. New product ideas

- OCR text layer reusable across search, generation and future accessibility features.
- Welcome/onboarding before Student login.

**Decision:** PARTIALLY DECIDED.

## تأثير القرارات الحالية على الخطة

قبل تنفيذ Stage 11 كما كانت مكتوبة سابقًا، الخطة تحتاج التعديل التالي:

1. **Stage 10 Preview Sync** يبقى مطلوبًا لإبقاء النسخة الحية مواكبة.
2. **Stage 8 Activation Refactor** يعاد فتحه لتطبيق flow: `Full Code verification → activation ticket → mandatory password creation → atomic activation` مع Browser E2E جديد.
3. إضافة **OCR Extraction Layer** قبل الاعتماد الكامل على Gemini authoring. يمكن تنفيذها كمرحلة مستقلة أو كجزء واضح من Content/AI pipeline، لكن لا تُخلط مع Media upload نفسه.
4. Stage 11 يصبح Prompt/Output/OCR-text Contracts: AI inputs تبنى حول text + source/page provenance + validation.
5. Stage 12 يبقى Durable AI Execution مع credential/project scheduler، retries/cooldown/failover، server-only secrets، metrics/idempotency.
6. Stage 13 Admin Product يعتمد upload-first، OCR-asynchronous، AI-on-demand workflows.
7. Student Product يعاد تصميم Entry/Home/Navigation وفق PED-002/PED-005 بدل نسخ UI القديم.

لا تبدأ تغييرات implementation المبنية على هذه القرارات قبل اكتمال مراجعة المحاور التي يمكن أن تغيّر contracts الأساسية، لكن أي قرار محسوم هنا يعتبر source of truth عند تحديث roadmap النهائي.

## قالب تسجيل كل قرار

```text
Decision ID:
Area:
Legacy behavior:
User need:
Options considered:
Chosen approach:
Why:
Classification: KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW
Business rules:
UX flow:
Backend/data impact:
Security/privacy impact:
Offline impact:
AI impact:
Migration/backward-compat impact:
Stages affected:
Tests/DoD required:
Status: DECIDED / NEEDS PROTOTYPE / DEFERRED
```

## الحالة الحالية

`PRODUCT REVIEW IN PROGRESS / BATCH 01 RECORDED / IMPLEMENTATION PLAN TO BE REBASED AFTER CORE PRODUCT DECISIONS`
