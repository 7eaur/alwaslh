# DEVELOPMENT RUNTIME & PREVIEW POLICY — الوسيلة الذكية

> هذه الوثيقة تحدد شكل المنتج أثناء التطوير وطريقة النشر المؤقت للإشراف والتجربة. لا تغيّر معمارية الإنتاج النهائية.

## 1. Runtime surfaces

المنتج يتكون من ثلاث وحدات تشغيلية واضحة:

```text
Student PWA        apps/student-web
Admin Web          apps/admin-web
Backend API        apps/api
```

### Student PWA

- تطبيق الطالب فقط.
- Web/PWA قابل للتثبيت على الهاتف/الجهاز.
- Mobile-first وRTL وOffline-first حسب العقود المعتمدة.
- يعمل أيضًا داخل Browser بدون تثبيت.
- يمتلك Manifest/Service Worker/install/update/offline lifecycle خاصًا به.
- لا يحتوي Admin navigation أو Admin code paths كجزء من تجربة الطالب.

### Admin Web

- تطبيق إدارة مستقل للـSuper Admin.
- لا يُقدَّم كجزء من Student PWA.
- يمكن أن يكون أكثر كثافة من Student، لكن يستخدم نفس Brand/Design System/shared primitives بدل تكرار styles/components.
- Upload/OCR/AI/Question Bank/Publishing/Students/Codes/Import-Export وغيرها تبقى Admin concerns.

### Backend API

- الجسر الوحيد للتعامل مع PostgreSQL الخاصة.
- Auth/Authorization/Entitlements/assessment authority server-owned.
- Browser لا يتصل مباشرة بPostgreSQL.
- OCR/AI/TTS/background execution تبقى خلف Backend/worker boundaries.

## 2. PWA contract للطالب

Student يجب أن يحافظ على نتيجة التطبيق القديم: **تطبيق ويب يمكن تثبيته**، لكن بتنفيذ حديث صحيح:

- installability verified عبر manifest/service worker criteria؛
- owned icons/brand assets؛
- HTTPS في البيئة المنشورة؛
- cache scopes واضحة؛
- account/device-scoped private data؛
- downloads explicit/bounded؛
- delta sync + outbox؛
- signed offline authorization lease max 14 days capped by entitlement expiry؛
- Push Notifications عندما تكون المنصة داعمة وبعد موافقة المستخدم؛
- update strategy لا تمسح private data عشوائيًا؛
- accessibility لا تُضحّى بها لتقليد Native UI.

## 3. Temporary development preview

الغرض من Preview هو أن يستطيع Product Owner مشاهدة وتجربة ما تم أثناء التطوير بدل انتظار Production cutover.

### البيئة الحالية

- GitHub repository: `7eaur/alwaslh`.
- Preview integration branch: `preview/supabase-vercel`.
- Temporary database/testing host: Supabase project `linksoftt`.
- Temporary web/runtime host: Vercel project `alwaslh`, team `wasl15`.
- هذه البيئة مؤقتة ولا تلزمنا باستخدام Supabase/Vercel في Production النهائي.

### Sync rule

بعد اكتمال دفعة قابلة للاختبار:

```text
feature/rebuild branch
→ CLI/CI gate PASS
→ integrate into preview/supabase-vercel
→ apply required Preview migrations/config safely
→ deploy
→ verify build + health/readiness + relevant user flow
→ record evidence
```

لا نضع تغييرات غير مستقرة في Preview لمجرد العرض.

## 4. Preview verification levels

حسب طبيعة التغيير، نتحقق من:

- deployment/build status؛
- `/api/health`؛
- readiness/DB connectivity عندما يمكن الوصول إليها؛
- Student route/PWA shell؛
- Admin route؛
- auth/session flow؛
- feature-specific smoke/E2E؛
- runtime logs عند الخطأ؛
- browser behavior عندما تتعلق الميزة بالCookie/PWA/Offline/Media.

عدم القدرة على اختبار بند بسبب قيود منصة Preview = `NOT YET VERIFIED` مع سبب واضح.

## 5. Temporary platform constraints

### Supabase

- temporary PostgreSQL/testing host فقط.
- Browser direct access غير معتمد؛ API هو application data path.
- Preview RLS/revokes تستخدم لمنع direct anon/authenticated table access.
- final production remains private PostgreSQL behind Backend.

### Vercel

- temporary deployment/runtime layer.
- serverless filesystem ليس durable media volume نهائيًا.
- Poppler/media-worker suitability على Vercel يجب اختبارها صراحة؛ لا تُفترض.
- أي Vercel-specific wrapper/config يبقى integration concern، لا domain architecture.

## 6. Secrets

- لا API keys/passwords/DB URLs في Git.
- لا secrets داخل Student/Admin bundles.
- environment secrets تُدار في hosting/provider settings.
- documentation تسجل أسماء المتغيرات والعقود فقط، لا القيم الحساسة.

## 7. No-patching rule في Preview

يجوز workaround مؤقت للـPreview فقط إذا:

1. المشكلة خاصة بالبيئة المؤقتة وليست domain defect؛
2. موثقة كKnown Issue؛
3. impact معروف؛
4. لها removal/exit path؛
5. لا تغيّر Business Rule أو security boundary؛
6. لا تصبح أساسًا يُبنى فوقه المنتج النهائي.

إذا كان الخطأ في architecture/domain/contract، يُصلح جذريًا في المصدر ثم يعاد deployment.

## 8. Documentation after every preview sync

حدّث:

- `PROJECT_STATUS.md`؛
- `PROJECT_ENGINEERING_LOG.md`؛
- `PROJECT_HANDOFF.md` إذا تغير branch/deployment/runtime state؛
- `docs/preview/SUPABASE_VERCEL_PREVIEW.md`؛
- exact commit/deployment/CI evidence؛
- Known Issues و`NOT YET VERIFIED`.

## 9. Final production

عند الوصول لمراحل Staging/Release/Cutover، ننقل إلى الاستضافة الحقيقية المختارة وننفذ PostgreSQL/storage/workers/proxy/backups/monitoring وفق Production architecture. الانتقال النهائي يجب ألا يتطلب إعادة كتابة Business Logic لأن Preview adapters/configs لا تتسرب إلى domain.
