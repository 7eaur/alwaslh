BEGIN;

CREATE TYPE content_ingestion_task_status AS ENUM ('uploading', 'ready', 'processing', 'completed', 'failed');
CREATE TYPE content_ingestion_item_status AS ENUM ('pending_upload', 'uploaded', 'processing', 'completed', 'failed');
CREATE TYPE lesson_asset_publication_status AS ENUM ('draft', 'review', 'published');

CREATE TABLE content_ingestion_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  created_by_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  client_request_id uuid NOT NULL,
  status content_ingestion_task_status NOT NULL DEFAULT 'uploading',
  item_count integer NOT NULL,
  uploaded_count integer NOT NULL DEFAULT 0,
  processed_item_count integer NOT NULL DEFAULT 0,
  media_asset_count integer NOT NULL DEFAULT 0,
  failed_item_count integer NOT NULL DEFAULT 0,
  processing_token uuid,
  lease_expires_at timestamptz,
  last_error_code text,
  last_error_message text,
  linked_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_ingestion_tasks_request_unique UNIQUE (created_by_profile_id, client_request_id),
  CONSTRAINT content_ingestion_tasks_item_count_positive CHECK (item_count > 0),
  CONSTRAINT content_ingestion_tasks_counts_valid CHECK (
    uploaded_count BETWEEN 0 AND item_count
    AND processed_item_count BETWEEN 0 AND item_count
    AND failed_item_count BETWEEN 0 AND item_count
    AND media_asset_count >= 0
  ),
  CONSTRAINT content_ingestion_tasks_error_code_nonblank CHECK (
    last_error_code IS NULL OR length(btrim(last_error_code)) > 0
  ),
  CONSTRAINT content_ingestion_tasks_processing_lease CHECK (
    (status = 'processing' AND processing_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR
    (status <> 'processing' AND processing_token IS NULL AND lease_expires_at IS NULL)
  )
);

CREATE TABLE content_ingestion_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES content_ingestion_tasks(id) ON DELETE CASCADE,
  position integer NOT NULL,
  filename text NOT NULL,
  mime_type text NOT NULL,
  declared_byte_size bigint NOT NULL,
  byte_size bigint,
  source_checksum_sha256 text,
  source_storage_key text UNIQUE,
  status content_ingestion_item_status NOT NULL DEFAULT 'pending_upload',
  output_count integer NOT NULL DEFAULT 0,
  last_error_code text,
  last_error_message text,
  uploaded_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_ingestion_items_task_id_id_unique UNIQUE (task_id, id),
  CONSTRAINT content_ingestion_items_task_position_unique UNIQUE (task_id, position),
  CONSTRAINT content_ingestion_items_position_nonnegative CHECK (position >= 0),
  CONSTRAINT content_ingestion_items_filename_nonblank CHECK (length(btrim(filename)) > 0),
  CONSTRAINT content_ingestion_items_mime_supported CHECK (
    mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  ),
  CONSTRAINT content_ingestion_items_declared_size_valid CHECK (
    declared_byte_size > 0 AND declared_byte_size <= 104857600
  ),
  CONSTRAINT content_ingestion_items_byte_size_valid CHECK (
    byte_size IS NULL OR (byte_size > 0 AND byte_size <= 104857600)
  ),
  CONSTRAINT content_ingestion_items_checksum_format CHECK (
    source_checksum_sha256 IS NULL OR source_checksum_sha256 ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT content_ingestion_items_source_consistency CHECK (
    (status = 'pending_upload' AND byte_size IS NULL AND source_checksum_sha256 IS NULL AND source_storage_key IS NULL AND uploaded_at IS NULL)
    OR
    (status <> 'pending_upload' AND byte_size IS NOT NULL AND source_checksum_sha256 IS NOT NULL AND source_storage_key IS NOT NULL AND uploaded_at IS NOT NULL)
  ),
  CONSTRAINT content_ingestion_items_output_count_nonnegative CHECK (output_count >= 0),
  CONSTRAINT content_ingestion_items_error_code_nonblank CHECK (
    last_error_code IS NULL OR length(btrim(last_error_code)) > 0
  )
);

CREATE TABLE content_ingestion_media (
  task_id uuid NOT NULL REFERENCES content_ingestion_tasks(id) ON DELETE CASCADE,
  item_id uuid NOT NULL,
  media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  source_position integer NOT NULL,
  source_page_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, media_asset_id),
  CONSTRAINT content_ingestion_media_item_fk
    FOREIGN KEY (task_id, item_id)
    REFERENCES content_ingestion_items(task_id, id) ON DELETE CASCADE,
  CONSTRAINT content_ingestion_media_task_position_unique UNIQUE (task_id, source_position),
  CONSTRAINT content_ingestion_media_media_unique UNIQUE (media_asset_id),
  CONSTRAINT content_ingestion_media_position_nonnegative CHECK (source_position >= 0),
  CONSTRAINT content_ingestion_media_page_positive CHECK (
    source_page_number IS NULL OR source_page_number > 0
  )
);

ALTER TABLE lesson_assets
  ADD COLUMN media_asset_id uuid REFERENCES media_assets(id) ON DELETE RESTRICT,
  ADD COLUMN ingestion_task_id uuid REFERENCES content_ingestion_tasks(id) ON DELETE RESTRICT,
  ADD COLUMN ingestion_item_id uuid,
  ADD COLUMN publication_status lesson_asset_publication_status NOT NULL DEFAULT 'draft',
  ADD COLUMN submitted_for_review_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN submitted_for_review_at timestamptz,
  ADD COLUMN published_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN asset_published_at timestamptz,
  ADD CONSTRAINT lesson_assets_ingestion_item_fk
    FOREIGN KEY (ingestion_task_id, ingestion_item_id)
    REFERENCES content_ingestion_items(task_id, id) ON DELETE RESTRICT,
  ADD CONSTRAINT lesson_assets_ingestion_pair CHECK (
    (ingestion_task_id IS NULL AND ingestion_item_id IS NULL)
    OR
    (ingestion_task_id IS NOT NULL AND ingestion_item_id IS NOT NULL)
  ),
  ADD CONSTRAINT lesson_assets_review_state CHECK (
    publication_status <> 'review'
    OR (submitted_for_review_by_profile_id IS NOT NULL AND submitted_for_review_at IS NOT NULL)
  ),
  ADD CONSTRAINT lesson_assets_published_state CHECK (
    publication_status <> 'published'
    OR (
      submitted_for_review_at IS NOT NULL
      AND published_by_profile_id IS NOT NULL
      AND asset_published_at IS NOT NULL
    )
  );

CREATE UNIQUE INDEX ux_lesson_assets_lesson_media
  ON lesson_assets(lesson_id, media_asset_id)
  WHERE media_asset_id IS NOT NULL;

CREATE INDEX idx_content_ingestion_tasks_status_created
  ON content_ingestion_tasks(status, created_at DESC);

CREATE INDEX idx_content_ingestion_tasks_lesson_created
  ON content_ingestion_tasks(lesson_id, created_at DESC);

CREATE INDEX idx_content_ingestion_items_task_status_position
  ON content_ingestion_items(task_id, status, position);

CREATE INDEX idx_content_ingestion_media_task_position
  ON content_ingestion_media(task_id, source_position);

CREATE INDEX idx_lesson_assets_publication
  ON lesson_assets(lesson_id, publication_status, position);

CREATE TRIGGER content_ingestion_tasks_set_updated_at BEFORE UPDATE ON content_ingestion_tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER content_ingestion_items_set_updated_at BEFORE UPDATE ON content_ingestion_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
