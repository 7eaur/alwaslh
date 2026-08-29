# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية الرئيسية لبناء أفضل نسخة من نفس المنتج مع الحفاظ على Feature Parity كاملة، هوية جديدة، Admin مستقل، Student مستقل، Backend أقوى، Offline أكثر موثوقية، وAI Generation قابل للتوسع.

## 0. المبادئ الحاكمة

1. لا نحذف أي Feature أو User Flow مهم من المنتج الحالي دون بديل موثق.
2. `alwaslh` هو مرجع السلوك الحالي، الـBusiness Rules، والـUser Flows.
3. `alwaslh-go` هو Content Source Repository للكتب، الصور، النماذج الوزارية، والفهارس.
4. قاعدة البيانات الفعلية بعد ربطها تصبح مرجعًا إضافيًا للتحقق، وليس بديلًا عن migrations قابلة لإعادة الإنشاء.
5. Production Security وData Integrity تأتي قبل Visual Polish، لكن Brand/Product Design يبدأ مبكرًا حتى لا نبني UI بلا نظام.
6. لا Whole Rewrite أعمى. نعيد بناء subsystems الفاسدة جذريًا، ونحافظ على الأجزاء الجيدة.
7. كل مرحلة لها Definition of Done واختبارات واضحة قبل الانتقال.
8. Feature Parity Matrix هي بوابة منع نسيان أي ميزة قديمة.

---

# Target Product Architecture

```text
apps/
  admin-web/
  student-web/

packages/
  ui/
  brand/
  domain/
  data/
  validation/
  ai-contracts/
  testing/

supabase/
  migrations/
  functions/
  tests/

content/
  import-contracts/
  manifests/
  tooling/
```

## Admin Web

واجهة تشغيل وإدارة مستقلة، data-dense، سريعة، واضحة، وموجهة لسطح المكتب أولًا مع Responsive مناسب.

## Student Web

PWA خفيف، touch-first، mobile-first، يركز على القراءة، الدراسة، الاختبارات، الملاحظات، التقدم، والعمل Offline.

## Shared Packages

تشترك الواجهتان في الهوية، الـdomain types، validation، وبعض UI primitives فقط. لا نشارك feature state أو bundles ثقيلة بلا داعٍ.

---

# المرحلة 1 — Product Freeze & Feature Inventory

## الهدف

تثبيت كل ما يجب أن يحافظ عليه المنتج قبل كتابة النسخة الجديدة.

## العمل

- حصر كل Routes الحالية.
- حصر كل Admin features.
- حصر كل Student features.
- حصر كل Edge Functions وRPCs.
- حصر كل جداول البيانات وStorage buckets.
- حصر كل Offline behavior.
- حصر كل AI task types والقواعد الخاصة بكل نوع.
- حصر كل Export formats.
- حصر كل onboarding/install/reset/recovery scenarios.
- ربط كل بند بـ `PRODUCT_FEATURE_PARITY_MATRIX.md`.
- تصنيف كل بند: KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE.

## Definition of Done

- لا توجد Feature حالية مهمة بدون بند في Feature Parity Matrix.
- كل User Flow له Expected Outcome واضح.
- كل Business Rule غير مؤكد معلّم `NOT YET VERIFIED`.

---

# المرحلة 2 — Database Reality Verification

> تبدأ فور ربط منصة قاعدة البيانات.

## الهدف

معرفة الواقع الفعلي للإنتاج ومقارنته بالمستودع.

## العمل

- Inventory للجداول، الأعمدة، الأنواع، indexes، constraints، FKs.
- Inventory لكل RLS policy.
- Inventory لكل function / trigger / RPC.
- Inventory للـStorage buckets والسياسات.
- Inventory للـRealtime publications.
- مقارنة DB الفعلية مع migrations `00001...`.
- اكتشاف schema drift.
- تصنيف البيانات القديمة/Legacy التي يجب ترحيلها.
- أخذ Backup/Export قبل أي destructive migration.

## مخرجات

- `DATABASE_REALITY_AUDIT.md`
- Schema map نهائية.
- RLS matrix نهائية.
- Migration plan مع rollback strategy.

## Definition of Done

- نستطيع إنشاء staging DB جديدة من migrations وتكون متوافقة مع البيانات المطلوبة.
- كل drift معروف ومصنف.
- لا يوجد migration نهائي مبني على افتراض.

---

# المرحلة 3 — Brand Strategy & New Identity

## الهدف

إنشاء هوية واحدة قوية للمنتج قبل بناء الواجهات النهائية.

## العمل

### Brand foundation

- Logo direction.
- Wordmark Arabic.
- App icon.
- Primary/secondary/neutral palette.
- Semantic colors: success/warning/error/info.
- Typography system عربي واضح.
- Iconography rules.
- Illustration/empty-state direction إن احتجنا.

### Design tokens

- spacing scale.
- radius scale.
- shadows/elevation.
- borders.
- typography sizes/weights/line heights.
- responsive breakpoints.
- motion durations/easings.
- z-index layers.

### Accessibility baseline

- WCAG contrast.
- minimum body/font sizes.
- focus ring.
- touch target sizes.
- browser zoom allowed.
- reduced motion.
- RTL behavior.

## مخرجات

- Brand assets داخل repository.
- `packages/brand`.
- Design tokens.
- Figma/visual reference إذا تم توفيرها أو بناؤها لاحقًا.

## Definition of Done

- لا تعتمد الواجهات الجديدة على Miaoda remote branding.
- Admin وStudent يبدوان من نفس العلامة مع اختلاف كثافة الاستخدام.

---

# المرحلة 4 — UX Information Architecture

## Admin IA

```text
Overview

Content
  Classes & Subjects
  Lessons
  Upload & Processing

Assessments & AI
  Quizzes
  AI Operations

Students & Access
  Students
  Full Access Codes
  Class Codes

Communication
  Notifications

Reports
  Export History

System
  Settings
  Security
```

## Student IA

```text
Home
Lessons
Quizzes
Notes / Saved
Progress
More
```

## Student lesson experience

```text
Lesson Reader
  Content
  Summary
  Practice
  Notes
  Reader Preferences
```

## العمل

- إعادة رسم كل Current User Flow.
- Wireframes لكل flow مهم.
- Empty/loading/error/offline states.
- Mobile navigation.
- Desktop admin navigation.
- Confirmation/destructive flows.
- Forms validation UX.

## Definition of Done

- كل Feature في parity matrix لها مكان واضح في IA الجديدة.
- لا توجد شاشة بسبب أن النظام القديم كان يملك شاشة؛ كل شاشة لها وظيفة.

---

# المرحلة 5 — Engineering Foundation / Monorepo

## الهدف

بناء أساس نظيف قبل نقل الـfeatures.

## العمل

- إعداد workspace/monorepo مناسب بدون تعقيد زائد.
- `admin-web` و`student-web` build مستقلين.
- Shared tsconfig/eslint/biome configuration.
- Full TypeScript strict.
- Environment validation عند startup/build.
- Error boundaries.
- structured logging.
- API error contract موحد.
- Zod schemas للبيانات الحرجة.
- test setup.
- CI pipeline fail-fast.

## CI المطلوب

```text
install
→ lint
→ typecheck
→ unit tests
→ DB/RLS tests
→ integration tests
→ build admin
→ build student
```

## Definition of Done

- Branch protection يعتمد checks.
- لا floating dependencies حرجة.
- Builds reproducible.

---

# المرحلة 6 — Authentication & Authorization Rebuild

## الهدف

إصلاح أخطر subsystem مع الحفاظ على نفس النتائج المطلوبة للمستخدم.

## Admin

- Admin Auth حقيقي عبر Supabase Auth.
- Role enforcement server-side/RLS.
- حذف default credential من source/UI.
- Settings/Security منفصلة.

## Student

- 6-digit activation code يبقى كـBusiness Flow.
- activation عملية server-side atomic/idempotent.
- لا `profiles.password`.
- لا reversible password retrieval.
- recovery = secure reset، وليس كشف السر القديم.
- device fingerprint لا يستخدم كإثبات أمني.

## Authorization

- إسقاط permissive legacy policies صراحةً.
- بناء RLS matrix:
  - anon
  - student A
  - student B
  - admin
  - service role only where required

## Definition of Done

- P0 authorization findings مغلقة.
- RLS automated tests تمر.
- لا يوجد student يستطيع قراءة/تعديل بيانات Student آخر أو admin tables.

---

# المرحلة 7 — Entitlement & Activation Codes

## الهدف

فصل Authentication عن Content Entitlement.

## نموذج مقترح

```text
student_entitlements
  id
  student_id
  scope_type       all_content | class
  class_id
  source_type      full_code | class_code | admin
  source_id
  status
  starts_at
  expires_at
  revoked_at
  created_at
```

## Full Access Code

- 6 digits.
- single redemption/defined lifecycle.
- generated server-side using secure randomness.
- pagination/search server-side.
- import validation exact.
- no password display.

## Class Code

- 7 digits.
- redemption atomic.
- checks used/expiry/status.
- entitlement generated server-side.

## Definition of Done

- UI hiding is not the security boundary.
- Direct API/storage access cannot bypass entitlement.
- code lifecycle tested for concurrency and retries.

---

# المرحلة 8 — Content Model & alwaslh-go Integration

## Verified source

`alwaslh-go` contains Yemen curriculum content for Third Secondary and Grade 9, with thousands of JPG/WEBP pages, government exam images, and helper manifests/index files.

## الهدف

تحويله من file repository إلى canonical content import source.

## العمل

- Inventory فعلي لكل subject/book/exam directory.
- Normalize naming conventions.
- Parse page number/title from filenames/manifests.
- حفظ source metadata لكل page.
- Distinguish:
  - curriculum book
  - section/book part
  - government exam
  - year/version
- checksum لكل asset لمنع duplicate upload.
- preserve deterministic ordering.
- build import manifest.

## Content entity direction

```text
classes
subjects
books
content_pages
lessons
exam_sources
assets
```

لا نفرض هذا schema نهائيًا حتى Database Verification، لكنه الاتجاه المنطقي.

## Image strategy

- source original preserved خارج client bundle.
- optimized display variant.
- optional thumbnail variant.
- AI analysis variant.
- metadata: dimensions, bytes, mime, checksum.

## Definition of Done

- يمكن إعادة import المحتوى deterministically.
- ترتيب صفحات الكتاب ثابت.
- لا يعتمد الإنتاج على GitHub raw images مباشرةً إذا كانت Supabase/CDN هي قناة التسليم النهائية.

---

# المرحلة 9 — Media Upload & Processing Pipeline

## الهدف

توحيد رفع PDF/صور ومنع ترتيب الصفحات الخاطئ واستهلاك الذاكرة.

## Pipeline

```text
input
→ validate
→ PDF page extraction
→ stable ordering
→ normalization
→ display variant
→ AI variant
→ upload
→ metadata commit
```

## قواعد

- bounded concurrency.
- retry per asset.
- progress reporting.
- resumable/recoverable where practical.
- no silent reordering.
- no duplicate image compressors بأهداف متناقضة.

## Definition of Done

- اختبار PDF متعدد الصفحات يحفظ order 100%.
- ضغط الصور لا يجعل النص غير مقروء.
- فشل صفحة واحدة لا يفسد بقية batch بلا تقرير واضح.

---

# المرحلة 10 — Gemini / AI Platform Rebuild

## الهدف

الحفاظ على جميع قواعد التوليد مع جعل النظام resilient وقابلًا للمراقبة والتوسع.

## AI task catalog

يشمل كل الأنواع الحالية بعد إعادة inventory النهائية، مثل:

- extract/analyze lesson page.
- summary.
- lesson questions.
- MCQ.
- true/false.
- mixed questions.
- bulk question generation.
- multi-version quizzes.
- regenerate one question.
- replica/exact replica flows.
- exam paper extraction/generation flows.
- source/page references.

## Prompt Registry

```text
prompt_name
version
schema_version
rules
model policy
created_at
status
```

لا تبقى الـPrompts داخل function واحدة ضخمة.

## Output validation

```text
Gemini output
→ JSON/structured parse
→ Zod schema
→ semantic validator
→ scientific/Arabic normalization
→ deduplication
→ save draft
→ admin review/publish
```

لا placeholder answer options ولا default correct answer عند output مكسور.

## Job architecture

```text
Admin request
→ ai_jobs
→ worker/dispatcher
→ provider selection
→ model call
→ validation
→ persist result
→ realtime status
```

إغلاق المتصفح لا يوقف المهمة.

## Multi-key / multi-project

- Credentials server-side only.
- no key in frontend/logs/database plaintext.
- health status.
- weighted selection.
- cooldown.
- retry/backoff.
- 401/403 disables bad credential.
- 429 triggers retry scheduling/cooldown.
- 5xx retry safely.

### Important

عدة API keys داخل **نفس Google project** لا تعني quota مضاعفة لأن limits تكون على مستوى project. التصميم سيفصل `AI Project` عن `Credential` حتى تكون الاستفادة الحقيقية من تعدد المشاريع/tiers أو الاعتمادية، وليس تدوير المفاتيح عشوائيًا.

## Coverage for long sources

```text
source pages
→ deterministic chunks
→ per-chunk jobs
→ coverage verification
→ merge
→ deduplicate
→ final validation
```

لا silent truncation لأول N صورة/character.

## AI Admin Operations screen

يعرض:

- queued
- running
- retrying
- completed
- failed
- cancelled
- task type
- lesson/quiz
- progress
- attempts
- latency
- model
- prompt version
- project alias
- error category
- retry/cancel

## Definition of Done

- AI job يستمر بعد إغلاق الـAdmin browser.
- failure قابل لإعادة المحاولة دون duplicate data.
- جميع rules الحالية ممثلة في Prompt/Validation contracts.
- test corpus حقيقي من المواد المختلفة ينجح ضمن quality gate.

---

# المرحلة 11 — Admin Application Implementation

## ترتيب التنفيذ

1. Admin shell/navigation.
2. Operational dashboard.
3. Classes/subjects.
4. Lessons/catalog.
5. Upload/processing.
6. AI Operations.
7. Quizzes.
8. Students.
9. Access codes.
10. Class codes.
11. Notifications.
12. Export/reporting.
13. Settings/security.

## Dashboard يجب أن يكون حقيقيًا

- active students.
- content counts.
- recent changes.
- code utilization.
- AI queue/failures.
- content health.
- recent administrative activity.

لا placeholder activity.

## Performance

- server pagination.
- server filtering/sorting.
- aggregate/RPC queries للعدادات.
- virtualize large tables only if needed.
- no loading 100k rows to count locally.

## Definition of Done

- جميع Admin parity rows مكتملة.
- responsive/table accessibility verified.

---

# المرحلة 12 — Student Application Implementation

## ترتيب التنفيذ

1. activation/login/recovery.
2. shell/mobile navigation.
3. Home.
4. Lessons list/search/filter.
5. Lesson Reader.
6. Shared PracticeEngine.
7. Quizzes.
8. Notes/Saved Questions.
9. Notifications.
10. Statistics/Achievements/Rank.
11. Class activation.
12. PWA install/offline.

## PracticeEngine واحد

مسؤول عن:

- shuffle via stable option IDs.
- answer state.
- correct/incorrect feedback.
- explanations.
- save question.
- progress.
- resume.
- restart.
- completion.
- score calculation contract.

## Definition of Done

- Lesson practice وQuiz screens يستخدمان engine نفسه.
- resume لا يكرر الإجابة أو يغير score.
- audio note تبقى audio.
- achievement/statistics schema مطابق للـUI.

---

# المرحلة 13 — Offline / PWA Rebuild

## الهدف

Offline predictable وآمن بدل تعدد caches غير المنسق.

## Source of truth

```text
Server
→ authorized manifest/revision
→ sync engine
→ IndexedDB
```

## Offline datasets

- authorized classes.
- authorized subjects.
- authorized lessons/pages metadata.
- quizzes needed offline.
- student-local notes/saved items بحسب القرار النهائي.
- progress/attempt queue بحسب contract واضح.

## Sync identity

```text
account_id
+ entitlement_revision
+ content_revision
```

## Service Worker

- precache application shell only.
- explicit runtime strategies by asset type.
- never classify all Supabase requests as images.
- no sensitive API response Cache-First.
- controlled version/update lifecycle.

## Account switch/privacy

- namespace local data by user.
- logout/reset cleanup tested.
- revoked content removed when online verification occurs.

## Definition of Done

اختبارات حقيقية:

- first install.
- repeat visit.
- offline startup.
- reconnect.
- content deletion.
- content update.
- revoked entitlement.
- account switch.
- storage quota pressure.

---

# المرحلة 14 — Export & Printing

## نحافظ على

- questions + options.
- questions only.
- correct answers.
- answers + explanations.
- answer key.
- lesson images.
- lesson names.
- Excel.
- code cards.
- export history.

## تحسينات

- sanitized/escaped output.
- brand assets local/CDN-owned.
- explicit image export scope instead of silent first-two truncation.
- print CSS.
- Arabic fonts/rendering verified.
- large export memory controls.

---

# المرحلة 15 — Performance Engineering

## Budgets

نحدد thresholds قبل release لـ:

- initial JS.
- route chunk sizes.
- LCP.
- INP.
- CLS.
- admin table query latency.
- lesson open latency cached/uncached.
- offline startup.
- image payloads.

## العمل

- admin/student bundle separation.
- lazy routes.
- avoid XLSX/jsPDF في student bundle.
- image variants.
- DB indexes بعد query evidence.
- remove duplicate caches.
- request deduplication where useful.
- profile slow SQL on realistic data.
- remove indiscriminate `will-change`.

## Definition of Done

- benchmark before/after موثق.
- لا performance claim دون measurement.

---

# المرحلة 16 — Security Hardening

## Checklist

- secrets only server-side.
- no default credentials.
- no plaintext/reversible passwords.
- strict RLS.
- Edge Function auth/role checks.
- request validation.
- rate limiting on activation/recovery/AI admin endpoints.
- upload MIME/size validation.
- sanitize exports/user-controlled HTML.
- CORS least privilege where applicable.
- security headers/CSP on hosting.
- audit privileged actions.
- dependency audit.

## Definition of Done

- security regression suite.
- abuse cases documented/tested.
- no P0/P1 open blocker.

---

# المرحلة 17 — Accessibility & UX QA

## Manual matrix

- small Android.
- common Android.
- iPhone viewport.
- tablet.
- desktop admin.
- keyboard only.
- 200% browser zoom.
- reduced motion.
- light/dark where supported.
- slow network.
- offline.

## Definition of Done

- no critical overflow.
- no core action requires hover.
- focus order usable.
- contrast/touch targets pass.

---

# المرحلة 18 — Automated Testing Strategy

## Unit

- code validation.
- entitlement rules.
- quiz/practice engine.
- scoring.
- AI validators.
- filename/page parsing.
- scientific/Arabic formatting.

## Database/RLS

- anon.
- student A.
- student B.
- admin.
- revoked entitlement.
- expired code.
- concurrent redemption.

## Integration

- activate student.
- login/recovery/reset.
- redeem class code.
- upload lesson.
- AI job lifecycle.
- quiz attempt.
- export.

## E2E

### Admin

login → create/select content → upload → AI generation → review → publish → quiz → notification.

### Student

activate → login → sync → lesson → practice → quiz → notes/saved → statistics → offline → reconnect.

---

# المرحلة 19 — Data Migration & Compatibility

## الهدف

نقل النظام الحقيقي دون خسارة المستخدمين أو المحتوى.

## العمل

- staging copy.
- map legacy profiles/access codes.
- map student IDs القديمة.
- restore proper ownership/FKs.
- migrate quiz progress/attempts.
- migrate entitlement state.
- validate counts/checksums.
- dual-read/compatibility period فقط إذا لزم.

## Definition of Done

- reconciliation report صفر unexplained loss.
- rollback documented.

---

# المرحلة 20 — Staging Release

## Staging must be built from repository source

- fresh DB migrations.
- seeded representative content.
- content assets import.
- real AI provider test credentials.
- admin/student URLs.

## Verification

- security/RLS.
- E2E.
- performance.
- accessibility.
- offline/PWA.
- AI quality corpus.
- migration rehearsal.

---

# المرحلة 21 — Production Cutover

## قبل Cutover

- DB backup.
- migration rehearsal passed.
- monitoring configured.
- error logging configured.
- AI health monitoring.
- release checklist signed.

## Cutover

- maintenance window if required.
- migrations.
- data migration.
- deploy functions.
- deploy admin.
- deploy student.
- smoke tests.

## rollback trigger

واضح ومحدد مسبقًا، لا قرار ارتجالي أثناء المشكلة.

---

# المرحلة 22 — Post-Launch Verification

خلال التشغيل الفعلي نراقب:

- auth errors.
- activation success rate.
- query latency.
- AI success/retry/rate-limit rate.
- student sync failures.
- PWA update issues.
- JS errors.
- content/image failures.

ونعالج regressions قبل إضافة features جديدة.

---

# ترتيب الأولويات الفعلي

## Foundation Track

Product inventory → DB reality → architecture → CI/testing foundation.

## Security/Data Track

Auth → RLS → entitlement → data ownership → migration.

## Brand/UX Track

Identity → Design System → IA → Admin UX → Student UX.

## Content Track

alwaslh-go inventory → canonical manifests → media pipeline → import.

## AI Track

Prompt inventory → schemas → jobs → provider/project pool → admin AI operations → quality tests.

## Runtime Track

Offline/PWA → performance → security hardening → E2E → staging → production.

هذه المسارات تتقدم بتنسيق، لكن لا يتم نشر production قبل اكتمال بوابات Security/Data/QA.

---

# Release Gates النهائية

لا نعتبر المشروع جاهزًا إلا إذا:

1. Feature Parity كاملة أو أي تغيير Business موثق وموافق عليه.
2. لا P0/P1 security blockers.
3. clean DB from migrations passes.
4. RLS matrix passes automated tests.
5. admin/student E2E passes.
6. offline lifecycle passes real-device tests.
7. AI jobs resilient وتغطي المصدر كاملًا.
8. AI output validation/quality corpus passes.
9. performance budgets met.
10. accessibility critical issues closed.
11. data migration rehearsal reconciles correctly.
12. rollback procedure verified.
13. monitoring/logging operational.
14. production smoke tests passed.

---

# حالة بعض مصادر المشروع

## `alwaslh`

VERIFIED كمصدر أساسي للكود الحالي والـBusiness behavior الذي تم تدقيقه حتى الآن.

## `alwaslh-go`

VERIFIED على مستوى repository structure وREADME كمصدر محتوى كبير منظم للكتب والنماذج والصور والفهارس. يلزم Inventory تقني كامل لكل directory/manifest قبل بناء importer النهائي.

## Production Database

NOT YET VERIFIED — سيتم تدقيقه فور ربط المنصة.

## Production AI credentials/projects/quotas

NOT YET VERIFIED — سيتم ربطها فقط server-side بعد تزويدها بشكل آمن عبر platform secrets، وليس داخل repository أو chat source files.
