# Legacy Supabase Import — Verification Evidence

Date: 2026-09-12

Branch: `content/legacy-supabase-import`

Target baseline: `c3ddef04933772116c3bd9cdf29eb5a973c527fd`

## Verification performed

### Repository/target architecture

Inspected current target migrations and executable services rather than relying on table names alone:

- `database/migrations/0001_core.sql`
- `database/migrations/0008_content_source_import.sql`
- `database/migrations/0009_media_pipeline.sql`
- `database/migrations/0016_curriculum_structure.sql`
- `database/migrations/0017_content_ingestion_publication.sql`
- `database/migrations/0019_question_bank.sql`
- later migration inventory through `0025_lesson_summary_content_revision.sql`
- `apps/api/src/content/source-import.ts`
- `apps/api/src/content/ingestion-service.ts`
- `apps/api/src/content/legacy-subject-bootstrap.ts`
- `apps/api/src/media/service.ts`
- `apps/api/src/question-bank/service.ts`

Verified current safety boundaries:

- lesson media pipeline is checksum/idempotency aware;
- lesson asset publication is a separate draft/review/published lifecycle;
- Question Bank revisions have explicit type/answer/status constraints;
- current AI Question Bank import requires approved current-runtime AI output lineage;
- current bounded legacy source bootstrap keeps lesson assets draft and refuses already-published lessons;
- current content source provenance assumes Git assets via required Git blob SHA-1.

### Legacy Supabase discovery

The connected account exposes one project, ref `zhbgbmqhonqmzpqfiehs`. Schema/content inspection verifies it is the old Alwaslh educational source.

Only SELECT/introspection queries were executed. No mutation was performed.

Verified source facts:

- 15 classes
- 58 subjects
- 0 subject-extra-class links
- 5,273 page-level lesson records
- 25,715 embedded questions
- 0 quiz rows
- 0 saved-question rows
- 5,273/5,273 lesson image references resolve to Storage objects
- 9,075 total objects in `lesson_content`

### Lesson semantics

Ordered page sampling verified that multiple consecutive legacy rows with the same title represent pages of one logical lesson. The old table name `lessons` is therefore not a valid target cardinality assumption.

A conservative grouping query found 3,148 candidate logical lesson groups and surfaced duplicate page positions and noncontiguous repeated-title scopes instead of silently merging them.

### Question validation

SQL validation checked:

- source type distribution;
- option array shape/count;
- correct-index integer/range validity;
- direct-answer absence;
- difficulty distribution;
- explanation presence;
- boolean option ordering/locale variants;
- conservative duplicate fingerprints within logical-lesson scope.

### Storage verification

Storage metadata and paths were verified through Supabase system tables. Raw object bytes were **not** available through the connected Supabase tool surface, so byte-derived SHA-256/dimensions/perceptual hashes were not claimed.

### Current Railway target

Read-only inspection identifies the current target PostgreSQL service in Railway project `charming-peace`, environment `production`.

The connected Railway tool surface cannot execute arbitrary read-only SQL against that PostgreSQL service, so current target row inventory has not been fabricated.

Read-only infrastructure inspection also found no configured WAL archive bucket/PITR backup path.

## Verification not yet possible

The following remain `NOT YET VERIFIED` and block target data writes:

1. SHA-256 of every referenced legacy image from actual bytes.
2. perceptual-hash/near-duplicate analysis.
3. exact checksum overlap against existing target media.
4. current target row-by-row curriculum/content/Question Bank inventory.
5. final source-to-target class/subject/lesson match classifications.
6. verified backup/restore point before production mutation.
7. full browser/Admin/Reader verification for imported content, because no import has occurred.

## Mutations performed during this audit

- Git: created an isolated branch and documentation commits only.
- Legacy Supabase database/storage: **none**.
- Railway PostgreSQL: **none**.
- Railway variables/config/deployments: **none**.
- Student publication: **none**.
- Current content: **none**.

## Current decision

The dry run is valid as an audit but is **not clear for production execution**. The blockers are material and directly relate to the Product Owner's required deduplication, target-safety, and rollback guarantees.
