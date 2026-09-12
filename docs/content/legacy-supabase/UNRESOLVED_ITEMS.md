# Legacy Supabase Import — Unresolved Items

These items are intentionally unresolved. None authorizes guessing or target mutation.

## U-001 — Six duplicate legacy page positions

The following `(subject, page_number)` positions contain two distinct source rows:

1. `تاسع الرياضيات / الرياضيات نماذج وزارية 1446`, page 16
   - `النموذج 4 الورقة 1`
   - `النموذج 6 الورقة 1`
2. `تاسع الرياضيات / الرياضيات نماذج وزارية 1446`, page 29
   - `النموذج 10 الورقة 2`
   - `النموذج 9 الورقة 2`
3. `تاسع العلوم / العلوم نماذج وزارية 1447`, page 36
   - two rows titled `نموذج التصحيح النموذج 12` (one contains trailing whitespace)
4. `تاسع انجليزي / الانجليزي نماذج وزارية 1447`, page 18
   - `نموذج التصحيح النموذج 6`
   - `نموذج التصحيح النموذج 4`
5. `تاسع انجليزي / الانجليزي نماذج وزارية 1447`, page 27
   - `نموذج التصحيح النموذج 9`
   - `النموذج 13 الورقة 1`
6. `تاسع انجليزي / الانجليزي نماذج وزارية 1447`, page 29
   - `النموذج 9 الورقة 2`
   - `النموذج 10 الورقة 2`

These cannot be ordered by page number alone. The source images must be inspected against their surrounding document context before final lesson/image order is accepted.

## U-002 — Eighteen noncontiguous repeated-title scopes

Repeated normalized titles can be legitimate recurring sections. Do not merge them automatically.

- Third-secondary English textbook: `blank separator page` — 2 groups
- Grade 9 history textbook: `درس جديد` — 15 groups
- Grade 9 geography: `السياحة` — 2 groups
- Grade 9 math government exams 1445: `النموذج 12 الورقة 1` — 2 groups
- Grade 9 math government exams 1445: `النموذج 12 الورقة 2` — 2 groups
- Grade 9 math government exams 1445: `نموذج التصحيح النموذج 12` — 2 groups
- Grade 9 math textbook part 1: `اختبار الوحدة` — 4 groups
- Grade 9 math textbook part 1: `تمارين عامة ومسائل` — 2 groups
- Grade 9 math textbook part 1: `تمارين ومسائل عامة` — 2 groups
- Grade 9 math textbook part 2: `اختبار الوحدة` — 3 groups
- Grade 9 math textbook part 2: `تمارين ومسائل عامة` — 2 groups
- Grade 9 Arabic textbook part 1: `الإملاء (إملاء اختباري)` — 3 groups
- Grade 9 Arabic textbook part 1: `الإملاء (تطبيقات إملائية)` — 2 groups
- Grade 9 Arabic textbook part 2: `الإملاء (إملاء اختباري)` — 3 groups
- Grade 9 science government exams 1447: `نموذج التصحيح النموذج 12` — 2 groups
- Grade 9 science textbook part 1: `تقويم الوحدة` — 8 groups
- Grade 9 science textbook part 2: `تقويم الوحدة` — 8 groups
- Grade 9 Quran textbook: `مجال التجويد` — 2 groups

Total logical groups participating in these scopes: **66**.

## U-003 — Current target row inventory unavailable

Required target counts and identities are still unavailable through the connected Railway read-only surface:

- classes
- subjects
- subject_class_links
- curriculum_sections
- lessons
- lesson_assets/publication state
- media_assets/checksums
- Question Bank items/revisions/lesson links
- content import/source records

Without this, no source lesson can be classified honestly as `MATCH`, `NEW`, `CONFLICT`, or `REUSE` against live runtime data.

## U-004 — Source image bytes unavailable through connector

The Storage metadata proves every referenced object exists, but exact SHA-256 and perceptual hashes require actual bytes.

No exact image dedupe decision is authorized until bytes are available.

## U-005 — Target backup/rollback gate

Railway inspection did not find configured WAL archive/PITR storage. Before the first runtime write, obtain or verify a suitable backup/restore path and record the evidence.

## U-006 — Non-Git source provenance schema

`content_source_assets.source_git_blob_sha1` is mandatory today. Supabase Storage has no truthful Git blob SHA-1. A minimal schema batch is likely required; fake values are forbidden.

## U-007 — Legacy AI question provenance path

Legacy questions are stored under `ai_questions`, but they do not have current Alwaslh `ai_output` + approved review-event lineage. They must not be passed through `importApprovedAiOutput` using fabricated records.

A dedicated legacy-import application method is needed if the final mapping uses `origin='ai'`, keeping revisions draft and recording truthful legacy source provenance.

## U-008 — Nine malformed question-type records

Nine questions use `easy`, `medium`, or `hard` in the legacy `type` field. All have a separate valid difficulty value and four choices, but the target type must not be guessed automatically.

State: `review_required`.

## U-009 — Noncanonical boolean choices

Four `true_false` records use option semantics that are not literal true/false labels:

- two `نعم/لا`
- one `لا/نعم`
- one pair of full sentence choices

State: `review_required`.

## U-010 — One two-choice non-boolean MCQ

One legacy `mcq` has two yes/no choices. The target multiple-choice contract requires exactly four choices. Expanding choices would change authored content.

State: `review_required`.

## U-011 — Ten direct questions without trusted answers

Do not invent answer text. If imported after lesson/source mapping is approved, use target `unknown` or `review_required` answer state with null answer fields.

## U-012 — Near-duplicate images

No perceptual-hash classification can be produced without actual image bytes. Near-duplicate review remains pending and must never become an automatic destructive merge.
