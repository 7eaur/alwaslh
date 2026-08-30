BEGIN;

CREATE TYPE media_asset_status AS ENUM ('processing', 'ready', 'failed');
CREATE TYPE media_variant_kind AS ENUM ('source', 'display', 'thumbnail', 'ai');

CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  content_source_asset_id uuid REFERENCES content_source_assets(id) ON DELETE SET NULL,
  source_position integer NOT NULL,
  source_filename text NOT NULL,
  source_mime_type text NOT NULL,
  source_page_number integer,
  source_checksum_sha256 text NOT NULL,
  source_byte_size bigint NOT NULL,
  status media_asset_status NOT NULL DEFAULT 'processing',
  attempt_count integer NOT NULL DEFAULT 0,
  last_error_code text,
  last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_idempotency_key_nonblank CHECK (length(btrim(idempotency_key)) > 0),
  CONSTRAINT media_assets_source_position_nonnegative CHECK (source_position >= 0),
  CONSTRAINT media_assets_source_filename_nonblank CHECK (length(btrim(source_filename)) > 0),
  CONSTRAINT media_assets_source_mime_nonblank CHECK (length(btrim(source_mime_type)) > 0),
  CONSTRAINT media_assets_source_page_positive CHECK (source_page_number IS NULL OR source_page_number > 0),
  CONSTRAINT media_assets_source_checksum_format CHECK (source_checksum_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT media_assets_source_byte_size_positive CHECK (source_byte_size > 0),
  CONSTRAINT media_assets_attempt_count_nonnegative CHECK (attempt_count >= 0),
  CONSTRAINT media_assets_error_code_nonblank CHECK (last_error_code IS NULL OR length(btrim(last_error_code)) > 0)
);

CREATE UNIQUE INDEX ux_media_assets_content_source_asset
  ON media_assets(content_source_asset_id)
  WHERE content_source_asset_id IS NOT NULL;

CREATE INDEX idx_media_assets_status_created
  ON media_assets(status, created_at);

CREATE INDEX idx_media_assets_source_position
  ON media_assets(source_position, id);

CREATE TABLE media_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  kind media_variant_kind NOT NULL,
  profile_version text NOT NULL,
  storage_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL,
  width integer,
  height integer,
  checksum_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_variants_identity_unique UNIQUE (media_asset_id, kind, profile_version),
  CONSTRAINT media_variants_profile_nonblank CHECK (length(btrim(profile_version)) > 0),
  CONSTRAINT media_variants_storage_key_nonblank CHECK (length(btrim(storage_key)) > 0),
  CONSTRAINT media_variants_mime_nonblank CHECK (length(btrim(mime_type)) > 0),
  CONSTRAINT media_variants_byte_size_nonnegative CHECK (byte_size >= 0),
  CONSTRAINT media_variants_width_positive CHECK (width IS NULL OR width > 0),
  CONSTRAINT media_variants_height_positive CHECK (height IS NULL OR height > 0),
  CONSTRAINT media_variants_checksum_format CHECK (checksum_sha256 ~ '^[0-9a-f]{64}$')
);

CREATE INDEX idx_media_variants_asset_kind
  ON media_variants(media_asset_id, kind);

CREATE TRIGGER media_assets_set_updated_at BEFORE UPDATE ON media_assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
