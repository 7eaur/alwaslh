# Legacy Supabase Import Report

Status: **NOT EXECUTED — BLOCKED AFTER DRY RUN**

Date: 2026-09-12

No current-runtime content import has been executed yet.

## Why execution has not started

The required dry run found three hard safety gates and two implementation gaps:

1. legacy Storage raw bytes are not exposed by the connected Supabase tool surface, so required SHA-256 exact-image deduplication is not yet possible;
2. the connected Railway surface cannot query the current PostgreSQL rows, so existing target content cannot yet be classified as existing/new/duplicate/conflict/unresolved;
3. a verified production backup/restore mechanism has not been established;
4. current source-provenance schema requires a Git blob SHA-1 even though the source is Supabase Storage;
5. current AI Question Bank import path requires modern approved AI-output lineage which legacy `ai_questions` do not possess.

Proceeding despite these findings would violate the import contract.

## Runtime changes

- classes inserted: 0
- subjects inserted: 0
- subject/class links inserted: 0
- sections inserted: 0
- lessons inserted: 0
- lessons updated: 0
- source documents inserted/updated: 0
- source assets inserted/updated: 0
- media assets inserted/reused: 0
- media variants generated: 0
- lesson assets inserted/updated: 0
- questions inserted: 0
- Question Bank revisions inserted: 0
- Question Bank lesson links inserted: 0
- publication changes: 0

## Next import report update

This file must be updated after the first bounded production-safe batch with exact IDs/counts, replay/idempotency result, checksum reuse, rejected mappings, verification queries, Admin/Reader evidence, publication state, and rollback evidence.
