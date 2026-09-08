# TEAM OPERATING MODEL — الوسيلة الذكية

> هذا الملف يعرّف طريقة عمل فريق المشروع الدائم. GitHub هو الذاكرة المشتركة ومصدر الأوامر والتقارير بين المحادثات. لا تعتمد أي محادثة على chat memory لتعرف ما الذي يجب فعله.

## 1. هدف الفريق

نبني أفضل نسخة من **نفس منتج الوسيلة الذكية** مع الحفاظ على Business Goals والـUser Flows والنتائج المهمة للمستخدم، مع تحسين Architecture/UX/Security/Performance/Maintainability دون Overengineering.

المنتج يتكوّن من:

- `apps/student-web`: Student Web/PWA.
- `apps/admin-web`: Super Admin Web مستقل.
- `apps/api`: Fastify API والـserver business authority.
- PostgreSQL migrations كسلطة schema/integrity.
- Content provenance → media → OCR → AI → reviewed/published content.
- secure activation/access/device-bound Student authentication.
- Admin curriculum/content/AI/question-bank/operations.
- Student learning/assessment/offline/personal data/notifications/progress في المراحل اللاحقة.

## 2. Source of Truth

أي عضو يبدأ من `DOCUMENTATION_INDEX.md` ويتبع ترتيب القراءة الموجود فيه.

الأولوية عند التعارض:

1. current code + migrations + executable CI evidence.
2. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`.
3. `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`.
4. Product Decisions.
5. specialized stage/module docs.
6. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`.
7. `MASTER_REBUILD_ROADMAP.md`.
8. legacy code/docs كمرجع تاريخي فقط.

أي شيء لم يُفحص/يُنفذ/يُختبر = `NOT YET VERIFIED`.

## 3. Workstreams الدائمة

### Backend / Platform

Command Board: GitHub Issue `#14`.

يمتلك:
- PostgreSQL/migrations/data integrity;
- Fastify API/business services;
- Auth/authorization/access;
- content/media/OCR server contracts;
- durable AI jobs/workers/providers;
- assessment/trusted scoring backend;
- sync/offline server contracts;
- notifications/statistics/export backend;
- backend security/performance/observability;
- unit/integration/PostgreSQL tests.

### Frontend / Product

Command Board: GitHub Issue `#15`.

يمتلك:
- `apps/admin-web`, `apps/student-web`;
- Design System/UX/IA;
- forms/state/API integration;
- loading/error/empty/offline states;
- responsive RTL/a11y;
- PWA/client offline UX;
- Reader/Practice/Quiz/Notifications/Statistics interfaces;
- frontend performance;
- browser/component tests.

### Integration / Architecture / QA / Release

Board: GitHub Issue `#16`.

يمتلك:
- architecture coherence;
- commands/priorities للفرق;
- cross-team contract approval;
- code review/merge/integration;
- same-head regression/E2E;
- Security/Performance/UX/Legacy Coverage gate;
- central documentation;
- Preview/Release بعد إعادة تفعيل deployment.

### Team Room

GitHub Issue `#13` هي غرفة النقاش المشتركة.

تستخدم فقط عندما يوجد موضوع يعبر حدود فريق واحد: contract, blocker, business rule, architecture proposal, integration failure أو قرار مشترك.

## 4. كيف تصل الأوامر

لكل فريق Board ثابت. Integration Lead يضع آخر أمر بصيغة:

```md
### COMMAND
Stage/Feature:
Base HEAD:
Scope:
Required reading:
Required output/contracts:
Do not change:
Acceptance tests:
Cross-team dependency:
Priority:
```

**آخر COMMAND هو الأمر الحالي**. إذا تعارض مع أمر أقدم فهو الذي يسود.

قبل أي batch، الفريق يقرأ Board الخاصة به ثم Team Room عند وجود نقاش مفتوح.

## 5. كيف تُرفع التقارير

بعد كل batch ذات معنى، الفريق:

1. يدفع commits صغيرة ومنطقية إلى branch قصيرة.
2. يحدّث workstream file الخاص به داخل المستودع.
3. يضع `REPORT` في Board الخاصة به مع commits/tests/blockers/NOT YET VERIFIED.
4. يرفع أي cross-team ambiguity إلى Team Room بدل التخمين.

لا يُعتبر كلام chat تقريرًا رسميًا.

## 6. Branch strategy

لا توجد branches دائمة طويلة العمر باسم backend/frontend.

استخدم branches قصيرة من أحدث Integration-approved HEAD:

- `backend/<stage>-<feature>`
- `frontend/<stage>-<feature>`
- `integration/<stage>-<feature>` عند الحاجة

مثال:

- `backend/stage13e-ai-operations`
- `frontend/stage13e-ai-operations`

بعد الدمج تنتهي branch، لكن نفس محادثة الفريق تستمر إلى المهمة التالية.

السبب: تقليل divergence وmerge conflicts ومنع أن يصبح frontend/backend مشروعين منفصلين.

## 7. Contract First

أي feature مشتركة يجب أن تحدد قبل التوسع:

- business rule;
- state authority;
- endpoint/action;
- request/response;
- errors;
- permissions;
- lifecycle/transitions;
- persistence;
- idempotency/concurrency عند الحاجة;
- loading/empty/error behavior;
- provenance/audit عند الحاجة.

Frontend لا يخترع API. Backend لا يغيّر عقدًا مستخدمًا بصمت. أي تغيير cross-team غير بسيط يمر عبر Team Room/Integration Lead.

## 8. Ownership boundaries

### Browser ليس authority للـbusiness state

UI يملك presentation/session UX فقط. Auth, entitlements, durable jobs, publication, trusted scoring, durable progress والعمليات الحساسة تبقى server-owned.

### لا pipeline ثانية

إذا كان Stage9/10/OCR/Stage12 يملك lifecycle، لا ينشئ فريق آخر authority أو queue أو storage موازية لمجرد سهولة التنفيذ.

### media ready != published

المعالجة الناجحة لا تعني النشر. Draft → Review → Published عقد صريح.

### AI raw output != student authority

AI output يحتاج contract/review/publish authority المناسب قبل أن يصبح محتوى طالب أو Question Bank منشورًا.

## 9. Self-review قبل التسليم

كل فريق مسؤول أن يراجع عمله كـSenior reviewer، لا أن ينتظر Integration Lead لاكتشاف الأخطاء الأساسية.

افحص دائمًا:

- correctness/business rules;
- callers/dependencies/side effects;
- validation/authorization;
- errors/failure/retry states;
- data consistency/idempotency/concurrency;
- security/secrets;
- performance/unbounded work/N+1/re-renders/network noise;
- UX/accessibility/responsive عند الواجهة;
- tests تغطي scenario لا Build فقط;
- legacy capability affected;
- documentation/evidence.

## 10. Integration Gate

`Backend Ready` + `Frontend Ready` لا يساوي Stage VERIFIED.

Stage تصبح VERIFIED فقط بعد:

1. code/contracts reviewed;
2. integration performed;
3. cross-boundary tests executed;
4. required CI green على نفس HEAD;
5. Legacy Coverage updated;
6. central docs synchronized;
7. remaining work marked `NOT YET VERIFIED`.

Integration Lead قد يعيد العمل إلى أي فريق إذا وجد root issue، حتى لو tests المحلية خضراء.

## 11. Documentation ownership

### Integration Lead فقط يحدث عادةً

- `PROJECT_STATUS.md`
- `PROJECT_ENGINEERING_LOG.md`
- `PROJECT_HANDOFF.md`
- `DOCUMENTATION_INDEX.md`
- `MASTER_REBUILD_ROADMAP.md`
- final Legacy Coverage status

### Backend/Frontend يحدثان

- workstream file الخاص بهما;
- specialized module docs التي يملكانها;
- implementation/tests evidence في Board الخاصة بهما.

الهدف منع conflicts وتعدد مصادر الحقيقة.

## 12. Team communication rule

لا يوجد تبادل تلقائي بين المحادثات ولا عمل في الخلفية. عندما تُستأنف محادثة Backend أو Frontend يجب أن تقرأ GitHub لتعرف آخر الأوامر/القرارات، ثم تعمل وتكتب النتيجة في GitHub. المحادثة الرئيسية تقرأ هذه التقارير عند الإشراف والدمج.

GitHub هو "مجموعة الفريق" وذاكرته المشتركة.

## 13. Release policy

حاليًا deployment = `DEFERRED BY PRODUCT OWNER`.

عند إعادة تفعيله لاحقًا، Integration/Release workstream وحده يقرر التسلسل:

```text
integrated HEAD
→ full CI/regression
→ Preview deployment
→ real runtime/browser verification
→ fixes
→ release candidate
```

لا ينشر Backend أو Frontend منفردًا نسخة يعلنها جاهزة للإطلاق.
