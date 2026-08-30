BEGIN;

CREATE TYPE content_source_document_kind AS ENUM ('textbook', 'government_exam');

CREATE TABLE content_import_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_repository text NOT NULL,
  source_revision text NOT NULL,
  manifest_sha256 text NOT NULL,
  subject_root_count integer NOT NULL,
  document_count integer NOT NULL,
  asset_count integer NOT NULL,
  helper_file_count integer NOT NULL,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_import_runs_repository_nonblank CHECK (length(btrim(source_repository)) > 0),
  CONSTRAINT content_import_runs_revision_nonblank CHECK (length(btrim(source_revision)) > 0),
  CONSTRAINT content_import_runs_manifest_sha256_format CHECK (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT content_import_runs_counts_nonnegative CHECK (
    subject_root_count >= 0 AND document_count >= 0 AND asset_count >= 0 AND helper_file_count >= 0
  ),
  CONSTRAINT content_import_runs_report_object CHECK (jsonb_typeof(report) = 'object'),
  CONSTRAINT content_import_runs_identity_unique UNIQUE (source_repository, source_revision, manifest_sha256)
);

CREATE TABLE content_source_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_repository text NOT NULL,
  source_path text NOT NULL,
  class_slug text NOT NULL,
  class_name text NOT NULL,
  subject_slug text NOT NULL,
  subject_name text NOT NULL,
  kind content_source_document_kind NOT NULL,
  title text NOT NULL,
  hijri_year integer,
  exam_track text,
  position integer NOT NULL,
  is_present boolean NOT NULL DEFAULT true,
  first_seen_import_run_id uuid NOT NULL REFERENCES content_import_runs(id) ON DELETE RESTRICT,
  last_seen_import_run_id uuid NOT NULL REFERENCES content_import_runs(id) ON DELETE RESTRICT,
  source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_source_documents_identity_unique UNIQUE (source_repository, source_path),
  CONSTRAINT content_source_documents_repository_nonblank CHECK (length(btrim(source_repository)) > 0),
  CONSTRAINT content_source_documents_path_nonblank CHECK (length(btrim(source_path)) > 0),
  CONSTRAINT content_source_documents_class_slug_nonblank CHECK (length(btrim(class_slug)) > 0),
  CONSTRAINT content_source_documents_class_name_nonblank CHECK (length(btrim(class_name)) > 0),
  CONSTRAINT content_source_documents_subject_slug_nonblank CHECK (length(btrim(subject_slug)) > 0),
  CONSTRAINT content_source_documents_subject_name_nonblank CHECK (length(btrim(subject_name)) > 0),
  CONSTRAINT content_source_documents_title_nonblank CHECK (length(btrim(title)) > 0),
  CONSTRAINT content_source_documents_position_nonnegative CHECK (position >= 0),
  CONSTRAINT content_source_documents_hijri_year_valid CHECK (hijri_year IS NULL OR hijri_year BETWEEN 1300 AND 1700),
  CONSTRAINT content_source_documents_exam_track_nonblank CHECK (exam_track IS NULL OR length(btrim(exam_track)) > 0),
  CONSTRAINT content_source_documents_metadata_object CHECK (jsonb_typeof(source_metadata) = 'object')
);

CREATE TABLE content_source_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES content_source_documents(id) ON DELETE CASCADE,
  source_path text NOT NULL,
  filename text NOT NULL,
  position integer NOT NULL,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL,
  source_git_blob_sha1 text NOT NULL,
  checksum_sha256 text,
  naming_family text NOT NULL,
  source_number integer NOT NULL,
  title_hint text,
  is_present boolean NOT NULL DEFAULT true,
  first_seen_import_run_id uuid NOT NULL REFERENCES content_import_runs(id) ON DELETE RESTRICT,
  last_seen_import_run_id uuid NOT NULL REFERENCES content_import_runs(id) ON DELETE RESTRICT,
  source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_source_assets_path_unique UNIQUE (document_id, source_path),
  CONSTRAINT content_source_assets_path_nonblank CHECK (length(btrim(source_path)) > 0),
  CONSTRAINT content_source_assets_filename_nonblank CHECK (length(btrim(filename)) > 0),
  CONSTRAINT content_source_assets_position_nonnegative CHECK (position >= 0),
  CONSTRAINT content_source_assets_mime_nonblank CHECK (length(btrim(mime_type)) > 0),
  CONSTRAINT content_source_assets_byte_size_nonnegative CHECK (byte_size >= 0),
  CONSTRAINT content_source_assets_git_sha1_format CHECK (source_git_blob_sha1 ~ '^[0-9a-f]{40}$'),
  CONSTRAINT content_source_assets_sha256_format CHECK (checksum_sha256 IS NULL OR checksum_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT content_source_assets_family_nonblank CHECK (length(btrim(naming_family)) > 0),
  CONSTRAINT content_source_assets_number_nonnegative CHECK (source_number >= 0),
  CONSTRAINT content_source_assets_metadata_object CHECK (jsonb_typeof(source_metadata) = 'object')
);

CREATE UNIQUE INDEX ux_content_source_assets_present_position
  ON content_source_assets(document_id, position)
  WHERE is_present;

CREATE INDEX idx_content_source_documents_subject_present
  ON content_source_documents(class_slug, subject_slug, position)
  WHERE is_present;

CREATE INDEX idx_content_source_documents_kind_year
  ON content_source_documents(kind, hijri_year)
  WHERE is_present;

CREATE INDEX idx_content_source_assets_document_present_position
  ON content_source_assets(document_id, position)
  WHERE is_present;

CREATE INDEX idx_content_source_assets_git_blob_sha1
  ON content_source_assets(source_git_blob_sha1);

CREATE TRIGGER content_source_documents_set_updated_at BEFORE UPDATE ON content_source_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER content_source_assets_set_updated_at BEFORE UPDATE ON content_source_assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
