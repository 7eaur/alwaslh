# PRODUCT EVOLUTION REVIEW — الوسيلة الذكية

> سجل القرارات المنتجية بعد Stage 10. الفكرة الأساسية للوسيلة الذكية ثابتة؛ نطوّر التجربة والتنفيذ ولا نحوّل المنتج إلى فكرة أخرى. التطبيق القديم مرجع شامل للمميزات والسيناريوهات، وليس مواصفة تقنية يجب نسخها حرفيًا.

## قواعد المراجعة

1. نحافظ على قيمة المنتج والسيناريوهات التعليمية والإدارية التي لها فائدة.
2. **لا تُحذف ميزة قديمة ذات قيمة بدون قرار صريح من Product Owner.** يمكن إعادة تنظيمها أو دمج آليات مكررة إذا بقيت النتيجة الوظيفية كاملة.
3. كل Feature/Flow يصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW / PENDING`.
4. الأمان وسلامة البيانات غير قابلة للتنازل؛ لا plaintext password ولا browser-direct DB ولا client-authoritative permissions/scores.
5. Student يجب أن يكون بسيطًا وأنيقًا وسريعًا، مع كل الوظائف المهمة لكن بدون ازدحام.
6. Admin يجب أن يقلل العمل اليدوي ويملك review/audit واضحًا.
7. الرفع والمحتوى الأساسي لا يتوقفان على AI أو OCR.
8. AI أداة توليد Draft قابلة للمراجعة، وليس مسار نشر مباشر.
9. Offline ميزة أساسية، لكن تُبنى بسياسة cache/sync/account واضحة لا بطلبات مستمرة للسيرفر.
10. أي نص ظاهر للمستخدم يكون Product-ready؛ لا placeholders أو نصوص تطوير في الواجهة النهائية.
11. أي قرار يغيّر عقدًا منفذًا في Stages 1–10 يعيد فتح الجزء المتأثر رسميًا مع migrations/API/UI/tests عند الحاجة.

## Baseline الهندسي المثبت قبل المراجعة

- PostgreSQL خاصة خلف Backend API؛ المتصفح لا يتصل بالقاعدة مباشرة.
- Auth server-side باستخدام scrypt + opaque sessions + HttpOnly cookies.
- فصل صلاحيات Admin/Student.
- Full Code الحالي = 6 digits، Class Code الحالي = 7 digits.
- transactional/idempotent redemption/activation.
- Stage 8 baseline الحالي كان `Full Code + password` في خطوة واحدة؛ القرار الجديد أدناه يعيد تصميم flow التفعيل.
- deterministic `alwaslh-go` inventory/import مع provenance/order.
- server-owned media pipeline: Sharp + Poppler + checksums + ordered concurrency + failure cleanup.
- Stage 10 final documentation head `27c6a2ef1118ee44d2e63471e4f925e1296283e0` اجتاز Stage10 `33302270707` وStage9 regression `33302270692` وFull Rebuild `33302270695` بنجاح.

# القرارات المعتمدة — Batch 01

## PED-001 — نفس فكرة المنتج، تنفيذ أفضل

**Decision:** نحافظ على فكرة الوسيلة الذكية: الطالب يدرس منهجه، يراجع، يختبر نفسه، يستخدم النماذج، يسجل بياناته الشخصية التعليمية؛ وAdmin يدير المنهج والطلاب والوصول والتوليد. القديم مرجع وظيفي وليس UI/Architecture specification.

**Classification:** KEEP + IMPROVE
**Status:** DECIDED

## PED-002 — Welcome / Learning entry قبل الدخول

يوجد قبل شاشة دخول الطالب Welcome/تعريف مختصر وأنيق بنصوص نهائية للعرض.

```text
Welcome / تعريف مختصر
→ ابدأ
→ تفعيل جديد | لدي حساب بالفعل
```

**Classification:** NEW + IMPROVE
**Status:** DECIDED

## PED-003 — التفعيل على مرحلتين

```text
إدخال Full Code 6-digit
→ تحقق من صلاحية الكود بدون استهلاكه
→ activation ticket قصير العمر/one-time
→ شاشة إجبارية لإنشاء كلمة المرور وتأكيدها
→ transaction واحدة: account + credential + entitlement + redemption + audit
→ authenticated session
```

لا يوجد partial account ولا استهلاك للكود قبل نجاح العملية النهائية.

**Classification:** REFACTOR
**Impact:** Stage 8 يُعاد فتحه قبل Student Product النهائي.
**Status:** DECIDED

## PED-004 — الاسترداد بمساعدة Admin

الطالب الذي نسي كلمة المرور يتواصل مع Admin ويعطي معرف/رقم الكود. Admin لا يرى password قديمًا أبدًا.

القرار المعتمد بعد Batch 02:

```text
Admin lookup by Student identifier/code
→ issue/set temporary password
→ revoke old sessions
→ mark must_change_password=true
→ Student logs in
→ mandatory create new private password
→ old temporary password invalidated
```

كل reset مسجل في audit.

**Classification:** REBUILD Recovery UX
**Status:** DECIDED

## PED-005 — Student UX بسيط وأنيق

واجهة الطالب mobile-first، واضحة وقليلة الضوضاء، لكن لا تختصر وظائف الدراسة. Home/Navigation تعطي الأولوية لـContinue learning، المنهج، الاختبارات/النماذج، والبيانات الشخصية التعليمية.

**Classification:** IMPROVE / REBUILD UX
**Status:** DECIDED direction

## PED-006 — Admin curriculum/content أساسي ومستقل عن AI

Admin يضيف الصفوف/المواد/الدروس ويرفع PDF/images/mixed بشكل طبيعي. نجاح upload/process/store لا يعتمد على Gemini أو OCR.

**Classification:** KEEP + IMPROVE
**Status:** DECIDED

## PED-007 — AI text-first لتقليل التوكن

```text
page/image
→ OCR
→ stored raw extracted text + provenance + confidence/evidence
→ selected text/context
→ Gemini generation
→ schema/semantic validation
→ Admin review
→ publish
```

الصورة الأصلية تبقى source of truth. النصوص الدينية والمعادلات/الكيمياء والجداول وOCR منخفض الثقة تحتاج review/fallback صريح.

**Classification:** REBUILD AI input path
**Status:** DECIDED

## PED-008 — OCR Provider abstraction

OCR خدمة مستقلة خلف `OcrProvider` abstraction، ونحفظ provider/model/version/status/error/raw text/optional normalized text/confidence/source page identity.

Vendor selection يتم بعد benchmark على صفحات عربية/رياضيات/كيمياء/فيزياء/قرآن/جداول/صور منخفضة الجودة.

**Classification:** NEW
**Status:** Architecture DECIDED / provider PENDING

## PED-009 — AI credential/project scheduler

Gemini secrets server-only. التنفيذ يدعم credentials/projects مصرح بها مع health state، quota/rate awareness، cooldown، retry/backoff، failover، idempotency وmetrics. لا يوجد key rotation في Browser ولا استخدام للتحايل على شروط المزود.

**Classification:** REBUILD
**Status:** DECIDED

## PED-010 — Upload لا يستدعي AI

Media Upload مستقل. بعد نجاحه يمكن OCR job مستقل، ثم AI فقط عند Workflow واضح من Admin.

**Classification:** IMPROVE
**Status:** DECIDED

# القرارات المعتمدة — Batch 02

## PED-011 — المميزات التعليمية القديمة لا تُختصر

**Decision:** الاختبارات، الملخصات، `اختبر نفسك`، النماذج، الوزاريات، الملاحظات، المفضلة، عناصر تحتاج مراجعة، التقدم، المحاولات، الشرح، الاستكمال/restart، وبقية الوظائف التعليمية ذات القيمة من التطبيق السابق تبقى وظيفيًا. يعاد ترتيبها وتصميمها للأفضل ولا تُحذف لمجرد أن تنفيذها القديم سيئ.

**Product rule:** حذف أي Feature ذات قيمة يحتاج موافقة صريحة من Product Owner وتوثيق البديل/السبب.

**Classification:** KEEP outcomes + IMPROVE/REBUILD implementation
**Status:** DECIDED

## PED-012 — ثلاثة سياقات مختلفة: Summary / Self Practice / Exam

لا نخلط كل شيء تحت Quiz واحد.

1. **الملخصات:** مرتبطة بالدرس/المصدر، يقرأها الطالب للمراجعة.
2. **اختبر نفسك / Practice:** تدريب سريع من درس/موضوع، feedback وشرح سريع، مناسب للتكرار.
3. **الاختبار/النموذج:** Session كاملة بنتيجة ومحاولة وتاريخ، ويمكن أن تشمل أكثر من درس/مادة حسب النوع.
4. **النموذج الوزاري/المحاكاة:** يحتفظ ببيانات السنة/الدور/المصدر/النسخة ويُعامل كنمط واضح.

نحافظ على قدرات القديم مثل filters، multi-lesson، versions، random/shuffle الآمن، explanations، question images، resume، restart، attempt history، offline where applicable، ومراجعة الأخطاء.

**Classification:** KEEP + REFACTOR information architecture
**Status:** DECIDED

## PED-013 — خيار «لدي حساب بالفعل» في Entry

بعد Welcome يظهر مسار واضح للطالب العائد:

```text
لدي حساب بالفعل
→ identifier (Full Code الحالي)
→ password
→ device policy check
→ session/home
```

لا يُجبر الطالب العائد على المرور بتفعيل جديد.

**Classification:** KEEP + IMPROVE
**Status:** DECIDED

## PED-014 — حساب الطالب جهاز واحد مسجّل، بدون Fingerprint كسر

**Business requirement:** حساب الطالب لا يُفتح من جهاز ثانٍ إلا بعد فك/إعادة ربط الجهاز عبر Admin recovery/support.

**Security design:** لا نعتمد `user-agent`, device model, IP, browser fingerprint أو قيمة يمكن تزويرها كدليل أمان. عند أول activation النهائي يولد التطبيق مفتاح جهاز cryptographic keypair محليًا؛ السيرفر يخزن public key + metadata عرضية عن المنصة/نوع الجهاز. تسجيل الدخول online يتطلب password صحيح + إثبات امتلاك device private key للحساب المسجل.

```text
First activation
→ create account/password
→ generate non-exportable device key where platform permits
→ register public key to account
→ account.device_status = active

Returning login
→ password verification
→ signed server challenge by registered device key
→ session

Different/lost device
→ reject normal login
→ Admin device reset/rebind flow
```

**Important limitation:** في Web/PWA لا يمكن ضمان هوية hardware مطلقة مثل تطبيق Native مع hardware attestation؛ لذلك العقد هو **registered application device key** وليس ادعاء fingerprint غير قابل للكسر. مسح browser/app storage قد يفقد المفتاح ويتطلب Admin recovery.

**Classification:** NEW security/business rule
**Impact:** إعادة فتح Stage 6/8 جزئيًا: device registry, challenge verification, reset/rebind, E2E/security tests.
**Status:** DECIDED at product/security architecture level

## PED-015 — Offline أساسي وتقليل ضغط السيرفر

**Decision:** Student PWA يجب أن يعمل بدون إنترنت للوظائف التي تم تنزيل بياناتها/مزامنتها، ولا يعتمد على طلب API عند كل فتح صفحة أو انتقال.

**Direction:**

- app shell/static assets cached؛
- curriculum metadata/content revisions cached account-scoped؛
- downloaded lessons/books/media explicit and bounded؛
- notes/favorites/review-items/attempt drafts use local outbox ثم sync؛
- signed offline authorization/entitlement snapshot مرتبط بالحساب والجهاز وله expiry لا يتجاوز entitlement الحقيقي؛
- delta/revision sync بدل refetch كامل؛
- conditional requests/cache headers where useful؛
- network state distinguishes offline vs backend unavailable vs sync pending؛
- no generic authenticated API-response caching in service worker؛
- logout/reset/device-rebind clears private local account state according to contract.

**Security:** Offline لا يجعل password أو answer keys أو permissions secrets قابلة للاستخراج بلا حاجة. العمليات authoritative مثل final trusted score/redemption/publishing تبقى server-validated عند الاتصال.

**Classification:** KEEP requirement + REBUILD implementation
**Stage:** Offline/PWA plus Auth device-binding integration
**Status:** DECIDED direction; exact offline lease duration decided in Batch 03.

## PED-016 — Personal Learning Data تبقى منفصلة مفاهيميًا

لا نوحد كل شيء في «المحفوظات».

- **الملاحظات:** ما كتبه/سجله الطالب بنفسه.
- **المفضلة:** محتوى يحبه/يريد الوصول إليه بسرعة.
- **يحتاج مراجعة:** عنصر تعليمي وضعه الطالب أو النظام في قائمة مراجعة لاحقة.
- **Saved Questions/Bookmarks:** إذا احتجناها تقنيًا يمكن أن تشترك في infrastructure، لكن UI semantics لا تذيبها في نوع واحد.

كل نوع مرتبط بـstable provenance: lesson/page/question/model حيث ينطبق.

**Classification:** KEEP + IMPROVE data model/UX
**Status:** DECIDED

## PED-017 — إنجازات شخصية فقط

نحتفظ بالإنجازات والتقدم الشخصي المفيد، لكن لا نعتمد Global Leaderboard/Ranking بين الطلاب في المنتج الحالي.

يمكن إظهار achievements مثل إكمال مادة/عدد اختبارات/تحسن شخصي، مع metrics مشتقة server-side عندما تكون authoritative.

**Classification:** KEEP achievements / REMOVE current need for public ranking
**Status:** DECIDED

## PED-018 — Flexible curriculum hierarchy بدون Generic Tree مبالغ فيه

**Need:** Admin يمكنه إضافة أكثر من صف وأكثر من مادة وترتيب مرن وواضح، ولا نلزم أنفسنا بشكل UI القديم.

**Direction to finalize:** نموذج صريح قابل للترتيب بدل arbitrary tree:

```text
Curriculum / Year (when needed)
→ Class / Grade
→ Subject Offering
→ Unit/Section (optional)
→ Lesson
→ Lesson content/pages/resources
```

- الوحدة اختيارية؛ المادة يمكن أن تحتوي Lessons مباشرة.
- Subject يمكن ربطه بأكثر من Class/edition عبر offering/link بدل نسخ بيانات عشوائي.
- كل مستوى يملك stable position/order قابل لإعادة الترتيب.
- لا نستنتج hierarchy من filenames.

**Classification:** IMPROVE / likely schema extension
**Status:** DIRECTION DECIDED; exact schema/versioning still needs detailed review before migration

## PED-019 — Admin Import/Export يبقى ميزة أساسية

Admin يحتاج Import/Export منظم للبيانات التشغيلية والمحتوى حيث يكون مفيدًا. لا نبني زرًا عامًا غامضًا؛ كل scope له contract واضح مثل curriculum structure، question bank، access codes، reports أو content package حسب القرار النهائي.

CSV/XLSX/PDF/structured package تستخدم حسب نوع البيانات مع validation وpreview/result report عند الاستيراد.

**Classification:** KEEP + REBUILD safety/UX
**Status:** DECIDED capability / exact formats per module PENDING

## PED-020 — Draft → Review → Published

المحتوى الجديد ونتائج AI لا تصل للطلاب مباشرة.

```text
Draft
→ Admin review/edit/validation
→ Published
→ Archived/Replaced later when needed
```

AI outputs دائمًا Draft. Admin يراجع الإجابة الصحيحة والشرح والمصدر/الصفحة والتنسيق قبل النشر. العمليات الكبيرة تعرض validation issues/result summary.

**Classification:** NEW/IMPROVE content lifecycle
**Status:** DECIDED

## PED-021 — أوضاع التوليد تحافظ على قدرات القديم

وظائف AI authoring الموجودة في القديم تبقى من حيث النتيجة ولا تختصر، مع إعادة بناء العقود والتنفيذ. تشمل على الأقل وفق inventory الحالي:

- Summary generation؛
- Question generation؛
- MCQ؛
- True/False؛
- Mixed question sets؛
- extraction/from-source modes؛
- page/image-selected generation (internally OCR-text-first with vision fallback only when required)؛
- regenerate؛
- generate alternate version؛
- exam/model generation؛
- exact/replica modes where source contract requires it؛
- bulk generation؛
- source/page evidence، answer، explanation، method/difficulty metadata where applicable.

كل Mode يملك prompt version + input/output schema + semantic validator + golden tests. لا silent defaulting لإجابة غير واضحة.

**Classification:** KEEP outcomes + REBUILD contracts/execution
**Status:** DECIDED

# القرارات المعتمدة — Batch 03

## PED-022 — Reader بصري أساسي + Text View اختياري

صفحات الكتاب الأصلية/المعالجة تبقى العرض الأساسي ومصدر الحقيقة المرئي. بجانبها يوجد خيار واضح لعرض **النص المقروء** المستخرج/المعتمد من OCR.

على الهاتف يكون الانتقال غالبًا Toggle بين `الصفحة` و`النص`، وعلى الشاشات الواسعة يمكن دعم عرض جانبي عندما يفيد دون ازدحام.

النص لا يستبدل الصفحة الأصلية في المحتوى الذي يحتاج دقة شكلية مثل الرياضيات والكيمياء والجداول والنصوص exact؛ هو view إضافي للقراءة والبحث والوصول.

**Classification:** NEW + IMPROVE Reader
**Status:** DECIDED

## PED-023 — استماع للدرس عبر خدمة TTS / Voice Model

نضيف للـReader خيار **استماع للدرس** يحول النص المنشور/المعتمد للدرس إلى صوت عربي واضح عبر provider abstraction مستقل عن Gemini generation.

**Efficiency rule:** لا نولد الصوت عند كل Play. الصوت يُولد للـpublished content revision ويُخزن كMedia Asset مشتق مع provider/model/voice/version/checksum/duration/source revision metadata، ثم يعاد استخدامه. إذا تغير النص المنشور تصبح النسخة الصوتية القديمة stale ويعاد توليدها عند الحاجة.

**UX target:** Play/Pause، seek، سرعة تشغيل مناسبة، واستمرار من الموضع الأخير. تنزيل الصوت للأوفلاين اختياري ضمن Download Manager.

**Correctness:** TTS يستخدم النص المعتمد/المراجع، لا OCR خام منخفض الثقة. Provider/voice selection يحتاج benchmark عربي قبل التنفيذ النهائي.

**Classification:** NEW
**Status:** Product + architecture DECIDED / provider & voice PENDING

## PED-024 — البحث داخل الكتاب/الدرس مطلوب

Search يستخدم OCR/published text index مع Arabic normalization ويربط كل نتيجة مباشرة بالـlesson/page/source position.

```text
query
→ normalized search
→ matching lesson/page/snippet
→ open exact page/text location
```

للمحتوى المنزّل يمكن توفير local search index حتى يعمل البحث الأساسي Offline بدون API request لكل بحث. البحث الشامل عبر كل المحتوى يمكن أن يستخدم Backend index مع pagination/ranking.

**Classification:** NEW + IMPROVE discovery
**Status:** DECIDED

## PED-025 — لا Highlights مستقلة في النسخة الحالية

لا نضيف نظام text/page highlighting مستقل الآن. الملاحظات والمفضلة و`يحتاج مراجعة` تكفي للاستخدام الشخصي المطلوب وتمنع تعقيد annotation/coordinate sync بدون قيمة مؤكدة.

**Classification:** REMOVE from current scope
**Status:** DECIDED

## PED-026 — الطالب يبني اختباره من بنك أسئلة منشور فقط

الطالب يستطيع إنشاء اختبار/تدريب مخصص باختيار عناصر مثل:

- المادة؛
- درس أو عدة دروس؛
- عدد الأسئلة ضمن الحدود المتاحة؛
- أنواع الأسئلة المتوفرة؛
- إعدادات الاختبار المسموحة.

**قاعدة أساسية:** كل الأسئلة تأتي من **Question Bank منشور ومراجع مسبقًا من Admin**. لا Live Gemini generation للطالب أثناء إنشاء الاختبار.

Backend/Practice Engine يختار session من published question IDs وفق filters، مع randomization/shuffle deterministic وآمن وتسجيل question/version identity. لا يتم شحن بنك الأسئلة الكامل مع answer keys إلى Browser بلا حاجة.

**Classification:** KEEP outcome + REBUILD execution
**Status:** DECIDED

## PED-027 — النماذج الوزارية الأصلية مستقلة عن المحاكاة

النموذج الوزاري الأصلي يحفظ **كما هو** مع provenance/version/year/round/source/order وصور/أسئلة الأصل حسب المصدر، ولا يخلط مع محتوى مولد.

نوع منفصل باسم واضح للمحاكاة يمكن إضافته/توسيعه مستقبلًا:

```text
Original Ministerial Model
≠
Simulated Model
```

المحاكاة إذا فُعلت لاحقًا تستخدم Question Bank/AI reviewed content وتحمل label صريح أنها محاكاة وليست نسخة أصلية.

**Classification:** KEEP original + NEW simulation type later
**Status:** Original DECIDED / simulation implementation DEFERRED

## PED-028 — سياسة Offline Download عملية ومحدودة

بما أن Product Owner فوّض اختيار الأنسب، نعتمد السياسة التالية:

- تنزيل **درس منفرد** مدعوم؛
- تنزيل **مادة كاملة** مدعوم؛
- تنزيل **كتاب كامل** مدعوم عندما يكون Resource مستقلًا وحجمه ضمن budget، وبطلب صريح من الطالب؛
- لا تنزيل تلقائي لكل المنهج؛
- قبل التنزيل نعرض الحجم المتوقع والمساحة؛
- Download Manager يدعم progress/retry/cancel/remove؛
- media/text/audio المنزلة مرتبطة بالحساب + registered device + content revision؛
- eviction policy واضحة للمحتوى القديم وغير المستخدم؛
- Student shell والبيانات الأساسية الصغيرة تُزامن تلقائيًا، أما media الثقيلة فهي explicit download.

**Classification:** KEEP Offline + REBUILD download UX/storage policy
**Status:** DECIDED

## PED-029 — Offline authorization lease = 14 يومًا كحد أقصى

بعد Online validation ناجح يصدر Backend snapshot/lease موقّع مرتبطًا بالحساب والجهاز والصلاحية.

```text
valid_until = min(now + 14 days, entitlement_expiry)
```

أثناء وجود اتصال يتم تجديده بدون طلبات زائدة وفق sync lifecycle. بعد انتهاء الـ14 يومًا يحتاج التطبيق اتصالًا لتجديد صلاحية الوصول للمحتوى المحمي. Revoke من Admin لا يمكن الوصول لجهاز غير متصل فورًا؛ أسوأ نافذة Offline مقصودة هي مدة lease المتبقية، مع عدم تجاوز expiry الأصلي.

**Classification:** NEW explicit Offline security rule
**Status:** DECIDED

## PED-030 — توقيت Feedback في «اختبر نفسك» ما زال مفتوحًا

لم يُحسم بعد هل يظهر التصحيح/الشرح بعد كل سؤال مباشرة أم بعد إنهاء مجموعة Practice. لا نفترض القرار. الاختبار الكامل والنموذج يبقيان separate assessment flows.

**Status:** PENDING

# المحاور الحالية بعد Batch 03

## A. Product / audience

Student + Admin هما النطاق المؤكد حاليًا. Teacher/Parent غير معتمدين الآن.

**Status:** MOSTLY DECIDED

## B. Account / access

- Full Code 6 digits baseline مستمر.
- Class Code 7 digits baseline مستمر.
- activation two-step.
- returning login via «لدي حساب بالفعل».
- Admin-assisted temporary-password recovery.
- single registered device policy.
- expiry/renewal/multiple class entitlements ما تزال تحتاج مراجعة تفصيلية إذا سنغير قواعد Stage 7 الحالية.

**Status:** PARTIALLY DECIDED

## C. Curriculum/content structure

Flexible explicit hierarchy direction PED-018 مع Admin add/reorder. Curriculum year/version وarchive/update semantics تحتاج حسمًا.

**Status:** PARTIALLY DECIDED

## D. Student Home/navigation

يجب أن يسهّل Continue Learning + المنهج + الاختبارات/النماذج + الملخصات + البيانات الشخصية بدون ازدحام. التفاصيل البصرية/IA تحتاج prototype/decision لاحق.

**Status:** PARTIALLY DECIDED

## E. Reader

معتمد الآن: original page view + optional OCR text view + search + TTS/audio + zoom/pan/navigation + notes/favorites، وبدون Highlights مستقلة. Page jump/reading settings/audio exact UX تحتاج prototype ضمن Student Product لا Business Rule جديدًا.

**Status:** CORE DECIDED

## F. Practice / Tests / Models / Summaries

القدرات الأساسية معتمدة. الطالب يستطيع custom test من **published Admin-reviewed Question Bank فقط**. Original ministerial models تبقى exact؛ simulation نوع منفصل لاحقًا. Timing/scoring/review semantics التفصيلية تحتاج حسمًا، وأهم نقطة مفتوحة حاليًا هي Practice feedback timing.

**Status:** CORE DECIDED / DETAILS PENDING

## G. Student AI

لا Live AI generation للأسئلة أثناء استخدام الطالب. Admin AI/OCR authoring هو المصدر المنشور. أي Chat/AI explanation مباشر للطالب يحتاج قرارًا مستقلًا لاحقًا.

**Status:** PARTIALLY DECIDED

## H. Notes / Favorites / Review-later

الأنواع منفصلة وفق PED-016. Highlights غير مطلوبة. أنواع media للملاحظات وsync conflict UX تحتاج قرارًا تفصيليًا.

**Status:** CORE DECIDED / DETAILS PENDING

## I. Progress/Achievements

Personal progress + private achievements معتمدة؛ Global Leaderboard غير مطلوب. تعريف mastery/weak areas/recommendations يحتاج review.

**Status:** PARTIALLY DECIDED

## J. Notifications

**Status:** PENDING

## K. Offline/PWA

Offline أساسي. Lesson + Subject + explicit full-book downloads معتمدة، وOffline authorization lease = 14 days capped by entitlement expiry. Storage budgets exact numbers/conflict UX تحتاج implementation tuning واختبار أجهزة حقيقي.

**Status:** CORE DECIDED

## L. Admin roles/permissions

**Status:** PENDING

## M. Admin content/media

Add/reorder curriculum + upload independent of AI + OCR async + Draft/Review/Published معتمدة. TTS derived audio يعتمد على published/approved text ولا يحظر upload. Versioning/replacement/archive والتعامل مع updates تحتاج review.

**Status:** PARTIALLY DECIDED

## N. Admin AI authoring

الأنواع legacy-capability-complete وفق PED-021، text-first OCR input، durable scheduler، Admin review mandatory. UX/batch limits/provider/model policies تحتاج review.

**Status:** CORE DECIDED / DETAILS PENDING

## O. Quiz Builder / Content QA

يجب أن يدعم manual edit، validation، source/page، difficulty، duplicates، answers/explanations، preview، versions، ونشر الأسئلة إلى Question Bank الذي يستهلكه الطالب. التفاصيل تحتاج نقاش.

**Status:** PENDING DETAILED REVIEW

## P. Students/Codes/Support

Account lookup، temporary password reset، device reset/rebind مطلوبة. bulk/session/audit details تحتاج review.

**Status:** PARTIALLY DECIDED

## Q. Reports/Import/Export

Import/Export capability معتمدة، exact reports/scopes/formats تحتاج قرارًا.

**Status:** PARTIALLY DECIDED

## R. Search/discovery

Book/lesson search معتمد باستخدام OCR/published text + Arabic normalization. Admin/global search exact indexing/scopes تحتاج review.

**Status:** PARTIALLY DECIDED

## S. Content lifecycle

Draft → Review → Published معتمد. Curriculum version/year، rollback، archive، scheduled publish/offline invalidation تحتاج review.

**Status:** PARTIALLY DECIDED

# أثر القرارات على الخطة

1. **Product Evolution Review يبقى المرحلة الحالية** حتى نحسم Practice feedback/scoring الأساسية، curriculum versioning، Admin roles وContent QA الأساسية.
2. **Stage 8 Reopen:** two-step activation + temporary-password mandatory change + registered-device key/challenge + device reset/rebind + new Chromium/security E2E.
3. **Stage 10 Preview Sync:** ما زال مطلوبًا بعد تثبيت baseline القرارات.
4. **OCR Extraction Foundation** يسبق الاعتماد الكامل على AI authoring؛ مستقل عن Upload.
5. **Reader Product** يجب أن يدعم page/text dual view، OCR search، cached TTS audio، notes/favorites وOffline downloads.
6. **Stage 11 AI Contracts** يحافظ على جميع generation modes ذات القيمة ويستخدم OCR text + provenance كinput افتراضي.
7. **Stage 12 Durable AI** يطبق job queue/scheduler/retry/cooldown/failover/metrics/idempotency.
8. **Admin Product** يتضمن flexible curriculum، independent upload، OCR/TTS derived-state visibility، Draft/Review/Published، AI review، import/export.
9. **Student Product** يتضمن Welcome/returning login، curriculum/reader، summaries، self-practice، custom tests from published Question Bank، original models، notes/favorites/review-later، personal progress/achievements.
10. **Offline/PWA** Requirement أساسي: account/device-scoped cache + revisions + outbox + explicit bounded downloads + 14-day authorization lease.
11. لا Feature legacy ذات قيمة تُحذف بدون قرار صريح موثق.

# قرارات نحتاجها في الجلسات التالية

- Practice: feedback after each question vs end of practice؛ scoring/timing/review semantics.
- Curriculum: year/version، archived editions، content replacement/update rules.
- Admin roles: Super Admin فقط أم Content Editor/Support/Reviewer وغيرها.
- Quiz Builder/Content QA exact workflow and duplicate/source validation UX.
- Notes: text/image/capture/audio وما الذي نطلقه أولًا.
- Notifications exact categories/channels.
- Reports/Import/Export exact scopes/formats.
- Student AI: هل نضيف شرح مباشر/Chat مقيد بالمصدر أم نكتفي بالمحتوى المنشور في البداية.

## الحالة

`PRODUCT REVIEW IN PROGRESS / BATCHES 01–03 RECORDED / READER+SEARCH+TTS+QUESTION-BANK+OFFLINE CORE DECIDED / NO FEATURE REMOVAL WITHOUT OWNER DECISION`
