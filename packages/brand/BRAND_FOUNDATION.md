# الوسيلة الذكية — Brand Foundation v1

## الهدف
هوية تعليمية يمنية حديثة، هادئة، موثوقة وسهلة الاستخدام. لا تعتمد على الشكل الزخرفي أو مظهر AI عام.

## الشخصية
- واضحة وليست صاخبة.
- تعليمية وليست طفولية.
- محلية باللغة والاتجاه، لكن ليست محصورة بصريًا في نمط تقليدي.
- عملية في Admin ومريحة في Student.

## الاسم
الاسم الأساسي محفوظ: **الوسيلة الذكية**.

## الفكرة البصرية
اتجاه الهوية: **المسار + المعرفة + الصفحة**.
يمكن للعلامة النهائية أن تستلهم مسارًا بسيطًا يتحول إلى صفحة/علامة قراءة، بدون روبوتات أو نجوم AI أو brain icons عامة.

## الألوان
- Ink: أساس قوي للعناوين والـAdmin hierarchy.
- Teal educational primary: الإجراء والروابط والحالات النشطة.
- Warm gold accent: استخدام محدود للإنجاز/التمييز، لا كلون CTA أساسي.
- Neutral warm canvas: يقلل إجهاد القراءة مقارنة بأبيض صارخ مستمر.

القيم التنفيذية موجودة في `src/tokens.css`.

## Typography
الأولوية لخط عربي واضح طويل القراءة. Stack مؤقت حتى نعتمد font assets المملوكة/المستضافة ذاتيًا:
`Noto Sans Arabic`, ثم `IBM Plex Sans Arabic`, ثم system UI.

لا نستخدم أحجام 8–10px في واجهة الإنتاج. الحد الأساسي للمحتوى 16px مع 14px للمعلومات الثانوية عند الحاجة.

## Admin visual language
- dense but readable;
- sidebar واضح؛
- جداول وقوائم أكثر من شبكة cards؛
- actions ثابتة؛
- status colors semantic فقط؛
- dialogs/side panels للمهام المركزة.

## Student visual language
- mobile/touch first;
- مساحات أهدأ؛
- القراءة هي مركز الشاشة؛
- أقل عدد ممكن من القرارات في كل خطوة؛
- bottom navigation محدودة؛
- offline/loading/error states ظاهرة وواضحة.

## Accessibility baseline
- browser zoom مسموح؛
- touch target لا يقل عن 44px؛
- visible focus rings؛
- reduced motion؛
- لا تعتمد الحالة على اللون وحده؛
- RTL first؛
- reader line-height أوسع من UI العادي.

## ممنوعات الهوية
- Miaoda branding/assets.
- glassmorphism كقالب أساسي.
- gradients لمجرد الزينة.
- glow متكرر.
- كل شيء داخل card.
- mascot/robot AI افتراضي.
- حركة على عناصر لا تحتاج حركة.

## قبل اعتماد Logo نهائي
يتم تقييم 2–3 اتجاهات بسيطة داخل نفس هذه القواعد، ثم اعتماد SVG محلي + app icons + monochrome mark + print-safe variant.
