# HOSTING PORTABILITY POLICY — الوسيلة الذكية

Status: **MANDATORY ARCHITECTURE RULE**

## Purpose

بيئات الاستضافة المجانية أو المؤقتة (مثل Render Free أثناء التطوير) هي أدوات تشغيل واختبار فقط. لا يجوز أن تصبح قيود الخطة المجانية مرجعًا لتصميم المنتج أو الـBusiness Logic أو الـdata model أو الـsecurity model أو الـworker lifecycle أو الـmedia architecture.

الهدف هو أن تبقى الوسيلة الذكية قابلة للنقل لاحقًا إلى VPS أو Railway أو أي بيئة Linux/PostgreSQL مناسبة بدون إعادة بناء المنتج من الصفر.

## Core rule

**Architecture follows product correctness and operational requirements; temporary hosting follows the architecture — not the opposite.**

عند وجود تعارض بين معمارية صحيحة وقيد في استضافة الاختبار المجانية:

1. نحافظ على المعمارية الصحيحة.
2. نعلّم الجزء غير القابل للاختبار في البيئة المجانية `NOT YET VERIFIED`.
3. لا نبني workaround دائمًا لإرضاء الخطة المجانية.
4. نختبره لاحقًا في بيئة تدعم المتطلب الحقيقي.

## Non-negotiable examples

- PostgreSQL يبقى authority حقيقي للمخطط والـtransactions والـintegrity؛ لا نحول state إلى browser/local storage لأن خدمة DB المجانية محدودة.
- durable media يبقى له Storage abstraction صحيح؛ لا نضع ملفات قيمة داخل ephemeral filesystem ونعتبرها durable.
- `FileSystemMediaStorage` الحالي يمكن تشغيله في بيئة اختبار مؤقتة، لكن durability لا تصبح VERIFIED إلا على persistent/shared storage مناسب.
- AI worker يبقى process/service مستقل عن Fastify HTTP؛ لا نشغله داخل API لمجرد أن الخطة المجانية لا توفر background worker.
- browser لا يصبح authority لـauth/jobs/publication/scoring بسبب قيود الاستضافة.
- لا ندمج queue أو cache أو storage أو auth provider داخل business domain بشكل يصعب فصله لاحقًا.
- PDF/OCR runtime dependencies تُثبت reproducibly (Docker/system packages) بدل الاعتماد على packages عشوائية في المضيف.
- secrets/configuration تأتي من environment/configuration boundaries، لا من source code أو provider-specific hacks.

## Portability target

يجب أن تظل البنية قابلة للعمل على topology مثل:

```text
Student Web / Admin Web
        │
        ▼
Fastify API
        │
        ├── PostgreSQL
        ├── Durable media storage
        └── Separate workers/services
```

ويمكن توزيع هذه المكونات لاحقًا على:

- VPS واحد أو عدة VPSs؛
- Railway؛
- Render paid؛
- managed PostgreSQL/object storage؛
- أو مزود آخر يدعم العقود التشغيلية نفسها.

الـprovider-specific code يجب أن يكون في adapters/deployment/configuration، لا في domain/business rules.

## Development Render Free policy

Render Free الحالية = **Development/Test Environment only**.

مسموح استخدامها للتحقق من:

- Docker build/runtime؛
- migrations؛
- API health/readiness؛
- frontend integration؛
- sessions/CORS؛
- functional image/PDF flows أثناء عمر instance الحالي؛
- hosted smoke/E2E حيث تسمح البيئة.

غير مسموح اعتبارها دليلًا نهائيًا على:

- media durability عبر redeploy/restart؛
- production availability/performance؛
- background worker production operation؛
- production backup/recovery؛
- horizontal scaling.

هذه تبقى `NOT YET VERIFIED` حتى تُختبر على البنية المناسبة.

## Review gate

أي Backend/Frontend/Integration change يضيف dependency مباشرة على Render/Supabase/Railway/VPS-specific behavior يجب مراجعته بالسؤال:

> هل هذا Adapter/Deployment concern أم أنه يسرّب قيد المزود إلى business/domain architecture؟

إذا كان الثاني، يُعاد للتصميم قبل الدمج.

## Migration to final hosting

عند الانتقال لاحقًا إلى VPS أو Railway، المطلوب يجب أن يكون Deployment/Infrastructure adaptation قدر الإمكان، وليس product rewrite.

Expected changes قد تشمل:

- connection/environment configuration؛
- reverse proxy/TLS؛
- persistent/object storage adapter؛
- process manager/container orchestration؛
- managed worker deployment؛
- backup/monitoring.

ولا ينبغي أن تتطلب إعادة كتابة Business Rules أو Auth/Access contracts أو AI job lifecycle أو curriculum/content model.
