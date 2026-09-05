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

## ما تم تثبيته هندسيًا حتى الآن

هذه ليست بالضرورة Business Rules نهائية إلى الأبد، لكنها baseline منفذة ومختبرة:

- private PostgreSQL خلف Backend API؛ لا اتصال مباشر من المتصفح.
- Auth server-side مع scrypt وopaque sessions وHttpOnly cookies.
- Admin/Student authorization boundaries.
- transactional/idempotent access-code redemption.
- current Full Code contract = 6 digits.
- current Class Code contract = 7 digits.
- current first Student activation flow uses Full Code + password.
- current returning Student identifier is the normalized Full Code + password.
- recovery is reset-only ولا يكشف كلمة المرور القديمة.
- deterministic `alwaslh-go` source inventory/import with provenance/order.
- server-owned deterministic media pipeline with Sharp/Poppler, checksums, variants and failure cleanup.

إذا قرر المنتج تغيير أي نقطة من هذه، نعيد فتح الجزء المتأثر رسميًا.

## محاور المراجعة — PENDING

سنناقشها واحدًا واحدًا، وليس دفعة واحدة، حتى لا تختلط القرارات.

### A. هوية المنتج والجمهور

- من هو المستخدم الأساسي؟
- هل المنتج للطالب فقط أم الطالب + ولي الأمر + المعلم؟
- هل Admin داخلي لفريق المحتوى فقط أم توجد أدوار إدارة متعددة؟
- ما القيمة الأساسية التي يجب أن يحققها التطبيق يوميًا؟
- ما الذي يجب أن يفعله أفضل من أي PDF/كتاب/اختبار تقليدي؟

**Decision:** PENDING

### B. الحساب والتفعيل والوصول

- هل نحتفظ بنظام Full Code / Class Code؟
- هل Full Code يجب أن يبقى معرف الحساب بعد التفعيل؟
- هل نريد username/phone/email أو لا؟
- هل الحساب فردي دائم أم مرتبط باشتراك/جهاز/صف؟
- renewal، expiry، multiple class access، transfer، revoke.
- recovery/help/support flow.

**Decision:** PENDING

### C. الصفوف والمواد والمحتوى

- هيكل `class → subject → lesson` أم نموذج أبسط/أغنى؟
- الكتب الحكومية/الملازم/الاختبارات الوزارية.
- ترتيب الدروس والصفحات.
- المحتوى الرسمي مقابل المحتوى المولد/الإضافي.
- تحديثات المناهج والإصدارات السنوية.

**Decision:** PENDING

### D. الصفحة الرئيسية والتنقل للطالب

- ماذا يرى الطالب أول دخول يومي؟
- متابعة آخر درس أم جدول مواد أم أهداف؟
- بحث؟ مفضلة؟ وصول سريع؟
- هل نعرض progress أم نبقي الواجهة شديدة البساطة؟

**Decision:** PENDING

### E. Reader / تجربة الدراسة

- عرض صفحات الكتاب كصور أم PDF/HTML/hybrid؟
- zoom/pan/navigation.
- table of contents / page jump / search.
- summary / explain / ask AI / highlights.
- notes داخل الصفحة أو خارجها.
- dark mode وreading settings.

**Decision:** PENDING

### F. Practice / Questions / Quizzes

- الفرق بين Practice السريع والاختبار الكامل.
- MCQ / True-False / written / image questions.
- randomization / versions / multi-lesson tests.
- hints/explanations.
- resume/restart.
- timing.
- scoring/attempt history.
- الامتحانات الوزارية كما هي أم نمط محاكاة مختلف.

**Decision:** PENDING

### G. AI داخل تجربة الطالب

- هل الطالب يرى AI مباشرة؟
- شرح سؤال؟ تلخيص صفحة؟ توليد تدريب؟ سؤال حر؟
- أين نمنع hallucination أو نطلب مصدرًا؟
- هل نسمح بإجابات من خارج المنهج؟
- حدود الاستخدام والتكلفة.

**Decision:** PENDING

### H. Notes / Saved / Personal Learning

- text notes.
- image/capture notes.
- audio notes.
- saved questions/bookmarks.
- highlights.
- folders/tags أم بساطة أكبر.
- sync across devices أم local-first فقط.

**Decision:** PENDING

### I. Statistics / Progress / Achievements

- هل نحتاج gamification أصلًا؟
- streaks / badges / rank / leaderboard.
- mastery by subject/lesson.
- weak areas.
- recommendations.
- ما الذي يفيد الطالب فعلًا وما الذي يسبب ضوضاء؟

**Decision:** PENDING

### J. Notifications

- ما الذي يستحق إشعارًا؟
- content updates.
- study reminders.
- Admin announcements.
- expiry/access notices.
- achievements.
- push notifications أم in-app فقط في البداية.

**Decision:** PENDING

### K. Offline / PWA

- هل Offline requirement أساسي لجميع المحتوى أم اختيار تنزيل؟
- تنزيل كتاب/مادة/درس.
- storage limits.
- sync attempts/notes.
- install flow.
- ماذا يعمل دون إنترنت وماذا لا يعمل؟

**Decision:** PENDING

### L. Admin roles and permissions

- Super Admin فقط أم Content Editor / Support / Analyst وغيرها؟
- من يدير الطلاب والأكواد؟
- من يرفع/يحرر المحتوى؟
- من يشغل AI؟
- audit trail.

**Decision:** PENDING

### M. Admin curriculum/content workflow

- إضافة صف/مادة/درس.
- استيراد مصدر `alwaslh-go`.
- رفع PDF/images/mixed.
- page ordering/reordering.
- versioning.
- draft/review/publish.
- replace/reprocess.
- delete/archive.

**Decision:** PENDING

### N. Admin AI authoring

- ما أوضاع AI التي نريدها فعلًا؟
- summary generation.
- question extraction/generation.
- quiz generation.
- exam replica.
- regenerate/version.
- bulk operations.
- human review/approval.
- confidence/source/page evidence.

**Decision:** PENDING

### O. Quiz Builder / Content QA

- manual editing after AI.
- question bank.
- tags/difficulty/source/page.
- duplicate detection.
- validation for answer/explanation.
- preview before publish.
- versions.

**Decision:** PENDING

### P. Students / Codes / Support in Admin

- account lookup.
- reset/recovery.
- revoke sessions/access.
- code batches.
- code import/export.
- activation history.
- support notes/audit.

**Decision:** PENDING

### Q. Reports / Export

- ما التقارير المطلوبة فعلًا؟
- code cards.
- quiz sheets/answer keys.
- student progress.
- Excel/CSV/PDF.
- admin audit/history.

**Decision:** PENDING

### R. Search and discovery

- Student search across subjects/lessons/questions.
- Admin search across content/students/codes.
- Arabic normalization.
- filters/facets.

**Decision:** PENDING

### S. Content lifecycle and publishing

- draft → review → published → archived.
- scheduled publishing?
- curriculum year/version.
- rollback/version history.
- content invalidation for offline clients.

**Decision:** PENDING

### T. New product ideas

أي أفكار جديدة غير موجودة في القديم توضع هنا وتُقيّم بقيمة المستخدم والتكلفة والتعقيد.

**Decision:** PENDING

## قالب تسجيل كل قرار

لكل محور بعد النقاش نسجل:

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

## تأثير هذه المراجعة على الخطة

- Stages 1–10 تبقى baseline هندسية مثبتة ما لم يقرر النقاش تغيير Business Rule فيها.
- Stage 11 وما بعدها **غير مجمدة بصورتها الحالية**؛ ترتيبها ونطاقها يمكن أن يتغير بناءً على هذه المراجعة.
- `MASTER_REBUILD_ROADMAP.md` سيُحدث بعد كل مجموعة قرارات مترابطة، لا بعد تخمينات.
- `PRODUCT_FEATURE_PARITY_MATRIX.md` سيصبح Decision Inventory: كل Feature يجب أن تحمل قرارًا صريحًا بدل افتراض KEEP تلقائي.

## الحالة الحالية

`PRODUCT REVIEW IN PROGRESS / NO NEW FEATURE IMPLEMENTATION UNTIL DECISIONS ARE RECORDED`
