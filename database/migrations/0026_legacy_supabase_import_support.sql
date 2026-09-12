BEGIN;

-- content_source_assets was introduced for a Git-backed source and originally
-- required a Git blob SHA-1. Legacy Supabase Storage is a first-class source,
-- so Git identity is optional while the real byte SHA-256 remains available.
ALTER TABLE content_source_assets
  ALTER COLUMN source_git_blob_sha1 DROP NOT NULL;

ALTER TABLE content_source_assets
  DROP CONSTRAINT content_source_assets_git_sha1_format;

ALTER TABLE content_source_assets
  ADD CONSTRAINT content_source_assets_git_sha1_format CHECK (
    source_git_blob_sha1 IS NULL OR source_git_blob_sha1 ~ '^[0-9a-f]{40}$'
  );

COMMIT;
