# Legacy Supabase Import — Dry Run Report

Date: 2026-09-12

Overall state: **BLOCKED_FOR_WRITE**

This is a real dry-run/audit result, not permission to mutate the runtime database.

## Source totals

| Metric | Result |
|---|---:|
| Legacy classes | 15 |
| Legacy subjects | 58 |
| Subjects with no page rows | 2 |
| Page-level lesson rows | 5,273 |
| Candidate logical lessons | 3,148 |
| Image references | 5,273 |
| Storage object matches | 5,273 |
| Storage object misses | 0 |
| Questions | 25,715 |
| Raw unique question fingerprints | 25,713 |
| Exact raw duplicate question extras | 2 |

## Lesson dry-run

- source page rows: **5,273**
- conservative logical lesson candidates: **3,148**
- duplicate page positions: **6**
- repeated-title scopes: **18**
- logical groups in repeated-title scopes: **66**
- blank titles: **0**
- null page numbers: **0**

Target classification is deliberately not fabricated:

- matched target lessons: **NOT YET VERIFIED**
- new lessons: **NOT YET VERIFIED**
- high-confidence target matches: **NOT YET VERIFIED**
- ambiguous target matches: **NOT YET VERIFIED**

Reason: the live Railway PostgreSQL row inventory cannot currently be queried by the connected read-only Railway tools. Existing target content must be inventoried before any insert/update decision.

## Image dry-run

- image records/references: **5,273**
- distinct URLs: **5,273**
- URL-level duplicates: **0**
- resolved Storage objects: **5,273**
- missing Storage objects: **0**
- referenced byte size from Storage metadata: **1,041,164,935** bytes
- source bucket objects: **9,075**
- source bucket total bytes: **1,495,150,104** bytes

Required but not yet executable with the connected tool surface:

- actual byte download;
- observed MIME verification from bytes;
- dimensions from decoded bytes;
- SHA-256 of every referenced object;
- exact checksum duplicate groups;
- perceptual hashes/near-duplicate review;
- target media checksum reuse comparison.

Therefore no image is currently authorized for target materialization.

## Question dry-run

### Totals

- total: **25,715**
- raw unique fingerprints: **25,713**
- duplicate fingerprint groups: **2**
- duplicate extra rows: **2**

### Source type/shape

- `mcq`: 15,230
  - four-option: 15,224
  - two-option: 6
- `true_false`: 10,466
- `direct`: 10
- misplaced type=`medium`: 4
- misplaced type=`easy`: 3
- misplaced type=`hard`: 2

### Answer validity

All `mcq` and `true_false` records have integer correct indexes within their stored option range.

The target answer text can be derived only when the normalized target option set and normalized index remain trustworthy.

The ten `direct` records do not contain a trusted `answer_text`; they must import only as `unknown`/`review_required` if/when their lesson mapping is accepted.

### True/false normalization

Deterministic structural forms:

- 6,145 canonical Arabic order
- 4,246 reversed Arabic order (index must be remapped)
- 65 English `True/False`
- 6 reversed English `False/True`

Review-required forms: **4**

- 2 `نعم/لا`
- 1 `لا/نعم`
- 1 two-sentence choice pair

### Additional question review set

- 9 records with difficulty text in the legacy `type` field
- 1 genuine two-choice yes/no MCQ that cannot satisfy target four-option MCQ shape
- 3 records missing explanation (allowed by target schema, but retained as an audit fact)

## Current-target safety gates

### Gate A — live target inventory: BLOCKED

Current target PostgreSQL is the Railway PostgreSQL service in project `charming-peace`, environment `production`.

Connected Railway inspection can identify the service/configuration but cannot execute the required read-only SQL inventory. Therefore existing target classes/subjects/lessons/media/questions cannot yet be compared row-by-row.

### Gate B — media bytes/checksums: BLOCKED

Supabase connector exposes Storage metadata but no raw object download operation. Exact image SHA-256 is mandatory and cannot be substituted with URL, filename, UUID, size, or metadata.

### Gate C — backup/rollback: BLOCKED

Read-only Railway inspection found no configured WAL archive/PITR bucket (`WAL_ARCHIVE_BUCKET` not configured). A verified backup/rollback mechanism is required before runtime data mutation.

### Gate D — non-Git provenance schema: BLOCKED FOR IMPLEMENTATION

`content_source_assets.source_git_blob_sha1` is required by the current schema even though Supabase Storage is not Git. A fake Git SHA is prohibited. The minimal truthful schema adjustment must be reviewed as its own batch after the dry-run design is complete.

### Gate E — legacy AI Question Bank application path: OPEN

The target DB can represent draft `origin='ai'` questions, but the current application AI-import service requires a current approved `ai_output` lineage. Legacy questions do not have that lineage. The importer needs an explicit legacy import path that keeps them draft/reviewable without fabricating AI review history.

## Write decision

**DO NOT WRITE TO TARGET.**

The Product Owner authorized execution after a safe dry run, but the dry run currently contains material blockers and unresolved target mappings. Proceeding to production writes would violate the requested import contract.

## Next bounded execution step once gates are resolved

Select one canonical class + subject and a small contiguous set of unambiguous logical lessons, then run:

`target inventory → source byte hashing → exact/near dedupe classification → target mapping → dry-run replay → backup verification → transactionally import draft content → verify Admin/Reader while Student publication remains off`
