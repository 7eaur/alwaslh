# BRAND GUIDELINES — الوسيلة الذكية

## 1. Brand idea
الهوية الجديدة تطوير مباشر للشعار الأول: **التعليم + التقنية + البساطة**. نحافظ على اللون الفيروزي وفكرة الكتاب المفتوح، ونزيل شكل القالب العام والزخرفة غير الوظيفية.

**الاسم:** الوسيلة الذكية  
**الشعار النصي:** الوسيلة التفاعلية الأولى في اليمن

## 2. Logo system
الأصل المعتمد هو كتاب مفتوح أبيض داخل حاوية مربعة مستديرة باللون الفيروزي. الرمز يجب أن يبقى بسيطًا وقابلًا للقراءة في 16–24px.

### الملفات
- `assets/logo/logo-mark.svg` — الرمز الأساسي.
- `assets/logo/logo-primary.svg` — الشعار الرئيسي الرأسي.
- `assets/logo/logo-horizontal.svg` — الشعار الأفقي.
- `assets/logo/logo-horizontal-white.svg` — للاستخدام فوق الخلفيات الداكنة.
- `assets/logo/logo-mark-monochrome.svg` — نسخة أحادية اللون.
- `assets/app-icons/favicon.svg` — favicon vector.
- `assets/app-icons/icon-192.png` — PWA 192.
- `assets/app-icons/icon-512.png` — PWA 512.
- `assets/app-icons/icon-maskable-512.png` — PWA maskable.

### قواعد الاستخدام
- مساحة الأمان حول الرمز = 20% على الأقل من ارتفاع الرمز.
- الحد الأدنى للرمز: 24px UI، و32px عند استخدامه كهوية أساسية.
- لا يتم تمديد الشعار، تدويره، تغيير نسبه، إضافة Glow أو Shadow ثقيل، أو وضعه فوق خلفية تقلل التباين.
- لا يُستخدم شعار TailAdmin أو أي Asset تابع للقالب السابق.

## 3. Core colors
| Token | Hex | Usage |
|---|---|---|
| Brand Teal | `#00B5A9` | CTA, active, icon, main brand |
| Brand Teal Dark | `#007F78` | hover/strong accents |
| Brand Ink | `#123C43` | headings/wordmark |
| Brand Mint | `#E6F7F6` | subtle selected/background |
| Surface Soft | `#F2F4F7` | panels/subtle background |
| Charcoal | `#1F2937` | neutral text |
| White | `#FFFFFF` | inverse surfaces |

الـgradient مسموح **للـApp Icon والشعار فقط**. واجهات المنتج نفسها تعتمد ألوانًا مسطحة في الغالب.

## 4. Typography
- Primary Arabic: **Cairo**.
- Secondary/Fallback: **Tajawal**, `Noto Sans Arabic`, system sans.
- Body minimum: 16px Student, 14px Admin data surfaces.
- لا نستخدم نصوص 8–10px في الواجهات الإنتاجية.
- line-height العربي: 1.55–1.8 حسب السياق؛ reader يصل 1.9.

## 5. Shape language
- App icon: squircle/rounded-square.
- UI: radius restrained؛ لا نجعل كل عنصر Card كبير مستدير.
- Buttons: 8–12px radius.
- Inputs: 8–10px.
- Panels: 12–16px عند الحاجة فقط.

## 6. Iconography
- Line icons، وزن بصري موحد، rounded joins.
- الحجم القياسي: 20/24px.
- لا نخلط Filled/3D/emoji كأيقونات وظيفية.
- حالات النجاح/التحذير/الفشل لا تعتمد على اللون وحده.

## 7. Imagery
- صور المناهج والكتب هي محتوى، وليست زخرفة Brand.
- Illustrations تستخدم فقط في onboarding/empty/error/help.
- أسلوبها: flat line/solid، بسيط، بنفس palette، بدون 3D/glass/glow.

## 8. Accessibility
- WCAG AA contrast للنصوص الأساسية.
- Focus ring واضح.
- Touch target >= 44px.
- دعم `prefers-reduced-motion`.
- Browser zoom غير مقيد.
- RTL هو الوضع الافتراضي، مع LTR فقط للأرقام/المعادلات/المعرفات عند الحاجة.

## 9. Admin vs Student
**Admin:** نفس الهوية، لكن أكثر كثافة وهدوءًا؛ tables/lists/actions واضحة، استخدام Brand color بحذر.  
**Student:** نفس الهوية، touch-first، مساحات أكبر، التركيز على القراءة والتقدم، استخدام teal كإشارة اتجاه وليس كخلفية لكل الشاشة.

## 10. Approved visual reference
`reference/brand-direction-board.webp` هو مرجع بصري لاتجاه الهوية، وليس مصدرًا لاستخراج نصوص أو قياسات. الأصول الإنتاجية هي ملفات SVG/PNG داخل `assets/`.

## 11. Status
**Brand Identity v1 — APPROVED DIRECTION / IMPLEMENTATION BASELINE.**  
أي تعديل لاحق يجب أن يحافظ على: اللون الفيروزي، رمز الكتاب، الاسم العربي، والبساطة التعليمية.
