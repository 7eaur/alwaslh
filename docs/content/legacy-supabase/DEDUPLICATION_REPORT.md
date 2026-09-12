# Legacy Content Deduplication Report

Status: Dry-run evidence. No target mutation executed.

## Lessons

The source contains 5,273 page-level `lessons` rows. Conservative grouping by legacy subject + normalized title + contiguous page sequence yields 3,148 candidate logical lessons.

Do not deduplicate lessons by legacy ID or title alone.

Known ambiguity inputs:

- 6 duplicated `(subject_id, page_number)` positions.
- 18 subject/title scopes reappear in separate noncontiguous runs.
- 66 logical groups participate in those repeated-title scopes.

These are not automatic duplicates. Repeated titles such as `اختبار الوحدة`, `تقويم الوحدة`, and generic `درس جديد` can legitimately occur more than once.

Target lesson deduplication remains **NOT YET VERIFIED** until current Railway PostgreSQL lesson inventory is queryable.

## Images

### URL/path-level evidence

- source image references: 5,273
- distinct stored URLs: 5,273
- duplicated URL groups: 0
- matched Storage objects: 5,273
- missing Storage objects: 0
- referenced bytes from Storage metadata: 1,041,164,935

The `lesson_content` bucket contains 9,075 image objects in total, so 3,802 bucket objects are not referenced by the current legacy lesson rows and are excluded by default.

### Exact duplicate rule

Exact duplicate identity MUST be computed from SHA-256 of actual object bytes.

Current connected Supabase tooling exposes Storage metadata/object paths but does not expose raw object download bytes. The current execution environment also cannot fetch the public Storage object bytes directly.

Therefore:

- exact SHA-256 duplicate groups: **NOT YET VERIFIED**
- exact duplicates removed: **0 (no target write has occurred)**
- target media reuse by checksum: **NOT YET VERIFIED**

No filename/URL/object-ID surrogate is accepted as SHA-256 evidence.

### Near duplicates

Perceptual hashing requires actual decoded image bytes. Until bytes are available:

- `HIGH_CONFIDENCE_DUPLICATE`: NOT YET VERIFIED
- `POSSIBLE_DUPLICATE`: NOT YET VERIFIED
- `DISTINCT`: NOT YET VERIFIED by visual content

Near duplicates will never be auto-merged merely because dimensions, names, or URLs are similar.

## Questions

A conservative raw fingerprint was calculated within the candidate logical-lesson scope from:

- normalized prompt (trim/collapse whitespace/lowercase only);
- legacy question type;
- exact options JSON;
- correct option index;
- subject/logical lesson scope.

Results:

- total question records: **25,715**
- unique raw fingerprints: **25,713**
- duplicate fingerprint groups: **2**
- duplicate extra rows: **2**
- maximum copies in a duplicate group: **2**

This is intentionally conservative. A second fingerprint pass must run after deterministic type/option normalization, but it must not merge questions whose meaning, answer, options, or educational context differs.

## Question structural normalization candidates

### MCQ

- 15,224 have exactly four options and valid answer indexes.
- 6 have two options.
- five of those six are structurally `صح/خطأ` candidates despite being labeled `mcq`.
- one is a genuine two-choice yes/no MCQ and cannot fit the current four-option target contract without changing meaning.

### True/false

Total: 10,466.

- `['صح','خطأ']`: 6,145
- `['خطأ','صح']`: 4,246
- `['True','False']`: 65
- `['False','True']`: 6
- `['نعم','لا']`: 2
- `['لا','نعم']`: 1
- one record contains two sentence choices rather than boolean labels

The first four forms can be normalized deterministically only if the correct answer index is transformed together with the options. The final four records are review-required.

### Misplaced type values

Nine records use `easy|medium|hard` as the question type even though the separate `difficulty` field is present. They are not auto-deduplicated or auto-retyped.

## Shared relationships

Deduplication removes duplicate content identity, not valid educational relationships.

If one exact media object legitimately appears in multiple lessons, the target should reuse one canonical `media_asset` while preserving all lesson relationships allowed by the current schema.

Likewise, if one exact Question Bank item is proven to apply to multiple lessons, its revision can preserve multiple `question_bank_revision_lessons` relationships rather than cloning the question.
