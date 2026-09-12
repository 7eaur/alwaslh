# Legacy Supabase → Current Alwaslh Mapping Specification

Status: Dry-run design. No target writes executed.

## Target contracts recovered from current main

The target model is governed by current code and migrations, especially:

- `0001_core.sql`
- `0008_content_source_import.sql`
- `0009_media_pipeline.sql`
- `0016_curriculum_structure.sql`
- `0017_content_ingestion_publication.sql`
- `0019_question_bank.sql`
- current `source-import.ts`, `legacy-subject-bootstrap.ts`, Media Pipeline, and Question Bank service.

Key rules preserved:

- API/PostgreSQL remain canonical business authority.
- `media ready != published`.
- imported lesson assets default to `draft`.
- Question Bank content must remain draft/review until human publication.
- legacy IDs are provenance, not target identity.
- existing `alwaslh-go` source records are a different source namespace and must not be replaced.

## Mapping table

| Legacy source | Target | Rule |
|---|---|---|
| `classes` | `classes` | Do not copy IDs/names blindly. Legacy classes often combine grade + discipline. Map to canonical grade/class after target inventory confirms the existing target class. |
| `subjects` | canonical `subjects` + `subject_class_links` + source documents | Legacy rows often represent textbook part or exam year, not a canonical subject. Collapse document variants into the correct canonical subject. |
| textbook/exam subject naming | `content_source_documents` | Classify as `textbook` or `government_exam`; preserve source title and exam Hijri year when present. |
| legacy `lessons` row | page/source asset | Treat as page-level source record. Never create one target lesson per row. |
| consecutive page rows | `lessons` | First-pass grouping uses subject + normalized title + contiguous page run. Ambiguous/noncontiguous cases require review. |
| `image_urls[n]` | `content_source_assets` → `media_assets`/`media_variants` → `lesson_assets` | Resolve actual Storage object, read bytes, SHA-256, Media Pipeline processing, then link as draft in original order. |
| `page_number` | source metadata / `source_page_number` | Preserve original page ordering/provenance. Duplicate page positions remain unresolved until reviewed. |
| `ai_questions` | Question Bank draft revisions | Normalize shape without inventing data; link to mapped logical lesson and source page/media. Never publish automatically. |
| legacy question explanation | `question_bank_revisions.explanation` | Preserve exactly when meaningful; nullable if absent. |
| legacy question ↔ page | `question_bank_revision_sources` | After media materialization, link source media/page/checksum/content source asset. |
| legacy question ↔ logical lesson | `question_bank_revision_lessons` | Preserve real educational relationship. |

## Canonical document identity

Legacy `subjects` are not a safe 1:1 match to target subjects. Examples:

- `كتاب الرياضيات - الجزء الأول` and `كتاب الرياضيات - الجزء الثاني` should not automatically become two canonical subjects.
- `الرياضيات نماذج وزارية 1445`, `1446`, `1447` are source documents/years under one educational subject, not automatically three target subjects.
- subject-specific legacy grade classes such as `تاسع الرياضيات`, `تاسع انجليزي` should converge on the canonical Grade 9 class after the target inventory is verified.

The exact current target IDs/slugs for all 58 legacy subject rows are **NOT YET VERIFIED** because live Railway PostgreSQL row inventory is not available through the connected read-only tooling. No target mapping will be written before that inventory is obtained.

## Lesson grouping rule

Initial candidate grouping key:

`legacy subject + normalized title + contiguous page-number run`

Normalization is intentionally conservative:

- trim outer whitespace;
- collapse repeated whitespace;
- Unicode-safe text handling;
- no semantic rewriting;
- no merging solely because two titles look similar.

Result from current source audit: **3,148 candidate logical lesson groups**.

Automatic lesson creation is forbidden for:

- duplicate page positions;
- noncontiguous repeated-title scopes where context is not sufficient;
- unresolved target class/subject/document mapping;
- conflicts with an existing target lesson that cannot be proven identical.

## Image/media mapping

Required sequence:

1. resolve legacy Storage path;
2. read actual bytes;
3. verify declared/observed MIME and byte size;
4. compute SHA-256 on actual bytes;
5. exact-dedupe by content hash;
6. optionally calculate perceptual hash for review-only near-duplicate classification;
7. reuse an existing canonical target media asset when exact identity is proven;
8. otherwise process through the current Media Pipeline;
9. link one canonical media asset to every legitimate lesson relationship;
10. create/keep the lesson asset as `draft` unless a separate explicit review/publish operation occurs.

A URL, filename, path, legacy UUID, or Storage metadata size is not a content hash.

## Question normalization

### `mcq`

Target type: `multiple_choice` only when target shape is valid.

- 15,224 legacy MCQs already have four options and a valid in-range correct index.
- 6 have two options and cannot all be mapped as target multiple-choice.
- five of those six use exact `['صح','خطأ']` choices and are high-confidence structural type-mismatch candidates; they must be explicitly classified by the importer/review policy rather than silently changed.
- one is a real two-choice yes/no MCQ and cannot satisfy the four-option target MCQ contract without changing meaning; mark for review.

### `true_false`

Target options must be exactly `['صح','خطأ']`.

Deterministic canonicalization can preserve the represented answer for:

- 6,145 already in canonical Arabic order;
- 4,246 stored as `['خطأ','صح']` by reversing the index together with option normalization;
- 65 stored as `['True','False']`;
- 6 stored as `['False','True']`.

Four records use noncanonical semantic choices (`نعم/لا`, `لا/نعم`, or sentence choices). They are review-required, not automatic true/false conversions.

### `direct`

There are ten source records with type `direct` but no trusted textual answer. Map the question type while setting the answer state to `unknown` or `review_required` according to final importer validation. Do not synthesize an answer.

### misplaced type values

Nine records store `easy|medium|hard` in the legacy `type` field while also carrying valid target difficulty metadata and four choices. Their intended question type is not asserted automatically; mark `review_required` until the source record is explicitly classified.

## Answer mapping

For structurally valid choice questions with a trusted in-range legacy index:

- `answer_status = known`
- `correct_option_index = normalized index`
- `answer_text = normalized options[correct_option_index]`

If the answer is absent, structurally incompatible, or the type is unresolved:

- `answer_status = unknown` or `review_required`
- `correct_option_index = null`
- `answer_text = null`

## Question origin/provenance boundary

The legacy source calls the field `ai_questions`, but the current approved AI import service requires a current `ai_output` plus an approved AI review event. Legacy questions do not have that current-runtime lineage.

Do not create fake `ai_outputs` or fake approval events.

The current database can represent draft Question Bank items with `origin='ai'` and explicit import/source events, but the application service has no dedicated legacy-AI import method. This is an application-path gap to resolve in a separate implementation batch after dry-run. No schema change is yet required for Question Bank origin.

## Provenance identity

Recommended source namespace:

`supabase:zhbgbmqhonqmzpqfiehs`

Every imported entity must retain at least:

- source project ref;
- legacy table;
- legacy record ID;
- Storage bucket/object path where relevant;
- actual SHA-256 where bytes exist;
- import manifest/run digest;
- dedupe decision;
- mapping confidence.

## Proven schema gap: non-Git source assets

`content_source_assets.source_git_blob_sha1` is currently `NOT NULL` and semantically assumes a Git source. Supabase Storage objects do not have a truthful Git blob SHA-1.

A fake SHA-1 is forbidden.

Minimal likely fix, isolated as its own schema batch after dry-run:

- allow `source_git_blob_sha1` to be null for non-Git sources;
- retain current SHA-1 validation when the value is present;
- require truthful `checksum_sha256` for materialized Supabase bytes;
- preserve source object identity/path/version metadata in `source_metadata`.

Existing Git import behavior must remain unchanged and tested.

## Idempotency

Stable identities must derive from source identity plus canonical content identity, not random target IDs.

Expected replay behavior:

- same source snapshot + same manifest = same import run/replay;
- same source document path = same source document;
- same source object path + same SHA-256 = same source asset identity;
- same exact image SHA-256 = reuse canonical media asset where current contracts permit;
- same logical question fingerprint in the same educational scope = no duplicate Question Bank item;
- rerunning must not reorder lessons/assets/questions.
