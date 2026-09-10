# Full Content Corpus Extraction Workflow

This branch prepares the educational corpus outside the product runtime. It never writes to PostgreSQL and never publishes student/admin content directly.

Source of images is pinned to:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

## Stage 1 — Source Inventory

Goal: enumerate every tracked educational image before OCR.

Outputs:

- `data/content-corpus/inventory.json` — summary grouped by subject and source kind.
- `data/content-corpus/inventory.jsonl` — one deterministic source record per image.
- `data/content-corpus/INVENTORY.md` — human-readable summary.

No OCR occurs in this stage.

## Stage 2 — Textbook OCR

Process textbook pages subject-by-subject in bounded batches. Store one page record per source image. Do not start exam parsing until textbook extraction is complete enough to form a reliable source corpus.

Planned canonical page record:

```json
{
  "schema_version": 1,
  "page_id": "stable-semantic-id",
  "source_path": "...",
  "source_git_blob_sha1": "...",
  "class_slug": "grade-12",
  "subject_slug": "...",
  "document_kind": "textbook",
  "page_number": 78,
  "title_hint": "...",
  "raw_text": "...",
  "normalized_text": "...",
  "provider": "...",
  "provider_version": "...",
  "profile": "...",
  "mean_confidence": 0.0,
  "low_confidence_fraction": 0.0,
  "needs_review": true,
  "review_reason": "...",
  "extraction_version": 1
}
```

Rules:

- source images are immutable;
- page extraction is idempotent by source blob SHA + extraction profile;
- raw OCR and normalized text are both retained;
- confidence is a model signal, not measured accuracy;
- weak/complex pages are flagged rather than silently accepted;
- generated corpus data is committed in small reviewable batches.

## Stage 3 — Text Verification / Normalization

Review extraction quality by representative samples and machine checks. Correct only transcription/normalization issues; do not summarize or rewrite source meaning.

Outputs remain source-grounded page records.

## Stage 4 — Exam Question Extraction

After the textbook corpus is available, parse government-exam images into individual question records containing question text, choices, year/model metadata, and source image provenance.

No automatic textbook-page link is accepted yet.

## Stage 5 — Answer and Validate Questions

Solve/verify each question against the extracted textbook corpus where possible. Keep answer provenance and a review state. Ambiguous questions stay unresolved/review instead of receiving a guessed answer.

## Stage 6 — Link Questions to Source Pages

For each question, shortlist candidate textbook pages locally, then verify the best source page(s). Persist explicit links with confidence and review status.

A question may link to more than one page, but one link can be marked primary.

## Final Import

Only after the corpus is complete and reviewed do we build a separate importer for the main Alwaslh database. This branch does not write production database IDs.
