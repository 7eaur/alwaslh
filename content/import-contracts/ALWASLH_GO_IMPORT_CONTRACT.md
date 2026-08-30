# ALWASLH-GO IMPORT CONTRACT

## Purpose

`7eaur/alwaslh-go` is the canonical source repository for curriculum page images and government-exam page images. It is **source material**, not a frontend bundle and not a published lesson model.

Stage 9 imports source documents and ordered source assets without guessing lesson boundaries from filenames. Later Admin/Media stages may explicitly map source assets into lessons.

## Pinned source

The active source revision is declared in `alwaslh-go-source-map.json`. An import run must refuse a different Git revision unless the contract is intentionally updated and re-verified.

## Source taxonomy

Each configured top-level subject directory maps to:

- canonical `classSlug` / Arabic class name;
- canonical `subjectSlug` / Arabic subject name;
- expected image count.

The first directory below a configured subject root is a **source document**.

Document kinds:

- `textbook`: default for non-exam source units;
- `government_exam`: source-unit name contains a government-exam marker such as `نماذج وزاريه` / `نماذج وزارية`.

Government-exam metadata:

- Hijri year is parsed from the source-unit name (`1445`, `1446`, `1447`, ...);
- mathematics tracks are explicit when present: `calculus` for التفاضل والتكامل and `algebra_geometry` for الجبر والهندسة;
- no year or track is invented when it is absent from the source path.

Nested directories inside a source document are allowed. Discovery is recursive; fixed directory depth is forbidden.

## Supported image naming families

Known source filenames are parsed numerically, never lexicographically:

- `تمهيدي{N} - {title}.jpg|webp|png`
- `ص{N} - {title}.jpg|webp|png`
- `PDF{N} - {title}.jpg|webp|png`
- `front{N} - {title}.jpg|webp|png`
- `p{N} - {title}.jpg|webp|png`
- `صفحة_{N}.jpg|webp|png`

Separators/titles after the numeric prefix may be absent. Unknown image naming is an import-contract error, not silently assigned an arbitrary order.

## Canonical ordering

### When `manifest.json` exists

`manifest.json` is the strongest source ordering authority.

Each entry must provide a unique positive `seq` and a `relative_path` resolving to exactly one real image under the same source document. The importer verifies:

- sequence is contiguous;
- every referenced file exists;
- every source image appears exactly once in the manifest;
- `new_name`, when present, matches the referenced image basename.

Canonical `sourceOrder` is zero-based `seq - 1`. Manifest metadata (`source_page`, `book_page`, `section`, `title`, `original_name`, `new_name`) is preserved as provenance.

### When no manifest exists

Order is computed from parsed naming family + numeric number. Directory/Git enumeration order is never used. Duplicate numbers within one naming family or numeric gaps inside a family are integrity errors.

Family ordering is deterministic:

1. `preliminary` (`تمهيدي`)
2. `front`
3. `pdf`
4. `book_page` (`ص`)
5. `english_page` (`p`)
6. `exam_page` (`صفحة_`)

Most documents use only one or two families; family rank exists solely to make mixed sets deterministic.

## Checksums and provenance

Stage 9 inventories image bytes through Git object metadata without downloading the 1.49 GB source on every CI run:

- every asset stores its Git blob SHA-1 (`sourceGitBlobSha1`) and byte size;
- duplicate-content reporting uses the Git blob identity within the pinned repository;
- the normalized full inventory receives a SHA-256 digest (`manifestSha256`).

When image bytes are actually transferred/processed in Stage 10/25, SHA-256 of the byte stream is mandatory and is stored in `checksum_sha256`. Stage 9 does not fake a SHA-256 value without reading the bytes.

## Helper metadata

Recognized helper files:

- `manifest.json`
- `دليل_الصور_صفحة_بصفحة.txt`
- `دليل_الصور_صفحة_بصفحة.xlsx`
- `تقرير_المعالجة.json`

Helpers are inventory/provenance inputs. XLSX is not parsed in Stage 9 because JSON/TXT/path metadata is sufficient for deterministic ordering and avoids adding a spreadsheet dependency to the importer.

## Canonical inventory schema

Top level:

```text
schemaVersion
source.repository
source.revision
documents[]
issues
summary
manifestSha256
```

Each document stores source path, class/subject mapping, kind, optional exam year/track, deterministic position, helper paths, and ordered assets.

Each asset stores source path, filename, extension/MIME, byte size, Git blob SHA, naming family, parsed source number, zero-based source order, title hint and bounded source metadata.

## PostgreSQL source layer

Stage 9 introduces a source-ingestion layer separate from published lessons:

```text
content_import_runs
content_source_documents
  └── content_source_assets
```

Reasons:

- filenames are useful provenance but are not reliable lesson boundaries;
- books and government exams are source documents with ordered pages before editorial lesson mapping;
- reruns can reconcile source changes without rewriting published lesson identity;
- Stage 10 can process media while preserving original source identity.

An import transaction upserts seen documents/assets and marks missing rows `is_present = false`; it does not destructively delete history.

## Idempotency / repeatability

For the same repository + revision + `manifestSha256`:

- a second import is a replay, not a second import run;
- document/asset counts do not grow;
- source order and blob identities remain identical;
- full inventory generation is byte-for-byte deterministic.

A changed source revision or changed manifest digest creates a new import run and reconciles current source rows.

## Required integrity report

The inventory gate reports at minimum:

- configured/observed subject roots;
- source-document count;
- total image count;
- counts by extension;
- helper-file count;
- unparsed image names;
- manifest missing/extra/mismatch errors;
- duplicate/gapped sequence errors;
- duplicate Git-blob groups;
- per-subject expected vs observed counts;
- canonical SHA-256 manifest digest.

Unknown names, manifest mismatches, sequence errors, source-revision drift or expected-count drift fail Stage 9. Cross-document duplicate blobs are reported but do not automatically fail because repeated educational pages may be intentional.

## Current pinned expectations

From the source README and repository structure, verified against the Stage 9 executable gate:

- 15 subject roots;
- 48 source documents;
- 5,552 images;
- 4,218 JPG;
- 1,334 WEBP;
- 76 recognized helper files.

If executable inventory disagrees, the discrepancy must be investigated and documented; acceptance numbers are never changed merely to make CI green.

## Non-goals

Stage 9 does **not**:

- infer lessons from image titles;
- optimize or upload image bytes;
- generate thumbnails/AI variants;
- publish Student content;
- perform OCR;
- run Gemini.

Those belong to later roadmap stages.
