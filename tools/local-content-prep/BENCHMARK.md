# قياس دقة OCR على صفحات الوسيلة

لا تعتمد على `confidence` وحده للحكم على جودة PaddleOCR. استخدم عينة حقيقية من كتبك واكتب النص الصحيح يدويًا لعدد صغير من الصفحات، ثم احسب Character Error Rate (CER).

## الطريقة

1. شغّل التجهيز أولًا:

```bash
alwaslh-content-prep prepare C:\content\my-content
```

2. اختر 10–20 صفحة متنوعة: نص واضح، صفحة مزدحمة، عناوين، أرقام، أسئلة، وصفحة جودة صورتها أضعف.

3. بجانب `page.json` للصفحة المختارة أنشئ ملفًا اسمه:

```text
ground-truth.txt
```

مثال:

```text
prepared/content/grade-12/physics/lesson-01/pages/0001/ground-truth.txt
```

اكتب فيه النص الصحيح كما ينبغي أن يقرأ من الصفحة. لا تنسخ OCR ثم تترك أخطاءه؛ صححه يدويًا.

4. شغّل:

```bash
alwaslh-content-prep benchmark C:\content\my-content
```

ستظهر النتائج في:

```text
prepared/reports/ocr-benchmark.json
prepared/reports/ocr-benchmark.csv
```

## فهم CER

`CER = عدد عمليات تعديل الحروف / عدد حروف النص الصحيح`.

- `0.00` يعني تطابقًا كاملًا.
- كلما اقترب من الصفر كانت النتيجة أفضل.
- `micro_accuracy_percent` في التقرير يساوي تقريبًا `(1 - CER) × 100` لسهولة القراءة، لكنه ليس بديلًا عن مراجعة الأخطاء المهمة تربويًا.

لا نعتمد رقمًا نهائيًا لجودة PaddleOCR قبل اختبار صفحات الوسيلة الحقيقية. بعد أول benchmark ننظر أيضًا إلى نوع الخطأ: الأرقام، الهمزات، علامات الاختيار، الجداول، المعادلات، أو الكلمات العربية نفسها. بعدها نقرر إن كان PaddleOCR كافيًا أو نحتاج preprocessing/fallback لبعض الصفحات فقط.
