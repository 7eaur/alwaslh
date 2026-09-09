# Alwaslh Local Content Prep — تجهيز محتوى «الوسيلة» محليًا

أداة مستقلة لتجهيز المكتبة الأساسية على جهازك **بدون الكتابة إلى قاعدة بيانات المشروع وبدون تشغيل Runtime الوسيلة**.

الهدف:

1. ترتب صور كل درس بشكل ثابت وطبيعي (`1, 2, 10` وكذلك `١, ٢, ١٠`).
2. تحتفظ بالصور الأصلية كما هي ولا تعدلها.
3. تعمل OCR على نسخة PNG مؤقتة lossless بعد تصحيح EXIF orientation؛ **لا يتم OCR من الصورة المضغوطة**.
4. تنتج نسخة عرض WebP أصغر حجمًا، مع الحفاظ على أبعاد البكسل افتراضيًا.
5. تحفظ النص، confidence، blocks/polygons، checksums، العناوين، الصف/المادة/الدرس/الصفحة.
6. تنتج package + JSONL + CSV + HTML review يمكن استيرادها لاحقًا إلى «الوسيلة».
7. تدعم resume بالـSHA-256: الصفحة التي لم تتغير لا يعاد ضغطها أو OCR لها.

> هذه الأداة لا تتصل بـPostgreSQL ولا تنشر محتوى ولا تستخدم IDs داخلية من قاعدة البيانات. `import_hints` فقط تسهل بناء importer لاحقًا.

## الهيكل المقترح للصور

```text
my-content/
├─ catalog.json
├─ input/
│  └─ grade-12/
│     └─ physics/
│        ├─ lesson-01/
│        │  ├─ 001.jpg
│        │  ├─ 002.jpg
│        │  └─ 010.jpg
│        └─ lesson-02/
└─ prepared/            # تنشئه الأداة
```

يمكنك استخدام أسماء عربية للملفات، لكن `slug` في `catalog.json` يبقى لاتينيًا ثابتًا ليسهل الربط لاحقًا.

## التثبيت — Windows / macOS / Linux

يوصى بـPython 3.11 أو 3.12 وبيئة افتراضية مستقلة.

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

macOS/Linux:

```bash
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

### تفعيل OCR

PaddleOCR يحتاج `paddlepaddle` بالإضافة إلى حزمة `paddleocr`. ثبّت إصدار PaddlePaddle المناسب لنظامك/CPU حسب تعليمات Paddle الرسمية، ثم:

```bash
python -m pip install -e ".[ocr,dev]"
```

بعدها افحص البيئة:

```bash
alwaslh-content-prep doctor C:\content\my-content
```

يمكن اختبار الضغط والـmanifest قبل تثبيت PaddleOCR:

```bash
alwaslh-content-prep prepare C:\content\my-content --skip-ocr
```

## أول تشغيل

### الخيار 1 — إنشاء workspace نموذجي

```bash
alwaslh-content-prep init C:\content\my-content
```

ثم عدل `catalog.json` وضع الصور داخل مجلدات `input`.

### الخيار 2 — عندك مجلدات الصور أصلًا

رتبها على ثلاث مستويات:

```text
input/<class>/<subject>/<lesson>/*.jpg
```

ثم:

```bash
alwaslh-content-prep scan C:\content\my-content --collection-slug yemen-secondary --collection-title "المناهج اليمنية"
```

إذا كان `catalog.json` موجودًا لن تستبدله الأداة؛ ستكتب `catalog.scan.json` للمقارنة. **راجع العناوين يدويًا قبل `prepare`.**

## تجهيز المحتوى

```bash
alwaslh-content-prep prepare C:\content\my-content
```

الإعدادات الافتراضية المقصودة للمشروع:

- WebP quality: `82`
- الحفاظ على أبعاد الصورة: نعم
- OCR language: `ar`
- التنفيذ: صفحة واحدة في كل مرة لتقليل RAM
- low confidence threshold: `0.80`
- الفشل في صفحة لا يوقف بقية المكتبة، إلا مع `--fail-fast`

لخفض أبعاد نسخة العرض فقط — **اختياري وليس الافتراضي**:

```bash
alwaslh-content-prep prepare C:\content\my-content --max-edge 2200
```

لإعادة كل الصفحات حتى لو checksum لم يتغير:

```bash
alwaslh-content-prep prepare C:\content\my-content --force
```

## أين أراجع دقة OCR؟

بعد التشغيل افتح:

```text
prepared/reports/review/index.html
```

سترى كل صفحة والصورة بجانب النص، mean confidence، وحالة `needs_review`.

كما توجد:

```text
prepared/reports/pages.csv
prepared/reports/needs-review.csv
prepared/reports/errors.jsonl
prepared/reports/summary.json
```

## شكل المخرجات

```text
prepared/
├─ package.json
├─ pages.jsonl
├─ state.json
├─ catalog.snapshot.json
├─ reports/
│  ├─ summary.json
│  ├─ pages.csv
│  ├─ needs-review.csv
│  ├─ errors.jsonl
│  └─ review/
│     ├─ index.html
│     └─ grade-12__physics__lesson-01.html
└─ content/
   └─ grade-12/physics/lesson-01/
      ├─ lesson.json
      └─ pages/
         ├─ 0001/
         │  ├─ image.webp
         │  ├─ text.txt
         │  ├─ ocr.json
         │  └─ page.json
         └─ 0002/...
```

التفاصيل الكاملة ومعنى الحقول في [FORMAT.md](FORMAT.md).

## التحقق قبل الاحتفاظ بالدفعة

```bash
alwaslh-content-prep validate C:\content\my-content
```

التحقق يشمل SHA-256 للـmanifest، وجود الملفات، checksum وأبعاد WebP، تطابق `text.txt`، عدم تكرار `page_id`، وترتيب الصفحات بلا فجوات.

## سياسة عدم فقد البيانات

- `input/` لا يتم الكتابة داخله إطلاقًا.
- OCR يستخدم نسخة مؤقتة lossless ثم يحذفها.
- الملفات الأساسية تكتب atomically.
- `state.json` يحدّث بعد اكتمال كل صفحة.
- إذا انقطع التشغيل، أعد الأمر نفسه وسيكمل الصفحات غير المتغيرة من cache.
- تغيير إعداد image/OCR أو تفعيل OCR بعد `--skip-ocr` يلغي cache تلقائيًا للصفحات المتأثرة.
- حذف صفحة من مجلد المصدر يزيل صفحتها القديمة من package في التشغيل التالي.
- `page_id` ثابت حسب collection/class/subject/lesson/page_number، بينما checksums تسجل أي تغيير في الصورة.

## ما الذي سيتم استيراده لاحقًا؟

`page.json` يحتوي `import_hints` متوافقة مفاهيميًا مع البنية الحالية في المشروع:

- `content_import_runs`
- `content_source_documents`
- `content_source_assets`
- `media_assets`
- `media_variants`
- `ocr_extractions`
- `lesson_assets`

لكن لا تتم أي كتابة إلى هذه الجداول من الأداة المحلية. عندما نعتمد النتائج سنبني importer منفصلًا يترجم slugs إلى IDs الفعلية ويطبق Draft/Review/Published في السيرفر.

## الاختبارات

```bash
python -m pytest
```
