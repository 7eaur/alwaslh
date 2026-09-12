# Legacy Supabase Source Audit

Date: 2026-09-12

Branch: `content/legacy-supabase-import`

Target baseline inspected: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`

Legacy Supabase project ref: `zhbgbmqhonqmzpqfiehs`

## Scope and authority

The legacy Supabase project is treated as a read-only source. No delete, update, schema change, function deployment, storage mutation, or policy change was performed.

The current Alwaslh runtime authority remains API + Railway PostgreSQL. Existing content sourced from `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23` is a separate source and must not be overwritten by this import.

The previous project documentation excluded Supabase migration from scope. The Product Owner instruction dated 2026-09-12 explicitly re-opens this legacy Supabase project as a content source. This is a scope override, not evidence that Supabase becomes runtime authority again.

## Relevant legacy schema

Relevant content tables inspected:

- `classes`
- `subjects`
- `subject_extra_classes`
- `lessons`
- `quizzes`
- `saved_questions`

Verified relationships:

- `subjects.class_id -> classes.id`
- `lessons.subject_id -> subjects.id`
- `quizzes.subject_id -> subjects.id`
- `saved_questions.lesson_id -> lessons.id`
- `subject_extra_classes.subject_id -> subjects.id`
- `subject_extra_classes.class_id -> classes.id`

`subject_extra_classes` currently has no rows.

## Source inventory

- classes: **15**
- subjects: **58**
- subject_extra_classes: **0**
- legacy `lessons` rows: **5,273**
- quizzes: **0**
- saved_questions: **0**
- page rows with image references: **5,273**
- total image references: **5,273**
- embedded question items in `lessons.ai_questions`: **25,715**
- `content_type = lesson`: **3,416** page rows
- `content_type = exam_model`: **1,857** page rows

Two legacy subject rows currently have zero page rows (`كتاب الإسلامية - الجزء الأول`, `كتاب الإسلامية - الجزء الثاني`). They are inventory records only and are not import candidates until source content exists.

## What a legacy `lessons` row actually represents

Sampling and ordered inspection prove that a legacy `lessons` row is normally a **page/image record**, not one final logical lesson. Consecutive rows can share the same title while advancing `page_number`.

Therefore the importer MUST NOT create one target `lessons` row per legacy row.

A conservative first-pass logical lesson boundary is:

`subject + normalized title + contiguous page-number run`

Using that rule yields **3,148 candidate logical lesson groups**.

Known structural anomalies:

- null page numbers: **0**
- duplicate `(subject_id, page_number)` positions: **6**
- repeated normalized-title scopes that reappear non-contiguously: **18**
- logical groups participating in those repeated-title scopes: **66**
- blank titles: **0**

These anomaly scopes are review inputs, not automatic merges.

## Legacy class/subject semantics

The old schema conflates grade and discipline in many class names, for example `تاسع الرياضيات`, `تاسع انجليزي`, and subject-specific third-secondary classes. It also models textbook parts and exam years as separate `subjects`.

This does **not** match the current Alwaslh model directly. Current Alwaslh separates:

- canonical class/grade;
- canonical subject;
- class/subject offering;
- content source document kind/year;
- curriculum section;
- logical lesson.

Legacy class/subject IDs therefore remain provenance identifiers only. They must not be copied as target domain IDs.

## Storage audit

Buckets:

### `lesson_content`

- public: `true`
- objects: **9,075**
- total metadata byte size: **1,495,150,104** bytes
- JPEG objects: **7,105**
- WebP objects: **1,970**

### `student_notes_media`

- objects: **0**

Every one of the **5,273** lesson image references resolves to a matching object path in `lesson_content`:

- matched objects: **5,273**
- missing objects: **0**
- distinct referenced paths: **5,273**
- referenced object bytes from Storage metadata: **1,041,164,935** bytes

All 5,273 stored image URLs are distinct. URL uniqueness is NOT file-content deduplication evidence.

## Question source audit

The actual legacy educational questions are stored in `lessons.ai_questions`; the `quizzes` and `saved_questions` tables contain no rows.

Type distribution:

- `mcq`: **15,230**
- `true_false`: **10,466**
- `direct`: **10**
- invalid/misplaced type `medium`: **4**
- invalid/misplaced type `easy`: **3**
- invalid/misplaced type `hard`: **2**

Difficulty distribution is structurally valid across all questions:

- medium: **23,179**
- easy: **1,790**
- hard: **746**

MCQ option counts:

- four options: **15,224**
- two options: **6**

For all `mcq` and `true_false` records, stored correct indexes are integer and in range. Explanations are missing for only three records (one MCQ and two true/false); explanation is nullable in the target contract.

The ten `direct` questions have no usable `answer_text`; they must not be given an invented answer.

## Source data intentionally excluded

This import track does not migrate authentication, student profiles, sessions, access codes, device data, or unrelated operational tables merely because they exist in the legacy project.

## Read-only audit conclusion

The project is confirmed as the intended legacy educational-content source. Its content is usable, but it requires domain transformation before insertion. Direct table copying would create incorrect lessons, duplicate subject concepts, invalid Question Bank shapes, and weak provenance.
