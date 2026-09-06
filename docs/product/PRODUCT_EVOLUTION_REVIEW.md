# PRODUCT EVOLUTION REVIEW — الوسيلة الذكية

> سجل القرارات المنتجية بعد Stage 10. الفكرة الأساسية ثابتة: نأخذ **الوسيلة الذكية** بكل الوظائف التعليمية والإدارية ذات القيمة، ونبنيها بطريقة أفضل وأبسط وأقوى. التطبيق القديم مرجع شامل للمميزات والسيناريوهات، وليس مواصفة تقنية أو تصميمًا يجب نسخه حرفيًا.

## قواعد المراجعة

1. لا تُحذف ميزة قديمة ذات قيمة بدون قرار صريح من Product Owner.
2. يمكن إعادة ترتيب الشاشات أو دمج آليات مكررة إذا بقيت النتيجة الوظيفية كاملة.
3. كل Feature/Flow يصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW / PENDING`.
4. الأمان وسلامة البيانات غير قابلة للتنازل: لا plaintext passwords، لا browser-direct DB، ولا client-authoritative permissions/scores.
5. Student UX بسيط وأنيق وسريع رغم اتساع المميزات.
6. Admin عملي ويقلل العمل اليدوي ويعطي review/audit واضحًا.
7. الرفع والمحتوى الأساسي لا يتوقفان على OCR أو AI.
8. AI يولد Drafts قابلة للمراجعة، ولا ينشر للطالب مباشرة.
9. Offline أساسي ويُبنى لتقليل طلبات السيرفر، لا لمجرد إظهار صفحة بدون إنترنت.
10. كل نص ظاهر للمستخدم Product-ready وسهل وفي مكانه؛ لا placeholders أو تعليمات تقنية.
11. أي قرار يغير عقدًا منفذًا في Stages 1–10 يعيد فتح الجزء المتأثر رسميًا مع tests/migrations/API/UI حسب الحاجة.
12. `PRODUCT_FEATURE_PARITY_MATRIX.md` يبقى inventory إلزاميًا للمراجعة حتى لا تضيع أي ميزة من القديم بالخطأ.

## Baseline الهندسي المثبت قبل المراجعة

- PostgreSQL خاصة خلف Backend API.
- Auth server-side باستخدام scrypt + opaque sessions + HttpOnly cookies.
- فصل صلاحيات Admin/Student.
- Full Code = 6 digits، Class Code = 7 digits.
- transactional/idempotent redemption/activation.
- deterministic `alwaslh-go` inventory/import مع provenance/order.
- server-owned Media Pipeline: Sharp + Poppler + checksums + ordered concurrency + cleanup.
- Stage 10 final head `27c6a2ef1118ee44d2e63471e4f925e1296283e0` اجتاز Stage10 `33302270707` وStage9 regression `33302270692` وFull Rebuild `33302270695`.

# القرارات المعتمدة — Batch 01

## PED-001 — نفس المنتج، تنفيذ أفضل
**Decision:** الحفاظ على فكرة الوسيلة الذكية وكل السيناريوهات ذات القيمة، مع إعادة تصميم التنفيذ والـUX عند الحاجة.
**Classification:** KEEP + IMPROVE
**Status:** DECIDED

## PED-002 — Welcome قبل الدخول
واجهة ترحيب وتعريف قصيرة وأنيقة، ثم:

```text
ابدأ
→ تفعيل جديد | لدي حساب بالفعل
```

كل النصوص نهائية وصالحة للعرض.
**Status:** DECIDED

## PED-003 — التفعيل على مرحلتين

```text
6-digit Full Code
→ تحقق بدون استهلاك الكود
→ one-time short-lived activation ticket
→ إنشاء كلمة مرور وتأكيدها
→ transaction واحدة: account + credential + entitlement + redemption + audit
→ session
```

لا partial account ولا استهلاك للكود قبل نجاح العملية النهائية.
**Impact:** Stage 8 refactor required.
**Status:** DECIDED

## PED-004 — الاسترداد بمساعدة Admin

```text
Admin lookup by identifier/code
→ temporary password/reset credential
→ revoke old sessions
→ must_change_password=true
→ Student login
→ mandatory private password change
```

Admin لا يرى كلمة المرور القديمة أبدًا. كل reset audited.
**Status:** DECIDED

## PED-005 — Student UX بسيط لكن Feature-complete
Home/Navigation لا يزدحم، لكن يبقي المنهج، Reader، الملخصات، التدريب، الاختبارات، النماذج، الملاحظات، المفضلة، المراجعة، التقدم والإنجازات الشخصية.
**Status:** DECIDED

## PED-006 — Admin curriculum/content مستقل عن AI
Admin يضيف الصفوف والمواد والدروس ويرفع PDF/images/mixed بشكل طبيعي. upload/process/store يجب أن ينجح حتى لو OCR/Gemini متوقف.
**Status:** DECIDED

## PED-007 — AI text-first

```text
page/image
→ OCR
→ stored text + provenance + confidence
→ selected compact text/context
→ Gemini
→ schema + semantic validation
→ Admin review
→ publish
```

الصورة الأصلية تبقى source of truth، مع fallback/review للنصوص الحساسة والمعادلات والجداول وOCR منخفض الثقة.
**Status:** DECIDED

## PED-008 — OCR Provider abstraction
نحفظ provider/model/version/status/error/raw text/normalized text/confidence/source page identity. اختيار المزود بعد benchmark عربي/علمي حقيقي.
**Status:** Architecture DECIDED / provider PENDING

## PED-009 — AI credential/project scheduler
Gemini secrets server-only. نحتاج authorized credential/project pool مع health، quota/rate awareness، cooldown، retry/backoff، failover، idempotency وmetrics. الهدف reliability/load management، وليس تجاوز شروط المزود.
**Status:** DECIDED

## PED-010 — Upload لا يستدعي AI
OCR job منفصل بعد upload، وAI يبدأ فقط من Workflow صريح.
**Status:** DECIDED

# القرارات المعتمدة — Batch 02

## PED-011 — لا اختصار للمميزات التعليمية القديمة
الملخصات، `اختبر نفسك`، الاختبارات، النماذج، الوزاريات، الملاحظات، المفضلة، Needs Review، التقدم، المحاولات، الشرح، resume/restart، الصور، versions، filters وبقية المميزات ذات القيمة تبقى وظيفيًا.

**Rule:** إزالة Feature تحتاج موافقة Owner صريحة + سبب/بديل موثق.
**Status:** DECIDED

## PED-012 — Summary / Practice / Test / Model مفاهيم منفصلة
- Summary = مراجعة درس/مصدر.
- `اختبر نفسك` = تدريب سريع ومتكرر.
- Full Test = Session/score/history/review.
- Original Ministerial Model = نموذج أصلي موثق.
- Simulated Model = نوع منفصل إذا فُعّل لاحقًا.

نحافظ على multi-lesson، versions، random/shuffle الآمن، explanations، images، resume، restart، attempts، offline where applicable.
**Status:** DECIDED

## PED-013 — لدي حساب بالفعل

```text
identifier (Full Code)
+ password
→ device policy check
→ home
```

**Status:** DECIDED

## PED-014 — حساب الطالب مربوط بجهاز تطبيق واحد
لا نعتمد IP/User-Agent/browser fingerprint. أول activation يسجل cryptographic application-device key. Returning online login = password + signed device challenge. Lost/different device يحتاج Admin reset/rebind.

Web/PWA limitation: هذا application-device binding وليس ادعاء hardware attestation مطلق.
**Impact:** Stage 6/8 partial reopen.
**Status:** DECIDED

## PED-015 — Offline أساسي وتقليل ضغط السيرفر
- account/device-scoped local state.
- app shell + metadata local.
- explicit media downloads.
- revision/delta sync.
- local outbox للملاحظات/المفضلة/Needs Review/attempt drafts.
- no generic authenticated API response caching.
- server remains authority for final score/redemption/publishing.
**Status:** DECIDED

## PED-016 — Notes / Favorites / Needs Review منفصلة
ثلاثة مفاهيم UX مستقلة مع stable provenance للدرس/الصفحة/السؤال/النموذج.
**Status:** DECIDED

## PED-017 — إنجازات شخصية فقط
Personal progress + private achievements. لا Global Leaderboard حاليًا.
**Status:** DECIDED

## PED-018 — Curriculum hierarchy مرنة وصريحة

```text
Class / Grade
→ Subject Offering
→ Unit/Section (optional)
→ Lesson
→ Content/pages/resources
```

الوحدة اختيارية، الترتيب صريح، وأكثر من صف وأكثر من مادة مدعوم. لا Generic Tree مبالغ فيه ولا filename-derived hierarchy.
**Status:** DECIDED direction

## PED-019 — Admin Import/Export أساسي
Module-scoped import/export مع validation وpreview/result report. CSV/XLSX/PDF/structured package حسب المجال.
**Status:** DECIDED capability

## PED-020 — Draft → Review → Published
AI outputs والمحتوى الجديد لا يصل للطالب قبل مراجعة Admin.
**Status:** DECIDED

## PED-021 — الحفاظ على أنواع التوليد القديمة
على الأقل: summaries، questions، MCQ، True/False، mixed، extraction/source-based، selected page/image، regenerate، alternate version، exam/model، exact/replica عند الحاجة، bulk generation، source/page، answer، explanation، method/difficulty metadata.

كل Mode = prompt version + typed input/output + semantic validator + golden tests.
**Status:** DECIDED

# القرارات المعتمدة — Batch 03

## PED-022 — Reader بصري + Text View اختياري
الصفحة الأصلية/المعالجة هي العرض الأساسي، وبجانبها Text View من OCR/published text. النص لا يستبدل الصفحة في الرياضيات والكيمياء والجداول والنصوص exact.
**Status:** DECIDED

## PED-023 — استماع للدرس عبر TTS
TTS provider abstraction. الصوت يُولد من النص المنشور/المراجع للـcontent revision ويخزن كMedia Asset مشتق؛ لا توليد عند كل Play. يدعم Play/Pause/seek/speed/resume، وتنزيل اختياري Offline.
**Status:** Product/architecture DECIDED / provider & voice PENDING

## PED-024 — Search داخل الكتاب/الدرس
OCR/published text index + Arabic normalization + result linked إلى exact lesson/page. Local index للمحتوى المنزّل كي يعمل البحث Offline.
**Status:** DECIDED

## PED-025 — لا Highlights مستقلة حاليًا
Notes + Favorites + Needs Review تكفي.
**Status:** DECIDED

## PED-026 — الطالب يبني اختبارًا من Published Question Bank فقط
الطالب يختار المادة، درسًا أو عدة دروس، العدد والأنواع المتاحة. لا Live Gemini generation للطالب. Practice Engine يختار published question IDs فقط مع stable version/option identity.
**Status:** DECIDED

## PED-027 — الوزاري الأصلي ≠ المحاكاة
Original Ministerial Model يبقى كما هو مع provenance/year/round/source/order. Simulated Model نوع منفصل مستقبلًا وموسوم بوضوح.
**Status:** Original DECIDED / simulation DEFERRED

## PED-028 — Offline download granularity
يدعم Lesson + Subject + explicit full Book عندما يكون الحجم مناسبًا. لا auto-download لكل المنهج. Download Manager يعرض الحجم/progress/retry/cancel/remove ويطبق storage budgets/eviction.
**Status:** DECIDED

## PED-029 — Offline authorization lease = 14 days

```text
valid_until = min(now + 14 days, entitlement_expiry)
```

مرتبط بالحساب والجهاز وموقع من Backend.
**Status:** DECIDED

## PED-030 — Feedback في «اختبر نفسك»
تم حسمه في Batch 04: يظهر feedback مباشرة بعد كل سؤال.
**Status:** DECIDED by PED-031

# القرارات المعتمدة — Batch 04

## PED-031 — «اختبر نفسك» يصحح مباشرة
بعد إجابة كل سؤال يظهر فورًا: صحيح/خطأ، الإجابة الصحيحة، والشرح المنشور عند توفره، ثم ينتقل للسؤال التالي. الاختبار الكامل والنموذج يحتفظان بالتصحيح والنتيجة في النهاية.

**Why:** Practice هدفه التعلم الفوري؛ Full Test هدفه القياس.
**Status:** DECIDED

## PED-032 — الصور تُعالج لتكون خفيفة مع الحفاظ على وضوح الدراسة
Stage 10 Media Pipeline هو الأساس، ويجب أن يخدم Student بvariants خفيفة بدل إرسال الأصل الكبير دائمًا.

Target delivery policy:
- الاحتفاظ بالأصل/المصدر عالي الجودة كمرجع داخلي؛
- `display` variant محسنة للقراءة والـzoom المعتدل؛
- `thumbnail` للقوائم/الصفحات المصغرة؛
- `ai` variant عند الحاجة للـOCR/vision fallback؛
- منع إعادة ضغط متكرر لنفس revision؛
- responsive/lazy loading عند Student UI؛
- اختبار readability للنص العربي، المعادلات، الجداول والرسومات قبل اعتماد quality limits؛
- Offline downloads تستخدم variants المناسبة ولا تحمل المصدر الضخم بلا حاجة.

الهدف: أقل bytes ممكنة **بدون خسارة تعليمية ملحوظة**.
**Classification:** IMPROVE Stage 10 delivery/runtime integration
**Status:** DECIDED / tuning & browser delivery NOT YET VERIFIED

## PED-033 — نوعا الأكواد يبقيان Core Feature ويمكن إضافة أكثر من Class Code

### Full Code — 6 digits
- أول تفعيل للحساب/full access حسب الصلاحية.
- يصبح identifier للحساب بعد التفعيل وفق العقد الحالي.

### Class Code — 7 digits
- الطالب يستطيع من داخل حسابه إضافة Class Code لاحقًا.
- كل Class Code يفتح entitlement للصف/الفصل المرتبط به.
- الحساب يمكن أن يملك **أكثر من class entitlement** في الوقت نفسه.
- شاشة `إضافة كود` و`صفوفي/صلاحياتي` تبين active/expired access بوضوح.
- renewal/no-waste/idempotency/race guarantees من Stage 7 تبقى أساسًا ولا تُلغى.
- لا يُستهلك Class Code إذا كان لن يمنح الطالب benefit فعليًا وفق قواعد entitlement المعتمدة.

**Classification:** KEEP + IMPROVE UX
**Status:** DECIDED

## PED-034 — التعليمات سهلة وسياقية داخل كل جزء
لا نعتمد Manual طويل كوسيلة أساسية. كل شاشة/عملية تشرح نفسها بنص قصير في مكان الحاجة.

Examples:
- تحت كود التفعيل: ما هو الكود وأين يستخدم.
- إنشاء كلمة المرور: متطلبات واضحة بدون مصطلحات تقنية.
- إضافة Class Code: ماذا سيفتح الكود قبل التأكيد عندما يمكن معرفة ذلك بأمان.
- تنزيل Offline: الحجم وما الذي سيعمل بدون نت.
- Admin Upload/OCR/AI: status + next action + error recovery في نفس الشاشة.
- AI generation: شرح mode والمدخلات والنتيجة المتوقعة قبل التشغيل.

Tooltips/help تستخدم فقط للمعلومة الثانوية، ولا تخفي تعليمات أساسية.
**Classification:** NEW UX rule
**Status:** DECIDED

## PED-035 — Admin = Super Admin فقط في المنتج الحالي
لا نضيف Content Editor/Support roles الآن. يوجد Admin role واحدة كاملة الوظائف.

**Engineering rule:** نحافظ على authorization boundaries داخليًا ولا نكتب bypasses، لكن لا نبني RBAC متعدد الأدوار بلا حاجة.
**Classification:** KEEP SIMPLE / REMOVE current multi-role scope
**Status:** DECIDED

## PED-036 — لا نفرض Curriculum Year/Version كنظام أساسي
Product Owner لا يحتاج إدارة إصدارات سنوية للمنهج حاليًا.

Target model يبقى بسيطًا:

```text
Class
→ Subject Offering
→ optional Unit
→ Lesson
→ Content
```

يمكن الاحتفاظ بـoptional metadata مثل `source_year` أو `edition` للمصادر/الوزاريات إذا احتجناه للتوثيق، لكن لا نبني lifecycle سنويًا أو archive tree كRequirement أساسي.
**Classification:** SIMPLIFY
**Status:** DECIDED

## PED-037 — المصدر ورقم الصفحة إلزاميان للأسئلة المولدة من الكتاب
إذا كان السؤال مولدًا/مستخرجًا من textbook/source pages، لا يصبح Publishable إلا إذا كان لديه provenance واضح يحدد المصدر ورقم الصفحة/الصفحات.

Validator يجب أن يرفض Draft غير المرتبط بالمصدر عندما يكون mode مصدره الكتاب. Admin يرى المصدر والصفحة أثناء المراجعة.

Manual/other-source questions لها provenance contract يناسب مصدرها، ولا نخترع page غير موجودة.
**Classification:** NEW correctness rule
**Status:** DECIDED

## PED-038 — AI High-Throughput Generation Architecture
الهدف المنتجّي: توليد **أكبر كمية عملية ممكنة** من المحتوى بشكل سلس، قابل للاستئناف، قليل التوكن، ولا يضغط السيرفر أو يتوقف بسبب فشل جزء واحد.

### Pipeline

```text
Published/approved source pages
→ reusable OCR text cache
→ Generation Plan
→ split into bounded source chunks / requested modes
→ durable jobs
→ scheduler + backpressure
→ healthy authorized Gemini credential/project
→ structured response
→ schema + semantic + provenance validation
→ duplicate detection
→ Draft question/summary versions
→ Admin review
→ publish
```

### Token-efficiency rules
- OCR مرة واحدة لكل source revision ويعاد استخدام النص.
- لا نرسل كتابًا كاملًا لكل job؛ نرسل فقط الصفحات/المقاطع المطلوبة + metadata الضرورية.
- prompt templates قصيرة/versioned ولا تعيد تعليمات ثابتة ضخمة بلا حاجة.
- لا vision/raw-image input إلا عند فشل text path أو حاجة تعليمية واضحة.
- cache/reuse source extraction وnormalized text.
- لا regenerate للعناصر الصحيحة عند retry؛ retry فقط للunits الفاشلة/الناقصة.
- generation requests تحمل target counts حتى لا نولد كمية غير مطلوبة ثم نحذفها.

### Reliability/load rules
- Queue durable؛ HTTP request لا ينتظر batch ضخم حتى ينتهي.
- كل batch يتحول إلى units صغيرة قابلة لإعادة المحاولة.
- bounded concurrency لكل provider/project + global worker budget.
- scheduler يطبق backpressure عند DB/provider saturation.
- 429/5xx/timeouts → classified retry + exponential backoff/jitter + cooldown.
- partial success محفوظ؛ لا نخسر 900 سؤال لأن آخر 100 فشلوا.
- deterministic/idempotent job keys تمنع duplicate generation عند retry.
- cancellation/resume من Admin.
- progress = planned/completed/failed/review-needed.
- no unbounded in-memory arrays لدفعات كبيرة؛ persistence/checkpoints في DB.

### Quality rules
- العدد الكبير لا يتجاوز validation.
- لكل mode schema/semantic validators.
- source/page mandatory حيث ينطبق PED-037.
- duplicate/near-duplicate detection داخل الدفعة ومع Question Bank المنشور/المسودة.
- malformed/uncertain output لا يتحول إلى سؤال صحيح افتراضيًا.
- Admin review required قبل publish.

### Observability/cost
نسجل job/mode/model/prompt version/source range/output counts/input+output tokens/latency/retries/errors/credential project/cost estimate عندما يوفره المزود.

النجاح يقاس بـ **questions accepted per source/token/time** وليس بعدد requests فقط.

**Classification:** REBUILD AI execution architecture
**Stages affected:** Stage 11/12/13 + performance/monitoring
**Status:** DECIDED architecture / implementation NOT YET VERIFIED

## PED-039 — Legacy Feature Coverage Gate
قبل إغلاق Student/Admin product stages، يجب مراجعة `PRODUCT_FEATURE_PARITY_MATRIX.md` عنصرًا عنصرًا:

```text
Legacy capability
→ KEEP / IMPROVE / REBUILD / REMOVE(owner-approved)
→ target flow/module
→ implementation evidence
→ test/acceptance evidence
```

لا يكفي أن تكون الميزة مذكورة في النقاش؛ يجب أن تحمل target واضحًا أو قرار إزالة صريحًا.
**Status:** DECIDED

# المحاور الحالية بعد Batch 04

## Account / Access — CORE DECIDED
- Full Code 6 digits.
- Class Code 7 digits.
- multiple Class Codes / multiple class entitlements.
- two-step activation.
- returning login.
- Admin-assisted password recovery.
- single registered application device.

## Curriculum — CORE DECIDED
`Class → Subject Offering → optional Unit → Lesson → Content`، multiple classes/subjects، explicit ordering، no mandatory annual curriculum versioning.

## Reader — CORE DECIDED
Original/optimized page view + OCR text view + search + TTS + notes/favorites + no independent highlights.

## Practice/Tests/Models — CORE DECIDED
- Practice feedback after each question.
- Full tests correct/review at end.
- Student custom tests use Published Question Bank only.
- Original ministerial models exact; simulation separate later.
- source/page required for source-generated questions.

## Offline — CORE DECIDED
Lesson/Subject/Book explicit downloads + account/device-scoped data + delta sync/outbox + 14-day authorization lease.

## Admin — CORE DECIDED
Single Super Admin، flexible curriculum، upload independent from AI، OCR/TTS derived states، AI review، Draft→Review→Published، Import/Export.

## AI — CORE ARCHITECTURE DECIDED
Text-first/OCR reuse، feature-complete generation modes، durable chunked jobs، bounded concurrency/backpressure، credential scheduler، partial success، retry/resume، idempotency، validation/dedupe/provenance، Admin review.

# ما زال يحتاج نقاشًا

- Notes: هل نطلق text فقط أم text + image/capture/audio من البداية؟
- Notifications: الأنواع والقنوات الدقيقة.
- Progress/mastery: ما الذي نحسبه وكيف نعرض نقاط الضعف والتوصيات.
- Import/Export: formats/scopes الدقيقة لكل module.
- Student AI المباشر: هل نضيف لاحقًا شرحًا/Chat مقيدًا بالمصدر أم نكتفي بالمحتوى المنشور.
- exact Quiz Builder UX للـAdmin، رغم أن contracts الأساسية أصبحت واضحة.

# أثر القرارات على الخطة

1. Product Review يبقى Current حتى نحسم العناصر المتبقية ذات أثر مباشر.
2. Stage 6/8 partial reopen: two-step activation + forced password change + registered-device challenge/rebind.
3. Stage 10 Preview Sync يبقى مطلوبًا، مع image delivery optimization في Preview/runtime verification.
4. OCR Extraction Foundation قبل AI authoring.
5. Stage 11 = versioned generation contracts + validators + provenance + golden tests.
6. Stage 12 = durable high-throughput AI execution architecture PED-038.
7. Stage 13 = Super Admin product فقط، بدون multi-role RBAC.
8. Stage 14 = feature-complete Student product + Reader page/text/search/TTS.
9. Stage 15 = trusted Practice/Test/Model engine من Published Question Bank.
10. Stage 16 = mandatory Offline/PWA + 14-day lease.
11. Stage 20 = required Import/Export/Reporting.
12. Legacy Feature Coverage Gate PED-039 شرط قبل إغلاق Student/Admin feature parity.

## الحالة

`PRODUCT REVIEW IN PROGRESS / BATCHES 01–04 RECORDED / CORE ACCESS+READER+PRACTICE+OFFLINE+ADMIN+AI DIRECTION DECIDED / NO VALUABLE LEGACY FEATURE REMOVAL WITHOUT OWNER DECISION`
