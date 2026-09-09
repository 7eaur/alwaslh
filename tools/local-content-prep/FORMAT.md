# Local Content Package Format v1

هذا العقد هو الحد الفاصل بين **التجهيز المحلي** و**الاستيراد إلى منصة الوسيلة لاحقًا**.

## مبادئ العقد

- لا DB IDs داخل package.
- الهوية الدلالية هي: `collection + class + subject + lesson + page_number`.
- `page_id` UUID ثابت مشتق من الهوية الدلالية.
- تغيير بايتات الصورة لا يغير `page_id`، لكنه يغير `source.checksum_sha256` ومفتاح idempotency المقترح للـmedia asset.
- الأصل لا يعدل.
- نسخة العرض منفصلة عن مدخل OCR.
- النص الكامل + التفاصيل الخام تحفظ حتى لا نضطر لإعادة OCR لمجرد تغيير importer.

## `catalog.json`

يحفظ العناوين التي لا يمكن استنتاجها بأمان من أسماء الملفات:

```json
{
  "schema_version": 1,
  "collection": {
    "slug": "yemen-secondary",
    "title": "المناهج اليمنية",
    "source_label": "local-content-prep"
  },
  "classes": [
    {
      "slug": "grade-12",
      "title": "الصف الثالث الثانوي",
      "subjects": [
        {
          "slug": "physics",
          "title": "الفيزياء",
          "lessons": [
            {
              "slug": "lesson-01",
              "title": "الحركة",
              "position": 0,
              "source_dir": "grade-12/physics/lesson-01",
              "document_kind": "textbook",
              "section": {"slug": "unit-01", "title": "الوحدة الأولى"},
              "metadata": {}
            }
          ]
        }
      ]
    }
  ]
}
```

`document_kind`: `textbook` أو `government_exam`.

## `package.json`

رأس الدفعة ويحتوي على نسخة الـpipeline وبيانات collection و`pages_manifest_sha256` وعدد الصفحات والأخطاء والصفحات التي تحتاج مراجعة، إضافة إلى image/OCR profile المستخدم وتصريح `database_write_performed=false`.

## `pages.jsonl`

سطر JSON واحد لكل صفحة. هذا هو الملف الأفضل للـbulk importer مستقبلًا لأنه streamable ولا يحتاج تحميل المكتبة كاملة في الذاكرة.

## `page.json`

### `identity`

- `class_slug`, `class_title`
- `subject_slug`, `subject_title`
- `section_slug`, `section_title` اختياريان
- `lesson_slug`, `lesson_title`, `lesson_position`
- `page_number`: 1-based للمستخدم والمحتوى
- `source_position`: 0-based ومتوافق مع ترتيب DB الحالي

### `source`

- المسار والاسم الأصليان
- MIME وbyte size
- width/height بعد تصحيح EXIF
- SHA-256
- Git blob SHA-1 محسوب محليًا من البايتات لتسهيل عقد `content_source_assets` لاحقًا

### `display`

نسخة WebP وتشمل profile `localprep-webp-v1` والأبعاد والجودة والـchecksum وcompression ratio و`preserved_dimensions`.

### `ocr`

- provider/version/profile/language
- `raw_text`
- `normalized_text`
- `text_sha256`
- mean/min confidence كنسبة 0..100 لتناسب عقد المشروع الحالي
- `needs_review` + reason

التفاصيل الكاملة للـblocks/polygons والـprovider payload موجودة في `ocr.json` وليس مكررة كلها في manifest العام.

### `import_hints`

هذه ليست أوامر SQL ولا IDs؛ فقط shape مساعد مطابق للحقول التي سيحتاجها importer لاحقًا.

أهم قرار: `lesson_asset.publication_status = draft` دائمًا عند الاستيراد الأول. التجهيز المحلي لا يملك صلاحية نشر المحتوى مباشرة.

## `ocr.json`

يحتفظ بالنص الخام والمنظم وكل block (`text`, `confidence`, `polygon`) وraw provider payload بصيغة JSON-safe إن أمكن. هذا يسمح بتحسين المراجعة أو importer مستقبلًا بدون إعادة OCR.

## الترتيب

تقرأ أسماء الصور Natural Sort، مع تحويل الأرقام العربية/الفارسية إلى أرقام للمقارنة:

```text
1.jpg
2.jpg
10.jpg
```

وكذلك:

```text
١.jpg
٢.jpg
١٠.jpg
```

ثم يعطى ترتيب الصفحة 1..N داخل الدرس بغض النظر عن اسم الملف الأصلي.
